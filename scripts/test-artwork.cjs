const assert = require('node:assert/strict');
(async () => {
  const { createServer } = await import('vite');
  const images = [];
  global.Image = class {
    constructor() { images.push(this); this.decoding = new Promise((resolve, reject) => { this.finishDecode = resolve; this.failDecode = reject; }); }
    decode() { return this.decoding; }
  };
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { prepareArtwork } = await server.ssrLoadModule('/src/lib/artwork.ts');
    let ready = false;
    const first = prepareArtwork('/test-a.webp');
    first.then(() => { ready = true; });
    assert.equal(prepareArtwork('/test-a.webp'), first, 'concurrent requests share loading');
    images[0].onload();
    await Promise.resolve();
    assert.equal(ready, false, 'download alone must not reveal artwork');
    images[0].finishDecode();
    await first;
    assert.equal(ready, true);
    await prepareArtwork('/test-a.webp');
    assert.equal(images.length, 1, 'decoded artwork stays ready for later page turns');
    const failed = prepareArtwork('/test-b.webp');
    images[1].onerror();
    await assert.rejects(failed);
    const retry = prepareArtwork('/test-b.webp');
    assert.equal(images.length, 3, 'failure can be retried');
    images[2].onload(); images[2].finishDecode(); await retry;
    console.log('Passed: artwork waits for decoding, shares requests, caches readiness, and retries failures.');
  } finally { await server.close(); delete global.Image; }
})();
