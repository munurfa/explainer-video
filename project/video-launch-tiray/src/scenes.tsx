import React from 'react';
import { AbsoluteFill, Img, interpolateColors, staticFile, useCurrentFrame } from 'remotion';
import { easeInOutSmooth, easeOutExpo, ip, microBob } from './antislop/theme/easing-and-timing';
import { BEZEL, Crop, Highlight, Phone, Shot, TapRing, Words, phoneDims, pop } from './kit';
import { B, C, CX, FONT } from './theme';

const useLocal = (i: number) => useCurrentFrame() - B[i];

/* ================================================================== */
/* S1 · 0–105 · Kotak → ikon app → "Yuh kenalan sama Tiray"            */
/* ================================================================== */
export const S1_TEXT = 'Yuh kenalan\nsama Tiray';
export const S1_WORD_START = 40;
export const S1_STAGGER = 7;

export const S1: React.FC = () => {
  const f = useLocal(0);
  const size = 260;
  const appear = pop(f, 0);
  const strokeDraw = ip(f, [0, 14], [0, 1], easeOutExpo);
  const blueFill = ip(f, [10, 18], [0, 1], easeOutExpo) * (1 - ip(f, [22, 32], [0, 1], easeInOutSmooth));
  const logoIn = pop(f, 24);
  const moveUp = ip(f, [34, 52], [0, 1], easeInOutSmooth);
  const cy = 960 - moveUp * 340;
  const iconScale = (0.55 + 0.45 * appear) * (1 - moveUp * 0.12);
  const per = 4 * (size - 60) + 2 * Math.PI * 30;

  return (
    <AbsoluteFill style={{ background: C.white }}>
      <div
        style={{
          position: 'absolute',
          left: CX - size / 2,
          top: cy - size / 2,
          width: size,
          height: size,
          transform: `scale(${iconScale.toFixed(4)})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 64,
            background: C.white,
            boxShadow: `0 24px 60px rgba(36,77,169,${(0.22 * logoIn).toFixed(3)})`,
            border: `3px solid ${interpolateColors(logoIn, [0, 1], [C.white, C.line])}`,
          }}
        />
        <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
          <rect
            x={4}
            y={4}
            width={size - 8}
            height={size - 8}
            rx={62}
            fill={C.blue}
            fillOpacity={blueFill}
            stroke={C.blue}
            strokeWidth={8}
            strokeDasharray={per}
            strokeDashoffset={per * (1 - strokeDraw)}
            opacity={1 - ip(f, [24, 32], [0, 1])}
          />
        </svg>
        <Img
          src={staticFile('brand/lambang-warna.svg')}
          style={{
            position: 'absolute',
            left: size * 0.16,
            top: size * 0.16,
            width: size * 0.68,
            height: size * 0.68,
            opacity: ip(f, [24, 28], [0, 1]),
            transform: `scale(${(0.5 + 0.5 * logoIn).toFixed(4)})`,
          }}
        />
      </div>
      <Words text={S1_TEXT} f={f} start={S1_WORD_START} stagger={S1_STAGGER} size={124} top={850} accent={['Tiray']} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* S2 · 105–270 · HP tergambar → Beranda → 3D tegak → push → kipas      */
/* ================================================================== */
export const S2_FAN_AT = [112, 116, 120, 124];

export const S2: React.FC = () => {
  const f = useLocal(1);
  const pw = 500;
  const d = phoneDims(pw);
  const top = 560;
  const draw = ip(f, [0, 22], [0, 1], easeOutExpo);
  const body = ip(f, [20, 28], [0, 1]);
  const screenFill = ip(f, [22, 34], [0, 1], easeOutExpo);
  const shotIn = ip(f, [32, 44], [0, 1]);
  const wipe = ip(f, [34, 56], [0, 1], easeInOutSmooth);
  const rotY = ip(f, [0, 30, 72], [-26, -26, 0], easeInOutSmooth);
  const rotX = ip(f, [0, 30, 72], [10, 10, 0], easeInOutSmooth);
  const push = ip(f, [80, 104], [1, 1.28], easeInOutSmooth);
  const back = ip(f, [104, 124], [0, 1], easeInOutSmooth);
  const scale = push + back * (0.8 - 1.28);
  // titik tengah grid LAYANAN di Beranda (y 923 / 1995)
  const ox = BEZEL + d.sw * 0.5;
  const oy = BEZEL + d.sh * (923 / 1995);
  const per = 2 * (d.w + d.h);
  const bob = microBob(f, 0, 3, 0.12);

  const fanShots = ['07-riwayat-tagihan.png', '09-aduan-form.png', '02-info-gangguan.png', '03-sambungan-prosedur.png'];
  const fanAngles = [-26, -13, 13, 26];

  return (
    <AbsoluteFill style={{ background: C.white }}>
      {/* latar biru menyebar dari HP */}
      <div
        style={{
          position: 'absolute',
          left: CX - 1500,
          top: top + d.h / 2 - 1500,
          width: 3000,
          height: 3000,
          borderRadius: '50%',
          background: C.blue,
          transform: `scale(${wipe.toFixed(4)})`,
        }}
      />

      {/* kipas layar lain */}
      {fanShots.map((s, i) => {
        const p = pop(f, S2_FAN_AT[i]);
        if (f < S2_FAN_AT[i]) return null;
        return (
          <div
            key={s}
            style={{
              position: 'absolute',
              left: CX - pw / 2,
              top,
              transformOrigin: `50% 140%`,
              transform: `scale(0.72) rotate(${(fanAngles[i] * p).toFixed(2)}deg)`,
              opacity: ip(p, [0, 0.3], [0, 1]),
            }}
          >
            <Phone width={pw}>
              <Shot src={s} />
            </Phone>
          </div>
        );
      })}

      {/* HP utama */}
      <div
        style={{
          position: 'absolute',
          left: CX - pw / 2,
          top: top + bob.dy * back,
          width: d.w,
          height: d.h,
          perspective: 2200,
        }}
      >
        <div
          style={{
            width: d.w,
            height: d.h,
            transformOrigin: `${ox}px ${oy}px`,
            transform: `rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
          }}
        >
          <Phone width={pw} bodyOpacity={body}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: C.blue,
                clipPath: `inset(${((1 - screenFill) * 100).toFixed(2)}% 0 0 0)`,
              }}
            />
            <Shot src="06-beranda.png" opacity={shotIn} />
          </Phone>
          <svg width={d.w} height={d.h} style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - body }}>
            <rect
              x={3}
              y={3}
              width={d.w - 6}
              height={d.h - 6}
              rx={d.radius}
              fill="none"
              stroke={C.blue}
              strokeWidth={6}
              strokeDasharray={per}
              strokeDashoffset={per * (1 - draw)}
            />
          </svg>
        </div>
      </div>

      <Words text={'Aplikasi resmi\nTirta Ayu'} f={f} start={56} size={96} color={C.white} accent={['Tirta', 'Ayu']} accentColor={C.sky} top={320} outAt={78} />
      <Words text={'Semua urusan air\ndi HP kamu'} f={f} start={128} size={88} color={C.white} accent={['air']} accentColor={C.sky} top={320} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Pola judul fitur: kata raksasa → judul atas                          */
/* ================================================================== */
const Giant: React.FC<{ f: number; text: string; color: string; outAt: number; size?: number }> = ({
  f,
  text,
  color,
  outAt,
  size = 230,
}) => {
  const lines = text.split('\n').length;
  const top = 960 - (lines * size * 1.02) / 2;
  const sc = ip(f, [0, 22], [1.25, 1], easeOutExpo);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `scale(${sc.toFixed(4)})`, transformOrigin: `${CX}px 960px` }}>
      <Words text={text} f={f} start={2} stagger={4} size={size} color={color} top={top} lineHeight={1.02} outAt={outAt} letterSpacing="-0.04em" />
    </div>
  );
};

const PW = 470;
const PD = phoneDims(PW);
const PTOP = 590;

/* ================================================================== */
/* S3 · 270–450 · Cek Tagihan → sorot 3 bulan → ketuk QRIS → numpad    */
/* ================================================================== */
export const S3_TAP = 112;
export const S3_SWITCH = 120;

export const S3: React.FC = () => {
  const f = useLocal(2);
  const panel = ip(f, [26, 46], [0, -1930], easeInOutSmooth);
  const phoneY = ip(f, [36, 64], [1400, 0], easeOutExpo);
  const sw = ip(f, [S3_SWITCH, S3_SWITCH + 14], [0, 1], easeInOutSmooth);
  const press = ip(f, [S3_TAP - 2, S3_TAP, S3_TAP + 6], [1, 0.96, 1]);
  const k = PD.sw / 949;
  const btnX = BEZEL + (474 * k);
  const btnY = BEZEL + (766 * k);

  return (
    <AbsoluteFill style={{ background: C.white }}>
      <Words text="Cek Tagihan" f={f} start={36} size={112} top={330} accent={['Tagihan']} />
      <Words text="3 bulan terakhir" f={f} start={72} size={58} weight={600} color={C.muted} top={470} outAt={122} letterSpacing="-0.01em" />
      <Words text="Bayar pakai QRIS" f={f} start={132} size={58} weight={600} color={C.muted} top={470} accent={['QRIS']} letterSpacing="-0.01em" />

      <div style={{ position: 'absolute', left: CX - PW / 2, top: PTOP + phoneY }}>
        <Phone width={PW}>
          <div style={{ position: 'absolute', inset: 0, transform: `translateX(${(-sw * 100).toFixed(2)}%)` }}>
            <div style={{ position: 'absolute', inset: 0, transformOrigin: `${474 * k}px ${766 * k}px`, transform: `scale(${press})` }}>
              <Shot src="07-riwayat-tagihan.png" />
            </div>
            <Highlight f={f} start={74} end={100} imgW={949} screenW={PD.sw} x={40} y={1114} w={869} h={435} />
            <Highlight f={f} start={100} end={S3_SWITCH - 4} imgW={949} screenW={PD.sw} x={47} y={719} w={855} h={95} />
          </div>
          <div style={{ position: 'absolute', inset: 0, transform: `translateX(${((1 - sw) * 100).toFixed(2)}%)` }}>
            <Shot src="08-qris-numpad.png" />
          </div>
        </Phone>
        <TapRing f={f} at={S3_TAP} x={btnX} y={btnY} />
      </div>

      {/* panel biru pembuka dengan kata raksasa */}
      <div style={{ position: 'absolute', inset: 0, background: C.blue, transform: `translateY(${panel.toFixed(1)}px)` }}>
        <Giant f={f} text="Tagihan" color={C.white} outAt={999} />
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* S4 · 450–630 · Lapor Aduan → foto + lokasi → daftar, badge Tuntas   */
/* ================================================================== */
export const S4_TUNTAS = 136;

export const S4: React.FC = () => {
  const f = useLocal(3);
  const slide = ip(f, [30, 58], [760, 0], easeOutExpo);
  const swap = ip(f, [108, 118], [0, 1]);
  const zoom = ip(f, [114, 140], [1, 1.5], easeInOutSmooth);
  const k = PD.sw / 900;
  const ox = BEZEL + 766 * k;
  const oy = BEZEL + 339 * k;

  return (
    <AbsoluteFill style={{ background: C.white }}>
      <Giant f={f} text="Lapor" color={C.ink} outAt={24} />
      <Words text="Lapor Aduan" f={f} start={28} size={112} top={330} accent={['Aduan']} />
      <Words text="Foto + lokasi" f={f} start={64} size={58} weight={600} color={C.muted} top={470} outAt={112} letterSpacing="-0.01em" />
      <Words text="Pantau statusnya" f={f} start={120} size={58} weight={600} color={C.muted} top={470} letterSpacing="-0.01em" />

      <div style={{ position: 'absolute', left: CX - PW / 2, top: PTOP, transform: `translateX(${slide.toFixed(1)}px)` }}>
        <Phone width={PW}>
          <div style={{ position: 'absolute', inset: 0, opacity: 1 - swap }}>
            <Shot src="09-aduan-form.png" />
            <Highlight f={f} start={62} end={104} imgW={900} screenW={PD.sw} x={36} y={878} w={828} h={168} />
          </div>
          <div style={{ position: 'absolute', inset: 0, opacity: swap, transformOrigin: `${ox - BEZEL}px ${oy - BEZEL}px`, transform: `scale(${zoom.toFixed(4)})` }}>
            <Shot src="01-aduan-daftar.png" />
            <Highlight f={f} start={S4_TUNTAS} imgW={900} screenW={PD.sw} x={707} y={315} w={119} h={48} />
          </div>
        </Phone>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* S5 · 630–780 · Air mati? → Info Gangguan, kartu jatuh bertumpuk     */
/* ================================================================== */
export const S5_DROP = [44, 54, 64];
const S5_CARDS = [166, 400, 634];

export const S5: React.FC = () => {
  const f = useLocal(4);
  return (
    <AbsoluteFill style={{ background: C.blue }}>
      <Giant f={f} text={'Air\nmati?'} color={C.white} outAt={26} size={220} />
      <Words text="Info Gangguan" f={f} start={30} size={108} color={C.white} top={330} accent={['Gangguan']} accentColor={C.sky} />
      {S5_CARDS.map((y, i) => {
        const p = pop(f, S5_DROP[i]);
        if (f < S5_DROP[i]) return null;
        return (
          <div
            key={y}
            style={{
              position: 'absolute',
              left: 90,
              top: 540 + i * 236,
              transform: `translateY(${((1 - p) * -320).toFixed(1)}px) rotate(${((1 - p) * (i % 2 ? 3 : -3)).toFixed(2)}deg)`,
              opacity: ip(p, [0, 0.25], [0, 1]),
              boxShadow: '0 24px 50px rgba(10,24,60,0.35)',
              borderRadius: 26,
            }}
          >
            <Crop src="02-info-gangguan.png" imgW={900} imgH={1894} x={36} y={y} w={828} h={212} displayW={820} radius={26} />
          </div>
        );
      })}
      <Words text="langsung di HP kamu" f={f} start={86} size={64} weight={700} color={C.white} top={1290} letterSpacing="-0.01em" />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* S6 · 780–930 · Pasang Baru → stepper → dialog berhasil              */
/* ================================================================== */
export const S6_STEPS = [48, 60, 72, 84];
export const S6_DIALOG = 100;
const STEP_LABELS = ['Identitas', 'Alamat', 'Dokumen', 'Konfirmasi'];

const Stepper: React.FC<{ f: number }> = ({ f }) => {
  const cardIn = pop(f, 34);
  const cw = 840;
  const xs = [110, 310, 530, 730];
  return (
    <div
      style={{
        position: 'absolute',
        left: 80,
        top: 540,
        width: cw,
        height: 230,
        borderRadius: 32,
        background: C.white,
        border: `3px solid ${C.line}`,
        boxShadow: '0 24px 60px rgba(22,36,59,0.10)',
        transform: `translateY(${((1 - cardIn) * 120).toFixed(1)}px)`,
        opacity: ip(cardIn, [0, 0.3], [0, 1]),
        fontFamily: FONT,
      }}
    >
      {xs.slice(0, 3).map((x, i) => {
        const fill = ip(f, [S6_STEPS[i] + 2, S6_STEPS[i] + 12], [0, 1], easeOutExpo);
        return (
          <div key={x} style={{ position: 'absolute', left: x + 50, top: 88, width: xs[i + 1] - x - 100, height: 6, background: C.line, borderRadius: 3 }}>
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
                top: 47,
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
              {active && i < 3 ? (
                <svg width={44} height={44} viewBox="0 0 44 44">
                  <path d="M9 23 L18 32 L35 13" fill="none" stroke={C.white} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={42} strokeDashoffset={42 * (1 - check)} />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <div
              style={{
                position: 'absolute',
                left: x - 110,
                width: 220,
                top: 152,
                textAlign: 'center',
                fontSize: 32,
                fontWeight: 700,
                color: active ? C.blue : C.muted,
              }}
            >
              {STEP_LABELS[i]}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const S6: React.FC = () => {
  const f = useLocal(5);
  const dlg = pop(f, S6_DIALOG);
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <Giant f={f} text={'Pasang\nBaru'} color={C.ink} outAt={26} size={210} />
      <Words text="Pasang Baru" f={f} start={30} size={112} top={330} accent={['Baru']} />
      <Stepper f={f} />
      <Words text="daftar cukup dari HP" f={f} start={62} size={58} weight={600} color={C.muted} top={816} letterSpacing="-0.01em" />
      {f >= S6_DIALOG && (
        <div
          style={{
            position: 'absolute',
            left: CX - 300,
            top: 930,
            transform: `scale(${(0.6 + 0.4 * dlg).toFixed(4)})`,
            opacity: ip(dlg, [0, 0.3], [0, 1]),
            boxShadow: '0 30px 80px rgba(22,36,59,0.25)',
            borderRadius: 36,
          }}
        >
          <Crop src="04-sambungan-sukses.png" imgW={720} imgH={1462} x={73} y={437} w={574} h={595} displayW={600} radius={36} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* S7 · 930–1110 · Ga cuma itu → bento 4 fitur                          */
/* ================================================================== */
export const S7_SHEET = 80;
export const S7_CARDS_AT = [100, 108, 116, 124];

const BENTO: { label: string; src: string; x: number; y: number; w: number; h: number; imgW: number }[] = [
  { label: 'Tagihan', src: '07-riwayat-tagihan.png', x: 0, y: 0, w: 410, h: 620, imgW: 949 },
  { label: 'Aduan', src: '01-aduan-daftar.png', x: 430, y: 0, w: 410, h: 300, imgW: 900 },
  { label: 'Info Gangguan', src: '02-info-gangguan.png', x: 430, y: 320, w: 410, h: 300, imgW: 900 },
  { label: 'Pasang Baru', src: '03-sambungan-prosedur.png', x: 0, y: 640, w: 840, h: 320, imgW: 946 },
];

export const S7: React.FC = () => {
  const f = useLocal(6);
  const sheet = ip(f, [S7_SHEET, S7_SHEET + 18], [1930, 0], easeInOutSmooth);
  const zoom = ip(f, [100, 172], [1.08, 1], easeInOutSmooth);
  return (
    <AbsoluteFill style={{ background: C.blue }}>
      <Words text={'Ga cuma\nitu...'} f={f} start={6} size={150} color={C.white} top={800} outAt={30} letterSpacing="-0.03em" />
      <Words text={'satu\naplikasi'} f={f} start={36} size={150} color={C.white} top={800} outAt={56} accent={['aplikasi']} accentColor={C.sky} letterSpacing="-0.03em" />
      <Words text={'buat semua\nurusan air'} f={f} start={60} size={130} color={C.white} top={810} accent={['air']} accentColor={C.sky} letterSpacing="-0.03em" />

      <div style={{ position: 'absolute', inset: 0, background: C.white, transform: `translateY(${sheet.toFixed(1)}px)` }}>
        <Words text={'Satu aplikasi,\nsemua urusan air'} f={f} start={92} stagger={4} size={84} top={320} accent={['air']} />
        <div style={{ position: 'absolute', left: 80, top: 540, width: 840, height: 960, transform: `scale(${zoom.toFixed(4)})` }}>
          {BENTO.map((b, i) => {
            const p = pop(f, S7_CARDS_AT[i]);
            if (f < S7_CARDS_AT[i]) return null;
            const imgDisplayW = b.w < 500 ? b.w : 560;
            return (
              <div
                key={b.label}
                style={{
                  position: 'absolute',
                  left: b.x,
                  top: b.y,
                  width: b.w,
                  height: b.h,
                  borderRadius: 32,
                  overflow: 'hidden',
                  background: '#eef4fb',
                  border: `3px solid ${C.line}`,
                  transform: `scale(${(0.86 + 0.14 * p).toFixed(4)})`,
                  opacity: ip(p, [0, 0.3], [0, 1]),
                }}
              >
                <div style={{ position: 'absolute', left: 28, top: 22, fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.ink, letterSpacing: '-0.01em' }}>
                  {b.label}
                </div>
                <Img
                  src={staticFile(`ui/${b.src}`)}
                  style={{
                    position: 'absolute',
                    top: 90,
                    left: b.w < 500 ? 24 : b.w - imgDisplayW - 24,
                    width: b.w < 500 ? b.w - 48 : imgDisplayW,
                    borderRadius: 20,
                    boxShadow: '0 10px 30px rgba(22,36,59,0.14)',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* S8 · 1110–1215 · #YuhBukaTiray                                       */
/* ================================================================== */
export const S8_PUNCH = 18;

export const S8: React.FC = () => {
  const f = useLocal(7);
  const line = ip(f, [24, 42], [0, 1], easeOutExpo);
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <Words text={'#Yuh\nBuka\nTiray'} f={f} start={8} stagger={5} size={236} lineHeight={0.98} align="left" left={110} width={830} top={540} accent={['Tiray']} letterSpacing="-0.045em" />
      <div style={{ position: 'absolute', left: 116, top: 1250, width: 620 * line, height: 22, background: C.blue, borderRadius: 11 }} />
      <div style={{ position: 'absolute', left: 116 + 620 * line + 12, top: 1250, width: 60 * ip(f, [36, 46], [0, 1], easeOutExpo), height: 22, background: C.green, borderRadius: 11 }} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* S9 · 1215–1350 · End card                                           */
/* ================================================================== */
export const S9_BADGE = 40;

export const S9: React.FC = () => {
  const f = useLocal(8);
  const logo = ip(f, [0, 22], [0, 1], easeOutExpo);
  const badge = pop(f, S9_BADGE);
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <Img
        src={staticFile('brand/logo-vertikal-warna.svg')}
        style={{
          position: 'absolute',
          left: CX - 230,
          top: 330,
          width: 460,
          height: 460,
          opacity: logo,
          transform: `scale(${(0.92 + 0.08 * logo).toFixed(4)})`,
        }}
      />
      <Words text="Tiray" f={f} start={14} size={120} top={820} color={C.blue} />
      <Words text={'Ayo Jakwir,\nmonggo didownload!'} f={f} start={22} stagger={4} size={64} weight={700} top={980} letterSpacing="-0.015em" />
      {f >= S9_BADGE && (
        <Img
          src={staticFile('badge/google-play-id.png')}
          style={{
            position: 'absolute',
            left: CX - 260,
            top: 1170,
            width: 520,
            transform: `scale(${(0.8 + 0.2 * badge).toFixed(4)})`,
            opacity: ip(badge, [0, 0.3], [0, 1]),
          }}
        />
      )}
      <Words text="#YuhBukaTiray" f={f} start={52} size={48} weight={700} top={1410} color={C.blue} letterSpacing="0em" />
    </AbsoluteFill>
  );
};
