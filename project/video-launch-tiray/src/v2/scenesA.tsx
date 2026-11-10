import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { easeInOutSmooth, easeOutExpo, ip, springAt } from '../antislop/theme/easing-and-timing';
import { TapRing } from '../kit';
import { C, FONT } from '../theme';
import { AppIcon, BZ, CropCard, Device, easeIn, GlassBand, HBlur, lerp, phoneH, Piece, t01, Txt, UI } from './kit2';

const pop = (f: number, at: number) => springAt(f, at, 30, { damping: 12, stiffness: 150, mass: 0.7 });

/** Hex color mix */
export const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], t))).join(',')})`;
};

/* ================================================================== */
/* S1 · 0–120 · kotak → ikon → "Yuh kenalan sama [ikon] Tiray" → HP    */
/* ================================================================== */
type G = { cx: number; cy: number; w: number; h: number; r: number };
const gl = (a: G, b: G, t: number): G => ({
  cx: lerp(a.cx, b.cx, t),
  cy: lerp(a.cy, b.cy, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  r: lerp(a.r, b.r, t),
});
const G0: G = { cx: 540, cy: 960, w: 300, h: 300, r: 72 };
const G1: G = { cx: 273, cy: 960, w: 200, h: 200, r: 48 };
const G2: G = { cx: 540, cy: 1010, w: 120, h: 120, r: 29 };
export const PHONE0: G = { cx: 540, cy: 560 + phoneH(560) / 2, w: 560, h: phoneH(560), r: 73 };

const iconGeom = (f: number): G => {
  if (f < 38) return G0;
  if (f < 56) return gl(G0, G1, t01(f, 38, 54, easeOutExpo));
  if (f < 96) return gl(G1, G2, t01(f, 56, 72, easeOutExpo));
  return gl(G2, PHONE0, t01(f, 96, 118, easeInOutSmooth));
};

export const S1: React.FC = () => {
  const f = useCurrentFrame();
  const g = iconGeom(f);
  const draw = t01(f, 0, 18, easeInOutSmooth);
  const fill = t01(f, 16, 30, easeOutExpo);
  const emb = pop(f, 22);
  const morph = t01(f, 96, 118, easeInOutSmooth);
  const embFade = 1 - t01(f, 96, 106);
  const tirayT = t01(f, 56, 72, easeOutExpo);
  const per = 2 * (g.w + g.h - 4 * g.r) + 2 * Math.PI * g.r;
  return (
    <AbsoluteFill style={{ background: C.white }}>
      {/* kotak */}
      <div
        style={{
          position: 'absolute',
          left: g.cx - g.w / 2,
          top: g.cy - g.h / 2,
          width: g.w,
          height: g.h,
          borderRadius: g.r,
          background: mix(C.white, C.bezel, morph),
          opacity: fill,
          boxShadow: `0 ${18 + 22 * morph}px ${50 + 40 * morph}px rgba(22,36,59,${0.16 + 0.12 * morph})`,
        }}
      >
        {morph > 0 && (
          <div
            style={{
              position: 'absolute',
              left: BZ * morph,
              top: BZ * morph,
              right: BZ * morph,
              bottom: BZ * morph,
              borderRadius: Math.max(0, g.r - BZ),
              background: C.blue,
              opacity: morph,
            }}
          />
        )}
        {embFade > 0 && (
          <Img
            src={staticFile('brand/lambang-warna.svg')}
            style={{
              position: 'absolute',
              left: g.w * 0.15,
              top: g.h / 2 - g.w * 0.35,
              width: g.w * 0.7,
              height: g.w * 0.7,
              opacity: Math.min(1, emb * 1.5) * embFade,
              transform: `scale(${(0.6 + 0.4 * emb).toFixed(4)})`,
            }}
          />
        )}
      </div>
      {/* garis tepi tergambar */}
      {f < 34 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - t01(f, 26, 34) }}>
          <rect
            x={g.cx - g.w / 2}
            y={g.cy - g.h / 2}
            width={g.w}
            height={g.h}
            rx={g.r}
            fill="none"
            stroke={C.blue}
            strokeWidth={8}
            strokeDasharray={per}
            strokeDashoffset={per * (1 - draw)}
          />
        </svg>
      )}
      {/* lockup + kalimat */}
      <Txt
        text="Tiray"
        f={f}
        at={40}
        x={lerp(403, 624, tirayT)}
        y={lerp(960, 1010, tirayT)}
        size={lerp(180, 110, tirayT)}
        color={C.blue}
        anchor="l"
        out={96}
        outDir={1}
      />
      <Txt text="Yuh kenalan" f={f} at={60} x={540} y={866} size={120} out={95} outDir={1} />
      <Txt text="sama" f={f} at={66} x={456} y={1010} size={110} anchor="r" out={97} outDir={1} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* S2 · 120–270 · HP: layar dibangun berlapis → kipas coverflow        */
/* ================================================================== */
const K06 = (560 - BZ * 2) / 949;

const BerandaBuild: React.FC<{ f: number }> = ({ f }) => {
  const piece = (at: number, dx = 0, dy = 60) => {
    const p = springAt(f, at, 30, { damping: 16, stiffness: 160, mass: 0.6 });
    return { opacity: ip(p, [0, 0.4], [0, 1]), transform: `translate(${((1 - p) * dx).toFixed(1)}px, ${((1 - p) * dy).toFixed(1)}px)` };
  };
  const src = '06-beranda.png';
  const cellsX = [175, 470, 760];
  const cellsY = [840, 1065];
  return (
    <UI src={src} width={560 - BZ * 2} hideBase style={{ background: 'linear-gradient(180deg,#d4eafe,#b6dfff)' }}>
      <Img src={staticFile(`ui/${src}`)} style={{ position: 'absolute', left: 0, top: 0, width: 949, height: 1995, opacity: t01(f, 186, 194) }} />
      {f >= 140 && <Piece src={src} x={0} y={0} w={949} h={140} style={piece(140, 0, -60)} />}
      {f >= 146 && <Piece src={src} x={50} y={170} w={850} h={390} style={{ ...piece(146, 600, 0), borderRadius: 30 }} />}
      {f >= 156 && <Piece src={src} x={50} y={655} w={850} h={540} style={{ ...piece(156), borderRadius: 30 }} />}
      {f >= 160 &&
        cellsY.flatMap((cy, r) =>
          cellsX.map((cx, c) => {
            const i = r * 3 + c;
            const at = 160 + i * 4;
            const s = 1 + 0.12 * Math.sin(Math.PI * t01(f, at, at + 8, (t) => t));
            return <Piece key={i} src={src} x={cx - 130} y={cy - 105} w={260} h={210} style={{ transform: `scale(${s.toFixed(4)})`, opacity: f >= at ? 1 : 0 }} />;
          }),
        )}
      {f >= 182 && <Piece src={src} x={0} y={1240} w={949} h={560} style={piece(182)} />}
      {f >= 186 && <Piece src={src} x={0} y={1800} w={949} h={195} style={piece(186, 0, 80)} />}
    </UI>
  );
};

const SIDE: { src: string; dx: number; rot: number; z: number }[] = [
  { src: '09-aduan-form.png', dx: -560, rot: 30, z: 0 },
  { src: '03-sambungan-prosedur.png', dx: 560, rot: -30, z: 0 },
  { src: '07-riwayat-tagihan.png', dx: -300, rot: 28, z: 1 },
  { src: '02-info-gangguan.png', dx: 300, rot: -28, z: 1 },
];

export const S2: React.FC = () => {
  const f = useCurrentFrame();
  const tilt = t01(f, 120, 140, easeOutExpo) * (1 - t01(f, 190, 214, easeInOutSmooth));
  const s06 = lerp(1, 1.06, t01(f, 190, 214));
  const fan = t01(f, 215, 238, easeOutExpo);
  const exit = t01(f, 255, 270, (t) => t * t);
  const sc = lerp(s06, 0.62, fan) * lerp(1, 4.2, exit);
  const cy = lerp(PHONE0.cy, 1050, fan);
  const blueToShot = t01(f, 136, 146);
  const white = t01(f, 258, 266);
  return (
    <AbsoluteFill style={{ background: C.white }}>
      {/* HP samping (coverflow) */}
      {f >= 215 &&
        SIDE.map((s, i) => {
          const p = springAt(f, 217 + i * 3, 30, { damping: 15, stiffness: 120, mass: 0.8 });
          const out = t01(f, 254, 266, easeIn);
          const dx = s.dx * p + Math.sign(s.dx) * 900 * out;
          return (
            <Device
              key={s.src}
              cx={540 + dx}
              cy={1050}
              w={560}
              transform={`perspective(2200px) rotateY(${(s.rot * p).toFixed(2)}deg) scale(${(0.55 * (s.z ? 1 : 0.88)).toFixed(3)})`}
              shadow={0.6}
              style={{ opacity: ip(p, [0, 0.3], [0, 1]) * (1 - out) }}
            >
              <UI src={s.src} width={560 - BZ * 2} />
            </Device>
          );
        })}
      {/* HP utama */}
      <Device
        cx={540}
        cy={cy}
        w={560}
        screenBg={C.blue}
        transform={`perspective(2200px) rotateY(${(-18 * tilt).toFixed(2)}deg) scale(${sc.toFixed(4)})`}
      >
        <div style={{ position: 'absolute', inset: 0, opacity: blueToShot }}>
          <BerandaBuild f={f} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: C.white, opacity: white }} />
      </Device>
      {/* Teks */}
      <Txt text="Aplikasi resmi" f={f} at={124} x={540} y={330} size={96} out={214} />
      <Txt text="Tirta Ayu" f={f} at={190} x={540} y={440} size={96} color={C.blue} out={216} />
      <Txt text="Semua urusan air" f={f} at={222} x={540} y={330} size={88} out={252} />
      <Txt text="di HP kamu" f={f} at={226} x={540} y={430} size={88} color={C.blue} out={254} />
    </AbsoluteFill>
  );
};
// konstanta dipakai untuk SFX
export const S2_FAN = [217, 220, 223, 226];
void K06;

/* ================================================================== */
/* S3 · 270–450 · Tagihan → Cek Tagihan → Bayar [QRIS] langsung → numpad */
/* ================================================================== */
const T7 = '07-riwayat-tagihan.png';
const K7 = 960 / 845; // jendela tagihan
const PAN0 = 160;
const PAN1 = 760;

const DIGITS = '0100000013';
const KEY_COL = [148, 448, 749];
const KEY_ROW: Record<string, [number, number]> = {
  '7': [0, 757], '8': [1, 757], '9': [2, 757],
  '4': [0, 955], '5': [1, 955], '6': [2, 955],
  '1': [0, 1155], '2': [1, 1155], '3': [2, 1155],
  '0': [0, 1354],
};
export const S3_KEYS = DIGITS.split('').map((_, i) => 410 + i * 3);
export const S3_TAP = 385;
export const S3_CARI = 441;

export const S3: React.FC = () => {
  const f = useCurrentFrame();
  /* 270–320: Tagihan raksasa → Cek Tagihan */
  const slide = t01(f, 271, 290, easeOutExpo);
  const xOf = (fr: number) => 540 + 760 * (1 - t01(fr, 271, 290, easeOutExpo));
  const shrink = t01(f, 300, 318, easeInOutSmooth);
  const cek = t01(f, 300, 312, easeOutExpo);
  const titleSize = lerp(230, 110, shrink);
  const titleY = lerp(960, 400, shrink);
  const titleOut = t01(f, 360, 370, easeInOutSmooth);
  /* 320–360 jendela */
  const win = springAt(f, 320, 30, { damping: 18, stiffness: 140, mass: 0.7 });
  const pan = lerp(PAN0, PAN1, t01(f, 326, 352, easeInOutSmooth));
  const winOut = t01(f, 358, 368, easeInOutSmooth);
  /* 360–400 Bayar [tombol] langsung */
  const grow = t01(f, 366, 380, easeOutExpo);
  const btnH = 106 * grow;
  const press = 1 - 0.05 * Math.sin(Math.PI * t01(f, S3_TAP, S3_TAP + 6, (t) => t));
  /* 400–450 tombol → HP numpad */
  const m = t01(f, 400, 414, easeInOutSmooth);
  const ph = { w: lerp(960, 520, m), h: lerp(106, phoneH(520), m), cy: lerp(960, 1080, m), r: lerp(22, 68, m) };
  const slideOutX = (fr: number) => 540 - 1500 * easeIn(t01(fr, 443, 450, (t) => t));
  const typed = S3_KEYS.filter((k) => f >= k).length;

  return (
    <AbsoluteFill style={{ background: C.white }}>
      <GlassBand f={f} at={270} out={300} y={960} h={400} src={T7} cx={50} cy={160} cw={845} />
      {/* Judul */}
      {f < 372 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: titleY,
            width: 1080,
            transform: `translateY(-50%) translateX(${(xOf(f) - 540).toFixed(1)}px)`,
            display: 'flex',
            justifyContent: 'center',
            opacity: 1 - titleOut,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: titleSize,
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
          }}
        >
          <HBlur id="b-tagihan" amount={(xOf(f - 1) - xOf(f)) * 0.5}>
            <div style={{ display: 'flex', opacity: slide > 0 ? 1 : 0 }}>
              <div style={{ overflow: 'hidden', maxWidth: `${cek * 3.2}em`, color: C.blue }}>Cek&nbsp;</div>
              <div style={{ color: C.ink }}>Tagihan</div>
            </div>
          </HBlur>
        </div>
      )}
      {/* Jendela riwayat tagihan */}
      {f >= 320 && f < 370 && (
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 500,
            width: 960,
            height: 900,
            borderRadius: 36,
            overflow: 'hidden',
            background: C.white,
            border: `3px solid ${C.line}`,
            boxShadow: '0 30px 80px rgba(22,36,59,0.16)',
            opacity: ip(win, [0, 0.3], [0, 1]) * (1 - winOut),
            transform: `translateY(${((1 - win) * 140 + winOut * 80).toFixed(1)}px) scale(${(0.94 + 0.06 * win).toFixed(4)})`,
          }}
        >
          <div style={{ position: 'absolute', left: -50 * K7, top: -pan * K7, width: 949 * K7, height: 1994 * K7 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: 949, height: 1994, transform: `scale(${K7})`, transformOrigin: '0 0' }}>
              <Img src={staticFile(`ui/${T7}`)} style={{ position: 'absolute', left: 0, top: 0, width: 949, height: 1994 }} />
              {[1150, 1295, 1440].map((ry, i) => {
                const at = 334 + i * 5;
                const p = t01(f, at, at + 12, easeOutExpo);
                return (
                  <React.Fragment key={ry}>
                    <div style={{ position: 'absolute', left: 40, top: ry - 20, width: 880, height: 112, background: C.white }} />
                    <Piece src={T7} x={40} y={ry - 20} w={880} h={112} style={{ opacity: p, transform: `translateX(${((1 - p) * 300).toFixed(1)}px)` }} />
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <Txt text="3 bulan terakhir" f={f} at={344} x={540} y={1460} size={56} weight={600} color={C.muted} out={360} />
      {/* Bayar [tombol] langsung */}
      <Txt text="Bayar" f={f} at={362} x={540} y={960 - 76 - btnH / 2} size={120} out={400} />
      <Txt text="langsung" f={f} at={368} x={540} y={960 + 76 + btnH / 2} size={120} color={C.blue} out={400} outDir={1} />
      {f >= 366 && f < 443 && (
        <Device
          cx={540}
          cy={ph.cy}
          w={ph.w}
          h={Math.max(1, ph.h)}
          radius={ph.r}
          bezel={BZ * m}
          bodyColor={mix(C.white, C.bezel, m)}
          shadow={0.3 + 0.7 * m}
          transform={`scale(${press.toFixed(4)})`}
        >
          {m < 1 && (
            <div style={{ position: 'absolute', inset: 0, opacity: 1 - t01(f, 404, 410) }}>
              <CropCard src={T7} x={50} y={718} w={850} h={94} dw={ph.w - 2 * BZ * m} radius={0} shadow={false} />
            </div>
          )}
          {f >= 404 && (
            <div style={{ position: 'absolute', inset: 0, opacity: t01(f, 404, 412) }}>
              <UI src="08-qris-numpad.png" width={520 - 2 * BZ}>
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
                    fontFamily: FONT,
                    fontWeight: 600,
                    fontSize: 70,
                    letterSpacing: '0.06em',
                    color: typed ? C.ink : '#9aa7b8',
                  }}
                >
                  {typed ? DIGITS.slice(0, typed) : 'XXXXXXXXXX'}
                </div>
                {S3_KEYS.map((k, i) => {
                  const [c, y] = KEY_ROW[DIGITS[i]];
                  const a = 1 - t01(f, k, k + 6);
                  if (f < k || a <= 0) return null;
                  return <div key={k} style={{ position: 'absolute', left: KEY_COL[c] - 140, top: y - 90, width: 280, height: 180, background: `rgba(36,77,169,${0.28 * a})`, borderRadius: 24 }} />;
                })}
                {f >= S3_CARI && (
                  <div style={{ position: 'absolute', left: 310, top: 1266, width: 580, height: 176, background: `rgba(255,255,255,${0.45 * (1 - t01(f, S3_CARI, S3_CARI + 6))})`, borderRadius: 24 }} />
                )}
              </UI>
            </div>
          )}
        </Device>
      )}
      {/* HP keluar ke kiri dengan blur */}
      {f >= 443 && (
        <HBlur id="b-numpad" amount={(slideOutX(f - 1) - slideOutX(f)) * 0.35} style={{ position: 'absolute', inset: 0 }}>
          <Device cx={slideOutX(f)} cy={1080} w={520}>
            <UI src="08-qris-numpad.png" width={520 - 2 * BZ} />
          </Device>
        </HBlur>
      )}
      <TapRing f={f} at={S3_TAP} x={540} y={960} />
      <TapRing f={f} at={S3_CARI} x={540 + (598 - 450) * ((520 - 2 * BZ) / 900)} y={1080 - phoneH(520) / 2 + BZ + 1354 * ((520 - 2 * BZ) / 900)} />
      <Txt text="Bayar pakai QRIS" f={f} at={404} x={540} y={400} size={84} out={440} />
    </AbsoluteFill>
  );
};

export { AppIcon, pop };
