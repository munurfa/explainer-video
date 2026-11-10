import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { easeInOutSmooth, easeOutExpo, ip } from '../antislop/theme/easing-and-timing';
import { C, FONT } from '../theme';

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Normalized progress 0→1 between frames a and b */
export const t01 = (f: number, a: number, b: number, e: (t: number) => number = easeInOutSmooth) => ip(f, [a, b], [0, 1], e);
export const easeIn = (t: number) => t * t * t;

/** Render children only within the absolute frame range [from, to) */
export const Gate: React.FC<{ from: number; to: number; children: React.ReactNode; bg?: string }> = ({ from, to, children, bg }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  return <AbsoluteFill style={{ background: bg }}>{children}</AbsoluteFill>;
};

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */
type Anchor = 'c' | 'l' | 'r';
const anchorTx = (a: Anchor) => (a === 'c' ? '-50%' : a === 'l' ? '0%' : '-100%');

/** One word/phrase rising from behind a mask; optional exit back down/up */
export const Txt: React.FC<{
  text: string;
  f: number;
  at: number;
  x: number;
  y: number;
  size: number;
  color?: string;
  weight?: number;
  anchor?: Anchor;
  out?: number;
  outDir?: 1 | -1;
  ls?: string;
  opacity?: number;
}> = ({ text, f, at, x, y, size, color = C.ink, weight = 800, anchor = 'c', out, outDir = -1, ls = '-0.025em', opacity = 1 }) => {
  if (f < at) return null;
  const inY = ip(f, [at, at + 14], [110, 0], easeOutExpo);
  const outY = out !== undefined ? ip(f, [out, out + 9], [0, 115 * outDir], easeInOutSmooth) : 0;
  if (out !== undefined && f > out + 10) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${anchorTx(anchor)}, -50%)`,
        overflow: 'hidden',
        padding: '0.08em 0.06em 0.14em',
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.12,
        letterSpacing: ls,
        color,
        whiteSpace: 'nowrap',
        opacity,
      }}
    >
      <div style={{ transform: `translateY(${(inY + outY).toFixed(2)}%)` }}>{text}</div>
    </div>
  );
};

/** Horizontal motion blur driven by element speed (deterministic, SVG X-only blur) */
export const HBlur: React.FC<{ id: string; amount: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  id,
  amount,
  children,
  style,
}) => {
  const a = Math.min(60, Math.abs(amount));
  return (
    <>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id={id} x="-30%" y="-10%" width="160%" height="120%">
          <feGaussianBlur stdDeviation={`${a.toFixed(2)} 0`} />
        </filter>
      </svg>
      <div style={{ ...style, filter: a > 0.4 ? `url(#${id})` : undefined }}>{children}</div>
    </>
  );
};

/** Velocity of a frame function, in px/frame */
export const vel = (fn: (f: number) => number, f: number) => fn(f) - fn(f - 1);

/** Inline item whose width grows from 0 (words around it part to make room) */
export const Grow: React.FC<{ t: number; maxW: number; gap?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  t,
  maxW,
  gap = 0,
  children,
  style,
}) => (
  <div
    style={{
      display: 'inline-flex',
      justifyContent: 'center',
      overflow: 'hidden',
      maxWidth: Math.max(0, t) * maxW,
      marginRight: Math.max(0, t) * gap,
      whiteSpace: 'nowrap',
      flexShrink: 0,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Flex row centered on (x, y) */
export const Row: React.FC<{ x: number; y: number; anchor?: Anchor; children: React.ReactNode; style?: React.CSSProperties }> = ({
  x,
  y,
  anchor = 'c',
  children,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(${anchorTx(anchor)}, -50%)`,
      display: 'flex',
      alignItems: 'center',
      fontFamily: FONT,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* UI screenshots                                                      */
/* ------------------------------------------------------------------ */
export const UI_SIZE: Record<string, [number, number]> = {
  '01-aduan-daftar.png': [900, 1894],
  '02-info-gangguan.png': [900, 1894],
  '03-sambungan-prosedur.png': [946, 1993],
  '04-sambungan-sukses.png': [720, 1462],
  '05-profil.png': [950, 1999],
  '06-beranda.png': [949, 1995],
  '07-riwayat-tagihan.png': [949, 1994],
  '08-qris-numpad.png': [900, 1894],
  '09-aduan-form.png': [900, 1894],
};

/** Full screenshot at display width; children use ORIGINAL pixel coordinates */
export const UI: React.FC<{ src: string; width: number; children?: React.ReactNode; hideBase?: boolean; style?: React.CSSProperties }> = ({
  src,
  width,
  children,
  hideBase,
  style,
}) => {
  const [iw, ih] = UI_SIZE[src];
  const k = width / iw;
  return (
    <div style={{ position: 'relative', width, height: ih * k, overflow: 'hidden', ...style }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: iw, height: ih, transform: `scale(${k})`, transformOrigin: '0 0' }}>
        {/* always mounted (opacity toggle) so the screenshot never pops in blank for a frame */}
        <Img src={staticFile(`ui/${src}`)} style={{ position: 'absolute', left: 0, top: 0, width: iw, height: ih, opacity: hideBase ? 0 : 1 }} />
        {children}
      </div>
    </div>
  );
};

/** A rectangle of a screenshot in its original coordinates (use inside <UI>) */
export const Piece: React.FC<{ src: string; x: number; y: number; w: number; h: number; style?: React.CSSProperties }> = ({
  src,
  x,
  y,
  w,
  h,
  style,
}) => {
  const [iw, ih] = UI_SIZE[src];
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', ...style }}>
      <Img src={staticFile(`ui/${src}`)} style={{ position: 'absolute', left: -x, top: -y, width: iw, height: ih }} />
    </div>
  );
};

/** Crop of a screenshot as a standalone card, displayed at width `dw` */
export const CropCard: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dw: number;
  radius?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
  imgOpacity?: number;
}> = ({ src, x, y, w, h, dw, radius = 26, shadow = true, style, imgOpacity = 1 }) => {
  const [iw, ih] = UI_SIZE[src];
  const k = dw / w;
  return (
    <div
      style={{
        position: 'relative',
        width: dw,
        height: h * k,
        overflow: 'hidden',
        borderRadius: radius,
        background: C.white,
        boxShadow: shadow ? '0 28px 70px rgba(22,36,59,0.20), 0 6px 18px rgba(22,36,59,0.12)' : undefined,
        ...style,
      }}
    >
      <Img
        src={staticFile(`ui/${src}`)}
        style={{ position: 'absolute', left: -x * k, top: -y * k, width: iw * k, height: ih * k, opacity: imgOpacity }}
      />
    </div>
  );
};
export const cropH = (w: number, h: number, dw: number) => (h * dw) / w;

/* ------------------------------------------------------------------ */
/* Device: phone with free geometry (for morphs)                       */
/* ------------------------------------------------------------------ */
export const BZ = 14;
export const SR = 0.4757; // screen width / height
export const phoneH = (w: number) => (w - BZ * 2) / SR + BZ * 2;

export const Device: React.FC<{
  cx: number;
  cy: number;
  w: number;
  h?: number;
  radius?: number;
  bodyColor?: string;
  bezel?: number;
  screenBg?: string;
  transform?: string;
  shadow?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ cx, cy, w, h, radius, bodyColor = C.bezel, bezel = BZ, screenBg = C.white, transform = '', shadow = 1, children, style }) => {
  const hh = h ?? phoneH(w);
  const r = radius ?? w * 0.13;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - w / 2,
        top: cy - hh / 2,
        width: w,
        height: hh,
        borderRadius: r,
        background: bodyColor,
        transform,
        boxShadow: shadow > 0 ? `0 40px 90px rgba(22,36,59,${0.28 * shadow}), 0 8px 24px rgba(22,36,59,${0.16 * shadow})` : undefined,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: bezel,
          top: bezel,
          right: bezel,
          bottom: bezel,
          borderRadius: Math.max(0, r - bezel),
          overflow: 'hidden',
          background: screenBg,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Frosted-glass band behind giant words                               */
/* ------------------------------------------------------------------ */
export const GlassBand: React.FC<{
  f: number;
  at: number;
  out: number;
  y: number;
  h: number;
  src: string;
  cx: number; // crop region in the screenshot
  cy: number;
  cw: number;
  tint?: string;
}> = ({ f, at, out, y, h, src, cx, cy, cw, tint = 'rgba(255,255,255,0.42)' }) => {
  const sIn = ip(f, [at, at + 10], [0, 1], easeOutExpo);
  const sOut = ip(f, [out, out + 10], [1, 0], easeInOutSmooth);
  const s = Math.min(sIn, sOut);
  if (s <= 0.001) return null;
  const [iw, ih] = UI_SIZE[src];
  const k = 1400 / cw;
  const drift = (f - at) * 2.2;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: y - h / 2,
        width: 1080,
        height: h,
        overflow: 'hidden',
        transform: `scaleY(${s.toFixed(4)})`,
      }}
    >
      <Img
        src={staticFile(`ui/${src}`)}
        style={{
          position: 'absolute',
          left: -160 - cx * k - drift,
          top: h / 2 - (cy + 120) * k,
          width: iw * k,
          height: ih * k,
          filter: 'blur(30px) saturate(1.3)',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: tint }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 2, background: 'rgba(255,255,255,0.9)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'rgba(36,77,169,0.18)' }} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */
/** App icon: emblem on a white rounded square (Tiray has no separate icon) */
export const AppIcon: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: C.white,
      boxShadow: '0 10px 30px rgba(22,36,59,0.18)',
      position: 'relative',
      flexShrink: 0,
      ...style,
    }}
  >
    <Img
      src={staticFile('brand/lambang-warna.svg')}
      style={{ position: 'absolute', left: size * 0.15, top: size * 0.15, width: size * 0.7, height: size * 0.7 }}
    />
  </div>
);

/** "Tuntas" status badge rebuilt from the app UI (01-aduan-daftar) */
export const TuntasBadge: React.FC<{ w: number }> = ({ w }) => {
  const h = w * 0.39;
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: h * 0.22,
        background: '#e3f2e6',
        color: '#2e9e48',
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: h * 0.56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      Tuntas
    </div>
  );
};

/** Small Tirta Ayu logo in the top-left corner; `onBlue` 0→1 switches to the white version */
export const CornerLogo: React.FC<{ onBlue: number; opacity: number }> = ({ onBlue, opacity }) => {
  if (opacity <= 0.001) return null;
  const st: React.CSSProperties = { position: 'absolute', left: 60, top: 150, width: 240, height: 81 };
  return (
    <>
      <Img src={staticFile('brand/logo-horizontal-warna.svg')} style={{ ...st, opacity: opacity * (1 - onBlue) }} />
      <Img src={staticFile('brand/logo-horizontal-putih.svg')} style={{ ...st, opacity: opacity * onBlue }} />
    </>
  );
};
