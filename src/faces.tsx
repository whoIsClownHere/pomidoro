import { MODE_LABEL, type Mode, type Status } from './engine';
import { TimeDisplay } from './TimeDisplay';

interface FaceProps {
  mode: Mode;
  status: Status;
  clock: string;
  progress: number;
  totalMs: number;
  cycle: string;
  completed: number;
  onSetTime: (ms: number) => void;
}

const STATUS = { idle: 'ready', running: 'running', paused: 'paused' } as const;

export function ClassicFace({ mode, status, clock, progress, onSetTime }: FaceProps) {
  return (
    <div className="face">
      <TimeDisplay className="digits" clock={clock} onSet={onSetTime} />
      <div className="progress" aria-hidden="true"><span /></div>
      <div className="meta" aria-hidden="true">
        <span>{MODE_LABEL[mode]} · {STATUS[status]}</span>
        <span>{Math.round(progress * 100)}%</span>
      </div>
    </div>
  );
}

const PROC: Record<Mode, string> = { focus: 'focus', short: 'short_break', long: 'long_break' };

function statusLine(mode: Mode, status: Status) {
  if (status === 'paused') return 'PAUSED';
  if (status === 'running') return mode === 'focus' ? 'FOCUS RUNNING' : 'BREAK RUNNING';
  return mode === 'focus' ? 'READY' : 'BREAK · READY';
}

export function HackerFace({ mode, status, clock, progress, totalMs, cycle, completed, onSetTime }: FaceProps) {
  const width = 28;
  const filled = Math.round(progress * width);
  return (
    <div className="hk-window">
      <div className="hk-titlebar" aria-hidden="true">
        <span className="hk-dots"><i /><i /><i /></span>
        <span>pomodoro — tty1 — {PROC[mode]}.proc</span>
      </div>
      <div className="hk-body">
        <div className="hk-line hk-dim" aria-hidden="true">
          <span className="hk-prompt">~$</span> pomodoro run --mode={PROC[mode]} --len={Math.round(totalMs / 60000)}m
        </div>
        <div className="hk-line" aria-hidden="true">
          <span className={`hk-badge hk-badge--${status}`}>[ {STATUS[status].toUpperCase()} ]</span>
          <span className="hk-status">STATUS: {statusLine(mode, status)}</span>
        </div>
        <TimeDisplay className="digits hk-digits" clock={clock} onSet={onSetTime} />
        <div className="hk-line" aria-hidden="true">
          <span className="hk-bar">{'█'.repeat(filled)}<span className="hk-dim">{'░'.repeat(width - filled)}</span></span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="hk-line hk-dim" aria-hidden="true">
          cycle {cycle} · done {completed}
          <span className="hk-cursor" />
        </div>
      </div>
    </div>
  );
}
