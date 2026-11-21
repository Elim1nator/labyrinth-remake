// Local stub of the Labyrinth high score API (docs/research/highscore-api.md) for tests ONLY.
// Serves a build directory and the same-origin API under /api/labyrinth. Never talks to the live board.
// Usage (manual): node tests/hs_stub.mjs <buildDir> [port]
import http from 'http';
import fs from 'fs';
import path from 'path';
const NAME_RE=/^[A-Za-z0-9 _.\-]+$/, SEED_RE=/^[A-Za-z0-9_\-]{1,32}$/;
export function validateEntry(b){
  if(!b||typeof b!=='object'||Array.isArray(b))return 'body must be a JSON object';
  const name=typeof b.name==='string'?b.name.trim():null;
  if(!name||name.length<1||name.length>16||!NAME_RE.test(name))return 'invalid name';
  if(!Number.isInteger(b.floor)||b.floor<1||b.floor>10000)return 'invalid floor';
  if(!Number.isInteger(b.score)||b.score<0||b.score>10000000||b.score>b.floor*100000)return 'invalid score';
  if(typeof b.seed!=='string'||!SEED_RE.test(b.seed))return 'invalid seed';
  return '';
}
export function startStub({root,port=0,host='127.0.0.1'}={}){
  const st={scores:[],nextId:1,posts:[],requests:[],hits:{},mode:{health:'ok',scores:'ok',post:'ok'}};
  const send=(res,code,obj)=>{const b=JSON.stringify(obj);res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(b);};
  const ranked=()=>st.scores.slice().sort((a,b)=>b.score-a.score||a.created_at.localeCompare(b.created_at)||a.id-b.id).map((s,i)=>({...s,rank:i+1}));
  const limited=(ip)=>{const now=Date.now(),h=(st.hits[ip]||[]).filter(t=>now-t<3600e3);st.hits[ip]=h;return h.filter(t=>now-t<60e3).length>=5||h.length>=30;};
  const server=http.createServer((req,res)=>{
    const u=new URL(req.url,'http://x');st.requests.push({method:req.method,url:req.url,headers:{...req.headers}});
    if(u.pathname.startsWith('/api/labyrinth/')||u.pathname==='/api/labyrinth'){
      const ep=u.pathname.slice('/api/labyrinth'.length);
      if(ep==='/health'){if(req.method!=='GET')return send(res,405,{ok:false,error:'method not allowed'});
        if(st.mode.health==='down')return send(res,503,{ok:false,error:'down'});if(st.mode.health==='drop'){req.socket.destroy();return;}return send(res,200,{ok:true});}
      if(ep==='/scores'){
        if(req.method==='GET'){if(st.mode.scores==='error')return send(res,500,{ok:false,error:'boom'});
          let lim=u.searchParams.has('limit')?Number(u.searchParams.get('limit')):10;if(!Number.isInteger(lim)||lim<1)return send(res,400,{ok:false,error:'invalid limit'});lim=Math.min(100,lim);
          return send(res,200,{scores:ranked().slice(0,lim).map(s=>({rank:s.rank,name:s.name,score:s.score,floor:s.floor,seed:s.seed,created_at:s.created_at}))});}
        if(req.method==='POST'){let body='',big=false;req.on('data',c=>{body+=c;if(body.length>2048){big=true;}});req.on('end',()=>{
            const ip=req.socket.remoteAddress||'?';
            if(st.mode.post==='reject')return send(res,400,{ok:false,error:'rejected by stub'});
            if(st.mode.post==='error')return send(res,503,{ok:false,error:'unavailable'});
            if(limited(ip))return send(res,429,{ok:false,error:'rate limited'});
            if(big)return send(res,400,{ok:false,error:'body too large'});
            let b;try{b=JSON.parse(body);}catch(e){return send(res,400,{ok:false,error:'invalid json'});}
            const bad=validateEntry(b);(st.hits[ip]=st.hits[ip]||[]).push(Date.now());
            st.posts.push({body,parsed:b,ok:!bad,headers:{...req.headers}});
            if(bad)return send(res,400,{ok:false,error:bad});
            const s={id:st.nextId++,name:b.name.trim(),score:b.score,floor:b.floor,seed:b.seed,created_at:new Date().toISOString()};st.scores.push(s);
            const rank=ranked().find(x=>x.id===s.id).rank;return send(res,201,{ok:true,id:s.id,rank});});return;}
        return send(res,405,{ok:false,error:'method not allowed'});}
      return send(res,404,{ok:false,error:'not found'});}
    // static files from the build directory
    let p=decodeURIComponent(u.pathname);if(p==='/')p='/index.html';const f=path.join(root,path.normalize(p));
    if(!f.startsWith(path.resolve(root))||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);res.end('not found');return;}
    res.writeHead(200,{'Content-Type':f.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'});fs.createReadStream(f).pipe(res);
  });
  return new Promise(ok=>server.listen(port,host,()=>{const a=server.address();ok({url:`http://${host}:${a.port}`,port:a.port,state:st,
    reset(){st.scores.length=0;st.posts.length=0;st.requests.length=0;st.hits={};st.mode={health:'ok',scores:'ok',post:'ok'};},
    seed(rows){for(const r of rows)st.scores.push({id:st.nextId++,created_at:new Date(Date.now()-86400e3+st.nextId*1000).toISOString(),...r});},
    fillLimit(ip='127.0.0.1',n=5){st.hits[ip]=Array.from({length:n},()=>Date.now());st.hits['::ffff:'+ip]=st.hits[ip].slice();},
    clearLimit(){st.hits={};},
    close(){return new Promise(r=>{server.closeAllConnections?.();server.close(()=>r());});}});}));
}
if(process.argv[1]&&process.argv[1].endsWith('hs_stub.mjs')){const root=process.argv[2]||'.',port=+process.argv[3]||8787;startStub({root,port}).then(s=>console.log('stub on',s.url,'serving',root));}
