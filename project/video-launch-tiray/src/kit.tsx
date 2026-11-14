import React from 'react';
import { Img, staticFile } from 'remotion';
import { easeInOutSmooth, easeOutExpo, ip, springAt } from './antislop/theme/easing-and-timing';
import { C, FONT, SAFE } from './theme';

/* ------------------------------------------------------------------ */
/* Teks kinetik: kata per kata naik dari balik mask                    */
/* ------------------------------------------------------------------ */
export const Words: React.FC<{
  text: string; // pakai \n untuk pindah baris
  f: number;
  start: number;
  stagger?: number;
  size: number;
  color?: string;
  accent?: string[];
  accentColor?: string;
  weight?: number;
  lineHeight?: number;
  align?: 'left' | 'center';
  outAt?: number;
  top: number;
  left?: number;
  width?: number;
  letterSpacing?: string;
}> = ({
  text,
  f,
  start,
  stagger = 5,
  size,
  color = C.ink,
  accent = [],
  accentColor = C.blue,
  weight = 800,
  lineHeight = 1.08,
  align = 'center',
  outAt,
  top,
  left = SAFE.left,
  width = SAFE.right - SAFE.left,
  letterSpacing = '-0.02em',
}) => {
  let idx = 0;
  const lines = text.split('\n');
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width,
        textAlign: align,
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        letterSpacing,
        color,
      }}
    >
      {lines.map((line, li) => (
        <div key={li}>
          {line.split(' ').map((w, wi) => {
            const s = start + idx * stagger;
            idx += 1;
            const inY = ip(f, [s, s + 16], [112, 0], easeOutExpo);
            const outY = outAt !== undefined ? ip(f, [outAt, outAt + 10], [0, -112], easeInOutSmooth) : 0;
            const isAccent = accent.includes(w.replace(/[.,!?]/g, ''));
            return (
              <span
                key={wi}
                style={{
                  display: 'inline-block',
                  overflow: 'hidden',
                  verticalAlign: 'top',
                  paddingBottom: '0.12em',
                  marginBottom: '-0.12em',
                  marginRight: wi < line.split(' ').length - 1 ? '0.26em' : 0,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    transform: `translateY(${(inY + outY).toFixed(2)}%)`,
                    color: isAccent ? accentColor : undefined,
                  }}
                >
                  {w}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Jadwal frame mulai tiap kata (untuk SFX tick yang sinkron) */
export const wordStarts = (text: string, start: number, stagger = 5): number[] =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((_, i) => start + i * stagger);

/* ------------------------------------------------------------------ */
/* Mockup HP                                                          */
/* ------------------------------------------------------------------ */
export const BEZEL = 14;
export const SCREEN_RATIO = 0.4757; // lebar/tinggi screenshot

export const phoneDims = (w: number) => {
  const sw = w - BEZEL * 2;
  const sh = sw / SCREEN_RATIO;
  return { w, sw, sh, h: sh + BEZEL * 2, radius: w * 0.13, sradius: w * 0.13 - BEZEL };
};

export const Phone: React.FC<{
  width: number;
  bodyOpacity?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, bodyOpacity = 1, children, style }) => {
  const d = phoneDims(width);
  return (
    <div
      style={{
        position: 'relative',
        width: d.w,
        height: d.h,
        borderRadius: d.radius,
        background: `rgba(15,26,44,${bodyOpacity})`,
        boxShadow: bodyOpacity > 0.5 ? '0 40px 90px rgba(22,36,59,0.28), 0 8px 24px rgba(22,36,59,0.18)' : 'none',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: BEZEL,
          top: BEZEL,
          width: d.sw,
          height: d.sh,
          borderRadius: d.sradius,
          overflow: 'hidden',
          background: C.white,
          opacity: bodyOpacity,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Screenshot penuh lebar layar, rata atas */
export const Shot: React.FC<{ src: string; opacity?: number; tx?: number }> = ({ src, opacity = 1, tx = 0 }) => (
  <Img
    src={staticFile(`ui/${src}`)}
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      opacity,
      transform: `translateX(${tx}%)`,
    }}
  />
);

/** Kotak sorot (outline) dalam koordinat piksel gambar asli; area lain diredupkan */
export const Highlight: React.FC<{
  f: number;
  start: number;
  end?: number;
  imgW: number;
  screenW: number;
  x: number;
  y: number;
  w: number;
  h: number;
  dim?: boolean;
}> = ({ f, start, end, imgW, screenW, x, y, w, h, dim = true }) => {
  const k = screenW / imgW;
  const pad = 8;
  const inO = ip(f, [start, start + 8], [0, 1], easeOutExpo);
  const outO = end !== undefined ? 1 - ip(f, [end, end + 8], [0, 1]) : 1;
  const o = inO * outO;
  if (o <= 0.001) return null;
  const sc = ip(f, [start, start + 12], [1.12, 1], easeOutExpo);
  return (
    <div
      style={{
        position: 'absolute',
        left: x * k - pad,
        top: y * k - pad,
        width: w * k + pad * 2,
        height: h * k + pad * 2,
        borderRadius: 18,
        border: `6px solid ${C.blue}`,
        boxShadow: dim ? `0 0 0 2000px rgba(22,36,59,${(0.42 * o).toFixed(3)})` : undefined,
        opacity: o,
        transform: `scale(${sc})`,
      }}
    />
  );
};

/** Umpan balik ketukan jari: cincin mengembang dari titik sentuh */
export const TapRing: React.FC<{ f: number; at: number; x: number; y: number }> = ({ f, at, x, y }) => {
  const t = ip(f, [at, at + 16], [0, 1], easeOutExpo);
  if (f < at || f > at + 18) return null;
  const s = 0.4 + t * 1.1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 60,
        top: y - 60,
        width: 120,
        height: 120,
        borderRadius: '50%',
        border: `7px solid ${C.white}`,
        boxShadow: `0 0 0 4px ${C.blue}`,
        opacity: 1 - t,
        transform: `scale(${s})`,
      }}
    />
  );
};

/** Potongan bagian screenshot (crop) sebagai kartu */
export const Crop: React.FC<{
  src: string;
  imgW: number;
  imgH: number;
  x: number;
  y: number;
  w: number;
  h: number;
  displayW: number;
  radius?: number;
  style?: React.CSSProperties;
}> = ({ src, imgW, imgH, x, y, w, h, displayW, radius = 24, style }) => {
  const k = displayW / w;
  return (
    <div
      style={{
        position: 'relative',
        width: displayW,
        height: h * k,
        overflow: 'hidden',
        borderRadius: radius,
        background: C.white,
        ...style,
      }}
    >
      <Img
        src={staticFile(`ui/${src}`)}
        style={{ position: 'absolute', left: -x * k, top: -y * k, width: imgW * k, height: imgH * k }}
      />
    </div>
  );
};

/** Spring pop 0→1 dengan sedikit overshoot */
export const pop = (f: number, at: number) => springAt(f, at, 30, { damping: 12, stiffness: 150, mass: 0.7 });
