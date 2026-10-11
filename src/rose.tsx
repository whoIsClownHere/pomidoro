/**
 * Art + timer faces for the two rose themes:
 * "Rose Scrapbook" (collage) and "Blossom Doodle" (flowers with white doodles).
 * Flowers are heads only — no stems.
 */
import type { Mode, Status } from './engine';
import { TimeDisplay } from './TimeDisplay';

const ROT5 = [0, 72, 144, 216, 288];
const ROT6 = [0, 60, 120, 180, 240, 300];
const STAMENS = [
  [0, 19], [36, 17], [72, 20], [108, 16], [144, 19],
  [180, 17], [216, 20], [252, 16], [288, 19], [324, 17],
];

/** Shared shapes, referenced with <use href="#rs-..."> */
export function RoseDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <path id="rs-petal" d="M0 0 C -16 -6 -22 -30 -12 -40 C -7 -44 -3 -41 0 -37 C 3 -41 7 -44 12 -40 C 22 -30 16 -6 0 0 Z" />
        <g id="rs-blossom-sil">
          {ROT5.map((a) => <use key={a} href="#rs-petal" transform={`rotate(${a})`} />)}
        </g>
        <g id="rs-blossom">
          <use href="#rs-blossom-sil" fill="var(--r-200)" stroke="var(--r-300)" strokeWidth="0.8" />
          <g stroke="var(--r-250)" strokeWidth="0.9">
            {ROT5.map((a) => <path key={a} d="M0 -6 L 0 -30" transform={`rotate(${a})`} />)}
          </g>
          <circle r="15" fill="var(--r-50)" />
          <g stroke="var(--r-500)" strokeWidth="1" strokeLinecap="round">
            {STAMENS.map(([a, l]) => <line key={a} x1="0" y1="0" x2="0" y2={-l} transform={`rotate(${a})`} />)}
          </g>
          <g fill="var(--r-600)">
            {STAMENS.map(([a, l]) => <circle key={a} cx="0" cy={-l} r="1.9" transform={`rotate(${a})`} />)}
          </g>
          <circle r="5" fill="var(--r-600)" />
        </g>
        <g id="rs-bud">
          <ellipse rx="10" ry="13" fill="var(--r-400)" />
          <path d="M-6 -6 C -3 -10 3 -10 6 -6" fill="none" stroke="var(--r-200)" strokeWidth="2" strokeLinecap="round" />
        </g>
        <path id="rs-lpetal" d="M0 0 C -18 -18 -22 -58 -6 -88 C -3 -94 3 -94 6 -88 C 22 -58 18 -18 0 0 Z" />
        <g id="rs-lily-sil">
          {ROT6.map((a) => <use key={a} href="#rs-lpetal" transform={`rotate(${a})`} />)}
        </g>
        <g id="rs-lily">
          <g transform="rotate(30) scale(0.92)" fill="var(--r-50)" stroke="var(--r-250)" strokeWidth="1.3">
            {[0, 120, 240].map((a) => <use key={a} href="#rs-lpetal" transform={`rotate(${a})`} />)}
          </g>
          <g fill="#ffffff" stroke="var(--r-250)" strokeWidth="1.3">
            {[0, 120, 240].map((a) => <use key={a} href="#rs-lpetal" transform={`rotate(${a})`} />)}
          </g>
          <g fill="var(--r-150)">
            {[0, 120, 240].map((a) => (
              <path key={a} d="M0 -8 C -4 -30 -3 -54 0 -68 C 3 -54 4 -30 0 -8 Z" transform={`rotate(${a})`} />
            ))}
          </g>
          <circle r="9" fill="var(--r-100)" />
          <g fill="none" stroke="var(--r-300)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M0 0 C 4 -18 10 -34 12 -46" />
            <path d="M0 0 C 18 -6 32 -4 42 4" />
            <path d="M0 0 C 14 14 18 28 16 40" />
            <path d="M0 0 C -6 18 -16 30 -24 36" />
            <path d="M0 0 C -18 2 -32 -6 -40 -16" />
            <path d="M0 0 C -10 -14 -12 -30 -8 -44" />
          </g>
          <g fill="var(--r-700)">
            <ellipse cx="12" cy="-48" rx="2.6" ry="6" transform="rotate(20 12 -48)" />
            <ellipse cx="44" cy="5" rx="2.6" ry="6" transform="rotate(80 44 5)" />
            <ellipse cx="16" cy="42" rx="2.6" ry="6" transform="rotate(5 16 42)" />
            <ellipse cx="-25" cy="38" rx="2.6" ry="6" transform="rotate(-40 -25 38)" />
            <ellipse cx="-42" cy="-17" rx="2.6" ry="6" transform="rotate(-70 -42 -17)" />
            <ellipse cx="-8" cy="-46" rx="2.6" ry="6" transform="rotate(-10 -8 -46)" />
          </g>
        </g>
        <path id="rs-heart" d="M0 6 C -8 -1 -13 -6 -8 -12 C -4 -16 0 -12 0 -9 C 0 -12 4 -16 8 -12 C 13 -6 8 -1 0 6 Z" />
        <path id="rs-spark" d="M0 -10 C 1 -3 3 -1 10 0 C 3 1 1 3 0 10 C -1 3 -3 1 -10 0 C -3 -1 -1 -3 0 -10 Z" />
        <pattern id="rs-stripe" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="5" height="10" fill="#ffffff" fillOpacity="0.5" />
        </pattern>
      </defs>
    </svg>
  );
}

/* ---------- small helpers ---------- */

type Place = [x: number, y: number, rotate: number, scale: number];
const tf = ([x, y, r, s]: Place) => `translate(${x} ${y}) rotate(${r}) scale(${s})`;

/** Flowers drawn as stickers: white cut-out halo first, then the flowers on top. */
function Stickers({ blossoms = [], lilies = [], buds = [] }: { blossoms?: Place[]; lilies?: Place[]; buds?: Place[] }) {
  return (
    <>
      <g fill="#ffffff" stroke="#ffffff" strokeWidth="12" strokeLinejoin="round">
        {lilies.map((p, i) => <use key={`l${i}`} href="#rs-lily-sil" transform={tf(p)} />)}
        {blossoms.map((p, i) => <use key={`b${i}`} href="#rs-blossom-sil" transform={tf(p)} />)}
        {buds.map((p, i) => <ellipse key={`u${i}`} rx="10" ry="13" transform={tf(p)} />)}
      </g>
      {lilies.map((p, i) => <use key={`L${i}`} href="#rs-lily" transform={tf(p)} />)}
      {[...blossoms].reverse().map((p, i) => <use key={`B${i}`} href="#rs-blossom" transform={tf(p)} />)}
      {buds.map((p, i) => <use key={`U${i}`} href="#rs-bud" transform={tf(p)} />)}
    </>
  );
}

function Doodles({ paths, width = 4 }: { paths: string[]; width?: number }) {
  return (
    <g fill="none" stroke="#ffffff" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d) => <path key={d} d={d} />)}
    </g>
  );
}

const Spark = ({ x, y, s = 1, fill = '#ffffff' }: { x: number; y: number; s?: number; fill?: string }) => (
  <use href="#rs-spark" transform={`translate(${x} ${y}) scale(${s})`} fill={fill} />
);
const Heart = ({ x, y, s = 1, r = 0, fill = 'var(--r-500)' }: { x: number; y: number; s?: number; r?: number; fill?: string }) => (
  <use href="#rs-heart" transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill={fill} />
);

/* ================= Rose Scrapbook ================= */

const Tape = ({ x, y, w = 92, r = 0 }: { x: number; y: number; w?: number; r?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect width={w} height="26" fill="var(--r-400)" fillOpacity="0.65" />
    <rect width={w} height="26" fill="url(#rs-stripe)" />
  </g>
);

const SB_TEXT = { fontFamily: 'Caveat, cursive', fontWeight: 500 } as const;

export function ScrapbookDecor() {
  return (
    <div className="rose-decor" aria-hidden="true">
      <RoseDefs />
      {/* top-left: handwritten note + stamp */}
      <svg className="rd rd-tl" viewBox="30 80 410 380">
        <g transform="translate(64 116) rotate(-5)">
          <rect width="300" height="200" fill="var(--r-50)" stroke="var(--r-250)" strokeWidth="1.2" />
          <Tape x={104} y={-14} />
          <text x="150" y="80" textAnchor="middle" fontSize="36" fill="var(--r-700)" {...SB_TEXT}>one small step,</text>
          <text x="150" y="120" textAnchor="middle" fontSize="36" fill="var(--r-700)" {...SB_TEXT}>then another</text>
          <use href="#rs-heart" transform="translate(150 160) scale(1.1)" fill="none" stroke="var(--r-600)" strokeWidth="1.6" />
        </g>
        <g transform="translate(310 360) rotate(7)">
          <rect x="-62" y="-78" width="124" height="156" fill="#ffffff" />
          <rect x="-62" y="-78" width="124" height="156" fill="none" stroke="var(--r-bg)" strokeWidth="9" strokeDasharray="0 11" strokeLinecap="round" />
          <rect x="-50" y="-66" width="100" height="112" fill="var(--r-200)" stroke="var(--r-300)" />
          <text x="0" y="-48" textAnchor="middle" fontFamily="Nunito, sans-serif" fontSize="11" fontWeight="800" letterSpacing="2" fill="var(--r-700)">FOCUS</text>
          <use href="#rs-blossom" transform="scale(0.8)" />
          <text x="0" y="66" textAnchor="middle" fontFamily="Nunito, sans-serif" fontSize="12" fontWeight="800" letterSpacing="2" fill="var(--r-700)">EN ROSE</text>
        </g>
        <Heart x={430} y={150} s={1.2} r={-10} />
        <Spark x={410} y={92} s={0.9} />
      </svg>

      {/* top-right: blossom cluster */}
      <svg className="rd rd-tr" viewBox="1030 100 400 290">
        <Stickers
          blossoms={[[1180, 205, 10, 1.15], [1272, 172, -20, 1], [1300, 262, 30, 0.95], [1200, 292, -5, 0.85], [1116, 250, 40, 0.7]]}
          buds={[[1356, 200, 25, 1], [1136, 160, -30, 0.8], [1340, 326, 40, 0.9]]}
        />
        <Doodles
          paths={[
            'M1070 310 C 1050 280 1064 250 1080 240 C 1060 210 1080 180 1104 186 C 1110 150 1150 140 1170 156',
            'M1230 120 C 1250 104 1280 110 1290 124 C 1310 112 1340 120 1344 146',
            'M1380 240 C 1396 262 1392 292 1374 304',
            'M1140 350 C 1170 362 1210 360 1236 344',
            'M1090 140 L 1076 124', 'M1110 128 L 1106 108', 'M1066 162 L 1046 156',
          ]}
        />
        <Heart x={1396} y={352} s={1.2} fill="#ffffff" />
        <Heart x={1372} y={374} s={0.8} fill="#ffffff" />
      </svg>

      {/* bottom-right: bow, to-do note, glitter star */}
      <svg className="rd rd-br" viewBox="1000 420 440 480">
        <g transform="translate(1114 650) rotate(4)">
          <rect width="262" height="214" fill="var(--r-100)" stroke="var(--r-250)" strokeWidth="1.2" />
          <text x="26" y="62" fontFamily="Nunito, sans-serif" fontSize="34" fontWeight="800" letterSpacing="5" fill="none" stroke="var(--r-700)" strokeWidth="1.4">TO DO:</text>
          <text x="28" y="108" fontSize="32" fill="var(--r-muted)" {...SB_TEXT}>♡ focus</text>
          <text x="28" y="146" fontSize="32" fill="var(--r-muted)" {...SB_TEXT}>♡ rest</text>
          <text x="28" y="184" fontSize="32" fill="var(--r-muted)" {...SB_TEXT}>♡ repeat</text>
        </g>
        <Bow x={1282} y={496} s={0.86} r={-6} />
        <GlitterStar x={1040} y={800} r={-12} />
        <Heart x={1050} y={610} r={12} />
        <Spark x={1060} y={440} s={1.1} />
      </svg>

      {/* bottom-left: swatch card + lilies */}
      <svg className="rd rd-bl" viewBox="0 440 450 460">
        <g transform="translate(272 486) rotate(-4)">
          <rect width="172" height="224" fill="#ffffff" stroke="var(--r-250)" />
          <rect x="11" y="11" width="150" height="142" fill="var(--accent)" />
          <text x="14" y="180" fontFamily="Nunito, sans-serif" fontSize="13" fontWeight="800" letterSpacing="1.5" fill="var(--r-text)">ROSE QUARTZ</text>
          <text x="14" y="200" fontFamily="Nunito, sans-serif" fontSize="12" fontWeight="600" fill="var(--r-muted)">focus · 25 min</text>
        </g>
        <LilyBud x={52} y={560} r={-25} />
        <Stickers lilies={[[350, 832, -20, 0.95], [140, 668, 15, 1.18]]} />
        <Doodles width={3.5} paths={['M30 470 C 50 456 72 462 80 476', 'M420 690 C 432 712 428 736 414 750', 'M246 880 C 270 892 300 890 318 878', 'M108 470 L 104 450', 'M128 476 L 136 458']} />
        <Spark x={420} y={520} s={1.3} />
        <Spark x={30} y={760} s={0.9} />
        <Heart x={40} y={410 + 60} s={0.9} />
      </svg>
    </div>
  );
}

function Bow({ x, y, s, r }: { x: number; y: number; s: number; r: number }) {
  const loopL = 'M-8 -6 C -64 -76 -128 -62 -118 -10 C -110 32 -52 22 -8 6 Z';
  const loopR = 'M8 -6 C 64 -76 128 -62 118 -10 C 110 32 52 22 8 6 Z';
  const tailL = 'M-6 8 C -30 60 -52 112 -74 154 L -42 146 L -36 176 C -10 116 4 62 4 10 Z';
  const tailR = 'M6 8 C 30 60 50 108 70 150 L 40 144 L 34 172 C 10 114 -4 62 -4 10 Z';
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${r})`}>
      <g fill="#ffffff" stroke="#ffffff" strokeWidth="12" strokeLinejoin="round">
        <path d={loopL} /><path d={loopR} /><path d={tailL} /><path d={tailR} />
      </g>
      <path d={tailL} fill="var(--r-400)" />
      <path d={tailR} fill="var(--r-300)" />
      <path d={loopL} fill="var(--r-400)" />
      <path d={loopR} fill="var(--r-400)" />
      <g fill="none" strokeLinecap="round">
        <path d="M-16 -4 C -56 -44 -98 -42 -100 -14" stroke="var(--r-600)" strokeWidth="2.2" />
        <path d="M16 -4 C 56 -44 98 -42 100 -14" stroke="var(--r-600)" strokeWidth="2.2" />
        <path d="M-44 -48 C -74 -60 -100 -48 -106 -26" stroke="var(--r-100)" strokeWidth="4" />
        <path d="M44 -48 C 74 -60 100 -48 106 -26" stroke="var(--r-100)" strokeWidth="4" />
      </g>
      <rect x="-17" y="-18" width="34" height="36" rx="11" fill="var(--r-500)" />
      <path d="M-8 -10 C -4 -4 4 -4 8 -10" fill="none" stroke="var(--r-200)" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

function GlitterStar({ x, y, r }: { x: number; y: number; r: number }) {
  const d = 'M0 -40 L 11 -14 L 39 -12 L 18 7 L 24 35 L 0 20 L -24 35 L -18 7 L -39 -12 L -11 -14 Z';
  const dots = [[-4, -20, 1.8], [6, -8, 1.4], [-10, -4, 1.6], [16, 2, 1.4], [2, 6, 2], [-16, 12, 1.4], [12, 18, 1.6], [-6, 22, 1.4]];
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d={d} fill="#ffffff" stroke="#ffffff" strokeWidth="10" strokeLinejoin="round" />
      <path d={d} fill="var(--accent)" stroke="var(--r-500)" strokeWidth="1.2" strokeLinejoin="round" />
      {dots.map(([cx, cy, rr], i) => <circle key={i} cx={cx} cy={cy} r={rr} fill={i % 3 ? '#ffffff' : 'var(--r-600)'} />)}
    </g>
  );
}

function LilyBud({ x, y, r }: { x: number; y: number; r: number }) {
  const d = 'M0 0 C -14 -16 -14 -60 0 -84 C 14 -60 14 -16 0 0 Z';
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d={d} fill="#ffffff" stroke="#ffffff" strokeWidth="12" strokeLinejoin="round" />
      <path d={d} fill="#ffffff" stroke="var(--r-250)" strokeWidth="1.3" />
      <path d="M0 -6 C -4 -30 -3 -56 0 -74" fill="none" stroke="var(--r-150)" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/* ================= Blossom Doodle ================= */

export function DoodleDecor() {
  return (
    <div className="rose-decor" aria-hidden="true">
      <RoseDefs />
      <svg className="rd rd-tl" viewBox="0 40 410 360">
        <path d="M-40 60 C 60 20 220 40 330 110 C 420 170 400 300 300 360 C 200 420 60 400 -40 380 Z" fill="var(--r-150)" />
        <Stickers
          blossoms={[[110, 170, 10, 1.25], [210, 140, -15, 1.05], [240, 240, 28, 1.15], [130, 280, -8, 0.95], [320, 190, 40, 0.75]]}
          buds={[[300, 110, 30, 1], [44, 250, -20, 0.9], [330, 290, 50, 0.9]]}
        />
        <Doodles
          width={4.5}
          paths={[
            'M40 340 C 20 310 34 280 52 272',
            'M150 350 C 190 366 240 362 270 340 C 300 360 340 340 350 312',
            'M370 230 C 392 200 386 160 362 146',
            'M330 70 L 342 52', 'M356 84 L 374 74',
          ]}
        />
        <Heart x={380} y={320} s={1.2} fill="#ffffff" />
      </svg>

      <svg className="rd rd-tr" viewBox="1120 70 320 290">
        <path d="M1170 130 C 1230 80 1340 90 1380 150 C 1420 210 1390 300 1320 320 C 1250 340 1170 300 1150 240 C 1140 200 1140 160 1170 130 Z" fill="var(--r-150)" />
        <Stickers lilies={[[1270, 220, -15, 0.95]]} />
        <Spark x={1160} y={130} s={1.2} />
        <Spark x={1390} y={300} s={0.9} />
        <Spark x={1186} y={300} s={0.7} />
        <Doodles width={3.5} paths={['M1360 110 C 1380 96 1400 104 1404 122', 'M1150 220 C 1140 200 1146 180 1160 172']} />
      </svg>

      <svg className="rd rd-br" viewBox="1040 500 400 400">
        <path d="M1480 520 C 1380 500 1220 520 1130 600 C 1050 670 1080 800 1160 860 C 1240 920 1400 940 1480 930 Z" fill="var(--r-150)" />
        <Stickers
          lilies={[[1390, 620, -10, 0.85], [1270, 730, 20, 1.3]]}
          blossoms={[[1150, 700, 15, 1], [1180, 820, -25, 0.85]]}
        />
        <Doodles
          width={4.5}
          paths={[
            'M1110 640 C 1090 610 1100 580 1124 570 C 1130 546 1160 536 1180 546',
            'M1100 880 C 1080 850 1086 820 1100 806',
            'M1110 560 L 1094 544', 'M1132 548 L 1128 526',
          ]}
        />
        <Heart x={1110} y={760} s={1.1} fill="#ffffff" />
        <Heart x={1066} y={640} s={0.9} r={10} fill="var(--r-400)" />
      </svg>

      <svg className="rd rd-bl" viewBox="0 600 260 300">
        <path d="M-40 640 C 40 600 160 620 210 690 C 260 760 220 860 140 900 L -40 900 Z" fill="var(--r-150)" />
        <Stickers blossoms={[[110, 760, 20, 1.1], [40, 690, -10, 0.8]]} buds={[[180, 700, 35, 0.9]]} />
        <Doodles paths={['M190 780 C 206 806 200 836 182 848']} />
        <Spark x={236} y={640} s={0.9} fill="var(--r-400)" />
      </svg>
    </div>
  );
}

/* ================= Timer faces ================= */

interface FaceProps {
  mode: Mode;
  status: Status;
  clock: string;
  onSetTime: (ms: number) => void;
}

const SB_LABEL: Record<Mode, string> = { focus: 'focus time ♡', short: 'short break ♡', long: 'long break ♡' };
const DD_LABEL: Record<Mode, string> = { focus: 'bloom where you are ♡', short: 'breathe a little ♡', long: 'rest & refill ♡' };

export function RoseFace({ mode, clock, variant, onSetTime }: FaceProps & { variant: 'scrapbook' | 'doodle' }) {
  return (
    <div className="rose-face">
      <span className="rose-face__label" aria-hidden="true">{variant === 'scrapbook' ? SB_LABEL[mode] : DD_LABEL[mode]}</span>
      <TimeDisplay className="digits rose-face__digits" clock={clock} onSet={onSetTime} />
      <div className="rose-progress" aria-hidden="true">
        <span className="rose-progress__fill" />
        <svg className="rose-progress__knob" viewBox={variant === 'scrapbook' ? '-16 -18 32 28' : '-28 -28 56 56'}>
          {variant === 'scrapbook' ? (
            <use href="#rs-heart" fill="var(--accent)" stroke="#ffffff" strokeWidth="2.5" />
          ) : (
            <use href="#rs-blossom" transform="scale(0.6)" />
          )}
        </svg>
      </div>
    </div>
  );
}

/* ================= Theme-picker previews ================= */

export function ScrapbookPreview({ color }: { color: string }) {
  return (
    <div className="pv pv-scrap" style={{ '--pv': color } as React.CSSProperties}>
      <RoseDefs />
      <svg className="pv-scrap__art" viewBox="0 0 160 100" aria-hidden="true">
        <rect x="6" y="8" width="38" height="28" fill="var(--r-50)" stroke="var(--r-250)" transform="rotate(-6 25 22)" />
        <g fill="#ffffff" stroke="#ffffff" strokeWidth="12">
          <use href="#rs-blossom-sil" transform="translate(140 18) scale(0.32)" />
          <use href="#rs-lily-sil" transform="translate(20 84) scale(0.2)" />
        </g>
        <use href="#rs-blossom" transform="translate(140 18) scale(0.32)" />
        <use href="#rs-lily" transform="translate(20 84) scale(0.2)" />
        <rect x="46" y="20" width="68" height="62" fill="var(--r-paper)" stroke="var(--r-250)" transform="rotate(-2 80 51)" />
        <rect x="42" y="16" width="20" height="6" fill="var(--r-400)" fillOpacity="0.7" transform="rotate(-30 52 19)" />
        <text x="80" y="58" textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="19" fontWeight="500" fill="var(--r-700)">25:00</text>
        <rect x="64" y="66" width="32" height="7" rx="3.5" fill={color} />
      </svg>
    </div>
  );
}

export function DoodlePreview({ color }: { color: string }) {
  return (
    <div className="pv pv-doodle" style={{ '--pv': color } as React.CSSProperties}>
      <RoseDefs />
      <svg className="pv-scrap__art" viewBox="0 0 160 100" aria-hidden="true">
        <path d="M-10 -4 C 30 -8 60 6 56 30 C 52 48 20 50 -10 44 Z" fill="var(--r-150)" />
        <path d="M170 64 C 130 60 104 74 110 92 L 170 104 Z" fill="var(--r-150)" />
        <g fill="#ffffff" stroke="#ffffff" strokeWidth="12">
          <use href="#rs-blossom-sil" transform="translate(18 16) scale(0.36)" />
          <use href="#rs-blossom-sil" transform="translate(40 26) scale(0.28)" />
          <use href="#rs-lily-sil" transform="translate(140 84) scale(0.22)" />
        </g>
        <use href="#rs-blossom" transform="translate(40 26) scale(0.28)" />
        <use href="#rs-blossom" transform="translate(18 16) scale(0.36)" />
        <use href="#rs-lily" transform="translate(140 84) scale(0.22)" />
        <text x="82" y="42" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="11" fill="var(--r-700)">bloom ♡</text>
        <text x="82" y="66" textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="24" fontWeight="500" fill="var(--r-700)">25:00</text>
        <rect x="66" y="74" width="32" height="7" rx="3.5" fill={color} />
      </svg>
    </div>
  );
}
