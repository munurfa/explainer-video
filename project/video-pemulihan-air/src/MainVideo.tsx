import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';
import { BedahStage, projectToScreen } from './antislop/components/Bedah3D';
import { AudioStage } from './antislop/components/AudioStage';
import {
  BEDAH_SEMANTIC,
  BedahHeader,
  BedahRecapList,
  BedahStepper,
  BedahVariant,
  CalloutPill,
  FlowArrow,
  InfoCard,
  KaraokePillCaption,
  LiveCounter,
  StatusBadge,
} from './antislop/components/BedahOverlay';
import { WordItem } from './antislop/components/KineticWords';
import { getStyleById } from './antislop/theme/styles-catalog';
import { easeOutExpo, ip, springAt, SPRING_PRESETS } from './antislop/theme/easing-and-timing';
import {
  AIR_VALVE_TOP,
  CAM3D,
  DIST,
  DIST_LEN,
  distSeg,
  GATE_S,
  GAUGE_POS,
  HUMP,
  MAIN,
  MAIN_LEN,
  mainSeg,
  pointAt,
  SPOUT_TIP,
  TANK,
  V3,
  valveOpenAt,
} from './layout3d';
import { World3D } from './World3D';
import { sf, T, TOTAL_FRAMES } from './timeline';
import wordsJson from '../public/words-v4.json';

loadPoppins('normal', { weights: ['500', '600', '700', '800'], subsets: ['latin'] });
loadMono('normal', { weights: ['700'], subsets: ['latin'] });

const STYLE = getStyleById(44);
const INK = '#16243B';
const WORDS = wordsJson as WordItem[];
export { TOTAL_FRAMES };

/** Safe zone 9:16: atas 288, bawah mulai 1536, kanan 12% (130 px) */
const SAFE = { top: 300, bottom: 1500, right: 1080 - 130 };
const HEADER_TOP = 300;
const STEPS = ['Aliran', 'Perbaikan', 'Isi pipa', 'Angin', 'Keran'];

const proj = (p: V3, f: number) => projectToScreen(p, f, CAM3D, 1080, 1920) as [number, number];

/* ---------------- header per bab ---------------- */
interface Chapter {
  from: number;
  to: number;
  before?: string;
  keyword: string;
  after?: string;
  sub?: string;
  /** indeks stepper 0..4 (bab mekanisme) */
  step?: number;
  keywordColor?: string;
  badge?: { text: string; variant?: BedahVariant; start: number };
  counter?: { label: string; start: number; end: number };
  exit?: boolean;
}
const CHAPTERS: Chapter[] = [
  { from: -8, to: sf(103), before: 'Pipa udah beres,', keyword: 'air belum ngalir?', sub: 'Info gangguan air', badge: { text: 'Ilustrasi', start: sf(6) }, exit: true },
  { from: sf(186), to: sf(476), before: 'Air turun', keyword: 'sendiri', after: 'dari tempat tinggi', step: 0, badge: { text: 'Ilustrasi', start: sf(200) } },
  { from: sf(476), to: sf(642), before: 'Pipa diperbaiki,', keyword: 'aliran ditutup', step: 1, badge: { text: 'Aliran ditutup', variant: 'problem', start: T.badgeClosed } },
  {
    from: sf(642),
    to: sf(896),
    before: 'Dibuka lagi,',
    keyword: 'pipa terisi',
    step: 2,
    badge: { text: 'Dipercepat', variant: 'time', start: T.fillMain[0] },
    counter: { label: 'Pipa terisi', start: T.fillMain[0], end: T.fillDist[1] },
  },
  { from: sf(896), to: sf(1170), before: 'Angin', keyword: 'terjebak', after: 'harus dibuang', step: 3, badge: { text: 'Diperbesar', variant: 'time', start: T.badgeBig } },
  { from: sf(1170), to: sf(1392), before: 'Dorongan air', keyword: 'pulih', keywordColor: BEDAH_SEMANTIC.solution, step: 4, badge: { text: 'Ilustrasi', start: T.pressureUp[0] } },
  { from: sf(1392), to: sf(1596), before: 'Kenapa waktunya', keyword: 'beda-beda?', sub: 'Empat hal yang berpengaruh', exit: true },
  { from: sf(1596), to: sf(1668), before: 'Jadi', keyword: 'sabar sebentar,', after: 'ya', sub: 'Air kembali bertahap' },
  { from: sf(1668), to: TOTAL_FRAMES, before: 'Cek info gangguan di', keyword: 'Tiray', sub: 'Aplikasi resmi Tirta Ayu', exit: true },
];

const Header: React.FC<{ frame: number }> = ({ frame }) => {
  const idx = CHAPTERS.findIndex((c) => frame >= c.from && frame < c.to);
  if (idx < 0) return null;
  const ch = CHAPTERS[idx];
  const exit = ch.exit ? ip(frame, [ch.to - 8, ch.to], [1, 0]) : 1;
  const prevStep = idx > 0 ? CHAPTERS[idx - 1].step : undefined;
  const active = ch.step === undefined ? 0 : prevStep === undefined ? ch.step : prevStep + (ch.step - prevStep) * ip(frame, [ch.from + 4, ch.from + 18], [0, 1], easeOutExpo);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: 1080 - SAFE.right, opacity: exit }}>
      <BedahHeader
        key={ch.from}
        stylePreset={STYLE}
        before={ch.before}
        keyword={ch.keyword}
        after={ch.after}
        keywordColor={ch.keywordColor}
        subLabel={ch.step !== undefined ? <BedahStepper stylePreset={STYLE} steps={STEPS} active={active} size={19} /> : ch.sub}
        start={ch.from}
        top={HEADER_TOP}
        titleSize={64}
        watermark={<Img src={staticFile('brand/lambang-warna.svg')} style={{ height: 72, width: 'auto' }} />}
        right={ch.badge ? <StatusBadge stylePreset={STYLE} text={ch.badge.text} variant={ch.badge.variant} start={ch.badge.start} /> : undefined}
        data={
          ch.counter ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span style={{ fontFamily: STYLE.typography.mono, fontWeight: 700, fontSize: 22, letterSpacing: '0.12em', textTransform: 'uppercase', color: STYLE.palette.muted }}>
                {ch.counter.label}
              </span>
              <LiveCounter stylePreset={STYLE} from={0} to={100} start={ch.counter.start} end={ch.counter.end} suffix="%" size={52} />
              <span style={{ fontFamily: STYLE.typography.mono, fontWeight: 700, fontSize: 18, letterSpacing: '0.12em', color: STYLE.palette.muted }}>ILUSTRASI</span>
            </div>
          ) : undefined
        }
      />
    </div>
  );
};

/* ---------------- callout berjangkar titik 3D (maks 1 aktif per beat) ---------------- */
interface WorldCallout {
  p: V3;
  off: [number, number];
  text: string;
  span: readonly [number, number];
  variant?: BedahVariant;
}
const WHEEL: V3 = [0, 3.31, -4.3];
const CALLOUTS: WorldCallout[] = [
  { p: [0, TANK.y + 0.9, TANK.z], off: [-300, 190], text: 'Reservoir (tandon)', span: T.calloutTank },
  { p: pointAt(MAIN, MAIN_LEN * 0.32), off: [60, -170], text: 'Pipa besar', span: T.calloutBig },
  { p: pointAt(DIST, DIST_LEN * 0.6), off: [60, 150], text: 'Pipa kecil ke rumah', span: T.calloutSmall },
  { p: pointAt(MAIN, GATE_S + 0.6), off: [-120, 210], text: 'Pipa kosong', span: T.calloutEmpty, variant: 'problem' },
  { p: pointAt(DIST, DIST_LEN * 0.5), off: [-60, 170], text: 'Mirip selang taman', span: T.calloutHose },
  { p: [HUMP[0], HUMP[1] + 0.06, HUMP[2]], off: [80, 230], text: 'Angin terjebak', span: T.calloutAir, variant: 'problem' },
  { p: AIR_VALVE_TOP, off: [-330, -120], text: 'Katup udara', span: T.calloutValve },
  { p: [HUMP[0], HUMP[1] - 0.1, HUMP[2] + 0.2], off: [140, 240], text: 'Tanpa ini: air nyendat', span: T.calloutNoValve, variant: 'problem' },
  { p: GAUGE_POS, off: [-320, -230], text: 'Dorongan air', span: T.calloutPush },
  { p: [SPOUT_TIP[0], SPOUT_TIP[1] - 0.14, SPOUT_TIP[2]], off: [-260, 300], text: 'Air sampai ke keran', span: T.calloutTap, variant: 'solution' },
];
const SIZE = 28;
const pillWidth = (t: string) => t.length * SIZE * 0.74 + SIZE * 1.6;

const ScreenCallouts: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    {CALLOUTS.map((c, i) => {
      const [s, e] = c.span;
      if (frame < s || frame > e + 8) return null;
      const a = proj(c.p, frame);
      // pill di kanan label bila label di kanan jangkar, di kiri bila sebaliknya (lihat CalloutPill)
      const w = pillWidth(c.text);
      let lx = a[0] + c.off[0];
      lx = lx >= a[0] ? Math.max(a[0] + 1, Math.min(lx, SAFE.right - w)) : Math.min(a[0] - 1, Math.max(lx, 48 + w));
      const l: [number, number] = [lx, Math.max(SAFE.top + 340, Math.min(1320, a[1] + c.off[1]))];
      return <CalloutPill key={i} stylePreset={STYLE} anchor={a} label={l} text={c.text} start={s} end={e} variant={c.variant} size={SIZE} />;
    })}
  </>
);

/* ---------------- panah alur (arah = gerak nyata) ---------------- */
const sample = (path: V3[], s0: number, s1: number, n = 18): V3[] => Array.from({ length: n + 1 }, (_, i) => pointAt(path, s0 + ((s1 - s0) * i) / n));
/** Busur di layar mengelilingi roda katup. dir 1 = searah jarum jam (menutup), -1 = berlawanan (membuka) */
const wheelArc = (f: number, dir: 1 | -1): [number, number][] => {
  const [cx, cy] = proj(WHEEL, f);
  const r = 92;
  const a0 = dir === 1 ? -2.4 : 0.6;
  return Array.from({ length: 25 }, (_, i) => {
    const a = a0 + dir * (i / 24) * 4.0;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.62] as [number, number];
  });
};

const Arrows: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame;
  const fadeS3 = ip(f, [T.calloutSmall[1], T.calloutSmall[1] + 8], [1, 0]);
  const mainPts = sample(MAIN, 0.2, MAIN_LEN - 0.1).map((p) => proj(p, f));
  const distPts = sample(DIST, 0.1, DIST_LEN - 0.2).map((p) => proj(p, f));
  // muka air saat mengisi: panah dari katup ke muka air
  const front = f < T.fillDist[0] ? sample(MAIN, GATE_S + 0.2, Math.max(GATE_S + 0.25, mainSeg(f)[1])) : [...sample(MAIN, GATE_S + 0.2, MAIN_LEN, 12), ...sample(DIST, 0.05, Math.max(0.1, distSeg(f)[1]), 10)];
  const fillOp = ip(f, [T.fillMain[0], T.fillMain[0] + 6], [0, 1]) * ip(f, [T.fillDist[1], T.fillDist[1] + 8], [1, 0]);
  const upPts: [number, number][] = [proj([HUMP[0], HUMP[1] + 0.1, HUMP[2]], f), proj([AIR_VALVE_TOP[0], AIR_VALVE_TOP[1] + 0.45, AIR_VALVE_TOP[2]], f)];
  const blue = STYLE.palette.accentSecondary;
  return (
    <>
      {f >= T.arrowMain[0] && f <= T.calloutSmall[1] + 8 ? <FlowArrow stylePreset={STYLE} points={mainPts} progress={ip(f, T.arrowMain, [0, 1])} color={blue} opacity={fadeS3} /> : null}
      {f >= T.arrowDist[0] && f <= T.calloutSmall[1] + 8 ? <FlowArrow stylePreset={STYLE} points={distPts} progress={ip(f, T.arrowDist, [0, 1])} color={blue} opacity={fadeS3} /> : null}
      {f >= T.valveClose[0] && f <= T.recedeMain[0] + 8 ? (
        <FlowArrow stylePreset={STYLE} points={wheelArc(f, 1)} progress={1 - valveOpenAt(f)} color={BEDAH_SEMANTIC.problem} width={7} opacity={ip(f, [T.recedeMain[0], T.recedeMain[0] + 8], [1, 0])} />
      ) : null}
      {f >= T.valveOpen[0] && f <= T.camValveToO[0] ? (
        <FlowArrow stylePreset={STYLE} points={wheelArc(f, -1)} progress={valveOpenAt(f)} color={BEDAH_SEMANTIC.solution} width={7} opacity={ip(f, [T.camValveToO[0] - 8, T.camValveToO[0]], [1, 0])} />
      ) : null}
      {fillOp > 0 ? <FlowArrow stylePreset={STYLE} points={front.map((p) => proj(p, f))} progress={1} color={blue} opacity={fillOp} /> : null}
      {f >= T.arrowUp[0] && f <= T.calloutValve[1] + 8 ? (
        <FlowArrow stylePreset={STYLE} points={upPts} progress={ip(f, T.arrowUp, [0, 1])} color={blue} width={7} opacity={ip(f, [T.calloutValve[1], T.calloutValve[1] + 8], [1, 0])} />
      ) : null}
    </>
  );
};

/* ---------------- beat "Kita bedah." ---------------- */
const BedahBeat: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < T.title - 2 || frame > T.titleOut[1]) return null;
  const enter = springAt(frame, T.title, 30, SPRING_PRESETS.editorialSettle);
  const exit = ip(frame, T.titleOut, [1, 0]);
  const line = ip(frame, T.titleLine, [0, 1], easeOutExpo);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: exit, paddingRight: 1080 - SAFE.right - 40 }}>
      <div style={{ transform: `scale(${0.86 + enter * 0.14})`, opacity: enter, textAlign: 'center' }}>
        <div style={{ fontFamily: STYLE.typography.heading, fontWeight: 800, fontSize: 140, letterSpacing: '-0.03em', color: INK, lineHeight: 1 }}>Kita bedah.</div>
        <svg width={600} height={30} style={{ display: 'block', margin: '10px auto 0' }}>
          <line x1={10} y1={15} x2={10 + 580 * line} y2={15} stroke={STYLE.palette.accent} strokeWidth={14} strokeLinecap="round" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- rekap 4 faktor (muncul sesuai kata) ---------------- */
const Recap: React.FC<{ frame: number }> = ({ frame }) => {
  const [c0, c1] = T.recapCard;
  if (frame < c0 || frame > c1 + 10) return null;
  const its = T.recapItems;
  let focus: number | undefined;
  for (let i = 0; i < its.length; i++) if (frame >= its[i] && frame < (its[i + 1] ?? c1)) focus = i;
  return (
    <InfoCard stylePreset={STYLE} start={c0} end={c1} eyebrow="Waktu pulih tiap daerah" title="Tiap daerah beda waktunya" left={80} top={640} width={840}>
      <div style={{ position: 'relative', height: 330 }}>
        <BedahRecapList
          stylePreset={STYLE}
          start={its[0]}
          stagger={its[1] - its[0]}
          left={0}
          top={10}
          focusIndex={focus}
          items={[{ text: 'Tinggi rendahnya' }, { text: 'Jauh dekatnya' }, { text: 'Besar pipanya' }, { text: 'Angin terjebak', variant: 'problem' }]}
        />
      </div>
    </InfoCard>
  );
};

/* ---------------- ponsel Tiray (data dummy) + kontak resmi ---------------- */
const TirayPhone: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < T.phoneIn || frame > T.phoneOut[1]) return null;
  const enter = springAt(frame, T.phoneIn, 30, SPRING_PRESETS.editorialSettle);
  const exit = ip(frame, T.phoneOut, [1, 0]);
  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 560,
          width: 400,
          height: 870,
          borderRadius: 56,
          backgroundColor: INK,
          padding: 14,
          boxShadow: BEDAH_SEMANTIC.cardShadow,
          transform: `translateY(${(1 - enter) * 140}px)`,
          opacity: enter,
        }}
      >
        <Img src={staticFile('ui/09_info-gangguan.png')} style={{ width: 372, height: 842, borderRadius: 42, display: 'block', objectFit: 'cover' }} />
      </div>
      <CalloutPill stylePreset={STYLE} anchor={[450, 640]} label={[560, 700]} text="Info gangguan" start={T.calloutInfo[0]} end={T.calloutInfo[1]} size={SIZE} />
      <InfoCard stylePreset={STYLE} start={T.waCard[0]} end={T.waCard[1]} eyebrow="WhatsApp Tirta Ayu" left={520} top={900} width={420}>
        <div style={{ fontWeight: 800, fontSize: 38, color: STYLE.palette.accentSecondary, whiteSpace: 'nowrap' }}>0877 3055 0300</div>
        <div style={{ marginTop: 10, fontWeight: 700, fontSize: 30, color: INK }}>tirtaayu.co.id</div>
      </InfoCard>
    </AbsoluteFill>
  );
};

/* ---------------- SFX terikat animasi ---------------- */
const SFX: [number, string, number][] = [
  [T.drips[0][2], 'o3', 0.5],
  [T.drips[1][2], 'o3', 0.5],
  [T.grayIn[0], 'transition-whoosh-soft', 0.4],
  [T.title, 'impact-soft', 0.45],
  [T.cut[0], 'transition-whoosh-soft', 0.35],
  [T.camToTank[0], 'transition-whoosh-soft', 0.22],
  [T.calloutTank[0], 'pop-in', 0.4],
  [T.calloutBig[0], 'pop-in', 0.4],
  [T.calloutSmall[0], 'pop-in', 0.4],
  [T.camToValve[0], 'transition-whoosh-soft', 0.22],
  [T.valveClose[0], 'm3', 0.5],
  [T.badgeClosed, 'm2', 0.5],
  [T.calloutEmpty[0], 'pop-in', 0.35],
  [T.valveOpen[0], 'm3', 0.5],
  [T.valveOpen[1], 'm2', 0.5],
  [T.fillDist[1], 'confirm-chime', 0.35],
  [T.calloutHose[0], 'pop-in', 0.35],
  [T.camToHump[0], 'transition-whoosh-soft', 0.22],
  [T.calloutAir[0], 'pop-in', 0.35],
  [T.bubbleEscape + 10, 'pop-plop', 0.32],
  [T.bubbleEscape + 24, 'pop-plop', 0.32],
  [T.bubbleEscape + 38, 'pop-plop', 0.32],
  [T.calloutValve[0], 'pop-in', 0.35],
  [T.calloutNoValve[0], 'impact-soft', 0.4],
  [T.camToGauge[0], 'transition-whoosh-soft', 0.22],
  [T.calloutPush[0], 'pop-in', 0.35],
  [T.pressureUp[1], 'confirm-glass', 0.35],
  [T.tapFlow[0], 'o3', 0.5],
  [T.recapCard[0], 'pop-in', 0.35],
  ...T.recapItems.map((f) => [f, 'pop-in', 0.35] as [number, string, number]),
  [T.phoneIn, 'transition-maximize', 0.4],
  [T.calloutInfo[0], 'pop-in', 0.35],
  [T.waCard[0], 'pop-in', 0.35],
];

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const gray = ip(frame, T.grayIn, [0, 1]) * ip(frame, T.camToO1, [1, 0]);
  const worldOpacity = ip(frame, T.worldDim, [1, 0.16]) * ip(frame, T.worldOut, [1, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: STYLE.palette.bg }}>
      <AudioStage narrationSrc="audio/narration-v4.mp3" musicSrc="audio/music-v3.wav" sfxTrackSrc="" words={WORDS} baseMusicVolume={0.42} />
      {SFX.map(([f, name, v], i) => (
        <Sequence key={i} from={f} durationInFrames={90}>
          <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
      <Sequence from={T.fillMain[0]} durationInFrames={T.fillDist[1] - T.fillMain[0]}>
        <Audio src={staticFile('audio/sfx/progress-loop.wav')} volume={0.18} loop />
      </Sequence>

      {worldOpacity > 0.001 ? (
        <AbsoluteFill style={{ opacity: worldOpacity, filter: gray > 0.01 ? `grayscale(${gray}) brightness(${1 + gray * 0.06})` : undefined }}>
          <BedahStage width={1080} height={1920} camera={CAM3D} frame={frame} bg={STYLE.palette.bg} set="floor" fog={[20, 48]}>
            <World3D frame={frame} />
          </BedahStage>
        </AbsoluteFill>
      ) : null}
      {gray > 0.01 ? <AbsoluteFill style={{ backgroundColor: STYLE.palette.bg, opacity: gray * 0.55 }} /> : null}

      <Arrows frame={frame} />
      <ScreenCallouts frame={frame} />
      <BedahBeat frame={frame} />
      <Recap frame={frame} />
      <TirayPhone frame={frame} />
      <Header frame={frame} />
      <KaraokePillCaption words={WORDS} stylePreset={STYLE} fontSize={44} bottomOffset={422} maxWordsPerLine={4} />
    </AbsoluteFill>
  );
};

