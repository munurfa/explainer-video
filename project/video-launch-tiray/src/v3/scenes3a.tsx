import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { Img } from './DImg';
import { CropCard, Device, Grow, Piece, UI, UI_SIZE, cropH, lerp, phoneH, t01 } from '../v2/kit2';
import { B, Say, easeInOutSmooth, easeOutExpo, ip } from './kit3';
import { ICONS, IconTile, Squircle } from './StyleFramesV3';
import { C3, JK } from './theme3';

const CX = 540;
const px = (v: number) => `${v.toFixed(1)}px`;

/* ================================================================== */
/* S1 · 0–147 · squircle draws → emblem → "Tiray" → sentence           */
/* ================================================================== */
export const S1: React.FC = () => {
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
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: lerp(900, 960, sent) - 200,
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
          {/* glass squircle body */}
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
            <rect
              x={3}
              y={3}
              width={s - 6}
              height={s - 6}
              rx={s * 0.26}
              fill="none"
              stroke={C3.blue}
              strokeWidth={4}
              pathLength={1}
              strokeDasharray={`${draw} 1`}
              opacity={1 - fill * 0.7}
            />
          </svg>
          <Img
            src={staticFile('brand/lambang-warna.svg')}
            style={{
              position: 'absolute',
              left: s * 0.17,
              top: s * 0.17,
              width: s * 0.66,
              height: s * 0.66,
              opacity: embl * (1 - sent),
              transform: `scale(${(0.4 + 0.6 * embl).toFixed(4)})`,
            }}
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

/* ================================================================== */
/* S2 · 147–327 · phone outline → Beranda builds → coverflow           */
/* ================================================================== */
const PW2 = 500;
const BER = '06-beranda.png';
const LAYERS: [number, number, number, number][] = [
  [0, 0, 949, 140],
  [50, 170, 850, 390],
  [50, 655, 850, 540],
  [0, 1240, 949, 560],
  [0, 1800, 949, 195],
];
const FLOW = ['09-aduan-form.png', '03-sambungan-prosedur.png', BER, '07-riwayat-tagihan.png', '02-info-gangguan.png'];

export const S2: React.FC = () => {
  const f = useCurrentFrame();
  const grow = t01(f, 16, 50, easeInOutSmooth);
  const screen = t01(f, 40, 56);
  const tilt = t01(f, 30, 110);
  const cf = t01(f, 104, 138, easeInOutSmooth);
  const drift = t01(f, 120, 196, (t) => t);
  const tail = t01(f, 174, 202, easeInOutSmooth);
  const w = lerp(PW2, 400, cf);
  const cy = lerp(1060, 1000, cf);
  const hh = phoneH(w);
  // outline morph: squircle 92 at (540,960) → phone
  const ow = lerp(92, PW2, grow);
  const oh = lerp(92, phoneH(PW2), grow);
  const ocy = lerp(960, 1060, grow);
  const base = t01(f, 88, 102);
  return (
    <AbsoluteFill>
      <Say f={f} at={48} out={100} y={400} size={70}>
        <span>Aplikasi resmi</span>
        <B>Tirta Ayu</B>
      </Say>
      <Say f={f} at={118} out={180} y={400} size={58}>
        <span>Semua layanan air, di</span>
        <B>HP kamu</B>
      </Say>
      {/* side phones of the coverflow */}
      {f >= 108 &&
        FLOW.map((src, i) => {
          const slot = i - 2;
          if (slot === 0 || Math.abs(slot) > 1) return null; // three phones only
          const a = Math.abs(slot);
          const x = CX + slot * lerp(720, 300, cf) - drift * 30 + slot * tail * 300;
          const sc = 1 - 0.16 * a;
          return (
            <Device
              key={src}
              cx={x}
              cy={1000}
              w={400}
              bodyColor={C3.blue}
              bezel={12}
              shadow={0.5}
              transform={`perspective(2000px) rotateY(${(-slot * 30).toFixed(1)}deg) scale(${sc.toFixed(3)})`}
              style={{ opacity: cf * (1 - tail) * (a === 2 ? 0.75 : 1), zIndex: 3 - a }}
            >
              <UI src={src} width={376} />
            </Device>
          );
        })}
      {/* outline while morphing */}
      {f < 56 && (
        <div
          style={{
            position: 'absolute',
            left: CX - ow / 2,
            top: ocy - oh / 2,
            width: ow,
            height: oh,
            borderRadius: lerp(24, PW2 * 0.13, grow),
            border: `${lerp(4, 12, grow).toFixed(1)}px solid ${C3.blue}`,
            background: `rgba(36,77,169,${(0.06 * grow).toFixed(3)})`,
            opacity: ip(f, [14, 18], [0, 1]),
          }}
        />
      )}
      {f >= 38 && f < 180 && (
        <Device
          cx={CX - drift * 30}
          cy={cy}
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

/* ================================================================== */
/* S3 · 327–434 · zoom into LAYANAN grid → six glass tiles (blue)      */
/* ================================================================== */
const W3 = 400;
const K3 = (W3 - 24) / 949;
const SCR3 = { x: CX - W3 / 2 + 12, y: 1000 - phoneH(W3) / 2 + 12 };
const O3 = { x: CX, y: SCR3.y + 925 * K3 };
const Z3 = 1.95; // capped: phone top stays below the Pemda / Tirta Ayu logos (~y 250)
const TL = [100, 410, 720];
const TT = [620, 960];
const zoomPt = (x: number, y: number, z: number) => {
  const s = lerp(1, Z3, z);
  const px0 = SCR3.x + x * K3;
  const py0 = SCR3.y + y * K3;
  return { x: O3.x + (px0 - O3.x) * s, y: O3.y + (py0 - O3.y) * s + lerp(0, 1000 - O3.y, z) };
};

export const S3: React.FC = () => {
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
            transform: `translateY(${px(lerp(0, 1000 - O3.y, z))}) scale(${lerp(1, Z3, z).toFixed(4)})`,
            opacity: 1 - phoneOut,
          }}
        >
          <Device cx={CX} cy={1000} w={W3} bodyColor={C3.blue} bezel={12} shadow={1 - z}>
            <UI src={BER} width={W3 - 24} />
          </Device>
        </AbsoluteFill>
      )}
      <Say f={f} at={60} out={90} y={470} size={70} color={C3.white}>
        Layanan lengkap
      </Say>
      {ICONS.map(([x, y, label], i) => {
        const p = t01(f, 42 + i * 4, 72 + i * 4, easeOutExpo);
        if (p <= 0) return null;
        const from = zoomPt(x, y, 1);
        const l = TL[i % 3];
        const t = TT[Math.floor(i / 3)];
        const tx = lerp(from.x - 130, l, p);
        const ty = lerp(from.y - 145, t, p);
        const o = 1 - tail;
        const sc = lerp(0.85, 1, p) * (1 - 0.1 * tail);
        return (
          <div key={label} style={{ position: 'absolute', inset: 0, opacity: Math.min(1, p * 2) * o, transform: `translate(${px(tx - l)}, ${px(ty - t)})` }}>
            <div style={{ position: 'absolute', inset: 0, transformOrigin: `${l + 130}px ${t + 145}px`, transform: `scale(${sc.toFixed(4)})` }}>
              <IconTile x={x} y={y} label={label} l={l} t={t} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* S4 · 434–625 · Tagihan squircle → table card → QRIS phone → numpad  */
/* ================================================================== */
const TAG = '07-riwayat-tagihan.png';
const QR = '08-qris-numpad.png';
const DIGITS = '0100000013';
const ROWS7 = [1150, 1295, 1440];

export const S4: React.FC = () => {
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
  // squircle → card rect
  const s0 = 800;
  const r0 = { l: CX - s0 / 2, t: 960 - s0 / 2 + (1 - sq) * 140, w: s0, h: s0, r: s0 * 0.26 };
  const r1 = { l: 90, t: 540, w: 900, h: 780, r: 44 };
  const R = { l: lerp(r0.l, r1.l, card), t: lerp(r0.t, r1.t, card), w: lerp(r0.w, r1.w, card), h: lerp(r0.h, r1.h, card), r: lerp(r0.r, r1.r, card) };
  const cardK = 820 / 850;
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${px(exit * 80)})` }}>
      {/* glass squircle / white card */}
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
            transformOrigin: card > 0 ? '315px 1000px' : `${CX}px 960px`,
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
            <div style={{ position: 'absolute', left: 40, top: 40, width: 820, height: 700, overflow: 'hidden', opacity: card }}>
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
      {/* glass band + word */}
      {card < 1 && f >= 12 && (
        <div style={{ position: 'absolute', inset: 0, opacity: t01(f, 12, 24) * (1 - t01(f, 44, 54)) }}>
          <div
            style={{
              position: 'absolute',
              left: 140,
              width: 800,
              top: 840,
              height: 240,
              borderRadius: 60,
              background: 'rgba(36,77,169,0.78)',
              border: '2px solid rgba(255,255,255,0.35)',
              boxShadow: '0 30px 70px rgba(10,30,80,0.35)',
              transform: `scaleX(${lerp(0.7, 1, t01(f, 12, 30, easeOutExpo)).toFixed(4)})`,
            }}
          />
        </div>
      )}
      <Say f={f} at={14} out={42} y={918} size={128} color={C3.white} weight={700}>
        Tagihan
      </Say>
      <Say f={f} at={20} out={42} y={1036} size={40} color={C3.sky} weight={500}>
        Cek dan bayar dari HP
      </Say>
      <Say f={f} at={56} out={98} y={420} size={56}>
        <span>Cek tagihan</span>
        <B>3 bulan terakhir</B>
      </Say>
      <Say f={f} at={108} y={400} size={60}>
        <span>Bayar pakai</span>
        <B>QRIS</B>
        <span>tanpa ribet</span>
      </Say>
      {/* left phone: 07 with QRIS ring */}
      {f >= 104 && (
        <Device
          cx={lerp(CX, 315, ph1)}
          cy={lerp(960, 1000, ph1)}
          w={410}
          bodyColor={C3.blue}
          bezel={12}
          transform={`perspective(2200px) rotateY(${lerp(0, 8, ph2).toFixed(2)}deg) scale(${lerp(0.8, 1, ph1).toFixed(4)})`}
          style={{ opacity: ph1 }}
        >
          <UI src={TAG} width={386}>
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
      {/* right phone: 08 numpad typing */}
      {f >= 144 && (
        <Device
          cx={lerp(1500, 765, ph2)}
          cy={1040}
          w={410}
          bodyColor={C3.blue}
          bezel={12}
          transform="perspective(2200px) rotateY(-8deg)"
          style={{ opacity: Math.min(1, ph2 * 2) }}
        >
          <UI src={QR} width={386}>
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

/* ================================================================== */
/* S5 · 625–810 · Ada keluhan? → Lapor dari HP → Pantau statusnya      */
/* ================================================================== */
const F9 = '09-aduan-form.png';
const PW5 = 300;
const PCX5 = CX; // phone centred, complaint types flank it
const PCY5 = 1060;
/** Complaint types (from the earlier Tiray launch plan; "Air Tidak Mengalir" and "Stop Kran" also appear in the app screenshots) */
const TYPES5 = [
  { t: 'Air Tidak Mengalir', side: -1, y: 840, hot: true },
  { t: 'Kebocoran', side: 1, y: 840 },
  { t: 'Air Keruh', side: -1, y: 1060 },
  { t: 'Meter Rusak', side: 1, y: 1060 },
  { t: 'Tekanan Lemah', side: -1, y: 1280 },
  { t: 'Stop Kran', side: 1, y: 1280 },
];
const CARDS1 = [275, 545, 815];

export const S5: React.FC = () => {
  const f = useCurrentFrame();
  const phIn = t01(f, 48, 70, easeOutExpo);
  const out1 = t01(f, 114, 140, easeInOutSmooth);
  const exit = t01(f, 180, 212, easeInOutSmooth);
  return (
    <AbsoluteFill>
      <Say f={f} at={12} out={44} y={900} size={80} weight={700}>
        <span>Ada</span>
        <B>keluhan?</B>
      </Say>
      <Say f={f} at={50} out={104} y={380} size={110} color={C3.blue} weight={700}>
        Lapor
      </Say>
      <Say f={f} at={56} out={104} y={490} size={64}>
        dari HP
      </Say>
      {f >= 48 && out1 < 1 && (
        <Device
          cx={PCX5 - out1 * 900}
          cy={PCY5 + (1 - phIn) * 260}
          w={PW5}
          bodyColor={C3.blue}
          bezel={12}
          style={{ opacity: Math.min(1, phIn * 2) * (1 - out1) }}
        >
          <UI src={F9} width={PW5 - 24} />
        </Device>
      )}
      {TYPES5.map((c, i) => {
        const at = 70 + i * 4;
        const p = t01(f, at, at + 20, easeOutExpo);
        if (p <= 0 || out1 >= 1) return null;
        const w = c.side < 0 ? 330 - 60 : 960 - 710;
        return (
          <div
            key={c.t}
            style={{
              position: 'absolute',
              left: c.side < 0 ? 60 : 710,
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
      <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${px(-exit * 120)})` }}>
      <Say f={f} at={124} y={400} size={70}>
        <span>Pantau</span>
        <B>statusnya</B>
      </Say>
      {CARDS1.map((y, i) => {
        const at = 128 + (CARDS1.length - 1 - i) * 7;
        const p = t01(f, at, at + 20, easeOutExpo);
        if (p <= 0) return null;
        const dw = 860;
        const dh = cropH(828, 245, dw);
        const top = 600 + i * (dh + 26);
        return (
          <div key={y} style={{ position: 'absolute', left: CX - dw / 2, top: top + (1 - p) * 500, opacity: Math.min(1, p * 2) }}>
            <CropCard src="01-aduan-daftar.png" x={36} y={y} w={828} h={245} dw={dw} radius={30} />
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
void UI_SIZE;
void easeInOutSmooth;
void Squircle;
