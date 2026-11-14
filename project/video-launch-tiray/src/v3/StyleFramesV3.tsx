import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { Img } from './DImg';
import { CropCard, Device, TuntasBadge, UI, UI_SIZE } from '../v2/kit2';
import { BLUE_BG, C3, JK, WHITE_BG } from './theme3';

/* Style frames for the v3 approval gate: frame N = style frame N (static) */

/** Top corners (revision 2)
 *  Left: Pemkab Tegal arms + label styled like tegalkab.go.id logo_header (spaced PEMERINTAH over heavy KABUPATEN TEGAL)
 *  Right: Tirta Ayu emblem (alas putih, no box) + logotype to its right (putih on blue, hitam on white) */
export const CORNER_TOP = 148;
export const Corner: React.FC<{ onBlue?: boolean }> = ({ onBlue }) => {
  const color = onBlue ? C3.white : C3.ink;
  const sh = 84; // shield height
  const sw = (sh * 248) / 299;
  const lw = 262; // both label lines share this width
  const logoH = 58;
  const logoW = (logoH * 633.19305) / 199.38464;
  const embl = 76;
  const rx = 1020 - logoW - 12 - embl;
  return (
    <>
      <Img src={staticFile('brand/pemkab-tegal.png')} style={{ position: 'absolute', left: 60, top: CORNER_TOP, height: sh, width: sw }} />
      <div style={{ position: 'absolute', left: 60 + sw + 14, top: CORNER_TOP + 12, width: lw, fontFamily: JK, color }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 21, lineHeight: 1 }}>
          {'PEMERINTAH'.split('').map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </div>
        <div style={{ fontWeight: 800, fontSize: 31.5, lineHeight: 1, marginTop: 9, whiteSpace: 'nowrap', letterSpacing: '-0.005em' }}>KABUPATEN TEGAL</div>
      </div>
      <Img src={staticFile('brand/lambang-warna-alas-putih.svg')} style={{ position: 'absolute', left: rx, top: CORNER_TOP + (sh - embl) / 2, width: embl, height: embl }} />
      <Img
        src={staticFile(onBlue ? 'brand/logotype-putih.svg' : 'brand/logotype-hitam.svg')}
        style={{ position: 'absolute', left: rx + embl + 12, top: CORNER_TOP + (sh - logoH) / 2, width: logoW, height: logoH }}
      />
    </>
  );
};

/** Mini blue phone with a full screenshot */
export const MiniPhone: React.FC<{ cx: number; cy: number; w: number; src: string }> = ({ cx, cy, w, src }) => (
  <Device cx={cx} cy={cy} w={w} bodyColor={C3.blue} bezel={10} shadow={0.6}>
    <UI src={src} width={w - 20} />
  </Device>
);

export const Line: React.FC<{ y: number; size: number; color?: string; weight?: number; children: React.ReactNode }> = ({
  y,
  size,
  color = C3.ink,
  weight = 600,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: y - size * 0.7,
      height: size * 1.4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: size * 0.28,
      fontFamily: JK,
      fontWeight: weight,
      fontSize: size,
      letterSpacing: '-0.02em',
      color,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);

export const Squircle: React.FC<{ cx: number; cy: number; s: number; children?: React.ReactNode; onBlue?: boolean }> = ({
  cx,
  cy,
  s,
  children,
  onBlue,
}) => (
  <div
    style={{
      position: 'absolute',
      left: cx - s / 2,
      top: cy - s / 2,
      width: s,
      height: s,
      borderRadius: s * 0.26,
      overflow: 'hidden',
      background: onBlue ? 'rgba(255,255,255,0.10)' : 'rgba(36,77,169,0.06)',
      boxShadow: onBlue
        ? 'inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -40px 80px rgba(155,213,239,0.25), 0 40px 90px rgba(10,30,80,0.35)'
        : 'inset 0 2px 0 rgba(255,255,255,0.9), 0 30px 80px rgba(36,77,169,0.15)',
      border: onBlue ? '2px solid rgba(255,255,255,0.28)' : '2px solid rgba(36,77,169,0.10)',
    }}
  >
    {children}
  </div>
);

export const ICONS: [number, number, string][] = [
  [185, 812, 'Pendaftaran'],
  [474, 812, 'Bayar QRIS'],
  [762, 812, 'Gangguan'],
  [185, 1032, 'Info Tagihan'],
  [474, 1032, 'Hemat Air'],
  [762, 1032, 'Simulasi'],
];

export const IconTile: React.FC<{ x: number; y: number; label: string; l: number; t: number }> = ({ x, y, label, l, t }) => {
  const [iw, ih] = UI_SIZE['06-beranda.png'];
  const k = 1.25;
  return (
    <div
      style={{
        position: 'absolute',
        left: l,
        top: t,
        width: 260,
        height: 290,
        borderRadius: 64,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.96), rgba(225,238,250,0.92))',
        boxShadow: 'inset 0 2px 0 #fff, 0 26px 60px rgba(10,30,80,0.35)',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', left: 130 - 90, top: 30, width: 180, height: 180, overflow: 'hidden', borderRadius: '50%' }}>
        <Img
          src={staticFile('ui/06-beranda.png')}
          style={{ position: 'absolute', left: -(x * k - 90), top: -(y * k - 90), width: iw * k, height: ih * k }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 26,
          textAlign: 'center',
          fontFamily: JK,
          fontWeight: 600,
          fontSize: 30,
          color: C3.blue,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const Tile: React.FC<{ l: number; t: number; w: number; h: number; text?: string; children?: React.ReactNode; light?: boolean }> = ({
  l,
  t,
  w,
  h,
  text,
  children,
  light,
}) => (
  <div
    style={{
      position: 'absolute',
      left: l,
      top: t,
      width: w,
      height: h,
      borderRadius: 40,
      overflow: 'hidden',
      background: light ? '#e8f3fb' : `linear-gradient(160deg, #3463c0, ${C3.blue})`,
      boxShadow: '0 20px 50px rgba(36,77,169,0.22)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: JK,
      fontWeight: 600,
      fontSize: 44,
      color: light ? C3.blue : C3.white,
    }}
  >
    {text}
    {children}
  </div>
);

export const StyleFramesV3: React.FC = () => {
  const f = useCurrentFrame();
  if (f === 0)
    return (
      <AbsoluteFill style={{ background: WHITE_BG }}>
        <Corner />
        <Line y={960} size={66}>
          <span>Yuh kenalan sama</span>
          <Img src={staticFile('brand/lambang-warna-alas-putih.svg')} style={{ width: 92, height: 92 }} />
          <span style={{ color: C3.blue, fontWeight: 700 }}>Tiray</span>
        </Line>
      </AbsoluteFill>
    );
  if (f === 1) {
    const w = 500;
    return (
      <AbsoluteFill style={{ background: WHITE_BG }}>
        <Corner />
        <Line y={400} size={70}>
          <span>Aplikasi resmi</span>
          <span style={{ color: C3.blue, fontWeight: 700 }}>Tirta Ayu</span>
        </Line>
        <Device cx={540} cy={1060} w={w} bodyColor={C3.blue} bezel={12} transform="perspective(2200px) rotateY(-10deg) rotateX(4deg)">
          <UI src="06-beranda.png" width={w - 24} />
        </Device>
      </AbsoluteFill>
    );
  }
  if (f === 2) {
    const L = [100, 410, 720];
    const T = [620, 960];
    return (
      <AbsoluteFill style={{ background: BLUE_BG }}>
        <Corner onBlue />
        <Line y={470} size={70} color={C3.white}>
          Layanan lengkap
        </Line>
        {ICONS.map(([x, y, label], i) => (
          <IconTile key={label} x={x} y={y} label={label} l={L[i % 3]} t={T[Math.floor(i / 3)]} />
        ))}
      </AbsoluteFill>
    );
  }
  if (f === 3) {
    // Clearer: the real 07 screen is readable behind the glass, the word sits on a solid glass band
    return (
      <AbsoluteFill style={{ background: BLUE_BG }}>
        <Corner onBlue />
        <Squircle cx={540} cy={960} s={800} onBlue>
          <div style={{ position: 'absolute', left: 170, top: 60, filter: 'blur(3px)', opacity: 0.85 }}>
            <UI src="07-riwayat-tagihan.png" width={460} />
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(36,77,169,0.15) 0%, rgba(36,77,169,0.55) 100%)' }} />
        </Squircle>
        <div
          style={{
            position: 'absolute',
            left: 140,
            width: 800,
            top: 960 - 120,
            height: 240,
            borderRadius: 60,
            background: 'rgba(36,77,169,0.78)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255,255,255,0.35)',
            boxShadow: '0 30px 70px rgba(10,30,80,0.35)',
          }}
        />
        <Line y={918} size={128} color={C3.white} weight={700}>
          Tagihan
        </Line>
        <Line y={1036} size={40} color={C3.sky} weight={500}>
          Cek dan bayar dari HP
        </Line>
      </AbsoluteFill>
    );
  }
  if (f === 4) {
    const w = 410;
    return (
      <AbsoluteFill style={{ background: WHITE_BG }}>
        <Corner />
        <Line y={400} size={60}>
          <span>Bayar pakai</span>
          <span style={{ color: C3.blue, fontWeight: 700 }}>QRIS</span>
          <span>tanpa ribet</span>
        </Line>
        <Device cx={315} cy={1000} w={w} bodyColor={C3.blue} bezel={12} transform="perspective(2200px) rotateY(8deg)">
          <UI src="07-riwayat-tagihan.png" width={w - 24}>
            <div
              style={{
                position: 'absolute',
                left: 60 - 14,
                top: 718 - 14,
                width: 830 + 28,
                height: 94 + 28,
                borderRadius: 34,
                border: `16px solid ${C3.sky}`,
                boxShadow: `0 0 0 22px rgba(155,213,239,0.4)`,
              }}
            />
          </UI>
        </Device>
        <Device cx={765} cy={1040} w={w} bodyColor={C3.blue} bezel={12} transform="perspective(2200px) rotateY(-8deg)">
          <UI src="08-qris-numpad.png" width={w - 24} />
        </Device>
      </AbsoluteFill>
    );
  }
  // f === 5: wide bento (1000x520 design units) so the same block drops into 16:9 later
  return (
    <AbsoluteFill style={{ background: WHITE_BG }}>
      <Corner />
      <Line y={640} size={56}>
        <span>Semua di</span>
        <span style={{ color: C3.blue, fontWeight: 700 }}>Tiray</span>
      </Line>
      <div style={{ position: 'absolute', left: 40, top: 760 }}>
        <WideBento />
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- Wide bento (layout after the Qita "Financial Value" block) ---------------- */
const BW = 1000;
const BH = 520;
/** Bento reveal progress per column (0..3); undefined = fully shown */
const BentoP = React.createContext<((col: number, y: number) => number) | undefined>(undefined);

export const BTile: React.FC<{ x: number; y: number; w: number; h: number; label?: string; dark?: boolean; light?: boolean; children?: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  label,
  dark,
  light,
  children,
}) => {
  const pf = React.useContext(BentoP);
  const p = pf ? pf(x < 100 ? 0 : x < 400 ? 1 : x < 700 ? 2 : 3, y) : 1;
  if (p <= 0) return null;
  return (
  <div
    style={{
      opacity: Math.min(1, p * 3),
      transform: `translateY(${((1 - p) * 160).toFixed(1)}px)`,
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 22,
      overflow: 'hidden',
      background: light ? '#cfe9f7' : dark ? 'linear-gradient(160deg, #2b58b8, #1c3f8f)' : 'linear-gradient(160deg, #4a7fd4, #3463c0)',
      boxShadow: '0 12px 30px rgba(36,77,169,0.18)',
    }}
  >
    {label && (
      <div style={{ position: 'absolute', left: 16, top: 14, right: 12, fontFamily: JK, fontWeight: 600, fontSize: 24, lineHeight: 1.12, color: light ? C3.blue : C3.white }}>
        {label}
      </div>
    )}
    {children}
  </div>
  );
};

export const WideBento: React.FC<{ p?: (col: number, y: number) => number }> = ({ p }) => (
  <BentoP.Provider value={p}>
  <div style={{ position: 'relative', width: BW, height: BH }}>
    <BTile x={0} y={0} w={190} h={254} label="Tagihan" light>
      <MiniPhone cx={95} cy={250} w={130} src="07-riwayat-tagihan.png" />
    </BTile>
    <BTile x={0} y={266} w={190} h={254} label="Bayar QRIS">
      <MiniPhone cx={95} cy={250} w={130} src="08-qris-numpad.png" />
    </BTile>
    <BTile x={202} y={0} w={300} h={150} label="Info pemakaian air" light>
      <div style={{ position: 'absolute', left: 16, bottom: 14 }}>
        <CropCard src="07-riwayat-tagihan.png" x={50} y={1010} w={850} h={240} dw={268} radius={12} />
      </div>
    </BTile>
    <BTile x={514} y={0} w={284} h={150} label="Info pelanggan">
      <div style={{ position: 'absolute', left: 16, bottom: 14 }}>
        <CropCard src="05-profil.png" x={40} y={560} w={870} h={260} dw={252} radius={12} />
      </div>
    </BTile>
    <BTile x={202} y={162} w={596} h={140} dark>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: JK,
          fontWeight: 700,
          fontSize: 52,
          color: C3.white,
          letterSpacing: '-0.02em',
        }}
      >
        Semua layanan air
      </div>
    </BTile>
    <BTile x={202} y={314} w={300} h={206} label="Info gangguan" light>
      <div style={{ position: 'absolute', left: 16, bottom: 16 }}>
        <CropCard src="02-info-gangguan.png" x={30} y={165} w={840} h={205} dw={268} radius={12} />
      </div>
    </BTile>
    <BTile x={514} y={314} w={284} h={206} label="Lapor aduan">
      <MiniPhone cx={200} cy={250} w={130} src="09-aduan-form.png" />
    </BTile>
    <BTile x={810} y={0} w={190} h={254} label="Pasang baru">
      <MiniPhone cx={95} cy={250} w={130} src="03-sambungan-prosedur.png" />
    </BTile>
    <BTile x={810} y={266} w={190} h={254} label="Pantau status aduan" light>
      <div style={{ position: 'absolute', left: 16, bottom: 18 }}>
        <TuntasBadge w={120} />
      </div>
    </BTile>
  </div>
  </BentoP.Provider>
);
