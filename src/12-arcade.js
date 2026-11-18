/* ============================================================
   CYBER ARCADE — shared framework, arcade hall and game runner
   ============================================================
   Games answer by MOVING (lanes, gates, bins): no pop-up quiz boxes. Each game is a module registered with
   Arcade.register(id, { controls, size, create(api) }) and gets a shared runner: intro + difficulty, HUD
   (score, lives, question bar), keyboard / on-screen buttons / swipe input, pause, results with mistakes,
   rewards (XP by accuracy and completion, a badge per game, local high scores) and retro Web Audio sound.

   A game's create(api) returns { update(dt), draw(g), input(dir), destroy?() }. The api gives:
     W, H (logical canvas size), diff {id, t, speed, lives}, questions(n, mods), sortSet(id),
     prompt(text, small), answer(ok, {q, chosen, correct, e}), loseLife(), addScore(n),
     score(), lives(), sfx(name), end(won, note), flash(colour) */
const ARCADE_SCORE_KEY = 'cybersity-arcade-scores', ARCADE_MUTE_KEY = 'cybersity-arcade-mute';
const ARCADE_DIFF = {
  easy:   {id:'easy',   t:'Easy',   speed:0.75, lives:5, note:'Slower, 5 lives'},
  normal: {id:'normal', t:'Normal', speed:1,    lives:3, note:'Standard speed, 3 lives'},
  hard:   {id:'hard',   t:'Hard',   speed:1.3,  lives:2, note:'Faster, 2 lives'}
};

const Arcade = (() => {
  const games = {};
  let audio = null, muted = false;
  try { muted = localStorage.getItem(ARCADE_MUTE_KEY) === '1'; } catch(e){}

  /* ---- scores (this device only) ---- */
  const scores = () => { try { return JSON.parse(localStorage.getItem(ARCADE_SCORE_KEY)) || {}; } catch(e){ return {}; } };
  function saveScore(id, score, acc){ const all = scores(), prev = all[id], best = !prev || score > prev.best;
    all[id] = { best: best ? score : prev.best, acc: best ? acc : prev.acc, plays: (prev ? prev.plays : 0) + 1 };
    try { localStorage.setItem(ARCADE_SCORE_KEY, JSON.stringify(all)); } catch(e){} return best; }
  function resetScores(){ try { localStorage.removeItem(ARCADE_SCORE_KEY); } catch(e){} }

  /* ---- retro sound: Web Audio, created on the first click so browsers allow it ---- */
  function unlockAudio(){ try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch(e){} }
  function tone(f, dur, type='square', vol=0.05, at=0, slide=0){
    const t = audio.currentTime + at, o = audio.createOscillator(), g = audio.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.linearRampToValueAtTime(f + slide, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + dur + 0.02); }
  const SFX = {
    move:  () => tone(700, 0.04, 'square', 0.025),
    ok:    () => { tone(523, 0.07); tone(659, 0.07, 'square', 0.05, 0.07); tone(988, 0.12, 'square', 0.05, 0.14); },
    bad:   () => tone(220, 0.25, 'sawtooth', 0.06, 0, -120),
    life:  () => { tone(330, 0.1, 'triangle', 0.07); tone(196, 0.2, 'triangle', 0.07, 0.1); },
    start: () => { [392, 523, 659, 784].forEach((f,i)=>tone(f, 0.08, 'square', 0.04, i*0.08)); },
    win:   () => { [523, 659, 784, 1047, 784, 1047].forEach((f,i)=>tone(f, 0.12, 'square', 0.05, i*0.11)); },
    lose:  () => { [392, 330, 262, 196].forEach((f,i)=>tone(f, 0.18, 'triangle', 0.06, i*0.15)); },
    tick:  () => tone(1200, 0.03, 'square', 0.02)
  };
  function sfx(n){ if (muted || !audio || !SFX[n]) return; try { SFX[n](); } catch(e){} }
  function setMuted(m){ muted = m; try { localStorage.setItem(ARCADE_MUTE_KEY, m ? '1' : '0'); } catch(e){} }

  /* ---- question helpers ---- */
  function questions(n, mods){ const pool = shuffle(ARCADE_QS.filter(q => !mods || mods.includes(q.m)));
    const out = []; while (out.length < n) out.push(...pool); // repeat the bank for very long runs
    return out.slice(0, n).map(q => ({ q:q.q, e:q.e, correct:q.o[0], options:shuffle(q.o) })); }
  const sortSet = id => { const s = ARCADE_SORT.find(x => x.id === id) || ARCADE_SORT[0]; return { ...s, items: shuffle(s.items) }; };

  /* ---- availability ---- */
  const meta = id => ARCADE_GAMES.find(g => g.id === id);
  function status(id){
    if (!games[id]) return { ok:false, label:'Coming soon' };
    if (id === 'virus' && !(modPassed(MODULES[1]) || S.arcadeUnlocked || incActive())) return { ok:false, label:'Unlocks after Module 2' };
    return { ok:true, label:'Ready to play' };
  }

  /* ---- sample leaderboard: the player's best mixed with simulated learners ---- */
  function leaderboard(id){
    const base = {virus:2600, rocket:1900, packet:1500}[id] || 1500;
    const rows = COMMUNITY_USERS.slice(0, 7).map((u, i) => ({ name:u.name, look:u.look, score: Math.round(base * (1 - i*0.11) / 10) * 10 }));
    const mine = scores()[id]; if (mine && S.user) rows.push({ name:S.user.name, look:S.user.look, score:mine.best, me:true });
    return rows.sort((a, b) => b.score - a.score).slice(0, 8);
  }
  return { games, register:(id, mod)=>{ games[id] = mod; }, scores, saveScore, resetScores, unlockAudio, sfx, setMuted, isMuted:()=>muted,
    questions, sortSet, meta, status, leaderboard };
})();

/* ---------- Arcade cabinet art (pixel art drawn in code) ---------- */
function drawCabinet(cv, game, blink){
  const g = cv.getContext('2d'), s = 3; g.imageSmoothingEnabled = false; g.setTransform(s,0,0,s,0,0); g.clearRect(0,0,64,84);
  const c = game.color, dark = shade(c, -0.55), mid = shade(c, -0.25), ok = Arcade.status(game.id).ok;
  g.fillStyle = '#05061a'; g.fillRect(6,1,52,82); // outline
  g.fillStyle = mid; g.fillRect(7,2,50,80); g.fillStyle = dark; g.fillRect(7,2,4,80); g.fillRect(53,2,4,80);
  g.fillStyle = c; g.fillRect(9,4,46,10); g.fillStyle = '#05061a'; g.fillRect(9,14,46,1); // marquee
  g.fillStyle = '#ffffffaa'; for (let x=12; x<52; x+=6) g.fillRect(x, 6+(x%12===0?1:0), 3, 1);
  g.fillStyle = '#05061a'; g.fillRect(11,17,42,32); g.fillStyle = '#070a1f'; g.fillRect(12,18,40,30); // screen
  arcadeScreenArt(g, game.id, 12, 18, ok, blink);
  g.fillStyle = dark; g.fillRect(9,52,46,12); g.fillStyle = '#05061a'; g.fillRect(9,52,46,1); // control panel
  g.fillStyle = '#05061a'; g.fillRect(18,55,2,6); g.fillStyle = '#ff5d6e'; g.fillRect(17,54,4,3); // joystick
  g.fillStyle = '#ffd447'; g.fillRect(34,57,4,3); g.fillStyle = '#2ee6ff'; g.fillRect(41,57,4,3); g.fillStyle = '#ff4fae'; g.fillRect(48,57,4,3);
  g.fillStyle = dark; g.fillRect(13,68,38,10); g.fillStyle = '#05061a'; g.fillRect(28,70,8,6); g.fillStyle = ok && blink ? '#ffd447' : '#5a6199'; g.fillRect(30,72,4,2); // coin slot
}
// The little attract-mode picture on each cabinet's screen
function arcadeScreenArt(g, id, x, y, ok, blink){
  if (id === 'virus'){ g.fillStyle = '#1d2358'; g.fillRect(x, y+18, 40, 12); g.fillStyle = '#ffd447'; for (let i=0;i<3;i++) g.fillRect(x+6+i*12, y+22, 4, 1);
    g.fillStyle = '#47f59a'; g.fillRect(x+4, y+8, 12, 10); g.fillRect(x+2, y+12, 16, 5); g.fillStyle = '#05061a'; g.fillRect(x+7, y+11, 2, 2); g.fillRect(x+12, y+11, 2, 2); g.fillRect(x+8, y+15, 5, 1);
    g.fillStyle = '#eef0fb'; g.fillRect(x+28, y+12, 4, 5); g.fillStyle = '#2ee6ff'; g.fillRect(x+28, y+17, 4, 4); }
  else if (id === 'rocket'){ for (let i=0;i<8;i++){ g.fillStyle = '#ffffff88'; g.fillRect(x+((i*13)%38)+1, y+((i*7)%28)+1, 1, 1); }
    g.fillStyle = '#eef0fb'; g.fillRect(x+6, y+13, 10, 4); g.fillStyle = '#ff4fae'; g.fillRect(x+16, y+14, 2, 2); g.fillStyle = '#ffd447'; g.fillRect(x+3, y+14, 3, 2);
    g.fillStyle = '#2ee6ff'; [4, 13, 22].forEach(gy => { g.fillRect(x+30, y+gy, 2, 5); }); }
  else { g.fillStyle = '#ff4fae'; g.fillRect(x+16, y+4, 8, 5); g.fillStyle = '#2ee6ff'; g.fillRect(x+6, y+14, 8, 5); g.fillStyle = '#ffd447'; g.fillRect(x+26, y+12, 8, 5);
    g.fillStyle = '#47f59a'; g.fillRect(x+2, y+24, 11, 5); g.fillStyle = '#ff5d6e'; g.fillRect(x+15, y+24, 11, 5); g.fillStyle = '#a46bff'; g.fillRect(x+28, y+24, 11, 5); }
  if (!ok){ g.fillStyle = '#05061acc'; g.fillRect(x, y, 40, 30); }
  if (blink){ g.font = '5px Silkscreen, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = ok ? '#ffd447' : '#9aa3da'; g.fillText(ok ? 'PRESS START' : 'LOCKED', x+20, y+3.5); }
}

/* ---------- Arcade hall (top of the Challenge Centre page) ---------- */
function arcadeHallHTML(){
  const sc = Arcade.scores(), lbGame = UI.lbGame || 'virus';
  return `<section class="arcade-hall">
    <div class="arcade-top"><div><div class="section-title" style="margin:0">Cyber Arcade</div>
      <p class="muted" style="margin-top:6px; font-size:14px">Three arcade games where you answer by moving: switch lanes, steer through gates and sort falling blocks. No pop-up quizzes.</p></div>
      <button class="btn ghost small" data-act="arcMute" aria-pressed="${!Arcade.isMuted()}">${Arcade.isMuted() ? '♪ Sound off' : '♪ Sound on'}</button></div>
    <div class="arcade-row">${ARCADE_GAMES.map(gm => { const st = Arcade.status(gm.id), best = sc[gm.id];
      return `<article class="machine" style="--mc:${gm.color}">
        <canvas class="px cab" data-cab="${gm.id}" width="192" height="252" aria-hidden="true"></canvas>
        <div class="machine-body"><h3>${esc(gm.t)}</h3><p>${esc(gm.desc)}</p>
          <div class="machine-tags"><span class="pill">${esc(gm.diff)}</span><span class="pill gold">HI ${best ? best.best : '----'}</span><span class="pill ${st.ok ? 'green' : ''}">${esc(st.label)}</span></div>
          <button class="btn ${st.ok ? 'gold' : 'ghost'}" data-act="arcPlay" data-arg="${gm.id}" ${st.ok ? '' : 'disabled'}>${st.ok ? '▶ Play' : esc(st.label)}</button></div>
      </article>`; }).join('')}</div>
    <section class="panel leaderboard"><div class="lb-head"><div class="section-title" style="margin:0">Sample leaderboard</div>
      <div class="lb-tabs">${ARCADE_GAMES.map(gm => `<button class="${gm.id===lbGame?'on':''}" data-act="arcLb" data-arg="${gm.id}">${esc(gm.t)}</button>`).join('')}</div></div>
      <p class="muted" style="font-size:12.5px; margin:6px 0 10px">Scores from simulated learners for this prototype, plus your best on this device.</p>
      <ol class="lb-list">${Arcade.leaderboard(lbGame).map((r,i) => `<li class="${r.me?'me':''}"><span class="lb-rank">${i+1}</span><img class="px" alt="" src="${avatarURL(r.look)}"><span class="lb-name">${esc(r.name)}${r.me?' (you)':''}</span><span class="lb-score">${r.score}</span></li>`).join('')}</ol>
    </section></section>
    <div class="section-title" style="margin-top:30px">Practice and assessments</div>`;
}
function bindArcadeHall(){
  let blink = true; const paint = () => document.querySelectorAll('canvas[data-cab]').forEach(cv => drawCabinet(cv, Arcade.meta(cv.dataset.cab), blink));
  paint(); timers.push(setInterval(() => { blink = !blink; paint(); }, 600));
}

/* ---------- Game runner (view 'arcade', params {game}) ---------- */
let ARC = null; // the running game session
function viewArcade(el){
  const id = (S.params || {}).game, gm = Arcade.meta(id), mod = Arcade.games[id], st = Arcade.status(id);
  if (!gm || !mod || !st.ok){ go('challenge'); return; }
  const diff = UI.arcDiff || 'normal';
  el.innerHTML = `<div class="page-head"><div><div class="crumbs"><button data-act="go" data-arg="challenge">Cyber Arcade</button><span>›</span><span>${esc(gm.t)}</span></div><h1>${esc(gm.t)}</h1><p>${esc(gm.desc)}</p></div>
      <button class="btn ghost small" data-act="arcMute" aria-pressed="${!Arcade.isMuted()}">${Arcade.isMuted() ? '♪ Sound off' : '♪ Sound on'}</button></div>
    <div class="arc-cab" style="--mc:${gm.color}">
      <div class="arc-hud"><span class="arc-score">SCORE <b id="arcScore">0</b></span><span class="arc-q hidden" id="arcQ" aria-live="polite"></span><span class="arc-lives" id="arcLives"></span></div>
      <div class="arc-screen"><canvas id="arcCanvas" class="px"></canvas><div class="arc-over" id="arcOver"></div></div>
      <div class="arc-pad" id="arcPad">${(mod.controls || []).map(d => `<button class="arc-btn" data-arc-dir="${d}" aria-label="${d}">${{left:'◀', right:'▶', up:'▲', down:'▼'}[d]}</button>`).join('')}</div>
    </div>`;
  arcIntro(id, diff);
}
function arcIntro(id, diff){
  const gm = Arcade.meta(id), best = Arcade.scores()[id], mod = Arcade.games[id];
  const keys = (mod.controls || []).includes('up') ? '▲ ▼ arrow keys or W / S' : '◀ ▶ arrow keys or A / D';
  $('#arcOver').innerHTML = `<div class="arc-card">
      <div class="arc-title" data-t="${esc(gm.t)}">${esc(gm.t)}</div>
      ${mod.story ? `<p class="arc-story">${esc(mod.story(S.params || {}))}</p>` : ''}
      <p>${esc(gm.how)}</p>
      <div class="arc-controls"><span><b>Desktop</b> ${keys}</span><span><b>Phone</b> tap the buttons or swipe</span><span><b>Pause</b> P or Esc</span></div>
      <div class="arc-diffs" role="radiogroup" aria-label="Difficulty">${Object.values(ARCADE_DIFF).map(d => `<button role="radio" aria-checked="${d.id===diff}" class="${d.id===diff?'on':''}" data-act="arcDiff" data-arg="${d.id}"><b>${d.t}</b><small>${d.note}</small></button>`).join('')}</div>
      <button class="btn gold arc-start" data-act="arcStart" data-arg="${id}">▶ Start</button>
      ${best ? `<p class="muted" style="font-size:13px">Your high score: <b>${best.best}</b></p>` : ''}
    </div>`;
  $('#arcOver').classList.remove('hidden');
}

function arcStart(id){
  const mod = Arcade.games[id], diff = ARCADE_DIFF[UI.arcDiff || 'normal'], cv = $('#arcCanvas'); if (!mod || !cv) return;
  Arcade.unlockAudio(); Arcade.sfx('start');
  const [LW, LH] = mod.size || [320, 200], SCL = 3; cv.width = LW*SCL; cv.height = LH*SCL; cv.style.aspectRatio = `${LW}/${LH}`;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const run = ARC = { id, mod, params:{ ...(S.params || {}) }, diff, score:0, lives:diff.lives, answers:[], over:false, paused:false, flashT:0, flashC:'', game:null, raf:0, last:0 };
  const hud = () => { const sEl = $('#arcScore'), lEl = $('#arcLives'); if (sEl) sEl.textContent = run.score;
    if (lEl) lEl.innerHTML = Array.from({length:diff.lives}, (_,i) => `<i class="${i < run.lives ? 'on' : ''}"></i>`).join(''); };
  const api = {
    W:LW, H:LH, diff, params:{ ...(S.params || {}) }, questions:Arcade.questions, sortSet:Arcade.sortSet, sfx:Arcade.sfx,
    prompt(text, small){ const q = $('#arcQ'); if (!q) return; q.classList.toggle('hidden', !text); q.innerHTML = text ? `${small ? `<small>${esc(small)}</small>` : ''}${esc(text)}` : ''; },
    answer(ok, item){ run.answers.push({ ok, ...item }); Arcade.sfx(ok ? 'ok' : 'bad'); run.flashT = 0.35; run.flashC = ok ? '#47f59a' : '#ff5d6e'; hud(); },
    loseLife(){ if (run.over) return; run.lives = Math.max(0, run.lives-1); Arcade.sfx('life'); hud(); if (run.lives <= 0) api.end(false); },
    addScore(n){ run.score = Math.max(0, run.score + Math.round(n)); hud(); },
    score:() => run.score, lives:() => run.lives,
    flash(c){ run.flashT = 0.35; run.flashC = c; },
    end(won, note){ if (run.over) return; run.over = true; run.won = won; run.note = note; Arcade.sfx(won ? 'win' : 'lose'); setTimeout(() => arcResults(run), won ? 1400 : 900); }
  };
  $('#arcOver').classList.add('hidden'); $('#arcOver').innerHTML = ''; api.prompt('');
  // bring the whole cabinet (question bar, screen, buttons) into view under the top bar, ready to record
  const cab = $('.arc-cab'); if (cab) window.scrollTo({ top: Math.max(0, cab.getBoundingClientRect().top + scrollY - ($('.hud') ? $('.hud').offsetHeight + 8 : 8)), behavior:'smooth' });
  run.game = mod.create(api); hud();
  const loop = now => {
    if (ARC !== run || !cv.isConnected){ arcStop(run); return; }
    const dt = Math.max(0, Math.min(0.05, (now - (run.last || now)) / 1000)); run.last = now;
    if (!run.paused){ if (!run.over) run.game.update(dt); else if (run.game.after) run.game.after(dt); }
    g.setTransform(SCL,0,0,SCL,0,0); run.game.draw(g);
    if (run.flashT > 0){ run.flashT -= dt; g.globalAlpha = Math.max(0, run.flashT) * 0.9; g.strokeStyle = run.flashC; g.lineWidth = 4; g.strokeRect(2, 2, LW-4, LH-4); g.globalAlpha = 1; }
    if (run.paused){ g.fillStyle = '#05061acc'; g.fillRect(0, 0, LW, LH); g.font = '24px "Jersey 10", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffd447'; g.fillText('PAUSED', LW/2, LH/2-6); g.font = '6px Silkscreen, monospace'; g.fillStyle = '#e9ecff'; g.fillText('Press P or tap to continue', LW/2, LH/2+12); }
    run.raf = requestAnimationFrame(loop);
  };
  run.raf = requestAnimationFrame(loop);
  // input: keyboard, on-screen buttons and swipes
  const KEYMAP = { ArrowLeft:'left', a:'left', A:'left', ArrowRight:'right', d:'right', D:'right', ArrowUp:'up', w:'up', W:'up', ArrowDown:'down', s:'down', S:'down' };
  run.onKey = e => { if (ARC !== run || e.target.closest('input,textarea')) return;
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape'){ if (!run.over){ run.paused = !run.paused; e.preventDefault(); } return; }
    const d = KEYMAP[e.key]; if (d && !run.over && !run.paused){ e.preventDefault(); run.game.input(d); } };
  window.addEventListener('keydown', run.onKey);
  run.onPad = e => { const b = e.target.closest('[data-arc-dir]'); if (!b || run.over) return; e.preventDefault(); if (run.paused){ run.paused = false; return; } run.game.input(b.dataset.arcDir); };
  $('#arcPad').addEventListener('pointerdown', run.onPad);
  let t0 = null;
  run.onTS = e => { const t = e.touches[0]; t0 = { x:t.clientX, y:t.clientY }; };
  run.onTE = e => { if (!t0 || run.over) return; const t = e.changedTouches[0], dx = t.clientX - t0.x, dy = t.clientY - t0.y; t0 = null;
    if (run.paused){ run.paused = false; return; } if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    const d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); if ((mod.controls || []).includes(d)) run.game.input(d); };
  run.onTap = () => { if (run.paused) run.paused = false; };
  cv.addEventListener('touchstart', run.onTS, { passive:true }); cv.addEventListener('touchend', run.onTE, { passive:true }); cv.addEventListener('click', run.onTap); run.cv = cv;
  run.onVis = () => { if (document.hidden && !run.over) run.paused = true; };
  document.addEventListener('visibilitychange', run.onVis);
}
function arcStop(run){ if (!run) return; cancelAnimationFrame(run.raf); window.removeEventListener('keydown', run.onKey); document.removeEventListener('visibilitychange', run.onVis);
  if (run.cv){ run.cv.removeEventListener('touchstart', run.onTS); run.cv.removeEventListener('touchend', run.onTE); run.cv.removeEventListener('click', run.onTap); }
  if (run.game && run.game.destroy) run.game.destroy(); if (ARC === run) ARC = null; }

// Results: rewards come from accuracy and finishing, never from speed
function arcResults(run){
  if (ARC !== run) return; const gm = Arcade.meta(run.id), total = run.answers.length, correct = run.answers.filter(a => a.ok).length;
  const acc = total ? Math.round(correct / total * 100) : 0, mistakes = run.answers.filter(a => !a.ok);
  const xp = total >= 3 ? Math.round(XP.arcade * correct / total) + (run.won ? XP.arcadeWin : 0) : 0;
  const best = Arcade.saveScore(run.id, run.score, acc), badge = run.won && acc >= 70 && !S.badges.includes(gm.badge);
  const over = $('#arcOver'); if (!over) return; over.classList.remove('hidden'); const qb = $('#arcQ'); if (qb) qb.classList.add('hidden');
  over.innerHTML = `<div class="arc-card results">
      <div class="arc-title ${run.won ? 'win' : 'lose'}" data-t="${run.won ? 'You win!' : 'Game over'}">${run.won ? 'You win!' : 'Game over'}</div>
      ${run.note ? `<p>${esc(run.note)}</p>` : ''}
      <div class="arc-stats"><div><span>Score</span><b>${run.score}</b>${best && run.score ? '<em>New high score!</em>' : ''}</div><div><span>Accuracy</span><b>${acc}%</b></div><div><span>Correct</span><b>${correct}/${total}</b></div><div><span>XP</span><b>+${xp}</b></div></div>
      ${mistakes.length ? `<div class="arc-mistakes"><div class="label">Review your mistakes</div>${mistakes.map(m => `<div><b>${esc(m.q)}</b><span>You chose <s>${esc(m.chosen)}</s> · Correct: <strong>${esc(m.correct)}</strong></span><small>${esc(m.e)}</small></div>`).join('')}</div>`
        : (total ? '<p class="arc-perfect">No mistakes. Flawless run!</p>' : '')}
      <div class="arc-actions">${run.mod.resultActions ? run.mod.resultActions(run) : ''}<button class="btn gold" data-act="arcStart" data-arg="${run.id}">↻ Play again</button><button class="btn ghost" data-act="arcIntroBack" data-arg="${run.id}">Change difficulty</button><button class="btn ghost" data-act="go" data-arg="challenge">Back to arcade</button></div>
    </div>`;
  arcStop(run); ARC = run; // keep the session for "Play again" but stop the loop
  if (xp) addXP(xp, `${gm.t}: ${correct}/${total} correct`);
  if (badge) award(gm.badge);
  log(`${gm.t} (${ARCADE_DIFF[run.diff.id].t}): score ${run.score}, ${acc}% accuracy`);
}

window.EXTRA_ACTIONS = Object.assign(window.EXTRA_ACTIONS||{}, {
  arcPlay: id => { Arcade.unlockAudio(); UI.arcDiff = UI.arcDiff || 'normal'; go('arcade', { game:id }); },
  arcDiff: d => { UI.arcDiff = d; document.querySelectorAll('.arc-diffs button').forEach(b => { const on = b.dataset.arg === d; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); }); },
  arcStart: id => { if (ARC) arcStop(ARC); arcStart(id); },
  arcIntroBack: id => { if (ARC) arcStop(ARC); arcIntro(id, UI.arcDiff || 'normal'); },
  arcLb: id => { UI.lbGame = id; renderView(); },
  // presenter shortcuts
  arcUnlock: () => { UI.menu=false; renderMenu(); S.arcadeUnlocked = !S.arcadeUnlocked; save(); toast(S.arcadeUnlocked ? 'Arcade unlocked: every game and the campus incident are playable' : 'Arcade locked again'); renderView(); },
  arcReset: () => { UI.menu=false; renderMenu(); Arcade.resetScores(); toast('Arcade high scores reset'); renderView(); },
  arcMute: () => { Arcade.setMuted(!Arcade.isMuted()); Arcade.unlockAudio(); document.querySelectorAll('[data-act="arcMute"]').forEach(b => { b.textContent = Arcade.isMuted() ? '♪ Sound off' : '♪ Sound on'; b.setAttribute('aria-pressed', !Arcade.isMuted()); }); Arcade.sfx('tick'); }
});
