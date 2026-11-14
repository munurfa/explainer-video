import React from 'react';
import { staticFile } from 'remotion';
import { Img } from '../v3/DImg';
import { t01 } from '../v2/kit2';
import { easeInOutSmooth, easeOutExpo, ip } from '../v3/kit3';
import { C3, JK } from '../v3/theme3';

/** 16:9 canvas + layout grid: text column on the left, phone / screenshots on the right */
export const WW = 1920;
export const HW = 1080;
export const CXW = 960;
export const CYW = 540;
export const LX = 150; // left edge of the text column
export const PX = 1390; // centre of the right stage
export const PY = 580;

/** Left-aligned line of text that rises in at `at` and lifts out at `out` (local frames) */
export const SayL: React.FC<{
  f: number;
  at: number;
  out?: number;
  y: number;
  size: number;
  color?: string;
  weight?: number;
  x?: number;
  children: React.ReactNode;
}> = ({ f, at, out, y, size, color = C3.ink, weight = 600, x = LX, children }) => {
  const i = t01(f, at, at + 24, easeOutExpo);
  const o = out === undefined ? 0 : t01(f, out, out + 20, easeInOutSmooth);
  if (i <= 0 || o >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y - size * 0.7,
        height: size * 1.4,
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.28,
        fontFamily: JK,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: '-0.02em',
        color,
        whiteSpace: 'nowrap',
        opacity: ip(i, [0, 0.5], [0, 1]) * (1 - o),
        transform: `translateY(${((1 - i) * 50 - o * 40).toFixed(1)}px)`,
      }}
    >
      {children}
    </div>
  );
};

/** Top corners for 16:9: Pemkab Tegal left, Tirta Ayu emblem + logotype right (same artwork as 9:16) */
export const CORNER_TOP_W = 52;
export const CornerW: React.FC<{ onBlue?: boolean }> = ({ onBlue }) => {
  const color = onBlue ? C3.white : C3.ink;
  const top = CORNER_TOP_W;
  const sh = 84;
  const sw = (sh * 248) / 299;
  const lw = 262;
  const logoH = 58;
  const logoW = (logoH * 633.19305) / 199.38464;
  const embl = 76;
  const rx = WW - 64 - logoW - 12 - embl;
  return (
    <>
      <Img src={staticFile('brand/pemkab-tegal.png')} style={{ position: 'absolute', left: 64, top, height: sh, width: sw }} />
      <div style={{ position: 'absolute', left: 64 + sw + 14, top: top + 12, width: lw, fontFamily: JK, color }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 21, lineHeight: 1 }}>
          {'PEMERINTAH'.split('').map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </div>
        <div style={{ fontWeight: 800, fontSize: 31.5, lineHeight: 1, marginTop: 9, whiteSpace: 'nowrap', letterSpacing: '-0.005em' }}>KABUPATEN TEGAL</div>
      </div>
      <Img src={staticFile('brand/lambang-warna-alas-putih.svg')} style={{ position: 'absolute', left: rx, top: top + (sh - embl) / 2, width: embl, height: embl }} />
      <Img
        src={staticFile(onBlue ? 'brand/logotype-putih.svg' : 'brand/logotype-hitam.svg')}
        style={{ position: 'absolute', left: rx + embl + 12, top: top + (sh - logoH) / 2, width: logoW, height: logoH }}
      />
    </>
  );
};
