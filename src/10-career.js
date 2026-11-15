/* ============================================================
   CAREER COMPASS — role quiz, role pages, taster missions, roadmaps
   ============================================================ */
const careerById = id => CAREERS.find(c=>c.id===id);
const careerMedal = (c, size=56) => `<div class="cmedal" style="width:${size}px;height:${size}px;background:${c.c}; flex:none">${icon(c.icon,'#05061a',Math.round(size*0.55))}</div>`;

function viewCareer(el){
  const P = S.params||{}, c = careerById(P.role);
  if (c && P.mission) careerMission(el, c);
  else if (c) careerRole(el, c);
  else careerHub(el);
}

function careerHub(el){
  const C = S.career, top = careerById(C.pick), second = careerById(C.second);
  el.innerHTML = `<div class="page-head"><div><div class="crumbs"><button data-act="go" data-arg="campus">Virtual Campus</button><span>›</span><span>Career Compass</span></div><h1>Career Compass</h1><p>Cybersecurity has many different jobs. Take a 5-question quiz to find the role that fits you, try a taster mission from that job, and see the roadmap from Cybersity to your first job.</p></div>${C.tasters.length?`<span class="pill gold">${C.tasters.length}/${CAREERS.length} taster missions done</span>`:''}</div>
  <section class="monitor compass-quiz">${UI.cq ? careerQuizCard() : top ? careerResultCard(top, second) : careerIntroCard()}</section>
  <div class="section-title" style="margin-top:30px">Five cyber roles to explore</div>
  <div class="role-grid">${CAREERS.map(c=>{ const done=C.tasters.includes(c.id); return `<button class="role-card" data-act="careerOpen" data-arg="${c.id}" style="--rc:${c.c}">
    ${careerMedal(c,48)}<b>${esc(c.t)}</b><small>${esc(c.tag)}</small>
    <span class="role-pills">${C.pick===c.id?'<span class="pill gold">Top match</span>':C.second===c.id?'<span class="pill purple">Also fits</span>':''}${done?'<span class="pill green">Taster done</span>':''}</span></button>`; }).join('')}</div>`;
}
function careerIntroCard(){
  return `<div class="kicker">Which role fits me?</div><h2 style="margin:8px 0 8px">Find your cyber role</h2>
    <p class="lesson-body" style="font-size:15.5px">Five quick questions about what you enjoy. There are no wrong answers, and you can retake it any time.</p>
    <div style="margin-top:18px"><button class="btn gold" data-act="cqStart">Start the quiz ▸</button></div>`;
}
function careerQuizCard(){
  const Q = UI.cq, q = CAREER_QUIZ[Q.i];
  return `<div class="kicker">Question ${Q.i+1} of ${CAREER_QUIZ.length}</div>
    <div class="progress-dots" style="margin-top:10px">${CAREER_QUIZ.map((_,i)=>`<i class="${i<Q.i?'ok':i===Q.i?'cur':''}"></i>`).join('')}</div>
    <h2 style="margin:12px 0 4px">${esc(q.q)}</h2>
    <div class="choices">${Q.order[Q.i].map(k=>`<button class="choice" data-act="cqPick" data-arg="${k}">${esc(q.o[k].t)}</button>`).join('')}</div>`;
}
function careerResultCard(top, second){
  return `<div class="kicker">Your best match</div>
    <div class="compass-result">${careerMedal(top,84)}<div style="min-width:0"><h2 style="margin:4px 0 4px">${esc(top.t)}</h2><p style="color:var(--ink-2); font-weight:600">${esc(top.tag)}</p>
      <p class="lesson-body" style="font-size:15px; margin-top:6px">${esc(top.fit)}${second?` Also a good fit: <b>${esc(second.t)}</b>.`:''}</p></div></div>
    <div style="margin-top:18px; display:flex; gap:10px; flex-wrap:wrap"><button class="btn gold" data-act="careerOpen" data-arg="${top.id}">Explore ${esc(top.t)} ▸</button><button class="btn ghost" data-act="cqStart">Retake quiz</button></div>`;
}

function careerRole(el, c){
  const done = S.career.tasters.includes(c.id), L = lessonById(c.mission.lesson);
  el.innerHTML = `<div class="page-head role-head" style="--rc:${c.c}"><div style="display:flex; gap:16px; align-items:center; min-width:0">${careerMedal(c,64)}<div style="min-width:0"><div class="crumbs"><button data-act="careerHub">Career Compass</button><span>›</span><span>${esc(c.t)}</span></div><h1>${esc(c.t)}</h1><p style="margin-top:4px">${esc(c.tag)}</p></div></div>${S.career.pick===c.id?'<span class="pill gold">Your top match</span>':''}</div>
  <div class="grid g-wide">
    <section class="monitor" style="margin-top:8px"><div class="kicker">The job in plain words</div><h2 style="margin:8px 0 10px">What does a ${esc(c.t)} do?</h2>
      <p class="lesson-body">${esc(c.what)}</p>
      <div class="label" style="color:#4a5180; margin-top:18px">A day might include</div>
      <ul class="recap-list lesson-body">${c.day.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>
      <div class="fit-box"><b>Sounds like you?</b> ${esc(c.fit)}</div></section>
    <section class="panel taster" style="--rc:${c.c}">
      <div class="label" style="color:var(--gold-ink)">Taster mission</div>
      <h2 class="pixel" style="font-size:30px; margin:10px 0">${esc(L.activity.title)}</h2>
      <p>${esc(c.mission.brief)}</p>
      <p class="muted" style="font-size:13px; margin-top:10px">About 3 minutes. The same game as Lesson ${L.mod.n}.${L.li+1}, played as a stand-alone taster, so it does not change your lesson progress.</p>
      <div style="margin-top:16px; display:flex; gap:10px; align-items:center; flex-wrap:wrap"><button class="btn gold" data-act="careerMission" data-arg="${c.id}">${done?'Play again':'Start taster mission'} ▸</button>${done?'<span class="pill green">Completed</span>':`<span class="label muted">+${XP.taster} XP</span>`}</div>
    </section>
  </div>
  <section class="panel" style="margin-top:24px"><div class="section-title">Roadmap: from Cybersity to ${esc(c.road.job)}</div>
    <ol class="roadmap" style="--rc:${c.c}">${ROADMAP_STEPS.map((s,i)=>{ const d = s.k==='basics' ? `Cybersity Fundamentals, especially ${c.road.basics}.` : s.k==='next' ? `${c.road.next}. Your taster mission is a first step.` : c.road[s.k];
      return `<li class="rm ${s.cover}"><span class="rm-n">${s.cover==='full'?icon('check','#05061a',16):i+1}</span><div class="rm-body"><span class="rm-tag">${s.cover==='full'?'Covered by Cybersity':s.cover==='part'?'Started in Cybersity':'Your next level'}</span><b>${esc(s.t)}</b><span>${esc(d)}</span></div></li>`; }).join('')}</ol>
    <p class="muted" style="font-size:12.5px; margin-top:16px">Platforms and certificates are examples to research, not endorsements. Check current requirements and costs before you sign up.</p>
  </section>
  <div class="other-roles"><span class="label muted">Other roles</span>${CAREERS.filter(x=>x!==c).map(x=>`<button class="btn ghost small" data-act="careerOpen" data-arg="${x.id}">${esc(x.t)}</button>`).join('')}</div>`;
}

function careerMission(el, c){
  const L = lessonById(c.mission.lesson);
  el.innerHTML = `<div class="page-head role-head" style="--rc:${c.c}"><div style="min-width:0"><div class="crumbs"><button data-act="careerHub">Career Compass</button><span>›</span><button data-act="careerOpen" data-arg="${c.id}">${esc(c.t)}</button><span>›</span><span>Taster mission</span></div><h1>Taster mission</h1><p>${esc(c.mission.brief)}</p></div><span class="pill gold">${esc(c.t)}</span></div>
  <section class="monitor"><div id="actHost"></div></section>`;
  Activities.mount(L, $('#actHost'), { onDone: () => careerTasterDone(c), nextAct:'careerOpen', nextArg:c.id, nextLabel:`Back to ${c.t}` });
}
function careerTasterDone(c){
  if (!S.career.tasters.includes(c.id)){ S.career.tasters.push(c.id); save(); addXP(XP.taster, `Taster mission: ${c.t}`); }
  award('explorer');
}

window.EXTRA_ACTIONS = Object.assign(window.EXTRA_ACTIONS||{}, {
  careerHub: () => go('career'),
  careerOpen: id => go('career', {role:id}),
  careerMission: id => go('career', {role:id, mission:true}),
  cqStart: () => { UI.cq = { i:0, picks:[], order:CAREER_QUIZ.map(q=>shuffle(q.o.map((_,k)=>k))) }; renderView(); },
  cqPick: k => { const Q = UI.cq; if (!Q) return; Q.picks.push(CAREER_QUIZ[Q.i].o[+k].r); Q.i++;
    if (Q.i >= CAREER_QUIZ.length){
      // most picks wins; on a tie, the role chosen most recently wins
      const rank = CAREERS.map(c=>({id:c.id, n:Q.picks.filter(r=>r===c.id).length, last:Q.picks.lastIndexOf(c.id)})).sort((a,b)=>b.n-a.n || b.last-a.last);
      S.career.pick = rank[0].id; S.career.second = rank[1].n ? rank[1].id : null; UI.cq = null; save();
      log(`Career Compass match: ${careerById(S.career.pick).t}`); toast(`Your best match: ${esc(careerById(S.career.pick).t)}`);
    }
    renderView(); }
});
