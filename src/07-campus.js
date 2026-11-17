/* ============================================================
   VIRTUAL CAMPUS — canvas, tile map, buildings, walking avatars
   ============================================================ */
const Campus = (() => {
  const T=16, COLS=30, ROWS=25, W=COLS*T, H=ROWS*T, SC=3;
  const PLACE = { library:[2,2,7,5], ailab:[11,2,8,5], community:[21,2,7,5], challenge:[2,12,7,5], achieve:[11,12,8,5], cert:[21,12,7,5], home:[12,19,6,4], compass:[21,7,1,2] };
  const B = [...BUILDINGS, HOME_BASE, CAREER_SIGN].map(b=>{ const [x,y,w,h]=PLACE[b.id]; const cx=(x*T)+(w*T)/2; return {...b, x,y,w,h, px:x*T, py:y*T, pw:w*T, ph:h*T, cx, door:{c:Math.floor(cx/T), r:y+h}}; });
  let canvas, ctx, bg, raf=null, keys={}, player, npcs=[], frame=0, hover=null, nearDoor=null, pendingEnter=null, marker=null, bubbleT=0, active=false;
  let guide = null, focusPt = null, tourZoom = false; // campus tour: BYTE walking on the map, and a camera point to look at instead of the player
  // Phone camera: on small screens show a zoomed 12x14-tile window that follows the player (UI.campusFull shows the whole map)
  const CAM_W=12*T, CAM_H=14*T; let zoom=false, vw=W, vh=H, camX=0, camY=0, camFX=0, camFY=0, camSnap=true;
  const world = () => ctx.setTransform(SC,0,0,SC,-camX*SC,-camY*SC), screen = () => ctx.setTransform(SC,0,0,SC,0,0);
  // Full screen (UI.campusFS): the view takes the screen's shape and covers it, so the camera follows the player along the cut-off side
  function sizeCanvas(){
    if (UI.campusFS){ const a = innerWidth/innerHeight; if (a >= W/H){ vw = W; vh = Math.round(W/a); } else { vh = H; vw = Math.round(H*a); } zoom = vw < W || vh < H; }
    else { zoom = !UI.campusFull && matchMedia('(max-width:640px)').matches; vw = zoom ? CAM_W : W; vh = zoom ? CAM_H : H;
      if (tourZoom && !zoom){ vw = Math.round(W/1.6); vh = Math.round(H/1.6); zoom = true; } } // the tour zooms in on desktop too
    canvas.width = vw*SC; canvas.height = vh*SC; ctx.imageSmoothingEnabled = false; canvas.style.aspectRatio = `${vw}/${vh}`; camSnap = true;
    const tb = $('#camToggle'); if (tb) tb.textContent = UI.campusFull ? 'Zoom in' : 'Full map';
  }
  function updateCam(){
    if (!zoom){ camX = camY = 0; return; }
    const g = guide && guide.path.length ? guide : null; // while BYTE walks, the camera follows BYTE
    const fx = g ? g.x : focusPt ? focusPt.x : player.x, fy = g ? g.y : focusPt ? focusPt.y : player.y;
    const tx = Math.max(0, Math.min(W-vw, fx-vw/2)), ty = Math.max(0, Math.min(H-vh, fy-10-vh/2));
    if (camSnap){ camFX = tx; camFY = ty; camSnap = false; } else { camFX += (tx-camFX)*0.12; camFY += (ty-camFY)*0.12; }
    camX = Math.round(camFX*SC)/SC; camY = Math.round(camFY*SC)/SC;
  }
  const onResize = () => { if (UI.campusFS || zoom !== (!UI.campusFull && matchMedia('(max-width:640px)').matches)) sizeCanvas(); };
  const blocked = new Set(); const key=(c,r)=>c+','+r;

  function buildGrid(){
    blocked.clear();
    for (let c=0;c<COLS;c++){ blocked.add(key(c,0)); blocked.add(key(c,ROWS-1)); }
    for (let r=0;r<ROWS;r++){ blocked.add(key(0,r)); blocked.add(key(COLS-1,r)); }
    B.forEach(b=>{ for(let c=b.x;c<b.x+b.w;c++) for(let r=b.y;r<b.y+b.h;r++) blocked.add(key(c,r)); });
    [[14,9],[15,9],[14,10],[15,10],[5,10],[6,10],[23,10],[24,10],[5,21],[6,21],[23,21],[24,21]].forEach(([c,r])=>blocked.add(key(c,r)));
  }
  const isBlocked = (c,r) => c<0||r<0||c>=COLS||r>=ROWS||blocked.has(key(c,r));
  const isPath = (c,r) => (r>=7&&r<=11&&c>=1&&c<=28) || (r>=17&&r<=18&&c>=1&&c<=28) || ((c===9||c===10||c===19||c===20)&&r>=12&&r<=16) || ((c===9||c===10||c===19||c===20)&&r>=1&&r<=6)
    || ((c===9||c===10||c===19||c===20)&&r>=19&&r<=22) || (r===23&&c>=9&&c<=20);

  // seeded random for stable decoration
  let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };

  function renderBG(){
    bg = document.createElement('canvas'); bg.width=W*SC; bg.height=H*SC;
    const g = bg.getContext('2d'); g.imageSmoothingEnabled=false; g.setTransform(SC,0,0,SC,0,0); seed=7; const P = pal();
    for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++){
      const x=c*T, y=r*T;
      if (isPath(c,r)){
        g.fillStyle = P.path[(c+r)%2 ? 0 : 1]; g.fillRect(x,y,T,T);
        g.fillStyle=P.pathLine; g.fillRect(x,y+T-1,T,1); g.fillRect(x+T-1,y,1,T);
        if (isDay() && r%2) g.fillRect(x+T/2,y,1,T-1); // staggered brick joints
      } else {
        g.fillStyle=P.grass; g.fillRect(x,y,T,T);
        for (let k=0;k<6;k++){ g.fillStyle = P.grassDots[rnd()<.5 ? 0 : 1]; g.fillRect(x+Math.floor(rnd()*15), y+Math.floor(rnd()*15), 1, 2); }
        if (rnd()<.08){ g.fillStyle = pick(P.sparkle); g.fillRect(x+Math.floor(rnd()*12)+2, y+Math.floor(rnd()*12)+2, 2, 2); }
      }
    }
    // circuit traces on plaza (chalk lines by day)
    g.fillStyle=P.trace[0];
    g.fillRect(24,9.5*T,W-48,1); g.fillRect(24,9.5*T,1,T); g.fillRect(W-25,9.5*T-T,1,T);
    for (let i=0;i<6;i++){ const x = 40+i*72; g.fillRect(x,7*T+3,1,10); g.fillRect(x-2,7*T+12,5,1); }
    g.fillStyle=P.trace[1]; g.fillRect(24,17.5*T,W-48,1);
    // border trees
    for (let c=0;c<COLS;c++){ tree(g,c*T,-4,c%3); tree(g,c*T,(ROWS-1)*T-2,(c+1)%3); }
    for (let r=1;r<ROWS-1;r++){ tree(g,-2,r*T-4,r%3); tree(g,(COLS-1)*T+2,r*T-4,(r+2)%3); }
    // benches
    bench(g,5*T,10*T); bench(g,23*T,10*T); bench(g,5*T,21*T); bench(g,23*T,21*T);
    // buildings (Home Base and the signpost are drawn live because they animate)
    B.forEach(b=>{ if (b.id!=='home' && b.id!=='compass') building(g,b); });
  }
  function tree(g,x,y,v){
    const P = pal(); g.fillStyle=P.trunk; g.fillRect(x+6,y+12,4,7);
    const cols = P.trees[v];
    g.fillStyle='#05061a'; g.fillRect(x+1,y+1,14,13); g.fillStyle=cols[0]; g.fillRect(x+2,y+2,12,11); g.fillStyle=cols[1]; g.fillRect(x+3,y+2,9,7); g.fillStyle=cols[2]; g.fillRect(x+4,y+3,4,3);
  }
  function bench(g,x,y){ g.fillStyle='#05061a'; g.fillRect(x+1,y+5,30,8); g.fillStyle='#8a5a34'; g.fillRect(x+2,y+6,28,3); g.fillStyle='#6b4226'; g.fillRect(x+2,y+9,28,2); g.fillStyle='#3a3f7a'; g.fillRect(x+4,y+11,2,3); g.fillRect(x+26,y+11,2,3); }
  function building(g,b){
    const {px:x,py:y,pw:w,ph:h} = b;
    g.fillStyle='#0006'; g.fillRect(x+4,y+h-2,w,6);
    // wall
    g.fillStyle='#05061a'; g.fillRect(x-1,y+26,w+2,h-25);
    const P = pal(); g.fillStyle=P.wall; g.fillRect(x,y+27,w,h-27);
    g.fillStyle=P.wallTop; g.fillRect(x,y+27,w,3);
    for (let i=0;i<w;i+=8){ g.fillStyle=P.wallLine; g.fillRect(x+i,y+30,1,h-30); }
    // roof
    g.fillStyle='#05061a'; g.fillRect(x-4,y-1,w+8,30);
    g.fillStyle=b.roof; g.fillRect(x-3,y,w+6,28);
    for (let j=4;j<28;j+=5){ g.fillStyle=shade(b.roof,-0.25); g.fillRect(x-3,y+j,w+6,1); }
    g.fillStyle=shade(b.roof,0.25); g.fillRect(x-3,y,w+6,2);
    // sign plate
    g.fillStyle='#05061a'; g.fillRect(x+4,y+17,w-8,11); g.fillStyle=P.plate; g.fillRect(x+5,y+18,w-10,9);
    g.font='7px Silkscreen, monospace'; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle=isDay() ? shade(b.color,0.45) : b.color; g.fillText(b.name.toUpperCase(), x+w/2, y+22.5);
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
    if (guide){ guide.moving = false;
      if (guide.path.length){ const [c,r] = guide.path[0]; guide.moving = true; if (stepTo(guide, c*T+8, r*T+12, 3)) guide.path.shift(); if (frame%7===0) guide.f++; }
      else if (guide.onArrive){ const fn = guide.onArrive; guide.onArrive = null; fn(); }
      if (guide.beam > 0) guide.beam--; }
    // keyboard
    let vx=0, vy=0; if (keys.ArrowLeft||keys.a) vx-=1; if (keys.ArrowRight||keys.d) vx+=1; if (keys.ArrowUp||keys.w) vy-=1; if (keys.ArrowDown||keys.s) vy+=1;
    if (vx||vy){ player.path=[]; pendingEnter=null; marker=null; const sp=1.4, n=Math.hypot(vx,vy); const nx=player.x+vx/n*sp, ny=player.y+vy/n*sp;
      if (footFree(nx,player.y)) player.x=nx; if (footFree(player.x,ny)) player.y=ny; player.back = vy<0; player.moving=true; if (frame%8===0) player.f++; }
    else updateChar(player, 1.5);
    if (!player.path.length && pendingEnter){ const b=pendingEnter; pendingEnter=null; enter(b); return; }
    if (!player.path.length) marker=null;
    // npcs wander
    npcs.forEach(n=>{ if (!n.path.length){ if (n.wait>0) n.wait--; else { for (let k=0;k<20;k++){ const c=1+Math.floor(Math.random()*(COLS-2)), r=1+Math.floor(Math.random()*(ROWS-2)); if (!isBlocked(c,r)){ const [sc,sr]=tileOf(n); const p=bfs(sc,sr,c,r); if (p && p.length<30){ n.path=p; break; } } } n.wait = 90+Math.random()*240; } } updateChar(n, 0.55); if (n.bubble && n.bubble.until<frame) n.bubble=null; });
    if (++bubbleT > 260){ bubbleT=0; const n=pick(npcs); if (n) n.bubble={text:pick(BUBBLES), until:frame+200}; }
    // door detection
    const [pc,pr]=tileOf(player); const nd = B.find(b=>b.door.c===pc && b.door.r===pr) || null;
    if (nd!==nearDoor){ nearDoor=nd; renderPrompt(); }
  }

  function draw(){
    updateCam(); ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(bg, -camX*SC, -camY*SC); world(); ctx.imageSmoothingEnabled=false;
    const t = frame/60;
    // building animation: windows, doors, locks, hover
    B.forEach(b=>{
      if (b.id==='home'){ drawDorm(ctx, b.px, b.py, b.pw, b.ph, homeStage(), t); }
      else if (b.id==='compass'){ drawSignpost(ctx, b.cx, b.py+b.ph, t); }
      else {
      const locked = bLocked(b.id), hacked = incHacked(b.id), col = hacked ? '#ff5d6e' : b.color;
      const P = pal(), winY = b.py+36, positions = [b.px+6, b.px+18, b.px+b.pw-28, b.px+b.pw-16];
      positions.forEach((wx,i)=>{ const on = hacked ? Math.random()<0.6 : locked ? false : ((Math.floor(t*0.7+i*1.3+b.x)%5)!==0);
        ctx.fillStyle='#05061a'; ctx.fillRect(wx-1,winY-1,12,12); ctx.fillStyle = on ? (P.winOn && !hacked ? P.winOn : col) : P.winOff; ctx.fillRect(wx,winY,10,10);
        ctx.fillStyle = on ? '#ffffffaa' : P.winGlintOff; ctx.fillRect(wx+1,winY+1,3,3); ctx.fillStyle='#05061a'; ctx.fillRect(wx+4.5,winY,1,10); });
      const dx = b.cx-10, dy = b.py+b.ph-22;
      ctx.fillStyle='#05061a'; ctx.fillRect(dx-2,dy-2,24,24); ctx.fillStyle=col; ctx.fillRect(dx-1,dy-1,22,23); ctx.fillStyle=P.doorIn; ctx.fillRect(dx+1,dy+1,18,21);
      if (!locked){ ctx.fillStyle = col+'55'; ctx.fillRect(dx+1, dy+1+((frame>>2)%21), 18, 2); ctx.fillStyle='#ffffff22'; ctx.fillRect(dx+1,dy+1,18,4); }
      if (locked){ ctx.strokeStyle='#9aa3da'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(dx+1,dy+1); ctx.lineTo(dx+19,dy+21); ctx.moveTo(dx+19,dy+1); ctx.lineTo(dx+1,dy+21); ctx.stroke(); ctx.drawImage(iconCanvas('lock','#ffd447'), dx+4, dy+5); }
      }
      // door glow on the path
      ctx.fillStyle = b.color + (nearDoor===b ? '66' : '22'); ctx.fillRect(b.door.c*T, b.door.r*T, T, T);
      if (hover===b || nearDoor===b){ ctx.strokeStyle = '#ffd447'; ctx.lineWidth = 1.5; if (b.id==='compass') ctx.strokeRect(b.px-14, b.py-14, b.pw+28, b.ph+16); else ctx.strokeRect(b.px-5, b.py-3, b.pw+10, b.ph+5); }
    });
    // cyber core (turns red while the campus is under attack)
    const alarm = incActive(), coreC = alarm ? '#ff5d6e' : '#2ee6ff';
    const cx=15*T, cy=9*T; ctx.fillStyle='#05061a'; ctx.fillRect(cx-17,cy+18,34,12); const CP = pal(); ctx.fillStyle=CP.coreBase[0]; ctx.fillRect(cx-16,cy+19,32,10); ctx.fillStyle=CP.coreBase[1]; ctx.fillRect(cx-16,cy+19,32,2);
    ctx.fillStyle='#05061a'; ctx.fillRect(cx-9,cy-10,18,30); ctx.fillStyle=CP.coreBody; ctx.fillRect(cx-8,cy-9,16,28);
    for (let i=0;i<5;i++){ const on = (Math.floor(t*4)+i)%5; ctx.fillStyle = on? coreC : (alarm ? '#ffd447' : '#ff4fae'); ctx.fillRect(cx-6, cy-6+i*5, on?10:6, 2); ctx.fillStyle='#47f59a'; if ((Math.floor(t*3)+i)%3===0) ctx.fillRect(cx+5, cy-6+i*5, 1, 2); }
    const bob = Math.round(Math.sin(t*2)*2); ctx.fillStyle=coreC+(alarm && frame%20<10 ? '66' : '33'); ctx.beginPath(); ctx.arc(cx, cy-20+bob, alarm ? 13 : 10, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#05061a'; ctx.beginPath(); ctx.moveTo(cx,cy-29+bob); ctx.lineTo(cx+7,cy-20+bob); ctx.lineTo(cx,cy-11+bob); ctx.lineTo(cx-7,cy-20+bob); ctx.closePath(); ctx.fill();
    ctx.fillStyle=coreC; ctx.beginPath(); ctx.moveTo(cx,cy-27+bob); ctx.lineTo(cx+5,cy-20+bob); ctx.lineTo(cx,cy-13+bob); ctx.lineTo(cx-5,cy-20+bob); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#eef0fb'; ctx.fillRect(cx-2,cy-23+bob,2,3);
    // lamps
    [[3,7],[26,7],[3,11],[26,11],[8,17],[21,17],[11,23],[18,23]].forEach(([c,r],i)=>{ const x=c*T+8, y=r*T+4, fl = alarm ? ((Math.floor(t*4)+i)%2 ? 1.6 : 0.15) : 0.75+0.25*Math.sin(t*3+i), rgb = alarm ? '255,70,90' : '255,212,71';
      if (alarm || CP.lamps){ const grd = ctx.createRadialGradient(x,y-10,1,x,y-10,26); grd.addColorStop(0,`rgba(${rgb},${0.28*fl})`); grd.addColorStop(1,`rgba(${rgb},0)`); ctx.fillStyle=grd; ctx.fillRect(x-26,y-36,52,52); }
      ctx.fillStyle='#05061a'; ctx.fillRect(x-1,y-12,3,14); ctx.fillRect(x-3,y-16,7,5); ctx.fillStyle = alarm ? (fl>1 ? '#ff5d6e' : '#5a1a26') : CP.lamps ? '#ffd447' : '#fff6d0'; ctx.fillRect(x-2,y-15,5,3); });
    // target marker
    if (marker){ const s = 3+Math.sin(t*8); ctx.strokeStyle='#ffd447'; ctx.lineWidth=1; ctx.strokeRect(marker[0]*T+8-s, marker[1]*T+10-s/2, s*2, s); }
    // characters (y-sorted)
    [...npcs, player, ...(guide ? [guide] : [])].sort((a,b)=>a.y-b.y).forEach(ch=>{
      if (ch === guide){ drawGuide(t); return; }
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
    drawIncident(t);
  }

  // BYTE on the map during the campus tour: bobbing robot with a name tag, beaming in with a column of light
  function drawGuide(t){
    const gx = Math.round(guide.x), gy = Math.round(guide.y), bob = guide.moving ? (guide.f%2) : Math.round(Math.sin(t*3)*1.5);
    if (guide.beam > 0){ const a = guide.beam/60; ctx.fillStyle = `rgba(46,230,255,${0.5*a})`; ctx.fillRect(gx-8, gy-60, 16, 60); ctx.fillStyle = `rgba(255,255,255,${0.6*a})`; ctx.fillRect(gx-3, gy-60, 6, 60);
      for (let i=0;i<8;i++){ ctx.fillStyle = i%2 ? '#ffd447' : '#2ee6ff'; ctx.fillRect(gx-10+((i*7+frame)%20), gy-10-((i*13+frame*2)%50), 2, 2); } }
    ctx.fillStyle='#0007'; ctx.fillRect(gx-5, gy-1, 10, 3);
    ctx.drawImage(botFace(guide.expr, guide.f, guide.wave), gx-7, gy-17+bob);
    ctx.font='5px Silkscreen, monospace'; ctx.textAlign='center'; ctx.textBaseline='bottom'; const tw = ctx.measureText('BYTE').width;
    ctx.fillStyle='#5d2fb0'; ctx.fillRect(gx-tw/2-2, gy-25+bob, tw+4, 7); ctx.fillStyle='#fff'; ctx.fillText('BYTE', gx, gy-18.5+bob);
  }
  // Campus Incident layer: red sky, glitching hacked buildings, restore animation, alert text and the win celebration
  function bigText(txt, y, size, col){ size = Math.min(size*2.2, (vw-16)/(txt.length*0.5)); ctx.font=`${size}px "Jersey 10", "Press Start 2P", monospace`; ctx.textAlign='center'; ctx.textBaseline='middle';
    const w = ctx.measureText(txt).width; ctx.fillStyle='#05061ad9'; ctx.fillRect(vw/2-w/2-6, y-size, w+12, size*2); ctx.fillStyle='#000'; ctx.fillText(txt, vw/2+1, y+1); ctx.fillStyle=col; ctx.fillText(txt, vw/2, y); }
  function drawIncident(t){
    const act = incActive(), now = Date.now();
    if (act){
      const pulse = 0.5+0.5*Math.sin(t*4);
      screen(); // tints are drawn over the visible view
      ctx.fillStyle = `rgba(255,40,70,${0.03+0.03*pulse})`; ctx.fillRect(0,0,vw,vh);
      const sky = ctx.createLinearGradient(0,0,0,vh*0.3); sky.addColorStop(0,`rgba(255,30,60,${0.3+0.1*pulse})`); sky.addColorStop(1,'rgba(255,30,60,0)'); ctx.fillStyle=sky; ctx.fillRect(0,0,vw,vh*0.3);
      const vig = ctx.createRadialGradient(vw/2,vh/2,vh*0.35,vw/2,vh/2,vh*0.75); vig.addColorStop(0,'rgba(255,30,60,0)'); vig.addColorStop(1,`rgba(255,30,60,${0.22+0.12*pulse})`); ctx.fillStyle=vig; ctx.fillRect(0,0,vw,vh);
      world();
      INCIDENT.forEach(x=>{ if (!S.incident.secured.includes(x.b) || (UI.incFx && UI.incFx.id===x.b)) return; const b = B.find(v=>v.id===x.b);
        ctx.strokeStyle='rgba(71,245,154,0.75)'; ctx.lineWidth=1.5; ctx.strokeRect(b.px-4, b.py-2, b.pw+8, b.ph+3); ctx.drawImage(dormIcon('shield','#47f59a'), b.cx-6, b.py-14); });
      B.forEach(b=>{ if (!incHacked(b.id)) return; const x=b.px-3, w=b.pw+6;
        ctx.fillStyle = `rgba(255,60,80,${0.1+0.14*Math.random()})`; ctx.fillRect(x, b.py, w, b.ph);
        if (Math.random()<0.55) for (let k=0;k<3;k++){ const sy = b.py+Math.floor(Math.random()*(b.ph-5)), sh = 2+Math.floor(Math.random()*4), off = Math.round((Math.random()-0.5)*10);
          ctx.drawImage(canvas, (x-camX)*SC, (sy-camY)*SC, w*SC, sh*SC, x+off, sy, w, sh); }
        if (Math.random()<0.06){ ctx.fillStyle='rgba(5,6,26,0.6)'; ctx.fillRect(x, b.py, w, b.ph); }
        if (frame%40 < 28){ ctx.font='6px Silkscreen, monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; const tw=ctx.measureText('HACKED').width;
          ctx.fillStyle='#05061a'; ctx.fillRect(b.cx-tw/2-3, b.py-11, tw+6, 9); ctx.fillStyle='#ff5d6e'; ctx.fillText('HACKED', b.cx, b.py-6.5); } });
    }
    const fx = UI.incFx;
    if (fx){ if (!fx.at) fx.at = now; const age = (now-fx.at)/1000, b = B.find(x=>x.id===fx.id);
      if (b && age < 2.6){ const k = 1-age/2.6, mx = b.cx, my = b.py+b.ph/2;
        ctx.fillStyle=`rgba(71,245,154,${age<0.25 ? 0.85 : 0.75*k})`; ctx.fillRect(b.px-3, b.py, b.pw+6, b.ph);
        ctx.strokeStyle=`rgba(71,245,154,${k})`; ctx.lineWidth=3; for (const d of [0, 0.35]){ const a2 = age-d; if (a2>0){ ctx.beginPath(); ctx.arc(mx, my, 8+a2*90, 0, Math.PI*2); ctx.stroke(); } }
        for (let i=0;i<24;i++){ const a=i/24*Math.PI*2, r=10+age*70; ctx.fillStyle = i%2 ? '#ffd447' : '#47f59a'; ctx.globalAlpha=k; ctx.fillRect(mx+Math.cos(a)*r, my+Math.sin(a)*r*0.8, 3, 3); }
        ctx.globalAlpha=1; const s = 12*(1+Math.min(age*5,1)*1.2); ctx.drawImage(dormIcon('shield','#47f59a'), mx-s/2, b.py-s-4-Math.min(age,0.5)*8, s, s);
        ctx.font='8px Silkscreen, monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#05061a'; ctx.fillRect(mx-28, b.py+b.ph+3, 56, 12); ctx.fillStyle='#47f59a'; ctx.fillText('SECURED', mx, b.py+b.ph+9.5); }
      else if (age >= 2.6){ UI.incFx = null; if (act && incAllSecured()) incWin(); } }
    screen(); // alert text and fireworks are placed on the visible view
    if (UI.incAlert){ const age = (now-UI.incAlert)/1000; if (act && age < 3){ if (Math.floor(age*4)%2===0) bigText('! CAMPUS UNDER ATTACK !', vh*0.42, 12, '#ff5d6e'); } else UI.incAlert = 0; }
    if (UI.incWin){ const age = (now-UI.incWin)/1000, fs = Math.max(0.6, vw/W);
      if (age < 6.5){
        for (let j=0;j<12;j++){ const a2 = age-j*0.4; if (a2<=0 || a2>=1.8) continue; const bx = vw*(0.1+0.8*((j*37)%11)/10), by = vh*(0.08+0.5*((j*53)%10)/10);
          ctx.globalAlpha = 1-a2/1.8; for (let p=0;p<30;p++){ const ang=p/30*Math.PI*2, r=a2*(55+(p%3)*12)*fs; ctx.fillStyle=['#47f59a','#ffd447','#2ee6ff','#ff4fae'][(p+j)%4]; ctx.fillRect(bx+Math.cos(ang)*r, by+Math.sin(ang)*r+a2*a2*12, 3, 3); }
          if (a2 < 0.25){ ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(bx, by, 6-a2*16, 0, Math.PI*2); ctx.fill(); } }
        ctx.globalAlpha=1; if (age < 4.5) bigText('CAMPUS SAVED!', vh*0.42, 16, '#47f59a');
      } else UI.incWin = 0; }
  }

  function loop(){ if (!active) return; update(); if (!active) return; draw(); raf = requestAnimationFrame(loop); }
  function toLogical(e){ const r = canvas.getBoundingClientRect(); return [ (e.clientX-r.left)/r.width*vw + camX, (e.clientY-r.top)/r.height*vh + camY ]; }
  const bAt = (x,y) => B.find(b=> b.id==='compass' ? (x>=b.px-12 && x<=b.px+b.pw+12 && y>=b.py-12 && y<=b.py+b.ph) : (x>=b.px-3 && x<=b.px+b.pw+3 && y>=b.py && y<=b.py+b.ph));
  function onClick(e){
    const [x,y]=toLogical(e); const b = bAt(x,y); const [pc,pr]=tileOf(player);
    if (b){ const p = bfs(pc,pr,b.door.c,b.door.r); if (p){ player.path=p; pendingEnter=b; marker=[b.door.c,b.door.r]; if (!p.length) { pendingEnter=null; enter(b); } } return; }
    const c=Math.floor(x/T), r=Math.floor(y/T); const p = bfs(pc,pr,c,r); if (p){ player.path=p; pendingEnter=null; marker=[c,r]; }
  }
  function onMove(e){ const [x,y]=toLogical(e); const b=bAt(x,y); hover=b||null; canvas.style.cursor = b?'pointer':'crosshair';
    const tip=$('#campusTip'); if (!tip) return; if (b){ const r=canvas.getBoundingClientRect(); const locked = bLocked(b.id), hk = incHacked(b.id);
      tip.classList.remove('hidden'); tip.innerHTML=`<b>${esc(b.name)}</b>${esc(b.desc)}${hk?'<br><span style="color:var(--red-ink)">⚠ Hacked! Chase the virus to secure it</span>':locked?'<br><span style="color:var(--gold-ink)">🔒 Locked until you pass the final assessment</span>':''}<br><span class="muted" style="font-size:12px">Click to walk there</span>`;
      const lx = e.clientX - r.left + 14, ly = e.clientY - r.top + 14; tip.style.left = Math.min(lx, r.width-250)+'px'; tip.style.top = Math.min(ly, r.height-90)+'px'; } else tip.classList.add('hidden'); }
  function renderPrompt(){ const el=$('#campusPrompt'); if (!el) return; if (!nearDoor){ el.classList.add('hidden'); return; }
    const locked = bLocked(nearDoor.id), hk = incHacked(nearDoor.id);
    el.classList.remove('hidden'); el.innerHTML = `<span>${hk?'⚠ ':locked?'🔒 ':''}${esc(nearDoor.name)}</span><kbd>E</kbd><button class="btn small ${hk?'pink':''}" data-act="campusEnter">${hk?'Secure it':locked?'View requirements':'Enter'}</button>`; }
  function enter(b){ if (incHacked(b.id)){ S.lastDoor=b.view; stop(); EXTRA_ACTIONS.incPlay(); return; } S.lastDoor=b.view; toast(`Entering ${esc(b.name)}…`); stop(); go(b.view); }
  const kd = e => { if (!active || e.target.matches('input,textarea')) return; const k = e.key.length===1 ? e.key.toLowerCase() : e.key;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(k)){ keys[k]=true; if (k.startsWith('Arrow')) e.preventDefault(); }
    if ((k==='e'||k==='Enter') && nearDoor){ e.preventDefault(); enter(nearDoor); }
    if (k==='f' && !e.ctrlKey && !e.metaKey){ e.preventDefault(); EXTRA_ACTIONS.campusFS(); } };
  const ku = e => { const k = e.key.length===1 ? e.key.toLowerCase() : e.key; keys[k]=false; };

  function start(cv){
    canvas = cv; ctx = canvas.getContext('2d'); sizeCanvas(); window.addEventListener('resize', onResize);
    buildGrid(); renderBG();
    player = player && player.look===S.user.look ? player : makeChar(S.user.look, 12, 9, S.user.name, true);
    player.path=[]; pendingEnter=null; marker=null; nearDoor=null; keys={};
    if (S.lastDoor){ const b=B.find(x=>x.view===S.lastDoor); if (b){ player.x=b.door.c*T+8; player.y=(b.door.r+1)*T+4; if (isBlocked(b.door.c,b.door.r+1)) player.y=b.door.r*T+12; player.back=false; } }
    if (!npcs.length){ const spots=[[5,8],[24,8],[8,18],[17,18],[26,17],[12,11]]; npcs = COMMUNITY_USERS.filter(u=>u.status!=='off').slice(0,6).map((u,i)=>makeChar(u.look, spots[i][0], spots[i][1], u.name, false)); }
    canvas.addEventListener('click', onClick); canvas.addEventListener('mousemove', onMove); canvas.addEventListener('mouseleave', ()=>{ hover=null; const t=$('#campusTip'); if (t) t.classList.add('hidden'); });
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    active = true; applyFS(); const go2 = ()=>{ if (active){ renderBG(); } }; if (document.fonts && document.fonts.ready) document.fonts.ready.then(go2);
    loop();
  }
  function stop(){ active=false; if (raf) cancelAnimationFrame(raf); raf=null; window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); window.removeEventListener('resize', onResize); keys={}; document.body.classList.remove('campus-fs'); }
  window.EXTRA_ACTIONS = Object.assign(window.EXTRA_ACTIONS||{}, { campusEnter: () => { if (nearDoor) enter(nearDoor); },
    campusZoom: () => { UI.campusFull = !UI.campusFull; if (active) sizeCanvas(); },
    campusFS: () => setCampusFS(!UI.campusFS), campusGo: id => { const b=B.find(x=>x.id===id); if (!b) return; if (active){ const [pc,pr]=tileOf(player); const p=bfs(pc,pr,b.door.c,b.door.r); if (p){ player.path=p; pendingEnter=b; marker=[b.door.c,b.door.r]; if(!p.length){ pendingEnter=null; enter(b);} return; } } enter(b); } });
  // One building's front (roof, sign, windows, door) at x,y, as seen on the campus; used by banners and the title screen
  function drawFront(g, id, x, y, hacked){
    const b = B.find(v=>v.id===id); if (!b) return; const P = pal(), locked = bLocked(id), col = hacked ? '#ff5d6e' : b.color;
    if (id==='home'){ drawDorm(g, x, y, b.pw, b.ph, homeStage(), 1); return; }
    building(g, {...b, px:x, py:y});
    [x+6, x+18, x+b.pw-28, x+b.pw-16].forEach((wx,i)=>{ const on = !locked && (hacked ? i%2===0 : i!==2);
      g.fillStyle='#05061a'; g.fillRect(wx-1,y+35,12,12); g.fillStyle = on ? (P.winOn && !hacked ? P.winOn : col) : P.winOff; g.fillRect(wx,y+36,10,10);
      g.fillStyle = on ? '#ffffffaa' : P.winGlintOff; g.fillRect(wx+1,y+37,3,3); g.fillStyle='#05061a'; g.fillRect(wx+4.5,y+36,1,10); });
    const dx = x+b.pw/2-10, dy = y+b.ph-22;
    g.fillStyle='#05061a'; g.fillRect(dx-2,dy-2,24,24); g.fillStyle=col; g.fillRect(dx-1,dy-1,22,23); g.fillStyle=P.doorIn; g.fillRect(dx+1,dy+1,18,21);
    if (locked) g.drawImage(iconCanvas('lock','#ffd447'), dx+4, dy+5); else { g.fillStyle=col+'55'; g.fillRect(dx+1,dy+8,18,2); g.fillStyle='#ffffff22'; g.fillRect(dx+1,dy+1,18,4); }
  }
  // Small pixel banner of one building (as seen on the campus) for its page header; cached once fonts are ready
  const bannerCache = new Map();
  function bannerURL(id, hacked){
    const b = B.find(x=>x.id===id); if (!b) return '';
    const stage = id==='home' ? homeStage() : 0, locked = bLocked(id), P = pal(), k = [id, !!hacked, stage, locked, isDay()].join('|');
    if (bannerCache.has(k)) return bannerCache.get(k);
    const BW=144, BH=100, s=2, c=document.createElement('canvas'); c.width=BW*s; c.height=BH*s;
    const g=c.getContext('2d'); g.imageSmoothingEnabled=false; g.setTransform(s,0,0,s,0,0);
    const sky=g.createLinearGradient(0,0,0,BH); sky.addColorStop(0, hacked?'#3a0d1a':P.sky[0]); sky.addColorStop(1, hacked?'#1f0811':P.sky[1]); g.fillStyle=sky; g.fillRect(0,0,BW,BH);
    if (P.stars || hacked) for (let i=0;i<20;i++){ g.fillStyle = i%3 ? '#ffffff55' : (b.color||'#ffd447')+'99'; g.fillRect((i*47+5)%BW, (i*29+3)%46, 1, 1); }
    else { g.fillStyle='#ffffff'; [[8,10,26,6],[14,6,12,4],[96,18,30,6],[104,14,14,4]].forEach(([x,y,w,h])=>g.fillRect(x,y,w,h)); }
    g.fillStyle=P.grass; g.fillRect(0,BH-12,BW,12); g.fillStyle=P.grassDots[1]; for (let i=0;i<24;i++) g.fillRect((i*13)%BW, BH-11+(i*7)%9, 1, 2);
    g.fillStyle=P.path[0]; g.fillRect(BW/2-14,BH-12,28,12); g.fillStyle=P.pathLine; g.fillRect(BW/2-14,BH-12,28,1);
    if (id==='home') drawDorm(g, (BW-96)/2, BH-12-64, 96, 64, stage, 1);
    else if (id==='compass'){ g.translate(BW/2, BH-12); g.scale(1.7,1.7); drawSignpost(g, 0, 0, 1); g.setTransform(s,0,0,s,0,0); }
    else {
      const x=Math.round((BW-b.pw)/2), y=BH-12-b.ph; drawFront(g, id, x, y, hacked);
      if (hacked){ g.fillStyle='rgba(255,60,80,0.22)'; g.fillRect(x-3,y,b.pw+6,b.ph);
        [[y+14,3,4],[y+40,4,-5],[y+58,2,3]].forEach(([sy,sh,off])=>g.drawImage(c, (x-3)*s, sy*s, (b.pw+6)*s, sh*s, x-3+off, sy, b.pw+6, sh));
        g.font='6px Silkscreen, monospace'; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#05061a'; g.fillRect(BW/2-18, BH-11, 36, 9); g.fillStyle='#ff5d6e'; g.fillText('HACKED', BW/2, BH-6.5); }
    }
    const u = c.toDataURL(); if (!document.fonts || document.fonts.status==='loaded') bannerCache.set(k,u); return u;
  }
  // Full-screen mode: the shell covers the window (CSS) and the browser goes full screen where allowed.
  // The browser stays full screen while you visit buildings, and the campus comes back full screen.
  function applyFS(){ const sh = $('#campusShell'); if (sh) sh.classList.toggle('fs', !!UI.campusFS); document.body.classList.toggle('campus-fs', !!(UI.campusFS && active));
    const b = $('#fsToggle'); if (b){ b.innerHTML = UI.campusFS ? '✕ Exit full screen' : '⛶ Full screen'; b.setAttribute('aria-pressed', !!UI.campusFS); }
    if (active) sizeCanvas(); }
  function setCampusFS(on){ UI.campusFS = on; const d = document;
    try { if (on && !d.fullscreenElement && d.documentElement.requestFullscreen) d.documentElement.requestFullscreen().catch(()=>{}); if (!on && d.fullscreenElement) d.exitFullscreen().catch(()=>{}); } catch(e){}
    applyFS(); }
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && UI.campusFS){ UI.campusFS = false; applyFS(); } });
  // Campus tour API (used by 11-tutorial.js)
  const tour = {
    show(){ const [pc,pr] = tileOf(player); let spot = [pc,pr];
      for (const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[2,0],[-2,0]]) if (!isBlocked(pc+dc,pr+dr)){ spot = [pc+dc,pr+dr]; break; }
      guide = { x:spot[0]*T+8, y:spot[1]*T+12, path:[], f:0, back:false, moving:false, expr:'happy', wave:false, beam:60, onArrive:null }; },
    hide(){ guide = null; focusPt = null; if (tourZoom){ tourZoom = false; if (active) sizeCanvas(); } },
    zoom(on){ tourZoom = on; if (active) sizeCanvas(); },
    set(o){ if (guide) Object.assign(guide, o); },
    // walk BYTE to a building's doorstep (or next to the player); resolves on arrival
    walk(target){ return new Promise(res=>{ if (!guide){ res(); return; } let tc, tr;
      if (target==='player'){ [tc,tr] = tileOf(player); tc += isBlocked(tc+1,tr) ? -1 : 1; }
      else { const b = B.find(v=>v.id===target); if (!b){ res(); return; } tc = b.door.c + (b.id==='compass' ? 1 : -1); tr = b.door.r; if (isBlocked(tc,tr)) tc = b.door.c; }
      const p = bfs(Math.floor(guide.x/T), Math.floor((guide.y-4)/T), tc, tr); if (!p || !p.length){ res(); return; } guide.path = p; guide.onArrive = res; }); },
    // jump to the end of the current walk (when the learner clicks to hurry)
    arrive(){ if (guide && guide.path.length){ const [c,r] = guide.path[guide.path.length-1]; guide.x = c*T+8; guide.y = r*T+12; guide.path = []; } },
    walking(){ return !!(guide && guide.path.length); },
    focus(target){ const b = target && target!=='player' && B.find(v=>v.id===target); focusPt = b ? { x:b.cx, y:b.py+b.ph/2+10 } : null; },
    // a building's (or the player's) box in page coordinates, following the camera
    rectOf(target){ if (!canvas || !canvas.isConnected) return null; const r = canvas.getBoundingClientRect(), k = r.width/vw; let x, y, w, h;
      if (target==='player'){ x = Math.min(player.x, guide ? guide.x : player.x)-14; y = player.y-32; w = Math.abs((guide ? guide.x : player.x)-player.x)+28; h = 36; } // you, and BYTE beside you
      else { const b = B.find(v=>v.id===target); if (!b) return null;
        if (b.id==='compass'){ x = b.px-18; y = b.py-30; w = b.pw+36; h = b.ph+34; } else { x = b.px-6; y = b.py-4; w = b.pw+12; h = b.ph+10; } }
      return { left:r.left+(x-camX)*k, top:r.top+(y-camY)*k, width:w*k, height:h*k }; },
    active(){ return active; }
  };
  return { start, stop, buildings:B, banner:bannerURL, applyFS, drawFront, tree, bench, tour };
})();
const BUBBLES = ['Just passed Module 2!','Anyone in Study Squad tonight?','The phishing lesson was eye-opening','BYTE explained hashing so well','Going for Phish Spotter!','Never share your OTP!','Turned on MFA everywhere today','Log Detective is so fun','WPA3 or nothing 😎','Halfway to my certificate!'];

function viewCampus(el){
  const online = COMMUNITY_USERS.filter(u=>u.status!=='off').length + 1;
  el.innerHTML = `<div class="page-head"><div><div class="crumbs">Virtual Campus</div><h1>Cybersity Campus</h1><p>Walk with the arrow keys or WASD, or click/tap anywhere to move. Click a building to walk to its door and enter. Press F or Full screen to fill the screen.</p></div><div style="display:flex; gap:8px; flex-wrap:wrap"><span class="pill green">● ${online} online</span><span class="pill gold">LV ${levelInfo().n} · ${S.xp} XP</span></div></div>
  <div class="campus-shell" id="campusShell"><div id="incBanner">${incBannerHTML()}</div>
  <div class="campus-wrap ${incActive()?'alarm':''}"><canvas id="campus" class="px" aria-label="Virtual campus map. Use the building buttons below for keyboard navigation."></canvas>
    <div class="campus-hud"><span class="pill">${icon('campus','#2ee6ff',12)} ${isDay() ? 'Day shift' : 'Night shift'} · Sector 7</span></div>
    <div class="cam-tools"><button class="cam-btn fs-only" data-act="toggleMenu" aria-label="Menu and presenter tools">${icon('gear','#ffd447',14)}</button><button class="cam-btn cam-toggle" id="camToggle" data-act="campusZoom">${UI.campusFull ? 'Zoom in' : 'Full map'}</button><button class="cam-btn" id="fsToggle" data-act="campusFS" aria-pressed="false">⛶ Full screen</button></div>
    <div class="prompt hidden" id="campusPrompt"></div><div class="tooltip hidden" id="campusTip"></div></div></div>
  <div class="quick-nav">${Campus.buildings.map(b=>{ const locked=bLocked(b.id); return `<button class="qn ${locked?'locked':''}" data-act="campusGo" data-arg="${b.id}">${icon(locked?'lock':b.icon, b.color, 24)}<b>${esc(b.name)}</b><small>${esc(b.desc)}</small></button>`; }).join('')}</div>`;
  Campus.start($('#campus'));
}

/* ---------- Campus Incident ---------- */
const incActive = () => !!(S.incident && S.incident.active);
const incHacked = id => incActive() && INCIDENT.some(x=>x.b===id) && !S.incident.secured.includes(id);
const incAllSecured = () => INCIDENT.every(x=>S.incident.secured.includes(x.b));
const incUnlocked = () => modPassed(MODULES[1]);
const bLocked = id => id==='cert' && !finalPassed() && !incHacked('cert');
const bName = id => Campus.buildings.find(b=>b.id===id).name;
// Campus banner: an alert after Module 2 invites the learner to investigate; during the attack it tracks the
// buildings Virus Escape has secured and relaunches the chase; afterwards it celebrates.
function incBannerHTML(){
  if (incActive()){ const n = S.incident.secured.length;
    return `<div class="inc-banner"><div class="inc-title"><span class="siren"></span>Virus loose on campus!</div><div class="inc-count"><b>${n}/${INCIDENT.length}</b> buildings secured</div>
      <button class="btn pink small inc-go" data-act="incPlay">▶ Chase the virus</button>
      <div class="inc-chips">${INCIDENT.map(x=>{ const ok = S.incident.secured.includes(x.b); return `<span class="inc-chip ${ok?'ok':''}">${ok?'✓':'⚠'} ${esc(bName(x.b))}</span>`; }).join('')}</div></div>`; }
  if (UI.incSaved) return `<div class="inc-banner saved"><div class="inc-title">${icon('shield','#47f59a',18)} Campus saved!</div><div class="inc-count"><b>${INCIDENT.length}/${INCIDENT.length}</b> buildings secured</div></div>`;
  if (incUnlocked() && !(S.incident && S.incident.done)) return `<div class="inc-banner warn"><div class="inc-title"><span class="siren warn"></span>Strange activity near the Cyber Core…</div><div class="inc-count">Something is stirring on campus</div><button class="btn gold small inc-go" data-act="incStart">Investigate</button></div>`;
  return '';
}
function renderIncBanner(){ const el = $('#incBanner'); if (el) el.innerHTML = incBannerHTML(); const w = $('.campus-wrap'); if (w) w.classList.toggle('alarm', incActive()); }
// Start the attack: the campus turns red with flashing alarms, then Virus Escape launches
function incStart(){
  if (!incUnlocked() && !S.arcadeUnlocked){ toast('The campus incident unlocks after you pass the Module 2 assessment.'); return; }
  S.incident = { active:true, secured:[], started:Date.now() }; UI.incAlert = Date.now(); UI.incWin = 0; UI.incSaved = false; UI.incFx = null;
  log('Campus incident started'); save(); go('campus');
  setTimeout(()=>{ if (incActive() && S.view === 'campus' && !S.incident.secured.length) EXTRA_ACTIONS.incPlay(); }, 3400);
}
// Called by Virus Escape (and the presenter shortcut) each time a building is secured
function incSecure(id){
  if (!incActive() || S.incident.secured.includes(id)) return;
  S.incident.secured.push(id); save(); UI.incFx = { id, at:0 }; // the restore animation plays when the campus is next shown
  log(`Secured ${bName(id)} during the campus incident`);
}
function incWin(){
  const secs = Math.round((Date.now() - S.incident.started)/1000);
  S.incident.active = false; S.incident.done = true; S.incident.best = Math.min(S.incident.best || Infinity, secs); save();
  UI.incWin = Date.now(); UI.incSaved = true; renderIncBanner();
  setTimeout(()=>{
    showModal(`<div class="label" style="color:var(--green-ink)">Incident closed</div><div class="big-medal" style="background:var(--green)">${icon('shield','#05061a',58)}</div><h2>Campus saved!</h2>
      <p class="muted">You chased the virus off campus and secured all ${INCIDENT.length} buildings in ${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}.</p>
      <div class="actions"><button class="btn green" data-act="closeModal">Back to campus</button></div>`);
    addXP(XP.incident, 'Campus saved from the incident'); award('defender');
  }, 2600);
}
window.EXTRA_ACTIONS = Object.assign(window.EXTRA_ACTIONS||{}, {
  incPlay: () => { UI.menu=false; renderMenu(); if (!incActive()) return; go('arcade', { game:'virus', incident:true }); },
  incCampus: () => go('campus'),
  incStart: () => { UI.menu=false; renderMenu(); incStart(); },
  incNext: () => { UI.menu=false; renderMenu(); if (!incActive()){ toast('Start the campus incident first.'); return; }
    const x = INCIDENT.find(i=>!S.incident.secured.includes(i.b)); if (!x) return;
    incSecure(x.b); toast(`${esc(bName(x.b))} secured!`); S.lastDoor = Campus.buildings.find(v=>v.id===x.b).view;
    if (S.view==='campus') renderIncBanner(); else go('campus'); },
  incEnd: () => { UI.menu=false; renderMenu(); S.incident = { active:false, secured:[] }; UI.incWin = 0; UI.incSaved = false; UI.incFx = null; save(); toast('Incident ended'); renderView(); }
});

// Career Compass signpost on the plaza: a post with two glowing arrow boards and a floating compass
function drawSignpost(g, x, base, t){
  const pulse = 0.5+0.5*Math.sin(t*2.4);
  const grd = g.createRadialGradient(x, base-20, 2, x, base-20, 30); grd.addColorStop(0, `rgba(255,212,71,${0.22+0.18*pulse})`); grd.addColorStop(1, 'rgba(255,212,71,0)'); g.fillStyle=grd; g.fillRect(x-30, base-50, 60, 56);
  g.fillStyle='#0007'; g.fillRect(x-6, base-2, 12, 3);
  g.fillStyle='#05061a'; g.fillRect(x-3, base-30, 6, 30); g.fillStyle='#8a5a34'; g.fillRect(x-2, base-29, 4, 29); g.fillStyle='#6b4226'; g.fillRect(x+1, base-29, 1, 29);
  const board = (y, left, label, col) => { const x0 = left ? x-17 : x-12, x1 = left ? x+12 : x+17;
    g.fillStyle='#05061a'; g.beginPath(); if (left){ g.moveTo(x0-4,y+4); g.lineTo(x0+1,y-1); g.lineTo(x1+1,y-1); g.lineTo(x1+1,y+9); g.lineTo(x0+1,y+9); } else { g.moveTo(x1+4,y+4); g.lineTo(x1-1,y-1); g.lineTo(x0-1,y-1); g.lineTo(x0-1,y+9); g.lineTo(x1-1,y+9); } g.closePath(); g.fill();
    g.fillStyle='#0b0f2c'; g.beginPath(); if (left){ g.moveTo(x0-2,y+4); g.lineTo(x0+2,y); g.lineTo(x1,y); g.lineTo(x1,y+8); g.lineTo(x0+2,y+8); } else { g.moveTo(x1+2,y+4); g.lineTo(x1-2,y); g.lineTo(x0,y); g.lineTo(x0,y+8); g.lineTo(x1-2,y+8); } g.closePath(); g.fill();
    g.strokeStyle=col; g.globalAlpha=0.6+0.4*pulse; g.lineWidth=1; g.stroke(); g.globalAlpha=1;
    g.font='5px Silkscreen, monospace'; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle=col; g.fillText(label, (x0+x1)/2 + (left?-1:1), y+4.5); };
  board(base-28, false, 'CAREERS', '#ffd447'); board(base-17, true, 'SKILLS', '#2ee6ff');
  const by = base-44+Math.round(Math.sin(t*2)*1.5);
  g.fillStyle=`rgba(255,212,71,${0.3+0.25*pulse})`; g.beginPath(); g.arc(x, by+6, 9, 0, Math.PI*2); g.fill();
  g.drawImage(dormIcon('compass','#ffd447'), x-6, by);
}

/* ---------- Home Base: Security Health Check ---------- */
const healthDone = () => HEALTH_CHECKS.filter(c=>S.health[c.id]).length;
const healthScore = () => Math.round(healthDone()/HEALTH_CHECKS.length*100);
function homeStage(){ const n=healthDone(); return n===0 ? 0 : n<4 ? 1 : n<HEALTH_CHECKS.length ? 2 : 3; }
const dormIcons = new Map(); const dormIcon = (n,c) => { const k=n+c; if (!dormIcons.has(k)) dormIcons.set(k, iconCanvas(n,c)); return dormIcons.get(k); };
// Draws the dorm in one of 4 stages: dark and plain -> lights on -> padlock -> glowing shield and sign
function drawDorm(g, x, y, w, h, stage, t){
  const lit = stage>0, D = isDay(), roof = lit ? HOME_BASE.roof : (D ? '#8a8f99' : '#2b3540'), cx = x+w/2, pulse = 0.5+0.5*Math.sin(t*3), green = HOME_BASE.color;
  if (stage===3){ const grd = g.createRadialGradient(cx,y+h/2,6,cx,y+h/2,w*0.8); grd.addColorStop(0,`rgba(71,245,154,${0.18+0.14*pulse})`); grd.addColorStop(1,'rgba(71,245,154,0)'); g.fillStyle=grd; g.fillRect(x-w*0.35,y-26,w*1.7,h+40); }
  g.fillStyle='#0006'; g.fillRect(x+4,y+h-2,w,6);
  // wall
  g.fillStyle='#05061a'; g.fillRect(x-1,y+21,w+2,h-20);
  g.fillStyle = lit ? (D ? '#f3e2c0' : '#1b2054') : (D ? '#cfc8b8' : '#11142c'); g.fillRect(x,y+22,w,h-22);
  g.fillStyle = lit ? (D ? '#fff2d8' : '#232a6a') : (D ? '#ddd6c6' : '#171a38'); g.fillRect(x,y+22,w,3);
  for (let i=0;i<w;i+=8){ g.fillStyle = lit ? (D ? '#e3cc9e' : '#181d4c') : (D ? '#bdb5a3' : '#0e1126'); g.fillRect(x+i,y+25,1,h-25); }
  // roof
  g.fillStyle='#05061a'; g.fillRect(x-4,y-1,w+8,24); g.fillStyle=roof; g.fillRect(x-3,y,w+6,22);
  for (let j=4;j<22;j+=5){ g.fillStyle=shade(roof,-0.25); g.fillRect(x-3,y+j,w+6,1); }
  g.fillStyle=shade(roof,0.25); g.fillRect(x-3,y,w+6,2);
  // sign plate
  if (stage===3){ g.fillStyle=`rgba(71,245,154,${0.25+0.3*pulse})`; g.fillRect(x+8,y+9,w-16,15); }
  g.fillStyle='#05061a'; g.fillRect(x+10,y+11,w-20,11); g.fillStyle = D ? '#3b2a1e' : '#0b0f2c'; g.fillRect(x+11,y+12,w-22,9);
  g.font='7px Silkscreen, monospace'; g.textAlign='center'; g.textBaseline='middle';
  g.fillStyle = stage===3 ? green : lit ? '#c9f7de' : (D ? '#9a917e' : '#3a4166'); g.fillText(stage===3 ? 'SECURED' : 'HOME BASE', cx, y+16.5);
  // windows
  const winY = y+29;
  [x+6, x+18, x+w-28, x+w-16].forEach((wx,i)=>{ const on = lit && (stage>1 || (Math.floor(t*0.6+i*1.7)%6)!==0);
    g.fillStyle='#05061a'; g.fillRect(wx-1,winY-1,12,12); g.fillStyle = on ? '#ffd447' : (D ? '#9aa3ad' : '#1a1f45'); g.fillRect(wx,winY,10,10);
    g.fillStyle = on ? '#fff6c8' : (D ? '#c4cbd3' : '#262c5a'); g.fillRect(wx+1,winY+1,3,3); g.fillStyle='#05061a'; g.fillRect(wx+4.5,winY,1,10);
    if (on){ g.fillStyle='rgba(255,212,71,0.16)'; g.fillRect(wx-3,winY+11,16,4); } });
  // door
  const dx = cx-10, dy = y+h-22;
  g.fillStyle='#05061a'; g.fillRect(dx-2,dy-2,24,24); g.fillStyle = stage>=2 ? green : lit ? '#8a5a34' : '#3a2a20'; g.fillRect(dx-1,dy-1,22,23);
  g.fillStyle = lit ? '#2a1d15' : '#160f0b'; g.fillRect(dx+1,dy+1,18,21);
  if (stage===1){ g.fillStyle='#ffd447'; g.fillRect(dx+14,dy+11,2,2); }
  if (stage>=2) g.drawImage(dormIcon('lock','#ffd447'), Math.round(cx-6), dy+5);
  // floating shield
  if (stage===3){ const sy = y-17+Math.round(Math.sin(t*2)*1.5);
    g.fillStyle=`rgba(71,245,154,${0.25+0.2*pulse})`; g.beginPath(); g.arc(cx, sy+6, 10, 0, Math.PI*2); g.fill();
    g.drawImage(dormIcon('shield',green), Math.round(cx-6), sy); }
}
// Animates a dorm canvas (logical 128x104) with an upgrade flash after a new stage
function animateDorm(cv, sc){
  if (!cv) return; const g = cv.getContext('2d'); g.imageSmoothingEnabled=false;
  const draw = () => { const t = performance.now()/1000; g.setTransform(sc,0,0,sc,0,0);
    const P = pal(); g.fillStyle=P.grass; g.fillRect(0,0,128,104); g.fillStyle=P.path[1]; g.fillRect(0,92,128,12); g.fillStyle=P.pathLine; g.fillRect(0,92,128,1);
    for (let i=0;i<40;i++){ g.fillStyle = P.grassDots[i%2]; g.fillRect((i*37)%126, (i*23)%86, 1, 2); }
    drawDorm(g, 16, 28, 96, 64, homeStage(), t);
    const age = (Date.now() - (UI.dormFlash||0))/1000;
    if (age < 1.4){ const k = 1-age/1.4; g.fillStyle=`rgba(255,255,255,${0.55*k*k})`; g.fillRect(0,0,128,104);
      g.strokeStyle=`rgba(71,245,154,${k})`; g.lineWidth=2; g.beginPath(); g.arc(64,60,10+age*60,0,Math.PI*2); g.stroke();
      for (let i=0;i<10;i++){ const a=i/10*Math.PI*2, r=12+age*46; g.fillStyle = i%2 ? '#ffd447' : '#47f59a'; g.fillRect(64+Math.cos(a)*r, 60+Math.sin(a)*r*0.8, 2, 2); } } };
  draw(); timers.push(setInterval(draw, 60));
}
function viewHome(el){
  const sc = healthScore(), st = homeStage(), n = healthDone();
  el.innerHTML = `<div class="page-head"><div><div class="crumbs"><button data-act="go" data-arg="campus">Virtual Campus</button><span>›</span><span>Home Base</span></div><h1>Home Base</h1><p>Your dorm on campus. Every real security action you take in your own life upgrades it. Ticks are self-reported and saved only on this device.</p></div><span class="pill green">Safety Score ${sc}%</span></div>
  <div class="grid home-grid">
    <section class="panel home-dorm">
      <canvas id="dormCanvas" class="px" width="384" height="312" aria-label="Your dorm, stage ${st+1} of 4: ${esc(HOME_STAGES[st].t)}"></canvas>
      <div class="label" style="color:var(--green-ink); margin-top:14px">Stage ${st+1} of 4 · ${esc(HOME_STAGES[st].t)}</div>
      <div class="home-score"><b class="pixel" id="safetyScore">${sc}%</b><span class="label muted">Safety Score</span></div>
      <div class="bar green"><i style="width:${sc}%"></i></div>
      <p class="muted" style="margin-top:10px; font-size:14px">${esc(HOME_STAGES[st].d)}</p>
      <div class="home-stages">${HOME_STAGES.map((s,i)=>`<span class="${i<=st?'on':''}">${i+1}. ${esc(s.t)}</span>`).join('')}</div>
    </section>
    <section class="monitor" style="margin-top:8px">
      <div class="kicker">Security Health Check · ${n}/${HEALTH_CHECKS.length} done</div>
      <h2 style="margin:8px 0 6px">Do it for real</h2>
      <p class="lesson-body" style="font-size:15px">Lessons teach you what to do. These seven actions make you safer today. Tick each one when you have done it on your own phone or account.</p>
      <div class="hc-list">${HEALTH_CHECKS.map(c=>{ const on=!!S.health[c.id]; return `<button class="hc ${on?'done':''}" data-act="healthTick" data-arg="${c.id}" aria-pressed="${on}">
        <span class="hc-box">${on?icon('check','#05061a',18):''}</span>
        <span class="hc-body"><b>${esc(c.t)}</b><span><i>How:</i> ${esc(c.how)}</span><span><i>Why it matters:</i> ${esc(c.why)}</span></span>
        <span class="hc-xp">${S.healthXP.includes(c.id)?'':`+${XP.health} XP`}</span></button>`; }).join('')}</div>
    </section>
  </div>`;
  animateDorm($('#dormCanvas'), 3);
}
function healthAfter(before){
  save(); const after = homeStage();
  if (after > before){ UI.dormFlash = Date.now(); toast(`Home Base upgraded: ${esc(HOME_STAGES[after].t)}!`); }
  if (healthScore()===100 && !S.healthXP.includes('full')){ S.healthXP.push('full'); addXP(XP.healthFull, 'Home Base fully secured'); award('homesafe'); }
}
window.EXTRA_ACTIONS = Object.assign(window.EXTRA_ACTIONS||{}, {
  healthTick: id => { const c = HEALTH_CHECKS.find(x=>x.id===id); if (!c) return; const before = homeStage();
    S.health[id] = !S.health[id];
    if (S.health[id] && !S.healthXP.includes(id)){ S.healthXP.push(id); addXP(XP.health, `Home Base: ${c.t}`); }
    healthAfter(before); renderView();
    // on phones the checklist sits below the dorm, so bring the upgrade into view
    if (homeStage() > before && innerWidth <= 860){ const d = $('#dormCanvas'); if (d) d.scrollIntoView({behavior:'smooth', block:'center'}); } },
  demoHome: a => { UI.menu=false; renderMenu(); const before = homeStage();
    if (a==='clear'){ S.health = {}; save(); toast('Home Base checklist cleared'); renderView(); return; }
    let gained = 0; HEALTH_CHECKS.forEach(c=>{ S.health[c.id]=true; if (!S.healthXP.includes(c.id)){ S.healthXP.push(c.id); gained += XP.health; } });
    if (gained){ S.xp += gained; log('Presenter shortcut: Home Base checklist complete', gained); updateHUD(); }
    healthAfter(before); renderView(); }
});

/* ---------- Title screen scene (sign-in pages) ----------
   A wide pixel campus at dusk or by day: sky, moon or sun, drifting clouds in two layers, the campus buildings
   along the horizon, lamps and students walking the path. It keeps running behind every onboarding page and
   pans down a little once the learner leaves the title screen. */
function startTitleScene(cv){
  const g = cv.getContext('2d'); let s = 2, LW = 0, LH = 0, front = null, frontKey = '', last = performance.now(), pan = 0;
  const ROW = ['library','ailab','community','home','challenge','achieve','cert'];
  const clouds = Array.from({length:9}, (_,i)=>({ x:(i*0.137+0.05)%1, y:0.05+((i*37)%10)/10*0.36, w:46+((i*23)%5)*14, far:i%3===0 }));
  const walkers = COMMUNITY_USERS.slice(0,6).map((u,i)=>({ look:u.look, x:(i*0.19+0.07)%1, dir:i%2 ? 1 : -1, sp:9+(i%3)*4, f:0 }));
  function size(){ s = Math.max(2, Math.floor(Math.min(innerHeight/300, innerWidth/170))); LW = Math.ceil(innerWidth/s); LH = Math.ceil(innerHeight/s);
    cv.width = LW*s; cv.height = LH*s; g.imageSmoothingEnabled = false; frontKey = ''; }
  function cloud(x, y, w, far){ const h = Math.round(w*0.32), day = isDay();
    const top = day ? (far ? '#e8f4ff' : '#ffffff') : (far ? '#232a66' : '#2f3a86'), under = day ? '#c9dcff' : (far ? '#1b2158' : '#252e73');
    x = Math.round(x); y = Math.round(y);
    g.fillStyle = top; g.fillRect(x, y+h*0.45|0, w, h*0.45|0); g.fillRect(x+w*0.12|0, y+h*0.2|0, w*0.5|0, h*0.4|0); g.fillRect(x+w*0.4|0, y, w*0.3|0, h*0.4|0); g.fillRect(x+w*0.62|0, y+h*0.25|0, w*0.25|0, h*0.3|0);
    g.fillStyle = under; g.fillRect(x, y+h*0.9|0, w, Math.max(2, h*0.12|0)); }
  // Static front layer (hills, buildings, path, grass, lamps), rebuilt only when size or theme changes
  function buildFront(){
    const P = pal(), day = isDay(), H2 = 150; front = document.createElement('canvas'); front.width = LW*s; front.height = H2*s;
    const f = front.getContext('2d'); f.imageSmoothingEnabled = false; f.setTransform(s,0,0,s,0,0);
    const base = 96; // path line inside the layer
    f.fillStyle = day ? '#7cc77a' : '#14243f'; for (let x=0;x<LW;x+=12){ const h = 10+((x*7)%13); f.fillRect(x, base-34-h, 14, h+40); } // far hills
    for (let x=-8;x<LW;x+=16) Campus.tree(f, x, base-40+((x/16|0)%2)*3, (x/16|0)%3);
    const gap = 10, widths = ROW.map(id=>Campus.buildings.find(b=>b.id===id).pw), total = widths.reduce((a,b)=>a+b+gap,0) - gap;
    let x = Math.round((LW-total)/2); while (x > 0) x -= total+gap; // repeat the row to fill wide screens
    for (; x < LW; x += total+gap){ let bx = x; ROW.forEach((id,i)=>{ const b = Campus.buildings.find(v=>v.id===id); Campus.drawFront(f, id, bx, base-b.ph); bx += widths[i]+gap; }); }
    f.fillStyle = P.path[0]; f.fillRect(0, base, LW, 18); f.fillStyle = P.pathLine; f.fillRect(0, base, LW, 1); f.fillRect(0, base+17, LW, 1);
    for (let i=0;i<LW;i+=16){ f.fillStyle = P.path[1]; f.fillRect(i, base+1, 8, 16); }
    f.fillStyle = P.grass; f.fillRect(0, base+18, LW, H2-base-18);
    for (let i=0;i<LW*3;i++){ f.fillStyle = P.grassDots[i%2]; f.fillRect((i*37)%LW, base+20+((i*13)%(H2-base-22)), 1, 2); }
    for (let i=0;i<LW/9;i++){ if ((i*7)%5===0){ f.fillStyle = pick(P.sparkle); f.fillRect((i*53)%LW, base+24+((i*29)%(H2-base-28)), 2, 2); } }
    for (let lx=24; lx<LW; lx+=72){ if (!day){ const grd = f.createRadialGradient(lx, base-14, 1, lx, base-14, 22); grd.addColorStop(0,'rgba(255,212,71,0.3)'); grd.addColorStop(1,'rgba(255,212,71,0)'); f.fillStyle = grd; f.fillRect(lx-22, base-36, 44, 44); }
      f.fillStyle='#05061a'; f.fillRect(lx-1, base-12, 3, 14); f.fillRect(lx-3, base-16, 7, 5); f.fillStyle = day ? '#fff6d0' : '#ffd447'; f.fillRect(lx-2, base-15, 5, 3); }
    Campus.bench(f, 40, base+24); Campus.bench(f, LW-80, base+24);
    frontKey = [LW, LH, s, day].join('|');
  }
  function frame(now){
    if (!cv.isConnected){ removeEventListener('resize', size); return; }
    const dt = Math.max(0, Math.min(0.05, (now-last)/1000)), t = now/1000, day = isDay(); last = now;
    if (frontKey !== [LW, LH, s, day].join('|')) buildFront();
    pan += ((UI.onb==='title' ? 0 : 1) - pan) * Math.min(1, dt*4);
    g.setTransform(s,0,0,s,0,0);
    const sky = g.createLinearGradient(0,0,0,LH); if (day){ sky.addColorStop(0,'#4fb2ff'); sky.addColorStop(1,'#c9ecff'); } else { sky.addColorStop(0,'#05071c'); sky.addColorStop(1,'#232a7a'); }
    g.fillStyle = sky; g.fillRect(0,0,LW,LH);
    if (day){ const sx = LW*0.84|0, sy = LH*0.13|0; g.fillStyle='#fff3a0'; g.fillRect(sx-9,sy-6,18,12); g.fillRect(sx-6,sy-9,12,18); g.fillStyle='#ffd447'; g.fillRect(sx-7,sy-4,14,8); g.fillRect(sx-4,sy-7,8,14); }
    else { for (let i=0;i<70;i++){ const x = (i*97)%LW, y = (i*53)%(LH*0.6|0); g.fillStyle = (Math.floor(t*1.5+i)%7===0) ? '#ffffff' : (i%4 ? '#ffffff66' : '#2ee6ff88'); g.fillRect(x, y, 1, 1); }
      const mx = LW*0.82|0, my = LH*0.14|0; for (let yy=-9; yy<=9; yy++) for (let xx=-9; xx<=9; xx++){ if (xx*xx+yy*yy <= 81 && (xx-5)*(xx-5)+(yy+3)*(yy+3) > 49){ g.fillStyle = (xx*xx+yy*yy > 60) ? '#d8d2a0' : '#f6f2cf'; g.fillRect(mx+xx, my+yy, 1, 1); } } }
    clouds.forEach(c=>{ c.x += (c.far ? 0.004 : 0.009) * dt; if (c.x > 1.15) c.x = -0.3; if (c.far) cloud(c.x*LW, c.y*LH, c.w*0.75, true); });
    clouds.forEach(c=>{ if (!c.far) cloud(c.x*LW, c.y*LH, c.w, false); });
    const baseY = Math.round(LH*0.74 + pan*LH*0.18) - 96; // front layer's top edge on screen
    g.setTransform(1,0,0,1,0,0); g.drawImage(front, 0, baseY*s); g.setTransform(s,0,0,s,0,0);
    if (baseY+150 < LH){ g.fillStyle = pal().grass; g.fillRect(0, baseY+150, LW, LH-baseY-150); }
    walkers.forEach(w=>{ w.x += w.dir*w.sp*dt/LW; if (w.x > 1.05) w.x = -0.05; if (w.x < -0.05) w.x = 1.05; w.f += dt*4;
      const sp = avatarCanvas(w.look, Math.floor(w.f)%2, false), px = Math.round(w.x*LW), py = baseY+96+1;
      g.fillStyle='#0006'; g.fillRect(px+2, py+15, 10, 2); g.save(); if (w.dir<0){ g.translate(px+14, 0); g.scale(-1,1); g.drawImage(sp, 0, py-2); } else g.drawImage(sp, px, py-2); g.restore(); });
    requestAnimationFrame(frame);
  }
  size(); addEventListener('resize', size); requestAnimationFrame(frame);
}
