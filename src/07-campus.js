/* ============================================================
   VIRTUAL CAMPUS — canvas, tile map, buildings, walking avatars
   ============================================================ */
const Campus = (() => {
  const T=16, COLS=30, ROWS=20, W=COLS*T, H=ROWS*T, SC=3;
  const PLACE = { library:[2,2,7,5], ailab:[11,2,8,5], community:[21,2,7,5], challenge:[2,12,7,5], achieve:[11,12,8,5], cert:[21,12,7,5] };
  const B = BUILDINGS.map(b=>{ const [x,y,w,h]=PLACE[b.id]; const cx=(x*T)+(w*T)/2; return {...b, x,y,w,h, px:x*T, py:y*T, pw:w*T, ph:h*T, cx, door:{c:Math.floor(cx/T), r:y+h}}; });
  let canvas, ctx, bg, raf=null, keys={}, player, npcs=[], frame=0, hover=null, nearDoor=null, pendingEnter=null, marker=null, bubbleT=0, active=false;
  const blocked = new Set(); const key=(c,r)=>c+','+r;

  function buildGrid(){
    blocked.clear();
    for (let c=0;c<COLS;c++){ blocked.add(key(c,0)); blocked.add(key(c,ROWS-1)); }
    for (let r=0;r<ROWS;r++){ blocked.add(key(0,r)); blocked.add(key(COLS-1,r)); }
    B.forEach(b=>{ for(let c=b.x;c<b.x+b.w;c++) for(let r=b.y;r<b.y+b.h;r++) blocked.add(key(c,r)); });
    [[14,9],[15,9],[14,10],[15,10],[5,10],[6,10],[23,10],[24,10]].forEach(([c,r])=>blocked.add(key(c,r)));
  }
  const isBlocked = (c,r) => c<0||r<0||c>=COLS||r>=ROWS||blocked.has(key(c,r));
  const isPath = (c,r) => (r>=7&&r<=11&&c>=1&&c<=28) || (r>=17&&r<=18&&c>=1&&c<=28) || ((c===9||c===10||c===19||c===20)&&r>=12&&r<=16) || ((c===9||c===10||c===19||c===20)&&r>=1&&r<=6);

  // seeded random for stable decoration
  let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };

  function renderBG(){
    bg = document.createElement('canvas'); bg.width=W*SC; bg.height=H*SC;
    const g = bg.getContext('2d'); g.imageSmoothingEnabled=false; g.setTransform(SC,0,0,SC,0,0); seed=7;
    for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++){
      const x=c*T, y=r*T;
      if (isPath(c,r)){
        g.fillStyle = (c+r)%2 ? '#262c66' : '#2a3070'; g.fillRect(x,y,T,T);
        g.fillStyle='#1d2358'; g.fillRect(x,y+T-1,T,1); g.fillRect(x+T-1,y,1,T);
      } else {
        g.fillStyle='#12322a'; g.fillRect(x,y,T,T);
        for (let k=0;k<6;k++){ g.fillStyle = rnd()<.5 ? '#174034' : '#0e2a22'; g.fillRect(x+Math.floor(rnd()*15), y+Math.floor(rnd()*15), 1, 2); }
        if (rnd()<.08){ g.fillStyle = pick(['#ff4fae','#ffd447','#2ee6ff']); g.fillRect(x+Math.floor(rnd()*12)+2, y+Math.floor(rnd()*12)+2, 2, 2); }
      }
    }
    // circuit traces on plaza
    g.fillStyle='#2ee6ff33';
    g.fillRect(24,9.5*T,W-48,1); g.fillRect(24,9.5*T,1,T); g.fillRect(W-25,9.5*T-T,1,T);
    for (let i=0;i<6;i++){ const x = 40+i*72; g.fillRect(x,7*T+3,1,10); g.fillRect(x-2,7*T+12,5,1); }
    g.fillStyle='#ff4fae33'; g.fillRect(24,17.5*T,W-48,1);
    // border trees
    for (let c=0;c<COLS;c++){ tree(g,c*T,-4,c%3); tree(g,c*T,(ROWS-1)*T-2,(c+1)%3); }
    for (let r=1;r<ROWS-1;r++){ tree(g,-2,r*T-4,r%3); tree(g,(COLS-1)*T+2,r*T-4,(r+2)%3); }
    // benches
    bench(g,5*T,10*T); bench(g,23*T,10*T);
    // buildings
    B.forEach(b=>building(g,b));
  }
  function tree(g,x,y,v){
    g.fillStyle='#3b2516'; g.fillRect(x+6,y+12,4,7);
    const cols = [['#0f4a36','#16664a','#22825c'],['#123f40','#1a5c5a','#28807a'],['#2a1d55','#3d2a7a','#5a3fa8']][v];
    g.fillStyle='#05061a'; g.fillRect(x+1,y+1,14,13); g.fillStyle=cols[0]; g.fillRect(x+2,y+2,12,11); g.fillStyle=cols[1]; g.fillRect(x+3,y+2,9,7); g.fillStyle=cols[2]; g.fillRect(x+4,y+3,4,3);
  }
  function bench(g,x,y){ g.fillStyle='#05061a'; g.fillRect(x+1,y+5,30,8); g.fillStyle='#8a5a34'; g.fillRect(x+2,y+6,28,3); g.fillStyle='#6b4226'; g.fillRect(x+2,y+9,28,2); g.fillStyle='#3a3f7a'; g.fillRect(x+4,y+11,2,3); g.fillRect(x+26,y+11,2,3); }
  function building(g,b){
    const {px:x,py:y,pw:w,ph:h} = b;
    g.fillStyle='#0006'; g.fillRect(x+4,y+h-2,w,6);
    // wall
    g.fillStyle='#05061a'; g.fillRect(x-1,y+26,w+2,h-25);
    g.fillStyle='#1b2054'; g.fillRect(x,y+27,w,h-27);
    g.fillStyle='#232a6a'; g.fillRect(x,y+27,w,3);
    for (let i=0;i<w;i+=8){ g.fillStyle='#181d4c'; g.fillRect(x+i,y+30,1,h-30); }
    // roof
    g.fillStyle='#05061a'; g.fillRect(x-4,y-1,w+8,30);
    g.fillStyle=b.roof; g.fillRect(x-3,y,w+6,28);
    for (let j=4;j<28;j+=5){ g.fillStyle=shade(b.roof,-0.25); g.fillRect(x-3,y+j,w+6,1); }
    g.fillStyle=shade(b.roof,0.25); g.fillRect(x-3,y,w+6,2);
    // sign plate
    g.fillStyle='#05061a'; g.fillRect(x+4,y+17,w-8,11); g.fillStyle='#0b0f2c'; g.fillRect(x+5,y+18,w-10,9);
    g.font='7px Silkscreen, monospace'; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle=b.color; g.fillText(b.name.toUpperCase(), x+w/2, y+22.5);
    // roof icon
    const ic = iconCanvas(b.icon, b.color, '#eef0fb', '#151a3e'); g.drawImage(ic, Math.round(x+w/2-6), y+3);
  }

  function makeChar(look, c, r, name, isPlayer){ return { look, x:c*T+8, y:r*T+12, path:[], wait:Math.random()*120, f:0, back:false, moving:false, name, isPlayer, bubble:null }; }
  function bfs(sc,sr,tc,tr){
    if (isBlocked(tc,tr)) return null; const q=[[sc,sr]], prev=new Map([[key(sc,sr),null]]);
    while (q.length){ const [c,r]=q.shift(); if (c===tc&&r===tr) break;
      for (const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nc=c+dc, nr=r+dr, k=key(nc,nr); if (!isBlocked(nc,nr) && !prev.has(k)){ prev.set(k,[c,r]); q.push([nc,nr]); } } }
    if (!prev.has(key(tc,tr))) return null; const path=[]; let cur=[tc,tr]; while (cur && !(cur[0]===sc&&cur[1]===sr)){ path.unshift(cur); cur=prev.get(key(cur[0],cur[1])); } return path;
  }
  const tileOf = ch => [Math.floor(ch.x/T), Math.floor((ch.y-4)/T)];
  function footFree(x,y){ const pts=[[x-4,y-3],[x+4,y-3],[x-4,y],[x+4,y]]; return pts.every(([px,py])=>!isBlocked(Math.floor(px/T),Math.floor(py/T))); }
  function stepTo(ch, tx, ty, sp){
    const dx=tx-ch.x, dy=ty-ch.y, d=Math.hypot(dx,dy); if (d<=sp){ ch.x=tx; ch.y=ty; return true; }
    ch.x+=dx/d*sp; ch.y+=dy/d*sp; ch.back = dy < -Math.abs(dx)*0.5; return false;
  }
  function updateChar(ch, sp){
    ch.moving=false;
    if (ch.path.length){ const [c,r]=ch.path[0]; ch.moving=true; if (stepTo(ch, c*T+8, r*T+12, sp)) ch.path.shift(); }
    if (ch.moving){ if (frame%9===0) ch.f++; } else ch.f=0;
  }

  function update(){
    frame++;
    // keyboard
    let vx=0, vy=0; if (keys.ArrowLeft||keys.a) vx-=1; if (keys.ArrowRight||keys.d) vx+=1; if (keys.ArrowUp||keys.w) vy-=1; if (keys.ArrowDown||keys.s) vy+=1;
    if (vx||vy){ player.path=[]; pendingEnter=null; marker=null; const sp=1.4, n=Math.hypot(vx,vy); const nx=player.x+vx/n*sp, ny=player.y+vy/n*sp;
      if (footFree(nx,player.y)) player.x=nx; if (footFree(player.x,ny)) player.y=ny; player.back = vy<0; player.moving=true; if (frame%8===0) player.f++; }
    else updateChar(player, 1.5);
    if (!player.path.length && pendingEnter){ const b=pendingEnter; pendingEnter=null; enter(b); return; }
    if (!player.path.length) marker=null;
    // npcs wander
    npcs.forEach(n=>{ if (!n.path.length){ if (n.wait>0) n.wait--; else { for (let k=0;k<20;k++){ const c=1+Math.floor(Math.random()*28), r=1+Math.floor(Math.random()*18); if (!isBlocked(c,r)){ const [sc,sr]=tileOf(n); const p=bfs(sc,sr,c,r); if (p && p.length<30){ n.path=p; break; } } } n.wait = 90+Math.random()*240; } } updateChar(n, 0.55); if (n.bubble && n.bubble.until<frame) n.bubble=null; });
    if (++bubbleT > 260){ bubbleT=0; const n=pick(npcs); if (n) n.bubble={text:pick(BUBBLES), until:frame+200}; }
    // door detection
    const [pc,pr]=tileOf(player); const nd = B.find(b=>b.door.c===pc && b.door.r===pr) || null;
    if (nd!==nearDoor){ nearDoor=nd; renderPrompt(); }
  }

  function draw(){
    ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(bg,0,0); ctx.setTransform(SC,0,0,SC,0,0); ctx.imageSmoothingEnabled=false;
    const t = frame/60;
    // building animation: windows, doors, locks, hover
    B.forEach(b=>{
      const locked = b.id==='cert' && !finalPassed();
      const winY = b.py+36, positions = [b.px+6, b.px+18, b.px+b.pw-28, b.px+b.pw-16];
      positions.forEach((wx,i)=>{ const on = locked ? false : ((Math.floor(t*0.7+i*1.3+b.x)%5)!==0);
        ctx.fillStyle='#05061a'; ctx.fillRect(wx-1,winY-1,12,12); ctx.fillStyle = on ? b.color : '#262c66'; ctx.fillRect(wx,winY,10,10);
        ctx.fillStyle = on ? '#ffffffaa' : '#3a4596'; ctx.fillRect(wx+1,winY+1,3,3); ctx.fillStyle='#05061a'; ctx.fillRect(wx+4.5,winY,1,10); });
      const dx = b.cx-10, dy = b.py+b.ph-22;
      ctx.fillStyle='#05061a'; ctx.fillRect(dx-2,dy-2,24,24); ctx.fillStyle=b.color; ctx.fillRect(dx-1,dy-1,22,23); ctx.fillStyle='#0b0f2c'; ctx.fillRect(dx+1,dy+1,18,21);
      if (!locked){ ctx.fillStyle = b.color+'55'; ctx.fillRect(dx+1, dy+1+((frame>>2)%21), 18, 2); ctx.fillStyle='#ffffff22'; ctx.fillRect(dx+1,dy+1,18,4); }
      if (locked){ ctx.strokeStyle='#9aa3da'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(dx+1,dy+1); ctx.lineTo(dx+19,dy+21); ctx.moveTo(dx+19,dy+1); ctx.lineTo(dx+1,dy+21); ctx.stroke(); ctx.drawImage(iconCanvas('lock','#ffd447'), dx+4, dy+5); }
      // door glow on the path
      ctx.fillStyle = b.color + (nearDoor===b ? '66' : '22'); ctx.fillRect(b.door.c*T, b.door.r*T, T, T);
      if (hover===b || nearDoor===b){ ctx.strokeStyle = '#ffd447'; ctx.lineWidth = 1.5; ctx.strokeRect(b.px-5, b.py-3, b.pw+10, b.ph+5); }
    });
    // cyber core
    const cx=15*T, cy=9*T; ctx.fillStyle='#05061a'; ctx.fillRect(cx-17,cy+18,34,12); ctx.fillStyle='#303b8f'; ctx.fillRect(cx-16,cy+19,32,10); ctx.fillStyle='#3d4aa8'; ctx.fillRect(cx-16,cy+19,32,2);
    ctx.fillStyle='#05061a'; ctx.fillRect(cx-9,cy-10,18,30); ctx.fillStyle='#141a4a'; ctx.fillRect(cx-8,cy-9,16,28);
    for (let i=0;i<5;i++){ const on = (Math.floor(t*4)+i)%5; ctx.fillStyle = on? '#2ee6ff' : '#ff4fae'; ctx.fillRect(cx-6, cy-6+i*5, on?10:6, 2); ctx.fillStyle='#47f59a'; if ((Math.floor(t*3)+i)%3===0) ctx.fillRect(cx+5, cy-6+i*5, 1, 2); }
    const bob = Math.round(Math.sin(t*2)*2); ctx.fillStyle='#2ee6ff33'; ctx.beginPath(); ctx.arc(cx, cy-20+bob, 10, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#05061a'; ctx.beginPath(); ctx.moveTo(cx,cy-29+bob); ctx.lineTo(cx+7,cy-20+bob); ctx.lineTo(cx,cy-11+bob); ctx.lineTo(cx-7,cy-20+bob); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#2ee6ff'; ctx.beginPath(); ctx.moveTo(cx,cy-27+bob); ctx.lineTo(cx+5,cy-20+bob); ctx.lineTo(cx,cy-13+bob); ctx.lineTo(cx-5,cy-20+bob); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#eef0fb'; ctx.fillRect(cx-2,cy-23+bob,2,3);
    // lamps
    [[3,7],[26,7],[3,11],[26,11],[8,17],[21,17]].forEach(([c,r],i)=>{ const x=c*T+8, y=r*T+4, fl = 0.75+0.25*Math.sin(t*3+i);
      const grd = ctx.createRadialGradient(x,y-10,1,x,y-10,26); grd.addColorStop(0,`rgba(255,212,71,${0.28*fl})`); grd.addColorStop(1,'rgba(255,212,71,0)'); ctx.fillStyle=grd; ctx.fillRect(x-26,y-36,52,52);
      ctx.fillStyle='#05061a'; ctx.fillRect(x-1,y-12,3,14); ctx.fillRect(x-3,y-16,7,5); ctx.fillStyle='#ffd447'; ctx.fillRect(x-2,y-15,5,3); });
    // target marker
    if (marker){ const s = 3+Math.sin(t*8); ctx.strokeStyle='#ffd447'; ctx.lineWidth=1; ctx.strokeRect(marker[0]*T+8-s, marker[1]*T+10-s/2, s*2, s); }
    // characters (y-sorted)
    [...npcs, player].sort((a,b)=>a.y-b.y).forEach(ch=>{
      const sp = avatarCanvas(ch.look, ch.moving ? (ch.f%2) : 0, ch.back);
      ctx.fillStyle='#0007'; ctx.fillRect(Math.round(ch.x)-5, Math.round(ch.y)-1, 10, 3);
      ctx.drawImage(sp, Math.round(ch.x-7), Math.round(ch.y-18));
      ctx.font='5px Silkscreen, monospace'; ctx.textAlign='center'; ctx.textBaseline='bottom';
      const label = ch.isPlayer ? 'YOU' : ch.name; const tw = ctx.measureText(label).width;
      ctx.fillStyle = '#05061acc'; ctx.fillRect(Math.round(ch.x-tw/2-2), Math.round(ch.y-26), Math.ceil(tw+4), 7);
      ctx.fillStyle = ch.isPlayer ? '#ffd447' : '#eef0fb'; ctx.fillText(label, Math.round(ch.x), Math.round(ch.y-19.5));
      if (ch.bubble){ ctx.font='6px Lexend, sans-serif'; const w2=Math.min(ctx.measureText(ch.bubble.text).width+8, 150); const bx=Math.max(4,Math.min(W-w2-4, ch.x-w2/2)), by=ch.y-40;
        ctx.fillStyle='#05061a'; ctx.fillRect(bx-1,by-1,w2+2,12); ctx.fillStyle='#eef0fb'; ctx.fillRect(bx,by,w2,10); ctx.fillRect(Math.round(ch.x)-1,by+10,3,3);
        ctx.fillStyle='#151a3e'; ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillText(ch.bubble.text, bx+4, by+5.5, w2-8); }
    });
  }

  function loop(){ if (!active) return; update(); if (!active) return; draw(); raf = requestAnimationFrame(loop); }
  function toLogical(e){ const r = canvas.getBoundingClientRect(); return [ (e.clientX-r.left)/r.width*W, (e.clientY-r.top)/r.height*H ]; }
  const bAt = (x,y) => B.find(b=> x>=b.px-3 && x<=b.px+b.pw+3 && y>=b.py && y<=b.py+b.ph);
  function onClick(e){
    const [x,y]=toLogical(e); const b = bAt(x,y); const [pc,pr]=tileOf(player);
    if (b){ const p = bfs(pc,pr,b.door.c,b.door.r); if (p){ player.path=p; pendingEnter=b; marker=[b.door.c,b.door.r]; if (!p.length) { pendingEnter=null; enter(b); } } return; }
    const c=Math.floor(x/T), r=Math.floor(y/T); const p = bfs(pc,pr,c,r); if (p){ player.path=p; pendingEnter=null; marker=[c,r]; }
  }
  function onMove(e){ const [x,y]=toLogical(e); const b=bAt(x,y); hover=b||null; canvas.style.cursor = b?'pointer':'crosshair';
    const tip=$('#campusTip'); if (!tip) return; if (b){ const r=canvas.getBoundingClientRect(); const locked = b.id==='cert' && !finalPassed();
      tip.classList.remove('hidden'); tip.innerHTML=`<b>${esc(b.name)}</b>${esc(b.desc)}${locked?'<br><span style="color:var(--gold)">🔒 Locked until you pass the final assessment</span>':''}<br><span class="muted" style="font-size:12px">Click to walk there</span>`;
      const lx = e.clientX - r.left + 14, ly = e.clientY - r.top + 14; tip.style.left = Math.min(lx, r.width-250)+'px'; tip.style.top = Math.min(ly, r.height-90)+'px'; } else tip.classList.add('hidden'); }
  function renderPrompt(){ const el=$('#campusPrompt'); if (!el) return; if (!nearDoor){ el.classList.add('hidden'); return; }
    const locked = nearDoor.id==='cert' && !finalPassed();
    el.classList.remove('hidden'); el.innerHTML = `<span>${locked?'🔒 ':''}${esc(nearDoor.name)}</span><kbd>E</kbd><button class="btn small" data-act="campusEnter">${locked?'View requirements':'Enter'}</button>`; }
  function enter(b){ S.lastDoor=b.view; toast(`Entering ${esc(b.name)}…`); stop(); go(b.view); }
  const kd = e => { if (!active || e.target.matches('input,textarea')) return; const k = e.key.length===1 ? e.key.toLowerCase() : e.key;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(k)){ keys[k]=true; if (k.startsWith('Arrow')) e.preventDefault(); }
    if ((k==='e'||k==='Enter') && nearDoor){ e.preventDefault(); enter(nearDoor); } };
  const ku = e => { const k = e.key.length===1 ? e.key.toLowerCase() : e.key; keys[k]=false; };

  function start(cv){
    canvas = cv; ctx = canvas.getContext('2d'); canvas.width=W*SC; canvas.height=H*SC; ctx.imageSmoothingEnabled=false;
    buildGrid(); renderBG();
    player = player && player.look===S.user.look ? player : makeChar(S.user.look, 12, 9, S.user.name, true);
    player.path=[]; pendingEnter=null; marker=null; nearDoor=null; keys={};
    if (S.lastDoor){ const b=B.find(x=>x.view===S.lastDoor); if (b){ player.x=b.door.c*T+8; player.y=(b.door.r+1)*T+4; if (isBlocked(b.door.c,b.door.r+1)) player.y=b.door.r*T+12; player.back=false; } }
    if (!npcs.length){ const spots=[[5,8],[24,8],[8,18],[17,18],[26,17],[12,11]]; npcs = COMMUNITY_USERS.filter(u=>u.status!=='off').slice(0,6).map((u,i)=>makeChar(u.look, spots[i][0], spots[i][1], u.name, false)); }
    canvas.addEventListener('click', onClick); canvas.addEventListener('mousemove', onMove); canvas.addEventListener('mouseleave', ()=>{ hover=null; const t=$('#campusTip'); if (t) t.classList.add('hidden'); });
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    active = true; const go2 = ()=>{ if (active){ renderBG(); } }; if (document.fonts && document.fonts.ready) document.fonts.ready.then(go2);
    loop();
  }
  function stop(){ active=false; if (raf) cancelAnimationFrame(raf); raf=null; window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); keys={}; }
  window.EXTRA_ACTIONS = Object.assign(window.EXTRA_ACTIONS||{}, { campusEnter: () => { if (nearDoor) enter(nearDoor); }, campusGo: id => { const b=B.find(x=>x.id===id); if (!b) return; if (active){ const [pc,pr]=tileOf(player); const p=bfs(pc,pr,b.door.c,b.door.r); if (p){ player.path=p; pendingEnter=b; marker=[b.door.c,b.door.r]; if(!p.length){ pendingEnter=null; enter(b);} return; } } go(b.view); } });
  return { start, stop, buildings:B };
})();
const BUBBLES = ['Just passed Module 2!','Anyone in Study Squad tonight?','The phishing lesson was eye-opening','BYTE explained hashing so well','Going for Phish Spotter!','Never share your OTP!','Turned on MFA everywhere today','Log Detective is so fun','WPA3 or nothing 😎','Halfway to my certificate!'];

function viewCampus(el){
  const online = COMMUNITY_USERS.filter(u=>u.status!=='off').length + 1;
  el.innerHTML = `<div class="page-head"><div><div class="crumbs">Virtual Campus</div><h1>Cybersity Campus</h1><p>Walk with the arrow keys or WASD, or click/tap anywhere to move. Click a building to walk to its door and enter.</p></div><div style="display:flex; gap:8px; flex-wrap:wrap"><span class="pill green">● ${online} online</span><span class="pill gold">LV ${levelInfo().n} · ${S.xp} XP</span></div></div>
  <div class="campus-wrap"><canvas id="campus" class="px" aria-label="Virtual campus map. Use the building buttons below for keyboard navigation."></canvas>
    <div class="campus-hud"><span class="pill">${icon('campus','#2ee6ff',12)} Night shift · Sector 7</span></div>
    <div class="prompt hidden" id="campusPrompt"></div><div class="tooltip hidden" id="campusTip"></div></div>
  <div class="quick-nav">${Campus.buildings.map(b=>{ const locked=b.id==='cert'&&!finalPassed(); return `<button class="qn ${locked?'locked':''}" data-act="campusGo" data-arg="${b.id}">${icon(locked?'lock':b.icon, b.color, 24)}<b>${esc(b.name)}</b><small>${esc(b.desc)}</small></button>`; }).join('')}</div>`;
  Campus.start($('#campus'));
}
