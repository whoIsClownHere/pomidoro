# CLAUDE.md — Pomodoro (pomidoro)

Context for any Claude session working on this project. Read this first.

## What this is

A themed Pomodoro timer website. One page, no backend, no settings screen. Everything is saved in the browser's `localStorage`.

- **Live/deploy:** GitHub repo `whoIsClownHere/pomidoro`, served by GitHub Pages from `/docs` on `main`.
- **Owner:** Arthur. He talks to Claude **in Russian**. **All UI text in the app is English.**
- **Current themes:** Classic, Hacker, Rose Scrapbook and Blossom Doodle. Each has its own accent color, chosen by the user.

## How the owner likes to work (important)

- **Design first, code second.** For any new visual feature he wants to *see a design* before implementation ("покажи сначала дизайн"). Designs live on a Claude Design canvas: https://claude.ai/artifact/HJtVHpjc4np8Bh1o79kzGf (private, his account). It contains every theme exploration and the tasks designs. Implement only after he approves.
- **The timer must never move.** Its position, the mode tabs, the controls and the counter are sacred. New UI is added *around* them (below, or in fixed side panels) without shifting anything. When something has to appear temporarily, it may lift the stage, and only for that moment (see the "Session-complete notice" section below).
- He iterates in short messages ("сделай X", "это не так"). He expects you to take the change all the way: build it, verify it, ship the files.
- He often asks to re-send the deliverables:
  - `docs/index.html` is the single-file app;
  - a source zip without `node_modules`, `dist` or `*.tsbuildinfo`.
- When he pastes git errors, explain the fix step by step in Russian. Earlier example: a push was rejected because the remote already had a README; the fix was `git pull --rebase origin main`, then push.

### Taste notes from past feedback

- **Pink themes:** only pure white plus pink, with no purple and no red. They must look flat, hand-drawn and 2D, never 3D. Flowers are drawn as **heads only, no stems**: cherry blossoms, and lilies with white outlines. The mood is a scrapbook collage with washi tape, paper notes, a bow and white doodles.
- **Accent color:** changing it must recolor the *whole* theme. In the rose themes every pink is derived from the accent.
- **Font sizes:** big, readable type is preferred, and he has asked for bigger fonts before.
- **Phones:** narrow screens matter. On a phone the task list sits under the timer and is always visible (it cannot be hidden), and the background behind it must not turn white.

## Tech stack

- React 18, TypeScript 5 and Vite 5, with `vite-plugin-singlefile`. The build is **one self-contained `dist/index.html`** (~1.1 MB) that opens from disk without a server.
- Fonts come from `@fontsource/*`, **Latin subsets only** to keep the single file small. Faces in use: Manrope, JetBrains Mono, Nunito, Caveat and Playfair Display.
- Tests use Vitest: `src/engine.test.ts` and `src/TimeDisplay.test.ts`.
- No other runtime dependencies. Sounds are synthesized with WebAudio, and all art is inline SVG.

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # vitest
npm run build   # tsc -b && vite build → dist/index.html
npm run pages   # build + copy dist/index.html → docs/index.html (commit this)
```

The root `index.html` is only the Vite template. Opened directly, it shows a blank page. The finished app is `docs/index.html`.

## File map

```
src/
  main.tsx          fonts (Latin subsets) + mount
  App.tsx           composition: top bar, stage, faces per theme, tasks, notice, dialogs, keyboard
  engine.ts         pure timer logic (no React/DOM)
  engine.test.ts
  usePomodoro.ts    state hook: tick loop, persistence, sound trigger, tab title, setTime
  TimeDisplay.tsx   the big clock; click → type a new time (parseTime)
  TimeDisplay.test.ts
  faces.tsx         ClassicFace, HackerFace (timer display per theme)
  rose.tsx          rose themes: SVG defs, ScrapbookDecor, DoodleDecor, RoseFace, theme previews
  appearance.ts     THEMES list, SWATCHES, useAppearance (theme + per-theme accent), accentVars(), textOn()
  ThemeDialog.tsx   Theme pop-up: vertical theme cards + accent swatches
  sound.ts          SOUNDS list + WebAudio RECIPES, playSound(), unlockAudio()
  SoundMenu.tsx     panel behind the speaker icon: on/off, sound choice, volume, preview
  styles.css        everything (sections: base, classic, hacker, rose, dialogs, sound, tasks, responsive)
  tasks/
    useTasks.ts     task data + actions, saved to localStorage
    TaskUI.tsx      TasksButton, TaskEditor, EditorRow, ConfirmDelete, TaskPanel, useReorder, useNarrow
    skins.tsx       per-theme TaskSkin (wording + checkbox shape) + CheckIcon
docs/index.html     built single-file app (GitHub Pages)
README.md           user-facing notes (also: how to add a theme)
```

## Timer engine (`engine.ts`)

- Every function is pure and takes `(state, now)`. While the timer runs, the source of truth is the wall-clock `endAt`, and `remaining = endAt - now`. This keeps background or throttled tabs from drifting.
- `TimerState` holds:
  - `mode` (`focus | short | long`) and `status` (`idle | running | paused`);
  - `endAt`, `remainingMs`;
  - `cycleCount` (focus sessions in the current cycle) and `totalCompleted`;
  - `lastFinished: {mode, at}`, which drives the "session complete" notice.
- The defaults live in `CONFIG` in `usePomodoro.ts`:
  - 25 / 5 / 15 minutes;
  - a long break after every 4 focus sessions;
  - `autoStartNext: false`, so the next mode starts manually from the notice.
- `tick()` completes every session that has elapsed. It runs on load too, so sessions that ended while the page was closed are counted.
- `usePomodoro` ticks every 250 ms and on `visibilitychange`. It also does three other jobs:
  - plays the chosen sound when a session finishes;
  - writes the remaining time into the tab title;
  - provides `setTime(ms)`, which saves a new duration *for the current mode* (from the click-to-edit clock) and resets the timer to it.

## Persistence (localStorage keys)

| Key | Content |
|---|---|
| `pomodoro-classic:v1` | `TimerState` |
| `pomodoro-classic:v1:durations` | `{focus, short, long}` minutes (custom lengths set by editing the clock) |
| `pomodoro-classic:v1:sound` | `{on, id, volume}` (legacy `:muted` = `'1'` is still read as a fallback) |
| `pomodoro-classic:v1:appearance` | `{theme, accent: {classic, hacker, scrapbook, doodle}}` (`null` = theme default) |
| `pomodoro-classic:v1:tasks` | `{tasks: [{id, text, done}], hidden}` |

Every read is wrapped in try/catch, and broken or blocked storage falls back to the defaults.

## UI and features

**Top bar** is a 3-column grid:
- the brand on the left;
- the **Theme** button (palette icon) in the center;
- the speaker icon button on the right, which opens the `SoundMenu`.

**Stage**, centered and in this order:
- mode tabs;
- the face (theme-specific clock + progress + meta line);
- Start/Pause and Reset;
- the cycle dots plus "Completed: N";
- then `.stage-below`, positioned absolutely under the stage so it never pushes the stage. It holds the tasks button and the notice.

**Keyboard** (ignored while a dialog is open or an input is focused):
- `Space` starts or pauses;
- `R` resets;
- `1` / `2` / `3` switch the mode;
- `T` opens the tasks.

The hints are shown in the footer and hidden on touch devices.

**Editable time:** click the clock to get an input. It accepts `45`, `45:30` or `1:15:00`, up to 5 hours. Enter applies the time, Esc cancels. The input is sized in `ch` and keeps the theme's digit color.

**Sounds:** seven synthesized sounds: bell, chime, kalimba, marimba, singing bowl, birds and digital. There is also on/off, volume and a preview. Audio is unlocked on the first user action.

**Session-complete notice** ("Focus session complete", "Break is over" or "N focus sessions done — time for a long break", with Start/Later buttons):
- It appears **below the tasks button** inside `.stage-below`.
- While it is shown:
  - the keyboard hints fade out (`.app[data-notice]`);
  - a `useLayoutEffect` in `App.tsx` lifts the stage with `translate`, but **only as much as needed** to fit the notice, capped by the space under the header;
  - on very short screens the page scrolls the notice into view;
  - at heights of 780px or less (and widths of 600px or more), the notice shrinks to one compact line.
- With no notice there is no lift, and nothing moves.

**Tasks** (`src/tasks/`):
- The button under the counter reads "Add tasks" and opens the TaskEditor:
  - type a task and press Enter, repeatedly;
  - the `+` button also adds;
  - click a task to edit it inline, and × deletes it;
  - a single long **Done** button closes the editor.
- When tasks exist, the button becomes **Delete task list**, which asks for confirmation (Keep tasks / Delete).
- Reordering works by dragging the ⋮⋮ handle (pointer events, also on touch) or with ↑/↓ on the focused handle, both in the editor and in the panel. The first unfinished task is "Now".
- The current task is shown in the face's existing line:
  - Classic: "Now: …" in the meta row;
  - Hacker: `--task="…"` in the command line;
  - Rose: "now: … ♡".
- **Wide screens (above 1180px):**
  - the panel is `position: fixed` on the right, and the timer stays centered;
  - hovering its left edge shows a hide button;
  - hovering the right edge of the screen shows a tab that brings the panel back.
- **Narrow screens (1180px and below):**
  - the panel sits under the app (absolute at `top: calc(100% + 8px)` of `.app`), so the timer does not move;
  - it is always visible and cannot be hidden;
  - `document.documentElement.style.background` copies the `.app` background, so the area behind the list is never white.
- Per-theme look comes from `SKINS` in `skins.tsx` (wording + checkbox shape: circle, square, heart or flower) plus `--tp-*` CSS tokens: `--tp-bg`, `--tp-line`, `--tp-radius`, `--tp-now`, `--tp-check`, `--tp-danger`. A new theme works with `DEFAULT_SKIN` automatically.

## Themes and the accent system

- `.app` gets `data-theme`, `data-mode` and `data-tasks`. The tokens are `--bg`, `--fg`, `--muted`, `--line`, `--accent`, `--accent-strong` and `--accent-fg`.
- A user accent is applied inline via `accentVars(hex, theme)`.
  - For light accents in the rose themes, only `--accent` is set, so the theme's own deep shades carry the text.
  - Otherwise `--accent-strong` and `--accent-fg` (black or white via `textOn`) are set too.
- **Classic** uses Manrope:
  - background `#f7f3ec`, ink `#2a2724`;
  - accent `#e04e39` in focus;
  - `data-mode` short switches to a green background and accent (`#3f8a6b`), and long to blue (`#3d6f99`).
- **Hacker** uses JetBrains Mono:
  - **everything is derived from `--accent` with `color-mix`** (text, dim, lines, glow);
  - the background is a grid;
  - the face is a terminal window (`.hk-*`), and any accent recolors the whole console.
- **Rose Scrapbook and Blossom Doodle** use Nunito for body text, Caveat for headings and labels, and Playfair Display for the digits.
  - **All pinks are derived from `--accent`:** `--r-50 … --r-700`, `--r-muted`, `--r-text` and `--rose-ink`, built with `color-mix(… #fff)` for the light steps and `oklch(from var(--accent) …)` for the deep steps.
  - The decor is inline SVG in `rose.tsx`: blossom and lily heads, a bow, tape and white doodles.
  - The Scrapbook background is `--r-bg`, and the Doodle background is white.

**Adding a theme:**
1. Add it to `THEMES` in `appearance.ts`.
2. Add a `[data-theme='x'] { … }` CSS block.
3. Optionally add a face in `faces.tsx`, a `SKINS` entry, and `--tp-*` overrides.
4. Add a preview card in `ThemeDialog.tsx`.

## Layout invariants (test these after any UI change)

1. Mode tabs, the time, the controls and the counter keep the **same pixel positions** with and without tasks, and with the panel shown or hidden. Check this at 1440×900 and 390×844 in every theme.
2. With no notice, nothing is lifted. With a notice, it sits below the tasks button, stays on screen, and doesn't overlap the hints.
3. There is no horizontal page scroll on phones.
4. Verify by rendering the built `docs/index.html` in headless Chromium (Playwright) with seeded `localStorage`, then comparing element bounding boxes.

## Theme explorations not shipped (context only)

The canvas holds explorations that were **not** adopted:
- earlier six-theme ideas;
- several white-and-pink directions (Petal Ink, Paper Garden, Soft Clouds, Single Bloom, Cloud/Warm variants), which led to the two shipped rose themes;
- a later round (Lo-fi room, Coffee shop, Forest, Swiss poster), which he rejected.

**Lo-fi room is still wanted but unresolved.** His reference is a painted anime-style night room:
- a rainy window on the left with a black cat on the sill;
- a desk lamp, a mug and books on the desk;
- a sunset window on the right;
- the timer shown on a monitor, with tasks as sticky notes.

Attempts so far and why they failed:
- **Flat vector scenes:** too flat.
- **His painted picture, cleaned up, with an opaque monitor screen:** he did not accept this version.
- **Animated layers on that picture** (rain, steam, cat breathing, a cat tail as a separate rigged layer with its own shadow, an ear twitch): he judged the animation fake-looking and asked for another approach.

The last direction was to base the theme on **ready-made vector or Lottie illustrations** (Freepik, Vecteezy, IconScout or LottieFiles), which he would choose and attach. This environment cannot download from those sites, so the file has to come from him. Do not restart this without his input.

## Conventions

- Keep code simple and commented in plain English. There is no state library and no CSS framework.
- New UI must work at phone width and support keyboard and focus. Use real `<button>` elements and `aria-*` attributes where needed. Honor `prefers-reduced-motion`.
- After any change, run `npm test`, then `npm run pages`, and commit `docs/index.html` together with the source.