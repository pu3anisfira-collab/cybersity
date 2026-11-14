# Cybersity prototype — notes for Claude Code

Cybersity is a competition prototype of an AI-powered cybersecurity learning and social platform for beginners
(students and the general public, English only). **It is deliberately prototype-only**: no backend, no real
accounts, no database. Everything runs in the browser with simulated data. Do not add a server, framework or
build tooling unless the owner asks.

## How it is built
- Plain HTML, CSS and JavaScript. No frameworks, no npm dependencies for the app itself.
- Source lives in `src/` as numbered parts. `build.sh` concatenates them into one self-contained file,
  `cybersity.html`. **Edit files in `src/`, never `cybersity.html` directly, then run `./build.sh`.**
- Fonts load from Google Fonts (Press Start 2P, Silkscreen, Lexend, VT323) with fallbacks.
- Progress is saved in `localStorage` (key `cybersity-prototype-v1`), wrapped in try/catch.

## Source map
| File | Contents |
|---|---|
| `src/01-head.html` | `<title>`, font links, all CSS (design tokens in `:root`) |
| `src/02-body.html` | Mount points: `#app`, `#toasts`, `#layer` |
| `src/03-data.js` | All content: 6 modules × 2 lessons (7-step structure), activities, quizzes, module extra questions, levels, XP values, badges, campus buildings, tips |
| `src/04-pixel.js` | Pixel art drawn in code: avatar sprite grids, BYTE robot, icon grids, `iconURL()` / `avatarCanvas()` |
| `src/05-app.js` | State, progression/lock rules, rewards (XP, levels, badges, modals, toasts), routing, onboarding, dashboard, library, module, lesson, quiz engine, challenge centre, achievements, certificate, admin preview, presenter menu, click-action dispatcher (`ACTIONS`) |
| `src/06-activities.js` | Six activity engines: sort, select (email/logs), match, toggle (router), password, order |
| `src/07-campus.js` | Canvas campus: 30×20 tile map, buildings, BFS pathfinding, NPC learners, door prompts |
| `src/08-social.js` | BYTE scripted mentor (keyword knowledge base, safety refusals, lesson context, quiz-me) and Community Hub (rooms, bot replies, personal-info filter, reporting) |
| `src/10-career.js` | Career Compass: role quiz, role pages, taster missions (activities mounted stand-alone), roadmaps |
| `src/99-init.js` | Boot (always last in `build.sh`) |

## Conventions
- UI is rendered as HTML strings; clicks are handled by event delegation on `data-act` / `data-arg`
  attributes. Add new handlers to `ACTIONS` (05) or `window.EXTRA_ACTIONS` (06–08).
- Always pass user text through `esc()` before inserting into HTML.
- Colours come from CSS tokens; game surfaces are pixel art, reading surfaces are light "monitor" panels.
- Lock rules: lesson quiz needs lesson + activity done; next lesson needs previous quiz passed; module
  assessment needs all lesson quizzes; next module needs previous module assessment; final needs all modules;
  certificate needs final passed. Pass mark `S.passMark` (default 70, adjustable in admin view).
- Adding a lesson = add an object to a module's `lessons` array in `03-data.js` using an existing activity type.
- Simulated parts (be clear about these when presenting): scripted mentor, bot classmates, fake accounts,
  certificate "Download PDF" shows a message only.

## Testing
`node test.js` runs a headless Playwright click-through of the whole journey and saves screenshots to `shots/`
(Playwright + Chromium required: `npm i playwright && npx playwright install chromium`). It prints any page errors.
A font-loading network error in offline environments is expected and harmless.

## Demo tips
"Try the demo instantly" skips sign-up. The gear menu has presenter shortcuts (complete Module 1, Modules 1–5,
all modules), admin view and reset.
