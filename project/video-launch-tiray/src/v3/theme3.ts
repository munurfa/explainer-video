import { loadFont } from '@remotion/google-fonts/PlusJakartaSans';

const { fontFamily } = loadFont('normal', { weights: ['500', '600', '700', '800'], subsets: ['latin'] });

/** v3 "Glass Blue": Plus Jakarta Sans (brand alternative font), calmer and lighter than v2 */
export const JK = fontFamily;

export const C3 = {
  blue: '#244da9',
  sky: '#9bd5ef',
  glow: '#4f80c8', // blue-800 mixed 35% with blue-300 (water gradient)
  ink: '#16243b',
  muted: '#44536b',
  line: '#dde3ec',
  white: '#ffffff',
  green: '#30b349', // green-500, graphics only
  paper: '#f5f8fc',
};

export const BLUE_BG = `radial-gradient(ellipse 80% 55% at 50% 48%, ${C3.glow} 0%, ${C3.blue} 70%)`;
export const WHITE_BG = `radial-gradient(ellipse 90% 60% at 50% 50%, #ffffff 0%, ${C3.paper} 100%)`;
