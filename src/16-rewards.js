/* ============================================================
   REWARDS & COMPANION — coins, daily/weekly quests, day streak, coin shop,
   UI sound and chiptune music, reward fly-ups, notifications bell, BYTE tips
   ============================================================
   Coins come with every XP reward (1 coin per 5 XP) plus quest rewards. Quests track real actions: addXP() and
   go() call Quests.track() with the XP reason (e.g. "Completed lesson: …") or "visit:<view>". */
const dayKey = (d = new Date()) => d.toLocaleDateString('en-CA');
function weekKey(d = new Date()){ const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return dayKey(x); } // Monday of this week
const ARCADE_RE = /^(Virus Escape|Rocket Firewall|Packet Drop):/;
const QUEST_POOL = [
  {id:'lesson',    t:'Complete a lesson',            icon:'book',  match:/^Completed lesson/,     need:1, xp:40, coins:15, go:'library'},
  {id:'activity',  t:'Finish a practice activity',   icon:'flag',  match:/^Activity complete/,    need:1, xp:30, coins:10, go:'challenge'},
  {id:'quiz',      t:'Pass a quiz',                  icon:'check', match:/^Passed (quiz|Module)/, need:1, xp:40, coins:15, go:'challenge'},
  {id:'arcade',    t:'Play an arcade game',          icon:'star',  match:ARCADE_RE,               need:1, xp:40, coins:15, go:'challenge'},
  {id:'byte',      t:'Ask BYTE a question',          icon:'chip',  match:/^Asked BYTE/,           need:1, xp:20, coins:10, go:'mentor'},
  {id:'community', t:'Visit the Community Hub',      icon:'chat',  match:/^visit:community$/,     need:1, xp:20, coins:10, go:'community'},
  {id:'home',      t:'Do a Home Base safety action', icon:'home',  match:/^Home Base:/,           need:1, xp:20, coins:10, go:'home'}
];
const WEEKLY_QUESTS = [
  {id:'w_lessons', t:'Complete 3 lessons',  icon:'book',   match:/^Completed lesson/, need:3,   xp:120, coins:60, go:'library'},
  {id:'w_arcade',  t:'Play 5 arcade games', icon:'star',   match:ARCADE_RE,           need:5,   xp:120, coins:60, go:'challenge'},
  {id:'w_xp',      t:'Earn 500 XP',         icon:'trophy', xpGoal:true,               need:500, xp:100, coins:50, go:'dashboard'}
];
const DAILY_BONUS = { xp:50, coins:30 };

const Quests = (() => {
  let busy = false;
  const def = id => QUEST_POOL.find(x => x.id === id) || WEEKLY_QUESTS.find(x => x.id === id);
  function pickDaily(d){ let h = 0; for (const ch of d) h = (h*31 + ch.charCodeAt(0)) >>> 0;
    const pool = QUEST_POOL.slice(), out = []; while (out.length < 3){ out.push(pool.splice(h % pool.length, 1)[0]); h = (h*1103515245 + 12345) >>> 0; } return out; }
  // today's and this week's quests, refreshed when the date changes
  function state(){ const d = dayKey(), w = weekKey(), m = S.missions || (S.missions = {});
    if (m.day !== d){ m.day = d; m.daily = pickDaily(d).map(x => ({ id:x.id, n:0, done:false })); m.bonus = false; }
    if (m.week !== w){ m.week = w; m.weekly = WEEKLY_QUESTS.map(x => ({ id:x.id, n:0, done:false })); }
    return m; }
  function track(key, xp = 0){
    if (!S.user || busy) return; const m = state(), done = [];
    [...m.daily, ...m.weekly].forEach(it => { if (it.done) return; const q = def(it.id);
      if (q.xpGoal){ if (!xp) return; it.n = Math.min(q.need, it.n + xp); } else if (q.match.test(key)) it.n = Math.min(q.need, it.n + 1); else return;
      if (it.n >= q.need){ it.done = true; done.push(q); } });
    save(); if (!done.length) return;
    busy = true; // quest rewards call addXP, which must not count towards quests again
    setTimeout(() => {
      done.forEach(q => { toast(`${icon(q.icon,'#ffd447',16)} Quest complete: ${esc(q.t)} · +${q.xp} XP · +${q.coins} coins`, 'mission'); addCoins(q.coins); addXP(q.xp, 'Quest complete: ' + q.t); });
      if (!m.bonus && m.daily.every(x => x.done)){ m.bonus = true; toast('🎉 All daily quests done! Daily bonus unlocked', 'mission'); addCoins(DAILY_BONUS.coins); addXP(DAILY_BONUS.xp, 'All daily quests complete'); }
      busy = false; save(); sfx('win'); if (S.view === 'dashboard') renderView();
    }, 500);
  }
  return { state, track, def };
})();

/* ---------- coins, streak and reward fly-ups ---------- */
const coinIcon = (size = 16) => icon('coin', '#9a6400', size);
function addCoins(n){ if (!n) return; S.coins = (S.coins || 0) + n; save(); flyTo(`${coinIcon(18)} +${n}`, '#hudCoinsChip'); updateHUD(); }
function flyTo(html, sel){
  const t = document.querySelector(sel); if (!t || matchMedia('(prefers-reduced-motion: reduce)').matches){ if (t) t.classList.add('bump'); return; }
  const r = t.getBoundingClientRect(), el = document.createElement('div'); el.className = 'fly'; el.innerHTML = html; document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.transform = `translate(${r.left + r.width/2 - innerWidth/2}px, ${r.top + r.height/2 - innerHeight*0.45}px) scale(.6)`; el.style.opacity = '0.3'; });
  setTimeout(() => { el.remove(); t.classList.remove('bump'); void t.offsetWidth; t.classList.add('bump'); }, 700);
}
function touchStreak(){
  if (!S.user) return; const d = dayKey(), st = S.streak || (S.streak = { n:0, last:null, best:0 }); if (st.last === d) return;
  const y = new Date(); y.setDate(y.getDate() - 1); st.n = st.last === dayKey(y) ? st.n + 1 : 1; st.last = d; st.best = Math.max(st.best || 0, st.n); save();
  if (st.n > 1) setTimeout(() => toast(`🔥 ${st.n}-day streak! Keep it going`, 'mission'), 1200);
}

/* ---------- sound: UI effects reuse the arcade's Web Audio; chiptune music is optional ---------- */
const sfx = n => { if (window.Arcade) Arcade.sfx(n); };
const MUSIC_KEY = 'cybersity-music';
const Music = (() => {
  let timer = null, step = 0, next = 0;
  const N = n => n === '-' ? 0 : 440 * Math.pow(2, ('C C#D D#E F F#G G#A A#B '.indexOf(n.slice(0, -1).padEnd(2)) / 2 + (+n.slice(-1)) * 12 - 57) / 12);
  const LEAD = 'E5 - G5 - A5 - G5 E5 D5 - E5 - C5 - - - E5 - G5 - B5 - A5 G5 E5 - D5 - E5 - - - C5 - E5 - G5 - E5 C5 D5 - F5 - A5 - - - G5 - E5 - D5 - C5 - D5 E5 - - C5 - - -'.split(' ');
  const BASS = 'C3 C3 G2 G2 A2 A2 F2 G2'.split(' ');
  function note(ctx, f, t, d, type, vol){ if (!f) return; const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + 0.02); }
  function tick(){ const ctx = Arcade.ctx(); if (!ctx) return; const len = 60 / 112 / 2;
    if (next < ctx.currentTime) next = ctx.currentTime + 0.05;
    while (next < ctx.currentTime + 0.15){ note(ctx, N(LEAD[step % LEAD.length]), next, len*0.9, 'square', 0.018);
      if (step % 4 === 0) note(ctx, N(BASS[(step/4|0) % BASS.length]), next, len*3.6, 'triangle', 0.05); next += len; step++; } }
  const isOn = () => { try { return localStorage.getItem(MUSIC_KEY) === 'on'; } catch(e){ return false; } };
  function start(){ if (timer) return; Arcade.unlockAudio(); timer = setInterval(tick, 40); }
  function stop(){ clearInterval(timer); timer = null; }
  function toggle(){ const on = !isOn(); try { localStorage.setItem(MUSIC_KEY, on ? 'on' : 'off'); } catch(e){} on ? start() : stop(); return on; }
  return { start, stop, toggle, isOn };
})();
// first click anywhere unlocks audio (and resumes music if it was on); clicks on buttons give a soft tick
document.addEventListener('pointerdown', e => { if (!window.Arcade) return; Arcade.unlockAudio(); if (Music.isOn()) Music.start();
  const b = e.target.closest('button, [data-act]'); if (b && !b.closest('.arc-pad, #arcCanvas')) sfx('click'); }, true);

/* ---------- coin shop ---------- */
const SHOP_ITEMS = [
  {id:'out_crimson', cat:'Avatar', t:'Crimson outfit', price:60,  look:{shirt:'#ff2a4a'}},
  {id:'out_mint',    cat:'Avatar', t:'Mint outfit',    price:60,  look:{shirt:'#00e0a0'}},
  {id:'out_night',   cat:'Avatar', t:'Midnight outfit', price:80, look:{shirt:'#20244f'}},
  {id:'hair_gold',   cat:'Avatar', t:'Golden hair',    price:80,  look:{hairColor:'#ffc400'}},
  {id:'dorm_flowers', cat:'Home Base', t:'Window flower boxes', price:50, dorm:'flowers'},
  {id:'dorm_lights',  cat:'Home Base', t:'Roof string lights',  price:70, dorm:'lights'},
  {id:'dorm_flag',    cat:'Home Base', t:'Cybersity flag',      price:90, dorm:'flag'},
  {id:'byte_mint', cat:'BYTE', t:'Mint BYTE',   price:100, byte:'mint'},
  {id:'byte_pink', cat:'BYTE', t:'Pink BYTE',   price:100, byte:'pink'},
  {id:'byte_gold', cat:'BYTE', t:'Golden BYTE', price:150, byte:'gold'}
];
const shopState = () => S.shop || (S.shop = { owned:[], dorm:[], byte:null });
function shopEquipped(it){ const sh = shopState();
  if (it.look) return Object.entries(it.look).every(([k, v]) => S.user.look[k] === v);
  if (it.dorm) return sh.dorm.includes(it.dorm); return sh.byte === it.byte; }
// Home Base decorations, drawn on top of the dorm (campus, Home Base page, dashboard, shop previews)
function drawDormDecor(g, x, y, w, h, t, only){
  const d = only ? [only] : shopState().dorm, winY = y + 29;
  if (d.includes('flowers')) [x+6, x+18, x+w-28, x+w-16].forEach(wx => { g.fillStyle = '#6b4226'; g.fillRect(wx-1, winY+11, 12, 3); ['#ff4fae','#ffd447','#2ee6ff'].forEach((c, k) => { g.fillStyle = c; g.fillRect(wx+1+k*4, winY+8, 2, 3); }); });
  if (d.includes('lights')) for (let i = 0; i < w+6; i += 5){ g.fillStyle = ['#ff4fae','#ffd447','#2ee6ff','#47f59a'][((i/5) + Math.floor(t*3)) % 4]; g.fillRect(x-3+i, y+22 + ((i/5) % 2), 2, 2); }
  if (d.includes('flag')){ const wv = Math.round(Math.sin(t*4)); g.fillStyle = '#05061a'; g.fillRect(x+w-8, y-18, 2, 19); g.fillStyle = '#ff4fae'; g.fillRect(x+w-6, y-18+wv, 11, 7); g.fillStyle = '#fff'; g.fillRect(x+w-3, y-16+wv, 4, 3); }
}
function viewShop(el){
  const coins = S.coins || 0;
  const card = it => { const sh = shopState(), own = sh.owned.includes(it.id), on = own && shopEquipped(it);
    const prev = it.look ? `<img class="px" alt="" src="${avatarURL({ ...S.user.look, ...it.look })}">` : it.byte ? `<img class="px" alt="" src="${botCanvas(it.byte).toDataURL()}">` : `<canvas class="px" data-dorm="${it.dorm}" width="256" height="208"></canvas>`;
    return `<article class="shop-item ${on ? 'on' : ''}"><div class="shop-prev">${prev}</div><b>${esc(it.t)}</b>
      ${own ? `<button class="btn small ${on ? 'ghost' : 'green'}" data-act="shopEquip" data-arg="${it.id}">${on ? (it.look ? 'Equipped' : 'Unequip') : 'Equip'}</button>`
            : `<button class="btn small gold" data-act="shopBuy" data-arg="${it.id}" ${coins < it.price ? 'disabled' : ''}>${coinIcon(14)} ${it.price}</button>`}</article>`; };
  el.innerHTML = `<div class="page-head"><div><div class="crumbs">Campus · Coin Shop</div><h1>Coin Shop</h1><p>Spend the coins you earn from lessons, quests and arcade games on new looks for your avatar, your Home Base dorm and BYTE. Coins are saved on this device.</p></div><span class="pill gold">${coinIcon(14)} ${coins} coins</span></div>
    ${['Avatar', 'Home Base', 'BYTE'].map(cat => `<div class="section-title" style="margin-top:22px">${cat}</div><div class="shop-grid">${SHOP_ITEMS.filter(i => i.cat === cat).map(card).join('')}</div>`).join('')}
    <p class="muted" style="margin-top:18px; font-size:13px">Earn coins: every 5 XP = 1 coin, plus daily and weekly quest rewards.</p>`;
  document.querySelectorAll('canvas[data-dorm]').forEach(cv => { const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.setTransform(2,0,0,2,0,0);
    const P = pal(); g.fillStyle = P.grass; g.fillRect(0, 0, 128, 104); g.fillStyle = P.path[1]; g.fillRect(0, 92, 128, 12);
    drawDorm(g, 16, 28, 96, 64, Math.max(1, homeStage()), 1); drawDormDecor(g, 16, 28, 96, 64, 1, cv.dataset.dorm); });
}

/* ---------- notifications bell: recent milestones from the learning history ---------- */
function bellUnread(){ const seen = S.bellSeen || 0; return S.history.filter(h => h.t > seen).length; }
function renderBell(){ const host = $('#bellHost'); if (!host) return;
  if (!UI.bell){ host.innerHTML = ''; return; }
  const ago = t => { const s = (Date.now() - t)/1000; return s < 60 ? 'just now' : s < 3600 ? `${Math.floor(s/60)} min ago` : s < 86400 ? `${Math.floor(s/3600)} h ago` : `${Math.floor(s/86400)} d ago`; };
  host.innerHTML = `<div class="bell-pop" role="dialog" aria-label="Notifications"><div class="label">Notifications</div>${S.history.slice(0, 7).map(h => `<div class="bell-row"><span>${esc(h.txt)}</span><small>${ago(h.t)}${h.xp ? ` · +${h.xp} XP` : ''}</small></div>`).join('') || '<p class="muted">Nothing yet. Start a lesson!</p>'}</div>`; }

/* ---------- BYTE companion: one context-aware tip ---------- */
function byteTip(){
  const m = Quests.state(), left = m.daily.filter(x => !x.done), st = S.streak || { n:0 }, nx = nextStep();
  if (!S.lessons.m1l1 || !S.lessons.m1l1.read) return { text:`Welcome, ${S.user.name}! Start with Lesson 1.1, "What is Cybersecurity?". It only takes about 7 minutes.`, act:nx.act, arg:nx.arg, btn:'Start lesson' };
  if (left.length === 1) return { text:`Just 1 quest left for today's bonus: ${Quests.def(left[0].id).t.toLowerCase()}!`, act:'go', arg:Quests.def(left[0].id).go, btn:'Let\'s go' };
  if (incUnlocked() && !(S.incident && S.incident.done)) return { text:'Something strange is happening near the Cyber Core... Check the campus!', act:'go', arg:'campus', btn:'Investigate' };
  if (st.n >= 2) return { text:`🔥 ${st.n}-day streak! Come back tomorrow to keep it alive.`, act:nx.act, arg:nx.arg, btn:'Keep learning' };
  if ((S.coins || 0) >= 60) return { text:`You have ${S.coins} coins. Treat yourself in the Coin Shop!`, act:'go', arg:'shop', btn:'Open shop' };
  if (!m.bonus) return { text:`${3 - left.length}/3 daily quests done. Finish them all for a +${DAILY_BONUS.coins} coin bonus.`, act:nx.act, arg:nx.arg, btn:'Continue' };
  return { text:`Next up: ${nx.label}. You've got this!`, act:nx.act, arg:nx.arg, btn:'Continue' };
}

window.EXTRA_ACTIONS = Object.assign(window.EXTRA_ACTIONS || {}, {
  shopBuy: id => { const it = SHOP_ITEMS.find(x => x.id === id), sh = shopState(); if (!it || sh.owned.includes(id)) return;
    if ((S.coins || 0) < it.price){ toast('Not enough coins yet. Complete quests to earn more!'); return; }
    S.coins -= it.price; sh.owned.push(id); save(); updateHUD(); sfx('win'); toast(`Bought ${esc(it.t)}!`); EXTRA_ACTIONS.shopEquip(id); },
  shopEquip: id => { const it = SHOP_ITEMS.find(x => x.id === id), sh = shopState(); if (!it || !sh.owned.includes(id)) return;
    if (it.look){ Object.assign(S.user.look, it.look); spriteCache.clear(); }
    else if (it.dorm){ sh.dorm = sh.dorm.includes(it.dorm) ? sh.dorm.filter(x => x !== it.dorm) : [...sh.dorm, it.dorm]; }
    else { sh.byte = sh.byte === it.byte ? null : it.byte; BOT_URL = botCanvas().toDataURL(); botFaceCache.clear(); }
    save(); renderApp(); },
  toggleBell: () => { UI.bell = !UI.bell; if (UI.bell){ S.bellSeen = Date.now(); save(); } renderBell(); const d = $('#bellDot'); if (d) d.classList.add('hidden'); },
  sideMini: () => { UI.sideMini = !UI.sideMini; try { localStorage.setItem('cybersity-side-mini', UI.sideMini ? '1' : '0'); } catch(e){} $('#app').classList.toggle('mini', UI.sideMini); if (S.view === 'campus') renderView(); },
  sideOpen: () => { $('#app').classList.toggle('side-open'); },
  sfxToggle: () => { UI.menu = false; Arcade.setMuted(!Arcade.isMuted()); toast(Arcade.isMuted() ? 'Sound effects off' : 'Sound effects on'); renderMenu(); },
  musicToggle: () => { UI.menu = false; const on = Music.toggle(); toast(on ? '♪ Music on' : 'Music off'); renderMenu(); },
  demoCoins: () => { UI.menu = false; renderMenu(); addCoins(500); toast('Presenter shortcut: +500 coins'); }
});
document.addEventListener('click', e => { if (UI.bell && !e.target.closest('.bell-pop, [data-act="toggleBell"]')){ UI.bell = false; renderBell(); }
  if (!e.target.closest('.side, [data-act="sideOpen"]')) { const a = $('#app'); if (a) a.classList.remove('side-open'); } });
