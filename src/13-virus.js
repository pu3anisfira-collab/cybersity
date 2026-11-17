/* ============================================================
   VIRUS ESCAPE — 3-lane campus runner (Cyber Arcade game and the Campus Incident)
   ============================================================
   A virus monster chases the player down the campus path. Each question sends three answer signs down the
   lanes; switch into the right lane before you reach them. Right: speed boost and distance from the monster.
   Wrong: stumble, lose a life, the monster closes in. Every 2 right answers secures the next campus
   building; all 6 saves the campus. Launched from the Campus Incident it secures the real buildings.
   Pseudo-3D: things at distance z (ahead of the player) are drawn at scale p = F / (z + F). */
const VIRUS_LANE_COLORS = ['#2ee6ff', '#ff4fae', '#ffd447'];
Arcade.register('virus', {
  controls: ['left', 'right'], size: [320, 200],
  story: p => p.incident && incActive()
    ? 'ALERT! A virus monster broke out of the Cyber Core and is attacking the campus. Outrun it and answer correctly to secure all 6 buildings.'
    : 'Practice run: a virus monster is chasing you across campus. Answer correctly to secure all 6 buildings.',
  resultActions: run => run.params.incident ? `<button class="btn green" data-act="incCampus">▶ Back to campus</button>` : '',
  create(api){
    const W = api.W, H = api.H, CX = W/2, HZ = 62, PY = 178, F = 10, ROADW = 142, SPAWN = 16, PER = 2;
    const P = pal(), day = isDay();
    const incident = !!(api.params.incident && incActive());
    const order = INCIDENT.map(x => x.b);
    let secured = incident ? S.incident.secured.length : 0; if (secured >= order.length) secured = 0;
    const qs = api.questions(60);
    let qi = 0, lane = 0, laneX = 0, travel = 0, boost = 0, gap = 0.7, t = 0, count = 3.2, lastTick = 4;
    let sign = null, nextSign = 0.4, rightAnswers = 0, streak = 0, stumble = 0, shake = 0, banner = null, phase = 'run', endT = 0, runF = 0;
    const floats = [], bits = [];
    const look = S.user ? S.user.look : { skin:'#f1c08f', hairStyle:'short', hairColor:'#1c1626', shirt:'#2ee6ff', acc:'none' };
    const speed0 = 4.2 * api.diff.speed;

    // scenery: campus building fronts (hacked and safe versions), trees, lamps
    const fronts = {};
    order.concat(['home']).forEach(id => { const b = Campus.buildings.find(v => v.id === id);
      fronts[id] = [false, true].map(h => { const c = document.createElement('canvas'); c.width = b.pw+8; c.height = b.ph+6; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; Campus.drawFront(g, id, 4, 4, h && id !== 'home'); return c; }); });
    const trees = [0,1,2].map(v => { const c = document.createElement('canvas'); c.width = 20; c.height = 24; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; Campus.tree(g, 2, 2, v); return c; });
    const scenery = Array.from({length:12}, (_, i) => ({ z: 3 + i*5.5, side: i%2 ? 1 : -1, kind: i%4 === 3 ? 'tree' : 'bld', id: [...order, 'home'][i%7], v: i%3 }));
    // the incident's red edge glow is drawn once and faded in and out (a live full-screen gradient is slow to paint)
    const vignette = document.createElement('canvas'); vignette.width = W; vignette.height = H;
    { const vg = vignette.getContext('2d'), gr = vg.createRadialGradient(CX, H/2, H*0.4, CX, H/2, H*0.9); gr.addColorStop(0, 'rgba(255,30,60,0.1)'); gr.addColorStop(1, 'rgba(255,30,60,0.42)'); vg.fillStyle = gr; vg.fillRect(0, 0, W, H); }
    const skyline = Array.from({length:24}, (_, i) => ({ x: i*14 + ((i*7)%9), w: 10 + (i*5)%8, h: 8 + (i*13)%22 }));

    const p = z => F / (z + F), yAt = z => HZ + (PY - HZ) * p(z), hw = z => ROADW * p(z);
    const laneCX = (k, z) => CX + (k - 1) * hw(z) * 2/3;
    const isSafe = id => !incident || S.incident.secured.includes(id) || id === 'home';

    function spawnSign(){ const q = qs[qi++ % qs.length]; sign = { z:SPAWN, q, opts:q.options, correct:q.options.indexOf(q.correct), done:false };
      api.prompt(q.q, `Securing ${bName(order[secured])} · ${secured}/6 secured`); }
    function resolve(){
      sign.done = true; const chosen = lane + 1, ok = chosen === sign.correct;
      api.answer(ok, { q:sign.q.q, chosen:sign.opts[chosen], correct:sign.q.correct, e:sign.q.e }); sign.picked = chosen;
      if (ok){ streak++; rightAnswers++; api.addScore(100 + (streak-1)*25); boost = 1; gap = Math.min(1, gap + 0.14);
        floats.push({ text:'+' + (100 + (streak-1)*25), x:CX + laneX*ROADW*2/3, y:PY-70, t:1, c:'#47f59a' });
        if (rightAnswers % PER === 0) secure();
      } else { streak = 0; stumble = 0.7; shake = 0.45; gap = Math.max(0, gap - 0.22);
        floats.push({ text:'-1 ♥', x:CX + laneX*ROADW*2/3, y:PY-70, t:1, c:'#ff5d6e' }); api.loseLife();
        if (gap <= 0) caught(); }
    }
    function secure(){
      const id = order[secured]; secured++; api.addScore(200); api.sfx('start'); api.flash('#47f59a');
      banner = { text: bName(id).toUpperCase() + ' SECURED!', id, t:1.8 };
      if (incident) incSecure(id);
      if (secured >= order.length) win();
    }
    function win(){ phase = 'won'; endT = 0; api.prompt('');
      for (let i=0;i<60;i++) bits.push({ x:CX, y:H-10, vx:(Math.random()-0.5)*160, vy:-60-Math.random()*120, t:1.6, c:['#47f59a','#ffd447','#2ee6ff','#ff4fae'][i%4] });
      api.end(true, incident ? 'You chased the virus off campus. All 6 buildings are secured!' : 'All 6 buildings secured. Campus saved!'); }
    function caught(){ if (phase !== 'run') return; phase = 'caught'; endT = 0; api.prompt('');
      api.end(false, incident ? 'The virus caught you! The buildings you secured stay safe. Chase it again to finish the job.' : 'The virus caught you! Answer correctly to keep your distance.'); }

    function step(dt, running){
      t += dt; const sp = speed0 * (1 + boost*0.7) * (running ? 1 : 0.35);
      travel += sp*dt; boost = Math.max(0, boost - dt*0.6); laneX += (lane - laneX) * Math.min(1, dt*14); runF += dt * (6 + boost*6);
      scenery.forEach(o => { o.z -= sp*dt; if (o.z < -3) { o.z += 66; } });
      stumble = Math.max(0, stumble - dt); shake = Math.max(0, shake - dt);
      if (banner && (banner.t -= dt) <= 0) banner = null;
      floats.forEach(f => { f.t -= dt; f.y -= 30*dt; }); for (let i=floats.length-1;i>=0;i--) if (floats[i].t <= 0) floats.splice(i,1);
      bits.forEach(b => { b.t -= dt; b.x += b.vx*dt; b.y += b.vy*dt; b.vy += 220*dt; }); for (let i=bits.length-1;i>=0;i--) if (bits[i].t <= 0) bits.splice(i,1);
      return sp;
    }

    /* ---- drawing ---- */
    function drawMonster(g){
      const close = 1 - gap, R = 22 + close*30, mx = CX + laneX*ROADW*2/3*0.55 + Math.sin(t*3)*6, my = H + 30 - close*82 + Math.sin(t*7)*2;
      if (phase === 'won'){ if (endT > 0.2) return; }
      g.save(); g.translate(mx, my); const spin = t*1.5;
      for (let i=0;i<10;i++){ const a = spin + i/10*Math.PI*2; g.fillStyle = '#1f8f55'; g.beginPath(); g.moveTo(Math.cos(a-0.18)*R*0.9, Math.sin(a-0.18)*R*0.9); g.lineTo(Math.cos(a)*R*1.35, Math.sin(a)*R*1.35); g.lineTo(Math.cos(a+0.18)*R*0.9, Math.sin(a+0.18)*R*0.9); g.fill();
        g.fillStyle = '#ffd447'; g.fillRect(Math.cos(a)*R*1.35-2, Math.sin(a)*R*1.35-2, 4, 4); }
      g.fillStyle = '#05061a'; g.beginPath(); g.arc(0, 0, R+3, 0, Math.PI*2); g.fill();
      g.fillStyle = '#47f59a'; g.beginPath(); g.arc(0, 0, R, 0, Math.PI*2); g.fill();
      g.fillStyle = '#2fc77a'; g.beginPath(); g.arc(R*0.25, R*0.3, R*0.7, 0, Math.PI*2); g.fill();
      for (const sx of [-1, 1]){ g.fillStyle = '#fff'; g.fillRect(sx*R*0.38 - R*0.16, -R*0.3, R*0.32, R*0.28); g.fillStyle = '#ff2a4a'; g.fillRect(sx*R*0.38 - R*0.06 + Math.sin(t*4)*R*0.04, -R*0.22, R*0.13, R*0.14);
        g.fillStyle = '#05061a'; g.fillRect(sx*R*0.38 - R*0.2, -R*0.42 + (sx > 0 ? -2 : 2), R*0.4, R*0.07); }
      g.fillStyle = '#05061a'; g.fillRect(-R*0.45, R*0.15, R*0.9, R*0.32); g.fillStyle = '#fff'; for (let i=0;i<5;i++) g.fillRect(-R*0.42 + i*R*0.18, R*0.15, R*0.1, R*0.12);
      g.restore();
    }
    function draw(g){
      g.save(); if (shake > 0) g.translate((Math.random()-0.5)*shake*10, (Math.random()-0.5)*shake*6);
      // sky with campus skyline; red alarm glow during the incident
      const sky = g.createLinearGradient(0, 0, 0, HZ); if (day){ sky.addColorStop(0, '#4fb2ff'); sky.addColorStop(1, '#c9ecff'); } else { sky.addColorStop(0, '#05071c'); sky.addColorStop(1, '#262c7a'); }
      g.fillStyle = sky; g.fillRect(-10, -10, W+20, HZ+12);
      if (!day) for (let i=0;i<40;i++){ g.fillStyle = (Math.floor(t*2+i)%9===0) ? '#fff' : '#ffffff55'; g.fillRect((i*67)%W, (i*29)%(HZ-14), 1, 1); }
      skyline.forEach(s => { const x = (s.x - travel*0.6) % (W+40); const xx = x < -20 ? x + W + 40 : x; g.fillStyle = day ? '#8fb7d9' : '#141a4a'; g.fillRect(xx, HZ - s.h, s.w, s.h);
        if (!day){ g.fillStyle = '#ffd44755'; for (let k=3; k<s.h-2; k+=5) g.fillRect(xx+2, HZ - s.h + k, 2, 1); } });
      // grass and the brick path
      g.fillStyle = P.grass; g.fillRect(-10, HZ, W+20, H-HZ+10);
      const off = travel % 2;
      for (let k = 31; k >= -2; k--){ const z0 = k*2 - off, z1 = z0 + 2; if (z1 <= -3) continue;
        const y0 = yAt(Math.max(z0, -2.9)), y1 = yAt(z1), w0 = hw(Math.max(z0, -2.9)), w1 = hw(z1);
        g.fillStyle = (k % 2) ? P.path[0] : P.path[1]; g.beginPath(); g.moveTo(CX-w1, y1); g.lineTo(CX+w1, y1); g.lineTo(CX+w0, y0); g.lineTo(CX-w0, y0); g.fill();
        g.fillStyle = '#05061a88'; g.beginPath(); g.moveTo(CX-w1-3*p(z1), y1); g.lineTo(CX-w1, y1); g.lineTo(CX-w0, y0); g.lineTo(CX-w0-3*p(z0), y0); g.fill();
        g.beginPath(); g.moveTo(CX+w1+3*p(z1), y1); g.lineTo(CX+w1, y1); g.lineTo(CX+w0, y0); g.lineTo(CX+w0+3*p(z0), y0); g.fill();
        if (k % 2 === 0) for (const s of [-1, 1]){ const x0 = CX + s*w0/3, x1 = CX + s*w1/3, lw0 = 1.6*p(Math.max(z0,-2.9)), lw1 = 1.6*p(z1);
          g.fillStyle = '#ffffff55'; g.beginPath(); g.moveTo(x1-lw1, y1); g.lineTo(x1+lw1, y1); g.lineTo(x0+lw0, y0); g.lineTo(x0-lw0, y0); g.fill(); } }
      // speed lines while boosted
      if (boost > 0.05){ g.fillStyle = `rgba(255,255,255,${0.35*boost})`; for (let i=0;i<10;i++){ const yy = HZ + 20 + ((i*37 + t*400) % (H-HZ-20)); g.fillRect((i%2 ? W-40 : 8) + (i*13)%30, yy, 2, 14); } }
      // buildings, trees and lamps beside the path (far first)
      scenery.slice().sort((a, b) => b.z - a.z).forEach(o => { if (o.z < -2.5 || o.z > 60) return; const pp = p(o.z), y = yAt(o.z);
        if (o.kind === 'bld'){ const img = fronts[o.id][isSafe(o.id) ? 0 : 1], s = pp*1.35, w = img.width*s, h = img.height*s, x = CX + o.side*(hw(o.z) + 10*pp + w/2);
          g.drawImage(img, x - w/2, y - h, w, h);
          if (!isSafe(o.id) && Math.random() < 0.25){ g.fillStyle = 'rgba(255,60,80,0.25)'; g.fillRect(x - w/2, y - h, w, h); } }
        else { const img = trees[o.v], s = pp*2.4, w = img.width*s, h = img.height*s, x = CX + o.side*(hw(o.z) + 14*pp + w/2); g.drawImage(img, x - w/2, y - h, w, h); }
        const lx = CX + o.side*(hw(o.z) + 4*pp), lh = 34*pp; g.fillStyle = '#05061a'; g.fillRect(lx - 1.2*pp, y - lh, 2.4*pp, lh);
        g.fillStyle = incident && !secured ? (Math.floor(t*4)%2 ? '#ff5d6e' : '#5a1a26') : '#ffd447'; g.fillRect(lx - 3*pp, y - lh - 3*pp, 6*pp, 3*pp); });
      // the three answer signs
      if (sign && sign.z < SPAWN + 1 && sign.z > -2.5){ const z = sign.z, pp = p(z), y = yAt(z);
        if (sign.done) g.globalAlpha = Math.max(0, Math.min(1, (z + 2.5) / 2.5)); // fade once passed
        for (let k=0;k<3;k++){ const lx = laneCX(k, z), bw = hw(z)*2/3*0.92, bh = bw*0.5, by = y - 26*pp - bh;
          g.fillStyle = '#05061a'; g.fillRect(lx - bw*0.32, by + bh, 2.5*pp, 26*pp); g.fillRect(lx + bw*0.32 - 2.5*pp, by + bh, 2.5*pp, 26*pp);
          let fill = '#0b0f2c', edge = VIRUS_LANE_COLORS[k];
          if (sign.done){ if (k === sign.correct){ fill = '#0f5a34'; edge = '#47f59a'; } else if (k === sign.picked){ fill = '#5a1a26'; edge = '#ff5d6e'; } }
          g.fillStyle = '#05061a'; g.fillRect(lx - bw/2 - 2*pp, by - 2*pp, bw + 4*pp, bh + 4*pp); g.fillStyle = edge; g.fillRect(lx - bw/2, by, bw, bh);
          g.fillStyle = fill; g.fillRect(lx - bw/2 + 2.5*pp, by + 2.5*pp, bw - 5*pp, bh - 5*pp);
          // wrap the answer onto up to 3 lines and fit it to the board
          const words = sign.opts[k].split(' '); let fs = bh*0.36, lines;
          for (;;){ g.font = `${fs}px "Jersey 10", monospace`; lines = []; let cur = '';
            words.forEach(wd => { const tryL = cur ? cur + ' ' + wd : wd; if (g.measureText(tryL).width > bw*0.86 && cur){ lines.push(cur); cur = wd; } else cur = tryL; }); lines.push(cur);
            if ((lines.length*fs*0.95 <= bh*0.8 && lines.every(l => g.measureText(l).width <= bw*0.88)) || fs < 4) break; fs *= 0.9; }
          g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
          lines.forEach((l, i) => g.fillText(l, lx, by + bh/2 + (i - (lines.length-1)/2) * fs*0.95)); } g.globalAlpha = 1; }
      // the runner (seen from behind)
      const px = CX + laneX*ROADW*2/3, bob = stumble > 0 ? Math.sin(stumble*30)*3 + 4 : Math.abs(Math.sin(runF*Math.PI))*-3;
      const sp = avatarCanvas(look, Math.floor(runF)%2, true), sw = sp.width*3, sh = sp.height*3;
      g.fillStyle = '#0008'; g.beginPath(); g.ellipse(px, PY+2, 16, 4, 0, 0, Math.PI*2); g.fill();
      if (stumble > 0){ g.globalAlpha = Math.floor(stumble*12)%2 ? 0.5 : 1; }
      g.drawImage(sp, px - sw/2, PY - sh + bob, sw, sh); g.globalAlpha = 1;
      drawMonster(g);
      // incident red alarm wash
      if (incident && phase !== 'won'){
        g.globalAlpha = 0.75 + 0.25*Math.sin(t*5); g.drawImage(vignette, 0, 0); g.globalAlpha = 1; }
      bits.forEach(b => { g.globalAlpha = Math.max(0, b.t/1.6); g.fillStyle = b.c; g.fillRect(b.x, b.y, 3, 3); }); g.globalAlpha = 1;
      floats.forEach(f => { g.globalAlpha = Math.max(0, f.t); g.font = '16px "Jersey 10", monospace'; g.textAlign = 'center'; g.fillStyle = '#05061a'; g.fillText(f.text, f.x+1, f.y+1); g.fillStyle = f.c; g.fillText(f.text, f.x, f.y); }); g.globalAlpha = 1;
      g.restore();
      // HUD inside the screen: buildings secured and how close the virus is
      g.fillStyle = '#05061acc'; g.fillRect(0, 0, W, 22);
      order.forEach((id, i) => { const b = Campus.buildings.find(v => v.id === id), x = 5 + i*25, ok = i < secured;
        g.fillStyle = ok ? '#47f59a' : (i === secured ? (Math.floor(t*3)%2 ? '#ffd447' : '#5a6199') : '#2a3070'); g.fillRect(x, 3, 22, 16);
        g.fillStyle = '#05061a'; g.fillRect(x+2, 5, 18, 12); g.drawImage(dormIcon(ok ? 'check' : b.icon, ok ? '#47f59a' : b.color), x+5, 5); });
      g.font = '7px Silkscreen, monospace'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#e9ecff'; g.fillText(`${secured}/6 SECURED`, 158, 11);
      g.fillText('VIRUS', 236, 11); g.fillStyle = '#2a3070'; g.fillRect(262, 7, 52, 8); const danger = 1 - gap;
      g.fillStyle = danger > 0.7 ? (Math.floor(t*6)%2 ? '#ff5d6e' : '#ffd447') : danger > 0.45 ? '#ffd447' : '#47f59a'; g.fillRect(262, 7, 52*danger, 8);
      // centre messages: countdown, building secured, end screens
      const big = (txt, col, size, y=H/2) => { g.font = `${size}px "Jersey 10", monospace`; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(txt).width;
        g.fillStyle = '#05061acc'; g.fillRect(CX - w/2 - 10, y - size*0.6, w + 20, size*1.15); g.fillStyle = '#000'; g.fillText(txt, CX+2, y+2); g.fillStyle = col; g.fillText(txt, CX, y); };
      if (count > 0 && phase === 'run') big(count > 0.9 ? String(Math.ceil(count - 0.9)) : 'RUN!', count > 0.9 ? '#ffd447' : '#47f59a', 40);
      if (banner){ big(banner.text, '#47f59a', Math.min(30, 560/banner.text.length), H*0.42); }
      if (phase === 'won') big('CAMPUS SAVED!', '#47f59a', 40, H*0.42);
      if (phase === 'caught'){ g.fillStyle = `rgba(71,245,154,${Math.min(0.6, endT)})`; g.fillRect(0, 0, W, H); big('CAUGHT!', '#ff5d6e', 44, H*0.42); }
    }

    return {
      update(dt){
        if (count > 0){ count -= dt; const n = Math.ceil(count - 0.9); if (n !== lastTick && n > 0){ lastTick = n; api.sfx('tick'); } step(dt, false); return; }
        step(dt, true);
        gap = Math.max(0, gap - dt*0.017*api.diff.speed); if (gap <= 0){ caught(); return; }
        if (!sign){ nextSign -= dt; if (nextSign <= 0) spawnSign(); }
        else { sign.z -= speed0 * (1 + boost*0.7) * dt; if (!sign.done && sign.z <= 0.5) resolve(); if (sign && sign.z < -2.5){ sign = null; nextSign = 0.5; } }
      },
      after(dt){ endT += dt; step(dt, phase === 'won'); if (phase === 'caught') gap = Math.max(-0.4, gap - dt); },
      draw,
      input(dir){ if (phase !== 'run') return; const nl = Math.max(-1, Math.min(1, lane + (dir === 'left' ? -1 : dir === 'right' ? 1 : 0))); if (nl !== lane){ lane = nl; api.sfx('move'); } },
      // for tests: the lane holding the right answer (-1, 0, 1) and progress
      state: () => ({ lane, correctLane: sign && !sign.done ? sign.correct - 1 : null, secured, phase })
    };
  }
});
