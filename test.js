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
  await page.waitForTimeout(800); await shot('01-auth');
  await click('[data-act="quickDemo"]'); await shot('02-avatar');
  await click('[data-act="look"][data-arg="hairStyle|hijab"]');
  await click('[data-act="saveAvatar"]'); await shot('03-brief');
  await click('[data-act="enterCampus"]'); await page.waitForTimeout(1500); await shot('04-campus-modal'); await closeModals();
  // walk with keyboard
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(500); await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(800); await shot('05-campus');
  // click library building to walk & enter
  const box = await (await page.$('#campus')).boundingBox();
  await page.mouse.click(box.x + box.width * (5.5/30), box.y + box.height * (4/25));
  await page.waitForFunction(()=>S.view!=="campus", null, {timeout:20000}).catch(()=>{});
  console.log('view after building click:', await page.evaluate(()=>S.view));
  await shot('06-library');
  // Home Base: walk there on the campus, tick real-life actions, watch the dorm upgrade
  await page.evaluate(()=>go('campus')); await page.waitForTimeout(500);
  await click('.quick-nav [data-arg="home"]'); await page.waitForFunction(()=>S.view==="home", null, {timeout:20000}).catch(()=>{});
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
  await click('.quick-nav [data-arg="compass"]'); await page.waitForFunction(()=>S.view==="career", null, {timeout:20000}).catch(()=>{});
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
  // Campus Incident: start from the gear menu, play three challenges for real, fast-forward the rest
  const toCampus = async () => { await page.waitForFunction(()=>S.view==="campus", null, {timeout:6000}).catch(()=>{}); await page.waitForTimeout(700); };
  await click('[data-act="toggleMenu"]'); await shot('27a-menu-incident');
  await click('[data-act="incStart"]'); await page.waitForTimeout(600); await shot('27b-incident-alert');
  await page.waitForTimeout(2700); await shot('27c-incident-campus');
  await click('.inc-chip[data-arg="library"]'); await shot('27d-incident-library');
  for (const id of await page.evaluate(()=>lessonById('m2l1').activity.targets)) await page.click(`.sel-email [data-arg="${id}"]`).catch(()=>{});
  await click('[data-act="actCheck"]'); await closeModals(); await toCampus(); await shot('27e-library-restoring');
  await click('.inc-chip[data-arg="ailab"]'); await page.fill('#pwIn', 'violet-durian-kites-at-dawn-7'); await page.waitForTimeout(200); await shot('27f-incident-ailab'); await click('#pwLock'); await closeModals(); await toCampus();
  await click('.inc-chip[data-arg="community"]'); await shot('27g-incident-community');
  for (let i=0;i<6;i++){ const a = await page.evaluate(i=>FAKE_ADMIN.activity.items[i].a, i); await click(`[data-act="actSort"][data-arg="${a}"]`); await click('[data-act="actNext"]'); }
  await closeModals(); await toCampus();
  console.log('secured after 3 real challenges:', await page.evaluate(()=>S.incident.secured.join(',')));
  await click('[data-act="toggleMenu"]'); await click('[data-act="incNext"]'); await page.waitForTimeout(450); await shot('27h-incident-fastforward');
  await page.waitForTimeout(2300); await page.evaluate(()=>EXTRA_ACTIONS.incNext()); await page.waitForTimeout(2700); await page.evaluate(()=>EXTRA_ACTIONS.incNext());
  await page.waitForTimeout(3300); await shot('27i-campus-saved');
  await page.waitForTimeout(2600); await shot('27j-campus-saved-modal'); await closeModals();
  console.log('incident done / defender badge / cert relocked:', await page.evaluate(()=>[!!S.incident.done, S.badges.includes('defender'), bLocked('cert')]));
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
  // building-themed headers: every building page gets its colour and a pixel banner
  for (const v of ['library','mentor','community','home','career']){ await page.evaluate(v=>go(v), v); await page.waitForTimeout(300); await shot('35-theme-'+v); }
  console.log('themed headers:', await page.evaluate(()=>Object.keys(VIEW_BUILDING).map(v=>{ go(v); const h=document.querySelector('.page-head'); return v+':'+(h.classList.contains('bhead')&&!!h.querySelector('.bbanner')); }).join(' ')));
  await page.evaluate(()=>go('campus')); await page.waitForTimeout(900); await shot('36-campus-unlocked');
  await page.click('#fab',{force:true}); await page.waitForTimeout(200); await page.waitForTimeout(300); await shot('37-drawer');
  // mobile
  await page.setViewportSize({ width: 390, height: 844 }); await page.click('#fab',{force:true}); await page.waitForTimeout(200);
  await page.evaluate(()=>go('dashboard')); await page.waitForTimeout(400); await shot('38-m-dashboard');
  await page.evaluate(()=>go('campus')); await page.waitForTimeout(700); await shot('39-m-campus');
  await page.evaluate(()=>{ UI.lessonId='m2l1'; UI.stage=2; go('lesson'); }); await page.waitForTimeout(300); await shot('40-m-lesson');
  await page.evaluate(()=>go('library')); await page.waitForTimeout(300); await shot('40b-m-library-theme');
  await page.evaluate(()=>go('mentor')); await page.waitForTimeout(300); await shot('40c-m-ailab-theme');
  await page.evaluate(()=>{ UI.lessonId='m2l1'; UI.stage=4; go('lesson'); }); await page.waitForTimeout(300);
  await page.screenshot({ path: __dirname + '/shots/40d-m-scam-reallife.png', fullPage: true });
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
  await click('.inc-chip[data-arg="cert"]'); await page.waitForTimeout(300);
  await page.screenshot({ path: __dirname + '/shots/46-m-incident-cert.png', fullPage: true });
  console.log('mobile incident scrollWidth', await page.evaluate(()=>document.documentElement.scrollWidth));
  await page.evaluate(()=>EXTRA_ACTIONS.incEnd());
  console.log('ERRORS:', errs.length ? errs.join('\n') : 'none');
  await browser.close();
})();
