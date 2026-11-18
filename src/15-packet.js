/* ============================================================
   PACKET DROP — sort falling data packets into the right bin (Cyber Arcade)
   ============================================================
   Labelled blocks fall from the top. Move left/right into the column above the right bin (down drops faster).
   A right bin clears the block and one junk block from that column; a wrong bin stacks a junk block there.
   A column that stacks up to the warning line overflows: you lose a heart and the column is flushed.
   Level 1 sorts Safe/Risky, level 2 sorts Phishing/Malware/Safe. Blocks fall faster as you go. */
const PACKET_PER_LEVEL = 6, PACKET_STACK = 4;
const PACKET_BIN_COLORS = { Safe:'#47f59a', Risky:'#ff5d6e', Phishing:'#ff4fae', Malware:'#a46bff' };
Arcade.register('packet', {
  controls: ['left', 'down', 'right'], size: [320, 200],
  create(api){
    const W = api.W, H = api.H, FX = 16, FW = W - 32, TOP = 24, BIN_H = 26, BIN_Y = H - BIN_H - 2, JUNK_H = 13, BW_PAD = 6;
    const levels = ['saferisky', 'threats'].map(id => { const s = api.sortSet(id); return { ...s, items: s.items.slice(0, PACKET_PER_LEVEL) }; });
    const TOTAL = levels.reduce((n, l) => n + l.items.length, 0);
    let lv = 0, ii = 0, col = 0, block = null, junk = [], t = 0, count = 3.2, lastTick = 4, phase = 'play', sorted = 0, fall = 20 * api.diff.speed, fast = false, banner = null, binFlash = [], gap = 0.5;
    const bits = [], floats = [];
    const L = () => levels[lv], NB = () => L().bins.length, colW = () => FW / NB(), colX = c => FX + c*colW();
    const stackTop = c => BIN_Y - junk[c]*JUNK_H;

    function startLevel(){ junk = L().bins.map(() => 0); binFlash = L().bins.map(() => 0); col = Math.floor(NB()/2); banner = { text:`LEVEL ${lv+1}: ${L().t.toUpperCase()}`, t:2 }; }
    function spawn(){
      const it = L().items[ii]; col = Math.min(col, NB()-1); fast = false;
      block = { it, y: TOP - 4, landed:false };
      const next = L().items[ii+1] || (levels[lv+1] && levels[lv+1].items[0]);
      api.prompt(it.t, `Level ${lv+1} · ${L().t} · packet ${sorted+1} of ${TOTAL}` + (next ? ` · next: ${next.t}` : ''));
    }
    function land(){
      const bin = L().bins[col], ok = bin === block.it.b, cx = colX(col) + colW()/2;
      api.answer(ok, { q:`Sort: ${block.it.t}`, chosen:bin, correct:block.it.b, e:block.it.e }); sorted++;
      if (ok){ const pts = 100 + (junk[col] ? 50 : 0); api.addScore(pts); binFlash[col] = 0.6; if (junk[col]) junk[col]--;
        floats.push({ text:'+' + pts, x:cx, y:BIN_Y-10, t:1, c:'#47f59a' });
        for (let i=0;i<16;i++) bits.push({ x:cx, y:BIN_Y, vx:(Math.random()-0.5)*120, vy:-40-Math.random()*90, t:0.8, c:PACKET_BIN_COLORS[bin] || '#47f59a' }); }
      else { junk[col]++; binFlash[col] = -0.6; floats.push({ text:`→ ${block.it.b}`, x:cx, y:stackTop(col)-8, t:1.3, c:'#ff9aa8' });
        if (junk[col] >= PACKET_STACK){ junk[col] = 0; banner = { text:'OVERFLOW!', t:1.2, red:true }; api.loseLife(); } }
      block = null; fall *= 1.06; gap = 0.45;
      if (api.lives() <= 0){ phase = 'lost'; api.prompt(''); return; }
      ii++;
      if (ii >= L().items.length){ if (lv + 1 < levels.length){ lv++; ii = 0; startLevel(); gap = 1.6; }
        else { phase = 'won'; api.prompt(''); api.end(true, `You sorted all ${TOTAL} packets before the stack overflowed!`); } }
    }
    function fitLines(g, text, w, h, base){ const words = text.split(' '); let fs = base, lines;
      for (;;){ g.font = `${fs}px "Jersey 10", monospace`; lines = []; let cur = '';
        words.forEach(wd => { const tryL = cur ? cur + ' ' + wd : wd; if (g.measureText(tryL).width > w && cur){ lines.push(cur); cur = wd; } else cur = tryL; }); lines.push(cur);
        if ((lines.length*fs*0.95 <= h && lines.every(l => g.measureText(l).width <= w)) || fs < 6) return { lines, fs }; fs *= 0.9; } }
    function tick(dt){
      t += dt; binFlash = binFlash.map(f => f > 0 ? Math.max(0, f - dt) : Math.min(0, f + dt));
      if (banner && (banner.t -= dt) <= 0) banner = null;
      bits.forEach(b => { b.t -= dt; b.x += b.vx*dt; b.y += b.vy*dt; b.vy += 200*dt; }); for (let i=bits.length-1;i>=0;i--) if (bits[i].t <= 0) bits.splice(i,1);
      floats.forEach(f => { f.t -= dt; f.y -= 20*dt; }); for (let i=floats.length-1;i>=0;i--) if (floats[i].t <= 0) floats.splice(i,1);
    }
    function draw(g){
      g.fillStyle = '#070a1f'; g.fillRect(0, 0, W, H);
      for (let y = TOP; y < BIN_Y; y += 8){ g.fillStyle = '#10153b'; g.fillRect(FX, y, FW, 1); } // data grid
      for (let c=0; c<=NB(); c++){ g.fillStyle = '#1d2358'; g.fillRect(FX + c*colW() - 1, TOP, 2, BIN_Y - TOP); }
      g.fillStyle = '#ff5d6e55'; const dangerY = BIN_Y - PACKET_STACK*JUNK_H; for (let x = FX; x < FX+FW; x += 8) g.fillRect(x, dangerY, 4, 1); // overflow line
      // highlight the current column
      if (block){ g.fillStyle = '#2ee6ff14'; g.fillRect(colX(col)+1, TOP, colW()-2, BIN_Y-TOP); }
      // junk stacks
      for (let c=0; c<NB(); c++) for (let j=0; j<junk[c]; j++){ const x = colX(c) + BW_PAD/2, y = BIN_Y - (j+1)*JUNK_H, w = colW() - BW_PAD;
        g.fillStyle = '#05061a'; g.fillRect(x, y, w, JUNK_H-1); g.fillStyle = '#3a4166'; g.fillRect(x+1, y+1, w-2, JUNK_H-3);
        g.strokeStyle = '#5a6199'; g.lineWidth = 1; g.beginPath(); g.moveTo(x+4, y+3); g.lineTo(x+w-4, y+JUNK_H-4); g.moveTo(x+w-4, y+3); g.lineTo(x+4, y+JUNK_H-4); g.stroke(); }
      // bins
      L().bins.forEach((b, c) => { const x = colX(c) + 2, w = colW() - 4, col0 = PACKET_BIN_COLORS[b] || '#2ee6ff', fl = binFlash[c];
        g.fillStyle = '#05061a'; g.fillRect(x-1, BIN_Y-1, w+2, BIN_H+2); g.fillStyle = fl > 0 ? '#47f59a' : fl < 0 ? '#ff5d6e' : shade(col0, -0.45); g.fillRect(x, BIN_Y, w, BIN_H);
        g.fillStyle = col0; g.fillRect(x, BIN_Y, w, 3); g.font = '15px "Jersey 10", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(b.toUpperCase(), x + w/2, BIN_Y + BIN_H/2 + 2); });
      // the falling packet
      if (block){ const w = colW() - BW_PAD, x = colX(col) + BW_PAD/2, h = 30, y = block.y;
        g.fillStyle = '#2ee6ff22'; g.fillRect(x, y + h, w, stackTop(col) - y - h); // drop guide
        g.fillStyle = '#05061a'; g.fillRect(x-1, y-1, w+2, h+2); g.fillStyle = '#2ee6ff'; g.fillRect(x, y, w, h); g.fillStyle = '#0b0f2c'; g.fillRect(x+2, y+2, w-4, h-4);
        g.fillStyle = '#ffd447'; g.fillRect(x+3, y+3, 4, 4);
        const { lines, fs } = fitLines(g, block.it.t, w - 12, h - 6, 14); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
        lines.forEach((l, i) => g.fillText(l, x + w/2, y + h/2 + 1 + (i - (lines.length-1)/2) * fs*0.95)); }
      bits.forEach(b => { g.globalAlpha = Math.max(0, b.t/0.8); g.fillStyle = b.c; g.fillRect(b.x, b.y, 2, 2); }); g.globalAlpha = 1;
      floats.forEach(f => { g.globalAlpha = Math.max(0, Math.min(1, f.t)); g.font = '14px "Jersey 10", monospace'; g.textAlign = 'center'; g.fillStyle = '#05061a'; g.fillText(f.text, f.x+1, f.y+1); g.fillStyle = f.c; g.fillText(f.text, f.x, f.y); }); g.globalAlpha = 1;
      // top strip
      g.fillStyle = '#05061acc'; g.fillRect(0, 0, W, 20); g.font = '7px Silkscreen, monospace'; g.textBaseline = 'middle';
      g.textAlign = 'left'; g.fillStyle = '#e9ecff'; g.fillText(`LEVEL ${lv+1} · ${L().t.toUpperCase()}`, 6, 10);
      g.textAlign = 'right'; g.fillText(`SORTED ${sorted}/${TOTAL}`, W-6, 10);
      const big = (txt, colr, size, y = H*0.42) => { g.font = `${size}px "Jersey 10", monospace`; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(txt).width;
        g.fillStyle = '#05061acc'; g.fillRect(W/2 - w/2 - 10, y - size*0.6, w + 20, size*1.15); g.fillStyle = '#000'; g.fillText(txt, W/2+2, y+2); g.fillStyle = colr; g.fillText(txt, W/2, y); };
      if (count > 0 && phase === 'play') big(count > 0.9 ? String(Math.ceil(count - 0.9)) : 'SORT!', count > 0.9 ? '#ffd447' : '#ff4fae', 40);
      else if (banner) big(banner.text, banner.red ? '#ff5d6e' : '#ffd447', Math.min(28, 520/banner.text.length));
      if (phase === 'won') big('ALL PACKETS SORTED!', '#47f59a', 30);
      if (phase === 'lost') big('STACK OVERFLOW!', '#ff5d6e', 36);
    }
    startLevel();
    return {
      update(dt){
        tick(dt);
        if (count > 0){ count -= dt; const n = Math.ceil(count - 0.9); if (n !== lastTick && n > 0){ lastTick = n; api.sfx('tick'); } return; }
        if (!block){ gap -= dt; if (gap <= 0 && phase === 'play') spawn(); return; }
        block.y += fall * (fast ? 6 : 1) * dt;
        if (block.y + 30 >= stackTop(col)){ block.y = stackTop(col) - 30; land(); }
      },
      after(dt){ tick(dt); },
      draw,
      input(dir){ if (phase !== 'play' || !block) return;
        if (dir === 'down'){ fast = true; return; }
        const nc = Math.max(0, Math.min(NB()-1, col + (dir === 'left' ? -1 : 1)));
        if (nc !== col && block.y + 30 < stackTop(nc)){ col = nc; api.sfx('move'); } },
      // for tests: current column, the right bin's column and progress
      state: () => ({ col, correctCol: block ? L().bins.indexOf(block.it.b) : null, sorted, phase, total:TOTAL })
    };
  }
});
