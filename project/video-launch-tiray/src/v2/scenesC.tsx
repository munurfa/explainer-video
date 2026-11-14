import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { easeInOutSmooth, easeOutExpo, ip, springAt } from '../antislop/theme/easing-and-timing';
import { C, CX, FONT } from '../theme';
import { AppIcon, CropCard, cropH, Grow, HBlur, lerp, Row, t01, TuntasBadge, Txt } from './kit2';
import { pop } from './scenesA';

/* ================================================================== */
/* S7 · 930–1125 · Ga cuma itu → info pelanggan → bento 3 klaster      */
/* ================================================================== */
type Card = { kind: 'crop'; src: string; x: number; y: number; w: number; h: number; l: number; t: number; dw: number }
  | { kind: 'label'; text: string; l: number; t: number; w: number; h: number; bg: string; color: string }
  | { kind: 'badge'; l: number; t: number; w: number };

const crop = (src: string, x: number, y: number, w: number, h: number, l: number, t: number, dw: number): Card => ({ kind: 'crop', src, x, y, w, h, l, t, dw });
const label = (text: string, l: number, t: number, w: number, h: number, bg = C.blue, color = C.white): Card => ({ kind: 'label', text, l, t, w, h, bg, color });

const CLUSTERS: { cx: number; cy: number; at: number; cards: Card[] }[] = [
  {
    cx: 540,
    cy: 960,
    at: 1037,
    cards: [
      label('Tagihan', -440, -560, 430, 200),
      crop('08-qris-numpad.png', 0, 130, 900, 1320, 10, -560, 430),
      crop('07-riwayat-tagihan.png', 50, 160, 845, 450, -440, -340, 430),
      crop('07-riwayat-tagihan.png', 50, 718, 850, 94, -440, -90, 430),
      crop('07-riwayat-tagihan.png', 50, 1010, 850, 530, -440, 100, 880),
    ],
  },
  {
    cx: 1620,
    cy: 960,
    at: 1068,
    cards: [
      label('Aduan', -440, -560, 430, 170),
      label('Gangguan', 10, -560, 430, 170, C.sky, C.ink),
      crop('01-aduan-daftar.png', 36, 275, 828, 245, -440, -370, 430),
      crop('02-info-gangguan.png', 30, 165, 840, 205, 10, -370, 430),
      crop('01-aduan-daftar.png', 36, 545, 828, 240, -440, -230, 430),
      crop('02-info-gangguan.png', 30, 400, 840, 205, 10, -250, 430),
      { kind: 'badge', l: -440, t: -80, w: 300 },
      crop('02-info-gangguan.png', 30, 635, 840, 205, 10, -130, 430),
      crop('09-aduan-form.png', 46, 878, 809, 168, -440, 100, 880),
      crop('02-info-gangguan.png', 30, 870, 840, 205, -440, 320, 880),
    ],
  },
  {
    cx: 1620,
    cy: 2040,
    at: 1098,
    cards: [
      label('Pasang Baru', -440, -560, 880, 170),
      crop('03-sambungan-prosedur.png', 30, 1290, 900, 685, -440, -370, 430),
      crop('04-sambungan-sukses.png', 73, 437, 574, 595, 10, -370, 430),
      crop('05-profil.png', 46, 640, 856, 180, -440, 110, 880),
      crop('05-profil.png', 46, 850, 856, 185, -440, 320, 880),
    ],
  },
];
export const S7_CARD_FRAMES = CLUSTERS.flatMap((c) => c.cards.map((_, i) => c.at + i * 4));

const camAt = (f: number) => {
  const a = t01(f, 1063, 1080, easeInOutSmooth);
  const b = t01(f, 1093, 1110, easeInOutSmooth);
  return { x: lerp(540, 1620, a), y: lerp(960, 2040, b) };
};

const CardView: React.FC<{ c: Card }> = ({ c }) => {
  if (c.kind === 'crop') return <CropCard src={c.src} x={c.x} y={c.y} w={c.w} h={c.h} dw={c.dw} radius={26} />;
  if (c.kind === 'badge')
    return (
      <div style={{ width: 430, height: 170, borderRadius: 26, background: C.white, boxShadow: '0 28px 70px rgba(22,36,59,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TuntasBadge w={c.w} />
      </div>
    );
  return (
    <div
      style={{
        width: c.w,
        height: c.h,
        borderRadius: 30,
        background: c.bg,
        color: c.color,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 68,
        letterSpacing: '-0.025em',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '0 0 26px 34px',
        boxSizing: 'border-box',
      }}
    >
      {c.text}
    </div>
  );
};

export const S7: React.FC = () => {
  const f = useCurrentFrame();
  const blue = f < 1035;
  const drift = lerp(40, -40, t01(f, 1013, 1035, (t) => t));
  /* 985–1013 info pelanggan */
  const pIn = springAt(f, 987, 30, { damping: 15, stiffness: 130, mass: 0.7 });
  const tIn = springAt(f, 992, 30, { damping: 15, stiffness: 130, mass: 0.7 });
  const infoOut = t01(f, 1011, 1017, (t) => t * t);
  /* bento */
  const cam = camAt(f);
  const zoomOut = t01(f, 1118, 1130, easeInOutSmooth);
  return (
    <AbsoluteFill style={{ background: blue ? C.blue : C.white }}>
      {blue && (
        <>
          <Txt text="Ga cuma itu" f={f} at={931} x={540} y={960} size={130} color={C.white} out={954} />
          <Txt text="masih banyak" f={f} at={957} x={540} y={820} size={100} color={C.white} out={984} />
          <Txt text="yang bisa" f={f} at={961} x={540} y={945} size={100} color={C.white} out={984} />
          {f >= 965 && f < 995 && (
            <Row x={540} y={1075} style={{ gap: 26 }}>
              <div style={{ transform: `scale(${pop(f, 965).toFixed(4)}) translateY(${(t01(f, 984, 994, (t) => t * t) * 200).toFixed(1)}px)` }}>
                <AppIcon size={100} />
              </div>
              <div style={{ position: 'relative', width: 470, height: 130 }}>
                <Txt text="Tiray bantu" f={f} at={967} x={0} y={65} size={100} color={C.sky} anchor="l" out={984} outDir={1} />
              </div>
            </Row>
          )}
          {f >= 987 && f < 1018 && (
            <>
              <div style={{ position: 'absolute', left: 70, top: 640, transform: `translateY(${((1 - pIn) * 700 + infoOut * 300).toFixed(1)}px) rotate(-3deg)`, opacity: 1 - infoOut }}>
                <CropCard src="05-profil.png" x={46} y={520} w={856} h={1035} dw={520} radius={30} />
              </div>
              <div style={{ position: 'absolute', left: 500, top: 1010, transform: `translateY(${((1 - tIn) * 700 + infoOut * 300).toFixed(1)}px) rotate(3deg)`, opacity: 1 - infoOut }}>
                <CropCard src="07-riwayat-tagihan.png" x={50} y={1010} w={850} h={530} dw={520} radius={30} />
              </div>
            </>
          )}
          <Txt text="Info pelanggan" f={f} at={988} x={540} y={380} size={84} color={C.white} out={1012} />
          <Txt text="& pemakaian" f={f} at={992} x={540} y={490} size={84} color={C.sky} out={1012} />
          <Txt text="Satu aplikasi," f={f} at={1015} x={540 + drift} y={860} size={120} color={C.white} />
          <Txt text="semua urusan air" f={f} at={1018} x={540 - drift} y={1010} size={100} color={C.sky} />
        </>
      )}
      {!blue && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `scale(${lerp(1, 0.55, zoomOut).toFixed(4)})`,
            opacity: 1 - t01(f, 1122, 1132),
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${(540 - cam.x).toFixed(2)}px, ${(960 - cam.y).toFixed(2)}px)` }}>
            {CLUSTERS.map((cl) =>
              cl.cards.map((c, i) => {
                const at = cl.at + i * 4;
                if (f < at) return null;
                const p = springAt(f, at, 30, { damping: 15, stiffness: 140, mass: 0.7 });
                return (
                  <div
                    key={`${cl.cx}-${cl.cy}-${i}`}
                    style={{
                      position: 'absolute',
                      left: cl.cx + c.l,
                      top: cl.cy + c.t,
                      opacity: ip(p, [0, 0.25], [0, 1]),
                      transform: `translateY(${((1 - p) * 160).toFixed(1)}px) scale(${(0.9 + 0.1 * p).toFixed(4)})`,
                    }}
                  >
                    <CardView c={c} />
                  </div>
                );
              }),
            )}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
void cropH;

/* ================================================================== */
/* S8 · 1125–1215 · Yuh → #Yuh Buka Tiray                              */
/* ================================================================== */
export const S8_YUH = 1127;
export const S8_PUNCH = 1158;

export const S8: React.FC = () => {
  const f = useCurrentFrame();
  const xFn = (fr: number) => 1600 - 1340 * t01(fr, S8_YUH, 1143, easeOutExpo);
  const m = t01(f, 1145, 1160, easeInOutSmooth);
  const hash = t01(f, 1147, 1158, easeOutExpo);
  const line = t01(f, 1168, 1186, easeOutExpo);
  const tab = t01(f, 1180, 1190, easeOutExpo);
  const wipe = t01(f, 1200, 1213, easeInOutSmooth);
  const size = lerp(300, 220, m);
  return (
    <AbsoluteFill>
      {f >= S8_YUH && (
        <HBlur id="b-yuh" amount={(xFn(f - 1) - xFn(f)) * 0.45} style={{ position: 'absolute', inset: 0 }}>
          <Row x={lerp(xFn(f), 116, m)} y={lerp(960, 760, m)} anchor="l" style={{ fontWeight: 800, fontSize: size, letterSpacing: '-0.045em', lineHeight: 1.05, color: C.ink }}>
            <Grow t={hash} maxW={size * 0.7}>
              <span style={{ color: C.blue }}>#</span>
            </Grow>
            <span>Yuh</span>
          </Row>
        </HBlur>
      )}
      <Txt text="Buka" f={f} at={1152} x={116} y={960} size={220} anchor="l" ls="-0.045em" />
      <Txt text="Tiray" f={f} at={S8_PUNCH} x={116} y={1160} size={220} color={C.blue} anchor="l" ls="-0.045em" />
      <div style={{ position: 'absolute', left: 122, top: 1300, width: 620 * line, height: 22, background: C.blue, borderRadius: 11 }} />
      <div style={{ position: 'absolute', left: 122 + 620 * line + 12, top: 1300, width: 60 * tab, height: 22, background: C.green, borderRadius: 11 }} />
      {wipe > 0 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1920 * wipe, background: C.sky }} />}
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* S9 · 1215–1350 · End card                                           */
/* ================================================================== */
export const S9_LOGO = 1215;
export const S9_BADGE = 1255;

export const S9: React.FC = () => {
  const f = useCurrentFrame();
  const logo = t01(f, 1215, 1237, easeOutExpo);
  const badge = pop(f, S9_BADGE);
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <Img
        src={staticFile('brand/logo-vertikal-warna.svg')}
        style={{ position: 'absolute', left: CX - 230, top: 330, width: 460, height: 460, opacity: logo, transform: `scale(${(0.92 + 0.08 * logo).toFixed(4)})` }}
      />
      <Txt text="Tiray" f={f} at={1229} x={CX} y={890} size={120} color={C.blue} />
      <Txt text="Ayo Jakwir," f={f} at={1237} x={CX} y={1020} size={64} weight={700} ls="-0.015em" />
      <Txt text="monggo didownload!" f={f} at={1241} x={CX} y={1096} size={64} weight={700} ls="-0.015em" />
      {f >= S9_BADGE && (
        <Img
          src={staticFile('badge/google-play-id.png')}
          style={{ position: 'absolute', left: CX - 260, top: 1190, width: 520, transform: `scale(${(0.8 + 0.2 * badge).toFixed(4)})`, opacity: ip(badge, [0, 0.3], [0, 1]) }}
        />
      )}
      <Txt text="#YuhBukaTiray" f={f} at={1267} x={CX} y={1440} size={48} weight={700} color={C.blue} ls="0em" />
    </AbsoluteFill>
  );
};
void easeOutExpo;
