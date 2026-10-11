import { useEffect, useRef } from 'react';
import { SWATCHES, THEMES, type ThemeId } from './appearance';
import { DoodlePreview, ScrapbookPreview } from './rose';

interface Props {
  open: boolean;
  onClose: () => void;
  theme: ThemeId;
  accent: Record<ThemeId, string | null>;
  setTheme: (t: ThemeId) => void;
  setAccent: (hex: string | null) => void;
}

/** Mini previews of each theme, painted with that theme's current accent. */
function Preview({ id, color }: { id: ThemeId; color: string }) {
  const style = { '--pv': color } as React.CSSProperties;
  if (id === 'scrapbook') return <ScrapbookPreview color={color} />;
  if (id === 'doodle') return <DoodlePreview color={color} />;
  if (id === 'hacker') {
    return (
      <div className="pv pv-hacker" style={style}>
        <span className="pv-hacker__bar">tty1 — focus.proc</span>
        <span className="pv-hacker__digits">25:00</span>
        <span className="pv-hacker__line">█████░░░░░ 48%</span>
      </div>
    );
  }
  return (
    <div className="pv pv-classic" style={style}>
      <span className="pv-classic__digits">25:00</span>
      <span className="pv-classic__bar"><i /></span>
      <span className="pv-classic__btn">Start</span>
    </div>
  );
}

export function ThemeDialog({ open, onClose, theme, accent, setTheme, setAccent }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const current = THEMES.find((t) => t.id === theme)!;
  const custom = accent[theme];
  const shown = custom ?? current.defaultAccent;
  const isCustom = !!custom && !SWATCHES.some((s) => s.hex === custom);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.querySelector<HTMLElement>('.theme-card.is-selected')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !dialogRef.current) return;
      // Keep focus inside the dialog.
      const items = dialogRef.current.querySelectorAll<HTMLElement>('button, input');
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} className="dialog" role="dialog" aria-modal="true" aria-labelledby="theme-title">
        <div className="dialog__head">
          <h2 id="theme-title">Theme</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="theme-list" role="radiogroup" aria-label="Theme">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={theme === t.id}
              className={`theme-card${theme === t.id ? ' is-selected' : ''}`}
              onClick={() => setTheme(t.id)}
            >
              <Preview id={t.id} color={accent[t.id] ?? t.defaultAccent} />
              <span className="theme-card__text">
                <span className="theme-card__name">{t.name}</span>
                <span className="theme-card__desc">{t.description}</span>
              </span>
              <span className="theme-card__check" aria-hidden="true" />
            </button>
          ))}
        </div>

        <section className="accent">
          <div className="accent__head">
            <h3>Accent color</h3>
            <span className="accent__for">for {current.name}</span>
          </div>
          <div className="swatches" role="radiogroup" aria-label="Accent color">
            <button
              type="button"
              role="radio"
              aria-checked={custom === null}
              className={`swatch swatch--default${custom === null ? ' is-selected' : ''}`}
              onClick={() => setAccent(null)}
              title="Theme default"
            >
              <span style={{ background: current.defaultAccent }} />
              Default
            </button>
            {SWATCHES.map((s) => (
              <button
                key={s.hex}
                type="button"
                role="radio"
                aria-checked={custom === s.hex}
                aria-label={s.name}
                title={s.name}
                className={`swatch${custom === s.hex ? ' is-selected' : ''}`}
                onClick={() => setAccent(s.hex)}
              >
                <span style={{ background: s.hex }} />
              </button>
            ))}
            <label className={`swatch swatch--custom${isCustom ? ' is-selected' : ''}`} title="Pick any color">
              <span style={isCustom ? { background: shown } : undefined} />
              Custom
              <input type="color" value={shown} onChange={(e) => setAccent(e.target.value)} aria-label="Custom accent color" />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
