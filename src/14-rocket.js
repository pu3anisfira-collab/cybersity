/* ============================================================
   ROCKET FIREWALL — fly through the gate with the right answer (Cyber Arcade)
   ============================================================
   The rocket flies right through deep space. Each question sends a firewall gate with three tunnels, one per
   answer; steer up or down into the right tunnel before you reach it. Right: points plus a streak bonus.
   Wrong: the firewall zaps a shield. Fly through all the gates with shields left to win. */
const ROCKET_GATES = 12;
Arcade.register('rocket', {
  controls: ['up', 'down'], size: [320, 200],
  create(api){
    const W = api.W, H = api.H, TOP = 26, RX = 64, GW = 78, LANES = 3;
    const laneH = (H - TOP - 6) / LANES, laneY = k => TOP + 3 + laneH*k + laneH/2;
    const qs = api.questions(ROCKET_GATES);
    let lane = 1, ry = laneY(1), t = 0, count = 3.2, lastTick = 4, gate = null, nextGate = 0.6, gi = 0, streak = 0, shake = 0, hit = 0, phase = 'fly', endT = 0;
    const speed = 62 * api.diff.speed;
    const stars = Array.from({length:70}, (_, i) => ({ x:(i*53)%W, y:TOP + (i*37)%(H-TOP), d: 1 + i%3 }));
    const bits = [], floats = [];

    function spawn(){ const q = qs[gi]; gate = { x: W + 10, q, opts: q.options, correct: q.options.indexOf(q.correct), done:false };
      api.prompt(q.q, `Gate ${gi+1} of ${ROCKET_GATES}` + (streak > 1 ? ` · streak ×${streak}` : '')); }
    function resolve(){
      gate.done = true; gate.picked = lane; const ok = lane === gate.correct; gi++;
      api.answer(ok, { q:gate.q.q, chosen:gate.opts[lane], correct:gate.q.correct, e:gate.q.e });
      if (ok){ streak++; const pts = 100 + (streak-1)*25; api.addScore(pts); floats.push({ text:'+'+pts, x:RX+20, y:ry-14, t:1, c:'#47f59a' });
        for (let i=0;i<18;i++) bits.push({ x:RX, y:ry, vx:30+Math.random()*90, vy:(Math.random()-0.5)*110, t:0.8, c:i%2 ? '#47f59a' : '#ffd447' }); }
      else { streak = 0; shake = 0.45; hit = 0.6; floats.push({ text:'SHIELD -1', x:RX+20, y:ry-14, t:1, c:'#ff5d6e' });
        for (let i=0;i<14;i++) bits.push({ x:RX+8, y:ry, vx:-20-Math.random()*60, vy:(Math.random()-0.5)*90, t:0.7, c:'#ff5d6e' }); api.loseLife(); }
      if (api.lives() > 0 && gi >= ROCKET_GATES){ phase = 'won'; api.prompt(''); api.end(true, `You flew through all ${ROCKET_GATES} firewall gates!`); }
      else if (api.lives() <= 0){ phase = 'lost'; api.prompt(''); }
    }
    function step(dt){
      t += dt; ry += (laneY(lane) - ry) * Math.min(1, dt*10); shake = Math.max(0, shake - dt); hit = Math.max(0, hit - dt);
      stars.forEach(s => { s.x -= speed * dt * s.d * 0.35; if (s.x < 0) s.x += W; });
      bits.forEach(b => { b.t -= dt; b.x += b.vx*dt; b.y += b.vy*dt; }); for (let i=bits.length-1;i>=0;i--) if (bits[i].t <= 0) bits.splice(i,1);
      floats.forEach(f => { f.t -= dt; f.y -= 24*dt; }); for (let i=floats.length-1;i>=0;i--) if (floats[i].t <= 0) floats.splice(i,1);
    }
    function fitLines(g, text, w, h, base){ const words = text.split(' '); let fs = base, lines;
      for (;;){ g.font = `${fs}px "Jersey 10", monospace`; lines = []; let cur = '';
        words.forEach(wd => { const tryL = cur ? cur + ' ' + wd : wd; if (g.measureText(tryL).width > w && cur){ lines.push(cur); cur = wd; } else cur = tryL; }); lines.push(cur);
        if ((lines.length*fs*0.95 <= h && lines.every(l => g.measureText(l).width <= w)) || fs < 6) return { lines, fs }; fs *= 0.9; } }

    function drawRocket(g){
      const y = ry + Math.sin(t*6)*1.5, tilt = (laneY(lane) - ry) * 0.012; g.save(); g.translate(RX, y); g.rotate(tilt);
      if (hit > 0 && Math.floor(hit*14)%2) g.globalAlpha = 0.45;
      const fl = 6 + Math.random()*5; g.fillStyle = '#ff9a3d'; g.beginPath(); g.moveTo(-14, -4); g.lineTo(-14-fl, 0); g.lineTo(-14, 4); g.fill();
      g.fillStyle = '#ffd447'; g.beginPath(); g.moveTo(-14, -2); g.lineTo(-14-fl*0.6, 0); g.lineTo(-14, 2); g.fill();
      g.fillStyle = '#05061a'; g.fillRect(-15, -7, 26, 14); g.beginPath(); g.moveTo(10, -7); g.lineTo(19, 0); g.lineTo(10, 7); g.fill();
      g.fillStyle = '#eef0fb'; g.fillRect(-14, -6, 24, 12); g.beginPath(); g.moveTo(10, -6); g.lineTo(17, 0); g.lineTo(10, 6); g.fill();
      g.fillStyle = '#ff4fae'; g.fillRect(-14, -6, 5, 12); g.fillRect(-12, -11, 6, 5); g.fillRect(-12, 6, 6, 5);
      g.fillStyle = '#2ee6ff'; g.fillRect(1, -3, 6, 6); g.fillStyle = '#05061a'; g.fillRect(3, -1, 2, 2);
      if (api.lives() > 0){ g.strokeStyle = `rgba(46,230,255,${0.25 + 0.15*Math.sin(t*5)})`; g.lineWidth = 1.5; g.beginPath(); g.ellipse(2, 0, 22, 15, 0, 0, Math.PI*2); g.stroke(); }
      g.restore(); g.globalAlpha = 1;
    }
    function drawGate(g){
      if (!gate) return; const x = gate.x;
      for (let k=0;k<LANES;k++){ const y0 = TOP + 3 + laneH*k;
        // firewall bricks between the tunnels
        g.fillStyle = '#05061a'; g.fillRect(x-1, y0-3, GW+2, 6);
        for (let bx=0; bx<GW; bx+=10){ g.fillStyle = (bx/10 + k)%2 ? '#b0561a' : '#ff9a3d'; g.fillRect(x+bx, y0-2, 9, 4); }
        // the tunnel: glowing frame and the answer
        let edge = ['#2ee6ff','#ff4fae','#ffd447'][k], fill = 'rgba(11,15,44,0.82)';
        if (gate.done){ if (k === gate.correct){ edge = '#47f59a'; fill = 'rgba(15,90,52,0.85)'; } else if (k === gate.picked){ edge = '#ff5d6e'; fill = 'rgba(90,26,38,0.85)'; } }
        g.fillStyle = edge; g.fillRect(x, y0+3, GW, laneH-6); g.fillStyle = fill; g.fillRect(x+2, y0+5, GW-4, laneH-10);
        const { lines, fs } = fitLines(g, gate.opts[k], GW-10, laneH-14, 17);
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
        lines.forEach((l, i) => g.fillText(l, x + GW/2, y0 + laneH/2 + (i - (lines.length-1)/2) * fs*0.95)); }
      const yb = TOP + 3 + laneH*LANES; g.fillStyle = '#05061a'; g.fillRect(x-1, yb-3, GW+2, 6);
      for (let bx=0; bx<GW; bx+=10){ g.fillStyle = (bx/10)%2 ? '#ff9a3d' : '#b0561a'; g.fillRect(x+bx, yb-2, 9, 4); }
    }
    function draw(g){
      g.save(); if (shake > 0) g.translate((Math.random()-0.5)*shake*10, (Math.random()-0.5)*shake*8);
      const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#05061a'); sky.addColorStop(1, '#1d1450'); g.fillStyle = sky; g.fillRect(-10, -10, W+20, H+20);
      stars.forEach(s => { g.fillStyle = s.d === 3 ? '#ffffff' : s.d === 2 ? '#ffffff99' : '#2ee6ff66'; g.fillRect(s.x, s.y, s.d === 3 ? 2 : 1, 1); });
      const px = (W*0.8 - t*4) % (W+80); g.fillStyle = '#a46bff55'; g.beginPath(); g.arc(px < -40 ? px + W + 80 : px, 70, 22, 0, Math.PI*2); g.fill();
      g.fillStyle = '#ff4fae33'; g.fillRect((px < -40 ? px + W + 80 : px) - 34, 69, 68, 3);
      drawGate(g);
      bits.forEach(b => { g.globalAlpha = Math.max(0, b.t/0.8); g.fillStyle = b.c; g.fillRect(b.x, b.y, 2, 2); }); g.globalAlpha = 1;
      drawRocket(g);
      floats.forEach(f => { g.globalAlpha = Math.max(0, f.t); g.font = '14px "Jersey 10", monospace'; g.textAlign = 'left'; g.fillStyle = '#05061a'; g.fillText(f.text, f.x+1, f.y+1); g.fillStyle = f.c; g.fillText(f.text, f.x, f.y); }); g.globalAlpha = 1;
      g.restore();
      // top strip: gates passed and streak
      g.fillStyle = '#05061acc'; g.fillRect(0, 0, W, 20);
      for (let i=0;i<ROCKET_GATES;i++){ const done = i < gi; g.fillStyle = done ? '#47f59a' : i === gi ? (Math.floor(t*3)%2 ? '#ffd447' : '#5a6199') : '#2a3070'; g.fillRect(6 + i*13, 6, 10, 8); }
      g.font = '7px Silkscreen, monospace'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillStyle = '#e9ecff'; g.fillText(`PASSED ${gi}/${ROCKET_GATES}`, W-6, 10);
      if (streak > 1){ g.textAlign = 'left'; g.fillStyle = '#ffd447'; g.fillText(`STREAK ×${streak}`, 172, 10); }
      const big = (txt, col, size) => { g.font = `${size}px "Jersey 10", monospace`; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(txt).width;
        g.fillStyle = '#05061acc'; g.fillRect(W/2 - w/2 - 10, H/2 - size*0.6, w + 20, size*1.15); g.fillStyle = '#000'; g.fillText(txt, W/2+2, H/2+2); g.fillStyle = col; g.fillText(txt, W/2, H/2); };
      if (count > 0 && phase === 'fly') big(count > 0.9 ? String(Math.ceil(count - 0.9)) : 'LAUNCH!', count > 0.9 ? '#ffd447' : '#2ee6ff', 40);
      if (phase === 'won') big('FIREWALL CLEARED!', '#47f59a', 32);
      if (phase === 'lost') big('SHIELDS DOWN!', '#ff5d6e', 36);
    }
    return {
      update(dt){
        step(dt);
        if (count > 0){ count -= dt; const n = Math.ceil(count - 0.9); if (n !== lastTick && n > 0){ lastTick = n; api.sfx('tick'); } return; }
        if (!gate){ nextGate -= dt; if (nextGate <= 0 && gi < ROCKET_GATES) spawn(); return; }
        gate.x -= speed * dt;
        if (!gate.done && gate.x <= RX + 6) resolve();
        if (gate && gate.x < -GW - 4){ gate = null; nextGate = 0.4; }
      },
      after(dt){ endT += dt; step(dt); if (gate) gate.x -= speed * dt * 0.5; },
      draw,
      input(dir){ if (phase !== 'fly') return; const nl = Math.max(0, Math.min(LANES-1, lane + (dir === 'up' ? -1 : dir === 'down' ? 1 : 0))); if (nl !== lane){ lane = nl; api.sfx('move'); } },
      // for tests: the lane holding the right answer and progress
      state: () => ({ lane, correctLane: gate && !gate.done ? gate.correct : null, passed: gi, phase })
    };
  }
});
