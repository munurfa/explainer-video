import React from 'react';
import { easeInOutSmooth, easeOutExpo, ip } from '../antislop/theme/easing-and-timing';
import { t01 } from '../v2/kit2';
import { Line } from './StyleFramesV3';
import { C3 } from './theme3';

export { easeInOutSmooth, easeOutExpo, ip };

/** Scene boundaries (global frames), snapped to beats of the Q2 tempo map */
export const B3 = [0, 147, 327, 434, 625, 810, 957, 1115, 1252, 1385, 1557]; // S9 transition ends 46.2 s; S10 ends on outro frame 50 (big merged green dot), outro joins from frame 51
export const TOTAL_V3 = 1557;
/** Bar starts of music-v3.wav (frames) */
export const BARS = [0, 73, 147, 219, 291, 363, 434, 504, 574, 642, 710, 777, 843, 909, 973, 1037, 1099, 1161, 1222, 1282, 1341, 1400, 1457, 1514, 1570, 1626, 1680];

/** Centered line of text that rises in at `at` and lifts out at `out` (local frames) */
export const Say: React.FC<{
  f: number;
  at: number;
  out?: number;
  y: number;
  size: number;
  color?: string;
  weight?: number;
  dx?: number;
  children: React.ReactNode;
}> = ({ f, at, out, y, size, color = C3.ink, weight, dx = 0, children }) => {
  const i = t01(f, at, at + 24, easeOutExpo);
  const o = out === undefined ? 0 : t01(f, out, out + 20, easeInOutSmooth);
  if (i <= 0 || o >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: ip(i, [0, 0.5], [0, 1]) * (1 - o),
        transform: `translate(${((1 - i) * dx).toFixed(1)}px, ${((1 - i) * 60 - o * 50).toFixed(1)}px)`,
      }}
    >
      <Line y={y} size={size} color={color} weight={weight}>
        {children}
      </Line>
    </div>
  );
};

export const B: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C3.blue }) => (
  <span style={{ color, fontWeight: 700 }}>{children}</span>
);

/** White check mark in a blue rounded square / circle */
export const Check: React.FC<{ size: number; p: number; round?: boolean }> = ({ size, p, round }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: round ? '50%' : size * 0.24,
      background: C3.blue,
      transform: `scale(${(0.6 + 0.4 * p).toFixed(3)})`,
      opacity: Math.min(1, p * 2),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
      <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${p} 1`} />
    </svg>
  </div>
);
