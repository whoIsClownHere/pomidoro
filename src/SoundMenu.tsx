import { useEffect, useRef, useState } from 'react';
import { SOUNDS, type SoundId } from './sound';
import type { SoundSettings } from './usePomodoro';

interface Props {
  sound: SoundSettings;
  setSound: (patch: Partial<SoundSettings>) => void;
  preview: (id: SoundId, volume: number) => void;
  /** tells the app to pause its keyboard shortcuts while the panel is open */
  onOpenChange?: (open: boolean) => void;
}

function SpeakerIcon({ on, volume }: { on: boolean; volume: number }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
      {!on || volume === 0 ? (
        <path d="M16 9.5l5 5M21 9.5l-5 5" />
      ) : (
        <>
          <path d="M15.5 9a4 4 0 0 1 0 6" />
          {volume > 0.45 && <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />}
        </>
      )}
    </svg>
  );
}

/** Speaker button in the top-right corner + its dropdown sound panel. */
export function SoundMenu({ sound, setSound, preview, onOpenChange }: Props) {
  const [open, setOpenState] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const setOpen = (v: boolean) => {
    setOpenState(v);
    onOpenChange?.(v);
  };

  // Close on Esc or a click outside.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    wrapRef.current?.querySelector<HTMLElement>('.sound-row.is-selected')?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const label = sound.on ? `Sound: ${SOUNDS.find((s) => s.id === sound.id)?.name}` : 'Sound is off';

  return (
    <div className="sound-menu" ref={wrapRef}>
      <button
        ref={btnRef}
        type="button"
        className="icon-btn"
        onClick={() => setOpen(!open)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label}. Sound settings`}
        title={label}
      >
        <SpeakerIcon on={sound.on} volume={sound.volume} />
      </button>

      {open && (
        <div className="sound-panel" role="dialog" aria-label="Sound settings">
          <div className="sound-panel__head">
            <span className="sound-panel__title">Sound</span>
            <label className="sound-switch">
              <span>{sound.on ? 'On' : 'Off'}</span>
              <input
                type="checkbox"
                role="switch"
                checked={sound.on}
                onChange={(e) => setSound({ on: e.target.checked })}
                aria-label="Play a sound when the timer ends"
              />
              <span className="sound-switch__track" aria-hidden="true"><span /></span>
            </label>
          </div>

          <div className={`sound-panel__body${sound.on ? '' : ' is-off'}`}>
            <p className="sound-panel__hint">Plays when a session ends. Tap one to hear it.</p>
            <div className="sound-list" role="radiogroup" aria-label="End-of-session sound">
              {SOUNDS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={sound.id === s.id}
                  disabled={!sound.on}
                  className={`sound-row${sound.id === s.id ? ' is-selected' : ''}`}
                  onClick={() => {
                    setSound({ id: s.id });
                    preview(s.id, sound.volume);
                  }}
                >
                  <span className="sound-row__play" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" /></svg>
                  </span>
                  <span className="sound-row__text">
                    <span className="sound-row__name">{s.name}</span>
                    <span className="sound-row__note">{s.note}</span>
                  </span>
                  <span className="sound-row__check" aria-hidden="true" />
                </button>
              ))}
            </div>

            <label className="sound-volume">
              <span className="sound-volume__label">
                Volume <b>{Math.round(sound.volume * 100)}%</b>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(sound.volume * 100)}
                disabled={!sound.on}
                style={{ '--fill': `${sound.volume * 100}%` } as React.CSSProperties}
                onChange={(e) => setSound({ volume: Number(e.target.value) / 100 })}
                onPointerUp={(e) => preview(sound.id, Number((e.target as HTMLInputElement).value) / 100)}
                onKeyUp={(e) => {
                  if (e.key.startsWith('Arrow')) preview(sound.id, Number((e.target as HTMLInputElement).value) / 100);
                }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
