import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { Img } from '../v3/DImg';
import { CropCard, Device, Grow, Piece, UI, cropH, lerp, phoneH, t01 } from '../v2/kit2';
import { B, Check, Say, easeInOutSmooth, easeOutExpo, ip } from '../v3/kit3';
import { ICONS, IconTile, Squircle, WideBento } from '../v3/StyleFramesV3';
import { BLUE_BG, C3, JK, WHITE_BG } from '../v3/theme3';
import { CXW as CX, CYW as CY, HW, LX, PX, PY, SayL, WW } from './kitW';

/*
 * 16:9 re-layout of the v3 "Glass Blue" scenes. Same local timings as src/v3 (v11, 60 s):
 * hook / question beats stay centred, content beats put the text on the left and the phone or
 * screenshots on the right.
 */
const px = (v: number) => `${v.toFixed(1)}px`;

/* S1 · squircle draws → emblem → "Tiray" → sentence (centred, scaled 1.25 for the wide frame) */
const S1K = 1.25;
export const S1W: React.FC = () => {
  const f = useCurrentFrame();
  const draw = t01(f, 2, 32);
  const fill = t01(f, 26, 54, easeOutExpo);
  const embl = t01(f, 32, 58, easeOutExpo);
  const reveal = t01(f, 62, 92);
  const sent = t01(f, 96, 124);
  const fold = t01(f, 145, 165, easeInOutSmooth);
  const out = t01(f, 163, 172);
  const s = lerp(lerp(360, 240, reveal), 92, sent);
  const tiraySize = lerp(110, 66, sent);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transformOrigin: `${CX}px ${CY}px`, transform: `scale(${S1K})` }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: lerp(CY - 50, CY, sent) - 200,
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: JK,
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        <Grow t={sent * (1 - fold)} maxW={620} gap={20}>
          <span style={{ fontSize: 66, fontWeight: 600, color: C3.ink, opacity: Math.max(0, 1 - fold * 2) }}>Yuh kenalan sama</span>
        </Grow>
        <div style={{ position: 'relative', width: s, height: s, flexShrink: 0 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: s * 0.26,
              background: 'linear-gradient(160deg, #ffffff, #e6f0fa)',
              boxShadow: `inset 0 2px 0 #fff, 0 ${px(s * 0.09)} ${px(s * 0.22)} rgba(36,77,169,${(0.22 * fill).toFixed(3)})`,
              opacity: fill * (1 - sent),
            }}
          />
          <svg width={s} height={s} style={{ position: 'absolute', inset: 0, opacity: 1 - sent }}>
            <rect x={3} y={3} width={s - 6} height={s - 6} rx={s * 0.26} fill="none" stroke={C3.blue} strokeWidth={4} pathLength={1} strokeDasharray={`${draw} 1`} opacity={1 - fill * 0.7} />
          </svg>
          <Img
            src={staticFile('brand/lambang-warna.svg')}
            style={{ position: 'absolute', left: s * 0.17, top: s * 0.17, width: s * 0.66, height: s * 0.66, opacity: embl * (1 - sent), transform: `scale(${(0.4 + 0.6 * embl).toFixed(4)})` }}
          />
          <Img src={staticFile('brand/lambang-warna-alas-putih.svg')} style={{ position: 'absolute', inset: 0, width: s, height: s, opacity: sent }} />
        </div>
        <Grow t={reveal * (1 - fold)} maxW={420} style={{ marginLeft: reveal * (1 - fold) * lerp(34, 18, sent) }}>
          <span style={{ fontSize: tiraySize, fontWeight: 700, color: C3.blue, opacity: Math.max(0, 1 - fold * 2) }}>Tiray</span>
        </Grow>
      </div>
    </AbsoluteFill>
  );
};

/* S2 · emblem squircle → phone outline on the right → Beranda builds → coverflow */
const PW2 = 420;
const BER = '06-beranda.png';
const LAYERS: [number, number, number, number][] = [
  [0, 0, 949, 140],
  [50, 170, 850, 390],
  [50, 655, 850, 540],
  [0, 1240, 949, 560],
  [0, 1800, 949, 195],
];
const FLOW = ['09-aduan-form.png', '03-sambungan-prosedur.png', BER, '07-riwayat-tagihan.png', '02-info-gangguan.png'];

export const S2W: React.FC = () => {
  const f = useCurrentFrame();
  const grow = t01(f, 16, 50, easeInOutSmooth);
  const screen = t01(f, 40, 56);
  const tilt = t01(f, 30, 110);
  const cf = t01(f, 104, 138, easeInOutSmooth);
  const drift = t01(f, 120, 196, (t) => t);
  const tail = t01(f, 174, 202, easeInOutSmooth);
  const w = lerp(PW2, 380, cf);
  const hh = phoneH(w);
  const s0 = 92 * 1.25; // S1's final emblem squircle
  const ow = lerp(s0, PW2, grow);
  const oh = lerp(s0, phoneH(PW2), grow);
  const ocx = lerp(CX, PX, grow);
  const ocy = lerp(CY, PY, grow);
  const base = t01(f, 88, 102);
  return (
    <AbsoluteFill>
      <SayL f={f} at={48} out={100} y={470} size={72}>
        Aplikasi resmi
      </SayL>
      <SayL f={f} at={52} out={100} y={572} size={100} weight={700} color={C3.blue}>
        Tirta Ayu
      </SayL>
      <SayL f={f} at={118} out={180} y={470} size={66}>
        Semua layanan air,
      </SayL>
      <SayL f={f} at={122} out={180} y={565} size={66}>
        <span>di</span>
        <B>HP kamu</B>
      </SayL>
      {f >= 108 &&
        FLOW.map((src, i) => {
          const slot = i - 2;
          if (slot === 0 || Math.abs(slot) > 1) return null;
          const x = PX + slot * lerp(520, 290, cf) - drift * 30 + slot * tail * 300;
          return (
            <Device
              key={src}
              cx={x}
              cy={PY}
              w={380}
              bodyColor={C3.blue}
              bezel={12}
              shadow={0.5}
              transform={`perspective(2000px) rotateY(${(-slot * 30).toFixed(1)}deg) scale(0.84)`}
              style={{ opacity: cf * (1 - tail), zIndex: 2 }}
            >
              <UI src={src} width={356} />
            </Device>
          );
        })}
      {f < 56 && (
        <div
          style={{
            position: 'absolute',
            left: ocx - ow / 2,
            top: ocy - oh / 2,
            width: ow,
            height: oh,
            borderRadius: lerp(30, PW2 * 0.13, grow),
            border: `${lerp(4, 12, grow).toFixed(1)}px solid ${C3.blue}`,
            background: `rgba(36,77,169,${(0.06 * grow).toFixed(3)})`,
            opacity: ip(f, [14, 18], [0, 1]),
          }}
        />
      )}
      {f >= 38 && f < 180 && (
        <Device
          cx={PX - drift * 30}
          cy={PY}
          w={w}
          h={hh}
          bodyColor={C3.blue}
          bezel={12}
          shadow={screen}
          transform={`perspective(2200px) rotateY(${lerp(-12, 0, tilt).toFixed(2)}deg) rotateX(${lerp(5, 0, tilt).toFixed(2)}deg)`}
          style={{ opacity: screen, zIndex: 5 }}
        >
          <UI src={BER} width={w - 24} hideBase={base < 1}>
            {base < 1 &&
              LAYERS.map(([x, y, lw, lh], i) => {
                const p = t01(f, 42 + i * 9, 60 + i * 9, easeOutExpo);
                return <Piece key={y} src={BER} x={x} y={y} w={lw} h={lh} style={{ opacity: p, transform: `translateY(${px((1 - p) * 120)})` }} />;
              })}
            {base > 0 && base < 1 && <Piece src={BER} x={0} y={0} w={949} h={1995} style={{ opacity: base }} />}
          </UI>
        </Device>
      )}
    </AbsoluteFill>
  );
};

/* S3 · zoom into the LAYANAN grid → six glass tiles (3×2 on the right), title on the left (blue) */
const W3 = 380;
const K3 = (W3 - 24) / 949;
const SCR3 = { x: PX - W3 / 2 + 12, y: PY - phoneH(W3) / 2 + 12 };
const O3 = { x: PX, y: SCR3.y + 925 * K3 };
const Z3 = 2.2;
const TY3 = 575; // zoom settles the grid around the tile block's centre
const TL = [960, 1260, 1560];
const TT = [250, 580];
const zoomPt = (x: number, y: number, z: number) => {
  const s = lerp(1, Z3, z);
  const px0 = SCR3.x + x * K3;
  const py0 = SCR3.y + y * K3;
  return { x: O3.x + (px0 - O3.x) * s, y: O3.y + (py0 - O3.y) * s + lerp(0, TY3 - O3.y, z) };
};

export const S3W: React.FC = () => {
  const f = useCurrentFrame();
  const z = t01(f, 0, 46, easeInOutSmooth);
  const phoneOut = t01(f, 44, 66);
  const tail = t01(f, 90, 112, easeInOutSmooth);
  return (
    <AbsoluteFill>
      {phoneOut < 1 && (
        <AbsoluteFill
          style={{
            transformOrigin: `${O3.x}px ${O3.y}px`,
            transform: `translateY(${px(lerp(0, TY3 - O3.y, z))}) scale(${lerp(1, Z3, z).toFixed(4)})`,
            opacity: 1 - phoneOut,
          }}
        >
          <Device cx={PX} cy={PY} w={W3} bodyColor={C3.blue} bezel={12} shadow={1 - z}>
            <UI src={BER} width={W3 - 24} />
          </Device>
        </AbsoluteFill>
      )}
      <SayL f={f} at={60} out={90} y={480} size={100} weight={700} color={C3.white}>
        Layanan
      </SayL>
      <SayL f={f} at={64} out={90} y={600} size={100} weight={700} color={C3.sky}>
        lengkap
      </SayL>
      {ICONS.map(([x, y, label], i) => {
        const p = t01(f, 42 + i * 4, 72 + i * 4, easeOutExpo);
        if (p <= 0) return null;
        const from = zoomPt(x, y, 1);
        const l = TL[i % 3];
        const t = TT[Math.floor(i / 3)];
        const tx = lerp(from.x - 130, l, p);
        const ty = lerp(from.y - 145, t, p);
        const sc = lerp(0.85, 1, p) * (1 - 0.1 * tail);
        return (
          <div key={label} style={{ position: 'absolute', inset: 0, opacity: Math.min(1, p * 2) * (1 - tail), transform: `translate(${px(tx - l)}, ${px(ty - t)})` }}>
            <div style={{ position: 'absolute', inset: 0, transformOrigin: `${l + 130}px ${t + 145}px`, transform: `scale(${sc.toFixed(4)})` }}>
              <IconTile x={x} y={y} label={label} l={l} t={t} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* S4 · Tagihan squircle (centre) → table card (right) → two QRIS phones (right), text left */
const TAG = '07-riwayat-tagihan.png';
const QR = '08-qris-numpad.png';
const DIGITS = '0100000013';
const ROWS7 = [1150, 1295, 1440];
const PH1 = { x: 1180, y: 590 };

export const S4W: React.FC = () => {
  const f = useCurrentFrame();
  const sq = t01(f, 4, 34, easeOutExpo);
  const card = t01(f, 44, 72, easeInOutSmooth);
  const toPh = t01(f, 100, 126, easeInOutSmooth);
  const ph1 = t01(f, 104, 126, easeOutExpo);
  const ring = t01(f, 124, 138, easeOutExpo);
  const ring2 = t01(f, 136, 158);
  const ph2 = t01(f, 144, 166, easeOutExpo);
  const typed = Math.max(0, Math.min(10, Math.floor((f - 160) / 3) + 1));
  const exit = t01(f, 185, 213, easeInOutSmooth);
  const s0 = 640;
  const r0 = { l: CX - s0 / 2, t: CY - s0 / 2 + (1 - sq) * 120, w: s0, h: s0, r: s0 * 0.26 };
  const r1 = { l: 1000, t: 270, w: 800, h: 540, r: 44 };
  const R = { l: lerp(r0.l, r1.l, card), t: lerp(r0.t, r1.t, card), w: lerp(r0.w, r1.w, card), h: lerp(r0.h, r1.h, card), r: lerp(r0.r, r1.r, card) };
  const IW = r1.w - 80;
  const cardK = IW / 850;
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${px(exit * 60)})` }}>
      {toPh < 1 && (
        <div
          style={{
            position: 'absolute',
            left: R.l,
            top: R.t,
            width: R.w,
            height: R.h,
            borderRadius: R.r,
            overflow: 'hidden',
            opacity: Math.min(1, sq * 1.6) * (1 - toPh),
            transformOrigin: card > 0 ? `${PH1.x - R.l}px ${PH1.y - R.t}px` : '50% 50%',
            transform: `scale(${(lerp(1, 0.6, toPh) * lerp(0.9, 1, sq)).toFixed(4)})`,
            background: card > 0 ? `rgba(255,255,255,${(0.1 + 0.9 * card).toFixed(3)})` : 'rgba(255,255,255,0.10)',
            border: `2px solid rgba(255,255,255,${(0.28 * (1 - card)).toFixed(3)})`,
            boxShadow: `inset 0 2px 0 rgba(255,255,255,0.45), 0 40px 90px rgba(10,30,80,${(0.35 - 0.2 * card).toFixed(3)})`,
          }}
        >
          {card < 1 && (
            <div style={{ position: 'absolute', left: 0, top: 0, width: 800, height: 800, transformOrigin: '0 0', transform: `scale(${(R.w / 800).toFixed(4)})`, opacity: 1 - card }}>
              <div style={{ position: 'absolute', left: 170, top: 60, filter: 'blur(3px)', opacity: 0.85 }}>
                <UI src={TAG} width={460} />
              </div>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(36,77,169,0.15) 0%, rgba(36,77,169,0.55) 100%)' }} />
            </div>
          )}
          {card > 0 && (
            <div style={{ position: 'absolute', left: 40, top: 40, width: IW, height: r1.h - 80, overflow: 'hidden', opacity: card }}>
              <div style={{ position: 'absolute', left: -50 * cardK, top: -1010 * cardK, width: 949 * cardK, height: 1994 * cardK }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: 949, height: 1994, transform: `scale(${cardK})`, transformOrigin: '0 0' }}>
                  <Img src={staticFile(`ui/${TAG}`)} style={{ position: 'absolute', left: 0, top: 0, width: 949, height: 1994 }} />
                  {ROWS7.map((ry, i) => {
                    const p = t01(f, 58 + i * 6, 72 + i * 6, easeOutExpo);
                    return (
                      <React.Fragment key={ry}>
                        <div style={{ position: 'absolute', left: 40, top: ry - 20, width: 880, height: 112, background: C3.white }} />
                        <Piece src={TAG} x={40} y={ry - 20} w={880} h={112} style={{ opacity: p, transform: `translateX(${px((1 - p) * 300)})` }} />
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {card < 1 && f >= 12 && (
        <div style={{ position: 'absolute', inset: 0, opacity: t01(f, 12, 24) * (1 - t01(f, 44, 54)) }}>
          <div
            style={{
              position: 'absolute',
              left: CX - 380,
              width: 760,
              top: CY - 110,
              height: 220,
              borderRadius: 56,
              background: 'rgba(36,77,169,0.78)',
              border: '2px solid rgba(255,255,255,0.35)',
              boxShadow: '0 30px 70px rgba(10,30,80,0.35)',
              transform: `scaleX(${lerp(0.7, 1, t01(f, 12, 30, easeOutExpo)).toFixed(4)})`,
            }}
          />
        </div>
      )}
      <Say f={f} at={14} out={42} y={CY - 32} size={122} color={C3.white} weight={700}>
        Tagihan
      </Say>
      <Say f={f} at={20} out={42} y={CY + 76} size={38} color={C3.sky} weight={500}>
        Cek dan bayar dari HP
      </Say>
      <SayL f={f} at={56} out={98} y={480} size={72}>
        Cek tagihan
      </SayL>
      <SayL f={f} at={60} out={98} y={575} size={72} weight={700} color={C3.blue}>
        3 bulan terakhir
      </SayL>
      <SayL f={f} at={108} y={480} size={72}>
        <span>Bayar pakai</span>
        <B>QRIS</B>
      </SayL>
      <SayL f={f} at={112} y={575} size={72}>
        tanpa ribet
      </SayL>
      {f >= 104 && (
        <Device
          cx={lerp(1400, PH1.x, ph1)}
          cy={lerp(CY, PH1.y, ph1)}
          w={380}
          bodyColor={C3.blue}
          bezel={12}
          transform={`perspective(2200px) rotateY(${lerp(0, 8, ph2).toFixed(2)}deg) scale(${lerp(0.8, 1, ph1).toFixed(4)})`}
          style={{ opacity: ph1 }}
        >
          <UI src={TAG} width={356}>
            {ring > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: 46,
                  top: 704,
                  width: 858,
                  height: 122,
                  borderRadius: 34,
                  border: `16px solid ${C3.sky}`,
                  boxShadow: `0 0 0 22px rgba(155,213,239,0.4)`,
                  opacity: ring,
                  transform: `scale(${lerp(1.15, 1, ring).toFixed(4)})`,
                }}
              />
            )}
            {ring2 > 0 && ring2 < 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: 46,
                  top: 704,
                  width: 858,
                  height: 122,
                  borderRadius: 34,
                  border: `10px solid ${C3.sky}`,
                  opacity: 1 - ring2,
                  transform: `scale(${lerp(1, 1.12, ring2).toFixed(4)})`,
                }}
              />
            )}
          </UI>
        </Device>
      )}
      {f >= 144 && (
        <Device cx={lerp(2300, 1610, ph2)} cy={615} w={380} bodyColor={C3.blue} bezel={12} transform="perspective(2200px) rotateY(-8deg)" style={{ opacity: Math.min(1, ph2 * 2) }}>
          <UI src={QR} width={356}>
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
                fontFamily: JK,
                fontWeight: 600,
                fontSize: 70,
                letterSpacing: '0.06em',
                color: typed ? C3.ink : '#9aa7b8',
              }}
            >
              {typed ? DIGITS.slice(0, typed) : 'XXXXXXXXXX'}
            </div>
          </UI>
        </Device>
      )}
    </AbsoluteFill>
  );
};

/* S5 · Ada keluhan? (centre) → Lapor dari HP (left) + phone flanked by complaint types → Pantau statusnya */
const F9 = '09-aduan-form.png';
const PW5 = 340;
const PCX5 = 1300;
const PCY5 = 560;
const TYPES5 = [
  { t: 'Air Tidak Mengalir', side: -1, y: 360, hot: true },
  { t: 'Kebocoran', side: 1, y: 360 },
  { t: 'Air Keruh', side: -1, y: 560 },
  { t: 'Meter Rusak', side: 1, y: 560 },
  { t: 'Tekanan Lemah', side: -1, y: 760 },
  { t: 'Stop Kran', side: 1, y: 760 },
];
const CARDS1 = [275, 545, 815];

export const S5W: React.FC = () => {
  const f = useCurrentFrame();
  const phIn = t01(f, 48, 70, easeOutExpo);
  const out1 = t01(f, 114, 140, easeInOutSmooth);
  const exit = t01(f, 180, 212, easeInOutSmooth);
  return (
    <AbsoluteFill>
      <Say f={f} at={12} out={44} y={CY} size={96} weight={700}>
        <span>Ada</span>
        <B>keluhan?</B>
      </Say>
      <SayL f={f} at={50} out={104} y={470} size={120} color={C3.blue} weight={700}>
        Lapor
      </SayL>
      <SayL f={f} at={56} out={104} y={590} size={72}>
        dari HP
      </SayL>
      {f >= 48 && out1 < 1 && (
        <Device cx={PCX5 - out1 * 900} cy={PCY5 + (1 - phIn) * 220} w={PW5} bodyColor={C3.blue} bezel={12} style={{ opacity: Math.min(1, phIn * 2) * (1 - out1) }}>
          <UI src={F9} width={PW5 - 24} />
        </Device>
      )}
      {TYPES5.map((c, i) => {
        const at = 70 + i * 4;
        const p = t01(f, at, at + 20, easeOutExpo);
        if (p <= 0 || out1 >= 1) return null;
        const left = c.side < 0 ? 760 : PCX5 + PW5 / 2 + 44;
        const w = c.side < 0 ? PCX5 - PW5 / 2 - 44 - 760 : 340;
        return (
          <div
            key={c.t}
            style={{
              position: 'absolute',
              left,
              top: c.y - 60,
              width: w,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: c.side < 0 ? 'flex-end' : 'flex-start',
              textAlign: c.side < 0 ? 'right' : 'left',
              fontFamily: JK,
              fontSize: 38,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: '-0.01em',
              color: c.hot ? C3.blue : C3.ink,
              opacity: ip(p, [0, 0.5], [0, 1]) * (1 - out1),
              transform: `translateX(${px(-c.side * (1 - p) * 70 - out1 * 900)})`,
            }}
          >
            {c.t}
          </div>
        );
      })}
      <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${px(-exit * 90)})` }}>
        <SayL f={f} at={124} y={480} size={80}>
          Pantau
        </SayL>
        <SayL f={f} at={128} y={585} size={80} weight={700} color={C3.blue}>
          statusnya
        </SayL>
        {CARDS1.map((y, i) => {
          const at = 128 + (CARDS1.length - 1 - i) * 7;
          const p = t01(f, at, at + 20, easeOutExpo);
          if (p <= 0) return null;
          const dw = 760;
          const dh = cropH(828, 245, dw);
          const top = 175 + i * (dh + 22);
          return (
            <div key={y} style={{ position: 'absolute', left: PX - dw / 2, top: top + (1 - p) * 400, opacity: Math.min(1, p * 2) }}>
              <CropCard src="01-aduan-daftar.png" x={36} y={y} w={828} h={245} dw={dw} radius={28} />
              {i === 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: (671 - 8) * (dw / 828),
                    top: (40 - 8) * (dw / 828),
                    width: 135 * (dw / 828),
                    height: 64 * (dw / 828),
                    borderRadius: 16,
                    border: `6px solid #30b349`,
                    opacity: t01(f, 156, 166),
                    transform: `scale(${lerp(1.3, 1, t01(f, 156, 168, easeOutExpo)).toFixed(4)})`,
                  }}
                />
              )}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* Blue wipe rising from the bottom edge (S6, S8) */
const Wipe: React.FC<{ p: number }> = ({ p }) =>
  p < 1 ? (
    <div style={{ position: 'absolute', left: 0, bottom: 0, width: WW, height: HW * p, overflow: 'hidden', borderRadius: `${px(80 * (1 - p))} ${px(80 * (1 - p))} 0 0` }}>
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: WW, height: HW, background: BLUE_BG }} />
    </div>
  ) : null;

/* S6 · Air mati? → disruption notices stack on the right (blue) */
const CARDS2 = [1105, 870, 635, 400, 165];

export const S6W: React.FC = () => {
  const f = useCurrentFrame();
  const dw = 640;
  const dh = cropH(840, 205, dw);
  return (
    <AbsoluteFill>
      <Wipe p={t01(f, 0, 30, easeInOutSmooth)} />
      <Say f={f} at={14} out={50} y={CY} size={120} color={C3.white} weight={700}>
        Air mati?
      </Say>
      <SayL f={f} at={58} y={480} size={72} color={C3.white}>
        Info gangguan
      </SayL>
      <SayL f={f} at={62} y={575} size={72} color={C3.sky} weight={700}>
        langsung masuk
      </SayL>
      {CARDS2.map((y, j) => {
        const at = 62 + j * 10;
        const p = t01(f, at, at + 20, easeOutExpo);
        if (p <= 0) return null;
        const k = CARDS2.reduce((acc, _, i) => (i > j ? acc + t01(f, 62 + i * 10, 80 + i * 10, easeOutExpo) : acc), 0);
        const top = 165 + k * (dh + 16) - (1 - p) * 140;
        return (
          <div key={y} style={{ position: 'absolute', left: PX - dw / 2, top, opacity: Math.min(1, p * 2), transform: `scale(${lerp(0.94, 1, p).toFixed(4)})` }}>
            <CropCard src="02-info-gangguan.png" x={30} y={y} w={840} h={205} dw={dw} radius={24} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* S7 · white sheet up → Mau pasang baru? → Daftar dari HP (left) + stepper phone → success card */
const F3 = '03-sambungan-prosedur.png';
const STEP_C: [number, number][] = [
  [177, 383],
  [358, 383],
  [543, 383],
  [754, 383],
];
const ITEM_Y = [1290, 1460, 1630, 1800];

export const S7W: React.FC = () => {
  const f = useCurrentFrame();
  const sheet = t01(f, 0, 32, easeInOutSmooth);
  const ph = t01(f, 54, 76, easeOutExpo);
  const dlg = t01(f, 124, 148, easeInOutSmooth);
  const pw = 400;
  const dw = 560;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: WW,
          height: HW,
          background: WHITE_BG,
          borderRadius: `${px(80 * (1 - sheet))} ${px(80 * (1 - sheet))} 0 0`,
          transform: `translateY(${px((1 - sheet) * HW)})`,
          boxShadow: '0 -30px 80px rgba(10,30,80,0.25)',
        }}
      />
      <Say f={f} at={20} out={54} y={CY} size={96} weight={700}>
        <span>Mau pasang</span>
        <B>baru?</B>
      </Say>
      <SayL f={f} at={58} y={480} size={80}>
        Daftar
      </SayL>
      <SayL f={f} at={62} y={585} size={80}>
        <span>dari</span>
        <B>HP</B>
      </SayL>
      {f >= 54 && (
        <Device cx={PX} cy={lerp(1150, PY, ph)} w={pw} bodyColor={C3.blue} bezel={12} style={{ opacity: Math.min(1, ph * 2) }}>
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
            left: PX - dw / 2,
            top: PY - cropH(574, 595, dw) / 2,
            transform: `scale(${lerp(0.88, 1, dlg).toFixed(4)})`,
            opacity: ip(dlg, [0, 0.6], [0, 1]),
          }}
        >
          <CropCard src="04-sambungan-sukses.png" x={73} y={437} w={574} h={595} dw={dw} radius={34} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/* S8 · blue wipe → Ga cuma itu → masih banyak → info pelanggan (left) + glass squircle (right) */
const SQ8 = { x: PX, y: 565, s: 760, k: 0.86 };

export const S8W: React.FC = () => {
  const f = useCurrentFrame();
  const sq = t01(f, 98, 120, easeOutExpo);
  const exit = t01(f, 132, 160, easeInOutSmooth);
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `scale(${(1 - 0.06 * exit).toFixed(4)})` }}>
      <Wipe p={t01(f, 0, 30, easeInOutSmooth)} />
      <Say f={f} at={22} out={56} y={CY} size={110} color={C3.white} weight={700}>
        Ga cuma itu
      </Say>
      <Say f={f} at={58} out={96} y={CY - 52} size={72} color={C3.white} dx={240}>
        masih banyak yang bisa
      </Say>
      <Say f={f} at={64} out={96} y={CY + 58} size={72} color={C3.white} dx={240}>
        <Img src={staticFile('brand/lambang-warna-alas-putih.svg')} style={{ width: 92, height: 92 }} />
        <span style={{ fontWeight: 700 }}>Tiray</span>
        <span>bantu</span>
      </Say>
      <SayL f={f} at={100} y={480} size={72} color={C3.white}>
        Info pelanggan &amp;
      </SayL>
      <SayL f={f} at={104} y={575} size={72} color={C3.sky} weight={700}>
        pemakaian
      </SayL>
      {sq > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: Math.min(1, sq * 2),
            transformOrigin: `${SQ8.x}px ${SQ8.y}px`,
            transform: `scale(${(lerp(0.85, 1, sq) * SQ8.k).toFixed(4)})`,
          }}
        >
          <Squircle cx={SQ8.x} cy={SQ8.y} s={SQ8.s} onBlue>
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

/* S9 · Semua di Tiray: the wide bento, scaled up to fill the frame */
const BENTO_ORDER = ['1:0', '2:0', '1:314', '2:314', '0:0', '3:0', '0:266', '3:266'];
const BS = 1.34;
const BCY = 645;

export const S9W: React.FC = () => {
  const f = useCurrentFrame();
  const hero = t01(f, 2, 26, easeOutExpo);
  const push = t01(f, 92, 133, (t) => t);
  const tail = t01(f, 108, 133, easeInOutSmooth);
  const p = (col: number, y: number) => {
    if (col === 1 && y === 162) return hero;
    const i = BENTO_ORDER.indexOf(`${col}:${y}`);
    const a = 20 + Math.max(0, i) * 6;
    return t01(f, a, a + 26, easeOutExpo);
  };
  return (
    <AbsoluteFill style={{ opacity: 1 - tail }}>
      <Say f={f} at={8} y={190} size={66}>
        <span>Semua di</span>
        <B>Tiray</B>
      </Say>
      <div
        style={{
          position: 'absolute',
          left: CX - 500,
          top: BCY - 260,
          transformOrigin: '500px 260px',
          transform: `scale(${(BS * (lerp(1, 1.04, push) * lerp(1.12, 1, hero) + tail * 0.06)).toFixed(4)})`,
        }}
      >
        <WideBento p={p} />
      </div>
    </AbsoluteFill>
  );
};

/* S10 · #Yuh → #YuhBukaTiray + underline + badge → green tab becomes the outro's merged dot */
const YUH_CENTER = 252;
const TY10 = 470; // hashtag centre line
const UL = TY10 + 97; // underline centre (same offsets as 9:16)
/** Measured from outro_tirta_ayu_16x9_final_v1_cepat.mp4: merged dot Ø62 at (959,539) on frame 47,
 *  Ø172 / 220 / 232 on 48 / 49 / 50 (soft glow). Local 168..171 = outro 47..50; the outro joins from 51. */
const MERGE = { x: 959, y: 539, d: 62 };
const GROW = [172, 220, 232];
const GLOW = [0.12, 0.24, 0.32];
export const LAST10W = 171;
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

export const S10W: React.FC = () => {
  const f = useCurrentFrame();
  const inn = t01(f, 10, 28, easeOutExpo);
  const shift = t01(f, 30, 50, easeInOutSmooth);
  const rev = t01(f, 54, 76, easeInOutSmooth);
  const line = t01(f, 74, 88, easeOutExpo);
  const tab = t01(f, 86, 96, easeOutExpo);
  const badge = t01(f, 92, 110, easeOutExpo);
  const out = t01(f, 132, 150, easeInOutSmooth);
  const bg = t01(f, 134, 160, easeInOutSmooth);
  const r = t01(f, 130, 150, easeInOutSmooth);
  const mv = t01(f, 146, 168, easeInOutSmooth);
  const L0 = CX - 380;
  const tabX = L0 + 694 + (66 * tab) / 2;
  const k = f - (LAST10W - 2);
  const big = k >= 0 ? GROW[Math.min(2, k)] : 0;
  const gx = big ? MERGE.x : lerp(tabX, MERGE.x, mv);
  const gy = big ? MERGE.y : lerp(UL, MERGE.y, mv);
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
          top: TY10 - 150,
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
          style={{ position: 'absolute', left: CX - 220, top: UL + 8, width: 440, transform: `translateY(${px((1 - badge) * 40 + out * 30)})`, opacity: Math.min(1, badge * 2) * (1 - out) }}
        />
      )}
      {f >= 122 && <Img src={staticFile('outro/bg169.png')} style={{ position: 'absolute', left: 0, top: 0, width: WW, height: HW, opacity: bg }} />}
      {lw > 1 && <Pill cx={L0 + 680 * line - lw / 2} cy={UL} w={lw} h={14} color={C3.blue} />}
      {tab > 0 && <Pill cx={gx} cy={gy} w={gw} h={gh} color={C3.green} glow={glow} />}
    </AbsoluteFill>
  );
};
