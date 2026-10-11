import { useEffect, useRef, useState } from 'react';

const MAX_SECONDS = 5 * 60 * 60; // 5 hours

/**
 * "45" → 45 min, "45:30" → 45 min 30 s, "1:15:00" → 1 h 15 min.
 * Returns milliseconds, or null if the text isn't a usable time.
 */
export function parseTime(text: string): number | null {
  const m = text.trim().replace(/\s+/g, '').match(/^(\d{1,3})(?:[:.](\d{1,2}))?(?:[:.](\d{1,2}))?$/);
  if (!m) return null;
  const [a, b, c] = [m[1], m[2], m[3]].map((v) => (v === undefined ? undefined : Number(v)));
  let seconds: number;
  if (c !== undefined) {
    if (b! > 59 || c > 59) return null;
    seconds = a! * 3600 + b! * 60 + c;
  } else if (b !== undefined) {
    if (b > 59) return null;
    seconds = a! * 60 + b;
  } else {
    seconds = a! * 60;
  }
  if (seconds < 1 || seconds > MAX_SECONDS) return null;
  return seconds * 1000;
}

/** The big clock. Click it to type a new time; Enter sets it, Esc cancels. */
export function TimeDisplay({ clock, className, onSet }: { clock: string; className: string; onSet: (ms: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (!editing) return;
    done.current = false;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  if (!editing) {
    return (
      <button
        type="button"
        className={`${className} time-btn`}
        onClick={() => {
          setDraft(clock);
          setError(false);
          setEditing(true);
        }}
        title="Click to change the time"
        aria-label={`${clock}. Change the time`}
      >
        {clock}
      </button>
    );
  }

  const close = () => {
    done.current = true;
    setEditing(false);
  };
  const commit = () => {
    if (done.current) return;
    const ms = parseTime(draft);
    if (ms === null) {
      setError(true);
      return false;
    }
    onSet(ms);
    close();
    return true;
  };

  return (
    <span className="time-edit">
      <input
        ref={inputRef}
        className={`${className} time-input${error ? ' is-error' : ''}`}
        value={draft}
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        maxLength={8}
        style={{ width: `${Math.max(4, draft.length) + 0.4}ch` }}
        aria-label="New time, for example 25, 45:00 or 1:15:00"
        aria-invalid={error}
        onChange={(e) => {
          setDraft(e.target.value);
          setError(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            close();
          }
        }}
        onBlur={() => {
          // Clicking away keeps a valid time and drops an invalid one.
          if (done.current) return;
          if (parseTime(draft) === null) close();
          else commit();
        }}
      />
      <span className={`time-hint${error ? ' is-error' : ''}`} aria-live="polite">
        {error ? 'Try 25, 45:00 or 1:15:00' : 'Enter to set · Esc to cancel'}
      </span>
    </span>
  );
}
