/* ============================================================
   APP CORE — state, rewards, routing, shell and most views
   ============================================================ */
const STORE_KEY = 'cybersity-prototype-v1';
// Night (default) or Day mode, remembered on this device
const THEME_KEY = 'cybersity-theme';
try { if (localStorage.getItem(THEME_KEY)==='day') document.documentElement.dataset.theme = 'day'; } catch(e){}
const themeBtnHTML = (cls, id='') => `<button class="${cls}" ${id?`id="${id}"`:''} data-act="toggleTheme" aria-label="Switch to ${isDay()?'night':'day'} mode" title="Switch to ${isDay()?'night':'day'} mode">${icon(isDay()?'moon':'sun', isDay()?'#6a38c9':'#ffd447')}</button>`;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random()*a.length)];
const now = () => new Date();
const hhmm = d => d.toTimeString().slice(0,5);
const fmtDate = d => new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});

function freshState(){ return { user:null, xp:0, badges:[], lessons:{}, modules:{}, final:null, cert:null, history:[], attempts:[], mentorCount:0, msgsSent:0, reports:[], passMark:70, mentorLog:[], health:{}, healthXP:[], career:{pick:null, second:null, tasters:[]}, incident:{active:false, secured:[]}, view:'dashboard', params:{} }; }
let S = freshState();
try { const raw = localStorage.getItem(STORE_KEY); if (raw) S = Object.assign(freshState(), JSON.parse(raw)); } catch(e){}
function save(){ try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch(e){} }

const UI = { onb:'title', authTab:'register', draftLook:null, draftName:'', editAvatar:false, lessonId:null, stage:0, scen:{}, quiz:null, room:'lounge', drawer:false, menu:false, actState:null };
let timers = [];
function clearTimers(){ timers.forEach(t=>{ clearInterval(t); clearTimeout(t); }); timers = []; }

/* ---------- Content helpers ---------- */
const ALL_LESSONS = MODULES.flatMap((m,mi)=> m.lessons.map((l,li)=>({...l, mod:m, mi, li})));
const lessonById = id => ALL_LESSONS.find(l=>l.id===id);
const modById = id => MODULES.find(m=>m.id===id);
const prog = id => (S.lessons[id] ||= {});
const lessonDone = id => !!(S.lessons[id] && S.lessons[id].quiz);
const modPassed = m => !!(S.modules[m.id] && S.modules[m.id].passed);
function modUnlocked(m){ const i = MODULES.indexOf(m); return i===0 || modPassed(MODULES[i-1]); }
function lessonUnlocked(l){ if (!modUnlocked(l.mod)) return false; if (l.li===0) return true; return lessonDone(l.mod.lessons[l.li-1].id); }
const modLessonsDone = m => m.lessons.every(l=>lessonDone(l.id));
const allModsPassed = () => MODULES.every(modPassed);
const finalPassed = () => !!(S.final && S.final.passed);
function modProgress(m){ let done=0, total=m.lessons.length*3+1; m.lessons.forEach(l=>{ const p=S.lessons[l.id]||{}; done += (p.read?1:0)+(p.activity?1:0)+(p.quiz?1:0); }); if (modPassed(m)) done++; return done/total; }
function overallProgress(){ let t=0; MODULES.forEach(m=>t+=modProgress(m)); return Math.round((t/MODULES.length)*90 + (finalPassed()?10:0)); }
function levelInfo(xp=S.xp){ let i=0; LEVELS.forEach((L,k)=>{ if (xp>=L.xp) i=k; }); const cur=LEVELS[i], nxt=LEVELS[i+1]; return { n:i+1, t:cur.t, cur:cur.xp, next:nxt?nxt.xp:null, pct: nxt ? (xp-cur.xp)/(nxt.xp-cur.xp) : 1 }; }

function nextStep(){
  for (const m of MODULES){
    if (!modUnlocked(m)) break;
    for (const raw of m.lessons){
      const l = lessonById(raw.id);
      if (!lessonUnlocked(l)) break;
      const p = S.lessons[l.id]||{};
      if (!p.read) return {label:`Lesson ${m.n}.${l.li+1}: ${l.title}`, sub:'Continue the lesson', act:'openLesson', arg:l.id+'|0'};
      if (!p.activity) return {label:l.activity.title, sub:`Practice activity · Lesson ${m.n}.${l.li+1}`, act:'openLesson', arg:l.id+'|5'};
      if (!p.quiz) return {label:`Lesson ${m.n}.${l.li+1} quiz`, sub:l.title, act:'openLesson', arg:l.id+'|6'};
    }
    if (modLessonsDone(m) && !modPassed(m)) return {label:`Module ${m.n} assessment`, sub:m.title, act:'startModule', arg:m.id};
  }
  if (allModsPassed() && !finalPassed()) return {label:'Final assessment', sub:'Cybersecurity Fundamentals', act:'startFinal'};
  return {label:'View your certificate', sub:'Programme complete', act:'go', arg:'certificate'};
}

/* ---------- Toasts, modals and rewards ---------- */
function toast(msg, cls=''){
  const t = document.createElement('div'); t.className = 'toast '+cls; t.innerHTML = msg;
  $('#toasts').appendChild(t); setTimeout(()=>t.remove(), cls==='xp'?1800:3200);
}
const modalQueue = [];
function showModal(html, onClose){ modalQueue.push({html,onClose}); if (modalQueue.length===1) openNextModal(); }
function openNextModal(){
  const m = modalQueue[0]; if (!m) return;
  $('#layer').innerHTML = `<div class="overlay" data-act="modalBg"><div class="modal" role="dialog" aria-modal="true">${m.html}</div></div>`;
  const f = $('#layer .modal button'); if (f) f.focus();
}
function closeModal(){ const m = modalQueue.shift(); $('#layer').innerHTML=''; if (m && m.onClose) m.onClose(); openNextModal(); }
function log(txt, xp=0){ S.history.unshift({t:Date.now(), txt, xp}); S.history = S.history.slice(0,60); }
function addXP(n, why){
  const before = levelInfo().n; S.xp += n; log(why, n); save();
  toast(`+${n} XP`, 'xp'); updateHUD();
  const after = levelInfo();
  if (after.n > before) showModal(`<div class="label" style="color:var(--gold-ink)">Level up!</div><div class="level-num" style="margin:14px auto">${after.n}</div><h2>${esc(after.t)}</h2><p class="muted">You reached level ${after.n}. Keep learning to unlock the next rank.</p><div class="actions"><button class="btn gold" data-act="closeModal">Awesome</button></div>`);
}
function award(id){
  if (S.badges.includes(id)) return; const b = BADGES.find(x=>x.id===id); if (!b) return;
  S.badges.push(id); log(`Badge unlocked: ${b.t}`); save();
  showModal(`<div class="label" style="color:var(--gold-ink)">Badge unlocked</div><div class="big-medal" style="background:${b.c}">${icon(b.icon,'#05061a',58)}</div><h2>${esc(b.t)}</h2><p class="muted">${esc(b.d)}</p><div class="actions"><button class="btn ghost" data-act="shareBadge" data-arg="${b.id}">Share in Community</button><button class="btn gold" data-act="closeModal">Nice!</button></div>`);
}

/* ---------- Shell ---------- */
const NAV = [
  ['dashboard','Dashboard','home'],['campus','Campus','campus'],['library','Library','book'],['challenge','Arcade','flag'],['career','Careers','compass'],
  ['mentor','AI Lab','chip'],['community','Community','chat'],['achievements','Achievements','trophy'],['certificate','Certificate','scroll']
];
function renderApp(){
  clearTimers(); if (window.Campus) Campus.stop();
  if (!S.user){ renderOnboarding(); return; }
  $('#app').innerHTML = `
    <header class="hud">
      <button class="logo" data-act="go" data-arg="dashboard" aria-label="Cybersity home">CYBER<span>SITY</span></button>
      <nav class="nav" id="nav" aria-label="Main">${NAV.map(([v,t,ic])=>`<button data-act="go" data-arg="${v}" data-nav="${v}">${icon(ic, isDay() ? '#0a7ea3' : '#2ee6ff')}${t}</button>`).join('')}</nav>
      <div class="player-chip" data-act="go" data-arg="achievements" title="Your progress">
        <div class="ava"><img class="px" id="hudAva" alt=""></div>
        <div class="xpwrap"><div class="lvl" id="hudLvl"></div><div class="xpbar"><i id="hudXp"></i></div></div>
      </div>
      ${themeBtnHTML('icon-btn')}
      <button class="icon-btn" data-act="toggleMenu" aria-label="Menu and presenter tools">${icon('gear', isDay() ? '#b07800' : '#ffd447')}</button>
    </header>
    <main class="stage" id="view"></main>
    <button class="fab" id="fab" data-act="toggleDrawer" aria-label="Ask BYTE, your AI mentor"><img class="px" alt="" src="${BOT_URL}"><span class="bubble-hint">Need help? Ask BYTE</span></button>
    <div class="drawer hidden" id="drawer"></div>
    <div id="menuHost"></div>`;
  updateHUD(); renderView();
}
function updateHUD(){
  if (!S.user || !$('#hudLvl')) return;
  const L = levelInfo();
  $('#hudAva').src = avatarURL(S.user.look);
  $('#hudLvl').textContent = `LV ${L.n} · ${S.xp} XP`;
  $('#hudXp').style.width = Math.round(L.pct*100)+'%';
}
function go(view, params={}){
  if (view !== 'lesson' && view !== 'quiz') UI.quiz = null;
  if (view !== 'career') UI.cq = null;
  S.view = view; S.params = params; save(); renderView(); window.scrollTo({top:0});
}
function renderView(){
  clearTimers(); if (window.Campus) Campus.stop();
  const v = S.view; const el = $('#view'); if (!el) return;
  document.querySelectorAll('[data-nav]').forEach(b=> b.classList.toggle('on', b.dataset.nav===v || (v==='module'&&b.dataset.nav==='library') || (v==='lesson'&&b.dataset.nav==='library') || ((v==='quiz'||v==='arcade')&&b.dataset.nav==='challenge') || ((v==='home'||v==='incident')&&b.dataset.nav==='campus')));
  const fab = $('#fab'); if (fab) fab.classList.toggle('hidden', v==='mentor');
  if (v==='mentor' && UI.drawer){ UI.drawer=false; $('#drawer').classList.add('hidden'); }
  const views = { dashboard:viewDashboard, campus:viewCampus, library:viewLibrary, module:viewModule, lesson:viewLesson, quiz:viewQuiz,
    challenge:viewChallenge, mentor:viewMentor, community:viewCommunity, achievements:viewAchievements, certificate:viewCertificate, admin:viewAdmin, home:viewHome, career:viewCareer, incident:viewIncident, arcade:viewArcade };
  (views[v] || viewDashboard)(el);
  themeHead(el, v);
}
// Big titles get the game-title look (see .gt in the CSS): their text is copied into data-t for the outline and fill layers
function gameTitles(){ document.querySelectorAll('#app :is(.page-head h1, .welcome h1, .hero-logo, .onb-logo)').forEach(h=>{ const t = h.innerText.trim(); if (h.dataset.t !== t){ h.dataset.t = t; h.classList.add('gt'); } }); }
new MutationObserver(gameTitles).observe(document.getElementById('app'), { childList:true, subtree:true });
// Inside a building, the page header takes the building's colour and a pixel banner of it
const VIEW_BUILDING = { library:'library', module:'library', mentor:'ailab', community:'community', challenge:'challenge', arcade:'challenge', achievements:'achieve', certificate:'cert', home:'home', career:'compass' };
function themeHead(el, v){
  const head = el.querySelector('.page-head'); if (!head || head.classList.contains('role-head')) return;
  const hacked = v==='incident', id = hacked ? (S.params||{}).b : VIEW_BUILDING[v], b = id && Campus.buildings.find(x=>x.id===id); if (!b) return;
  head.classList.add('bhead'); head.style.setProperty('--bc', hacked ? '#ff5d6e' : b.color);
  head.insertAdjacentHTML('afterbegin', `<img class="bbanner px" src="${Campus.banner(id, hacked)}" alt="">`);
}

/* ---------- Onboarding ---------- */
function randomLook(){ return { skin:pick(LOOK_OPTS.skin), hairStyle:pick(LOOK_OPTS.hairStyle), hairColor:pick(LOOK_OPTS.hairColor), shirt:pick(LOOK_OPTS.shirt), acc:pick(LOOK_OPTS.acc) }; }
// Onboarding is a stack of full-screen pages over one animated campus scene (startTitleScene).
// Steps: title -> auth -> avatar -> brief. Moving forward slides the new page up; going back slides it down.
function onbPageHTML(step){
  if (step==='title') return `<div class="title-screen">
      <div class="ts-kicker">★ A cybersecurity campus adventure ★</div>
      <h1 class="hero-logo">CYBERSITY</h1>
      <div class="hero-tag">Learn cybersecurity. Level up together.</div>
      <button class="press-start" data-act="pressStart">▶ Press start</button>
      <div class="ts-hint">Press Enter or tap to begin</div>
      <div class="ts-foot">© 2026 Cybersity · A prototype for IIMaCC 2026</div>
    </div>`;
  if (step==='auth') return `<div class="onb-card">
      <div class="onb-top"><button class="onb-back" data-act="backToTitle">◂ Title screen</button><span class="label">Step 1 of 2</span></div>
      <div class="onb-logo">CYBERSITY</div>
      <p class="onb-sub">Join the campus. Pick up where you left off, or create a new learner.</p>
      <section class="panel">
        <div class="tabs" role="tablist"><button class="${UI.authTab==='register'?'on':''}" data-act="authTab" data-arg="register">Register</button><button class="${UI.authTab==='login'?'on':''}" data-act="authTab" data-arg="login">Log in</button></div>
        <form id="authForm" autocomplete="off">
          ${UI.authTab==='register' ? `
          <div class="field"><label for="fName">Display name</label><input class="input" id="fName" maxlength="18" placeholder="e.g. NurulCyber" required></div>
          <div class="field"><label for="fEmail">Email</label><input class="input" id="fEmail" type="email" placeholder="you@example.com"></div>
          <div class="field"><label for="fPass">Password</label><input class="input" id="fPass" type="password" placeholder="At least 12 characters"></div>
          <button class="btn" style="width:100%" type="submit">Create account ▸</button>` : `
          <div class="field"><label for="fEmail">Email</label><input class="input" id="fEmail" type="email" placeholder="you@example.com"></div>
          <div class="field"><label for="fPass">Password</label><input class="input" id="fPass" type="password"></div>
          <button class="btn" style="width:100%" type="submit">Log in ▸</button>
          <p class="note" style="margin-top:10px">Forgot password? Recovery is handled by the full system.</p>`}
        </form>
        <div style="display:flex; align-items:center; gap:10px; margin:16px 0; color:var(--muted)" class="label"><span style="flex:1;height:2px;background:var(--line)"></span>or<span style="flex:1;height:2px;background:var(--line)"></span></div>
        <button class="btn pink" style="width:100%" data-act="quickDemo">Try the demo instantly</button>
        <p class="note" style="margin-top:14px">Prototype only: accounts are simulated and nothing leaves your browser. Please don't type a real password.</p>
      </section></div>`;
  return `<div class="onb-wide">${avatarCreatorHTML()}</div>`; // avatar
}
function renderOnboarding(dir='up'){
  const app = $('#app');
  if (!$('#onbPages')){ app.innerHTML = `<div class="onb"><canvas id="onbSky" class="px" aria-hidden="true"></canvas><div class="onb-pages" id="onbPages"></div></div>`; startTitleScene($('#onbSky')); }
  const host = $('#onbPages'), old = host.querySelector('.onb-page.cur'), step = UI.onb;
  const pg = document.createElement('div'); pg.className = 'onb-page step-'+step; pg.innerHTML = onbPageHTML(step);
  if (old && old.dataset.step === step){ old.innerHTML = pg.innerHTML; bindOnbPage(old); return; } // same step (e.g. Register/Log in tabs): update in place
  pg.dataset.step = step;
  if (old){ pg.classList.add(dir==='up' ? 'from-below' : 'from-above'); host.appendChild(pg); pg.offsetHeight; // start below/above, then slide in
    requestAnimationFrame(()=>{ pg.classList.remove('from-below','from-above'); old.classList.remove('cur'); old.classList.add(dir==='up' ? 'to-above' : 'to-below'); });
    setTimeout(()=>old.remove(), 750);
  } else host.appendChild(pg);
  pg.classList.add('cur'); bindOnbPage(pg);
}
function bindOnbPage(pg){
  const form = pg.querySelector('#authForm');
  if (form) form.addEventListener('submit', e=>{
    e.preventDefault();
    const name = ($('#fName')?.value || ($('#fEmail').value.split('@')[0]) || 'Learner').trim().slice(0,18) || 'Learner';
    UI.draftName = name; UI.draftLook = randomLook(); UI.onb='avatar'; UI.editAvatar=false; renderOnboarding();
  });
  if (pg.querySelector('#avaPreview')) bindAvatarCreator();
}
function avatarCreatorHTML(){
  const L = UI.draftLook;
  const sw = (key, list) => `<div class="swatches">${list.map(v=>`<button class="sw ${L[key]===v?'on':''}" style="background:${v}" data-act="look" data-arg="${key}|${v}" aria-label="${key} ${v}"></button>`).join('')}</div>`;
  const chips = (key, list) => `<div class="swatches">${list.map(v=>`<button class="chip ${L[key]===v?'on':''}" data-act="look" data-arg="${key}|${v}">${v}</button>`).join('')}</div>`;
  return `<div class="panel">
    <div class="page-head" style="margin-bottom:16px"><div><div class="label" style="color:var(--pink-ink)">${UI.editAvatar?'Edit profile':'Step 2 of 2'}</div><h1 class="pixel" style="font-size:36px; margin-top:8px">Create your avatar</h1><p class="muted" style="margin-top:6px">This is how other learners will see you on campus and in the community.</p></div><button class="btn ghost small" data-act="randomLook">Randomise</button></div>
    <div class="creator">
      <div><div class="ava-stage"><div class="floor"></div><img class="px" id="avaPreview" alt="Avatar preview" src="${avatarURL(L)}"></div>
        <div class="field" style="margin-top:16px"><label for="avaName">Display name</label><input class="input" id="avaName" maxlength="18" value="${esc(UI.draftName)}"></div></div>
      <div>
        <div class="opt-row"><span class="label">Skin tone</span>${sw('skin',LOOK_OPTS.skin)}</div>
        <div class="opt-row"><span class="label">Hair / headwear</span>${chips('hairStyle',LOOK_OPTS.hairStyle)}</div>
        <div class="opt-row"><span class="label">Hair / hijab colour</span>${sw('hairColor',LOOK_OPTS.hairColor)}</div>
        <div class="opt-row"><span class="label">Outfit colour</span>${sw('shirt',LOOK_OPTS.shirt)}</div>
        <div class="opt-row"><span class="label">Accessory</span>${chips('acc',LOOK_OPTS.acc)}</div>
        <div style="display:flex; gap:10px; margin-top:20px; flex-wrap:wrap">${UI.editAvatar?`<button class="btn ghost" data-act="cancelAvatar">Cancel</button>`:''}<button class="btn gold" data-act="saveAvatar">${UI.editAvatar?'Save changes':'Enter the campus ▸'}</button></div>
      </div></div></div>`;
}
function bindAvatarCreator(){
  const img = $('#avaPreview'); let f=0;
  timers.push(setInterval(()=>{ if (!img.isConnected) return; f++; img.src = avatarCanvas(UI.draftLook, f%2).toDataURL(); }, 450));
  $('#avaName').addEventListener('input', e=> UI.draftName = e.target.value);
}

/* ---------- Dashboard ---------- */
function viewDashboard(el){
  const L = levelInfo(), nx = nextStep(), pct = overallProgress();
  const recent = S.badges.slice(-4).reverse().map(id=>BADGES.find(b=>b.id===id));
  el.innerHTML = `
    <section class="welcome">
      <div class="big-ava"><img class="px" src="${avatarURL(S.user.look)}" alt=""></div>
      <div style="position:relative; z-index:1">
        <div class="label" style="color:var(--cyan-ink)">Learner dashboard</div>
        <h1>Welcome back, ${esc(S.user.name)}</h1>
        <p class="muted" style="margin-top:6px">Level ${L.n} · ${esc(L.t)} · ${pct}% of the Cybersecurity Fundamentals pathway complete</p>
      </div>
      <div style="position:relative; z-index:1; display:flex; flex-direction:column; gap:8px">
        <button class="btn gold" data-act="${nx.act}" data-arg="${nx.arg||''}">Continue ▸</button>
        <small class="muted" style="max-width:220px">${esc(nx.label)}</small>
      </div>
    </section>
    <div class="stats-row" style="margin-top:18px">
      <div class="panel stat"><span>Total XP</span><b>${S.xp}</b></div>
      <div class="panel stat"><span>Level</span><b>${L.n}</b><div class="bar gold"><i style="width:${Math.round(L.pct*100)}%"></i></div></div>
      <div class="panel stat"><span>Badges</span><b>${S.badges.length}/${BADGES.length}</b></div>
      <div class="panel stat"><span>Programme</span><b>${pct}%</b><div class="bar"><i style="width:${pct}%"></i></div></div>
    </div>
    <div class="grid g-wide" style="margin-top:22px">
      <section class="panel">
        <div class="section-title">Learning progress</div>
        ${MODULES.map(m=>{ const p=Math.round(modProgress(m)*100), un=modUnlocked(m); return `
          <div class="mod-row"><div class="mod-num" style="background:${un?m.color:'#2a3070'}; color:#05061a">${un?m.n:icon('lock','#9aa3da',16)}</div>
          <div style="min-width:0"><div style="display:flex; justify-content:space-between; gap:8px"><b style="font-weight:500; font-size:14.5px">${esc(m.title)}</b><span class="label muted">${modPassed(m)?'Passed':p+'%'}</span></div><div class="bar" style="margin-top:6px"><i style="width:${p}%; background:${m.color}"></i></div></div>
          <button class="btn ghost small" data-act="openModule" data-arg="${m.id}" ${un?'':'disabled'}>${un?'Open':'Locked'}</button></div>`; }).join('')}
      </section>
      <div class="grid" style="align-content:start">
        <section class="panel" style="padding:0; overflow:hidden">
          <canvas id="miniCampus" class="px" width="240" height="96" style="width:100%; display:block; border-bottom:3px solid #000"></canvas>
          <div style="padding:16px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap"><div><b>Virtual Campus</b><div class="muted" style="font-size:13px">${COMMUNITY_USERS.filter(u=>u.status==='on').length+1} learners online now</div></div><button class="btn" data-act="go" data-arg="campus">Enter</button></div>
        </section>
        <section class="panel home-card">
          <canvas id="miniDorm" class="px" width="256" height="208" aria-hidden="true"></canvas>
          <div style="min-width:0; flex:1"><div class="label" style="color:var(--green-ink)">Safety Score</div><b class="pixel" style="font-size:38px; display:block; margin:6px 0">${healthScore()}%</b>
            <div class="bar green"><i style="width:${healthScore()}%"></i></div><small class="muted" style="display:block; margin-top:6px">${healthDone()}/${HEALTH_CHECKS.length} real-life actions · ${esc(HOME_STAGES[homeStage()].t)}</small></div>
          <button class="btn green small" data-act="go" data-arg="home">Home Base</button>
        </section>
        <section class="panel">
          <div class="section-title">Recent badges</div>
          ${recent.length ? `<div style="display:flex; gap:12px; flex-wrap:wrap">${recent.map(b=>`<div class="badge" style="padding:10px; flex:1; min-width:90px"><div class="medal" style="width:46px;height:46px;background:${b.c}">${icon(b.icon,'#05061a',24)}</div><b style="font-size:10px">${esc(b.t)}</b></div>`).join('')}</div>` : `<p class="muted">Complete your first lesson to earn a badge.</p>`}
        </section>
        <section class="tip-card"><div class="label">Security tip of the day</div><p style="margin-top:6px">${esc(TIPS[new Date().getDate()%TIPS.length])}</p></section>
      </div>
    </div>`;
  drawMiniCampus(); animateDorm($('#miniDorm'), 2);
}
function drawMiniCampus(){
  const c = $('#miniCampus'); if (!c) return; const x = c.getContext('2d'); x.imageSmoothingEnabled=false;
  const P = pal(); if (isDay()){ x.fillStyle='#8fd3ff'; x.fillRect(0,0,240,58); x.fillStyle=P.grass; x.fillRect(0,48,240,48); } else { x.fillStyle='#14352b'; x.fillRect(0,0,240,96); } x.fillStyle=P.path[0]; x.fillRect(0,58,240,22);
  BUILDINGS.forEach((b,i)=>{ const bx = 6+i*39; x.fillStyle=b.roof; x.fillRect(bx,16,34,12); x.fillStyle=P.wall; x.fillRect(bx+2,28,30,28); x.fillStyle=b.color; x.fillRect(bx+5,33,6,6); x.fillRect(bx+23,33,6,6); x.fillStyle='#05061a'; x.fillRect(bx+14,44,6,12); });
  let f=0; const looks=[S.user.look, ...COMMUNITY_USERS.slice(0,4).map(u=>u.look)];
  const draw=()=>{ x.fillStyle=P.path[0]; x.fillRect(0,58,240,22); looks.forEach((L,i)=>{ const px = (i*53 + f*(i%2?1:-1)*2 + 600) % 240; x.drawImage(avatarCanvas(L,f%2), px, 60); }); f++; };
  draw(); timers.push(setInterval(draw, 300));
}

/* ---------- Library & module ---------- */
function viewLibrary(el){
  el.innerHTML = `<div class="page-head"><div><div class="crumbs">Campus · Cyber Library</div><h1>Cyber Library</h1><p>The Cybersecurity Fundamentals pathway: six modules, each with lessons, practice activities, quizzes and a module assessment. Complete them in order to unlock the next.</p></div><span class="pill cyan">${ALL_LESSONS.filter(l=>lessonDone(l.id)).length}/${ALL_LESSONS.length} lessons done</span></div>
  <div class="grid g3">${MODULES.map(m=>{ const un=modUnlocked(m), p=Math.round(modProgress(m)*100); return `
    <button class="mod-card ${un?'':'locked'}" data-act="openModule" data-arg="${m.id}">
      <div class="cover" style="background:${m.color}"><span class="n">0${m.n}</span>${icon(m.icon,'#05061a',48)}</div>
      <div class="body"><div class="label" style="color:${m.color}">Module ${m.n} · ${m.lessons.length} lessons</div><h3>${esc(m.title)}</h3><p>${esc(m.blurb)}</p>
      <div style="margin-top:auto">${un ? `<div style="display:flex; justify-content:space-between" class="label muted"><span>${modPassed(m)?'Passed ✓':'Progress'}</span><span>${p}%</span></div><div class="bar" style="margin-top:6px"><i style="width:${p}%; background:${m.color}"></i></div>` : `<span class="pill lock-tag">${icon('lock','#9aa3da',14)} Pass module ${m.n-1} to unlock</span>`}</div></div>
    </button>`; }).join('')}</div>`;
}
function viewModule(el){
  const m = modById(S.params.id) || MODULES[0];
  if (!modUnlocked(m)){ toast('That module is locked. Pass the previous module assessment first.'); go('library'); return; }
  const assessOpen = modLessonsDone(m), mp = S.modules[m.id];
  el.innerHTML = `<div class="page-head"><div><div class="crumbs"><button data-act="go" data-arg="library">Cyber Library</button><span>›</span><span>Module ${m.n}</span></div><h1>${esc(m.title)}</h1><p>${esc(m.blurb)}</p></div><div style="min-width:200px"><div class="label muted">Module progress ${Math.round(modProgress(m)*100)}%</div><div class="bar" style="margin-top:6px"><i style="width:${Math.round(modProgress(m)*100)}%; background:${m.color}"></i></div></div></div>
  <div class="lesson-list">
    ${m.lessons.map((l,i)=>{ const L = lessonById(l.id), un = lessonUnlocked(L), p = S.lessons[l.id]||{}; return `
      <div class="lesson-item" style="${un?'':'opacity:.6'}">
        <div class="st" style="background:${p.quiz?'var(--green)':un?m.color:'#2a3070'}; color:#05061a">${p.quiz?icon('check','#05061a',20):un?`${m.n}.${i+1}`:icon('lock','#9aa3da',18)}</div>
        <div style="min-width:0"><h3>${esc(l.title)}</h3><div class="muted" style="font-size:13px">${l.mins} min · Activity: ${esc(l.activity.title)}</div>
          <div class="steps-mini"><span class="${p.read?'done':''}">Lesson</span><span class="${p.activity?'done':''}">Activity</span><span class="${p.quiz?'done':''}">Quiz${p.quizBest!=null?' '+p.quizBest+'%':''}</span></div></div>
        <button class="btn ${p.quiz?'ghost':''} small" data-act="openLesson" data-arg="${l.id}|0" ${un?'':'disabled'}>${!un?'Locked':p.quiz?'Revisit':p.read?'Continue':'Start'}</button>
      </div>`; }).join('')}
    <div class="lesson-item" style="background:linear-gradient(120deg,#2a1460,#171d4d)">
      <div class="st" style="background:${mp&&mp.passed?'var(--green)':assessOpen?'var(--gold)':'#2a3070'}">${icon(mp&&mp.passed?'check':assessOpen?'trophy':'lock', assessOpen?'#05061a':'#9aa3da',20)}</div>
      <div><h3>Module ${m.n} assessment</h3><div class="muted" style="font-size:13px">${m.lessons.length*3+2} questions · pass mark ${S.passMark}%${mp&&mp.best!=null?` · best ${mp.best}%`:''}</div></div>
      <button class="btn gold small" data-act="startModule" data-arg="${m.id}" ${assessOpen?'':'disabled'}>${assessOpen?(mp&&mp.passed?'Retake':'Start'):'Finish lessons first'}</button>
    </div>
  </div>`;
}

/* ---------- Lesson ---------- */
function viewLesson(el){
  const l = lessonById(UI.lessonId); if (!l){ go('library'); return; }
  const p = prog(l.id), m = l.mod, st = UI.stage;
  const can = i => i<=4 ? true : i===5 ? !!p.read : !!(p.read && p.activity);
  const done = i => i<=4 ? (p.read || (p.maxStage||0) > i) : i===5 ? !!p.activity : !!p.quiz;
  p.maxStage = Math.max(p.maxStage||0, st); save();
  S.currentLesson = l.id;
  el.innerHTML = `<div class="page-head"><div><div class="crumbs"><button data-act="go" data-arg="library">Cyber Library</button><span>›</span><button data-act="openModule" data-arg="${m.id}">Module ${m.n}</button><span>›</span><span>Lesson ${m.n}.${l.li+1}</span></div><h1>${esc(l.title)}</h1></div><span class="pill" style="background:${m.color}; color:#05061a">${l.mins} min lesson</span></div>
  <div class="lesson-layout">
    <nav class="stepper" aria-label="Lesson steps">${LESSON_STAGES.map((s,i)=>`<button class="${i===st?'on':''} ${done(i)?'done':''}" data-act="stage" data-arg="${i}" ${can(i)?'':'disabled'}><span class="dot">${done(i)&&i!==st?'✓':i+1}</span>${s}${can(i)?'':' 🔒'}</button>`).join('')}</nav>
    <section class="monitor" id="lessonPanel">${lessonStageHTML(l, st)}</section>
  </div>`;
  if (st===5) Activities.mount(l, $('#actHost'));
  if (st===2 && l.id==='m5l1') bindHashDemo();
}
function lessonStageHTML(l, st){
  const p = prog(l.id);
  const nav = (back, next) => `<div class="lesson-nav">${back!==null?`<button class="btn ghost" data-act="stage" data-arg="${back}">◂ Back</button>`:'<span></span>'}${next}</div>`;
  const ask = `<div class="ask-byte"><img class="px" src="${BOT_URL}" alt=""><span>Confused by something in this lesson? BYTE can explain it another way.</span><button class="btn purple small" data-act="askAbout" data-arg="${l.id}">Ask BYTE</button></div>`;
  const kicker = `<div class="kicker">Step ${st+1} of 7 · ${LESSON_STAGES[st]}</div>`;
  if (st===0) return `${kicker}<h2 style="margin:8px 0 14px">${esc(l.title)}</h2><div class="lesson-body">${l.intro}</div>
    <div class="vis" style="display:flex; gap:12px; flex-wrap:wrap; align-items:center"><span class="label" style="color:#4a5180">In this lesson</span>${['Concepts','Visual example','Scenario','Recap',l.activity.title,'Quiz'].map(t=>`<span class="pill" style="background:var(--paper-2); color:var(--ink); box-shadow:2px 2px 0 var(--ink)">${esc(t)}</span>`).join('')}</div>
    ${nav(null, `<button class="btn" data-act="stage" data-arg="1">Start learning ▸</button>`)}`;
  if (st===1) return `${kicker}<h2 style="margin:8px 0 10px">Key concepts</h2><p class="lesson-body">${esc(l.concept.lead)}</p>
    <div class="concepts">${l.concept.points.map(([t,d])=>`<div class="concept"><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('')}</div>${ask}
    ${nav(0, `<button class="btn" data-act="stage" data-arg="2">See an example ▸</button>`)}`;
  if (st===2) return `${kicker}<h2 style="margin:8px 0 10px">Visual example</h2><div class="vis">${l.visual.html}</div><p class="vis-cap">${esc(l.visual.caption)}</p>
    ${nav(1, `<button class="btn" data-act="stage" data-arg="3">Try a scenario ▸</button>`)}`;
  if (st===3){ const sc = l.scenario, pickd = UI.scen[l.id];
    return `${kicker}<h2 style="margin:8px 0 10px">Real-world scenario</h2>
    <div class="scenario-box"><div class="who">${esc(sc.who)}</div><p style="margin-top:8px; font-size:16px">${sc.story}</p><p style="margin-top:14px; font-weight:600">${esc(sc.question)}</p>
    <div class="choices">${sc.options.map((o,i)=>`<button class="choice ${pickd!=null ? (o.ok?'right': pickd===i?'wrong':'') : ''}" data-act="scen" data-arg="${i}" ${pickd!=null?'disabled':''}>${esc(o.t)}</button>`).join('')}</div>
    ${pickd!=null?`<div class="feedback ${sc.options[pickd].ok?'ok':'bad'}"><b>${sc.options[pickd].ok?'Good call.':'Not quite.'}</b> ${esc(sc.options[pickd].fb)}${sc.options[pickd].ok?'':' The correct answer is highlighted in green.'}</div>`:''}</div>
    ${nav(2, `<button class="btn" data-act="stage" data-arg="4" ${pickd==null?'disabled':''}>Recap ▸</button>`)}`; }
  if (st===4) return `${kicker}<h2 style="margin:8px 0 10px">Knowledge recap</h2><ul class="recap-list lesson-body">${l.recap.points.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
    <div class="label" style="color:#4a5180; margin-top:18px">Key terms</div><div class="terms">${l.recap.terms.map(([t,d])=>`<div><b>${esc(t)}</b>${esc(d)}</div>`).join('')}</div>
    ${l.realLife==='scam' ? realLifeHTML() : ''}
    ${nav(3, p.read ? `<button class="btn" data-act="stage" data-arg="5">Go to activity ▸</button>` : `<button class="btn green" data-act="completeLesson" data-arg="${l.id}">Complete lesson · +${XP.lesson} XP</button>`)}`;
  if (st===5) return `${kicker}<div id="actHost"></div>${nav(4, `<button class="btn" data-act="stage" data-arg="6" ${p.activity?'':'disabled'}>Go to quiz ▸</button>`)}`;
  if (st===6){ const ready = p.read && p.activity;
    return `${kicker}<div class="result-hero"><div class="score-ring" style="background:${l.mod.color}">${icon('check','#05061a',56)}</div><h2>Lesson ${l.mod.n}.${l.li+1} quiz</h2>
    <p class="lesson-body" style="margin:10px auto 0">${l.quiz.length} questions about <b>${esc(l.title)}</b>. You get an explanation after every answer. Pass mark: ${S.passMark}%.</p>
    ${p.quizBest!=null?`<p style="margin-top:8px">Best score so far: <b>${p.quizBest}%</b></p>`:''}
    ${p.quiz && FAMILY_CARDS[l.id] ? `<p style="margin-top:10px"><button class="btn ghost small" data-act="familyCard" data-arg="${l.id}">${icon('chat','#2ee6ff',14)} Teach your family</button></p>`:''}
    <div style="margin-top:20px">${ready?`<button class="btn gold" data-act="startLessonQuiz" data-arg="${l.id}">${p.quiz?'Retake quiz':'Start quiz'} ▸</button>`:`<p class="feedback bad" style="display:inline-block">Finish the lesson and the activity first. The quiz unlocks after you have studied and practised.</p>`}</div></div>
    ${nav(5, '<span></span>')}`; }
  return '';
}
// "Teach your family" card: shared as plain text on WhatsApp (no personal data in the link)
function familyText(l){ const c = FAMILY_CARDS[l.id];
  return `1-minute cyber tip for the family: ${c.h}\n\n${c.tips.map((t,i)=>`${i+1}. ${t}`).join('\n')}\n\nTry this today: ${c.try}\n\n(Shared from Cybersity, a cybersecurity learning app)`; }
function familyCardHTML(l){
  const c = FAMILY_CARDS[l.id]; if (!c) return '';
  return `<div class="family"><div class="family-card" style="--mc:${l.mod.color}">
    <div class="fc-top"><img class="px" src="${BOT_URL}" alt=""><div><div class="label">Teach your family · 1-minute read</div><b>${esc(c.h)}</b></div></div>
    <ol class="fc-tips">${c.tips.map(t=>`<li>${esc(t)}</li>`).join('')}</ol>
    <div class="fc-try"><b>Try this today:</b> ${esc(c.try)}</div>
    <div class="fc-foot">From Lesson ${l.mod.n}.${l.li+1}: ${esc(l.title)} · Cybersity</div></div>
    <div class="fc-actions"><a class="btn green" href="https://wa.me/?text=${encodeURIComponent(familyText(l))}" target="_blank" rel="noopener">${icon('chat','#05061a',16)} Share on WhatsApp</a><button class="btn ghost" data-act="familyCopy" data-arg="${l.id}">Copy text</button></div></div>`;
}
function realLifeHTML(){
  return `<section class="reallife" aria-labelledby="rlTitle"><div class="rl-head"><span class="rl-alert">!</span><div><div class="label">If it happens to you</div><h3 id="rlTitle">What to do in real life</h3></div></div>
    <p class="rl-lead">Clicked a scam link, shared a code or sent money? Act fast and stay calm. Being scammed is never something to be ashamed of.</p>
    <ol class="rl-steps">${SCAM_STEPS.map((s,i)=>`<li><span class="rl-n">${i+1}</span><div><b>${esc(s.t)}</b><span>${esc(s.d)}</span>${s.call?`<a class="btn pink small rl-call" href="tel:997">Call 997</a>`:''}</div></li>`).join('')}</ol>
    <p class="rl-foot">Keep the evidence: screenshots of the chat, the phone number and your transfer receipts. Do not delete the messages.</p></section>`;
}
async function bindHashDemo(){
  const inp = $('#hashIn'), out = $('#hashOut'); if (!inp) return;
  const run = async ()=>{ try { const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(inp.value)); out.textContent = [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join(''); } catch(e){ out.textContent = 'Hashing is not available in this browser preview.'; } };
  inp.addEventListener('input', run); run();
}

/* ---------- Quiz engine (lesson, module, final) ---------- */
function prepQ(q){ const order = shuffle(q.o.map((_,i)=>i)); return { q:q.q, o:order.map(i=>q.o[i]), a:order.indexOf(q.a), e:q.e }; }
function startQuiz(kind, id){
  let qs, title, back;
  if (kind==='lesson'){ const l=lessonById(id); qs=l.quiz.map(prepQ); title=`Lesson ${l.mod.n}.${l.li+1} quiz · ${l.title}`; }
  if (kind==='module'){ const m=modById(id); qs=shuffle([...m.lessons.flatMap(l=>l.quiz), ...m.extra]).map(prepQ); title=`Module ${m.n} assessment · ${m.title}`; }
  if (kind==='final'){ qs=shuffle(MODULES.flatMap(m=> shuffle([...m.lessons.flatMap(l=>l.quiz), ...m.extra]).slice(0,2))).map(prepQ); title='Final assessment · Cybersecurity Fundamentals'; }
  UI.quiz = { kind, id, qs, idx:0, ans:[], picked:null, title, done:false };
  go('quiz');
}
function viewQuiz(el){
  const Q = UI.quiz; if (!Q){ go('challenge'); return; }
  if (Q.done) return quizResult(el, Q);
  const q = Q.qs[Q.idx];
  el.innerHTML = `<div class="page-head"><div><div class="crumbs"><button data-act="quitQuiz">◂ Leave</button><span>·</span><span>${Q.kind==='lesson'?'Lesson quiz':Q.kind==='module'?'Module assessment':'Final assessment'}</span></div><h1 style="font-size:16px">${esc(Q.title)}</h1></div><span class="pill gold">Question ${Q.idx+1} / ${Q.qs.length}</span></div>
  <section class="monitor quiz-wrap">
    <div class="qprog">${Q.qs.map((_,i)=>`<i class="${i<Q.idx ? (Q.ans[i]?'ok':'bad') : i===Q.idx ? (Q.picked!=null?(Q.picked===q.a?'ok':'bad'):'cur') : ''}"></i>`).join('')}</div>
    <div class="kicker">Question ${Q.idx+1}</div><div class="qtext">${esc(q.q)}</div>
    ${q.o.map((o,i)=>`<button class="opt ${Q.picked!=null ? (i===q.a?'right': i===Q.picked?'wrong':'') : ''}" data-act="answer" data-arg="${i}" ${Q.picked!=null?'disabled':''}><span class="k">${'ABCD'[i]}</span>${esc(o)}</button>`).join('')}
    ${Q.picked!=null ? `<div class="feedback ${Q.picked===q.a?'ok':'bad'}"><b>${Q.picked===q.a?'Correct!':'Not quite.'}</b> ${esc(q.e)}</div>
      <div class="lesson-nav"><span></span><button class="btn" data-act="nextQ">${Q.idx<Q.qs.length-1?'Next question ▸':'See results ▸'}</button></div>` : ''}
  </section>`;
}
function finishQuiz(){
  const Q = UI.quiz, score = Math.round(Q.ans.filter(Boolean).length / Q.qs.length * 100), pass = score >= S.passMark;
  Q.score = score; Q.pass = pass; Q.done = true;
  S.attempts.unshift({kind:Q.kind, id:Q.id||'final', score, pass, at:Date.now()}); S.attempts = S.attempts.slice(0,50);
  const rewards = [];
  if (Q.kind==='lesson'){ const p=prog(Q.id), l=lessonById(Q.id); const first = pass && !p.quiz; p.quizBest = Math.max(p.quizBest||0, score); if (pass) p.quiz = true; save();
    if (first){ rewards.push(()=>addXP(XP.quiz, `Passed quiz: ${l.title}`)); if (score===100) rewards.push(()=>addXP(XP.perfectQuiz,'Perfect quiz bonus')); } }
  if (Q.kind==='module'){ const m=modById(Q.id), mp=(S.modules[m.id] ||= {}); const first = pass && !mp.passed; mp.best=Math.max(mp.best||0,score); if (pass) mp.passed=true; save();
    if (first){ rewards.push(()=>addXP(XP.module, `Passed Module ${m.n} assessment`)); rewards.push(()=>award('module')); if (MODULES.filter(modPassed).length>=3) rewards.push(()=>award('halfway')); } }
  if (Q.kind==='final'){ const first = pass && !finalPassed(); S.final = { passed: finalPassed()||pass, best: Math.max(S.final?.best||0, score) };
    if (first){ S.cert = { ref: makeCertRef(), date: Date.now() }; save(); rewards.push(()=>addXP(XP.final,'Passed the final assessment')); rewards.push(()=>award('grad')); } }
  if (score===100) rewards.push(()=>award('perfect'));
  save(); renderView(); rewards.forEach(f=>f());
}
function makeCertRef(){ const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s=''; for(let i=0;i<6;i++) s+=a[Math.floor(Math.random()*a.length)]; return `CYB-${new Date().getFullYear()}-${s}`; }
function quizResult(el, Q){
  const l = Q.kind==='lesson' ? lessonById(Q.id) : null, m = Q.kind==='module' ? modById(Q.id) : null;
  const wrong = Q.qs.map((q,i)=>({q,ok:Q.ans[i]})).filter(x=>!x.ok);
  let nextBtn = '';
  if (Q.pass){
    if (Q.kind==='lesson'){ const nx = l.mod.lessons[l.li+1]; nextBtn = nx ? `<button class="btn gold" data-act="openLesson" data-arg="${nx.id}|0">Next lesson ▸</button>` : `<button class="btn gold" data-act="startModule" data-arg="${l.mod.id}">Take Module ${l.mod.n} assessment ▸</button>`; }
    if (Q.kind==='module'){ const nm = MODULES[MODULES.indexOf(m)+1]; nextBtn = nm ? `<button class="btn gold" data-act="openModule" data-arg="${nm.id}">Start Module ${nm.n} ▸</button>` : `<button class="btn gold" data-act="startFinal">Take the final assessment ▸</button>`; }
    if (Q.kind==='final') nextBtn = `<button class="btn gold" data-act="go" data-arg="certificate">View my certificate ▸</button>`;
  }
  el.innerHTML = `<section class="monitor quiz-wrap"><div class="result-hero">
    <div class="kicker">${Q.pass?'Assessment passed':'Not passed yet'}</div>
    <div class="score-ring" style="background:${Q.pass?'#c9f7de':'#ffd6db'}">${Q.score}%</div>
    <h2>${Q.pass ? (Q.score===100?'Flawless!':'Well done!') : 'Almost there'}</h2>
    <p class="lesson-body" style="margin:8px auto 0">You answered ${Q.ans.filter(Boolean).length} of ${Q.qs.length} correctly. Pass mark: ${S.passMark}%.${Q.pass?'':' Review the explanations below, revisit the lesson and try again. There\'s no limit on retakes in this prototype.'}</p>
    <div class="actions" style="display:flex; gap:10px; justify-content:center; margin-top:18px; flex-wrap:wrap">
      ${!Q.pass && l ? `<button class="btn ghost" data-act="openLesson" data-arg="${l.id}|1">Review lesson</button>`:''}
      ${!Q.pass && m ? `<button class="btn ghost" data-act="openModule" data-arg="${m.id}">Review module</button>`:''}
      <button class="btn ${Q.pass?'ghost':''}" data-act="retryQuiz">Retake</button>${nextBtn}
    </div></div>
    ${Q.pass && l && FAMILY_CARDS[l.id] ? `<div class="kicker" style="margin-top:26px">Teach your family</div><p style="margin:6px 0 12px; color:var(--ink-2)">Share what you just learned with someone scammers might target, like your parents or grandparents.</p>${familyCardHTML(l)}` : ''}
    ${wrong.length?`<div class="kicker" style="margin-top:22px">Review your mistakes</div><div class="review">${wrong.map(x=>`<div class="bad"><b>${esc(x.q.q)}</b><br>Correct answer: <b>${esc(x.q.o[x.q.a])}</b><br><span style="color:var(--ink-2)">${esc(x.q.e)}</span></div>`).join('')}</div>`:''}
  </section>`;
}

/* ---------- Challenge Centre ---------- */
function viewChallenge(el){
  const row = (ic, color, title, sub, btn) => `<div class="ch-row">${icon(ic,color,28)}<div><b>${title}</b><small>${sub}</small></div>${btn}</div>`;
  const fUn = allModsPassed();
  el.innerHTML = `<div class="page-head"><div><div class="crumbs">Campus · Challenge Centre</div><h1>Cyber Arcade</h1><p>Play arcade games that test what you learned, then find every practice activity, quiz and assessment below. Locked items open as you progress through the lessons.</p></div></div>
  ${arcadeHallHTML()}
  <section class="boss"><img class="px" src="${iconURL('trophy','#ffd447')}" alt="" style="width:64px;height:64px"><div style="flex:1; min-width:220px"><div class="label" style="color:var(--pink-ink)">Final boss</div><h2>Final Assessment</h2><p class="muted" style="margin-top:6px">${MODULES.length*2} questions drawn from every module. Pass at ${S.passMark}% to earn the Cybersity Certificate of Completion.</p></div>
    ${finalPassed()?`<span class="pill green">Passed · best ${S.final.best}%</span>`:''}<button class="btn gold" data-act="startFinal" ${fUn?'':'disabled'}>${fUn?(finalPassed()?'Retake':'Start'):'Pass all 6 modules first'}</button></section>
  <div class="grid g2" style="margin-top:22px">
    <section><div class="section-title">Practice activities</div>${ALL_LESSONS.map(l=>{ const p=S.lessons[l.id]||{}, ok=lessonUnlocked(l)&&p.read; return row(p.activity?'check':ok?'flag':'lock', p.activity?'#47f59a':ok?'#ff9a3d':'#5a6199', esc(l.activity.title), `Lesson ${l.mod.n}.${l.li+1} · ${esc(l.title)}${p.actScore!=null?` · ${p.actScore}%`:''}`, `<button class="btn small ${p.activity?'ghost':''}" data-act="openLesson" data-arg="${l.id}|5" ${ok?'':'disabled'}>${p.activity?'Replay':ok?'Play':'Locked'}</button>`); }).join('')}</section>
    <section><div class="section-title">Lesson quizzes</div>${ALL_LESSONS.map(l=>{ const p=S.lessons[l.id]||{}, ok=p.read&&p.activity; return row(p.quiz?'check':ok?'star':'lock', p.quiz?'#47f59a':ok?'#ffd447':'#5a6199', `Quiz ${l.mod.n}.${l.li+1}`, `${esc(l.title)}${p.quizBest!=null?` · best ${p.quizBest}%`:''}`, `<button class="btn small ${p.quiz?'ghost':''}" data-act="startLessonQuiz" data-arg="${l.id}" ${ok?'':'disabled'}>${p.quiz?'Retake':ok?'Start':'Locked'}</button>`); }).join('')}
      <div class="section-title" style="margin-top:22px">Module assessments</div>${MODULES.map(m=>{ const ok=modLessonsDone(m), mp=S.modules[m.id]; return row(mp&&mp.passed?'check':ok?'trophy':'lock', mp&&mp.passed?'#47f59a':ok?'#ffd447':'#5a6199', `Module ${m.n} assessment`, `${esc(m.title)}${mp&&mp.best!=null?` · best ${mp.best}%`:''}`, `<button class="btn small gold" data-act="startModule" data-arg="${m.id}" ${ok?'':'disabled'}>${mp&&mp.passed?'Retake':ok?'Start':'Locked'}</button>`); }).join('')}</section>
  </div>`;
  bindArcadeHall();
}

/* ---------- Achievements ---------- */
function viewAchievements(el){
  const L = levelInfo();
  el.innerHTML = `<div class="page-head"><div><div class="crumbs">Campus · Achievement Hall</div><h1>Achievement Hall</h1><p>Your XP, rank, badges and learning history.</p></div></div>
  <div class="grid g-wide">
    <section class="panel level-card"><div class="level-num">${L.n}</div><div><div class="label" style="color:var(--gold-ink)">Current rank</div><h2 class="pixel" style="font-size:34px; margin-top:6px">${esc(L.t)}</h2>
      <p class="muted" style="margin-top:6px">${S.xp} XP${L.next?` · ${L.next-S.xp} XP to level ${L.n+1}`:' · Max rank reached'}</p><div class="bar gold" style="margin-top:8px"><i style="width:${Math.round(L.pct*100)}%"></i></div>
      <div class="ladder">${LEVELS.map((x,i)=>`<span class="${i<L.n?'on':''}">${i+1} ${esc(x.t)}</span>`).join('')}</div></div></section>
    <section class="panel"><div class="section-title">How to earn XP</div><div class="history">
      ${[['Complete a lesson',XP.lesson],['Finish an activity',XP.activity],['Perfect activity bonus',XP.perfectActivity],['Pass a lesson quiz',XP.quiz],['Pass a module assessment',XP.module],['Pass the final assessment',XP.final],['Home Base action (each)',XP.health],['Home Base 100% bonus',XP.healthFull],['Career taster mission (each role)',XP.taster],['Campus tour with BYTE',XP.tour],['Ask BYTE / chat in community',XP.mentor]].map(([t,x])=>`<div style="grid-template-columns:1fr auto"><span>${t}</span><span class="x">+${x} XP</span></div>`).join('')}</div></section>
  </div>
  <div class="section-title" style="margin-top:26px">Badges · ${S.badges.length}/${BADGES.length}</div>
  <div class="badge-grid">${BADGES.map(b=>{ const has=S.badges.includes(b.id); return `<div class="badge ${has?'':'locked'}"><div class="medal" style="background:${b.c}">${icon(b.icon,'#05061a',34)}</div><b>${esc(b.t)}</b><small>${esc(b.d)}</small>${has?`<button class="btn ghost small" data-act="shareBadge" data-arg="${b.id}">Share</button>`:''}</div>`; }).join('')}</div>
  <div class="grid g2" style="margin-top:26px">
    <section class="panel"><div class="section-title">Module completion</div>${MODULES.map(m=>{ const p=Math.round(modProgress(m)*100); return `<div style="margin-bottom:12px"><div style="display:flex; justify-content:space-between; font-size:14px"><span>${m.n}. ${esc(m.title)}</span><span class="label muted">${p}%</span></div><div class="bar" style="margin-top:4px"><i style="width:${p}%; background:${m.color}"></i></div></div>`; }).join('')}</section>
    <section class="panel"><div class="section-title">Learning history</div><div class="history">${S.history.length? S.history.slice(0,14).map(h=>`<div><span class="t">${new Date(h.t).toLocaleDateString('en-GB',{day:'2-digit',month:'short'})} ${hhmm(new Date(h.t))}</span><span>${esc(h.txt)}</span><span class="x">${h.xp?'+'+h.xp:''}</span></div>`).join('') : '<p class="muted">Your milestones will appear here.</p>'}</div></section>
  </div>`;
}

/* ---------- Certificate ---------- */
function viewCertificate(el){
  const lessonsDone = ALL_LESSONS.every(l=>lessonDone(l.id)), actsDone = ALL_LESSONS.every(l=>S.lessons[l.id]?.activity);
  const checks = [ ['Complete all 12 lessons', lessonsDone], ['Complete all 12 practice activities', actsDone], ['Pass all 6 module assessments', allModsPassed()], [`Pass the final assessment (${S.passMark}%+)`, finalPassed()] ];
  const ok = checks.every(c=>c[1]);
  const cert = S.cert || { ref:'CYB-XXXX-XXXXXX', date:Date.now() };
  el.innerHTML = `<div class="page-head"><div><div class="crumbs">Campus · Certificate Hall</div><h1>Certificate Hall</h1><p>${ok?'Congratulations! Your Cybersity Certificate of Completion is ready.':'Meet every requirement below to unlock your Cybersity Certificate of Completion.'}</p></div></div>
  <div class="grid g-cert" style="align-items:start">
    <section><div class="section-title">Eligibility</div><div class="checklist">${checks.map(([t,c])=>`<div class="${c?'ok':''}"><span class="box">${c?'✓':''}</span><span>${t}</span></div>`).join('')}</div>
      ${ok?`<div style="display:grid; gap:10px; margin-top:18px"><button class="btn gold" data-act="downloadCert">Download PDF</button><button class="btn ghost" data-act="shareCert">Share in Community</button></div>`:`<button class="btn" style="margin-top:18px; width:100%" data-act="${nextStep().act}" data-arg="${nextStep().arg||''}">Continue learning ▸</button>`}
      <p class="note" style="margin-top:14px">This is an internal Cybersity Certificate of Completion. It is not accredited by, or equivalent to, CompTIA, Cisco, ISC2 or any other external certification body.</p></section>
    <section style="min-width:0"><div class="cert ${ok?'':'preview'}">
      <div class="c-logo">CYBERSITY</div><div class="c-title">Certificate of Completion</div>
      <p style="margin-top:18px">This certifies that</p><div class="c-name">${esc(S.user.name)}</div><div class="c-line"></div>
      <p style="max-width:52ch; margin:0 auto">has successfully completed the <b>Cybersecurity Fundamentals</b> learning pathway, including six modules, practical activities, module assessments and the final assessment.</p>
      <img class="px seal" src="${iconURL('shield','#ffd447','#fffdf4','#1b1d3a','#1b1d3a')}" alt="">
      <div class="c-meta"><div><b>Date issued</b>${ok?fmtDate(cert.date):'—'}</div><div><b>Final score</b>${S.final?.best!=null?S.final.best+'%':'—'}</div><div><b>Certificate ID</b><span style="font-family:var(--f-term); font-size:19px">${ok?cert.ref:'Locked'}</span></div></div>
      ${ok?'':'<div class="stamp"><span>LOCKED</span></div>'}
    </div></section>
  </div>`;
}

/* ---------- Admin preview ---------- */
const ADMIN_LEARNERS = [
  ['Aisyah Rahman','aisyah.r','Module 4',68,'Today'],['Leo Tan','leo.t','Module 2',31,'Today'],['Hana Ismail','hana.i','Certificate',100,'Yesterday'],
  ['Ravi Kumar','ravi.k','Module 5',79,'2 days ago'],['Mei Ling','mei.l','Module 1',12,'Today'],['Danial Hakim','danial.h','Module 3',47,'3 days ago']
];
function viewAdmin(el){
  const reports = S.reports;
  el.innerHTML = `<div class="admin-banner"><span>Administrator view · preview with sample data</span><button class="btn ghost small" data-act="go" data-arg="dashboard">Back to learner view</button></div>
  <div class="page-head"><div><h1>Admin Dashboard</h1><p>Manage learners, content, assessment rules and community moderation.</p></div></div>
  <div class="stats-row">
    <div class="panel stat"><span>Registered learners</span><b>1,248</b></div><div class="panel stat"><span>Active this week</span><b>392</b></div>
    <div class="panel stat"><span>Avg. completion</span><b>46%</b></div><div class="panel stat"><span>Certificates issued</span><b>${87 + (S.cert?1:0)}</b></div>
  </div>
  <div class="grid g2" style="margin-top:20px">
    <section class="panel"><div class="section-title">Module completion (all learners)</div>${MODULES.map((m,i)=>{ const v=[82,64,51,40,29,21][i]; return `<div style="display:grid; grid-template-columns:150px 1fr 44px; gap:10px; align-items:center; margin-bottom:10px; font-size:13.5px"><span>${m.n}. ${esc(m.title.split(' ').slice(0,2).join(' '))}</span><div class="bar"><i style="width:${v}%; background:${m.color}"></i></div><span class="label muted">${v}%</span></div>`; }).join('')}</section>
    <section class="panel"><div class="section-title">Assessment settings</div>
      <label class="label muted" for="passMark">Pass mark for quizzes and assessments: <b style="color:var(--gold-ink)" id="pmVal">${S.passMark}%</b></label>
      <input type="range" class="range" id="passMark" min="50" max="90" step="5" value="${S.passMark}" style="margin-top:10px">
      <p class="note" style="margin-top:8px">This setting is live in the prototype: change it and the learner quizzes use the new pass mark.</p>
      <div class="section-title" style="margin-top:18px">Certificate rules</div>
      <div class="checklist">${['All lessons and activities complete','All module assessments passed','Final assessment passed'].map(t=>`<div class="ok"><span class="box">✓</span>${t}</div>`).join('')}</div></section>
  </div>
  <section class="panel" style="margin-top:20px"><div class="section-title">Learners</div><div class="tbl-wrap"><table class="tbl"><tr><th>Name</th><th>Username</th><th>Current stage</th><th>Progress</th><th>Last active</th><th></th></tr>
    <tr><td><b>${esc(S.user.name)}</b> <span class="pill cyan" style="font-size:9px">You</span></td><td>${esc(S.user.name.toLowerCase())}</td><td>${finalPassed()?'Certificate':'Module '+((MODULES.findIndex(m=>!modPassed(m))+1)||6)}</td><td>${overallProgress()}%</td><td>Now</td><td></td></tr>
    ${ADMIN_LEARNERS.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}%</td><td>${r[4]}</td><td><button class="btn ghost small" data-act="adminNote">View</button></td></tr>`).join('')}</table></div></section>
  <div class="grid g2" style="margin-top:20px">
    <section class="panel"><div class="section-title">Content management</div><div class="tbl-wrap"><table class="tbl" style="min-width:420px"><tr><th>Module</th><th>Lessons</th><th>Questions</th><th></th></tr>
      ${MODULES.map(m=>`<tr><td>${m.n}. ${esc(m.title)}</td><td>${m.lessons.length}</td><td>${m.lessons.length*3+m.extra.length}</td><td><button class="btn ghost small" data-act="adminNote">Edit</button></td></tr>`).join('')}</table></div>
      <button class="btn small" style="margin-top:12px" data-act="adminNote">+ New module</button></section>
    <section class="panel"><div class="section-title">Moderation queue · ${reports.filter(r=>r.status==='open').length} open</div>
      ${reports.length ? reports.map((r,i)=>`<div style="padding:10px 0; border-bottom:1px dashed var(--line-soft)"><div style="display:flex; justify-content:space-between; gap:8px; flex-wrap:wrap"><b style="font-size:14px">${esc(r.user)} · #${esc(r.room)}</b><span class="pill ${r.status==='open'?'red':'green'}" style="font-size:9px">${r.status}</span></div><p style="font-size:13.5px; margin-top:4px">"${esc(r.text)}"</p><p class="muted" style="font-size:12px">Reason: ${esc(r.reason)}</p>
        ${r.status==='open'?`<div style="display:flex; gap:8px; margin-top:6px"><button class="btn ghost small" data-act="modAction" data-arg="${i}|dismissed">Dismiss</button><button class="btn pink small" data-act="modAction" data-arg="${i}|removed">Remove message</button></div>`:''}</div>`).join('') : '<p class="muted">No reports. Report a message in the Community Hub to see it arrive here.</p>'}</section>
  </div>`;
  $('#passMark').addEventListener('input', e=>{ S.passMark = +e.target.value; $('#pmVal').textContent = S.passMark+'%'; save(); });
}

/* ---------- Presenter menu ---------- */
function renderMenu(){
  const host = $('#menuHost'); if (!host) return;
  if (!UI.menu){ host.innerHTML=''; return; }
  host.innerHTML = `<div class="menu" role="menu">
    <span class="label">Profile</span>
    <button class="item" data-act="editAvatar">Edit avatar and name</button>
    <button class="item" data-act="go" data-arg="achievements">My progress</button>
    <button class="item" data-act="tourReplay">Replay campus tour with BYTE</button>
    <hr><span class="label">Presenter shortcuts</span>
    <button class="item" data-act="demoComplete" data-arg="1">Complete Module 1</button>
    <button class="item" data-act="demoComplete" data-arg="2">Complete Modules 1–2 (incident unlocked)</button>
    <button class="item" data-act="demoComplete" data-arg="5">Complete Modules 1–5</button>
    <button class="item" data-act="demoComplete" data-arg="6">Complete all modules (final unlocked)</button>
    <hr><span class="label">Campus incident</span>
    ${incActive() ? `<button class="item" data-act="incNext">Secure next building (${S.incident.secured.length}/${INCIDENT.length})</button><button class="item" data-act="incEnd">End incident</button>`
      : `<button class="item" data-act="incStart">${incUnlocked() ? '⚠ Start "Campus under attack!"' : '🔒 Campus under attack! (after Module 2)'}</button>`}
    <hr>
    <button class="item" data-act="demoHome" data-arg="fill">Home Base: tick every action</button>
    <button class="item" data-act="demoHome" data-arg="clear">Home Base: clear checklist</button>
    <button class="item" data-act="go" data-arg="admin">Switch to admin view</button>
    <hr>
    <button class="item" data-act="resetDemo">Reset demo progress</button>
    <button class="item" data-act="logout">Log out</button>
  </div>`;
}
function demoComplete(n){
  let gained = 0;
  MODULES.slice(0,n).forEach(m=>{ m.lessons.forEach(l=>{ const p=prog(l.id); if(!p.read){p.read=true; gained+=XP.lesson;} if(!p.activity){p.activity=true; p.actScore=100; gained+=XP.activity;} if(!p.quiz){p.quiz=true; p.quizBest=100; gained+=XP.quiz;} p.maxStage=6; });
    const mp=(S.modules[m.id] ||= {}); if(!mp.passed){ mp.passed=true; mp.best=100; gained+=XP.module; } });
  ['firstbyte','module'].forEach(id=>{ if(!S.badges.includes(id)) S.badges.push(id); }); if (n>=3 && !S.badges.includes('halfway')) S.badges.push('halfway');
  S.xp += gained; log(`Presenter shortcut: completed ${n===1?'Module 1':'Modules 1–'+n}`, gained); save();
  UI.menu=false; renderMenu(); updateHUD(); toast(`Shortcut applied: +${gained} XP`); renderView();
}

/* ---------- Actions (event delegation) ---------- */
const ACTIONS = {
  go: a => { UI.menu=false; renderMenu(); go(a); },
  authTab: a => { UI.authTab=a; renderOnboarding(); },
  quickDemo: () => { UI.draftName='Demo Learner'; UI.draftLook=randomLook(); UI.onb='avatar'; UI.editAvatar=false; renderOnboarding(); },
  pressStart: () => { UI.onb='auth'; renderOnboarding(); },
  backToTitle: () => { UI.onb='title'; renderOnboarding('down'); },
  look: a => { const [k,v]=a.split('|'); UI.draftLook = {...UI.draftLook, [k]:v}; rerenderCreator(); },
  randomLook: () => { UI.draftLook = randomLook(); rerenderCreator(); },
  saveAvatar: () => { const name = (UI.draftName||'').trim().slice(0,18) || 'Learner';
    if (UI.editAvatar){ S.user.name=name; S.user.look=UI.draftLook; save(); UI.editAvatar=false; spriteCache.clear(); renderApp(); toast('Profile updated'); return; }
    UI.draftName = name; ACTIONS.enterCampus(); },
  cancelAvatar: () => { UI.editAvatar=false; renderApp(); },
  editAvatar: () => { UI.menu=false; UI.editAvatar=true; UI.draftLook={...S.user.look}; UI.draftName=S.user.name; clearTimers(); if (window.Campus) Campus.stop(); renderMenu(); $('#view').innerHTML = avatarCreatorHTML(); bindAvatarCreator(); },
  enterCampus: () => { S.user = { name:UI.draftName, look:UI.draftLook, joined:Date.now() }; S.view='campus'; save(); renderApp();
    if (Tour.shouldRun()) Tour.start(); else setTimeout(()=>award('hello'), 600); }, // first visit: BYTE's campus tour, which awards the welcome badge at the end
  openModule: a => go('module',{id:a}),
  openLesson: a => { const [id,st]=a.split('|'); const l=lessonById(id); if (!lessonUnlocked(l)){ toast('Finish the previous lesson first.'); return; } UI.lessonId=id; const p=prog(id); let s=+st; if (s===5 && !p.read) s=0; if (s===6 && !(p.read&&p.activity)) s = p.read?5:0; UI.stage=s; go('lesson'); },
  stage: a => { UI.stage=+a; renderView(); window.scrollTo({top:0}); },
  scen: a => { UI.scen[UI.lessonId]=+a; renderView(); },
  completeLesson: a => { const p=prog(a), l=lessonById(a); if (!p.read){ p.read=true; save(); addXP(XP.lesson, `Completed lesson: ${l.title}`); award('firstbyte'); } UI.stage=5; renderView(); window.scrollTo({top:0}); },
  startLessonQuiz: a => { const p=prog(a); if (!(p.read&&p.activity)){ toast('Complete the lesson and activity first.'); return; } startQuiz('lesson', a); },
  startModule: a => { const m=modById(a); if (!modLessonsDone(m)){ toast('Pass every lesson quiz in this module first.'); return; } startQuiz('module', a); },
  startFinal: () => { if (!allModsPassed()){ toast('Pass all six module assessments first.'); return; } startQuiz('final'); },
  answer: a => { const Q=UI.quiz; if (Q.picked!=null) return; Q.picked=+a; Q.ans[Q.idx] = (+a===Q.qs[Q.idx].a); renderView(); },
  nextQ: () => { const Q=UI.quiz; if (Q.idx < Q.qs.length-1){ Q.idx++; Q.picked=null; renderView(); window.scrollTo({top:0}); } else finishQuiz(); },
  retryQuiz: () => { const Q=UI.quiz; startQuiz(Q.kind, Q.id); },
  quitQuiz: () => { const Q=UI.quiz; UI.quiz=null; if (Q && Q.kind==='lesson'){ UI.lessonId=Q.id; UI.stage=6; go('lesson'); } else go('challenge'); },
  toggleMenu: () => { UI.menu=!UI.menu; renderMenu(); },
  toggleTheme: () => { const day = !isDay(); document.documentElement.dataset.theme = day ? 'day' : 'night';
    try { localStorage.setItem(THEME_KEY, day ? 'day' : 'night'); } catch(e){}
    const corner = $('#themeCorner'); if (corner) corner.outerHTML = themeBtnHTML('theme-corner', 'themeCorner');
    if (S.user) renderApp(); toast(day ? '☀ Day mode on' : '🌙 Night mode on'); },
  demoComplete: a => demoComplete(+a),
  resetDemo: () => { UI.menu=false; renderMenu(); showModal(`<h2>Reset demo?</h2><p class="muted">This clears all progress, XP, badges and your avatar so you can start the journey again.</p><div class="actions"><button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn pink" data-act="confirmReset">Reset everything</button></div>`); },
  confirmReset: () => { S = freshState(); save(); UI.onb='title'; UI.scen={}; UI.quiz=null; modalQueue.length=0; $('#layer').innerHTML=''; Mentor.reset(); renderApp(); },
  logout: () => { UI.menu=false; const keep = S; S = freshState(); S.passMark = keep.passMark; save(); UI.onb='title'; modalQueue.length=0; $('#layer').innerHTML=''; renderApp(); toast('Logged out securely'); },
  closeModal: () => closeModal(),
  modalBg: (a, e) => { if (e.target.classList.contains('overlay')) closeModal(); },
  shareBadge: a => { const b=BADGES.find(x=>x.id===a); Community.postShare(`unlocked the <b>${esc(b.t)}</b> badge`, b.icon, b.c); if (modalQueue.length) closeModal(); toast('Shared to the Achievement Wall'); },
  shareCert: () => { Community.postShare('earned the <b>Cybersity Certificate of Completion</b>! 🎓', 'scroll', '#ffd447'); toast('Shared to the Achievement Wall'); },
  downloadCert: () => toast('In the full system, this downloads a PDF generated by the server with your unique certificate ID.'),
  askAbout: a => { const l=lessonById(a); Mentor.openDrawer(); Mentor.ask(`Can you explain "${l.title}" in simple terms?`); },
  toggleDrawer: () => Mentor.toggleDrawer(),
  familyCard: a => { const l=lessonById(a); showModal(`<div class="label" style="color:var(--green-ink)">Teach your family</div><h2 style="margin:6px 0 14px">Share this lesson in 1 minute</h2>${familyCardHTML(l)}<div class="actions"><button class="btn gold" data-act="closeModal">Done</button></div>`); },
  familyCopy: a => { const t = familyText(lessonById(a)); try { navigator.clipboard.writeText(t).then(()=>toast('Copied. Paste it into any chat.'), ()=>toast('Copy is blocked here. Use the WhatsApp button instead.')); } catch(e){ toast('Copy is blocked here. Use the WhatsApp button instead.'); } },
  adminNote: () => toast('Content editing and learner records are part of the full admin system.'),
  modAction: a => { const [i,st]=a.split('|'); S.reports[+i].status=st; if (st==='removed') Community.removeMessage(S.reports[+i].mid); save(); renderView(); toast(st==='removed'?'Message removed from the room':'Report dismissed'); }
};
function rerenderCreator(){
  clearTimers();
  if (UI.editAvatar && S.user){ $('#view').innerHTML = avatarCreatorHTML(); } else { const cur = $('#onbPages .onb-page.cur'); if (cur) cur.innerHTML = onbPageHTML('avatar'); }
  bindAvatarCreator();
}
document.addEventListener('click', e=>{
  const t = e.target.closest('[data-act]');
  if (UI.menu && !e.target.closest('.menu') && !(t && t.dataset.act==='toggleMenu')){ UI.menu=false; renderMenu(); }
  if (!t) return;
  const fn = ACTIONS[t.dataset.act] || (window.EXTRA_ACTIONS && EXTRA_ACTIONS[t.dataset.act]);
  if (fn){ if (t.tagName==='A') e.preventDefault(); fn(t.dataset.arg, e, t); }
});
document.addEventListener('keydown', e=>{ if (e.key==='Enter' && !S.user && UI.onb==='title' && !e.target.closest('input,textarea,button')){ e.preventDefault(); ACTIONS.pressStart(); return; } if (e.key==='Escape'){ if (modalQueue.length) closeModal(); else if (UI.menu){ UI.menu=false; renderMenu(); } else if (UI.drawer) Mentor.toggleDrawer(); } });
