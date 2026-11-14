import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { Img } from './DImg';
import { CropCard, Device, Grow, UI, cropH, lerp, t01 } from '../v2/kit2';
import { B, Check, Say, easeInOutSmooth, easeOutExpo, ip } from './kit3';
import { Squircle, WideBento } from './StyleFramesV3';
import { BLUE_BG, C3, JK, WHITE_BG } from './theme3';

const CX = 540;
const px = (v: number) => `${v.toFixed(1)}px`;

/* ================================================================== */
/* S6 · 810–957 · Air mati? → fan of disruption notices (blue)         */
/* ================================================================== */
const CARDS2 = [1105, 870, 635, 400, 165]; // old → newest

export const S6: React.FC = () => {
  const f = useCurrentFrame();
  const dw = 680;
  const dh = cropH(840, 205, dw);
  const wipe = t01(f, 0, 30, easeInOutSmooth);
  return (
    <AbsoluteFill>
      {wipe < 1 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: 1080,
            height: 1920 * wipe,
            overflow: 'hidden',
            borderRadius: `${px(80 * (1 - wipe))} ${px(80 * (1 - wipe))} 0 0`,
          }}
        >
          <div style={{ position: 'absolute', left: 0, bottom: 0, width: 1080, height: 1920, background: BLUE_BG }} />
        </div>
      )}
      <Say f={f} at={14} out={50} y={900} size={96} color={C3.white} weight={700}>
        Air mati?
      </Say>
      <Say f={f} at={58} y={420} size={60} color={C3.white}>
        <span>Info gangguan</span>
        <B color={C3.sky}>langsung masuk</B>
      </Say>
      {CARDS2.map((y, j) => {
        const at = 62 + j * 10;
        const p = t01(f, at, at + 20, easeOutExpo);
        if (p <= 0) return null;
        // newer cards push this one down
        const k = CARDS2.reduce((acc, _, i) => (i > j ? acc + t01(f, 62 + i * 10, 80 + i * 10, easeOutExpo) : acc), 0);
        const top = 620 + k * (dh + 16) - (1 - p) * 160;
        return (
          <div key={y} style={{ position: 'absolute', left: CX - dw / 2, top, opacity: Math.min(1, p * 2), transform: `scale(${lerp(0.94, 1, p).toFixed(4)})` }}>
            <CropCard src="02-info-gangguan.png" x={30} y={y} w={840} h={205} dw={dw} radius={26} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* S7 · 957–1115 · sheet up → Mau pasang baru? → stepper → success     */
/* ================================================================== */
const F3 = '03-sambungan-prosedur.png';
const STEP_C: [number, number][] = [
  [177, 383],
  [358, 383],
  [543, 383],
  [754, 383],
];
const ITEM_Y = [1290, 1460, 1630, 1800];

export const S7: React.FC = () => {
  const f = useCurrentFrame();
  const sheet = t01(f, 0, 32, easeInOutSmooth);
  const ph = t01(f, 54, 76, easeOutExpo);
  const dlg = t01(f, 124, 148, easeInOutSmooth);
  const pw = 440;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          background: WHITE_BG,
          borderRadius: `${px(80 * (1 - sheet))} ${px(80 * (1 - sheet))} 0 0`,
          transform: `translateY(${px((1 - sheet) * 1920)})`,
          boxShadow: '0 -30px 80px rgba(10,30,80,0.25)',
        }}
      />
      <Say f={f} at={20} out={54} y={900} size={80} weight={700}>
        <span>Mau pasang</span>
        <B>baru?</B>
      </Say>
      <Say f={f} at={58} y={400} size={70}>
        <span>Daftar dari</span>
        <B>HP</B>
      </Say>
      {f >= 54 && (
        <Device cx={CX} cy={lerp(1400, 1060, ph)} w={pw} bodyColor={C3.blue} bezel={12} style={{ opacity: Math.min(1, ph * 2) }}>
          <UI src={F3} width={pw - 24}>
            {STEP_C.map(([x, y], i) => {
              const p = t01(f, 76 + i * 12, 86 + i * 12, easeOutExpo);
              if (p <= 0) return null;
              return (
                <React.Fragment key={x}>
                  <div style={{ position: 'absolute', left: x - 40, top: y - 40 }}>
                    <Check size={80} p={p} round />
                  </div>
                  <div style={{ position: 'absolute', left: 44, top: ITEM_Y[i] - 4 }}>
                    <Check size={70} p={p} />
                  </div>
                </React.Fragment>
              );
            })}
            {[0, 1, 2].map((i) => {
              const p = t01(f, 80 + i * 12, 90 + i * 12);
              const x0 = STEP_C[i][0] + 50;
              const x1 = STEP_C[i + 1][0] - 50;
              return <div key={i} style={{ position: 'absolute', left: x0, top: 404, width: (x1 - x0) * p, height: 8, borderRadius: 4, background: C3.blue }} />;
            })}
            {dlg > 0 && <div style={{ position: 'absolute', inset: 0, background: `rgba(22,36,59,${(0.45 * dlg).toFixed(3)})` }} />}
          </UI>
        </Device>
      )}
      {f >= 54 && (
        <div
          style={{
            position: 'absolute',
            left: CX - 310,
            top: 1060 - cropH(574, 595, 620) / 2,
            transform: `scale(${lerp(0.88, 1, dlg).toFixed(4)})`,
            opacity: ip(dlg, [0, 0.6], [0, 1]), // mounted early (opacity 0) so it never pops in undecoded
          }}
        >
          <CropCard src="04-sambungan-sukses.png" x={73} y={437} w={574} h={595} dw={620} radius={36} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* S8 · 1115–1252 · blue wipe → Ga cuma itu → masih banyak → info      */
/* ================================================================== */
export const S8: React.FC = () => {
  const f = useCurrentFrame();
  const wipe = t01(f, 0, 30, easeInOutSmooth);
  const sq = t01(f, 98, 120, easeOutExpo);
  const exit = t01(f, 132, 160, easeInOutSmooth);
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `scale(${(1 - 0.06 * exit).toFixed(4)})` }}>
      {wipe < 1 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: 1080,
            height: 1920 * wipe,
            overflow: 'hidden',
            borderRadius: `${px(80 * (1 - wipe))} ${px(80 * (1 - wipe))} 0 0`,
          }}
        >
          <div style={{ position: 'absolute', left: 0, bottom: 0, width: 1080, height: 1920, background: BLUE_BG }} />
        </div>
      )}
      <Say f={f} at={22} out={56} y={900} size={90} color={C3.white} weight={700}>
        Ga cuma itu
      </Say>
      <Say f={f} at={58} out={96} y={880} size={64} color={C3.white} dx={240}>
        masih banyak yang bisa
      </Say>
      <Say f={f} at={64} out={96} y={980} size={64} color={C3.white} dx={240}>
        <Img src={staticFile('brand/lambang-warna-alas-putih.svg')} style={{ width: 84, height: 84 }} />
        <span style={{ fontWeight: 700 }}>Tiray</span>
        <span>bantu</span>
      </Say>
      <Say f={f} at={100} y={420} size={60} color={C3.white}>
        <span>Info pelanggan &amp;</span>
        <B color={C3.sky}>pemakaian</B>
      </Say>
      {sq > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: Math.min(1, sq * 2), transformOrigin: '540px 1000px', transform: `scale(${lerp(0.85, 1, sq).toFixed(4)})` }}>
          <Squircle cx={CX} cy={1000} s={760} onBlue>
            {[
              { src: '05-profil.png', x: 46, y: 640, w: 856, h: 180, top: 110, at: 104 },
              { src: '05-profil.png', x: 46, y: 850, w: 856, h: 185, top: 300, at: 110 },
              { src: '07-riwayat-tagihan.png', x: 50, y: 1010, w: 850, h: 240, top: 500, at: 116 },
            ].map((c) => {
              const p = t01(f, c.at, c.at + 16, easeOutExpo);
              return (
                <div key={c.y} style={{ position: 'absolute', left: 60, top: c.top + (1 - p) * 60, opacity: p }}>
                  <CropCard src={c.src} x={c.x} y={c.y} w={c.w} h={c.h} dw={640} radius={22} />
                </div>
              );
            })}
          </Squircle>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* S9 · 1252–1385 · Semua di Tiray: wide bento builds                  */
/* ================================================================== */
const BENTO_ORDER = ['1:0', '2:0', '1:314', '2:314', '0:0', '3:0', '0:266', '3:266'];

export const S9: React.FC = () => {
  const f = useCurrentFrame();
  const hero = t01(f, 2, 26, easeOutExpo);
  const push = t01(f, 92, 133, (t) => t);
  const tail = t01(f, 108, 133, easeInOutSmooth);
  // tiles ripple out from the hero, one every 6 frames
  const p = (col: number, y: number) => {
    if (col === 1 && y === 162) return hero;
    const i = BENTO_ORDER.indexOf(`${col}:${y}`);
    const a = 20 + Math.max(0, i) * 6;
    return t01(f, a, a + 26, easeOutExpo);
  };
  return (
    <AbsoluteFill style={{ opacity: 1 - tail }}>
      <Say f={f} at={8} y={640} size={56}>
        <span>Semua di</span>
        <B>Tiray</B>
      </Say>
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 760,
          transformOrigin: '500px 260px',
          transform: `scale(${(lerp(1, 1.04, push) * lerp(1.12, 1, hero) + tail * 0.06).toFixed(4)})`,
        }}
      >
        <WideBento p={p} />
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* S10 · 1385–1557 · #Yuh centre → left, BukaTiray unrolls, badge       */
/* ================================================================== */
/** Half the rendered width of "BukaTiray" (measured): centres "#Yuh" on its own */
const YUH_CENTER = 252;
/**
 * Outro hand-off: the green tab becomes the big green dot the outro's three dots merge into.
 * Measured from the outro file (all centred at 539,959): frame 47 = merged dot Ø62,
 * 48 = Ø170, 49 = Ø220, 50 = Ø230 (peak, soft green glow). The three-dot orbit (frames 0–46) is skipped.
 * Local 168 = outro frame 47 … local 171 (last) = outro frame 50; the outro joins from frame 51.
 */
const MERGE = { x: 539, y: 959, d: 62 };
const GROW = [170, 220, 230]; // outro frames 48, 49, 50
const GLOW = [0.12, 0.24, 0.32];
const LAST10 = 171;
const Pill: React.FC<{ cx: number; cy: number; w: number; h: number; color: string; glow?: number }> = ({ cx, cy, w, h, color, glow = 0 }) => (
  <div
    style={{
      position: 'absolute',
      left: cx - w / 2,
      top: cy - h / 2,
      width: w,
      height: h,
      borderRadius: Math.min(w, h) / 2,
      background: color,
      boxShadow: glow > 0 ? `0 0 ${px(w * 0.3)} ${px(w * 0.04)} rgba(48,179,73,${glow.toFixed(3)})` : undefined,
    }}
  />
);

export const S10: React.FC = () => {
  const f = useCurrentFrame();
  const inn = t01(f, 10, 28, easeOutExpo); // "#Yuh" appears in the centre
  const shift = t01(f, 30, 50, easeInOutSmooth); // slides left into place
  const rev = t01(f, 54, 76, easeInOutSmooth); // "BukaTiray" unrolls from the h, B stays put
  const line = t01(f, 74, 88, easeOutExpo);
  const tab = t01(f, 86, 96, easeOutExpo);
  const badge = t01(f, 92, 110, easeOutExpo);
  // hand-off to the outro
  const out = t01(f, 132, 150, easeInOutSmooth); // hashtag + badge leave
  const bg = t01(f, 134, 160, easeInOutSmooth); // outro background fades in
  const r = t01(f, 130, 150, easeInOutSmooth); // blue underline retracts into the green tab
  const mv = t01(f, 146, 168, easeInOutSmooth); // green tab glides to centre + rounds into the merged dot
  const L0 = CX - 380;
  const tabX = L0 + 694 + (66 * tab) / 2;
  const k = f - (LAST10 - 2); // 0,1,2 on the last three frames: grows like outro 48–50
  const big = k >= 0 ? GROW[Math.min(2, k)] : 0;
  const gx = big ? MERGE.x : lerp(tabX, MERGE.x, mv);
  const gy = big ? MERGE.y : lerp(1037, MERGE.y, mv);
  const gw = big || lerp(66 * tab, MERGE.d, mv);
  const gh = big || lerp(14, MERGE.d, mv);
  const glow = k >= 0 ? GLOW[Math.min(2, k)] : 0;
  const lw = 680 * line * (1 - r);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 940 - 150,
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: JK,
          fontWeight: 800,
          fontSize: 110,
          letterSpacing: '-0.03em',
          color: C3.blue,
          whiteSpace: 'nowrap',
          opacity: 1 - out,
          transform: `translateY(${px(-out * 30)})`,
        }}
      >
        <span style={{ display: 'inline-block', opacity: ip(inn, [0, 0.5], [0, 1]), transform: `translate(${px(YUH_CENTER * (1 - shift))}, ${px((1 - inn) * 60)})` }}>#Yuh</span>
        <span style={{ display: 'inline-block', clipPath: `inset(-20% ${((1 - rev) * 100).toFixed(2)}% -20% 0)` }}>BukaTiray</span>
      </div>
      {badge > 0 && out < 1 && (
        <Img
          src={staticFile('badge/google-play-id.png')}
          style={{ position: 'absolute', left: CX - 220, top: 1045, width: 440, // visible top = underline bottom + 21 px, same gap as text → underline
            transform: `translateY(${px((1 - badge) * 40 + out * 30)})`, opacity: Math.min(1, badge * 2) * (1 - out) }}
        />
      )}
      {f >= 122 && <Img src={staticFile('outro/bg.png')} style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity: bg }} />}
      {lw > 1 && <Pill cx={L0 + 680 * line - lw / 2} cy={1037} w={lw} h={14} color={C3.blue} />}
      {tab > 0 && <Pill cx={gx} cy={gy} w={gw} h={gh} color={C3.green} glow={glow} />}
    </AbsoluteFill>
  );
};
/* ================================================================== */
/* S11 · 1584–1710 · End card                                          */
/* ================================================================== */
export const S11: React.FC = () => {
  const f = useCurrentFrame();
  const bg = t01(f, 10, 28, easeInOutSmooth);
  const logo = t01(f, 12, 42, easeOutExpo);
  const badge = t01(f, 64, 84, easeOutExpo);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: C3.white, opacity: bg }} />
      <Img
        src={staticFile('brand/logo-vertikal-warna.svg')}
        style={{ position: 'absolute', left: CX - 230, top: 320, width: 460, height: 460, opacity: ip(logo, [0, 0.4], [0, 1]), transform: `scale(${lerp(0.94, 1, logo).toFixed(4)})` }}
      />
      <Say f={f} at={30} y={880} size={120} color={C3.blue} weight={800}>
        Tiray
      </Say>
      <Say f={f} at={38} y={1010} size={64} weight={700}>
        Ayo Jakwir,
      </Say>
      <Say f={f} at={42} y={1086} size={64} weight={700}>
        monggo didownload!
      </Say>
      {badge > 0 && (
        <Img
          src={staticFile('badge/google-play-id.png')}
          style={{ position: 'absolute', left: CX - 260, top: 1180, width: 520, transform: `scale(${lerp(0.85, 1, badge).toFixed(4)})`, opacity: Math.min(1, badge * 2) }}
        />
      )}
      <Say f={f} at={70} y={1450} size={52} color={C3.blue} weight={700}>
        #YuhBukaTiray
      </Say>
    </AbsoluteFill>
  );
};
