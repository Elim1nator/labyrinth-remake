import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const url=`file://${ROOT}/builds/m1/index.html`; // quick M1 smoke test (M1 always exposes the test hook)
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1280,height:720}});
const errs=[];p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+': '+m.text())});p.on('pageerror',e=>errs.push('pageerror: '+e.message));
await p.goto(url);await p.waitForTimeout(500);
await p.screenshot({path:'/tmp/t_title.png'});
await p.evaluate(()=>{__game.manual=true;__game.startLevel(0);__game.advance(0.2);});
await p.screenshot({path:'/tmp/t_play.png'});
await p.evaluate(()=>{__game.teleport(8.5,5.3,Math.PI/2);__game.advance(0.1);});
await p.screenshot({path:'/tmp/t_fence.png'});
console.log(JSON.stringify(await p.evaluate(()=>__game.state().stats)));
console.log(errs.join('\n')||'no errors');await b.close();
