import { describe, expect, it } from 'vitest';
import * as E from './engine';

const cfg: E.TimerConfig = { durations: { focus: 25, short: 5, long: 15 }, longBreakEvery: 4, autoStartNext: false };
const MIN = 60_000;

describe('timer engine', () => {
  it('counts down from endAt, not from ticks', () => {
    let s = E.start(E.initialState(cfg), 0);
    expect(E.remaining(s, 10 * MIN)).toBe(15 * MIN);
    s = E.pause(s, 10 * MIN);
    expect(s.remainingMs).toBe(15 * MIN);
    s = E.start(s, 100 * MIN); // resume much later
    expect(E.remaining(s, 105 * MIN)).toBe(10 * MIN);
  });

  it('reset returns to the full duration of the current mode', () => {
    let s = E.start(E.initialState(cfg), 0);
    s = E.reset(E.pause(s, 3 * MIN), cfg);
    expect(s.status).toBe('idle');
    expect(s.remainingMs).toBe(25 * MIN);
  });

  it('finishes into a short break that waits for manual start', () => {
    const s = E.start(E.initialState(cfg), 0);
    const { state, finished } = E.tick(s, cfg, 25 * MIN + 5);
    expect(finished).toBe(1);
    expect(state.mode).toBe('short');
    expect(state.status).toBe('idle');
    expect(state.totalCompleted).toBe(1);
    expect(state.lastFinished?.mode).toBe('focus');
  });

  it('offers a long break after four focus sessions', () => {
    let s = E.initialState(cfg);
    for (let i = 0; i < 4; i++) {
      s = E.setMode(s, cfg, 'focus');
      s = E.tick(E.start(s, 0), cfg, 26 * MIN).state;
    }
    expect(s.mode).toBe('long');
    expect(s.cycleCount).toBe(4);
    s = E.tick(E.start(s, 0), cfg, 16 * MIN).state;
    expect(s.mode).toBe('focus');
    expect(s.cycleCount).toBe(0);
  });

  it('auto-start chains sessions even if the tab slept through them', () => {
    const auto = { ...cfg, autoStartNext: true };
    const s = E.start(E.initialState(auto), 0);
    const { state, finished } = E.tick(s, auto, 31 * MIN);
    expect(finished).toBe(2); // focus (25) + short (5)
    expect(state.mode).toBe('focus');
    expect(E.remaining(state, 31 * MIN)).toBe(24 * MIN);
  });

  it('formats the clock', () => {
    expect(E.formatClock(25 * MIN)).toBe('25:00');
    expect(E.formatClock(61_001)).toBe('01:02');
  });
});
