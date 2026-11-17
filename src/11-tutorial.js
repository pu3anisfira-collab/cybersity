/* ============================================================
   CAMPUS TOUR — BYTE's RPG-style orientation for new learners
   ============================================================
   The first time a learner reaches the campus, BYTE beams in next to them and walks the campus building by
   building. A dialogue box at the bottom types out BYTE's lines; a spotlight dims everything except the building
   or control being explained. Skip any time; replay from the gear menu or the AI Lab. Who has seen the tour is
   remembered per learner name on this device (separately from progress, which log out clears). */
const TOUR_KEY = 'cybersity-tour-seen', TOUR_SOUND_KEY = 'cybersity-tour-sound';
const TOUR_STEPS = [
  {face:'happy', wave:true, spot:'player', say:'Hello and welcome to Cybersity, {name}!'},
  {face:'excited', spot:'player', say:"I'm BYTE, your AI mentor and campus guide. Let me show you around. It only takes a minute!"},
  {face:'normal', spot:'player', say:"That's you! Walk with the arrow keys or WASD, or tap anywhere to move. Step onto a glowing doorway to go inside."},
  {walk:'library', face:'excited', spot:'library', say:'This is the Cyber Library, where your adventure begins: six modules of short lessons, each with a hands-on game and a quick quiz.',
    more:'Lessons unlock one after another. Pass a lesson quiz to open the next lesson, and pass a module assessment to open the next module.'},
  {walk:'ailab', face:'wink', spot:'ailab', say:'The AI Lab is my home! Stuck on something? Ask me to explain it another way, give you an example or quiz you.'},
  {face:'happy', spot:'#fab', say:"You can also call me from anywhere with this purple button. I'll pop up right beside your lesson."},
  {walk:'community', face:'happy', spot:'community', say:'The Community Hub is where learners chat and help each other. Be kind, and never share personal details like your phone number or passwords.'},
  {walk:'challenge', face:'excited', spot:'challenge', say:'The Challenge Centre keeps every game, quiz and assessment in one place. The final boss lives here too!'},
  {walk:'achieve', face:'happy', spot:'achieve', say:'Every lesson, game and quiz earns XP. Level up and collect badges in the Achievement Hall.'},
  {face:'wink', spot:'.hud .player-chip', say:'Your level and XP are always shown up here.'},
  {walk:'home', face:'think', spot:'home', say:'Home Base is your dorm. Do real safety actions on your own phone, like turning on 2FA, and watch your dorm upgrade!'},
  {walk:'compass', face:'excited', spot:'compass', say:'Wondering what cyber jobs are out there? The Career Compass matches you with a role and lets you try a taster mission.'},
  {walk:'cert', face:'wink', spot:'cert', say:'And the Certificate Hall... is locked for now. Finish all six modules and the final assessment to earn your certificate.'},
  {face:'happy', spot:'#nav', say:'In a hurry? The top bar takes you straight to any building.',
    more:'Use the sun and moon button to switch between Day and Night, and the gear menu for your profile. You can replay this tour from there too.'},
  {walk:'player', face:'happy', wave:true, spot:'player', say:"That's the grand tour, {name}! Ready for your first lesson?",
    end:[{t:'Take me to the Library!', go:'library'}, {t:"I'll explore on my own"}]}
];

const Tour = (() => {
  let on = false, i = 0, token = 0, layer = null, typer = null, full = '', mode = 'say', raf = null, portraitT = null, sound = false, audio = null;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seenMap = () => { try { return JSON.parse(localStorage.getItem(TOUR_KEY)) || {}; } catch(e){ return {}; } };
  const nameKey = () => (S.user && S.user.name || '').trim().toLowerCase();
  function markSeen(status){ const m = seenMap(); m[nameKey()] = status; try { localStorage.setItem(TOUR_KEY, JSON.stringify(m)); } catch(e){} }
  const shouldRun = () => !!(S.user && !seenMap()[nameKey()]);
  const fill = s => s.replace(/\{name\}/g, S.user ? S.user.name : 'friend');
  const $t = sel => layer.querySelector(sel);

  // 8-bit "blip" while BYTE talks (off by default, remembered per device)
  try { sound = localStorage.getItem(TOUR_SOUND_KEY) === 'on'; } catch(e){}
  function blip(){ if (!sound) return; try { audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain(); o.type = 'square'; o.frequency.value = 480 + Math.random()*120;
    g.gain.setValueAtTime(0.035, audio.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.05);
    o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + 0.05); } catch(e){} }

  function build(){
    layer = document.createElement('div'); layer.className = 'tour'; layer.id = 'tour';
    layer.innerHTML = `<div class="tour-dim"></div><div class="tour-spot hidden"></div><div class="tour-arrow hidden" aria-hidden="true">▼</div>
      <section class="tour-box" role="dialog" aria-modal="true" aria-label="Campus tour with BYTE">
        <div class="tour-tools"><span class="tour-count"></span>
          <button class="tour-tool" data-tour="sound" aria-pressed="${sound}" title="Sound effects">${sound ? '♪ On' : '♪ Off'}</button>
          <button class="tour-tool" data-tour="skip">Skip tour ✕</button></div>
        <div class="tour-portrait"><canvas width="14" height="16" class="px" aria-hidden="true"></canvas></div>
        <div class="tour-main"><div class="tour-name">BYTE <span>Campus guide</span></div>
          <p class="tour-text" aria-hidden="true"></p><p class="sr-only" aria-live="polite"></p>
          <div class="tour-choices"></div><div class="tour-next hidden" aria-hidden="true">▼</div></div>
      </section>`;
    document.body.appendChild(layer);
    layer.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey, true);
    // portrait: BYTE blinks, waves and moves its mouth while talking
    let f = 0; portraitT = setInterval(()=>{ f++; const st = TOUR_STEPS[i] || {}, c = $t('.tour-portrait canvas'); if (!c) return;
      const talking = !!typer, expr = (f%23===0) ? 'blink' : (talking && f%2 ? 'normal' : (st.face||'happy'));
      const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.clearRect(0,0,14,16); x.drawImage(botFace(expr, f, mode==='say' && !!st.wave), 0, 0); }, 140);
    raf = requestAnimationFrame(trackSpot);
  }

  // Spotlight follows its target every frame (buildings move with the campus camera)
  function targetRect(){
    const st = TOUR_STEPS[i]; if (!st || mode==='walk' || !st.spot) return null;
    if (st.spot==='player' || Campus.buildings.some(b=>b.id===st.spot)) return Campus.tour.rectOf(st.spot);
    const el = document.querySelector(st.spot); return el ? el.getBoundingClientRect() : null;
  }
  let cur = null; // spotlight box, eased towards its target each frame so it glides between stops and keeps up with the camera
  function trackSpot(){
    if (!on) return; const r = targetRect(), spot = $t('.tour-spot'), arrow = $t('.tour-arrow'), box = $t('.tour-box');
    if (r && r.width){ const pad = 6, k = reduced() ? 1 : 0.3;
      if (!cur || spot.classList.contains('hidden')) cur = { l:r.left, t:r.top, w:r.width, h:r.height };
      else { cur.l += (r.left-cur.l)*k; cur.t += (r.top-cur.t)*k; cur.w += (r.width-cur.w)*k; cur.h += (r.height-cur.h)*k; }
      spot.classList.remove('hidden'); arrow.classList.remove('hidden'); layer.classList.add('has-spot');
      Object.assign(spot.style, { left:(cur.l-pad)+'px', top:(cur.t-pad)+'px', width:(cur.w+pad*2)+'px', height:(cur.h+pad*2)+'px' });
      const below = r.top < 90; arrow.classList.toggle('up', below);
      Object.assign(arrow.style, { left:(r.left+r.width/2)+'px', top:(below ? r.top+r.height+pad+4 : r.top-pad-30)+'px' });
      box.classList.toggle('top', r.top + r.height/2 > innerHeight*0.55);
    } else { spot.classList.add('hidden'); arrow.classList.add('hidden'); layer.classList.remove('has-spot'); box.classList.remove('top'); }
    raf = requestAnimationFrame(trackSpot);
  }
  // Scroll the page so a building being explained isn't hidden behind the dialogue box
  function ensureVisible(){
    const r = targetRect(); if (!r) return; const st = TOUR_STEPS[i]; if (typeof st.spot==='string' && st.spot[0] !== '#' && st.spot[0] !== '.' ){
      const box = $t('.tour-box').getBoundingClientRect(), topLimit = 80, bottomLimit = innerHeight - box.height - 30;
      if (r.top < topLimit || r.top + r.height > bottomLimit) window.scrollBy({ top: r.top - (topLimit + Math.max(0, (bottomLimit - topLimit - r.height)/2)), behavior: reduced() ? 'auto' : 'smooth' }); }
  }

  function say(text, after){
    clearInterval(typer); typer = null; full = text; mode = 'say';
    const out = $t('.tour-text'); $t('.sr-only').textContent = text; $t('.tour-choices').innerHTML = ''; $t('.tour-next').classList.add('hidden');
    const done = () => { clearInterval(typer); typer = null; out.textContent = full; after(); };
    if (reduced()){ done(); return; }
    let n = 0; out.textContent = '';
    typer = setInterval(()=>{ n++; out.textContent = full.slice(0, n); if (n%2 && full[n-1] !== ' ') blip(); if (n >= full.length) done(); }, 24);
  }
  const showNext = () => $t('.tour-next').classList.remove('hidden');
  function choices(list){ $t('.tour-choices').innerHTML = list.map((c,k)=>`<button class="btn small ${k ? 'ghost' : 'gold'}" data-tour="choice" data-arg="${k}">${esc(c.t)}</button>`).join('');
    const first = $t('.tour-choices button'); if (first) first.focus({preventScroll:true}); }

  async function runStep(){
    const st = TOUR_STEPS[i], my = ++token;
    $t('.tour-count').textContent = `${i+1}/${TOUR_STEPS.length}`;
    if (st.walk){ mode = 'walk'; Campus.tour.focus(st.walk); Campus.tour.set({ expr:'normal', wave:false });
      clearInterval(typer); typer = null; $t('.tour-text').textContent = '…'; $t('.tour-choices').innerHTML = ''; $t('.tour-next').classList.add('hidden');
      await Campus.tour.walk(st.walk); if (!on || my !== token) return; }
    if (!st.walk || st.walk === 'player') Campus.tour.focus(st.spot === 'player' ? null : st.spot);
    Campus.tour.set({ expr: st.face, wave: !!st.wave });
    mode = 'say'; setTimeout(ensureVisible, 60);
    say(fill(st.say), () => {
      if (st.end){ mode = 'end'; choices(st.end); }
      else if (st.more){ mode = 'more'; choices([{t:'Tell me more'}, {t:'Got it!'}]); }
      else showNext();
    });
  }
  function next(){ i++; if (i >= TOUR_STEPS.length) finish('done'); else runStep(); }
  function advance(){
    if (mode === 'walk'){ Campus.tour.arrive(); return; }
    if (typer){ clearInterval(typer); typer = null; $t('.tour-text').textContent = full; const st = TOUR_STEPS[i];
      if (mode === 'say' && full === fill(st.say)){ if (st.end){ mode='end'; choices(st.end); } else if (st.more){ mode='more'; choices([{t:'Tell me more'}, {t:'Got it!'}]); } else showNext(); }
      else showNext(); return; }
    if (mode === 'say' || mode === 'extra') next();
  }
  function pick(k){
    const st = TOUR_STEPS[i];
    if (mode === 'confirm'){ if (k === 1) finish('skipped'); else { mode = 'say'; $t('.tour-text').textContent = full; resumeAfterConfirm(); } return; }
    if (mode === 'more'){ if (k === 0){ mode = 'extra'; say(st.more, showNext); mode = 'extra'; } else next(); return; }
    if (mode === 'end') finish('done', st.end[k].go);
  }
  let resumeAfterConfirm = () => {};
  function askSkip(){
    if (mode === 'confirm') return; const prev = { mode, text: $t('.tour-text').textContent, choicesHTML: $t('.tour-choices').innerHTML, next: !$t('.tour-next').classList.contains('hidden') };
    clearInterval(typer); typer = null; Campus.tour.set({ expr:'think', wave:false }); mode = 'confirm';
    $t('.tour-text').textContent = 'Skip the tour? You can replay it any time from the ⚙ menu.'; $t('.tour-next').classList.add('hidden');
    choices([{t:'Keep going'}, {t:'Skip tour'}]);
    resumeAfterConfirm = () => { const st = TOUR_STEPS[i]; Campus.tour.set({ expr: st.face, wave: !!st.wave });
      if (prev.mode === 'walk'){ token++; runStep(); return; }
      mode = prev.mode; $t('.tour-text').textContent = full; $t('.tour-choices').innerHTML = prev.choicesHTML;
      if (!prev.choicesHTML) showNext(); };
  }

  function onClick(e){
    const b = e.target.closest('[data-tour]'); if (b){ e.stopPropagation();
      const a = b.dataset.tour;
      if (a === 'skip') askSkip();
      else if (a === 'sound'){ sound = !sound; try { localStorage.setItem(TOUR_SOUND_KEY, sound ? 'on' : 'off'); } catch(err){} b.setAttribute('aria-pressed', sound); b.textContent = sound ? '♪ On' : '♪ Off'; if (sound) blip(); }
      else if (a === 'choice') pick(+b.dataset.arg);
      return; }
    if (mode !== 'more' && mode !== 'end' && mode !== 'confirm') advance();
  }
  function onKey(e){
    if (!on) return; if (e.key === 'Tab') return;
    if (e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); if (mode === 'confirm') pick(0); else askSkip(); return; }
    if (e.target.closest && e.target.closest('.tour button') && (e.key === 'Enter' || e.key === ' ')){ e.stopPropagation(); return; } // let the focused button click
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); e.stopPropagation(); if (mode !== 'more' && mode !== 'end' && mode !== 'confirm') advance(); return; }
    e.stopPropagation(); if (e.key.startsWith('Arrow')) e.preventDefault(); // keep the campus still while BYTE talks
  }

  function start(){
    if (on || !S.user) return;
    UI.menu = false; renderMenu(); if (UI.drawer) Mentor.toggleDrawer(); if (UI.campusFS) EXTRA_ACTIONS.campusFS();
    if (S.view !== 'campus') go('campus');
    const begin = () => { if (!Campus.tour.active()){ setTimeout(begin, 80); return; }
      on = true; i = 0; token++; build(); Campus.tour.zoom(true); Campus.tour.show(); Campus.tour.focus(null); runStep(); };
    setTimeout(begin, 120);
  }
  function finish(status, goTo){
    on = false; token++; clearInterval(typer); typer = null; clearInterval(portraitT); cancelAnimationFrame(raf);
    document.removeEventListener('keydown', onKey, true); if (layer) layer.remove(); layer = null;
    Campus.tour.hide(); markSeen(status);
    if (status === 'done'){ if (!S.badges.includes('orient')){ addXP(XP.tour, 'Campus tour with BYTE'); award('orient'); } }
    else toast('Tour skipped. Replay it any time from the ⚙ menu.');
    if (!S.badges.includes('hello')) setTimeout(()=>award('hello'), 300);
    if (goTo) setTimeout(()=>EXTRA_ACTIONS.campusGo(goTo), 200);
  }
  return { start, shouldRun, isOn: () => on };
})();

window.EXTRA_ACTIONS = Object.assign(window.EXTRA_ACTIONS||{}, {
  tourReplay: () => { UI.menu = false; renderMenu(); Tour.start(); }
});
