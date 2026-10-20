# 🍅 Pomodoro

A calm, themeable Pomodoro timer with a built-in task list — plain static files, no install, no account.

Open https://whoisclownhere.github.io/pomidoro/ in a browser and start focusing.

---

## Features

**Timer**
- Three modes: **Focus** (25 min), **Short break** (5 min) and **Long break** (15 min)
- A long break comes after every 4 focus sessions, with a cycle counter on screen
- Click the clock to set any duration; your custom times are remembered
- The remaining time shows in the browser tab title, so you can see it from other tabs
- Keeps the correct time if the tab sleeps or you reload the page
- Switching modes while a timer runs keeps it going in the background, with a "Back to focus" link
- Starting another mode parks the unfinished one: its time is kept (badge on its tab) until you resume or reset it
- Optional auto-start: focus → break → focus without pressing Start
- "Completed" counts only fully finished focus sessions; it survives a reload but starts from zero on a new visit
- The time can't be edited while a timer is started
- While the timer runs, the mode tabs, task button, keyboard hints, Theme and Settings buttons fade away until you pause, and the clock slides into the Settings button's place (can be turned off in Settings → Timer)

**Tasks**
- Add tasks one per line, check them off, edit them, and drag to reorder
- The current task is shown next to the timer
- Hide the list when you want a clean screen

**Sound**
- Eleven gentle end-of-session sounds: Wind chimes, Warm glow, Droplets, New Year bells, Snowflakes, Music box, Harp, Soft marimba, Singing bowl, Birdsong and Soft digital
- Focus sounds that play while you focus: White, Pink and Brown noise, Rain, Ocean and Fireplace, with their own volume
- Volume control and a mute switch
- All sounds are generated live with the Web Audio API — no audio files

**Themes**

| Theme | Look |
|---|---|
| **Classic** | Clean, warm and calm. The colors shift with each mode. |
| **Black** | Classic in black and white with heavy type. The button color is yours to pick. |
| **Hacker** | A terminal console with phosphor glow. |
| **Rose Scrapbook** | A pink collage of paper notes, tape, a bow, blossoms and lilies. |
| **Blossom Doodle** | Cherry blossoms and lilies with white doodles. |

Every theme has its own accent color: pick a preset (Tomato, Orange, Yellow, Green, Cyan, Blue, Violet, Pink, White, and more) or any custom color. **Time thickness** (Thin → Heavy) can be set per theme too.

**Settings** (gear icon)

- **Timer:** focus / break lengths, long break after N sessions, auto-start, keep the timer running when switching modes
- **Sounds:** end-of-session sound and volume
- **Focus sounds:** background noise while you focus
- **Clock & date:** show the current time and date in the top bar, 24-hour time, seconds, date format

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

To host it, upload `index.html` together with the `assets/` folder to any static host (GitHub Pages, Netlify, Vercel). For GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**.

## Privacy

Everything stays in your browser. Timer state, tasks and all settings are saved in `localStorage` (under keys starting with `pomodoro-classic:v1`). The "Completed" counter is kept in `sessionStorage`, so it lasts only for the open tab. Nothing is sent anywhere.

## Built with

React, built with Vite. The site is split into:

- `index.html` — the page shell
- `assets/app.js` — the app code (minified)
- `assets/style.css` — all styles
- `assets/fonts/` — Manrope, JetBrains Mono, Caveat, Playfair Display and Nunito (`.woff2` + `.woff`)

It still opens straight from disk (no server needed). Works on desktop and mobile.

## License

No license yet. Add one (for example MIT) if you want others to reuse the code.
