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
  BedahVariant,
  CalloutPill,
  InfoCard,
  KaraokePillCaption,
  LiveCounter,
  StatusBadge,
} from './antislop/components/BedahOverlay';
import { WordItem } from './antislop/components/KineticWords';
import { getStyleById } from './antislop/theme/styles-catalog';
import { easeOutExpo, ip, springAt, SPRING_PRESETS } from './antislop/theme/easing-and-timing';
import { CAM3D, COUPLING, GAUGE_POS, HOUSE, SPOUT_TIP, TANK, V3 } from './layout3d';
import { World3D } from './World3D';
import wordsJson from '../public/words.json';

loadPoppins('normal', { weights: ['500', '600', '700', '800'], subsets: ['latin'] });
loadMono('normal', { weights: ['700'], subsets: ['latin'] });

const STYLE = getStyleById(44);
const INK = '#16243B';
const WORDS = wordsJson as WordItem[];
export const TOTAL_FRAMES = 1885;

/* ---------------- header per babak ---------------- */
interface Chapter {
  from: number;
  to: number;
  before?: string;
  keyword: string;
  after?: string;
  sub: string;
  keywordColor?: string;
  badge?: { text: string; variant?: BedahVariant; start?: number };
  counter?: { label: string; start: number; end: number };
}
const CHAPTERS: Chapter[] = [
  { from: 0, to: 165, before: 'Pipa sudah beres,', keyword: 'air belum ngalir?', keywordColor: BEDAH_SEMANTIC.problem, sub: 'Info gangguan air', badge: { text: 'Ilustrasi' } },
  { from: 215, to: 490, before: 'Air mengalir karena', keyword: 'gravitasi', sub: 'Dari tempat tinggi ke rendah', badge: { text: 'Ilustrasi' } },
  { from: 490, to: 615, before: 'Pipa diperbaiki,', keyword: 'aliran ditutup', keywordColor: BEDAH_SEMANTIC.problem, sub: 'Pipa jadi kosong', badge: { text: 'Aliran ditutup', variant: 'problem', start: 549 } },
  { from: 615, to: 820, before: 'Katup dibuka,', keyword: 'pipa terisi', sub: 'Pipa utama dulu, lalu distribusi', badge: { text: 'Katup dibuka', variant: 'solution', start: 636 }, counter: { label: 'Jaringan terisi', start: 640, end: 806 } },
  { from: 820, to: 1065, before: 'Udara', keyword: 'terjebak', after: 'harus keluar', sub: 'Dibuang lewat katup udara', badge: { text: 'Gelembung diperbesar', variant: 'time', start: 834 } },
  { from: 1065, to: 1220, before: 'Tekanan', keyword: 'pulih,', after: 'air keluar', keywordColor: BEDAH_SEMANTIC.solution, sub: 'Manometer dan keran pelanggan', badge: { text: 'Diperbesar', variant: 'time', start: 1072 }, counter: { label: 'Tekanan pulih', start: 1090, end: 1150 } },
  { from: 1220, to: 1445, before: 'Kenapa waktunya', keyword: 'beda-beda?', sub: '4 faktor waktu pemulihan' },
  { from: 1445, to: 1520, before: 'Jadi', keyword: 'sabar sebentar,', after: 'ya', sub: 'Air mengalir bertahap', badge: { text: 'Ilustrasi' } },
  { from: 1520, to: 1670, before: 'Cek info gangguan di', keyword: 'Tiray', sub: 'Kanal resmi Perumda Tirta Ayu', badge: { text: 'Tiray Mobile Apps', start: 1579 } },
];

const Header: React.FC<{ frame: number }> = ({ frame }) => {
  const ch = CHAPTERS.find((c) => frame >= c.from && frame < c.to);
  if (!ch) return null;
  const exit = ip(frame, [ch.to - 6, ch.to], [1, 0]);
  const needsExit = ch.to === 165 || ch.to === 1670;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: needsExit ? exit : 1 }}>
      <BedahHeader
        key={ch.from}
        stylePreset={STYLE}
        before={ch.before}
        keyword={ch.keyword}
        after={ch.after}
        keywordColor={ch.keywordColor}
        subLabel={ch.sub}
        start={ch.from}
        titleSize={70}
        watermark={<Img src={staticFile('brand/lambang-warna.svg')} style={{ height: 88, width: 'auto' }} />}
        right={ch.badge ? <StatusBadge stylePreset={STYLE} text={ch.badge.text} variant={ch.badge.variant} start={ch.badge.start ?? ch.from + 8} /> : undefined}
        data={
          ch.counter ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
              <span style={{ fontFamily: STYLE.typography.mono, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em', textTransform: 'uppercase', color: STYLE.palette.muted }}>
                {ch.counter.label}
              </span>
              <LiveCounter stylePreset={STYLE} from={0} to={100} start={ch.counter.start} end={ch.counter.end} suffix="%" size={58} />
              <span style={{ fontFamily: STYLE.typography.mono, fontWeight: 700, fontSize: 18, letterSpacing: '0.12em', color: STYLE.palette.muted }}>
                ILUSTRASI
              </span>
            </div>
          ) : undefined
        }
      />
    </div>
  );
};

/* ---------------- callout berjangkar titik 3D, label digeser di layar ---------------- */
interface WorldCallout {
  p: V3;
  off: [number, number];
  text: string;
  start: number;
  end: number;
  variant?: BedahVariant;
  size?: number;
}
const WHEEL: V3 = [0, 3.31, -4.3];
const CALLOUTS: WorldCallout[] = [
  { p: [SPOUT_TIP[0], SPOUT_TIP[1] - 0.03, SPOUT_TIP[2]], off: [150, 170], text: 'Air belum keluar', start: 118, end: 158, variant: 'problem' },
  { p: [0, TANK.y + 0.9, TANK.z], off: [-250, 150], text: 'Reservoir', start: 296, end: 444 },
  { p: COUPLING, off: [-260, 60], text: 'Pipa transmisi', start: 351, end: 488 },
  { p: [0, 0.36, 3.2], off: [110, 110], text: 'Jaringan distribusi', start: 387, end: 488 },
  { p: [HOUSE.x, HOUSE.h + 0.42, HOUSE.z], off: [260, -150], text: 'Pelanggan', start: 450, end: 488 },
  { p: COUPLING, off: [240, 110], text: 'Titik perbaikan', start: 508, end: 612 },
  { p: WHEEL, off: [-280, 120], text: 'Katup ditutup', start: 549, end: 626, variant: 'problem' },
  { p: WHEEL, off: [-280, 120], text: 'Katup dibuka', start: 636, end: 700, variant: 'solution' },
  { p: [0, 0.36, 2.6], off: [-330, 90], text: 'Pipa distribusi', start: 735, end: 812 },
  { p: [0, 1.6, -1.45], off: [230, 180], text: 'Udara terjebak', start: 866, end: 918, variant: 'problem' },
  { p: [0, 2.15, -1.45], off: [250, -60], text: 'Katup udara', start: 924, end: 1058 },
  { p: [0, 1.31, -1.23], off: [70, 170], text: 'Tanpa ini: aliran tersendat', start: 990, end: 1058, variant: 'problem', size: 26 },
  { p: GAUGE_POS, off: [220, -200], text: 'Manometer', start: 1098, end: 1140 },
  { p: [SPOUT_TIP[0], SPOUT_TIP[1] - 0.14, SPOUT_TIP[2]], off: [40, 300], text: 'Air sampai ke keran', start: 1180, end: 1214, variant: 'solution' },
];

const ScreenCallouts: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    {CALLOUTS.map((c, i) => {
      if (frame < c.start - 2 || frame > c.end + 12) return null;
      const a = projectToScreen(c.p, frame, CAM3D, 1080, 1920);
      const l: [number, number] = [Math.max(40, Math.min(1040, a[0] + c.off[0])), a[1] + c.off[1]];
      return <CalloutPill key={i} stylePreset={STYLE} anchor={a} label={l} text={c.text} start={c.start} end={c.end} variant={c.variant} size={c.size ?? 28} />;
    })}
  </>
);

/* ---------------- beat "Kita bedah." ---------------- */
const BedahBeat: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < 160 || frame > 224) return null;
  const { fps } = { fps: 30 };
  const enter = springAt(frame, 168, fps, SPRING_PRESETS.editorialSettle);
  const exit = ip(frame, [208, 220], [1, 0]);
  const line = ip(frame, [178, 192], [0, 1], easeOutExpo);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: exit }}>
      <div style={{ transform: `scale(${0.86 + enter * 0.14})`, opacity: enter, textAlign: 'center' }}>
        <div style={{ fontFamily: STYLE.typography.heading, fontWeight: 800, fontSize: 150, letterSpacing: '-0.03em', color: INK, lineHeight: 1 }}>
          Kita bedah.
        </div>
        <svg width={620} height={30} style={{ display: 'block', margin: '10px auto 0' }}>
          <line x1={10} y1={15} x2={10 + 600 * line} y2={15} stroke={STYLE.palette.accent} strokeWidth={14} strokeLinecap="round" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- rekap 4 faktor ---------------- */
const Recap: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < 1226 || frame > 1452) return null;
  let focus: number | undefined;
  if (frame >= 1290 && frame < 1321) focus = 0;
  else if (frame >= 1321 && frame < 1357) focus = 1;
  else if (frame >= 1357 && frame < 1393) focus = 2;
  else if (frame >= 1393 && frame < 1430) focus = 3;
  return (
    <InfoCard stylePreset={STYLE} start={1228} end={1440} eyebrow="Faktor waktu pemulihan" title="Tiap wilayah beda waktunya" left={90} top={520} width={900}>
      <div style={{ position: 'relative', height: 330 }}>
        <BedahRecapList
          stylePreset={STYLE}
          start={1290}
          stagger={33}
          left={0}
          top={10}
          focusIndex={focus}
          items={[
            { text: 'Ketinggian wilayah' },
            { text: 'Jarak dari sumber air' },
            { text: 'Ukuran diameter pipa' },
            { text: 'Udara terjebak di pipa', variant: 'problem' },
          ]}
        />
      </div>
    </InfoCard>
  );
};

/* ---------------- ponsel Tiray + kontak ---------------- */
const TirayPhone: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < 1520 || frame > 1680) return null;
  const enter = springAt(frame, 1528, 30, SPRING_PRESETS.editorialSettle);
  const exit = ip(frame, [1664, 1674], [1, 0]);
  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 470,
          width: 420,
          height: 914,
          borderRadius: 58,
          backgroundColor: INK,
          padding: 14,
          boxShadow: BEDAH_SEMANTIC.cardShadow,
          transform: `translateY(${(1 - enter) * 140}px) rotate(${(1 - enter) * -4}deg)`,
          opacity: enter,
        }}
      >
        <Img src={staticFile('ui/09_info-gangguan.png')} style={{ width: 392, height: 871, borderRadius: 44, display: 'block' }} />
      </div>
      <CalloutPill stylePreset={STYLE} anchor={[480, 538]} label={[640, 538]} text="Info gangguan" start={1546} end={1664} variant="neutral" size={28} />
      <InfoCard stylePreset={STYLE} start={1620} end={1664} eyebrow="Kanal resmi" left={548} top={780} width={452}>
        <div style={{ fontFamily: STYLE.typography.mono, fontWeight: 700, fontSize: 22, letterSpacing: '0.12em', color: STYLE.palette.muted }}>WHATSAPP</div>
        <div style={{ fontWeight: 800, fontSize: 38, color: STYLE.palette.accentSecondary, whiteSpace: 'nowrap' }}>0877 3055 0300</div>
        <div style={{ marginTop: 22, fontFamily: STYLE.typography.mono, fontWeight: 700, fontSize: 22, letterSpacing: '0.12em', color: STYLE.palette.muted }}>WEBSITE</div>
        <div style={{ fontWeight: 700, fontSize: 34, color: INK }}>tirtaayu.co.id</div>
      </InfoCard>
    </AbsoluteFill>
  );
};

/* ---------------- tagar + end card ---------------- */
const Hashtag: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < 1666) return null;
  const bgIn = ip(frame, [1666, 1676], [0, 1]);
  const enter = springAt(frame, 1676, 30, SPRING_PRESETS.editorialSettle);
  const toEnd = ip(frame, [1722, 1734], [0, 1]);
  const logoIn = springAt(frame, 1730, 30, SPRING_PRESETS.editorialSettle);
  const fadeOut = ip(frame, [TOTAL_FRAMES - 14, TOTAL_FRAMES - 1], [1, 0]);
  return (
    <AbsoluteFill style={{ backgroundColor: STYLE.palette.bg, opacity: bgIn }}>
      <AbsoluteFill style={{ backgroundColor: '#FFFFFF', opacity: toEnd }} />
      {/* tagar besar */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 - toEnd }}>
        <div
          style={{
            fontFamily: STYLE.typography.heading,
            fontWeight: 800,
            fontSize: 112,
            letterSpacing: '-0.02em',
            color: STYLE.palette.accentSecondary,
            transform: `translateY(${(1 - enter) * 60}px)`,
            opacity: enter,
            marginTop: -120,
          }}
        >
          #YuhBukaTiray
        </div>
      </AbsoluteFill>
      {/* end card */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: toEnd * fadeOut }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -160, opacity: logoIn, transform: `scale(${0.94 + logoIn * 0.06})` }}>
          <Img src={staticFile('brand/logo-vertikal-warna.svg')} style={{ width: 500, height: 'auto' }} />
          <div style={{ marginTop: 70, fontFamily: STYLE.typography.heading, fontWeight: 800, fontSize: 56, color: STYLE.palette.accentSecondary }}>
            #YuhBukaTiray
          </div>
          <div style={{ marginTop: 14, fontFamily: STYLE.typography.mono, fontWeight: 700, fontSize: 24, letterSpacing: '0.14em', color: STYLE.palette.muted }}>
            TIRAY MOBILE APPS
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- SFX terikat animasi ---------------- */
const SFX: [number, string, number][] = [
  [47, 'o3', 0.5],
  [115, 'o3', 0.5],
  [118, 'pop-in', 0.35],
  [160, 'transition-whoosh-soft', 0.5],
  [170, 'impact-soft', 0.45],
  [296, 'pop-in', 0.4],
  [351, 'pop-in', 0.4],
  [387, 'pop-in', 0.4],
  [450, 'pop-in', 0.4],
  [498, 'transition-whoosh-soft', 0.3],
  [538, 'm3', 0.5],
  [560, 'm2', 0.5],
  [632, 'm3', 0.5],
  [664, 'm2', 0.5],
  [806, 'confirm-chime', 0.35],
  [820, 'transition-whoosh-soft', 0.3],
  [866, 'pop-in', 0.3],
  [936, 'pop-plop', 0.32],
  [950, 'pop-plop', 0.32],
  [964, 'pop-plop', 0.32],
  [990, 'impact-soft', 0.4],
  [1064, 'transition-whoosh-soft', 0.3],
  [1150, 'confirm-glass', 0.35],
  [1170, 'o3', 0.5],
  [1220, 'transition-whoosh-soft', 0.3],
  [1290, 'pop-in', 0.35],
  [1323, 'pop-in', 0.35],
  [1356, 'pop-in', 0.35],
  [1389, 'pop-in', 0.35],
  [1528, 'transition-maximize', 0.4],
  [1620, 'pop-in', 0.35],
  [1676, 'impact-soft', 0.45],
  [1730, 'confirm-glass', 0.4],
];

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const gray = ip(frame, [160, 172], [0, 1]) * ip(frame, [204, 218], [1, 0]);
  const worldDim = ip(frame, [1222, 1240], [1, 0.16]) * 1;
  const worldBack = ip(frame, [1436, 1456], [0, 1]);
  const worldOpacity = (frame < 1436 ? worldDim : 0.16 + 0.84 * worldBack) * ip(frame, [1512, 1530], [1, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: STYLE.palette.bg }}>
      <AudioStage narrationSrc="audio/narration.mp3" sfxTrackSrc="" words={WORDS} baseMusicVolume={0.42} />
      {SFX.map(([f, name, v], i) => (
        <Sequence key={i} from={f} durationInFrames={90}>
          <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
      <Sequence from={640} durationInFrames={166}>
        <Audio src={staticFile('audio/sfx/progress-loop.wav')} volume={0.18} loop />
      </Sequence>

      {/* diorama 3D dalam kamera */}
      <AbsoluteFill style={{ opacity: worldOpacity, filter: gray > 0.01 ? `grayscale(${gray}) brightness(${1 + gray * 0.06})` : undefined }}>
        <BedahStage width={1080} height={1920} camera={CAM3D} frame={frame} bg={STYLE.palette.bg} set="floor" fog={[20, 48]}>
          <World3D frame={frame} />
        </BedahStage>
      </AbsoluteFill>
      {gray > 0.01 ? <AbsoluteFill style={{ backgroundColor: STYLE.palette.bg, opacity: gray * 0.55 }} /> : null}

      <ScreenCallouts frame={frame} />
      <BedahBeat frame={frame} />
      <Recap frame={frame} />
      <TirayPhone frame={frame} />
      <Header frame={frame} />
      <Hashtag frame={frame} />
      <KaraokePillCaption words={WORDS} stylePreset={STYLE} fontSize={50} bottomOffset={200} maxWordsPerLine={3} />
    </AbsoluteFill>
  );
};
