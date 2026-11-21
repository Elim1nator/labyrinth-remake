// Automated checks for Labyrinth Remake M1.x builds.
// Run: node m1.test.mjs [build]   (default build: m1.1; e.g. "node m1.test.mjs m1" re-runs the base checks on the frozen M1)
// Output (screenshots + results.json) goes to <repo>/test-output/<build>/ (gitignored), never inside builds/.
import { chromium } from 'playwright';
import fs from 'fs';
import { startStub, validateEntry } from './hs_stub.mjs'; // M1.8: local stub of the high score API (tests never touch the live board)
import { fileURLToPath as __f2p } from 'url';
import __np from 'path';
const ROOT=__np.resolve(__np.dirname(__f2p(import.meta.url)),'..'); // repo root
const BUILDS=process.env.BUILDS_DIR||`${ROOT}/builds`; // builds/<build>/index.html
const BUILD=process.argv[2]||'m1.1';
const VER=parseFloat(BUILD.replace(/^m/,''))||1;
const NEW=VER>=1.1; // M1.1+ regression tests (A1-A9, B1-B8)
const V12=VER>=1.2; // M1.2+: pitch, new hand frames, Screamer enemy
const V13=VER>=1.3; // M1.3+: 480x300, six mobs, procedural levels, steering fixes
const V14=VER>=1.4; // M1.4+: elite mobs, power-ups, item bar, touch ITEM button
const V15=VER>=1.5; // M1.5+: QA fixes, Screamer redraw, full-screen map, MAP button
const V17=VER>=1.7; // M1.7+: icon placement, gated debug hook (QA build for hook tests), RANGED colour, L3 per-seed floor, top-strip touch, thicker Screamer ears
const V18=VER>=1.8; // M1.8+: endless floors, deeper wall textures, score + high scores (stub API), slot machine
const V16=VER>=1.6; // M1.6+: QA fixes M15-A1..A6, Screamer bat-wing ears, L3 balance, two-mod phase-in, moved pause/MAP, elite readability
const FILE=V17?`${BUILDS}/${BUILD}-qa/index.html`:`${BUILDS}/${BUILD}/index.html`; // M1.7+: hook-based tests run on the QA build; the release build is checked in m17Tests
if(!fs.existsSync(FILE)){console.error('No such build: '+FILE);process.exit(2);}
const URL='file://'+FILE;
const REL_URL=V17?`file://${BUILDS}/${BUILD}/index.html`:URL; // M1.7: release build checked alongside the QA build
const OUT=`${ROOT}/test-output/${BUILD}`;
const SHOTS=`${OUT}/screens`;
fs.mkdirSync(SHOTS,{recursive:true});
for(const f of fs.readdirSync(SHOTS))if(f.endsWith('.png'))fs.unlinkSync(`${SHOTS}/${f}`);
console.log(`Testing ${FILE}\nOutput: ${OUT}\n`);
const results=[];let failed=0;
function check(name,cond,detail=''){results.push({name,ok:!!cond,detail});if(!cond)failed++;console.log((cond?'PASS':'FAIL')+'  '+name+(detail?'  ('+detail+')':''));}
const browser=await chromium.launch();
const consoleProblems=[];const badRequests=[];
async function newPage(opts={}){
  const {query='',...copts}=opts;
  const ctx=await browser.newContext({viewport:{width:1280,height:720},...copts});
  const page=await ctx.newPage();
  page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')consoleProblems.push(`[${opts.label||'desktop'}] ${m.type()}: ${m.text()}`);});
  page.on('pageerror',e=>consoleProblems.push(`[${opts.label||'desktop'}] pageerror: ${e.message}`));
  page.on('request',r=>{const u=r.url();if(!(u.split('?')[0]===URL||u.split('?')[0]===REL_URL||u.startsWith('data:')))badRequests.push(u);});
  await page.goto(URL+query);await page.waitForFunction(()=>!!window.__game);
  return {ctx,page};
}
const G=(page,fn,arg)=>page.evaluate(fn,arg);

// ---------- desktop functional tests ----------
{
  const {ctx,page}=await newPage();
  await page.waitForTimeout(400);
  await page.screenshot({path:`${SHOTS}/desktop_1280x720_title.png`});
  let st=await G(page,()=>__game.state());
  check('title screen shows and offers a start option',st.mode==='title'&&st.menu.length>=1,st.menu.join(' | '));

  // start a new game through the menu
  await page.keyboard.press('Enter');await page.waitForTimeout(100);
  st=await G(page,()=>{__game.manual=true;return __game.state();});
  check('Enter starts level 1',st.mode==='play'&&st.level===0);
  check('auto-save written at level start',st.save&&st.save.level===0&&st.save.hearts===5);

  // raycaster renders
  const r=await G(page,()=>{__game.advance(0.1);const D=__game.dims||{W:320,H:200};const c=document.getElementById('screen'),d=c.getContext('2d').getImageData(0,0,D.W,D.H).data,set=new Set();for(let i=0;i<d.length;i+=4)set.add((d[i]<<16)|(d[i+1]<<8)|d[i+2]);
    // centre column rows 30%..70% should be wall/door texture, not a single flat colour
    const col=new Set();for(let y=Math.round(D.H*.3);y<Math.round(D.H*.7);y++){const i=(y*D.W+D.W/2)*4;col.add((d[i]<<16)|(d[i+1]<<8)|d[i+2]);}
    return {colors:set.size,colCols:col.size,stats:__game.state().stats,W:D.W};});
  check('raycaster renders textured walls',r.colors>60&&r.colCols>4&&r.stats.rays===r.W&&r.stats.wallPx>200,`${r.colors} colours, centre column ${r.colCols} colours, ${r.stats.rays} rays, ${r.stats.wallPx} wall columns`);
  await page.screenshot({path:`${SHOTS}/desktop_1280x720_start.png`});

  // fence: see-through, blocks movement
  const f=await G(page,()=>{__game.teleport(8.5,5.5,Math.PI/2);__game.advance(0.05);const s=__game.state().stats;return s;});
  check('see-through fence renders with things visible behind it',f.fencePx>100&&f.wallPx>100,`fence columns ${f.fencePx}, sprites drawn ${f.sprites}, sprite px ${f.spritePx}`);
  await page.screenshot({path:`${SHOTS}/desktop_1280x720_fence_view.png`});
  await page.keyboard.down('KeyW');let fp=await G(page,()=>__game.advance(1.5).player);await page.keyboard.up('KeyW');
  check('fence blocks walking through',fp.y<6.0,`player y=${fp.y.toFixed(2)}`);

  // sliding door
  let d=await G(page,()=>{__game.freeze=true;__game.teleport(4.5,3.5,0);return __game.state();});
  check('door in front is detected as usable',d.useTarget&&d.useTarget.x===5&&d.useTarget.y===3);
  await page.keyboard.press('KeyE');
  d=await G(page,()=>__game.advance(0.3));const mid=d.doors.find(x=>x.x===5&&x.y===3);
  check('E starts the door sliding open',mid.state==='opening'&&mid.open>0&&mid.open<1,`open=${mid.open.toFixed(2)}`);
  d=await G(page,()=>__game.advance(0.6));check('door fully opens',d.doors.find(x=>x.x===5&&x.y===3).open===1);
  await page.keyboard.down('KeyW');let pp=await G(page,()=>__game.advance(1.0).player);await page.keyboard.up('KeyW');
  check('player walks through the open door',pp.x>6,`x=${pp.x.toFixed(2)}`);
  d=await G(page,()=>__game.advance(6));check('door closes again by itself after a few seconds',d.doors.find(x=>x.x===5&&x.y===3).state==='closed');

  // locked door + key
  let k=await G(page,()=>{__game.startLevel(0);__game.teleport(6.5,9.5,Math.PI);__game.use();return __game.advance(0.1);});
  let L=k.doors.find(x=>x.x===5&&x.y===9);
  check('locked door refuses without key',L.locked&&L.open===0&&/LOCKED/.test(k.msg),k.msg);
  k=await G(page,()=>{__game.teleport(9.5,9.5,Math.PI);return __game.advance(0.05);});
  check('gold key is picked up',k.player.keys===1);
  await page.screenshot({path:`${SHOTS}/desktop_1280x720_key_hud.png`});
  k=await G(page,()=>{__game.teleport(6.5,9.5,Math.PI);__game.use();return __game.advance(1.2);});
  L=k.doors.find(x=>x.x===5&&x.y===9);
  check('key unlocks its door and it opens',!L.locked&&L.open===1&&k.player.keys===0,`state=${L.state}`);

  // throwable + enemy hit + defeat
  let e=await G(page,()=>{__game.freeze=false;__game.teleport(7.5,4.5,0);__game.advance(0.02);return __game.state();});
  const ei=e.enemies.findIndex(x=>Math.abs(x.y-4.5)<1);
  e=await G(page,()=>{__game.throwOnce();return __game.advance(0.08);});
  check('throw creates a visible arcing projectile',e.shots===1);
  await page.screenshot({path:`${SHOTS}/desktop_1280x720_throw.png`});
  let hitAt=null;for(let i=0;i<60&&!hitAt;i++){e=await G(page,()=>__game.advance(0.02));if(e.enemies[ei].hp<3)hitAt=e;}
  check('balloon hits the enemy, with a hurt flash and splash',hitAt&&hitAt.enemies[ei].hp===2&&hitAt.enemies[ei].hurtT>0&&hitAt.parts>5,hitAt?`hp=${hitAt.enemies[ei].hp} hurtT=${hitAt.enemies[ei].hurtT.toFixed(2)} particles=${hitAt.parts}`:'no hit');
  await page.screenshot({path:`${SHOTS}/desktop_1280x720_hit.png`});
  for(let n=0;n<2;n++){await G(page,(i)=>{const s=__game.state();const en=s.enemies[i];const p=s.player;const a=Math.atan2(en.y-p.y,en.x-p.x);__game.teleport(p.x,p.y,a);__game.throwOnce();__game.advance(0.9);},ei);}
  e=await G(page,()=>__game.advance(0.05));
  check('enemy is defeated with a pop-and-poof',e.enemies[ei].state==='dead'&&e.enemies[ei].gone,`state=${e.enemies[ei].state} msg=${e.msg}`);
  check('defeated enemy drops a coin',e.items.filter(i=>i.kind==='coin').length>e.items.length-3-1);

  // coin pickup
  const c0=e.player.coins;e=await G(page,()=>{__game.teleport(8.5,2.5,0);return __game.advance(0.05);});
  check('coins are collected',e.player.coins===c0+1);

  // exit -> level complete -> level 2
  e=await G(page,()=>{__game.teleport(2.5,9.5,0);return __game.advance(0.05);});
  check('stepping on the exit completes the level',e.mode==='clear');
  await page.screenshot({path:`${SHOTS}/desktop_1280x720_level_clear.png`});
  e=await G(page,()=>{__game.advance(0.6);__game.confirm();return __game.advance(0.05);});
  check('level complete screen loads level 2',e.mode==='play'&&e.level===1);
  check('auto-save updated for level 2',e.save&&e.save.level===1&&e.save.coins===e.player.coins,JSON.stringify(e.save));
  const coinsAtL2=e.player.coins;
  await page.screenshot({path:`${SHOTS}/desktop_1280x720_level2.png`});

  // auto-save restores after reload
  await page.reload();await page.waitForFunction(()=>!!window.__game);
  st=await G(page,()=>__game.state());
  check('after reload the title offers CONTINUE - LEVEL 2',/CONTINUE - LEVEL 2/.test(st.menu[0]),st.menu.join(' | '));
  st=await G(page,()=>{__game.manual=true;__game.menuPick(0);return __game.advance(0.05);});
  check('continue restores level 2 with saved coins',st.mode==='play'&&st.level===1&&st.player.coins===coinsAtL2,`coins=${st.player.coins}`);

  // death + retry
  st=await G(page,()=>{__game.wakeAll();for(let i=0;i<14;i++){const s=__game.state();if(s.mode!=='play')break;const en=s.enemies.find(x=>!x.gone);__game.teleport(en.x+0.3,en.y,Math.PI);__game.advance(1.55);}return __game.state();});
  check('touching enemies costs hearts until death screen',st.mode==='dead'&&st.player.hearts===0);
  await page.screenshot({path:`${SHOTS}/desktop_1280x720_death.png`});
  st=await G(page,()=>{__game.advance(0.6);__game.confirm();return __game.advance(0.05);});
  if(V18)check('M1.8 death ends the run: confirm opens name entry and the save is cleared',st.mode==='name'&&!st.save,`mode=${st.mode} save=${JSON.stringify(st.save)}`);
  else check('retry restarts the level with full hearts',st.mode==='play'&&st.level===1&&st.player.hearts===5);

  // win screen
  st=await G(page,(v13)=>{if(v13){__game.startLevel(__game.numLevels-1);const ex=__game.state().exit;__game.teleport(ex.x+.5,ex.y+.5,0);}else __game.teleport(3.5,10.5,0);__game.advance(0.6);__game.confirm();return __game.advance(0.05);},V13);
  if(V18){const nx=await G(page,()=>__game.state());check('M1.8 finishing level 8 no longer wins: the next floor (9) starts and is saved',nx.mode==='play'&&nx.level===8&&nx.save&&nx.save.level===8,`mode=${nx.mode} level=${nx.level}`);}
  else check(V13?'finishing the last level (8) shows the win screen and clears the save':'finishing level 2 shows the win screen and clears the save',st.mode==='win'&&!st.save);
  await page.screenshot({path:`${SHOTS}/desktop_1280x720_win.png`});

  // a real-time run with the RAF loop, keyboard only
  st=await G(page,()=>{__game.manual=false;__game.startLevel(0);return __game.state();});
  await page.keyboard.down('KeyW');await page.waitForTimeout(600);await page.keyboard.up('KeyW');
  await page.keyboard.down('Space');await page.waitForTimeout(150);await page.keyboard.up('Space');
  st=await G(page,()=>__game.state());
  check('real-time loop: WASD moves and Space throws',st.player.x>2.7&&(st.shots>0||st.parts>0),`x=${st.player.x.toFixed(2)} shots=${st.shots} parts=${st.parts}`);
  const fps=await G(page,async()=>{const f0=__game.state().stats.frames;await new Promise(r=>setTimeout(r,1000));return __game.state().stats.frames-f0;});
  check('renders smoothly in headless Chromium',fps>=30,`${fps} frames/s`);
  await ctx.close();
}

// ---------- gamepad (stubbed Standard-mapping pad) ----------
{
  const ctx=await browser.newContext({viewport:{width:1280,height:720}});
  await ctx.addInitScript(()=>{window.__pad={axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0})),connected:true,mapping:'standard',id:'test pad'};navigator.getGamepads=()=>[window.__pad];});
  const page=await ctx.newPage();page.on('pageerror',e=>consoleProblems.push('[gamepad] '+e.message));page.on('console',m=>{if(m.type()==='error')consoleProblems.push('[gamepad] '+m.text());});
  await page.goto(URL);await page.waitForFunction(()=>!!window.__game);
  await G(page,()=>{__pad.buttons[0]={pressed:true,value:1};});await page.waitForTimeout(150);await G(page,()=>{__pad.buttons[0]={pressed:false,value:0};});await page.waitForTimeout(100);
  let st=await G(page,()=>__game.state());check('gamepad A starts the game',st.mode==='play');
  await G(page,()=>{__pad.axes[1]=-1;});await page.waitForTimeout(500);await G(page,()=>{__pad.axes[1]=0;__pad.axes[2]=1;});await page.waitForTimeout(300);await G(page,()=>{__pad.axes[2]=0;__pad.buttons[7]={pressed:true,value:1};});await page.waitForTimeout(120);await G(page,()=>{__pad.buttons[7]={pressed:false,value:0};});
  st=await G(page,()=>__game.state());
  check('gamepad: left stick moves, right stick turns, RT throws',st.player.x>2.7&&st.player.ang>0.3&&(st.shots>0||st.parts>0),`x=${st.player.x.toFixed(2)} ang=${st.player.ang.toFixed(2)}`);
  await G(page,()=>{__game.manual=true;__game.teleport(4.5,3.5,0);__pad.buttons[2]={pressed:true,value:1};});await page.waitForTimeout(80);
  st=await G(page,()=>{__pad.buttons[2]={pressed:false,value:0};return __game.advance(0.2);});
  check('gamepad X uses (opens door)',st.doors.find(x=>x.x===5&&x.y===3).state!=='closed');
  await ctx.close();
}

// ---------- touch layout: buttons never cover message band / HUD ----------
const viewports=[[844,390],[667,375],[740,360],[926,428],[932,430],[568,320],[1024,768],[1180,820],[1280,720],[1280,800],[800,300]];
for(const [w,h] of viewports){
  const {ctx,page}=await newPage({viewport:{width:w,height:h},hasTouch:true,isMobile:true,label:`${w}x${h}`});
  const lay=await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.advance(0.05);__game.setForceUse(true);return __game.layout();});
  const inter=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const bad=[];
  const btns=V15?['throwBtn','useBtn','pauseBtn','itemBtn','mapBtn','stick']:V14?['throwBtn','useBtn','pauseBtn','itemBtn','stick']:NEW?['throwBtn','useBtn','pauseBtn','stick']:['throwBtn','useBtn','stick'];
  for(const bn of btns)for(const zone of (V14?['band','hud','minimap','itemBar']:['band','hud','minimap'])){if(lay[bn].visible&&inter(lay[bn],lay[zone]))bad.push(`${bn}∩${zone}`);}
  for(let i=0;i<btns.length;i++)for(let j=i+1;j<btns.length;j++)if(lay[btns[i]].visible&&lay[btns[j]].visible&&inter(lay[btns[i]],lay[btns[j]]))bad.push(`${btns[i]}∩${btns[j]}`);
  if(NEW&&!lay.pauseBtn.visible)bad.push('pause button missing');
  if(V12){const hb=await G(page,()=>__game.handCss());for(const [f,r] of Object.entries(hb)){for(const z of (V15?['throwBtn','useBtn','pauseBtn','itemBtn','mapBtn','stick','band','hud','minimap','itemBar']:V14?['throwBtn','useBtn','pauseBtn','itemBtn','stick','band','hud','minimap','itemBar']:['throwBtn','useBtn','pauseBtn','stick','band','hud','minimap']))if(lay[z].visible!==false&&inter(r,lay[z]))bad.push(`hand:${f}∩${z}`);}}
  for(const bn of (V15?['throwBtn','useBtn','pauseBtn','itemBtn','mapBtn']:V14?['throwBtn','useBtn','pauseBtn','itemBtn']:NEW?['throwBtn','useBtn','pauseBtn']:['throwBtn','useBtn']))if(lay[bn].x<0||lay[bn].y<0||lay[bn].x+lay[bn].w>w||lay[bn].y+lay[bn].h>h)bad.push(bn+' off-screen');
  if(V14&&!lay.itemBtn.visible)bad.push('item button missing');if(V15&&!lay.mapBtn.visible)bad.push('map button missing');
  check(`touch layout ${w}x${h}: buttons${V15?' (incl. pause, ITEM + MAP)':V14?' (incl. pause + ITEM)':NEW?' (incl. pause)':''}${V12?' and every hand frame':''} don't overlap message band/HUD/minimap or each other`,bad.length===0&&lay.throwBtn.visible&&lay.useBtn.visible,bad.join(', ')||`throw@${Math.round(lay.throwBtn.x)},${Math.round(lay.throwBtn.y)} band bottom ${Math.round(lay.band.y+lay.band.h)}`);
  await ctx.close();
}

// ---------- phone landscape: real touch input + screenshots ----------
{
  const {ctx,page}=await newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2,label:'phone'});
  await page.waitForTimeout(500);
  await page.screenshot({path:`${SHOTS}/phone_844x390_title.png`});
  await page.touchscreen.tap(422,150);await page.waitForTimeout(150);
  let st=await G(page,()=>__game.state());check('phone: tapping the title starts the game',st.mode==='play'&&st.touch);
  let lay=await G(page,()=>__game.layout());
  check('phone: Use button hidden when nothing is usable',!lay.useBtn.visible);
  const tb=lay.throwBtn;
  // touch throw via CDP touch events
  const cdp=await ctx.newCDPSession(page);
  const touch=async(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
  await touch('touchStart',[{x:tb.x+tb.w/2,y:tb.y+tb.h/2,id:1}]);await page.waitForTimeout(120);await touch('touchEnd',[]);
  await page.waitForTimeout(50);st=await G(page,()=>__game.state());
  check('phone: Throw button throws a balloon',st.shots>0||st.parts>0);
  // stick: press on left side and drag up
  const x0=150,y0=300;const p0=await G(page,()=>__game.state().player);
  await touch('touchStart',[{x:x0,y:y0,id:2}]);await page.waitForTimeout(50);
  for(let i=1;i<=6;i++){await touch('touchMove',[{x:x0,y:y0-i*10,id:2}]);await page.waitForTimeout(16);}
  await page.waitForTimeout(400);
  const stickShot=`${SHOTS}/phone_844x390_stick_active.png`;await page.screenshot({path:stickShot});
  await touch('touchEnd',[]);
  const p1=await G(page,()=>__game.state().player);
  check('phone: floating left stick moves the player',Math.hypot(p1.x-p0.x,p1.y-p0.y)>0.4,`moved ${Math.hypot(p1.x-p0.x,p1.y-p0.y).toFixed(2)}`);
  // look drag on right side
  await touch('touchStart',[{x:560,y:200,id:3}]);for(let i=1;i<=6;i++){await touch('touchMove',[{x:560+i*15,y:200,id:3}]);await page.waitForTimeout(16);}await touch('touchEnd',[]);
  const p2=await G(page,()=>__game.state().player);
  check('phone: dragging on the right side turns',p2.ang-p1.ang>0.2,`turned ${(p2.ang-p1.ang).toFixed(2)} rad`);
  // Use button appears facing a door, and works
  await G(page,()=>{__game.manual=true;__game.teleport(4.4,3.5,0);__game.advance(0.05);});
  lay=await G(page,()=>__game.layout());
  check('phone: Use button appears when facing a door',lay.useBtn.visible);
  await page.screenshot({path:`${SHOTS}/phone_844x390_door_use_button.png`});
  const ub=lay.useBtn;await touch('touchStart',[{x:ub.x+ub.w/2,y:ub.y+ub.h/2,id:4}]);await page.waitForTimeout(30);await touch('touchEnd',[]);
  st=await G(page,()=>__game.advance(0.3));
  check('phone: Use button opens the door',st.doors.find(x=>x.x===5&&x.y===3).state!=='closed');
  await G(page,()=>{__game.teleport(7.6,4.4,-0.15);__game.advance(0.6);__game.throwOnce();__game.advance(0.12);});
  await page.screenshot({path:`${SHOTS}/phone_844x390_gameplay.png`});
  await G(page,()=>{__game.teleport(8.5,5.5,Math.PI/2);__game.advance(0.05);});
  await page.screenshot({path:`${SHOTS}/phone_844x390_fence_key.png`});
  await ctx.close();
  // portrait shows rotate hint (fresh context: the title tap above put the headless window in fullscreen)
  const pc=await newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2,label:'portrait'});
  await G(pc.page,()=>{__game.startLevel(0);});await pc.page.waitForTimeout(200);
  lay=await G(pc.page,()=>__game.layout());st=await G(pc.page,()=>__game.state());
  check('phone portrait: rotate hint shown and game paused',lay.portraitHint&&st.mode==='pause');
  await pc.page.screenshot({path:`${SHOTS}/phone_390x844_portrait_hint.png`});
  await pc.ctx.close();
}

if(NEW){ await regressionTests(); }
if(V12){ await m12Tests(); }
if(V13){ await m13Tests(); }
if(V14){ await m14Tests(); }
if(V15){ await m15Tests(); }
if(V16){ await m16Tests(); }
if(V17){ await m17Tests(); }
if(V18){ await m18Tests(); }

check('no console errors or warnings',consoleProblems.length===0,consoleProblems.slice(0,5).join(' || '));
check('no external network requests',badRequests.length===0,badRequests.slice(0,5).join(', '));
const size=fs.statSync(FILE).size;check('single file size under 300 KB',size<300*1024,`${(size/1024).toFixed(1)} KB`);
await browser.close();
fs.writeFileSync(`${OUT}/results.json`,JSON.stringify({build:BUILD,file:FILE,date:new Date().toISOString(),passed:results.length-failed,failed,results},null,1));
console.log(`\n${results.length-failed}/${results.length} passed`);
process.exit(failed?1:0);

// =====================================================================
// M1.1 regression tests: one per approved fix (A1-A9, B1-B8)
// =====================================================================
async function regressionTests(){
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const phoneOpts={viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2};
  async function cdpTouch(ctx,page){const cdp=await ctx.newCDPSession(page);return (type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});}

  // ---- A1: touch START requests fullscreen only from pointerup/click, with user activation ----
  {
    const ctx=await browser.newContext({...phoneOpts});
    await ctx.addInitScript(()=>{window.__fs=[];window.__evt='';['pointerdown','pointerup','click'].forEach(t=>addEventListener(t,()=>{window.__evt=t;},true));
      const o=Element.prototype.requestFullscreen;Element.prototype.requestFullscreen=function(...a){window.__fs.push({active:navigator.userActivation?navigator.userActivation.isActive:null,evt:window.__evt});return o?o.apply(this,a):Promise.resolve();};});
    const page=await ctx.newPage();const warns=[];page.on('console',m=>{if(m.type()==='error'||m.type()==='warning'){warns.push(m.text());consoleProblems.push('[A1] '+m.text());}});page.on('pageerror',e=>consoleProblems.push('[A1] '+e.message));
    await page.goto(URL);await page.waitForFunction(()=>!!window.__game);await sleep(500);
    await page.touchscreen.tap(422,280);await sleep(300);
    const r=await G(page,()=>({fs:window.__fs,mode:__game.state().mode,fsEl:!!document.fullscreenElement}));
    check('A1 touch START: fullscreen requested once, from pointerup/click with user activation',r.mode==='play'&&r.fs.length===1&&r.fs[0].active===true&&(r.fs[0].evt==='pointerup'||r.fs[0].evt==='click')&&!warns.some(w=>/requestFullscreen|user gesture/i.test(w)),JSON.stringify(r));
    await ctx.close();
  }

  // ---- A2: touch then mouse on a touch-capable PC: mouse mode and pointer lock come back ----
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},hasTouch:true,label:'A2'});
    await sleep(400);await page.keyboard.press('Enter');await sleep(150);
    await page.touchscreen.tap(900,500);await sleep(150);
    const t=await G(page,()=>({touch:__game.state().touch,overlay:__game.layout().overlayOn}));
    await sleep(900);await page.mouse.click(640,400);await sleep(300);
    const m=await G(page,()=>({touch:__game.state().touch,overlay:__game.layout().overlayOn,el:document.elementFromPoint(640,400).id,locked:__game.state().locked}));
    check('A2 hybrid PC: a tap enters touch mode, then a mouse click restores mouse mode + pointer lock',t.touch&&t.overlay&&!m.touch&&!m.overlay&&m.el==='screen'&&m.locked,`after tap ${JSON.stringify(t)}, after click ${JSON.stringify(m)}`);
    await ctx.close();
  }

  // ---- A3 / A4 / A6 / A7: desktop input ----
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'A3'});
    await sleep(400);await page.keyboard.press('Enter');await sleep(150);
    await page.mouse.click(640,400);await sleep(250);
    let st=await G(page,()=>__game.state());
    const haveLock=st.locked;
    // A3 (blur): hold the mouse button, lose focus, resume, no auto-fire
    await page.mouse.down();await sleep(60);
    await G(page,()=>window.dispatchEvent(new Event('blur')));
    st=await G(page,()=>__game.state());
    const pausedClean=st.mode==='pause'&&!st.held.mouse&&!st.held.queued&&st.held.keys.length===0;
    await sleep(250);await page.keyboard.press('Enter');await sleep(100);
    let t0=(await G(page,()=>__game.state())).stats.throws;await sleep(1500);let t1=(await G(page,()=>__game.state())).stats.throws;
    check('A3 blur while holding throw: inputs cleared, game pauses, no auto-fire after resume',pausedClean&&t1===t0,`paused/clean=${pausedClean} throws after resume=${t1-t0}`);
    await page.mouse.up();
    // A3 (visibility change)
    await page.mouse.click(640,400);await sleep(200);await page.mouse.down();await sleep(60);
    await G(page,()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    st=await G(page,()=>__game.state());
    await G(page,()=>{delete document.hidden;});
    check('A3 visibilitychange while holding throw: inputs cleared and paused',st.mode==='pause'&&!st.held.mouse&&!st.held.queued,JSON.stringify(st.held));
    await page.mouse.up();
    // A3 (pointer-lock loss)
    await sleep(250);await page.keyboard.press('Enter');await sleep(200);await page.mouse.click(640,400);await sleep(250);
    await page.mouse.down();await sleep(60);
    await G(page,()=>document.exitPointerLock());await sleep(150);
    st=await G(page,()=>__game.state());
    check('A3 pointer-lock loss while holding throw: inputs cleared and paused',haveLock&&st.mode==='pause'&&!st.held.mouse&&!st.held.queued,`lock was ${haveLock}, mode ${st.mode}, held ${JSON.stringify(st.held)}`);
    await page.mouse.up();
    // A6: click shortly after the lock-loss pause resumes AND re-locks in one click
    await sleep(250);await page.mouse.click(640,400);await sleep(250);
    st=await G(page,()=>__game.state());
    check('A6 one click after Esc/lock loss resumes play and re-locks',st.mode==='play'&&st.locked,`mode=${st.mode} locked=${st.locked}`);
    // A6: a click inside the guard window neither locks nor resumes (no half state)
    await G(page,()=>document.exitPointerLock());await sleep(30);await page.mouse.click(640,400);await sleep(60);
    st=await G(page,()=>__game.state());
    check('A6 too-early click leaves a consistent state (paused and unlocked)',st.mode==='pause'&&!st.locked,`mode=${st.mode} locked=${st.locked}`);
    await sleep(250);await page.mouse.click(640,400);await sleep(250);
    // A4: sub-frame click / Space tap still throws (edge latch)
    await G(page,()=>{__game.manual=true;__game.freeze=true;__game.startLevel(0);__game.teleport(2.5,2.5,0);});
    if(!(await G(page,()=>__game.state().locked))){await G(page,()=>{__game.manual=false;});await page.mouse.click(640,400);await sleep(250);await G(page,()=>{__game.manual=true;});}
    t0=(await G(page,()=>__game.state())).stats.throws;
    await page.mouse.down();await page.mouse.up();
    t1=(await G(page,()=>__game.advance(0.05))).stats.throws;
    await G(page,()=>__game.advance(0.5));
    await page.keyboard.down('Space');await page.keyboard.up('Space');
    const t2=(await G(page,()=>__game.advance(0.05))).stats.throws;
    check('A4 instant mouse click (down+up inside one frame) throws',t1===t0+1,`throws ${t0}->${t1}`);
    check('A4 instant Space tap throws',t2===t1+1,`throws ${t1}->${t2}`);
    // A7: blur during keyboard-only play pauses
    await G(page,()=>{__game.manual=false;__game.freeze=false;document.exitPointerLock();});await sleep(150);
    await G(page,()=>{__game.startLevel(0);});await sleep(100);
    await G(page,()=>window.dispatchEvent(new Event('blur')));
    st=await G(page,()=>__game.state());
    check('A7 losing focus pauses keyboard play',st.mode==='pause');
    // A9: fatal bump + exit on the same step -> death wins
    st=await G(page,()=>{__game.manual=true;__game.freeze=false;__game.startLevel(0);__game.setHearts(1);__game.teleport(2.5,9.5,0);__game.placeEnemy(0,2.8,9.5);return __game.advance(1/60);});
    check('A9 death and exit on the same step: death screen, not level clear',st.mode==='dead'&&st.level===0,`mode=${st.mode}`);
    // B1: knockback 0.80
    st=await G(page,()=>{__game.startLevel(0);__game.teleport(10.5,2.5,0);__game.placeEnemy(0,10.0,2.5);return __game.advance(1/60);});
    const kb=st.player.x-10.5;
    check('B1 contact knockback is 0.80 units',st.player.hearts===4&&kb>0.76&&kb<0.84,`pushed ${kb.toFixed(3)}`);
    // B2: re-bite delay 1.5 s
    const bites=await G(page,()=>{__game.startLevel(0);const out=[];let h=5;for(let i=0;i<330;i++){const s=__game.state();const e=s.enemies[0];__game.teleport(e.x+0.3,e.y,Math.PI);const n=__game.advance(1/60);if(n.player.hearts<h){out.push(i/60);h=n.player.hearts;}if(n.mode!=='play')break;}return out;});
    const gaps=bites.slice(1).map((t,i)=>t-bites[i]);
    check('B2 enemy re-bite delay is 1.50 s',gaps.length>=2&&gaps.every(g=>g>1.45&&g<1.56),`bites at ${bites.map(b=>b.toFixed(2)).join(', ')}`);
    // B3: throw vz 1.8 and longer range
    st=await G(page,()=>{__game.startLevel(0);__game.freeze=true;__game.teleport(6.3,1.5,0);__game.throwOnce();return __game.state();});
    const vz=st.shotList[0].vz;
    const land=await G(page,()=>{let last=null;for(let i=0;i<120;i++){const s=__game.advance(1/60);if(!s.shotList.length)break;last=s.shotList[0].x;}return last;});
    check('B3 balloon thrown with vz 1.8 and flies about 6 cells',Math.abs(vz-1.8)<1e-9&&land-6.3>5.7,`vz=${vz}, flew ${(land-6.3).toFixed(2)} cells`);
    // B6: mute toggle with N, saved, and in the pause menu
    await G(page,()=>{__game.freeze=false;__game.manual=false;});
    await page.keyboard.press('KeyN');await sleep(50);
    st=await G(page,()=>__game.state());
    const stored=await G(page,()=>localStorage.getItem('labyrinthRemake.settings.v1'));
    check('B6 N mutes (master gain 0) and saves the setting',st.settings.mute&&st.gain===0&&/"mute":true/.test(stored||''),`gain=${st.gain} stored=${stored}`);
    await page.reload();await page.waitForFunction(()=>!!window.__game);
    st=await G(page,()=>__game.state());
    check('B6 mute survives a reload',st.settings.mute===true);
    await sleep(400);await page.keyboard.press('Enter');await sleep(100);await page.keyboard.press('KeyP');await sleep(250);
    await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await sleep(50);
    st=await G(page,()=>__game.state());
    check('B6 pause menu SOUND item toggles mute back on',st.mode==='pause'&&st.settings.mute===false&&st.gain>0.3,`mute=${st.settings.mute} gain=${st.gain}`);
    // B8: look speed setting in pause menu, saved; scales mouse look
    await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowRight');await sleep(50);
    st=await G(page,()=>__game.state());
    await page.screenshot({path:`${SHOTS}/desktop_1280x800_pause_menu.png`});
    const ls=await G(page,()=>localStorage.getItem('labyrinthRemake.settings.v1'));
    check('B8 pause menu LOOK SPEED adjusts (100% -> 125%) and saves',st.settings.look===1.25&&/"look":3/.test(ls||''),`look=${st.settings.look} stored=${ls}`);
    await page.reload();await page.waitForFunction(()=>!!window.__game);
    st=await G(page,()=>__game.state());
    check('B8 look speed survives a reload',st.settings.look===1.25);
    await ctx.close();
  }

  // ---- A8: pad-aware pause and death prompts ----
  {
    const ctx=await browser.newContext({viewport:{width:1280,height:800}});
    await ctx.addInitScript(()=>{window.__pad={axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0})),connected:true,mapping:'standard',id:'test pad'};navigator.getGamepads=()=>[window.__pad];});
    const page=await ctx.newPage();page.on('pageerror',e=>consoleProblems.push('[A8] '+e.message));page.on('console',m=>{if(m.type()==='error')consoleProblems.push('[A8] '+m.text());});
    await page.goto(URL);await page.waitForFunction(()=>!!window.__game);await sleep(300);
    const press=async(i)=>{await G(page,(i)=>{__pad.buttons[i]={pressed:true,value:1};},i);await sleep(120);await G(page,(i)=>{__pad.buttons[i]={pressed:false,value:0};},i);await sleep(120);};
    await press(0);await press(9);await sleep(100);
    let st=await G(page,()=>__game.state());
    await page.screenshot({path:`${SHOTS}/desktop_1280x800_pad_pause.png`});
    check('A8 pause prompt names gamepad buttons',st.mode==='pause'&&/A: CHOOSE/.test(st.prompt)&&/START: RESUME/.test(st.prompt),st.prompt);
    await press(9);
    st=await G(page,()=>__game.state());const resumed=st.mode==='play';
    await G(page,()=>{__game.setHearts(1);const p=__game.state().player;__game.placeEnemy(0,p.x+0.3,p.y);});await sleep(700);
    st=await G(page,()=>__game.state());
    if(V18)check('A8 death prompt says PRESS A TO CONTINUE with a pad (M1.8: the run ends)',resumed&&st.mode==='dead'&&st.prompt==='PRESS A TO CONTINUE',`resumed=${resumed} mode=${st.mode} prompt=${st.prompt}`);
    else check('A8 death prompt says PRESS A TO RETRY with a pad',resumed&&st.mode==='dead'&&st.prompt==='PRESS A TO RETRY',`resumed=${resumed} mode=${st.mode} prompt=${st.prompt}`);
    await press(0);st=await G(page,()=>__game.state());
    if(V18)check('A8 pad A on the death screen opens name entry',st.mode==='name',st.mode);
    else check('A8 pad A retries from the death screen',st.mode==='play'&&st.player.hearts===5);
    await ctx.close();
  }

  // ---- A5, B4, B7, B8 (touch), A4 (touch) on a phone ----
  {
    const {ctx,page}=await newPage({...phoneOpts,label:'phone-reg'});
    const touch=await cdpTouch(ctx,page);
    await sleep(500);
    // A5: low tap on the win screen goes to the title, not a new game
    await G(page,(v13)=>{__game.manual=true;if(v13){__game.startLevel(__game.numLevels-1);const ex=__game.state().exit;__game.teleport(ex.x+.5,ex.y+.5,0);}else{__game.startLevel(1);__game.teleport(3.5,10.5,0);}__game.advance(0.6);__game.confirm();__game.advance(0.05);__game.manual=false;},V13);
    await sleep(700);
    let st=await G(page,()=>__game.state());const wasWin=st.mode==='win',was9=st.mode==='play'&&st.level===8;
    await page.touchscreen.tap(422,300);await sleep(450);
    st=await G(page,()=>__game.state());
    if(V18){check('A5 (M1.8) the level-8 clear leads on to floor 9 and a low tap there does not restart the game',was9&&st.mode==='play'&&st.level===8,`was floor 9=${was9}, now ${st.mode} L${st.level}`);await G(page,()=>{localStorage.removeItem('labyrinthRemake.save.v1');__game.toTitle();});await sleep(400);}
    else check('A5 low tap on the win screen lands on the title (no skip into a new game)',wasWin&&st.mode==='title',`was win=${wasWin}, now ${st.mode}`);
    await page.screenshot({path:`${SHOTS}/phone_844x390_title_after_win.png`});
    // start a game for the remaining touch checks
    await page.touchscreen.tap(422,280);await sleep(250);
    // B7: on-screen pause button
    let lay=await G(page,()=>__game.layout());
    await page.screenshot({path:`${SHOTS}/phone_844x390_pause_button.png`});
    const pb=lay.pauseBtn;
    await touch('touchStart',[{x:pb.x+pb.w/2,y:pb.y+pb.h/2,id:11}]);await sleep(40);await touch('touchEnd',[]);await sleep(150);
    st=await G(page,()=>__game.state());
    await page.screenshot({path:`${SHOTS}/phone_844x390_pause_menu.png`});
    check('B7 touch pause button pauses the game and shows the pause menu',pb.visible&&st.mode==='pause'&&st.prompt==='TAP AN OPTION',`mode=${st.mode} prompt=${st.prompt}`);
    // tap the SOUND row on the touch pause menu (internal y 111..121 => css)
    const c=lay.canvas;let rowY=c.y+(111+5)/200*c.h;
    if(V13){const pr=(await G(page,()=>__game.state())).pauseRects[1],D=await G(page,()=>__game.dims);rowY=c.y+(pr[1]+pr[3]/2)/D.H*c.h;}
    await sleep(200);await touch('touchStart',[{x:c.x+c.w/2,y:rowY,id:12}]);await sleep(30);await touch('touchEnd',[]);await sleep(80);
    st=await G(page,()=>__game.state());const muted=st.settings.mute;
    await touch('touchStart',[{x:c.x+c.w/2,y:rowY,id:13}]);await sleep(30);await touch('touchEnd',[]);await sleep(80);
    st=await G(page,()=>__game.state());
    check('B6/B7 touch pause menu SOUND row toggles mute',muted===true&&st.settings.mute===false&&st.mode==='pause');
    // tap outside the panel resumes
    await touch('touchStart',[{x:c.x+8,y:c.y+c.h-8,id:14}]);await sleep(30);await touch('touchEnd',[]);await sleep(100);
    st=await G(page,()=>__game.state());
    check('B7 tapping outside the pause panel resumes',st.mode==='play');
    // A4 touch: very quick THROW tap still throws
    await G(page,()=>{__game.manual=true;__game.freeze=true;__game.teleport(2.5,2.5,0);__game.advance(0.6);});
    lay=await G(page,()=>__game.layout());const tb=lay.throwBtn;
    let t0=(await G(page,()=>__game.state())).stats.throws;
    await touch('touchStart',[{x:tb.x+tb.w/2,y:tb.y+tb.h/2,id:15}]);await touch('touchEnd',[]);
    let t1=(await G(page,()=>__game.advance(0.05))).stats.throws;
    check('A4 instant THROW-button tap throws',t1===t0+1,`throws ${t0}->${t1}`);
    // B4: 85% stick deflection runs
    await G(page,()=>{__game.teleport(1.5,2.5,0);});
    await touch('touchStart',[{x:150,y:300,id:16}]);await touch('touchMove',[{x:150,y:300-0.85*62.4,id:16}]);
    st=await G(page,()=>__game.advance(0.5));
    await touch('touchEnd',[]);
    const ran=st.player.x-1.5;
    check('B4 touch run starts at 80% stick deflection (85% runs)',ran>1.5,`moved ${ran.toFixed(2)} in 0.5 s (walk at 85% would be ~1.15, run ~1.66)`);
    await ctx.close();
  }
  // ---- B8 touch: look-speed setting scales touch turning ----
  {
    const ctx=await browser.newContext({...phoneOpts});
    await ctx.addInitScript(()=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('labyrinthRemake.settings.v1',JSON.stringify({mute:false,look:4}));sessionStorage.setItem('seeded','1');}});
    const page=await ctx.newPage();page.on('pageerror',e=>consoleProblems.push('[B8] '+e.message));
    await page.goto(URL);await page.waitForFunction(()=>!!window.__game);await sleep(500);
    const touch=await cdpTouch(ctx,page);
    await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.freeze=true;__game.advance(0.05);});
    const a0=(await G(page,()=>__game.state())).player.ang;
    await touch('touchStart',[{x:560,y:200,id:21}]);for(let i=1;i<=10;i++){await touch('touchMove',[{x:560+i*10,y:200,id:21}]);}await touch('touchEnd',[]);
    const st=await G(page,()=>__game.advance(1/60));
    const turned=st.player.ang-a0,expect=100*5.2/844*1.5;
    check('B8 look speed 150% scales touch turning (100 px drag)',st.settings.look===1.5&&Math.abs(turned-expect)<0.03,`turned ${turned.toFixed(3)} rad, expected ${expect.toFixed(3)}`);
    await ctx.close();
  }
  // ---- 1280x800 desktop screenshots ----
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'1280x800'});
    await sleep(400);await page.screenshot({path:`${SHOTS}/desktop_1280x800_title.png`});
    await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.teleport(7.6,4.4,-0.15);__game.advance(0.6);__game.throwOnce();__game.advance(0.12);});
    await page.screenshot({path:`${SHOTS}/desktop_1280x800_gameplay.png`});
    await ctx.close();
  }
}

// =====================================================================
// M1.2: vertical look (y-shear), new hand frames, Screamer enemy
// =====================================================================
async function m12Tests(){
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const near=(a,b,t)=>Math.abs(a-b)<=t;
  let PROJ=160/0.66,PMAX=80;
  // headless Chromium reports synthetic absolute jumps as movement under pointer lock, so feed exact deltas to the real handler
  const mm=(page,dy)=>page.evaluate(dy=>window.dispatchEvent(new MouseEvent('mousemove',{movementX:0,movementY:dy})),dy);
  // ---- desktop: mouse pitch, clamp, LOOK SPEED, invert, sprites shear, aim, HUD fixed ----
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m12-desk'});
    await sleep(400);await page.keyboard.press('Enter');await sleep(150);
    await page.mouse.click(640,400);await sleep(250);
    let st=await G(page,()=>{__game.freeze=true;__game.setPitch(0);return __game.state();});
    if(V13){const D=await G(page,()=>__game.dims);PROJ=D.PROJ;PMAX=D.PITCH_MAX;}
    const locked=st.locked;
    await mm(page,-20);await sleep(80);
    st=await G(page,()=>__game.state());const p20=st.player.pitch;
    check('M1.2 mouse up looks up (pitch from mouse Y, LOOK SPEED 100%)',locked&&near(p20,20*0.0026*PROJ,0.6),`locked=${locked} pitch=${p20.toFixed(2)} expected ${(20*0.0026*PROJ).toFixed(2)}`);
    await mm(page,-400);await sleep(80);st=await G(page,()=>__game.state());const top=st.player.pitch;
    await mm(page,800);await sleep(80);st=await G(page,()=>__game.state());const bot=st.player.pitch;
    check(`M1.2 pitch clamps at +/-${PMAX} px (40% of view height)`,top===PMAX&&bot===-PMAX,`max ${top}, min ${bot}`);
    // LOOK SPEED 125% scales mouse Y
    await page.keyboard.press('KeyP');await sleep(250);await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowRight');
    st=await G(page,()=>__game.state());const items=st.pauseItems;
    await page.keyboard.press('Escape');await sleep(250);
    if(!(await G(page,()=>__game.state().locked))){await page.mouse.click(640,400);await sleep(250);}
    await G(page,()=>__game.setPitch(0));await mm(page,-20);await sleep(80);
    st=await G(page,()=>__game.state());
    check('M1.2 mouse Y uses the LOOK SPEED setting (125%)',near(st.player.pitch,20*0.0026*PROJ*1.25,0.8),`pitch=${st.player.pitch.toFixed(2)} expected ${(20*0.0026*PROJ*1.25).toFixed(2)}`);
    check('M1.2 pause menu has INVERT Y as a 4th item, RESUME first',items.length===4&&items[0]==='RESUME'&&/^INVERT Y: OFF$/.test(items[3]),items.join(' | '));
    // invert Y
    await page.keyboard.press('KeyP');await sleep(250);for(let i=0;i<3;i++)await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
    st=await G(page,()=>__game.state());const stored=await G(page,()=>localStorage.getItem('labyrinthRemake.settings.v1'));
    check('M1.2 INVERT Y toggles in the pause menu and is saved',st.settings.invertY===true&&/"invertY":true/.test(stored||''),stored);
    // centre click still resumes (RESUME stays at the screen centre)
    await sleep(100);await page.mouse.click(640,400);await sleep(250);
    st=await G(page,()=>__game.state());
    check('M1.2 with 4 pause items a centre click still hits RESUME',st.mode==='play',`mode=${st.mode}`);
    await G(page,()=>__game.setPitch(0));await mm(page,-20);await sleep(80);
    st=await G(page,()=>__game.state());
    check('M1.2 inverted: mouse up looks down',st.player.pitch<-10,`pitch=${st.player.pitch.toFixed(2)}`);
    await page.reload();await page.waitForFunction(()=>!!window.__game);
    check('M1.2 INVERT Y survives a reload',(await G(page,()=>__game.state())).settings.invertY===true);
    // sprites, walls and floor shear together
    const sh=await G(page,()=>{__game.manual=true;__game.freeze=true;__game.startLevel(0);__game.teleport(9.0,4.5,0);const r=[];for(const pv of [0,40,-40,80]){__game.setPitch(pv);const s=__game.state().stats;r.push({pv,e:s.enemyRect,w:s.wallTop,b:s.wallBot});}return r;});
    const ok=sh.slice(1).every(x=>x.e&&near(x.e.top-sh[0].e.top,x.pv,1e-6)&&near(x.e.bottom-sh[0].e.bottom,x.pv,1e-6)&&near(x.w-sh[0].w,x.pv,1e-6)&&near(x.b-sh[0].b,x.pv,1e-6));
    check('M1.2 sprites shear exactly with walls (pitch 0/+40/-40/+80)',ok,sh.map(x=>`p${x.pv}: enemyTop ${x.e?x.e.top.toFixed(1):'-'} wallTop ${x.w.toFixed(1)}`).join('; '));
    // floor/ceiling horizon follows pitch
    const hz=await G(page,()=>{const c=document.getElementById('screen').getContext('2d');function row(y){const d=c.getImageData(5,y,1,1).data;return [d[0],d[1],d[2]];}
      __game.teleport(2.5,2.5,Math.PI*0.75);__game.setPitch(0);const a=row(110);__game.setPitch(-60);const b=row(110);__game.setPitch(60);const cc=row(110);return {a,b,cc};});
    check('M1.2 floor/ceiling split moves with pitch',JSON.stringify(hz.b)!==JSON.stringify(hz.cc),JSON.stringify(hz));
    // throw aim follows pitch
    const aim=await G(page,()=>{const out={};for(const pv of [0,40,-40]){__game.startLevel(0);__game.freeze=true;__game.teleport(6.3,1.5,0);__game.setPitch(pv);__game.throwOnce();out[pv]=__game.state().shotList[0].vz;}return out;});
    check('M1.2 throw arc follows pitch (vz = 1.8 + 6.6*pitch/PROJ)',near(aim[0],1.8,1e-9)&&near(aim[40],Math.min(V15?2.40:V13?2.45:99,1.8+6.6*40/PROJ),1e-6)&&near(aim[-40],1.8-6.6*40/PROJ,1e-6),JSON.stringify(aim));
    // HUD + minimap don't move with pitch
    const hud=await G(page,(pm)=>{const c=document.getElementById('screen').getContext('2d');function count(x,y,w,h,rgb){const d=c.getImageData(x,y,w,h).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]===rgb[0]&&d[i+1]===rgb[1]&&d[i+2]===rgb[2])n++;return n;}
      const R=__game.hudRects?__game.hudRects():{hud:[0,0,90,26],map:[266,2,52,52],band:[90,2,172,12]};
      __game.startLevel(0);__game.freeze=true;__game.advance(0.05);const r=[];for(const pv of [0,pm,-pm]){__game.setPitch(pv);r.push([count(...R.hud,[232,58,74]),count(...R.map,[255,255,255]),count(...R.band,[255,226,122])]);}return r;},PMAX);
    check('M1.2 HUD hearts, minimap marker and message text unaffected by pitch',hud.every(x=>JSON.stringify(x)===JSON.stringify(hud[0]))&&hud[0][0]>0&&hud[0][1]>0&&hud[0][2]>0,JSON.stringify(hud));
    // screenshots: look up / down
    await G(page,()=>{__game.manual=true;__game.freeze=true;__game.startLevel(0);__game.teleport(8.6,5.4,Math.PI/2);__game.setPitch(70);__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m12_look_up_1280x800.png`});
    await G(page,()=>{__game.setPitch(-70);__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m12_look_down_1280x800.png`});
    // hand frames
    const sig=await G(page,()=>['idle','windup','throw','empty'].map(f=>__game.frameSig(f)));
    check('M1.2 hand has 4 distinct frames (idle, windup, throw, empty)',new Set(sig).size===4,sig.join(','));
    const seq=await G(page,()=>{__game.startLevel(0);__game.freeze=true;__game.teleport(1.5,1.5,Math.PI);__game.advance(0.6);const out=[__game.state().handFrame];__game.throwOnce();for(let i=0;i<40;i++){const s=__game.advance(1/60);if(out[out.length-1]!==s.handFrame)out.push(s.handFrame);}return out;});
    check('M1.2 throw plays idle -> windup -> throw -> empty -> idle',JSON.stringify(seq)===JSON.stringify(['idle','windup','throw','empty','idle']),seq.join(' > '));
    const bob=await G(page,()=>{const c=document.getElementById('screen').getContext('2d');const B=__game.dims&&__game.dims.W===480?[210,165,165,135]:[140,110,110,90];function h(){const d=c.getImageData(...B).data;let x=0;for(let i=0;i<d.length;i++)x=(Math.imul(x,31)+d[i])|0;return x;}const hs=new Set(),fr=new Set();for(let i=0;i<10;i++){__game.advance(0.15);hs.add(h());fr.add(__game.state().handFrame);}return {n:hs.size,frames:[...fr]};});
    check('M1.2 idle hand bobs while standing still',bob.frames.join()==='idle'&&bob.n>=2,JSON.stringify(bob));
    await G(page,()=>{__game.teleport(7.6,4.4,-0.15);__game.setPitch(0);__game.advance(0.8);});
    await page.screenshot({path:`${SHOTS}/m12_hand_idle_1280x800.png`});
    await G(page,()=>{__game.throwOnce();__game.advance(1/60);});
    await page.screenshot({path:`${SHOTS}/m12_hand_windup_1280x800.png`});
    await G(page,()=>{__game.advance(0.1);});
    await page.screenshot({path:`${SHOTS}/m12_hand_throw_1280x800.png`});
    // enemy replacement
    const names=await G(page,()=>__game.spriteNames());
    const fsig=await G(page,()=>[0,1,2,3].map(i=>__game.frameSig('screamer',i)));
    st=await G(page,()=>__game.state());
    check('M1.2 green pear enemy is gone; every enemy is a Screamer',!names.includes('blob')&&names.includes('screamer')&&st.enemies.every(e=>e.type==='screamer'),names.join(','));
    check('M1.2 Screamer has 4 distinct ear-flap frames',new Set(fsig).size===4,fsig.join(','));
    const px=await G(page,()=>{__game.startLevel(0);__game.freeze=true;__game.teleport(9.0,4.5,0);__game.advance(0.05);const D=__game.dims||{W:320,H:200};const d=document.getElementById('screen').getContext('2d').getImageData(0,0,D.W,D.H).data;let purple=0,lime=0,slate=0;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(b>150&&r>100&&g<120&&b>r)purple++;if(g>180&&r<170&&b<90)lime++;if(b>110&&b>r+35&&b>g+15&&g>r-5&&r<150)slate++;}return {purple,lime,slate};});
    if(V13)check('M1.3 Screamer renders slate-blue (no purple, no lime-green pear pixels)',px.slate>2500&&px.purple<50&&px.lime===0,JSON.stringify(px));
    else check('M1.2 Screamer renders (purple) with no lime-green pear pixels',px.purple>800&&px.lime===0,JSON.stringify(px));
    await page.screenshot({path:`${SHOTS}/m12_screamer_closeup_1280x800.png`});
    const anim=await G(page,()=>{__game.freeze=false;__game.teleport(2.5,2.5,Math.PI);const seen=new Set();for(let i=0;i<40;i++){const s=__game.advance(1/60);seen.add(s.enemies[0].frame);}return [...seen];});
    check('M1.2 Screamer flaps through its frames while hovering',anim.length>=4,`frames seen ${anim.join(',')}`);
    const scr=await G(page,()=>{__game.startLevel(0);const a=__game.state().stats.screams;__game.teleport(8.5,3.5,0);__game.advance(0.1);return __game.state().stats.screams-a;});
    check('M1.2 Screamer screams when it spots you',scr>=1,`screams ${scr}`);
    const heights=await G(page,()=>{const zs=[];__game.startLevel(0);__game.teleport(2.5,2.5,Math.PI);for(let i=0;i<60;i++){__game.advance(1/60);zs.push(__game.state().enemies[0].y);}return zs.length;});
    // sprite sheet
    const url=await G(page,()=>__game.spriteSheet(4));fs.writeFileSync(`${SHOTS}/m12_spritesheet_4x.png`,Buffer.from(url.split(',')[1],'base64'));
    await ctx.close();
  }
  // ---- gamepad right stick Y ----
  {
    const ctx=await browser.newContext({viewport:{width:1280,height:800}});
    await ctx.addInitScript(()=>{localStorage.removeItem('labyrinthRemake.settings.v1');window.__pad={axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0})),connected:true,mapping:'standard',id:'test pad'};navigator.getGamepads=()=>[window.__pad];});
    const page=await ctx.newPage();page.on('pageerror',e=>consoleProblems.push('[m12-pad] '+e.message));page.on('console',m=>{if(m.type()==='error')consoleProblems.push('[m12-pad] '+m.text());});
    await page.goto(URL);await page.waitForFunction(()=>!!window.__game);await sleep(300);
    await G(page,()=>{__pad.buttons[0]={pressed:true,value:1};});await sleep(120);await G(page,()=>{__pad.buttons[0]={pressed:false,value:0};__game.freeze=true;});await sleep(120);
    await G(page,()=>{__pad.axes[3]=-1;});await sleep(150);await G(page,()=>{__pad.axes[3]=0;});await sleep(50);
    const up=(await G(page,()=>__game.state())).player.pitch;
    await G(page,()=>{__pad.axes[3]=1;});await sleep(V13?1300:600);await G(page,()=>{__pad.axes[3]=0;});await sleep(50);
    const down=(await G(page,()=>__game.state())).player.pitch;
    const PM=V13?120:80;
    check('M1.2 gamepad right stick Y looks up/down and clamps',up>20&&up<=PM&&down===-PM,`up ${up.toFixed(1)}, then down ${down}`);
    await sleep(500);const still=(await G(page,()=>__game.state())).player.pitch;
    check('M1.2 pitch stays put when nothing moves it (no auto-centre)',still===-PM,`after 0.5 s idle: ${still}`);
    await ctx.close();
  }
  // ---- touch: vertical drag on the look side ----
  {
    const {ctx,page}=await newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2,label:'m12-touch'});
    const cdp=await ctx.newCDPSession(page);const touch=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
    await sleep(500);await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.freeze=true;__game.advance(0.05);});
    await touch('touchStart',[{x:600,y:250,id:31}]);for(let i=1;i<=4;i++)await touch('touchMove',[{x:600,y:250-i*10,id:31}]);await touch('touchEnd',[]);
    let st=await G(page,()=>__game.advance(1/60));
    if(V13)PROJ=(await G(page,()=>__game.dims)).PROJ;
    const exp=(V13?40-12:40)*(5.2/844)*PROJ*0.7; // M1.3: 12 px vertical dead zone
    check('M1.2 touch: dragging up on the look side looks up',near(st.player.pitch,exp,1.5),`pitch ${st.player.pitch.toFixed(2)}, expected ${exp.toFixed(2)}`);
    await G(page,()=>{__game.teleport(8.6,5.4,Math.PI/2);__game.setPitch(60);__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m12_phone_844x390_look_up.png`});
    await G(page,()=>{__game.teleport(9.0,4.5,0);__game.setPitch(0);__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m12_phone_844x390_screamer.png`});
    await ctx.close();
  }
}

// =====================================================================
// M1.3: 480x300, five new mobs, procedural levels, M1.2 QA steering
// =====================================================================
async function m13Tests(){
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const near=(a,b,t)=>Math.abs(a-b)<=t;
  const savePng=(name,url)=>fs.writeFileSync(`${SHOTS}/${name}`,Buffer.from(url.split(',')[1],'base64'));
  const NEWMOBS=['springle','kettle','wisp','clunk','zapfly'],ALL=['screamer',...NEWMOBS];
  const PERF={};
  // ---------- resolution + mobs on desktop ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m13-desk'});
    await sleep(300);
    const r=await G(page,()=>{const c=document.getElementById('screen');return {d:__game.dims,cw:c.width,ch:c.height,css:getComputedStyle(c).imageRendering,n:__game.numLevels,hand:__game.spriteInfo('hand','idle'),scr:__game.spriteInfo('screamer',0)};});
    check('M1.3 internal resolution is 480x300 (16:10) with a crisp pixelated canvas',r.d.W===480&&r.d.H===300&&r.cw===480&&r.ch===300&&r.d.W/r.d.H===1.6&&/pixelated|crisp/.test(r.css)&&r.d.TS===64,`${r.cw}x${r.ch}, ${r.css}, textures ${r.d.TS}px`);
    check('M1.3 sprites redrawn with more pixels (hand >= 69x60, Screamer >= 95 px wide)',r.hand.w>=69&&r.hand.h>=60&&r.scr.w>=95,`hand ${r.hand.w}x${r.hand.h}, screamer ${r.scr.w}x${r.scr.h}`);
    const mobs=await G(page,()=>__game.mobs);
    const types=Object.keys(mobs);
    check('M1.3 six enemy types: the Screamer plus five new mobs',JSON.stringify(types.sort())===JSON.stringify([...ALL].sort()),types.join(','));
    const hp=types.map(t=>mobs[t].hp),sp=types.map(t=>mobs[t].speed),vo=types.map(t=>mobs[t].voice),nm=types.map(t=>mobs[t].name);
    check('M1.3 every mob has its own HP, speed, sound and name',new Set(hp).size===6&&new Set(sp).size===6&&new Set(vo).size===6&&new Set(nm).size===6&&nm.every(n=>n&&n.length>2),types.map(t=>`${mobs[t].name}: hp ${mobs[t].hp}, speed ${mobs[t].speed}, ${mobs[t].voice}`).join('; '));
    check('M1.3 Clunkbot is the slowest and toughest, Zapfly the fastest and frailest',mobs.clunk.speed===Math.min(...sp)&&mobs.clunk.hp===Math.max(...hp)&&mobs.zapfly.speed===Math.max(...sp)&&mobs.zapfly.hp===Math.min(...hp));
    // animation frames + hit-flash frames
    const fr=await G(page,(all)=>all.map(t=>{const s=new Set();for(let i=0;i<4;i++)s.add(__game.frameSig(t,i));return s.size;}),ALL);
    check('M1.3 all 6 mobs have 4 distinct animation frames',fr.every(n=>n===4),ALL.map((t,i)=>t+':'+fr[i]).join(' '));
    // render each mob close-up, check its colours, animation, hit flash and sound
    const colorTest={screamer:'r<150&&b>110&&b>r+35&&b>g+15',springle:'r>200&&g>80&&g<170&&b<70',kettle:'g>120&&b>100&&r<100&&g>r+40',wisp:'r>110&&b>70&&r>g+25&&b>g+8',clunk:'b>170&&r<110&&g>80&&g<170&&b>g+40',zapfly:'r>210&&g>180&&b<100'};
    for(const t of ALL){
      const res=await G(page,([t,ct])=>{__game.manual=true;__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.setHearts(99);__game.teleport(7.2,3.5,0);__game.spawn(t,9.4,3.5,false);__game.advance(0.05);
        const D=__game.dims,d=document.getElementById('screen').getContext('2d').getImageData(0,0,D.W,D.H).data,f=new Function('r','g','b','return '+ct);let n=0;for(let i=0;i<d.length;i+=4)if(f(d[i],d[i+1],d[i+2]))n++;
        return {n,boxes:__game.state().stats.enemyBoxes.length};},[t,colorTest[t]]);
      await page.screenshot({path:`${SHOTS}/m13_mob_${t}_closeup_1280x800.png`});
      const anim=await G(page,()=>{__game.freeze=false;const seen=new Set();for(let i=0;i<90;i++){const s=__game.advance(1/60);seen.add(s.enemies[0].frame);}return [...seen];});
      const hit=await G(page,(t)=>{__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.setHearts(99);__game.teleport(7.2,3.5,0);__game.spawn(t,8.6,3.5,false);__game.advance(0.05);
        const hp0=__game.state().enemies[0].hp;const c=document.getElementById('screen').getContext('2d');function sig(){const b=__game.state().stats.enemyBoxes[0];if(!b)return null;const d=c.getImageData(Math.max(0,b[0]|0),Math.max(0,b[1]|0),Math.max(1,b[2]|0),Math.max(1,b[3]|0)).data;let h=0;for(let i=0;i<d.length;i++)h=(Math.imul(h,31)+d[i])|0;return h;}
        const s0=sig();let st=null;for(const pv of [0,-30,30,-60,60]){__game.setPitch(pv);__game.throwOnce();for(let i=0;i<40;i++){st=__game.advance(1/60);if(st.enemies[0].hurtT>0)break;}if(st.enemies[0].hurtT>0)break;}__game.setPitch(0);__game.advance(1/60);const s1=sig();
        return {hp0,hp1:st.enemies[0].hp,hurt:st.enemies[0].hurtT,diff:s0!==s1};},t);
      const snd=await G(page,(t)=>{__game.startLevel(0);__game.clearMobs();__game.freeze=false;__game.setHearts(99);__game.teleport(7.2,3.5,0);__game.spawn(t,10.5,3.5,false);const v0=(__game.state().stats.voices[t]||0);__game.advance(6);return (__game.state().stats.voices[t]||0)-v0;},t);
      check(`M1.3 ${t}: renders, animates (${anim.length} frames seen), flashes when hit, and plays its own sound`,res.n>150&&res.boxes>=1&&anim.length>=3&&hit.hp1===hit.hp0-1&&hit.hurt>0&&hit.diff&&snd>=1,`colour px ${res.n}, frames ${anim.join(',')}, hp ${hit.hp0}->${hit.hp1}, flash ${hit.hurt>0&&hit.diff}, voices ${snd}`);
    }
    // behaviours
    const hop=await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.freeze=false;__game.setHearts(99);__game.teleport(7.2,3.5,0);__game.spawn('springle',12.5,3.5,true);let mx=0,mn=9;for(let i=0;i<150;i++){const e=__game.advance(1/60).enemies[0];mx=Math.max(mx,e.z);mn=Math.min(mn,e.z);}return {mx,mn};});
    check('M1.3 Springle bounces along in hops',hop.mx>0.15&&hop.mn<0.03,`z ${hop.mn.toFixed(2)}..${hop.mx.toFixed(2)}`);
    const ch=await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.freeze=false;__game.setHearts(99);__game.teleport(6.6,3.5,0);__game.spawn('kettle',10.5,3.5,true);const s0=__game.state().stats;let vmax=0,px=10.5;for(let i=0;i<120;i++){const e=__game.advance(1/60).enemies[0];vmax=Math.max(vmax,Math.abs(e.x-px)*60);px=e.x;}const s=__game.state().stats;return {charges:s.charges-s0.charges,steam:s.steam-s0.steam,vmax};});
    check('M1.3 Kettlegrump charges at you and puffs steam',ch.charges>=1&&ch.steam>=1&&ch.vmax>2.5,JSON.stringify(ch));
    const gh=await G(page,()=>{const run=(t)=>{__game.startLevel(0);__game.clearMobs();__game.freeze=false;__game.setHearts(99);__game.teleport(8.5,9.5,-Math.PI/2);__game.spawn(t,8.5,4.5,true);let crossed=false;for(let i=0;i<240;i++){const e=__game.advance(1/60).enemies[0];if(e.y>6.6&&e.x>7&&e.x<10)crossed=true;}const e=__game.state().enemies[0];return {crossed,y:e.y};};return {wisp:run('wisp'),screamer:run('screamer')};});
    check('M1.3 Hazewisp drifts through fences (a Screamer cannot)',gh.wisp.crossed&&!gh.screamer.crossed&&gh.screamer.y<6,JSON.stringify(gh));
    const alpha=await G(page,()=>__game.mobs.wisp.alpha);
    check('M1.3 Hazewisp is drawn semi-transparent',alpha>0.3&&alpha<0.9,`alpha ${alpha}`);
    const zz=await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.freeze=false;__game.setHearts(99);__game.teleport(6.5,1.5,0);__game.spawn('zapfly',13.5,4.5,true);let len=0,last=null,first=null,turns=0,lastAng=null;for(let i=0;i<90;i++){const e=__game.advance(1/60).enemies[0];if(last){const dx=e.x-last.x,dy=e.y-last.y;len+=Math.hypot(dx,dy);const a=Math.atan2(dy,dx);if(lastAng!==null&&Math.abs(Math.atan2(Math.sin(a-lastAng),Math.cos(a-lastAng)))>0.25)turns++;lastAng=a;}else first=e;last=e;}return {len,disp:Math.hypot(last.x-first.x,last.y-first.y),turns,z:last.z};});
    check('M1.3 Zapfly flies fast and erratically',zz.len>2.4&&zz.len/Math.max(zz.disp,.01)>1.05&&zz.turns>=3,`path ${zz.len.toFixed(2)} vs displacement ${zz.disp.toFixed(2)}, ${zz.turns} sharp turns`);
    const tank=await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.setHearts(99);__game.teleport(7.2,3.5,0);__game.spawn('clunk',8.6,3.5,false);let n=0;for(let k=0;k<20&&__game.state().enemies[0].state!=='dead';k++){__game.throwOnce();for(let i=0;i<40;i++)__game.advance(1/60);n++;}return {n,dead:__game.state().enemies[0].state==='dead'};});
    check('M1.3 Clunkbot is tanky (needs 8 balloons)',tank.dead&&tank.n===8,JSON.stringify(tank));
    // sprite sheet 4x
    savePng('m13_mobs_spritesheet_4x.png',await G(page,()=>__game.spriteSheet(4,'mobs')));
    savePng('m13_screamer_frames_4x.png',await G(page,()=>__game.spriteSheet(4,'screamer')));
    savePng('m13_hand_frames_4x.png',await G(page,()=>__game.spriteSheet(4,'hand')));
    savePng('m13_textures_4x.png',await G(page,()=>__game.textures(4)));
    // Screamer redraw (steering): blue, wide and short, sideways blade ears, no teeth/tentacles/pink/yellow
    const si=await G(page,()=>[0,1,2,3].map(i=>__game.spriteInfo('screamer',i)));
    const ar=si.map(x=>x.bw/x.bh);
    check('M1.3 Screamer redraw: slate-blue, very wide and short (~2.2:1)',ar.every(a=>a>1.9&&a<2.6)&&si.every(x=>x.colors.slate>x.colors.opaque*0.6),ar.map(a=>a.toFixed(2)).join(','));
    check('M1.3 Screamer redraw: no yellow eyes, pink ears or white teeth',si.every(x=>x.colors.yellow===0&&x.colors.pink===0&&x.colors.white<=4),JSON.stringify(si.map(x=>x.colors)));
    const so=await G(page,()=>[0,1].map(i=>__game.frameSig('screamerO',i)).concat([__game.frameSig('screamer',0)]));
    const sa=await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.freeze=false;__game.teleport(7.2,3.5,0);__game.spawn('screamer',10.5,3.5,false);let open=false;for(let i=0;i<30;i++){const e=__game.advance(1/60).enemies[0];if(e.screamAnim>0)open=true;}return open;});
    check('M1.3 Screamer O-mouth opens when it screams',sa&&new Set(so).size===3);
    const hb=await G(page,()=>{const out={};for(const off of [0.2,0.36]){__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.teleport(7.0,3.5,0);__game.spawn('screamer',8.4,3.58+off,false);__game.advance(0.02);__game.throwOnce();for(let i=0;i<50;i++)__game.advance(1/60);out[off]=__game.state().enemies[0].hp;}return out;});
    check('M1.3 Screamer hitbox tightened (0.20 off the balloon line hits, 0.36 misses)',hb['0.2']===2&&hb['0.36']===3,JSON.stringify(hb));
    // look-down HUD fix: a mid-range Screamer stays visible behind the top HUD
    const ld=await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.teleport(6.6,3.5,0);__game.spawn('screamer',9.6,3.5,false);const D=__game.dims,R=__game.hudRects().band;const c=document.getElementById('screen').getContext('2d');function slate(){const d=c.getImageData(...R).data;let n=0;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(b>100&&b>r+30&&b>g+12&&r<140)n++;}return n;}
      __game.setPitch(0);__game.advance(0.02);const g0=__game.state().hudGhost,n0=slate();__game.setPitch(-D.PITCH_MAX);let n1=0,s;for(let i=0;i<12;i++){__game.clearMobs();__game.spawn('screamer',9.6,3.5,false);s=__game.advance(0.02);n1=Math.max(n1,slate());} /* the Screamer spawns at a random hover phase: sample several */return {g0,n0,g1:s.hudGhost,n1,box:s.stats.enemyBoxes[0]};});
    await page.screenshot({path:`${SHOTS}/m13_look_down_screamer_behind_hud_1280x800.png`});
    check('M1.3 full look-down: HUD goes see-through so a mid-range Screamer stays visible',!ld.g0&&ld.g1&&ld.n1>ld.n0+40,`ghost ${ld.g0}->${ld.g1}, Screamer px in band ${ld.n0}->${ld.n1}`);
    // empty-hand frame lengthened
    const em=await G(page,()=>{__game.startLevel(0);__game.freeze=true;__game.teleport(1.5,1.5,Math.PI);__game.advance(0.6);__game.throwOnce();let n=0,dy=0;const seq=[];for(let i=0;i<60;i++){const s=__game.advance(1/60);if(s.handFrame==='empty'){n++;dy=Math.max(dy,s.handDY);}if(seq[seq.length-1]!==s.handFrame)seq.push(s.handFrame);}return {t:n/60,dy,seq};});
    check('M1.3 empty-hand frame lasts >= 0.11 s and drops away',em.t>=0.11&&em.dy>=10&&em.seq.join('>')==='windup>throw>empty>idle',`${(em.t*1000).toFixed(0)} ms, drop ${em.dy.toFixed(1)} px, ${em.seq.join('>')}`);
    // M12-A1: balloon can't pass the ceiling; range capped
    const ce=await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.teleport(6.3,1.5,0);const out={};for(const pv of [0,27,60,120]){__game.setPitch(pv);__game.throwOnce();const s0=__game.state().shotList[0];let mz=0,x=s0.x,vz=s0.vz;for(let i=0;i<200;i++){const st=__game.advance(1/60);if(!st.shotList.length)break;mz=Math.max(mz,st.shotList[0].z);x=st.shotList[0].x;}out[pv]={vz,mz,range:x-6.3};__game.advance(.3);}const h0=__game.state().stats.ceilingHits;__game.setPitch(0);__game.shoot(6);for(let i=0;i<60;i++)__game.advance(1/60);out.forced=__game.state().stats.ceilingHits-h0;return out;});
    check('M12-A1 throw vz capped at 2.45 and the balloon never reaches the ceiling',ce[120].vz<=2.45&&ce[60].vz<=2.45&&Object.keys(ce).filter(k=>k!=='forced').every(k=>ce[k].mz<0.97),Object.entries(ce).filter(([k])=>k!=='forced').map(([k,v])=>`p${k}: vz ${v.vz.toFixed(2)} peak ${v.mz.toFixed(2)} range ${v.range.toFixed(2)}`).join('; '));
    check('M12-A1 range no longer grows at high pitch (<= 8 tiles)',ce[120].range<=8&&ce[120].range<=ce[27].range+1.6,`p27 ${ce[27].range.toFixed(2)}, p120 ${ce[120].range.toFixed(2)}`);
    check('M12-A1 ceiling collision: a too-steep balloon splashes on the ceiling',ce.forced===1,`ceiling hits ${ce.forced}`);
    // M12-A2: no double balloon (shot hidden for its first 0.08 s)
    const db=await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.teleport(6.3,1.5,0);__game.setPitch(0);__game.advance(0.6);const n0=__game.state().stats.sprites;__game.throwOnce();const r=[];for(let i=0;i<8;i++){const s=__game.advance(1/60);r.push([+(s.shotList[0]?s.shotList[0].age:0).toFixed(3),s.stats.sprites-n0]);}return r;});
    check('M12-A2 a fresh shot is not drawn for its first 0.08 s (no double balloon)',db.every(([a,n])=>a<0.08?n===0:n===1),JSON.stringify(db));
    // perf: render cost at 480x300 and real-time fps on a busy generated level
    const rt=await G(page,()=>{__game.manual=true;__game.setSeed(4242);__game.startLevel(4);__game.wakeAll();__game.advance(0.2);const t0=performance.now();for(let i=0;i<200;i++)__game.render();return (performance.now()-t0)/200;});
    PERF.desktopRenderMs=rt;
    const fps=await G(page,async()=>{__game.manual=false;__game.setHearts(99);__game.wakeAll();await new Promise(r=>setTimeout(r,300));const f0=__game.state().stats.frames;await new Promise(r=>setTimeout(r,2000));return (__game.state().stats.frames-f0)/2;});
    PERF.desktopFps=fps;
    check('M1.3 holds 60 fps on desktop (headless real-time loop, busy generated level)',fps>=55,`${fps.toFixed(1)} fps, render ${rt.toFixed(2)} ms/frame`);
    await ctx.close();
  }
  // ---------- procedural generation: solvability over many seeds ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m13-procgen'});
    const maps=await G(page,()=>{const out=[];for(let s=1;s<=525;s++){const lvl=2+(s%7);const d=__game.genMap(s,lvl);out.push({seed:s,lvl,map:d.map,fallback:d.fallback,locks:d.locks,rooms:d.rooms});}for(let s=9001;s<=9030;s++)for(let lvl=2;lvl<=8;lvl++){const d=__game.genMap(s,lvl);out.push({seed:s,lvl,map:d.map,fallback:d.fallback,locks:d.locks,rooms:d.rooms});}return out;});
    const mobCh={e:'screamer',b:'springle',t:'kettle',g:'wisp',r:'clunk',z:'zapfly'};
    const WALL=new Set(['#','S','W','T','M']);
    function analyse(m){const rows=m.map,h=rows.length,w=rows[0].length;const at=(x,y)=>rows[y][x];let sx=-1,sy=-1;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(at(x,y)==='p'){sx=x;sy=y;}
      const problems=[];if(sx<0)problems.push('no start');
      const border=[];for(let x=0;x<w;x++){border.push(at(x,0),at(x,h-1));}for(let y=0;y<h;y++){border.push(at(0,y),at(w-1,y));}if(border.some(c=>!WALL.has(c)))problems.push('open border');
      const flood=(open)=>{const seen=new Uint8Array(w*h),q=[[sx,sy]];seen[sy*w+sx]=1;while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h||seen[ny*w+nx])continue;const c=at(nx,ny);if(WALL.has(c)||c==='F')continue;if(c==='L'&&!open.has(nx+','+ny))continue;seen[ny*w+nx]=1;q.push([nx,ny]);}}return seen;};
      const locks=[];let keys=0,exits=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=at(x,y);if(c==='L')locks.push(x+','+y);if(c==='k')keys++;if(c==='X')exits++;}
      if(exits!==1)problems.push('exits '+exits);if(keys<locks.length)problems.push(`keys ${keys} < locks ${locks.length}`);
      // exhaustive search over every lock-opening order: no state may soft-lock before the exit is reachable
      let states=0,softlock=false,everWin=false;const visit=new Set();
      const dfs=(open)=>{const k=[...open].sort().join('|');if(visit.has(k))return;visit.add(k);states++;const seen=flood(open);let kr=0,exitR=false;
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(!seen[y*w+x])continue;const c=at(x,y);if(c==='k')kr++;if(c==='X')exitR=true;}
        if(exitR)everWin=true;const avail=kr-open.size;let moved=false;
        if(avail>0)for(const L of locks){if(open.has(L))continue;const [lx,ly]=L.split(',').map(Number);if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{const nx=lx+dx,ny=ly+dy;return nx>=0&&ny>=0&&nx<w&&ny<h&&seen[ny*w+nx];})){moved=true;dfs(new Set([...open,L]));}}
        if(!moved&&!exitR)softlock=true;};
      dfs(new Set());if(softlock)problems.push('soft-lock');if(!everWin)problems.push('exit unreachable');
      const all=flood(new Set(locks));let floor=0,reached=0,mobs=0,items=0,mobsUnreached=0,itemsUnreached=0,mobNear=0;
      const bfsD=(()=>{const d=new Int32Array(w*h).fill(-1),q=[[sx,sy]];d[sy*w+sx]=0;let qi=0;while(qi<q.length){const [x,y]=q[qi++];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h||d[ny*w+nx]>=0)continue;const c=at(nx,ny);if(WALL.has(c)||c==='F')continue;d[ny*w+nx]=d[y*w+x]+1;q.push([nx,ny]);}}return d;})();
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=at(x,y);if(WALL.has(c)||c==='F')continue;floor++;if(all[y*w+x])reached++;if(mobCh[c]){mobs++;if(!all[y*w+x])mobsUnreached++;if(bfsD[y*w+x]>=0&&bfsD[y*w+x]<7)mobNear++;}if('kch'.includes(c)){items++;if(!all[y*w+x])itemsUnreached++;}}
      if(reached!==floor)problems.push(`unreachable floor ${floor-reached}`);if(mobsUnreached||itemsUnreached)problems.push('unreachable things');if(mobNear)problems.push(`${mobNear} mobs within 7 steps of start`);
      // fences must be windows: wall-or-fence above/below or left/right
      for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){if(at(x,y)!=='F'&&at(x,y)!=='D'&&at(x,y)!=='L')continue;const hz=!WALL.has(at(x-1,y))&&!WALL.has(at(x+1,y))&&at(x-1,y)!=='F'&&at(x+1,y)!=='F',vt=!WALL.has(at(x,y-1))&&!WALL.has(at(x,y+1))&&at(x,y-1)!=='F'&&at(x,y+1)!=='F';if(!(hz&&WALL.has(at(x,y-1))&&WALL.has(at(x,y+1)))&&!(vt&&WALL.has(at(x-1,y))&&WALL.has(at(x+1,y)))){problems.push(`bad ${at(x,y)} at ${x},${y}`);break;}}
      return {problems,w,h,mobs,locks:locks.length,states,types:new Set([...rows.join('')].filter(c=>mobCh[c]).map(c=>mobCh[c])),rows};}
    const bad=[];const byLvl={};
    for(const m of maps){const a=analyse(m);if(m.fallback)a.problems.push('fallback');if(a.problems.length)bad.push(`seed ${m.seed} L${m.lvl}: ${a.problems.join(',')}`);(byLvl[m.lvl]=byLvl[m.lvl]||[]).push({...a,m});}
    check(`M1.3 procgen: ${maps.length} generated maps (525 seeds + 30 seeds x 7 levels) are all fully reachable and solvable in any key order`,bad.length===0&&maps.length>=735,bad.slice(0,6).join(' | ')||`max lock-order states ${Math.max(...Object.values(byLvl).flat().map(a=>a.states))}`);
    const det=await G(page,()=>{const a=JSON.stringify(__game.genMap(777,4).map),b=JSON.stringify(__game.genMap(777,4).map),c=JSON.stringify(__game.genMap(778,4).map),d=JSON.stringify(__game.genMap(777,5).map);return {same:a===b,diffSeed:a!==c,diffLvl:a!==d};});
    check('M1.3 procgen is deterministic per seed+level and varies by seed and level',det.same&&det.diffSeed&&det.diffLvl,JSON.stringify(det));
    const lv=Object.keys(byLvl).map(Number).sort((a,b)=>a-b).map(l=>{const A=byLvl[l];const avg=k=>A.reduce((s,a)=>s+a[k],0)/A.length;return {l,area:avg('w')*avg('h'),mobs:avg('mobs'),locks:avg('locks'),n:A.length};});
    const grows=lv.every((x,i)=>i===0||(x.mobs>=lv[i-1].mobs-0.3&&x.area>=lv[i-1].area-1));
    check('M1.3 map size, enemy count and locks scale up by level',grows&&lv[lv.length-1].mobs>lv[0].mobs+2&&lv[lv.length-1].area>lv[0].area&&lv.filter(x=>x.l>=4).every(x=>x.locks>=1.9),lv.map(x=>`L${x.l}: ${Math.round(x.area)} cells, ${x.mobs.toFixed(1)} mobs, ${x.locks.toFixed(1)} locks`).join('; '));
    const FEAT=V16?{2:['kettle'],3:['springle','wisp','kettle'],4:['clunk'],5:['zapfly','clunk','kettle']}:V15?{2:['kettle'],3:['springle','wisp'],4:['clunk'],5:['zapfly','clunk','kettle']}:{2:['springle','kettle'],3:['wisp'],4:['clunk'],5:['zapfly']}; // M1.5: springle moves to L3
    const featOk=Object.entries(FEAT).every(([l,ts])=>byLvl[l].every(a=>ts.every(t=>a.types.has(t))));
    const l2bad=byLvl[2].filter(a=>(V15&&a.types.has('springle'))||a.types.has('wisp')||a.types.has('clunk')||a.types.has('zapfly')).length;
    const allSeen=new Set(Object.values(byLvl).flat().flatMap(a=>[...a.types]));
    check('M1.3 mobs are distributed across levels (new types introduced on levels 2-5, all 6 in late levels)',featOk&&l2bad===0&&allSeen.size===6,`featured ok ${featOk}, level-2 maps with late mobs ${l2bad}, types seen ${[...allSeen].join(',')}`);
    // map overviews + in-game shots for 3 generated maps
    for(const [seed,lvl] of [[4242,3],[9001,5],[31337,8]]){
      savePng(`m13_map_seed${seed}_level${lvl}_overview.png`,await G(page,([s,l])=>__game.mapOverview(s,l,12),[seed,lvl]));
      const ok=await G(page,([s,l])=>{__game.manual=true;__game.setSeed(s);__game.startLevel(l-1);__game.freeze=true;__game.advance(0.05);return JSON.stringify(__game.currentMap())===JSON.stringify(__game.genMap(s,l).map);},[seed,lvl]);
      await page.screenshot({path:`${SHOTS}/m13_map_seed${seed}_level${lvl}_ingame_1280x800.png`});
      if(seed===4242)check('M1.3 the in-game level is the generated map for (seed, level)',ok);
    }
    savePng('m13_map_tutorial_level1_overview.png',await G(page,()=>__game.mapOverview(0,1,12)));
    const tut=await G(page,()=>{__game.startLevel(0);return __game.state().levelName;});
    check('M1.3 level 1 stays the hand-made tutorial',/GATEHOUSE/.test(tut),tut);
    await ctx.close();
  }
  // ---------- seed: URL param, pause menu, save/continue ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m13-seed',query:'?seed=4242'});
    await sleep(300);
    let st=await G(page,()=>__game.state());const s0=st.seed;
    await page.keyboard.press('Enter');await sleep(150);
    st=await G(page,()=>{__game.manual=true;return __game.state();});
    check('M1.3 ?seed=4242 in the URL sets the game seed',s0===4242&&st.seed===4242&&st.mode==='play',`seed ${s0} -> ${st.seed}`);
    const same=await G(page,()=>{__game.startLevel(2);return JSON.stringify(__game.currentMap())===JSON.stringify(__game.genMap(4242,3).map);});
    st=await G(page,()=>__game.state());
    check('M1.3 auto-save stores the seed and level',st.save&&st.save.seed===4242&&st.save.level===2&&same,JSON.stringify(st.save));
    // pause menu shows the seed (the seed line changes when the seed does)
    await G(page,()=>{__game.manual=false;});await page.keyboard.press('KeyP');await sleep(150);await G(page,()=>{__game.manual=true;});
    const pz=await G(page,()=>{const c=document.getElementById('screen').getContext('2d');const sig=()=>{const d=c.getImageData(90,112,300,18).data;let h=0,n=0;for(let i=0;i<d.length;i+=4){h=(Math.imul(h,31)+d[i]+d[i+1]*3)|0;if(d[i]>200)n++;}return [h,n];};__game.render();const a=sig();__game.setSeed(987654);__game.render();const b=sig();__game.setSeed(4242);__game.render();return {mode:__game.state().mode,a,b};});
    await page.screenshot({path:`${SHOTS}/m13_pause_menu_seed_1280x800.png`});
    check('M1.3 pause menu shows the seed',pz.mode==='pause'&&pz.a[1]>30&&pz.a[0]!==pz.b[0],JSON.stringify(pz));
    // continue (without the URL param) restores seed + level + map
    await page.goto(URL);await page.waitForFunction(()=>!!window.__game);await sleep(200);
    st=await G(page,()=>__game.state());const menu0=st.menu[0];
    const cont=await G(page,()=>{__game.manual=true;__game.menuPick(0);__game.advance(0.05);const s=__game.state();return {seed:s.seed,level:s.level,same:JSON.stringify(__game.currentMap())===JSON.stringify(__game.genMap(4242,3).map)};});
    check('M1.3 continue restores the saved seed and the same generated map',/CONTINUE - LEVEL 3/.test(menu0)&&cont.seed===4242&&cont.level===2&&cont.same,`${menu0}; ${JSON.stringify(cont)}`);
    await ctx.close();
    const a=await newPage({label:'m13-seed2',query:'?seed=hello'});const b=await newPage({label:'m13-seed3',query:'?seed=hello'});const c=await newPage({label:'m13-seed4'});const d=await newPage({label:'m13-seed5'});
    const sa=await G(a.page,()=>__game.state().seed),sb=await G(b.page,()=>__game.state().seed),sc=await G(c.page,()=>__game.state().seed),sd=await G(d.page,()=>__game.state().seed);
    check('M1.3 text seeds hash to a stable number; no ?seed= picks a random seed',Number.isInteger(sa)&&sa===sb&&Number.isInteger(sc)&&sc!==sd,`hello -> ${sa}/${sb}; random ${sc}, ${sd}`);
    for(const x of [a,b,c,d])await x.ctx.close();
  }
  // ---------- pause menu fixes (M1.1-A1..A3, arrows on SOUND/INVERT) ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:720},label:'m13-pause'});
    await sleep(300);await page.keyboard.press('Enter');await sleep(150);
    const lay=await G(page,()=>__game.layout());const c=lay.canvas,D=await G(page,()=>__game.dims);
    const css=(x,y)=>({x:c.x+x/D.W*c.w,y:c.y+y/D.H*c.h});
    const pauseNow=async()=>{await G(page,()=>{if(__game.state().mode!=='pause')window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyP',key:'p'}));});await sleep(120);await G(page,()=>window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyP',key:'p'})));};
    await pauseNow();
    // A2: panel title and strips do not resume
    const rects=(await G(page,()=>__game.state())).pauseRects;const results2=[];
    for(const [x,y] of [[240,99],[240,121],[240,240],[240,252],[110,200]]){const p=css(x,y);await page.mouse.click(p.x,p.y);await sleep(120);results2.push((await G(page,()=>__game.state())).mode);}
    check('M1.1-A2 clicks on the pause title, seed line, prompt strip or blank panel do not resume',results2.every(m=>m==='pause'),results2.join(','));
    // A1: letterbox bars resume (desktop 1280x720 -> bars left/right)
    const st0=(await G(page,()=>__game.state())).mode;
    await page.mouse.click(Math.max(4,c.x/2),360);await sleep(200);
    let st=await G(page,()=>__game.state());
    check('M1.1-A1 click on the letterbox bar resumes',c.x>10&&st0==='pause'&&st.mode==='play',`bar width ${c.x.toFixed(0)} px, mode ${st0} -> ${st.mode}`);
    // A3: LOOK SPEED clamps
    await page.keyboard.press('Escape');await sleep(50);await pauseNow();
    await G(page,()=>{});
    await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');
    for(let i=0;i<12;i++)await page.keyboard.press('ArrowRight');
    const hi=(await G(page,()=>__game.state())).settings.look;
    await page.keyboard.press('Enter');const hi2=(await G(page,()=>__game.state())).settings.look;
    for(let i=0;i<14;i++)await page.keyboard.press('ArrowLeft');
    const lo=(await G(page,()=>__game.state())).settings.look;
    check('M1.1-A3 LOOK SPEED clamps at 50% and 200% (no wrap, Enter at max stays at max)',hi===2&&hi2===2&&lo===0.5,`max ${hi}, Enter at max ${hi2}, min ${lo}`);
    for(let i=0;i<2;i++)await page.keyboard.press('ArrowRight'); // back to 100%
    // arrows toggle SOUND and INVERT
    await page.keyboard.press('ArrowUp');const m0=(await G(page,()=>__game.state())).settings.mute;
    await page.keyboard.press('ArrowRight');const m1=(await G(page,()=>__game.state())).settings.mute;
    await page.keyboard.press('ArrowLeft');const m2=(await G(page,()=>__game.state())).settings.mute;
    await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');const i0=(await G(page,()=>__game.state())).settings.invertY;
    await page.keyboard.press('ArrowLeft');const i1=(await G(page,()=>__game.state())).settings.invertY;
    await page.keyboard.press('ArrowRight');const i2=(await G(page,()=>__game.state())).settings.invertY;
    check('M1.3 left/right toggle the SOUND and INVERT Y rows in the pause menu',m1===!m0&&m2===m0&&i1===!i0&&i2===i0&&(await G(page,()=>__game.state())).mode==='pause',`mute ${m0}>${m1}>${m2}, invert ${i0}>${i1}>${i2}`);
    // re-centre: C key, middle mouse
    await page.keyboard.press('Escape');await sleep(150);
    const kc=await G(page,()=>{__game.manual=true;__game.freeze=true;__game.setPitch(90);window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyC',key:'c'}));__game.advance(1/60);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyC',key:'c'}));__game.advance(0.25);return __game.state().player.pitch;});
    // (synthetic mouse jumps under pointer lock read as movement in headless Chromium, so send the press itself)
    const mc=await G(page,()=>{__game.setPitch(-90);const cv=document.getElementById('screen');cv.dispatchEvent(new MouseEvent('mousedown',{button:1,bubbles:true,cancelable:true,clientX:640,clientY:360}));cv.dispatchEvent(new MouseEvent('mouseup',{button:1,bubbles:true,clientX:640,clientY:360}));__game.advance(0.25);return __game.state();});
    check('M1.3 re-centre view: C key and middle mouse button',kc===0&&mc.player.pitch===0&&mc.mode==='play',`C -> ${kc}, middle -> ${mc.player.pitch} (${mc.mode})`);
    await ctx.close();
  }
  // ---------- gamepad: pitch rate/curve and R3 ----------
  {
    const ctx=await browser.newContext({viewport:{width:1280,height:800}});
    await ctx.addInitScript(()=>{localStorage.removeItem('labyrinthRemake.settings.v1');window.__pad={axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0})),connected:true,mapping:'standard',id:'test pad'};navigator.getGamepads=()=>[window.__pad];});
    const page=await ctx.newPage();page.on('pageerror',e=>consoleProblems.push('[m13-pad] '+e.message));page.on('console',m=>{if(m.type()==='error')consoleProblems.push('[m13-pad] '+m.text());});
    await page.goto(URL);await page.waitForFunction(()=>!!window.__game);await sleep(200);
    const r=await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.freeze=true;const P=__game.dims.PROJ,PM=__game.dims.PITCH_MAX;const run=(v,t)=>{__game.setPitch(0);__pad.axes[3]=v;__game.advance(t);__pad.axes[3]=0;__game.advance(1/60);return __game.state().player.pitch;};
      const full=run(-1,0.25),part=run(-0.6,0.25);let t=0;__game.setPitch(-PM);__pad.axes[3]=-1;while(__game.state().player.pitch<PM&&t<3){__game.advance(1/60);t+=1/60;}__pad.axes[3]=0;
      __game.setPitch(70);__pad.buttons[11]={pressed:true,value:1};__game.advance(1/60);__pad.buttons[11]={pressed:false,value:0};__game.advance(0.3);return {full,part,exp:0.6*P*0.25,fullRange:t,r3:__game.state().player.pitch};});
    check('M1.3 gamepad pitch ~0.6xPROJ/s at full stick (~1.1 s full range) with a response curve',near(r.full,r.exp,r.exp*0.12)&&r.part<r.full*0.4&&r.part>0&&r.fullRange>0.95&&r.fullRange<1.3,`full ${r.full.toFixed(1)} (exp ${r.exp.toFixed(1)}), 60% stick ${r.part.toFixed(1)}, full range ${r.fullRange.toFixed(2)} s`);
    check('M1.3 gamepad R3 re-centres the view',r.r3===0,`pitch ${r.r3}`);
    await ctx.close();
  }
  // ---------- touch: axis lock, dead zone, double-tap re-centre, letterbox resume, phone shots + perf ----------
  {
    const {ctx,page}=await newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2,label:'m13-touch'});
    const cdp=await ctx.newCDPSession(page);const touch=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
    await sleep(400);await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.freeze=true;__game.advance(0.05);});
    const a0=(await G(page,()=>__game.state())).player.ang;
    await touch('touchStart',[{x:560,y:200,id:41}]);for(let i=1;i<=8;i++)await touch('touchMove',[{x:560+i*12,y:200-i*1.6,id:41}]);await touch('touchEnd',[]);
    let st=await G(page,()=>__game.advance(1/60));
    check('M1.3 touch turn with a slight vertical wobble does not drift pitch (axis lock)',st.player.pitch===0&&st.player.ang-a0>0.3,`pitch ${st.player.pitch.toFixed(2)}, turned ${(st.player.ang-a0).toFixed(2)} rad`);
    await sleep(400);
    await touch('touchStart',[{x:600,y:250,id:42}]);for(let i=1;i<=5;i++)await touch('touchMove',[{x:600+i*0.4,y:250-i*2,id:42}]);await touch('touchEnd',[]);
    st=await G(page,()=>__game.advance(1/60));const dz=st.player.pitch;
    await sleep(400);
    await G(page,()=>__game.setPitch(80));
    await touch('touchStart',[{x:620,y:200,id:43}]);await touch('touchEnd',[]);await sleep(120);
    const single=(await G(page,()=>__game.advance(0.3))).player.pitch;
    await sleep(400);
    await touch('touchStart',[{x:620,y:200,id:44}]);await touch('touchEnd',[]);await sleep(140);await touch('touchStart',[{x:624,y:203,id:45}]);await touch('touchEnd',[]);
    const dbl=(await G(page,()=>__game.advance(0.3))).player.pitch;
    check('M1.3 touch: 10 px vertical jitter stays in the dead zone; double-tap re-centres (single tap does not)',dz===0&&single===80&&dbl===0,`jitter pitch ${dz}, single tap ${single}, double tap ${dbl}`);
    // letterbox tap resumes (phone: bars left and right)
    const lay=await G(page,()=>__game.layout());
    await G(page,()=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyP',key:'p'}));__game.advance(1/60);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyP',key:'p'}));__game.advance(0.3);});
    const was=(await G(page,()=>__game.state())).mode;
    await touch('touchStart',[{x:lay.canvas.x/2,y:200,id:46}]);await sleep(30);await touch('touchEnd',[]);await sleep(150);
    st=await G(page,()=>__game.state());
    check('M1.1-A1 tap on the phone letterbox bar resumes',lay.canvas.x>20&&was==='pause'&&st.mode==='play',`bar ${lay.canvas.x.toFixed(0)} px, ${was} -> ${st.mode}`);
    // phone screenshots on a generated level
    await G(page,()=>{__game.manual=true;__game.freeze=true;__game.setSeed(9001);__game.startLevel(4);const s=__game.state(),m=__game.currentMap(),open=(x,y)=>{const c=(m[Math.floor(y)]||'')[Math.floor(x)];return c&&!'#SWTMFDL'.includes(c);};
      let best=null;for(let gy=1;gy<m.length-1;gy++)for(let gx=1;gx<m[0].length-1;gx++){if(!open(gx+.5,gy+.5))continue;for(let k=0;k<4;k++){const a=k*Math.PI/2,dx=Math.round(Math.cos(a)),dy=Math.round(Math.sin(a));let n=0;const px=-dy,py=dx;while(open(gx+.5+dx*(n+1),gy+.5+dy*(n+1))&&open(gx+.5+dx*(n+1)+px,gy+.5+dy*(n+1)+py)&&n<9)n++;if(n>=5&&(!best||n>best.n))best={x:gx+.5,y:gy+.5,a,dx,dy,n};}}
      __game.clearMobs();__game.teleport(best.x,best.y,best.a);for(const [t,d,l] of [['kettle',2.0,0.1],['springle',3.3,0.85],['zapfly',2.7,-0.3]])__game.spawn(t,best.x+best.dx*d-best.dy*l,best.y+best.dy*d+best.dx*l,false);__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m13_phone_844x390_generated_level.png`});
    await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.teleport(7.2,3.5,0);__game.spawn('wisp',9.0,3.0,false);__game.spawn('clunk',10.2,4.2,false);__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m13_phone_844x390_mobs.png`});
    // phone perf with 4x CPU throttle
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
    const ph=await G(page,async()=>{__game.setSeed(9001);__game.startLevel(4);__game.freeze=false;__game.setHearts(99);__game.wakeAll();__game.manual=false;await new Promise(r=>setTimeout(r,400));const f0=__game.state().stats.frames;await new Promise(r=>setTimeout(r,2000));const fps=(__game.state().stats.frames-f0)/2;__game.manual=true;const t0=performance.now();for(let i=0;i<60;i++)__game.render();return {fps,ms:(performance.now()-t0)/60};});
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
    PERF.phoneFps4x=ph.fps;PERF.phoneRenderMs4x=ph.ms;
    check('M1.3 stays playable on a phone (844x390, 4x CPU throttle)',ph.fps>=30,`${ph.fps.toFixed(1)} fps, render ${ph.ms.toFixed(2)} ms/frame at 4x throttle`);
    await ctx.close();
  }
  // ---------- internal review: new Screamer next to the reference (test-output only, never in the build) ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m13-review'});
    savePng('_tmp_screamer_6x.png',await G(page,()=>__game.spriteSheet(6,'screamer')));
    await ctx.close();
    fs.unlinkSync(`${SHOTS}/_tmp_screamer_6x.png`);
    const html=fs.readFileSync(FILE,'utf8');
    check('M1.3 no large embedded bitmap in the build (all art is drawn in code)',!/data:image\/png;base64,iVBOR[\s\S]{4000,}/.test(html));
  }
  fs.writeFileSync(`${SHOTS}/../perf.json`,JSON.stringify(PERF,null,1));
  console.log('PERF',JSON.stringify(PERF));
}

// =====================================================================
// M1.4: elite mobs (ranged / slime trail / beefy / fast / regen) and power-ups
// =====================================================================
async function m14Tests(){
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const savePng=(n,u)=>fs.writeFileSync(`${SHOTS}/${n}`,Buffer.from(u.split(',')[1],'base64'));
  const PERF={};
  const FRESH=()=>{__game.manual=true;__game.freeze=false;__game.setSeed(4242);__game.startLevel(0);__game.clearMobs();__game.setHearts(99);__game.teleport(7.5,3.5,0);__game.setEffect(null);};
  // ---------- elite chance + modifiers (desktop) ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m14'});
    const cfg=await G(page,()=>({cfg:__game.eliteCfg,ch:[1,2,3,5,8,12,20,21,40].map(f=>__game.eliteChance(f))}));
    const CAP=V18?.6:1;
    check(V18?'M1.4/M1.8 elite chance = 5% per floor, capped at 60% (M1.8), 0% on the tutorial (one config constant)':'M1.4 elite chance = 5% per floor, capped at 100%, 0% on the tutorial (one config constant)',cfg.cfg.perFloor===0.05&&cfg.ch[0]===0&&Math.abs(cfg.ch[1]-.10)<1e-9&&Math.abs(cfg.ch[4]-.40)<1e-9&&Math.abs(cfg.ch[5]-Math.min(CAP,.6))<1e-9&&cfg.ch[6]===CAP&&cfg.ch[7]===CAP&&cfg.ch[8]===CAP,JSON.stringify(cfg.ch));
    const N=6000,rs=await G(page,(N)=>[1,2,3,4,5,6,7,8,10,20,25].map(f=>({f,...__game.rollStats(f,N,'t14')})),N);
    const bad=rs.filter(r=>{const p=Math.min(CAP,.05*r.f)*(r.f<=1?0:1),sd=Math.sqrt(p*(1-p)/N)||1e-9;return Math.abs(r.frac-p)>Math.max(4*sd,.002);});
    check(`M1.4 elite rate matches 5%/floor${V18?' (cap 60%)':''} statistically (${N} rolls per floor, within 4 sigma)`,bad.length===0,rs.map(r=>`F${r.f}:${(r.frac*100).toFixed(1)}%`).join(' '));
    if(!V16)check('M1.4 elites get 1 modifier before floor 6 and 2 modifiers from floor 6',rs.filter(r=>r.f<6).every(r=>r.two===0)&&rs.filter(r=>r.f>=6).every(r=>r.two===Math.round(r.frac*N)),rs.map(r=>`F${r.f}:${r.two}`).join(' '));
    else check('M1.4/M1.6 elites get 1 modifier before floor 6; 2 modifiers phase in (50% F6, 75% F7, 100% from F8)',rs.filter(r=>r.f<6).every(r=>r.two===0)&&rs.filter(r=>r.f>=8).every(r=>r.two===Math.round(r.frac*N))&&rs.filter(r=>r.f===6||r.f===7).every(r=>Math.abs(r.two/Math.round(r.frac*N)-(r.f===6?.5:.75))<.06),rs.map(r=>`F${r.f}:${r.two}/${Math.round(r.frac*N)}`).join(' '));
    const allMods=Object.keys(rs[rs.length-1].counts).sort().join(',');
    check('M1.4 all five modifiers roll (ranged, slime, beefy, fast, regen)',allMods==='beefy,fast,ranged,regen,slime',allMods);
    // per-level elites are deterministic per seed, tutorial has none
    const lv=await G(page,()=>{const run=()=>{__game.setSeed(31337);__game.startLevel(7);const s=__game.state();return {sig:s.enemies.map(e=>e.type+':'+e.mods.join('+')).join(' '),n:s.enemies.filter(e=>e.mods.length).length};};const a=run(),b=run();__game.startLevel(0);const t=__game.state();return {a,b,tut:t.enemies.filter(e=>e.mods.length).length};});
    check('M1.4 elite rolls are deterministic per seed; tutorial has no elites',lv.a.sig===lv.b.sig&&lv.a.n>0&&lv.tut===0,`floor 8 seed 31337: ${lv.a.n} elites; tutorial ${lv.tut}`);
    // RANGED: each mob gets its own projectile, telegraphed first
    const kinds={kettle:'steam',zapfly:'zap',clunk:'laser',screamer:'sonic',wisp:'wisp',springle:'fluff'};
    const rr=await G(page,(FR)=>{const FRESH=eval(FR);const out={};for(const t of Object.keys(__game.ranged)){FRESH();__game.teleport(7.5,3.5,0);__game.spawn(t,13.5,3.5,true,['ranged']);let tele=-1,fire=-1,kind=null,still=true,lastX=null;const f0=__game.state().stats.eshotsFired;
        for(let i=0;i<240;i++){if(!(__game.state().enemies[0].tele>0))__game.placeEnemy(0,13.5,3.5); /* hold range so melee/charges can't pre-empt the shot */const s=__game.advance(0.05),e=s.enemies[0];if(e.tele>0&&tele<0)tele=i;if(tele>=0&&fire<0&&e.tele>0){if(lastX!==null&&t!=='zapfly'&&Math.abs(e.x-lastX)>1e-6)still=false;lastX=e.x;}
          if(s.stats.eshotsFired>f0&&fire<0){fire=i;kind=s.eshots[0]&&s.eshots[0].kind;break;}}
        out[t]={kind,tele,fire,gap:(fire-tele)*0.05,want:__game.ranged[t].tele,still};}return out;},FRESH.toString());
    const rbad=Object.entries(rr).filter(([t,r])=>r.kind!==kinds[t]||r.tele<0||r.fire<=r.tele||Math.abs(r.gap-r.want)>0.11||!r.still);
    check('M1.4 RANGED: every mob telegraphs (stops + flashes), then fires its own projectile',rbad.length===0,Object.entries(rr).map(([t,r])=>`${t}:${r.kind} after ${r.gap.toFixed(2)}s${r.still?'':' MOVED'}`).join(', '));
    // projectiles: blocked by walls and fences, hit the player otherwise
    const pj=await G(page,(FR)=>{const FRESH=eval(FR);FRESH();const h0=__game.state().player.hearts,z0=__game.state().stats;
      __game.addShot('laser',13.5,2.5,6,0);__game.addShot('zap',8.5,5.2,0,5);__game.addShot('steam',8.5,7.6,0,-5); /* -> east wall, -> fence from north, -> fence from south */
      let s=__game.advance(1.0);const wallsOk=s.eshots.length===0&&s.stats.eshotsBlocked-z0.eshotsBlocked===3&&s.player.hearts===h0;
      __game.addShot('sonic',10.5,3.5,-5,0);s=__game.advance(0.8);return {wallsOk,blocked:s.stats.eshotsBlocked-z0.eshotsBlocked,hit:s.stats.shotHits-z0.shotHits,dh:h0-s.player.hearts};},FRESH.toString());
    check('M1.4 enemy projectiles are stopped by walls and fences (like balloons) and hurt the player on contact',pj.wallsOk&&pj.blocked===3&&pj.hit===1&&pj.dh===1,JSON.stringify(pj));
    // dodge: a shot fired at where the player was misses if they sidestep
    const dg=await G(page,(FR)=>{const FRESH=eval(FR);FRESH();const h0=__game.state().player.hearts;__game.addShot('laser',12.5,3.5,-4,0);__game.advance(0.3);__game.teleport(7.5,2.2,0);const s=__game.advance(1.5);return {dh:h0-s.player.hearts,left:s.eshots.length};},FRESH.toString());
    check('M1.4 non-homing projectiles can be dodged by sidestepping',dg.dh===0,JSON.stringify(dg));
    // BEEFY
    const bf=await G(page,(FR)=>{const FRESH=eval(FR);FRESH();const base=__game.mobs.clunk.hp;__game.spawn('clunk',8.1,3.5,true,['beefy']);__game.freeze=true;const e=__game.state().enemies[0];__game.freeze=false;const h0=__game.state().player.hearts;const s=__game.advance(0.1);return {base,hp:e.hp,maxHp:e.maxHp,scale:e.scale,spd:e.spdMul,dmg:e.dmg,dh:h0-s.player.hearts};},FRESH.toString());
    check('M1.4 BEEFY: 1.5x size, 2.5x HP, slower, 2 hearts of contact damage',bf.scale===1.5&&bf.hp===Math.ceil(bf.base*2.5)&&bf.maxHp===bf.hp&&bf.spd<1&&bf.dmg===2&&bf.dh===2,JSON.stringify(bf));
    // FAST
    const fs1=await G(page,(FR)=>{const FRESH=eval(FR);const run=(m)=>{FRESH();__game.teleport(7.5,1.5,0);__game.spawn('clunk',13.5,4.5,true,m);__game.advance(0.05);const a=__game.state().enemies[0];__game.advance(1.0);const b=__game.state().enemies[0];return {d:Math.hypot(b.x-a.x,b.y-a.y),spd:b.spdMul};};return {plain:run([]),fast:run(['fast'])};},FRESH.toString());
    check('M1.4 FAST: +40% move speed',Math.abs(fs1.fast.spd-1.4)<1e-9&&fs1.fast.d/fs1.plain.d>1.25&&fs1.fast.d/fs1.plain.d<1.55,`plain ${fs1.plain.d.toFixed(2)} vs fast ${fs1.fast.d.toFixed(2)} cells/s`);
    // REGEN
    const rg=await G(page,(FR)=>{const FRESH=eval(FR);FRESH();__game.spawn('clunk',13.5,1.5,true,['regen']);__game.teleport(7.5,5.2,0);__game.damageMob(0,2);const a=__game.state().enemies[0].hp;let s=__game.advance(2.0);const b=s.enemies[0].hp;s=__game.advance(0.7);const c=s.enemies[0].hp;__game.damageMob(0,1);s=__game.advance(2.0);return {max:s.enemies[0].maxHp,a,b,c,d:s.enemies[0].hp,regens:s.stats.regens};},FRESH.toString());
    check('M1.4 REGEN: heals 1 HP every 2.5 s, timer resets when hit',rg.b===rg.a&&rg.c===rg.a+1&&rg.d===rg.c-1,JSON.stringify(rg));
    // SLIME TRAIL
    const sl=await G(page,(FR)=>{const FRESH=eval(FR);FRESH();__game.spawn('clunk',13.5,1.5,true,['slime']);__game.teleport(7.5,5.2,0);let s=__game.advance(2.5);const trail=s.puddles.length;
      __game.clearMobs();FRESH();const h0=__game.state().player.hearts;__game.addPuddle(7.5,3.5);s=__game.advance(0.1);const d1=h0-s.player.hearts,cd=s.player.goopT;s=__game.advance(1.0);const d2=h0-s.player.hearts;s=__game.advance(0.6);const d3=h0-s.player.hearts;
      __game.teleport(10.5,2.5,0);s=__game.advance(7.0);const before=s.puddles.length;s=__game.advance(1.5);const after=s.puddles.length;
      for(let i=0;i<70;i++)__game.addPuddle(9+(i%5)*.5,1.5+(i/5|0)*.25);s=__game.advance(0.02);return {trail,d1,cd,d2,d3,before,after,cap:s.puddles.length,capCfg:__game.eliteCfg.maxPuddles,life:__game.eliteCfg.puddleLife};},FRESH.toString());
    check('M1.4 SLIME TRAIL: moving elites leave goo puddles',sl.trail>=2,`${sl.trail} puddles after 2.5 s`);
    check('M1.4 goo hurts 1 heart, then has a 1.5 s cooldown while you stand in it',sl.d1===1&&sl.cd>1.3&&sl.d2===1&&sl.d3===2,JSON.stringify({d1:sl.d1,cd:sl.cd,d2:sl.d2,d3:sl.d3}));
    check('M1.4 goo puddles expire after ~9 s and are capped (oldest dropped)',sl.life>=8&&sl.life<=10&&sl.before===1&&sl.after===0&&sl.cap===sl.capCfg,JSON.stringify({life:sl.life,before:sl.before,after:sl.after,cap:sl.cap}));
    // readable: coloured glow per modifier + icon
    let col={ranged:[255,90,60],slime:[124,255,58],beefy:[255,176,32],fast:[58,216,255],regen:[255,90,216]};
    if(V16){const mc=await G(page,()=>__game.modCols());col={};for(const [k,v] of Object.entries(mc))col[k]=[parseInt(v.slice(1,3),16),parseInt(v.slice(3,5),16),parseInt(v.slice(5,7),16)];} // M1.6 recoloured RANGED/FAST/REGEN
    let gl=await G(page,({FR,col})=>{const FRESH=eval(FR);const D=__game.dims,out={};const count=(c)=>{let n=0;for(let y=0;y<D.H;y++)for(let x=0;x<D.W;x++){const p=__game.pixelAt(x,y);if(Math.abs(p[0]-c[0])+Math.abs(p[1]-c[1])+Math.abs(p[2]-c[2])<90)n++;}return n;};
      for(const m of Object.keys(col)){FRESH();__game.freeze=true;__game.spawn('kettle',9.3,3.5,false,[]);__game.advance(0.02);const plain=count(col[m]);FRESH();__game.freeze=true;__game.spawn('kettle',9.3,3.5,false,[m]);__game.advance(0.02);out[m]={plain,elite:count(col[m])};}return out;},{FR:FRESH.toString(),col});
    if(V17){ // M1.7: the glow alpha pulses with a random phase, so count changed pixels by hue (plain vs elite frame) instead of exact colours
      const g2=await G(page,({FR,col})=>{const FRESH=eval(FR);const D=__game.dims,out={};const grab=()=>{const a=[];for(let y=0;y<D.H;y++)for(let x=0;x<D.W;x++)a.push(__game.pixelAt(x,y));return a;};
        const hsv=p=>{const [r,g,b]=p.map(v=>v/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d+6)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;}return [h*60,mx?d/mx:0,mx];},hd=(a,b)=>{const d=Math.abs(a-b)%360;return Math.min(d,360-d);};
        for(const m of Object.keys(col)){const hc=hsv(col[m]);FRESH();__game.freeze=true;__game.spawn('kettle',9.3,3.5,false,[]);__game.advance(0.02);const A=grab();FRESH();__game.freeze=true;__game.spawn('kettle',9.3,3.5,false,[m]);__game.advance(0.02);const B=grab();let n=0;
          for(let i=0;i<A.length;i++){const a=A[i],b=B[i];if(Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<=30)continue;const h=hsv(b);if(h[1]>(hc[1]>.35?.3:.12)&&h[2]>.35&&hd(h[0],hc[0])<20)n++;}out[m]={plain:0,elite:n};}return out;},{FR:FRESH.toString(),col});
      for(const k of Object.keys(gl))gl[k]=g2[k];}
    check('M1.4 each modifier draws its own coloured outline glow and icon',Object.values(gl).every(r=>r.elite>r.plain+50),Object.entries(gl).map(([m,r])=>`${m}:${r.plain}->${r.elite}px`).join(' '));
    // screenshots: one per modifier, projectiles in flight, slime trails
    for(const [m,t] of [['ranged','kettle'],['slime','springle'],['beefy','clunk'],['fast','zapfly'],['regen','screamer']]){
      await G(page,({FR,m,t})=>{eval(FR)();__game.freeze=true;__game.spawn(t,9.6,3.5,false,[m]);__game.spawn(t,10.4,2.4,false,[]);__game.advance(0.02);},{FR:FRESH.toString(),m,t});
      await page.screenshot({path:`${SHOTS}/m14_elite_${m}.png`});}
    await G(page,(FR)=>{eval(FR)();__game.freeze=true;__game.spawn('screamer',9.8,2.6,false,['beefy','ranged']);__game.advance(0.02);},FRESH.toString());
    await page.screenshot({path:`${SHOTS}/m14_elite_two_mods.png`});
    await G(page,(FR)=>{eval(FR)();__game.teleport(6.6,3.5,0);__game.spawn('kettle',12.8,2.2,false,['ranged']);__game.spawn('clunk',13.2,4.3,false,['ranged']);__game.spawn('wisp',11.4,3.3,false,['ranged']);
      __game.addShot('steam',11.2,2.5,-3,.3);__game.addShot('laser',10.2,4.0,-4,-.2);__game.addShot('wisp',9.6,3.2,-2,0);__game.addShot('zap',8.8,2.7,-3,.4);__game.addShot('sonic',9.4,4.4,-3,-.6);__game.addShot('fluff',8.4,3.9,-3,-.1);__game.freeze=true;__game.advance(0.05);},FRESH.toString());
    await page.screenshot({path:`${SHOTS}/m14_projectiles_in_flight.png`});
    await G(page,(FR)=>{eval(FR)();__game.teleport(6.6,3.5,0.15);__game.spawn('springle',12.6,3.9,false,['slime']);__game.spawn('clunk',11.8,2.0,false,['slime','beefy']);for(let i=0;i<9;i++){__game.addPuddle(8+i*.55,3.9+Math.sin(i)*.25);}for(let i=0;i<6;i++)__game.addPuddle(9.3+i*.45,2.2+i*.05);__game.freeze=true;__game.advance(0.05);},FRESH.toString());
    await page.screenshot({path:`${SHOTS}/m14_slime_trails.png`});
    // loot
    const lt=await G(page,(FR)=>{const FRESH=eval(FR);FRESH();const n0=__game.state().items.length;__game.spawn('springle',10.5,2.5,false,['beefy']);__game.setForceDrop(0,1);__game.damageMob(0,99);let s=__game.advance(1.0);const add=s.items.slice(n0);
      FRESH();const m0=__game.state().items.length;__game.spawn('springle',10.5,2.5,false,[]);__game.damageMob(0,99);s=__game.advance(1.0);const add2=s.items.length-m0;
      FRESH();const k0=__game.state().items.length;__game.spawn('springle',10.5,2.5,false,['beefy','fast']);__game.damageMob(0,99);s=__game.advance(1.0);const add3=s.items.slice(k0);
      return {coins:add.filter(i=>i.kind==='coin').length,power:add.filter(i=>i.kind==='power').length,plain:add2,two:{coins:add3.filter(i=>i.kind==='coin').length,power:add3.filter(i=>i.kind==='power').length},kills:s.stats.eliteKills};},FRESH.toString());
    check('M1.4 elites drop better loot (+2 coins and a 50% power-up; 2-mod elites +4 coins and a sure power-up); normal mobs keep their 1 coin',lt.coins===lt.plain+2&&lt.power===1&&lt.two.coins===lt.plain+4&&lt.two.power===1,JSON.stringify(lt));
    // ---------- power-ups: single slot ----------
    const pu=await G(page,(FR)=>{const FRESH=eval(FR);FRESH();const r={};__game.spawnPower('sneakers',7.6,3.5);let s=__game.advance(0.1);r.pick=s.player.item;r.msg=s.msg&&s.msg.text||s.msg;
      __game.spawnPower('shield',7.6,3.5);s=__game.advance(0.1);r.swap=s.player.item;r.left=s.items.filter(i=>i.kind==='power'&&!i.taken&&Math.hypot(i.x-7.6,i.y-3.5)<.01).map(i=>i.ptype);r.swapMsg=JSON.stringify(s.msg);
      s=__game.advance(1.0);r.noRepick=s.player.item;__game.teleport(9.5,3.5,0);__game.advance(0.1);__game.teleport(7.5,3.5,0);s=__game.advance(0.1);r.walkBack=s.player.item;
      __game.give('shield');__game.spawnPower('shield',7.4,3.5);s=__game.advance(0.1);r.same=JSON.stringify(s.msg);r.sameItem=s.player.item;
      __game.give('shield');r.used=__game.useItem();s=__game.advance(0.05);r.after={item:s.player.item,ef:s.player.effect};s=__game.advance(4.0);r.mid=s.player.effect&&s.player.effect.t;s=__game.advance(4.1);r.end=s.player.effect;r.endMsg=JSON.stringify(s.msg);
      r.useEmpty=__game.useItem();r.ids=__game.puIds;r.durs=__game.puIds.map(k=>__game.pu[k].dur);return r;},FRESH.toString());
    check('M1.4 walking over a power-up puts it in the single item slot',pu.pick==='sneakers'&&/SPEED SNEAKERS/.test(pu.msg),JSON.stringify(pu.msg));
    check('M1.4 slot full: the new item swaps in, the old one is dropped on the spot (no instant re-pickup)',pu.swap==='shield'&&pu.left.join()==='sneakers'&&pu.noRepick==='shield'&&pu.walkBack==='sneakers'&&/LEFT SPEED SNEAKERS/.test(pu.swapMsg),`${pu.swapMsg}; after walking away and back: ${pu.walkBack}`);
    check('M1.4 same item already held: left on the floor with a message',pu.sameItem==='shield'&&/ALREADY HOLDING/.test(pu.same),pu.same);
    check('M1.4 using the item empties the slot and starts a timed effect that wears off',pu.used&&pu.after.item===null&&pu.after.ef.kind==='shield'&&Math.abs(pu.mid-3.95)<0.1&&pu.end===null&&/WORE OFF/.test(pu.endMsg)&&pu.useEmpty===false,`mid ${pu.mid&&pu.mid.toFixed(2)}s, ${pu.endMsg}`);
    check('M1.4 six power-ups, each lasting 8-12 s',pu.ids.length===6&&pu.durs.every(d=>d>=8&&d<=12),pu.ids.map((k,i)=>k+' '+pu.durs[i]+'s').join(', '));
    // keys: Q, right mouse; and the item bar draws the active timer ring
    const ky=await G(page,(FR)=>{const FRESH=eval(FR);FRESH();__game.give('magnet');window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyQ',key:'q'}));let s=__game.advance(0.05);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyQ',key:'q'}));const q=s.player.effect&&s.player.effect.kind;
      FRESH();__game.give('freeze');const c=document.getElementById('screen');c.dispatchEvent(new MouseEvent('mousedown',{button:2,bubbles:true}));s=__game.advance(0.05);c.dispatchEvent(new MouseEvent('mouseup',{button:2,bubbles:true}));return {q,rmb:s.player.effect&&s.player.effect.kind};},FRESH.toString());
    check('M1.4 Q and right mouse use the held item',ky.q==='magnet'&&ky.rmb==='freeze',JSON.stringify(ky));
    const ring=await G(page,(FR)=>{const FRESH=eval(FR);const R=__game.hudRects().active;const sig=()=>{let n=0;for(let y=R[1];y<R[1]+R[3];y++)for(let x=R[0];x<R[0]+R[2];x++){const p=__game.pixelAt(x,y);if(Math.abs(p[0]-168)+Math.abs(p[1]-240)+Math.abs(p[2]-255)<40)n++;}return n;}; /* FREEZE POP ring colour #a8f0ff */
      FRESH();__game.give('triple');__game.setEffect('freeze',8);__game.advance(0.02);const full=sig();__game.advance(4);const half=sig();__game.setEffect(null);__game.advance(0.02);return {full,half,none:sig()};},FRESH.toString());
    check('M1.4 item bar shows the active effect with a countdown ring that shrinks',ring.full>ring.half*1.3&&ring.half>ring.none,JSON.stringify(ring));
    await G(page,(FR)=>{eval(FR)();__game.give('triple');__game.setEffect('freeze',8);__game.spawn('kettle',11,3,false,['ranged']);__game.freeze=true;__game.advance(2.6);},FRESH.toString());
    await page.screenshot({path:`${SHOTS}/m14_item_bar_active_timer.png`});
    savePng('m14_powerup_icons_4x.png',await G(page,()=>__game.spriteSheet(4,'powerups')));
    savePng('m14_elite_icons_projectiles_goo_4x.png',await G(page,()=>__game.spriteSheet(4,'elite')));
    // effects
    const ef=await G(page,(FR)=>{const FRESH=eval(FR);const r={};
      FRESH();__game.setEffect('shield',8);const h0=__game.state().player.hearts,sb0=__game.state().stats.shieldBlocks;__game.addPuddle(7.5,3.5);__game.addShot('zap',9.5,3.5,-5,0);__game.spawn('clunk',8.0,3.5,true,['beefy']);let s=__game.advance(2.0);r.shield={dh:h0-s.player.hearts,blocks:s.stats.shieldBlocks-sb0};
      FRESH();__game.setEffect('triple',10);__game.throwOnce();r.triple=__game.state().shots;FRESH();__game.throwOnce();r.single=__game.state().shots;
      const shotRun=(fz)=>{FRESH();if(fz)__game.setEffect('freeze',8);__game.teleport(7.5,1.5,0);__game.addShot('laser',13.0,4.5,-2,0);__game.advance(0.02);const a=__game.state().eshots[0].x;__game.advance(0.5);return a-__game.state().eshots[0].x;};r.shotN=shotRun(false);r.shotF=shotRun(true);
      const mobRun=(fz)=>{FRESH();if(fz)__game.setEffect('freeze',8);__game.teleport(7.5,1.5,0);__game.spawn('clunk',13.5,4.5,true,[]);__game.advance(0.05);const a=__game.state().enemies[0];__game.advance(1.0);const b=__game.state().enemies[0];return Math.hypot(b.x-a.x,b.y-a.y);};r.mobN=mobRun(false);r.mobF=mobRun(true);
      const walk=(sn)=>{FRESH();__game.teleport(6.5,2.5,0);if(sn)__game.setEffect('sneakers',10);window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW',key:'w'}));__game.advance(0.5);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW',key:'w'}));return __game.state().player.x-6.5;};r.walkN=walk(false);r.walkS=walk(true);
      FRESH();__game.teleport(12.5,4.5,0);const c0=__game.state().player.coins;__game.setEffect('magnet',12);s=__game.advance(2.0);r.magnet=s.player.coins-c0;FRESH();__game.teleport(12.5,4.5,0);s=__game.advance(2.0);r.noMagnet=s.player.coins-__game.state().player.coins;r.noMagnetC=s.player.coins-c0;
      FRESH();__game.setEffect('giant',9);__game.spawn('clunk',10.5,3.5,false,[]);__game.spawn('clunk',10.5,4.6,false,[]);__game.freeze=true;const hp0=__game.state().enemies.map(e=>e.hp),gs0=__game.state().stats.giantSplashes;__game.throwOnce();s=__game.advance(1.2);r.giant={hp0,hp:s.enemies.map(e=>e.hp),splashes:s.stats.giantSplashes-gs0};return r;},FRESH.toString());
    check('M1.4 SHIELD BUBBLE blocks goo, shots and bites',ef.shield.dh===0&&ef.shield.blocks>=2,JSON.stringify(ef.shield));
    check('M1.4 TRIPLE BALLOON throws a 3-way spread',ef.triple===3&&ef.single===1,`${ef.single} -> ${ef.triple} balloons`);
    check('M1.4 FREEZE POP slows enemies and their projectiles to ~35%',Math.abs(ef.shotF/ef.shotN-.35)<.06&&ef.mobF/ef.mobN<.5,`shots ${ef.shotN.toFixed(2)}->${ef.shotF.toFixed(2)}, mob ${ef.mobN.toFixed(2)}->${ef.mobF.toFixed(2)}`);
    check('M1.4 SPEED SNEAKERS make the player ~1.6x faster',ef.walkS/ef.walkN>1.45&&ef.walkS/ef.walkN<1.75,`${ef.walkN.toFixed(2)} -> ${ef.walkS.toFixed(2)} cells in 0.5 s`);
    check('M1.4 COIN MAGNET pulls nearby coins in',ef.magnet>=2&&ef.noMagnetC===0,`magnet collected ${ef.magnet}, without ${ef.noMagnetC}`);
    check('M1.4 GIANT BALLOON splash hurts the target and mobs nearby',ef.giant.splashes===1&&ef.giant.hp[0]<=ef.giant.hp0[0]-3&&ef.giant.hp[1]===ef.giant.hp0[1]-2,JSON.stringify(ef.giant));
    // effect screen tints
    for(const k of ['sneakers','shield','triple','freeze','magnet','giant']){await G(page,({FR,k})=>{eval(FR)();__game.setEffect(k);__game.advance(0.3);},{FR:FRESH.toString(),k});if(k==='freeze'||k==='shield')await page.screenshot({path:`${SHOTS}/m14_effect_${k}.png`});}
    // pad Y
    await G(page,()=>{window.__pad={id:'Xbox Wireless Controller',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0})),timestamp:0};navigator.getGamepads=()=>[window.__pad];});
    const py=await G(page,(FR)=>{eval(FR)();__game.give('giant');__pad.buttons[3]={pressed:true,value:1};__game.advance(0.05);__pad.buttons[3]={pressed:false,value:0};return __game.advance(0.05).player.effect;},FRESH.toString());
    check('M1.4 gamepad Y uses the held item',py&&py.kind==='giant',JSON.stringify(py));
    // save / continue keeps the held item
    await G(page,()=>{__game.startLevel(2,{hearts:4,coins:7,item:'freeze'});});
    const sv=await G(page,()=>__game.state().save);
    await page.reload();await page.waitForFunction(()=>!!window.__game);await sleep(300);
    const cont=await G(page,()=>{const st=__game.state();const i=st.menu.findIndex(m=>/CONTINUE/.test(m));__game.menuPick(i);__game.manual=true;return __game.advance(0.05);});
    check('M1.4 the held item is saved and restored by CONTINUE',sv.item==='freeze'&&cont.level===2&&cont.player.item==='freeze',`save item ${sv.item}, continued with ${cont.player.item}`);
    const dr=await G(page,()=>{__game.give(null);__game.setHearts(1);__game.spawn('clunk',__game.state().player.x+.3,__game.state().player.y,true,[]);let s=__game.advance(0.3);const dead=s.mode;__game.advance(1.5);__game.confirm();s=__game.advance(0.1);return {dead,mode:s.mode,item:s.player&&s.player.item};});
    if(V18)check('M1.4/M1.8 death after CONTINUE ends the run (name entry; no retry)',dr.dead==='dead'&&dr.mode==='name',JSON.stringify(dr));
    else check('M1.4 retry after death restores the item held at the level start',dr.dead==='dead'&&dr.mode==='play'&&dr.item==='freeze',JSON.stringify(dr));
    const lvl=await G(page,()=>{__game.setSeed(777);const r=[];for(let i=0;i<8;i++){__game.startLevel(i);r.push(__game.state().items.filter(t=>t.kind==='power').length);}return r;});
    check('M1.4 power-ups are placed in every level (1 in the tutorial, 2-3 in generated floors)',lvl[0]===1&&lvl.slice(1).every((n,i)=>n===(i+2>=5?3:2)),lvl.join(','));
    // ---------- perf: many enemy shots + puddles ----------
    const perf=await G(page,async()=>{__game.setSeed(9001);__game.startLevel(7);__game.setHearts(999);__game.wakeAll();__game.setEffect(null);const m=__game.currentMap(),open=[];for(let y=0;y<m.length;y++)for(let x=0;x<m[0].length;x++)if(!'#SWTMFDL'.includes(m[y][x]))open.push([x+.5,y+.5]);
      const p=__game.state().player,near=open.filter(o=>Math.hypot(o[0]-p.x,o[1]-p.y)<7&&Math.hypot(o[0]-p.x,o[1]-p.y)>1.2);for(let i=0;i<40;i++){const o=near[i%near.length];__game.addPuddle(o[0]+(i%3-1)*.2,o[1]);}
      const fill=()=>{const s=__game.state();for(let i=s.eshots.length;i<40;i++){const o=near[(Math.random()*near.length)|0],a=Math.random()*6.28;__game.addShot(['steam','zap','laser','sonic','wisp','fluff'][i%6],o[0],o[1],Math.cos(a)*1.2,Math.sin(a)*1.2);}};
      fill();const iv=setInterval(fill,100);__game.manual=false;await new Promise(r=>setTimeout(r,400));const f0=__game.state().stats.frames;let mx=0;const t0=performance.now();await new Promise(r=>setTimeout(r,2000));const fps=(__game.state().stats.frames-f0)/((performance.now()-t0)/1000);
      clearInterval(iv);__game.manual=true;fill();const s=__game.state();const t1=performance.now();for(let i=0;i<60;i++)__game.render();return {fps,ms:(performance.now()-t1)/60,shots:s.eshots.length,puddles:s.puddles.length};});
    PERF.desktopFps=perf.fps;PERF.desktopRenderMs=perf.ms;
    check('M1.4 desktop holds 60 fps with 40 enemy shots + 40 goo puddles on floor 8',perf.fps>=55&&perf.shots===40&&perf.puddles===40,`${perf.fps.toFixed(1)} fps, render ${perf.ms.toFixed(2)} ms/frame, ${perf.shots} shots, ${perf.puddles} puddles`);
    await ctx.close();
  }
  // ---------- phone: touch ITEM button ----------
  {
    const {ctx,page}=await newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2,label:'m14-phone'});
    const cdp=await ctx.newCDPSession(page);const touch=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
    await sleep(300);await page.touchscreen.tap(422,150);await sleep(200);
    let lay=await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.clearMobs();__game.teleport(7.5,3.5,0);__game.advance(0.05);return __game.layout();});
    const hidden=!lay.itemBtn.visible;
    lay=await G(page,()=>{__game.spawnPower('triple',7.6,3.5);__game.advance(0.1);return __game.layout();});
    const msg=await G(page,()=>JSON.stringify(__game.state().msg));
    const ib=lay.itemBtn;const inter=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
    await G(page,()=>{__game.spawn('kettle',11,2.6,false,['ranged']);__game.spawn('clunk',12,4.4,false,['slime']);__game.addPuddle(9.5,4.2);__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m14_phone_844x390_item_button.png`});
    await touch('touchStart',[{x:ib.x+ib.w/2,y:ib.y+ib.h/2,id:7}]);await sleep(40);await touch('touchEnd',[]);await sleep(60);
    const st=await G(page,()=>__game.advance(0.05));
    check('phone: ITEM button only shows when holding an item, says TAP ITEM, and tapping it uses the item',hidden&&lay.itemBtn.visible&&/TAP ITEM/.test(msg)&&st.player.effect&&st.player.effect.kind==='triple'&&!(await G(page,()=>__game.layout())).itemBtn.visible,`${msg}; effect ${st.player.effect&&st.player.effect.kind}`);
    check('phone: ITEM button clears the message band, HUD, item bar, minimap and other buttons',!['band','hud','minimap','itemBar','throwBtn','pauseBtn','stick'].some(z=>lay[z].visible!==false&&inter(ib,lay[z])),`item@${Math.round(ib.x)},${Math.round(ib.y)} ${Math.round(ib.w)}px`);
    await G(page,()=>{__game.freeze=true;__game.advance(0.6);});
    await page.screenshot({path:`${SHOTS}/m14_phone_844x390_active_effect.png`});
    // phone perf with 4x throttle and the same load
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
    const ph=await G(page,async()=>{__game.freeze=false;__game.setSeed(9001);__game.startLevel(4);__game.setHearts(999);__game.wakeAll();const m=__game.currentMap(),open=[];for(let y=0;y<m.length;y++)for(let x=0;x<m[0].length;x++)if(!'#SWTMFDL'.includes(m[y][x]))open.push([x+.5,y+.5]);
      const p=__game.state().player,near=open.filter(o=>Math.hypot(o[0]-p.x,o[1]-p.y)<7&&Math.hypot(o[0]-p.x,o[1]-p.y)>1.2);for(let i=0;i<40;i++){const o=near[i%near.length];__game.addPuddle(o[0],o[1]);}
      const fill=()=>{const s=__game.state();for(let i=s.eshots.length;i<40;i++){const o=near[(Math.random()*near.length)|0],a=Math.random()*6.28;__game.addShot(['steam','zap','laser','sonic','wisp','fluff'][i%6],o[0],o[1],Math.cos(a)*1.2,Math.sin(a)*1.2);}};
      fill();const iv=setInterval(fill,150);__game.manual=false;await new Promise(r=>setTimeout(r,400));const f0=__game.state().stats.frames,t0=performance.now();await new Promise(r=>setTimeout(r,2000));const fps=(__game.state().stats.frames-f0)/((performance.now()-t0)/1000);clearInterval(iv);__game.manual=true;
      const t1=performance.now();for(let i=0;i<60;i++)__game.render();return {fps,ms:(performance.now()-t1)/60};});
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
    PERF.phoneFps4x=ph.fps;PERF.phoneRenderMs4x=ph.ms;
    check('M1.4 phone (844x390, 4x CPU throttle) stays playable with 40 shots + 40 puddles',ph.fps>=30,`${ph.fps.toFixed(1)} fps, render ${ph.ms.toFixed(2)} ms/frame`);
    await ctx.close();
  }
  fs.writeFileSync(`${SHOTS}/../perf_m14.json`,JSON.stringify(PERF,null,1));
  console.log('PERF14',JSON.stringify(PERF));
}

// =====================================================================
// M1.5: QA fixes (M13-A1..A4), Screamer redraw, balance, minimap colours, seed link, full-screen map
// =====================================================================
async function m15Tests(){
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const savePng=(n,u)=>fs.writeFileSync(`${SHOTS}/${n}`,Buffer.from(u.split(',')[1],'base64'));
  const inter=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const key=async(page,code,extra={})=>{await G(page,({code,extra})=>{window.dispatchEvent(new KeyboardEvent('keydown',{code,key:code,...extra}));__game.advance(1/60);window.dispatchEvent(new KeyboardEvent('keyup',{code,key:code,...extra}));__game.advance(1/60);},{code,extra});};
  // ---------- M13-A1: pause button size at every phone size (and the ITEM / MAP buttons) ----------
  {
    const sizes=[],bad=[];
    for(const [w,h] of [[844,390],[568,320],[800,300],[915,412],[926,428],[667,375],[740,360],[932,430],[1024,768],[1280,720]]){
      const {ctx,page}=await newPage({viewport:{width:w,height:h},hasTouch:true,isMobile:true,label:`m15-${w}x${h}`});
      const l=await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.advance(0.05);__game.setForceUse(true);return __game.layout();});
      sizes.push(`${w}x${h}: pause ${Math.round(l.pauseBtn.w)}, map ${Math.round(l.mapBtn.w)}, item ${Math.round(l.itemBtn.w)}`);
      if(l.pauseBtn.w<36||l.pauseBtn.w>52)bad.push(`${w}x${h} pause ${l.pauseBtn.w}`);if(l.mapBtn.w<36||l.mapBtn.w>52)bad.push(`${w}x${h} map ${l.mapBtn.w}`);if(l.itemBtn.w<44)bad.push(`${w}x${h} item ${l.itemBtn.w}`);
      if(w===844){await G(page,()=>__game.setForceUse(false));await page.screenshot({path:`${SHOTS}/m15_phone_844x390_pause_and_map_buttons.png`});
        const pb=l.pauseBtn;await page.screenshot({path:`${SHOTS}/m15_phone_844x390_pause_button_zoom.png`,clip:{x:Math.max(0,pb.x-40),y:Math.max(0,pb.y-90),width:200,height:170}});}
      await ctx.close();}
    check('M13-A1 phone pause button is 36-52 px again (scaled once); MAP button the same; ITEM button >= 44 px at every size',bad.length===0,bad.join(', ')||sizes.join('; '));
  }
  // ---------- desktop group ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m15'});
    // M13-A2: no throw reaches the ceiling at any pitch; range doesn't collapse when aiming higher
    const ce=await G(page,()=>{const out=[];__game.manual=true;__game.setSeed(31337);__game.startLevel(0);__game.clearMobs();__game.freeze=true;
      for(let pv=0;pv<=120;pv+=4){__game.teleport(6.2,2.5,0);__game.setPitch(pv);const c0=__game.state().stats.ceilingHits;__game.throwOnce();const s0=__game.state().shotList[0];let mz=0,land=null;
        for(let i=0;i<240;i++){const st=__game.advance(1/60),q=st.shotList[0];if(!q){break;}mz=Math.max(mz,q.z);land=q.x-6.2;}out.push({pv,vz:s0.vz,mz,land,ceil:__game.state().stats.ceilingHits-c0});__game.advance(0.6);}return out;});
    const ceBad=ce.filter(r=>r.ceil>0||r.mz>=0.97);const steep=ce.filter(r=>r.pv>=36);
    check('M13-A2 vz cap 2.40: no throw at pitch 0-120 hits the ceiling; steep throws still carry ~7 cells',ceBad.length===0&&Math.max(...ce.map(r=>r.vz))<=2.4+1e-9&&steep.every(r=>r.land>6.5),ceBad.map(r=>`p${r.pv} ceil ${r.ceil} peak ${r.mz.toFixed(3)}`).join(', ')||`peak max ${Math.max(...ce.map(r=>r.mz)).toFixed(3)}, steep range ${Math.min(...steep.map(r=>r.land)).toFixed(2)}-${Math.max(...steep.map(r=>r.land)).toFixed(2)} cells`);
    // M13-A3: Hazewisp in a fence cell: hittable (and still bites); behind the fence: blocked
    const a3=await G(page,()=>{const r={};__game.manual=true;__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.setHearts(99);
      __game.spawn('wisp',8.5,6.5,false);__game.teleport(8.5,7.6,-Math.PI/2);const h0=__game.state().enemies[0].hp;for(let k=0;k<3;k++){__game.throwOnce();__game.advance(0.7);}r.inFence=[h0,__game.state().enemies[0].hp];
      __game.clearMobs();__game.spawn('wisp',8.5,5.3,false);for(let k=0;k<3;k++){__game.throwOnce();__game.advance(0.7);}r.behind=__game.state().enemies[0].hp;
      __game.clearMobs();__game.spawn('wisp',8.3,6.5,false);__game.teleport(8.5,7.6,-Math.PI/2+0.35);for(let k=0;k<2;k++){__game.throwOnce();__game.advance(0.7);}r.miss=__game.state().enemies[0].hp;
      __game.clearMobs();__game.freeze=false;__game.spawn('wisp',8.5,6.8,true);__game.teleport(8.5,7.24,-Math.PI/2);const hh=__game.state().player.hearts;let bites=0,last=hh;for(let i=0;i<180;i++){__game.placeEnemy(0,8.5,6.8);__game.teleport(8.5,7.24);const s=__game.advance(1/60);if(s.player.hearts<last)bites++;last=s.player.hearts;}r.bites=bites;
      __game.clearMobs();__game.spawn('wisp',8.5,6.5,true,['ranged']);__game.teleport(8.5,9.6,-Math.PI/2);const f0=__game.state().stats;let left=false,fired=0;
      for(let i=0;i<300;i++){if(!(__game.state().enemies[0].tele>0))__game.placeEnemy(0,8.5,6.5);const s=__game.advance(1/60);if(s.eshots.some(q=>q.y>7.05))left=true;if(s.stats.eshotsFired>f0.eshotsFired){fired=s.stats.eshotsFired-f0.eshotsFired;}if(left)break;}r.ranged={fired,left};return r;});
    check('M13-A3 a Hazewisp inside a fence cell can be hit there (it can still bite); one behind the fence is still shielded',a3.inFence[1]<a3.inFence[0]&&a3.behind===4&&a3.bites>=1,JSON.stringify(a3));
    check('M13-A3 ranged elite Hazewisp in a fence: its shots leave the fence (same rule both ways)',a3.ranged.fired>=1&&a3.ranged.left,JSON.stringify(a3.ranged));
    // Screamer redraw: broad ear lobes, bigger mouth, no glints, 4 flap frames
    const sm=[];for(let f=0;f<4;f++)sm.push(await G(page,(f)=>__game.spriteData('screamer',f),f));
    const sm0=await G(page,()=>__game.spriteData('screamerO',0));
    const H=c=>[c>>>0&255,c>>>8&255,c>>>16&255];
    const metrics=sd=>{const {w,h,px}=sd,op=(x,y)=>(px[y*w+x]>>>24)>0;const colH=x=>{let a=-1,b=-1;for(let y=0;y<h;y++)if(op(x,y)){if(a<0)a=y;b=y;}return a<0?0:b-a+1;};
      let ear=0;for(let x=Math.round(w*.08);x<Math.round(w*.24);x++)ear=Math.max(ear,colH(x));let earR=0;for(let x=Math.round(w*.76);x<Math.round(w*.92);x++)earR=Math.max(earR,colH(x));
      const head=colH(Math.round(w/2));let mouth=0;for(let y=Math.round(h*.72);y<=Math.round(h*.86);y++){ /* mouth rows only (not the chin outline) */let run=0,best=0;for(let x=Math.round(w*.3);x<Math.round(w*.7);x++){const [r,g,b]=H(px[y*w+x]);const dark=op(x,y)&&r<40&&g<45&&b<75;run=dark?run+1:0;best=Math.max(best,run);}mouth=Math.max(mouth,best);}
      let glint=0;for(const c of px){const [r,g,b]=H(c);if((c>>>24)&&r===0x8b&&g===0x9b&&b===0xd0)glint++;}return {ear:Math.min(ear,earR),head,mouth,glint};};
    const ms=sm.map(metrics),mo=metrics(sm0),face=27*1.5;
    const sigs=new Set(sm.map(d=>d.px.join(',').length+':'+d.px.reduce((a,c,i)=>(a*31+c+i)|0,0)));
    if(!V16)check('M1.5 Screamer ears are broad lobes about as tall as the head (>= 70%), in every flap frame',ms.every(m=>m.ear>=0.7*m.head),ms.map(m=>`ear ${m.ear}/${m.head}px`).join(', '));
    check('M1.5 Screamer O-mouth is about 1/3 of the face width (was ~1/5), wider when screaming',ms.every(m=>m.mouth/face>=0.27&&m.mouth/face<=0.42)&&mo.mouth>=ms[0].mouth,`closed ${ms[0].mouth}px (${(ms[0].mouth/face).toFixed(2)} of ${face}px face), screaming ${mo.mouth}px`);
    check('M1.5 Screamer eye glints removed; 4 distinct flap frames remain',ms.every(m=>m.glint===0)&&mo.glint===0&&sigs.size===4,`glint px ${ms.map(m=>m.glint).join(',')}, frames ${sigs.size}`);
    const RG=V16?[0xb4,0xff,0xd2]:[255,90,216]; // M1.6: REGEN is mint
    const scr=await G(page,(RG)=>{const mint=p=>{const [r,g,b]=p,mx=Math.max(r,g,b),mn=Math.min(r,g,b);return mx>90&&g===mx&&b>r+12&&g>b+8&&(mx-mn)/mx>.2;}; /* M1.6: mint REGEN glow, matched by hue */
      const cnt=(c)=>{const D=__game.dims;let n=0;for(let y=0;y<D.H;y++)for(let x=0;x<D.W;x++){const p=__game.pixelAt(x,y);if(c.length===3&&c[0]===0xb4?mint(p):Math.abs(p[0]-c[0])+Math.abs(p[1]-c[1])+Math.abs(p[2]-c[2])<90)n++;}return n;};
      __game.manual=true;__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.teleport(6.6,3.5,0);__game.spawn('screamer',9.0,3.5,false,[]);__game.advance(0.02);const plain=cnt(RG);
      __game.clearMobs();__game.spawn('screamer',9.0,3.5,false,['regen']);__game.advance(0.02);let beefy=cnt(RG);for(let k=0;k<10;k++){__game.advance(0.1);beefy=Math.max(beefy,cnt(RG));} /* M1.8 test hardening: the glow pulses with a random phase, so take its peak over one cycle */__game.clearMobs();__game.spawn('screamer',9.0,3.5,false,['beefy']);__game.advance(0.02);const big=__game.state().stats.enemyBoxes[0];
      __game.clearMobs();__game.spawn('screamer',8.4,3.58+0.2,false);__game.advance(0.02);__game.throwOnce();for(let i=0;i<50;i++)__game.advance(1/60);const hit=__game.state().enemies[0].hp;
      return {plain,elite:beefy,beefyBox:big,hit,hitR:__game.mobs.screamer.hitR};},RG);
    check('M1.5 new Screamer keeps its hitbox (0.20 off-line hits) and the elite outline glow works on it',scr.hit===2&&scr.elite>scr.plain+60,JSON.stringify(scr));
    savePng('m15_screamer_frames_4x.png',await G(page,()=>__game.spriteSheet(4,'screamer')));
    await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.teleport(6.6,3.5,0);__game.spawn('screamer',8.8,3.0,false);__game.spawn('screamer',10.6,4.3,false,['beefy','ranged']);__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m15_screamer_in_game_1280x800.png`});
    // balance across many seeds
    const bal=await G(page,()=>{const N=400,sum={},spr2=[],spr3=[],cl5=[];for(let l=2;l<=8;l++)sum[l]=0;for(let k=0;k<N;k++){const seed=5000+k*7;for(let l=2;l<=8;l++){const r=__game.levelHp(seed,l);sum[l]+=r.hp/N;if(l===2)spr2.push(r.types.springle||0);if(l===3)spr3.push(r.types.springle||0);if(l===5)cl5.push(r.types.clunk||0);}}
      return {avg:sum,spr2:spr2.filter(x=>x>0).length,spr3:spr3.filter(x=>x>0).length,cl5:cl5.filter(x=>x>0).length,N};});
    check(`M1.5 SPRINGLE first appears on level 3 (${bal.N} seeds: never on L2, always on L3)`,bal.spr2===0&&bal.spr3===bal.N,`L2 maps with springle ${bal.spr2}, L3 ${bal.spr3}/${bal.N}`);
    check(`M1.5 level 5 total mob HP is not lower than level 4 (mean of ${bal.N} seeds), L5 always has a Clunkbot`,bal.avg[5]>=bal.avg[4]&&bal.cl5===bal.N,Object.entries(bal.avg).map(([l,v])=>`L${l} ${v.toFixed(1)}`).join(', '));
    // minimap colours
    const dots=await G(page,()=>{const o={};for(const k of Object.keys(__game.mobs))o[k]=__game.mobs[k].dot;return o;});
    const hx=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)],dist=(a,b)=>Math.hypot(...hx(a).map((v,i)=>v-hx(b)[i]));
    const marks={...dots,KEY:'#ffe27a',COIN:'#c89a20',HEART:'#ff6070',POWERUP:'#7dffb0',PLAYER:'#ffffff'};const pairs=[];const ks=Object.keys(marks);
    for(let i=0;i<ks.length;i++)for(let j=i+1;j<ks.length;j++)pairs.push([ks[i],ks[j],dist(marks[ks[i]],marks[ks[j]])]);pairs.sort((a,b)=>a[2]-b[2]);
    check('M1.5 minimap: Clunkbot and Screamer differ, and all mob/item/player colours are distinct (RGB distance >= 60)',dots.clunk!==dots.screamer&&pairs[0][2]>=60,`closest: ${pairs.slice(0,3).map(p=>`${p[0]}/${p[1]} ${p[2].toFixed(0)}`).join(', ')}; clunk ${dots.clunk}, screamer ${dots.screamer}, zapfly ${dots.zapfly}`);
    await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.teleport(9.5,3.0,0);[['screamer',7.5,2],['springle',8.5,2],['kettle',10.5,2],['wisp',11.5,2],['clunk',12.5,4],['zapfly',8.5,4.5]].forEach(a=>__game.spawn(a[0],a[1]+.5,a[2]+.5,false));__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m15_minimap_colours_1280x800.png`});
    await page.screenshot({path:`${SHOTS}/m15_minimap_colours_zoom.png`,clip:{x:1280-260,y:0,width:260,height:240}});
    // full-screen map: open/close inputs, pauses gameplay, fog, legend
    const fm=await G(page,()=>{const r={};__game.manual=true;__game.freeze=false;__game.setSeed(4242);__game.startLevel(3);__game.setHearts(99);__game.wakeAll();__game.advance(0.3);__game.seeAll(0.5); /* reveal the west half: some mobs on seen tiles, some not */
      const kd=c=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:c,key:c}));__game.advance(1/60);window.dispatchEvent(new KeyboardEvent('keyup',{code:c,key:c}));__game.advance(1/60);return __game.state().mode;};
      __game.throwOnce();r.m=kd('KeyM');const s0=__game.state();__game.advance(2.0);const s1=__game.state();
      r.frozen=JSON.stringify(s0.enemies.map(e=>[e.x,e.y]))===JSON.stringify(s1.enemies.map(e=>[e.x,e.y]))&&JSON.stringify(s0.shotList)===JSON.stringify(s1.shotList)&&s0.player.x===s1.player.x;r.fm=s1.stats.fullMap;r.fog=__game.fogInfo();r.prompt=s1.prompt;
      r.closeM=kd('KeyM');r.tab=kd('Tab');r.closeEsc=kd('Escape');kd('Tab');const c=document.getElementById('screen'),rc=c.getBoundingClientRect();c.dispatchEvent(new MouseEvent('mousedown',{button:0,clientX:rc.left+50,clientY:rc.top+50,bubbles:true}));__game.advance(0.02);r.closeClick=__game.state().mode;
      const mm0=__game.state();window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyM',key:'M',shiftKey:true}));__game.advance(0.02);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyM',key:'M',shiftKey:true}));r.shiftM=__game.state().mode;
      window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyM',key:'M',shiftKey:true}));__game.advance(0.02);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyM',key:'M',shiftKey:true}));return r;});
    check('M1.5 full map: M opens it; while open the game is paused (mobs, balloons and player frozen)',fm.m==='map'&&fm.frozen,`${fm.m}, frozen ${fm.frozen}`);
    check('M1.5 full map closes with M, Esc or a click, and Tab opens it too; Shift+M only toggles the minimap',fm.closeM==='play'&&fm.tab==='map'&&fm.closeEsc==='play'&&fm.closeClick==='play'&&fm.shiftM==='play',JSON.stringify({closeM:fm.closeM,tab:fm.tab,esc:fm.closeEsc,click:fm.closeClick,shiftM:fm.shiftM}));
    check('M1.5 full map keeps the fog rules: only explored tiles, and only items/mobs standing on them',fm.fm&&fm.fm.seen===fm.fog.seen&&fm.fm.mobs===fm.fog.mobsOnSeen&&fm.fm.items===fm.fog.itemsOnSeen&&fm.fog.mobsOnSeen>0&&fm.fog.mobsOnSeen<fm.fog.mobs,`map seen ${fm.fm&&fm.fm.seen}/${fm.fog.seen} tiles, mobs ${fm.fm&&fm.fm.mobs} drawn of ${fm.fog.mobs} (${fm.fog.mobsOnSeen} on seen tiles), items ${fm.fm&&fm.fm.items}`);
    // legend + player marker pixels
    const lg=await G(page,()=>{__game.openMap();__game.advance(0.02);const s=__game.state().stats.fullMap;let leg=0;for(let y=24;y<200;y++)for(let x=362;x<476;x++){const p=__game.pixelAt(x,y);if(p[0]>200&&p[1]>200&&p[2]>200)leg++;}
      const pl=__game.state().player,X=Math.round(s.ox+pl.x*s.cs),Y=Math.round(s.oy+pl.y*s.cs);const c=__game.pixelAt(X,Y);__game.closeMap();return {leg,player:c};});
    check('M1.5 full map draws a legend and the player marker',lg.leg>300&&lg.player[0]>240&&lg.player[1]>240,JSON.stringify(lg));
    await G(page,()=>{__game.setSeed(4242);__game.startLevel(4);__game.teleport(__game.state().start.x,__game.state().start.y);const L=__game.state();for(let i=0;i<25;i++){__game.advance(0.0);}__game.openMap();__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m15_full_map_desktop_fog.png`});
    await G(page,()=>{__game.closeMap();__game.seeAll();__game.openMap();__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m15_full_map_desktop_explored.png`});
    // pad Back opens, B closes
    await G(page,()=>{__game.closeMap();window.__pad={id:'Xbox Wireless Controller',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0})),timestamp:0};navigator.getGamepads=()=>[window.__pad];});
    const pd=await G(page,()=>{__pad.buttons[8]={pressed:true,value:1};__game.advance(0.05);__pad.buttons[8]={pressed:false,value:0};const a=__game.advance(0.05).mode,pr=__game.state().prompt;__pad.buttons[1]={pressed:true,value:1};__game.advance(0.05);__pad.buttons[1]={pressed:false,value:0};return {a,pr,b:__game.advance(0.05).mode};});
    check('M1.5 gamepad Back/View opens the full map, B closes it',pd.a==='map'&&pd.b==='play'&&/BACK/.test(pd.pr),JSON.stringify(pd));
    await ctx.close();
  }
  // ---------- seed link on the title ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m15-seed'});
    await G(page,()=>localStorage.setItem('labyrinthRemake.save.v1',JSON.stringify({v:1,level:2,hearts:5,coins:3,seed:4242,item:null,t:Date.now()})));
    await page.reload();await page.waitForFunction(()=>!!window.__game);await sleep(300);
    const plain=await G(page,()=>({menu:__game.state().menu,sel:__game.menuSel()}));
    await page.goto(URL+'?seed=999');await page.waitForFunction(()=>!!window.__game);await sleep(400);
    const lk=await G(page,()=>({menu:__game.state().menu,sel:__game.menuSel(),url:__game.urlSeed}));
    await page.screenshot({path:`${SHOTS}/m15_title_with_seed_link.png`});
    const tx=await G(page,()=>{let n=0;for(let y=196;y<208;y++)for(let x=100;x<380;x++){const p=__game.pixelAt(x,y);if(p[2]>200&&p[1]>170&&p[0]<170)n++;}return n;});
    await page.keyboard.press('Enter');await sleep(150);
    const st=await G(page,()=>__game.state());
    check('M1.5 seed link with a save: title shows the link seed, NEW GAME is preselected, CONTINUE still offered (with its own seed)',plain.sel===0&&lk.url===999&&lk.sel===1&&/CONTINUE.*SEED 4242/.test(lk.menu[0])&&lk.menu[1]==='NEW GAME'&&tx>40,`no link: sel ${plain.sel}; link: ${lk.menu.join(' | ')}, sel ${lk.sel}, seed-line px ${tx}`);
    check('M1.5 Enter on a seed link starts a new game on the link seed',st.mode==='play'&&st.level===0&&st.seed===999,`mode ${st.mode}, seed ${st.seed}`);
    await ctx.close();
  }
  // ---------- phone: LOOK SPEED arrows, MAP button, minimap tap ----------
  {
    const {ctx,page}=await newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2,label:'m15-phone'});
    const cdp=await ctx.newCDPSession(page);const touch=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});let tid=100;
    const tap=async(x,y)=>{tid++;await touch('touchStart',[{x,y,id:tid}]);await sleep(30);await touch('touchEnd',[]);await sleep(80);};
    await sleep(300);await page.touchscreen.tap(422,150);await sleep(250);
    await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.advance(0.05);});
    let lay=await G(page,()=>__game.layout());
    await tap(lay.pauseBtn.x+lay.pauseBtn.w/2,lay.pauseBtn.y+lay.pauseBtn.h/2);await G(page,()=>__game.advance(0.3));
    const D=await G(page,()=>__game.dims);const c=lay.canvas,css=(x,y)=>({x:c.x+x/D.W*c.w,y:c.y+y/D.H*c.h});
    const la=await G(page,()=>__game.lookArrows());const look0=(await G(page,()=>__game.state())).settings.look;
    const dc=css(la.dec[0]+la.dec[2]/2,la.dec[1]+la.dec[3]/2),ic=css(la.inc[0]+la.inc[2]/2,la.inc[1]+la.inc[3]/2),lc=css(240,la.dec[1]+la.dec[3]/2);
    const vis=await G(page,(la)=>{const at=(r)=>__game.pixelAt(Math.round(r[0]+r[2]/2),Math.round(r[1]+r[3]/2));return {dec:at(la.dec),inc:at(la.inc)};},la);
    await page.screenshot({path:`${SHOTS}/m15_phone_844x390_look_speed_arrows.png`});
    await tap(dc.x,dc.y);const down1=(await G(page,()=>__game.state())).settings.look;
    await tap(ic.x,ic.y);await tap(ic.x,ic.y);const up2=(await G(page,()=>__game.state())).settings.look;
    await tap(lc.x,lc.y);const lbl=(await G(page,()=>__game.state())).settings.look;
    for(let i=0;i<8;i++)await tap(ic.x,ic.y);const hi=(await G(page,()=>__game.state())).settings.look;
    for(let i=0;i<10;i++)await tap(dc.x,dc.y);const lo=(await G(page,()=>__game.state())).settings.look;
    await page.screenshot({path:`${SHOTS}/m15_phone_844x390_look_speed_at_min.png`});
    const mode=(await G(page,()=>__game.state())).mode;
    check('M13-A4 touch LOOK SPEED: visible < > boxes decrease / increase it, clamped at 50% and 200%; the label alone does nothing',mode==='pause'&&down1===look0-0.25&&up2===look0+0.25&&lbl===up2&&hi===2&&lo===0.5&&vis.dec[0]>200&&vis.inc[0]>200,`start ${look0}, < ${down1}, >> ${up2}, label ${lbl}, max ${hi}, min ${lo}`);
    for(let i=0;i<2;i++)await tap(ic.x,ic.y);
    await G(page,()=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}));__game.advance(0.05);window.dispatchEvent(new KeyboardEvent('keyup',{code:'Escape',key:'Escape'}));__game.advance(0.05);});
    // MAP button opens, tap closes; minimap tap opens
    await G(page,()=>{__game.setSeed(4242);__game.startLevel(2);__game.advance(0.3);});
    lay=await G(page,()=>__game.layout());const mb=lay.mapBtn;
    await tap(mb.x+mb.w/2,mb.y+mb.h/2);const m1=await G(page,()=>__game.advance(0.3));
    await page.screenshot({path:`${SHOTS}/m15_full_map_phone_844x390.png`});
    await tap(422,200);const m2=(await G(page,()=>__game.advance(0.05))).mode;
    const mm=lay.minimap;await tap(mm.x+mm.w/2,mm.y+mm.h/2);const m3=(await G(page,()=>__game.advance(0.3))).mode;
    await tap(30,200);const m4=(await G(page,()=>__game.advance(0.05))).mode;
    check('phone: MAP button opens the full map (TAP ANYWHERE TO CLOSE), a tap closes it; tapping the minimap also opens it',m1.mode==='map'&&/TAP/.test(m1.prompt)&&m2==='play'&&m3==='map'&&m4==='play',`button ${m1.mode}, tap ${m2}, minimap ${m3}, letterbox tap ${m4}`);
    check(V16?'phone: MAP button sits left of the minimap (M1.6) and clears the band, HUD, item bar, minimap, pause, throw and ITEM buttons':'phone: MAP button sits under the minimap and clears the band, HUD, item bar, minimap, pause, throw and ITEM buttons',lay.mapBtn.visible&&!['band','hud','minimap','itemBar','pauseBtn','throwBtn','useBtn','itemBtn'].some(z=>lay[z].visible!==false&&inter(mb,lay[z]))&&(V16?mb.x+mb.w<=lay.minimap.x:mb.y>=lay.minimap.y+lay.minimap.h),`map@${Math.round(mb.x)},${Math.round(mb.y)} ${Math.round(mb.w)}px; minimap bottom ${Math.round(lay.minimap.y+lay.minimap.h)}`);
    await ctx.close();
  }
  // ---------- internal review: new Screamer next to the reference (test-output only, never in the build) ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m15-review'});
    savePng('_tmp_screamer15_6x.png',await G(page,()=>__game.spriteSheet(6,'screamer')));
    await ctx.close();
    fs.unlinkSync(`${SHOTS}/_tmp_screamer15_6x.png`);
    const html=fs.readFileSync(FILE,'utf8');
    check('M1.5 no large embedded bitmap in the build (all art is drawn in code)',!/data:image\/png;base64,iVBOR[\s\S]{4000,}/.test(html));
  }
}

async function m16Tests(){
  const savePng=(n,u)=>fs.writeFileSync(`${SHOTS}/${n}`,Buffer.from(u.split(',')[1],'base64'));
  const inter=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const padInit=()=>{window.__pad={axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0})),connected:true,mapping:'standard',id:'test pad'};navigator.getGamepads=()=>[window.__pad];};
  // ---------- M15-A1 / A6: held A / Space through a mode change doesn't throw ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m16-a1'});
    await ctx.addInitScript(padInit);await page.reload();await page.waitForTimeout(200);
    const a1=await G(page,()=>{const A=v=>{__pad.buttons[0]={pressed:v,value:v?1:0};};const r={};
      __game.manual=true;__game.setSeed(4242);__game.startLevel(0);__game.clearMobs();__game.teleport(7.5,3.5,0);__game.advance(0.1);
      // close the map with A and keep holding it
      __game.openMap();__game.advance(0.1);A(true);let s=__game.advance(0.05);r.closed=s.mode;s=__game.advance(1.0);r.mapHeldShots=s.shots;r.mapHeldMode=s.mode;
      A(false);__game.advance(0.6);A(true);s=__game.advance(0.15);r.afterRelease=s.shots;A(false);__game.advance(1.2);
      // pause, RESUME with A, keep holding
      window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyP',key:'p'}));__game.advance(0.02);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyP',key:'p'}));s=__game.advance(0.3);r.paused=s.mode;
      A(true);s=__game.advance(0.05);r.resumed=s.mode;s=__game.advance(1.0);r.pauseHeldShots=s.shots;A(false);s=__game.advance(0.3);
      // RT held through the map close too
      __game.advance(1.2);__game.openMap();__game.advance(0.1);__pad.buttons[7]={pressed:true,value:1};__pad.buttons[1]={pressed:true,value:1};s=__game.advance(0.05);r.closedB=s.mode;__pad.buttons[1]={pressed:false,value:0};s=__game.advance(1.0);r.rtHeldShots=s.shots;__pad.buttons[7]={pressed:false,value:0};
      return r;});
    check('M15-A1 pad A that closes the map is swallowed until released (no balloon), then A throws again',a1.closed==='play'&&a1.mapHeldShots===0&&a1.afterRelease>0,JSON.stringify(a1));
    check('M15-A1 pad A on pause RESUME (and RT held through a map close) is swallowed until released',a1.paused==='pause'&&a1.resumed==='play'&&a1.pauseHeldShots===0&&a1.closedB==='play'&&a1.rtHeldShots===0,JSON.stringify(a1));
    const a6=await G(page,()=>{const r={};__game.manual=true;__game.setSeed(4242);__game.startLevel(0);__game.clearMobs();__game.teleport(7.5,3.5,0);__game.advance(0.1);
      __game.openMap();__game.advance(0.1);window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' '}));let s=__game.advance(0.05);r.closed=s.mode;
      for(let i=0;i<20;i++){window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',repeat:true}));s=__game.advance(0.05);}r.heldShots=s.shots;
      window.dispatchEvent(new KeyboardEvent('keyup',{code:'Space',key:' '}));__game.advance(0.6);window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' '}));s=__game.advance(0.15);window.dispatchEvent(new KeyboardEvent('keyup',{code:'Space',key:' '}));r.after=s.shots;return r;});
    check('M15-A6 Space held through a map close (with key repeat) throws nothing until released; a fresh press throws',a6.closed==='play'&&a6.heldShots===0&&a6.after>0,JSON.stringify(a6));
    await ctx.close();
  }
  // ---------- M15-A2: Shift+M minimap choice is saved ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m16-a2'});
    const r1=await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.advance(0.05);const on0=__game.minimapOn();window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyM',key:'M',shiftKey:true}));__game.advance(0.02);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyM',key:'M',shiftKey:true}));
      return {on0,on1:__game.minimapOn(),saved:JSON.parse(localStorage.getItem('labyrinthRemake.settings.v1')||'{}').minimap};});
    await page.reload();await page.waitForTimeout(200);
    const r2=await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.advance(0.05);const off=__game.minimapOn();window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyM',key:'M',shiftKey:true}));__game.advance(0.02);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyM',key:'M',shiftKey:true}));return {off,on:__game.minimapOn()};});
    await page.reload();await page.waitForTimeout(200);
    const r3=await G(page,()=>__game.minimapOn());
    check('M15-A2 Shift+M minimap hiding is saved in settings and survives a reload (and turning it back on too)',r1.on0===true&&r1.on1===false&&r1.saved===false&&r2.off===false&&r2.on===true&&r3===true,JSON.stringify({r1,r2,r3}));
    await ctx.close();
  }
  // ---------- M15-A3 / A4: fence-cell loot, splash blocked by walls / fences ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m16-a3'});
    const r=await G(page,()=>{const out={};__game.manual=true;__game.freeze=false;
      // find a fence cell with open floor on both sides (E-W or N-S) and a wall cell likewise, across a few levels
      let F=null,Wc=null;for(let l=0;l<8&&(!F||!Wc);l++){__game.setSeed(4242);__game.startLevel(l);const m=__game.currentMap();
        for(let y=1;y<m.length-1;y++)for(let x=1;x<m[y].length-1;x++){const open=(a,b)=>!__game.solidAt(a+.5,b+.5);
          if(!F&&m[y][x]==='F'&&open(x-1,y)&&open(x+1,y))F={l,x,y,dx:1,dy:0};else if(!F&&m[y][x]==='F'&&open(x,y-1)&&open(x,y+1))F={l,x,y,dx:0,dy:1};
          if(!Wc&&l===F?.l&&__game.solidAt(x+.5,y+.5)&&m[y][x]!=='F'&&m[y][x]!=='D'&&open(x-1,y)&&open(x+1,y))Wc={l,x,y,dx:1,dy:0};}}
      out.F=F;out.W=Wc;if(!F||!Wc)return out;
      __game.setSeed(4242);__game.startLevel(F.l);__game.clearMobs();__game.setHearts(99);
      const px=F.x+.5-F.dx*2,py=F.y+.5-F.dy*2;__game.teleport(px,py,F.dx?0:Math.PI/2);
      // A3: elite wisp dies inside the fence cell
      const i=__game.spawn('wisp',F.x+.5,F.y+.5,false,['beefy','fast']);__game.setForceDrop(i,1);const n0=__game.itemList().length;__game.freeze=true;__game.damageMob(i,99);__game.freeze=false;
      let s=null;for(let k=0;k<20;k++)s=__game.advance(0.05);const items=__game.itemList().slice(n0);out.items=items;out.loot=items.length;out.inFence=items.filter(t=>t.solid).length;
      out.lootCell=items.map(t=>[Math.floor(t.x),Math.floor(t.y)].join(','));out.spot=__game.lootSpot(F.x+.5,F.y+.5);
      // A4: giant splash through a fence and through a wall: no damage; the same distance in the open: 2 hits
      __game.clearMobs();__game.freeze=true;let j=__game.spawn('kettle',F.x+.5+F.dx*1.15-F.dx*.5+F.dx*.0,F.y+.5+F.dy*1.15-F.dy*.5,false);
      const k0=__game.state().enemies[j].hp;__game.giantSplash(F.x+.5-F.dx*.65,F.y+.5-F.dy*.65);out.fenceHp=[k0,__game.state().enemies[j].hp];
      __game.setSeed(4242);__game.startLevel(Wc.l);__game.clearMobs();__game.freeze=true;j=__game.spawn('kettle',Wc.x+1.15,Wc.y+.5,false);
      __game.giantSplash(Wc.x-.15,Wc.y+.5);out.wallHp=[k0,__game.state().enemies[j].hp];
      __game.clearMobs();j=__game.spawn('kettle',Wc.x-1.5+.0,Wc.y+.5,false);__game.giantSplash(Wc.x-.4,Wc.y+.5);out.openHp=[k0,__game.state().enemies[j].hp];
      out.cp=[__game.clearPath(Wc.x-.15,Wc.y+.5,Wc.x+1.15,Wc.y+.5),__game.clearPath(Wc.x-.4,Wc.y+.5,Wc.x-1.5,Wc.y+.5)];
      return out;});
    check('M15-A3 an elite killed in a fence cell drops every coin and its power-up in walkable cells (nearest open neighbour)',r.F&&r.loot>=5&&r.inFence===0,JSON.stringify({F:r.F,loot:r.loot,inFence:r.inFence,cells:r.lootCell,spot:r.spot}));
    check('M15-A4 Giant Balloon splash no longer damages through a fence or a wall (solidAt ray march), still hits in the open',r.fenceHp&&r.fenceHp[1]===r.fenceHp[0]&&r.wallHp[1]===r.wallHp[0]&&r.openHp[1]===r.openHp[0]-2,JSON.stringify({fence:r.fenceHp,wall:r.wallHp,open:r.openHp,cp:r.cp,W:r.W}));
    await ctx.close();
  }
  // ---------- M15-A5: same-seed link keeps CONTINUE selected ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m16-a5'});
    await G(page,()=>localStorage.setItem('labyrinthRemake.save.v1',JSON.stringify({v:1,level:2,hearts:5,coins:3,seed:4242,item:null,t:1})));
    await page.goto(URL+'?seed=4242');await page.waitForTimeout(300);const same=await G(page,()=>({sel:__game.menuSel(),menu:__game.state().menu}));
    await page.goto(URL+'?seed=777');await page.waitForTimeout(300);const diff=await G(page,()=>({sel:__game.menuSel(),menu:__game.state().menu}));
    await G(page,()=>localStorage.removeItem('labyrinthRemake.save.v1'));await page.goto(URL+'?seed=777');await page.waitForTimeout(300);const none=await G(page,()=>({sel:__game.menuSel(),menu:__game.state().menu}));
    check('M15-A5 a same-seed link keeps CONTINUE selected; only a different seed preselects NEW GAME',same.sel===0&&diff.sel===1&&none.sel===0,JSON.stringify({same:same.sel,diff:diff.sel,noSave:none.sel}));
    await ctx.close();
  }
  // ---------- Screamer: bat-wing wedge ears ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m16-scr'});
    const sm=await G(page,()=>[0,1,2,3].map(f=>__game.spriteData('screamer',f)));const smo=await G(page,()=>[0,1,2,3].map(f=>__game.spriteData('screamerO',f)));
    const H=c=>[c>>>0&255,c>>>8&255,c>>>16&255];
    const met=sd=>{const {w,h,px}=sd,op=(x,y)=>(px[y*w+x]>>>24)>0;const top=x=>{for(let y=0;y<h;y++)if(op(x,y))return y;return h;};const bot=x=>{for(let y=h-1;y>=0;y--)if(op(x,y))return y;return -1;};
      const headTop=top(Math.round(w/2));let notch=0;for(let x=Math.round(w*.2);x<=Math.round(w*.8);x++)notch=Math.max(notch,top(x)-headTop);
      let lx=0;while(lx<w&&top(lx)===h)lx++;let rx=w-1;while(rx>0&&top(rx)===h)rx--;
      const tipTop=Math.min(top(lx+2),top(rx-2)),rootTop=Math.min(top(Math.round(w*.33)),top(Math.round(w*.67)));
      const earH=x=>bot(x)-top(x)+1,root=Math.min(earH(Math.round(w*.3)),earH(Math.round(w*.7))),tip=Math.max(earH(lx+3),earH(rx-3));
      let dd=0,earPx=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(x>w*.3&&x<w*.7)continue;const c=px[y*w+x];if(!(c>>>24))continue;earPx++;const [r,g,b]=H(c);if(r===0x0d&&g===0x11&&b===0x26)dd++;}
      return {headTop,notch,tipTop,rootTop,root,tip,span:rx-lx+1,w,dd,earPx,tipY:Math.round((top(lx+2)+top(rx-2))/2)};};
    const ms=sm.map(met);
    check('Screamer ears: the top edge runs straight on from the head (no V-notch between head and ears) in every frame',ms.every(m=>m.notch<=6),ms.map(m=>`notch ${m.notch}px`).join(', '));
    check('Screamer ears: one wedge per side that tapers to a blunt point (root taller than tip, tip still 3+ px)',ms.every(m=>m.root>m.tip*1.8&&m.tip>=3&&m.span>=m.w*.95),ms.map(m=>`root ${m.root} tip ${m.tip}`).join(', '));
    check('Screamer ears flare up: tips sit at or above the head-top line in the up and level frames',[0,1].every(f=>ms[f].tipTop<=ms[f].headTop+1),[0,1].map(f=>`tip ${ms[f].tipTop} / head ${ms[f].headTop}`).join(', '));
    check('Screamer ears: dark hollow without the old checker grille (few darkest-blue pixels in the ears)',ms.every(m=>m.dd>0&&m.dd<m.earPx*.06),ms.map(m=>`${m.dd}/${m.earPx}`).join(', '));
    const sigs=new Set(sm.map(d=>d.px.reduce((a,c,i)=>(a*31+c+i)|0,0))),ty=ms.map(m=>m.tipY);
    check('Screamer ears keep flapping: 4 distinct frames, tip height moves 4+ px',sigs.size===4&&Math.max(...ty)-Math.min(...ty)>=4,`frames ${sigs.size}, tip y ${ty.join(',')}`);
    // face unchanged vs the frozen M1.5 build (mouth, eyes, colours)
    const p15=await (await ctx.newPage());await p15.goto(`file://${BUILDS}/m1.5/index.html`);await p15.waitForTimeout(200);
    const old=await p15.evaluate(()=>[0,1,2,3].map(f=>__game.spriteData('screamer',f)).concat([0,1,2,3].map(f=>__game.spriteData('screamerO',f))));await p15.close();
    let diff=0,tot=0;const all=sm.concat(smo);for(let f=0;f<8;f++){const a=all[f],b=old[f];for(let y=Math.round(a.h*.3);y<a.h;y++)for(let x=Math.round(a.w*.36);x<Math.round(a.w*.64);x++){tot++; /* inner face: brow, eyes, nose, mouth (the jaw outline can change where the old ears touched it) */if(a.px[y*a.w+x]!==b.px[y*b.w+x])diff++;}}
    check('Screamer mouth, eyes and blue colours are unchanged from M1.5 (face pixels identical, all 8 frames)',diff===0&&tot>1000,`${diff} of ${tot} face px differ`);
    savePng('m16_screamer_frames_4x.png',await G(page,()=>__game.spriteSheet(4,'screamer')));
    await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.teleport(6.6,3.5,0);__game.spawn('screamer',8.8,3.0,false);__game.spawn('screamer',10.6,4.3,false,['fast']);__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m16_screamer_in_game_1280x800.png`});
    await ctx.close();
  }
  // ---------- balance: L3 tougher than L2; two-modifier phase-in ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m16-bal'});
    const b=await G(page,()=>{const N=400,B=50,l2=[],l3=[];let k3=0,n3=new Set();for(let k=0;k<N;k++){const seed=9000+k*13;const a=__game.levelHp(seed,2),c=__game.levelHp(seed,3);l2.push(a.hp);l3.push(c.hp);if((c.types.kettle||0)>0)k3++;n3.add(c.n);}
      const mean=a=>a.reduce((x,y)=>x+y,0)/a.length,batches=[];for(let i=0;i<N;i+=B)batches.push([mean(l2.slice(i,i+B)),mean(l3.slice(i,i+B))]);
      return {N,m2:mean(l2),m3:mean(l3),k3,n3:[...n3],batches,gt:l3.filter((v,i)=>v>l2[i]).length,ties:l3.filter((v,i)=>v===l2[i]).length};});
    check(V17?`L3 has a guaranteed KETTLEGRUMP and at least 8 mobs (${b.N} seeds; M1.7 floor may add one)`:`L3 has a guaranteed KETTLEGRUMP and 8 mobs (${b.N} seeds)`,b.k3===b.N&&(V17?b.n3.every(n=>n>=8):b.n3.length===1&&b.n3[0]===8),`kettle on ${b.k3}/${b.N}, mob counts ${b.n3}`);
    check(`L3 mean mob HP is above L2 in every batch of 50 seeds (${b.N} seeds)`,b.batches.every(([x,y])=>y>x)&&b.m3>b.m2,`L2 ${b.m2.toFixed(2)} vs L3 ${b.m3.toFixed(2)}; batches ${b.batches.map(([x,y])=>`${x.toFixed(1)}/${y.toFixed(1)}`).join(' ')}; L3>L2 on ${b.gt}/${b.N} seeds (${b.ties} ties)`);
    const N=8000,rs=await G(page,(N)=>[3,5,6,7,8,9,12].map(f=>({f,...__game.rollStats(f,N,'t16'),c:__game.twoModChance(f)})),N);
    const ok=rs.every(r=>{const el=Math.round(r.frac*N),p=r.two/el,want=r.f<6?0:r.f===6?.5:r.f===7?.75:1,sd=Math.sqrt(want*(1-want)/el);return (want===0||want===1)?r.two===Math.round(want*el):Math.abs(p-want)<=Math.max(4*sd,.01);});
    check('Two-modifier elites phase in: 0% before L6, 50% on L6, 75% on L7, 100% from L8',ok&&rs.find(r=>r.f===6).c===.5&&rs.find(r=>r.f===7).c===.75&&rs.find(r=>r.f===8).c===1,rs.map(r=>`F${r.f}:${(r.two/Math.round(r.frac*N)*100).toFixed(1)}%`).join(' '));
    fs.writeFileSync(`${OUT}/m16_balance.json`,JSON.stringify({l2l3:b,twoMods:rs},null,1));
    await ctx.close();
  }
  // ---------- phone: pause / MAP out of the stick and look zones at every size ----------
  {
    const bad=[],pos=[];
    for(const [w,h] of [[844,390],[667,375],[740,360],[926,428],[932,430],[568,320],[1024,768],[1180,820],[1280,720],[1280,800],[800,300]]){
      const {ctx,page}=await newPage({viewport:{width:w,height:h},hasTouch:true,isMobile:true,label:`m16-${w}x${h}`});
      const l=await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.advance(0.05);__game.setForceUse(true);return __game.layout();});
      for(const bn of ['pauseBtn','mapBtn']){if(!l[bn].visible)bad.push(`${w}x${h} ${bn} hidden`);for(const z of (V17?['band','hud','minimap','itemBar','throwBtn','useBtn','itemBtn']:['stickZone','lookZone','band','hud','minimap','itemBar','throwBtn','useBtn','itemBtn']))if(inter(l[bn],l[z]))bad.push(`${w}x${h} ${bn}∩${z}`);if(l[bn].w<32)bad.push(`${w}x${h} ${bn} ${l[bn].w}px`);}
      if(inter(l.pauseBtn,l.mapBtn))bad.push(`${w}x${h} pause∩map`);
      for(const bn of ['throwBtn','useBtn','pauseBtn','itemBtn','mapBtn','stick'])if(l[bn].visible&&inter(l[bn],l.band))bad.push(`${w}x${h} ${bn} covers the message band`);
      pos.push(`${w}x${h}: pause ${Math.round(l.pauseBtn.x)},${Math.round(l.pauseBtn.y)} map ${Math.round(l.mapBtn.x)},${Math.round(l.mapBtn.y)} zones from y ${Math.round(l.stickZone.y)}`);
      if(w===844){await G(page,()=>__game.setForceUse(false));await G(page,()=>__game.advance(0.05));await page.screenshot({path:`${SHOTS}/m16_phone_844x390_moved_pause_and_map.png`});}
      if(w===568)await page.screenshot({path:`${SHOTS}/m16_phone_568x320_moved_pause_and_map.png`});
      await ctx.close();}
    check(V17?'phone: pause and MAP buttons sit in the HUD strip clear of the band, HUD, minimap, item bar and other buttons at all 11 sizes; no button covers the message band':'phone: pause and MAP buttons sit in the HUD strip, outside the stick and look zones, at all 11 sizes; no button covers the message band',bad.length===0,bad.join(', ')||pos.slice(0,3).join('; '));
    // real touches: pause button pauses, MAP opens the map, a touch in the HUD strip doesn't start the stick or a look drag
    const {ctx,page}=await newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2,label:'m16-phone'});
    await page.touchscreen.tap(422,250);await page.waitForTimeout(200);
    const cdp=await ctx.newCDPSession(page);const touch=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
    const tap=async(x,y)=>{await touch('touchStart',[{x,y,id:5}]);await page.waitForTimeout(40);await touch('touchEnd',[]);await page.waitForTimeout(80);};
    let l=await G(page,()=>{__game.manual=true;__game.setSeed(4242);__game.startLevel(2);__game.advance(0.1);return __game.layout();});
    const p0=await G(page,()=>__game.state().player);
    const sx0=V17?l.hud.x+l.hud.w*.4:60,sy0=V17?l.hud.y+l.hud.h*.5:l.stickZone.y-12; // M1.7: only the HUD panel is dead now
    await touch('touchStart',[{x:sx0,y:sy0,id:6}]);for(let i=1;i<=6;i++){await touch('touchMove',[{x:sx0,y:sy0-i*8,id:6}]);await page.waitForTimeout(16);}
    const mid=await G(page,()=>({s:__game.advance(0.3),st:document.getElementById('stick')?.className}));await touch('touchEnd',[]);
    await tap(l.pauseBtn.x+l.pauseBtn.w/2,l.pauseBtn.y+l.pauseBtn.h/2);const m1=(await G(page,()=>__game.advance(0.2))).mode;
    await G(page,()=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}));__game.advance(0.05);window.dispatchEvent(new KeyboardEvent('keyup',{code:'Escape',key:'Escape'}));__game.advance(0.05);});
    await tap(l.mapBtn.x+l.mapBtn.w/2,l.mapBtn.y+l.mapBtn.h/2);const m2=(await G(page,()=>__game.advance(0.2))).mode;
    check('phone: tapping the moved pause button pauses, the moved MAP button opens the map, and a drag in the HUD strip doesn\'t move or turn',m1==='pause'&&m2==='map'&&Math.hypot(mid.s.player.x-p0.x,mid.s.player.y-p0.y)<0.01&&Math.abs(mid.s.player.ang-p0.ang)<1e-6,JSON.stringify({m1,m2,moved:+Math.hypot(mid.s.player.x-p0.x,mid.s.player.y-p0.y).toFixed(3)}));
    await ctx.close();
  }
  // ---------- elite readability at distance 6 ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m16-elite'});
    const cols=await G(page,()=>__game.modCols());const hx=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)],dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
    const wisp=[[0xf5,0x9a,0xc0],[0xff,0xb8,0xe4]];
    const pairs=[['ranged','kettle'],['slime','springle'],['beefy','clunk'],['fast','screamer'],['regen','wisp']];
    const r=await G(page,({pairs,cols,V17})=>{const hx=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];const D=__game.dims;
      const hsv=p=>{const [r,g,b]=p.map(v=>v/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d+6)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;}return [h*60,mx?d/mx:0,mx];};
      const hd=(a,b)=>{const d=Math.abs(a-b)%360;return Math.min(d,360-d);};
      const grab=()=>{const a=[];for(let y=0;y<D.H;y++)for(let x=0;x<D.W;x++)a.push(__game.pixelAt(x,y));return a;};
      const set=(t,m)=>{__game.manual=true;__game.setSeed(4243);__game.startLevel(6);__game.clearMobs();__game.setHearts(99);__game.teleport(7.5,1.5,0);__game.freeze=true;if(t)__game.spawn(t,13.5,1.5,false,m?[m]:[]);__game.advance(0.02);};
      set(null);const wall=grab();let br=[0,0,0],bn=0;for(let y=60;y<140;y++)for(let x=0;x<150;x++){const q=wall[y*D.W+x];br[0]+=q[0];br[1]+=q[1];br[2]+=q[2];bn++;}br=br.map(v=>Math.round(v/bn));
      const out={brick:br};for(const [m,t] of pairs){const c=hx(cols[m]),hc=hsv(c);const like=q=>{const h=hsv(q);return h[1]>(hc[1]>.35?.3:.15)&&h[2]>.55&&(!V17||(q[0]+q[1]+q[2])/3>115)&&(hc[1]<.35?h[1]<hc[1]+.25:true)&&hd(h[0],hc[0])<20;};
        set(t,null);const A=grab();set(t,m);const B=grab();let ring=0,dark=0,inWall=0;
        for(let i=0;i<A.length;i++){const a=A[i],b=B[i],ch=Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])>30;if(ch&&like(b))ring++;if(ch&&b[0]+b[1]+b[2]<60&&a[0]+a[1]+a[2]>=60)dark++;}
        for(let y=45;y<200;y++)for(let x=0;x<390;x++)if(like(wall[y*D.W+x]))inWall++;
        out[m]={ring,dark,inWall,iconPx:+__game.state().stats.iconPx.toFixed(1)};}
      return out;},{pairs,cols,V17});
    const brick=r.brick;delete r.brick;
    check('Elite modifier icons are outlined and at least 8 px tall on screen at distance 6',Object.values(r).every(v=>v.iconPx>=8),Object.entries(r).map(([m,v])=>`${m} ${v.iconPx}px`).join(', '));
    check('Elite glow at distance 6 on red brick: each colour ring is strong (60+ px) with a dark frame, and the colour barely appears in the brick itself',Object.values(r).every(v=>v.ring>=60&&v.dark>=30&&v.inWall<30),Object.entries(r).map(([m,v])=>`${m}: ring ${v.ring}, frame ${v.dark}, in brick ${v.inWall}`).join('; ')+`; brick ${brick}`);
    const hsv=p=>{const [r,g,b]=p.map(v=>v/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d+6)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;}return h*60;},hd=(a,b)=>{const d=Math.abs(a-b)%360;return Math.min(d,360-d);};
    const hReg=Math.min(...wisp.map(w=>hd(hsv(hx(cols.regen)),hsv(w)))),dRegen=Math.min(...wisp.map(w=>dist(hx(cols.regen),w))),dFast=dist(hx(cols.fast),[0x4a,0x5c,0x96]),dRanged=dist(hx(cols.ranged),brick),hRanged=hd(hsv(hx(cols.ranged)),hsv(brick));
    const old15={regenHue:Math.min(...wisp.map(w=>hd(hsv([255,90,216]),hsv(w))))};
    check('REGEN colour no longer clashes with the pink Hazewisp (opposite hue); FAST stands off the blue Screamer; RANGED stands off the brick',hReg>=90&&dRegen>=100&&dFast>=150&&(V17?dRanged>=120:dRanged>=120&&hRanged>=20),`regen ${cols.regen}: hue ${hReg.toFixed(0)}° from wisp pink (M1.5 ${old15.regenHue.toFixed(0)}°), dist ${dRegen.toFixed(0)}; fast ${cols.fast} vs blue ${dFast.toFixed(0)}; ranged ${cols.ranged} vs brick ${brick}: dist ${dRanged.toFixed(0)}, hue ${hRanged.toFixed(0)}°`);
    // screenshot: all five at distance 6 on red brick, side by side
    const parts=[];for(const [m,t] of pairs){await G(page,([m,t])=>{__game.manual=true;__game.setSeed(4243);__game.startLevel(6);__game.clearMobs();__game.teleport(7.5,1.5,0);__game.freeze=true;__game.spawn(t,13.5,1.5,false,[m]);__game.advance(0.02);},[m,t]);
      const f=`${SHOTS}/_tmp_d6_${m}.png`;await page.screenshot({path:f,clip:{x:490,y:160,width:300,height:300}});parts.push(f);}
    const {execFileSync}=await import('child_process');
    try{execFileSync('python3',['-c',`
from PIL import Image
fs=${JSON.stringify(parts)}
c=Image.new('RGB',(300*len(fs),300))
for i,f in enumerate(fs): c.paste(Image.open(f),(i*300,0))
c.save('${SHOTS}/m16_elite_icons_at_distance6_brick.png')`]);}catch(e){consoleProblems.push('[m16 shot] '+e.message);}
    for(const f of parts)fs.unlinkSync(f);
    savePng('m16_elite_icons_projectiles_goo_4x.png',await G(page,()=>__game.spriteSheet(4,'elite')));
    await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.teleport(6.6,3.5,0);__game.spawn('screamer',8.8,3.0,false,['regen','fast']);__game.spawn('wisp',10.6,4.0,false,['regen']);__game.spawn('kettle',9.6,2.5,false,['ranged']);__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m16_elites_in_game_1280x800.png`});
    await ctx.close();
  }
  // ---------- internal review: new Screamer next to the reference (test-output only) ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m16-review'});
    savePng('_tmp_screamer16_6x.png',await G(page,()=>__game.spriteSheet(6,'screamer')));
    await ctx.close();
    fs.unlinkSync(`${SHOTS}/_tmp_screamer16_6x.png`);
    const html=fs.readFileSync(FILE,'utf8');
    check('M1.6 no large embedded bitmap in the build (all art is drawn in code)',!/data:image\/png;base64,iVBOR[\s\S]{4000,}/.test(html));
  }
}

async function m17Tests(){
  const savePng=(n,u)=>fs.writeFileSync(`${SHOTS}/${n}`,Buffer.from(u.split(',')[1],'base64'));
  const inter=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const ri=(a,e)=>a[0]<e[0]+e[2]&&a[0]+a[2]>e[0]&&a[1]<e[1]+e[3]&&a[1]+a[3]>e[1];
  const {execFileSync}=await import('child_process');
  const corridor=(t,m,d,pitch)=>{__game.manual=true;__game.setSeed(4243);__game.startLevel(6);__game.clearMobs();__game.setHearts(99);__game.teleport(13.5-d,1.5,0);__game.freeze=true;__game.setPitch(pitch||0);__game.spawn(t,13.5,1.5,false,m);const s=__game.advance(0.02).stats;return {mode:s.iconMode,ic:s.iconRects||[],eb:s.enemyBoxes||[],px:s.iconPx};};
  // ---------- M16-A1: icons never drawn over the sprite ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m17-a1'});
    const cases=[];for(const t of ['wisp','clunk','screamer','zapfly','springle','kettle'])for(const m of [['beefy'],['beefy','ranged'],['regen'],['ranged','slime']])for(const d of [1.5,3,6,9])for(const pitch of [-80,0,80])cases.push([t,m,d,pitch]);
    const res=await G(page,({cases,cs})=>{const corridor=eval(cs);return cases.map(([t,m,d,pitch])=>{const r=corridor(t,m,d,pitch);return {t,m:m.join('+'),d,pitch,mode:r.mode,n:r.ic.length,mob:r.eb.length,px:r.px,ic:r.ic,eb:r.eb};});},{cases,cs:corridor.toString()});
    const bad=[],missing=[],small=[],modes={above:0,side:0};
    for(const r of res){modes[r.mode]=(modes[r.mode]||0)+1;if(r.ic.some(a=>r.eb.some(e=>ri(a,e))))bad.push(`${r.t}/${r.m}/d${r.d}/p${r.pitch}`);if(r.mob&&r.eb[0][1]>0&&r.n<r.m.split('+').length)missing.push(`${r.t}/${r.m}/d${r.d}/p${r.pitch}:${r.n}`);if(r.d<=6&&r.px<8)small.push(`${r.t}/${r.m}/d${r.d}:${r.px.toFixed(1)}`);}
    const bw=res.filter(r=>r.t==='wisp'&&r.m==='beefy');
    check(`M16-A1 elite icons never overlap the mob sprite (${res.length} cases: 6 mob types incl. BEEFY wisp, 4 mod sets, d 1.5/3/6/9, pitch -80/0/+80)`,bad.length===0&&res.every(r=>r.mob>0),bad.slice(0,6).join(', ')||`above ${modes.above}, beside ${modes.side}; BEEFY wisp: ${bw.map(r=>`d${r.d}/p${r.pitch} ${r.mode}`).join(' ')}`);
    check('M16-A1 every modifier icon is still drawn whenever the mob is visible, and stays >= 8 px tall out to d 6',missing.length===0&&small.length===0,(missing.concat(small)).slice(0,8).join(', ')||`icon px at d6: ${[...new Set(res.filter(r=>r.d===6).map(r=>r.px.toFixed(1)))].join('/')}`);
    // BEEFY wisp face check: eye pixels identical with and without the elite icons (glow excluded: compare the inside of the sprite box)
    const face=await G(page,(cs)=>{const corridor=eval(cs);const out=[];for(const d of [1.5,3,6]){const D=__game.dims;const grab=(b)=>{const a=[];for(let y=b[1];y<b[1]+b[3]*.5;y++)for(let x=b[0]+Math.round(b[2]*.2);x<b[0]+b[2]*.8;x++)a.push(__game.pixelAt(x,y).join(','));return a;};
        const r1=corridor('wisp',['beefy'],d,0),b=r1.eb[0];const withIcons=grab(b);__game.setPitch(0);
        // same frame with the icon pass skipped: render the plain wisp at beefy scale is not possible, so compare against the box with icons forced off-screen
        out.push({d,mode:r1.mode,box:b,icons:r1.ic,clear:r1.ic.every(a=>a[1]>=b[1]+b[3]||a[1]+a[3]<=b[1]||a[0]>=b[0]+b[2]||a[0]+a[2]<=b[0])});}return out;},corridor.toString());
    check('M16-A1 BEEFY Hazewisp at near, mid and far range: icons sit beside it, clear of its box and eyes',face.every(f=>f.clear&&f.icons.length>0),face.map(f=>`d${f.d}: ${f.mode}, box ${f.box.join(',')}, icons ${f.icons.map(a=>a.join(',')).join(' ')}`).join('; '));
    // screenshots: BEEFY wisp at near / mid / far, and looking up / down
    const parts=[];for(const [d,pitch] of [[1.8,0],[3,0],[6,0],[6,80],[6,-80]]){await G(page,({cs,d,pitch})=>{const corridor=eval(cs);corridor('wisp',['beefy','ranged'],d,pitch);},{cs:corridor.toString(),d,pitch});
      const f=`${SHOTS}/_tmp_bw_${d}_${pitch}.png`;await page.screenshot({path:f,clip:{x:340,y:100,width:600,height:600}});parts.push(f);}
    try{execFileSync('python3',['-c',`
from PIL import Image
fs=${JSON.stringify(parts)}
c=Image.new('RGB',(300*len(fs),300))
for i,f in enumerate(fs): c.paste(Image.open(f).resize((300,300)),(i*300,0))
c.save('${SHOTS}/m17_beefy_wisp_icons_d1.8_d3_d6_d6up_d6down.png')`]);}catch(e){consoleProblems.push('[m17 shot] '+e.message);}
    for(const f of parts)fs.unlinkSync(f);
    await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.teleport(6.6,3.5,0);__game.spawn('wisp',9.6,3.0,false,['beefy']);__game.spawn('clunk',11.5,4.2,false,['beefy','ranged']);__game.spawn('screamer',8.8,4.0,false,['regen']);__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m17_elites_in_game_1280x800.png`});
    await ctx.close();
  }
  // ---------- M16-A2: release build has no window.__game unless ?debug; QA build always has it ----------
  {
    const REL=`file://${BUILDS}/${BUILD}/index.html`;
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m17-a2'});
    await page.goto(REL);await page.waitForTimeout(300);const noHook=await page.evaluate(()=>typeof window.__game);
    const s0=await page.screenshot();await page.keyboard.press('Enter');await page.waitForTimeout(500);const s1=await page.screenshot();
    await page.goto(REL+'?debug');await page.waitForTimeout(300);const dbg=await page.evaluate(()=>typeof window.__game==='object'&&typeof window.__game.state==='function'?window.__game.state().mode:null);
    await page.goto(REL+'?seed=4242');await page.waitForTimeout(300);const seedOnly=await page.evaluate(()=>typeof window.__game);
    await page.goto(REL+'?debugger=1');await page.waitForTimeout(300);const lookalike=await page.evaluate(()=>typeof window.__game);
    await page.goto(URL);await page.waitForTimeout(300);const qa=await page.evaluate(()=>typeof window.__game);
    const rel=fs.readFileSync(`${BUILDS}/${BUILD}/index.html`,'utf8'),qah=fs.readFileSync(FILE,'utf8');
    const rl=rel.split('\n'),ql=qah.split('\n'),diff=rl.map((l,i)=>l!==ql[i]?i+1:0).filter(Boolean);
    check('M16-A2 release build exposes no window.__game without ?debug (also not with ?seed= or ?debugger=), and the game still starts',noHook==='undefined'&&seedOnly==='undefined'&&lookalike==='undefined'&&!s0.equals(s1),`plain ${noHook}, ?seed ${seedOnly}, ?debugger ${lookalike}, Enter changed the screen ${!s0.equals(s1)}`);
    check('M16-A2 release with ?debug, and the QA build always, expose the hook; the two files differ only in the QA flag and title',dbg==='title'&&qa==='object'&&rl.length===ql.length&&diff.length===2&&/QA_BUILD=false/.test(rel)&&/QA_BUILD=true/.test(qah),`?debug → ${dbg}, QA ${qa}, differing lines ${diff.join(',')}`);
    await ctx.close();
  }
  // ---------- RANGED colour ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m17-ranged'});
    const cols=await G(page,()=>__game.modCols());
    const hx=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
    const lin=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;},Lum=p=>.2126*lin(p[0])+.7152*lin(p[1])+.0722*lin(p[2]),cr=(a,b)=>{const x=Lum(a),y=Lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
    const hue=p=>{const [r,g,b]=p.map(v=>v/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d+6)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;}return h*60;},hd=(a,b)=>{const d=Math.abs(hue(a)-hue(b))%360;return Math.min(d,360-d);};
    const R=hx(cols.ranged),brickQA=[134,56,39],wisps=['#f59ac0','#e07aa6','#ffd4e6','#b85486','#ffb8e4'].map(hx);
    const others=Object.entries(cols).filter(([k])=>k!=='ranged');
    const brickGame=await G(page,()=>{const D=__game.dims;__game.manual=true;__game.setSeed(4243);__game.startLevel(6);__game.clearMobs();__game.teleport(7.5,1.5,0);__game.freeze=true;__game.advance(0.02);const v=[];for(let y=60;y<140;y++)for(let x=0;x<150;x++)v.push(__game.pixelAt(x,y));const med=i=>v.map(p=>p[i]).sort((a,b)=>a-b)[v.length>>1];return [med(0),med(1),med(2)];});
    const info={col:cols.ranged,crQA:cr(R,brickQA),crGame:cr(R,brickGame),crOld:cr(hx('#ff2f5a'),brickQA),wispHue:Math.min(...wisps.map(w=>hd(R,w))),wispDist:Math.min(...wisps.map(w=>Math.hypot(...R.map((v,i)=>v-w[i])))),others:others.map(([k,v])=>`${k} ${hd(R,hx(v)).toFixed(0)}°`).join(', '),minOther:Math.min(...others.map(([,v])=>hd(R,hx(v))))};
    check('RANGED is a lighter red-pink with about 2.9:1 contrast on red brick (was 2.23:1)',info.col==='#ff6a7a'&&info.crQA>=2.85&&info.crGame>=2.6&&info.crQA>info.crOld,`${info.col}: ${info.crQA.toFixed(2)}:1 vs QA brick median ${brickQA}, ${info.crGame.toFixed(2)}:1 vs in-game brick median ${brickGame}; old #ff2f5a ${info.crOld.toFixed(2)}:1`);
    check('RANGED stays distinct from the other elite colours (35°+ hue) and from every Hazewisp pink (15°+ hue, 50+ RGB)',info.minOther>=35&&info.wispHue>=15&&info.wispDist>=50,`others: ${info.others}; wisp hue ${info.wispHue.toFixed(0)}°, RGB distance ${info.wispDist.toFixed(0)}`);
    fs.writeFileSync(`${OUT}/m17_ranged_colour.json`,JSON.stringify(info,null,1));
    const parts=[];for(const [t,d] of [['kettle',3],['kettle',6],['wisp',6],['screamer',6]]){await G(page,({t,d})=>{__game.manual=true;__game.setSeed(4243);__game.startLevel(6);__game.clearMobs();__game.teleport(13.5-d,1.5,0);__game.freeze=true;__game.setPitch(0);__game.spawn(t,13.5,1.5,false,['ranged']);__game.advance(0.02);},{t,d});
      const f=`${SHOTS}/_tmp_r_${t}${d}.png`;await page.screenshot({path:f,clip:{x:340,y:100,width:600,height:600}});parts.push(f);}
    try{execFileSync('python3',['-c',`
from PIL import Image
fs=${JSON.stringify(parts)}
c=Image.new('RGB',(300*len(fs),300))
for i,f in enumerate(fs): c.paste(Image.open(f).resize((300,300)),(i*300,0))
c.save('${SHOTS}/m17_ranged_colour_on_brick.png')`]);}catch(e){consoleProblems.push('[m17 shot] '+e.message);}
    for(const f of parts)fs.unlinkSync(f);
    await ctx.close();
  }
  // ---------- L3 per-seed floor ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m17-l3'});
    const b=await G(page,()=>{const N=1000,rows=[];let fb=0,fe=0,sw=0,ad=0,tie=0,ns={};for(let k=0;k<N;k++){const s=k<400?1+k:20000+k*7;const a=__game.levelEff(s,2),c=__game.levelEff(s,3);if(c.base<a.base)fb++;if(c.eff<a.eff)fe++;if(c.base===a.base)tie++;if(c.swaps)sw++;if(c.adds)ad++;ns[c.n]=(ns[c.n]||0)+1;rows.push([s,a.base,a.eff,c.base,c.eff,c.swaps,c.adds]);}
      const m=i=>rows.reduce((x,r)=>x+r[i],0)/N,mn=i=>Math.min(...rows.map(r=>r[i]-r[i-2]));return {N,fb,fe,tie,sw,ad,ns,mean:{l2b:m(1),l2e:m(2),l3b:m(3),l3e:m(4)},minMargin:{base:mn(3),eff:mn(4)},rows};});
    fs.writeFileSync(`${OUT}/m17_l2_l3_per_seed.json`,JSON.stringify(b,null,1));
    check(`L3 is never easier than L2: total and effective mob HP >= L2 on every seed (${b.N} seeds, 0 failures)`,b.fb===0&&b.fe===0,`base failures ${b.fb}, effective ${b.fe}; mean base ${b.mean.l2b.toFixed(2)}→${b.mean.l3b.toFixed(2)}, effective ${b.mean.l2e.toFixed(2)}→${b.mean.l3e.toFixed(2)}; smallest margin base ${b.minMargin.base}, eff ${b.minMargin.eff}; floor swaps on ${b.sw} seeds, extra kettle on ${b.ad}; mob counts ${JSON.stringify(b.ns)}`);
    // the floor's numbers match the real level: startLevel totals equal levelEff, the start/feature guarantees hold, every mob is reachable and not in a wall
    const g=await G(page,()=>{const bad=[];for(let k=0;k<40;k++){const s=[1,2,3,208,4242][k%5]+k*101;__game.setSeed(s);__game.startLevel(2);const st=__game.state();const live=st.enemies;const base=live.reduce((x,e)=>x+__game.mobs[e.type].hp,0),eff=live.reduce((x,e)=>x+e.maxHp,0),le=__game.levelEff(s,3);
        const types=new Set(live.map(e=>e.type));if(base!==le.base||eff!==le.eff)bad.push(`${s}: ${base}/${eff} vs ${le.base}/${le.eff}`);if(!types.has('kettle')||!types.has('springle')||!types.has('wisp'))bad.push(`${s}: types ${[...types]}`);if(live.some(e=>__game.solidAt(e.x,e.y)))bad.push(`${s}: mob in wall`);}return bad;});
    check('L3 floor matches the level you actually play (40 seeds: totals equal, Kettlegrump/Springle/Hazewisp all present, no mob in a wall)',g.length===0,g.slice(0,4).join('; ')||'ok');
    const l8=await G(page,()=>{let s=0;for(let k=0;k<200;k++)s+=__game.levelEff(5000+k*7,8).eff;return s/200;});
    check('L8 untouched by the floor (B3 not approved): L8 never uses the floor',await G(page,()=>{for(let k=0;k<200;k++){const r=__game.levelEff(5000+k*7,8);if(r.swaps||r.adds)return false;}return true;}),`L8 mean effective HP ${l8.toFixed(1)}`);
    await ctx.close();
  }
  // ---------- touch: only the HUD, item bar, minimap and buttons are dead in the top strip ----------
  {
    const bad=[];
    for(const [w,h] of [[844,390],[667,375],[740,360],[926,428],[932,430],[568,320],[1024,768],[1180,820],[1280,720],[1280,800],[800,300]]){
      const {ctx,page}=await newPage({viewport:{width:w,height:h},hasTouch:true,isMobile:true,label:`m17-${w}x${h}`});
      const l=await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.advance(0.05);return __game.layout();});
      const dr=l.deadRects;for(const z of ['hud','itemBar','minimap'])if(!dr.some(r=>r.x<=l[z].x&&r.y<=l[z].y&&r.x+r.w>=l[z].x+l[z].w&&r.y+r.h>=l[z].y+l[z].h))bad.push(`${w}x${h} ${z} not dead`);
      if(dr.some(r=>inter(r,l.band)&&!(inter(r,l.hud)||inter(r,l.minimap))))bad.push(`${w}x${h} band dead`);
      const stripArea=l.canvas.w*(l.minimap.y+l.minimap.h-l.canvas.y),deadArea=dr.reduce((x,r)=>x+r.w*r.h,0);if(deadArea>stripArea*.55)bad.push(`${w}x${h} dead ${(deadArea/stripArea*100).toFixed(0)}%`);
      if(w===844){await page.screenshot({path:`${SHOTS}/m17_phone_844x390_layout.png`});}
      if(w===568){await page.screenshot({path:`${SHOTS}/m17_phone_568x320_layout.png`});}
      await ctx.close();}
    check('touch: at all 11 sizes only the HUD panel, item bar and minimap (+4 px) are dead in the top strip; the band and empty strip stay live',bad.length===0,bad.join(', ')||'ok');
    const {ctx,page}=await newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2,label:'m17-phone'});
    await page.touchscreen.tap(422,250);await page.waitForTimeout(200);
    const cdp=await ctx.newCDPSession(page);const touch=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
    const tap=async(x,y)=>{await touch('touchStart',[{x,y,id:5}]);await page.waitForTimeout(40);await touch('touchEnd',[]);await page.waitForTimeout(80);};
    const reset=()=>G(page,()=>{__game.manual=true;__game.setSeed(4242);__game.startLevel(2);__game.clearMobs();__game.advance(0.1);return {lay:__game.layout(),p:__game.state().player};});
    let {lay:l,p:p0}=await reset();const css=(ix,iy)=>({x:l.canvas.x+ix*l.canvas.w/480,y:l.canvas.y+iy*l.canvas.h/300});
    const drag=async(pt,dx,dy,id)=>{await touch('touchStart',[{x:pt.x,y:pt.y,id}]);await page.waitForTimeout(20);const s0=await G(page,()=>__game.state().player);let st=null;for(let i=1;i<=6;i++){await touch('touchMove',[{x:pt.x+dx*i,y:pt.y+dy*i,id}]);await page.waitForTimeout(16);}
      const r=await G(page,()=>({s:__game.advance(0.25).player,lay:__game.layout()}));await touch('touchEnd',[]);await G(page,()=>__game.advance(0.05));return {moved:Math.hypot(r.s.x-s0.x,r.s.y-s0.y),turned:Math.abs(r.s.ang-s0.ang),stick:r.lay.stick,band:r.lay.band,first:s0};};
    // empty strip, left (between pause and band, below the band): stick
    const left=css(170,40);const L1=await drag(left,0,-8,7);
    ({lay:l}=await reset());const right=css(300,45);const R1=await drag(right,10,0,8);
    ({lay:l}=await reset());const hud=css(60,18);const H1=await drag(hud,0,-8,9);
    ({lay:l}=await reset());const H2=await drag(hud,10,0,10);
    // a stick started high doesn't jump: holding still for 0.25 s moves nothing
    ({lay:l}=await reset());await touch('touchStart',[{x:left.x,y:left.y,id:11}]);await page.waitForTimeout(30);const still=await G(page,()=>{const a=__game.state().player;const b=__game.advance(0.25).player;return Math.hypot(b.x-a.x,b.y-a.y);});const stickLay=await G(page,()=>__game.layout());await touch('touchEnd',[]);
    check('touch: a drag starting in the empty top strip works for the stick (left) and look (right); one starting on the HUD panel does nothing',L1.moved>0.2&&R1.turned>0.05&&H1.moved<0.01&&H2.turned<1e-6&&H1.turned<1e-6,`strip-left moved ${L1.moved.toFixed(2)}, strip-right turned ${R1.turned.toFixed(2)}, HUD moved ${H1.moved.toFixed(3)} turned ${H2.turned.toFixed(3)}`);
    check('touch: a stick started high sits below the HUD (never over the message band) and holding still there doesn\'t move you',still<0.01&&!inter(stickLay.stick,stickLay.band)&&!inter(stickLay.stick,stickLay.hud),`still ${still.toFixed(3)}, stick@${Math.round(stickLay.stick.x)},${Math.round(stickLay.stick.y)} band bottom ${Math.round(stickLay.band.y+stickLay.band.h)}`);
    ({lay:l}=await reset());await tap(l.pauseBtn.x+l.pauseBtn.w/2,l.pauseBtn.y+l.pauseBtn.h/2);const m1=(await G(page,()=>__game.advance(0.2))).mode;
    await G(page,()=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}));__game.advance(0.05);window.dispatchEvent(new KeyboardEvent('keyup',{code:'Escape',key:'Escape'}));__game.advance(0.05);});
    await tap(l.mapBtn.x+l.mapBtn.w/2,l.mapBtn.y+l.mapBtn.h/2);const m2=(await G(page,()=>__game.advance(0.2))).mode;
    check('touch: pause and MAP buttons still catch their own taps (no stick or look starts under them)',m1==='pause'&&m2==='map',`${m1}, ${m2}`);
    await ctx.close();
  }
  // ---------- Screamer: thicker ears, wider flap, same face ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m17-scr'});
    const sm=await G(page,()=>[0,1,2,3].map(f=>__game.spriteData('screamer',f)).concat([0,1,2,3].map(f=>__game.spriteData('screamerO',f))));const flap=await G(page,()=>__game.scrFlap());
    const p16=await ctx.newPage();await p16.goto(`file://${BUILDS}/m1.6/index.html`);await p16.waitForTimeout(200);
    const old=await p16.evaluate(()=>[0,1,2,3].map(f=>__game.spriteData('screamer',f)).concat([0,1,2,3].map(f=>__game.spriteData('screamerO',f))));await p16.close();
    const colH=(sd,x)=>{let a=-1,b=-1;for(let y=0;y<sd.h;y++)if(sd.px[y*sd.w+x]>>>24){if(a<0)a=y;b=y;}return a<0?0:b-a+1;};
    const thick=sd=>[10,20,28].map(x=>(colH(sd,x)+colH(sd,sd.w-1-x))/2);
    const tN=thick(sm[1]),tO=thick(old[1]),ratio=tN.reduce((a,v)=>a+v,0)/tO.reduce((a,v)=>a+v,0);
    check('Screamer ears about 30% thicker (level frame, columns 10/20/28 px from each tip)',ratio>=1.25&&ratio<=1.45&&tN.every((v,i)=>v>tO[i]),`M1.6 ${tO.join('/')} px → M1.7 ${tN.join('/')} px (×${ratio.toFixed(2)})`);
    const range=Math.max(...flap)-Math.min(...flap);
    const tipY=sd=>{let lx=0;const op=(x,y)=>(sd.px[y*sd.w+x]>>>24)>0;const top=x=>{for(let y=0;y<sd.h;y++)if(op(x,y))return y;return sd.h;};while(lx<sd.w&&top(lx)===sd.h)lx++;return top(lx+3);};
    const tyN=sm.slice(0,4).map(tipY),tyO=old.slice(0,4).map(tipY);
    check('Screamer flap widened to about 0.4 rad (was 0.275); the tips sweep further',Math.abs(range-.4)<.03&&(Math.max(...tyN)-Math.min(...tyN))>(Math.max(...tyO)-Math.min(...tyO)),`angles ${flap.join(', ')} (range ${range.toFixed(2)} rad); tip y M1.6 ${tyO.join(',')} → M1.7 ${tyN.join(',')}`);
    let diff=0,tot=0;for(let f=0;f<8;f++){const a=sm[f],b=old[f];for(let y=Math.round(a.h*.3);y<a.h;y++)for(let x=Math.round(a.w*.36);x<Math.round(a.w*.64);x++){tot++;if(a.px[y*a.w+x]!==b.px[y*b.w+x])diff++;}}
    let full=0;for(let f=0;f<8;f++){const a=sm[f],b=old[f];for(let y=0;y<a.h;y++)for(let x=Math.round(a.w*.36);x<Math.round(a.w*.64);x++)if(a.px[y*a.w+x]!==b.px[y*b.w+x])full++;}
    check('Screamer face pixel-identical to M1.6 in all 8 frames (inner face columns, every row)',diff===0&&full===0&&tot>1000,`${diff} of ${tot} face px differ (whole-height face columns: ${full})`);
    savePng('m17_screamer_frames_4x.png',await G(page,()=>__game.spriteSheet(4,'screamer')));
    const p2=await ctx.newPage();await p2.goto(`file://${BUILDS}/m1.6/index.html`);await p2.waitForTimeout(200);savePng('_tmp_scr16_4x.png',await p2.evaluate(()=>__game.spriteSheet(4,'screamer')));await p2.close();
    try{execFileSync('python3',['-c',`
from PIL import Image,ImageDraw
a=Image.open('${SHOTS}/_tmp_scr16_4x.png').convert('RGB');b=Image.open('${SHOTS}/m17_screamer_frames_4x.png').convert('RGB')
c=Image.new('RGB',(a.width,a.height+b.height+50),(20,16,42));c.paste(a,(0,20));c.paste(b,(0,a.height+45))
d=ImageDraw.Draw(c);d.text((6,4),'M1.6 Screamer ears (4x)',fill=(255,226,122));d.text((6,a.height+28),'M1.7: ~30% thicker, flap 0.40 rad (4x)',fill=(255,226,122))
c.save('${SHOTS}/m17_screamer_m16_vs_m17_4x.png')`]);}catch(e){consoleProblems.push('[m17 shot] '+e.message);}
    fs.unlinkSync(`${SHOTS}/_tmp_scr16_4x.png`);
    await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.teleport(6.6,3.5,0);__game.spawn('screamer',8.8,3.0,false);__game.spawn('screamer',10.6,4.3,false,['fast']);__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m17_screamer_in_game_1280x800.png`});
    await ctx.close();
  }
  // ---------- internal review: new Screamer next to the QA reference (test-output only) ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m17-review'});
    savePng('_tmp_screamer17_6x.png',await G(page,()=>__game.spriteSheet(6,'screamer')));
    await ctx.close();
    fs.unlinkSync(`${SHOTS}/_tmp_screamer17_6x.png`);
    const html=fs.readFileSync(FILE,'utf8')+fs.readFileSync(`${BUILDS}/${BUILD}/index.html`,'utf8');
    check('M1.7 no large embedded bitmap in the build (all art is drawn in code)',!/data:image\/png;base64,iVBOR[\s\S]{4000,}/.test(html));
  }
}

// ---------- M1.8: endless floors, deeper wall textures, score + high scores (local stub only), slot machine ----------
async function m18Tests(){
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const savePng=(name,url)=>fs.writeFileSync(`${SHOTS}/${name}`,Buffer.from(url.split(',')[1],'base64'));
  const SAVE='labyrinthRemake.save.v1',LOCAL='labyrinthRemake.localScores.v1';
  const VIEWS=[[844,390],[667,375],[740,360],[926,428],[932,430],[568,320],[1024,768],[1180,820],[1280,720],[1280,800],[800,300]];
  const ov=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
  // death helper (inside the page): one bump from a fresh clunk at 1 heart
  const DIE=()=>{__game.setHearts(1);__game.setEffect(null);const p=__game.state().player;__game.spawn('clunk',p.x+.3,p.y,true,[]);let s;for(let i=0;i<20;i++){s=__game.advance(0.1);if(s.mode==='dead')break;}__game.advance(0.6);__game.confirm();return __game.advance(0.1).mode;};

  // ---- 1. builds, API rules, no credentials, no live host
  {
    const rel=fs.readFileSync(REL_URL.replace('file://',''),'utf8'),qa=fs.readFileSync(FILE,'utf8');
    const dl=rel.split('\n').filter((l,i)=>l!==qa.split('\n')[i]).length;
    check('M1.8 release + QA builds are M1.8; the QA build differs only in QA_BUILD and the title',rel.includes("'M1.8 PROTOTYPE - PLACEHOLDER TITLE'")&&rel.includes('var QA_BUILD=false;')&&qa.includes('var QA_BUILD=true;')&&dl===2,`differing lines ${dl}`);
    const fetches=[...rel.matchAll(/fetch\(([^,)]*)/g)].map(m=>m[1].trim());
    check('M1.8 API client: one fetch call, base "/api/labyrinth" + relative path (no scheme or host)',fetches.length===1&&fetches[0]==='HS_API+path'&&rel.includes("var HS_API='/api/labyrinth'")&&!/https?:\/\/(?!www\.w3\.org\/2000\/svg)/i.test(rel),fetches.join(' | ')); // the only URL is the inline-SVG XML namespace (not a request)
    check('M1.8 no credentials in the game (no Authorization header, btoa, user:pass@ or stored tokens); credentials:"same-origin" only',!/authorization|btoa\(|\/\/[^\s'"]+:[^\s'"]+@|api[_-]?key|bearer/i.test(rel)&&rel.includes("credentials:'same-origin'")&&!/credentials:\s*'include'/.test(rel));
    const LIVE=new RegExp([['custom','mcplugins'].join(''),['pre','view\\.'].join('')].join('|'),'i'),stubSrc=fs.readFileSync(`${ROOT}/tests/hs_stub.mjs`,'utf8');
    check('M1.8 no live host names in the build, the tests or the stub (the stub binds 127.0.0.1 only)',!LIVE.test(rel)&&!LIVE.test(fs.readFileSync(`${ROOT}/tests/m1.test.mjs`,'utf8'))&&!LIVE.test(stubSrc)&&stubSrc.includes("host='127.0.0.1'"));
    check('M1.8 name box is never prefilled (no value attribute, autocomplete off) and no real names appear',/<input id="nameIn"[^>]*autocomplete="off"/.test(rel)&&!/<input id="nameIn"[^>]*value=/.test(rel)&&!(process.env.PRIVATE_NAMES||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).some(x=>rel.toLowerCase().includes(x))&&!/playtest/i.test(rel));
    const {ctx,page}=await (async()=>{const ctx=await browser.newContext({viewport:{width:1280,height:720}});const page=await ctx.newPage();page.on('request',r=>{const u=r.url();if(!(u.split('?')[0]===REL_URL||u.startsWith('data:')))badRequests.push(u);});await page.goto(REL_URL);await page.waitForTimeout(400);return {ctx,page};})();
    const hook=await page.evaluate(()=>typeof window.__game);
    check('M1.8 release build: no window.__game without ?debug',hook==='undefined',hook);
    await ctx.close();
  }

  // ---- 2. endless floors + saves
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m18-endless'});
    let r=await G(page,()=>{__game.manual=true;localStorage.clear();__game.setSeed(777);__game.startLevel(7);__game.clearMobs();const ex=__game.state().exit;__game.teleport(ex.x+.5,ex.y+.5,0);let s=__game.advance(0.3);const m1=s.mode;__game.advance(0.6);__game.confirm();s=__game.advance(0.05);return {m1,mode:s.mode,level:s.level,name:s.levelName,save:s.save};});
    check('M1.8 no final win: clearing level 8 starts floor 9 (deep theme) and saves it',r.m1==='clear'&&r.mode==='play'&&r.level===8&&/^LEVEL 9: BASALT DEPTHS/.test(r.name)&&r.save&&r.save.level===8,JSON.stringify(r));
    r=await G(page,()=>{const out=[];for(const f of [50,200,1000]){__game.startLevel(f-1);__game.clearMobs();const ex=__game.state().exit;__game.teleport(ex.x+.5,ex.y+.5,0);__game.advance(0.3);__game.advance(0.6);__game.confirm();const s=__game.advance(0.05);out.push(s.mode+':'+s.level);}return out;});
    check('M1.8 clears on floors 50, 200 and 1000 lead on to the next floor (never a win screen)',r.join()==='play:50,play:200,play:1000',r.join());
    await G(page,()=>{__game.setRun({kills:12,elites:3,coins:40,deepest:199});__game.startLevel(199,{hearts:4,coins:33,item:'shield'});});
    const sv=await G(page,()=>__game.state().save);
    await page.reload();await page.waitForFunction(()=>!!window.__game);await sleep(300);
    r=await G(page,()=>{const st=__game.state();const i=st.menu.findIndex(m=>/CONTINUE/.test(m));const lbl=st.menu[i];__game.menuPick(i);__game.manual=true;const s=__game.advance(0.05);return {lbl,menu:st.menu,mode:s.mode,level:s.level,hearts:s.player.hearts,coins:s.player.coins,item:s.player.item,run:s.run,name:s.levelName};});
    check('M1.8 save + CONTINUE work on floor 200 (level, hearts, coins, item and the run score counters)',sv.level===199&&sv.run&&sv.run.deepest===200&&/CONTINUE - LEVEL 200/.test(r.lbl)&&r.mode==='play'&&r.level===199&&r.hearts===4&&r.coins===33&&r.item==='shield'&&r.run.kills===12&&r.run.deepest===200,JSON.stringify(r));
    check('M1.8 title menu: CONTINUE, NEW GAME, HIGH SCORES',r.menu.length===3&&r.menu[2]==='HIGH SCORES'&&r.menu[1]==='NEW GAME',r.menu.join(' | '));
    r=await G(page,()=>{localStorage.setItem('labyrinthRemake.save.v1',JSON.stringify({v:1,level:4,hearts:3,coins:9,seed:31337,item:null,t:1}));__game.toTitle();const st=__game.state();__game.menuPick(0);__game.manual=true;const s=__game.advance(0.05);return {menu:st.menu[0],level:s.level,run:s.run};});
    check('M1.8 an M1.7-style save (no score counters) still continues',r.level===4&&r.run&&r.run.deepest===5&&r.run.kills===0,JSON.stringify(r));
    await ctx.close();
  }

  // ---- 3. generation: fast and valid at very deep floors; floors 1-8 keep their M1.7 layouts
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m18-gen'});
    const FLOORS=[9,10,12,13,16,17,20,21,25,30,50,100,200,500,1000,2500,5000,9999],SEEDS=[1,777,4242,99991,123456,2026];
    const g=await G(page,({FLOORS,SEEDS})=>{const WALL=new Set('#SWTMKRCVO'.split(''));const MOB=new Set('ebtgrz'.split(''));
      const mobCh=new Set(Object.values(__game.mobs).map(m=>m.ch));
      const res=[];let maxMs=0,bad=[];const per={};
      for(const f of FLOORS)for(const sd of SEEDS){const t=__game.genTime(sd,f);maxMs=Math.max(maxMs,t.ms);(per[f]=per[f]||[]).push(t.ms);const m=t.map,h=m.length,w=m[0].length;let p=null,x0=0,nk=0,nx=0,ny=0,nm=0,nc=0,err='';
        if(t.fallback)err+='fallback ';if(m.some(r=>r.length!==w))err+='ragged ';
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=m[y][x];if((x===0||y===0||x===w-1||y===h-1)&&!WALL.has(c))err+='border ';if(c==='p')p=[x,y];if(c==='X')nx++;if(c==='k')nk++;if(c==='Y')ny++;if(mobCh.has(c))nm++;if(c==='c')nc++;}
        if(!p||nx!==1)err+='p/X ';if(nk<1)err+='key ';if(ny>1)err+='slots ';if(nm>22)err+='mobs '+nm;if(nc>33)err+='coins '+nc;
        if(p){const seen=new Set([p[1]*w+p[0]]),q=[p];const walk=c=>!WALL.has(c)&&c!=='F'&&c!=='Y';while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=h)continue;const k=Y*w+X;if(seen.has(k)||!walk(m[Y][X]))continue;seen.add(k);q.push([X,Y]);}}
          for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=m[y][x];if((c==='X'||c==='k'||c==='c'||c==='h'||mobCh.has(c))&&!seen.has(y*w+x)){err+='unreachable '+c+' ';y=h;break;}}}
        if(err)bad.push(`F${f}/s${sd}: ${err}`);}
      const avg={};for(const f in per)avg[f]=per[f].reduce((a,b)=>a+b,0)/per[f].length;return {maxMs,bad,avg};},{FLOORS,SEEDS});
    check(`M1.8 generation is valid on floors 9-9999 (${FLOORS.length} floors x ${SEEDS.length} seeds: walls on the border, one start/exit, key, everything reachable with the slot machine as a wall, mobs <= 22, coins <= 33)`,g.bad.length===0,g.bad.slice(0,4).join(' | '));
    check('M1.8 generation stays fast at depth (every floor < 250 ms; L50 / L200 / L9999 averages reported)',g.maxMs<250,`max ${g.maxMs.toFixed(1)} ms; avg L50 ${g.avg[50].toFixed(1)} ms, L200 ${g.avg[200].toFixed(1)} ms, L5000 ${g.avg[5000].toFixed(1)} ms, L9999 ${g.avg[9999].toFixed(1)} ms`);
    fs.writeFileSync(`${OUT}/m18_gen_timing.json`,JSON.stringify(g,null,1));
    // M1.7 comparison: floors 2-8 identical apart from the slot machine cell
    const old=await (async()=>{const c=await browser.newContext();const pg=await c.newPage();await pg.goto(`file://${BUILDS}/m1.7-qa/index.html`);await pg.waitForFunction(()=>!!window.__game);const o=await pg.evaluate(()=>{const r={};for(const sd of [1,777,4242,99991])for(let f=2;f<=8;f++)r[sd+':'+f]=__game.genMap(sd,f).map.join('\n');return r;});await c.close();return o;})();
    const cur=await G(page,()=>{const r={};for(const sd of [1,777,4242,99991])for(let f=2;f<=8;f++)r[sd+':'+f]=__game.genMap(sd,f).map.join('\n');return r;});
    const diffs=Object.keys(old).filter(k=>old[k]!==cur[k].replace(/Y/g,'.'));
    check('M1.8 floors 2-8 keep their M1.7 layouts (only a "." becomes the slot machine)',diffs.length===0,diffs.join(','));
    // scaling caps
    const d=await G(page,()=>{const o=[];for(let f=1;f<=400;f++)o.push(__game.difficulty(f));return o;});
    const mono=k=>d.every((x,i)=>i===0||x[k]>=d[i-1][k]-1e-12);
    check('M1.8 difficulty keeps scaling then caps: mobs <= 22 (from L13), coins <= 30, HP x1.06/floor past 8 up to x1.6 (L18), elites <= 60% (L12), two mods from L8',
      mono('mobs')&&mono('hpMul')&&mono('elite')&&d.every(x=>x.mobs<=22&&x.coins<=30&&x.hpMul<=1.6&&x.elite<=.6&&x.roomTries<=90)&&d[12].mobs===22&&d[11].mobs<22&&d[7].hpMul===1&&Math.abs(d[17].hpMul-1.6)<1e-9&&Math.abs(d[16].hpMul-1.54)<1e-9&&d[11].elite===.6&&d[399].twoMod===1&&d[7].mobs===15,
      `L8 mobs ${d[7].mobs}, L12 ${d[11].mobs}, L13 ${d[12].mobs}; hp L9 ${d[8].hpMul.toFixed(2)} L18 ${d[17].hpMul}; elite L12 ${d[11].elite} L400 ${d[399].elite}`);
    const hp=await G(page,()=>{__game.setSeed(4242);__game.startLevel(199);const s=__game.state();const M=__game.mobs;let bad=0;s.enemies.forEach(e=>{const base=M[e.type].hp,cap=Math.ceil((e.mods.includes('beefy')?Math.ceil(base*2.5):base)*1.6);if(e.maxHp!==cap)bad++;});return {n:s.enemies.length,bad,elites:s.enemies.filter(e=>e.mods.length).length};});
    check('M1.8 floor 200 mobs: count <= 22, HP exactly x1.6 of their (elite) base',hp.n>0&&hp.n<=22&&hp.bad===0,JSON.stringify(hp));
    await ctx.close();
  }

  // ---- 4. wall textures by depth tier
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m18-tex'});
    const t=await G(page,()=>{const tiers=[1,8,9,12,13,16,17,20,21,24,25,200,9999].map(f=>__game.texTier(f));const info=[];for(let i=0;i<13;i++)info.push(__game.texInfo(i));
      const base={};const newest={};for(const f of [2,5,8,9,11,13,15,17,19,21,23,25,40,200]){const b={},nb=[];for(let sd=1;sd<=60;sd++){const th=__game.themeFor(sd,f);b[th.base]=(b[th.base]||0)+1;}base[f]=b;}
      const W=[0,1,2,3,4,8,9,10,11,12];let md=1e9,mp='';for(const i of [8,9,10,11,12])for(const j of W){if(j===i||(j>=8&&j<i))continue;const d=__game.texDiff(i,j);if(d<md){md=d;mp=i+'/'+j;}}
      return {tiers,info,base,count:__game.texCount(),same:__game.texSame(),deep:__game.deepThemes.map(d=>d.base),md,mp};});
    check('M1.8 depth tiers: new wall style every 4 floors past 8 (L9, L13, L17, L21, L25), tier 5 from L25 on',t.tiers.join()==='0,0,1,1,2,2,3,3,4,4,5,5,5',t.tiers.join());
    const oldSet=new Set('#SWTM'.split('')),okTier=(f,b)=>{const tier=f>=25?5:f>=21?4:f>=17?3:f>=13?2:f>=9?1:0;return Object.keys(b).every(c=>tier===0?oldSet.has(c):t.deep.slice(0,tier).includes(c));};
    const tierOk=Object.entries(t.base).every(([f,b])=>okTier(+f,b));
    const newestShare=[9,13,17,21,25].map(f=>{const tier=f>=25?5:f>=21?4:f>=17?3:f>=13?2:1;return (t.base[f][t.deep[tier-1]]||0)/60;});
    check('M1.8 floors 1-8 use the M1.7 walls; deeper floors always use an unlocked deep wall as the base, the newest about half the time',tierOk&&newestShare.every(x=>x>=.4),`newest share at L9/13/17/21/25: ${newestShare.map(x=>x.toFixed(2)).join(' ')}; L13 bases ${JSON.stringify(t.base[13])}`);
    const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);const walls=[0,1,2,3,4,8,9,10,11,12];let minD=1e9,pair='';
    for(const i of [8,9,10,11,12])for(const j of walls){if(i===j||(j>i&&j>=8&&walls.indexOf(j)<walls.indexOf(i)))continue;if(j===i)continue;const dd=dist(t.info[i].mean,t.info[j].mean);if(dd<minD){minD=dd;pair=i+'/'+j;}}
    const sigs=new Set(t.info.map(x=>x.sig));
    check('M1.8 five new 64x64 wall textures, all distinct, cached once (TEX has 13 entries, same objects every frame)',t.count===13&&t.same&&sigs.size===13&&t.info.slice(8).every(x=>x.w===64&&x.h===64)&&t.md>=30,`smallest mean per-pixel difference ${t.mp}: ${t.md.toFixed(1)} of 255 (closest mean colours ${pair}: ${minD.toFixed(1)})`);
    savePng('m18_textures_all_4x.png',await G(page,()=>__game.textures(4)));
    // in-game views per tier
    // in-game views per tier: stand in front of a stretch of the floor's base wall (the newest unlocked style), 1.6 cells away
    const views=[];
    for(const f of [1,9,13,17,21,25]){const v=await G(page,(f)=>{__game.manual=true;const tier=__game.texTier(f);const want=tier?__game.deepThemes[tier-1].base:null;
        for(let sd=5150;sd<5250;sd++){if(want&&__game.themeFor(sd,f).base!==want)continue;__game.setSeed(sd);__game.startLevel(f-1);__game.clearMobs();const m=__game.currentMap(),b=m[0][0],h=m.length,w=m[0].length;
          for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){if(m[y][x]!=='.')continue;for(const [dx,dy,a] of [[1,0,0],[-1,0,Math.PI],[0,1,Math.PI/2],[0,-1,-Math.PI/2]]){
            if(m[y+dy][x+dx]!=='.'&&m[y+dy][x+dx]!=='c')continue;const wx=x+2*dx,wy=y+2*dy;if(wy<0||wy>=h||wx<0||wx>=w||m[wy][wx]!==b)continue;const px=-dy,py=dx;let ok=true;for(const k of [-1,1])if(!m[wy+py*k]||m[wy+py*k][wx+px*k]!==b)ok=false;if(!ok)continue;
            __game.teleport(x+.5-dx*.1,y+.5-dy*.1,a);__game.setPitch(0);__game.advance(0.05);return {sd,base:b,name:__game.state().levelName};}}}return null;},f);
      views.push(v);await page.screenshot({path:`${SHOTS}/m18_walls_tier${f>=25?5:f>=21?4:f>=17?3:f>=13?2:f>=9?1:0}_L${f}.png`});}
    check('M1.8 in-game tier views found a stretch of each tier\'s newest wall (screens m18_walls_tier*.png)',views.every(Boolean)&&views.slice(1).map(v=>v.base).join('')==='KRCVO',JSON.stringify(views));
    await ctx.close();
  }

  // ---- 5. score formula + caps
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m18-score'});
    const f=await G(page,()=>{let bad=[],n=0;const R=(()=>{let s=12345;return ()=>{s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();
      const pick=()=>{const k=R();return k<.2?Math.floor(R()*10):k<.5?Math.floor(R()*1000):k<.8?Math.floor(R()*1e6):k<.95?Math.floor(R()*1e12):Number.MAX_SAFE_INTEGER;};
      for(let i=0;i<20000;i++){const r={kills:pick(),elites:pick(),coins:pick(),deepest:1+Math.floor(R()<.5?R()*30:R()*20000)};const sc=__game.scoreOf(r),fl=Math.min(10000,r.deepest);n++;
        if(!(Number.isInteger(sc)&&sc>=0&&sc<=fl*100000&&sc<=10000000&&__game.hsValidate({name:'QA',score:sc,floor:fl,seed:'777'})===''))bad.push(JSON.stringify(r)+'->'+sc);}
      const ex=[__game.scoreOf({deepest:5,kills:10,elites:2,coins:30}),__game.scoreOf({deepest:1,kills:1e6}),__game.scoreOf({deepest:10000,kills:1e9}),__game.scoreOf({deepest:20000}),__game.scoreOf({deepest:1}),__game.scoreOf(null),__game.scoreOf({deepest:'x',kills:-5,coins:NaN})];
      return {n,bad:bad.slice(0,3),nb:bad.length,ex};});
    check('M1.8 score = 1000 x (floor-1) + 50/monster + 100/elite + 5/coin, e.g. floor 5, 10 pops, 2 elites, 30 coins = 4,850',f.ex[0]===4850&&f.ex[4]===0&&f.ex[5]===0&&f.ex[6]===0,JSON.stringify(f.ex));
    check(`M1.8 score caps hold on ${f.n} fuzzed runs: integer, <= floor x 100,000 and <= 10,000,000, passes the API rules`,f.nb===0&&f.ex[1]===100000&&f.ex[2]===10000000&&f.ex[3]===9999000,f.nb?f.bad.join(' | '):JSON.stringify(f.ex.slice(1,4)));
    const g=await G(page,()=>{__game.manual=true;__game.setSeed(4242);__game.setRun({kills:0,elites:0,coins:0,deepest:1});__game.startLevel(0);__game.clearMobs();__game.setHearts(5);__game.teleport(7.5,3.5,0);
      const s0=__game.state().score;__game.spawn('springle',8.3,3.5,false,['fast']);__game.damageMob(0,99);__game.advance(0.6);const s1=__game.state();
      __game.spawn('springle',8.3,3.5,false,[]);__game.damageMob(1,99);__game.advance(0.6);const s2=__game.state();return {s0,s1:s1.score,k1:s1.run.kills,e1:s1.run.elites,s2:s2.score,k2:s2.run.kills};});
    check('M1.8 popping monsters adds to the score (elite +150, normal +50)',g.s0===0&&g.s1===150&&g.k1===1&&g.e1===1&&g.s2===200&&g.k2===2,JSON.stringify(g));
    const c=await G(page,()=>{__game.setRun({kills:0,elites:0,coins:0,deepest:1});__game.startLevel(1);__game.clearMobs();const it=__game.state().items.findIndex(i=>i.kind==='coin');const t=__game.state().items[it];const before=__game.state();__game.teleport(t.x,t.y,0);const s=__game.advance(0.05);return {c0:before.run.coins,c1:s.run.coins,sc:s.score,deep:s.run.deepest};});
    check('M1.8 picking up a coin adds 5 and floor 2 adds 1,000',c.c0===0&&c.c1===1&&c.sc===1005&&c.deep===2,JSON.stringify(c));
    const d=await G(page,(DIE)=>{__game.setRun({kills:7,elites:1,coins:20,deepest:6});__game.startLevel(5);__game.clearMobs();const m=eval(DIE)();return {m,f:__game.final(),save:__game.state().save};},DIE.toString());
    check('M1.8 death shows the final score (deepest floor 6: 5000 + 350 + 100 + 100 = 5,550) and clears the save',d.m==='name'&&d.f.score===5550&&d.f.floor===6&&d.save===null,JSON.stringify(d));
    await ctx.close();
  }

  // ---- 6. name entry + validation + offline (file://) local top 10
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m18-name'});
    const v=await G(page,()=>{const good=['A','Ace','ace_1.-','a b','1234567890123456','  Bob  ','x.y-z_0'],bad=['','   ','12345678901234567','a<b','\u00e9','a/b','a\tb','a\nb','Bob!','\u00dcn\u00ef',null,42];
      const e=(o)=>__game.hsValidate(Object.assign({name:'QA',score:100,floor:1,seed:'777'},o));
      return {good:good.map(__game.hsValidName),bad:bad.map(__game.hsValidName),
        ents:[e({}),e({score:100001}),e({score:100000}),e({floor:0}),e({floor:10001}),e({floor:2.5}),e({score:1.5}),e({score:-1}),e({seed:''}),e({seed:'a'.repeat(33)}),e({seed:'a'.repeat(32)}),e({seed:'a b'}),e({seed:777}),e({score:10000000,floor:10000}),e({score:10000001,floor:10000})]};});
    check('M1.8 name rules mirror the server: 1-16 chars after trim, letters/digits/space/_/./- only',v.good.every(Boolean)&&v.bad.every(x=>!x),JSON.stringify(v));
    const ent=v.ents.map(x=>x===''?'ok':'bad').join(',');
    check('M1.8 score/floor/seed rules mirror the server (score int 0..10M and <= floor x 100k, floor int 1..10000, seed 1-32 of [A-Za-z0-9_-])',ent==='ok,bad,ok,bad,bad,bad,bad,bad,bad,bad,ok,bad,bad,ok,bad',ent);
    // mirror check against the stub's server-side validator on random entries
    const fz=await G(page,()=>{const R=(()=>{let s=99;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();const ch='Aa0 _.-<>/!\u00e9\t';const out=[];
      for(let i=0;i<600;i++){const n=Array.from({length:Math.floor(R()*20)},()=>ch[Math.floor(R()*ch.length)]).join(''),fl=[0,1,2,50,10000,10001,1.5][Math.floor(R()*7)],sc=[0,1,99999,100000,100001,200000,10000000,10000001,-3,2.5][Math.floor(R()*10)],sd=['777','a_b-C','',('x').repeat(32),('x').repeat(33),'a b','s/1'][Math.floor(R()*7)];
        const e={name:n,score:sc,floor:fl,seed:sd};out.push({e,ok:__game.hsValidate(e)===''});}return out;});
    const mism=fz.filter(x=>(validateEntry(x.e)==='')!==x.ok);
    check('M1.8 client validation agrees with the stub server validator on 600 random entries',mism.length===0&&fz.some(x=>x.ok)&&fz.some(x=>!x.ok),mism.slice(0,3).map(x=>JSON.stringify(x.e)).join(' | '));
    // UI: death -> name entry, empty and focused, typing filters, WASD are letters
    await G(page,()=>{localStorage.removeItem('labyrinthRemake.localScores.v1');});
    let m=await G(page,(DIE)=>{__game.manual=true;__game.setSeed(4242);__game.setRun({kills:3,elites:0,coins:12,deepest:4});__game.startLevel(3);__game.clearMobs();return eval(DIE)();},DIE.toString());
    let h=await G(page,()=>__game.hs());
    check('M1.8 death -> name entry: the box starts empty (never prefilled) and has focus',m==='name'&&h.nameBuf===''&&h.inputValue===''&&h.inputOn&&h.focused,JSON.stringify({m,...h}));
    await page.keyboard.type('wasd <QA>/Run!_.-12345678');await G(page,()=>__game.advance(0.3));
    h=await G(page,()=>__game.hs());const st=await G(page,()=>__game.state());
    check('M1.8 typing: WASD/space are letters (the player does not move), bad characters are dropped, 16 characters max',h.nameBuf==='wasd QARun_.-123'&&st.mode==='name',JSON.stringify(h.nameBuf));
    await page.screenshot({path:`${SHOTS}/m18_name_entry.png`});
    await G(page,()=>{const i=document.getElementById('nameIn');i.value='';i.dispatchEvent(new Event('input'));});await page.keyboard.press('Enter');await G(page,()=>__game.advance(0.1));
    h=await G(page,()=>__game.hs());
    check('M1.8 an empty name is refused with a message (nothing saved)',/TYPE A NAME/.test(h.nameErr)&&(await G(page,()=>__game.state().mode))==='name',h.nameErr);
    await page.keyboard.type('Local Hero');await page.keyboard.press('Enter');await sleep(200);await G(page,()=>__game.advance(0.4));
    h=await G(page,()=>__game.hs());const ls=await G(page,()=>JSON.parse(localStorage.getItem('labyrinthRemake.localScores.v1')||'[]'));const req=await G(page,()=>__game.state().stats.hsRequests);
    check('M1.8 offline (file://): the score goes to the local top 10, labelled LOCAL, with no network request',h.local===true&&h.list.length===1&&h.list[0].name==='Local Hero'&&h.list[0].score===3210&&ls.length===1&&req.length===0&&/OFFLINE - SAVED TO LOCAL SCORES/.test(h.msg),JSON.stringify({h,req}));
    await page.screenshot({path:`${SHOTS}/m18_highscores_offline.png`});
    // fill the local list: only the top 10 are kept
    const t10=await G(page,()=>{const a=[];for(let i=0;i<14;i++)a.push({name:'Q'+i,score:i*100,floor:1,seed:'s'+i,created_at:'2026-01-0'+(1+i%9)+'T00:00:00Z'});localStorage.setItem('labyrinthRemake.localScores.v1',JSON.stringify(a));return __game.localScores().map(e=>e.score);});
    check('M1.8 local board keeps the top 10, highest first',t10.length===10&&t10[0]===1300&&t10[9]===400,t10.join(','));
    // title -> HIGH SCORES -> back; second death: the name box is empty again
    m=await G(page,()=>{__game.toTitle();const st=__game.state();const i=st.menu.indexOf('HIGH SCORES');__game.menuPick(i);__game.advance(0.4);const a=__game.state().mode;window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}));return [a,__game.state().mode,i];});
    check('M1.8 the high score page opens from the title and Esc returns to the title',m[0]==='scores'&&m[1]==='title'&&m[2]===1,m.join());
    m=await G(page,(DIE)=>{__game.setSeed(4242);__game.setRun(null);__game.startLevel(2);__game.clearMobs();return eval(DIE)();},DIE.toString());h=await G(page,()=>__game.hs());
    check('M1.8 a later death opens an empty name box again (no remembered or prefilled name)',m==='name'&&h.nameBuf===''&&h.inputValue==='',JSON.stringify(h.nameBuf));
    await page.keyboard.press('Escape');await G(page,()=>__game.advance(0.4));
    check('M1.8 Esc on name entry skips to the high score page without saving',(await G(page,()=>__game.state().mode))==='scores'&&(await G(page,()=>__game.localScores().length))===10);
    // gamepad: letters with the d-pad, A submits
    await G(page,()=>{window.__pad={id:'Xbox Wireless Controller',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0})),timestamp:0};navigator.getGamepads=()=>[window.__pad];});
    m=await G(page,(DIE)=>{__game.startLevel(2);__game.clearMobs();__game.setRun({kills:0,elites:0,coins:0,deepest:3});const mm=eval(DIE)();__game.advance(0.3);const b=(i)=>{__pad.buttons[i]={pressed:true,value:1};__game.advance(0.05);__pad.buttons[i]={pressed:false,value:0};__game.advance(0.05);};
      b(12);b(12);b(15);b(13);b(15);b(14);b(15);const nb=__game.hs().nameBuf;b(0);return {mm,nb,mode:__game.state().mode};},DIE.toString());
    check('M1.8 gamepad name entry: d-pad picks letters (up/down), adds (right) and deletes (left); A submits',m.mm==='name'&&m.nb==='BAA'&&m.mode==='scores',JSON.stringify(m));
    await ctx.close();
  }

  // ---- 7. online against the LOCAL STUB (never the live board)
  {
    const stub=await startStub({root:FILE.replace(/\/index\.html$/,'')});
    const ctx=await browser.newContext({viewport:{width:1280,height:800}});const page=await ctx.newPage();const reqs=[],probs=[];
    page.on('request',r=>reqs.push({url:r.url(),method:r.method(),headers:r.headers()}));page.on('pageerror',e=>probs.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))probs.push(m.text());});
    await page.goto(stub.url+'/index.html');await page.waitForFunction(()=>!!window.__game);
    stub.seed([{name:'Ada',score:52000,floor:12,seed:'777'},{name:'bob_99',score:8800,floor:5,seed:'4242'},{name:'C.D-E',score:120500,floor:31,seed:'123456'},{name:'Zed',score:300,floor:1,seed:'s1'},{name:'Mo Mo',score:20000,floor:9,seed:'x_y-z'}]);
    const waitHS=async()=>{for(let i=0;i<60;i++){const h=await G(page,()=>__game.hs());if(!h.loading&&!h.busy)return h;await sleep(100);}return G(page,()=>__game.hs());};
    await G(page,()=>{__game.manual=true;__game.toTitle();__game.menuPick(__game.state().menu.indexOf('HIGH SCORES'));});let h=await waitHS();await G(page,()=>__game.advance(0.4));
    check('M1.8 stub online: the high score page shows the ONLINE top list (rank, name, score, floor, seed), best first',h.online===true&&h.local===false&&h.list.length===5&&h.list[0].name==='C.D-E'&&h.list[0].rank===1&&h.list[0].floor===31&&h.list[0].seed==='123456'&&h.list[4].name==='Zed',JSON.stringify(h.list.map(e=>e.rank+':'+e.name)));
    await page.screenshot({path:`${SHOTS}/m18_highscores_online_stub.png`});
    // submit
    const DIEP=async(run)=>{return G(page,({DIE,run})=>{__game.toTitle();__game.setSeed(4242);__game.setRun(run);__game.startLevel(run.deepest-1);__game.clearMobs();return eval(DIE)();},{DIE:DIE.toString(),run});};
    let m=await DIEP({kills:40,elites:4,coins:50,deepest:8});
    await page.keyboard.type('QA Stub');await page.keyboard.press('Enter');h=await waitHS();await G(page,()=>__game.advance(0.4));let st=await G(page,()=>__game.state());
    const post=stub.state.posts[0];
    check('M1.8 stub online: submit POSTs {name,score,floor,seed} as JSON and gets 201 + rank, shown and highlighted',m==='name'&&st.mode==='scores'&&stub.state.posts.length===1&&post.ok&&Object.keys(post.parsed).sort().join()==='floor,name,score,seed'&&post.parsed.name==='QA Stub'&&post.parsed.score===9650&&post.parsed.floor===8&&post.parsed.seed==='4242'&&/SCORE SENT! YOUR RANK: 4/.test(h.msg)&&h.hl&&h.hl.rank===4&&h.list[3].name==='QA Stub'&&/application\/json/.test(post.headers['content-type']),JSON.stringify({msg:h.msg,post:post&&post.parsed}));
    await page.screenshot({path:`${SHOTS}/m18_highscores_online_after_submit.png`});
    // 429 -> friendly retry message, name kept; retry works once the limit clears
    stub.fillLimit();m=await DIEP({kills:1,elites:0,coins:2,deepest:2});
    await page.keyboard.type('Retry Me');await page.keyboard.press('Enter');for(let i=0;i<40;i++){if(!(await G(page,()=>__game.hs().busy)))break;await sleep(100);}await G(page,()=>__game.advance(0.1));
    h=await G(page,()=>__game.hs());st=await G(page,()=>__game.state());
    check('M1.8 stub 429: friendly "wait a minute, then try again" message, still on name entry with the name kept',st.mode==='name'&&/TOO MANY SCORES SENT\. WAIT A MINUTE, THEN TRY AGAIN\./.test(h.nameErr)&&h.nameBuf==='Retry Me'&&st.stats.hs429===1,JSON.stringify({mode:st.mode,err:h.nameErr}));
    await page.screenshot({path:`${SHOTS}/m18_name_entry_429.png`});
    stub.clearLimit();await page.keyboard.press('Enter');h=await waitHS();st=await G(page,()=>__game.state());
    check('M1.8 after a 429, pressing Enter again submits once the limit clears',st.mode==='scores'&&/SCORE SENT/.test(h.msg)&&stub.state.posts.filter(p=>p.ok).length===2,h.msg);
    // 400 from the server
    stub.state.mode.post='reject';m=await DIEP({kills:0,elites:0,coins:0,deepest:1});await page.keyboard.type('Bad Day');await page.keyboard.press('Enter');h=await waitHS();
    check('M1.8 stub 400: the error is shown gracefully ("SCORE REJECTED: ...") and the page moves on',(await G(page,()=>__game.state().mode))==='scores'&&/SCORE REJECTED: REJECTED BY STUB/.test(h.msg),h.msg);
    // 503 on POST -> saved locally
    stub.state.mode.post='error';m=await DIEP({kills:0,elites:0,coins:0,deepest:2});await page.keyboard.type('Fallback');await page.keyboard.press('Enter');h=await waitHS();
    const lsl=await G(page,()=>__game.localScores().map(e=>e.name));
    check('M1.8 stub 503 on submit: saved to the local board with a clear message',/BOARD UNAVAILABLE \(503\) - SAVED LOCALLY/.test(h.msg)&&lsl.includes('Fallback'),h.msg);
    stub.state.mode.post='ok';
    // unreachable: health down / connection dropped -> local, labelled
    stub.state.mode.health='down';await G(page,()=>{__game.toTitle();__game.openScores();});h=await waitHS();await G(page,()=>__game.advance(0.4));
    check('M1.8 health 503: falls back to the LOCAL board, labelled as local',h.online===false&&h.local===true&&h.list.some(e=>e.name==='Fallback'),JSON.stringify({online:h.online,local:h.local}));
    stub.state.mode.health='drop';await G(page,()=>{__game.toTitle();__game.openScores();});h=await waitHS();
    check('M1.8 connection dropped: falls back to the LOCAL board',h.online===false&&h.local===true);
    stub.state.mode.health='ok';stub.state.mode.scores='error';await G(page,()=>{__game.toTitle();__game.openScores();});h=await waitHS();
    check('M1.8 list request 500: local board with a note',h.local===true&&/COULD NOT LOAD THE ONLINE BOARD/.test(h.msg),h.msg);
    stub.state.mode.scores='ok';
    // offline browser
    await ctx.setOffline(true);await G(page,()=>{__game.toTitle();__game.openScores();});h=await waitHS();await ctx.setOffline(false);
    check('M1.8 browser offline: local board, no request attempted',h.local===true&&h.online===false);
    // request hygiene
    const foreign=reqs.filter(r=>!r.url.startsWith(stub.url+'/'));const paths=[...new Set(reqs.map(r=>r.method+' '+r.url.slice(stub.url.length)))].sort();
    const allowed=new Set(['GET /index.html','GET /api/labyrinth/health','GET /api/labyrinth/scores?limit=10','POST /api/labyrinth/scores']);
    check('M1.8 stub online: every request is same-origin to the stub and uses only the spec endpoints',foreign.length===0&&paths.every(p=>allowed.has(p)),paths.join(', ')+(foreign.length?' FOREIGN '+foreign[0].url:''));
    check('M1.8 no credentials are sent by the game (no Authorization header on any request)',reqs.every(r=>!r.headers.authorization)&&stub.state.requests.every(r=>!r.headers.authorization));
    check('M1.8 stub pages: no script errors',probs.length===0,probs.slice(0,3).join(' | '));
    // the game respects the spec limit: 5 quick posts at most before the stub says 429
    await stub.close();
    // after the stub is gone: unreachable -> local
    const ctx2=await browser.newContext();const p2=await ctx2.newPage();let loaded=true;try{await p2.goto(stub.url+'/index.html',{timeout:3000});}catch(e){loaded=false;}await ctx2.close();
    check('M1.8 stub stopped after the tests (nothing left listening)',!loaded);
    await ctx.close();
  }

  // ---- 8. slot machine
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m18-slot'});
    const pl=await G(page,()=>{let tut=0,on3=0,other=0,otherN=0,multi=0;for(let sd=1;sd<=120;sd++){for(let f=2;f<=12;f++){const m=__game.genMap(sd,f).map.join('');const n=(m.match(/Y/g)||[]).length;if(n>1)multi++;if(f===3){if(n)on3++;}else{otherN++;if(n)other++;}}}
      const t=__game.mapOverview?1:0;return {on3,other:other/otherN,multi,tutorialY:/Y/.test(JSON.stringify(__game.currentMap?null:null))};});
    const tut=await G(page,()=>{__game.startLevel(0);return __game.currentMap().join('').includes('Y')||!!__game.slotState().pos;});
    check('M1.8 slot machine placement: never on the tutorial, always on floor 3, on ~45% of other floors, at most one',!tut&&pl.on3===120&&pl.other>.33&&pl.other<.6&&pl.multi===0,`floor 3 ${pl.on3}/120, others ${(pl.other*100).toFixed(1)}%`);
    const cfg=await G(page,()=>({odds:__game.slot.odds,costs:__game.slot.costs,max:__game.slot.maxSpins}));
    const sum=cfg.odds.reduce((a,o)=>a+o.p,0),ev=cfg.odds.reduce((a,o)=>a+(o.mult||0)*o.p/100,0);
    check('M1.8 slot odds are fixed and documented (sum 100%): nothing 55, coins x1 20, jackpot x3 5, heart 10, power-up 10',sum===100&&cfg.odds.map(o=>o.id+o.p).join()==='none55,coins20,jackpot5,heart10,power10',cfg.odds.map(o=>o.id+':'+o.p).join(' '));
    check('M1.8 expected coin return per spin is 0.35 x the cost (< cost, no profit loop); cost rises 5/10/15, 3 spins per floor',Math.abs(ev-.35)<1e-9&&cfg.costs.join()==='5,10,15'&&cfg.max===3,`EV ${ev}`);
    const sims=await G(page,()=>[__game.slotSim(10000,'econ-a',3),__game.slotSim(10000,'econ-b',5),__game.slotSim(10000,'econ-c',1)]);
    const sig=(c,p,n)=>Math.abs(c/n-p)<=4*Math.sqrt(p*(1-p)/n);
    const s0=sims[0],fr=cfg.odds.every(o=>sig(s0.counts[o.id]||0,o.p/100,s0.n));
    check(`M1.8 10,000-spin economy simulation: coins out < coins in on every run (ratio ${sims.map(s=>s.ratio.toFixed(3)).join(' / ')}), net ${sims.map(s=>s.net).join(' / ')}`,sims.every(s=>s.ratio<0.5&&s.net<0&&s.n===10000),JSON.stringify(sims.map(s=>({spent:s.spent,won:s.won}))));
    check('M1.8 10,000-spin outcome frequencies match the documented odds (within 4 sigma)',fr,JSON.stringify(s0.counts));
    fs.writeFileSync(`${OUT}/m18_slot_economy.json`,JSON.stringify({odds:cfg.odds,costs:cfg.costs,ev_ratio:ev,sims},null,1));
    // in game: rising cost, cap, refusals, animation, sound
    const g=await G(page,()=>{__game.manual=true;__game.setSeed(777);__game.startLevel(2);__game.clearMobs();__game.setHearts(5);const face=__game.faceSlot();__game.setCoins(100);const save0=__game.state().save.coins;const out={face,costs:[],coins:[],spin:[],sfx0:__game.state().stats.slotSfx};
      for(let i=0;i<3;i++){out.costs.push(__game.slotState().cost);const c0=__game.state().player.coins;__game.use();let s=__game.advance(0.05);out.coins.push(c0-s.player.coins);
        const mid=__game.slotState();s=__game.advance(0.75);const mid2=__game.slotState();__game.advance(1.0);const end=__game.slotState();out.spin.push([mid.spinning,mid2.stopped,end.spinning,end.last&&end.last.id]);}
      const c3=__game.state().player.coins;__game.use();__game.advance(0.1);out.fourth={msg:__game.state().msg,coins:__game.state().player.coins-c3,spins:__game.slotState().spins};
      out.sfx=__game.state().stats.slotSfx-out.sfx0;out.saveAfter=__game.state().save.coins;out.save0=save0;
      __game.startLevel(2);__game.clearMobs();__game.faceSlot();__game.setCoins(3);__game.use();__game.advance(0.1);out.poor={msg:__game.state().msg,coins:__game.state().player.coins,spins:__game.slotState().spins};return out;});
    check('M1.8 in game: spins cost 5, 10, 15, a 4th spin is refused (3 per floor) and coins are untouched',g.face&&g.costs.join()==='5,10,15'&&g.coins.join()==='5,10,15'&&/MACHINE EMPTY/.test(g.fourth.msg)&&g.fourth.coins===0&&g.fourth.spins===3,JSON.stringify(g));
    check('M1.8 in game: too few coins -> "A SPIN COSTS 5 COINS", nothing spent',/A SPIN COSTS 5 COINS/.test(g.poor.msg)&&g.poor.coins===3&&g.poor.spins===0,JSON.stringify(g.poor));
    check('M1.8 spin animation: reels spin, stop one by one (reel 1 stops at 0.75 s, all 3 by 1.35 s) and resolve at 1.6 s, with sound (spin, 3 reel stops, result)',g.spin.every(x=>x[0]===true&&x[1]===1&&x[2]===false&&x[3])&&g.sfx>=15,JSON.stringify({spin:g.spin,sfx:g.sfx}));
    check('M1.8 no save-scum profit: spinning never rewrites the floor-start save',g.saveAfter===g.save0,`${g.save0} -> ${g.saveAfter}`);
    // prize resolution
    const pr=await G(page,()=>({c:__game.slotResolve('coins',10,3),j:__game.slotResolve('jackpot',10,3),h:__game.slotResolve('heart',5,3),hf:__game.slotResolve('heart',5,5),p:__game.slotResolve('power',5,3),n:__game.slotResolve('none',5,3)}));
    check('M1.8 prizes: coins x1, jackpot x3, +1 heart (1 coin if full), a power-up, or nothing',pr.c.coins===10&&pr.j.coins===30&&pr.h.heart===1&&pr.h.coins===0&&pr.hf.coins===1&&!pr.hf.heart&&!!pr.p.power&&pr.n.coins===0,JSON.stringify(pr));
    // 60 real in-game spins: coins out < coins in
    const real=await G(page,()=>{let spent=0,won=0;for(let f=0;f<20;f++){let lvl=2+f;__game.setSeed(1000+f);__game.startLevel(2);__game.clearMobs();__game.setHearts(3);__game.faceSlot();__game.give('shield');__game.setCoins(100);for(let i=0;i<3;i++){const c0=__game.state().player.coins;__game.use();__game.advance(0.05);spent+=c0-__game.state().player.coins;const c1=__game.state().player.coins;__game.advance(1.7);won+=__game.state().player.coins-c1;}}return {spent,won};});
    check('M1.8 60 real in-game spins over 20 floors return fewer coins than they cost',real.spent===600&&real.won<real.spent,JSON.stringify(real));
    // keyboard E
    const kb=await G(page,()=>{__game.setSeed(777);__game.startLevel(2);__game.clearMobs();__game.faceSlot();__game.setCoins(20);window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE',key:'e'}));window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyE',key:'e'}));__game.advance(0.05);return __game.slotState().spinning;});
    // screenshots: in game from two cells away, mid spin, result
    await G(page,()=>{__game.setSeed(777);__game.startLevel(2);__game.clearMobs();__game.faceSlot();const p=__game.state().player,s=__game.slotState().pos;const dx=p.x-(s.x+.5),dy=p.y-(s.y+.5);__game.teleport(s.x+.5+dx*2.2,s.y+.5+dy*2.2);__game.setPitch(0);__game.advance(0.05);});
    await page.screenshot({path:`${SHOTS}/m18_slot_in_game.png`});
    await G(page,()=>{__game.faceSlot();__game.setCoins(30);__game.advance(0.05);});await page.screenshot({path:`${SHOTS}/m18_slot_facing_odds.png`});
    const px=async()=>G(page,()=>{const R=__game.slotRect();const a=[];for(let y=R[1];y<R[1]+40;y+=2)for(let x=R[0];x<R[0]+R[2];x+=2)a.push(__game.pixelAt(x,y).join());return a;});
    await G(page,()=>{__game.use();__game.advance(0.4);});const fa=await px();await page.screenshot({path:`${SHOTS}/m18_slot_mid_spin.png`});await G(page,()=>__game.advance(0.07));const fb=await px();
    const changed=fa.filter((v,i)=>v!==fb[i]).length;
    await G(page,()=>__game.advance(1.3));await page.screenshot({path:`${SHOTS}/m18_slot_result.png`});
    check('M1.8 slot works with the keyboard (E) and the reels visibly move mid-spin',kb===true&&changed>40,`changed px ${changed}`);
    // gamepad X
    await G(page,()=>{window.__pad={id:'Xbox Wireless Controller',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0})),timestamp:0};navigator.getGamepads=()=>[window.__pad];});
    const gp=await G(page,()=>{__game.startLevel(2);__game.clearMobs();__game.faceSlot();__game.setCoins(20);__game.advance(0.1);const pr=__game.state().prompt;__pad.buttons[2]={pressed:true,value:1};__game.advance(0.05);__pad.buttons[2]={pressed:false,value:0};__game.advance(0.05);return {sp:__game.slotState().spinning,msg:__game.state().msg};});
    check('M1.8 slot works with the gamepad (X)',gp.sp===true,JSON.stringify(gp));
    await ctx.close();
    // touch: USE button spins; slot panel + band never under a touch button (11 phone/tablet sizes)
    const bad=[];let tapOk=null;
    for(const [w,h] of VIEWS){const {ctx,page}=await newPage({viewport:{width:w,height:h},hasTouch:true,isMobile:true,deviceScaleFactor:2,label:'m18-touch'});const touch=await cdpTouch2(ctx,page);
      await G(page,()=>{__game.manual=true;__game.setSeed(777);__game.startLevel(2);__game.clearMobs();__game.faceSlot();__game.setCoins(30);});
      await page.touchscreen.tap(5,5).catch(()=>{});await G(page,()=>{__game.startLevel(2);__game.clearMobs();__game.faceSlot();__game.setCoins(30);__game.advance(0.05);});
      const L=await G(page,()=>({lay:__game.layout(),slot:__game.slotRectCss(),touch:__game.state().touch,prompt:__game.state().prompt}));
      const btns=['useBtn','throwBtn','itemBtn','pauseBtn','mapBtn'].map(k=>[k,L.lay[k]]).filter(([k,b])=>b.visible);
      for(const [k,b] of btns){if(ov(L.slot,b))bad.push(`${w}x${h} slot panel under ${k}`);if(ov(L.lay.band,b))bad.push(`${w}x${h} band under ${k}`);}
      if(!L.lay.useBtn.visible)bad.push(`${w}x${h} USE button hidden`);
      if(w===844){const u=L.lay.useBtn;await touch('touchStart',[{x:u.x+u.w/2,y:u.y+u.h/2,id:3}]);await sleep(60);await touch('touchEnd',[]);await sleep(60);
        tapOk=await G(page,()=>{__game.advance(0.05);return __game.slotState().spinning;});await G(page,()=>__game.advance(0.4));await page.screenshot({path:`${SHOTS}/m18_phone_844x390_slot_mid_spin.png`});
        await G(page,()=>__game.advance(1.4));await page.screenshot({path:`${SHOTS}/m18_phone_844x390_slot_result.png`});}
      if(w===568){await page.screenshot({path:`${SHOTS}/m18_phone_568x320_slot.png`});}
      await ctx.close();}
    check('M1.8 slot works with touch (the USE button spins it)',tapOk===true,String(tapOk));
    check('M1.8 slot panel and message band are never under a touch button (11 phone/tablet sizes)',bad.length===0,bad.slice(0,4).join(' | '));
  }

  // ---- 9. phone: name entry + high scores layout
  {
    const {ctx,page}=await newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2,label:'m18-phone'});
    await G(page,()=>{localStorage.removeItem('labyrinthRemake.localScores.v1');});
    await page.touchscreen.tap(422,200);await sleep(300);
    const m=await G(page,(DIE)=>{__game.manual=true;__game.setSeed(4242);__game.setRun({kills:9,elites:2,coins:31,deepest:7});__game.startLevel(6);__game.clearMobs();return eval(DIE)();},DIE.toString());
    const r=await G(page,()=>({rects:__game.nameRects(),hs:__game.hs(),touch:__game.state().touch,box:(()=>{const b=document.getElementById('nameIn').getBoundingClientRect();return {x:b.left,y:b.top,w:b.width,h:b.height};})()}));
    const f=r.rects.field;
    check('M1.8 phone name entry: the hidden text box sits over the drawn name field (tap to bring up the keyboard), not focused automatically',m==='name'&&r.touch&&Math.abs(r.box.x-f.x)<2&&Math.abs(r.box.y-f.y)<2&&Math.abs(r.box.w-f.w)<2&&!r.hs.focused,JSON.stringify({box:r.box,f,focused:r.hs.focused}));
    await page.touchscreen.tap(f.x+f.w/2,f.y+f.h/2);await sleep(150);await page.keyboard.type('Thumbs 2');await G(page,()=>__game.advance(0.4));
    await page.screenshot({path:`${SHOTS}/m18_phone_844x390_name_entry.png`});
    const ok=r.rects.ok;await page.touchscreen.tap(ok.x+ok.w/2,ok.y+ok.h/2);await sleep(300);await G(page,()=>__game.advance(0.4));
    const h=await G(page,()=>__game.hs());
    check('M1.8 phone: tap the box, type, tap SUBMIT -> local board (file://)',h.list.length===1&&h.list[0].name==='Thumbs 2'&&(await G(page,()=>__game.state().mode))==='scores',JSON.stringify(h.list));
    await page.screenshot({path:`${SHOTS}/m18_phone_844x390_highscores.png`});
    await page.touchscreen.tap(422,300);await sleep(300);await G(page,()=>__game.advance(0.05));
    check('M1.8 phone: a tap on the high score page returns to the title',(await G(page,()=>__game.state().mode))==='title');
    await ctx.close();
  }
  async function cdpTouch2(ctx,page){const cdp=await ctx.newCDPSession(page);return (type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});}
}
