# Cybersity — prototype

An interactive, AI-powered cybersecurity learning and social platform for beginners. This is a
front-end prototype for competition demos: all features work with simulated data, entirely in the browser.

## Run it
Open `cybersity.html` in any modern browser. Nothing to install.

## What's inside
- A pixel title screen, sign-up and avatar creator, then a walkable night (or day) campus with BYTE's guided tour.
- Six modules of short lessons, each with a hands-on activity and a quiz, plus module assessments, a final
  assessment and a certificate.
- **Cyber Arcade** (the Challenge Centre): three arcade games where you answer by moving, never in a pop-up quiz.
  - **Virus Escape**: run from a virus monster and switch into the lane with the right answer. It is also the
    Campus Incident: the campus turns red and you secure all six buildings by playing it.
  - **Rocket Firewall**: steer your rocket through the gate with the right answer.
  - **Packet Drop**: drop falling data packets into the right bin before the stack overflows.

  Each has Easy/Normal/Hard, 3 lives, a results screen explaining every mistake, XP, a badge, local high
  scores and a sample leaderboard. Works with the keyboard or with on-screen buttons and swipes on phones.
  Planned next: Byte Jump, Whack-a-Phish and Data Snake.
- Home Base safety checklist, Career Compass, AI mentor BYTE (scripted), Community Hub (simulated learners).

Presenter shortcuts are in the gear (⚙) menu: complete modules, start the campus incident, unlock the arcade,
reset arcade scores, and more.

## Edit it
1. Change files in `src/` (content is in `src/03-data.js`).
2. Run `./build.sh` (macOS/Linux/Git Bash) to rebuild `cybersity.html`.
   On Windows without Bash, ask Claude Code to rebuild, or run the commands inside `build.sh` manually.

## Share it
Drag `cybersity.html` onto https://app.netlify.com/drop, or host it with GitHub Pages, for a public link.

See `CLAUDE.md` for the full source map and conventions.
