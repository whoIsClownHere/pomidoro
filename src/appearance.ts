import { useEffect, useState } from 'react';

export type ThemeId = 'classic' | 'hacker' | 'scrapbook' | 'doodle';

export const THEMES: { id: ThemeId; name: string; description: string; defaultAccent: string }[] = [
  { id: 'classic', name: 'Classic', description: 'Clean, warm and calm. An everyday tool.', defaultAccent: '#e04e39' },
  { id: 'hacker', name: 'Hacker', description: 'A terminal console with phosphor glow.', defaultAccent: '#7dffa8' },
  { id: 'scrapbook', name: 'Rose Scrapbook', description: 'A pink collage: paper notes, tape, a bow, blossoms and lilies.', defaultAccent: '#f4b6c6' },
  { id: 'doodle', name: 'Blossom Doodle', description: 'Cherry blossoms and lilies with white doodles.', defaultAccent: '#f4b6c6' },
];

export const SWATCHES = [
  { name: 'Blush', hex: '#f4b6c6' },
  { name: 'Rose', hex: '#e98fa8' },
  { name: 'Tomato', hex: '#e04e39' },
  { name: 'Orange', hex: '#f08c2e' },
  { name: 'Yellow', hex: '#f5c542' },
  { name: 'Phosphor', hex: '#7dffa8' },
  { name: 'Green', hex: '#3f8a6b' },
  { name: 'Cyan', hex: '#38b6d8' },
  { name: 'Blue', hex: '#3d6f99' },
  { name: 'Violet', hex: '#8c6cf0' },
  { name: 'Pink', hex: '#e0559a' },
];

export interface Appearance {
  theme: ThemeId;
  /** Custom accent per theme; null = the theme's own default. */
  accent: Record<ThemeId, string | null>;
}

const KEY = 'pomodoro-classic:v1:appearance';
const DEFAULT: Appearance = { theme: 'classic', accent: { classic: null, hacker: null, scrapbook: null, doodle: null } };

function load(): Appearance {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved) return { ...DEFAULT, ...saved, accent: { ...DEFAULT.accent, ...saved.accent } };
  } catch {
    /* ignore */
  }
  return DEFAULT;
}

export function useAppearance() {
  const [appearance, setAppearance] = useState(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(appearance));
    } catch {
      /* private mode */
    }
  }, [appearance]);

  return {
    ...appearance,
    setTheme: (theme: ThemeId) => setAppearance((a) => ({ ...a, theme })),
    setAccent: (hex: string | null) =>
      setAppearance((a) => ({ ...a, accent: { ...a.accent, [a.theme]: hex } })),
  };
}

/** Black or white text, whichever reads better on the given color. */
export function textOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.4 ? '#141414' : '#ffffff';
}

/** CSS variables for a custom accent (empty when the theme default is used). */
export function accentVars(hex: string | null, theme?: ThemeId): Record<string, string> {
  if (!hex) return {};
  if ((theme === 'scrapbook' || theme === 'doodle') && textOn(hex) === '#141414') {
    // light accent: let the theme's own deep shade carry the text
    return { '--accent': hex };
  }
  return {
    '--accent': hex,
    '--accent-strong': `color-mix(in srgb, ${hex} 85%, #000)`,
    '--accent-fg': textOn(hex),
  };
}
