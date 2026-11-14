import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { Card, Check, Crop, Fly, Img, Tap, Title, UI_SIZE, cropH, drift, easeInOutSmooth, easeOutExpo, ip, lerp, px, t01 } from './kit';
import { BADGE, BADGE_X, BW, COL_X, HS, ITEM_Y, L0, PXL, STEP_AT, SX, SY, StepChecks, TILE4, YW, hashShift, onScreen, phoneY } from './stage';
import { C, PP } from './theme';
import { H, T, W } from './timeline';

/*
 * Everything around the phone: titles, questions, and the details that fly out of the screen.
 * All frames are GLOBAL and derived from T (timeline.ts); research/storyboard.md lists the same beats.
 * Layout family: title top-centre (y 236), phone centre stage, details left (x 100-760) and right (x 1160-1820).
 */
const LEFT = 100; // left edge of a 640-px card on the left stage
const RIGHT = 1180;
const DW = 640;
const QY = 520; // centre line of a big question (the phone is off screen while it is asked)

/* ------------------------------------------------------------------ */
/* S1 · hook: the app icon lands on the first hit, the sentence follows */
/* ------------------------------------------------------------------ */
export const S1: React.FC<{ f: number }> = ({ f }) => (
  <Title f={f} at={35} out={T.s2 - 14} y={770} size={84} step={18} parts={['Yuh kenalan sama', ['Tiray']]} />
);

/* ------------------------------------------------------------------ */
/* S2 · the icon grows into the phone                                   */
/* ------------------------------------------------------------------ */
export const S2: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Title f={f} at={T.s2 + 2} out={T.s2 + 58} parts={['Aplikasi resmi', ['Tirta Ayu']]} />
    <Title f={f} at={T.s2 + 72} out={T.s3 - 12} parts={['Semua layanan air, di', ['HP kamu']]} />
  </>
);

/* ------------------------------------------------------------------ */
/* S3 · six services lift out of the Home screen into a 3 x 2 grid      */
/* ------------------------------------------------------------------ */
const ICONS: [number, number, string][] = [
  [185, 812, 'Pendaftaran'],
  [474, 812, 'Bayar QRIS'],
  [762, 812, 'Gangguan'],
  [185, 1032, 'Info Tagihan'],
  [474, 1032, 'Hemat Air'],
  [762, 1032, 'Simulasi'],
];
const TW = 250;
const TH = 280;
/** v2: same 3 x 2 arrangement as the LAYANAN grid in the app, to the right of the phone */
const TILE_L = (i: number) => 800 + (i % 3) * 286;
const TILE_T = (i: number) => 397 + Math.floor(i / 3) * 310;

const IconTile: React.FC<{ x: number; y: number; label: string; press?: number }> = ({ x, y, label, press = 0 }) => {
  const [iw, ih] = UI_SIZE['06-beranda.png'];
  const k = 1.2;
  const d = 172;
  return (
    <div
      style={{
        width: TW,
        height: TH,
        borderRadius: 60,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.98), rgba(225,238,250,0.94))',
        boxShadow: 'inset 0 2px 0 #fff, 0 26px 60px rgba(10,30,80,0.35)',
        overflow: 'hidden',
        position: 'relative',
        transform: `scale(${(1 - 0.07 * press).toFixed(4)})`,
      }}
    >
      <div style={{ position: 'absolute', left: TW / 2 - d / 2, top: 30, width: d, height: d, overflow: 'hidden', borderRadius: '50%' }}>
        <Img src={staticFile('ui/06-beranda.png')} style={{ position: 'absolute', left: -(x * k - d / 2), top: -(y * k - d / 2), width: iw * k, height: ih * k }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, textAlign: 'center', fontFamily: PP, fontWeight: 600, fontSize: 28, letterSpacing: '-0.01em', color: C.blue }}>{label}</div>
    </div>
  );
};

export const S3: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.s3 - 4 || f > T.s4 + 50) return null;
  const tapAt = T.s4;
  const press = t01(f, tapAt - 2, tapAt + 3) * (1 - t01(f, tapAt + 4, tapAt + 12));
  return (
    <>
      <Title f={f} at={T.s3 + 2} out={T.s4 + 10} onBlue parts={['Layanan', ['lengkap']]} />
      {ICONS.map(([x, y, label], i) => {
        const at = T.s3 + i * 18;
        return (
          <Fly key={label} f={f} at={at} out={i === 3 ? T.s4 + 8 : T.s4 + 2 + Math.abs(i - 3) * 2} home={i === 3 ? { x: PXL, y: SY + 60 } : undefined} from={onScreen(at, x, y)} l={TILE_L(i)} t={TILE_T(i)} w={TW} h={TH}>
            <IconTile x={x} y={y} label={label} press={i === 3 ? press : 0} />
          </Fly>
        );
      })}
      <Tap f={f} at={tapAt} x={TILE4.x} y={TILE4.y - 20} size={84} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* S4 · tagihan 3 bulan + bayar QRIS                                    */
/* ------------------------------------------------------------------ */
const TAG = '07-riwayat-tagihan.png';
const ROWS7 = [1150, 1295, 1440];

export const S4: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.s4 || f > T.s5 + 10) return null;
  const hit = T.s4 + 36; // 449
  const qris = 521;
  const out = T.s5 - 18;
  const th = cropH(890, 520, DW);
  const bh = cropH(890, 215, DW);
  const qh = cropH(660, 250, 560);
  return (
    <>
      <Title f={f} at={hit - 8} out={qris - 10} parts={['Cek tagihan', ['3 bulan terakhir']]} />
      <Title f={f} at={qris + 2} out={out} parts={['Bayar pakai', ['QRIS,'], 'tanpa ribet']} />
      <Fly f={f} at={hit} out={out} from={onScreen(hit, 475, 1250)} l={LEFT} t={SY - th / 2} w={DW} h={th} tilt={7} dim={0.6 * t01(f, qris - 4, qris + 10)}>
        <Card>
          <Crop src={TAG} x={30} y={990} w={890} h={520} dw={DW}>
            {ROWS7.map((ry, i) => (
              <div key={ry} style={{ position: 'absolute', left: 30, top: ry - 24, width: 890, height: 120, background: C.white, opacity: 1 - t01(f, hit + 4 + i * 18, hit + 14 + i * 18) }} />
            ))}
          </Crop>
        </Card>
      </Fly>
      <Fly f={f} at={hit + 36} out={qris + 8} from={onScreen(hit + 36, 475, 740)} l={RIGHT} t={SY - bh / 2} w={DW} h={bh} tilt={-7}>
        <Card>
          <Crop src={TAG} x={30} y={630} w={890} h={215} dw={DW} />
        </Card>
      </Fly>
      <Fly f={f} at={qris + 26} out={out} from={onScreen(qris + 26, 450, 1580, (316 / 900))} l={RIGHT + 40} t={SY - qh / 2} w={560} h={qh} tilt={-7}>
        <Card>
          <Crop src="08-qris-numpad.png" x={120} y={1478} w={660} h={250} dw={560} />
        </Card>
      </Fly>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* S5 · ada keluhan? → lapor dari HP → pantau statusnya                 */
/* ------------------------------------------------------------------ */
const TYPES = ['Air Tidak Mengalir', 'Kebocoran', 'Air Keruh', 'Meter Rusak', 'Tekanan Lemah', 'Stop Kran'];
const K9 = 316 / 900;

export const S5: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.s5 - 4 || f > T.s6 + 10) return null;
  const rise = T.s5 + 52; // 645
  const tap = T.s5 + 144; // 737
  const out1 = tap - 8;
  const out2 = T.s6 - 18;
  const bh = cropH(840, 200, DW);
  const ch = cropH(828, 245, DW);
  return (
    <>
      <Title f={f} at={T.s5} out={T.s5 + 32} y={QY} size={116} weight={700} parts={['Ada', ['keluhan?']]} />
      <Title f={f} at={rise} out={out1} parts={[['Lapor'], 'dari HP']} />
      {TYPES.map((t, i) => {
        const at = rise + 6 + i * 6;
        return (
          <Fly key={t} f={f} at={at} out={out1 - 6 + i} from={onScreen(at, 450, 542, K9)} l={90} t={452 + i * 80} w={620} h={80}>
            <div
              style={{
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                fontFamily: PP,
                fontWeight: i === 0 ? 700 : 600,
                fontSize: 40,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                color: i === 0 ? C.blue : C.ink,
              }}
            >
              {t}
            </div>
          </Fly>
        );
      })}
      <Fly f={f} at={rise + 26} out={out1} from={onScreen(rise + 26, 450, 960, K9)} l={RIGHT} t={SY - bh / 2} w={DW} h={bh} tilt={-7}>
        <Card>
          <Crop src="09-aduan-form.png" x={30} y={860} w={840} h={200} dw={DW} />
        </Card>
      </Fly>
      <Title f={f} at={tap + 8} out={out2} parts={['Pantau', ['statusnya']]} />
      {[275, 545, 815, 1085].map((y, i) => {
        const at = tap + 12 + i * 7;
        const left = i < 2;
        return (
          <Fly key={y} f={f} at={at} out={out2} from={onScreen(at, 450, y + 120, K9)} l={left ? LEFT : RIGHT} t={(i % 2 === 0 ? SY - ch - 12 : SY + 12)} w={DW} h={ch} tilt={left ? 7 : -7}>
            <Card radius={24}>
              <Crop src="01-aduan-daftar.png" x={36} y={y} w={828} h={245} dw={DW}>
                {i === 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 36 + 663,
                      top: y + 32,
                      width: 151,
                      height: 80,
                      borderRadius: 18,
                      border: `7px solid ${C.green}`,
                      boxSizing: 'border-box',
                      opacity: t01(f, tap + 40, tap + 50),
                      transform: `scale(${lerp(1.35, 1, t01(f, tap + 40, tap + 54, easeOutExpo)).toFixed(4)})`,
                    }}
                  />
                )}
              </Crop>
            </Card>
          </Fly>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* S6 · air mati? → info gangguan langsung masuk (blue)                 */
/* ------------------------------------------------------------------ */
export const S6: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.s6 - 4 || f > T.s7 + 10) return null;
  const rise = T.s6 + 44; // 853
  const out = T.s7 - 12;
  const nh = cropH(840, 205, DW);
  return (
    <>
      <Title f={f} at={T.s6} out={T.s6 + 26} y={QY} size={116} weight={700} onBlue parts={['Air', ['mati?']]} />
      <Title f={f} at={rise + 2} out={out} onBlue parts={['Info gangguan', ['langsung masuk']]} />
      {[165, 400, 635, 870].map((y, i) => {
        const at = rise + 2 + i * 10;
        const p = t01(f, at, at + 22, easeOutExpo);
        const o = t01(f, out, out + 12);
        if (p <= 0 || o >= 1) return null;
        const left = i % 2 === 0;
        const top = i < 2 ? SY - nh - 12 : SY + 12;
        return (
          <div
            key={y}
            style={{
              position: 'absolute',
              left: left ? LEFT : RIGHT,
              top,
              width: DW,
              height: nh,
              opacity: Math.min(1, p * 2.2) * (1 - o),
              transform: `translateY(${px(-(1 - p) * 110 + o * 30 + drift(f, y) * p)}) perspective(1800px) rotateY(${left ? 7 : -7}deg) scale(${lerp(0.92, 1, p).toFixed(4)})`,
            }}
          >
            <Card radius={22}>
              <Crop src="02-info-gangguan.png" x={30} y={y} w={840} h={205} dw={DW} />
            </Card>
          </div>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* S7 · mau pasang baru? → daftar dari HP → pengajuan berhasil (quiet)  */
/* ------------------------------------------------------------------ */
const F3 = '03-sambungan-prosedur.png';
const K3 = 316 / 946;

/** The app's four-step registration stepper (03-sambungan-prosedur), rebuilt on a white card so it reads large.
 *  The screenshot itself is dimmed by its bottom sheet, so a crop would look grey. */
const STEPS = ['Identitas', 'Alamat', 'Dokumen', 'Konfirmasi'];
const Stepper: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ position: 'relative', width: DW, height: 190, fontFamily: PP }}>
    {STEPS.map((label, i) => {
      const x = 95 + i * 150;
      const p = t01(f, STEP_AT[i], STEP_AT[i] + 10, easeOutExpo);
      const lineP = i < 3 ? t01(f, STEP_AT[i] + 4, STEP_AT[i] + 14) : 0;
      return (
        <React.Fragment key={label}>
          {i < 3 && (
            <>
              <div style={{ position: 'absolute', left: x + 44, top: 70, width: 62, height: 6, borderRadius: 3, background: C.line }} />
              <div style={{ position: 'absolute', left: x + 44, top: 70, width: 62 * lineP, height: 6, borderRadius: 3, background: C.blue }} />
            </>
          )}
          <div
            style={{
              position: 'absolute',
              left: x - 34,
              top: 39,
              width: 68,
              height: 68,
              boxSizing: 'border-box',
              borderRadius: '50%',
              border: `4px solid ${C.line}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: 28,
              color: C.muted,
            }}
          >
            {i + 1}
          </div>
          <div style={{ position: 'absolute', left: x - 34, top: 39 }}>
            <Check size={68} p={p} round />
          </div>
          <div style={{ position: 'absolute', left: x - 75, width: 150, top: 124, textAlign: 'center', fontWeight: 600, fontSize: 24, letterSpacing: '-0.01em', color: p > 0.5 ? C.blue : C.muted }}>{label}</div>
        </React.Fragment>
      );
    })}
  </div>
);

export const S7: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.s7 - 4 || f > T.s8 + 10) return null;
  const rise = T.s7 + 52; // 987
  const dlgAt = T.s7 + 120; // 1055
  const out = T.s8 - 14;
  const sh = 190;
  const lh = cropH(906, 690, 580);
  const dlg = t01(f, dlgAt, dlgAt + 20, easeOutExpo);
  const dw = 500;
  const dh = cropH(574, 595, dw);
  const o = t01(f, out, out + 12);
  return (
    <>
      <Title f={f} at={T.s7} out={T.s7 + 38} y={QY} size={116} weight={700} parts={['Mau pasang', ['baru?']]} />
      <Title f={f} at={rise + 2} out={out} parts={['Daftar dari', ['HP']]} />
      <Fly f={f} at={rise + 10} out={out} from={onScreen(rise + 10, 475, 383, K3)} l={LEFT - 40} t={SY - sh / 2} w={DW} h={sh} tilt={7} dim={0.5 * dlg}>
        <Card radius={28}>
          <Stepper f={f} />
        </Card>
      </Fly>
      <Fly f={f} at={rise + 16} out={out} from={onScreen(rise + 16, 475, ITEM_Y[1], K3)} l={RIGHT + 44} t={SY - lh / 2} w={580} h={lh} tilt={-7} dim={0.5 * dlg}>
        <Card>
          <Crop src={F3} x={20} y={1262} w={906} h={690} dw={580}>
            <StepChecks f={f} steps={false} />
          </Crop>
        </Card>
      </Fly>
      {dlg > 0 && o < 1 && (
        <div style={{ position: 'absolute', left: SX - dw / 2, top: SY - dh / 2, width: dw, height: dh, opacity: Math.min(1, dlg * 2) * (1 - o), transform: `scale(${(lerp(0.8, 1, dlg) * (1 - 0.1 * o)).toFixed(4)})` }}>
          <Card radius={34} style={{ boxShadow: '0 40px 100px rgba(10,30,80,0.35)' }}>
            <Crop src="04-sambungan-sukses.png" x={73} y={437} w={574} h={595} dw={dw} />
          </Card>
        </div>
      )}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* S8 · ga cuma itu (build)                                             */
/* ------------------------------------------------------------------ */
export const S8: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.s8 - 2 || f > T.s9 + 10) return null;
  const push = 1 + 0.05 * t01(f, T.s8, T.s9, (t) => t);
  return (
    <AbsoluteFill style={{ transform: `scale(${push.toFixed(4)})` }}>
      <Title f={f} at={T.s8 + 2} out={T.s9 - 12} y={470} size={124} weight={700} onBlue parts={['Ga cuma itu']} />
      <Title f={f} at={T.s8 + 18} out={T.s9 - 12} y={620} size={62} onBlue parts={['masih banyak lagi di', ['Tiray']]} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* S9 · semua di Tiray: eight tiles around the phone (drop)             */
/* ------------------------------------------------------------------ */
const BT = { w: 318, h: 320 };
const COLS = [442, 1160, 100, 1502];
const ROWS = [362, 706];
const TILES: { label: string; src: string; x: number; y: number; w: number; h: number; dark?: boolean }[] = [
  { label: 'Tagihan', src: TAG, x: 30, y: 140, w: 890, h: 720 },
  { label: 'Info gangguan', src: '02-info-gangguan.png', x: 30, y: 165, w: 840, h: 680, dark: true },
  { label: 'Bayar QRIS', src: '08-qris-numpad.png', x: 0, y: 190, w: 900, h: 730, dark: true },
  { label: 'Pasang baru', src: F3, x: 20, y: 300, w: 906, h: 734 },
  { label: 'Lapor aduan', src: '09-aduan-form.png', x: 30, y: 470, w: 840, h: 680, dark: true },
  { label: 'Info pelanggan', src: '05-profil.png', x: 30, y: 620, w: 890, h: 720 },
  { label: 'Pantau status aduan', src: '01-aduan-daftar.png', x: 36, y: 265, w: 828, h: 670 },
  { label: 'Info pemakaian air', src: TAG, x: 30, y: 990, w: 890, h: 720, dark: true },
];

export const S9: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.s9 - 4 || f > T.s10 + 4) return null;
  const lock = 1313; // bar 18: the last big hit before the hashtag
  const out = T.s10 - 40;
  return (
    <>
      <Title f={f} at={T.s9 + 6} out={lock - 14} parts={['Semua di', ['Tiray']]} />
      <Title f={f} at={lock} out={out + 4} size={70} weight={700} parts={[['Semua layanan air']]} />
      {TILES.map((t, i) => {
        const at = T.s9 + i * 18;
        const l = i < 4 ? COLS[i % 2] : COLS[2 + (i % 2)];
        const top = ROWS[Math.floor(i / 2) % 2];
        const left = l < SX;
        const pulse = 1 + 0.035 * t01(f, lock - 2, lock + 4) * (1 - t01(f, lock + 4, lock + 20));
        const p = t01(f, at, at + 24, easeOutExpo);
        const o = t01(f, out + (7 - i), out + (7 - i) + 16, easeInOutSmooth);
        if (p <= 0 || o >= 1) return null;
        const k = p * (1 - o);
        const cx = l + BT.w / 2;
        const cy = top + BT.h / 2;
        const from = { x: SX, y: f < out ? phoneY(at) : SY };
        return (
          <div
            key={t.label}
            style={{
              position: 'absolute',
              left: l,
              top,
              width: BT.w,
              height: BT.h,
              opacity: Math.min(1, k * 2.4),
              transform: `translate(${px((from.x - cx) * (1 - k))}, ${px((from.y - cy) * (1 - k) + drift(f, l + top) * k)}) perspective(1800px) rotateY(${((left ? 5 : -5) * k).toFixed(2)}deg) scale(${(lerp(0.3, 1, k) * pulse).toFixed(4)})`,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 34,
                overflow: 'hidden',
                position: 'relative',
                background: t.dark ? `linear-gradient(160deg, ${C.glow}, ${C.blue})` : `linear-gradient(160deg, #f4f8fd, ${C.tile})`,
                boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.6), 0 24px 56px rgba(10,30,80,0.18)',
              }}
            >
              <div style={{ position: 'absolute', left: 24, top: 20, fontFamily: PP, fontWeight: 600, fontSize: 26, letterSpacing: '-0.015em', color: t.dark ? C.white : C.blue, whiteSpace: 'nowrap' }}>{t.label}</div>
              <div style={{ position: 'absolute', left: 22, top: 74, borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 24px rgba(10,30,80,0.18)' }}>
                <Crop src={t.src} x={t.x} y={t.y} w={t.w} h={t.h} dw={274} style={{ background: C.white }} />
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* S10 · #YuhBukaTiray + Google Play → the green tab becomes the outro's dot */
/* ------------------------------------------------------------------ */
const GW = YW + BW;
const TY = 500;
const UL = TY + 86;
const LW = GW - 80;
/** Measured from outro_tirta_ayu_16x9_final_v1_cepat.mp4: merged dot Ø62 at (959,539) on frame 47,
 *  Ø172 / 220 / 232 on 48 / 49 / 50 (soft glow). Local 168..171 = outro 47..50; the outro joins from 51. */
const MERGE = { x: 959, y: 539, d: 62 };
const GROW = [172, 220, 232];
const GLOW = [0.12, 0.24, 0.32];
const LAST = T.end - 1 - T.s10; // 171

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

export const S10: React.FC<{ f: number }> = ({ f: g }) => {
  if (g < T.s10 - 2) return null;
  const f = g - T.s10;
  const inn = t01(f, 4, 24, easeOutExpo);
  const shift = hashShift(g);
  const rev = t01(f, 34, 60, easeInOutSmooth);
  const line = t01(f, 66, 84, easeOutExpo);
  const tab = t01(f, 78, 90, easeOutExpo);
  const badge = t01(f, 80, 100, easeOutExpo);
  const out = t01(f, 132, 150, easeInOutSmooth);
  const bg = t01(f, 134, 160, easeInOutSmooth);
  const r = t01(f, 130, 150, easeInOutSmooth);
  const mv = t01(f, 146, 168, easeInOutSmooth);
  const tabX = L0 + LW + 14 + (66 * tab) / 2;
  const k = f - (LAST - 2);
  const big = k >= 0 ? GROW[Math.min(2, k)] : 0;
  const gx = big ? MERGE.x : lerp(tabX, MERGE.x, mv);
  const gy = big ? MERGE.y : lerp(UL, MERGE.y, mv);
  const gw = big || lerp(66 * tab, MERGE.d, mv);
  const gh = big || lerp(14, MERGE.d, mv);
  const glow = k >= 0 ? GLOW[Math.min(2, k)] : 0;
  const lw = LW * line * (1 - r);
  const word: React.CSSProperties = { position: 'absolute', top: TY - HS * 0.8, height: HS * 1.6, lineHeight: `${HS * 1.6}px`, fontFamily: PP, fontWeight: 700, fontSize: HS, letterSpacing: '-0.03em', color: C.blue, whiteSpace: 'nowrap' };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${px(-out * 30)})` }}>
        <div style={{ ...word, left: L0, opacity: ip(inn, [0, 0.5], [0, 1]), transform: `translate(${px((BW / 2) * (1 - shift))}, ${px((1 - inn) * 60)})` }}>#Yuh</div>
        <div style={{ ...word, left: L0 + YW, clipPath: `inset(-20% ${((1 - rev) * 100).toFixed(2)}% -20% 0)` }}>BukaTiray</div>
        <Title f={f} at={72} x={COL_X} y={UL + 58} size={40} weight={500} parts={['Ayo Jakwir, monggo didownload!']} step={2} />
        {badge > 0 && (
          <Img src={staticFile('badge/google-play-id.png')} style={{ position: 'absolute', left: BADGE_X, top: BADGE.top, width: BADGE.w, transform: `translateY(${px((1 - badge) * 40)})`, opacity: Math.min(1, badge * 2) }} />
        )}
      </AbsoluteFill>
      {f >= 122 && <Img src={staticFile('outro/bg169.png')} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: bg }} />}
      {lw > 1 && <Pill cx={L0 + LW * line - lw / 2} cy={UL} w={lw} h={14} color={C.blue} />}
      {tab > 0 && <Pill cx={gx} cy={gy} w={gw} h={gh} color={C.green} glow={glow} />}
    </AbsoluteFill>
  );
};
