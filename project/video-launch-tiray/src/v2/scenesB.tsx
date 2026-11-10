import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { easeInOutSmooth, easeOutExpo, ip, springAt } from '../antislop/theme/easing-and-timing';
import { C, FONT } from '../theme';
import { BZ, CropCard, cropH, Device, easeIn, GlassBand, HBlur, lerp, phoneH, t01, TuntasBadge, Txt, UI } from './kit2';
import { mix, pop } from './scenesA';

const soft = (f: number, at: number) => springAt(f, at, 30, { damping: 16, stiffness: 140, mass: 0.7 });

/* ================================================================== */
/* S4 · 450–630 · Ada keluhan? → Lapor Aduan → lokasi + foto → Tuntas  */
/* ================================================================== */
const F9 = '09-aduan-form.png';
const PW4 = 440;
const PCX4 = 780;
const PTOP4 = 560;
const K9 = (PW4 - 2 * BZ) / 900;
export const S4_POPS = [512, 522];
export const S4_BADGE = 553;
export const S4_CARDS = [590, 596, 602, 608];

const CROPS4 = [
  { x: 46, y: 878, w: 394, h: 168, label: 'lokasi', top: 720 },
  { x: 460, y: 878, w: 395, h: 168, label: 'foto', top: 1010 },
];

export const S4: React.FC = () => {
  const f = useCurrentFrame();
  const xIn = (fr: number, at: number) => 540 + 820 * (1 - t01(fr, at, at + 16, easeOutExpo));
  const phIn = soft(f, 496);
  const out1 = t01(f, 545, 556, easeIn);
  const phCx = PCX4 + (1 - phIn) * 600 + out1 * 700;
  const sheet = t01(f, 619, 630, easeInOutSmooth);
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <GlassBand f={f} at={450} out={472} y={965} h={520} src={F9} cx={46} cy={600} cw={810} />
      {f < 486 && (
        <HBlur id="b-keluhan" amount={(xIn(f - 1, 452) - xIn(f, 452)) * 0.5} style={{ position: 'absolute', inset: 0 }}>
          <Txt text="Ada" f={f} at={452} x={xIn(f, 452)} y={870} size={200} out={475} />
          <Txt text="keluhan?" f={f} at={455} x={xIn(f, 455)} y={1070} size={200} color={C.blue} out={477} />
        </HBlur>
      )}
      <Txt text="Lapor Aduan" f={f} at={480} x={540} y={400} size={100} out={545} />

      {/* HP form aduan */}
      {f >= 495 && f < 560 && (
        <Device
          cx={phCx}
          cy={PTOP4 + phoneH(PW4) / 2}
          w={PW4}
          transform={`perspective(2000px) rotateY(-14deg)`}
          style={{ opacity: ip(phIn, [0, 0.3], [0, 1]) }}
        >
          <UI src={F9} width={PW4 - 2 * BZ} />
        </Device>
      )}
      {/* potongan Titik Lokasi + Foto keluar dari HP */}
      {CROPS4.map((c, i) => {
        const at = S4_POPS[i];
        if (f < at || f >= 560) return null;
        const p = springAt(f, at, 30, { damping: 14, stiffness: 130, mass: 0.7 });
        const ox = PCX4 - PW4 / 2 + BZ + (c.x + c.w / 2) * K9;
        const oy = PTOP4 + BZ + (c.y + c.h / 2) * K9;
        const dw = 420;
        const dh = cropH(c.w, c.h, dw);
        const tx = 70 + dw / 2;
        const ty = c.top + dh / 2;
        const cx = lerp(ox, tx, p) - out1 * 900;
        const cy = lerp(oy, ty, p);
        const sc = lerp((c.w * K9) / dw, 1, p);
        const line = t01(f, at + 6, at + 16, easeOutExpo) * (1 - out1);
        return (
          <React.Fragment key={c.label}>
            <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
              <path
                d={`M ${tx + dw / 2 + 10} ${ty} L ${ox - 8} ${oy}`}
                stroke={C.blue}
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - line}
              />
            </svg>
            <div style={{ position: 'absolute', left: cx - dw / 2, top: cy - dh / 2, transform: `scale(${sc.toFixed(4)})` }}>
              <CropCard src={F9} x={c.x} y={c.y} w={c.w} h={c.h} dw={dw} radius={24} />
            </div>
            <Txt text={c.label} f={f} at={at + 8} x={70 - out1 * 900} y={c.top - 50} size={52} weight={700} color={C.blue} anchor="l" out={545} />
          </React.Fragment>
        );
      })}

      {/* Pantau [Tuntas] statusnya */}
      <Txt text="Pantau" f={f} at={548} x={540} y={760} size={130} out={585} />
      {f >= S4_BADGE && f < 596 && (
        <div
          style={{
            position: 'absolute',
            left: 540 - 260,
            top: 960 - 101,
            transform: `scale(${(pop(f, S4_BADGE) * (1 - t01(f, 585, 595, easeIn))).toFixed(4)})`,
          }}
        >
          <TuntasBadge w={520} />
        </div>
      )}
      <Txt text="statusnya" f={f} at={551} x={540} y={1160} size={130} color={C.blue} out={585} outDir={1} />

      {/* daftar aduan */}
      <Txt text="Pantau statusnya" f={f} at={588} x={540} y={370} size={90} />
      {[275, 545, 815, 1085].map((cy, i) => {
        const at = S4_CARDS[i];
        if (f < at) return null;
        const p = soft(f, at);
        return (
          <div
            key={cy}
            style={{
              position: 'absolute',
              left: 100,
              top: 540 + i * 230 + (1 - p) * 900,
              opacity: ip(p, [0, 0.2], [0, 1]),
            }}
          >
            <CropCard src="01-aduan-daftar.png" x={36} y={cy} w={828} h={245} dw={880} radius={30} />
          </div>
        );
      })}
      {/* lembar biru naik */}
      {sheet > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1920 * sheet, background: C.blue, borderRadius: `${60 * (1 - sheet)}px ${60 * (1 - sheet)}px 0 0` }} />
      )}
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* S5 · 630–780 · Air mati? → Info Gangguan → kartu jatuh bertumpuk    */
/* ================================================================== */
const F2 = '02-info-gangguan.png';
const CARDS2 = [1105, 870, 635, 400, 165]; // lama → terbaru
export const S5_DROPS = CARDS2.map((_, j) => 662 + j * 7);
const CW5 = 840;
const CH5 = cropH(840, 205, CW5);

export const S5: React.FC = () => {
  const f = useCurrentFrame();
  const land = 650;
  const fallY = (fr: number) => (fr < land ? lerp(-300, 1060, easeIn(t01(fr, 640, land, (t) => t))) : 1060);
  const squash = f >= land ? 1 - 0.18 * Math.sin(Math.PI * t01(f, land, land + 8, (t) => t)) : 1;
  const mv = t01(f, 655, 672, easeInOutSmooth);
  const zoom = t01(f, 700, 716, easeInOutSmooth);
  const toSq = t01(f, 750, 762, easeInOutSmooth);
  const fill = t01(f, 764, 779, easeInOutSmooth);
  const dim = 1 - 0.75 * zoom;
  const allOut = t01(f, 750, 758);
  return (
    <AbsoluteFill style={{ background: C.blue }}>
      <Txt text="Air" f={f} at={631} x={lerp(540, 402, mv)} y={lerp(820, 360, mv)} size={lerp(260, 90, mv)} color={C.white} out={750} />
      {f >= 640 && (
        <div
          style={{
            position: 'absolute',
            left: lerp(540, 627, mv),
            top: lerp(fallY(f), 360, mv),
            transform: `translate(-50%, -50%) scale(${(1 / squash) ** 0.5}, ${squash})`,
            transformOrigin: '50% 100%',
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: lerp(260, 90, mv),
            letterSpacing: '-0.025em',
            color: C.sky,
            whiteSpace: 'nowrap',
            opacity: 1 - allOut,
          }}
        >
          mati?
        </div>
      )}
      <Txt text="Info Gangguan" f={f} at={668} x={540} y={470} size={72} color={C.sky} out={750} />

      {CARDS2.map((cy, j) => {
        const at = S5_DROPS[j];
        if (f < at) return null;
        const p = springAt(f, at, 30, { damping: 13, stiffness: 150, mass: 0.7 });
        // posisi = banyaknya kartu yang jatuh setelah kartu ini (terbaru di atas)
        const pos = S5_DROPS.slice(j + 1).reduce((acc, a) => acc + soft(f, a), 0);
        let top = 580 + pos * 220 - (1 - p) * 900;
        let w = CW5;
        let left = 540 - CW5 / 2;
        let op = ip(p, [0, 0.2], [0, 1]);
        const newest = j === CARDS2.length - 1;
        if (newest) {
          w = lerp(CW5, 960, zoom);
          const h = cropH(840, 205, w);
          top = lerp(top, 960 - h / 2, zoom);
          left = 540 - w / 2;
        } else {
          op *= dim * (1 - allOut);
        }
        if (newest && toSq > 0) {
          const h0 = cropH(840, 205, 960);
          const sw = lerp(960, 200, toSq);
          const sh = lerp(h0, 200, toSq);
          const fw = lerp(sw, 1080, fill);
          const fh = lerp(sh, 1920, fill);
          return (
            <div
              key={cy}
              style={{
                position: 'absolute',
                left: 540 - fw / 2,
                top: 960 - fh / 2,
                width: fw,
                height: fh,
                borderRadius: lerp(lerp(30, 48, toSq), 0, fill),
                background: C.white,
                overflow: 'hidden',
              }}
            >
              <div style={{ opacity: 1 - t01(f, 750, 757), transform: `scale(${lerp(1, 200 / 960, toSq)})`, transformOrigin: '0 0' }}>
                <CropCard src={F2} x={30} y={cy} w={840} h={205} dw={960} radius={0} shadow={false} />
              </div>
            </div>
          );
        }
        return (
          <div key={cy} style={{ position: 'absolute', left, top, opacity: op }}>
            <CropCard src={F2} x={30} y={cy} w={840} h={205} dw={w} radius={28} />
          </div>
        );
      })}
      <Txt text="langsung di HP kamu" f={f} at={712} x={540} y={1250} size={64} weight={700} color={C.white} out={748} />
    </AbsoluteFill>
  );
};
void CH5;

/* ================================================================== */
/* S6 · 780–930 · Mau pasang baru? → Daftar dari HP → stepper → sukses */
/* ================================================================== */
export const S6_STEPS = [840, 852, 864, 876];
export const S6_DIALOG = 888;
export const S6_PULSE = 905;
const STEP_LABELS = ['Identitas', 'Alamat', 'Dokumen', 'Konfirmasi'];
const STEP_ROWS = [1290, 1460, 1630, 1800, 1975];

const Stepper2: React.FC<{ f: number; contentIn: number }> = ({ f, contentIn }) => {
  const xs = [110, 310, 530, 730];
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: FONT, opacity: contentIn }}>
      {xs.slice(0, 3).map((x, i) => {
        const fill = ip(f, [S6_STEPS[i] + 2, S6_STEPS[i] + 12], [0, 1], easeOutExpo);
        return (
          <div key={x} style={{ position: 'absolute', left: x + 50, top: 100, width: xs[i + 1] - x - 100, height: 6, background: C.line, borderRadius: 3 }}>
            <div style={{ width: `${fill * 100}%`, height: '100%', background: C.blue, borderRadius: 3 }} />
          </div>
        );
      })}
      {xs.map((x, i) => {
        const on = pop(f, S6_STEPS[i]);
        const active = f >= S6_STEPS[i];
        const check = ip(f, [S6_STEPS[i] + 2, S6_STEPS[i] + 10], [0, 1], easeOutExpo);
        return (
          <React.Fragment key={x}>
            <div
              style={{
                position: 'absolute',
                left: x - 44,
                top: 59,
                width: 88,
                height: 88,
                borderRadius: '50%',
                border: `5px solid ${active ? C.blue : '#b9c2d0'}`,
                background: active ? C.blue : C.white,
                transform: `scale(${active ? 0.85 + 0.15 * on : 1})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: active ? C.white : '#8a95a8',
                fontWeight: 700,
                fontSize: 40,
              }}
            >
              {active ? (
                <svg width={44} height={44} viewBox="0 0 44 44">
                  <path d="M9 23 L18 32 L35 13" fill="none" stroke={C.white} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={42} strokeDashoffset={42 * (1 - check)} />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <div style={{ position: 'absolute', left: x - 110, width: 220, top: 168, textAlign: 'center', fontSize: 32, fontWeight: 700, color: active ? C.blue : C.muted }}>
              {STEP_LABELS[i]}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const S6: React.FC = () => {
  const f = useCurrentFrame();
  const sqIn = t01(f, 807, 815, easeOutExpo);
  const card = t01(f, 818, 834, easeInOutSmooth);
  const push = t01(f, 818, 830, easeIn);
  const sw = lerp(110 * sqIn, 840, card);
  const sh = lerp(110, 300, card);
  const scy = lerp(960, 570, card);
  const dlg = pop(f, S6_DIALOG);
  const pulse = 1 + 0.035 * Math.sin(Math.PI * t01(f, S6_PULSE, S6_PULSE + 10, (t) => t));
  const dim = t01(f, S6_DIALOG - 2, S6_DIALOG + 8);
  const k3 = 720 / 900;
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <Txt text="Mau pasang" f={f} at={782} x={540} y={680} size={100} out={805} />
      <Txt text="baru?" f={f} at={788} x={540} y={870} size={250} color={C.blue} out={806} />
      {/* Daftar [kotak] dari HP */}
      <Txt text="Daftar" f={f} at={807} x={540 - sw / 2 - 28 - push * 700} y={960} size={96} anchor="r" opacity={1 - push} />
      <Txt text="dari HP" f={f} at={809} x={540 + sw / 2 + 28 + push * 700} y={960} size={96} anchor="l" opacity={1 - push} />
      {f >= 807 && (
        <div
          style={{
            position: 'absolute',
            left: 540 - sw / 2,
            top: scy - sh / 2,
            width: sw,
            height: sh,
            borderRadius: lerp(28, 32, card),
            background: mix(C.blue, C.white, card),
            border: card > 0.5 ? `3px solid ${C.line}` : undefined,
            boxShadow: `0 24px 60px rgba(22,36,59,${0.1 + 0.08 * (1 - card)})`,
          }}
        >
          <Stepper2 f={f} contentIn={t01(f, 832, 840)} />
        </div>
      )}
      <Txt text="Daftar dari HP" f={f} at={826} x={540} y={340} size={88} />
      {/* langkah prosedur */}
      {f >= 842 && (
        <div style={{ position: 'absolute', left: 180, top: 760, width: 720, height: (1975 - 1290) * k3, borderRadius: 30, overflow: 'hidden', background: C.white, boxShadow: '0 24px 60px rgba(22,36,59,0.12)', border: `3px solid ${C.line}`, opacity: t01(f, 842, 848) }}>
          {STEP_ROWS.slice(0, 4).map((ry, i) => {
            const at = 844 + i * 10;
            const p = t01(f, at, at + 12, easeOutExpo);
            return (
              <div key={ry} style={{ position: 'absolute', left: 0, top: (ry - 1290) * k3, opacity: p, transform: `translateY(${((1 - p) * 40).toFixed(1)}px)` }}>
                <CropCard src="03-sambungan-prosedur.png" x={30} y={ry} w={900} h={STEP_ROWS[i + 1] - ry} dw={720} radius={0} shadow={false} />
              </div>
            );
          })}
        </div>
      )}
      {/* dialog sukses */}
      {f >= S6_DIALOG - 2 && <div style={{ position: 'absolute', inset: 0, background: `rgba(22,36,59,${0.38 * dim})` }} />}
      {f >= S6_DIALOG && (
        <div
          style={{
            position: 'absolute',
            left: 540 - 320,
            top: 1010 - cropH(574, 595, 640) / 2,
            transform: `scale(${(dlg * pulse).toFixed(4)})`,
            opacity: ip(dlg, [0, 0.3], [0, 1]),
          }}
        >
          <CropCard src="04-sambungan-sukses.png" x={73} y={437} w={574} h={595} dw={640} radius={36} />
        </div>
      )}
    </AbsoluteFill>
  );
};
void lerp;
void UI;
void phoneH;
void easeInOutSmooth;
