import React from 'react';
import { AbsoluteFill, interpolateColors, staticFile } from 'remotion';
import { BZ, Check, Device, Img, Tap, UI, drift, easeInOutSmooth, easeOutExpo, lerp, phoneH, px, t01 } from './kit';
import { BLUE_BG, C, PP, WHITE_BG } from './theme';
import { H, T, W } from './timeline';

/*
 * The stage: one phone that stays on screen for the whole film, and a background that floods
 * between white and blue on the big hits of the music.
 */

/* ------------------------------------------------------------------ */
/* Background floods                                                   */
/* ------------------------------------------------------------------ */
export const TILE4 = { x: 925, y: 847 }; // centre of the "Info Tagihan" tile in S3 (the tap that opens S4)
export const PXL = 470; // phone centre while it stands on the left in S3 (v2: the phone is never cropped by the frame)
export const FLOODS: { at: number; blue: boolean; x: number; y: number }[] = [
  { at: T.s3 - 2, blue: true, x: W / 2, y: 692 },
  { at: T.s4 + 16, blue: false, x: PXL, y: 692 },
  { at: T.s6 - 2, blue: true, x: W / 2, y: H },
  { at: T.s7 - 2, blue: false, x: W / 2, y: H },
  { at: T.s8 - 2, blue: true, x: W / 2, y: H },
  { at: T.s9 - 6, blue: false, x: W / 2, y: H },
];
export const FLOOD_LEN = 26;
export const floodIdx = (f: number) => {
  let i = -1;
  for (let k = 0; k < FLOODS.length; k++) if (f >= FLOODS[k].at) i = k;
  return i;
};
/** 0 = white scene, 1 = blue scene; follows the flood so logos, text and the phone body switch with it */
export const blueAmount = (f: number) => {
  const i = floodIdx(f);
  if (i < 0) return 0;
  const to = FLOODS[i].blue ? 1 : 0;
  return lerp(1 - to, to, t01(f, FLOODS[i].at + 5, FLOODS[i].at + 17));
};

export const Background: React.FC<{ f: number }> = ({ f }) => {
  const i = floodIdx(f);
  const cur = i >= 0 ? FLOODS[i] : null;
  const p = cur ? t01(f, cur.at, cur.at + FLOOD_LEN, easeInOutSmooth) : 1;
  const curBlue = cur ? cur.blue : false;
  return (
    <AbsoluteFill style={{ background: curBlue && p < 1 ? WHITE_BG : !curBlue && p < 1 ? BLUE_BG : curBlue ? BLUE_BG : WHITE_BG }}>
      {cur && p < 1 && (
        <AbsoluteFill style={{ background: curBlue ? BLUE_BG : WHITE_BG, clipPath: `circle(${px(p * 2300)} at ${px(cur.x)} ${px(cur.y)})` }} />
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Phone track                                                         */
/* ------------------------------------------------------------------ */
export const SX = W / 2;
export const SY = 692; // stage centre
export const PW = 340;
export const PH = phoneH(PW);
const OUT = 1520; // fully below the frame: the phone leaves completely while a question is asked
export const SK = (PW - BZ * 2) / 949; // display scale of a 949-px-wide screenshot

const MORPH_A = T.s2 - 12; // icon → phone
const MORPH_B = T.s2 + 12;
const FOLD_A = T.s10 - 30; // phone → icon
const FOLD_B = T.s10;
export const ICON = { y: 470, s: 300 };
export const ICON_END = { y: 300, s: ICON.s };

/* S10 end card. Natural widths of the two halves of "#YuhBukaTiray" in Poppins Bold at HS px
 * (measured from a still; see research/storyboard.md).
 * v6: the hashtag is centred on its own; the folded icon drops its white tile and the bare emblem
 * docks left of the Google Play badge, as tall as the badge's visible black shape. */
export const HS = 104;
export const YW = 290;
export const BW = 522;
/** Left edge of "#Yuh" */
export const L0 = W / 2 - (YW + BW) / 2;
/** Centre of the text column */
export const COL_X = W / 2;
/** Store badge: google-play-id.png is 646 x 250, its black shape spans rows 29..220 (192 px) */
export const BADGE = { w: 380, top: 673 }; // black shape starts at y 690, just under the tagline (S10: UL 586, tagline at UL + 58)
const BADGE_K = BADGE.w / 646;
const BADGE_VIS = 192 * BADGE_K; // 113 px
/** The emblem fills ~86 % of its square box (measured in v5 stills: 186 of 216 px) */
const EMB = BADGE_VIS / 0.86;
const EMB_GAP = 26;
/** Badge row = emblem + gap + badge, centred together */
export const BADGE_X = W / 2 - (EMB + EMB_GAP + BADGE.w) / 2 + EMB + EMB_GAP;
const EMB_DOCK = { x: BADGE_X - EMB_GAP - EMB / 2, y: BADGE.top + (29 + 192 / 2) * BADGE_K };
/** "#Yuh" slides from the centre to its place as "BukaTiray" is revealed */
export const hashShift = (f: number) => t01(f, T.s10 + 30, T.s10 + 52, easeInOutSmooth);

export const phoneY = (f: number) => {
  if (f < MORPH_B) return lerp(ICON.y, SY, t01(f, MORPH_A, MORPH_B));
  if (f < 560) return SY;
  if (f < 630) return lerp(SY, OUT, t01(f, T.s5 - 16, T.s5 + 4));
  if (f < 760) return lerp(OUT, SY, t01(f, T.s5 + 42, T.s5 + 66, easeOutExpo));
  if (f < 840) return lerp(SY, OUT, t01(f, T.s6 - 18, T.s6 + 2));
  if (f < 905) return lerp(OUT, SY, t01(f, T.s6 + 36, T.s6 + 60, easeOutExpo));
  if (f < 970) return lerp(SY, OUT, t01(f, T.s7 - 18, T.s7 + 2));
  if (f < 1070) return lerp(OUT, SY, t01(f, T.s7 + 48, T.s7 + 72, easeOutExpo));
  if (f < 1140) return lerp(SY, OUT, t01(f, T.s8 - 16, T.s8 + 4));
  if (f < FOLD_A) return lerp(OUT, SY, t01(f, T.s9 - 4, T.s9 + 20, easeOutExpo));
  return lerp(SY, ICON_END.y, t01(f, FOLD_A, FOLD_B));
};
/** S3: the phone steps to the left so the six services can stand beside it in the app's own 3 x 2 grid */
export const phoneX = (f: number) => {
  if (f < T.s4 + 16) return lerp(SX, PXL, t01(f, T.s3 + 2, T.s3 + 30));
  return lerp(PXL, SX, t01(f, T.s4 + 16, T.s4 + 40));
};
/** Screen-space point of a pixel of the screenshot currently shown in the phone */
export const onScreen = (f: number, x: number, y: number, k = SK) => ({ x: phoneX(f) - PW / 2 + BZ + x * k, y: phoneY(f) - PH / 2 + BZ + y * k });

/* ------------------------------------------------------------------ */
/* What the phone shows                                                */
/* ------------------------------------------------------------------ */
const SCREENS: { src: string; at: number; push?: boolean }[] = [
  { src: '06-beranda.png', at: 0 },
  { src: '07-riwayat-tagihan.png', at: T.s4 + 18, push: true },
  { src: '08-qris-numpad.png', at: 527, push: true },
  { src: '09-aduan-form.png', at: T.s5 - 10 },
  { src: '01-aduan-daftar.png', at: 741, push: true },
  { src: '02-info-gangguan.png', at: T.s6 - 12 },
  { src: '03-sambungan-prosedur.png', at: T.s7 - 12 },
  { src: '06-beranda.png', at: T.s8 + 10 },
];
const SCREEN_LEN = 16;

const DIGITS = '0100000013';
export const STEP_AT = [T.s7 + 72, T.s7 + 84, T.s7 + 96, T.s7 + 108];
export const STEP_C: [number, number][] = [
  [177, 383],
  [358, 383],
  [543, 383],
  [754, 383],
];
export const ITEM_Y = [1290, 1460, 1630, 1800];

/** Check marks on the stepper + procedure list of 03 (also reused on the enlarged side cards) */
export const StepChecks: React.FC<{ f: number; list?: boolean; steps?: boolean }> = ({ f, list = true, steps = true }) => (
  <>
    {steps &&
      [0, 1, 2].map((i) => {
        const p = t01(f, STEP_AT[i] + 4, STEP_AT[i] + 14);
        const x0 = STEP_C[i][0] + 50;
        const x1 = STEP_C[i + 1][0] - 50;
        return <div key={i} style={{ position: 'absolute', left: x0, top: 404, width: (x1 - x0) * p, height: 8, borderRadius: 4, background: C.blue }} />;
      })}
    {STEP_C.map(([x, y], i) => {
      const p = t01(f, STEP_AT[i], STEP_AT[i] + 10, easeOutExpo);
      if (p <= 0) return null;
      return (
        <React.Fragment key={x}>
          {steps && (
            <div style={{ position: 'absolute', left: x - 40, top: y - 40 }}>
              <Check size={80} p={p} round />
            </div>
          )}
          {list && (
            <div style={{ position: 'absolute', left: 44, top: ITEM_Y[i] - 4 }}>
              <Check size={70} p={p} />
            </div>
          )}
        </React.Fragment>
      );
    })}
  </>
);

const Overlay: React.FC<{ src: string; f: number; idx: number }> = ({ src, f, idx }) => {
  if (src === '07-riwayat-tagihan.png') return <Tap f={f} at={521} x={475} y={765} size={190} />;
  if (src === '08-qris-numpad.png') {
    const typed = Math.max(0, Math.min(10, Math.floor((f - 545) / 3) + 1));
    return (
      <>
        <div style={{ position: 'absolute', left: 40, top: 225, width: 820, height: 110, background: '#dbe5ed' }} />
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 225,
            width: 820,
            height: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: PP,
            fontWeight: 600,
            fontSize: 70,
            letterSpacing: '0.06em',
            color: typed ? C.ink : '#9aa7b8',
          }}
        >
          {typed ? DIGITS.slice(0, typed) : 'XXXXXXXXXX'}
        </div>
      </>
    );
  }
  if (src === '09-aduan-form.png') return <Tap f={f} at={T.s5 + 144} x={450} y={1606} size={190} />;
  if (src === '03-sambungan-prosedur.png') {
    const dlg = t01(f, T.s7 + 120, T.s7 + 140);
    return (
      <>
        <StepChecks f={f} />
        {dlg > 0 && <div style={{ position: 'absolute', inset: 0, background: `rgba(22,36,59,${(0.45 * dlg).toFixed(3)})` }} />}
      </>
    );
  }
  void idx;
  return null;
};

/** Sibling phones that fan out behind the hero in S2 ("semua layanan air") */
const Siblings: React.FC<{ f: number }> = ({ f }) => {
  const a = T.s2 + 72;
  if (f < a || f > T.s3 + 4) return null;
  const p = t01(f, a, a + 26, easeOutExpo);
  const o = t01(f, T.s3 - 20, T.s3 - 2);
  const k = p * (1 - o);
  return (
    <>
      {[
        { src: '07-riwayat-tagihan.png', side: -1 },
        { src: '02-info-gangguan.png', side: 1 },
      ].map((s) => (
        <Device
          key={s.src}
          cx={SX + s.side * 318 * k}
          cy={SY + 6}
          w={PW}
          shadow={0.5 * k}
          transform={`perspective(2000px) rotateY(${(-s.side * 26 * k).toFixed(2)}deg) scale(${lerp(0.96, 0.86, k).toFixed(4)})`}
          style={{ opacity: Math.min(1, k * 3) }}
        >
          <UI src={s.src} width={PW - BZ * 2} />
        </Device>
      ))}
    </>
  );
};

export const Phone: React.FC<{ f: number }> = ({ f }) => {
  const pop = t01(f, 3, 25, easeOutExpo); // the icon lands on the first hit of the music
  if (pop <= 0) return null;
  const gone = t01(f, T.s10 + 132, T.s10 + 150); // hand-off to the outro
  if (gone >= 1) return null;
  const m = t01(f, MORPH_A, MORPH_B);
  const fold = t01(f, FOLD_A, FOLD_B);
  const blue = blueAmount(f);
  const endS = ICON_END.s;
  // v6: after the fold the white tile fades away; the bare emblem then flies to the badge row
  const boxOff = t01(f, FOLD_B, FOLD_B + 14, easeInOutSmooth);
  // the hashtag sits between the two spots, so the emblem fades out above it and re-enters with the badge
  const leave = t01(f, T.s10 + 54, T.s10 + 68, easeInOutSmooth);
  const enter = t01(f, T.s10 + 80, T.s10 + 100, easeOutExpo); // same curve as the badge in S10
  const w = f < FOLD_A ? lerp(ICON.s, PW, m) : lerp(PW, endS, fold);
  const h = f < FOLD_A ? lerp(ICON.s, PH, m) : lerp(PH, endS, fold);
  const radius = f < FOLD_A ? lerp(ICON.s * 0.24, PW * 0.13, m) : lerp(PW * 0.13, endS * 0.24, fold);
  const asIcon = f < FOLD_A ? 1 - t01(f, MORPH_A, MORPH_A + 14) : t01(f, FOLD_A + 14, FOLD_B);
  const screenOp = f < FOLD_A ? t01(f, MORPH_A + 8, MORPH_B) : 1 - t01(f, FOLD_A, FOLD_A + 16);
  const body = interpolateColors(Math.max(blue, f < FOLD_A ? 1 - t01(f, MORPH_A + 2, MORPH_B) : fold), [0, 1], [C.blue, '#f6f9fd']);
  const cy = phoneY(f);
  const cx = phoneX(f);
  if (cy - h / 2 > H + 20) return null;
  if (boxOff >= 1) {
    const docked = f >= T.s10 + 80;
    if (!docked && leave >= 1) return null;
    const s = docked ? EMB : endS * 0.72 * (1 - 0.15 * leave);
    const ex = docked ? EMB_DOCK.x : cx;
    const ey = docked
      ? EMB_DOCK.y + (1 - enter) * 40 - 30 * t01(f, T.s10 + 132, T.s10 + 150, easeInOutSmooth)
      : cy - 20 * leave;
    const op = docked ? Math.min(1, enter * 2) * (1 - gone) : 1 - leave;
    return (
      <Img
        src={staticFile('brand/lambang-warna.svg')}
        style={{ position: 'absolute', left: ex - s / 2, top: ey - s / 2, width: s, height: s, objectFit: 'contain', opacity: op }}
      />
    );
  }

  let cur = 0;
  for (let k = 0; k < SCREENS.length; k++) if (f >= SCREENS[k].at) cur = k;
  const sp = cur === 0 ? 1 : t01(f, SCREENS[cur].at, SCREENS[cur].at + SCREEN_LEN, easeInOutSmooth);
  const sw = w - BZ * 2;
  // the icon keeps growing a little through the hook, then hands that scale over to the morph
  const hookPush = 1 + 0.05 * t01(f, 20, MORPH_A, (t) => t) * (1 - m);
  const rise = f < MORPH_A || f > T.s2 + 30 ? 0 : Math.sin(Math.PI * t01(f, MORPH_A, T.s2 + 30, (t) => t));
  return (
    <>
      <Siblings f={f} />
      <Device
        cx={cx}
        cy={cy + drift(f) * 1.3 * (1 - fold)}
        w={w}
        h={h}
        radius={radius}
        bodyColor={body}
        transform={`${rise > 0 ? `perspective(2200px) rotateX(${(rise * 8).toFixed(2)}deg) ` : ''}scale(${(lerp(0.5, 1, pop) * hookPush).toFixed(4)})`}
        shadow={f < FOLD_A ? 0.4 + 0.6 * m : 1 - fold * 0.6}
        style={{ opacity: Math.min(1, pop * 2.5) * (1 - gone) * (1 - boxOff) }}
      >
        <div style={{ position: 'absolute', inset: 0, opacity: screenOp }}>
          {sp < 1 && cur > 0 && (
            <div style={{ position: 'absolute', left: SCREENS[cur].push ? -sp * sw * 0.3 : 0, top: 0 }}>
              <UI src={SCREENS[cur - 1].src} width={sw}>
                <Overlay src={SCREENS[cur - 1].src} f={f} idx={cur - 1} />
              </UI>
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              left: SCREENS[cur].push ? (1 - sp) * sw : 0,
              top: 0,
              opacity: SCREENS[cur].push ? 1 : sp,
              boxShadow: SCREENS[cur].push && sp < 1 ? '-20px 0 40px rgba(10,30,80,0.18)' : undefined,
            }}
          >
            <UI src={SCREENS[cur].src} width={sw}>
              <Overlay src={SCREENS[cur].src} f={f} idx={cur} />
            </UI>
          </div>
        </div>
        {asIcon > 0 && (
          <Img
            src={staticFile('brand/lambang-warna.svg')}
            style={{ position: 'absolute', left: '14%', top: '14%', width: '72%', height: '72%', objectFit: 'contain', opacity: asIcon }}
          />
        )}
      </Device>
      {boxOff > 0 && (
        <Img
          src={staticFile('brand/lambang-warna.svg')}
          style={{ position: 'absolute', left: cx - w * 0.36, top: cy - h * 0.36, width: w * 0.72, height: h * 0.72, objectFit: 'contain' }}
        />
      )}
    </>
  );
};
