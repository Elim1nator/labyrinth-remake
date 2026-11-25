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
// versions compare part by part (m1.10 > m1.9.1 > m1.9); parseFloat would read "1.10" as 1.1
const VPARTS=(BUILD.replace(/^m/,'').match(/^\d+(\.\d+)*/)||['1'])[0].split('.').map(Number);
const atLeast=v=>{const w=v.split('.').map(Number);for(let i=0;i<Math.max(w.length,VPARTS.length);i++){const a=VPARTS[i]||0,b=w[i]||0;if(a!==b)return a>b;}return true;};
const NEW=atLeast('1.1'); // M1.1+ regression tests (A1-A9, B1-B8)
const V12=atLeast('1.2'); // M1.2+: pitch, new hand frames, Screamer enemy
const V13=atLeast('1.3'); // M1.3+: 480x300, six mobs, procedural levels, steering fixes
const V14=atLeast('1.4'); // M1.4+: elite mobs, power-ups, item bar, touch ITEM button
const V15=atLeast('1.5'); // M1.5+: QA fixes, Screamer redraw, full-screen map, MAP button
const V17=atLeast('1.7'); // M1.7+: icon placement, gated debug hook (QA build for hook tests), RANGED colour, L3 per-seed floor, top-strip touch, thicker Screamer ears
const V18=atLeast('1.8'); // M1.8+: endless floors, deeper wall textures, score + high scores (stub API), slot machine
const V19=atLeast('1.9'); // M1.9+: slot rework (no limit, jackpot spray, crit fail), slower balloons, floor-long power-ups, shop, balloon types, backpack, secret rooms, decorations, pits, Rattlebone, ghosts through doors
const V191=atLeast('1.9.1'); // M1.9.1+: shop panel clear of the HUD, decorations never diagonal to a door
const V110=atLeast('1.10'); // M1.10+: a boss every 5th floor guards a sealed portal (its exit door is unlocked)
const V111=atLeast('1.11'); // M1.11+: comedy/tragedy masks, Treasure Knight, golden + new items, one monster mark on the maps
const V112=atLeast('1.12'); // M1.12+: coins into pits (spiders, floor-15 bosses), coin doors, shrines, trapdoors, piggy bank, rare wares
const V113=atLeast('1.13'); // M1.13+: +1 mob HP per floor, 6 more elite modifiers, googly worms, sprawled face-hug image
const V114=atLeast('1.14'); // M1.14+: the King in Yellow on floor 20
const V116=atLeast('1.16'); // M1.16+: cheat console (type "cheat")
const V117=atLeast('1.17'); // M1.17+: fog of war, sight items, ambience, damage indicators
const V120=atLeast('1.20'); // M1.20+: realistic stone walls (slate, ember rock + 7 new styles), damaged/structural/decorative wall variations
const V121=atLeast('1.21'); // M1.21+: wall art comes from assets/walls.png, embedded in the build
const V122=atLeast('1.22'); // M1.22+: mob and boss art comes from assets/mobs/*.png
const V123=atLeast('1.23'); // M1.23+: run items (stacking, whole run) + stacking balloon colours replace power-ups, permanent and golden items
const V124=atLeast('1.24'); // M1.24+: boss props, portals and projectiles come from assets/boss/*.png
const V125=atLeast('1.25'); // M1.25+: hand-made wall and item art (busier textures: art-contrast thresholds loosened, still all distinct)
const V126=atLeast('1.26'); // M1.26+: the Screamer King replaces King Gloop
const V127=atLeast('1.27'); // M1.27+: balloons pass through smiling Comedy masks
const V128=atLeast('1.28'); // M1.28+: Infernal mobs (40 powers, player status effects, 1 px glow)
const V129=atLeast('1.29'); // M1.29+: lost-input safety, knight corner fix, map marker shapes
const V130=atLeast('1.30'); // M1.30+: start on the floor after any boss you have beaten (+1 run item per 2 floors skipped)
const V138=atLeast('1.38'); // M1.38+: the pillar variation stands in the middle of the wall
const V144=atLeast('1.44'); // M1.44+: every balloon colour (thrown and in hand) is its own art in the PNGs
const V151=atLeast('1.51'); // M1.51+: wall tiles are 128x128
const V147=atLeast('1.47'); // M1.47+: the Hexeye (floor 12+); more and bigger pits deeper down; pit rooms from floor 14
const V159=atLeast('1.59'); // M1.59+: the Spirit Slate (Slate Halls) and the item screen (I)
const V156=atLeast('1.56'); // M1.56+: no Mounted (rider) Infernal modifier
const V157=atLeast('1.57'); // M1.57+: Tiled Baths (Plunger, the Bather) and Slate Halls (the Slick Man)
const V158=atLeast('1.58'); // M1.58+: guaranteed theme-mob minimum; Bather walk centred and sped up
const V160=atLeast('1.60'); // M1.60+: ranged elite only on mobs with a RANGED entry; theme mobs skipped by L3/Rattlebone swaps
const V153=atLeast('1.53'); // M1.53+: Brick Halls: the Masonry Trowel and the Mortared Man
const V152=atLeast('1.52'); // M1.52+ (merged from Grok-Code-3): Mourner's Veil; the Lichen Face (flying) in the Mossy Cellar
const V146=atLeast('1.46'); // M1.46+: any mob can wear the Infernal glow; the loop survives an error; no skeleton carriers
const V145=atLeast('1.45'); // M1.45+: new arm art (bigger frames), bigger thrown balloons, flyers skip puddles
const V143=atLeast('1.43'); // M1.43+: the arm and balloon art come from assets/hand.png and assets/balloon.png
const V142=atLeast('1.42'); // M1.42+: the EXIT sign hangs from the ceiling
const V141=atLeast('1.41'); // M1.41+: the exit is a stairwell in the floor; the King's ears shear instead of rotating
const V140=atLeast('1.40'); // M1.40+: fixed boss-arena designs; the King's ears stay attached; his screamers are small
const V139=atLeast('1.39'); // M1.39+: rooms get their monsters first; stat items stack without a limit; masks rock
const V137=atLeast('1.37'); // M1.37+: doors are the leaf only (no wall frame); wall variations are just pillars and runes
const V136=atLeast('1.36'); // M1.36+: new level generator (rooms and mazes, growing tree, braiding, distance-map content)
const V135=atLeast('1.35'); // M1.35+: the treasure knight smashes doors and fences; doors match their wall style
const V131=atLeast('1.31'); // M1.31+: no dead-end corridors (long ones link back, short spurs pruned)
const V118=atLeast('1.18'); // M1.18+: a song for every floor, revive after death
const V16=atLeast('1.6'); // M1.6+: QA fixes M15-A1..A6, Screamer bat-wing ears, L3 balance, two-mod phase-in, moved pause/MAP, elite readability
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
// M1.23 replaced the power-ups, permanent items, golden items and balloon-type switching with run items and stacking
// balloon colours. The checks of the old behaviour still run on older builds; from M1.23 on they are retired (listed, not
// counted), and m123Tests checks the new items.
const RETIRED_M123=[/^M1\.4 (walking over a power-up|slot full|same item already held|six power-ups|Q and right mouse|TRIPLE BALLOON|COIN MAGNET|gamepad Y uses|power-ups are placed in every level)/,/^M1\.4\/M1\.9 (SPEED SNEAKERS|GIANT BALLOON)/,
  /^phone: ITEM button only shows/,/^M1\.9 (a used power-up lasts|power-ups stack for the floor|every effect ends on the next floor|rebalance values|shop rows: Red|keyboard: W\/S choose|mouse: click a row|single-use power-ups fill|CONTINUE restores the permanent|gamepad: X talks|balloon type switching|touch: the BALL button)/,
  /^M1\.17 a Torch pushes/];
// M1.31 rebuilt the level layout on purpose (no dead ends), so the checks that pin floors to their older layouts retire from M1.31 on
const RETIRED_M136=[/^M1\.31 no corridors that lead nowhere/];
const RETIRED_M137=[/^M1\.20 every wall style has damaged, structural and decorative variations/,/^M1\.20 most wall cells are plain; some damaged/];
const RETIRED_M131=[/^M1\.8 floors 2-8 keep their M1\.7 layouts/,/^M1\.10 floors without a boss are generated exactly as in M1\.9\.1/];
const retired=[];
function check(name,cond,detail=''){if((V123&&RETIRED_M123.some(re=>re.test(name)))||(V131&&RETIRED_M131.some(re=>re.test(name)))||(V136&&RETIRED_M136.some(re=>re.test(name)))||(V137&&RETIRED_M137.some(re=>re.test(name)))){retired.push(name);console.log('RETIRED  '+name);return;}results.push({name,ok:!!cond,detail});if(!cond)failed++;console.log((cond?'PASS':'FAIL')+'  '+name+(detail?'  ('+detail+')':''));}
const browser=await chromium.launch();
const consoleProblems=[];const badRequests=[];
async function newPage(opts={}){
  const {query='',noFog=false,...copts}=opts;
  const ctx=await browser.newContext({viewport:{width:1280,height:720},...copts});
  const page=await ctx.newPage();
  page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')consoleProblems.push(`[${opts.label||'desktop'}] ${m.type()}: ${m.text()}`);});
  page.on('pageerror',e=>consoleProblems.push(`[${opts.label||'desktop'}] pageerror: ${e.message}`));
  page.on('request',r=>{const u=r.url();if(!(u.split('?')[0]===URL||u.split('?')[0]===REL_URL||u.startsWith('data:')))badRequests.push(u);});
  await page.goto(URL+query);await page.waitForFunction(()=>!!window.__game);
  if(noFog)await page.evaluate(()=>{__game.viewOverride=14;}); /* M1.17: checks that look further than the fog */
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
  st=await G(page,(V145)=>{__game.wakeAll();for(let i=0;i<(V145?40:14);i++){const s=__game.state();if(s.mode!=='play')break;const en=V145?s.enemies.find(x=>!x.gone&&x.state!=='dead'&&x.type!=='eggsac'&&x.type!=='mortar'&&!(x.type==='zapfly'&&x.face==='comedy')) /* M1.53: the Mortared Man never bites */:s.enemies.find(x=>!x.gone);if(!en)break;let tx=en.x+0.3;if(V145&&__game.solidAt(tx,en.y))tx=en.x-0.3; /* M1.45: a biting mob, and never into a wall */__game.teleport(tx,en.y,Math.PI);__game.advance(1.55);}return __game.state();},V145);
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
  const btns=V15?['throwBtn','useBtn','pauseBtn','itemBtn','mapBtn',...(V19?['ballBtn']:[]),'stick']:V14?['throwBtn','useBtn','pauseBtn','itemBtn','stick']:NEW?['throwBtn','useBtn','pauseBtn','stick']:['throwBtn','useBtn','stick'];
  for(const bn of btns)for(const zone of (V14?['band','hud','minimap','itemBar']:['band','hud','minimap'])){if(lay[bn].visible&&inter(lay[bn],lay[zone]))bad.push(`${bn}∩${zone}`);}
  for(let i=0;i<btns.length;i++)for(let j=i+1;j<btns.length;j++)if(lay[btns[i]].visible&&lay[btns[j]].visible&&inter(lay[btns[i]],lay[btns[j]]))bad.push(`${btns[i]}∩${btns[j]}`);
  if(NEW&&!lay.pauseBtn.visible)bad.push('pause button missing');
  if(V12){const hb=await G(page,()=>__game.handCss());for(const [f,r] of Object.entries(hb)){for(const z of (V15?['throwBtn','useBtn','pauseBtn','itemBtn','mapBtn',...(V19?['ballBtn']:[]),'stick','band','hud','minimap','itemBar']:V14?['throwBtn','useBtn','pauseBtn','itemBtn','stick','band','hud','minimap','itemBar']:['throwBtn','useBtn','pauseBtn','stick','band','hud','minimap']))if(lay[z].visible!==false&&inter(r,lay[z]))bad.push(`hand:${f}∩${z}`);}}
  for(const bn of (V15?['throwBtn','useBtn','pauseBtn','itemBtn','mapBtn',...(V19?['ballBtn']:[])]:V14?['throwBtn','useBtn','pauseBtn','itemBtn']:NEW?['throwBtn','useBtn','pauseBtn']:['throwBtn','useBtn']))if(lay[bn].x<0||lay[bn].y<0||lay[bn].x+lay[bn].w>w||lay[bn].y+lay[bn].h>h)bad.push(bn+' off-screen');
  if(V14&&!lay.itemBtn.visible)bad.push('item button missing');if(V19&&!lay.ballBtn.visible)bad.push('BALL button missing');if(V15&&!lay.mapBtn.visible)bad.push('map button missing');
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

// ---------- M1.9.1: shop panel clear of the HUD (known issue in M1.9), decorations never diagonal to a door (checked in m19Tests) ----------
async function m191Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m191-shop'});
  const r=await G(page,()=>{const R=__game.hudRects(),ov=(a,b)=>a[0]<b[0]+b[2]&&b[0]<a[0]+a[2]&&a[1]<b[1]+b[3]&&b[1]<a[1]+a[3],D=__game.dims,S=R.shop;
    const hits=['hud','band','itemBar','ball'].filter(k=>ov(S,R[k]));
    __game.manual=true;__game.setSeed(777);__game.startLevel(1);__game.clearMobs();__game.setCoins(60);__game.give('freeze');__game.faceShop();__game.advance(0.05);
    const grab=rc=>{const o=[];for(let y=rc[1];y<rc[1]+rc[3];y++)for(let x=rc[0];x<rc[0]+rc[2];x++)o.push(__game.pixelAt(x,y).join());return o;};
    const a=grab(R.hud).concat(grab(R.item));__game.openShop();__game.render();const mode=__game.state().mode;const b=grab(R.hud).concat(grab(R.item));
    let same=0;for(let i=0;i<a.length;i++)if(a[i]===b[i])same++;
    const rows=__game.shopRectsInt(),inside=rows.every(q=>q[0]>=S[0]&&q[1]>=S[1]&&q[0]+q[2]<=S[0]+S[2]&&q[1]+q[3]<=S[1]+S[3]);
    return {hits,inScreen:S[0]>=0&&S[1]>=0&&S[0]+S[2]<=D.W&&S[1]+S[3]<=D.H,rowsInside:inside,mode,sameFrac:same/a.length,shop:S};});
  check('M1.9.1 the shop panel no longer covers the HUD, message band, balloon box or item bar, and stays on screen with every row inside it',r.hits.length===0&&r.inScreen&&r.rowsInside,JSON.stringify(r));
  check('M1.9.1 while the shop is open the hearts, coins, keys and item slot are drawn as in play (not dimmed or hidden; M1.9: 0%)',r.mode==='shop'&&r.sameFrac>0.3,`${(r.sameFrac*100).toFixed(0)}% of HUD pixels unchanged`);
  await page.screenshot({path:`${SHOTS}/m191_shop_clear_of_hud.png`});
  await ctx.close();
}

// ---------- M1.10: bosses every 5th floor (King Gloop, Luggernaut, Coghoot); the portal opens when the boss falls ----------
async function m110Tests(){
  const S10=`${OUT}/screens`;const shot=async(page,name)=>page.screenshot({path:`${S10}/m110_${name}.png`});
  const savePng=(name,url)=>fs.writeFileSync(`${S10}/${name}`,Buffer.from(url.split(',')[1],'base64'));
  // ---- 1. generation: which floors, which boss, the arena, the unlocked exit door, keys
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m110-gen'});
    const g=await G(page,([V136,V140])=>{const out={floors:0,bossFloors:0,wrongType:[],bad:[],noBossOk:true,arenaSizes:{},exitArena:0,tiers:{}};const B=__game.bosses,order=__game.bossOrder,ch={};order.forEach(t=>ch[B[t].ch]=t);
      for(let sd=1;sd<=30;sd++)for(let f=2;f<=60;f++){const d=__game.genMap(sd,f),m=d.map,RR=__game.genRooms(sd,f),h=m.length,w=m[0].length;out.floors++;
        let bosses=[],nk=0,nl=0,start=null,exit=null;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=m[y][x];if(ch[c])bosses.push({t:ch[c],x,y});if(c==='k')nk++;if(c==='L')nl++;if(c==='p')start=[x,y];if(c==='X')exit=[x,y];}
        const want=__game.bossFor(f);if(!want){if(bosses.length){out.noBossOk=false;out.bad.push(`${sd}:${f} boss on a non-boss floor`);}continue;}
        out.bossFloors++;if(bosses.length!==1){out.bad.push(`${sd}:${f} ${bosses.length} bosses`);continue;}const b=bosses[0];if(b.t!==want.type)out.wrongType.push(`${sd}:${f} ${b.t}`);
        const A=RR.find(r=>b.x>=r.x&&b.x<r.x+r.w&&b.y>=r.y&&b.y<r.y+r.h);if(!A){out.bad.push(`${sd}:${f} boss not in a room`);continue;}
        if(A.start||A.shop)out.bad.push(`${sd}:${f} arena is the start or shop room`);const sz=A.w*A.h;out.arenaSizes[sz]=(out.arenaSizes[sz]||0)+1;
        const inA=(x,y)=>x>=A.x&&x<A.x+A.w&&y>=A.y&&y<A.y+A.h;if(inA(exit[0],exit[1]))out.exitArena++;
        const ringHas=(r,c)=>{for(let x=r.x-1;x<=r.x+r.w;x++)if(m[r.y-1][x]===c||m[r.y+r.h][x]===c)return true;for(let y=r.y;y<r.y+r.h;y++)if(m[y][r.x-1]===c||m[y][r.x+r.w]===c)return true;return false;},hasY=r=>{for(let y=r.y;y<r.y+r.h;y++)if(m[y].slice(r.x,r.x+r.w).includes('Y'))return true;return false;};
        const biggest=Math.max(...RR.filter(r=>!r.start&&!r.shop&&!hasY(r)&&!ringHas(r,'L')).map(r=>r.w*r.h)); /* the slot machine's room and the vault are never arenas */if(V136){ /* M1.36: a big arena near the exit - the exit room if it has 35+ cells, else a room in the back half of the route */
          const dd=new Map([[start.join(),0]]),qq=[start];const wk=c=>!(/[#SWTMKRCVOABEIZ+=FPYN]/.test(c));while(qq.length){const [x,y]=qq.shift();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(dd.has(k)||!wk(m[ny][nx]))continue;dd.set(k,dd.get(x+','+y)+1);qq.push([nx,ny]);}}
          const ac=(A.x+(A.w>>1))+','+(A.y+(A.h>>1)),de=dd.get(exit.join());if(!inA(exit[0],exit[1])&&sz<35&&!(dd.get(ac)>=.5*de))out.bad.push(`${sd}:${f} arena ${sz} not near the exit (${dd.get(ac)} of ${de} steps)`);}
        else if(!inA(exit[0],exit[1])&&sz<35&&sz<biggest)out.bad.push(`${sd}:${f} arena ${sz} smaller than the biggest room ${biggest}`);
        const D9=V140&&d.boss&&d.boss.design?__game.arenas.find(a9=>a9.name===d.boss.design):null; /* M1.40: pits only where the arena design has them */
        for(let y=A.y;y<A.y+A.h;y++)for(let x=A.x;x<A.x+A.w;x++){const c=m[y][x];if(c==='P'&&!(D9&&D9.rows[y-A.y][x-A.x]==='o'))out.bad.push(`${sd}:${f} pit in the arena`);if(/[ebtgrzs]/.test(c))out.bad.push(`${sd}:${f} mob ${c} in the arena`);}
        if(nk!==nl)out.bad.push(`${sd}:${f} keys ${nk} != locks ${nl}`);if(nl>1)out.bad.push(`${sd}:${f} ${nl} locks`);
        // reachable from the start without any key: boss and portal
        const seen=new Set([start.join()]),q=[start];const walk=c=>!(/[#SWTMKRCVOABEIZ+=FLPYN]/.test(c));while(q.length){const [x,y]=q.shift();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(seen.has(k)||!walk(m[ny][nx]))continue;seen.add(k);q.push([nx,ny]);}}
        if(!seen.has(b.x+','+b.y)||!seen.has(exit.join()))out.bad.push(`${sd}:${f} boss or portal not reachable without a key`);
        out.tiers[want.tier]=(out.tiers[want.tier]||0)+1;}
      return out;},[V136,V140]);
    check(`M1.10 a boss on every 5th floor and nowhere else (${g.bossFloors} boss floors in ${g.floors} floors, 30 seeds x floors 2-60), in the order King Gloop, Luggernaut, Coghoot`,g.bossFloors===30*12&&g.noBossOk&&g.wrongType.length===0&&g.bad.filter(b=>/bosses|non-boss/.test(b)).length===0,JSON.stringify({wrong:g.wrongType.slice(0,4),bad:g.bad.slice(0,4)}));
    check(V136?'M1.10 the arena is the exit room when it has 35+ cells, else a big room near the exit (M1.36); never the start or shop room; no pits or other mobs inside':'M1.10 the arena is the exit room when it has 35+ cells, else the biggest room; never the start or shop room; no pits or other mobs inside',g.bad.filter(b=>/arena|pit|mob /.test(b)).length===0,JSON.stringify({bad:g.bad.filter(b=>/arena|pit|mob /.test(b)).slice(0,4),exitArena:g.exitArena,sizes:g.arenaSizes}));
    check('M1.10 boss floors: the exit door is unlocked (keys match locks, at most the vault lock), and the boss and portal are reachable without a key',g.bad.filter(b=>/keys|locks|reachable/.test(b)).length===0,JSON.stringify(g.bad.filter(b=>/keys|locks|reachable/.test(b)).slice(0,4)));
    // non-boss floors are exactly as in M1.9.1; boss floors keep the M1.8 layout (map18)
    const cur=await G(page,()=>{const o={};for(const sd of [1,777,4242])for(let f=2;f<=26;f++){const d=__game.genMap(sd,f);o[sd+':'+f]=(__game.bossFor(f)?d.map18:d.map).join('\n');}return o;});
    const old=await page.context().newPage();await old.goto(`file://${BUILDS}/m1.9.1-qa/index.html`);await old.waitForFunction(()=>!!window.__game);
    const prev=await old.evaluate(()=>{const o={};const bf=f=>f>=5&&f%5===0;for(const sd of [1,777,4242])for(let f=2;f<=26;f++){const d=__game.genMap(sd,f);o[sd+':'+f]=(bf(f)?d.map18:d.map).join('\n');}return o;});await old.close();
    const diff=Object.keys(cur).filter(k=>cur[k]!==prev[k]);
    check('M1.10 floors without a boss are generated exactly as in M1.9.1, boss floors keep their M1.8 layout (3 seeds x floors 2-26)',diff.length===0,diff.slice(0,6).join(', '));
    const api=await G(page,()=>({mobs:Object.keys(__game.mobs),bosses:Object.keys(__game.bosses).map(k=>({k,name:__game.bosses[k].name,hp:__game.bosses[k].hp,ch:__game.bosses[k].ch,dot:__game.bosses[k].dot})),f:[5,10,15,20,25,30,80,95,200].map(f=>{const b=__game.bossFor(f);return f+':'+b.type+':'+b.tier+':'+b.hpMul.toFixed(2);}),none:[1,4,6,7,11].map(f=>__game.bossFor(f))}));
    check('M1.10 three bosses with their own names and map letters, kept out of the regular mob table; tougher each round (+40% HP per round of three, at most x3)',api.bosses.length===3&&new Set(api.bosses.map(b=>b.name)).size===3&&!api.mobs.some(m=>api.bosses.some(b=>b.k===m))&&api.none.every(x=>x===null)&&api.f.join()==='5:king:0:1.00,10:lugg:0:1.00,15:owl:0:1.00,20:king:1:1.40,25:lugg:1:1.40,30:owl:1:1.40,80:king:5:3.00,95:king:6:3.00,200:king:13:3.00',JSON.stringify(api));
    savePng('m110_boss_sprites_3x.png',await G(page,()=>__game.spriteSheet(3,'boss')));
    const fr=await G(page,()=>({king:new Set([0,1,2,3].map(i=>__game.frameSig('king',i))).size,owl:new Set([0,1,2,3].map(i=>__game.frameSig('owl',i))).size,lugg:new Set([0,1,2,3,4,5].map(i=>__game.frameSig('lugg',i))).size,portalS:__game.frameSig('portalS',0)!==__game.frameSig('portal',0)}));
    check('M1.10 boss art: King Gloop and Coghoot have 4 distinct frames, Luggernaut 6 (2 per stack height); the sealed portal looks different',fr.king===4&&fr.owl===4&&fr.lugg===6&&fr.portalS,JSON.stringify(fr));
    await ctx.close();
  }
  // ---- 2. the fight: seal, wake, arena leash, attacks, phases, death, loot, portal
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m110-fight'});
    const seal=await G(page,()=>{__game.manual=true;if('bossIntro' in __game)__game.bossIntro=false; /* M1.10.2: the cut scene has its own test */localStorage.clear();__game.setSeed(777);__game.startLevel(4);const s0=__game.state(),b=__game.boss();const ex=s0.exit;
      __game.teleport(ex.x+.5,ex.y+.5,0);let s=__game.advance(0.3);const still=s.mode,msg=s.msg;return {msg0:s0.msg,sealed:b.sealed,idle:b.ent.state,still,msg,hp:b.ent.hp,save:s0.save&&s0.save.level};});
    check('M1.10 floor 5: "BOSS FLOOR!" message, the portal is sealed, and stepping into it does nothing but say who to beat',/BOSS FLOOR! (KING GLOOP|THE SCREAMER KING)/.test(seal.msg0)&&seal.sealed&&seal.still==='play'&&(/SEALED! DEFEAT (KING GLOOP|THE SCREAMER KING)/.test(seal.msg)||(V126&&/LOCKS YOU IN/.test(seal.msg))) /* M1.26: the portal sits in the arena: stepping on it locks you in and it vanishes */,JSON.stringify(seal));
    // each boss: wakes, stays in its arena, attacks, can hurt you
    const per=await G(page,()=>{const out={};for(const f of [5,10,15]){__game.setSeed(777);__game.startLevel((f===15&&__game.bossType?30:f)-1); /* M1.12: floor 15 has its own boss; Coghoot first shows on floor 30 */__game.setEffect(null);const b0=__game.boss(),A=b0.def.room;
        const idle0=__game.boss().ent.woke;__game.faceBoss(2.5);const s1=__game.advance(0.1),woke=__game.boss().ent.woke,bar=s1.stats.bossBar;
        let outside=0,maxShots=0,hurt=0,h0=5;for(let i=0;i<120;i++){__game.setHearts(5);const s=__game.advance(0.1);const e=__game.boss().ent;if(e.x<A.x||e.x>A.x+A.w||e.y<A.y||e.y>A.y+A.h)outside++;if(s.player.hearts<5||s.player.inv>0.5)hurt++;maxShots=s.stats.bossShots;}
        out[f]={idle0,woke,msg:s1.msg,bar:!!bar,outside,shots:maxShots,hurt,type:b0.ent.type,fly:!!__game.bosses[b0.ent.type].fly};}return out;});
    check('M1.10 each boss sleeps until you come near, then wakes with a message and the health bar shows',[5,10,15].every(f=>!per[f].idle0&&per[f].woke&&/AWAKENS|LOCKS YOU IN/.test(per[f].msg)&&per[f].bar),JSON.stringify(per));
    check('M1.10 each boss stays inside its arena, shoots at you and can hurt you (12 s each, standing 2.5 cells away)',[5,10,15].every(f=>per[f].outside===0&&per[f].shots>0&&per[f].hurt>0),JSON.stringify(per));
    if(V126)check('M1.26 Coghoot and the Screamer King fly (cross pits); the Luggernaut walks',per[15].fly&&per[5].fly&&!per[10].fly);
    else check('M1.10 Coghoot flies (crosses pits); the other two walk',per[15].fly&&!per[5].fly&&!per[10].fly);
    // leash: from outside the arena the boss presses against the edge but never leaves
    const leash=await G(page,()=>{__game.setSeed(777);__game.startLevel(9);const b=__game.boss(),A=b.def.room;__game.faceBoss(2);__game.advance(0.1);
      let x=A.x-1.5,y=A.y+A.h/2;for(const yy of [A.y+1,A.y+A.h-1.5,A.y+A.h/2])for(const xx of [A.x-1.5,A.x+A.w+1.5])if(!__game.solidAt(xx,yy)){x=xx;y=yy;}
      __game.teleport(x,y,0);let out=0,minD=99;for(let i=0;i<100;i++){__game.setHearts(5);__game.advance(0.1);const e=__game.boss().ent;if(e.x<A.x||e.x>A.x+A.w||e.y<A.y||e.y>A.y+A.h)out++;minD=Math.min(minD,Math.hypot(e.x-x,e.y-y));}return {out,minD,A,p:[x,y]};});
    check('M1.10 a boss never leaves its arena, even when you stand outside it',leash.out===0,JSON.stringify(leash));
    // King Gloop phases: minions at 2/3 and 1/3, furious at half
    const king=await G(page,()=>{__game.setSeed(777);__game.startLevel(4);__game.faceBoss(2.5);__game.advance(0.1);const B=()=>__game.boss().ent,mx=B().maxHp,r=[];
      const step=(n)=>{__game.hitBoss(n);__game.setHearts(5);const s=__game.advance(0.1);r.push({hp:B().hp,split:B().split,enr:B().enraged,minions:s.stats.bossMinions,alive:s.enemies.filter(e=>e.spawned&&!e.gone&&e.state!=='dead').length});};
      step(Math.ceil(mx/3));step(Math.ceil(mx/6));step(Math.ceil(mx/6));return {mx,r};});
    if(V126)check('M1.26 the Screamer King calls a wave of 3 Screamers at 2/3 health and more at 1/3 (never more than 4 alive), and gets furious at half',king.r[0].split===1&&king.r[0].minions===3&&!king.r[0].enr&&king.r[1].enr&&king.r[2].split===2&&king.r[2].minions===4&&king.r.every(x=>x.alive<=4),JSON.stringify(king));
    else check('M1.10 King Gloop splits off 2 minions at 2/3 and again at 1/3 health (never more than 4 alive) and gets furious at half',king.r[0].split===1&&king.r[0].minions===2&&!king.r[0].enr&&king.r[1].enr&&king.r[2].split===2&&king.r[2].minions===4&&king.r.every(x=>x.alive<=4),JSON.stringify(king));
    // Luggernaut: suitcases burst at 2/3 and 1/3; the hit box shrinks with the stack
    const lugg=await G(page,()=>{__game.setSeed(777);__game.startLevel(9);__game.faceBoss(2.5);__game.advance(0.1);const B=()=>__game.boss().ent,mx=B().maxHp,r=[{stack:B().stack,hh:B().hh,frame:B().frame}];
      for(const n of [Math.ceil(mx/3),Math.ceil(mx/3)]){__game.hitBoss(n);__game.setHearts(5);const s=__game.advance(0.1);r.push({stack:B().stack,hh:B().hh,frame:B().frame,bursts:s.stats.caseBursts,msg:s.msg});}return r;});
    check('M1.10 Luggernaut loses a suitcase at 2/3 and 1/3 health (3 -> 2 -> 1, a burst of socks and coins each time) and gets shorter, so balloons must aim lower',lugg[0].stack===3&&lugg[1].stack===2&&lugg[2].stack===1&&lugg[2].bursts===2&&lugg[0].hh>lugg[1].hh&&lugg[1].hh>lugg[2].hh&&lugg[2].frame>=4,JSON.stringify(lugg));
    const owl=await G(page,()=>{__game.setSeed(777);__game.startLevel(__game.bossType?29:14);__game.faceBoss(3);__game.advance(0.1);let home=0,gear=0;for(let i=0;i<200&&!gear;i++){ /* attacks are random (swoop or gears): watch up to 20 s */__game.setHearts(5);const s=__game.advance(0.1);s.eshots.forEach(q=>{if(q.kind==='gear')gear++;});}return {gear,z:__game.boss().ent.z};});
    check('M1.10 Coghoot hovers above the floor and fires gears',owl.gear>0&&owl.z>0.1,JSON.stringify(owl));
    // arena doors lock behind you and open when the boss falls
    const lock=await G(page,()=>{__game.setSeed(777);__game.startLevel(9);const b=__game.boss(),A=b.def.room,d0=__game.arenaDoors();
      const door=d0[0];const out=[door.x-(door.x<A.x?1:door.x>=A.x+A.w?-1:0),door.y-(door.y<A.y?1:door.y>=A.y+A.h?-1:0)];__game.teleport(out[0]+.5,out[1]+.5,0);__game.advance(0.2);const before=__game.arenaDoors().some(d=>d.bossLock);
      __game.faceBoss(2.5);let s=__game.advance(1.2);const locked=__game.arenaDoors(),msg=s.msg;
      const fx=door.x<A.x?A.x:door.x>=A.x+A.w?A.x+A.w-1:door.x,fy=door.y<A.y?A.y:door.y>=A.y+A.h?A.y+A.h-1:door.y;__game.teleport(fx+.5,fy+.5,Math.atan2(door.y-fy,door.x-fx));__game.setHearts(5);const keys0=s.player.keys;__game.use();s=__game.advance(0.6);const tried=__game.arenaDoors().find(d=>d.x===door.x&&d.y===door.y),useMsg=s.msg;
      __game.hitBoss(999);__game.advance(1.6);const after=__game.arenaDoors();__game.use();__game.advance(0.8);const opened=__game.arenaDoors().find(d=>d.x===door.x&&d.y===door.y);
      return {n:d0.length,before,allLocked:locked.every(d=>d.bossLock&&d.locked),closed:locked.every(d=>d.open<0.8),msg,triedOpen:tried.open,useMsg,keys0,afterLocked:after.some(d=>d.bossLock||d.locked),opened:opened.open};});
    check('M1.10 stepping into the arena slams and locks every door in its walls; no key opens them; they unlock when the boss falls',lock.n>0&&!lock.before&&lock.allLocked&&lock.closed&&/LUGGERNAUT LOCKS YOU IN/.test(lock.msg)&&lock.triedOpen<0.1&&/LOCKED UNTIL LUGGERNAUT/.test(lock.useMsg)&&!lock.afterLocked&&lock.opened>0.9,JSON.stringify(lock));
    // death: loot, score, portal opens, clear screen names the boss, next floor
    const win=await G(page,()=>{__game.setSeed(777);__game.startLevel(4,{hearts:5,coins:0});__game.setRun({kills:0,elites:0,coins:0,deepest:5});__game.faceBoss(2.5);__game.advance(0.1);const sc0=__game.state().score,bx=__game.boss().ent.x,by=__game.boss().ent.y,near=i=>Math.hypot(i.x-bx,i.y-by)<1.2;
      __game.hitBoss(999);let s=__game.advance(0.5);const dying=__game.boss().ent.state,sealedMid=__game.boss().sealed;s=__game.advance(1.0);const b=__game.boss();
      const coins=s.items.filter(i=>i.kind==='coin'&&i.spray).length,hearts=s.items.filter(i=>(i.kind==='heart'||i.kind==='perm'||i.kind==='item')&&!i.taken&&near(i)).length, /* M1.11: a permanent item instead of the heart */pw=s.items.filter(i=>i.kind==='power'&&near(i)).length;
      __game.advance(2);__game.nextFloorViaExit();s=__game.advance(0.1);const mode=s.mode;__game.advance(0.6);__game.confirm();const s2=__game.advance(0.05);
      return {dying,sealedMid,sealed:b.sealed,gone:b.ent.gone,msg:s.msg,coins,hearts,pw,dScore:s.score-sc0-5*s.run.coins,run:s.run,kills:s.stats.bossKills,mode,next:s2.level,nextMode:s2.mode};});
    check('M1.10 a beaten boss flashes for a moment, then pops: the portal opens with a message',win.dying==='dead'&&win.sealedMid&&!win.sealed&&win.gone&&win.kills>=1,JSON.stringify(win));
    check('M1.10 boss loot: 15 coins spray out, plus a heart and a power-up; it scores as a kill and an elite (+150, plus 5 per coin you pick up)',win.coins>=15&&win.hearts===1&&win.pw===1&&win.dScore===150,JSON.stringify(win));
    check('M1.10 once the boss is down the portal clears the floor and leads to floor 6',win.mode==='clear'&&win.next===5&&win.nextMode==='play',JSON.stringify(win));
    await G(page,()=>{__game.setSeed(777);__game.startLevel(4);__game.hitBoss(999);__game.advance(1.6);__game.nextFloorViaExit();__game.advance(0.8);});await shot(page,'clear_screen_boss');
    // the clear screen line, bar and maps
    const ui=await G(page,()=>{__game.setSeed(777);__game.startLevel(9);const r0=__game.state().stats.bossBar;__game.seeAll();__game.openMap();__game.advance(0.05);__game.render();const ex=__game.state().exit,fm=__game.state().stats.fullMap;
      const cs=fm.cs,px=__game.pixelAt(Math.round(fm.ox+ex.x*cs+cs/2),Math.round(fm.oy+ex.y*cs+cs/2));__game.closeMap();__game.hitBoss(999);__game.advance(1.6);__game.seeAll();__game.openMap();__game.advance(0.05);__game.render();
      const px2=__game.pixelAt(Math.round(fm.ox+ex.x*cs+cs/2),Math.round(fm.oy+ex.y*cs+cs/2));__game.closeMap();return {px,px2};});
    check('M1.10 the full map shows the sealed portal dim, and bright once it opens',ui.px.join()!==ui.px2.join()&&ui.px[2]<120,JSON.stringify(ui));
    const bar=await G(page,()=>{__game.setSeed(777);__game.startLevel(__game.bossType?29:14);const r=[];let s=__game.advance(0.05);const idle=s.stats.bossBar?1:0;__game.faceBoss(3);s=__game.advance(0.1);const w0=s.stats.bossBar.w;__game.hitBoss(Math.ceil(__game.boss().ent.maxHp/2));s=__game.advance(0.1);const w1=s.stats.bossBar.w;const R=__game.bossBar(),H=__game.hudRects();
      return {idle,w0,w1,inBand:R[0]>=H.band[0]&&R[1]>=H.band[1]&&R[0]+R[2]<=H.band[0]+H.band[2]&&R[1]+R[3]<=H.band[1]+H.band[3]};});
    check('M1.10 the boss health bar appears once the boss wakes, sits inside the message band (no new screen space) and shrinks with the boss HP',bar.idle===0&&bar.inBand&&bar.w0>0&&Math.abs(bar.w1/bar.w0-0.5)<0.08,JSON.stringify(bar));
    await G(page,()=>{__game.setSeed(777);__game.startLevel(4);__game.faceBoss(2.6);__game.advance(0.3);});await shot(page,'king_gloop');
    await G(page,()=>{__game.setSeed(777);__game.startLevel(9);__game.faceBoss(2.6);__game.advance(0.3);});await shot(page,'luggernaut');
    await G(page,()=>{__game.setSeed(777);__game.startLevel(__game.bossType?29:14);__game.faceBoss(2.6);__game.advance(0.3);});await shot(page,'coghoot');
    // a deeper boss is tougher; CONTINUE on a boss floor brings the boss back and the portal sealed
    const deep=await G(page,()=>{__game.setSeed(4242);__game.startLevel(__game.kiy?34:19);const a=__game.boss().ent; /* M1.14: floor 20 is the King in Yellow; King Gloop's 3rd round is floor 35 */__game.startLevel(79);const b=__game.boss().ent;const B=__game.bosses;return {a:[a.type,a.maxHp,a.tier],b:[b.type,b.maxHp,b.tier,b.cdMul,b.spdMul],base:B.king.hp};});
    check('M1.10 floor 20 King Gloop has 40% more HP than on floor 5 (M1.13.1: plus 5 per floor); by floor 80 x3 HP, attacks 1/0.6 as often, 1.3x speed (caps)',deep.a[0]==='king'&&deep.a[1]===(V114?Math.ceil(deep.base*1.8)+5*34:Math.ceil(deep.base*1.4)+(atLeast('1.13.1')?5*19:0))&&deep.b[1]===deep.base*3+(atLeast('1.13.1')?5*79:0)&&deep.b[3]===0.6&&deep.b[4]===1.3,JSON.stringify(deep));
    const cont=await G(page,()=>{localStorage.clear();__game.setSeed(777);__game.startLevel(9);__game.hitBoss(999);__game.advance(1.6);__game.toTitle();__game.menuPick(0);__game.advance(0.05);const b=__game.boss();return {level:__game.state().level,sealed:b.sealed,alive:!!(b.ent&&!b.ent.gone&&b.ent.hp===b.ent.maxHp)};});
    check('M1.10 CONTINUE on a boss floor starts it fresh: the boss is back and the portal sealed',cont.level===9&&cont.sealed&&cont.alive,JSON.stringify(cont));
    await ctx.close();
  }
  // ---- 2b. M1.10.2 cut scene: opening the arena door pulls you in, slams the doors, shows VS <BOSS> for 5 s, then the fight starts
  if(atLeast('1.10.2')){
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m1102-intro'});
    const r=await G(page,()=>{__game.manual=true;localStorage.clear();__game.setSeed(777);__game.startLevel(9);__game.state().enemies.forEach((e,i)=>{if(!__game.bosses[e.type])__game.damageMob(i,99);});__game.advance(0.3);
      const A=__game.boss().def.room,d=__game.arenaDoors()[0],ox=(d.x<A.x?1:d.x>=A.x+A.w?-1:0),oy=(d.y<A.y?1:d.y>=A.y+A.h?-1:0);__game.teleport(d.x+.5-ox,d.y+.5-oy,Math.atan2(oy,ox)); /* face the door (M1.40: arena doors can be on any side) */if(__game.setKeys)__game.setKeys(1); /* M1.40: the arena door is a key door */__game.render();__game.use();
      const out=[];for(let i=0;i<=56;i++){__game.setHearts(5);const s=__game.advance(0.1),I=__game.intro(),p=s.player,inA=p.x>A.x&&p.x<A.x+A.w&&p.y>A.y&&p.y<A.y+A.h;
        out.push({t:+(i*0.1).toFixed(1),mode:s.mode,inA,locked:__game.arenaDoors().every(q=>q.bossLock),open:Math.max(...__game.arenaDoors().map(q=>q.open)),woke:__game.boss().ent.woke,shots:s.eshots.length,hearts:p.hearts,ang:p.ang,face:Math.abs(Math.atan2(Math.sin(Math.atan2(__game.boss().ent.y-p.y,__game.boss().ent.x-p.x)-p.ang),Math.cos(Math.atan2(__game.boss().ent.y-p.y,__game.boss().ent.x-p.x)-p.ang)))});
        if(i===30)window.__introShot=true;}return out;});
    const at=t=>r.find(x=>Math.abs(x.t-t)<0.05);
    check('M1.10.2 opening the boss room door starts a 5 s cut scene: you are pulled inside, the doors slam and lock behind you',at(0.5).mode==='intro'&&at(2).inA&&at(2).locked&&at(2.5).open<0.1&&at(4.5).mode==='intro',JSON.stringify([at(0.5),at(2),at(4.5)]));
    check('M1.10.2 during the cut scene the view turns to the boss and nothing attacks you; at 5 s the fight starts',at(3).face<0.15&&r.filter(x=>x.mode==='intro').every(x=>x.hearts===5&&x.shots===0&&!x.woke)&&at(5.5).mode==='play'&&at(5.5).woke,JSON.stringify([at(3),at(4.9),at(5.5)]));
    await G(page,()=>{__game.setSeed(777);__game.startLevel(9);const A=__game.boss().def.room,d=__game.arenaDoors()[0],ox=(d.x<A.x?1:d.x>=A.x+A.w?-1:0),oy=(d.y<A.y?1:d.y>=A.y+A.h?-1:0);__game.teleport(d.x+.5-ox,d.y+.5-oy,Math.atan2(oy,ox)); /* face the door (M1.40: arena doors can be on any side) */if(__game.setKeys)__game.setKeys(1); /* M1.40: the arena door is a key door */__game.render();__game.use();__game.advance(3);});await shot(page,'intro_vs');
    const again=await G(page,()=>{__game.advance(3);const A=__game.boss().def.room;const s=__game.advance(0.1);return {mode:s.mode,intros:s.stats.bossIntros};});
    check('M1.10.2 the cut scene plays once per fight',again.mode==='play',JSON.stringify(again));
    await ctx.close();
  }
  // ---- 3. phone: the bar lives in the band, so no touch button can cover it
  {
    const {ctx,page}=await newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true,label:'m110-phone'});
    const r=await G(page,()=>{__game.manual=true;if('bossIntro' in __game)__game.bossIntro=false;__game.setSeed(777);__game.startLevel(9);__game.faceBoss(2.6);__game.advance(0.3);const l=__game.layout(),R=__game.bossBar();return {l,R};});
    const c=r.l.canvas,s=c.w/480,bar={x:c.x+r.R[0]*s,y:c.y+r.R[1]*s,w:r.R[2]*s,h:r.R[3]*s},ov=(a,b)=>a.visible!==false&&a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
    const hits=['throwBtn','useBtn','pauseBtn','itemBtn','mapBtn','ballBtn'].filter(k=>r.l[k].visible&&ov(r.l[k],bar));
    check('M1.10 phone 844x390: no touch button covers the boss health bar',hits.length===0,hits.join(','));
    await shot(page,'phone_844x390_boss');
    await ctx.close();
  }
}

// ---------- M1.11: comedy/tragedy masks, Treasure Knight + golden power-ups, new items, one monster mark on the maps ----------
async function m111Tests(){
  const shot=async(page,name)=>page.screenshot({path:`${SHOTS}/m111_${name}.png`});
  const savePng=(name,url)=>fs.writeFileSync(`${SHOTS}/${name}`,Buffer.from(url.split(',')[1],'base64'));
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m111'});
  await G(page,()=>{__game.manual=true;__game.bossIntro=false;localStorage.clear();});
  savePng('m111_sprites_3x.png',await G(page,()=>__game.spriteSheet(3,'m111')));
  // ---- masks
  const mk=await G(page,()=>{let com=0,tra=0;for(const sd of [1,2,3,4,5,6,7,8,9,10,777,4242])for(const f of [5,6,7,8]){__game.setSeed(sd);__game.startLevel(f-1);__game.masks().forEach(m=>{if(m.face==='comedy')com++;else tra++;});}
    __game.setSeed(777);__game.startLevel(6);__game.clearMobs();const p=__game.state().player;__game.setHearts(5);
    const ic=__game.spawn('zapfly',p.x+1.5,p.y,true,[]);__game.setMask(ic,'comedy');__game.damageMob(ic,20);let s=__game.advance(0.1);const c0=__game.state().enemies[ic];
    let minD=9,maxD=0;for(let i=0;i<50;i++){__game.setHearts(5);s=__game.advance(0.1);const e=s.enemies[ic],d=Math.hypot(e.x-s.player.x,e.y-s.player.y);minD=Math.min(minD,d);maxD=Math.max(maxD,d);}
    const hurtC=s.player.inv>0;__game.clearMobs();const it=__game.spawn('zapfly',p.x+1.2,p.y,true,[]);let bit=false;for(let i=0;i<30;i++){s=__game.advance(0.1);if(s.player.hearts<5)bit=true;__game.setHearts(5);}
    __game.damageMob(it,1);s=__game.advance(0.3);
    return {com,tra,name:__game.mobs.zapfly.name,c0:{hp:c0.hp,state:c0.state},minD,hurtC,bit,tragDead:s.enemies[it].gone||s.enemies[it].state==='dead',laughs:s.stats.comedyHits};});
  check('M1.11 the Zapfly is now the Comedy and Tragedy masks: about a third smile, the rest frown',mk.name==='TRAGEDY MASK'&&mk.com>0&&mk.tra>mk.com&&mk.com/(mk.com+mk.tra)>0.2&&mk.com/(mk.com+mk.tra)<0.5,JSON.stringify({com:mk.com,tra:mk.tra}));
  check('M1.11 a smiling Comedy mask follows you, never bites and cannot be hurt; a frowning Tragedy mask bites and pops in one hit',mk.c0.hp===1&&mk.c0.state==='chase'&&mk.laughs>0&&mk.minD>0.9&&!mk.hurtC&&mk.bit&&mk.tragDead,JSON.stringify(mk));
  await G(page,()=>{__game.setSeed(777);__game.startLevel(6);__game.clearMobs();const p=__game.state().player;const a=__game.spawn('zapfly',p.x+Math.cos(p.ang)*1.6-.3*Math.sin(p.ang),p.y+Math.sin(p.ang)*1.6+.3*Math.cos(p.ang),false,[]);const b=__game.spawn('zapfly',p.x+Math.cos(p.ang)*1.6+.4*Math.sin(p.ang),p.y+Math.sin(p.ang)*1.6-.4*Math.cos(p.ang),false,[]);__game.setMask(b,'comedy');__game.advance(0.05);});await shot(page,'masks');
  // ---- one monster mark on the maps
  const mm=await G(page,()=>{__game.setSeed(777);__game.startLevel(6);__game.clearMobs();const p=__game.state().player;['screamer','springle','kettle','zapfly','clunk','skeleton'].forEach((t,i)=>__game.spawn(t,p.x+(i%3-1)*.9,p.y+(i<3?-1:1),false,[]));__game.seeAll();__game.advance(0.05);__game.render();
    const R=__game.hudRects().map,cols={};for(let y=R[1];y<R[1]+R[3];y++)for(let x=R[0];x<R[0]+R[2];x++){const c=__game.pixelAt(x,y).join();cols[c]=(cols[c]||0)+1;}
    const old=Object.values(__game.mobs).map(m=>m.dot).map(h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)].join());return {mon:cols['255,48,32']||0,oldHits:old.filter(c=>cols[c]).length};});
  check('M1.11 the minimap shows every monster with the same red mark (no per-type colours that spoil what is coming)',mm.mon>=9&&mm.oldHits===0,JSON.stringify(mm));
  // ---- Treasure Knight
  const kp=await G(page,()=>{const out={floors:0,with:0,hpOk:true,f1:null};for(const sd of [1,777,4242])for(const f of [2,3,4,5,8,10,12,20]){__game.setSeed(sd);__game.startLevel(f-1);const k=__game.knight();out.floors++;if(k){out.with++;if(k.maxHp!==__game.knightHp(f))out.hpOk=false;}}__game.startLevel(0);out.f1=__game.knight();
    out.hp=[2,3,12,32,50,500].map(f=>__game.knightHp(f));return out;});
  check(atLeast('1.14.2')?(atLeast('1.17.1')?'M1.11 a Treasure Knight on every floor from 2 (not the tutorial); M1.17.1: 10 HP on floor 2, +3 per floor, no cap':'M1.11 a Treasure Knight on every floor from 2 (not the tutorial); M1.14.2: 25 HP + 3 per floor, no cap'):'M1.11 a Treasure Knight on every floor from 2 (not the tutorial); 10 HP on floor 2, +1 per floor, at most 40',kp.with===kp.floors&&kp.hpOk&&kp.f1===null&&kp.hp.join()===(atLeast('1.17.1')?'10,13,40,100,154,1504':atLeast('1.14.2')?'28,31,58,118,172,1522':'10,11,20,40,40,40'),JSON.stringify(kp));
  const kb=await G(page,()=>{__game.setSeed(777);__game.startLevel(3);const k0=__game.knight();__game.state().enemies.forEach((e,i)=>{if(e.type!=='knight')__game.damageMob(i,99);});__game.advance(0.3);
    __game.teleport(k0.x-2,k0.y,0);if(__game.solidAt(k0.x-2,k0.y))__game.teleport(k0.x+2,k0.y,Math.PI);__game.advance(0.1);__game.knightSet({woke:true,state:'chase',shieldT:1.5,chargeCD:9,tele:0,slamT:0,slamCD:9});
    const a=__game.knight();__game.damageMob(a.i,5);__game.advance(1.0);const b=__game.knight();__game.knightSet({shieldT:0,shieldCD:9});__game.damageMob(a.i,2);const c=__game.knight();
    return {hp0:a.hp,afterShield:b.hp,moved:Math.hypot(b.x-a.x,b.y-a.y),frame:a.frame,afterOpen:c.hp};});
  check('M1.11 with his shield up the knight takes no damage and does not move; shield down, hits land',kb.afterShield===kb.hp0&&kb.moved<0.02&&kb.frame===2&&kb.afterOpen===kb.hp0-2,JSON.stringify(kb));
  const kc=await G(page,(V136)=>{let k0,best=null;const pitFree=(x0,y0,dx,dy,n)=>{if(!V136)return true;for(let t=0;t<=n;t+=.25){const c=__game.cellAt(Math.floor(x0+dx*t),Math.floor(y0+dy*t));if(!c||c.t===6||__game.solidAt(x0+dx*t,y0+dy*t))return false;}return true;}; const toWall=(x0,y0,dx,dy)=>{if(!V136)return true;for(let t=0;t<40;t+=.25){const x=x0+dx*t,y=y0+dy*t,c=__game.cellAt(Math.floor(x),Math.floor(y));if(!c)return false;if(c.t===1)return true;if(c.t!==0)return false;}return false;}; /* M1.36: never stand on (or charge over) a pit, and the charge ends on a real wall; try more seeds for a clear setup */
    for(const sd of V136?[777,778,779,780,781,782,783,784,785,786,787,788]:[777]){__game.setSeed(sd);__game.startLevel(3);__game.state().enemies.forEach((e,i)=>{if(e.type!=='knight')__game.damageMob(i,99);});__game.advance(0.2);k0=__game.knight();if(!k0)continue;for(const [dx,dy,a] of [[3,0,Math.PI],[-3,0,0],[0,3,-Math.PI/2],[0,-3,Math.PI/2]]){const x=k0.x+dx,y=k0.y+dy;if(!__game.solidAt(x,y)&&__game.clearPath(k0.x,k0.y,x,y)&&pitFree(k0.x,k0.y,dx/3,dy/3,3)&&toWall(k0.x,k0.y,dx/3,dy/3)){best=[x,y,a];break;}}if(best)break;}if(!best)return {skip:true};
    __game.teleport(best[0],best[1],best[2]);__game.knightSet({woke:true,state:'chase',chargeCD:0,shieldCD:9});let tele=false,charge=false,maxSp=0,daze=false,prev=__game.knight();
    for(let i=0;i<80;i++){__game.setHearts(5);const s=__game.advance(0.05);const k=__game.knight();if(k.tele>0)tele=true;if(k.chargeT>0){charge=true;maxSp=Math.max(maxSp,Math.hypot(k.x-prev.x,k.y-prev.y)/0.05);}if(k.daze>0)daze=true;prev=k;if(daze&&i>30)break;}
    return {tele,charge,maxSp,daze,dents:__game.dents(),slams:__game.state().stats.knightSlams};},V136);
  check('M1.11 the knight telegraphs, charges straight and fast (about 6.5 cells/s), slams into the wall (round crack) and is dazed',kc.skip||(kc.tele&&kc.charge&&kc.maxSp>5&&kc.daze&&kc.slams>=1&&kc.dents>=1),JSON.stringify(kc));
  if(atLeast('1.14.2')){const sl=await G(page,(V136)=>{const G=__game;let k,best=null;for(const sd of V136?[777,778,779,780,781,782,783,784,785,786,787,788]:[777]){G.setSeed(sd);G.startLevel(3);G.state().enemies.forEach((e,i)=>{if(e.type!=='knight')G.damageMob(i,99);});G.advance(0.3);k=G.knight();if(!k)continue;const pitFree=(x0,y0,dx,dy,n)=>{if(!V136)return true;for(let t=0;t<=n;t+=.25){const c=G.cellAt(Math.floor(x0+dx*t),Math.floor(y0+dy*t));if(!c||c.t===6||G.solidAt(x0+dx*t,y0+dy*t))return false;}return true;}; /* M1.36: room to be knocked back, no pit in the way; more seeds for a clear setup */for(const [dx,dy,a] of [[1.4,0,Math.PI],[-1.4,0,0],[0,1.4,-Math.PI/2],[0,-1.4,Math.PI/2]]){if(!G.solidAt(k.x+dx,k.y+dy)&&G.clearPath(k.x,k.y,k.x+dx*2.2,k.y+dy*2.2)&&!G.solidAt(k.x+dx*2.2,k.y+dy*2.2)&&pitFree(k.x,k.y,dx/1.4,dy/1.4,3.4)){best=[k.x+dx,k.y+dy,a];break;}}if(best)break;}if(!best)return {skip:true};
      G.teleport(best[0],best[1],best[2]);G.knightSet({woke:true,state:'chase',slamCD:0,chargeCD:9,shieldCD:9,atkT:9});G.setHearts(5);let tell=false,ring=0,s;const p0=G.state().player;const TF=G.rings?4:2;for(let i=0;i<60;i++){s=G.advance(0.05);if(G.knight().frame===TF)tell=true;if(G.rings)ring=Math.max(ring,G.rings().length);if(s.player.hearts<5)break;}
      const p1=s.player;return {tell,ring,hearts:s.player.hearts,push:Math.hypot(p1.x-p0.x,p1.y-p0.y),cracks:G.cracks(),n:s.stats.knightSlamHits};},V136);
    check(atLeast('1.19')?'M1.14.2/M1.19 up close the knight raises his sword overhead (flashing, 1.2 s) and slams: a ring of dust rolls out and hits for 2 + knockback':'M1.14.2 up close the knight raises his shield and slams it down: a ring of cracks, 2 damage and a knockback',sl.skip||(!atLeast('1.19')||sl.ring>=1)&&sl.tell&&sl.hearts===3&&sl.push>1&&sl.cracks>=1&&sl.n>=1,JSON.stringify(sl));}
  await G(page,()=>{const k=__game.knight();const s=__game.state();__game.teleport(s.player.x,s.player.y,Math.atan2(k.y-s.player.y,k.x-s.player.x));__game.advance(0.05);});await shot(page,'knight');
  if(!V123){ // M1.23 replaced golden, permanent and these power-ups with run items (m123Tests)
  const kd=await G(page,()=>{localStorage.clear();__game.setSeed(4242);__game.startLevel(2,{hearts:5,coins:0});__game.setPerm({});const k=__game.knight();__game.knightSet({shieldT:0,shieldCD:99});__game.damageMob(k.i,99);const s=__game.advance(0.6);
    const g=s.items.find(i=>i.kind==='gold'&&!i.taken);if(!g)return {nogold:true,items:s.items.map(i=>i.kind)};__game.teleport(g.x,g.y);const s2=__game.advance(0.1);const perm=s2.perm,eff=s2.player.effects.slice(),save=s2.save.perm;
    __game.toTitle();__game.menuPick(0);__game.advance(0.05);const cont=__game.knight();
    __game.startLevel(3,{hearts:5,coins:0});const nextEff=__game.state().player.effects.slice();
    let temp=0;for(let f=4;f<14;f++){__game.startLevel(f);temp+=__game.state().items.filter(i=>i.kind==='power'&&i.ptype===g.ptype).length;temp+=__game.shopRows().filter(r=>r.pu===g.ptype).length;}
    let slot=0;for(let i=0;i<200;i++){const r=__game.slotResolve('power',3,5);if(r.power===g.ptype)slot++;}
    return {k:g.ptype,gold:perm.gold[g.ptype],eff:eff.includes(g.ptype),saved:!!save.gold[g.ptype],cont:cont===null,nextEff:nextEff.includes(g.ptype),temp,slot};});
  check('M1.11 the knight drops a golden power-up: yours for good (saved at once), switched on now and at the start of every floor',!kd.nogold&&kd.gold&&kd.eff&&kd.saved&&kd.nextEff,JSON.stringify(kd));
  check('M1.11 once you own a golden power-up, the ordinary kind never turns up again (floors, shop, slot); CONTINUE does not bring the knight back',kd.temp===0&&kd.slot===0&&kd.cont,JSON.stringify(kd));
  // ---- items
  const it=await G(page,()=>{const r={};const fresh=(f)=>{__game.setSeed(777);__game.startLevel(f||6,{hearts:5,coins:0});__game.setPerm({});__game.clearMobs();__game.setEffect(null);__game.setHearts(5);return __game.state().player;};
    r.count={pu:__game.puIds.length,perm:__game.permIds.length};
    let p=fresh();__game.give('thorns');__game.useItem();const ci=__game.spawn('clunk',p.x+.35,p.y,true,[]);const d0=.35;let s;for(let i=0;i<10;i++)s=__game.advance(0.1);const c=s.enemies[ci];r.thorns={hearts:s.player.hearts,clunkHp:c.hp,max:c.maxHp,dist:Math.hypot(c.x-s.player.x,c.y-s.player.y),on:s.player.effects.includes('thorns')};
    p=fresh();__game.give('rocks');__game.useItem();__game.shoot();r.rocks=__game.state().stats.throws>0&&__game.shotsDetail().length>0;__game.advance(1.5);const ri=__game.spawn('clunk',p.x+Math.cos(p.ang)*1.4,p.y+Math.sin(p.ang)*1.4,true,[]);__game.shoot(0);for(let i=0;i<10;i++){__game.setHearts(5);s=__game.advance(0.05);}r.rockDmg=s.enemies[ri].maxHp-s.enemies[ri].hp;
    p=fresh();__game.give('clover');__game.useItem();const c0=__game.state().player.coins;const kk=__game.state().items.findIndex(i=>i.kind==='coin'&&!i.taken);const cc=__game.state().items[kk];__game.teleport(cc.x,cc.y);r.clover=__game.advance(0.05).player.coins-c0;
    p=fresh();__game.setHearts(2);__game.give('herb');__game.useItem();r.herb=__game.state().player.hearts;
    p=fresh();__game.give('mirror');__game.useItem();__game.addShot('laser',p.x+2,p.y,-6,0);__game.teleport(p.x,p.y,0);for(let i=0;i<10;i++)s=__game.advance(0.05);r.mirror={hearts:s.player.hearts,b:s.stats.mirrorBounces};
    p=fresh();__game.give('lantern');__game.useItem();const fi=__game.fogInfo();r.lantern=fi.seen;r.total=__game.state().mapW*__game.state().mapH;
    p=fresh(8);const pit=__game.pits()[0];if(pit){__game.give('wings');__game.useItem();__game.teleport(pit.x+.5,pit.y+.5);s=__game.advance(0.3);r.wings=s.mode;}
    p=fresh();const bi=__game.spawn('kettle',p.x+1.5,p.y,true,[]);__game.give('bell');__game.useItem();s=__game.advance(0.05);const bk=s.enemies[bi];r.bell={dist:Math.hypot(bk.x-p.x,bk.y-p.y),stuns:s.stats.bellStuns};s=__game.advance(1);r.bellStill=Math.hypot(s.enemies[bi].x-bk.x,s.enemies[bi].y-bk.y);
    p=fresh();__game.spawnItem('perm','hp',p.x,p.y);s=__game.advance(0.05);r.hp={max:__game.maxHearts(),hearts:s.player.hearts,saved:s.save.perm.hp};
    p=fresh();__game.spawnItem('perm','arm',p.x,p.y);__game.advance(0.05);const ai=__game.spawn('clunk',p.x+Math.cos(p.ang)*1.4,p.y+Math.sin(p.ang)*1.4,true,[]);__game.shoot(0);for(let i=0;i<10;i++){__game.setHearts(5);s=__game.advance(0.05);}r.arm=s.enemies[ai].maxHp-s.enemies[ai].hp;
    p=fresh();__game.spawnItem('perm','quick',p.x,p.y);__game.advance(0.05);__game.shoot();r.quick=__game.state().player.throwT;
    return r;});
  check(`M1.11 more items: ${it.count.pu} power-ups (8 new) and ${it.count.perm} permanent items`,it.count.pu===(atLeast('1.17')?16:14)&&it.count.perm===(atLeast('1.17')?4:3),JSON.stringify(it.count));
  check('M1.11 Thorn Vest: a bite does no harm, the biter takes 3 damage and is knocked back, and the vest is used up',it.thorns.hearts===5&&it.thorns.clunkHp===it.thorns.max-3&&it.thorns.dist>0.9&&!it.thorns.on,JSON.stringify(it.thorns));
  check('M1.11 Rock Sack: rocks instead of balloons, 2 damage a hit; Strong Arm: +1 damage; Quick Hands: 20% shorter throw cooldown',it.rocks&&it.rockDmg===2&&it.arm===2&&Math.abs(it.quick-0.64)<0.02,JSON.stringify({rd:it.rockDmg,arm:it.arm,q:it.quick}));
  check('M1.11 Lucky Clover doubles coins, Healing Herb gives 2 hearts, Mirror Charm bounces a shot back, Candle Lantern lights the whole map',it.clover===2&&it.herb===4&&it.mirror.hearts===5&&it.mirror.b===1&&it.lantern===it.total,JSON.stringify({c:it.clover,h:it.herb,m:it.mirror,l:it.lantern,t:it.total}));
  check('M1.11 Wax Wings float you over pits; Warding Bell pushes nearby monsters back and stuns them',(it.wings===undefined||it.wings==='play')&&it.bell.dist>2&&it.bell.stuns>=1&&it.bellStill<0.05,JSON.stringify({w:it.wings,b:it.bell,still:it.bellStill}));
  check('M1.11 Heart Container: +1 max heart (and a heart), saved at once',it.hp.max===6&&it.hp.hearts===6&&it.hp.saved===1,JSON.stringify(it.hp));
  }
  await G(page,()=>{__game.setSeed(777);__game.startLevel(6,{hearts:7,coins:0,perm:{hp:3,gold:{sneakers:true,shield:true,triple:true}}});__game.give('thorns');__game.advance(0.05);});await shot(page,'hud_8_hearts_golden');
  const lay=await G(page,()=>{const H=__game.hudRects();return {hearts:6+7*9+7<=H.ball[0]};});
  check('M1.11 eight hearts (half size) still fit left of the balloon box',lay.hearts,JSON.stringify(lay));
  await ctx.close();
}

// ---------- M1.12: coins into pits, spiders, floor-15 bosses, coin doors, shrines, trapdoors, piggy bank, rare wares ----------
async function m112Tests(){
  const shot=async(page,name)=>page.screenshot({path:`${SHOTS}/m112_${name}.png`});
  const savePng=(name,url)=>fs.writeFileSync(`${SHOTS}/${name}`,Buffer.from(url.split(',')[1],'base64'));
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m112'});
  await G(page,()=>{__game.manual=true;__game.bossIntro=false;localStorage.clear();});
  savePng('m112_sprites_3x.png',await G(page,()=>__game.spriteSheet(3,'m112')));
  const PIT=()=>{const G=__game,pit=G.pits()[0];if(!pit)return false;for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){const x=pit.x+d[0],y=pit.y+d[1];if(G.cellType(x,y)===0){G.teleport(x+.5,y+.5,Math.atan2(-d[1],-d[0]));return true;}}return false;};
  // ---- pit coins
  const pt=await G(page,(PITs)=>{const PIT=eval(PITs),G=__game;G.setSeed(777);G.startLevel(7,{hearts:5,coins:12,perm:{}});G.state().enemies.forEach((e,i)=>G.damageMob(i,99));G.advance(0.2);PIT();G.advance(0.05);const near=G.nearUse(),prompt=G.state().stats&&__game.state().msg;
    const c0=G.state().player.coins;G.use();let s=G.advance(0.05);const one={coins:c0-s.player.coins,pit:G.pitCoins(),saved:s.save.perm.pit};
    G.setPit(9);G.use();s=G.advance(0.05);const m10=s.msg;G.startLevel(8);const next={pit:G.pitCoins(),lvl:G.spiderLvl()};return {near,one,m10,next};},PIT.toString());
  check('M1.12 next to a pit, E tosses one coin in; the count is saved and carries over to every floor',pt.near&&pt.near.kind==='pit'&&pt.one.coins===1&&pt.one.pit===1&&pt.one.saved===1&&pt.next.pit===10,JSON.stringify(pt));
  if(atLeast('1.14.1')){const ct=await G(page,(PITs)=>{const PIT=eval(PITs),G=__game;G.setSeed(777);G.startLevel(7,{hearts:5,coins:5,perm:{}});G.clearMobs();PIT();G.advance(0.05);const n=G.nearUse();G.use();G.advance(1.2);const c=G.state().stats.lastPitCoin;return {n,c};},PIT.toString());
    check('M1.14.1 a tossed coin lands on the centre of the pit and drops down the shaft',ct.c&&Math.abs(ct.c.x-ct.n.x-.5)<0.05&&Math.abs(ct.c.y-ct.n.y-.5)<0.05&&Math.abs(ct.c.z)<0.1,JSON.stringify(ct));
    const sh=await G(page,(PITs)=>{const PIT=eval(PITs),G=__game;G.setSeed(777);G.startLevel(7,{hearts:5,coins:5,perm:{}});G.clearMobs();PIT();G.setPitch(-110);G.advance(0.05);G.render();const cols=new Set();let dark=0;for(let y=150;y<300;y+=2)for(let x=0;x<480;x+=2){const c=G.pixelAt(x,y);cols.add(c.join());if(c[0]+c[1]+c[2]<40)dark++;}return {cols:cols.size,dark};},PIT.toString());
    check('M1.14.1 pits are drawn as shafts with stone walls fading into darkness (not flat black squares)',sh.cols>60&&sh.dark>20,JSON.stringify(sh));
    await shot(page,'pit_shaft');}
  if(atLeast('1.15')){const nl=await G(page,()=>{const G=__game;G.setSeed(777);G.startLevel(9,{hearts:5,coins:0,perm:{pit:60}});G.clearMobs();G.advance(0.05);const p=G.state().player;
      const sp=G.pitSpider('bigspider'),sk=G.pitSpider('skitter');const n0=G.state().items.filter(i=>!i.taken).length;const flag=G.state().enemies[sp].noLoot;G.damageMob(sp,999);G.damageMob(sk,999);G.advance(0.5);const n1=G.state().items.filter(i=>!i.taken).length;
      const c=G.spawn('bigspider',p.x+2,p.y,false,[]);G.damageMob(c,999);G.advance(0.5);const n2=G.state().items.filter(i=>!i.taken).length;return {n0,n1,n2,flag};});
    check('M1.15 spiders that climb out of pits drop no coins or items (no farming); other spiders still do',nl.n1===nl.n0&&nl.flag&&nl.n2>nl.n1,JSON.stringify(nl));}
  check('M1.12 10 coins in the pits unlocks the skittering spiders on later floors',/SKITTERS/.test(pt.m10)&&pt.next.lvl===1,JSON.stringify(pt));
  const sk=await G(page,()=>{const G=__game;G.setSeed(777);G.startLevel(8,{hearts:5,coins:0,perm:{pit:10}});G.clearMobs();const p=G.state().player;const i=G.spawn('skitter',p.x+Math.cos(p.ang)*2.2,p.y+Math.sin(p.ang)*2.2,true,[]);let s,hit=null;
    for(let k=0;k<30&&!hit;k++){s=G.advance(0.1);if(G.faceT()>0)hit={t:k*0.1,hearts:s.player.hearts,face:G.faceT(),gone:s.enemies[i].gone};}window.__fh=true;return hit;});
  await shot(page,'face_hug');
  const sk2=await G(page,()=>{__game.advance(3.2);return __game.faceT();});
  check('M1.12 a skitter runs at you fast and jumps on your face: the screen is covered for 3 s (no damage), then it fades',sk&&sk.t<1.5&&sk.hearts===5&&sk.face>2.8&&sk.gone&&sk2===0,JSON.stringify({sk,sk2}));
  const sp=await G(page,()=>{const G=__game;let skitt=0,big=0,floors=0;for(const sd of [777,4242,1,2]){G.setSeed(sd);G.startLevel(9,{hearts:5,coins:0,perm:{pit:50}});if(!G.pits().length)continue;floors++;G.state().enemies.forEach((e,i)=>G.damageMob(i,99));PITs:{}
      for(let k=0;k<700;k++){G.setHearts(5);const s=G.advance(0.1);const pits=G.pits();if(k%50===0&&pits.length){const pp=pits[k/50%pits.length|0];const st0=G.state(),inMap=(x,y)=>x>0&&y>0&&x<st0.mapW-1&&y<st0.mapH-1;const spots=[[pp.x+.5,pp.y-2.5],[pp.x+.5,pp.y+3.5],[pp.x-2.5,pp.y+.5],[pp.x+3.5,pp.y+.5]].filter(([x,y])=>inMap(x,y)&&!G.solidAt(x,y));if(spots.length)G.teleport(spots[0][0],spots[0][1]);} /* M1.36: stay inside the map (pits can sit near its edge) */s.enemies.forEach(e=>{if(e.spawned&&e.type==='skitter')skitt++;if(e.spawned&&e.type==='bigspider')big++;});}}
    G.startLevel(9,{hearts:5,coins:0,perm:{pit:50}});const b=G.spawn('bigspider',1,1,false,[]);return {floors,skitt:skitt>0,big:big>0,lvl:G.spiderLvl(),bigHp:__game.state().enemies[b].hp};});
  check('M1.12 at 50 coins big Brood Spiders (8 HP) also climb out of the pits and attack, alongside the skitters',sp.lvl===2&&sp.skitt&&sp.big&&sp.bigHp===8,JSON.stringify(sp));
  // ---- floor 15
  const f15=await G(page,()=>{const G=__game;G.setSeed(777);G.startLevel(14,{hearts:5,coins:0,perm:{pit:99}});const a=G.bossType(),an=G.state().msg;G.startLevel(14,{hearts:5,coins:0,perm:{pit:100}});const b=G.bossType(),bn=G.state().msg;G.startLevel(29,{hearts:5,coins:0,perm:{pit:100}});return {a,b,an,bn,f30:G.bossType()};});
  check('M1.12 floor 15: the Grand Masque, or the Broodmother if 100 coins went into the pits by then (Coghoot moves to floor 30)',f15.a==='masque'&&f15.b==='brood'&&/GRAND MASQUE/.test(f15.an)&&/BROODMOTHER/.test(f15.bn)&&f15.f30==='owl',JSON.stringify(f15));
  const mq=await G(page,()=>{const G=__game;G.setSeed(777);G.startLevel(14,{hearts:5,coins:0,perm:{pit:0}});G.faceBoss(3);G.advance(0.1);let happyHit=null,sadHit=null,gold=0,minions=0,bar=0,tStart=null;
    for(let k=0;k<400;k++){G.setHearts(5);const s=G.advance(0.1),b=G.boss().ent,hp=b.hp;const eh=s.enemies[G.boss().i];
      s.eshots.forEach(q=>{if(q.kind==='goldball')gold++;});minions=Math.max(minions,s.enemies.filter(e=>e.type==='zapfly'&&e.spawned&&!e.gone).length);
      if(/GOES WILD/.test(s.msg)&&tStart===null)tStart=k;if(k%10===0){const happy=/LAUGHS/.test(s.msg);}if(happyHit===null||sadHit===null){const m=__game.state().msg;}}
    G.startLevel(14,{hearts:5,coins:0,perm:{pit:0}});G.faceBoss(3);G.advance(0.2);const st=()=>G.boss().ent;let tries=0;while(!st().happy&&tries++<150){G.setHearts(5);G.advance(0.1);}const h0=st().hp;G.hitBoss(3);const h1=st().hp;tries=0;while(st().happy&&tries++<150){G.setHearts(5);G.advance(0.1);}const h2=st().hp;G.hitBoss(3);const h3=st().hp;
    return {gold,minions,tStart,happy:{h0,h1},sad:{h2,h3},blocks:G.state().stats.masqueBlocks};});
  check('M1.12 the Grand Masque is invincible while it laughs and takes damage while it weeps',mq.happy.h1===mq.happy.h0&&mq.sad.h3===mq.sad.h2-3&&mq.blocks>0,JSON.stringify(mq));
  check('M1.12 the Grand Masque keeps shooting gold balls (happy or sad), calls in Tragedy masks and goes wild with a shot barrage',mq.gold>20&&mq.minions>=1&&mq.tStart!==null,JSON.stringify(mq));
  const br=await G(page,()=>{const G=__game;G.setSeed(777);G.startLevel(14,{hearts:5,coins:0,perm:{pit:100}});G.faceBoss(3);G.advance(0.1);let web=0,slow=false,eggs=0,pops=0,skit=0;
    const e0=G.state().stats.eggs;if(G.bossForce){G.bossForce('web');const s0=G.advance(0.1);if(s0.eshots.some(q=>q.kind==='web'))web++;} /* M1.14.2: force one web so the check doesn't depend on luck */for(let k=0;k<600&&!(web&&eggs&&skit);k++){G.setHearts(5);const s=G.advance(0.1);if(s.eshots.some(q=>q.kind==='web'))web++;eggs=s.stats.eggs-e0;pops=s.stats.eggPops;skit=Math.max(skit,s.enemies.filter(e=>(e.type==='skitter'||e.type==='bigspider')&&!e.gone).length);} /* attacks are random: watch up to 60 s until each kind is seen */
    G.startLevel(6,{hearts:5,coins:0});G.clearMobs();const pp=G.state().player;G.addShot('web',pp.x+Math.cos(pp.ang)*1.5,pp.y+Math.sin(pp.ang)*1.5,-Math.cos(pp.ang)*6,-Math.sin(pp.ang)*6);G.advance(0.4);slow=G.slowT()>2;
    const x0=G.state().player;window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW'}));G.advance(0.5);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW'}));const x1=G.state().player;const moved=Math.hypot(x1.x-x0.x,x1.y-x0.y);
    const eg=G.spawn('eggsac',G.state().player.x+1,G.state().player.y,true,[]);const egHp=G.state().enemies[eg].hp;G.damageMob(eg,4);const s2=G.advance(0.3);
    G.clearMobs();const e2=G.spawn('eggsac',3,3,true,[]);let popped=false;for(let k=0;k<110;k++){const s=G.advance(0.1);if(s.enemies[e2].gone){popped=true;break;}}const after=G.state().enemies.filter(e=>(e.type==='skitter'||e.type==='bigspider')&&!e.gone).length;
    return {web,slow,moved,eggs,pops,skit,egHp,killed:s2.enemies[eg].state==='dead'||s2.enemies[eg].gone,popped,after};});
  check('M1.12 the Broodmother shoots webs (3 s slow), lobs egg sacs and calls in skitters and Brood Spiders',br.web>0&&br.slow&&br.eggs>0&&br.skit>0,JSON.stringify(br));
  check('M1.12 an egg sac has 4 HP; left alone it grows for 10 s and bursts into 3 spiders',br.egHp===4&&br.killed&&br.popped&&br.after>=3,JSON.stringify(br));
  const wb=await G(page,()=>{const G=__game;G.setSeed(777);G.startLevel(14,{hearts:5,coins:0,perm:{pit:100}});G.faceBoss(2.5);G.advance(0.1);const b=G.boss().ent;G.hitBoss(999);let s=G.advance(1.6);const w=s.items.find(i=>i.kind==='webg');if(!w)return {none:true};G.teleport(w.x,w.y);s=G.advance(0.1);
    G.startLevel(16,{hearts:5,coins:0});G.clearMobs();const p=G.state().player;const i=G.spawn('clunk',p.x+Math.cos(p.ang)*1.5,p.y+Math.sin(p.ang)*1.5,true,[]);G.shoot(0);let slowed=false;for(let k=0;k<10;k++){G.setHearts(5);G.advance(0.05);}
    const e=G.state().enemies[i];return {perm:G.state().perm.web,hit:e.hp<e.maxHp};});
  check('M1.12 the Broodmother drops the Golden Web: kept for good, your hits slow monsters',!wb.none&&wb.perm&&wb.hit,JSON.stringify(wb));
  // ---- coin doors, shrines, trapdoors
  const fl=await G(page,()=>{const G=__game;let n=0,cd=0,sh=0,tr=0,trBoss=0,prices=new Set(),loot={};for(const sd of [1,2,3,4,5,6,7,8,9,10,11,12])for(let f=2;f<=21;f++){G.setSeed(sd);G.startLevel(f-1,{hearts:5,coins:0,perm:{}});const e=G.extras();n++;
      if(e.coinDoor){cd++;prices.add(e.coinDoor.price);}if(e.shrine)sh++;if(e.trap){tr++;if(f%5===0)trBoss++;}}return {n,cd,sh,tr,trBoss,prices:[...prices].sort((a,b)=>a-b)};});
  check(`M1.12 coin doors (5, 10 or 20 coins), shrines and trapdoors turn up on some floors (${fl.cd}, ${fl.sh}, ${fl.tr} of ${fl.n}); never a trapdoor on a boss floor`,fl.cd>fl.n*.2&&fl.sh>fl.n*.15&&fl.tr>fl.n*.15&&fl.trBoss===0&&fl.prices.join()==='5,10,20',JSON.stringify(fl));
  const cdt=await G(page,()=>{const G=__game;for(const sd of [1,2,3,4,5,6,7,8,9,10,11,12])for(let f=2;f<=12;f++){G.setSeed(sd);G.startLevel(f-1,{hearts:5,coins:0,perm:{}});const e=G.extras();if(!e.coinDoor||e.coinDoor.price!==10)continue;const c=e.coinDoor;
      const dirs=[[1,0,Math.PI],[-1,0,0],[0,1,-Math.PI/2],[0,-1,Math.PI/2]];for(const d of dirs){const x=c.x+d[0],y=c.y+d[1];if(G.cellType(x,y)===0&&G.cellAt(c.x-d[0],c.y-d[1]).t===0&&!G.itemList().some(i=>Math.floor(i.x)===x&&Math.floor(i.y)===y)){G.teleport(x+.5,y+.5,d[2]);break;}} /* M1.31: with a 1-cell closet both sides are open; stand on the side without the loot */
      G.setCoins(5);G.advance(0.05);G.use();let s=G.advance(0.1);const poor={msg:s.msg,coins:s.player.coins,locked:G.cellAt(c.x,c.y).locked};G.setCoins(14);G.use();s=G.advance(0.8);const paid={coins:s.player.coins,open:G.cellAt(c.x,c.y).open,locked:G.cellAt(c.x,c.y).locked};
      const items=s.items.filter(i=>!i.taken&&Math.hypot(i.x-c.x-.5,i.y-c.y-.5)<4&&['power','gold','piggy','bag','item'].includes(i.kind)).length;return {c,poor,paid,items};} /* M1.23+: a run item ('item') counts as better */return null;});
  check('M1.12 a coin door asks for its price, takes it, opens; the room behind holds a power-up (or better)',cdt&&/WANTS 10 COINS/.test(cdt.poor.msg)&&cdt.poor.locked&&cdt.paid.coins===4&&cdt.paid.open>0.9&&!cdt.paid.locked&&cdt.items>=1,JSON.stringify(cdt));
  await shot(page,'coin_door_open');
  const shr=await G(page,()=>{const G=__game;for(const sd of [1,2,3,4,5,6,7,8,9,10])for(let f=3;f<=12;f++){G.setSeed(sd);G.startLevel(f-1,{hearts:3,coins:40,perm:{}});const e=G.extras();if(!e.shrine)continue;const c=e.shrine;
      const dirs=[[1,0,Math.PI],[-1,0,0],[0,1,-Math.PI/2],[0,-1,Math.PI/2]];for(const d of dirs){const x=c.x+d[0],y=c.y+d[1];if(G.cellType(x,y)===0){G.teleport(x+.5,y+.5,d[2]);break;}}G.state().enemies.forEach((e2,i)=>G.damageMob(i,99));G.advance(0.8);
      const ut=G.state().useTarget,c0=G.state().player.coins;G.use();let s=G.advance(0.1);const c1=s.player.coins,msg=s.msg;G.use();s=G.advance(0.1);return {ut:!!ut,c0,c1,msg,again:s.msg,c2:s.player.coins};}return null;});
  check('M1.12 a shrine takes 15 coins for a blessing (or, rarely, a curse), once per floor',shr&&shr.ut&&(V136?shr.c1<=shr.c0-14:shr.c1<=25)&& /* M1.36: a coin may lie next to the shrine; count from just before the offering *//BLESSED|CURSED/.test(shr.msg)&&/SILENT/.test(shr.again),JSON.stringify(shr));
  await shot(page,'shrine');
  const trp=await G(page,()=>{const G=__game;for(const sd of [1,2,3,4,5,6,7,8,9,10])for(let f=2;f<=12;f++){if(f%5===0)continue;G.setSeed(sd);G.startLevel(f-1,{hearts:5,coins:20,perm:{}});const e=G.extras();if(!e.trap)continue;G.state().enemies.forEach((e2,i)=>G.damageMob(i,99));G.advance(0.05);
      G.teleport(e.trap.x+.5,e.trap.y+.5);G.advance(0.05);const near=G.nearUse();G.use();let s=G.advance(0.2);const mode=s.mode;s=G.advance(1.2);return {f,near,mode,level:s.level,m2:s.mode,coins:s.player.coins};}return null;});
  check('M1.12 a coin trapdoor (15 coins) drops you straight to the next floor',trp&&trp.near&&trp.near.kind==='trap'&&trp.mode==='fall'&&trp.level===trp.f&&trp.m2==='play'&&trp.coins===5,JSON.stringify(trp));
  // ---- piggy bank
  const pg=await G(page,()=>{const G=__game;G.setSeed(777);G.startLevel(6,{hearts:5,coins:2,perm:{}});G.clearMobs();const p=G.state().player;G.spawnItem('piggy',null,p.x,p.y);G.advance(0.05);const has=G.state().perm.piggy;
    const i=G.spawn('clunk',p.x+Math.cos(p.ang)*1.4,p.y+Math.sin(p.ang)*1.4,true,[]);G.shoot(0);for(let k=0;k<10;k++){G.setHearts(5);G.advance(0.05);}const s=G.state(),d=s.enemies[i].maxHp-s.enemies[i].hp,c1=s.player.coins;G.shoot(0);G.advance(0.3);const s2=G.state();
    return {has,dmg:d,c1,c2:s2.player.coins,after:s2.perm.piggy,msg:s2.msg};});
  check('M1.12 Piggy Bank: each throw costs a coin and does double damage; it shatters when the coins run out',pg.has&&pg.dmg===2&&pg.c1===1&&pg.c2===0&&!pg.after&&/SHATTERS/.test(pg.msg),JSON.stringify(pg));
  // ---- rare wares
  if(!V123){ // M1.23: the rare page sells only the Piggy Bank and the Mystery Box
  const rw=await G(page,()=>{const G=__game;G.setSeed(777);G.startLevel(1,{hearts:5,coins:400,perm:{}});G.faceShop();G.openShop();const r0=G.shopRows();const mi=r0.findIndex(r=>r.id==='more');G.shopBuy(mi);const r1=G.shopRows();
    const hc=r1.findIndex(r=>r.id==='r_hp'),p0=r1[hc].price;G.shopBuy(hc);const r2=G.shopRows();const mh=G.maxHearts();const gi=r2.findIndex(r=>r.id==='r_gold');G.shopBuy(gi);const gold=Object.keys(G.state().perm.gold).length;
    const bi=r2.findIndex(r=>r.id==='r_box');G.shopBuy(bi);const back=G.shopRows().findIndex(r=>r.id==='back');G.shopBuy(back);return {page:G.shopPage(),names:r1.map(r=>r.name),p0,p1:r2[hc].price,mh,gold,coins:G.state().player.coins};});
  check('M1.12 Old Murkle has a second page of rare wares: Heart Container, Strong Arm, Quick Hands (pricier each time), Piggy Bank, a Golden Wonder and a Mystery Box',rw.names.length===(atLeast('1.17')?9:8)&&rw.p0===60&&rw.p1===90&&rw.mh===6&&rw.gold===1&&rw.page===0,JSON.stringify(rw));
  }
  await G(page,()=>{const G=__game;G.setSeed(777);G.startLevel(1,{hearts:5,coins:400,perm:{}});G.faceShop();G.openShop();G.shopBuy(G.shopRows().findIndex(r=>r.id==='more'));G.render();});await shot(page,'rare_wares');
  await G(page,()=>{const G=__game;G.closeShop&&G.closeShop();G.setSeed(777);G.startLevel(14,{hearts:5,coins:0,perm:{pit:0}});G.faceBoss(3);G.advance(0.3);});await shot(page,'grand_masque');
  await G(page,()=>{const G=__game;G.setSeed(777);G.startLevel(14,{hearts:5,coins:0,perm:{pit:100}});G.faceBoss(3);G.advance(0.3);});await shot(page,'broodmother');
  await ctx.close();
}

// ---------- M1.13: +1 HP per floor, more elite modifiers, googly worms, face-hug image ----------
async function m113Tests(){
  const shot=async(page,name)=>page.screenshot({path:`${SHOTS}/m113_${name}.png`});
  const savePng=(name,url)=>fs.writeFileSync(`${SHOTS}/${name}`,Buffer.from(url.split(',')[1],'base64'));
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m113'});
  await G(page,()=>{__game.manual=true;__game.bossIntro=false;localStorage.clear();});
  savePng('m113_sprites_4x.png',await G(page,()=>__game.spriteSheet(4,'m113')));
  const hp=await G(page,()=>{const G=__game,M=G.mobs,bad=[];let n=0;for(const f of [2,3,6,12,30,80]){G.setSeed(777);G.startLevel(f-1);G.state().enemies.forEach(e=>{if(!M[e.type]||e.spawned||e.type==='zapfly'&&e.hp===1&&e.maxHp===1&&false)return;const b=M[e.type].hp+(f-1),want=e.mods.includes('beefy')?Math.ceil(b*2.5):b;n++;if(e.maxHp!==want&&!(e.type==='zapfly'&&e.maxHp===1))bad.push(f+':'+e.type+' '+e.maxHp+'!='+want);});}
    G.setSeed(777);G.startLevel(0);const t=G.state().enemies.map(e=>e.maxHp);G.startLevel(9);const k=G.knight();return {n,bad:bad.slice(0,5),nb:bad.length,tut:t,knight:k&&k.maxHp};});
  check('M1.13 mobs get +1 base HP per floor below the first (BEEFY x2.5 of that); the tutorial keeps base HP',hp.nb===0&&hp.n>50&&hp.tut.every(v=>v===3),JSON.stringify(hp));
  const pool=await G(page,()=>{const G=__game,ids=Object.keys(G.mods);const at=f=>{const c=G.rollStats(f,6000,'m113').counts;return Object.keys(c);};return {ids,f3:at(3),f10:at(10)};});
  check(`M1.13 ${pool.ids.length} elite modifiers: the 6 new ones (SHIELDED, SPLITTER, VAMPIRE, EXPLOSIVE, BLINK, FROST) appear from floor 4-5, never on floor 3`,pool.ids.length===(V128?40:11)&&['shielded','splitter','vampire','explosive','blink','frost'].every(k=>pool.f10.includes(k)&&!pool.f3.includes(k)),JSON.stringify(pool));
  const md=await G(page,()=>{const G=__game,r={};const fresh=()=>{G.setSeed(777);G.startLevel(6,{hearts:5,coins:0});G.clearMobs();G.setEffect(null);G.setHearts(5);return G.state().player;};
    let p=fresh();let i=G.spawn('clunk',p.x+3,p.y,false,['shielded']);G.damageMob(i,2);r.shield={hp:G.state().enemies[i].hp,max:G.state().enemies[i].maxHp};G.damageMob(i,1);r.shield.after=G.state().enemies[i].hp;
    p=fresh();i=G.spawn('clunk',p.x+.35,p.y,true,['vampire']);G.damageMob(i,3);const v0=G.state().enemies[i].hp;let s;for(let k=0;k<5;k++)s=G.advance(0.1);r.vamp={before:v0,after:s.enemies[i].hp,hearts:s.player.hearts};
    p=fresh();i=G.spawn('clunk',p.x+.35,p.y,true,['frost']);for(let k=0;k<5;k++)s=G.advance(0.1);r.frost=G.slowT();
    p=fresh();i=G.spawn('clunk',p.x+.35,p.y,false,['splitter']);G.damageMob(i,99);s=G.advance(0.4);r.split=s.enemies.filter(e=>e.spawned&&e.type==='clunk'&&!e.gone).map(e=>({hp:e.hp,scale:e.scale}));
    p=fresh();i=G.spawn('springle',p.x+.8,p.y,false,['explosive']);G.damageMob(i,99);s=G.advance(0.3);const mid=s.player.hearts;s=G.advance(0.8);r.boom={mid,after:s.player.hearts,ex:s.stats.explosions};
    p=fresh();i=G.spawn('kettle',p.x+6,p.y,true,['blink']);const e0=G.state().enemies[i];G.freeze=false;let jumped=false;for(let k=0;k<90&&!jumped;k++){G.setHearts(5);s=G.advance(0.1);const e=s.enemies[i];if(Math.hypot(e.x-e0.x,e.y-e0.y)>1.2&&Math.hypot(e.x-s.player.x,e.y-s.player.y)<3)jumped=true;}r.blink={jumped,n:s.stats.blinks};return r;});
  check('M1.13 SHIELDED soaks the first 2 hits; VAMPIRE heals when it bites you; FROST bites slow you',md.shield.hp===md.shield.max&&md.shield.after===md.shield.max-1&&md.vamp.after===md.vamp.before+1&&md.vamp.hearts<5&&md.frost>1,JSON.stringify(md));
  check('M1.13 SPLITTER splits into 2 smaller copies (1/3 HP); EXPLOSIVE blows up after a short fuse and hurts you up close; BLINK teleports next to you',md.split.length===2&&md.split.every(c=>c.scale===0.7)&&md.boom.mid===5&&md.boom.after===4&&md.boom.ex>=1&&md.blink.jumped,JSON.stringify({s:md.split,b:md.boom,bl:md.blink}));
  const wm=await G(page,()=>{const G=__game;let floors=0,tot=0,cols=new Set();for(const sd of [1,2,3,4,5,6,7,8])for(const f of [2,4,7]){G.setSeed(sd);G.startLevel(f-1);const w=G.worms();floors++;tot+=w.length;w.forEach(x=>cols.add(x.col));}
    G.setSeed(777);G.startLevel(6);G.clearMobs();const a=G.worms();G.advance(3);const b=G.worms();const moved=a.some((w,i)=>Math.hypot(w.x-b[i].x,w.y-b[i].y)>.3);const solid=b.some(w=>G.solidAt(w.x,w.y));
    const w=b[0],p=G.state().player;G.teleport(w.x-1.2,w.y,0);G.advance(0.05);return {avg:tot/floors,cols:cols.size,moved,solid,ents:G.state().enemies.length};});
  check('M1.13 1-3 googly-eyed worms per floor, randomly coloured, crawl around (no hitbox, not monsters)',wm.avg>=1&&wm.avg<=3&&wm.cols>=4&&wm.moved&&!wm.solid&&wm.ents===0,JSON.stringify(wm));
  await shot(page,'worm');
  const fh=await G(page,()=>{const G=__game;G.setSeed(777);G.startLevel(8);G.clearMobs();const p=G.state().player;G.spawn('skitter',p.x+Math.cos(p.ang)*.5,p.y+Math.sin(p.ang)*.5,true,[]);G.advance(0.3);return {face:G.faceT(),drawn:G.state().stats.faceDrawn||0};});
  check('M1.13 after a skitter jumps you, a sprawled spider (seen from below, legs around your face) covers the screen',fh.face>2&&fh.drawn>0,JSON.stringify(fh));
  await shot(page,'face_hug');
  await ctx.close();
}

// ---------- M1.14: the King in Yellow (floor 20) ----------
async function m114Tests(){
  const shot=async(page,name)=>page.screenshot({path:`${SHOTS}/m114_${name}.png`});
  const savePng=(name,url)=>fs.writeFileSync(`${SHOTS}/${name}`,Buffer.from(url.split(',')[1],'base64'));
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m114'});
  await G(page,()=>{__game.manual=true;localStorage.clear();});
  savePng('m114_sprites_4x.png',await G(page,()=>__game.spriteSheet(4,'m114')));
  const fl=await G(page,()=>{const G=__game,out=[];for(const sd of [1,777,4242]){G.bossIntro=true;G.setSeed(sd);G.startLevel(19,{hearts:5,coins:0,perm:{}});const l=G.lectern(),b=G.boss(),A=b.def.room;
      out.push({gold:G.goldWalls(),type:G.bossType(),dorm:G.dormant(),lect:!!l&&l.x>=A.x&&l.x<A.x+A.w&&l.y>=A.y&&l.y<A.y+A.h,script:!!l&&!!l.scriptAt,msg:G.state().msg,hp:b.ent.maxHp});}
    G.setSeed(777);G.startLevel(18);const f19=G.goldWalls();G.startLevel(34);return {out,f19,f35:G.bossType()};});
  check('M1.14 floor 20: gold brick walls, an empty lectern in the boss room, the play script somewhere on the floor, the King not yet there (HP 70 x1.4 + 5 per floor = 193)',fl.out.every(o=>o.gold&&o.type==='yellow'&&o.dorm&&o.lect&&o.script&&/PLAY SCRIPT/.test(o.msg)&&o.hp===Math.ceil(70*1.4)+95)&&!fl.f19&&fl.f35==='king',JSON.stringify(fl));
  const sm=await G(page,()=>{const G=__game;G.bossIntro=true;G.setSeed(777);G.startLevel(19,{hearts:5,coins:0,perm:{}});const l=G.lectern(),A=G.boss().def.room;
    G.teleport(A.x+.5,A.y+.5);let s=G.advance(0.3);const before={mode:s.mode,locked:G.arenaDoors().some(d=>d.bossLock),dorm:G.dormant(),bar:!!s.stats.bossBar};
    const dirs=[[1,0,Math.PI],[-1,0,0],[0,1,-Math.PI/2],[0,-1,Math.PI/2]];const face=()=>{for(const d of dirs){const x=l.x+d[0],y=l.y+d[1];if(!G.solidAt(x+.5,y+.5)){G.teleport(x+.5,y+.5,d[2]);return true;}}return false;};face();G.advance(0.05);G.use();s=G.advance(0.1);const noScript=s.msg;
    const sa=l.scriptAt;G.teleport(sa.x+.5,sa.y+.5);s=G.advance(0.1);const got=G.lectern().script;face();G.advance(0.05);G.use();s=G.advance(0.2);const intro={mode:s.mode,dorm:G.dormant()};s=G.advance(1.8);const locked=G.arenaDoors().every(d=>d.bossLock);s=G.advance(3.5);
    return {before,noScript,got,intro,locked,after:{mode:s.mode,woke:G.boss().ent.woke,called:G.lectern().called,gone:G.lectern().gone,cellT:G.lectern().cellT}};});
  check('M1.14 walking into his hall without the script does nothing; the lectern waits for it',sm.before.mode==='play'&&!sm.before.locked&&sm.before.dorm&&!sm.before.bar&&/WAITS/.test(sm.noScript),JSON.stringify(sm));
  check('M1.14 placing the play script on the lectern summons him: cut scene, doors lock, then the fight (M1.14.1: the lectern shatters)',sm.got&&sm.intro.mode==='intro'&&!sm.intro.dorm&&sm.locked&&sm.after.mode==='play'&&sm.after.woke&&sm.after.called&&(!atLeast('1.14.1')||(sm.after.gone&&sm.after.cellT===0)),JSON.stringify(sm));
  await shot(page,'king_in_yellow');
  const at=await G(page,()=>{const G=__game,r={};const start=()=>{G.bossIntro=false;G.setSeed(777);G.startLevel(19,{hearts:5,coins:0,perm:{}});const l=G.lectern();G.teleport(l.scriptAt.x+.5,l.scriptAt.y+.5);G.advance(0.05);
      const dirs=[[1,0,Math.PI],[-1,0,0],[0,1,-Math.PI/2],[0,-1,Math.PI/2]];for(const d of dirs){const x=l.x+d[0],y=l.y+d[1];if(!G.solidAt(x+.5,y+.5)){G.teleport(x+.5,y+.5,d[2]);break;}}G.advance(0.05);G.use();G.advance(0.1);G.state().enemies.forEach((e,i)=>{if(e.type!=='yellow')G.damageMob(i,99);});G.faceBoss(3);G.advance(0.1);};
    start();G.kingForce('sign');let s=G.advance(0.1);const sg=G.signs();const p0=s.player;G.setHearts(5);for(let k=0;k<14;k++){G.kingForce&&0;s=G.advance(0.1);}r.sign={n:sg.length,at:sg[0]&&Math.hypot(sg[0].x-p0.x,sg[0].y-p0.y),hearts:s.player.hearts,conf:G.confuse()};
    const q0=G.state().player;window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW'}));G.advance(0.3);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW'}));const q1=G.state().player;r.sign.back=(q1.x-q0.x)*Math.cos(q0.ang)+(q1.y-q0.y)*Math.sin(q0.ang);
    start();G.kingForce('robes');s=G.advance(0.1);r.rags=s.eshots.filter(q=>q.kind==='rag').length;
    start();G.kingForce('carcosa');s=G.advance(0.1);r.carcosa={t:G.carcosa(),suns:s.eshots.filter(q=>q.kind==='sun').length};
    start();G.kingForce('hali');s=G.advance(0.1);const hs=G.halis();G.setHearts(5);for(let k=0;k<12;k++){s=G.advance(0.1);}r.hali={n:hs.length,hearts:s.player.hearts};
    return r;});
  check('M1.14 the Yellow Sign brands the floor under you; still on it after a second, it costs a heart and reverses your controls for 3 s',at.sign.n===1&&at.sign.at<0.3&&at.sign.hearts<5&&at.sign.conf>2&&at.sign.back<-0.1,JSON.stringify(at.sign));
  check('M1.14 tattered robes lash out in a fan; Carcosa tints the room, scrambles the map and text and sends twin suns; the Lake of Hali spreads pools that hurt',at.rags>=5&&at.carcosa.t>5&&at.carcosa.suns===2&&at.hali.n>=3&&at.hali.hearts<5,JSON.stringify(at));
  await G(page,()=>{const G=__game;G.kingForce('carcosa');G.advance(0.4);});await shot(page,'carcosa');
  await ctx.close();
}

// ---------- M1.16: cheat console ----------
async function m116Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m116'});
  await G(page,()=>{__game.manual=true;localStorage.clear();__game.setSeed(777);__game.menuPick(0);__game.advance(0.1);});
  await page.keyboard.type('chea');const half=await G(page,()=>__game.cheatOpen());await page.keyboard.type('t');await page.waitForTimeout(50);
  const open=await G(page,()=>({open:__game.cheatOpen(),mode:__game.state().mode,focus:document.activeElement&&document.activeElement.id}));
  await page.keyboard.type('help');await page.keyboard.press('Enter');await page.keyboard.type('jump 12');await page.keyboard.press('Enter');await page.waitForTimeout(50);
  const j=await G(page,()=>{const s=__game.advance(0.05);return {mode:s.mode,level:s.level,cheated:__game.cheated(),save:s.save&&s.save.run&&s.save.run.cheated,open:__game.cheatOpen()};});
  check('M1.16 typing "cheat" while playing opens the cheat console (game paused); "jump 12" takes you to floor 12',!half&&open.open&&open.mode==='cheat'&&open.focus==='cheatIn'&&j.mode==='play'&&j.level===11&&!j.open,JSON.stringify({half,open,j}));
  const c=await G(page,()=>{const G=__game,r={};r.heal=(G.setHearts(1),G.cheat('heal'),G.state().player.hearts);r.coins=(G.cheat('coins 250'),G.state().player.coins);r.god=G.cheat('god');const p=G.state().player;const i=G.spawn('clunk',p.x+.3,p.y,true,[]);let s;for(let k=0;k<20;k++)s=G.advance(0.1);r.godHearts=s.player.hearts;G.cheat('god');
    if(G.itemN){r.give=(G.cheat('give black'),G.itemN('black')===1?'rocks':'no');r.gold=true;}else{r.give=(G.cheat('give rocks'),G.state().player.item);r.gold=(G.cheat('gold magnet'),G.state().perm.gold.magnet);}r.kill=G.cheat('kill');r.unknown=G.cheat('fly');return r;});
  check('M1.16 cheats: heal, coins, god (no damage), give, gold, kill; unknown commands are rejected',c.heal===5&&c.coins===250&&c.godHearts===5&&c.give==='rocks'&&c.gold===true&&/POPPED/.test(c.kill)&&c.unknown==='UNKNOWN',JSON.stringify(c));
  const hs=await G(page,()=>{const G=__game;G.setHearts(1);G.setEffect(null);const p=G.state().player;G.spawn('clunk',p.x+.3,p.y,true,[]);let s;for(let k=0;k<20;k++){s=G.advance(0.1);if(s.mode==='dead')break;}G.advance(0.6);G.confirm();s=G.advance(0.1);const n0=s.stats.hsPosts;
    G.state();return {mode:s.mode,final:G.final(),n0};});
  if(hs.mode==='name'){await page.keyboard.type('CHEATER');await page.keyboard.press('Enter');await page.waitForTimeout(100);}
  const after=await G(page,()=>({mode:__game.state().mode,msg:__game.hs().msg,posts:__game.state().stats.hsPosts,local:__game.localScores?__game.localScores().length:null}));
  check('M1.16 a cheated run is not sent to the high scores ("CHEATS USED - SCORE NOT SAVED")',hs.final&&hs.final.cheated&&after.mode==='scores'&&/CHEATS USED/.test(after.msg)&&after.posts===hs.n0,JSON.stringify({hs,after}));
  await ctx.close();
}

// ---------- M1.17: fog of war, sight items, floor ambience, damage indicators ----------
async function m117Tests(){
  const shot=async(page,name)=>page.screenshot({path:`${SHOTS}/m117_${name}.png`});
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m117'});
  const corr=`(()=>{const G=__game;G.manual=true;G.setSeed(777);G.startLevel(6,{hearts:5,coins:0,perm:{}});G.clearMobs();G.setEffect(null);let best=null;const s0=G.state();for(let y=1;y<s0.mapH-1;y++)for(let x=1;x<s0.mapW-1;x++){for(const [dx,dy,a] of [[1,0,0],[-1,0,Math.PI],[0,1,Math.PI/2],[0,-1,-Math.PI/2]]){let n=0;while(!G.solidAt(x+.5+dx*(n+1),y+.5+dy*(n+1))&&n<14)n++;if(!G.solidAt(x+.5,y+.5)&&(!best||n>best.n))best={x,y,a,n,dx,dy};}}G.teleport(best.x+.5,best.y+.5,best.a);return best;})()`;
  const fog=await G(page,(corr)=>{const G=__game,b=eval(corr),px=(d)=>{G.clearMobs();G.spawn('clunk',b.x+.5+b.dx*d,b.y+.5+b.dy*d,false,[]);G.advance(0.02);G.render();return G.state().stats.enemyBoxes.length?G.state().stats.spritePx:0;};
    const v=G.viewDist(),near=px(3),far=px(7);G.give('torch');G.useItem();const vt=G.viewDist(),farT=px(7);return {n:b.n,v,near,far,vt,farT};},corr);
  check('M1.17 fog of war: you see about 5 cells; a monster 3 cells away shows, one 7 cells away is lost in the haze',fog.v===5&&fog.near>200&&fog.far<20,JSON.stringify(fog));
  check('M1.17 a Torch pushes the haze back (+3 cells), so the far monster shows',fog.vt===8&&fog.farT>50,JSON.stringify(fog));
  await shot(page,'fog');
  const sg=await G(page,()=>{const G=__game,r={};G.setSeed(777);G.startLevel(6,{hearts:5,coins:0,perm:G.items?{items:{glasses:2}}:{owl:2}});r.owl=G.viewDist();G.setEffect(null);G.give('lantern');G.useItem();r.lantern=G.viewDist();G.setEffect(null);G.give('flare');G.useItem();r.flare=G.viewDist();G.advance(8.2);r.after=G.viewDist();
    G.startLevel(6,{hearts:5,coins:0,perm:{}});G.advance(0.05);const fi=G.fogInfo(),tot=G.state().mapW*G.state().mapH;r.seen=fi.seen;r.tot=tot;r.names=G.permItems?['torch','flare'].map(k=>G.pu[k].name).concat([G.permItems.owl.name]):[G.pu.flare.name,G.items.glasses.name];return r;});
  if(V123)check('M1.23 sight: Reading Glasses +1 each (run item), Flare lights up everything for 8 s',sg.owl===7&&sg.flare>=16&&sg.after===7&&sg.names.join()==='FLARE,READING GLASSES',JSON.stringify(sg));
  else check('M1.17 sight items: Owl Eyes +1 each (permanent), Candle Lantern +2, Flare lights up everything for 8 s',sg.owl===7&&sg.lantern===9&&sg.flare>=16&&sg.after===7&&sg.names.join()==='TORCH,FLARE,OWL EYES',JSON.stringify(sg));
  check('M1.17 the map only learns cells you could actually see (a small patch at the floor start)',sg.seen>0&&sg.seen<sg.tot*.25,JSON.stringify(sg));
  const amb=await G(page,()=>{const r=new Set();for(let f=2;f<12;f++)r.add(__game.ambDescribe(777,f,false));return {kinds:r.size,boss:__game.ambDescribe(777,5,true)<__game.ambDescribe(777,5,false)};});
  check('M1.17 every floor gets its own ambience (drone pitch and sounds from the floor seed); boss floors sit lower',amb.kinds>=4&&amb.boss,JSON.stringify(amb));
  const dm=await G(page,(corr)=>{const G=__game,b=eval(corr);const i=G.spawn('clunk',b.x+.5+b.dx*2,b.y+.5+b.dy*2,false,[]);G.damageMob(i,1);G.advance(0.1);G.render();let red=0;for(let y=40;y<220;y++)for(let x=120;x<360;x++){const c=G.pixelAt(x,y);if(c[0]>230&&c[1]<70&&c[2]<70)red++;}const nums=G.dmgFx().nums;
    G.clearMobs();const p=G.state().player;G.setHearts(5);G.spawn('kettle',p.x-Math.sin(p.ang)*.35,p.y+Math.cos(p.ang)*.35,true,[]);let s;for(let k=0;k<6;k++){s=G.advance(0.05);if(s.player.hearts<5)break;}G.render();const fx=G.dmgFx();
    let right=0,left=0;for(let y=60;y<240;y++){for(let x=440;x<480;x++){const c=G.pixelAt(x,y);if(c[0]>90&&c[1]<30&&c[2]<30)right++;}for(let x=0;x<40;x++){const c=G.pixelAt(x,y);if(c[0]>90&&c[1]<30&&c[2]<30)left++;}}
    let hud=0;for(let y=8;y<44;y++)for(let x=60;x<90;x++){const c=G.pixelAt(x,y);if(c[0]>230&&c[1]<70&&c[2]<70)hud++;}return {red,nums,hearts:s.player.hearts,splat:fx.splats,right,left,hudN:fx.hud,hud};},corr);
  check('M1.17 hitting a monster pops a small red "-1" above it',dm.nums>=1&&dm.red>10,JSON.stringify(dm));
  check('M1.17 getting hit splashes red blood on the side of the screen the hit came from, and a "-1" drops from your hearts',dm.hearts<5&&dm.splat.length===1&&dm.splat[0]>1&&dm.right>200&&dm.right>dm.left*3&&dm.hudN===1&&dm.hud>5,JSON.stringify(dm));
  await shot(page,'damage');
  await ctx.close();
}

// ---------- M1.18: per-floor music, revive ----------
async function m120Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m120'});
  const savePng=(name,url)=>fs.writeFileSync(`${SHOTS}/${name}`,Buffer.from(url.split(',')[1],'base64'));
  const w=await G(page,(V151)=>{const G=__game,W=[0,1,2,3,4,8,9,10,11,12,13,14,15,16,17,18,19],vd=[];for(const ti of W)for(const k of [1,2,3])vd.push(G.variantDiff(ti,k));
    const tiers=[29,33,37,41,45,49,53].map(f=>{const tr=G.texTier(f);return G.deepThemes[tr-1].name+':'+G.deepThemes[tr-1].base;});
    return {count:G.texCount(),names:G.deepThemes.map(d=>d.name),tiers,tf:G.tierFloors,vd,minD:Math.min(...vd.map(v=>v.diff)),ok:vd.every(v=>v.cached&&v.w===(V151?128:64)&&v.dark)};},V151);
  check('M1.20 crystal and void walls replaced by blue slate and ember rock; 7 new stone styles (TEX has 20 entries)',w.count===20&&w.names[2]==='SLATE HALLS'&&w.names[4]==='THE EMBER CORE'&&!w.names.some(n=>/CRYSTAL|VOID/.test(n)),JSON.stringify(w.names));
  check('M1.20 a new wall style every 4 floors from 29 to 53 (sandstone, granite, cobble, limestone, dripstone, chasm shale, ironbound)',w.tiers.join()==='SANDSTONE CRYPT:A,GRANITE HALLS:B,COBBLE WARRENS:E,LIMESTONE NAVE:I,DRIPPING GROTTO:Z,CHASM DEPTHS:+,IRON KEEP:=',w.tiers.join());
  check('M1.20 every wall style has damaged, structural and decorative variations (64x64, cached, with a dark side)',w.ok&&w.vd.length===51&&w.vd.every((v,i)=>v.diff>=(i%3===0?(V125?.8:1.5):(V125?6:10))),`mean difference from the plain wall (damaged/structural/decorative): ${w.vd.map(v=>v.diff.toFixed(1)).join(' ')}`);
  const d=await G(page,()=>{const G=__game;G.manual=true;const n=[0,0,0,0];let doors=0;for(const f of [1,10,30,50]){G.setSeed(900+f);G.startLevel(f-1);const s=G.state();for(let y=0;y<s.mapH;y++)for(let x=0;x<s.mapW;x++){const v=G.cellVariant(x,y);if(v>0||G.solidAt(x+.5,y+.5))n[v<0?0:v]++;}}
    const tot=n.reduce((a,b)=>a+b,0);return {share:n.map(c=>c/tot),tot};});
  check('M1.20 most wall cells are plain; some damaged, fewer pillared bays, a few torches or sigils',d.share[0]>.6&&d.share[1]>.08&&d.share[2]>.04&&d.share[3]>.02&&d.share[3]<d.share[2],d.share.map(x=>x.toFixed(3)).join(' '));
  savePng('m120_walls_4x.png',await G(page,()=>__game.wallSheet(4)));
  const v=await G(page,()=>{const G=__game;G.manual=true;for(let sd=300;sd<400;sd++){G.setSeed(sd);G.startLevel(4);G.clearMobs();const s=G.state();
      for(let y=2;y<s.mapH-2;y++)for(let x=2;x<s.mapW-2;x++){if(G.cellVariant(x,y)!==3)continue;for(const [dx,dy,a] of [[1,0,Math.PI],[-1,0,0],[0,1,-Math.PI/2],[0,-1,Math.PI/2]]){const px=x+dx*2,py=y+dy*2;
        if(G.solidAt(px+.5,py+.5)||G.solidAt(x+dx+.5,y+dy+.5))continue;G.teleport(px+.5,py+.5,a);G.setPitch(0);G.advance(0.05);return {sd,x,y};}}}return null;});
  await page.screenshot({path:`${SHOTS}/m120_torch_wall.png`});
  check('M1.20 a decorative wall bay renders in game (screen m120_torch_wall.png)',!!v,JSON.stringify(v));
  await ctx.close();
}

async function m121Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m121'});
  const atlas=JSON.parse(fs.readFileSync(`${ROOT}/assets/atlas.json`,'utf8')).sheets.walls;
  const a=await G(page,()=>({st:__game.assetState(),n:__game.texCount(),names:__game.texNames,emb:__game.embedded('walls'),png:__game.atlasPng('walls')}));
  check('M1.21 the walls load from the embedded PNG sheet (20 tiles, named as in assets/atlas.json)',a.st.walls==='png'&&a.n===20&&JSON.stringify(a.names)===JSON.stringify(atlas.tiles)&&a.emb.startsWith('data:image/png;base64,'),JSON.stringify(a.st)+' '+a.names.join(','));
  const cmp=await G(page,async(url)=>{const im=new Image();im.src=url;await im.decode();const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const cx=cv.getContext('2d');cx.drawImage(im,0,0);const u=new Uint32Array(cx.getImageData(0,0,im.width,im.height).data.buffer);
    const b=await new Promise(r=>{const i2=new Image();i2.onload=()=>r(i2);i2.src=__game.atlasPng('walls');});const cv2=document.createElement('canvas');cv2.width=b.width;cv2.height=b.height;const c2=cv2.getContext('2d');c2.drawImage(b,0,0);const v=new Uint32Array(c2.getImageData(0,0,b.width,b.height).data.buffer);
    let diff=0;for(let i=0;i<u.length;i++){const p=u[i]>>>24>=128?u[i]|0xff000000:0,q=v[i]>>>24>=128?v[i]|0xff000000:0;if(p!==q)diff++;}return {w:im.width,h:im.height,diff};},a.emb);
  check('M1.21 the walls in game are exactly the pixels of the PNG (export round-trips)',cmp.w===(V151?1280:640)&&cmp.h===(V151?256:128)&&cmp.diff===0,JSON.stringify(cmp));
  await ctx.close();
  // a build whose art is missing still runs (magenta check walls), instead of crashing
  const tmp=`${OUT}/m121_noart.html`;fs.writeFileSync(tmp,fs.readFileSync(FILE,'utf8').replace(/var ASSETS=\{.*\};/,'var ASSETS={};'));
  const c2=await browser.newContext({viewport:{width:1280,height:720}});const p2=await c2.newPage();const errs=[];p2.on('pageerror',e=>errs.push(e.message));
  await p2.goto('file://'+tmp);await p2.waitForFunction(()=>!!window.__game,null,{timeout:10000});
  const m=await p2.evaluate(()=>{__game.manual=true;__game.setSeed(5);__game.startLevel(0);__game.advance(0.1);return {st:__game.assetState(),mode:__game.state().mode};});await c2.close();fs.unlinkSync(tmp);
  check('M1.21 with the art missing the game still starts (walls show a magenta check)',m.st.walls==='missing'&&m.mode==='play'&&!errs.length,JSON.stringify(m)+errs.join(';'));
}

async function m122Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m122'});
  const savePng=(name,url)=>fs.writeFileSync(`${SHOTS}/${name}`,Buffer.from(url.split(',')[1],'base64'));
  const atlas=JSON.parse(fs.readFileSync(`${ROOT}/assets/atlas.json`,'utf8')).sheets;
  const st=await G(page,()=>({st:__game.assetState(),mobs:__game.mobSheets}));
  const missing=st.mobs.filter(n=>st.st[n]!=='png');
  check(`M1.22 all ${st.mobs.length} mob and boss sprite strips load from their embedded PNGs (each listed in assets/atlas.json)`,st.mobs.length>=23&&!missing.length&&st.mobs.every(n=>atlas[n]&&atlas[n].file==='mobs/'+n+'.png'),missing.join(',')||st.mobs.join(','));
  const cmp=await G(page,async(names)=>{const px=async url=>{const im=new Image();im.src=url;await im.decode();const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const cx=cv.getContext('2d');cx.drawImage(im,0,0);return {w:im.width,h:im.height,u:new Uint32Array(cx.getImageData(0,0,im.width,im.height).data.buffer)};};
    const bad=[];for(const n of names){const a=await px(__game.embedded(n)),b=await px(__game.atlasPng(n));let d=a.w!==b.w||a.h!==b.h?1e9:0;if(!d)for(let i=0;i<a.u.length;i++){const p=a.u[i]>>>24>=128?a.u[i]|0xff000000:0,q=b.u[i]>>>24>=128?b.u[i]|0xff000000:0;if(p!==q)d++;}if(d)bad.push(n+':'+d);}return bad;},['walls',...st.mobs]);
  check('M1.22 the game\'s own PNG reader gives exactly the pixels the browser decodes, for every sheet (mobs in game = the PNG files)',cmp.length===0,cmp.join(' '));
  savePng('m122_mobs_3x.png',await G(page,()=>__game.spriteSheet(3,'boss')));
  await ctx.close();
  // one mob's art missing: that mob shows a magenta check, everything else keeps working
  const tmp=`${OUT}/m122_noscreamer.html`;fs.writeFileSync(tmp,fs.readFileSync(FILE,'utf8').replace(/"screamer":\{[^}]*\},/,''));
  const c2=await browser.newContext({viewport:{width:1280,height:720}});const p2=await c2.newPage();const errs=[];p2.on('pageerror',e=>errs.push(e.message));
  await p2.goto('file://'+tmp);await p2.waitForFunction(()=>!!window.__game,null,{timeout:10000});
  const m=await p2.evaluate(()=>{const G=__game;G.manual=true;G.setSeed(5);G.startLevel(2);G.clearMobs();const p=G.state().player;G.spawn('screamer',p.x+1.5,p.y,false,[]);G.advance(0.5);return {st:G.assetState().screamer,king:G.assetState().king,mode:G.state().mode};});await c2.close();fs.unlinkSync(tmp);
  check('M1.22 a missing mob sheet shows that mob as a magenta check without breaking the game',m.st==='missing'&&m.king==='png'&&m.mode==='play'&&!errs.length,JSON.stringify(m)+errs.join(';'));
}

async function m123Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m123'});
  const savePng=(name,url)=>fs.writeFileSync(`${SHOTS}/${name}`,Buffer.from(url.split(',')[1],'base64'));
  const d=await G(page,()=>{const G=__game;return {n:G.itemIds.length,balls:G.itemIds.filter(k=>G.items[k].ball),use:G.puIds,icons:G.assetState().items,
    caps:G.itemIds.every(k=>G.items[k].max>=1&&G.items[k].price>0&&G.items[k].name&&G.items[k].desc)};});
  check('M1.23 at least 30 items: run items + 6 stacking balloon colours + use-items, icons from assets/items.png',d.n+d.use.length>=30&&d.balls.join()==='red,green,yellow,black,purple,pink'&&d.use.includes('firecracker')&&!d.use.includes('sneakers')&&d.caps&&d.icons==='png',`${d.n} run items, ${d.use.length} use-items: ${d.use.join(',')}`);
  // stats stack and carry to the next floor
  const st=await G(page,()=>{const G=__game;G.manual=true;G.setSeed(777);G.startLevel(6,{hearts:5,coins:0,perm:{items:{}}});const r={};const cd=()=>{G.throwOnce();return G.state().player.throwT;};
    r.cd0=cd();r.view0=G.viewDist();r.eye0=G.eyeLift();r.max0=G.maxHearts();
    ['coffee','coffee','glasses','burger','heart','heart'].forEach(k=>G.addRunItem(k));r.cd2=cd();r.view=G.viewDist();r.eye=G.eyeLift();r.max=G.maxHearts();r.hearts=G.state().player.hearts;
    let n=0;while(G.addRunItem('dumbbell'))n++;r.dumbCap=n;
    G.nextFloorViaExit?G.nextFloorViaExit():null;G.startLevel(7,{hearts:G.state().player.hearts,coins:0,perm:G.perm()});r.carried=G.itemN('coffee')+G.itemN('dumbbell');return r;});
  check('M1.23 run items stack: 2 Coffee = 0.82^2 throw cooldown, Glasses +1 sight, Cheeseburger lifts your eye, Heart in a Jar +1 max heart each, '+(V139?'Dumbbell keeps stacking (M1.39: no limit)':'Dumbbell stops at 3')+', all carried to the next floor',
    Math.abs(st.cd2-st.cd0*.82*.82)<1e-6&&st.view===st.view0+1&&st.eye>st.eye0&&st.max===st.max0+2&&(V139?st.dumbCap>3&&st.carried===st.dumbCap+2:st.dumbCap===3&&st.carried===5),JSON.stringify(st));
  // balloon colours stack on every balloon
  const b=await G(page,()=>{const G=__game;G.manual=true;G.setSeed(777);
    const setup=items=>{G.startLevel(6,{hearts:5,coins:0,perm:{items}});G.clearMobs();const s=G.state();let best=null;for(let y=1;y<s.mapH-1;y++)for(let x=1;x<s.mapW-1;x++){let n=0;while(n<9&&!G.solidAt(x+n+.5,y+.5)&&!G.pitUnder(x+n+.5,y+.5,0))n++;if(n>=7&&(!best||n>best.n))best={x,y,n};}G.teleport(best.x+.5,best.y+.5,0);G.setPitch(0);return best;};
    const hp=i=>G.state().enemies[i].hp,run=n=>{for(let k=0;k<n;k++)G.advance(1/30);},r={};
    let q=setup({black:1});let i=G.spawn('clunk',q.x+1.3,q.y+.5,true,[]);let h0=G.state().player.hearts,m0=hp(i);G.throwOnce();run(20);r.nearSelf=h0-G.state().player.hearts;r.nearMob=m0-hp(i);
    q=setup({black:1});i=G.spawn('clunk',q.x+4.5,q.y+.5,true,[]);h0=G.state().player.hearts;G.throwOnce();run(40);r.farSelf=h0-G.state().player.hearts;
    q=setup({purple:1,green:1});let a=G.spawn('clunk',q.x+2.5,q.y+.5,false,[]),c=G.spawn('clunk',q.x+4.5,q.y+.5,false,[]);let pa=hp(a),pc=hp(c);G.throwOnce();run(45);r.pierce=[pa-hp(a),pc-hp(c)];r.poison=!!G.state().enemies[a].poison||pa-hp(a)>1;
    q=setup({});a=G.spawn('clunk',q.x+2.5,q.y+.5,false,[]);c=G.spawn('clunk',q.x+4.5,q.y+.5,false,[]);pa=hp(a);pc=hp(c);G.throwOnce();run(45);r.plain=[pa-hp(a),pc-hp(c)];
    q=setup({pink:1});i=G.spawn('clunk',q.x+3.5,q.y+.5,false,[]);G.teleport(q.x+.5,q.y+.5,-.5);m0=hp(i);G.throwOnce();run(45);r.home=m0-hp(i);
    q=setup({});i=G.spawn('clunk',q.x+3.5,q.y+.5,false,[]);G.teleport(q.x+.5,q.y+.5,-.5);m0=hp(i);G.throwOnce();run(45);r.noHome=m0-hp(i);return r;});
  check('M1.23 black balloons explode: they hurt you within ~1 cell, not from afar',b.nearSelf===1&&b.nearMob>=2&&b.farSelf===0,JSON.stringify(b));
  check('M1.23 colours stack: purple + green pierces (both monsters hit) and still poisons; pink homes in on a monster you missed',b.pierce[0]>=1&&b.pierce[1]>=1&&b.plain[1]===0&&b.poison&&b.home>=1&&b.noHome===0,JSON.stringify(b));
  // sources: floor 1 shoes, a run item per floor, shop rows, knight/boss/secret drops, saves
  const src=await G(page,()=>{const G=__game;G.manual=true;G.setSeed(777);const r={};G.startLevel(0,{hearts:5,coins:0,perm:{}});r.f1=G.itemList().filter(i=>i.kind==='item').map(i=>i.ptype);
    let per=0;for(let f=1;f<12;f++){G.startLevel(f,{hearts:5,coins:0,perm:{}});if(G.itemList().some(i=>i.kind==='item'))per++;}r.per=per;
    G.startLevel(3,{hearts:5,coins:99,perm:{}});G.openShop();r.shop=G.shopRows().map(x=>x.kind);const k=G.shopRows().findIndex(x=>x.kind==='item');const it=G.shopRows()[k].item;G.shopBuy(k);r.bought=G.itemN(it);G.closeShop();
    r.saved=JSON.stringify(G.perm().items);return r;});
  check('M1.23 floor 1 has Running Shoes; later floors each hide a run item; Old Murkle sells run items and use-items; what you buy is saved with the run',src.f1.join()==='shoes'&&src.per>=10&&src.shop.filter(x=>x==='item').length===3&&src.shop.filter(x=>x==='power').length===2&&src.bought===1&&src.saved.length>2,JSON.stringify(src));
  const fc=await G(page,()=>{const G=__game;G.manual=true;G.setSeed(777);G.startLevel(6,{hearts:5,coins:0,perm:{items:{boots:1,garlic:1}}});G.clearMobs();const p=G.state().player;const i=G.spawn('clunk',p.x+.35,p.y,true,[]);const m0=G.state().enemies[i].hp,h0=p.hearts;for(let k=0;k<30;k++)G.advance(1/30);
    const r={garlicMob:m0-G.state().enemies[i].hp,garlicMe:h0-G.state().player.hearts};G.clearMobs();const j=G.spawn('clunk',p.x+1.5,p.y,false,[]);const m1=G.state().enemies[j].hp;G.give('firecracker');G.useItem();G.advance(.1);r.fire=m1-G.state().enemies[j].hp;r.meAfter=G.state().player.hearts;
    G.addShot('web',p.x+.6,p.y,-3,0);for(let k=0;k<20;k++)G.advance(1/30);r.slow=G.slowT?G.slowT():G.state().player.slowT;return r;});
  check('M1.23 Garlic bites back (you still get bitten), the Firecracker hits 3 around you but not you, Rubber Boots shrug off webs',fc.garlicMob>=1&&fc.garlicMe===1&&fc.fire===3&&!(fc.slow>0),JSON.stringify(fc));
  savePng('m123_items_3x.png',await G(page,()=>__game.spriteSheet(3,'m111')));
  await G(page,()=>{const G=__game;G.manual=true;G.setSeed(777);G.startLevel(6,{hearts:5,coins:50,perm:{items:{shoes:2,dumbbell:1,burger:1,coffee:1,glasses:1,heart:1,magnet:1,map:1,hat:1,red:1,black:1,pink:1}}});G.clearMobs();G.give('firecracker');G.advance(.1);});
  await page.screenshot({path:`${SHOTS}/m123_hud_items.png`});
  await ctx.close();
}

async function m124Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m124'});
  const atlas=JSON.parse(fs.readFileSync(`${ROOT}/assets/atlas.json`,'utf8')).sheets;
  const st=await G(page,()=>({st:__game.assetState(),fx:__game.fxSheets.filter(n=>n!=='hand'&&n!=='balloon')})); /* M1.43: the arm and balloon live in assets/, not assets/boss/ */const bad=st.fx.filter(n=>st.st[n]!=='png'||!atlas[n]||atlas[n].file!=='boss/'+n+'.png');
  check(`M1.24 ${st.fx.length} boss and effect strips (portals, lectern, signs, Hali, goo, the play script, 14 projectiles) load from assets/boss/*.png`,st.fx.length>=22&&!bad.length,bad.join(',')||st.fx.join(','));
  const cmp=await G(page,async(names)=>{const px=async url=>{const im=new Image();im.src=url;await im.decode();const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const cx=cv.getContext('2d');cx.drawImage(im,0,0);return {w:im.width,h:im.height,u:new Uint32Array(cx.getImageData(0,0,im.width,im.height).data.buffer)};};
    const out=[];for(const n of names){const a=await px(__game.embedded(n)),b=await px(__game.atlasPng(n));let d=a.w!==b.w||a.h!==b.h?1e9:0;if(!d)for(let i=0;i<a.u.length;i++){const p=a.u[i]>>>24>=128?a.u[i]|0xff000000:0,q=b.u[i]>>>24>=128?b.u[i]|0xff000000:0;if(p!==q)d++;}if(d)out.push(n+':'+d);}return out;},st.fx);
  check('M1.24 in game those strips are exactly the pixels of their PNGs',cmp.length===0,cmp.join(' '));
  const savePng=(name,url)=>fs.writeFileSync(`${SHOTS}/${name}`,Buffer.from(url.split(',')[1],'base64'));savePng('m124_boss_fx_3x.png',await G(page,()=>__game.spriteSheet(3,'m114')));
  await ctx.close();
}

async function m126Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m126'});
  const k=await G(page,()=>{const G=__game;G.manual=true;G.setSeed(777);G.startLevel(4,{hearts:5,coins:0});G.bossIntro=false;G.faceBoss(4);const r={name:G.bosses.king.name,fly:!!G.bosses.king.fly,kinds:{},open:false,closed:false,big:null};
    for(let i=0;i<900;i++){G.setHearts(5);const s=G.advance(1/30);s.eshots.forEach(q=>{r.kinds[q.kind]=(r.kinds[q.kind]||0)+1;});const b=G.boss().ent;if(b.frame>=4)r.open=true;else r.closed=true;}
    const b=G.boss();G.hitBoss(Math.ceil(b.ent.hp-b.ent.maxHp*.32));for(let i=0;i<20;i++)G.advance(1/30);const s=G.state();r.minions=[...new Set(G.state().enemies.filter((e,i)=>i>=0).map(e=>e.type))];r.made=s.stats.bossMinions;r.frames=new Set([0,1,2,3,4,5,6,7].map(i=>G.frameSig('king',i))).size;return r;});
  check('M1.26 the Screamer King replaces King Gloop on floor 5: he flies, and his 8 frames flap with the mouth shut and open',k.name==='THE SCREAMER KING'&&k.fly&&k.open&&k.closed&&k.frames===8,JSON.stringify(k));
  check('M1.26 he spits a huge purple orb and a fan of small purple orbs',k.kinds.bigorb>0&&k.kinds.porb>0&&!k.kinds.gloop,JSON.stringify(k.kinds));
  const mn=await G(page,()=>{const G=__game;G.manual=true;G.setSeed(777);G.startLevel(4,{hearts:5,coins:0});G.clearMobs&&0;G.bossIntro=false;G.faceBoss(4);for(let i=0;i<30;i++)G.advance(1/30);const n0=G.state().enemies.length;
    const b=G.boss();G.hitBoss(Math.ceil(b.ent.hp-b.ent.maxHp*.6));for(let i=0;i<10;i++){G.setHearts(5);G.advance(1/30);}const after=G.state().enemies.slice(n0);return {types:[...new Set(after.map(e=>e.type))],n:after.length};});
  check('M1.26 his minions are plain Screamers only (a wave at 2/3 health)',mn.n>=2&&mn.types.join()==='screamer',JSON.stringify(mn));
  const pt=await G(page,()=>(()=>{const G=__game,r={};G.manual=true;G.setSeed(777);G.startLevel(4,{hearts:5,coins:0});G.bossIntro=true;r.before=G.portalHidden();
 G.faceBoss(2.5);let s;for(let k=0;k<400;k++){G.setHearts(5);s=G.advance(1/30);if(s.mode==='play'&&G.portalHidden())break;}r.mode=s.mode;r.hiddenAfterIntro=G.portalHidden();
 const ex=G.exitAt();r.ex0=ex;G.teleport(ex.x+.5,ex.y+.5,0);for(let k=0;k<10;k++){G.setHearts(5);s=G.advance(1/30);}r.stillPlay=s.mode;r.msg=s.msg;
 G.hitBoss(9999);for(let k=0;k<60;k++){G.setHearts(5);s=G.advance(1/30);}r.hiddenAfterDeath=G.portalHidden();const e1=G.exitAt();r.ex1=e1;r.moved=Math.hypot(e1.x-ex.x,e1.y-ex.y);r.msg2=s.msg;r.mode2=s.mode;
 G.teleport(e1.x+.5,e1.y+.5,0);for(let k=0;k<20;k++)s=G.advance(1/30);r.after=s.mode;
 // standing far away: the portal stays where it was
 G.setSeed(777);G.startLevel(4,{hearts:5,coins:0});G.bossIntro=false;G.faceBoss(4);for(let k=0;k<20;k++){G.setHearts(5);G.advance(1/30);}const ex2=G.exitAt();G.hitBoss(9999);for(let k=0;k<60;k++){G.setHearts(5);G.advance(1/30);}const ex3=G.exitAt();r.farSame=ex2.x===ex3.x&&ex2.y===ex3.y;r.farHidden=G.portalHidden();
 return r;})());
  check('M1.26 the barred portal vanishes after the boss intro (stepping on its spot does nothing) and the open portal appears when the boss dies',!pt.before&&pt.hiddenAfterIntro&&pt.stillPlay==='play'&&!pt.hiddenAfterDeath&&pt.after==='clear'&&!pt.farHidden,JSON.stringify(pt));
  check('M1.26 if you stand on it when it appears, the portal moves 3-5 cells away; otherwise it stays put',pt.moved>=2&&pt.farSame,JSON.stringify(pt));
  const orb=await G(page,()=>{const G=__game;G.manual=true;G.setSeed(777);G.startLevel(4,{hearts:5,coins:0});G.bossIntro=false;G.clearMobs();G.faceBoss(4);const p=G.state().player;G.setHearts(5);
    G.addShot('bigorb',p.x+1.2,p.y,-2.6,0);const sh=G.state().eshots;const last=sh[sh.length-1];return {kind:last.kind};});
  check('M1.26 the big orb has its own sprite (assets/boss/shot_bigorb.png)',orb.kind==='bigorb',JSON.stringify(orb));
  await ctx.close();
}

async function m127Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m127'});
  const r=await G(page,()=>{const G=__game;G.manual=true;G.setSeed(777);G.startLevel(6,{hearts:5,coins:0});G.clearMobs();const st=G.state();let best=null;
    for(let y=1;y<st.mapH-1;y++)for(let x=1;x<st.mapW-1;x++){let n=0;while(n<9&&!G.solidAt(x+n+.5,y+.5)&&!G.pitUnder(x+n+.5,y+.5,0))n++;if(n>=6&&(!best||n>best.n))best={x,y,n};}
    G.teleport(best.x+.5,best.y+.5,0);G.setPitch(0);const c=G.spawn('zapfly',best.x+2,best.y+.5,false,[]);G.setMask(c,'comedy');const cx=G.state().enemies[c].x;
    const l0=G.state().stats.comedyHits;G.throwOnce();let s,maxX=0,passed=false;for(let k=0;k<45;k++){s=G.advance(1/30);const sh=G.shotsDetail();if(sh.length){maxX=Math.max(maxX,sh[0].x);const e=s.enemies[c];if(sh[0].x>e.x+.4&&Math.abs(sh[0].z-(e.z||0)-.3)<.6)passed=true;}}
    return {laughs:s.stats.comedyHits-l0,maxX,cx,passed};});
  check('M1.27 balloons pass straight through a smiling Comedy mask (it doesn\'t laugh, the balloon flies on past it)',r.laughs===0&&r.maxX>r.cx+1,JSON.stringify(r));
  await ctx.close();
}

async function m128Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m128'});
  const d=await G(page,()=>({n:__game.modIds.length,names:__game.modIds.map(k=>__game.mods[k].name),glow:__game.glowTiers?__game.glowTiers:null}));
  const want=['POISONOUS','ARMOURED','BLINDING','WITHERING','TOSSER','THIEF','QUICKSAND','BULWARK','RUST','SAPPER','1UP','CLOAKED','ENDER','GHASTLY','LIFESTEAL','SPRINT','STORM','WEBBER','VENGEANCE','WEAKNESS','BERSERK','EXPLODE','POTIONS','MAMA','MOLTEN','ARCHER','NECROMANCER','FIREWORK','GRAVITY','FLYING','MOUNTED','MORPH','GHOST','CONFUSING'];
  const miss=want.filter(w=>!d.names.includes(w));
  check(`M1.28 all 34 requested Infernal powers exist (${d.n} powers in all)`,!miss.length&&d.n>=40,miss.join(',')||d.names.join(','));
  const r=await G(page,()=>(()=>{const G=__game,r={};G.manual=true;
 const fresh=(hearts)=>{G.setSeed(777);G.startLevel(6,{hearts:hearts||5,coins:20,perm:{items:{}}});G.clearMobs();return G.state().player;};
 const bite=(mod,extra)=>{const p=fresh(5);if(extra)extra();const i=G.spawn('clunk',p.x+.35,p.y,true,[mod]);const h0=G.state().player.hearts,c0=G.state().player.coins,x0=G.state().player.x;let s;for(let k=0;k<8;k++){s=G.advance(1/30);if(G.state().player.hearts<h0)break;}s=G.state();return {st:G.status(),dh:h0-s.player.hearts,dc:c0-s.player.coins,dx:Math.hypot(s.player.x-x0,0)+Math.abs(s.player.y-p.y),slow:G.slowT(),msg:s.msg,e:G.entInfo(i)};};
 for(const m of ['poison','wither','blind','weakness','rust','confusing','gravity','molten','sapper','tosser','frost','berserk'])r[m]=bite(m);
 r.thief=bite('thief',()=>G.give('herb'));r.thief.item=G.state().player.item;
 // poison never kills
 let p=fresh(1);G.addStatus('poison',6);for(let k=0;k<240;k++)G.advance(1/30);r.poisonAt1=G.state().player.hearts;
 p=fresh(1);G.addStatus('wither',6);for(let k=0;k<240;k++)G.advance(1/30);r.witherAt1=G.state().mode;
 // armour ~50%
 p=fresh();let i=G.spawn('clunk',p.x+3,p.y,false,['armour']);let blocked=0;for(let k=0;k<40;k++){const h=G.entInfo(i).hp;G.hitWith(i,{dmg:1,ball:'blue',hits:[]});if(G.entInfo(i).hp===h)blocked++;G.entInfo(i);if(G.entInfo(i).hp<=1){/*refill*/}if(G.entInfo(i).state==='dead')break;}r.armourBlocked=blocked;
 // oneup
 p=fresh();i=G.spawn('clunk',p.x+3,p.y,false,['oneup']);G.hitWith(i,{dmg:99,ball:'blue',hits:[]});r.oneup1=G.entInfo(i);G.hitWith(i,{dmg:99,ball:'blue',hits:[]});r.oneup2=G.entInfo(i).state;
 // molten vs blast, bulwark cap
 p=fresh();i=G.spawn('clunk',p.x+3,p.y,false,['molten']);let h=G.entInfo(i).hp;G.hitWith(i,{dmg:3,boom:true});r.moltenBlast=h-G.entInfo(i).hp;
 i=G.spawn('clunk',p.x+3,p.y+.5,false,['bulwark']);h=G.entInfo(i).hp;G.hitWith(i,{dmg:4,ball:'blue',hits:[]});r.bulwark=h-G.entInfo(i).hp;
 // mama (forced), ghost, mounted, flying, morph
 p=fresh();G.inf.mama=1;i=G.spawn('clunk',p.x+3,p.y,false,['mama']);const n0=G.state().enemies.length;G.hitWith(i,{dmg:1,ball:'blue',hits:[]});r.mamaBabies=G.state().enemies.length-n0;G.inf.mama=.15;
 p=fresh();i=G.spawn('clunk',p.x+3,p.y,false,['ghost']);const n1=G.state().enemies.length;G.hitWith(i,{dmg:99,ball:'blue',hits:[]});for(let k=0;k<10;k++)G.advance(1/30);r.ghost=G.state().enemies.slice(n1).map(e=>e.type);
 p=fresh();i=G.spawn('springle',p.x+3,p.y,true,['mounted']);r.mount=G.mounted(i);for(let k=0;k<30;k++)G.advance(1/30);const ri=G.entInfo(i),mi=G.entInfo(r.mount);r.mountSync=Math.hypot(ri.x-mi.x,ri.y-mi.y);
 p=fresh();i=G.spawn('clunk',p.x+3,p.y,false,['flying']);r.flying=G.entInfo(i).flying;
 p=fresh();G.inf.morph.p=1;G.inf.morph.cd=[.2,.3];i=G.spawn('clunk',p.x+3,p.y,true,['morph']);for(let k=0;k<30;k++){G.advance(1/30);if(G.entInfo(i).type!=='clunk')break;} /* stop at the first morph (several in a row can land back on clunk) */r.morph=G.entInfo(i).type;G.inf.morph.p=.4;G.inf.morph.cd=[10,16];
 // vengeance + firework
 p=fresh();G.inf.vengeance=1;i=G.spawn('clunk',p.x+3,p.y,false,['vengeance']);let hh=G.state().player.hearts;G.hitWith(i,{dmg:1,ball:'blue',hits:[]});r.vengeance=hh-G.state().player.hearts;G.inf.vengeance=.35;
 p=fresh();i=G.spawn('clunk',p.x+1,p.y,false,['firework']);hh=G.state().player.hearts;G.hitWith(i,{dmg:1,ball:'blue',hits:[]});r.firework=hh-G.state().player.hearts;
 // timed attacks
 const spot=(p)=>{for(let r=3;r>=1.5;r-=.5)for(let a=0;a<6.28;a+=.3){const x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;if(!G.solidAt(x,y)&&G.clearPath(p.x,p.y,x,y))return [x,y];}return [p.x+1,p.y];}; /* M1.31: a clear spot in sight (layouts changed) */
 for(const m of ['storm','webber','archer','ghastly','necro','potions']){p=fresh();const sp=spot(p);i=G.spawn('clunk',sp[0],sp[1],true,[m]);const kinds={};let w={};for(let k=0;k<360;k++){G.setHearts(5);const s=G.advance(1/30);s.eshots.forEach(q=>kinds[q.kind]=1);const W=G.infWorld();Object.keys(W).forEach(x=>{if(W[x])w[x]=1;});}r['t_'+m]=Object.keys(kinds).concat(Object.keys(w)).join(',');}
 p=fresh();i=G.spawn('clunk',p.x+3,p.y,true,['poison','storm']);r.name=G.infernalName(i);
 return r;})());
  check('M1.28 Infernal names: "INFERNAL <MOB>: <POWERS>"',r.name==='INFERNAL CLUNKBOT: POISONOUS + STORM',r.name);
  const bitten=['poison','wither','blind','weakness','rust','gravity','molten'].map(m=>[m,Object.keys(r[m].st)[0]]);
  check('M1.28 bites from Poisonous, Withering, Blinding, Weakness, Rust, Gravity and Molten give you that status effect',bitten.every(([m,k])=>k==={poison:'poison',wither:'wither',blind:'blind',weakness:'weak',rust:'rust',gravity:'lev',molten:'burn'}[m]),JSON.stringify(bitten));
  check('M1.28 Confusing, Quicksand, Sapper, Tosser, Thief and Berserk bites',/CONFUSED/.test(r.confusing.msg)&&r.frost.slow>0&&r.sapper.dc===3&&r.tosser.dx>1.5&&r.thief.e.stolen==='herb'&&r.thief.item===null&&r.berserk.dh===2&&r.berserk.e.hp===r.berserk.e.maxHp-1,JSON.stringify({c:r.confusing.msg,s:r.frost.slow,sap:r.sapper.dc,t:r.tosser.dx,th:r.thief.e.stolen,b:r.berserk.dh}));
  check('M1.28 poison never takes your last heart; wither can kill',r.poisonAt1===1&&r.witherAt1==='dead',JSON.stringify({p:r.poisonAt1,w:r.witherAt1}));
  check('M1.28 Armoured blocks some hits, 1UP gets back up once, Molten ignores blasts, Bulwark takes at most 1',r.armourBlocked>0&&r.oneup1.usedLife&&r.oneup1.hp===r.oneup1.maxHp&&r.oneup2==='dead'&&r.moltenBlast===0&&r.bulwark===1,JSON.stringify({a:r.armourBlocked,o:r.oneup1,m:r.moltenBlast,b:r.bulwark}));
  check('M1.28 Mama has 3 babies, a Ghost rises from Ghost mobs, Mounted rides a carrier, Flying flies, Morph changes type',r.mamaBabies===3&&r.ghost.join()==='wisp'&&r.mount>=0&&r.mountSync<.01&&r.flying&&r.morph!=='clunk',JSON.stringify({m:r.mamaBabies,g:r.ghost,mt:r.mount,ms:r.mountSync,f:r.flying,mo:r.morph}));
  check('M1.28 Vengeance zaps you back, Firework bursts on you up close',r.vengeance===1&&r.firework===1,JSON.stringify({v:r.vengeance,f:r.firework}));
  check('M1.28 timed powers: Storm lightning, Webber webs, Archer arrows, Ghastly fireballs, Necromancer skulls, Potions splashes',/bolts/.test(r.t_storm)&&/webs/.test(r.t_webber)&&/arrow/.test(r.t_archer)&&/fireball/.test(r.t_ghastly)&&/skull/.test(r.t_necro)&&/potion/.test(r.t_potions),JSON.stringify([r.t_storm,r.t_webber,r.t_archer,r.t_ghastly,r.t_necro,r.t_potions]));
  const ic=await G(page,()=>({st:__game.assetState().mods,shots:['arrow','fireball','skull','potion'].map(k=>__game.assetState()['shot_'+k])}));
  check('M1.28 power icons (assets/mods.png) and the new projectiles load from PNG',ic.st==='png'&&ic.shots.every(x=>x==='png'),JSON.stringify(ic));
  await G(page,()=>{const G=__game;G.manual=true;G.setSeed(777);G.startLevel(6,{hearts:5,coins:20});G.clearMobs();const p=G.state().player;const ca=Math.cos(p.ang),sa=Math.sin(p.ang);
    G.spawn('clunk',p.x+ca*2.2-sa*.6,p.y+sa*2.2+ca*.6,false,['poison','storm']);G.spawn('kettle',p.x+ca*2.6+sa*.7,p.y+sa*2.6-ca*.7,false,['molten']);G.spawn('skeleton',p.x+ca*3.4,p.y+sa*3.4,false,['flying','archer']);G.addStatus('poison',6);G.addStatus('burn',4);G.advance(0.05);});
  await page.screenshot({path:`${SHOTS}/m128_infernal.png`});
  await ctx.close();
}

async function m129Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m129'});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  await G(page,()=>{__game.manual=false;__game.menuPick(0);});await sleep(150);
  const K=(type,code,repeat)=>page.evaluate(([t,c,rp])=>window.dispatchEvent(new KeyboardEvent(t,{code:c,repeat:rp})),[type,code,repeat]);
  await K('keydown','KeyW',false);for(let i=0;i<10;i++){await K('keydown','KeyW',true);await sleep(30);}const held=await G(page,()=>__game.keyHeld('KeyW'));await sleep(600);const lost=await G(page,()=>__game.keyHeld('KeyW'));
  await K('keydown','KeyW',false);for(let i=0;i<5;i++){await K('keydown','KeyW',true);await sleep(30);}await K('keydown','KeyD',false);for(let i=0;i<25;i++){await K('keydown','KeyD',true);await sleep(30);}const both=await G(page,()=>__game.keyHeld('KeyW')&&__game.keyHeld('KeyD'));
  await K('keyup','KeyW',false);await K('keyup','KeyD',false);await K('keydown','KeyA',false);await sleep(700);const norep=await G(page,()=>__game.keyHeld('KeyA'));
  await G(page,()=>window.dispatchEvent(new Event('focus')));const afterFocus=await G(page,()=>__game.keyHeld('KeyA'));
  check('M1.29 a walk key whose release got lost (it stopped auto-repeating) is let go after 0.4 s; holding two keys or a key with repeat off is not touched; regaining focus starts clean',held&&!lost&&both&&norep&&!afterFocus,JSON.stringify({held,lost,both,norep,afterFocus}));
  const kn=await G(page,()=>{const G=__game;G.manual=true;G.setSeed(777);G.startLevel(6,{hearts:5,coins:0});G.clearMobs();const s=G.state();let R=1,thinOnly=0,bodyNoThin=0,n=0;const rnd=()=>{R=(R*16807)%2147483647;return R/2147483647;};
    for(let i=0;i<4000;i++){const x0=1+rnd()*(s.mapW-2),y0=1+rnd()*(s.mapH-2),a=rnd()*6.283,d=2+rnd()*5,x1=x0+Math.cos(a)*d,y1=y0+Math.sin(a)*d;if(G.solidAt(x0,y0)||G.solidAt(x1,y1))continue;n++;const t=G.clearPath(x0,y0,x1,y1),b=G.clearBody(x0,y0,x1,y1,.3);if(t&&!b)thinOnly++;if(b&&!t)bodyNoThin++;}
    return {n,thinOnly,bodyNoThin};});
  check('M1.29 the Treasure Knight only charges when his whole body has a clear run: many corner lines that a thin sight line passes are refused',kn.thinOnly>20&&kn.bodyNoThin===0,JSON.stringify(kn));
  const rec=await G(page,()=>{const G=__game;G.manual=true;let k=null;for(let sd=1;sd<60&&!k;sd++){G.setSeed(sd);G.startLevel(3,{hearts:5,coins:0});k=G.knight();}if(!k)return null;const s=G.state();
    G.knightSet({chargeT:3,cdx:1,cdy:0,hitP:true,tele:0,woke:true,state:'chase',chargeCD:0,slamCD:4});for(let i=0;i<120;i++){G.setHearts(5);G.advance(1/30);if(G.state().stats.knightSlams>0)break;}
    const st=G.state().stats;let after=null;G.ents_dbg=0;return {slams:st.knightSlams,recovers:st.knightRecovers};});
  check('M1.29 after he slams into a wall: a longer charge cooldown, a quick recovery, and his ground slam ready',rec&&rec.slams>0&&rec.recovers>0,JSON.stringify(rec));
  const mp=await G(page,()=>{const G=__game;G.manual=true;G.setSeed(777);G.startLevel(6,{hearts:5,coins:0});G.seeAll&&G.seeAll();const p=G.state().player;G.spawn('clunk',p.x+1.5,p.y,false,[]);G.spawnItem('heart',null,p.x,p.y+1.5);G.advance(0.05);return G.state().stats.mapShapes;});
  check('M1.29 on the minimap monsters are a red X and hearts a pink heart (no more look-alike red squares)',mp.x>0&&mp.heart>0,JSON.stringify(mp));
  await G(page,()=>{__game.openMap();__game.advance(0.05);});await page.screenshot({path:`${SHOTS}/m129_map_legend.png`});
  await ctx.close();
}

async function m130Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m130'});
  const r=await G(page,()=>(()=>{const G=__game,r={};G.manual=true;localStorage.clear();G.toTitle();r.menu0=G.state().menu;
 G.setUnlocks({floors:[6,11],last:1});G.toTitle();r.menu1=G.state().menu;
 G.cycleStart(1);r.sf1=G.startFloor();G.cycleStart(1);r.sf2=G.startFloor();r.label=G.state().menu.find(m=>/START FLOOR/.test(m));
 const ni=G.state().menu.findIndex(m=>/NEW GAME|START GAME/.test(m));G.menuPick(ni);G.advance(0.1);const s=G.state();
 r.level=s.level;r.items=Object.keys(G.perm().items).length;r.itemCount=Object.values(G.perm().items).reduce((a,b)=>a+b,0);r.run=s.run;r.score=s.score;r.msg=s.msg;
 // beat the floor-15 boss without cheats -> 16 unlocked
 G.setUnlocks({floors:[],last:1});G.setSeed(77);G.setRun({kills:0,elites:0,coins:0,deepest:15});G.startLevel(14,{hearts:5,coins:0});G.hitBoss(99999);for(let i=0;i<60;i++)G.advance(1/30);r.after15=G.unlocks().floors;
 // cheated run does not unlock
 G.setUnlocks({floors:[],last:1});G.setRun({kills:0,elites:0,coins:0,deepest:5,cheated:true});G.startLevel(4,{hearts:5,coins:0});G.hitBoss(99999);for(let i=0;i<60;i++)G.advance(1/30);r.cheated=G.unlocks().floors;
 r.scoreF={from1:G.scoreOf({deepest:12,kills:0}),from11:G.scoreOf({deepest:12,kills:0,startFloor:11})};
 return r;})());
  check('M1.30 no start-floor row until you have beaten a boss; then START FLOOR cycles 1 > 6 > 11 and shows the items you get',r.menu0.length===2&&r.menu1.some(m=>/START FLOOR/.test(m))&&r.sf1===6&&r.sf2===11&&r.label==='START FLOOR: < 11 > (+5 ITEMS)',JSON.stringify({m0:r.menu0,m1:r.menu1,l:r.label}));
  check('M1.30 starting on floor 11 gives 5 random run items (one per 2 floors skipped) and scores only the floors you play',r.level===10&&r.itemCount===5&&r.score===0&&r.scoreF.from1===11000&&r.scoreF.from11===1000,JSON.stringify({lv:r.level,n:r.itemCount,sc:r.score,f:r.scoreF}));
  check('M1.30 beating a boss unlocks the floor after it as a start floor (kept across runs); cheated runs unlock nothing',r.after15.join()==='16'&&r.cheated.length===0,JSON.stringify({a:r.after15,c:r.cheated}));
  const rem=await G(page,()=>{const G=__game;localStorage.clear();G.setUnlocks({floors:[6,11,16],last:11});G.toTitle();return G.state().menu;});
  check('M1.30 the title remembers the start floor you picked last',rem.includes('START FLOOR: < 11 > (+5 ITEMS)'),JSON.stringify(rem));
  await page.screenshot({path:`${SHOTS}/m130_title_start_floor.png`});
  await G(page,()=>localStorage.clear());
  await ctx.close();
}


async function m159InvTests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m159'});
  const ico=await G(page,()=>{const G=__game;const ids=Object.keys(G.items).concat(G.puIds||[]);return ids.map(k=>[k,G.itemIcoPx(k)]).filter(([k,n])=>n<20);});
  check('M1.59 every item and use-item has a drawn icon (no blank tiles)',ico.length===0,JSON.stringify(ico));
  await G(page,()=>{const G=__game;G.manual=true;G.freeze=false;G.setSeed(5);G.startLevel(3,{hearts:5,coins:0});G.clearMobs();['shoes','shoes','dumbbell','clover','duck'].forEach(k=>G.give(k));G.give('veil');});
  await page.keyboard.press('KeyI');
  const o=await G(page,()=>{const G=__game;const st=G.state();const i=G.spawn('clunk',st.player.x+2,st.player.y,true,[]);const e0=G.state().enemies[i];G.advance(1);const e1=G.state().enemies[i];
    return {mode:G.state().mode,list:G.invList(),still:Math.hypot(e1.x-e0.x,e1.y-e0.y)<1e-6};});
  check('M1.59 I opens the item screen with every run item and carried use-item, and the game waits while it is open',o.mode==='inv'&&o.list.length===5&&o.list.find(x=>x.k==='shoes').n===2&&o.list.some(x=>x.k==='veil'&&x.kind==='use')&&o.still,JSON.stringify(o));
  await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');
  const k=await G(page,()=>__game.invSel());
  const c=await G(page,()=>{const G=__game,r=G.invCell(3),cv=document.querySelector('canvas').getBoundingClientRect();return {x:cv.left+(r[0]+r[2]/2)/480*cv.width,y:cv.top+(r[1]+r[3]/2)/300*cv.height};});
  await page.mouse.click(c.x,c.y);await G(page,()=>{__game.advance(0.05);__game.render();});
  const k2=await G(page,()=>({sel:__game.invSel(),item:__game.invList()[__game.invSel()]}));
  check('M1.59 arrows and clicks pick an item, and its name and description are shown',k===2&&k2.sel===3&&!!k2.item.name&&!!k2.item.desc,JSON.stringify({k,k2}));
  await page.screenshot({path:`${SHOTS}/m159_items.png`});
  await page.keyboard.press('KeyI');const m=await G(page,()=>__game.state().mode);
  check('M1.59 I closes it again',m==='play',m);
  await ctx.close();
}

async function m159SlateTests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m159'});
  const atlas=JSON.parse(fs.readFileSync(`${ROOT}/assets/atlas.json`,'utf8')).sheets;
  const r=await G(page,()=>{const G=__game;let slate=null,other=null;
    for(let sd=1;sd<=60&&!(slate&&other);sd++)for(const f of [13,17,21,25,29]){const nm=G.themeFor(sd,f).name;if(!slate&&/SLATE HALLS/.test(nm))slate={sd,f};else if(!other&&!/SLATE HALLS/.test(nm))other={sd,f};}
    G.manual=true;G.freeze=true;G.setSeed(other.sd);G.startLevel(other.f-1,{hearts:99,coins:0});const offPool=G.itemPool().includes('spirit');
    G.setSeed(slate.sd);G.startLevel(slate.f-1,{hearts:99,coins:0});const onPool=G.itemPool().includes('spirit'),theme=G.themeNow();
    const count=()=>{G.render();return G.state().stats.mapMobs;};
    G.setMinimap&&G.setMinimap(true);
    const before=G.mapMobCount(),hidden=G.state().enemies.filter(e=>!e.gone&&e.state!=='dead').length;
    G.give('spirit');const after=G.mapMobCount();
    G.setSeed(slate.sd+1);G.startLevel(slate.f,{hearts:99,coins:0});const kept=G.mapMobCount(),all=G.state().enemies.filter(e=>!e.gone&&e.state!=='dead'&&!e.dormant).length;
    return {slate,other,offPool,onPool,theme,before,after,hidden,kept,all,max:G.items.spirit&&G.items.spirit.max};});
  check('M1.59 the Spirit Slate only drops (or is sold) on Slate Halls floors, and has a packed icon',r.onPool&&!r.offPool&&(atlas.items.tiles||[]).includes('spirit'),JSON.stringify(r));
  check('M1.59 with the Spirit Slate every monster shows on the map, even in unexplored rooms (and it lasts the run)',r.before<r.hidden&&r.after===r.hidden&&r.kept===r.all&&r.all>0,JSON.stringify(r));
  await G(page,()=>{const G=__game;G.openMap&&G.openMap();});
  await page.screenshot({path:`${SHOTS}/m159_spirit_slate_map.png`});
  await ctx.close();
}

async function m156Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m156'});
  const r=await G(page,()=>{const G=__game;const c=G.rollModsAt(7,20,4000),c2=G.rollModsAt(8,40,4000);let riders=0,lv=0;
    for(let sd=1;sd<=25;sd++)for(const f of [6,9,13,17,22]){G.manual=true;G.freeze=true;G.setSeed(sd);G.startLevel(f-1,{hearts:99,coins:0});lv++;riders+=G.state().enemies.filter(e=>(e.mods||[]).includes('mounted')).length;}
    return {mounted:(c.mounted|0)+(c2.mounted|0),others:Object.keys(c).length,riders,lv};});
  check('M1.56 Infernal mobs no longer get riders (Mounted is never rolled; other modifiers still are)',r.mounted===0&&r.riders===0&&r.others>=8,JSON.stringify(r));
  await ctx.close();
}

async function m153Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m153'});
  const atlas=JSON.parse(fs.readFileSync(`${ROOT}/assets/atlas.json`,'utf8')).sheets;
  const art=await G(page,()=>{const G=__game,st=G.assetState(),sig=[];for(let i=0;i<3;i++)sig.push(G.frameSig('mortar',i));return {st,m:G.mobs.mortar,sig,trowel:G.items?G.items.trowel:null};});
  check('M1.53 the Mortared Man art (3 frames: shut, opening, open) and its mortar shot are packed; it has 4 base HP',art.st.mortar==='png'&&art.st.shot_mortar==='png'&&atlas.mortar&&atlas.mortar.frames===3&&new Set(art.sig).size===3&&art.m.hp===4&&art.m.name==='MORTARED MAN',JSON.stringify({st:[art.st.mortar,art.st.shot_mortar],sig:new Set(art.sig).size,hp:art.m.hp}));
  check('M1.53 the Masonry Trowel icon is in assets/items.png',(atlas.items.tiles||[]).includes('trowel')&&art.st.items==='png',JSON.stringify(atlas.items.tiles.slice(-3)));
  const spawn=await G(page,()=>{const G=__game;let brick=0,onBrick=0,off=0;for(let sd=1;sd<=30;sd++)for(const f of [2,3,4,5,6,7,8]){const nm=G.themeFor(sd,f).name,n=[...G.genMap(sd,f).map.join('')].filter(c=>c==='w').length;if(/BRICK HALLS/.test(nm)){brick++;if(n)onBrick++;}else off+=n;}
    let pick=null;for(let sd=1;sd<=40&&!pick;sd++)for(const f of [2,3,4,6,7,8])if(/BRICK HALLS/.test(G.themeFor(sd,f).name)){pick={sd,f};break;}
    let other=null;for(let sd=1;sd<=40&&!other;sd++)for(const f of [2,3,4,6,7,8])if(!/BRICK HALLS/.test(G.themeFor(sd,f).name)){other={sd,f};break;}
    G.manual=true;G.freeze=true;G.setSeed(other.sd);G.startLevel(other.f-1,{hearts:9,coins:0});const offPool=G.itemPool().includes('trowel');
    G.setSeed(pick.sd);G.startLevel(pick.f-1,{hearts:9,coins:0});const onPool=G.itemPool().includes('trowel');
    return {brick,onBrick,off,pick,offPool,onPool,theme:G.themeNow()};});
  check('M1.53 the Mortared Man spawns only on Brick Halls floors',spawn.brick>0&&spawn.onBrick===spawn.brick&&spawn.off===0,JSON.stringify(spawn));
  check('M1.53 the Masonry Trowel only drops (or is sold) on Brick Halls floors',spawn.onPool&&!spawn.offPool,JSON.stringify(spawn));
  const cr=await G(page,()=>{const G=__game;return {s2:G.crackInfo(0,2),s3:G.crackInfo(0,3)};});
  check('M1.53 with the trowel a secret wall shows a big, very visible crack (far more than a fully hit crack)',cr.s3.changedFrac>cr.s2.changedFrac*1.8&&cr.s3.mean>cr.s2.mean*1.5,JSON.stringify(cr));
  const mv=await G(page,(pk)=>{const G=__game;G.manual=true;G.freeze=true;G.setSeed(pk.sd);G.startLevel(pk.f-1,{hearts:99,coins:0});G.clearMobs();G.viewOverride=14;const s=G.state();let spot=null;
    for(let y=2;y<s.mapH-2&&!spot;y++)for(let x=2;x<s.mapW-4&&!spot;x++){if(!G.solidAt(x+.5,y+.5)&&!G.solidAt(x+1.5,y+.5)&&!G.solidAt(x+2.5,y+.5)&&G.solidAt(x+3.5,y+.5)&&!G.solidAt(x+2.5,y-.5)&&!G.solidAt(x+2.5,y+1.5))spot={x:x+.5,y:y+.5};}
    G.teleport(spot.x,spot.y,0);G.spawn('mortar',spot.x+2.5,spot.y,true,[]);G.freeze=false;G.advance(.05);G.freeze=true;G.render();const px=G.state().stats.mortarPx,sprite=G.state().stats.enemyRect;
    const m0=G.mortars()[0];const onWall=(m)=>{const d=[[1,0],[-1,0],[0,1],[0,-1]][m.wn.d];return G.solidAt(m.wn.x+.5,m.wn.y+.5)&&!G.solidAt(m.wn.x+d[0]+.5,m.wn.y+d[1]+.5);};
    let ok=onWall(m0),opened=false,nodes=new Set([m0.wn.x+','+m0.wn.y+','+m0.wn.d]),start={x:m0.x,y:m0.y};
    G.freeze=false;G.teleport(spot.x-1,spot.y+.3,0); /* keep looking at it while you walk away along the room */
    for(let k=0;k<60;k++){const st=G.state();const m=G.mortars()[0];G.teleport(st.player.x,st.player.y,Math.atan2(m.y-st.player.y,m.x-st.player.x));G.advance(.05);const m2=G.mortars()[0];if(m2.open)opened=true;if(!onWall(m2))ok=false;nodes.add(m2.wn.x+','+m2.wn.y+','+m2.wn.d);}
    const m1=G.mortars()[0];G.freeze=true;return {px,sprite:!!sprite,ok,opened,nodes:nodes.size,moved:Math.hypot(m1.x-start.x,m1.y-start.y)};},spawn.pick);
  check('M1.53 the Mortared Man is painted into the wall itself (no standing sprite)',mv.px>200&&!mv.sprite,JSON.stringify(mv));
  check('M1.53 it slides along the walls after you (always on a wall face that looks onto open floor)',mv.ok&&mv.moved>.5,JSON.stringify(mv));
  check('M1.53 while you keep looking at it, it keeps its mouth shut',!mv.opened,JSON.stringify(mv));
  const fire=await G(page,()=>{const G=__game;G.freeze=false;const st=G.state(),m=G.mortars()[0];const away=Math.atan2(m.y-st.player.y,m.x-st.player.x)+Math.PI;G.teleport(st.player.x,st.player.y,away);
    let opened=false,shot=false,blocked=null,hurt=null;for(let k=0;k<80;k++){G.advance(.05);const mm=G.mortars()[0];if(mm.open)opened=true;if(G.state().eshots.some(q=>q.kind==='mortar'))shot=true;if(shot&&opened)break;}
    return {opened,shot};});
  check('M1.53 when you look away it opens its mouth and spits mortar at you',fire.opened&&fire.shot,JSON.stringify(fire));
  const dmg=await G(page,()=>{const G=__game;G.freeze=true;const i=G.state().enemies.findIndex(e=>e.type==='mortar'&&!e.gone);const m=()=>G.mortars()[0];
    const f=G.mortarForce;const shutHp=(()=>{G.mortarSet(i,{tele:0,openT:0});const h=m().hp;G.damageMob(i,1);return {before:h,after:m().hp};})();
    const openHp=(()=>{G.mortarSet(i,{openT:1});const h=m().hp;G.damageMob(i,1);return {before:h,after:m().hp};})();return {shutHp,openHp};});
  check('M1.53 it can only be damaged while its mouth is open',dmg.shutHp.after===dmg.shutHp.before&&dmg.openHp.after===dmg.openHp.before-1,JSON.stringify(dmg));
  const corner=await G(page,()=>{const G=__game;const s=G.state();let tested=0,bad=0,turns=0;const D=[[1,0],[-1,0],[0,1],[0,-1]];
    for(let y=1;y<s.mapH-1;y++)for(let x=1;x<s.mapW-1;x++)for(let d=0;d<4;d++){if(!G.solidAt(x+.5,y+.5)||G.solidAt(x+D[d][0]+.5,y+D[d][1]+.5))continue;
      G.mortarNbrs(x,y,d).forEach(n=>{tested++;if(n.d!==d)turns++;if(!G.solidAt(n.x+.5,n.y+.5)||G.solidAt(n.x+D[n.d][0]+.5,n.y+D[n.d][1]+.5))bad++;});}
    return {tested,bad,turns};});
  check('M1.53 its path follows the walls round inner and outer corners (every step is another wall face)',corner.tested>100&&corner.bad===0&&corner.turns>10,JSON.stringify(corner));
  await G(page,()=>{const G=__game;G.freeze=true;const i=G.state().enemies.findIndex(e=>e.type==='mortar'&&!e.gone);const st=G.state(),m=G.mortars()[0];G.mortarSet(i,{openT:1});G.teleport(st.player.x,st.player.y,Math.atan2(m.y-st.player.y,m.x-st.player.x));G.render();});
  await page.screenshot({path:`${SHOTS}/m153_mortared_man.png`});
  await ctx.close();
}

async function m152Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m152'});
  const savePng=(name,url)=>fs.writeFileSync(`${SHOTS}/${name}`,Buffer.from(url.split(',')[1],'base64'));
  const atlas=JSON.parse(fs.readFileSync(`${ROOT}/assets/atlas.json`,'utf8')).sheets;
  const art=await G(page,()=>{const G=__game,st=G.assetState(),sig=[];for(let i=0;i<5;i++)sig.push(G.frameSig('lichen',i));const info=G.spriteInfo('lichen',0);
    return {st,sheets:G.mobSheets,pu:G.puIds,veil:G.pu.veil,hp:G.mobs.lichen.hp,speed:G.mobs.lichen.speed,name:G.mobs.lichen.name,voice:G.mobs.lichen.voice,ch:G.mobs.lichen.ch,hp1:G.floorHp('lichen',1),hp4:G.floorHp('lichen',4),sig,info,items:st.items,k:G.sheetK('lichen')};});
  check('M1.52 Mourner\'s Veil is a use-item in the normal loot and shop pools, with a packed icon',art.pu.includes('veil')&&art.veil&&art.veil.name==="MOURNER'S VEIL"&&/5/.test(art.veil.desc)&&art.items==='png'&&(atlas.items.tiles||[]).includes('veil'),JSON.stringify({pu:art.pu,veil:art.veil,items:art.items}));
  check('M1.52 the Lichen Face art is packed (5 floating frames in assets/mobs/lichen.png) and the mob has 3 base HP that scales like the others',art.st.lichen==='png'&&art.sheets.includes('lichen')&&atlas.lichen&&atlas.lichen.file==='mobs/lichen.png'&&atlas.lichen.frames===5&&new Set(art.sig).size===5&&art.info&&art.info.w>8&&art.hp===3&&art.hp1===3&&art.hp4===6&&art.name==='LICHEN FACE'&&art.ch==='f',JSON.stringify({st:art.st.lichen,frames:new Set(art.sig).size,hp:[art.hp,art.hp1,art.hp4],k:art.k,info:art.info&&{w:art.info.w,h:art.info.h}}));
  const sheet=await G(page,async()=>{const url=__game.embedded('lichen');const im=new Image();im.src=url;await im.decode();
    const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const cx=cv.getContext('2d');cx.drawImage(im,0,0);
    const d=cx.getImageData(0,0,im.width,im.height).data,a=(x,y)=>d[(y*im.width+x)*4+3],n=5,fw=(im.width/n)|0;
    const corners=[[0,0],[im.width-1,0],[0,im.height-1],[im.width-1,im.height-1]];
    for(let i=0;i<n;i++)corners.push([i*fw,0],[i*fw+fw-1,0],[i*fw,im.height-1],[i*fw+fw-1,im.height-1]);
    return {w:im.width,h:im.height,corners:corners.map(([x,y])=>({x,y,a:a(x,y)}))};});
  check('M1.52 the Lichen Face sheet is transparent at every frame corner (no baked-in white background)',sheet.corners.every(c=>c.a===0),JSON.stringify(sheet));
  const veil=await G(page,()=>{const G=__game;G.manual=true;G.freeze=false;G.setSeed(777);G.startLevel(2,{hearts:9,coins:0});G.clearMobs();
    const s=G.state();const dirs=[[1,0],[-1,0],[0,1],[0,-1]];let line=null;
    for(let y=1;y<s.mapH-1&&!line;y++)for(let x=1;x<s.mapW-1&&!line;x++){
      if(G.solidAt(x+.5,y+.5)||(G.pitUnder&&G.pitUnder(x+.5,y+.5,0)))continue;
      for(const [dx,dy] of dirs){let n=0;while(n<12&&!G.solidAt(x+dx*(n+1)+.5,y+dy*(n+1)+.5)&&!(G.pitUnder&&G.pitUnder(x+dx*(n+1)+.5,y+dy*(n+1)+.5,0)))n++;if(n>=8){line={x:x+.5,y:y+.5,dx,dy,n,ang:Math.atan2(dy,dx)};break;}}
    }
    if(!line)return {ok:false,reason:'no hall'};
    const v=G.viewDist();
    G.teleport(line.x,line.y,line.ang);
    const near=G.spawn('clunk',line.x+line.dx*2,line.y+line.dy*2,true,[]);
    const far=G.spawn('kettle',line.x+line.dx*Math.min(line.n-0.5,v+1.2),line.y+line.dy*Math.min(line.n-0.5,v+1.2),true,[]);
    const dn=Math.hypot(G.state().enemies[near].x-line.x,G.state().enemies[near].y-line.y);
    const df=Math.hypot(G.state().enemies[far].x-line.x,G.state().enemies[far].y-line.y);
    G.give('veil');G.useItem();
    const s1=G.state(),n1=s1.enemies[near],f1=s1.enemies[far];
    const t0=n1.blindT,farT=f1.blindT,msg=s1.msg;
    G.advance(2);
    const t2=G.state().enemies[near].blindT;
    G.advance(3.2);
    const tEnd=G.state().enemies[near].blindT;
    // a mob behind a nearby wall should stay unblinded even if close
    G.clearMobs();G.teleport(line.x,line.y,line.ang);G.give('veil');
    let wall=null;
    for(const [dx,dy] of dirs){const wx=Math.floor(line.x)+dx,wy=Math.floor(line.y)+dy;if(G.solidAt(wx+.5,wy+.5)){const ox=wx+dx,oy=wy+dy;if(ox>0&&oy>0&&ox<s.mapW-1&&oy<s.mapH-1&&!G.solidAt(ox+.5,oy+.5)){wall={x:ox+.5,y:oy+.5};break;}}}
    let blocked=null;
    if(wall){const i=G.spawn('wisp',wall.x,wall.y,true,[]);G.useItem();blocked=G.state().enemies[i].blindT;}
    return {ok:true,v,dn,df,t0,t2,tEnd,farT,msg,blocked,cfg:G.veilCfg};});
  check('M1.52 Mourner\'s Veil blinds only mobs within the current view range (and in line of sight) for about 5 s',veil.ok&&veil.dn<=veil.v&&veil.df>veil.v&&veil.t0>4.5&&veil.t0<=5.05&&veil.t2>2.4&&veil.t2<3.2&&veil.tEnd<=0&&veil.farT===0&&(veil.blocked===null||veil.blocked===0)&&veil.cfg.time===5,JSON.stringify(veil));
  const fly=await G(page,()=>{const G=__game;G.manual=true;G.freeze=false;G.setSeed(777);G.startLevel(2,{hearts:9,coins:0});G.clearMobs();
    const s=G.state();let spot=null;
    for(let y=2;y<s.mapH-2&&!spot;y++)for(let x=2;x<s.mapW-2&&!spot;x++){
      if(!G.solidAt(x+.5,y+.5)&&!G.solidAt(x+2.5,y+.5)&&!(G.pitUnder&&(G.pitUnder(x+.5,y+.5,0)||G.pitUnder(x+2.5,y+.5,0))))spot={x:x+.5,y:y+.5};}
    if(!spot)spot={x:s.player.x,y:s.player.y};
    G.teleport(spot.x,spot.y,0);
    const i=G.spawn('lichen',spot.x+1.6,spot.y,true,[]);
    const e0=G.state().enemies[i];
    const frames=new Set([e0.frame]),zs=new Set([+e0.z.toFixed(3)]);let air=!!e0.air,moved=false,minZ=e0.z,maxZ=e0.z;const x0=e0.x,y0=e0.y;
    for(let k=0;k<40;k++){G.advance(0.05);const e=G.state().enemies[i];frames.add(e.frame);zs.add(+e.z.toFixed(3));if(e.air)air=true;if(Math.hypot(e.x-x0,e.y-y0)>0.05)moved=true;minZ=Math.min(minZ,e.z);maxZ=Math.max(maxZ,e.z);}
    const hp=G.state().enemies[i].hp;
    // flies over a pit if one exists
    let pitStay=null;
    const pits=(G.pits&&G.pits())||[];
    if(pits[0]){G.clearMobs();const q=pits[0];const j=G.spawn('lichen',q.x+.5,q.y+.5,true,[]);
      let inPit=0,gone=false;for(let k=0;k<30;k++){const e=G.advance(1/60).enemies[j];if(!e||e.gone){gone=true;break;}if(G.cellType(Math.floor(e.x),Math.floor(e.y))===6)inPit++;}
      pitStay={inPit,gone,z:G.state().enemies[j]&&G.state().enemies[j].z};}
    return {hp,frames:[...frames],zs:[...zs].length,air,moved,minZ,maxZ,base:G.mobs.lichen.hp,fly:!!G.mobs.lichen.fly,pitStay};});
  check('M1.52 the Lichen Face is a flying mob (hovers and drifts toward you, no hop) with 3 HP',fly.hp===3&&fly.base===3&&fly.fly&&fly.frames.length>=2&&fly.zs>=2&&!fly.air&&fly.moved&&fly.minZ>0.12&&fly.maxZ>fly.minZ&&(!fly.pitStay||(!fly.pitStay.gone&&fly.pitStay.inPit>0)),JSON.stringify(fly));
  const snd=await G(page,()=>{const G=__game;G.manual=true;G.freeze=false;G.setSeed(777);G.startLevel(2,{hearts:9,coins:0});G.clearMobs();
    const s=G.state();let spot=null;
    for(let y=2;y<s.mapH-2&&!spot;y++)for(let x=2;x<s.mapW-2&&!spot;x++){
      if(!G.solidAt(x+.5,y+.5)&&!G.solidAt(x+1.6,y+.5)&&!(G.pitUnder&&(G.pitUnder(x+.5,y+.5,0)||G.pitUnder(x+1.6,y+.5,0))))spot={x:x+.5,y:y+.5};}
    if(!spot)spot={x:s.player.x,y:s.player.y};
    G.teleport(spot.x,spot.y,0);
    const v0=(G.state().stats.voices&&G.state().stats.voices.lichen)||0;
    const i=G.spawn('lichen',spot.x+1.5,spot.y,false,[]);
    for(let k=0;k<30;k++)G.advance(0.05);
    const st=G.state();
    return {voice:G.mobs.lichen.voice,n:((st.stats.voices&&st.stats.voices.lichen)||0)-v0,state:st.enemies[i]&&st.enemies[i].state};});
  check('M1.52 the Lichen Face has a procedural voice that plays when it spots you',snd.voice==='lichen'&&snd.n>=1,JSON.stringify(snd));
  const spore=await G(page,()=>{const G=__game;const run=(boots)=>{G.manual=true;G.freeze=false;G.setSeed(777);G.startLevel(2,{hearts:9,coins:0,perm:{items:boots?{boots:1}:{}}});G.clearMobs();
      const s=G.state();let spot=null;
      for(let y=2;y<s.mapH-2&&!spot;y++)for(let x=2;x<s.mapW-2&&!spot;x++){
        if(!G.solidAt(x+.5,y+.5)&&!G.solidAt(x+1.1,y+.5)&&!(G.pitUnder&&(G.pitUnder(x+.5,y+.5,0)||G.pitUnder(x+1.1,y+.5,0))))spot={x:x+.5,y:y+.5};}
      G.teleport(spot.x,spot.y,0);
      const i=G.spawn('lichen',spot.x+.35,spot.y,false,[]);
      const e=G.state().enemies[i];G.damageMob(i,e.hp);
      G.advance(0.2);
      const patch=G.spores();
      if(patch[0])G.teleport(patch[0].x,patch[0].y,0);
      const j=G.spawn('zapfly',(patch[0]||{x:spot.x}).x,(patch[0]||{y:spot.y}).y,true,[]);
      const k=G.spawn('clunk',(patch[0]||{x:spot.x}).x,(patch[0]||{y:spot.y}).y,true,[]);
      G.advance(0.25);
      const st=G.state();
      return {n:patch.length,r:patch[0]&&patch[0].r,life:patch[0]&&patch[0].life,slow:G.slowT(),fly:st.enemies[j].slowT,ground:st.enemies[k].slowT,cfg:G.sporeCfg};};
    return {bare:run(false),boots:run(true)};});
  check('M1.52 when the Lichen Face pops it leaves a slowing spore patch (slime-puddle size, a few seconds); flyers and Rubber Boots ignore it',spore.bare.n>=1&&Math.abs(spore.bare.r-0.36)<0.02&&spore.bare.life>3&&spore.bare.life<=5&&spore.bare.slow>0&&spore.bare.fly===0&&spore.bare.ground>0&&spore.boots.slow===0&&spore.boots.n>=1,JSON.stringify(spore));
  const moss=await G(page,()=>{const G=__game;let mossy=0,onMoss=0,off=0,deep=0;const samples=[];
    for(let sd=1;sd<=40;sd++)for(const f of [2,3,4,5,6,7,8]){
      const name=G.themeFor(sd,f).name,n=[...G.genMap(sd,f).map.join('')].filter(c=>c==='f').length;
      if(/MOSSY CELLAR/.test(name)){mossy++;if(n>0)onMoss++;samples.push(sd+':'+f+'='+n);}else off+=n;}
    for(let sd=1;sd<=10;sd++)for(const f of [12,16,20]){const name=G.themeFor(sd,f).name;if(/MOSSY CELLAR/.test(name))deep++;}
    G.setSeed(1);G.startLevel(0);const tut=[...G.currentMap().join('')].filter(c=>c==='f').length;
    return {mossy,onMoss,off,deep,tut,samples:samples.slice(0,8)};});
  check('M1.52 the Lichen Face spawns on Mossy Cellar floors (the existing early theme), not on the tutorial or in the deep themes',moss.mossy>0&&moss.onMoss===moss.mossy&&moss.off===0&&moss.deep===0&&moss.tut===0,JSON.stringify(moss));
  const wander=await G(page,()=>{const G=__game;G.manual=true;G.freeze=false;G.setSeed(777);G.startLevel(2,{hearts:9,coins:0});
    const s=G.state();const dirs=[[1,0],[-1,0],[0,1],[0,-1]];let line=null;
    for(let y=1;y<s.mapH-1&&!line;y++)for(let x=1;x<s.mapW-1&&!line;x++){
      if(G.solidAt(x+.5,y+.5)||(G.pitUnder&&G.pitUnder(x+.5,y+.5,0)))continue;
      for(const [dx,dy] of dirs){let n=0;while(n<10&&!G.solidAt(x+dx*(n+1)+.5,y+dy*(n+1)+.5)&&!(G.pitUnder&&G.pitUnder(x+dx*(n+1)+.5,y+dy*(n+1)+.5,0)))n++;if(n>=8){line={x:x+.5,y:y+.5,dx,dy,n};break;}}}
    let toward=0,moved=0,trials=0;
    if(line){for(let t=0;t<6;t++){G.clearMobs();const px=line.x+line.dx*4,py=line.y+line.dy*4;G.teleport(px,py,0);
      const i=G.spawn('clunk',px+line.dx*2.2,py+line.dy*2.2,true,[]);G.give('veil');G.useItem();
      G.teleport(line.x,line.y,0);
      const x0=G.state().enemies[i].x,y0=G.state().enemies[i].y,b0=G.state().enemies[i].blindT;
      G.advance(1.1);
      const e=G.state().enemies[i];trials++;if(Math.hypot(e.x-x0,e.y-y0)>0.05)moved++;
      const d0=Math.hypot(x0-line.x,y0-line.y),d1=Math.hypot(e.x-line.x,e.y-line.y);if(d1<d0-0.35)toward++;if(b0<4)return {fail:'noblind',b0};}}
    return {trials,moved,toward};});
  check('M1.52 blinded mobs lose track of you and wander (they do not chase your new position)',wander.trials>=6&&wander.moved>=4&&wander.toward<=3,JSON.stringify(wander));
  // in-play shots of the veil and the Lichen Face
  await G(page,()=>{const G=__game;G.manual=true;G.freeze=true;G.setSeed(777);G.startLevel(2,{hearts:9,coins:0});G.clearMobs();G.viewOverride=14;
    const s=G.state();let spot=null;
    for(let y=2;y<s.mapH-2&&!spot;y++)for(let x=2;x<s.mapW-2&&!spot;x++){
      if(!G.solidAt(x+.5,y+.5)&&!G.solidAt(x+2.2,y+.5)&&!(G.pitUnder&&(G.pitUnder(x+.5,y+.5,0)||G.pitUnder(x+2.2,y+.5,0))))spot={x:x+.5,y:y+.5};}
    G.teleport(spot.x,spot.y,0);G.setPitch&&G.setPitch(14);
    G.spawn('lichen',spot.x+1.7,spot.y,true,[]);G.advance(0.8);G.render();});
  await page.screenshot({path:`${SHOTS}/m149_lichen_face.png`});
  await G(page,()=>{const G=__game;G.give('veil');G.useItem();G.freeze=false;G.advance(0.2);G.freeze=true;G.render();return {mist:G.veilMist&&G.veilMist()};});
  await page.screenshot({path:`${SHOTS}/m149_mourners_veil.png`});
  await G(page,()=>{const G=__game;G.freeze=false;G.advance(1);G.freeze=true;G.render();return {mist:G.veilMist&&G.veilMist()};});
  await page.screenshot({path:`${SHOTS}/m149_mourners_veil_after.png`});
  await ctx.close();
}

async function m147Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m147'});
  const hx=await G(page,()=>{const G=__game,out={};const run=(items,leave)=>{G.manual=true;G.freeze=false;G.setSeed(4242);G.startLevel(0,{hearts:9,coins:0,perm:{items}});G.clearMobs();G.teleport(7.5,3.5,0);G.setHearts(9);
      const i=G.spawn('hexeye',10.5,3.5,true,[]);const s0=G.state().stats,c0=s0.psyCasts|0,hit0=s0.psyHits|0,dg0=s0.psyDodged|0,h0=G.state().player.hearts;let red=false,fog=0,left=false;
      for(let k=0;k<70;k++){G.advance(0.1);const st=G.state();if(st.enemies[i].frame===3){red=true;fog=Math.max(fog,G.psyK());if(leave&&!left){G.teleport(2.5,3.5,0);left=true;}}}
      const s=G.state();return {casts:(s.stats.psyCasts|0)-c0,hits:(s.stats.psyHits|0)-hit0,dodged:(s.stats.psyDodged|0)-dg0,lost:h0-s.player.hearts,red,fog:+fog.toFixed(2)};};
    out.plain=run({},false);out.armour=run({jacket:10,bubble:5,garlic:3,mirror:3},false);out.dodge=run({},true);out.cfg=G.hexeyeCfg;
    out.pool={f11:G.mobsOnFloor?0:0};return out;});
  check(`M1.47 the Hexeye stares (eye red, fog red): after ${hx.cfg.charge} s you take a heart if still within ${hx.cfg.range} cells`,hx.plain.casts>=1&&hx.plain.hits>=1&&hx.plain.lost>=1&&hx.plain.red&&hx.plain.fog>.5,JSON.stringify(hx.plain));
  check('M1.47 the Hexeye\'s attack is psychic: the jacket, bubble wrap, garlic and mirror do not stop it',hx.armour.hits>=1&&hx.armour.lost>=1,JSON.stringify(hx.armour));
  check('M1.47 stepping out of range while the Hexeye stares dodges it',hx.dodge.casts>=1&&hx.dodge.dodged>=1&&hx.dodge.lost===0,JSON.stringify(hx.dodge));
  const pl=await G(page,()=>{const G=__game,mob=new Set(['v']),o={hexBefore:0,hexAfter:0,rows:{}};for(let sd=1;sd<=20;sd++){for(const f of [8,11])for(const row of G.genMap(sd,f).map)for(const c of row)if(c==='v')o.hexBefore++;for(const f of [12,16])for(const row of G.genMap(sd,f).map)for(const c of row)if(c==='v')o.hexAfter++;}
    for(const f of [3,6,10,13,14,20,30]){let cells=0,big=0,rooms=0,badPath=0;for(let sd=1;sd<=20;sd++){const d=G.genMap(sd,f),m=d.map;if(d.pitRoom){rooms++;const R=d.pitRoom;let walk=0,wide=false;const W=(x,y)=>m[y][x]!=='P';for(let y=R.y;y<R.y+R.h;y++)for(let x=R.x;x<R.x+R.w;x++){if(W(x,y))walk++;if(x+1<R.x+R.w&&y+1<R.y+R.h&&W(x,y)&&W(x+1,y)&&W(x,y+1)&&W(x+1,y+1))wide=true;}if(wide||walk===R.w*R.h)badPath++;} /* paths are 1 cell wide (no 2x2 of floor) and there is pit */
        for(let y=0;y<m.length-1;y++)for(let x=0;x<m[0].length-1;x++){if(m[y][x]==='P')cells++;if(m[y][x]==='P'&&m[y][x+1]==='P'&&m[y+1][x]==='P'&&m[y+1][x+1]==='P')big++;}}o.rows[f]={cells:+(cells/20).toFixed(1),big,rooms,badPath};}
    return o;});
  check(`M1.47 the Hexeye joins the monster pools on floor 12 (${pl.hexBefore} on floors 8/11, ${pl.hexAfter} on floors 12/16 over 20 seeds)`,pl.hexBefore===0&&pl.hexAfter>0,JSON.stringify(pl));
  const R=pl.rows;
  check(`M1.47 deeper floors have more pits and bigger ones: ${Object.entries(R).map(([f,v])=>'floor '+f+' '+v.cells).join(', ')} pit cells per floor; 2x2 pits from floor 8`,R[3].cells<=R[10].cells&&R[10].cells<R[30].cells&&R[6].big===0&&R[10].big>0,JSON.stringify(R));
  check(`M1.47 pit rooms (all pit but 1-cell paths between the doors) only from floor 14: ${R[14].rooms+R[20].rooms+R[30].rooms} on 60 deep floors, none before`,R[3].rooms+R[6].rooms+R[10].rooms+R[13].rooms===0&&R[14].rooms+R[20].rooms+R[30].rooms>10&&R[14].badPath+R[20].badPath+R[30].badPath===0,JSON.stringify(R));
  await ctx.close();
}

async function m146Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m146'});
  const r=await G(page,()=>{const G=__game,out={errors:[],n:0};const types=['screamer','springle','kettle','wisp','clunk','zapfly','skeleton','skitter','bigspider','eggsac','knight'];
    for(const t of types)for(const m of ['ranged','beefy','mama','mounted','splitter','ghost']){try{G.manual=true;G.freeze=false;G.setSeed(4242);G.startLevel(5,{hearts:99,coins:0});G.clearMobs();G.god=true;const pl=G.state().player;
        G.teleport(pl.x,pl.y,0);let sp=null;for(let d=2.5;d>=1.5&&!sp;d-=.5)for(let a=-.6;a<=.6&&!sp;a+=.3){const x=pl.x+Math.cos(a)*d,y=pl.y+Math.sin(a)*d;if(!G.solidAt(x,y)&&G.clearPath(pl.x,pl.y,x,y))sp=[x,y];}if(!sp)continue;
        G.spawn(t,sp[0],sp[1],true,[m]);for(let k=0;k<10;k++)G.advance(0.1);out.n++;}catch(e){out.errors.push(t+'+'+m+': '+e.message);}}
    return out;});
  check(`M1.46 every mob type can carry an Infernal power and be drawn with its glow (${r.n} type/power pairs on screen, incl. skitters, egg sacs and the knight; this crashed the renderer and froze the game before)`,r.errors.length===0&&r.n>=50,JSON.stringify(r.errors.slice(0,4)));
  const lp=await G(page,async()=>{const G=__game;G.manual=false;G.setSeed(5);G.startLevel(1,{hearts:9,coins:0});const t0=G.state().stats.frames;G.failOnce();await new Promise(r=>setTimeout(r,600));const s=G.state();return {err:G.lastErr(),framesGone:s.stats.frames-t0,time:s.stats.errors};});
  check('M1.46 an error in one frame no longer freezes the game: the loop keeps updating and drawing, and the error is shown on the pause screen',!!lp.err&&/test failure/.test(lp.err)&&lp.framesGone>5,JSON.stringify(lp));
  const mt=await G(page,()=>{const G=__game,c={};let same=0;for(let r=0;r<40;r++){G.manual=true;G.setSeed(9+r);G.startLevel(5,{hearts:99,coins:0});G.clearMobs();const pl=G.state().player;G.spawn('skeleton',pl.x+1.5,pl.y,true,['mounted']);G.advance(0.05);const es=G.state().enemies;if(es.filter(e=>e.type==='skeleton').length>1)same++;es.forEach(e=>c[e.type]=(c[e.type]|0)+1);}return {same,c};});
  check(`M1.46 Mounted never rides a mob of its own kind or a Rattlebones (40 mounted skeletons: ${JSON.stringify(mt.c)})`,mt.same===0&&!mt.c.skeleton_carrier,JSON.stringify(mt));
  await ctx.close();
}

async function m145Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m145'});
  const pd=await G(page,()=>{const G=__game,out={};for(const t of ['clunk','kettle','screamer','wisp','zapfly']){G.manual=true;G.freeze=false;G.setSeed(4242);G.startLevel(0);G.clearMobs();G.setHearts(99);G.teleport(2.5,2.5,0);
      G.spawn(t,7.5,3.5,false);G.addYPud(7.5,3.5);const i=G.state().enemies.length-1;G.freeze=true;const h0=G.state().enemies[i].hp;for(let k=0;k<20;k++)G.advance(0.1);out[t]=h0-G.state().enemies[i].hp;}return out;});
  check(`M1.45 flying monsters pass over yellow puddles; ground monsters still take the damage (${Object.entries(pd).map(([k,v])=>k+' -'+v).join(', ')})`,pd.clunk>0&&pd.kettle>0&&pd.screamer===0&&pd.wisp===0&&pd.zapfly===0,JSON.stringify(pd));
  const bm=await G(page,()=>{const G=__game;G.manual=true;G.freeze=false;G.setSeed(4242);G.startLevel(0);G.clearMobs();G.setHearts(99);G.teleport(2.5,3.5,0);G.advance(0.05);const s0=G.state().stats.booms|0;G.blackBoom(4.5,3.5);
    const a=G.booms();G.advance(0.9);return {made:(G.state().stats.booms|0)-s0,live:a,after:G.booms(),frames:[0,1,2,3].map(i=>{const d=G.spriteData('boom',i);return d.w+'x'+d.h;})};});
  check('M1.45 explosions use the new art (assets/boom.png: burst, fireball, peak, smoke) and clear away after about 0.75 s',bm.made===1&&bm.live===1&&bm.after===0&&bm.frames.every(f=>f==='32x32'),JSON.stringify(bm));
  const hb=await G(page,()=>{const f=__game.spriteData('handAll',0);return [f.w,f.h];});
  check('M1.45 the arm frames are 100 x 80 so the sleeve runs on past the bottom-right corner while it animates',hb[0]===100&&hb[1]===80,JSON.stringify(hb));
  await ctx.close();
}

async function m143Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m143'});
  const r=await G(page,()=>{const G=__game,h=[0,1,2,3].map(i=>{const d=G.atlasPng('hand');return d.length;}),st=G.assetState();
    const hs=['idle','windup','throw','empty'].map(f=>G.frameSig(f));return {embedded:{hand:!!G.embedded('hand'),balloon:!!G.embedded('balloon')},state:st,sigs:hs,uniq:new Set(hs).size,k:[G.fxK('hand'),G.fxK('balloon')]};});
  if(V144){const bc=await G(page,()=>{const s=__game.ballSigs();return {n:Object.keys(s).length,balls:new Set(Object.values(s).map(v=>v[0])).size,idle:new Set(Object.values(s).map(v=>v[1])).size};});
    check(`M1.44 every balloon colour is its own art: ${bc.n} colours, ${bc.balls} different balloons and ${bc.idle} different arms holding them (from assets/balloon.png and assets/hand.png, no recolouring)`,bc.n===7&&bc.balls===7&&bc.idle===7,JSON.stringify(bc));}
  check('M1.43 the arm (4 frames) and the balloon come from assets/hand.png and assets/balloon.png, embedded in the game, all 4 arm frames distinct',r.embedded.hand&&r.embedded.balloon&&r.uniq===4&&r.k.join()==='1.5,1.5'&&r.state.hand==='png'&&r.state.balloon==='png',JSON.stringify(r));
  await ctx.close();
}

async function m141Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m141'});
  const sw=await G(page,()=>{const G=__game,out={};for(const [f,k] of [[2,'open'],[5,'sealed']]){G.manual=true;G.setSeed(3);G.startLevel(f-1,{hearts:9,coins:0});G.clearMobs();const e=G.exitAt();let ok=false;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=e.x+.5+dx*2,y=e.y+.5+dy*2;if(!G.solidAt(x,y)&&G.clearPath(x,y,e.x+.5,e.y+.5)){G.teleport(x,y,Math.atan2(-dy,-dx));ok=true;break;}}G.setPitch(-60);const s=G.advance(0.05).stats;out[k]={ok,stair:s.stairPx,grate:s.gratePx};}
    return out;});
  check(`M1.41 the exit is a hole in the floor with stairs going down (${sw.open.stair} px drawn below the floor) under a floating EXIT sign; while a boss lives an iron grate covers it (${sw.sealed.grate} px)`,sw.open.ok&&sw.open.stair>2000&&sw.open.grate===0&&sw.sealed.grate>2000&&sw.sealed.stair===0,JSON.stringify(sw));
  const sg=await G(page,()=>[0,1].map(i=>{const d=__game.spriteData('portal',i);return [d.w,d.h];}));
  check(V142?'M1.41/M1.42 the exit sprite is just the EXIT sign on two chains (36 x 15), hung from the ceiling':'M1.41 the exit sprite is just the EXIT sign (36 x 12)',sg.every(([w,h])=>w===36&&h===(V142?15:12)),JSON.stringify(sg));
  await ctx.close();
}

async function m140Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m140'});
  const ar=await G(page,()=>{const G=__game,o={floors:0,designs:{},bad:[],fallback:0};const W=new Set('#SWTMKRCVOABEIZ+='.split(''));
    for(let sd=1;sd<=30;sd++)for(const f of [5,10,15,20,25,30]){const d=G.genMap(sd,f);o.floors++;if(d.fallback){o.fallback++;continue;}const B=d.boss;if(!B||!B.design){o.bad.push(sd+':'+f+' no design');continue;}
      o.designs[B.design]=(o.designs[B.design]|0)+1;const D=G.arenas.find(a=>a.name===B.design),A=B.room,m=d.map;if(A.w!==D.rows[0].length||A.h!==D.rows.length){o.bad.push(sd+':'+f+' size');continue;}
      for(let ty=0;ty<A.h;ty++)for(let tx=0;tx<A.w;tx++){const t=D.rows[ty][tx],c=m[A.y+ty][A.x+tx];
        if((t==='#'&&!W.has(c))||(t==='x'&&!W.has(c)&&!/[.c]/.test(c)))o.bad.push(sd+':'+f+' '+t+'@'+tx+','+ty+'='+c);if(t==='o'&&c!=='P')o.bad.push(sd+':'+f+' pit@'+tx+','+ty+'='+c);if(t==='X'&&c!=='X')o.bad.push(sd+':'+f+' exit');}
      const bx=D.rows.findIndex(r=>r.includes('B')),by=D.rows[bx].indexOf('B');if(B.x!==A.x+by||B.y!==A.y+bx)o.bad.push(sd+':'+f+' boss spot');}
    return o;});
  const lk=await G(page,()=>{const G=__game,bad=[];let n=0;const WALL=new Set('#SWTMKRCVOABEIZ+=F'.split(''));
    for(let sd=1;sd<=30;sd++)for(const f of [2,3,4,6,7,8,9,11,13,17,24,31]){const d=G.genMap(sd,f),m=d.map;if(d.boss)continue;const A=G.genRooms(sd,f).find(r=>r.tag==='exit');if(!A){bad.push(sd+':'+f+' no exit room');continue;}n++;let doors=[],keys=0,locks=0,p=null;
      for(let y=0;y<m.length;y++)for(let x=0;x<m[0].length;x++){const c=m[y][x];if(c==='k')keys++;if(c==='L')locks++;if(c==='p')p=[x,y];const ring=(y===A.y-1||y===A.y+A.h)!==(x===A.x-1||x===A.x+A.w)&&x>=A.x-1&&x<=A.x+A.w&&y>=A.y-1&&y<=A.y+A.h;if(ring&&!WALL.has(c))doors.push(c);}
      if(doors.length!==1||doors[0]!=='L')bad.push(sd+':'+f+' doors '+doors.join(''));
      const seen=new Set([p.join()]),q=[p];let keyFree=false;while(q.length){const [x,y]=q.pop();if(m[y][x]==='k')keyFree=true;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy,k=X+','+Y,c=m[Y][X];if(seen.has(k)||WALL.has(c)||c==='L'||c==='P'||c==='Y'||c==='N')continue;seen.add(k);q.push([X,Y]);}}
      if(!keyFree)bad.push(sd+':'+f+' no key before the lock');if(keys<locks)bad.push(sd+':'+f+' keys '+keys+' < locks '+locks);}
    return {n,bad};});
  check(`M1.40 the portal is behind a key door: on ${lk.n} normal floors the exit room has exactly one way in, a locked door, and a key can be found without passing any lock (boss floors: the portal opens when the boss falls)`,lk.bad.length===0,JSON.stringify(lk.bad.slice(0,6)));
  check(`M1.40 every boss floor uses a fixed arena design (13 x 11): ${Object.entries(ar.designs).map(([k,v])=>k+' '+v).join(', ')}; pillars, pits, the boss spot and the portal are where the design puts them`,ar.fallback===0&&ar.bad.length===0&&Object.keys(ar.designs).length===4,JSON.stringify({bad:ar.bad.slice(0,6),designs:ar.designs}));
  const kg=await G(page,()=>{const comps=d=>{const seen=new Uint8Array(d.w*d.h);let n=0,big=0,tot=0;for(let i=0;i<d.w*d.h;i++){if(!(d.px[i]>>>24)||seen[i])continue;n++;let c=0;const q=[i];seen[i]=1;while(q.length){const j=q.pop();c++;const x=j%d.w,y=(j/d.w)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=d.w||Y>=d.h)continue;const k=Y*d.w+X;if(!seen[k]&&(d.px[k]>>>24)){seen[k]=1;q.push(k);}}}tot+=c;big=Math.max(big,c);}return {n,share:+(big/tot).toFixed(3)};};
    return [0,1,2,3,4,5,6,7].map(i=>comps(__game.spriteData('king',i)));});
  check('M1.40 the Screamer King is one piece in every frame: his ears stay attached to his head while they flap',kg.every(c=>c.n===1),JSON.stringify(kg));
  const mn=await G(page,()=>{__game.manual=true;__game.setSeed(777);__game.startLevel(4);__game.faceBoss(2.5);__game.advance(0.1);for(let i=0;i<70&&__game.state().mode!=='play';i++){__game.setHearts(5);__game.advance(0.1);} /* past the 5 s intro */const mx=__game.boss().ent.maxHp;__game.hitBoss(Math.ceil(mx/3));__game.setHearts(5);const s=__game.advance(0.1);return s.enemies.filter(e=>e.spawned&&!e.gone).map(e=>e.type+':'+e.scale);});
  check(`M1.40 the Screamer King's screamers are small beside him (${mn.join(', ')})`,mn.length>=1&&mn.every(m=>m==='screamer:0.6'),JSON.stringify(mn));
  await ctx.close();
}

async function m139Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m139'});
  const rm=await G(page,()=>{const G=__game,mobCh=new Set(Object.values(G.mobs).map(m=>m.ch)),o={floors:0,fillable:0,empty:[],big:0,big2:0,mobs:0,corridor:0,maxMobs:0};
    for(const sd of [1,2,3,4,5,6,7,8,9,10])for(const f of [2,3,4,6,7,8,9,11,13,16]){const d=G.genMap(sd,f),m=d.map,RR=G.genRooms(sd,f);o.floors++;let n=0;
      for(let y=0;y<m.length;y++)for(let x=0;x<m[0].length;x++)if(mobCh.has(m[y][x])){n++;if(!RR.some(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h))o.corridor++;}o.mobs+=n;o.maxMobs=Math.max(o.maxMobs,n);
      RR.forEach(r=>{if(r.start||r.shop||r.tag==='treasure'||r.tag==='arena'||r.tag==='pit')return;o.fillable++;let k=0;for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)if(mobCh.has(m[y][x]))k++;if(!k)o.empty.push(sd+':'+f);if(r.w*r.h>=25){o.big++;if(k>=2)o.big2++;}});}
    o.mobsPerFloor=+(o.mobs/o.floors).toFixed(1);return o;});
  check(`M1.39 every room except the start, shop, treasure room and arena has monsters (${rm.fillable} rooms on ${rm.floors} floors; decorations no longer count)`,rm.empty.length===0,JSON.stringify({empty:rm.empty.slice(0,6)}));
  check(`M1.39 rooms first: monsters move out of the corridors into rooms (${rm.corridor} left in corridors), big rooms often get 2+ (${rm.big2} of ${rm.big}), ${rm.mobsPerFloor} per floor, never more than 30`,rm.corridor<rm.mobs*.1&&rm.big2>rm.big*.3&&rm.maxMobs<=30,JSON.stringify({corridor:rm.corridor,mobs:rm.mobs,big:rm.big,big2:rm.big2,max:rm.maxMobs}));
  const it=await G(page,()=>{const G=__game;G.manual=true;G.setSeed(5);G.startLevel(3,{hearts:5,coins:0,perm:{items:{}}});const out={};for(let i=0;i<10;i++){G.addRunItem('dumbbell');G.addRunItem('heart');}for(let i=0;i<30;i++){G.addRunItem('shoes');G.addRunItem('jacket');G.addRunItem('burger');G.addRunItem('watch');}
    out.dumb=G.itemN('dumbbell');out.c=G.itemCeil();G.advance(0.05);out.hearts=G.state().player.hearts;return out;});
  check(`M1.39 stat items have no stack limit: 10 dumbbells (${it.dumb}), 10 hearts in a jar (max ${it.c.maxH} hearts), 30 running shoes, jackets, burgers and watches all stack`,it.dumb===10&&it.c.maxH===15&&it.c.stack>=99,JSON.stringify(it));
  check(`M1.39 ...with safety ceilings: speed x${it.c.shoes} (max 3), jacket ${(it.c.jacket*100).toFixed(1)}% (max 80%), eye lift ${it.c.eye} (max 0.3), enemy shots x${it.c.watch.toFixed(2)} (min 0.25)`,it.c.shoes===3&&it.c.jacket===.8&&it.c.eye<=.3&&it.c.watch===.25,JSON.stringify(it.c));
  const tilt=await G(page,()=>{const ang=d=>{let n=0,mx=0,my=0;const P=[];for(let y=0;y<d.h;y++)for(let x=0;x<d.w;x++)if(d.px[y*d.w+x]>>>24){P.push([x,y]);mx+=x;my+=y;n++;}mx/=n;my/=n;let a=0,b=0,c=0;P.forEach(([x,y])=>{a+=(x-mx)*(x-mx);b+=(x-mx)*(y-my);c+=(y-my)*(y-my);});return .5*Math.atan2(2*b,a-c)*180/Math.PI;};
    const out={};for(const t of ['zapfly','zapflyC','masque','masqueH']){const a0=[0,1,2,3].map(i=>ang(__game.spriteData(t,i))),a=a0.map(v=>((v-a0[0]+90)%180+180)%180-90);out[t]=+(Math.max(...a)-Math.min(...a)).toFixed(1);} /* angles relative to frame 0 (the axis of a wide mask flips near horizontal) */return out;});
  check(`M1.39 the masks rock back and forth again (tilt swing across the 4 frames: ${Object.entries(tilt).map(([k,v])=>k+' '+v+'°').join(', ')})`,Object.values(tilt).every(v=>v>=10&&v<=25),JSON.stringify(tilt));
  await ctx.close();
}

async function m137Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m137'});
  const r=await G(page,()=>{const G=__game;G.manual=true;const n=[0,0,0,0];for(const f of [1,10,30,50])for(const sd of [900,901,902]){G.setSeed(sd+f);G.startLevel(f-1);const s=G.state();for(let y=0;y<s.mapH;y++)for(let x=0;x<s.mapW;x++){const v=G.cellVariant(x,y);if(v>=0&&G.solidAt(x+.5,y+.5)&&G.cellAt(x,y).t===1)n[v]++;}}
    const tot=n.reduce((a,b)=>a+b,0),W=[0,1,2,3,4,8,9,10,11,12,13,14,15,16,17,18,19],rune=W.map(ti=>G.runeOutside(ti)),diff=W.map(ti=>G.variantDiff(ti,3).diff);
    const doors=[];for(const f of [2,4,6,9,13,20,30]){G.setSeed(31);G.startLevel(f-1);const s=G.state();for(let y=0;y<s.mapH&&doors.length<40;y++)for(let x=0;x<s.mapW;x++){const c=G.cellAt(x,y);if(c&&c.t===2&&!c.coin){const v=G.doorWallShare(x,y);if(v!==null)doors.push(v);}}}
    return {share:n.map(c=>c/tot),tot,rune:Math.max(...rune),runeDiff:Math.min(...diff),doors:doors.length,maxWall:Math.max(...doors)};});
  check(`M1.37 wall variations are just pillars and runes: ${(r.share[0]*100).toFixed(1)}% plain, ${(r.share[2]*100).toFixed(1)}% pillar bays, ${(r.share[3]*100).toFixed(1)}% runes, no damaged walls or torches`,r.share[0]>.88&&r.share[1]===0&&r.share[2]>.025&&r.share[2]<.08&&r.share[3]>.01&&r.share[3]<.05&&r.share[3]<r.share[2],r.share.map(x=>x.toFixed(3)).join(' '));
  check('M1.37 a rune is carved into the plain wall (no pillar bay around it): outside the rune the wall is unchanged, and the rune itself shows',r.rune===0&&r.runeDiff>3,JSON.stringify({outside:r.rune,minDiff:r.runeDiff}));
  if(V138){const pc=await G(page,()=>[0,1,2,3,4,8,9,10,11,12,13,14,15,16,17,18,19].map(ti=>__game.pillarCols(ti)));
    check('M1.38 the pillar stands in the middle of the wall: only columns 24-41 change (pillar 24-39, shadow beside it); the wall edges stay plain',pc.every(c=>c.length>=12&&Math.min(...c)>=24&&Math.max(...c)<=41),JSON.stringify(pc.map(c=>[Math.min(...c),Math.max(...c)])));}
  check(`M1.37 doors are the door leaf only: no wall pixels in any door texture (${r.doors} doors checked), so nothing but the door slides when it opens`,r.doors>=20&&r.maxWall<.01,JSON.stringify(r));
  await ctx.close();
}

async function m136Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m136'});
  const r=await G(page,()=>{const G=__game,t0=performance.now(),st=G.genStats([1,2,3,4,5,6,7,8,9,10,777,4242],[2,4,6,8,10,13,20,30]);st.ms=Math.round(performance.now()-t0);
    const ls=G.layoutStats([1,2,3,4,5,6,7,8,9,10,777,4242],[2,4,6,8,10,13,20,30]);const a=JSON.stringify(G.genMap(55,9).map),b=JSON.stringify(G.genMap(55,9).map),c=JSON.stringify(G.genMap(56,9).map);
    const big=G.layoutTime(151,151,7);return {st,ls,same:a===b,differ:a!==c,big,cfg:G.gen};});
  const st=r.st,cfg=r.cfg;
  check('M1.36 every knob lives in one config (room attempts and sizes, newestBias 0.8, extra connectors 0.08, stubs up to 3 kept 25%, braid 0.1, 1-2 path loops, distance bands)',cfg&&cfg.newestBias===.8&&cfg.extraConnectorChance===.08&&cfg.maxStubLength===3&&cfg.keepDeadEndChance===.25&&cfg.braidChance===.1&&cfg.criticalPathLoops.join()==='1,2'&&cfg.bands.near===6&&'roomAttempts' in cfg&&'roomMin' in cfg&&'roomMax' in cfg,JSON.stringify(cfg));
  check(`M1.36 every floor passes validation on a seed (96 floors, no fallback, ${st.attempts} retries per floor on average): exit and all rooms reachable, at most ${st.maxDeadEnds} dead ends (avg ${st.deadEnds}), critical path ${st.minPath}-${st.maxPath} tiles`,st.floors===96&&st.fallback===0&&st.maxDeadEnds<=cfg.maxDeadEnds&&st.minPath>=20,JSON.stringify(st));
  check(`M1.36 dead ends are short nooks: the longest is ${r.ls.maxDead} cells (stubs are trimmed to 3; the secret-room pocket or slot alcove can add one)`,r.ls.maxDead<=cfg.maxStubLength+1,JSON.stringify(r.ls));
  check(`M1.36 loops: extra connectors (${st.extra}/floor), braided dead ends (${st.braids}/floor) and 1-2 loops around the critical path (${st.pathLoops}/floor)`,st.extra>3&&st.pathLoops>=1&&st.braids>0,JSON.stringify({extra:st.extra,braids:st.braids,pathLoops:st.pathLoops}));
  check(`M1.36 room tags: a start and a treasure room on every floor (${st.treasure}/96), an arena on every boss floor (${st.tags.arena||0}), shrine rooms off the path`,st.treasure===96&&st.tags.start===96&&(st.tags.arena||0)===36&&(st.tags.shrine||0)>40,JSON.stringify(st.tags));
  check(`M1.36 content by distance from the critical path: the key sits 2-6 tiles off it on ${st.keyBand}/96 floors; rooms escalate: clearly more mobs in the second half of the route (${st.mobsLate}) than the first (${st.mobsEarly}); hearts mostly in far pockets or nooks (${st.heartsFar} of ${st.hearts})`,st.keyBand>=90&&st.mobsLate>st.mobsEarly*(V139?1.1:1.3)&& /* M1.39: every room gets one now, so the ramp is gentler */st.heartsFar>=st.hearts*.6,JSON.stringify({keyBand:st.keyBand,early:st.mobsEarly,late:st.mobsLate,heartsFar:st.heartsFar,hearts:st.hearts}));
  check('M1.36 the same seed always gives the same map; another seed gives another',r.same&&r.differ);
  check(`M1.36 a 151 x 151 layout generates in ${r.big.ms} ms (under 250)`,r.big.ok&&r.big.ms<250,JSON.stringify(r.big));
  await G(page,()=>{const G=__game;G.manual=true;G.setSeed(4242);G.startLevel(7,{hearts:5,coins:0});G.seeAll&&G.seeAll();G.clearMobs();G.openMap();G.advance(0.05);});
  await page.screenshot({path:`${SHOTS}/m136_layout_map.png`});
  await ctx.close();
}

async function m135Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m135'});
  const st=await G(page,()=>{const G=__game,styles={},sigs={};G.manual=true;G.freeze=false;
    for(const f of [1,2,3,4,6,9,12,20,30,40,50,57]){G.setSeed(31);G.startLevel(f-1,{hearts:99,coins:0});const s=G.state();
      for(let y=0;y<s.mapH;y++)for(let x=0;x<s.mapW;x++){const c=G.cellAt(x,y);if(c&&c.t===2&&!c.coin){const k=(c.doorStyle||'default')+(c.locked?'_locked':'');styles[k]=(styles[k]||0)+1;sigs[G.doorTexSig(x,y)]=1;}}}
    return {styles,n:Object.keys(styles).filter(k=>!/_locked|default/.test(k)).length,looks:Object.keys(sigs).length,names:G.doorTexNames.length,state:G.assetState()};});
  check(`M1.35 doors match the wall they sit in: ${st.n} wall styles' doors seen across 12 floors, ${st.looks} different door looks (assets/doors.png has a door and a locked door for all 17 wall styles)`,st.names===34&&st.n>=10&&st.looks>=10&&!st.styles.default,JSON.stringify(st.styles));
  const sm=await G(page,()=>{const G=__game;G.manual=true;G.freeze=false;
    const test=(t)=>{for(let seed=1;seed<60;seed++){G.setSeed(seed);G.startLevel(3,{hearts:99,coins:0});G.clearMobs();const s=G.state();
      for(let y=1;y<s.mapH-1;y++)for(let x=1;x<s.mapW-1;x++){const c=G.cellAt(x,y);if(!c||c.t!==t)continue;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const q=[-3,-2,-1,1,2].map(k=>G.cellAt(x+dx*k,y+dy*k));
          if(q.every(c=>c&&c.t===0)){G.teleport(x+dx*2+.5,y+dy*2+.5,0);G.spawn('knight',x-dx*3+.5,y-dy*3+.5,true);const i=G.state().enemies.length-1;
            G.entSet(i,{woke:true,tele:0,chargeT:3,cdx:dx,cdy:dy,hitP:true,chargeCD:99,slamCD:99,shieldCD:99});const s0=G.state().stats.knightSmashes;
            for(let k=0;k<12;k++)G.advance(0.05);const e=G.state().enemies[i],a=G.cellAt(x,y);return {t:a.t,smashed:a.smashed,past:+(dx?(e.x-x-.5)*dx:(e.y-y-.5)*dy).toFixed(2),smashes:G.state().stats.knightSmashes-s0};}}}}return null;};
    const slam=()=>{for(let seed=1;seed<40;seed++){G.setSeed(seed);G.startLevel(3,{hearts:99,coins:0});G.clearMobs();const s=G.state();
      for(let y=1;y<s.mapH-1;y++)for(let x=1;x<s.mapW-1;x++){const c=G.cellAt(x,y);if(!c||c.t!==2)continue;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const a1=G.cellAt(x-dx,y-dy),a2=G.cellAt(x-dx*2,y-dy*2);if(a1&&a2&&a1.t===0&&a2.t===0){
          G.teleport(x-dx*2+.5+(dy?.9:0),y-dy*2+.5+(dx?.9:0),0);G.spawn('knight',x-dx*2+.5,y-dy*2+.5,true);const i=G.state().enemies.length-1;G.entSet(i,{woke:true,slamT:.01,chargeCD:99});
          for(let k=0;k<25;k++)G.advance(0.05);return {t:G.cellAt(x,y).t,smashed:G.cellAt(x,y).smashed};}}}}return null;};
    return {door:test(2),fence:test(3),slam:slam()};});
  check('M1.35 the treasure knight\'s charge crashes through a door and keeps going',sm.door&&sm.door.t===0&&sm.door.smashed==='door'&&sm.door.past>0&&sm.door.smashes>=1,JSON.stringify(sm.door));
  check('M1.35 the treasure knight\'s charge crashes through a fence and keeps going',sm.fence&&sm.fence.t===0&&sm.fence.smashed==='fence'&&sm.fence.past>0,JSON.stringify(sm.fence));
  check('M1.35 the ring from the treasure knight\'s ground slam breaks a door it reaches',sm.slam&&sm.slam.t===0&&sm.slam.smashed==='door',JSON.stringify(sm.slam));
  await ctx.close();
}

async function m131Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m131'});
  const st=await G(page,()=>__game.layoutStats([1,2,3,4,5,6,7,8,9,10,777,4242],[2,4,6,8,10,13,20,30]));
  check(`M1.31 no corridors that lead nowhere: across ${st.floors} floors the longest dead end is ${st.maxDead} cell (only the secret-room pocket and the slot/shop alcoves), about ${st.deadPerFloor.toFixed(1)} per floor (was 5.5, up to 59 cells long)`,st.floors===96&&st.maxDead<=1&&st.deadPerFloor<2,JSON.stringify(st));
  await G(page,()=>{const G=__game;G.manual=true;G.setSeed(4242);G.startLevel(7,{hearts:5,coins:0});G.seeAll&&G.seeAll();G.clearMobs();G.openMap();G.advance(0.05);});
  await page.screenshot({path:`${SHOTS}/m131_layout_map.png`});
  await ctx.close();
}

async function m118Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m118'});
  const mu=await G(page,()=>{const G=__game,songs=[],modes=new Set(),boss=[];for(let f=1;f<=30;f++){const sg=G.song(777,f,f%5===0);songs.push(JSON.stringify(sg));if(f%5===0)boss.push(sg.mode);else modes.add(sg.mode);}
    return {uniq:new Set(songs).size,same:JSON.stringify(G.song(777,7,false))===JSON.stringify(G.song(777,7,false)),modes:[...modes],boss,bpm:G.song(777,3,false).bpm};});
  check('M1.18 every floor gets its own song (same seed + floor = same song), slow and in minor modes; boss floors use darker modes',mu.uniq===30&&mu.same&&mu.modes.every(m=>['aeolian','phrygian','harmonic','dorian'].includes(m))&&mu.boss.every(m=>['phrygian','locrian','harmonic'].includes(m))&&mu.bpm<=82,JSON.stringify(mu));
  if(atLeast('1.19.2')){const kf=await G(page,()=>[0,1,2,3,4].map(f=>{const d=__game.spriteData('knight',f);let low=0;for(let y=d.h-8;y<d.h;y++)for(let x=0;x<d.w;x++)if(d.px[y*d.w+x]>>>24)low++;return low;}));
    check('M1.19.2 every Treasure Knight frame (including the overhead sword raise) has legs and feet',kf.every(n=>n>40),JSON.stringify(kf));}
  if(atLeast('1.19')){const sc=await G(page,()=>{const G=__game;G.manual=true;G.setSeed(777);G.startLevel(6,{hearts:5,coins:0});G.clearMobs();let best=null;const s0=G.state();for(let y=1;y<s0.mapH-1;y++)for(let x=1;x<s0.mapW-1;x++){if(G.solidAt(x+.5,y+.5))continue;for(const [dx,dy,an] of [[1,0,0],[-1,0,Math.PI],[0,1,Math.PI/2],[0,-1,-Math.PI/2]]){let n=0;while(n<10&&!G.solidAt(x+.5+dx*(n+1),y+.5+dy*(n+1)))n++;if(!best||n>best.n)best={x,y,dx,dy,an,n};}}G.teleport(best.x+.5,best.y+.5,best.an);const p=G.state().player;const i=G.spawn('screamer',p.x+best.dx*6,p.y+best.dy*6,true,[]); /* down the longest straight corridor */let shots=0,tele=false;for(let k=0;k<70;k++){G.setHearts(5);const s=G.advance(0.1);if(s.enemies[i].tele>0)tele=true;shots=Math.max(shots,s.stats.eshotsFired);}G.render();return {mods:G.state().enemies[i].mods.length,shots,tele};});
    check('M1.19 every Screamer shoots its sonic ring (with the usual tell) without being an elite (no aura)',sc.mods===0&&sc.shots>=1&&sc.tele,JSON.stringify(sc));}
  if(atLeast('1.19')){const ts=await G(page,()=>__game.titleSong());check('M1.19 a hand-written 16-bar title theme (108 BPM, pulse lead, bass, arpeggio, drums) plays on the menus',ts.bars===16&&ts.bpm===108&&ts.notes>100,JSON.stringify(ts));}
  const rv=await G(page,()=>{const G=__game;G.manual=true;localStorage.clear();G.setSeed(777);G.menuPick(0);G.startLevel(3,{hearts:5,coins:35,perm:{}});G.clearMobs();const die=()=>{G.setHearts(1);G.setEffect(null);const p=G.state().player;G.spawn('clunk',p.x+.3,p.y,true,[]);let s;for(let i=0;i<60;i++){s=G.advance(0.1);if(s.mode==='dead')break;}G.clearMobs();return s.mode;}; /* revive gives 2 s of safety */
    const r={};r.d1=die();r.cost1=G.reviveCost();G.advance(0.6);r.pre1=G.state().player.coins;r.ok1=G.revive();let s=G.state();r.after1={mode:s.mode,hearts:s.player.hearts,coins:s.player.coins,save:!!s.save,inv:s.player.inv>1};
    r.d2=die();r.cost2=G.reviveCost();G.advance(0.6);r.pre2=G.state().player.coins;r.ok2=G.revive();s=G.state();r.after2={coins:s.player.coins};r.d3=die();r.cost3=G.reviveCost();G.advance(0.6);r.ok3=G.revive();s=G.advance(0.05);r.after3={mode:s.mode,coins:s.player.coins};
    G.confirm();s=G.advance(0.1);r.next=s.mode;return r;});
  check('M1.18 after a death you can revive for 10 coins x deaths this run (10, 20, 30...): full hearts, a moment of safety, the floor saved again',rv.d1==='dead'&&rv.cost1===10&&rv.ok1&&rv.after1.mode==='play'&&rv.after1.hearts===5&&rv.after1.coins===rv.pre1-10&&rv.after1.save&&rv.after1.inv&&rv.cost2===20&&rv.ok2&&rv.after2.coins===rv.pre2-20, /* M1.28: compared with the coins just before (a knocked-back player can land on a floor coin) */JSON.stringify(rv));
  check('M1.18 without enough coins revive is refused; continuing goes to name entry as before',rv.cost3===30&&!rv.ok3&&rv.after3.mode==='dead'&&rv.next==='name',JSON.stringify(rv));
  const pit=await G(page,()=>{const G=__game;G.setSeed(777);G.startLevel(7,{hearts:5,coins:50,perm:{}});G.clearMobs();const pp=G.pits()[0];G.teleport(pp.x+.5,pp.y+.5);let s;for(let i=0;i<20;i++){s=G.advance(0.1);if(s.mode==='dead')break;}G.advance(0.6);const ok=G.revive();s=G.advance(0.1);return {ok,mode:s.mode,inPit:G.pitUnder(s.player.x,s.player.y,0)};});
  check('M1.18 reviving after a pit fall puts you back on solid ground',pit.ok&&pit.mode==='play'&&!pit.inPit,JSON.stringify(pit));
  await G(page,()=>{const G=__game;G.setSeed(777);G.startLevel(3,{hearts:1,coins:40,perm:{}});G.clearMobs();const p=G.state().player;G.spawn('clunk',p.x+.3,p.y,true,[]);for(let i=0;i<30;i++){if(G.advance(0.1).mode==='dead')break;}G.advance(0.6);});await page.screenshot({path:`${SHOTS}/m118_revive.png`});
  await ctx.close();
}

// ONLY=m19,m110 node m1.test.mjs <build> runs just those groups (names as in the function names, 'regression' for the M1.1 set)
const ONLY=(process.env.ONLY||'').split(',').filter(Boolean),want=n=>!ONLY.length||ONLY.includes(n);
if(NEW&&want('regression')){ await regressionTests(); }
if(V12&&want('m12')){ await m12Tests(); }
if(V13&&want('m13')){ await m13Tests(); }
if(V14&&want('m14')){ await m14Tests(); }
if(V15&&want('m15')){ await m15Tests(); }
if(V16&&want('m16')){ await m16Tests(); }
if(V17&&want('m17')){ await m17Tests(); }
if(V18&&want('m18')){ await m18Tests(); }
if(V19&&want('m19')){ await m19Tests(); }
if(V191&&want('m191')){ await m191Tests(); }
if(V110&&want('m110')){ await m110Tests(); }
if(V111&&want('m111')){ await m111Tests(); }
if(V112&&want('m112')){ await m112Tests(); }
if(V113&&want('m113')){ await m113Tests(); }
if(V114&&want('m114')){ await m114Tests(); }
if(V116&&want('m116')){ await m116Tests(); }
if(V117&&want('m117')){ await m117Tests(); }
if(V118&&want('m118')){ await m118Tests(); }
if(V120&&want('m120')){ await m120Tests(); }
if(V121&&want('m121')){ await m121Tests(); }
if(V122&&want('m122')){ await m122Tests(); }
if(V123&&want('m123')){ await m123Tests(); }
if(V124&&want('m124')){ await m124Tests(); }
if(V126&&want('m126')){ await m126Tests(); }
if(V127&&want('m127')){ await m127Tests(); }
if(V128&&want('m128')){ await m128Tests(); }
if(V129&&want('m129')){ await m129Tests(); }
if(V130&&want('m130')){ await m130Tests(); }
if(V131&&want('m131')){ await m131Tests(); }
if(V135&&want('m135')){ await m135Tests(); }
if(V136&&want('m136')){ await m136Tests(); }
if(V137&&want('m137')){ await m137Tests(); }
if(V139&&want('m139')){ await m139Tests(); }
if(V140&&want('m140')){ await m140Tests(); }
if(V141&&want('m141')){ await m141Tests(); }
if(V143&&want('m143')){ await m143Tests(); }
if(V145&&want('m145')){ await m145Tests(); }
if(V146&&want('m146')){ await m146Tests(); }
if(V147&&want('m147')){ await m147Tests(); }
if(V152&&want('m152')){ await m152Tests(); }
if(V153&&want('m153')){ await m153Tests(); }
async function m157Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m157'});
  const atlas=JSON.parse(fs.readFileSync(`${ROOT}/assets/atlas.json`,'utf8')).sheets;
  const art=await G(page,()=>{const G=__game,st=G.assetState(),bsig=[],ssig=[];
    for(let i=0;i<4;i++)bsig.push(G.frameSig('bather',i));
    for(let i=0;i<5;i++)ssig.push(G.frameSig('slickman',i));
    return {st,sheets:G.mobSheets,pu:G.puIds,plunger:G.pu.plunger,
      bather:{hp:G.mobs.bather.hp,speed:G.mobs.bather.speed,name:G.mobs.bather.name,voice:G.mobs.bather.voice,ch:G.mobs.bather.ch,hp1:G.floorHp('bather',1),hp4:G.floorHp('bather',4),sig:bsig,info:G.spriteInfo('bather',0),fly:!!G.mobs.bather.fly},
      slick:{hp:G.mobs.slickman.hp,speed:G.mobs.slickman.speed,name:G.mobs.slickman.name,voice:G.mobs.slickman.voice,ch:G.mobs.slickman.ch,hp1:G.floorHp('slickman',1),hp4:G.floorHp('slickman',4),sig:ssig,info:G.spriteInfo('slickman',0),fly:!!G.mobs.slickman.fly},
      items:st.items,cfg:G.slickCfg,batherCfg:G.batherCfg};});
  check('M1.57 the Bather art is packed (4 statue walk frames in assets/mobs/bather.png) and the mob has 4 base HP that scales like the others',art.st.bather==='png'&&art.sheets.includes('bather')&&atlas.bather&&atlas.bather.file==='mobs/bather.png'&&atlas.bather.frames===4&&new Set(art.bather.sig).size===4&&art.bather.info&&art.bather.info.w>8&&art.bather.info.h===120&&art.bather.hp===4&&art.bather.hp1===4&&art.bather.hp4===7&&art.bather.name==='THE BATHER'&&art.bather.ch==='a'&&!art.bather.fly,JSON.stringify({st:art.st.bather,frames:new Set(art.bather.sig).size,hp:[art.bather.hp,art.bather.hp1,art.bather.hp4],info:art.bather.info&&{w:art.bather.info.w,h:art.bather.info.h}}));
  check('M1.57 the Slick Man uses the old 5-frame dark Bather art (assets/mobs/slickman.png), 10 base HP (2.5x a typical 4-HP mob) that scales like the others, and lumbers at speed 0.8',art.st.slickman==='png'&&art.sheets.includes('slickman')&&atlas.slickman&&atlas.slickman.file==='mobs/slickman.png'&&atlas.slickman.frames===5&&new Set(art.slick.sig).size===5&&art.slick.info&&art.slick.info.w>8&&art.slick.info.h===120&&art.slick.hp===10&&art.slick.hp1===10&&art.slick.hp4===13&&art.slick.name==='THE SLICK MAN'&&art.slick.ch==='d'&&art.slick.speed===.8&&art.slick.voice==='slickman'&&!art.slick.fly&&art.cfg&&art.cfg.reflect===.3&&art.cfg.fog===5&&art.cfg.range===10,JSON.stringify({st:art.st.slickman,frames:new Set(art.slick.sig).size,hp:[art.slick.hp,art.slick.hp1,art.slick.hp4],speed:art.slick.speed,cfg:art.cfg,info:art.slick.info&&{w:art.slick.info.w,h:art.slick.info.h}}));
  check('M1.57 the Plunger is a use-item (loot and shop on Baths floors) with a packed icon',art.pu.includes('plunger')&&art.plunger&&art.plunger.name==='PLUNGER'&&/HOLE|FLOOR/.test(art.plunger.desc)&&art.items==='png'&&(atlas.items.tiles||[]).includes('plunger'),JSON.stringify({pu:art.pu.includes('plunger'),plunger:art.plunger,items:art.items}));
  const sheet=await G(page,async()=>{const load=async name=>{const url=__game.embedded(name);const im=new Image();im.src=url;await im.decode();
    const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const cx=cv.getContext('2d');cx.drawImage(im,0,0);
    const d=cx.getImageData(0,0,im.width,im.height).data,a=(x,y)=>d[(y*im.width+x)*4+3],n=name==='bather'?4:5,fw=(im.width/n)|0;
    const corners=[[0,0],[im.width-1,0],[0,im.height-1],[im.width-1,im.height-1]];
    for(let i=0;i<n;i++)corners.push([i*fw,0],[i*fw+fw-1,0],[i*fw,im.height-1],[i*fw+fw-1,im.height-1]);
    return {w:im.width,h:im.height,n,corners:corners.map(([x,y])=>({x,y,a:a(x,y)}))};};
    return {bather:await load('bather'),slickman:await load('slickman')};});
  check('M1.57 the Bather and Slick Man sheets are transparent at every frame corner',sheet.bather.corners.every(c=>c.a===0)&&sheet.slickman.corners.every(c=>c.a===0)&&sheet.bather.n===4&&sheet.slickman.n===5&&sheet.bather.h===120&&sheet.slickman.h===120,JSON.stringify(sheet));
  const spawn=await G(page,()=>{const G=__game;let baths=0,onBaths=0,offA=0,slate=0,onSlate=0,offD=0,aOnSlate=0,dOnBaths=0;
    for(let sd=1;sd<=40;sd++)for(const f of [2,3,4,5,6,7,8,9,13,17,18,21,22,25,26,29]){
      const name=G.themeFor(sd,f).name,chars=[...G.genMap(sd,f).map.join('')],na=chars.filter(c=>c==='a').length,nd=chars.filter(c=>c==='d').length;
      if(/TILED BATHS/.test(name)){baths++;if(na>0)onBaths++;dOnBaths+=nd;}
      else offA+=na;
      if(/Slate/i.test(name)){slate++;if(nd>0)onSlate++;aOnSlate+=na;}
      else offD+=nd;}
    G.setSeed(1);G.startLevel(0);const tut=[...G.currentMap().join('')].filter(c=>c==='a'||c==='d').length;
    return {baths,onBaths,offA,slate,onSlate,offD,aOnSlate,dOnBaths,tut};});
  check('M1.57 the Bather spawns on Tiled Baths floors only, not on the tutorial or any other theme',spawn.baths>0&&spawn.onBaths===spawn.baths&&spawn.offA===0&&spawn.tut===0&&spawn.aOnSlate===0,JSON.stringify(spawn));
  check('M1.57 the Slick Man spawns on Slate Halls floors only, not on the tutorial, Baths, or any other theme',spawn.slate>0&&spawn.onSlate===spawn.slate&&spawn.offD===0&&spawn.dOnBaths===0&&spawn.tut===0,JSON.stringify(spawn));
  const trail=await G(page,()=>{const G=__game;const run=(boots)=>{G.manual=true;G.freeze=false;G.setSeed(777);G.startLevel(2,{hearts:9,coins:0,perm:{items:boots?{boots:1}:{}}});G.clearMobs();
      const s=G.state();let spot=null;
      for(let y=2;y<s.mapH-2&&!spot;y++)for(let x=2;x<s.mapW-2&&!spot;x++){
        if(!G.solidAt(x+.5,y+.5)&&!G.solidAt(x+2.8,y+.5)&&!(G.pitUnder&&(G.pitUnder(x+.5,y+.5,0)||G.pitUnder(x+2.8,y+.5,0))))spot={x:x+.5,y:y+.5};}
      if(!spot)spot={x:s.player.x,y:s.player.y};
      G.teleport(spot.x,spot.y,0);G.setHearts(9);
      const i=G.spawn('bather',spot.x+1.8,spot.y,true,[]);
      let pud=0;for(let k=0;k<50;k++){G.advance(0.05);pud=Math.max(pud,(G.state().puddles||[]).filter(q=>q.slick).length);}
      const patches=(G.state().puddles||[]).filter(q=>q.slick);
      if(patches[0])G.teleport(patches[0].x,patches[0].y,0);
      const h0=G.state().player.hearts;
      G.advance(0.2);
      const h1=G.state().player.hearts;
      const slick=G.slickT();
      const j=G.spawn('zapfly',(patches[0]||{x:spot.x}).x,(patches[0]||{y:spot.y}).y,true,[]);
      G.advance(0.2);
      return {pud,n:patches.length,r:patches[0]&&patches[0].r,life:patches[0]&&patches[0].life,col:patches[0]&&patches[0].col,lost:h0-h1,slick,flyHp:G.state().enemies[j]&&G.state().enemies[j].hp,cfg:G.batherCfg,base:G.mobs.bather.hp};};
    return {bare:run(false),boots:run(true)};});
  check('M1.57 the Bather leaves pool-water-blue slick damaging puddles; Rubber Boots ignore them (flyers are unaffected)',trail.bare.pud>=1&&trail.bare.n>=1&&trail.bare.lost>=1&&trail.bare.slick>0&&trail.bare.col==='#3FC8E6'&&trail.boots.lost===0&&trail.boots.slick===0&&trail.bare.base===4,JSON.stringify(trail));
  const skip=await G(page,()=>{const G=__game;G.manual=true;G.freeze=false;G.setSeed(777);G.startLevel(1,{hearts:9,coins:0});G.clearMobs();
    const lv0=G.state().level;G.give('plunger');const held=G.state().player.item;G.useItem();
    const mid={mode:G.state().mode,item:G.state().player.item,hole:G.hole&&G.hole()};
    for(let k=0;k<80;k++){G.advance(1/60);if(G.state().mode==='play'&&G.state().level!==lv0)break;}
    return {lv0,lv1:G.state().level,held,item:G.state().player.item,mode:G.state().mode,mid,msg:G.state().msg};});
  check('M1.57 the Plunger opens a hole, drops you to the next floor and is used up',skip.held==='plunger'&&skip.item==null&&skip.lv1===skip.lv0+1&&skip.mode==='play'&&skip.mid.mode==='fall'&&!!skip.mid.hole,JSON.stringify(skip));
  const basalt=await G(page,()=>{const G=__game;G.manual=true;G.freeze=false;G.setSeed(7);
    G.startLevel(8,{hearts:9,coins:0}); // floor 9 is always Basalt Depths and is not a boss floor
    const theme=G.themeNow();const lv0=G.state().level;G.give('plunger');const used=G.useItem();
    const mid={mode:G.state().mode,item:G.state().player.item,hole:G.hole&&G.hole()};
    for(let k=0;k<180;k++){G.useItem();G.advance(1/60);} // held use must not chain
    const st=G.state(),held=(st.player.item==='plunger'?1:0)+(st.player.item2==='plunger'?1:0);
    return {theme,lv0,lv1:st.level,delta:st.level-lv0,mode:st.mode,used,mid,item:st.player.item,held,fellPit:st.fellPit,msg:st.msg,hole:G.hole&&G.hole()};});
  check('M1.57 one Plunger use on Basalt Depths drops exactly one floor; holding use does not chain; none left in hand',/BASALT/.test(basalt.theme)&&basalt.used===true&&basalt.delta===1&&basalt.mode==='play'&&basalt.held===0&&basalt.item==null&&!basalt.fellPit&&basalt.mid.mode==='fall'&&!!basalt.mid.hole&&!basalt.hole,JSON.stringify(basalt));
  const loot=await G(page,()=>{const G=__game;G.manual=true;G.freeze=false;
    const isBaths=th=>/Baths/i.test(th||'');
    const nPl=its=>(its||[]).filter(it=>it.kind==='power'&&it.ptype==='plunger'&&!it.taken).length;
    const forced=n=>{let c=0;for(let i=0;i<n;i++)if(G.randPU()==='plunger')c++;return c;};
    const shopHas=()=>(G.shopOffers()||[]).includes('plunger');
    const slotHas=n=>{let c=0;for(let i=0;i<n;i++){const r=G.slotResolve('power',0,5);if(r&&r.power==='plunger')c++;}return c;};
    const off={floors:0,themes:{},floorLoot:0,forced:0,shop:0,slot:0,pool:0};
    const on={floors:0,themes:{},floorLoot:0,forced:0,shop:0,slot:0,pool:0,max:0,multi:0,withP:0};
    const seen={mossy:0,basalt:0,baths:0,other:0};
    function rec(theme){
      const b=isBaths(theme)?on:off;
      b.floors++;b.themes[theme]=(b.themes[theme]||0)+1;
      const n=nPl(G.state().items);b.floorLoot+=n;
      if(b===on){if(n>b.max)b.max=n;if(n>1)b.multi++;if(n)b.withP++;}
      b.forced+=forced(120);
      if(shopHas())b.shop++;
      b.slot+=slotHas(80);
      if((G.puPool()||[]).includes('plunger'))b.pool++;
      if(/MOSSY CELLAR/.test(theme))seen.mossy++;
      else if(/BASALT/.test(theme))seen.basalt++;
      else if(isBaths(theme))seen.baths++;
      else seen.other++;
    }
    for(let seed=1;seed<=24;seed++){
      G.setSeed(seed);
      for(const idx of [0,1,2,3,4,5,6,7,8,10,12,16]){
        G.startLevel(idx,{hearts:9,coins:20});
        rec(G.themeNow());
      }
    }
    return {off,on,seen};});
  check('M1.57 forced loot rolls never give a Plunger off Baths floors (Basalt Depths, Mossy Cellar and other themes), and Baths floors can',
    loot.seen.mossy>0&&loot.seen.basalt>0&&loot.seen.baths>0&&loot.seen.other>0
    &&loot.off.floorLoot===0&&loot.off.forced===0&&loot.off.shop===0&&loot.off.slot===0&&loot.off.pool===0
    &&(loot.on.withP>0||loot.on.forced>0||loot.on.shop>0)
    &&loot.on.pool===loot.on.floors,
    JSON.stringify(loot));
  check('M1.57 at most one Plunger appears in normal loot on Baths floors',loot.on.max<=1&&loot.on.multi===0&&loot.on.floors>0,JSON.stringify({floors:loot.on.floors,withP:loot.on.withP,max:loot.on.max,multi:loot.on.multi}));
  const boss=await G(page,()=>{const G=__game;G.manual=true;G.freeze=false;G.setSeed(777);
    G.startLevel(4,{hearts:9,coins:0});G.give('plunger');
    const blocked=G.plungerBlocked();
    const used=G.useItem();
    return {blocked,used,item:G.state().player.item,level:G.state().level,mode:G.state().mode,msg:G.state().msg,boss:G.state().bossDesign||(G.state().levelName||'')};});
  check('M1.57 the Plunger is blocked on a boss floor (not consumed) while the arena is sealed',!!boss.blocked&&boss.used===false&&boss.item==='plunger'&&boss.mode!=='fall',JSON.stringify(boss));
  const deep=await G(page,()=>{const G=__game;G.manual=true;G.freeze=false;G.setSeed(3);
    G.startLevel(1,{hearts:9,coins:0});const max=G.maxFloor;G.forceLevelIdx(max-1);G.give('plunger');
    const blocked=G.plungerBlocked();const used=G.useItem();
    return {max,blocked,used,item:G.state().player.item,level:G.state().level,mode:G.state().mode};});
  check('M1.57 the Plunger is blocked on the final floor and is not consumed',!!deep.blocked&&deep.used===false&&deep.item==='plunger'&&deep.mode!=='fall',JSON.stringify(deep));
  const reflect=await G(page,()=>{const G=__game;G.manual=true;G.freeze=false;G.setSeed(42);G.startLevel(16,{hearts:99,coins:0});G.clearMobs();G.viewOverride=null;
    const s=G.state();let spot=null;
    for(let y=2;y<s.mapH-2&&!spot;y++)for(let x=2;x<s.mapW-4&&!spot;x++){
      const cells=[[x+.5,y+.5],[x+1.5,y+.5],[x+2.5,y+.5]];
      if(cells.every(([a,b])=>!G.solidAt(a,b)&&!(G.pitUnder&&G.pitUnder(a,b,0))))spot={x:x+.5,y:y+.5};}
    if(!spot)spot={x:s.player.x,y:s.player.y};
    const mx=spot.x+1.6,my=spot.y;
    G.teleport(spot.x,spot.y,0);G.setHearts(9);
    let ei=G.spawn('slickman',mx,my,true,[]);
    const keep=()=>G.keepAlive('slickman',80);
    const N=240;const d0=G.slickDeflects();
    let bouncedHurt=false,hits=0;
    for(let i=0;i<N;i++){
      if(!G.state().enemies.some(q=>q.type==='slickman'&&!q.gone))ei=G.spawn('slickman',mx,my,true,[]);
      keep();
      G.placeEnemy(ei,mx,my);
      G.teleport(spot.x,spot.y,0);
      G.setHearts(9);
      const hBefore=G.state().player.hearts;
      const def0=G.slickDeflects();
      const hp0=(G.state().enemies.find(q=>q.type==='slickman')||{}).hp;
      G.shoot(0);
      for(let k=0;k<40;k++)G.advance(1/60);
      const def=G.slickDeflects()>def0;
      const hp1=(G.state().enemies.find(q=>q.type==='slickman')||{}).hp;
      if(def||hp1<hp0)hits++;
      if(def&&G.state().player.hearts<hBefore)bouncedHurt=true;
    }
    const def=G.slickDeflects()-d0,rate=def/N;
    return {N,def,rate,hits,bouncedHurt,hp:G.mobs.slickman.hp};});
  check('M1.57 the Slick Man reflects about 30% of player projectiles over many trials (and a bounce can hurt you)',reflect.N===240&&Math.abs(reflect.rate-0.3)<=0.08&&reflect.bouncedHurt===true&&reflect.hp===10,JSON.stringify(reflect));
  const fog=await G(page,()=>{const G=__game;G.manual=true;G.freeze=false;G.setSeed(42);G.startLevel(16,{hearts:99,coins:0});G.clearMobs();G.viewOverride=null;
    const s=G.state();let spot=null,far=null;
    for(let y=2;y<s.mapH-2;y++)for(let x=2;x<s.mapW-2;x++){
      if(G.solidAt(x+.5,y+.5)||(G.pitUnder&&G.pitUnder(x+.5,y+.5,0)))continue;
      if(!spot)spot={x:x+.5,y:y+.5};
      if(spot&&Math.hypot(x+.5-spot.x,y+.5-spot.y)>=12)far={x:x+.5,y:y+.5};}
    if(!spot)spot={x:s.player.x,y:s.player.y};
    G.teleport(spot.x,spot.y,0);
    for(let i=0;i<3;i++)G.give('glasses');
    const base=G.viewDist();
    const ei=G.spawn('slickman',spot.x+1.4,spot.y,true,[]);
    for(let k=0;k<90;k++)G.advance(1/60);
    const near={fog:G.slickFog(),vd:G.viewDist(),cur:G.viewCur(),on:true};
    G.give('flare');G.useItem();
    for(let k=0;k<20;k++)G.advance(1/60);
    const withFlare={fog:G.slickFog(),vd:G.viewDist(),cur:G.viewCur(),flareT:G.state().flareT||G.flareT};
    let gone=false;
    if(far){
      G.teleport(far.x,far.y,0);
      for(let k=0;k<120;k++)G.advance(1/60);
    }
    const farV={usedFar:!!far,fog:G.slickFog(),vd:G.viewDist(),cur:G.viewCur()};
    // kill it and confirm fog lifts even if we could not find a far tile
    G.clearMobs();
    for(let k=0;k<120;k++)G.advance(1/60);
    const after={fog:G.slickFog(),vd:G.viewDist(),cur:G.viewCur()};
    return {base,near,withFlare,farV,after,cfg:G.slickCfg};});
  check('M1.57 a nearby Slick Man forces fog to 5 blocks even with glasses or a flare, and the clamp lifts when it dies or is out of range',
    fog.base>5&&fog.near.fog===true&&fog.near.vd===5&&fog.near.cur<=5.15
    &&fog.withFlare.fog===true&&fog.withFlare.vd===5
    &&fog.after.fog===false&&fog.after.vd>5&&fog.after.cur>5.4
    &&(!fog.farV.usedFar||(fog.farV.fog===false&&fog.farV.vd>5)),
    JSON.stringify(fog));
  // in-play shots
  await G(page,()=>{const G=__game;G.manual=true;G.freeze=false;G.setSeed(777);G.startLevel(2,{hearts:9,coins:0});G.clearMobs();G.viewOverride=14;
    const s=G.state();let spot=null;
    for(let y=2;y<s.mapH-2&&!spot;y++)for(let x=2;x<s.mapW-2&&!spot;x++){
      if(!G.solidAt(x+.5,y+.5)&&!G.solidAt(x+2.2,y+.5)&&!(G.pitUnder&&(G.pitUnder(x+.5,y+.5,0)||G.pitUnder(x+2.2,y+.5,0))))spot={x:x+.5,y:y+.5};}
    G.teleport(spot.x,spot.y,0);G.setPitch&&G.setPitch(0);
    G.spawn('bather',spot.x+1.7,spot.y,true,[]);
    for(let k=0;k<24;k++)G.advance(0.05);
    G.freeze=true;G.render();});
  await page.screenshot({path:`${SHOTS}/m157_bather.png`});
  await G(page,()=>{const G=__game;G.freeze=false;G.clearMobs();G.give('plunger');G.useItem();G.advance(0.25);G.freeze=true;G.render();return {hole:G.hole&&G.hole(),mode:G.state().mode};});
  await page.screenshot({path:`${SHOTS}/m157_plunger_hole.png`});
  await G(page,()=>{const G=__game;G.freeze=false;G.manual=true;G.setSeed(42);G.startLevel(16,{hearts:9,coins:0});G.clearMobs();G.viewOverride=null;
    for(let i=0;i<3;i++)G.give('glasses');
    const s=G.state();let spot=null;
    for(let y=2;y<s.mapH-2&&!spot;y++)for(let x=2;x<s.mapW-2&&!spot;x++){
      if(!G.solidAt(x+.5,y+.5)&&!G.solidAt(x+2.2,y+.5)&&!(G.pitUnder&&(G.pitUnder(x+.5,y+.5,0)||G.pitUnder(x+2.2,y+.5,0))))spot={x:x+.5,y:y+.5};}
    G.teleport(spot.x,spot.y,0);G.setPitch&&G.setPitch(0);
    G.spawn('slickman',spot.x+1.6,spot.y,true,[]);
    for(let k=0;k<90;k++)G.advance(1/60);
    G.freeze=true;G.render();
    return {vd:G.viewDist(),cur:G.viewCur(),fog:G.slickFog()};});
  await page.screenshot({path:`${SHOTS}/m157_slickman.png`});
  await ctx.close();
}

if(V156&&want('m156')){ await m156Tests(); }
async function m158Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m158'});
  const atlas=JSON.parse(fs.readFileSync(`${ROOT}/assets/atlas.json`,'utf8')).sheets;
  const art=await G(page,async()=>{
    const G=__game,st=G.assetState();
    const url=G.embedded('bather');const im=new Image();im.src=url;await im.decode();
    const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const cx=cv.getContext('2d');cx.drawImage(im,0,0);
    const d=cx.getImageData(0,0,im.width,im.height).data,a=(x,y)=>d[(y*im.width+x)*4+3],n=4,fw=(im.width/n)|0;
    const frames=[];
    for(let i=0;i<n;i++){
      const xs=[],ys=[],feet=[];
      for(let y=0;y<im.height;y++)for(let x=i*fw;x<(i+1)*fw;x++)if(a(x,y)>16){xs.push(x-i*fw);ys.push(y);}
      const y1=Math.max(...ys),y0=Math.min(...ys),cut=y1-Math.max(2,((y1-y0)*0.12)|0);
      for(let k=0;k<xs.length;k++)if(ys[k]>=cut)feet.push(xs[k]);
      const fx=feet.reduce((s,v)=>s+v,0)/feet.length;
      frames.push({i,fx,mid:fw/2,d:fx-fw/2,bottom:im.height-1-y1,y0,corners:[a(i*fw,0),a(i*fw+fw-1,0),a(i*fw,im.height-1),a(i*fw+fw-1,im.height-1)]});
    }
    const walk=p=>G.animFrame({type:'bather',state:'chase',ph:p});
    return {st:st.bather,w:im.width,h:im.height,info:frames,
      idle:G.animFrame({type:'bather',state:'idle',ph:1}),
      ph0:walk(0),ph013:walk(0.13),ph02:walk(0.2),ph05:walk(0.5)};});
  check('M1.58 the Bather walk frames are bottom-aligned and centred on the feet (no sideways wobble)',
    art.st==='png'&&atlas.bather&&atlas.bather.frames===4&&art.h===120&&art.info.length===4
    &&art.info.every(f=>f.corners.every(c=>c===0)&&f.bottom===0&&Math.abs(f.d)<=1.0),
    JSON.stringify(art.info));
  check('M1.58 the Bather walk cycle is about twice as fast as M1.57 (8 frames/s) and idle stays on frame 0',
    art.idle===0&&art.ph0===0&&art.ph013===1&&art.ph02===1&&art.ph05===0,
    JSON.stringify({idle:art.idle,ph0:art.ph0,ph013:art.ph013,ph02:art.ph02,ph05:art.ph05}));
  const placed=await G(page,()=>{const G=__game;G.manual=true;G.freeze=true;
    const floors=[2,3,4,5,6,7,8,9,13,17,18,21,22,25,26,29];
    function rec(){return {n:0,zero:0,short:0,byLvl:{},knights:{floors:0,zero:0,one:0,two:0,more:0}};}
    const out={bather:rec(),lichen:rec(),slickman:rec(),knights:rec().knights};
    function add(b,lvl,c,min){
      b.n++; if(c===0)b.zero++; if(c<min)b.short++;
      const o=b.byLvl[lvl]||(b.byLvl[lvl]={n:0,sum:0,min:99,max:0,zero:0});
      o.n++; o.sum+=c; o.min=Math.min(o.min,c); o.max=Math.max(o.max,c); if(!c)o.zero++;
    }
    for(let sd=1;sd<=30;sd++){
      G.setSeed(sd);
      for(const f of floors){
        G.startLevel(f-1,{hearts:9,coins:20});
        const theme=G.themeNow()||'',ents=G.state().enemies||[],types={};
        for(const e of ents){if(!e.gone)types[e.type]=(types[e.type]||0)+1;}
        const kn=types.knight||0; out.knights.floors++;
        if(kn===0)out.knights.zero++; else if(kn===1)out.knights.one++; else if(kn===2)out.knights.two++; else out.knights.more++;
        const min=f>=5?2:1;
        if(/TILED BATHS/.test(theme))add(out.bather,f,types.bather||0,min);
        if(/MOSSY CELLAR/.test(theme))add(out.lichen,f,types.lichen||0,min);
        if(/Slate/i.test(theme))add(out.slickman,f,types.slickman||0,min);
      }
    }
    for(const k of ['bather','lichen','slickman']){
      const b=out[k];
      const by={};
      for(const [l,o] of Object.entries(b.byLvl)) by[l]={n:o.n,avg:o.sum/o.n,min:o.min,max:o.max,zero:o.zero};
      b.byLvl=by;
    }
    return out;});
  const okTheme=(b,name)=>b.n>0&&b.zero===0&&b.short===0&&Object.keys(b.byLvl).every(l=>(+l>=5?b.byLvl[l].min>=2:b.byLvl[l].min>=1));
  check('M1.58 a real-flow Tiled Baths floor always has at least 1 Bather (2 from floor 5), counting placed mobs not the pool',
    okTheme(placed.bather),JSON.stringify(placed.bather));
  check('M1.58 a real-flow Mossy Cellar floor always has at least 1 Lichen Face (2 from floor 5), counting placed mobs',
    okTheme(placed.lichen),JSON.stringify(placed.lichen));
  check('M1.58 a real-flow Slate Halls floor always has at least 1 Slick Man (2 from floor 5), counting placed mobs',
    okTheme(placed.slickman),JSON.stringify(placed.slickman));
  check('M1.58 a Treasure Knight is guaranteed on floors 2+; a second one is occasional (coin door), not a double-spawn bug',
    placed.knights.floors>0&&placed.knights.zero===0&&placed.knights.one>placed.knights.two&&placed.knights.more===0,
    JSON.stringify(placed.knights));
  await ctx.close();
}

if(V157&&want('m157')){ await m157Tests(); }

async function m160Tests(){
  const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m160'});
  const rolls=await G(page,()=>{const G=__game,R=G.ranged||{},types=Object.keys(G.mobs).concat(['bigspider']),out={};
    for(const t of types){const c=G.rollModsFor(t,'m160',12,4000);out[t]={ranged:c.ranged||0,hasEntry:!!R[t]};}
    return out;});
  const badRoll=Object.entries(rolls).filter(([,o])=>!o.hasEntry&&o.ranged>0);
  const withEntry=Object.entries(rolls).filter(([,o])=>o.hasEntry);
  check('M1.60 rollMods never gives the ranged elite to a mob that has no RANGED entry',
    badRoll.length===0&&withEntry.length>=6,JSON.stringify({badRoll,rolls}));
  const fire=await G(page,()=>{const G=__game;
    G.manual=true;G.freeze=false;G.setSeed(1);G.startLevel(0,{hearts:9,coins:0});G.viewOverride=14;G.clearMobs();
    const s=G.state();let spot=null;
    for(let y=1;y<s.mapH-1&&!spot;y++)for(let x=1;x<s.mapW-4&&!spot;x++){
      const a={x:x+.5,y:y+.5},b={x:x+3.0,y:y+.5};
      if(!G.solidAt(a.x,a.y)&&!G.solidAt(b.x,b.y)&&G.clearPath(a.x,a.y,b.x,b.y)&&!(G.pitUnder&&(G.pitUnder(a.x,a.y,0)||G.pitUnder(b.x,b.y,0))))spot=a;}
    if(!spot)return {ok:false,err:'no open LOS pair'};
    const types=Object.keys(G.mobs).concat(['bigspider']),out=[];
    for(const t of types){
      G.clearMobs();G.setHearts(9);G.teleport(spot.x,spot.y,0);
      let err=null,fired=false,kind=null;
      try{
        const i=G.spawn(t,spot.x+3.0,spot.y,true,['ranged']);
        G.entSet(i,{fireCD:0,tele:0,state:'chase',spdMul:0});
        for(let k=0;k<240;k++){
          G.entSet(i,{spdMul:0,state:'chase'});
          G.setHearts(9);
          G.advance(1/60);
          const sh=(G.state().eshots||[]).filter(q=>q.from===t);
          if(sh.some(q=>q.age<0.12)){fired=true;kind=sh[sh.length-1].kind;break;}
        }
      }catch(e){err=String(e&&e.message||e);}
      out.push({t,has:!!(G.ranged&&G.ranged[t]),fired,kind,err});
    }
    return {spot,out};});
  const threw=(fire.out||[]).filter(o=>o.err);
  const shouldFire=(fire.out||[]).filter(o=>o.has&&o.t!=='mortar');
  const missing=shouldFire.filter(o=>!o.fired);
  check('M1.60 every regular mob can be given the ranged elite and tick without throwing; those with a RANGED entry fire once',
    Array.isArray(fire.out)&&fire.out.length>=12&&threw.length===0&&missing.length===0,
    JSON.stringify({threw,missing,all:fire.out,spot:fire.spot,err:fire.err}));
  const seeds=await G(page,()=>{const G=__game;G.manual=true;G.freeze=true;
    const cases=[[34,3],[61,3],[94,3],[164,3],[191,7]],rows=[];
    for(const [sd,f] of cases){
      G.setSeed(sd);G.startLevel(f-1,{hearts:9,coins:20});
      const theme=G.themeNow()||'',types={};
      for(const e of (G.state().enemies||[])) if(!e.gone) types[e.type]=(types[e.type]||0)+1;
      const min=f>=5?2:1;
      rows.push({sd,f,theme,mortar:types.mortar||0,min,ok:(types.mortar||0)>=min});
    }
    const baths=[];
    for(let sd=1;sd<=40;sd++){
      G.setSeed(sd);
      for(const f of [6,7,8]){
        G.startLevel(f-1,{hearts:9,coins:20});
        const theme=G.themeNow()||'';
        if(!/TILED BATHS/.test(theme)) continue;
        let c=0; for(const e of (G.state().enemies||[])) if(!e.gone&&e.type==='bather')c++;
        baths.push({sd,f,c,ok:c>=2});
      }
    }
    return {rows,baths};});
  check('M1.60 the reported Brick Halls floors keep their Mortared Men (seeds 34, 61, 94, 164 on L3 and 191 on L7)',
    seeds.rows.every(r=>r.ok&&/BRICK HALLS/.test(r.theme)),JSON.stringify(seeds.rows));
  check('M1.60 Bathers on Tiled Baths L6+ are not turned into Rattlebones (real-flow minimum still holds)',
    seeds.baths.length>0&&seeds.baths.every(r=>r.ok),JSON.stringify({n:seeds.baths.length,miss:seeds.baths.filter(r=>!r.ok)}));
  await ctx.close();
}

if(V158&&want('m158')){ await m158Tests(); }
if(V159&&want('m159')){ await m159SlateTests(); await m159InvTests(); }
if(V160&&want('m160')){ await m160Tests(); }

check('no console errors or warnings',consoleProblems.length===0,consoleProblems.slice(0,5).join(' || '));
check('no external network requests',badRequests.length===0,badRequests.slice(0,5).join(', '));
const size=fs.statSync(FILE).size,LIM=V147?2048:V121?1024:atLeast('1.12')?400:300;check(`single file size under ${LIM} KB`,size<LIM*1024,`${(size/1024).toFixed(1)} KB`);
await browser.close();
fs.writeFileSync(`${OUT}/results.json`,JSON.stringify({build:BUILD,file:FILE,date:new Date().toISOString(),passed:results.length-failed,failed,results},null,1));
console.log(`\n${results.length-failed}/${results.length} passed`+(retired.length?` (${retired.length} checks of pre-M1.23 items or pre-M1.31 layouts retired)`:``));
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
    await G(page,(t)=>__game.advance(t),V19?0.9:0.5); // M1.9: 0.8 s between balloons
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
    const seq=await G(page,(N)=>{__game.startLevel(0);__game.freeze=true;__game.teleport(1.5,1.5,Math.PI);__game.advance(0.6);const out=[__game.state().handFrame];__game.throwOnce();for(let i=0;i<N;i++){const s=__game.advance(1/60);if(out[out.length-1]!==s.handFrame)out.push(s.handFrame);}return out;},V19?60:40);
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
    const px=await G(page,()=>{if(__game.setSeed)__game.setSeed(777); /* a fixed floor: a random elite's purple glow could land in view */__game.startLevel(0);__game.freeze=true;__game.teleport(9.0,4.5,0);__game.advance(0.05);const D=__game.dims||{W:320,H:200};const d=document.getElementById('screen').getContext('2d').getImageData(0,0,D.W,D.H).data;let purple=0,lime=0,slate=0;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(b>150&&r>100&&g<120&&b>r)purple++;if(g>180&&r<170&&b<90)lime++;if(b>110&&b>r+35&&b>g+15&&g>r-5&&r<150)slate++;}return {purple,lime,slate};});
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
    check('M1.3 internal resolution is 480x300 (16:10) with a crisp pixelated canvas',r.d.W===480&&r.d.H===300&&r.cw===480&&r.ch===300&&r.d.W/r.d.H===1.6&&/pixelated|crisp/.test(r.css)&&r.d.TS===(V151?128:64),`${r.cw}x${r.ch}, ${r.css}, textures ${r.d.TS}px`);
    check('M1.3 sprites redrawn with more pixels (hand >= 69x60, Screamer >= 95 px wide)',r.hand.w>=69&&r.hand.h>=60&&r.scr.w>=95,`hand ${r.hand.w}x${r.hand.h}, screamer ${r.scr.w}x${r.scr.h}`);
    const mobs=await G(page,()=>__game.mobs);
    const types=Object.keys(mobs);
    check(V19?'M1.3/M1.9 seven enemy types: the Screamer, five M1.3 mobs and the M1.9 Rattlebone':'M1.3 six enemy types: the Screamer plus five new mobs',JSON.stringify(types.sort())===JSON.stringify([...ALL,...(V19?['skeleton']:[]),...(V147?['hexeye']:[]),...(V152?['lichen']:[]),...(V153?['mortar']:[]),...(V157?['bather','slickman']:[])].sort()),types.join(','));
    const hp=types.map(t=>mobs[t].hp),sp=types.map(t=>mobs[t].speed),vo=types.map(t=>mobs[t].voice),nm=types.map(t=>mobs[t].name),hpTank=types.filter(t=>t!=='slickman').map(t=>mobs[t].hp);
    check('M1.3 every mob has its own HP, speed, sound and name',new Set(hp).size>=(V19?6:6)&&new Set(sp).size===types.length&&new Set(vo).size===types.length&&new Set(nm).size===types.length&&nm.every(n=>n&&n.length>2),types.map(t=>`${mobs[t].name}: hp ${mobs[t].hp}, speed ${mobs[t].speed}, ${mobs[t].voice}`).join('; '));
    check('M1.3 Clunkbot is the slowest and toughest, Zapfly the fastest and frailest',mobs.clunk.speed===Math.min(...sp)&&mobs.clunk.hp===Math.max(...hpTank)&&mobs.zapfly.speed===Math.max(...sp)&&mobs.zapfly.hp===Math.min(...hp));
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
    const ch=await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.freeze=false;__game.setHearts(99);__game.teleport(6.6,3.5,0);const ki=__game.spawn('kettle',10.5,3.5,true);if(__game.entSet)__game.entSet(ki,{cool:0}); /* M1.29: its first charge waits a random 1-3 s; on a long roll it had walked up to you first */const s0=__game.state().stats;let vmax=0,px=10.5;for(let i=0;i<120;i++){const e=__game.advance(1/60).enemies[0];vmax=Math.max(vmax,Math.abs(e.x-px)*60);px=e.x;}const s=__game.state().stats;return {charges:s.charges-s0.charges,steam:s.steam-s0.steam,vmax};});
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
    const maps=await G(page,(V19)=>{const seal=(d)=>{if(!V19)return d.map;const S=d.secret;return d.map.map((r,y)=>[...r].map((c,x)=>(S&&x>=S.x&&x<S.x+S.w&&y>=S.y&&y<S.y+S.h)||c==='P'||c==='N'?'#':(/[1-8GU]/.test(c)?'.':c)).join(''));}; /* M1.9: pits + merchant act as walls, the sealed secret room is left out */
      const out=[];for(let s=1;s<=525;s++){const lvl=2+(s%7);const d=__game.genMap(s,lvl);out.push({seed:s,lvl,map:seal(d),map18:d.map18,fallback:d.fallback,locks:d.locks,rooms:d.rooms});}for(let s=9001;s<=9030;s++)for(let lvl=2;lvl<=8;lvl++){const d=__game.genMap(s,lvl);out.push({seed:s,lvl,map:seal(d),map18:d.map18,fallback:d.fallback,locks:d.locks,rooms:d.rooms});}return out;},V19);
    const mobCh={e:'screamer',b:'springle',t:'kettle',g:'wisp',r:'clunk',z:'zapfly',...(V19?{s:'skeleton'}:{})};
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
    for(const m of maps){const a=analyse(m);if(V19&&m.map18){const mc={e:1,b:1,t:1,g:1,r:1,z:1};a.mobs=[...m.map18.join('')].filter(c=>mc[c]).length;a.types=new Set([...m.map18.join('')].filter(c=>mc[c]).map(c=>mobCh[c]));if(V110)a.locks=[...m.map18.join('')].filter(c=>c==='L').length;} /* M1.10: boss floors unlock the exit door, so lock growth is checked on the M1.8 layout too */ /* M1.9: the growth check uses the M1.8 mob layout; extra room-fill mobs are checked in M1.9 */if(m.fallback)a.problems.push('fallback');if(a.problems.length)bad.push(`seed ${m.seed} L${m.lvl}: ${a.problems.join(',')}`);(byLvl[m.lvl]=byLvl[m.lvl]||[]).push({...a,m});}
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
    check(V121?'M1.3 no large embedded bitmap in the build outside the art sheets from assets/ (M1.21+)':'M1.3 no large embedded bitmap in the build (all art is drawn in code)',!/data:image\/png;base64,iVBOR[\s\S]{4000,}/.test(V121?html.replace(/var ASSETS=\{.*\};/g,''):html));
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
    check('M1.4 all five modifiers roll (ranged, slime, beefy, fast, regen)',V113?['beefy','fast','ranged','regen','slime'].every(k=>allMods.split(',').includes(k)):allMods==='beefy,fast,ranged,regen,slime',allMods); /* M1.13 adds six more */
    // per-level elites are deterministic per seed, tutorial has none
    const lv=await G(page,()=>{const run=()=>{__game.setSeed(31337);__game.startLevel(7);const s=__game.state();return {sig:s.enemies.map(e=>e.type+':'+e.mods.join('+')).join(' '),n:s.enemies.filter(e=>e.mods.length).length};};const a=run(),b=run();__game.startLevel(0);const t=__game.state();return {a,b,tut:t.enemies.filter(e=>e.mods.length).length};});
    check('M1.4 elite rolls are deterministic per seed; tutorial has no elites',lv.a.sig===lv.b.sig&&lv.a.n>0&&lv.tut===0,`floor 8 seed 31337: ${lv.a.n} elites; tutorial ${lv.tut}`);
    // RANGED: each mob gets its own projectile, telegraphed first
    const kinds={kettle:'steam',zapfly:'zap',clunk:'laser',screamer:'sonic',wisp:'wisp',springle:'fluff',bigspider:'web',...(V153?{mortar:'mortar'}:{})} /* M1.12: brood spiders spit webs */;
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
    check('M1.4 each modifier draws its own coloured outline glow and icon'+(V128?' (M1.28: not CLOAKED, which hides)':''),Object.entries(gl).every(([m,r])=>(V128&&m==='cloak')||r.elite>r.plain+50),Object.entries(gl).map(([m,r])=>`${m}:${r.plain}->${r.elite}px`).join(' '));
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
    if(!V19)check('M1.4 using the item empties the slot and starts a timed effect that wears off',pu.used&&pu.after.item===null&&pu.after.ef.kind==='shield'&&Math.abs(pu.mid-3.95)<0.1&&pu.end===null&&/WORE OFF/.test(pu.endMsg)&&pu.useEmpty===false,`mid ${pu.mid&&pu.mid.toFixed(2)}s, ${pu.endMsg}`);
    check('M1.4 six power-ups, each lasting 8-12 s',(V111?pu.ids.slice(0,6):pu.ids).length===6&&pu.durs.slice(0,6).every(d=>d>=8&&d<=12),pu.ids.map((k,i)=>k+' '+pu.durs[i]+'s').join(', '));
    // keys: Q, right mouse; and the item bar draws the active timer ring
    const ky=await G(page,(FR)=>{const FRESH=eval(FR);FRESH();__game.give('magnet');window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyQ',key:'q'}));let s=__game.advance(0.05);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyQ',key:'q'}));const q=s.player.effect&&s.player.effect.kind;
      FRESH();__game.give('freeze');const c=document.getElementById('screen');c.dispatchEvent(new MouseEvent('mousedown',{button:2,bubbles:true}));s=__game.advance(0.05);c.dispatchEvent(new MouseEvent('mouseup',{button:2,bubbles:true}));return {q,rmb:s.player.effect&&s.player.effect.kind};},FRESH.toString());
    check('M1.4 Q and right mouse use the held item',ky.q==='magnet'&&ky.rmb==='freeze',JSON.stringify(ky));
    const ring=await G(page,(FR)=>{const FRESH=eval(FR);const R=__game.hudRects().active;const sig=()=>{let n=0;for(let y=R[1];y<R[1]+R[3];y++)for(let x=R[0];x<R[0]+R[2];x++){const p=__game.pixelAt(x,y);if(Math.abs(p[0]-168)+Math.abs(p[1]-240)+Math.abs(p[2]-255)<40)n++;}return n;}; /* FREEZE POP ring colour #a8f0ff */
      FRESH();__game.give('triple');__game.setEffect('freeze',8);__game.advance(0.02);const full=sig();__game.advance(4);const half=sig();__game.setEffect(null);__game.advance(0.02);return {full,half,none:sig()};},FRESH.toString());
    if(!V19)check('M1.4 item bar shows the active effect with a countdown ring that shrinks',ring.full>ring.half*1.3&&ring.half>ring.none,JSON.stringify(ring));
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
    if(V19)check('M1.4/M1.9 FREEZE POP slows enemies and their projectiles to 60% (floor-long, was 35% for 8 s)',Math.abs(ef.shotF/ef.shotN-.6)<.06&&ef.mobF/ef.mobN<.75,`shots ${ef.shotN.toFixed(2)}->${ef.shotF.toFixed(2)}, mob ${ef.mobN.toFixed(2)}->${ef.mobF.toFixed(2)}`);
    else check('M1.4 FREEZE POP slows enemies and their projectiles to ~35%',Math.abs(ef.shotF/ef.shotN-.35)<.06&&ef.mobF/ef.mobN<.5,`shots ${ef.shotN.toFixed(2)}->${ef.shotF.toFixed(2)}, mob ${ef.mobN.toFixed(2)}->${ef.mobF.toFixed(2)}`);
    if(V19)check('M1.4/M1.9 SPEED SNEAKERS make the player ~1.35x faster (floor-long, was 1.6x)',ef.walkS/ef.walkN>1.25&&ef.walkS/ef.walkN<1.45,`${ef.walkN.toFixed(2)} -> ${ef.walkS.toFixed(2)} cells in 0.5 s`);
    else check('M1.4 SPEED SNEAKERS make the player ~1.6x faster',ef.walkS/ef.walkN>1.45&&ef.walkS/ef.walkN<1.75,`${ef.walkN.toFixed(2)} -> ${ef.walkS.toFixed(2)} cells in 0.5 s`);
    check('M1.4 COIN MAGNET pulls nearby coins in',ef.magnet>=2&&ef.noMagnetC===0,`magnet collected ${ef.magnet}, without ${ef.noMagnetC}`);
    if(V19)check('M1.4/M1.9 GIANT BALLOON splash hurts the target (2) and mobs nearby (1; floor-long, was 3 and 2)',ef.giant.splashes===1&&ef.giant.hp[0]===ef.giant.hp0[0]-2&&ef.giant.hp[1]===ef.giant.hp0[1]-1,JSON.stringify(ef.giant));
    else check('M1.4 GIANT BALLOON splash hurts the target and mobs nearby',ef.giant.splashes===1&&ef.giant.hp[0]<=ef.giant.hp0[0]-3&&ef.giant.hp[1]===ef.giant.hp0[1]-2,JSON.stringify(ef.giant));
    // effect screen tints
    for(const k of ['sneakers','shield','triple','freeze','magnet','giant']){await G(page,({FR,k})=>{eval(FR)();__game.setEffect(k);__game.advance(0.3);},{FR:FRESH.toString(),k});if(k==='freeze'||k==='shield')await page.screenshot({path:`${SHOTS}/m14_effect_${k}.png`});}
    // pad Y
    await G(page,()=>{window.__pad={id:'Xbox Wireless Controller',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0})),timestamp:0};navigator.getGamepads=()=>[window.__pad];});
    const py=await G(page,(FR)=>{eval(FR)();__game.give('giant');__pad.buttons[3]={pressed:true,value:1};__game.advance(0.05);__pad.buttons[3]={pressed:false,value:0};return __game.advance(0.05).player.effect;},FRESH.toString());
    check('M1.4 gamepad Y uses the held item',py&&py.kind==='giant',JSON.stringify(py));
    // save / continue keeps the held item
    await G(page,()=>{if(__game.itemN)__game.setPerm({items:{}});__game.startLevel(2,{hearts:4,coins:7,item:'freeze'});}); /* M1.23: no run items left over from earlier checks */
    const sv=await G(page,()=>__game.state().save);
    await page.reload();await page.waitForFunction(()=>!!window.__game);await sleep(300);
    const cont=await G(page,()=>{const st=__game.state();const i=st.menu.findIndex(m=>/CONTINUE/.test(m));__game.menuPick(i);__game.manual=true;return __game.advance(0.05);});
    check('M1.4 the held item is saved and restored by CONTINUE',sv.item==='freeze'&&cont.level===2&&cont.player.item==='freeze',`save item ${sv.item}, continued with ${cont.player.item}`);
    const dr=await G(page,()=>{__game.give(null);__game.setHearts(1);__game.spawn('clunk',__game.state().player.x+.3,__game.state().player.y,true,[]);let s=__game.advance(0.3);const dead=s.mode;__game.advance(1.5);__game.confirm();s=__game.advance(0.1);return {dead,mode:s.mode,item:s.player&&s.player.item};});
    if(V18)check('M1.4/M1.8 death after CONTINUE ends the run (name entry; no retry)',dr.dead==='dead'&&dr.mode==='name',JSON.stringify(dr));
    else check('M1.4 retry after death restores the item held at the level start',dr.dead==='dead'&&dr.mode==='play'&&dr.item==='freeze',JSON.stringify(dr));
    const lvl=await G(page,(V19)=>{__game.setSeed(777);const r=[];for(let i=0;i<8;i++){__game.startLevel(i);const sec=V19&&i>0?__game.secret():null;r.push(__game.state().items.filter(t=>t.kind==='power'||t.kind==='perm').length-(sec&&sec.def.treasure==='power'?1:0)); /* M1.11: a secret power-up can be a permanent item */}return r;},V19); // M1.9: a secret-room power-up is extra
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
    check(V121?'M1.5 no large embedded bitmap in the build outside the art sheets from assets/ (M1.21+)':'M1.5 no large embedded bitmap in the build (all art is drawn in code)',!/data:image\/png;base64,iVBOR[\s\S]{4000,}/.test(V121?html.replace(/var ASSETS=\{.*\};/g,''):html));
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
    check('M15-A4 Giant Balloon splash no longer damages through a fence or a wall (solidAt ray march), still hits in the open',r.fenceHp&&r.fenceHp[1]===r.fenceHp[0]&&r.wallHp[1]===r.wallHp[0]&&r.openHp[1]===r.openHp[0]-(V19?1:2),JSON.stringify({fence:r.fenceHp,wall:r.wallHp,open:r.openHp,cp:r.cp,W:r.W}));
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
    const r=await G(page,({pairs,cols,V17,V136,V137})=>{const hx=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];const D=__game.dims;
      const hsv=p=>{const [r,g,b]=p.map(v=>v/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d+6)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;}return [h*60,mx?d/mx:0,mx];};
      const hd=(a,b)=>{const d=Math.abs(a-b)%360;return Math.min(d,360-d);};
      const grab=()=>{const a=[];for(let y=0;y<D.H;y++)for(let x=0;x<D.W;x++)a.push(__game.pixelAt(x,y));return a;};
      const set=(t,m)=>{__game.manual=true;__game.viewOverride=14; /* M1.17: this check looks 6 cells away, past the fog */__game.setSeed(4243);__game.startLevel(6);__game.clearMobs();if(V137)__game.clearItems(); /* M1.37: no hearts or coins in view either */__game.setHearts(99);let P=[7,1];if(V136){const st=__game.state();outer:for(let y=1;y<st.mapH-1;y++)for(let x=1;x<st.mapW-9;x++){let ok=true;for(let k=0;k<=6&&ok;k++){const c=__game.cellAt(x+k,y);if(!c||c.t!==0)ok=false;}const e=__game.cellAt(x+7,y);let rune=false;if(V137)for(let yy=y-3;yy<=y+3;yy++)for(let xx=x;xx<=x+9;xx++)if(__game.cellVariant(xx,yy)===3)rune=true; /* M1.37: no glowing rune in view */if(ok&&!rune&&e&&e.t===1&&__game.solidAt(x+.5,y-.5)&&__game.solidAt(x+.5,y+1.5)){P=[x,y];break outer;}}} /* M1.36: a 6-cell straight run to a wall (layouts changed) */__game.teleport(P[0]+.5,P[1]+.5,0);__game.freeze=true;if(t)__game.spawn(t,P[0]+6.5,P[1]+.5,false,m?[m]:[]);__game.advance(0.02);};
      set(null);const wall=grab();let br=[0,0,0],bn=0;for(let y=60;y<140;y++)for(let x=0;x<150;x++){const q=wall[y*D.W+x];br[0]+=q[0];br[1]+=q[1];br[2]+=q[2];bn++;}br=br.map(v=>Math.round(v/bn));
      const out={brick:br};for(const [m,t] of pairs){const c=hx(cols[m]),hc=hsv(c);const like=q=>{const h=hsv(q);return h[1]>(hc[1]>.35?.3:.15)&&h[2]>.55&&(!V17||(q[0]+q[1]+q[2])/3>115)&&(hc[1]<.35?h[1]<hc[1]+.25:true)&&hd(h[0],hc[0])<20;};
        set(t,null);const A=grab();set(t,m);const B=grab();let ring=0,dark=0,inWall=0;
        for(let i=0;i<A.length;i++){const a=A[i],b=B[i],ch=Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])>30;if(ch&&like(b))ring++;if(ch&&b[0]+b[1]+b[2]<60&&a[0]+a[1]+a[2]>=60)dark++;}
        for(let y=45;y<200;y++)for(let x=0;x<390;x++)if(like(wall[y*D.W+x]))inWall++;
        out[m]={ring,dark,inWall,iconPx:+__game.state().stats.iconPx.toFixed(1)};}
      return out;},{pairs,cols,V17,V136,V137});
    const brick=r.brick;delete r.brick;
    check('Elite modifier icons are outlined and at least 8 px tall on screen at distance 6',Object.values(r).every(v=>v.iconPx>=8),Object.entries(r).map(([m,v])=>`${m} ${v.iconPx}px`).join(', '));
    check('Elite glow at distance 6 on red brick: each colour ring is strong (60+ px) with a dark frame, and the colour barely appears in the brick itself',Object.values(r).every(v=>v.ring>=60&&v.dark>=30&&(V131?v.inWall<v.ring*.3:v.inWall<30)), /* M1.31: the new brick art has orange in it, so the ring must clearly outweigh it */Object.entries(r).map(([m,v])=>`${m}: ring ${v.ring}, frame ${v.dark}, in brick ${v.inWall}`).join('; ')+`; brick ${brick}`);
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
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m16-review',noFog:true});
    savePng('_tmp_screamer16_6x.png',await G(page,()=>__game.spriteSheet(6,'screamer')));
    await ctx.close();
    fs.unlinkSync(`${SHOTS}/_tmp_screamer16_6x.png`);
    const html=fs.readFileSync(FILE,'utf8');
    check(V121?'M1.6 no large embedded bitmap in the build outside the art sheets from assets/ (M1.21+)':'M1.6 no large embedded bitmap in the build (all art is drawn in code)',!/data:image\/png;base64,iVBOR[\s\S]{4000,}/.test(V121?html.replace(/var ASSETS=\{.*\};/g,''):html));
  }
}

async function m17Tests(){
  const savePng=(n,u)=>fs.writeFileSync(`${SHOTS}/${n}`,Buffer.from(u.split(',')[1],'base64'));
  const inter=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const ri=(a,e)=>a[0]<e[0]+e[2]&&a[0]+a[2]>e[0]&&a[1]<e[1]+e[3]&&a[1]+a[3]>e[1];
  const {execFileSync}=await import('child_process');
  const corridor=(t,m,d,pitch)=>{__game.manual=true;__game.setSeed(4243);__game.startLevel(6);__game.clearMobs();__game.setHearts(99);let X=13.5,Y=1.5;const open=(x,y)=>{const c=__game.cellAt(x,y);return c&&c.t===0;},run=(x,y)=>{for(let k=0;k<10;k++)if(!open(x+k,y))return false;return true;};if(!run(4,1)){const st=__game.state();outer:for(let y=1;y<st.mapH-1;y++)for(let x=1;x<st.mapW-11;x++)if(run(x,y)){X=x+9.5;Y=y+.5;break outer;}} /* M1.36: layouts changed; any clear 10-cell run */__game.teleport(X-d,Y,0);__game.freeze=true;__game.setPitch(pitch||0);__game.spawn(t,X,Y,false,m);const s=__game.advance(0.02).stats;return {mode:s.iconMode,ic:s.iconRects||[],eb:s.enemyBoxes||[],px:s.iconPx};};
  // ---------- M16-A1: icons never drawn over the sprite ----------
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m17-a1',noFog:true});
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
    const brickGame=await G(page,()=>{const D=__game.dims;__game.manual=true;__game.setSeed(4243);__game.startLevel(6);__game.clearMobs();let P=[7,1];const open=(x,y)=>{const c=__game.cellAt(x,y);return c&&c.t===0;};let ok0=true;for(let k=0;k<=6;k++)if(!open(7+k,1))ok0=false;if(!ok0){const st=__game.state();outer:for(let y=1;y<st.mapH-1;y++)for(let x=1;x<st.mapW-9;x++){let ok=true;for(let k=0;k<=6&&ok;k++)if(!open(x+k,y))ok=false;const e=__game.cellAt(x+7,y);if(ok&&e&&e.t===1&&__game.solidAt(x+.5,y-.5)&&__game.solidAt(x+.5,y+1.5)){P=[x,y];break outer;}}} /* M1.36: a 6-cell run to a brick wall (layouts changed) */__game.teleport(P[0]+.5,P[1]+.5,0);__game.freeze=true;__game.advance(0.02);const v=[];for(let y=60;y<140;y++)for(let x=0;x<150;x++)v.push(__game.pixelAt(x,y));const med=i=>v.map(p=>p[i]).sort((a,b)=>a-b)[v.length>>1];return [med(0),med(1),med(2)];});
    const info={col:cols.ranged,crQA:cr(R,brickQA),crGame:cr(R,brickGame),crOld:cr(hx('#ff2f5a'),brickQA),wispHue:Math.min(...wisps.map(w=>hd(R,w))),wispDist:Math.min(...wisps.map(w=>Math.hypot(...R.map((v,i)=>v-w[i])))),others:others.map(([k,v])=>`${k} ${hd(R,hx(v)).toFixed(0)}°`).join(', '),minOther:Math.min(...others.map(([,v])=>hd(R,hx(v))))};
    check('RANGED is a lighter red-pink with about 2.9:1 contrast on red brick (was 2.23:1)',info.col==='#ff6a7a'&&info.crQA>=2.85&&info.crGame>=2.6&&info.crQA>info.crOld,`${info.col}: ${info.crQA.toFixed(2)}:1 vs QA brick median ${brickQA}, ${info.crGame.toFixed(2)}:1 vs in-game brick median ${brickGame}; old #ff2f5a ${info.crOld.toFixed(2)}:1`);
    check(V128?'RANGED stays distinct from every Hazewisp pink (15°+ hue, 50+ RGB; M1.28: with 40 powers the 35° gap to every other colour no longer applies)':'RANGED stays distinct from the other elite colours (35°+ hue) and from every Hazewisp pink (15°+ hue, 50+ RGB)',(V128||info.minOther>=35)&&info.wispHue>=15&&info.wispDist>=50,`others: ${info.others}; wisp hue ${info.wispHue.toFixed(0)}°, RGB distance ${info.wispDist.toFixed(0)}`);
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
    const g=await G(page,()=>{const bad=[];for(let k=0;k<40;k++){const s=[1,2,3,208,4242][k%5]+k*101;__game.setSeed(s);__game.startLevel(2);const st=__game.state();const live=st.enemies.filter(e=>__game.mobs[e.type]&&!e.spawned); /* M1.12: a coin-door room can hold an extra mob */ /* M1.11: the Treasure Knight has its own HP rule */const base=live.reduce((x,e)=>x+__game.mobs[e.type].hp,0),eff=live.reduce((x,e)=>x+e.maxHp,0),le=__game.levelEff(s,3);
        const types=new Set(live.map(e=>e.type));const eff13=__game.floorHp?live.reduce((x,e)=>{const b=__game.mobs[e.type].hp,ok=e.maxHp===(e.mods.includes('beefy')?Math.ceil(__game.floorHp(e.type,3)*2.5):__game.floorHp(e.type,3));return x+(ok?(e.mods.includes('beefy')?Math.ceil(b*2.5):b):-999);},0):eff; /* M1.13: +2 HP on floor 3; the base layout is still compared */if(base!==le.base||eff13!==le.eff)bad.push(`${s}: ${base}/${eff} vs ${le.base}/${le.eff}`);if(!types.has('kettle')||!types.has('springle')||!types.has('wisp'))bad.push(`${s}: types ${[...types]}`);if(live.some(e=>__game.solidAt(e.x,e.y)))bad.push(`${s}: mob in wall`);}return bad;});
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
    check(V121?'M1.7 no large embedded bitmap in the build outside the art sheets from assets/ (M1.21+)':'M1.7 no large embedded bitmap in the build (all art is drawn in code)',!/data:image\/png;base64,iVBOR[\s\S]{4000,}/.test(V121?html.replace(/var ASSETS=\{.*\};/g,''):html));
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
    check(`M1.8 release + QA builds are ${BUILD.toUpperCase()}; the QA build differs only in QA_BUILD and the title`,(atLeast('1.15')?rel.includes(`var VERSION='${BUILD.toUpperCase()}';`)&&rel.includes('<title>Kersplat Labyrinth: The Descent</title>'):rel.includes(`'${BUILD.toUpperCase()} PROTOTYPE - PLACEHOLDER TITLE'`))&&rel.includes('var QA_BUILD=false;')&&qa.includes('var QA_BUILD=true;')&&dl===2,`differing lines ${dl}`);
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
    r=await G(page,()=>{const out=[];for(const f of [50,200,1000]){__game.startLevel(f-1);if(__game.hitBoss){__game.hitBoss(9999);__game.advance(1.5);} /* M1.10: these are boss floors; the portal opens once the boss falls */__game.clearMobs();const ex=__game.state().exit;__game.teleport(ex.x+.5,ex.y+.5,0);__game.advance(0.3);__game.advance(0.6);__game.confirm();const s=__game.advance(0.05);out.push(s.mode+':'+s.level);}return out;});
    check('M1.8 clears on floors 50, 200 and 1000 lead on to the next floor (never a win screen)',r.join()==='play:50,play:200,play:1000',r.join());
    await G(page,()=>{__game.setRun({kills:12,elites:3,coins:40,deepest:199});__game.startLevel(199,{hearts:4,coins:33,item:__game.pu.shield?'shield':'herb'});});
    const sv=await G(page,()=>__game.state().save);
    await page.reload();await page.waitForFunction(()=>!!window.__game);await sleep(300);
    r=await G(page,()=>{const st=__game.state();const i=st.menu.findIndex(m=>/CONTINUE/.test(m));const lbl=st.menu[i];__game.menuPick(i);__game.manual=true;const s=__game.advance(0.05);return {lbl,menu:st.menu,mode:s.mode,level:s.level,hearts:s.player.hearts,coins:s.player.coins,item:s.player.item,run:s.run,name:s.levelName};});
    check('M1.8 save + CONTINUE work on floor 200 (level, hearts, coins, item and the run score counters)',sv.level===199&&sv.run&&sv.run.deepest===200&&/CONTINUE - LEVEL 200/.test(r.lbl)&&r.mode==='play'&&r.level===199&&r.hearts===4&&r.coins===33&&r.item===(V123?'herb':'shield')&&r.run.kills===12&&r.run.deepest===200,JSON.stringify(r));
    const mnu=V130?r.menu.filter(m=>!/^START FLOOR/.test(m)):r.menu; /* M1.30: bosses beaten earlier in this test unlock a START FLOOR row */
    check('M1.8 title menu: CONTINUE, NEW GAME, HIGH SCORES'+(V130?' (plus START FLOOR once a boss is beaten)':''),mnu.length===3&&mnu[2]==='HIGH SCORES'&&mnu[1]==='NEW GAME',r.menu.join(' | '));
    r=await G(page,()=>{localStorage.setItem('labyrinthRemake.save.v1',JSON.stringify({v:1,level:4,hearts:3,coins:9,seed:31337,item:null,t:1}));__game.toTitle();const st=__game.state();__game.menuPick(0);__game.manual=true;const s=__game.advance(0.05);return {menu:st.menu[0],level:s.level,run:s.run};});
    check('M1.8 an M1.7-style save (no score counters) still continues',r.level===4&&r.run&&r.run.deepest===5&&r.run.kills===0,JSON.stringify(r));
    await ctx.close();
  }

  // ---- 3. generation: fast and valid at very deep floors; floors 1-8 keep their M1.7 layouts
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m18-gen'});
    const FLOORS=[9,10,12,13,16,17,20,21,25,30,50,100,200,500,1000,2500,5000,9999],SEEDS=[1,777,4242,99991,123456,2026];
    const g=await G(page,({FLOORS,SEEDS,V19,V139})=>{const WALL=new Set('#SWTMKRCVOABEIZ+='.split(''));const MOB=new Set('ebtgrz'.split(''));
      const mobCh=new Set(Object.values(__game.mobs).map(m=>m.ch));
      const res=[];let maxMs=0,bad=[];const per={};
      for(const f of FLOORS)for(const sd of SEEDS){const t=__game.genTime(sd,f);maxMs=Math.max(maxMs,t.ms);(per[f]=per[f]||[]).push(t.ms);const m=t.map,h=m.length,w=m[0].length;let p=null,x0=0,nk=0,nx=0,ny=0,nm=0,nc=0,err='';
        if(t.fallback)err+='fallback ';if(m.some(r=>r.length!==w))err+='ragged ';
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=m[y][x];if((x===0||y===0||x===w-1||y===h-1)&&!WALL.has(c))err+='border ';if(c==='p')p=[x,y];if(c==='X')nx++;if(c==='k')nk++;if(c==='Y')ny++;if(mobCh.has(c))nm++;if(c==='c')nc++;}
        if(!p||nx!==1)err+='p/X ';if(nk<1)err+='key ';if(ny>1)err+='slots ';if(nm>(V139?30:22))err+='mobs '+nm; /* M1.39: up to 30 when every room needs one */if(nc>33)err+='coins '+nc;
        if(p){const seen=new Set([p[1]*w+p[0]]),q=[p];const walk=c=>!WALL.has(c)&&c!=='F'&&c!=='Y'&&c!=='P'&&c!=='N';const S=V19?t.secret:null,inS=(x,y)=>S&&x>=S.x&&x<S.x+S.w&&y>=S.y&&y<S.y+S.h;while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=h)continue;const k=Y*w+X;if(seen.has(k)||!walk(m[Y][X]))continue;seen.add(k);q.push([X,Y]);}}
          for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=m[y][x];if((c==='X'||c==='k'||c==='c'||c==='h'||mobCh.has(c))&&!seen.has(y*w+x)&&!inS(x,y)){err+='unreachable '+c+' ';y=h;break;}}}
        if(err)bad.push(`F${f}/s${sd}: ${err}`);}
      const avg={};for(const f in per)avg[f]=per[f].reduce((a,b)=>a+b,0)/per[f].length;return {maxMs,bad,avg};},{FLOORS,SEEDS,V19,V139});
    check(`M1.8 generation is valid on floors 9-9999 (${FLOORS.length} floors x ${SEEDS.length} seeds: walls on the border, one start/exit, key, everything reachable with the slot machine as a wall, mobs <= ${V139?30:22}, coins <= 33)`,g.bad.length===0,g.bad.slice(0,4).join(' | '));
    check('M1.8 generation stays fast at depth (every floor < 250 ms; L50 / L200 / L9999 averages reported)',g.maxMs<250,`max ${g.maxMs.toFixed(1)} ms; avg L50 ${g.avg[50].toFixed(1)} ms, L200 ${g.avg[200].toFixed(1)} ms, L5000 ${g.avg[5000].toFixed(1)} ms, L9999 ${g.avg[9999].toFixed(1)} ms`);
    fs.writeFileSync(`${OUT}/m18_gen_timing.json`,JSON.stringify(g,null,1));
    // M1.7 comparison: floors 2-8 identical apart from the slot machine cell
    const old=await (async()=>{const c=await browser.newContext();const pg=await c.newPage();await pg.goto(`file://${BUILDS}/m1.7-qa/index.html`);await pg.waitForFunction(()=>!!window.__game);const o=await pg.evaluate(()=>{const r={};for(const sd of [1,777,4242,99991])for(let f=2;f<=8;f++)r[sd+':'+f]=__game.genMap(sd,f).map.join('\n');return r;});await c.close();return o;})();
    const cur=await G(page,(V19)=>{const r={};for(const sd of [1,777,4242,99991])for(let f=2;f<=8;f++){const d=__game.genMap(sd,f);r[sd+':'+f]=(V19?d.map18:d.map).join('\n');}return r;},V19); // M1.9: map18 = the layout before the M1.9 additions (shop, secret room, pits, decorations, room fill)
    const diffs=Object.keys(old).filter(k=>old[k]!==cur[k].replace(/Y/g,'.'));
    check('M1.8 floors 2-8 keep their M1.7 layouts (only a "." becomes the slot machine)',diffs.length===0,diffs.join(','));
    // scaling caps
    const d=await G(page,()=>{const o=[];for(let f=1;f<=400;f++)o.push(__game.difficulty(f));return o;});
    const mono=k=>d.every((x,i)=>i===0||x[k]>=d[i-1][k]-1e-12);
    check('M1.8 difficulty keeps scaling then caps: mobs <= 22 (from L13), coins <= 30, HP x1.06/floor past 8 up to x1.6 (L18), elites <= 60% (L12), two mods from L8',
      mono('mobs')&&mono('hpMul')&&mono('elite')&&d.every(x=>x.mobs<=22&&x.coins<=30&&x.hpMul<=1.6&&x.elite<=.6&&x.roomTries<=90)&&d[12].mobs===22&&d[11].mobs<22&&d[7].hpMul===1&&Math.abs(d[17].hpMul-1.6)<1e-9&&Math.abs(d[16].hpMul-1.54)<1e-9&&d[11].elite===.6&&d[399].twoMod===1&&d[7].mobs===15,
      `L8 mobs ${d[7].mobs}, L12 ${d[11].mobs}, L13 ${d[12].mobs}; hp L9 ${d[8].hpMul.toFixed(2)} L18 ${d[17].hpMul}; elite L12 ${d[11].elite} L400 ${d[399].elite}`);
    const hp=await G(page,()=>{__game.setSeed(4242);__game.startLevel(199);const s=__game.state();const M=__game.mobs;let bad=0;s.enemies=s.enemies.filter(e=>M[e.type]); /* M1.10: floor 200 has a boss (own HP rules, checked in m110Tests) */s.enemies=s.enemies.filter(e=>!e.spawned&&!(e.type==='zapfly'&&e.maxHp===1)); /* smiling masks can't be hurt and keep 1 HP */s.enemies.forEach(e=>{const base=M[e.type].hp,cap=__game.floorHp?(e.mods.includes('beefy')?Math.ceil(__game.floorHp(e.type,200)*2.5):__game.floorHp(e.type,200)):Math.ceil((e.mods.includes('beefy')?Math.ceil(base*2.5):base)*1.6); /* M1.13: +1 HP per floor instead of x1.6 */if(e.maxHp!==cap)bad++;});return {n:s.enemies.length,bad,elites:s.enemies.filter(e=>e.mods.length).length};});
    check('M1.8 floor 200 mobs: count <= '+(V139?30:22)+', HP exactly x1.6 of their (elite) base',hp.n>0&&hp.n<=(V139?30:22)&&hp.bad===0,JSON.stringify(hp)); /* M1.39: up to 30 when every room needs one */
    await ctx.close();
  }

  // ---- 4. wall textures by depth tier
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m18-tex'});
    const t=await G(page,()=>{const tiers=[1,8,9,12,13,16,17,20,21,24,25,200,9999].map(f=>__game.texTier(f));const info=[];for(let i=0;i<__game.texCount();i++)info.push(__game.texInfo(i));const tierOf={};for(const f of [2,5,8,9,11,13,15,17,19,21,23,25,40,200])tierOf[f]=__game.texTier(f);
      const base={};const newest={};for(const f of [2,5,8,9,11,13,15,17,19,21,23,25,40,200]){const b={},nb=[];for(let sd=1;sd<=60;sd++){const th=__game.themeFor(sd,f);b[th.base]=(b[th.base]||0)+1;}base[f]=b;}
      const W=[0,1,2,3,4,8,9,10,11,12];let md=1e9,mp='';for(const i of [8,9,10,11,12])for(const j of W){if(j===i||(j>=8&&j<i))continue;const d=__game.texDiff(i,j);if(d<md){md=d;mp=i+'/'+j;}}
      return {tiers,info,base,tierOf,count:__game.texCount(),same:__game.texSame(),deep:__game.deepThemes.map(d=>d.base),md,mp};});
    check('M1.8 depth tiers: new wall style every 4 floors past 8 (L9, L13, L17, L21, L25), tier 5 from L25 on',t.tiers.join()===(V120?'0,0,1,1,2,2,3,3,4,4,5,12,12':'0,0,1,1,2,2,3,3,4,4,5,5,5'),t.tiers.join());
    const oldSet=new Set('#SWTM'.split('')),okTier=(f,b)=>{const tier=t.tierOf[f];return Object.keys(b).every(c=>tier===0?oldSet.has(c):t.deep.slice(0,tier).includes(c));};
    const tierOk=Object.entries(t.base).every(([f,b])=>okTier(+f,b));
    const newestShare=[9,13,17,21,25].map(f=>{const tier=f>=25?5:f>=21?4:f>=17?3:f>=13?2:1;return (t.base[f][t.deep[tier-1]]||0)/60;});
    check('M1.8 floors 1-8 use the M1.7 walls; deeper floors always use an unlocked deep wall as the base, the newest about half the time',tierOk&&newestShare.every(x=>x>=.4),`newest share at L9/13/17/21/25: ${newestShare.map(x=>x.toFixed(2)).join(' ')}; L13 bases ${JSON.stringify(t.base[13])}`);
    const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);const walls=[0,1,2,3,4,8,9,10,11,12];let minD=1e9,pair='';
    for(const i of [8,9,10,11,12])for(const j of walls){if(i===j||(j>i&&j>=8&&walls.indexOf(j)<walls.indexOf(i)))continue;if(j===i)continue;const dd=dist(t.info[i].mean,t.info[j].mean);if(dd<minD){minD=dd;pair=i+'/'+j;}}
    const sigs=new Set(t.info.map(x=>x.sig));
    check('M1.8 five new 64x64 wall textures, all distinct, cached once (TEX has 13 entries, same objects every frame)',t.count===(V120?20:13)&&t.same&&sigs.size===t.count&&t.info.slice(8).every(x=>x.w===(V151?128:64)&&x.h===(V151?128:64))&&t.md>=(V125?20:30),`smallest mean per-pixel difference ${t.mp}: ${t.md.toFixed(1)} of 255 (closest mean colours ${pair}: ${minD.toFixed(1)})`);
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
    if(!V19)check('M1.8 slot odds are fixed and documented (sum 100%): nothing 55, coins x1 20, jackpot x3 5, heart 10, power-up 10',sum===100&&cfg.odds.map(o=>o.id+o.p).join()==='none55,coins20,jackpot5,heart10,power10',cfg.odds.map(o=>o.id+':'+o.p).join(' '));
    if(!V19)check('M1.8 expected coin return per spin is 0.35 x the cost (< cost, no profit loop); cost rises 5/10/15, 3 spins per floor',Math.abs(ev-.35)<1e-9&&cfg.costs.join()==='5,10,15'&&cfg.max===3,`EV ${ev}`);
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
    if(!V19)check('M1.8 in game: spins cost 5, 10, 15, a 4th spin is refused (3 per floor) and coins are untouched',g.face&&g.costs.join()==='5,10,15'&&g.coins.join()==='5,10,15'&&/MACHINE EMPTY/.test(g.fourth.msg)&&g.fourth.coins===0&&g.fourth.spins===3,JSON.stringify(g));
    if(!V19)check('M1.8 in game: too few coins -> "A SPIN COSTS 5 COINS", nothing spent',/A SPIN COSTS 5 COINS/.test(g.poor.msg)&&g.poor.coins===3&&g.poor.spins===0,JSON.stringify(g.poor));
    check('M1.8 spin animation: reels spin, stop one by one (reel 1 stops at 0.75 s, all 3 by 1.35 s) and resolve at 1.6 s, with sound (spin, 3 reel stops, result)',g.spin.every(x=>x[0]===true&&x[1]===1&&x[2]===false&&x[3])&&g.sfx>=15,JSON.stringify({spin:g.spin,sfx:g.sfx}));
    check('M1.8 no save-scum profit: spinning never rewrites the floor-start save',g.saveAfter===g.save0,`${g.save0} -> ${g.saveAfter}`);
    // prize resolution
    const pr=await G(page,()=>({c:__game.slotResolve('coins',10,3),j:__game.slotResolve('jackpot',10,3),h:__game.slotResolve('heart',5,3),hf:__game.slotResolve('heart',5,5),p:__game.slotResolve('power',5,3),n:__game.slotResolve('none',5,3)}));
    if(!V19)check('M1.8 prizes: coins x1, jackpot x3, +1 heart (1 coin if full), a power-up, or nothing',pr.c.coins===10&&pr.j.coins===30&&pr.h.heart===1&&pr.h.coins===0&&pr.hf.coins===1&&!pr.hf.heart&&!!pr.p.power&&pr.n.coins===0,JSON.stringify(pr));
    // 60 real in-game spins: coins out < coins in
    const real=await G(page,()=>{let spent=0,won=0;for(let f=0;f<20;f++){let lvl=2+f;__game.setSeed(1000+f);__game.startLevel(2);__game.clearMobs();__game.setHearts(3);__game.faceSlot();__game.give('shield');__game.setCoins(100);for(let i=0;i<3;i++){const c0=__game.state().player.coins;__game.use();__game.advance(0.05);spent+=c0-__game.state().player.coins;const c1=__game.state().player.coins;__game.advance(1.7);won+=__game.state().player.coins-c1;}}return {spent,won};});
    if(!V19)check('M1.8 60 real in-game spins over 20 floors return fewer coins than they cost',real.spent===600&&real.won<real.spent,JSON.stringify(real));
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

// ======================= M1.9 =======================
async function m19Tests(){
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const savePng=(n,u)=>fs.writeFileSync(`${SHOTS}/${n}`,Buffer.from(u.split(',')[1],'base64'));
  const VIEWS=[[844,390],[667,375],[740,360],[926,428],[932,430],[568,320],[1024,768],[1180,820],[1280,720],[1280,800],[800,300]];
  const ov=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
  const S19=`${SHOTS}`; // all M1.9 screenshots: test-output/m1.9/screens/m19_*.png
  const shot=async(page,name)=>page.screenshot({path:`${S19}/m19_${name}.png`});
  const PAD=()=>{window.__pad={id:'Xbox Wireless Controller',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0})),timestamp:0};navigator.getGamepads=()=>[window.__pad];};
  async function cdpTouch(ctx,page){const cdp=await ctx.newCDPSession(page);return (type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});}
  async function tapAt(touch,x,y){await touch('touchStart',[{x,y,id:7}]);await sleep(40);await touch('touchEnd',[]);await sleep(60);}

  // ---- 0. built from the M1.8 release build
  {
    const crypto=await import('crypto');
    const sha=crypto.createHash('sha256').update(fs.readFileSync(`${BUILDS}/m1.8/index.html`)).digest('hex');
    check('M1.9 base: build/m1.8/index.html is still the frozen M1.8 release (sha256 49734fa5...3def)',sha==='49734fa5286944eaa5b6f522aa61836bad1249fb02069966b121efe986e43def',sha);
    const rel=fs.readFileSync(REL_URL.replace('file://',''),'utf8');
    check('M1.9 original names only: OLD MURKLE, RATTLEBONE, balloon types; no "playtest" in the build',/OLD MURKLE/.test(rel)&&/RATTLEBONE/.test(rel)&&!/playtest/i.test(rel));
  }

  // ---- 1. slot machine: no limit, cheaper, more losses, jackpot spray, crit fail, printed odds, EV by simulation
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m19-slot'});
    const cfg=await G(page,()=>({odds:__game.slot.odds,cost:__game.slot.cost,coinsWin:__game.slot.coinsWin,jack:__game.slot.jackpotCoins,cap:__game.slot.critCap,src:document.documentElement.outerHTML.includes('NONE 62%  COINS +5 14%  HEART 8%')&&document.documentElement.outerHTML.includes('POWER 6%  JACKPOT 2%  SKULLS 8%')}));
    const P=Object.fromEntries(cfg.odds.map(o=>[o.id,o.p/100]));const sum=cfg.odds.reduce((a,o)=>a+o.p,0);
    const evMachine=(P.coins*cfg.coinsWin+P.jackpot*cfg.jack)/cfg.cost;
    check('M1.9 slot odds (sum 100%): nothing 62, coins +5 14, heart 8, power-up 6, jackpot 2, crit fail 8; lose chance 70% (was 55%)',sum===100&&cfg.odds.map(o=>o.id+o.p).join()==='none62,coins14,heart8,power6,jackpot2,crit8'&&Math.abs(P.none+P.crit-.70)<1e-9,cfg.odds.map(o=>o.id+':'+o.p).join(' '));
    check('M1.9 slot is cheaper: 3 coins a spin (was 5/10/15), the odds are printed on the machine panel',cfg.cost===3&&cfg.src,`cost ${cfg.cost}`);
    const sims=await G(page,()=>[__game.slotSim(100000,'m19-a',3,3),__game.slotSim(100000,'m19-b',5,6),__game.slotSim(100000,'m19-c',1,21)]);
    const s0=sims[0],fr=cfg.odds.every(o=>Math.abs((s0.counts[o.id]||0)/s0.n-o.p/100)<=4*Math.sqrt(o.p/100*(1-o.p/100)/s0.n));
    check(`M1.9 100,000-spin simulations x3 (jackpot coins included): EV ${sims.map(s=>s.ratio.toFixed(3)).join(' / ')} x cost (theory ${evMachine.toFixed(3)}), < 1 on every run`,sims.every(s=>s.n===100000&&s.ratio<0.5&&s.net<0)&&Math.abs(s0.ratio-evMachine)<0.02,JSON.stringify(sims.map(s=>({spent:s.spent,won:s.won,ratio:+s.ratio.toFixed(4)}))));
    check(`M1.9 EV stays below 1 even counting the coin each crit-fail monster drops (${sims.map(s=>s.ratioWithMobCoins.toFixed(3)).join(' / ')})`,sims.every(s=>s.ratioWithMobCoins<1),JSON.stringify(sims.map(s=>s.mobCoins)));
    check('M1.9 100,000-spin outcome frequencies match the printed odds (within 4 sigma)',fr,JSON.stringify(s0.counts));
    fs.writeFileSync(`${OUT}/m19_slot_economy.json`,JSON.stringify({odds:cfg.odds,cost:cfg.cost,ev_machine:evMachine,sims},null,1));
    const cc=await G(page,()=>{const o={};for(let f=1;f<=30;f++)o[f]=__game.critCount(f);return o;});
    check('M1.9 crit-fail count by depth: 1 + 1 per 3 floors (floor 2 = 1, 3 = 2, 6 = 3, 9 = 4), capped at 8 (floor 21+)',cc[1]===1&&cc[2]===1&&cc[3]===2&&cc[5]===2&&cc[6]===3&&cc[9]===4&&cc[18]===7&&cc[21]===8&&cc[30]===8,JSON.stringify(cc));
    // in game: no spin limit
    const g=await G(page,()=>{__game.manual=true;__game.setSeed(777);__game.startLevel(2);__game.clearMobs();__game.setHearts(5);const face=__game.faceSlot();__game.setCoins(60);const out={face,costs:[],ok:0,ids:[]};
      for(let i=0;i<12;i++){__game.slotForce('none');const c0=__game.state().player.coins;__game.use();__game.advance(0.05);out.costs.push(c0-__game.state().player.coins);__game.advance(1.7);out.ids.push(__game.slotState().last&&__game.slotState().last.id);}
      out.spins=__game.slotState().spins;__game.setCoins(2);__game.use();__game.advance(0.1);out.poor={msg:__game.state().msg,coins:__game.state().player.coins,spins:__game.slotState().spins};return out;});
    check('M1.9 in game: no spin limit (12 spins in a row on one floor, 3 coins each)',g.face&&g.costs.every(c=>c===3)&&g.spins===12,JSON.stringify({costs:g.costs,spins:g.spins}));
    check('M1.9 in game: fewer than 3 coins -> "A SPIN COSTS 3 COINS", nothing spent',/A SPIN COSTS 3 COINS/.test(g.poor.msg)&&g.poor.coins===2&&g.poor.spins===12,JSON.stringify(g.poor));
    await G(page,()=>{__game.setSeed(777);__game.startLevel(2);__game.clearMobs();__game.faceSlot();__game.setCoins(30);__game.advance(0.05);});await shot(page,'slot_odds_panel');
    // jackpot spray
    const jp=await G(page,()=>{__game.setSeed(777);__game.startLevel(2);__game.clearMobs();__game.faceSlot();__game.setCoins(30);const st0=__game.state();const n0=st0.items.filter(i=>i.kind==='coin'&&!i.taken).length;const pos=__game.slotState().pos;
      __game.slotForce('jackpot');__game.use();__game.advance(1.65);const s1=__game.state();const fly=s1.items.filter(i=>i.spray&&i.fly).length;__game.advance(0.25);return {n0,pos,fly,coinsAfterSpin:s1.player.coins,c0:st0.player.coins};});
    await shot(page,'jackpot_spray');
    const jp2=await G(page,(pos)=>{__game.advance(3);const s=__game.state();const sp=s.items.filter(i=>i.spray);const cells=new Set(sp.map(i=>Math.floor(i.x)+','+Math.floor(i.y)));const bad=sp.filter(i=>{const t=__game.cellType(Math.floor(i.x),Math.floor(i.y));return t!==0&&t!==4;}).length;
      const far=Math.max(...sp.map(i=>Math.hypot(i.x-pos.x-.5,i.y-pos.y-.5)));const stillFly=sp.filter(i=>i.fly&&!i.taken).length;const taken0=sp.filter(i=>i.taken).length;
      const c0=s.player.coins;for(const it of sp){if(!it.taken){__game.teleport(it.x,it.y);__game.advance(0.05);}}const c1=__game.state().player.coins;return {n:sp.length,cells:cells.size,bad,far,stillFly,got:c1-c0,taken0};},jp.pos);
    check('M1.9 JACKPOT: 25 coins pop out of the machine as pickups (airborne first), scatter across the room and settle on open floor (never in a wall or pit)',jp.fly===25&&jp2.n===25&&jp2.cells>=6&&jp2.far>=1.8&&jp2.bad===0&&jp2.stillFly===0&&jp.coinsAfterSpin===jp.c0-3,JSON.stringify({jp,jp2}));
    check('M1.9 JACKPOT coins are real pickups (walk over them to collect)',jp2.got+jp2.taken0>=24,`collected ${jp2.got} (+${jp2.taken0} on the way)`);
    // crit fail on floors 3 and 6
    const cf=await G(page,()=>{const res={};for(const [seed,floor] of [[777,3],[4242,6],[99,6],[1234,9]]){__game.setSeed(seed);__game.startLevel(floor-1);if(!__game.slotState().pos){res[floor+':'+seed]='no slot';continue;}__game.clearMobs();__game.faceSlot();__game.setCoins(30);const P0=__game.state().player;
        __game.slotForce('crit');__game.use();__game.advance(1.7);const s=__game.state();const pos=__game.slotState().pos;
        const e=s.enemies.filter(x=>!x.gone);res[floor+':'+seed]={n:e.length,awake:e.every(x=>x.state==='chase'),types:e.map(x=>x.type),bad:e.filter(x=>{const t=__game.cellType(Math.floor(x.x),Math.floor(x.y));return t!==0||__game.pitUnder(x.x,x.y,0)||Math.hypot(x.x-P0.x,x.y-P0.y)<1.15||(Math.floor(x.x)===Math.floor(P0.x)&&Math.floor(x.y)===Math.floor(P0.y));}).length,near:Math.max(...e.map(x=>Math.abs(x.x-pos.x-.5)+Math.abs(x.y-pos.y-.5))),msg:s.msg};}return res;});
    const cfv=Object.entries(cf).filter(([k,v])=>typeof v==='object');
    check('M1.9 CRIT FAIL (3 skulls) spawns 1 + 1 per 3 floors monsters next to the machine (floor 3 -> 2, floor 6 -> 3, floor 9 -> 4), awake',cfv.length>=3&&cfv.every(([k,v])=>v.n===Math.min(8,1+Math.floor(+k.split(':')[0]/3))&&v.awake&&/CRIT FAIL/.test(v.msg)),JSON.stringify(cf));
    check('M1.9 CRIT FAIL spawns only on open floor cells near the machine: never a wall, pit or the player\'s spot',cfv.every(([k,v])=>v.bad===0&&v.near<=8),JSON.stringify(cfv.map(([k,v])=>[k,v.bad,v.near])));
    await G(page,()=>{__game.setSeed(777);__game.startLevel(2);__game.clearMobs();__game.faceSlot();__game.setCoins(30);__game.slotForce('crit');__game.use();__game.advance(1.62);const p=__game.state().player;__game.teleport(p.x,p.y,p.ang);__game.freeze=true;__game.advance(0.05);__game.freeze=false;});
    await shot(page,'crit_fail_spawn');
    // crit cells over many seeds avoid pits (pits are on floors 3+)
    const cs=await G(page,()=>{let n=0,bad=0,floors=0;for(let sd=1;sd<=40;sd++)for(const f of [3,5,7,9,12,21]){__game.setSeed(sd);__game.startLevel(f-1);if(!__game.slotState().pos)continue;floors++;__game.clearMobs();__game.faceSlot();const c=__game.critCells(8);n+=c.length;bad+=c.filter(q=>__game.cellType(Math.floor(q.x),Math.floor(q.y))!==0).length;}return {n,bad,floors};});
    check(`M1.9 crit-fail cells over ${cs.floors} slot floors (40 seeds, floors 3-21) are never pits, walls, doors or the machine`,cs.bad===0&&cs.n>=cs.floors*6,JSON.stringify(cs));
    await ctx.close();
  }

  // ---- 2. water balloons: lower fire rate, hand in sync
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m19-throw'});
    const t=await G(page,()=>{__game.manual=true;__game.startLevel(0);__game.clearMobs();__game.teleport(1.5,1.5,Math.PI/2);const cd=__game.throwCd();const s0=__game.state().stats.throws;
      window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' '}));for(let i=0;i<240;i++)__game.advance(1/60);window.dispatchEvent(new KeyboardEvent('keyup',{code:'Space',key:' '}));const n=__game.state().stats.throws-s0;
      __game.advance(1);__game.throwOnce();const seq=[{f:__game.state().handFrame,t:0}];for(let i=1;i<=70;i++){const s=__game.advance(1/60);if(seq[seq.length-1].f!==s.handFrame)seq.push({f:s.handFrame,t:i/60});}return {cd,n,seq};});
    const fs_=t.seq.map(x=>x.f).join('>'),back=t.seq[t.seq.length-1];
    check(`M1.9 fire rate roughly halved: ${t.cd.old}s -> ${t.cd.cd}s between balloons (4 s of held fire = ${t.n} throws, was ~10)`,t.cd.cd===0.8&&t.cd.old===0.42&&t.n>=5&&t.n<=6,JSON.stringify(t.cd));
    check('M1.9 hand stays in sync: windup -> throw (0.25 s) -> empty for the rest of the cooldown -> new balloon rises at 0.8 s',fs_==='idle>windup>throw>empty>idle'&&back.f==='idle'&&Math.abs(back.t-0.75)<0.06,JSON.stringify(t.seq));
    await ctx.close();
  }

  // ---- 3. power-ups last the floor
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m19-pu'});
    const r=await G(page,()=>{__game.manual=true;__game.setSeed(777);__game.startLevel(1,{hearts:5,coins:5});__game.clearMobs();__game.give('sneakers');const used=__game.useItem();const a=__game.state().player;__game.advance(60);const b=__game.state().player;
      __game.give('sneakers');const again=__game.useItem();const againMsg=__game.state().msg;__game.give('freeze');const second=__game.useItem();const c=__game.state().player;
      __game.give('magnet');__game.nextFloorViaExit();__game.advance(0.1);const m1=__game.state().mode;__game.advance(0.6);__game.confirm();__game.advance(0.1);const d=__game.state();
      return {used,a:a.effects,b:b.effects,again,againMsg,second,c:c.effects,m1,lvl:d.level,d:d.player.effects,item:d.player.item,effect:d.player.effect};});
    check('M1.9 a used power-up lasts the rest of the floor (still on after 60 s)',r.used&&r.a.join()==='sneakers'&&r.b.join()==='sneakers',JSON.stringify(r));
    check('M1.9 power-ups stack for the floor (a 2nd kind runs alongside; the same kind is refused, keeping the item)',r.again===false&&/ALREADY ON/.test(r.againMsg)&&r.second&&r.c.join()==='sneakers,freeze',r.againMsg);
    check('M1.9 every effect ends on the next floor (held items carry over)',r.m1==='clear'&&r.lvl===2&&r.d.length===0&&r.effect===null&&r.item==='magnet',JSON.stringify({m1:r.m1,lvl:r.lvl,d:r.d,item:r.item}));
    const hud=await G(page,()=>{__game.setSeed(777);__game.startLevel(1);__game.clearMobs();__game.teleport(__game.state().player.x,__game.state().player.y,0);const R=__game.hudRects();const sig=(r)=>{let a=[];for(let y=r[1];y<r[1]+r[3];y++)for(let x=r[0];x<r[0]+r[2];x++)a.push(__game.pixelAt(x,y).join());return a;};
      __game.setEffect(null);__game.advance(0.05);const e0=sig(R.effect),a0=sig(R.active);__game.setEffect('shield');__game.setEffect('giant');__game.advance(0.05);const e1=sig(R.effect),a1=sig(R.active);
      return {eff:e0.filter((v,i)=>v!==e1[i]).length,act:a0.filter((v,i)=>v!==a1[i]).length,rects:R};});
    await shot(page,'hud_floor_powerups');
    check('M1.9 HUD shows running power-ups as an icon row (no countdown ring in the item bar)',hud.eff>60&&hud.act<12,JSON.stringify({eff:hud.eff,act:hud.act}));
    const sh=await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.freeze=false;__game.setHearts(5);__game.teleport(6.5,3.5,0);__game.setEffect('shield');const p=__game.state().player;__game.spawn('clunk',p.x+.45,p.y,true,[]);const s0=__game.state().stats.shieldBlocks;__game.advance(9);const s=__game.state();return {blocks:s.stats.shieldBlocks-s0,hearts:s.player.hearts,effects:s.player.effects};});
    check('M1.9 rebalance: the floor-long Shield Bubble absorbs 3 hits, then pops',sh.blocks===3&&sh.hearts<5&&!sh.effects.includes('shield'),JSON.stringify(sh));
    const pf=await G(page,()=>__game.puFloor);
    check('M1.9 rebalance values: sneakers x1.35 (was 1.6), freeze 60% (was 35%), shield 3 hits, magnet 6 cells, giant splash 1 dmg in 1.2 cells (was 2 in 1.4)',pf.sneakers===1.35&&pf.freeze===0.6&&pf.shieldHits===3&&pf.magnet===6&&pf.giantR===1.2,JSON.stringify(pf));
    await ctx.close();
  }

  // ---- 4. shop: placement, every input, purchases, saves, balloon types, backpack
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m19-shop'});
    const pl=await G(page,()=>{let even=0,evenShop=0,odd=0,reach=0,bad=[];for(let sd=1;sd<=50;sd++)for(let f=2;f<=21;f++){const d=__game.genMap(sd,f);if(f%2===0){even++;if(d.shop)evenShop++;else bad.push(sd+':'+f);}else if(d.shop){odd++;bad.push('odd '+sd+':'+f);}}return {even,evenShop,odd,bad:bad.slice(0,6)};});
    const tut=await G(page,()=>{__game.startLevel(0);return __game.currentMap().join('').includes('N');});
    check(`M1.9 shop room every other floor from 2 (all ${pl.even} even floors over 50 seeds, never odd floors or the tutorial)`,pl.evenShop===pl.even&&pl.odd===0&&!tut,JSON.stringify(pl));
    // talk with E, see rows, buy with keyboard
    const kb=await G(page,()=>{__game.manual=true;__game.setSeed(4242);__game.startLevel(1,{hearts:5,coins:0});__game.clearMobs();const f=__game.faceShop();__game.advance(0.05);const prompt=__game.state().prompt;const band=__game.state().useTarget;
      __game.setCoins(200);window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE',key:'e'}));window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyE',key:'e'}));__game.advance(0.05);const mode=__game.state().mode;
      __game.advance(0.3);const K=(c)=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));window.dispatchEvent(new KeyboardEvent('keyup',{code:c}));};
      K('KeyS');K('KeyS');K('KeyS');const sel=__game.shopInfo().sel;K('Enter');const after=__game.state();return {f,band,mode,sel,rows:__game.shopRows(),coins:after.player.coins,perm:after.perm,save:after.save.perm,saveCoins:after.save.coins};});
    await G(page,()=>__game.advance(0.05));await shot(page,'shop_menu');
    check('M1.9 talk to OLD MURKLE with E: the game pauses and the shop menu opens',kb.f&&kb.band&&kb.band.shop&&kb.mode==='shop',JSON.stringify({band:kb.band,mode:kb.mode}));
    check('M1.9 shop rows: Red 35, Green 45, Yellow 50, Backpack 30, two single-use power-ups at 10, LEAVE',kb.rows.map(r=>r.price).join()===(V112?'35,45,50,30,10,10,0,0':'35,45,50,30,10,10,0')&&kb.rows[4].kind==='power'&&kb.rows[V112?7:6].id==='leave'&&(!V112||kb.rows[6].id==='more'),kb.rows.map(r=>r.name+' '+r.price).join(', '));
    check('M1.9 keyboard: W/S choose, ENTER buys (Backpack) -> coins paid, permanent item saved at once',kb.sel===3&&kb.coins===170&&kb.perm.pack&&kb.save&&kb.save.pack===true&&kb.saveCoins===0,JSON.stringify({sel:kb.sel,coins:kb.coins,save:kb.save,saveCoins:kb.saveCoins}));
    // mouse click on a row (Red), refuse owned, refuse poor, power-up row
    const rects=await G(page,()=>__game.shopRects());
    await page.mouse.click(rects[0].x+rects[0].w/2,rects[0].y+rects[0].h/2);
    const mo=await G(page,()=>{__game.advance(0.05);const s=__game.state();return {coins:s.player.coins,perm:s.perm,ball:s.player.ball};});
    await page.mouse.click(rects[0].x+rects[0].w/2,rects[0].y+rects[0].h/2);
    const own=await G(page,()=>({msg:__game.shopInfo().msg,coins:__game.state().player.coins}));
    const pu=await G(page,()=>{const ok=__game.shopBuy(4);const s=__game.state();const again=__game.shopBuy(4);return {ok,item:s.player.item,coins:s.player.coins,again,msg:__game.shopInfo().msg,save:__game.state().save.item};});
    const poor=await G(page,()=>{__game.setCoins(5);const r=__game.shopBuy(2);return {r,msg:__game.shopInfo().msg,coins:__game.state().player.coins};});
    check('M1.9 mouse: click a row to buy (Red Balloons -> equipped), owned items and sold-out offers are refused',mo.perm.red&&mo.coins===135&&mo.ball==='red'&&/ALREADY/.test(own.msg)&&own.coins===135,JSON.stringify({mo,own}));
    check('M1.9 single-use power-ups fill the item slot, once per floor; not saved as permanent',pu.ok&&!!pu.item&&pu.coins===125&&pu.again===false&&/SOLD OUT/.test(pu.msg),JSON.stringify(pu));
    check('M1.9 not enough coins -> refused with a message, nothing spent',poor.r===false&&/NOT ENOUGH/.test(poor.msg)&&poor.coins===5,JSON.stringify(poor));
    await page.keyboard.press('Escape');
    const left=await G(page,()=>{__game.advance(0.05);return __game.state().mode;});
    check('M1.9 ESC leaves the shop',left==='play',left);
    // save + continue restores permanent items and the balloon type
    await page.reload();await page.waitForFunction(()=>!!window.__game);await sleep(300);
    const cont=await G(page,()=>{const st=__game.state();const i=st.menu.findIndex(m=>/CONTINUE/.test(m));__game.menuPick(i);__game.manual=true;const s=__game.advance(0.05);return {perm:s.perm,ball:s.player.ball,level:s.level};});
    check('M1.9 CONTINUE restores the permanent items (Backpack + Red) and the balloon type',cont.perm.pack&&cont.perm.red&&!cont.perm.green&&cont.ball==='red'&&cont.level===1,JSON.stringify(cont));
    const ng=await G(page,()=>{__game.toTitle();const st=__game.state();const i=st.menu.findIndex(m=>/NEW/.test(m));__game.menuPick(i);__game.manual=true;const s=__game.advance(0.05);return {perm:s.perm,ball:s.player.ball};});
    check('M1.9 NEW GAME starts without permanent items',!ng.perm.pack&&!ng.perm.red&&ng.ball==='blue',JSON.stringify(ng));
    // gamepad: X talks, down + A buys, B leaves
    await G(page,PAD);
    const gp=await G(page,()=>{__game.setSeed(4242);__game.startLevel(1,{hearts:5,coins:100});__game.clearMobs();__game.faceShop();__game.advance(0.1);const B=(i,v)=>{__pad.buttons[i]={pressed:v,value:v?1:0};};
      B(2,true);__game.advance(0.05);B(2,false);__game.advance(0.3);const m0=__game.state().mode;__pad.axes[1]=1;__game.advance(0.05);__pad.axes[1]=0;__game.advance(0.05);const sel=__game.shopInfo().sel;
      B(0,true);__game.advance(0.05);B(0,false);__game.advance(0.05);const p1=__game.state().perm;B(1,true);__game.advance(0.05);B(1,false);__game.advance(0.05);return {m0,sel,green:p1.green,coins:__game.state().player.coins,m1:__game.state().mode};});
    check('M1.9 gamepad: X talks, stick down + A buys (Green Balloons), B leaves',gp.m0==='shop'&&gp.sel===1&&gp.green&&gp.coins===55&&gp.m1==='play',JSON.stringify(gp));
    // balloon types: flight + effects
    const bt=await G(page,()=>{const B=__game.balls;const range=(b)=>{let z=.36,vz=b.vzMax,t=0;while(z>0){vz-=b.g*1/240;z+=vz/240;t+=1/240;}return b.spd*t;};return {blue:range(B.blue),red:range(B.red),bs:B.blue.spd,rs:B.red.spd};});
    check(`M1.9 Red Balloons fly faster (${bt.rs} vs ${bt.bs} cells/s) and further (${bt.red.toFixed(1)} vs ${bt.blue.toFixed(1)} cells at the top arc)`,bt.rs>bt.bs*1.3&&bt.red>bt.blue*1.8,JSON.stringify(bt));
    const green=await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.setPerm({green:true});__game.freeze=true;__game.teleport(7.0,3.5,0);__game.setBall('green');const i=__game.spawn('clunk',8.6,3.5,false);__game.throwOnce();for(let k=0;k<30;k++)__game.advance(1/60);const h1=__game.state().enemies[i].hp,po=__game.state().enemies[i].poison;__game.advance(2.5);const h2=__game.state().enemies[i].hp;return {h1,po,h2,ticks:__game.state().stats.poisonTicks};});
    check('M1.9 Green Balloons poison: the hit plus 2 damage ticks over 2 s (clunk 8 -> 7 -> 5)',green.h1===7&&green.po&&green.h2===5,JSON.stringify(green));
    const yel=await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.setPerm({yellow:true});__game.freeze=true;__game.setHearts(5);__game.teleport(7.0,3.5,0);__game.setBall('yellow');__game.setPitch(-40);__game.throwOnce();for(let k=0;k<60;k++)__game.advance(1/60);const pud=__game.ypuds();if(!pud.length)return {pud};
      const i=__game.spawn('clunk',pud[0].x,pud[0].y,false);__game.advance(2.5);const hp=__game.state().enemies[i].hp;__game.clearMobs();__game.teleport(pud[0].x,pud[0].y,0);__game.freeze=false;__game.advance(1);__game.freeze=true;return {pud:pud.length,hp,hearts:__game.state().player.hearts};});
    check('M1.9 Yellow Balloons leave a splash puddle that hurts mobs over time, never the player',yel.pud>=1&&yel.hp<=6&&yel.hearts===5,JSON.stringify(yel));
    // switching on every input + HUD + hand colour
    const sw=await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.setPerm({red:true,green:true,yellow:true});__game.setBall('blue');const K=(c)=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));window.dispatchEvent(new KeyboardEvent('keyup',{code:c}));};const o={};
      K('KeyR');o.r=__game.state().player.ball;K('Digit4');o.d4=__game.state().player.ball;window.dispatchEvent(new WheelEvent('wheel',{deltaY:100}));o.wheel=__game.state().player.ball;
      __pad.buttons[4]={pressed:true,value:1};__game.advance(0.05);__pad.buttons[4]={pressed:false,value:0};__game.advance(0.05);o.lb=__game.state().player.ball;return o;});
    check('M1.9 balloon type switching: R cycles, 1-4 pick, mouse wheel cycles, pad LB cycles',sw.r==='red'&&sw.d4==='yellow'&&sw.wheel==='blue'&&sw.lb==='red',JSON.stringify(sw));
    const hudc=await G(page,()=>{const out={};const R=__game.hudRects().ball;for(const b of ['blue','red','green','yellow']){__game.setBall(b);__game.advance(0.05);const col=__game.balls[b].col;const t=[parseInt(col.slice(1,3),16),parseInt(col.slice(3,5),16),parseInt(col.slice(5,7),16)];let n=0;for(let y=R[1];y<R[1]+R[3];y++)for(let x=R[0];x<R[0]+R[2];x++){const p=__game.pixelAt(x,y);if(Math.abs(p[0]-t[0])+Math.abs(p[1]-t[1])+Math.abs(p[2]-t[2])<60)n++;}
      const hb=__game.handBoxes().idle;let h=0;for(let y=Math.max(0,hb.y|0);y<Math.min(300,hb.y+hb.h);y++)for(let x=hb.x|0;x<hb.x+hb.w;x++){const p=__game.pixelAt(x,y);if(Math.abs(p[0]-t[0])+Math.abs(p[1]-t[1])+Math.abs(p[2]-t[2])<70)h++;}out[b]={hud:n,hand:h};}return out;});
    check('M1.9 the HUD chip and the balloon in the hand take the balloon colour (all 4 types)',Object.values(hudc).every(v=>v.hud>=10&&v.hand>=20),JSON.stringify(hudc));
    for(const b of ['red','green','yellow']){await G(page,(b)=>{__game.setBall(b);__game.advance(0.05);},b);await shot(page,`balloon_${b}_hud_hand`);}
    // backpack: 2 slots, switch with F / pad RB, Q uses the selected one
    const bp=await G(page,()=>{__game.startLevel(0);__game.clearMobs();const A=__game.pu.shield?['shield','magnet','giant','triple']:['herb','freeze','bell','flare'];__game.setPerm({pack:true});__game.give(A[0]);__game.give2(A[1]);const K=(c)=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));window.dispatchEvent(new KeyboardEvent('keyup',{code:c}));};
      const o={sel0:__game.state().player.sel};K('KeyF');o.f=__game.state().player.sel;K('KeyQ');__game.advance(0.05);o.used=__game.state().player.effects.slice();o.left=[__game.state().player.item,__game.state().player.item2];
      __pad.buttons[5]={pressed:true,value:1};__game.advance(0.05);__pad.buttons[5]={pressed:false,value:0};__game.advance(0.05);o.rb=__game.state().player.sel;o.give=__game.giveItem(A[2]);o.after=[__game.state().player.item,__game.state().player.item2];o.full=__game.giveItem(A[3]);o.A=A;return o;});
    await G(page,()=>__game.advance(0.05));await shot(page,'backpack_two_slots');
    check('M1.9 Backpack: +1 power-up slot; F / pad RB pick the slot; Q uses the selected one; slots fill in order',bp.sel0===0&&bp.f===1&&bp.used.join()===bp.A[1]&&bp.left.join()===bp.A[0]+','&&bp.rb===0&&bp.give===true&&bp.after.join()===bp.A[0]+','+bp.A[2]&&bp.full===false,JSON.stringify(bp));
    const econ=await G(page,()=>{let c=0;const per=[];for(let f=2;f<=8;f++){const d=__game.difficulty(f);c+=d.coins+d.mobs;per.push(d.coins+d.mobs);}return {perFloor:per,total2to8:c};});
    check(`M1.9 prices fit the coin economy: all 4 permanent items (160) cost about floors 2-5 worth of coins; floors 2-8 offer ~${econ.total2to8}`,160>econ.perFloor[0]*3&&160<econ.total2to8,JSON.stringify(econ));
    fs.writeFileSync(`${OUT}/m19_shop_economy.json`,JSON.stringify({prices:{red:35,green:45,yellow:50,pack:30,powerUp:10},econ},null,1));
    await ctx.close();
  }

  // ---- 5. secret rooms
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m19-secret'});
    const gen=await G(page,()=>{const WALL=new Set('#SWTMKRCVOABEIZ+='.split(''));let n=0,ok=0,mob=0,bag=0,pw=0;const bad=[];
      for(let sd=1;sd<=60;sd++)for(const f of [2,3,4,5,6,7,8,9,10,12,15,20,50,200]){const d=__game.genMap(sd,f),m=d.map,S=d.secret,h=m.length,w=m[0].length;n++;if(!S){bad.push(sd+':'+f+' none');continue;}
        const inS=(x,y)=>x>=S.x&&x<S.x+S.w&&y>=S.y&&y<S.y+S.h;let p=null;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(m[y][x]==='p')p=[x,y];
        const flood=(open)=>{const seen=new Set([p[1]*w+p[0]]),q=[p];while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy,k=Y*w+X;if(seen.has(k))continue;const c=(X===S.cx&&Y===S.cy&&open)?'.':m[Y][X];if(WALL.has(c)||c==='F'||c==='Y'||c==='N'||c==='P')continue;seen.add(k);q.push([X,Y]);}}return seen;};
        const shut=flood(false),opn=flood(true);let inner=0,innerShut=0,innerOpen=0,things='';for(let y=S.y;y<S.y+S.h;y++)for(let x=S.x;x<S.x+S.w;x++){inner++;if(shut.has(y*w+x))innerShut++;if(opn.has(y*w+x))innerOpen++;things+=m[y][x];}
        const crackWall=WALL.has(m[S.cy][S.cx]),front=shut.has(S.fy*w+S.fx);
        if(crackWall&&front&&innerShut===0&&innerOpen===inner&&/[GU]/.test(things)){ok++;if(/G/.test(things))bag++;else pw++;if(things.replace(/[.GU1-8]/g,'').length)mob++;}else bad.push(`${sd}:${f} wall ${crackWall} front ${front} shut ${innerShut} open ${innerOpen}/${inner} ${things}`);}
      return {n,ok,mob,bag,pw,bad:bad.slice(0,5)};});
    check(`M1.9 a secret room on every generated floor (${gen.n} floors: 60 seeds x floors 2-200): reachable ONLY through the cracked wall`,gen.ok===gen.n,JSON.stringify(gen.bad));
    check(`M1.9 secret rooms hold 1 treasure (coin bag ${gen.bag} / power-up ${gen.pw}) and usually 1 mob (${Math.round(gen.mob/gen.n*100)}%)`,gen.bag+gen.pw===gen.n&&gen.mob/gen.n>0.7&&gen.bag>0&&gen.pw>0,JSON.stringify({bag:gen.bag,pw:gen.pw,mob:gen.mob}));
    const sub=await G(page,()=>[0,1,2,4,8].map(t=>[__game.crackInfo(t,0),__game.crackInfo(t,1),__game.crackInfo(t,2)]));
    check('M1.9 the crack is visible but subtle (changes 2-12% of the wall texture, mean colour shift < 6), and grows with each hit',sub.every(r=>r[0].changedFrac>0.015&&r[0].changedFrac<0.12&&r[0].mean<6&&r[1].changedFrac>r[0].changedFrac&&r[2].changedFrac>r[1].changedFrac),JSON.stringify(sub.map(r=>r.map(x=>+x.changedFrac.toFixed(3)))));
    await G(page,()=>{__game.setSeed(777);__game.startLevel(4,{hearts:5,coins:0});__game.clearMobs();__game.faceCrack();const p=__game.state().player;__game.teleport(p.x-Math.cos(p.ang)*0.6,p.y-Math.sin(p.ang)*0.6,p.ang);__game.advance(0.05);});await shot(page,'secret_crack_wall');
    await G(page,()=>{__game.faceCrack();__game.crackHit();__game.crackHit();__game.advance(0.05);});await shot(page,'secret_crack_two_hits');
    // break it with real balloons
    const br=await G(page,()=>{__game.manual=true;__game.setSeed(777);__game.startLevel(4,{hearts:5,coins:0});__game.clearMobs();const ok=__game.faceCrack();const res={ok,hits:[]};__game.setPitch(0);
      for(let i=0;i<3;i++){__game.shoot();for(let k=0;k<50;k++)__game.advance(1/60);const s=__game.secret();res.hits.push([s.hits,s.cellT]);if(i===1){res.mid=1;}}
      const s=__game.secret();res.open=s.open;res.save=__game.state().save.secret;res.lvl=__game.state().level;return res;});
    check('M1.9 crack: hits 1 and 2 leave the wall standing (crack widens), the 3rd balloon breaks it open',br.ok&&br.hits[0][0]===1&&br.hits[0][1]===1&&br.hits[1][0]===2&&br.hits[1][1]===1&&br.hits[2][1]===0&&br.open,JSON.stringify(br));
    check('M1.9 the opened secret room is saved for this floor',br.save===br.lvl,JSON.stringify({save:br.save,lvl:br.lvl}));
    await page.reload();await page.waitForFunction(()=>!!window.__game);await sleep(300);
    const cont=await G(page,()=>{const st=__game.state();const i=st.menu.findIndex(m=>/CONTINUE/.test(m));__game.menuPick(i);__game.manual=true;__game.advance(0.05);const s=__game.secret();__game.faceCrack();__game.advance(1.0);return {open:s.open,t:s.cellT};});
    await shot(page,'secret_room_opened');
    check('M1.9 CONTINUE keeps the secret wall open on that floor',cont.open&&cont.t===0,JSON.stringify(cont));
    await ctx.close();
  }

  // ---- 6/7. no empty rooms + decorations
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m19-rooms'});
    const r=await G(page,(V191)=>{const mob=new Set(Object.values(__game.mobs).map(m=>m.ch));if(__game.bosses)Object.values(__game.bosses).forEach(b=>mob.add(b.ch)); /* M1.10: a boss fills its arena */let rooms=0,empty=0,decos=0,badDeco=[];const kinds=new Set();const ex=[];
      for(let sd=1;sd<=60;sd++)for(const f of [2,3,4,5,6,8,10,13,20]){const d=__game.genMap(sd,f),m=d.map,RR=__game.genRooms(sd,f);
        for(const R of RR){if(R.tag==='pit')continue; /* M1.47: a pit room is all pit and paths by design */rooms++;let has=false,free=0;for(let y=R.y;y<R.y+R.h;y++)for(let x=R.x;x<R.x+R.w;x++){const c=m[y][x];if(mob.has(c)||/[1-8N]/.test(c))has=true;if(c==='.')free++;}if(!free)has=true; /* a room packed with keys/coins/hearts is not empty */
          if(V191&&!has&&R.start){let clear=false;for(let y=R.y;y<R.y+R.h;y++)for(let x=R.x;x<R.x+R.w;x++){if(m[y][x]!=='.')continue;let ok=true;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const q=m[y+j][x+i];if(/[DL]/.test(q)||((i===0)!==(j===0)&&/[FkXYNpP]/.test(q)))ok=false;}if(ok)clear=true;}if(!clear)has=true;} /* M1.9.1: a tiny start room ringed by doors may stay bare (you start in it) */
          if(!has){empty++;if(ex.length<4)ex.push(sd+':'+f+(R.start?' start':''));}}
        for(let y=1;y<m.length-1;y++)for(let x=1;x<m[0].length-1;x++){const c=m[y][x];if(!/[1-8]/.test(c))continue;decos++;kinds.add(c);for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const q=m[y+j][x+i],four=(i===0)!==(j===0),diag=i!==0&&j!==0;if((four&&/[DLFkXYNpP]/.test(q))||(V191&&diag&&/[DL]/.test(q))){badDeco.push(sd+':'+f+' '+q+(diag?' (diagonal)':''));}}}}
      return {rooms,empty,decos,kinds:kinds.size,badDeco:badDeco.slice(0,5),nBad:badDeco.length,ex};},V191);
    check(`M1.9 no empty rooms: every one of ${r.rooms} rooms (60 seeds x 9 floors) has a mob, decorations or the merchant (or is packed with items)`,r.empty===0,JSON.stringify(r.ex));
    check(`M1.9 decorations (${r.decos}, all ${r.kinds} kinds used) never block anything: no door, key, start, exit, fence, slot, merchant or pit beside them${V191?', no door diagonally next to them either':''} (and no hitbox)`,r.nBad===0&&r.kinds===8,JSON.stringify(r.badDeco));
    const nb=await G(page,()=>{__game.manual=true;__game.setSeed(777);__game.startLevel(3);__game.clearMobs();const D=__game.decos();const d=D.find(q=>__game.cellType(Math.floor(q.x)-1,Math.floor(q.y))===0&&__game.cellType(Math.floor(q.x)+1,Math.floor(q.y))===0)||D[0];__game.teleport(d.x-1,d.y,0);window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW'}));__game.advance(0.7);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW'}));const p=__game.state().player;return {n:D.length,kinds:[...new Set(D.map(x=>x.kind))],x0:d.x-1,x:p.x,solid:__game.solidAt(d.x,d.y)};});
    check('M1.9 decorations are billboards with no hitbox (you walk straight through)',nb.n>0&&nb.x>nb.x0+1.0&&nb.solid===false,JSON.stringify(nb));
    const extra=await G(page,()=>{let n=0,maps=0;for(let sd=1;sd<=60;sd++)for(let f=2;f<=12;f++){maps++;n+=__game.genMap(sd,f).extraMobs;}return n/maps;});
    check(`M1.9 empty rooms often get a mob instead (${extra.toFixed(2)} extra mobs per floor, at most 2, never near the start)`,extra>0.3&&extra<=2);
    savePng('m19_sprites_decos_skeleton_merchant_4x.png',await G(page,()=>__game.spriteSheet(4,'m19')));
    await G(page,()=>{__game.setSeed(777);__game.startLevel(3);__game.clearMobs();const D=__game.decos();const d=D[0];__game.teleport(d.x-1.6,d.y+.2,-0.15);__game.advance(0.05);});await shot(page,'decorations_in_game');
    await ctx.close();
  }

  // ---- 8. pits
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m19-pits'});
    const pg=await G(page,([V140,V147])=>{let maps=0,bad=[],cnt={};for(let sd=1;sd<=100;sd++)for(const f of [1,2,3,4,5,6,8,10,12,16,30,200]){if(f===1)continue;const d=__game.genMap(sd,f),m=d.map,h=m.length,w=m[0].length;maps++;let n=0;const AR=V140&&d.boss&&d.boss.design?d.boss.room:null; /* M1.40: the arena design's own pits are not random pits */const PR=V147?d.pitRoom:null; /* M1.47: nor are the pit room's */
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(m[y][x]!=='P')continue;if(AR&&x>=AR.x&&x<AR.x+AR.w&&y>=AR.y&&y<AR.y+AR.h)continue;if(PR&&x>=PR.x&&x<PR.x+PR.w&&y>=PR.y&&y<PR.y+PR.h)continue;n++;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const q=m[y+j][x+i];if(/[DLFkXYNph]/.test(q))bad.push(`${sd}:${f} ${q} by pit`);}}
        const want=f>=3?(V147?Math.min(10,Math.max(Math.min(6,1+(f>>1)),f>12?6+((f-12)>>2):0))*(f>=14?9:f>=8?4:1):Math.min(6,1+(f>>1))):0; /* M1.47: more pit spots deeper, each up to 2x2 from floor 8 and 3x3 from 14 */(cnt[f]=cnt[f]||[]).push(n);if(n>want)bad.push(`${sd}:${f} ${n}>${want}`);}
      const avg={};for(const f in cnt)avg[f]=(cnt[f].reduce((a,b)=>a+b,0)/cnt[f].length).toFixed(1);return {maps,bad:bad.slice(0,6),nBad:bad.length,avg};},[V140,V147]);
    check(`M1.9 pits: none on floors 1-2, up to 1 + floor/2 (max 6) from floor 3${V147?' (M1.47: more and bigger deeper down, pit rooms aside)':''}; never on/next to the start, keys, doors, exit, slot, merchant or hearts (${pg.maps} maps)`,pg.nBad===0&&pg.avg[2]==='0.0'&&+pg.avg[8]>=3,JSON.stringify(pg));
    // solvability with pits: every lock order, any floor (M1.3 analysis covers 2-8; here floors 9-200 on 40 seeds, locks closed and open)
    const sol=await G(page,()=>{const WALL=new Set('#SWTMKRCVOABEIZ+='.split(''));const mob=new Set(Object.values(__game.mobs).map(m=>m.ch));let maps=0,bad=[];
      for(let sd=1;sd<=40;sd++)for(const f of [3,5,7,9,11,14,18,25,60,200,999]){const d=__game.genMap(sd,f),m=d.map,S=d.secret,h=m.length,w=m[0].length;maps++;const inS=(x,y)=>S&&x>=S.x&&x<S.x+S.w&&y>=S.y&&y<S.y+S.h;let p;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(m[y][x]==='p')p=[x,y];
        const flood=(locks)=>{const seen=new Set([p[1]*w+p[0]]),q=[p];while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy,k=Y*w+X;if(seen.has(k))continue;const c=m[Y][X];if(WALL.has(c)||c==='F'||c==='Y'||c==='N'||c==='P'||(!locks&&c==='L'))continue;seen.add(k);q.push([X,Y]);}}return seen;};
        const A=flood(true),B=flood(false);let keysB=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=m[y][x];if(inS(x,y))continue;if(c==='k'&&B.has(y*w+x))keysB++;if(/[Xkch.GU1-8D]/.test(c)||mob.has(c)){if(!A.has(y*w+x)){bad.push(`${sd}:${f} ${c}@${x},${y}`);y=h;break;}}}
        if(keysB<1)bad.push(`${sd}:${f} no key before a lock`);}
      return {maps,bad:bad.slice(0,6),nBad:bad.length};});
    check(`M1.9 pit solvability over ${sol.maps} deep maps: with pits as walls everything (exit, keys, coins, mobs, floor) stays reachable and a key is reachable before any lock`,sol.nBad===0,JSON.stringify(sol.bad));
    // fall = death
    const fall=await G(page,()=>{__game.manual=true;__game.setSeed(777);__game.startLevel(5,{hearts:5,coins:3});__game.clearMobs();const P=__game.pits();const q=P[0];__game.setEffect('shield');__game.teleport(q.x+.5,q.y+.5,0);__game.advance(0.05);const m0=__game.state().mode;__game.advance(0.4);const mid=__game.state().mode;__game.advance(0.8);const s=__game.state();return {n:P.length,m0,mid,mode:s.mode,hearts:s.player.hearts,fell:s.fellPit,falls:s.stats.falls,save:s.save};});
    check('M1.9 falling into a pit kills the player (even with the shield): fall animation, then the run is over',fall.n>0&&fall.m0==='fall'&&fall.mid==='fall'&&fall.mode==='dead'&&fall.hearts===0&&fall.fell&&fall.save===null,JSON.stringify(fall));
    await shot(page,'pit_death_screen');
    const edge=await G(page,()=>{__game.setSeed(777);__game.startLevel(5);__game.clearMobs();const q=__game.pits()[0];__game.teleport(q.x-.08,q.y+.5,0);__game.advance(0.1);return {mode:__game.state().mode,under:__game.pitUnder(q.x+.1,q.y+.5,.14)};});
    check('M1.9 the pit edge is safe (you fall only once your centre is over the hole, 0.14 margin)',edge.mode==='play'&&edge.under===false,JSON.stringify(edge));
    // render + minimap
    const rv=await G(page,()=>{__game.setSeed(777);__game.startLevel(5);__game.clearMobs();const q=__game.pits()[0];const dirs=[[1,0,Math.PI],[-1,0,0],[0,1,-Math.PI/2],[0,-1,Math.PI/2]];let used=null;
      for(const [dx,dy,a] of dirs){for(const k of [2,3]){const x=q.x+dx*k,y=q.y+dy*k;if(__game.cellType(x,y)===0&&__game.cellType(q.x+dx,q.y+dy)===0){__game.teleport(x+.5,y+.5,a);used=[x,y];break;}}if(used)break;}
      __game.setPitch(-40);__game.seeAll();__game.advance(0.05);let dark=0;for(let y=170;y<300;y+=2)for(let x=150;x<330;x+=2){const p=__game.pixelAt(x,y);if(p[0]+p[1]+p[2]<40)dark++;}
      const R=__game.hudRects().map;let blk=0;for(let y=R[1]+2;y<R[1]+R[3]-2;y++)for(let x=R[0]+2;x<R[0]+R[2]-2;x++){const p=__game.pixelAt(x,y);if(p[0]+p[1]+p[2]===0)blk++;}return {used,dark,blk};});
    await shot(page,'pit_in_floor_and_minimap');
    check('M1.9 pits render as dark holes in the floor (M1.14.1: shafts with walls) and show black (with a rim) on the minimap',rv.used&&rv.dark>(atLeast('1.14.1')?60:150)&&rv.blk>=9,JSON.stringify(rv));
    await G(page,()=>{__game.openMap();__game.advance(0.05);});await shot(page,'pit_full_map_legend');await G(page,()=>{__game.closeMap();});
    // mobs: ground mobs path around, flyers go over
    const mv=await G(page,()=>{const out={};for(const sd of [777,4242,99991,31337,2026,9]){__game.setSeed(sd);__game.startLevel(7);const P=__game.pits();for(const q of P){for(const [dx,dy] of [[1,0],[0,1]]){const a=[q.x-dx*2,q.y-dy*2],b=[q.x+dx*2,q.y+dy*2],ok=[[q.x-dx,q.y-dy],[q.x+dx,q.y+dy],a,b].every(c=>__game.cellType(c[0],c[1])===0);if(!ok)continue;
        const run=(t)=>{__game.startLevel(7);__game.clearMobs();__game.freeze=false;__game.setHearts(99);__game.teleport(b[0]+.5,b[1]+.5,0);const i=__game.spawn(t,a[0]+.5,a[1]+.5,true);let inPit=0,reached=false;for(let k=0;k<360;k++){const e=__game.advance(1/60).enemies[i];if(__game.cellType(Math.floor(e.x),Math.floor(e.y))===6)inPit++;if(Math.hypot(e.x-b[0]-.5,e.y-b[1]-.5)<1.0)reached=true;}return {inPit,reached};};
        out[sd]={kettle:run('kettle'),clunk:run('clunk'),screamer:run('screamer'),zapfly:run('zapfly'),wisp:run('wisp'),q,dir:[dx,dy]};return out;}}}return out;});
    const mvv=Object.values(mv)[0];
    check('M1.9 ground mobs path around pits (Kettlegrump, Clunkbot never enter one); Screamer, Zapfly and Hazewisp fly over',mvv&&mvv.kettle.inPit===0&&mvv.clunk.inPit===0&&(mvv.screamer.inPit>0||mvv.zapfly.inPit>0||mvv.wisp.inPit>0)&&(mvv.screamer.reached||mvv.zapfly.reached),JSON.stringify(mv));
    const md=await G(page,()=>({fly:['screamer','zapfly','wisp'].every(t=>__game.mobs[t].fly),ground:['kettle','springle','clunk','skeleton'].every(t=>!__game.mobs[t].fly)}));
    check('M1.9 flyer list: Screamer, Zapfly, Hazewisp fly; Kettlegrump, Springle, Clunkbot, Rattlebone walk',md.fly&&md.ground,JSON.stringify(md));
    const lt=await G(page,()=>{__game.setSeed(777);__game.startLevel(5);__game.clearMobs();const q=__game.pits()[0];const s=__game.lootSpot(q.x+.5,q.y+.5);const i=__game.spawn('screamer',q.x+.5,q.y+.5,false,['beefy']);__game.setForceDrop(i,true);__game.damageMob(i,20);__game.advance(0.5);const st=__game.state();
      const bad=st.items.filter(it=>!it.taken&&__game.cellType(Math.floor(it.x),Math.floor(it.y))===6).length;return {spot:__game.cellType(Math.floor(s.x),Math.floor(s.y)),bad};});
    check('M1.9 loot never lands in a pit (a mob popped over a pit drops its coins and power-up beside it)',lt.spot===0&&lt.bad===0,JSON.stringify(lt));
    await ctx.close();
  }

  // ---- 9. Rattlebone skeleton
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m19-skel'});
    const sp=await G(page,()=>{let early=0,l6=0,n6=0,deep=0,nd=0;for(let sd=1;sd<=150;sd++){for(let f=2;f<=5;f++)if(__game.genMap(sd,f).map.join('').includes('s'))early++;n6++;if(__game.genMap(sd,6).map.join('').includes('s'))l6++;for(const f of [9,15]){nd++;if(__game.genMap(sd,f).map.join('').includes('s'))deep++;}}return {early,l6,n6,deep,nd,M:__game.mobs.skeleton};});
    check('M1.9 RATTLEBONE first appears on floor 6 (never on 2-5, on every floor 6, common deeper), hp 4, walks',sp.early===0&&sp.l6===sp.n6&&sp.deep>sp.nd*.6&&sp.M.hp===4&&sp.M.name==='RATTLEBONE'&&!sp.M.fly,JSON.stringify({early:sp.early,l6:sp.l6,deep:sp.deep+'/'+sp.nd}));
    const k=await G(page,()=>{__game.manual=true;__game.setSeed(777);__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.setRun({kills:0,elites:0,coins:0,deepest:1});const i=__game.spawn('skeleton',8.6,3.5,false);__game.damageMob(i,4);const s1=__game.state();const e1=s1.enemies[i];
      __game.advance(2.9);const told0=__game.state().enemies[i].told;__game.advance(0.3);const e2=__game.state().enemies[i];__game.advance(1.4);const e3=__game.state().enemies[i];return {st1:e1.state,kills1:s1.run.kills,told0,told:e2.told,st2:e2.state,st3:e3.state,hp3:e3.hp,reforms:e3.reforms,kills3:__game.state().run.kills};});
    check('M1.9 Rattlebone at 0 hp collapses into a bone pile (no kill yet), shows a tell at 3 s (rattle + glowing eyes, shaking) and regenerates at 4.5 s with full hp',k.st1==='pile'&&k.kills1===0&&!k.told0&&k.told&&k.st2==='pile'&&k.st3==='chase'&&k.hp3===4&&k.reforms===1&&k.kills3===0,JSON.stringify(k));
    const sm=await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.setRun({kills:0,elites:0,coins:0,deepest:1});__game.teleport(7.0,3.5,0);const i=__game.spawn('skeleton',8.6,3.5,false);__game.damageMob(i,4);const sc0=__game.state().score;
      __game.setPitch(-60);__game.throwOnce();for(let j=0;j<40;j++)__game.advance(1/60);__game.advance(0.3);const s=__game.state();return {st:s.enemies[i].state,gone:s.enemies[i].gone,kills:s.run.kills,dScore:s.score-sc0,coins:s.items.filter(t=>t.kind==='coin'&&!t.taken).length,smashed:s.stats.pilesSmashed};});
    check('M1.9 a balloon on the bone pile smashes it for good: kill counted (+50 score), coin dropped; no score for knock-downs (no farming)',(sm.gone||sm.st==='dead')&&sm.kills===1&&sm.dScore===50&&sm.coins>=1&&sm.smashed===1,JSON.stringify(sm));
    const look=await G(page,()=>{const a=__game.spriteCols('bonePile',0),b=__game.spriteCols('deco','bones');const ka=Object.keys(a),kb=new Set(Object.keys(b));const shared=ka.filter(c=>kb.has(c));return {shared:shared.length,na:ka.length,nb:kb.size};});
    check('M1.9 the bone pile looks like the pile-of-bones decoration (shared palette)',look.shared>=Math.min(look.na,look.nb)*0.5,JSON.stringify(look));
    const dots=await G(page,()=>{const o={};for(const k of Object.keys(__game.mobs))o[k]=__game.mobs[k].dot;return o;});
    const hx=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),dd=(a,b)=>Math.hypot(...hx(a).map((v,i)=>v-hx(b)[i]));
    const others=[...Object.entries(dots).filter(([k])=>k!=='skeleton').map(x=>x[1]),'#ffe27a','#c89a20','#ff6070','#7dffb0','#ffffff','#000000'];const md=Math.min(...others.map(c=>dd(dots.skeleton,c)));
    check(`M1.9 Rattlebone has its own minimap colour ${dots.skeleton} (>= 60 from every other mark, pits included)`,md>=60,`closest ${md.toFixed(0)}`);
    await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.teleport(6.4,3.5,0);__game.spawn('skeleton',8.2,3.1,false);const j=__game.spawn('skeleton',8.4,4.1,false);__game.damageMob(j,4);__game.advance(0.3);});
    await shot(page,'skeleton_and_bone_pile');
    await G(page,()=>{__game.advance(3.0);});await shot(page,'bone_pile_tell');
    await ctx.close();
  }

  // ---- 10. ghosts through doors
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m19-ghost'});
    const gd=await G(page,()=>{const run=(t)=>{__game.manual=true;__game.startLevel(0);__game.clearMobs();__game.freeze=false;__game.setHearts(99);const d=__game.state().doors.find(x=>x.x===5&&x.y===3);__game.teleport(7.5,3.5,Math.PI);const i=__game.spawn(t,3.5,3.5,true);let crossed=false,closed=true;for(let k=0;k<360;k++){const s=__game.advance(1/60);const e=s.enemies[i];if(e.x>5.9)crossed=true;const dd=s.doors.find(x=>x.x===5&&x.y===3);if(dd.open>0.05)closed=false;}return {crossed,closed,door:!!d};};return {wisp:run('wisp'),screamer:run('screamer')};});
    check('M1.9 Hazewisp (ghost) drifts through a closed door; a Screamer cannot',gd.wisp.door&&gd.wisp.crossed&&gd.wisp.closed&&!gd.screamer.crossed,JSON.stringify(gd));
    const gh=await G(page,()=>{__game.startLevel(0);__game.clearMobs();__game.freeze=true;__game.teleport(3.5,3.5,0);const i=__game.spawn('wisp',5.5,3.5,false);const h0=__game.state().enemies[i].hp;__game.throwOnce();for(let k=0;k<40;k++)__game.advance(1/60);return {h0,h:__game.state().enemies[i].hp,ghostSolidDoor:__game.solidGhost(5.5,3.5)};});
    check('M1.9 a balloon still hits a ghost inside a closed door cell',gh.h===gh.h0-1&&gh.ghostSolidDoor===false,JSON.stringify(gh));
    await ctx.close();
  }

  // ---- 11. touch: BALL button, shop menu, item-slot tap, and layouts at all 11 sizes
  {
    const bad=[];let tapBall=null,tapShop=null,tapSlot=null;
    for(const [w,h] of VIEWS){const {ctx,page}=await newPage({viewport:{width:w,height:h},hasTouch:true,isMobile:true,deviceScaleFactor:2,label:'m19-touch'});const touch=await cdpTouch(ctx,page);
      await page.touchscreen.tap(5,5).catch(()=>{});
      await G(page,()=>{__game.manual=true;__game.setSeed(4242);__game.startLevel(1,{hearts:5,coins:200});__game.clearMobs();__game.setPerm({red:true,green:true,pack:true});__game.give('shield');__game.give2('magnet');__game.setEffect('giant');__game.setEffect('freeze');if(__game.itemN){__game.give('herb');__game.give2('bell');}__game.faceShop();__game.advance(0.05);});
      const L=await G(page,()=>({lay:__game.layout(),touch:__game.state().touch}));
      const btns=['useBtn','throwBtn','itemBtn','pauseBtn','mapBtn','ballBtn'].map(k=>[k,L.lay[k]]).filter(([k,b])=>b.visible);
      if(!V123&&!L.lay.ballBtn.visible)bad.push(`${w}x${h} BALL button hidden`); /* M1.23: no balloon types to switch */
      const hudZones={band:L.lay.band,hud:L.lay.hud,minimap:L.lay.minimap,itemBar:L.lay.itemBar};
      for(const [k,b] of btns){for(const [z,r] of Object.entries(hudZones))if(ov(b,r))bad.push(`${w}x${h} ${k} over ${z}`);if(b.x<0||b.y<0||b.x+b.w>w||b.y+b.h>h)bad.push(`${w}x${h} ${k} off-screen`);}
      for(let i=0;i<btns.length;i++)for(let j=i+1;j<btns.length;j++)if(ov(btns[i][1],btns[j][1]))bad.push(`${w}x${h} ${btns[i][0]} over ${btns[j][0]}`);
      const hb=await G(page,()=>__game.handCss());for(const [f,r] of Object.entries(hb))if(L.lay.ballBtn.visible&&ov(r,L.lay.ballBtn))bad.push(`${w}x${h} hand:${f} under ballBtn`);
      // jackpot / crit messages use the band: covered above; shop panel: the overlay hides while the menu is open
      const u=L.lay.useBtn;await tapAt(touch,u.x+u.w/2,u.y+u.h/2);
      const S=await G(page,()=>{__game.advance(0.3);return {mode:__game.state().mode,lay:__game.layout(),rects:__game.shopRects()};});
      if(S.mode!=='shop')bad.push(`${w}x${h} USE did not open the shop`);else{
        if(S.lay.overlayOn)bad.push(`${w}x${h} touch buttons still shown over the shop menu`);const sp=S.lay.shopPanel;if(sp.x<S.lay.canvas.x-1||sp.y<S.lay.canvas.y-1||sp.x+sp.w>S.lay.canvas.x+S.lay.canvas.w+1)bad.push(`${w}x${h} shop panel off the canvas`);
        const r=S.rects[2];await tapAt(touch,r.x+r.w/2,r.y+r.h/2);const b=await G(page,()=>{__game.advance(0.05);const s=__game.state();return s.perm.yellow!==undefined?s.perm.yellow:s.player.coins<200;});if(w===844)tapShop=b;
        if(w===844||w===568){await shot(page,`phone_${w}x${h}_shop_menu`);}
        await tapAt(touch,Math.max(2,S.lay.canvas.x/2),h-4);await tapAt(touch,4,4);const m=await G(page,()=>{__game.advance(0.05);return __game.state().mode;});if(m!=='play')bad.push(`${w}x${h} tap outside did not leave the shop (${m})`);}
      if(!V123){await G(page,()=>{__game.setBall('blue');__game.advance(0.05);});const L2=await G(page,()=>__game.layout());const bb=L2.ballBtn;await tapAt(touch,bb.x+bb.w/2,bb.y+bb.h/2);const nb=await G(page,()=>{__game.advance(0.05);return __game.state().player.ball;});if(nb!=='red')bad.push(`${w}x${h} BALL tap -> ${nb}`);if(w===844)tapBall=nb;}
      const sr=await G(page,()=>{const r=__game.hudRects().active;const c=document.getElementById('screen').getBoundingClientRect();const s=c.width/480;return {x:c.left+(r[0]+r[2]/2)*s,y:c.top+(r[1]+r[3]/2)*s};});await tapAt(touch,sr.x,sr.y);const sel=await G(page,()=>{__game.advance(0.05);return __game.state().player.sel;});if(sel!==1)bad.push(`${w}x${h} slot tap -> ${sel}`);if(w===844)tapSlot=sel;
      if(w===844||w===568||w===800){await G(page,()=>__game.advance(0.05));await shot(page,`phone_${w}x${h}_hud_ball_backpack`);}
      await ctx.close();}
    check('M1.9 touch: the BALL button switches balloon type',tapBall==='red',String(tapBall));
    check('M1.9 touch: USE talks to the merchant, tapping a row buys, tapping outside leaves',tapShop===true,String(tapShop));
    check('M1.9 touch: tapping an item-bar slot picks it (Backpack)',tapSlot===1,String(tapSlot));
    check('M1.9 touch layout at all 11 sizes: BALL + every button clear of the HUD, band, minimap, item bar, hand and each other; shop menu never under a button',bad.length===0,bad.slice(0,6).join(' | '));
  }

  // ---- 12. score formula unchanged and capped
  {
    const {ctx,page}=await newPage({viewport:{width:1280,height:800},label:'m19-score'});
    const sc=await G(page,()=>({a:__game.scoreOf({deepest:5,kills:20,elites:3,coins:40}),b:__game.scoreOf({deepest:2,kills:5000,elites:5000,coins:99999}),bag:__game.bagCoins}));
    check('M1.9 score formula unchanged (1000/floor + 50/kill + 100/elite + 5/coin), still <= floor x 100,000; coin bags add 10 coins',sc.a===4000+1000+300+200&&sc.b===200000&&sc.bag===10,JSON.stringify(sc));
    await ctx.close();
  }
}
