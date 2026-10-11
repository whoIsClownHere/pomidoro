/**
 * Pure timer engine. No React, no DOM — every function takes the current
 * state plus "now" (ms timestamp) and returns the next state.
 *
 * The source of truth while running is `endAt` (a wall-clock timestamp),
 * so throttled/background tabs never drift: remaining = endAt - now.
 */

export type Mode = 'focus' | 'short' | 'long';
export type Status = 'idle' | 'running' | 'paused';

export interface Durations {
  focus: number; // minutes
  short: number;
  long: number;
}

export interface TimerConfig {
  durations: Durations;
  longBreakEvery: number; // focus sessions before a long break
  autoStartNext: boolean;
}

export interface TimerState {
  mode: Mode;
  status: Status;
  /** Wall-clock ms when the running session ends. Only meaningful while running. */
  endAt: number | null;
  /** Remaining ms when idle/paused. */
  remainingMs: number;
  /** Focus sessions completed in the current cycle (resets after a long break starts). */
  cycleCount: number;
  /** All focus sessions completed (until the user clears it). */
  totalCompleted: number;
  /** Set right after a session ends; drives the "what's next" notice. */
  lastFinished: { mode: Mode; at: number } | null;
}

export const MODE_LABEL: Record<Mode, string> = {
  focus: 'Focus',
  short: 'Short break',
  long: 'Long break',
};

export const durationMs = (cfg: TimerConfig, mode: Mode) =>
  Math.round(cfg.durations[mode] * 60_000);

export function initialState(cfg: TimerConfig): TimerState {
  return {
    mode: 'focus',
    status: 'idle',
    endAt: null,
    remainingMs: durationMs(cfg, 'focus'),
    cycleCount: 0,
    totalCompleted: 0,
    lastFinished: null,
  };
}

export function remaining(s: TimerState, now: number): number {
  if (s.status === 'running' && s.endAt != null) return Math.max(0, s.endAt - now);
  return s.remainingMs;
}

export function start(s: TimerState, now: number): TimerState {
  if (s.status === 'running') return s;
  const ms = s.remainingMs > 0 ? s.remainingMs : 0;
  return { ...s, status: 'running', endAt: now + ms, lastFinished: null };
}

export function pause(s: TimerState, now: number): TimerState {
  if (s.status !== 'running') return s;
  return { ...s, status: 'paused', remainingMs: remaining(s, now), endAt: null };
}

export function reset(s: TimerState, cfg: TimerConfig): TimerState {
  return { ...s, status: 'idle', endAt: null, remainingMs: durationMs(cfg, s.mode), lastFinished: null };
}

export function setMode(s: TimerState, cfg: TimerConfig, mode: Mode): TimerState {
  return { ...s, mode, status: 'idle', endAt: null, remainingMs: durationMs(cfg, mode), lastFinished: null };
}

export function nextModeAfter(s: TimerState, cfg: TimerConfig): Mode {
  if (s.mode !== 'focus') return 'focus';
  return (s.cycleCount + 1) % cfg.longBreakEvery === 0 ? 'long' : 'short';
}

/** Session reached zero: count it, move to the next mode, start only if auto-start is on. */
export function complete(s: TimerState, cfg: TimerConfig, now: number): TimerState {
  const next = nextModeAfter(s, cfg);
  const wasFocus = s.mode === 'focus';
  let cycleCount = wasFocus ? s.cycleCount + 1 : s.cycleCount;
  // A long break closes the cycle.
  if (s.mode === 'long') cycleCount = 0;
  const base: TimerState = {
    ...s,
    mode: next,
    status: 'idle',
    endAt: null,
    remainingMs: durationMs(cfg, next),
    cycleCount,
    totalCompleted: wasFocus ? s.totalCompleted + 1 : s.totalCompleted,
    lastFinished: { mode: s.mode, at: now },
  };
  if (!cfg.autoStartNext) return base;
  // Start from the moment the previous one ended, so background tabs stay honest.
  const endedAt = s.endAt ?? now;
  return { ...base, status: 'running', endAt: endedAt + durationMs(cfg, next) };
}

/**
 * Advance through every session that has elapsed by `now`.
 * Returns the new state and how many sessions finished (for the sound).
 */
export function tick(s: TimerState, cfg: TimerConfig, now: number): { state: TimerState; finished: number } {
  let state = s;
  let finished = 0;
  while (state.status === 'running' && state.endAt != null && state.endAt <= now && finished < 20) {
    state = complete(state, cfg, now);
    finished++;
  }
  return { state, finished };
}

/** Durations changed in settings: keep an untouched idle timer in sync. */
export function applyConfig(s: TimerState, prev: TimerConfig, cfg: TimerConfig): TimerState {
  if (s.status === 'idle' && s.remainingMs === durationMs(prev, s.mode)) {
    return { ...s, remainingMs: durationMs(cfg, s.mode) };
  }
  return s;
}

export function clearCount(s: TimerState): TimerState {
  return { ...s, cycleCount: 0, totalCompleted: 0 };
}

export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
