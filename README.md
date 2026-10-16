# 🍅 Pomodoro

A calm, themeable Pomodoro timer with a built-in task list — one HTML file, no install, no account.

Open https://whoisclownhere.github.io/pomidoro/ in a browser and start focusing.

---

## Features

**Timer**
- Three modes: **Focus** (25 min), **Short break** (5 min) and **Long break** (15 min)
- A long break comes after every 4 focus sessions, with a cycle counter on screen
- Click the clock to set any duration; your custom times are remembered
- The remaining time shows in the browser tab title, so you can see it from other tabs
- Keeps the correct time if the tab sleeps or you reload the page

**Tasks**
- Add tasks one per line, check them off, edit them, and drag to reorder
- The current task is shown next to the timer
- Hide the list when you want a clean screen

**Sound**
- Seven end-of-session sounds: Bell, Soft chime, Kalimba, Marimba, Singing bowl, Birdsong and Digital
- Volume control and a mute switch
- All sounds are generated live with the Web Audio API — no audio files

**Themes**

| Theme | Look |
|---|---|
| **Classic** | Clean, warm and calm. The colors shift with each mode. |
| **Hacker** | A terminal console with phosphor glow. |
| **Rose Scrapbook** | A pink collage of paper notes, tape, a bow, blossoms and lilies. |
| **Blossom Doodle** | Cherry blossoms and lilies with white doodles. |

Every theme has its own accent color: pick a preset (Tomato, Orange, Yellow, Green, Cyan, Blue, Violet, Pink, and more) or any custom color.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Space` | Start / pause |
| `R` | Reset the timer |
| `1` / `2` / `3` | Focus / Short break / Long break |
| `T` | Edit tasks |

## Getting started

No build step is needed.

```bash
git clone https://github.com/whoIsClownHere/pomidoro.git
cd pomidoro
open index.html        # macOS — or just double-click the file
```

To host it, drop `index.html` on any static host (GitHub Pages, Netlify, Vercel). For GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**.

## Privacy

Everything stays in your browser. Timer state, tasks, durations, sound and theme settings are saved in `localStorage` (under keys starting with `pomodoro-classic:v1`). Nothing is sent anywhere.

## Built with

React, bundled with Vite into a single self-contained HTML file (scripts, styles and fonts inlined). Works on desktop and mobile.

## License

No license yet. Add one (for example MIT) if you want others to reuse the code.
