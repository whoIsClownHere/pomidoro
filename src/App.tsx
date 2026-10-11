import { useCallback, useEffect, useRef, useState } from 'react';
import { MODE_LABEL, formatClock, type Mode } from './engine';
import { CONFIG, usePomodoro } from './usePomodoro';
import { accentVars, useAppearance } from './appearance';
import { ClassicFace, HackerFace } from './faces';
import { ThemeDialog } from './ThemeDialog';
import { SoundMenu } from './SoundMenu';
import { DoodleDecor, RoseFace, ScrapbookDecor } from './rose';

const MODES: { mode: Mode; short: string }[] = [
  { mode: 'focus', short: 'Focus' },
  { mode: 'short', short: 'Break' },
  { mode: 'long', short: 'Long' },
];
/** 25 → "25", 4.5 → "4:30" */
const fmtMin = (min: number) => (Number.isInteger(min) ? String(min) : formatClock(min * 60000).replace(/^0/, ''));

const STATUS = { idle: 'ready', running: 'running', paused: 'paused' } as const;

export default function App() {
  const p = usePomodoro();
  const look = useAppearance();
  const [themeOpen, setThemeOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const themeBtn = useRef<HTMLButtonElement>(null);
  const every = CONFIG.longBreakEvery;
  const filled = p.cycleCount === 0 ? 0 : p.cycleCount % every || every;
  const pristine = p.status === 'idle' && p.remainingMs === p.totalMs;
  const running = p.status === 'running';

  const closeTheme = useCallback(() => {
    setThemeOpen(false);
    requestAnimationFrame(() => themeBtn.current?.focus());
  }, []);

  // Keyboard: Space = start/pause, R = reset, 1/2/3 = modes. Off while the dialog is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (themeOpen || soundOpen || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea')) return;
      if (e.code === 'Space' && !target.closest('button')) {
        e.preventDefault();
        p.toggle();
      } else if (e.code === 'KeyR') p.reset();
      else if (e.key === '1') p.setMode('focus');
      else if (e.key === '2') p.setMode('short');
      else if (e.key === '3') p.setMode('long');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [p, themeOpen, soundOpen]);

  let noticeTitle = '';
  if (p.lastFinished && p.status === 'idle') {
    noticeTitle =
      p.lastFinished.mode !== 'focus'
        ? 'Break is over'
        : p.mode === 'long'
          ? `${every} focus sessions done — time for a long break`
          : 'Focus session complete';
  }

  const faceProps = {
    mode: p.mode,
    status: p.status,
    clock: p.clock,
    progress: p.progress,
    totalMs: p.totalMs,
    cycle: `${filled}/${every}`,
    completed: p.totalCompleted,
    onSetTime: p.setTime,
  };

  return (
    <div
      className="app"
      data-theme={look.theme}
      data-mode={p.mode}
      style={{ '--progress': p.progress, ...accentVars(look.accent[look.theme], look.theme) } as React.CSSProperties}
    >
      <div className="backdrop" aria-hidden="true" />
      {look.theme === 'scrapbook' && <ScrapbookDecor />}
      {look.theme === 'doodle' && <DoodleDecor />}

      <header className="topbar">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true" />
          <span className="brand__name">Pomodoro</span>
        </div>
        <button
          ref={themeBtn}
          type="button"
          className="theme-btn"
          onClick={() => setThemeOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={themeOpen}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z" />
            <circle cx="7.5" cy="11" r="1.2" />
            <circle cx="10" cy="7" r="1.2" />
            <circle cx="14.5" cy="7" r="1.2" />
            <circle cx="17" cy="10.5" r="1.2" />
          </svg>
          Theme
        </button>
        <SoundMenu sound={p.sound} setSound={p.setSound} preview={p.previewSound} onOpenChange={setSoundOpen} />
      </header>

      <main className="stage">
        <div className="modes" role="radiogroup" aria-label="Timer mode">
          {MODES.map(({ mode, short }, i) => (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={p.mode === mode}
              className={`mode${p.mode === mode ? ' is-active' : ''}`}
              onClick={() => p.setMode(mode)}
              title={`Key ${i + 1}`}
            >
              <span className="mode__full">{MODE_LABEL[mode]}</span>
              <span className="mode__short">{short}</span>
              <span className="mode__min">{fmtMin(p.cfg.durations[mode])}′</span>
            </button>
          ))}
        </div>

        <h1 className="sr-only">
          {MODE_LABEL[p.mode]}: {p.clock}, {STATUS[p.status]}
        </h1>
        {look.theme === 'hacker' ? (
          <HackerFace {...faceProps} />
        ) : look.theme === 'scrapbook' || look.theme === 'doodle' ? (
          <RoseFace {...faceProps} variant={look.theme} />
        ) : (
          <ClassicFace {...faceProps} />
        )}

        <div className="controls">
          <button type="button" className="btn btn--primary" onClick={p.toggle}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {running ? (
                <path d="M6.5 5.5h3.6v13H6.5zM13.9 5.5h3.6v13h-3.6z" />
              ) : (
                <path d="M8 5.5v13l10.5-6.5z" />
              )}
            </svg>
            <span className="btn__label">{running ? 'Pause' : p.status === 'paused' ? 'Resume' : 'Start'}</span>
          </button>
          <button type="button" className="btn" onClick={p.reset} disabled={pristine}>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="stroke">
              <path d="M4 12a8 8 0 1 0 2.4-5.7" />
              <path d="M4 4.5v4h4" />
            </svg>
            <span className="btn__label">Reset</span>
          </button>
        </div>

        <div className="track">
          <div className="dots" role="img" aria-label={`${filled} of ${every} focus sessions in this cycle`}>
            {Array.from({ length: every }, (_, i) => (
              <span key={i} className={`dot${i < filled ? ' is-done' : ''}`} />
            ))}
          </div>
          <span>
            Completed: <b>{p.totalCompleted}</b>
          </span>
        </div>

        {noticeTitle && (
          <div className="notice" role="status" aria-live="polite">
            <div className="notice__text">
              <b>{noticeTitle}</b>
              <span>
                Up next: {MODE_LABEL[p.mode].toLowerCase()} · {fmtMin(p.cfg.durations[p.mode])} min
              </span>
            </div>
            <div className="notice__actions">
              <button type="button" className="btn btn--primary btn--small" onClick={p.start}>
                <span className="btn__label">Start</span>
              </button>
              <button type="button" className="btn btn--small" onClick={p.dismiss}>
                <span className="btn__label">Later</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="hints" aria-hidden="true">
        <span><kbd>Space</kbd> start/pause</span>
        <span><kbd>R</kbd> reset</span>
        <span><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> modes</span>
      </footer>

      <ThemeDialog
        open={themeOpen}
        onClose={closeTheme}
        theme={look.theme}
        accent={look.accent}
        setTheme={look.setTheme}
        setAccent={look.setAccent}
      />
    </div>
  );
}
