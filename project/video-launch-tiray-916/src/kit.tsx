import React from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { easeInOutSmooth, easeOutExpo, ip } from './antislop/theme/easing-and-timing';
import { C, JK, PP } from './theme';
import { W } from './timeline';

export { easeInOutSmooth, easeOutExpo, ip };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Normalized progress 0→1 between frames a and b */
export const t01 = (f: number, a: number, b: number, e: (t: number) => number = easeInOutSmooth) => ip(f, [a, b], [0, 1], e);
export const px = (v: number) => `${v.toFixed(1)}px`;
/** Slow vertical float (±3 px, about 7 s per cycle) so holds never freeze; `seed` de-phases neighbours. Not a shake. */
export const drift = (f: number, seed = 0) => 3 * Math.sin(f / 34 + seed * 0.013);

/* ------------------------------------------------------------------ */
/* Images                                                              */
/* ------------------------------------------------------------------ */
/** <img> that holds the frame until the browser has decoded it (no one-frame blank screenshots) */
export const Img: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  const ref = React.useRef<HTMLImageElement>(null);
  const [handle] = React.useState(() => delayRender(`decode ${props.src}`));
  React.useEffect(() => {
    const el = ref.current;
    const done = () => {
      requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)));
    };
    if (el) el.decode().then(done, done);
    else done();
  }, [handle]);
  return <img ref={ref} alt="" {...props} />;
};

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
export const UI: React.FC<{ src: string; width: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ src, width, children, style }) => {
  const [iw, ih] = UI_SIZE[src];
  const k = width / iw;
  return (
    <div style={{ position: 'relative', width, height: ih * k, overflow: 'hidden', ...style }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: iw, height: ih, transform: `scale(${k})`, transformOrigin: '0 0' }}>
        <Img src={staticFile(`ui/${src}`)} style={{ position: 'absolute', left: 0, top: 0, width: iw, height: ih }} />
        {children}
      </div>
    </div>
  );
};

/** A rectangle of a screenshot shown at width `dw`; children use ORIGINAL pixel coordinates of the screenshot */
export const Crop: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dw: number;
  radius?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ src, x, y, w, h, dw, radius = 0, children, style }) => {
  const [iw, ih] = UI_SIZE[src];
  const k = dw / w;
  return (
    <div style={{ position: 'relative', width: dw, height: h * k, overflow: 'hidden', borderRadius: radius, ...style }}>
      <div style={{ position: 'absolute', left: -x * k, top: -y * k, width: iw, height: ih, transform: `scale(${k})`, transformOrigin: '0 0' }}>
        <Img src={staticFile(`ui/${src}`)} style={{ position: 'absolute', left: 0, top: 0, width: iw, height: ih }} />
        {children}
      </div>
    </div>
  );
};
export const cropH = (w: number, h: number, dw: number) => (h * dw) / w;

/* ------------------------------------------------------------------ */
/* Phone                                                               */
/* ------------------------------------------------------------------ */
export const BZ = 12;
export const SR = 0.4757; // screen width / height
export const phoneH = (w: number) => (w - BZ * 2) / SR + BZ * 2;

export const Device: React.FC<{
  cx: number;
  cy: number;
  w: number;
  h?: number;
  radius?: number;
  bodyColor?: string;
  screenBg?: string;
  transform?: string;
  shadow?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ cx, cy, w, h, radius, bodyColor = C.blue, screenBg = C.white, transform = '', shadow = 1, children, style }) => {
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
        boxShadow: shadow > 0 ? `0 44px 90px rgba(10,30,80,${(0.26 * shadow).toFixed(3)}), 0 8px 22px rgba(10,30,80,${(0.14 * shadow).toFixed(3)})` : undefined,
        ...style,
      }}
    >
      <div style={{ position: 'absolute', left: BZ, top: BZ, right: BZ, bottom: BZ, borderRadius: Math.max(0, r - BZ), overflow: 'hidden', background: screenBg }}>{children}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */
export type Part = string | [string];
/** 9:16: titles sit just under the platform's top bar (safe zone starts at y 288) */
export const TITLE_Y = 405;

/**
 * Centred text, centred vertically on `y`. Words rise out of a mask one after another (3 f apart); the block lifts out at `out`.
 * A part wrapped in [ ] is the emphasised word group. A part '|' starts a new line (9:16: long lines are broken by hand).
 */
export const Title: React.FC<{
  f: number;
  at: number;
  out?: number;
  parts: Part[];
  y?: number;
  size?: number;
  onBlue?: boolean;
  weight?: number;
  step?: number;
  x?: number;
}> = ({ f, at, out, parts, y = TITLE_Y, size = 62, onBlue, weight = 600, step = 3, x = W / 2 }) => {
  if (f < at) return null;
  const o = out === undefined ? 0 : t01(f, out, out + 12, easeInOutSmooth);
  if (o >= 1) return null;
  let n = 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 500,
        width: 1000,
        top: y,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: size * 0.27,
        rowGap: size * 0.02,
        lineHeight: 1.18,
        fontFamily: PP,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: '-0.025em',
        whiteSpace: 'nowrap',
        opacity: 1 - o,
        transform: `translateY(calc(-50% + ${px(-o * 26)}))`,
      }}
    >
      {parts.flatMap((part, pi) => {
        if (part === '|') return [<div key={`br${pi}`} style={{ flexBasis: '100%', height: 0 }} />];
        const em = Array.isArray(part);
        const words = (em ? part[0] : part).split(' ');
        return words.map((word, wi) => {
          const i = t01(f, at + n * step, at + n * step + 20, easeOutExpo);
          n += 1;
          return (
            <span key={`${pi}-${wi}`} style={{ display: 'inline-block', overflow: 'hidden', padding: '0.12em 0.04em 0.2em', margin: '-0.12em -0.04em -0.2em' }}>
              <span
                style={{
                  display: 'inline-block',
                  transform: `translateY(${((1 - i) * 112).toFixed(2)}%)`,
                  color: em ? (onBlue ? C.sky : C.blue) : onBlue ? C.white : C.ink,
                  fontWeight: em ? 700 : weight,
                }}
              >
                {word}
              </span>
            </span>
          );
        });
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Touch indicator (the "cursor" of a phone app)                       */
/* ------------------------------------------------------------------ */
/** Finger contact: a soft disc arrives, presses at `at`, and one ring expands from the contact point */
export const Tap: React.FC<{ f: number; at: number; x: number; y: number; size?: number; onBlue?: boolean }> = ({ f, at, x, y, size = 64, onBlue }) => {
  if (f < at - 12 || f > at + 22) return null;
  const arrive = t01(f, at - 12, at - 2, easeOutExpo);
  const press = t01(f, at - 2, at + 2) * (1 - t01(f, at + 3, at + 10));
  const ring = t01(f, at, at + 20, easeOutExpo);
  const gone = t01(f, at + 8, at + 20);
  const tone = onBlue ? '255,255,255' : '36,77,169';
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: '50%',
          background: `rgba(${tone},0.28)`,
          border: `${Math.max(2, size * 0.05).toFixed(1)}px solid rgba(${tone},0.75)`,
          opacity: arrive * (1 - gone),
          transform: `scale(${(lerp(1.5, 1, arrive) * (1 - 0.22 * press)).toFixed(4)})`,
        }}
      />
      {ring > 0 && ring < 1 && (
        <div
          style={{
            position: 'absolute',
            left: x - size / 2,
            top: y - size / 2,
            width: size,
            height: size,
            borderRadius: '50%',
            border: `${Math.max(2, size * 0.05).toFixed(1)}px solid rgba(${tone},0.7)`,
            opacity: 1 - ring,
            transform: `scale(${lerp(1, 2.6, ring).toFixed(4)})`,
          }}
        />
      )}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Cards that leave the phone                                          */
/* ------------------------------------------------------------------ */
export const CARD_SHADOW = '0 30px 70px rgba(10,30,80,0.20), 0 6px 18px rgba(10,30,80,0.10)';

/**
 * A detail that flies from an origin (usually a spot on the phone) to its slot, tilted slightly toward the phone.
 * (l, t, w, h) = final slot. Leaves at `out` by sinking back toward the origin.
 */
export const Fly: React.FC<{
  f: number;
  at: number;
  out?: number;
  from: { x: number; y: number };
  l: number;
  t: number;
  w: number;
  h: number;
  tilt?: number;
  dim?: number;
  z?: number;
  /** when set, the detail leaves by travelling all the way into this point (back into the phone) */
  home?: { x: number; y: number };
  children: React.ReactNode;
}> = ({ f, at, out, from, l, t, w, h, tilt = 0, dim = 0, z, home, children }) => {
  if (f < at) return null;
  const p = t01(f, at, at + 24, easeOutExpo);
  const o = out === undefined ? 0 : t01(f, out, out + 14, easeInOutSmooth);
  if (o >= 1) return null;
  const cx = l + w / 2;
  const cy = t + h / 2;
  const k = home ? 1 - o : p * (1 - o * 0.22);
  const dx = home && o > 0 ? (home.x - cx) * o : (from.x - cx) * (1 - k);
  const dy = home && o > 0 ? (home.y - cy) * o : (from.y - cy) * (1 - k);
  return (
    <div
      style={{
        position: 'absolute',
        left: l,
        top: t,
        width: w,
        height: h,
        zIndex: z,
        opacity: Math.min(1, p * 2.4) * (home ? 1 - o * o : 1 - o) * (1 - dim),
        transform: `translate(${px(dx)}, ${px(dy + drift(f, l) * p * (1 - o))}) perspective(1800px) rotateY(${(tilt * (0.4 + 0.6 * p)).toFixed(2)}deg) scale(${(lerp(0.3, 1, p) * (home ? 1 - 0.75 * o : 1)).toFixed(4)})`,
      }}
    >
      {children}
    </div>
  );
};

/** White rounded card */
export const Card: React.FC<{ radius?: number; pad?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ radius = 28, pad = 0, children, style }) => (
  <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', borderRadius: radius, background: C.white, boxShadow: CARD_SHADOW, overflow: 'hidden', padding: pad, ...style }}>{children}</div>
);

/** White check mark in a blue disc / rounded square, drawn in as p goes 0→1 */
export const Check: React.FC<{ size: number; p: number; round?: boolean }> = ({ size, p, round }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: round ? '50%' : size * 0.24,
      background: C.blue,
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

/* ------------------------------------------------------------------ */
/* Corner logos: same artwork and sizes as the 16:9 v6, pulled down     */
/* to y 148 and in to 60 px margins (earlier approved 9:16 layout)     */
/* ------------------------------------------------------------------ */
export const Corner: React.FC<{ onBlue?: boolean }> = ({ onBlue }) => {
  const color = onBlue ? C.white : C.ink;
  const top = 148;
  const sh = 84;
  const sw = (sh * 248) / 299;
  // v4: the right group matches the left one. The emblem art fills ~78% of its white-base square, so a
  // 104-px square shows an 81-px emblem (= the Pemkab crest); the logotype is about as tall as the left label.
  const logoH = 64;
  const logoW = (logoH * 633.19305) / 199.38464;
  const embl = 104;
  const rx = W - 60 - logoW - 4 - embl;
  return (
    <>
      <Img src={staticFile('brand/pemkab-tegal.png')} style={{ position: 'absolute', left: 60, top, height: sh, width: sw }} />
      <div style={{ position: 'absolute', left: 60 + sw + 13, top: top + 10.6, width: 'max-content', fontFamily: JK, color }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 24, lineHeight: 1 }}>
          {'PEMERINTAH'.split('').map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </div>
        <div style={{ fontWeight: 800, fontSize: 29, lineHeight: 1, marginTop: 5.6, whiteSpace: 'nowrap', letterSpacing: '-0.005em' }}>KABUPATEN TEGAL</div>
      </div>
      <Img src={staticFile('brand/lambang-warna-alas-putih.svg')} style={{ position: 'absolute', left: rx, top: top + (sh - embl) / 2, width: embl, height: embl }} />
      <Img
        src={staticFile(onBlue ? 'brand/logotype-putih.svg' : 'brand/logotype-hitam.svg')}
        style={{ position: 'absolute', left: rx + embl + 4, top: top + (sh - logoH) / 2, width: logoW, height: logoH }}
      />
    </>
  );
};
