# Pomodoro (v1)

Four themes (Classic, Hacker, Rose Scrapbook, Blossom Doodle) and an accent color, picked from the Theme button. No settings panel. 25 / 5 / 15 minutes, a long break after 4 focus sessions,
and the next mode starts manually. Timer state and the mute toggle are saved in localStorage.

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # timer logic tests
npm run build   # dist/index.html — a single file that opens without a server
```

Files: `src/engine.ts` — timer logic (pure functions), `src/usePomodoro.ts` — state,
persistence, sound, tab title, `src/App.tsx` — the interface, `src/styles.css` — styling.
Change the durations in `CONFIG` in `src/usePomodoro.ts`.

Themes: `src/appearance.ts` (theme list, swatches, saved choice), `src/ThemeDialog.tsx` (the pop-up),
`src/faces.tsx` (timer display per theme). The Hacker theme is styled entirely from `--accent`
in `src/styles.css`, so any accent color recolors the whole console.
The two rose themes live in `src/rose.tsx` (flower art, decor, timer face, previews); their styles are at the end of `src/styles.css`.
