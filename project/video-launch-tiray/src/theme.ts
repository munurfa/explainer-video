import { loadFont } from '@remotion/google-fonts/Poppins';

const { fontFamily } = loadFont('normal', {
  weights: ['400', '600', '700', '800'],
  subsets: ['latin'],
});

export const FONT = fontFamily;

// Token brand-kit Tirta Ayu (02-warna/warna.json)
export const C = {
  blue: '#244da9', // blue-800
  sky: '#9bd5ef', // blue-300
  green: '#30b349', // green-500 (grafis saja)
  ink: '#16243b',
  muted: '#44536b',
  line: '#dde3ec',
  white: '#ffffff',
  bezel: '#0f1a2c',
};

export const W = 1080;
export const H = 1920;
export const FPS = 30;

// Batas scene (frame absolut), harus sama dengan research/storyboard.md
export const B = [0, 105, 270, 450, 630, 780, 930, 1110, 1215, 1350] as const;
export const TOTAL_FRAMES = 1350;

// Area teks aman 9:16: x 60–940, y 300–1520
export const SAFE = { left: 60, right: 940, top: 300, bottom: 1520 };
export const SAFE_W = SAFE.right - SAFE.left;
export const CX = (SAFE.left + SAFE.right) / 2; // 500
