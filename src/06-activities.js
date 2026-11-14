/* ============================================================
   INTERACTIVE ACTIVITY ENGINES — sort, select, match, toggle, password, order
   ============================================================ */
const Activities = (() => {
  let L, host, st, O = {};  // O: standalone options {onDone(score), nextAct, nextArg, nextLabel} for games played outside a lesson
  const head = a => `<div class="act-head"><span class="pill purple">Practice activity</span><span class="label" style="color:#4a5180">Not graded · instant feedback</span></div><h2 style="margin:6px 0 6px">${esc(a.title)}</h2><p class="lesson-body" style="margin-bottom:6px">${esc(a.intro)}</p>`;

  function complete(score, badge){
    if (O.onDone){ if (badge) award(badge); O.onDone(score); return; }
    const p = prog(L.id), first = !p.activity;
    p.activity = true; p.actScore = Math.max(p.actScore||0, score); save();
    if (first){ addXP(XP.activity, `Activity complete: ${L.activity.title}`); if (score===100) addXP(XP.perfectActivity, 'Perfect activity bonus'); }
    if (badge) award(badge);
    const sb = document.querySelectorAll('.stepper button');
    if (sb[5]) sb[5].classList.add('done');
    if (sb[6]){ sb[6].disabled = false; sb[6].innerHTML = `<span class="dot">7</span>Lesson quiz`; }
    const nb = document.querySelector('.lesson-nav button[data-arg="6"]'); if (nb) nb.disabled = false;
  }
  const resultBox = (score, msg, retry) => `<div class="act-result"><div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap"><div class="score-ring" style="width:84px;height:84px;font-size:16px;margin:0;background:${score>=70?'#c9f7de':'#fff1b8'}">${score}%</div>
    <div style="flex:1; min-width:200px"><b style="font-size:17px">${score===100?'Perfect run!':score>=70?'Activity complete':'Activity complete. Worth another try?'}</b><p style="margin-top:4px; color:var(--ink-2)">${msg}</p></div>
    <div style="display:flex; gap:8px; flex-wrap:wrap">${retry?`<button class="btn ghost small" data-act="actRetry">Try again</button>`:''}${O.onDone ? `<button class="btn small" data-act="${O.nextAct}" data-arg="${O.nextArg||''}">${esc(O.nextLabel)} ▸</button>` : `<button class="btn small" data-act="stage" data-arg="6">Continue to quiz ▸</button>`}</div></div></div>`;

  /* ---- SORT ---- */
  function sort(){
    const a = L.activity, it = a.items[st.i];
    if (st.i >= a.items.length){
      const sc = Math.round(st.res.filter(Boolean).length/a.items.length*100);
      host.innerHTML = head(a) + `<div class="progress-dots">${st.res.map(r=>`<i class="${r?'ok':'bad'}"></i>`).join('')}</div>` + resultBox(sc, `You sorted ${st.res.filter(Boolean).length} of ${a.items.length} cards correctly.`, sc<100);
      if (!st.done){ st.done=true; complete(sc); } return;
    }
    const ans = st.ans;
    host.innerHTML = head(a) + `<div class="progress-dots">${a.items.map((_,i)=>`<i class="${i<st.i?(st.res[i]?'ok':'bad'):i===st.i?'cur':''}"></i>`).join('')}</div>
      <div class="sort-card">${esc(it.t)}</div>
      <div class="buckets">${a.buckets.map(b=>`<button class="bucket ${b.c}" data-act="actSort" data-arg="${b.id}" ${ans?'disabled':''} style="${ans? (b.id===it.a?'outline:4px solid #0b7a43':'opacity:'+(b.id===ans?1:.5)) : ''}">${esc(b.t)}<small>${esc(b.d)}</small></button>`).join('')}</div>
      ${ans?`<div class="feedback ${ans===it.a?'ok':'bad'}"><b>${ans===it.a?'Correct!':'Not quite.'}</b> ${esc(it.fb)}</div><div class="lesson-nav" style="margin-top:12px"><span></span><button class="btn" data-act="actNext">${st.i<a.items.length-1?'Next card ▸':'Finish ▸'}</button></div>`:''}`;
  }

  /* ---- SELECT (email / logs) ---- */
  function select(){
    const a = L.activity;
    if (a.variant==='email'){
      const span = (s, k) => { if (s.x===1) return esc(s.t).replace(/\n/g,'<br>'); const id = s.id || ('n'+k); let cls='hot';
        if (st.checked){ const isT = !!s.id && a.targets.includes(s.id); if (st.flags[id] && isT) cls+=' okflag'; else if (st.flags[id]) cls+=' flag'; else if (isT) cls+=' miss'; }
        else if (st.flags[id]) cls+=' flag';
        return `<span class="${cls}" data-act="actFlag" data-arg="${id}" role="button" tabindex="0">${esc(s.t)}</span>`; };
      let k=0; const E = a.email;
      host.innerHTML = head(a) + `<div class="email-mock sel-email"><div class="eh"><div>${E.from.map(s=>span(s,k++)).join('')}</div><div>${E.subject.map(s=>span(s,k++)).join('')}</div></div><div class="eb">${E.body.map(s=>span(s,k++)).join('')}</div></div>
        <p class="note" style="color:var(--ink-2); margin-top:8px">Flagged: ${Object.values(st.flags).filter(Boolean).length}</p>` + (st.checked ? selectFeedback() : `<div class="lesson-nav" style="margin-top:12px"><span></span><button class="btn" data-act="actCheck">Check my answers</button></div>`);
    } else {
      host.innerHTML = head(a) + `<div class="log-lines">${a.lines.map(ln=>{ let cls='log-line'; if (st.checked){ if (st.flags[ln.id]&&ln.bad) cls+=' okflag'; else if (st.flags[ln.id]) cls+=' flag'; else if (ln.bad) cls+=' miss'; } else if (st.flags[ln.id]) cls+=' flag';
        return `<button class="${cls}" data-act="actFlag" data-arg="${ln.id}" ${st.checked?'disabled':''}><span>${ln.time}</span><span>${esc(ln.t)}</span></button>`; }).join('')}</div>` + (st.checked ? selectFeedback() : `<div class="lesson-nav" style="margin-top:12px"><span class="note" style="color:var(--ink-2)">Flagged: ${Object.values(st.flags).filter(Boolean).length}</span><button class="btn" data-act="actCheck">Check my answers</button></div>`);
    }
  }
  function selectEval(){
    const a = L.activity; let targets, info;
    if (a.variant==='email'){ const all=[...a.email.from,...a.email.subject,...a.email.body]; info={}; all.forEach((s,k)=>{ if (s.x!==1) info[s.id||('n'+k)] = s; }); targets=a.targets; }
    else { info={}; a.lines.forEach(l=>info[l.id]=l); targets=a.lines.filter(l=>l.bad).map(l=>l.id); }
    const found = targets.filter(t=>st.flags[t]), missed = targets.filter(t=>!st.flags[t]);
    const fp = Object.keys(st.flags).filter(id=>st.flags[id] && !targets.includes(id));
    return {targets, found, missed, fp, info};
  }
  function selectFeedback(){
    const a = L.activity, R = selectEval();
    const sc = Math.max(0, Math.round((R.found.length - R.fp.length)/R.targets.length*100));
    const items = [...R.found.map(id=>`<li>✓ <b>Found:</b> ${esc(R.info[id].fb)}</li>`), ...R.missed.map(id=>`<li>✗ <b>Missed:</b> ${esc(R.info[id].fb)}</li>`), ...R.fp.map(id=>`<li>• <b>Looks normal:</b> ${esc(R.info[id].fb)}</li>`)];
    return `<div class="act-result" style="margin-top:14px"><ul style="margin:0; padding-left:4px; list-style:none; display:grid; gap:6px; font-size:14px">${items.join('')}</ul></div>` + resultBox(sc, `You found ${R.found.length} of ${R.targets.length} warning signs${R.fp.length?` and flagged ${R.fp.length} normal item${R.fp.length>1?'s':''}`:''}.`, sc<100);
  }

  /* ---- MATCH ---- */
  function match(){
    const a = L.activity, letters='ABCDE';
    const rightIdx = id => st.order.indexOf(id);
    host.innerHTML = head(a) + `<div class="match-cols">
      <div class="col"><div class="label" style="color:#4a5180">Situation</div>${a.left.map(it=>{ const pr = st.pairs[it.id]; let cls='mitem'; if (st.sel===it.id) cls+=' sel'; if (st.checked) cls += pr===it.id?' right':' wrong';
        return `<button class="${cls}" data-act="actLeft" data-arg="${it.id}" ${st.checked?'disabled':''}><span class="tag">${pr?letters[rightIdx(pr)]:'?'}</span>${esc(it.t)}</button>`; }).join('')}</div>
      <div class="col"><div class="label" style="color:#4a5180">Answer</div>${st.order.map((id,i)=>{ const r=a.right.find(x=>x.id===id), used=Object.values(st.pairs).includes(id);
        return `<button class="mitem" data-act="actRight" data-arg="${id}" ${st.checked?'disabled':''} style="${used?'background:var(--paper-2)':''}"><span class="tag" style="background:${used?'#5b45c9':'var(--paper-2)'}; color:${used?'#fff':'inherit'}">${letters[i]}</span>${esc(r.t)}</button>`; }).join('')}</div></div>
      ${st.checked ? (()=>{ const ok=a.left.filter(it=>st.pairs[it.id]===it.id).length, sc=Math.round(ok/a.left.length*100);
          return `<div class="act-result" style="margin-top:14px; font-size:14px">${a.left.filter(it=>st.pairs[it.id]!==it.id).map(it=>`<div>✗ "${esc(it.t)}" → <b>${esc(a.right.find(r=>r.id===it.id).t)}</b></div>`).join('') || 'Every pair is correct.'}</div>` + resultBox(sc, `${ok} of ${a.left.length} pairs matched correctly.`, sc<100); })()
        : `<div class="lesson-nav" style="margin-top:12px"><span class="note" style="color:var(--ink-2)">${st.sel?'Now choose an answer on the right.':'Choose a situation on the left.'}</span><button class="btn" data-act="actCheck" ${Object.keys(st.pairs).length===a.left.length?'':'disabled'}>Check matches</button></div>`}`;
  }

  /* ---- TOGGLE (router) ---- */
  function toggle(){
    const a = L.activity, good = a.settings.filter(s=>st.ch[s.id]===s.good).length;
    host.innerHTML = head(a) + `<div class="router"><div class="rhead"><span>⌂ HomeRouter AX-200 · Admin panel</span>${st.checked?`<span class="pill ${good===a.settings.length?'green':'gold'}">Security level ${good}/${a.settings.length}</span>`:'<span class="pill">Unsaved changes</span>'}</div>
      ${a.settings.map(s=>{ const c=st.ch[s.id]; return `<div class="setting ${st.checked?(c===s.good?'good':'badset'):''}"><div><b style="font-weight:600">${esc(s.t)}</b><small>${esc(s.d)}</small>${st.checked?`<small style="color:${c===s.good?'var(--green)':'#ffb0b8'}; margin-top:4px">${c===s.good?'✓':'✗'} ${esc(s.fb[c])}</small>`:''}</div>
        <div class="seg">${s.opts.map((o,i)=>`<button class="${c===i?'on':''}" data-act="actSet" data-arg="${s.id}|${i}">${esc(o)}</button>`).join('')}</div></div>`; }).join('')}</div>
      ${st.checked ? resultBox(Math.round(good/a.settings.length*100), good===a.settings.length ? 'Your network is locked down.' : 'Change the red settings and press Check again to improve your score.', false) + `<div class="lesson-nav" style="margin-top:10px"><span></span><button class="btn ghost small" data-act="actCheck">Check again</button></div>`
        : `<div class="lesson-nav" style="margin-top:12px"><span></span><button class="btn" data-act="actCheck">Save & check</button></div>`}`;
  }

  /* ---- PASSWORD ---- */
  const COMMON = ['password','123456','12345678','qwerty','abc123','iloveyou','admin','welcome','letmein','monkey','dragon','111111','sunshine','p@ssw0rd','password1','malaysia'];
  function pwScore(pw){
    const name = (S.user?.name||'').toLowerCase().replace(/\s+/g,'');
    const low = pw.toLowerCase();
    const checks = {
      len12: pw.length>=12, len16: pw.length>=16,
      mix: [/[a-z]/,/[A-Z]/,/\d/,/[^A-Za-z0-9]/].filter(r=>r.test(pw)).length>=3,
      words: pw.split(/[\s\-_.]+/).filter(w=>w.length>=3).length>=3,
      notCommon: pw.length>0 && !COMMON.some(c=>low.includes(c)),
      noName: pw.length>0 && !(name.length>=3 && low.includes(name)),
      noSeq: pw.length>0 && !/(0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf|(.)\2\2)/i.test(pw)
    };
    let s = 0; if (pw.length>=8) s++; if (checks.len12) s++; if (checks.len16) s++; if (checks.mix) s++; if (checks.words) s++;
    if (!checks.notCommon) s = Math.min(s,1); if (!checks.noName) s = Math.max(0,s-2); if (!checks.noSeq) s = Math.max(0,s-1);
    let pool = 0; if (/[a-z]/.test(pw)) pool+=26; if (/[A-Z]/.test(pw)) pool+=26; if (/\d/.test(pw)) pool+=10; if (/[^A-Za-z0-9]/.test(pw)) pool+=32;
    let secs = Math.pow(Math.max(pool,1), pw.length) / 1e10; if (s<=1) secs = Math.min(secs, 1);
    const time = secs<1?'instantly':secs<3600?'minutes':secs<86400*30?'days':secs<3.15e7*100?'years':secs<3.15e7*1e6?'centuries':'millions of years';
    return { s: Math.min(5,s), checks, time };
  }
  function password(){
    const a = L.activity;
    host.innerHTML = head(a) + `<label class="label" for="pwIn" style="color:#4a5180">Your test password</label><input id="pwIn" class="pw-input" type="text" autocomplete="off" spellcheck="false" placeholder="try: rambutan-rocket-umbrella-42" value="${esc(st.pw||'')}">
      <div class="meter" id="pwMeter">${[0,1,2,3,4].map(()=>'<i></i>').join('')}</div>
      <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-top:8px"><b id="pwLabel">Start typing…</b><span style="color:var(--ink-2)">Estimated crack time: <b id="pwTime">–</b></span></div>
      <ul class="checks" id="pwChecks"></ul>
      <div class="lesson-nav" style="margin-top:14px"><span class="note" style="color:var(--ink-2)">Reach "Strong" to complete the challenge.</span><button class="btn green" id="pwLock" data-act="actPwLock" disabled>Lock it in</button></div><div id="pwRes"></div>`;
    const inp = $('#pwIn'); const upd = ()=>{ st.pw = inp.value; const r = pwScore(inp.value);
      const labels = ['Very weak','Weak','Fair','Good','Strong','Excellent'], colors=['#ff5d6e','#ff5d6e','#ff9a3d','#ffd447','#2fc77a','#2fc77a'];
      document.querySelectorAll('#pwMeter i').forEach((el,i)=> el.style.background = i < r.s ? colors[r.s] : '');
      $('#pwLabel').textContent = inp.value ? labels[r.s] : 'Start typing…'; $('#pwLabel').style.color = inp.value? (r.s>=4?'#0b7a43':r.s>=2?'#9a6a00':'#b3203a') : '';
      $('#pwTime').textContent = inp.value ? r.time : '–';
      const c = r.checks; $('#pwChecks').innerHTML = [['At least 12 characters',c.len12],['16+ characters (bonus)',c.len16],['Mix of letters, numbers or symbols',c.mix],['3+ separate words (passphrase)',c.words],['Not a common password',c.notCommon],['Doesn\'t contain your name',c.noName],['No simple sequences (1234, aaa)',c.noSeq]].map(([t,ok])=>`<li class="${ok?'ok':''}">${t}</li>`).join('');
      $('#pwLock').disabled = r.s < 4; st.score = r.s; };
    inp.addEventListener('input', upd); upd(); if (!st.pw) inp.focus({preventScroll:true});
  }

  /* ---- ORDER ---- */
  function order(){
    const a = L.activity, placed = st.placed, pool = st.pool.filter(id=>!placed.includes(id));
    const stepT = id => a.steps.find(s=>s.id===id).t;
    host.innerHTML = head(a) + `<div class="order-slots">${a.steps.map((_,i)=>{ const id=placed[i]; let cls='slot'; if (id) cls+=' filled'; if (st.checked) cls += (id===a.steps[i].id)?' right':' wrong';
        return `<div class="${cls}" ${id&&!st.checked?`data-act="actUnplace" data-arg="${i}" role="button" tabindex="0" style="cursor:pointer"`:''}>${id?esc(stepT(id)):'<span style="color:var(--ink-2)">Click a step below…</span>'}</div>`; }).join('')}</div>
      <div class="pool">${pool.map(id=>`<button class="mitem" data-act="actPlace" data-arg="${id}">${esc(stepT(id))}</button>`).join('')}</div>
      ${st.checked ? (()=>{ const ok = a.steps.filter((s,i)=>placed[i]===s.id).length, sc=Math.round(ok/a.steps.length*100); return resultBox(sc, ok===a.steps.length?'Textbook incident response.':`${ok} of ${a.steps.length} steps in the right place. Correct order: Prepare → Identify → Contain → Eradicate → Recover → Lessons learned.`, sc<100); })()
        : `<div class="lesson-nav" style="margin-top:12px"><button class="btn ghost small" data-act="actOrderReset">Clear</button><button class="btn" data-act="actCheck" ${placed.length===a.steps.length?'':'disabled'}>Check order</button></div>`}`;
  }

  const ENGINES = { sort, select, match, toggle, password, order };
  function init(){
    const a = L.activity;
    st = { i:0, res:[], ans:null, flags:{}, checked:false, done:false, pairs:{}, sel:null, order:shuffle(a.right?a.right.map(r=>r.id):[]), ch:{}, pw:'', placed:[], pool:shuffle(a.steps?a.steps.map(s=>s.id):[]) };
    if (a.type==='toggle') a.settings.forEach(s=> st.ch[s.id] = s.good===0 ? 1 : 0);
  }
  function draw(){ ENGINES[L.activity.type](); }
  function mount(lesson, el, opts={}){ L = lesson; host = el; O = opts; init(); draw(); }

  window.EXTRA_ACTIONS = Object.assign(window.EXTRA_ACTIONS||{}, {
    actSort: b => { st.ans = b; st.res[st.i] = (b === L.activity.items[st.i].a); draw(); },
    actNext: () => { st.i++; st.ans = null; draw(); },
    actRetry: () => { init(); draw(); },
    actFlag: id => { if (st.checked) return; st.flags[id] = !st.flags[id]; draw(); },
    actLeft: id => { st.sel = id; draw(); },
    actRight: id => { if (!st.sel) { toast('Pick a situation on the left first.'); return; } Object.keys(st.pairs).forEach(k=>{ if (st.pairs[k]===id) delete st.pairs[k]; }); st.pairs[st.sel] = id;
      const next = L.activity.left.find(it=>!st.pairs[it.id]); st.sel = next ? next.id : null; draw(); },
    actSet: a => { const [id,i] = a.split('|'); st.ch[id] = +i; if (st.checked) st.checked = false; draw(); },
    actPlace: id => { st.placed.push(id); draw(); },
    actUnplace: i => { st.placed.splice(+i,1); draw(); },
    actOrderReset: () => { st.placed = []; draw(); },
    actPwLock: () => { const r = pwScore(st.pw); if (r.s<4) return; $('#pwRes').innerHTML = resultBox(r.s===5?100:85, r.s===5?'Excellent: long, unique and hard to guess.':'Strong. Add more words or length to reach Excellent.', false); complete(r.s===5?100:85, r.s===5?'pass':null); },
    actCheck: () => {
      const a = L.activity; st.checked = true; draw();
      if (a.type==='select'){ const R = selectEval(); const sc = Math.max(0, Math.round((R.found.length - R.fp.length)/R.targets.length*100));
        const perfect = R.missed.length===0 && R.fp.length===0; complete(sc, perfect ? (a.variant==='email'?'phish':'detective') : null); }
      if (a.type==='match'){ const ok=a.left.filter(it=>st.pairs[it.id]===it.id).length; complete(Math.round(ok/a.left.length*100)); }
      if (a.type==='toggle'){ const good=a.settings.filter(s=>st.ch[s.id]===s.good).length; complete(Math.round(good/a.settings.length*100), good===a.settings.length?'netguard':null); }
      if (a.type==='order'){ const ok=a.steps.filter((s,i)=>st.placed[i]===s.id).length; complete(Math.round(ok/a.steps.length*100)); }
    }
  });
  document.addEventListener('keydown', e=>{ if ((e.key==='Enter'||e.key===' ') && e.target.matches('span.hot,[data-act="actUnplace"]')){ e.preventDefault(); e.target.click(); } });
  return { mount };
})();
