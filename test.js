const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const html = fs.readFileSync(__dirname + '/cybersity.html', 'utf8');
  fs.writeFileSync(__dirname + '/test-page.html', '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>' + html + '</body></html>');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('file://' + __dirname + '/test-page.html');
  const shot = async n => page.screenshot({ path: __dirname + '/shots/' + n + '.png' });
  const click = async sel => { await page.click(sel); await page.waitForTimeout(250); };
  const closeModals = async () => { for (let i=0;i<6;i++){ const b = await page.$('#layer .modal [data-act="closeModal"]'); if (!b) break; await b.click(); await page.waitForTimeout(150); } };
  await page.waitForTimeout(1200); await shot('01-title');
  // title screen: Press Start (Enter) slides up to sign up / log in
  await page.keyboard.press('Enter'); await page.waitForTimeout(350); await shot('01a-slide'); await page.waitForTimeout(700); await shot('01b-auth');
  console.log('title screen -> auth, one page left after slide:', await page.evaluate(()=>[UI.onb, document.querySelectorAll('.onb-page').length]));
  await click('[data-act="quickDemo"]'); await shot('02-avatar');
  await click('[data-act="look"][data-arg="hairStyle|hijab"]');
  await click('[data-act="saveAvatar"]'); await page.waitForTimeout(1500); await shot('03-tour-welcome');
  // first visit: BYTE's campus tour (personal welcome, walk-through, spotlights), then the welcome badges
  console.log('tour starts on first visit / welcome line:', await page.evaluate(()=>[Tour.isOn(), document.querySelector('.tour .sr-only').textContent]));
  for (let k=0; k<80 && await page.evaluate(()=>Tour.isOn()); k++){
    const n = await page.evaluate(()=>+document.querySelector('.tour-count').textContent.split('/')[0]);
    if (n===4 || n===10) await shot('03-tour-step'+n);
    const end = await page.evaluate(()=>document.querySelector('.tour-choices').textContent.includes('explore'));
    if (end){ await shot('03-tour-end'); await page.click('.tour-choices button:nth-child(2)'); break; }
    const more = await page.$('.tour-choices button'); if (more){ await more.click(); await page.waitForTimeout(250); continue; }
    await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  }
  await page.waitForTimeout(800); await shot('04-campus-modal');
  console.log('tour finished / saved / badges:', await page.evaluate(()=>[Tour.isOn(), localStorage.getItem('cybersity-tour-seen'), S.badges.includes('orient') && S.badges.includes('hello')]));
  await closeModals();
  // walk with keyboard
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(500); await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(800); await shot('05-campus');
  // click library building to walk & enter
  // campus page: the map fills the screen under the top bar, no building cards below it
  console.log('campus fills page under top bar / no cards / dock buttons:', await page.evaluate(()=>{ const r = document.querySelector('#campus').getBoundingClientRect(), hud = document.querySelector('.hud').getBoundingClientRect();
    return [Math.round(r.right) === innerWidth && Math.round(r.top) === Math.round(hud.bottom) && Math.round(r.bottom) === innerHeight && Math.round(r.left) === 0, !document.querySelector('.quick-nav'), document.querySelectorAll('.cam-dock .dock-btn').length]; }));
  const lib = await page.evaluate(()=>Campus.tour.rectOf('library'));
  await page.mouse.click(lib.left + lib.width/2, lib.top + lib.height/2);
  await page.waitForFunction(()=>S.view!=="campus", null, {timeout:20000}).catch(()=>{});
  console.log('view after building click:', await page.evaluate(()=>S.view));
  await shot('06-library');
  // Home Base: walk there on the campus, tick real-life actions, watch the dorm upgrade
  await page.evaluate(()=>go('campus')); await page.waitForTimeout(500);
  await click('.cam-dock [data-arg="home"]'); await page.waitForFunction(()=>S.view==="home", null, {timeout:20000}).catch(()=>{});
  console.log('view after walking to Home Base:', await page.evaluate(()=>S.view));
  await shot('06a-home-dark');
  const tick = async id => { await click(`[data-act="healthTick"][data-arg="${id}"]`); await closeModals(); };
  for (const id of ['mfa','update','unique']) await tick(id);
  await shot('06b-home-lights');
  await tick('screen'); await page.waitForTimeout(300); await shot('06c-home-padlock');
  await tick('backup'); await tick('perms');
  await click('[data-act="healthTick"][data-arg="nsrc"]'); await page.waitForTimeout(400); await shot('06d-home-badge'); await closeModals();
  await page.waitForTimeout(1500); await shot('06e-home-shield');
  console.log('home score/stage/badge:', await page.evaluate(()=>[healthScore(), homeStage(), S.badges.includes('homesafe')]));
  const xp0 = await page.evaluate(()=>S.xp); await tick('mfa'); await tick('mfa');
  console.log('XP from re-ticking (expect 0):', (await page.evaluate(()=>S.xp)) - xp0);
  await page.evaluate(()=>go('campus')); await page.waitForTimeout(900); await shot('06f-campus-home-secured');
  await page.evaluate(()=>{ S.health={}; save(); });
  // Career Compass: walk to the plaza signpost, take the quiz, explore a role, play a taster mission
  await page.evaluate(()=>go('campus')); await page.waitForTimeout(500);
  await click('.cam-dock [data-arg="compass"]'); await page.waitForFunction(()=>S.view==="career", null, {timeout:20000}).catch(()=>{});
  console.log('view after walking to signpost:', await page.evaluate(()=>S.view));
  await shot('07a-compass-hub');
  await click('[data-act="cqStart"]'); await shot('07b-compass-quiz');
  for (const want of ['soc','soc','net','soc','ir']){ const k = await page.evaluate(w=>CAREER_QUIZ[UI.cq.i].o.findIndex(o=>o.r===w), want); await click(`[data-act="cqPick"][data-arg="${k}"]`); }
  console.log('career match (expect soc, second ir):', await page.evaluate(()=>[S.career.pick, S.career.second]));
  await shot('07c-compass-result');
  await click('.compass-quiz [data-act="careerOpen"]'); await page.waitForTimeout(200); await shot('07d-role-soc');
  await page.screenshot({ path: __dirname + '/shots/07e-role-soc-full.png', fullPage: true });
  const lessonState = await page.evaluate(()=>JSON.stringify(S.lessons.m5l2||{}));
  await click('[data-act="careerMission"]'); await shot('07f-taster');
  for (const id of ['l3','l4','l5','l7','l9']) await click(`[data-act="actFlag"][data-arg="${id}"]`);
  await click('[data-act="actCheck"]'); await page.waitForTimeout(300); await shot('07g-taster-badge'); await closeModals();
  console.log('taster done / explorer badge / lesson untouched:', await page.evaluate(s=>[S.career.tasters.join(','), S.badges.includes('explorer'), JSON.stringify(S.lessons.m5l2||{})===s], lessonState));
  await click('[data-act="careerOpen"][data-arg="soc"]'); await page.waitForTimeout(200);
  console.log('back on role page:', await page.evaluate(()=>S.params.role && !S.params.mission));
  await page.evaluate(()=>go('campus')); await page.waitForTimeout(900); await shot('07h-campus-signpost');
  await page.evaluate(()=>go('module',{id:'m1'})); await page.waitForTimeout(300); await shot('07-module');
  await click('[data-act="openLesson"][data-arg="m1l1|0"]'); await shot('08-lesson-intro');
  await click('.lesson-nav [data-arg="1"]'); await shot('09-concept');
  await click('.lesson-nav [data-arg="2"]'); await shot('10-visual');
  await click('.lesson-nav [data-arg="3"]'); await click('[data-act="scen"][data-arg="0"]'); await shot('11-scenario');
  await click('.lesson-nav [data-arg="4"]'); await click('[data-act="completeLesson"]'); await closeModals(); await shot('12-activity');
  // sort activity: answer all (some wrong deliberately)
  for (let i=0;i<8;i++){ const ans = await page.evaluate(i=>lessonById('m1l1').activity.items[i].a, i); await click(`[data-act="actSort"][data-arg="${i===2?'asset':ans}"]`); if (i===2) await shot('13-sort-feedback'); await click('[data-act="actNext"]'); }
  await closeModals(); await shot('14-sort-result');
  await click('[data-act="stage"][data-arg="6"]'); await click('[data-act="startLessonQuiz"]');
  for (let i=0;i<3;i++){ const a = await page.evaluate(()=>UI.quiz.qs[UI.quiz.idx].a); await click(`[data-act="answer"][data-arg="${a}"]`); if (i===0) await shot('15-quiz-q'); await click('[data-act="nextQ"]'); }
  await page.waitForTimeout(300); await shot('16-quiz-result-modal'); await closeModals(); await shot('17-quiz-result');
  // "Teach your family" card after a passed lesson quiz, shared via WhatsApp without personal data
  console.log('family card / whatsapp link / no name in link:', await page.evaluate(()=>{ const a=document.querySelector('.fc-actions a'); return [!!document.querySelector('.family-card'), !!a && a.href.startsWith('https://wa.me/?text='), !!a && !decodeURIComponent(a.href).includes(S.user.name)]; }));
  await page.evaluate(()=>document.querySelector('.family').scrollIntoView({block:'center'})); await shot('17b-family-card');
  // presenter shortcut then test each activity type
  await page.evaluate(()=>demoComplete(6)); await page.waitForTimeout(300);
  const openAct = async id => { await page.evaluate(id=>{ UI.lessonId=id; UI.stage=5; go('lesson'); }, id); await page.waitForTimeout(300); };
  await openAct('m2l1'); await page.click('.sel-email [data-arg="sender"]'); await page.click('.sel-email [data-arg="link"]'); await page.click('.sel-email [data-arg="n4"]').catch(()=>{}); await shot('18-phish'); await click('[data-act="actCheck"]'); await closeModals(); await shot('19-phish-check');
  await openAct('m2l2'); await click('[data-act="actLeft"][data-arg="trojan"]'); await click('[data-act="actRight"][data-arg="trojan"]'); await shot('20-match');
  for (const id of ['worm','ransom','spy','virus']){ await click(`[data-act="actLeft"][data-arg="${id}"]`); await click(`[data-act="actRight"][data-arg="${id==='spy'?'virus':id==='virus'?'spy':id}"]`); }
  await click('[data-act="actCheck"]'); await closeModals(); await shot('21-match-check');
  await openAct('m3l2'); await shot('22-router'); await click('[data-act="actSet"][data-arg="pw|1"]'); await click('[data-act="actCheck"]'); await closeModals(); await shot('23-router-check');
  await openAct('m4l1'); await page.fill('#pwIn', 'purple-rambutan-skates-at-noon-42'); await page.waitForTimeout(200); await shot('24-password'); await click('#pwLock'); await closeModals();
  await openAct('m5l2'); await click('[data-act="actFlag"][data-arg="l3"]'); await click('[data-act="actCheck"]'); await closeModals(); await shot('25-logs');
  await openAct('m6l2'); for (const id of ['prep','ident','cont','erad','rec','less']) await click(`[data-act="actPlace"][data-arg="${id}"]`); await click('[data-act="actCheck"]'); await closeModals(); await shot('26-order');
  await page.evaluate(()=>{ UI.lessonId='m5l1'; UI.stage=2; go('lesson'); }); await page.waitForTimeout(500); await shot('27-hash');
  // scam lessons end their recap with a "What to do in real life" box
  await page.evaluate(()=>{ UI.lessonId='m2l1'; UI.stage=4; go('lesson'); }); await page.waitForTimeout(300);
  await page.evaluate(()=>document.querySelector('.reallife').scrollIntoView({block:'center'})); await shot('27r-scam-reallife');
  console.log('real-life box on scam lesson / not on others / call link:', await page.evaluate(()=>{ const on=!!document.querySelector('.reallife'), tel=(document.querySelector('.rl-call')||{}).getAttribute?.('href');
    UI.lessonId='m1l1'; UI.stage=4; go('lesson'); return [on, !document.querySelector('.reallife'), tel]; }));
  // Campus Incident = Virus Escape: alert after Module 2, start from the gear menu, the campus turns red, the runner launches
  console.log('pre-incident alert on campus after Module 2:', await page.evaluate(()=>{ go('campus'); return !!document.querySelector('.inc-banner.warn [data-act="incStart"]'); }));
  await page.waitForTimeout(600); await shot('27-incident-alert-banner');
  await click('[data-act="toggleMenu"]'); await shot('27a-menu-incident');
  await click('.menu [data-act="incStart"]'); await page.waitForTimeout(900); await shot('27b-incident-alert');
  await page.waitForFunction(()=>S.view==="arcade", null, {timeout:8000}).catch(()=>{}); await page.waitForTimeout(400); await shot('27c-virus-intro');
  console.log('incident launches Virus Escape:', await page.evaluate(()=>[S.view, S.params.game, !!S.params.incident]));
  await click('[data-act="arcStart"]');
  // autopilot steers into the right lane and misses question 3 on purpose
  await page.evaluate(()=>{ window.__auto = setInterval(()=>{ if (!ARC || !ARC.game || !ARC.game.state) return; const st = ARC.game.state(); if (st.phase !== 'run' || st.correctLane === null) return;
    const target = ARC.answers.length === 2 ? (st.correctLane === 1 ? 0 : 1) : st.correctLane; if (st.lane < target) ARC.game.input('right'); else if (st.lane > target) ARC.game.input('left'); }, 120); });
  await page.waitForTimeout(5200); await shot('27d-virus-run');
  await page.waitForFunction(()=>ARC.game.state().secured >= 1, null, {timeout:30000}).catch(()=>{}); await page.waitForTimeout(200); await shot('27e-virus-secured');
  await page.waitForFunction(()=>ARC.game.state().phase !== 'run', null, {timeout:120000}).catch(()=>{}); await page.waitForTimeout(600); await shot('27f-virus-saved');
  await page.evaluate(()=>clearInterval(window.__auto)); await page.waitForTimeout(1500); await closeModals(); await shot('27g-virus-results');
  console.log('virus run: answers / 1 mistake shown / incident buildings secured:', await page.evaluate(()=>[ARC.answers.length, document.querySelectorAll('.arc-mistakes > div:not(.label)').length, S.incident.secured.length]));
  await click('[data-act="incCampus"]'); await page.waitForTimeout(1200); await shot('27h-campus-restoring');
  await page.waitForTimeout(4000); await shot('27i-campus-saved'); await page.waitForTimeout(800); await shot('27j-campus-saved-modal'); await closeModals();
  console.log('incident done / defender badge / virus badge / cert relocked:', await page.evaluate(()=>[!!S.incident.done, S.badges.includes('defender'), S.badges.includes('arc_virus'), bLocked('cert')]));
  // mentor
  await page.evaluate(()=>go('mentor')); await page.waitForTimeout(300);
  await page.fill('.mentor-form input', 'what is phishing'); await page.press('.mentor-form input', 'Enter'); await page.waitForTimeout(1700);
  await click('[data-act="mentorSuggest"]:last-child'); await page.waitForTimeout(1700); await closeModals(); await shot('28-mentor');
  // community
  await page.evaluate(()=>go('community')); await page.waitForTimeout(300);
  await page.fill('#commIn', 'hello everyone, stuck on module 4'); await page.press('#commIn','Enter'); await page.waitForTimeout(400); await closeModals();
  await page.fill('#commIn', 'my number is 012-3456789'); await page.press('#commIn','Enter'); await page.waitForTimeout(3600);
  await page.hover('.cmsg >> nth=1'); await click('[data-act="reportMsg"] >> nth=0'); await shot('29-report'); await click('[data-act="submitReport"]'); await shot('30-community');
  // final assessment
  await page.evaluate(()=>startQuiz('final')); await page.waitForTimeout(200);
  for (let i=0;i<12;i++){ const a = await page.evaluate(()=>UI.quiz.qs[UI.quiz.idx].a); await click(`[data-act="answer"][data-arg="${a}"]`); await click('[data-act="nextQ"]'); }
  await page.waitForTimeout(400); await closeModals();
  await page.evaluate(()=>go('certificate')); await page.waitForTimeout(400); await shot('31-certificate');
  await page.evaluate(()=>go('achievements')); await page.waitForTimeout(300); await shot('32-achievements');
  await page.evaluate(()=>go('admin')); await page.waitForTimeout(300); await shot('33-admin');
  await page.evaluate(()=>go('dashboard')); await page.waitForTimeout(500); await shot('34-dashboard');
  await page.evaluate(()=>go('challenge')); await page.waitForTimeout(300); await shot('35-challenge');
  // Cyber Arcade hall: one cabinet per game, availability, sample leaderboard, practice/assessments still below
  console.log('arcade hall: machines / leaderboard / practice kept:', await page.evaluate(()=>[document.querySelectorAll('.machine').length, !!document.querySelector('.lb-list li'), !!document.querySelector('.boss') && document.querySelectorAll('.ch-row').length > 20]));
  await page.evaluate(()=>document.querySelector('.arcade-hall').scrollIntoView()); await page.waitForTimeout(700); await shot('35a-arcade-hall');
  // Rocket Firewall: autopilot flies into the right tunnel, misses gate 2 on purpose
  await page.evaluate(()=>{ UI.arcDiff='hard'; go('arcade',{game:'rocket'}); }); await page.waitForTimeout(400); await click('[data-act="arcStart"]');
  await page.evaluate(()=>{ window.__rk = setInterval(()=>{ if (!ARC || !ARC.game || !ARC.game.state) return; const st = ARC.game.state(); if (st.phase !== 'fly' || st.correctLane === null) return;
    const target = ARC.answers.length === 1 ? (st.correctLane + 1) % 3 : st.correctLane; if (st.lane < target) ARC.game.input('down'); else if (st.lane > target) ARC.game.input('up'); }, 120); });
  await page.waitForFunction(()=>ARC.game.state().phase !== 'fly', null, {timeout:150000}).catch(()=>{}); await page.evaluate(()=>clearInterval(window.__rk));
  await page.waitForTimeout(1800); await closeModals(); await shot('35e-rocket-results');
  console.log('rocket: won / answers / 1 mistake / badge:', await page.evaluate(()=>[ARC.won, ARC.answers.length, document.querySelectorAll('.arc-mistakes > div:not(.label)').length, S.badges.includes('arc_rocket')]));
  await page.evaluate(()=>{ UI.arcDiff='normal'; Arcade.resetScores(); go('challenge'); });
  // Packet Drop: autopilot moves each block over the right bin and drops it, misses packet 2 on purpose
  await page.evaluate(()=>{ go('arcade',{game:'packet'}); }); await page.waitForTimeout(400); await click('[data-act="arcStart"]');
  await page.evaluate(()=>{ window.__pk = setInterval(()=>{ if (!ARC || !ARC.game || !ARC.game.state) return; const st = ARC.game.state(); if (st.phase !== 'play' || st.correctCol === null) return;
    const target = ARC.answers.length === 1 ? (st.correctCol + 1) % (st.correctCol === 0 ? 2 : 1) : st.correctCol; if (st.col < target) ARC.game.input('right'); else if (st.col > target) ARC.game.input('left'); else ARC.game.input('down'); }, 120); });
  await page.waitForFunction(()=>ARC.game.state().phase !== 'play', null, {timeout:150000}).catch(()=>{}); await page.evaluate(()=>clearInterval(window.__pk));
  await page.waitForTimeout(1800); await closeModals(); await shot('35f-packet-results');
  console.log('packet: won / answers / 1 mistake / badge:', await page.evaluate(()=>[ARC.won, ARC.answers.length, document.querySelectorAll('.arc-mistakes > div:not(.label)').length, S.badges.includes('arc_packet')]));
  await page.evaluate(()=>{ Arcade.resetScores(); go('challenge'); });
  // framework check with a tiny test-only game (the real games register themselves in later steps)
  await page.evaluate(()=>{ ARCADE_GAMES.push({id:'testgame', t:'Test Game', color:'#2ee6ff', diff:'Easy', badge:'none', desc:'Test only.', how:'Test only.'}); Arcade.register('testgame', { controls:['up','down'], size:[320,200], create(api){ const qs = api.questions(4); let i = 0; api.prompt(qs[0].q, 'Question 1 of 4');
    return { update(){}, draw(g){ g.fillStyle='#10153b'; g.fillRect(0,0,api.W,api.H); g.fillStyle='#2ee6ff'; g.fillRect(20+i*60, 90, 40, 20); },
      input(d){ const q = qs[i], ok = d === 'up'; api.answer(ok, { q:q.q, chosen: ok ? q.correct : q.options.find(o=>o!==q.correct), correct:q.correct, e:q.e }); if (ok) api.addScore(100); else api.loseLife(); i++; if (i >= qs.length) api.end(true, 'Test run complete.'); else api.prompt(qs[i].q, 'Question '+(i+1)+' of 4'); } }; } }); go('challenge'); });
  await page.waitForTimeout(400); await click('[data-act="arcPlay"][data-arg="testgame"]'); await page.waitForTimeout(300); await shot('35b-arcade-intro');
  await click('[data-act="arcDiff"][data-arg="hard"]'); await click('[data-act="arcStart"]'); await page.waitForTimeout(300); await shot('35c-arcade-play');
  const xpBefore = await page.evaluate(()=>S.xp);
  for (const k of ['ArrowUp','ArrowDown','w','ArrowUp']){ await page.keyboard.press(k); await page.waitForTimeout(150); }
  await page.waitForTimeout(1800); await closeModals(); await shot('35d-arcade-results');
  console.log('arcade results: accuracy / mistakes listed / high score saved / XP gained / on leaderboard:', await page.evaluate(x=>[document.querySelector('.arc-stats').textContent.includes('75%'), document.querySelectorAll('.arc-mistakes > div:not(.label)').length, Arcade.scores().testgame.best, S.xp - x, Arcade.leaderboard('testgame').some(r=>r.me)], xpBefore));
  await page.evaluate(()=>{ delete Arcade.games.testgame; ARCADE_GAMES.pop(); Arcade.resetScores(); });
  // building-themed headers: every building page gets its colour and a pixel banner
  for (const v of ['library','mentor','community','home','career']){ await page.evaluate(v=>go(v), v); await page.waitForTimeout(300); await shot('35-theme-'+v); }
  console.log('themed headers:', await page.evaluate(()=>Object.keys(VIEW_BUILDING).map(v=>{ go(v); const h=document.querySelector('.page-head'); return v+':'+(h.classList.contains('bhead')&&!!h.querySelector('.bbanner')); }).join(' ')));
  await page.evaluate(()=>go('campus')); await page.waitForTimeout(900); await shot('36-campus-unlocked');
  await page.click('#fab',{force:true}); await page.waitForTimeout(200); await page.waitForTimeout(300); await shot('37-drawer');
  // mobile
  await page.evaluate(()=>{ if (UI.drawer) Mentor.toggleDrawer(); }); await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(200);
  await page.evaluate(()=>go('dashboard')); await page.waitForTimeout(400); await shot('38-m-dashboard');
  await page.evaluate(()=>go('campus')); await page.waitForTimeout(700); await shot('39-m-campus');
  // phone camera: zoomed view that follows the avatar, taps still walk to the right place, full-map toggle
  console.log('phone campus fills screen / camera zoomed in:', await page.evaluate(()=>{ const c=document.querySelector('#campus'), r=c.getBoundingClientRect(); return [Math.round(r.width)===innerWidth && Math.round(r.bottom)===innerHeight - 66, c.width/3 < 480]; }));
  const cb = await (await page.$('#campus')).boundingBox();
  await page.mouse.click(cb.x + cb.width*0.5, cb.y + cb.height*0.85); await page.waitForTimeout(1600); await shot('39b-m-campus-walk');
  await click('.cam-dock [data-arg="compass"]'); await page.waitForFunction(()=>S.view==="career", null, {timeout:25000}).catch(()=>{});
  console.log('phone: walked to signpost and entered:', await page.evaluate(()=>S.view));
  await page.evaluate(()=>go('campus')); await page.waitForTimeout(900); await shot('39c-m-campus-follow');
  await click('#camToggle'); await page.waitForTimeout(300); await shot('39d-m-campus-fullmap');
  console.log('full map toggle shows the whole map:', await page.evaluate(()=>{ const c=document.querySelector('#campus'); return c.width/3 >= 480 && c.height/3 >= 400; }));
  await click('#camToggle'); await page.waitForTimeout(200);
  // full-screen campus: fills the window, survives a building visit, F toggles it
  await click('#fsToggle'); await page.waitForTimeout(600); await shot('39e-m-campus-fullscreen');
  console.log('phone full screen fills window:', await page.evaluate(()=>{ const r=document.querySelector('#campus').getBoundingClientRect(); return document.querySelector('#campusShell').classList.contains('fs') && Math.round(r.width)===innerWidth && Math.round(r.height)===innerHeight; }));
  await page.setViewportSize({ width: 1360, height: 900 }); await page.waitForTimeout(400); await shot('39f-campus-fullscreen');
  await page.evaluate(()=>EXTRA_ACTIONS.campusGo('home')); await page.waitForFunction(()=>S.view==="home", null, {timeout:25000}).catch(()=>{});
  await page.evaluate(()=>go('campus')); await page.waitForTimeout(500);
  console.log('full screen kept after visiting a building / desktop fills window:', await page.evaluate(()=>{ const r=document.querySelector('#campus').getBoundingClientRect(); return [UI.campusFS, Math.round(r.width)===innerWidth && Math.round(r.height)===innerHeight]; }));
  await page.keyboard.press('f'); await page.waitForTimeout(300);
  console.log('F exits full screen:', await page.evaluate(()=>!UI.campusFS && !document.querySelector('#campusShell').classList.contains('fs')));
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(300);
  await page.evaluate(()=>{ UI.lessonId='m2l1'; UI.stage=2; go('lesson'); }); await page.waitForTimeout(300); await shot('40-m-lesson');
  await page.evaluate(()=>go('challenge')); await page.waitForTimeout(500); await page.screenshot({ path: __dirname + '/shots/40f-m-arcade-hall.png', fullPage: true });
  console.log('mobile arcade hall scrollWidth', await page.evaluate(()=>document.documentElement.scrollWidth));
  await page.evaluate(()=>go('library')); await page.waitForTimeout(300); await shot('40b-m-library-theme');
  await page.evaluate(()=>go('mentor')); await page.waitForTimeout(300); await shot('40c-m-ailab-theme');
  await page.evaluate(()=>{ UI.lessonId='m2l1'; UI.stage=4; go('lesson'); }); await page.waitForTimeout(300);
  await page.screenshot({ path: __dirname + '/shots/40d-m-scam-reallife.png', fullPage: true });
  await page.evaluate(()=>{ UI.lessonId='m4l2'; UI.stage=6; go('lesson'); }); await page.waitForTimeout(300);
  await click('[data-act="familyCard"]'); await page.waitForTimeout(200); await shot('40e-m-family-modal'); await closeModals();
  const ow = await page.evaluate(()=>document.documentElement.scrollWidth); console.log('mobile scrollWidth', ow);
  await page.evaluate(()=>{ HEALTH_CHECKS.slice(0,5).forEach(c=>S.health[c.id]=true); go('home'); }); await page.waitForTimeout(400);
  await page.screenshot({ path: __dirname + '/shots/41-m-home.png', fullPage: true });
  console.log('mobile home scrollWidth', await page.evaluate(()=>document.documentElement.scrollWidth));
  await page.evaluate(()=>go('dashboard')); await page.waitForTimeout(400);
  await page.screenshot({ path: __dirname + '/shots/42-m-dashboard-full.png', fullPage: true });
  await page.evaluate(()=>go('career')); await page.waitForTimeout(300);
  await page.screenshot({ path: __dirname + '/shots/43-m-compass.png', fullPage: true });
  await page.evaluate(()=>go('career',{role:'grc'})); await page.waitForTimeout(300);
  await page.screenshot({ path: __dirname + '/shots/44-m-role.png', fullPage: true });
  console.log('mobile role scrollWidth', await page.evaluate(()=>document.documentElement.scrollWidth));
  await page.evaluate(()=>{ incStart(); S.incident.secured=['library','ailab']; save(); renderView(); }); await page.waitForTimeout(3200);
  await page.screenshot({ path: __dirname + '/shots/45-m-incident-campus.png', fullPage: true });
  await page.evaluate(()=>EXTRA_ACTIONS.incPlay()); await page.waitForTimeout(400); await click('[data-act="arcStart"]'); await page.waitForTimeout(5000); await click('.arc-btn[data-arc-dir="left"]');
  await page.screenshot({ path: __dirname + '/shots/46-m-virus-escape.png', fullPage: true });
  console.log('mobile incident scrollWidth', await page.evaluate(()=>document.documentElement.scrollWidth));
  await page.evaluate(()=>EXTRA_ACTIONS.incEnd());
  // Day mode: sun/moon toggle in the top bar, remembered on this device, campus and pages repainted
  await page.evaluate(()=>go('campus')); await page.waitForTimeout(500);
  await click('.hud [data-act="toggleTheme"]'); await page.waitForTimeout(800); await shot('47-m-day-campus');
  await page.evaluate(()=>go('home')); await page.waitForTimeout(400); await page.screenshot({ path: __dirname + '/shots/48-m-day-home.png', fullPage: true });
  await page.setViewportSize({ width: 1360, height: 900 });
  for (const v of ['dashboard','campus','library','community']){ await page.evaluate(v=>go(v), v); await page.waitForTimeout(700); await shot('49-day-'+v); }
  await page.evaluate(()=>{ UI.lessonId='m2l1'; UI.stage=4; go('lesson'); }); await page.waitForTimeout(300); await shot('49-day-lesson');
  console.log('day mode on / saved / day canvas palette:', await page.evaluate(()=>[document.documentElement.dataset.theme, localStorage.getItem('cybersity-theme'), pal()===PAL_DAY]));
  await page.reload(); await page.waitForTimeout(800);
  console.log('day mode survives reload:', await page.evaluate(()=>document.documentElement.dataset.theme));
  await click('.hud [data-act="toggleTheme"]'); await page.waitForTimeout(300);
  console.log('back to night:', await page.evaluate(()=>document.documentElement.dataset.theme + '/' + localStorage.getItem('cybersity-theme')));
  // returning learner is not forced through the tour; skip (Escape) and replay from the gear menu
  await page.evaluate(()=>ACTIONS.logout()); await page.waitForTimeout(400); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  await click('[data-act="quickDemo"]'); await click('[data-act="saveAvatar"]'); await page.waitForTimeout(1500);
  console.log('returning learner sees tour (expect false):', await page.evaluate(()=>Tour.isOn())); await closeModals();
  await click('.hud [data-act="toggleMenu"]'); await click('[data-act="tourReplay"]'); await page.waitForTimeout(1200);
  console.log('replay from menu starts:', await page.evaluate(()=>Tour.isOn()));
  await page.keyboard.press('Escape'); await page.waitForTimeout(200); await shot('50-tour-skip-confirm'); await page.click('.tour-choices button:nth-child(2)'); await page.waitForTimeout(400);
  console.log('skip ends tour:', await page.evaluate(()=>!Tour.isOn() && !document.querySelector('.tour'))); await closeModals();
  console.log('ERRORS:', errs.length ? errs.join('\n') : 'none');
  await browser.close();
})();
