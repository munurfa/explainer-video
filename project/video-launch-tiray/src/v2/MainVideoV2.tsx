import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { SfxCue, StudioSfxName } from '../antislop/components/Transitions';
import { ip } from '../antislop/theme/easing-and-timing';
import { C } from '../theme';
import { CornerLogo, Gate } from './kit2';
import { S1, S2, S2_FAN, S3, S3_CARI, S3_KEYS, S3_TAP } from './scenesA';
import { S4, S4_BADGE, S4_CARDS, S4_POPS, S5, S5_DROPS, S6, S6_DIALOG, S6_STEPS } from './scenesB';
import { S7, S7_CARD_FRAMES, S8, S8_PUNCH, S8_YUH, S9, S9_BADGE } from './scenesC';
import { B2, TOTAL_V2 } from './timing';

type Cue = [number, StudioSfxName, number, number?];

const CUES: Cue[] = [
  // S1
  [1, 'hover-rollover', 0.35],
  [18, 'pop-plop', 0.45],
  [24, 'pop-in', 0.4],
  [40, 'transition-swipe', 0.3],
  [60, 'tick', 0.35, 12],
  [66, 'tick', 0.35, 12],
  [96, 'transition-whoosh-soft', 0.42],
  // S2
  [120, 'transition-maximize', 0.38],
  [140, 'pop', 0.3, 12],
  [146, 'transition-swipe', 0.28],
  [156, 'pop-pluck', 0.32, 18],
  ...[0, 1, 2, 3, 4, 5].map((i): Cue => [160 + i * 4, 'tick-soft', 0.3, 10]),
  [182, 'pop-pluck', 0.3, 18],
  [190, 'tick', 0.35, 12],
  ...S2_FAN.map((a): Cue => [a, 'pop-pluck', 0.34, 18]),
  [255, 'transition-whoosh-soft', 0.42],
  // S3
  [271, 'transition-swoosh', 0.45],
  [300, 'impact-soft', 0.45],
  [320, 'transition-maximize', 0.32],
  ...[334, 339, 344].map((a): Cue => [a, 'tick-soft', 0.3, 10]),
  [362, 'tick', 0.35, 12],
  [S3_TAP, 'click', 0.55, 12],
  [400, 'transition-maximize', 0.35],
  ...S3_KEYS.map((a): Cue => [a, 'click-soft', 0.28, 6]),
  [S3_CARI, 'click', 0.5, 12],
  [S3_CARI + 2, 'confirm-chime', 0.32, 40],
  [443, 'transition-swoosh', 0.42],
  // S4
  [452, 'transition-swoosh', 0.42],
  [480, 'impact-soft', 0.42],
  [496, 'transition-swipe', 0.3],
  ...S4_POPS.map((a): Cue => [a, 'pop-in', 0.38, 18]),
  [S4_BADGE, 'confirm-chime', 0.45, 40],
  ...S4_CARDS.map((a): Cue => [a, 'pop-pluck', 0.3, 18]),
  [619, 'transition-maximize', 0.4],
  // S5
  [650, 'impact-punch', 0.45],
  ...S5_DROPS.map((a): Cue => [a + 4, 'pop-drop', 0.4, 18]),
  [700, 'transition-maximize', 0.3],
  [752, 'transition-whoosh-soft', 0.4],
  // S6
  [782, 'tick', 0.35, 12],
  [788, 'impact-soft', 0.45],
  [807, 'pop', 0.35, 12],
  [818, 'transition-maximize', 0.35],
  ...S6_STEPS.map((a): Cue => [a, 'tick', 0.42, 12]),
  [S6_DIALOG, 'confirm-glass', 0.45, 45],
  // S7
  [930, 'transition-chop', 0.4, 15],
  [957, 'tick', 0.35, 12],
  [965, 'pop-in', 0.38, 18],
  [987, 'transition-swipe', 0.32],
  [1015, 'transition-swoosh', 0.36],
  [1035, 'transition-chop', 0.4, 15],
  ...S7_CARD_FRAMES.map((a): Cue => [a, 'pop', 0.22, 10]),
  [1063, 'transition-swoosh', 0.36],
  [1093, 'transition-swoosh', 0.36],
  // S8
  [1118, 'transition-whoosh-soft', 0.4],
  [S8_YUH, 'transition-swoosh', 0.45],
  [S8_PUNCH, 'impact-punch', 0.5],
  [1200, 'transition-maximize', 0.38],
  // S9
  [1217, 'ding-bell', 0.45, 60],
  [S9_BADGE, 'pop-in', 0.38, 18],
];

const Corner: React.FC = () => {
  const f = useCurrentFrame();
  const onBlue = Math.min(ip(f, [619, 630], [0, 1]), ip(f, [766, 778], [1, 0])) + (f >= 930 && f < 1035 ? 1 : 0);
  const op = Math.min(ip(f, [2, 14], [0, 1]), f < B2[8] ? 1 : 0);
  return <CornerLogo onBlue={Math.min(1, onBlue)} opacity={op} />;
};

export const MainVideoV2: React.FC = () => (
  <AbsoluteFill style={{ background: C.white }}>
    <Audio
      src={staticFile('audio/music.wav')}
      volume={(f) => interpolate(f, [0, 10, TOTAL_V2 - 50, TOTAL_V2 - 1], [0, 0.8, 0.8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
    />
    <Gate from={B2[0]} to={B2[1]}>
      <S1 />
    </Gate>
    <Gate from={B2[1]} to={B2[2]}>
      <S2 />
    </Gate>
    <Gate from={B2[2]} to={B2[3]}>
      <S3 />
    </Gate>
    <Gate from={B2[3]} to={B2[4]}>
      <S4 />
    </Gate>
    <Gate from={B2[4]} to={B2[5]}>
      <S5 />
    </Gate>
    <Gate from={B2[5]} to={B2[6]}>
      <S6 />
    </Gate>
    <Gate from={B2[6]} to={B2[7] + 10}>
      <S7 />
    </Gate>
    <Gate from={B2[7]} to={B2[8]}>
      <S8 />
    </Gate>
    <Gate from={B2[8]} to={B2[9]}>
      <S9 />
    </Gate>
    <Corner />
    {CUES.map(([fr, sfx, vol, dur], i) => (
      <SfxCue key={`${i}-${fr}`} frame={fr} sfx={sfx} volume={vol} durationInFrames={dur ?? 30} />
    ))}
  </AbsoluteFill>
);
