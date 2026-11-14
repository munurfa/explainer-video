import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';
import { getStyleById } from './antislop/theme/styles-catalog';
import { easeInOutSmooth, easeOutExpo, ip, springAt, SPRING_PRESETS } from './antislop/theme/easing-and-timing';
import { AudioStage } from './antislop/components/AudioStage';
import { LapisStage, projectToScreen } from './antislop/components/Lapis3D';
import {
  BEDAH_SEMANTIC,
  ChevronTrail,
  hookSaturation,
  LapisCaption,
  LapisCard,
  LapisHeader,
  LapisHook,
  lapisHookText,
  LapisLabel,
  lapisLayout,
  lapisStyle,
  LapisWord,
  LiveCounter,
  StatusBadge,
  StoreBadgeTap,
} from './antislop/components/LapisOverlay';
import { AIRV_Y, camFor, DIST, filledAt, distSeg, GAUGE, HOUSE, HOUSE_Y, HUMP, HUMP_S, MAIN, mainSeg, pointAt, SPOUT_TIP, TANK, V3, ventingAt } from './layout';
import { activeStep, SCENE, T, TOTAL_FRAMES } from './timeline';
import { C_AIRV, C_PIPE, C_TAP, C_WATER, World } from './World';
import wordsJson from '../public/words.json';

loadPoppins('normal', { weights: ['500', '700', '800'], subsets: ['latin'] });
loadMono('normal', { weights: ['700'], subsets: ['latin'] });

export { TOTAL_FRAMES };

/* Jawaban dua pertanyaan wajib gaya #46 (lihat research/storyboard.md) */
const MODE = 'tirta-ayu' as const;
// baris dipecah manual; tanda hubung tak-terputus supaya "Takon-Takon" tidak terbelah
const HOOK = lapisHookText(['Yuh,', 'Takon‑Takon Air'].join(String.fromCharCode(10)), MODE);
const STYLE = lapisStyle(getStyleById(46), MODE);
const WORDS = wordsJson as LapisWord[];
const STEPS = ['Aliran', 'Perbaikan', 'Isi pipa', 'Angin', 'Keran'];
const INK = STYLE.palette.ink;
const BLUE = STYLE.palette.accentSecondary;

/* ---------------- judul per bab (maks 7 kata) ---------------- */
interface Chapter {
  from: number;
  before?: string;
  keyword: string;
  after?: string;
  color?: string;
}
const CHAPTERS: Chapter[] = [
  { from: 0, before: 'Pipa udah beres,', keyword: 'air belum ngalir?' },
  { from: SCENE.S3[0], before: 'Di bawah tanah ada', keyword: 'pipa panjang' },
  { from: SCENE.S4[0], before: 'Air turun', keyword: 'sendiri', after: 'dari tempat tinggi' },
  { from: SCENE.S5[0], before: 'Pipa diperbaiki, aliran', keyword: 'ditutup', color: BEDAH_SEMANTIC.problem },
  { from: SCENE.S6[0], before: 'Dibuka lagi,', keyword: 'pipa terisi', after: 'pelan-pelan' },
  { from: SCENE.S7[0], before: 'Angin', keyword: 'terjebak', after: 'harus dibuang' },
  { from: SCENE.S8[0], before: 'Dorongan air', keyword: 'pulih', color: BEDAH_SEMANTIC.solution },
  { from: SCENE.S9[0], before: 'Kenapa waktunya', keyword: 'beda-beda?' },
  { from: SCENE.S10[0], before: 'Jadi', keyword: 'sabar sebentar,', after: 'ya' },
  { from: T.phone, before: 'Cek info gangguan di', keyword: 'Tiray' },
];

/* ---------------- badge baris data (maks 2 sekaligus) ---------------- */
const BADGES: { text: string; span: readonly [number, number]; variant: 'time' | 'problem' | 'solution' }[] = [
  { text: 'Aliran ditutup', span: T.badgeClosed, variant: 'problem' },
  { text: 'Dipercepat', span: [T.recedeMain[0], T.hose[0]], variant: 'time' },
  { text: 'Ilustrasi', span: T.counter, variant: 'time' },
  { text: 'Diperbesar', span: [T.toHump[1], T.toGauge[0]], variant: 'time' },
  { text: 'Ilustrasi', span: [T.lblPush[0], T.toTap[0]], variant: 'time' },
];

/* ---------------- SFX terikat animasi: [frame, nama, volume, durasi] ---------------- */
const pop = (span: readonly [number, number]): [number, string, number, number] => [span[0] + 9, 'pop-in', 0.22, 18];
const SFX: [number, string, number, number][] = [
  ...T.drips.map(([a, b]): [number, string, number, number] => [Math.round(a + (b - a) * 0.94), 'pop-plop', 0.3, 18]),
  [T.veil[0], 'transition-whoosh-soft', 0.4, 40],
  [T.peel, 'transition-swipe', 0.38, 40],
  pop(T.lblTank),
  pop(T.lblHome),
  pop(T.lblReservoir),
  [T.flowChev[0], 'o5', 0.28, 60],
  pop(T.lblMain),
  pop(T.lblDist),
  [T.valveClose[0], 'm4', 0.4, 34],
  [T.valveClose[1] - 2, 'toggle-off', 0.4, 20],
  pop(T.lblEmpty),
  [T.valveOpen[0], 'm4', 0.4, 30],
  [T.fillMain[0], 'o5', 0.32, 70],
  [T.fillDist[0], 'o5', 0.3, 60],
  [T.fillDist[1] - 2, 'data-reveal', 0.3, 40],
  [T.hose[0], 'pop-in', 0.22, 18],
  pop(T.lblAir),
  pop(T.lblAirValve),
  [T.vent1[0] + 6, 'air-valve', 0.26, 40],
  pop(T.lblStutter),
  pop(T.lblPush),
  [T.pressureUp[1] - 2, 'tick-soft', 0.35, 20],
  [T.tapFlow[0], 'water-bloom', 0.34, 60],
  [T.lblTap[0] + 9, 'confirm-glass', 0.3, 40],
  pop(T.lblHigh),
  pop(T.lblFar),
  pop(T.lblBig),
  [T.close, 'transition-whoosh-soft', 0.36, 40],
  [T.phone, 'pop-in', 0.26, 18],
  [T.waCard, 'pop-in', 0.24, 18],
  [T.hashtag[0], 'transition-swipe', 0.3, 30],
  [T.endCard + 6, 'confirm-chime', 0.3, 40],
  [T.tap, 'click', 0.55, 14],
];

/* ---------------- analogi selang taman (kartu mini) ---------------- */
const HoseCard: React.FC<{ frame: number; left: number; top: number }> = ({ frame, left, top }) => {
  const [a, b] = T.hose;
  const k = ip(frame, [a + 10, b - 10], [0, 1], (x) => x);
  // awalnya menyembur putus-putus (angin + air), lalu lancar
  const smoothFlow = ip(k, [0.45, 0.75], [0, 1], (x) => x);
  return (
    <LapisCard stylePreset={STYLE} start={a} end={b} eyebrow="Mirip selang taman" left={left} top={top} width={600}>
      <svg width={528} height={170} viewBox="0 0 528 170">
        {/* gulungan selang */}
        {[52, 38, 24].map((r) => (
          <circle key={r} cx={70} cy={92} r={r} fill="none" stroke="#3FC49A" strokeWidth={11} />
        ))}
        <path d="M118 112 C 170 150, 220 60, 300 78" fill="none" stroke="#3FC49A" strokeWidth={11} strokeLinecap="round" />
        {/* kepala semprot */}
        <rect x={296} y={64} width={46} height={26} rx={8} fill={INK} />
        <rect x={340} y={70} width={16} height={14} rx={4} fill="#F4B63C" />
        {/* semburan: titik putus-putus -> garis utuh */}
        {Array.from({ length: 7 }, (_, i) => {
          const u = (((frame * 0.09 + i / 7) % 1) + 1) % 1;
          const gap = Math.sin(frame * 0.5 + i * 2.1) > 0.1 ? 1 : 0;
          const op = (smoothFlow + (1 - smoothFlow) * gap) * Math.sin(Math.PI * u);
          return <rect key={i} x={362 + u * 150} y={72 + u * u * 46} width={22} height={9} rx={4.5} fill={C_WATER} opacity={op * ip(k, [0, 0.12], [0, 1])} transform={`rotate(${u * 28} ${362 + u * 150} ${76 + u * u * 46})`} />;
        })}
      </svg>
    </LapisCard>
  );
};

/* ---------------- layar Tiray + kartu WhatsApp ---------------- */
const TirayOutro: React.FC<{ frame: number; W: number }> = ({ frame, W }) => {
  const { fps } = useVideoConfig();
  if (frame < T.dim[0]) return null;
  const dim = ip(frame, [...T.dim], [0, 0.86], easeInOutSmooth);
  const enter = springAt(frame, T.phone, fps, SPRING_PRESETS.editorialSettle);
  const out = ip(frame, [...T.phoneOut], [1, 0]);
  const PW = 372;
  const PH = 842;
  const left = 96;
  const top = 600;
  const anchor: [number, number] = [left + PW - 40, top + 150];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: STYLE.palette.bg, opacity: dim }} />
      {frame >= T.phone ? (
        <div style={{ position: 'absolute', left, top, opacity: enter, transform: `translateY(${(1 - enter) * 90 + Math.sin((frame - T.phone) / 26) * 6}px) rotate(${Math.sin((frame - T.phone) / 34) * 0.5}deg)` }}>
          <div style={{ padding: 12, borderRadius: 54, background: INK, boxShadow: '0 18px 44px rgba(22,36,59,0.22)' }}>
            <Img src={staticFile('ui/09_info-gangguan.png')} style={{ width: PW, height: PH, borderRadius: 42, display: 'block', objectFit: 'cover' }} />
          </div>
        </div>
      ) : null}
      <LapisLabel stylePreset={STYLE} anchor={anchor} offset={[150, -70]} text="Info gangguan" color={BLUE} start={T.lblInfo[0]} end={T.lblInfo[1]} />
      <LapisCard stylePreset={STYLE} start={T.waCard} end={T.phoneOut[0]} eyebrow="WhatsApp Tirta Ayu" left={W - 40 - 470} top={1040} width={470}>
        <div style={{ fontFamily: STYLE.typography.heading, fontWeight: 800, fontSize: 50, color: BLUE, lineHeight: 1.1 }}>0877 3055 0300</div>
        <div style={{ marginTop: 10, fontWeight: 700, fontSize: 32 }}>tirtaayu.co.id</div>
      </LapisCard>
    </AbsoluteFill>
  );
};

/* ---------------- CTA: tagar kampanye, lalu end card logo di atas putih ---------------- */
const EndCard: React.FC<{ frame: number; W: number; H: number }> = ({ frame, W, H }) => {
  if (frame < T.hashtag[0]) return null;
  const L = lapisLayout(W, H);
  const cy = (L.stageTop + L.stageBottom) / 2;
  const veil = ip(frame, [T.hashtag[0], T.hashtag[0] + 10], [0, 1], easeInOutSmooth);
  const tagIn = ip(frame, [T.hashtag[0] + 4, T.hashtag[0] + 18], [0, 1], easeOutExpo);
  const toCard = ip(frame, [T.endCard, T.endCard + 14], [0, 1], easeInOutSmooth);
  const logoIn = ip(frame, [T.endCard + 6, T.endCard + 22], [0, 1], easeOutExpo);
  // gerak pelan supaya tagar dan end card tidak beku total
  const breathe = 1 + ip(frame, [T.hashtag[0], TOTAL_FRAMES], [0, 0.045], (x) => x);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: STYLE.palette.bg, opacity: veil }} />
      <AbsoluteFill style={{ background: '#FFFFFF', opacity: toCard }} />
      {/* beat tagar */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: cy - 20 - toCard * 60, textAlign: 'center', opacity: tagIn * (1 - toCard) }}>
        <div style={{ overflow: 'hidden', paddingBottom: 14 }}>
          <div style={{ fontFamily: STYLE.typography.heading, fontWeight: 800, fontSize: 112, letterSpacing: '-0.02em', color: BLUE, transform: `translateY(${(1 - tagIn) * 60}%) scale(${breathe})` }}>#YuhBukaTiray</div>
        </div>
      </div>
      {/* end card: logo vertikal warna di atas dasar putih, tagar, lalu badge Google Play resmi yang ditekan jari */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 450, textAlign: 'center', opacity: logoIn }}>
        <Img src={staticFile('brand/logo-vertikal-warna.svg')} style={{ width: 440, height: 'auto', transform: `scale(${(0.94 + logoIn * 0.06) * breathe})` }} />
        <div style={{ marginTop: 44, fontFamily: STYLE.typography.heading, fontWeight: 800, fontSize: 64, color: BLUE }}>#YuhBukaTiray</div>
      </div>
      <StoreBadgeTap
        badge={<Img src={staticFile('badge/google-play-id.png')} style={{ width: '100%', height: '100%', display: 'block' }} />}
        center={[W / 2, 1290]}
        width={470}
        height={182}
        start={T.badge}
        tapAt={T.tap}
        ripple={BLUE}
        ink={INK}
      />
    </AbsoluteFill>
  );
};

/* =============================== MAIN ============================== */
export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const cam = camFor(frame);
  const P = (p: V3) => projectToScreen(p, frame, cam, W, H);
  const lift = (p: V3, dx = 0.42): V3 => [p[0] + dx, p[1], p[2]];

  const ch = [...CHAPTERS].reverse().find((c) => frame >= c.from) ?? CHAPTERS[0];
  const veil = ip(frame, [...T.veil], [0, 1, 1, 0], (x) => x);
  const headerOut = ip(frame, [T.hashtag[0], T.hashtag[0] + 10], [1, 0]);

  // chevron searah aliran: selama bab Aliran, dan di muka air saat pipa terisi lagi
  const flowOn = ip(frame, [T.flowChev[0], T.flowChev[0] + 8, T.flowChev[1] - 8, T.flowChev[1]], [0, 1, 1, 0], (x) => x);
  const mainFront = mainSeg(frame)[1];
  const distFront = distSeg(frame)[1];
  const fillingMain = frame >= T.fillMain[0] && frame < T.fillMain[1];
  const fillingDist = frame >= T.fillDist[0] && frame < T.fillDist[1];
  const vent = ventingAt(frame);
  const badges = BADGES.filter((b) => frame >= b.span[0] && frame <= b.span[1] + 8).slice(0, 2);
  const showCounter = frame >= T.counter[0] && frame < SCENE.S7[0];

  return (
    <AbsoluteFill style={{ background: STYLE.palette.bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ filter: `saturate(${hookSaturation(frame, T.hook[0], T.hook[1]).toFixed(3)})` }}>
        <LapisStage width={W} height={H} camera={cam} frame={frame} bg={STYLE.palette.bg} shadowSpan={11}>
          <World frame={frame} />
        </LapisStage>
      </AbsoluteFill>

      {/* chevron aliran (digeser ke depan pipa supaya tidak menutup air) */}
      <ChevronTrail from={P(lift(pointAt(MAIN, 0.3)))} to={P(lift(pointAt(MAIN, 1.5)))} color={BLUE} opacity={flowOn} size={30} />
      <ChevronTrail from={P(lift(pointAt(MAIN, 2.7)))} to={P(lift(pointAt(MAIN, 4.0)))} color={BLUE} opacity={flowOn * ip(frame, [...T.tankToO], [0, 1])} size={30} />
      <ChevronTrail from={P(lift(pointAt(DIST, 1.0)))} to={P(lift(pointAt(DIST, 2.6)))} color={BLUE} opacity={flowOn * ip(frame, [...T.tankToO], [0, 1])} size={30} />
      {fillingMain ? <ChevronTrail from={P(lift(pointAt(MAIN, mainFront - 0.7)))} to={P(lift(pointAt(MAIN, mainFront + 0.5)))} color={BLUE} size={32} speed={1.5} /> : null}
      {fillingDist ? <ChevronTrail from={P(lift(pointAt(DIST, distFront - 0.7)))} to={P(lift(pointAt(DIST, distFront + 0.5)))} color={BLUE} size={32} speed={1.5} /> : null}
      <ChevronTrail from={P([0.3, AIRV_Y + 0.55, HUMP[2]])} to={P([0.3, AIRV_Y + 1.15, HUMP[2]])} color="#C98A0C" opacity={vent} size={32} speed={1.4} />

      <HoseCard frame={frame} left={W - 40 - 600} top={1160} />
      <TirayOutro frame={frame} W={W} />

      {/* tirai penuh menutupi lompatan kamera kamar mandi -> bidikan utuh */}
      <AbsoluteFill style={{ background: STYLE.palette.bg, opacity: veil }} />
      <LapisHook stylePreset={STYLE} text={HOOK} start={T.hook[0]} end={T.hook[1]} />

      <div style={{ opacity: headerOut }}>
        <LapisHeader
          key={ch.from}
          stylePreset={STYLE}
          before={ch.before}
          keyword={ch.keyword}
          after={ch.after}
          keywordColor={ch.color}
          steps={STEPS}
          activeStep={activeStep(frame)}
          start={ch.from}
          subStart={0}
          logo={<Img src={staticFile('brand/lambang-warna.svg')} style={{ height: 96, width: 'auto', display: 'block' }} />}
          data={showCounter ? <LiveCounter stylePreset={STYLE} from={0} to={100} start={T.fillMain[0]} end={T.fillDist[1]} prefix="Pipa terisi " suffix="%" size={48} /> : <span style={{ display: 'inline-block', height: 60 }} />}
          right={
            <span style={{ display: 'inline-flex', gap: 12 }}>
              {badges.map((b) => (
                <StatusBadge key={b.text + b.span[0]} stylePreset={STYLE} text={b.text} variant={b.variant} start={b.span[0]} end={b.span[1]} size={23} />
              ))}
            </span>
          }
        />
      </div>

      {/* ---------- label bagian (titik = warna bagiannya) ---------- */}
      <LapisLabel stylePreset={STYLE} anchor={P([0, TANK.y + 0.7, TANK.z])} offset={[90, -110]} text="Tandon" color={C_WATER} start={T.lblTank[0]} end={T.lblTank[1]} />
      <LapisLabel stylePreset={STYLE} anchor={P([HOUSE.x + 0.2, HOUSE_Y + 0.7, HOUSE.z])} offset={[80, 170]} text="Rumah kamu" color={C_TAP} start={T.lblHome[0]} end={T.lblHome[1]} />

      <LapisLabel stylePreset={STYLE} anchor={P([0, TANK.y + 0.55, TANK.z])} offset={[120, -210]} text="Reservoir (tandon)" color={C_WATER} start={T.lblReservoir[0]} end={T.lblReservoir[1]} />
      <LapisLabel stylePreset={STYLE} anchor={P(pointAt(MAIN, 3.4))} offset={[110, -90]} text="Pipa besar" color={C_PIPE} start={T.lblMain[0]} end={T.lblMain[1]} />
      <LapisLabel stylePreset={STYLE} anchor={P(pointAt(DIST, 1.8))} offset={[110, 60]} text="Pipa kecil" color={C_PIPE} start={T.lblDist[0]} end={T.lblDist[1]} />

      <LapisLabel stylePreset={STYLE} anchor={P(pointAt(MAIN, 4.6))} offset={[90, -150]} text="Pipa kosong" color={BEDAH_SEMANTIC.problem} start={T.lblEmpty[0]} end={T.lblEmpty[1]} />

      <LapisLabel stylePreset={STYLE} anchor={P([0.12, HUMP[1] + 0.06, HUMP[2]])} offset={[-150, 210]} text="Angin terjebak" color="#B4BECB" start={T.lblAir[0]} end={T.lblAir[1]} />
      <LapisLabel stylePreset={STYLE} anchor={P([0.14, AIRV_Y + 0.22, HUMP[2]])} offset={[-170, -90]} text="Katup udara" color={C_AIRV} start={T.lblAirValve[0]} end={T.lblAirValve[1]} />
      <LapisLabel stylePreset={STYLE} anchor={P(pointAt(MAIN, HUMP_S + 0.75))} offset={[110, 170]} text="Air nyendat" color={BEDAH_SEMANTIC.problem} start={T.lblStutter[0]} end={T.lblStutter[1]} />

      <LapisLabel stylePreset={STYLE} anchor={P([0.1, GAUGE.y + 0.1, GAUGE.z])} offset={[-150, -210]} text="Dorongan air" color={C_TAP} start={T.lblPush[0]} end={T.lblPush[1]} />
      <LapisLabel stylePreset={STYLE} anchor={P(SPOUT_TIP)} offset={[150, -170]} text="Air sampai ke keran" color={BEDAH_SEMANTIC.solution} start={T.lblTap[0]} end={T.lblTap[1]} />

      {/* faktor: tiga label di dunia, tampil bersama di akhir */}
      <LapisLabel stylePreset={STYLE} anchor={P([-0.4, 2.1, -4.3])} offset={[-90, -150]} text="Tinggi rendahnya" color="#8FD9B6" start={T.lblHigh[0]} end={T.lblHigh[1]} />
      <LapisLabel stylePreset={STYLE} anchor={P([-0.3, 0.8, 5.2])} offset={[90, 150]} text="Jauh dekatnya" color={C_TAP} start={T.lblFar[0]} end={T.lblFar[1]} />
      <LapisLabel stylePreset={STYLE} anchor={P(pointAt(MAIN, 3.3))} offset={[130, -40]} text="Besar pipanya" color={C_PIPE} start={T.lblBig[0]} end={T.lblBig[1]} />

      <EndCard frame={frame} W={W} H={H} />
      <LapisCaption words={WORDS} stylePreset={STYLE} />
      {/* audio: narasi rekaman user (ElevenLabs), musik B27 dengan ducking otomatis, SFX terikat beat */}
      <AudioStage narrationSrc="audio/narration-60.mp3" musicSrc="audio/music.wav" sfxTrackSrc="" words={WORDS} baseMusicVolume={0.34} />
      {SFX.map(([at, name, vol, len], i) => (
        <Sequence key={i} from={Math.max(0, at)} durationInFrames={len}>
          <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
