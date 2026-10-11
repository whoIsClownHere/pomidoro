/**
 * End-of-session sounds, synthesized with the Web Audio API —
 * no audio files to download or license.
 */
export type SoundId = 'bell' | 'chime' | 'kalimba' | 'marimba' | 'bowl' | 'birds' | 'digital';

export const SOUNDS: { id: SoundId; name: string; note: string }[] = [
  { id: 'bell', name: 'Bell', note: 'Two clear strikes' },
  { id: 'chime', name: 'Soft chime', note: 'A gentle rising chord' },
  { id: 'kalimba', name: 'Kalimba', note: 'Plucked thumb piano' },
  { id: 'marimba', name: 'Marimba', note: 'Warm wooden notes' },
  { id: 'bowl', name: 'Singing bowl', note: 'Long, calm hum' },
  { id: 'birds', name: 'Birdsong', note: 'A few light chirps' },
  { id: 'digital', name: 'Digital', note: 'Classic beep-beep' },
];

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Call on any click so the browser allows the sound later. */
export function unlockAudio() {
  audio();
}

interface Tone {
  freq: number;
  at: number; // seconds from now
  len: number; // decay length, seconds
  vol: number;
  type?: OscillatorType;
  attack?: number;
  /** slide the pitch to this frequency (for chirps) */
  to?: number;
}

function tone(ac: AudioContext, out: AudioNode, t0: number, { freq, at, len, vol, type = 'sine', attack = 0.01, to }: Tone) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const start = t0 + at;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + len * 0.6);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + len);
  osc.connect(gain).connect(out);
  osc.start(start);
  osc.stop(start + len + 0.05);
}

const RECIPES: Record<SoundId, () => Tone[]> = {
  bell: () =>
    [[659.25, 0], [880, 0.45], [659.25, 0.9]].flatMap(([f, d]) => [
      { freq: f, at: d, len: 1.6, vol: 1 },
      { freq: f * 2.76, at: d, len: 0.6, vol: 0.18 },
    ]),
  chime: () =>
    [523.25, 659.25, 783.99, 1046.5].map((f, i) => ({ freq: f, at: i * 0.18, len: 1.3, vol: 0.8, type: 'triangle' as const })),
  kalimba: () =>
    [[783.99, 0], [987.77, 0.2], [1174.66, 0.4], [987.77, 0.6], [1318.5, 0.85]].flatMap(([f, d]) => [
      { freq: f, at: d, len: 0.9, vol: 0.9, attack: 0.004 },
      { freq: f * 3, at: d, len: 0.15, vol: 0.12, attack: 0.002 },
    ]),
  marimba: () =>
    [[523.25, 0], [659.25, 0.14], [783.99, 0.28], [1046.5, 0.5]].flatMap(([f, d]) => [
      { freq: f, at: d, len: 0.55, vol: 1, attack: 0.003 },
      { freq: f * 4, at: d, len: 0.08, vol: 0.2, attack: 0.002 },
    ]),
  bowl: () => [
    { freq: 220, at: 0, len: 4, vol: 0.8, attack: 0.08 },
    { freq: 221.6, at: 0, len: 4, vol: 0.6, attack: 0.08 },
    { freq: 220 * 2.71, at: 0, len: 2.6, vol: 0.25, attack: 0.05 },
    { freq: 220 * 5.1, at: 0, len: 1.4, vol: 0.08, attack: 0.03 },
  ],
  birds: () =>
    [0, 0.12, 0.24, 0.62, 0.72, 1.15, 1.25, 1.35].map((d, i) => ({
      freq: 2600 + (i % 3) * 300,
      to: 3900 + (i % 2) * 500,
      at: d,
      len: 0.09,
      vol: 0.35,
      attack: 0.005,
    })),
  digital: () =>
    [0, 0.32, 0.64].flatMap((d) => [
      { freq: 1318.5, at: d, len: 0.12, vol: 0.45, type: 'square' as const, attack: 0.003 },
      { freq: 1318.5, at: d + 0.14, len: 0.1, vol: 0.45, type: 'square' as const, attack: 0.003 },
    ]),
};

export function playSound(id: SoundId, volume: number) {
  const ac = audio();
  if (!ac || volume <= 0) return;
  const master = ac.createGain();
  master.gain.value = volume * 0.35;
  master.connect(ac.destination);
  const t0 = ac.currentTime + 0.02;
  (RECIPES[id] ?? RECIPES.bell)().forEach((t) => tone(ac, master, t0, t));
}
