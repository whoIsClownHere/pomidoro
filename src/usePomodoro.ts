import { useCallback, useEffect, useRef, useState } from 'react';
import * as E from './engine';
import { playSound, unlockAudio, type SoundId } from './sound';

export interface SoundSettings {
  on: boolean;
  id: SoundId;
  volume: number; // 0..1
}

/** Defaults: 25 / 5 / 15, long break after 4, next mode starts manually. */
export const CONFIG: E.TimerConfig = {
  durations: { focus: 25, short: 5, long: 15 },
  longBreakEvery: 4,
  autoStartNext: false,
};

const KEY = 'pomodoro-classic:v1';

function loadConfig(): E.TimerConfig {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY + ':durations') || 'null');
    if (saved) return { ...CONFIG, durations: { ...CONFIG.durations, ...saved } };
  } catch {
    /* ignore broken storage */
  }
  return CONFIG;
}

function loadState(cfg: E.TimerConfig): E.TimerState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = { ...E.initialState(cfg), ...JSON.parse(raw) } as E.TimerState;
      // Sessions that ended while the page was closed are completed now.
      return E.tick(saved, cfg, Date.now()).state;
    }
  } catch {
    /* ignore broken storage */
  }
  return E.initialState(cfg);
}

function loadSound(): SoundSettings {
  const fallback: SoundSettings = { on: localStorage.getItem(KEY + ':muted') !== '1', id: 'bell', volume: 0.7 };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY + ':sound') || 'null');
    if (saved) return { ...fallback, ...saved };
  } catch {
    /* ignore broken storage */
  }
  return fallback;
}

function store(key: string, value: unknown) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch {
    /* private mode */
  }
}

export function usePomodoro() {
  const [cfg, setCfg] = useState(loadConfig);
  const [state, setState] = useState(() => loadState(cfg));
  const [now, setNow] = useState(() => Date.now());
  const [sound, setSoundState] = useState(loadSound);
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;

  // While running: recompute remaining time from endAt (accurate in background tabs too).
  useEffect(() => {
    if (state.status !== 'running') return;
    const step = () => {
      const t = Date.now();
      setNow(t);
      setState((s) => {
        const r = E.tick(s, cfgRef.current, t);
        if (!r.finished) return s;
        const snd = soundRef.current;
        if (snd.on) queueMicrotask(() => playSound(snd.id, snd.volume));
        return r.state;
      });
    };
    step();
    const id = window.setInterval(step, 250);
    document.addEventListener('visibilitychange', step);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', step);
    };
  }, [state.status]);

  // Save after every action / transition.
  useEffect(() => store(KEY, state), [state]);
  useEffect(() => store(KEY + ':sound', sound), [sound]);
  useEffect(() => store(KEY + ':durations', cfg.durations), [cfg]);

  const remainingMs = E.remaining(state, now);
  const totalMs = E.durationMs(cfg, state.mode);
  const clock = E.formatClock(remainingMs);

  // Remaining time in the tab title.
  useEffect(() => {
    const pristine = state.status === 'idle' && remainingMs === totalMs;
    document.title = pristine
      ? 'Pomodoro'
      : `${clock} · ${E.MODE_LABEL[state.mode]}${state.status === 'paused' ? ' (paused)' : ''}`;
  }, [clock, state.mode, state.status, remainingMs, totalMs]);

  const act = useCallback((fn: (s: E.TimerState, t: number) => E.TimerState) => {
    unlockAudio();
    const t = Date.now();
    setNow(t);
    setState((s) => fn(s, t));
  }, []);

  /** New length for the current mode: saved as that mode's duration, timer set to it. */
  const setTime = useCallback((ms: number) => {
    const next: E.TimerConfig = {
      ...cfgRef.current,
      durations: { ...cfgRef.current.durations, [state.mode]: ms / 60000 },
    };
    cfgRef.current = next;
    setCfg(next);
    act((s) => E.setMode(s, next, s.mode));
  }, [act, state.mode]);

  return {
    ...state,
    cfg,
    remainingMs,
    totalMs,
    clock,
    progress: Math.min(1, Math.max(0, 1 - remainingMs / totalMs)),
    sound,
    setSound: (patch: Partial<SoundSettings>) => setSoundState((s) => ({ ...s, ...patch })),
    previewSound: (id: SoundId, volume: number) => {
      unlockAudio();
      playSound(id, volume);
    },
    toggle: () => act((s, t) => (s.status === 'running' ? E.pause(s, t) : E.start(s, t))),
    start: () => act((s, t) => E.start(s, t)),
    reset: () => act((s) => E.reset(s, cfgRef.current)),
    setMode: (m: E.Mode) => act((s) => (s.mode === m ? s : E.setMode(s, cfgRef.current, m))),
    setTime,
    dismiss: () => setState((s) => ({ ...s, lastFinished: null })),
  };
}
