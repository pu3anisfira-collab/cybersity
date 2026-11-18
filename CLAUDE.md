# Cybersity prototype — notes for Claude Code

Cybersity is a competition prototype of an AI-powered cybersecurity learning and social platform for beginners
(students and the general public, English only), entered in IIMaCC 2026 (category T2 Educational Innovation;
judged on a video of 5 minutes or less plus an abstract). **It is deliberately prototype-only**: no backend, no real
accounts, no database. Everything runs in the browser with simulated data. Do not add a server, framework or
build tooling unless the owner asks.

## How it is built
- Plain HTML, CSS and JavaScript. No frameworks, no npm dependencies for the app itself. No image files:
  all pixel art (buildings, avatars, icons, banners) is drawn in code.
- Source lives in `src/` as numbered parts. `build.sh` concatenates them into one self-contained file,
  `cybersity.html`. **Edit files in `src/`, never `cybersity.html` directly, then run `./build.sh`.**
  New script files go in `build.sh` before `99-init.js`, which must stay last.
- Fonts load from Google Fonts with fallbacks: **Jersey 10** (`--f-title`: logo, page titles, big numbers, canvas
  alert text), Press Start 2P (`--f-pixel`: small number chips), Silkscreen (labels), VT323 (terminal), Lexend (reading text).
  Page titles, the dashboard welcome and the sign-in logo get the game-title look (`.gt`): `gameTitles()` in 05 copies
  their text into `data-t`, and CSS draws a two-tone fill, outline and drop shadow (`--gt-*` tokens, per theme).
- Progress is saved in `localStorage` (key `cybersity-prototype-v1`), wrapped in try/catch. Saved state is merged
  over `freshState()`, so new state keys need a default there.

## Source map
| File | Contents |
|---|---|
| `src/01-head.html` | `<title>`, font links, all CSS (design tokens in `:root`) |
| `src/02-body.html` | Mount points: `#app`, `#toasts`, `#layer` |
| `src/03-data.js` | All content: 6 modules × 2 lessons (7-step structure), activities, quizzes, module extra questions, levels, XP values, badges, campus buildings, tips; Home Base (`HOME_BASE`, `HEALTH_CHECKS`, `HOME_STAGES`); Career Compass (`CAREER_SIGN`, `CAREERS`, `ROADMAP_STEPS`, `CAREER_QUIZ`); Campus Incident (`INCIDENT`); Cyber Arcade (`ARCADE_GAMES`, `ARCADE_QS`, `ARCADE_SORT`); `FAMILY_CARDS`; `SCAM_STEPS` |
| `src/04-pixel.js` | Pixel art drawn in code: avatar sprite grids, BYTE robot, icon grids, `iconURL()` / `avatarCanvas()` |
| `src/05-app.js` | State, progression/lock rules, rewards (XP, levels, badges, modals, toasts), routing, building-themed page headers (`themeHead`), onboarding, dashboard (incl. Safety Score card), library, module, lesson (incl. scam "real life" box and "Teach your family" card), quiz engine, challenge centre, achievements, certificate, admin preview, presenter menu, click-action dispatcher (`ACTIONS`) |
| `src/06-activities.js` | Six activity engines: sort, select (email/logs), match, toggle (router), password, order. `Activities.mount(lesson, el, opts)` also runs a game stand-alone (see Conventions) |
| `src/07-campus.js` | Canvas campus: 30×25 tile map, buildings, Home Base dorm, Career Compass signpost, BFS pathfinding, NPC learners, door prompts, phone camera, building banners (`Campus.banner`); Home Base page and Security Health Check; Campus Incident (attack effects, banner, challenge pages, celebration) |
| `src/08-social.js` | BYTE scripted mentor (keyword knowledge base, safety refusals, lesson context, quiz-me) and Community Hub (rooms, bot replies, personal-info filter, reporting) |
| `src/10-career.js` | Career Compass: role quiz, role pages, taster missions, roadmaps |
| `src/11-tutorial.js` | Campus tour with BYTE: RPG dialogue engine, spotlight, the tour script (`TOUR_STEPS`), first-visit/skip/replay state |
| `src/12-arcade.js` | Cyber Arcade framework: game registry and runner (intro, difficulty, HUD, input, pause, results, rewards, high scores, sample leaderboard, Web Audio sound), arcade hall and cabinet art |
| `src/13-virus.js` | Virus Escape: 3-lane campus runner, also the Campus Incident's game |
| `src/14-rocket.js` | Rocket Firewall: steer the rocket through the gate tunnel with the right answer |
| `src/15-packet.js` | Packet Drop: falling labelled blocks sorted into bins |
| `src/99-init.js` | Boot (always last in `build.sh`) |

## Features added for IIMaCC 2026
- **Home Base + Security Health Check** (07). A dorm in the campus's south strip. 7 real-life actions (2FA,
  updates, unique password, screen lock, photo backup, app permissions, save NSRC 997) are ticked by the learner
  and raise a Safety Score. The dorm upgrades in 4 stages: dark → lights on (1–3 ticks) → padlock (4–6) → shield
  and "SECURED" sign (7). XP once per action (`S.healthXP` stops repeat XP), +50 bonus and the `homesafe` badge
  at 100%. Score card on the dashboard.
- **Career Compass** (10). A glowing signpost on the plaza plus a Careers nav item. A 5-question quiz matches
  learners to SOC analyst, penetration tester, incident responder, GRC/risk analyst or network security engineer
  (most picks wins; ties go to the most recent pick). Each role page has a plain-words job description, a taster
  mission that reuses the matching game, and a 6-step roadmap marking what Cybersity covers. Tasters never
  change lesson progress. `explorer` badge for a taster. The platforms and certificates are named as examples to
  research, not endorsements.
- **Campus Incident** (07 + 13). After the Module 2 assessment the campus shows a gold "Strange activity near the
  Cyber Core" alert. Investigate (or the gear menu) starts the attack: red sky and edges, flashing alarm lamps, a
  red Cyber Core and glitching "HACKED" buildings. About 3s later it launches **Virus Escape** in incident mode
  (`go('arcade', {game:'virus', incident:true})`). Every 2 right answers there secures the next building in
  `INCIDENT` order through `incSecure()`. Back on the campus each secured building plays its restore animation;
  all six trigger fireworks, a "Campus saved" modal, +150 XP and the `defender` badge. Buildings secured before
  being caught stay secured, and the banner's "Chase the virus" relaunches the run. State lives in `S.incident`.
- **Cyber Arcade** (12–15). The Challenge Centre page (nav "Arcade") opens with the arcade hall: one pixel
  cabinet per game (`ARCADE_GAMES`) with description, difficulty, local high score and availability, a sample
  leaderboard (simulated learners plus the player's best, labelled as such), then the existing practice
  activities, quizzes and assessments, unchanged. Games answer by moving, never in a pop-up quiz:
  - **Virus Escape** (13): switch lanes into the answer sign; right = boost and distance, wrong = stumble, lose a
    heart, the monster closes in. 6 buildings secured = win; caught or out of hearts = lose. Unlocks after
    Module 2 (or the presenter unlock).
  - **Rocket Firewall** (14): steer up/down into the gate tunnel with the right answer; 12 gates; wrong = a shield.
  - **Packet Drop** (15): move falling packets left/right (down = faster) into the right bin; wrong bins stack
    junk; a column reaching the red line overflows and costs a heart. Level 1 Safe/Risky, level 2
    Phishing/Malware/Safe; blocks speed up.

  The runner gives every game Easy/Normal/Hard (speed and lives), score, hearts, a question bar above the
  screen, arrow keys/WASD plus on-screen buttons and swipe on phones, pause (P/Esc, and on tab switch), and a
  results screen with accuracy, correct/total and each mistake with the right answer and explanation. Rewards
  follow accuracy and finishing, not speed: up to `XP.arcade` for accuracy plus `XP.arcadeWin` for a win, and
  one badge per game at 70%+ (`arc_virus`, `arc_rocket`, `arc_packet`). High scores live in `localStorage`
  key `cybersity-arcade-scores`; sound (off with the mute toggle, key `cybersity-arcade-mute`) starts only after
  the first click. Content: `ARCADE_QS` (41 short questions, 3 options of 1–4 words, correct answer first, the
  game shuffles) and `ARCADE_SORT` (30 sorting items in 2 sets) in 03-data.js.
  To add a game: write `src/NN-name.js` calling `Arcade.register(id, { controls, size, create(api) })`, add
  its entry to `ARCADE_GAMES` and a badge, and add the file to `build.sh` before `99-init.js`. `create`
  returns `{ update(dt), draw(g), input(dir), after?(dt), state?() }`; see the comment at the top of 12-arcade.js
  for the `api`. `state()` exposes the right answer's position so `test.js` can autopilot a run.
  **Future games** (ideas, not built): Byte Jump (platformer: jump onto the platform with the right answer),
  Whack-a-Phish (tap only the phishing messages as they pop up), Data Snake (grow by eating the safe items and
  avoiding the risky ones).
- **Building-themed pages** (05 `themeHead`, 07 `Campus.banner`). After each view renders, a building page's
  `.page-head` gets the building colour (`--bc`) and a pixel banner drawn with the campus building code. The
  view→building map is `VIEW_BUILDING`. Incident pages show the building hacked. Lesson/quiz pages and career
  role pages (`.role-head`) are not themed.
- **Scam "What to do in real life" box** (05 `realLifeHTML`). Shown at the end of the Recap step for lessons
  with `realLife:'scam'` (currently only Lesson 2.1). Steps: call NSRC 997 within 24 hours (`tel:997` link),
  contact your bank, report the number, keep evidence.
- **"Teach your family" card** (05 `familyCardHTML`). Shown after a passed lesson quiz, and reopened from the
  lesson's quiz step. A 1-minute plain-language card per lesson (`FAMILY_CARDS`) with a WhatsApp share link
  (`wa.me/?text=`) and copy text. The shared text holds lesson content only: never put the learner's name or
  other personal data in it.
- **Phone camera** (07). On screens up to 640px wide the campus shows a 12×14-tile window that follows the
  player. A Full map / Zoom in toggle sets `UI.campusFull`. Draw in world coordinates with `world()`; use
  `screen()` with `vw`/`vh` for overlays that belong to the visible view. Map pointer input through `toLogical()`.

- **Full-screen campus** (07). The Full screen button on the map (or the F key) sets `UI.campusFS`. The map then
  covers the window above the top bar, and the browser goes full screen where allowed. The view takes the screen's
  shape, so the camera follows the player along the cut-off side. A gear button, Exit and the incident banner float
  on top. The mode stays on while visiting buildings and comes back on return. Esc or F exits.

- **Title screen and onboarding** (05 `renderOnboarding` / `onbPageHTML`, 07 `startTitleScene`). Signed-out visitors
  see a full-screen animated pixel campus: sky with a moon or sun, drifting clouds, the campus buildings (drawn
  with `Campus.drawFront`), lamps and walking students. A centred CYBERSITY title and a pulsing PRESS START button
  (or Enter) sit over it. The steps `UI.onb` = title, auth, avatar, brief are full-screen pages that slide up over the
  same running scene ("Title screen" slides back down). The scene pans down once you leave the title.

- **Campus tour with BYTE** (11, plus `Campus.tour` in 07 and `botFace()` in 04). The first time a learner reaches the
  campus, BYTE beams in, greets them by name and walks building to building, with the camera zoomed in and following.
  An RPG dialogue box types each line and shows BYTE's face (happy, excited, wink, think, blink, wave), with "Tell me
  more" choices, an optional 8-bit blip sound (off by default) and Skip tour (Escape asks to confirm). A spotlight dims
  everything except the building or control being explained (it eases after its target as the camera moves).
  The tour ends with "Take me to the Library!" or "I'll explore on my own", +25 XP and the `orient` badge; the
  "Hello, World" badge waits until the tour ends. Seen or skipped is stored per learner name in `localStorage`
  key `cybersity-tour-seen` (log out clears progress but not this), so returning learners aren't forced through it.
  Replay from the gear menu or the AI Lab. To change what BYTE says, edit `TOUR_STEPS`. The static "Mission briefing"
  onboarding step was removed: the tour replaces it, so onboarding is now title, sign up, avatar, campus.

## Day mode
- A sun/moon button (top bar; top-right corner on the sign-in screens) switches between Night (default) and Day.
  The choice is saved in `localStorage` key `cybersity-theme` and applied as `<html data-theme="day">`.
- Day look, from the owner's reference art: sky gradient with pixel clouds, a grass and dirt strip at the
  bottom, cream panels with black pixel outlines, yellow titles outlined in brown, green pixel buttons. All Day
  CSS is in one block at the end of `01-head.html`, under `:root[data-theme="day"]`.
- Text in accent colours uses `--cyan-ink`, `--gold-ink` and so on (never `color:var(--cyan)`). In Day mode these
  turn deeper so they stay readable on cream. Device screens that stay dark (router, log lines, tooltips,
  incident banner) reset the ink tokens to the bright values.
- Canvas art reads its colours from `pal()` (`PAL_NIGHT` / `PAL_DAY` in `04-pixel.js`). Check `isDay()`
  for one-off colours. Switching theme re-renders the app so the canvases repaint. Building banners are cached
  per theme.

## Conventions
- UI is rendered as HTML strings; clicks are handled by event delegation on `data-act` / `data-arg`
  attributes. Add new handlers to `ACTIONS` (05) or `window.EXTRA_ACTIONS` (06–10). The dispatcher calls
  `preventDefault` on `<a data-act>`, so real links (WhatsApp, `tel:`) must not carry `data-act`.
- Always pass user text through `esc()` before inserting into HTML.
- Colours come from CSS tokens; game surfaces are pixel art, reading surfaces are light "monitor" panels.
- Lock rules: lesson quiz needs lesson + activity done; next lesson needs previous quiz passed; module
  assessment needs all lesson quizzes; next module needs previous module assessment; final needs all modules;
  certificate needs final passed (use `bLocked(id)` for the campus, which also opens it during the incident);
  Campus Incident needs the Module 2 assessment. Pass mark `S.passMark` (default 70, adjustable in admin view).
- Adding a lesson = add an object to a module's `lessons` array in `03-data.js` using an existing activity type.
  Also add its `FAMILY_CARDS` entry, and `realLife:'scam'` if it is about scams.
- Reusing a game outside a lesson: `Activities.mount(lessonLikeObject, el, { onDone(score), nextAct, nextArg,
  nextLabel, tag })`. In this mode it skips lesson progress and calls `onDone` instead. Badges still award.
  A lesson-like object only needs `{ id, activity }` (a `title` too if shown).
- Campus buildings: the six learning buildings come from `BUILDINGS`; Home Base and the signpost are added in
  `07` with custom drawing (`drawDorm`, `drawSignpost`). The Campus Incident uses only the six in `INCIDENT`.
- Simulated parts (be clear about these when presenting): scripted mentor, bot classmates, fake accounts,
  certificate "Download PDF" shows a message only, Home Base ticks are self-reported, the Campus Incident is a
  scripted event.
- Real-world facts to keep accurate: NSRC scam hotline 997, PDRM Semak Mule, career platforms and certificates.
  Have the owner confirm them before changing the wording.

## Testing
`node test.js` runs a headless Playwright click-through of the whole journey and saves screenshots to `shots/`
(Playwright + Chromium required: `npm i playwright && npx playwright install chromium`). It prints check results
and any page errors. It covers the new features at desktop (1360px) and phone (390px) widths, including campus
walking, Home Base stages, career quiz and taster, the full incident, themed headers, the real-life box, family
cards and the phone camera. A full run takes about 7–8 minutes (it plays a full run of each arcade game by autopilot). A font-loading network error in offline
environments is expected and harmless. `shots/` and `test-page.html` are git-ignored.

## Demo tips
"Try the demo instantly" skips sign-up. Gear menu presenter shortcuts:
- Complete Module 1 / **Modules 1–2 (unlocks the incident)** / Modules 1–5 / all modules (final unlocked)
- **Campus incident**: Start "Campus under attack!", Secure next building (plays the restore animation),
  End incident (resets for another take)
- **Home Base**: tick every action / clear checklist (resets the dorm to dark without giving XP again)
- **Cyber Arcade**: Unlock arcade (all games and the incident playable without Module 2), Reset arcade scores
- Admin view, reset demo progress, log out
- Profile: **Replay campus tour with BYTE**

Recording the incident (about 1–2 minutes):
1. Complete Modules 1–2 (or Unlock arcade), open the campus and press Investigate on the alert.
2. The campus turns red for about 3s, then Virus Escape opens: pick Easy for a calm recording and press Start.
3. Play it live; every 2 right answers secures a building. Use "Secure next building" from the gear menu to
   fast-forward if needed.
4. "Back to campus" plays the restore animation, fireworks and the Campus saved modal (about 6s).

On phones the campus is zoomed; use Full map to show the whole campus. For recording, press F (or Full screen) on
the campus: the gear menu stays available from the map's top-right corner.
