const assert = require('node:assert/strict');
(async () => {
const {createServer} = await import('vite');
const server = await createServer({server:{middlewareMode:true}, appType:'custom'});
try {
const data = new Map();
global.localStorage = {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
const {buildOrderConfig} = await server.ssrLoadModule('/src/components/arcade/Arcade.tsx');
const {arcade} = await server.ssrLoadModule('/src/lib/arcadeStore.ts');
for (const [scope,n,first,last] of [['all',66,'Genesis','Revelation'],['ot',39,'Genesis','Malachi'],['nt',27,'Matthew','Revelation'],['gospels',4,'Matthew','John']]) {
  for (const timed of [true,false]) {
    const c=buildOrderConfig(scope,timed);
    assert.equal(c.seq.length,n);assert.equal(c.seq[0],first);assert.equal(c.seq.at(-1),last);
    assert.ok(c.boardKey.includes(timed?'|timed|':'|untimed|'));
    assert.equal(new Set(c.seq).size,n);
  }
}
const timed=buildOrderConfig('gospels',true),untimed=buildOrderConfig('gospels',false);
const run={runId:'first',game:'order',boardKey:timed.boardKey,label:'Gospels',scopeTag:'gospels',timed:true,elapsedSec:20,score:40,total:4,firstTry:4,clean:true};
const first=arcade.recordPersonal('qa',run);arcade.recordPersonal('qa',run);
assert.equal(arcade.getPersonal('qa',timed.boardKey).plays,1,'rerender must not count another round');
assert.equal(first.qualifiesClean,true);
arcade.addToBoard(timed.boardKey,'QA',run);
assert.equal(arcade.getBoard(untimed.boardKey).scores.length,0,'modes must not mix');
const mistaken={...run,runId:'second',clean:false,firstTry:3,score:36};
arcade.addToBoard(timed.boardKey,'QB',mistaken);
assert.equal(arcade.getBoard(timed.boardKey).clean.length,1,'mistakes cannot enter speed board');
const practice={...run,runId:'practice',boardKey:'trivia|practice',scopeTag:'practice',game:'trivia'};
const out=arcade.recordPersonal('qa',practice,false);assert.equal(out.qualifiesScore,false);assert.equal(out.qualifiesClean,false);assert.equal(arcade.getPersonal('qa',practice.boardKey),null);
const {TRIVIA}=await server.ssrLoadModule('/src/content/arcadeTrivia.ts');
const {triviaFeedback}=await server.ssrLoadModule('/src/content/arcadeFeedback.ts');
let passages=0;for(const q of Object.values(TRIVIA).flat()){const f=triviaFeedback(q);assert.ok(f.note);assert.ok(f.url.startsWith('https://'));if(f.passage){passages++;assert.ok(!f.passage.includes('<f'));}}
assert.ok(passages>270);console.log('Passed: full 66/39/27 book sequences, mode isolation, idempotent records, clean-run eligibility, unranked practice, Scripture coverage ('+passages+'/300).');

} finally {await server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
