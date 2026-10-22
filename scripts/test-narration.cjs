const assert = require('node:assert/strict');
(async () => {
  const { createServer } = await import('vite');
  const audios = [], utterances = [];
  global.Audio = class {
    constructor(src) { this.src = src; audios.push(this); this.paused = true; }
    load() {}
    pause() { this.paused = true; }
    play() { this.paused = false; return this.fail ? Promise.reject(new Error('load failed')) : Promise.resolve(); }
  };
  global.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  global.window = { speechSynthesis: { cancel() {}, pause() {}, resume() {}, speak(u) { utterances.push(u); } } };
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  const tick = () => new Promise(r => setImmediate(r));
  try {
    const s = await server.ssrLoadModule('/src/lib/speak.ts');
    const clips = require('../src/content/narration.json');
    const a = clips[0].text, b = clips[1].text;
    s.prepareNarration(a); s.prepareNarration(a);
    assert.equal(audios.length, 1, 'preload reuses one asset');
    s.speak(a); await tick();
    assert.equal(s.getPlayback().status, 'playing');
    assert.equal(utterances.length, 0, 'recorded narration replaces browser voice');
    s.toggleSpeaking(a); assert.equal(s.getPlayback().status, 'paused');
    s.toggleSpeaking(a); await tick(); assert.equal(s.getPlayback().status, 'playing');
    s.speak(b); await tick();
    assert.equal(audios[0].paused, true, 'new page stops old audio');
    s.stopSpeaking(); assert.equal(audios[1].paused, true);
    assert.equal(s.getPlayback().status, 'idle');
    s.speak('Dynamic child response');
    assert.equal(utterances.at(-1).text, 'Dynamic child response');
    s.prepareNarration(a); audios[0].fail = true;
    s.speak(a); await tick();
    assert.equal(utterances.at(-1).text, a, 'failed recording uses browser fallback');
    const count = utterances.length;
    s.speak(a); s.stopSpeaking(); await tick();
    assert.equal(utterances.length, count, 'late failures cannot restart speech after leaving');
    console.log('Passed: preload cache, recorded playback, pause/resume, page changes, stop, dynamic fallback, error fallback, and cancellation.');
  } finally { await server.close(); delete global.Audio; delete global.window; delete global.SpeechSynthesisUtterance; }
})();
