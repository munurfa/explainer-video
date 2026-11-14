import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { loadFont as loadJakarta } from '@remotion/google-fonts/PlusJakartaSans';

/** Brand primary font (logotype is Poppins SemiBold) */
export const PP = loadPoppins('normal', { weights: ['500', '600', '700'], subsets: ['latin'] }).fontFamily;
/** Brand alternative font: only for the Pemkab corner label (same artwork as v11) */
export const JK = loadJakarta('normal', { weights: ['600', '800'], subsets: ['latin'] }).fontFamily;

/** tiray-brand-kit tokens */
export const C = {
  blue: '#244da9',
  sky: '#9bd5ef',
  glow: '#4f80c8',
  ink: '#16243b',
  muted: '#44536b',
  line: '#dde3ec',
  white: '#ffffff',
  green: '#30b349', // graphics only
  paper: '#f3f7fc',
  tile: '#e9f1fb',
};

export const BLUE_BG = `radial-gradient(ellipse 80% 60% at 50% 55%, ${C.glow} 0%, ${C.blue} 72%)`;
export const WHITE_BG = `radial-gradient(ellipse 90% 65% at 50% 55%, #ffffff 0%, ${C.paper} 100%)`;
