import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile } from 'remotion';
import { SeamlessSceneShell, SfxCue } from './antislop/components/Transitions';
import { wordStarts } from './kit';
import {
  S1, S1_STAGGER, S1_TEXT, S1_WORD_START, S2, S2_FAN_AT, S3, S3_SWITCH, S3_TAP, S4, S4_TUNTAS, S5, S5_DROP,
  S6, S6_DIALOG, S6_STEPS, S7, S7_CARDS_AT, S7_SHEET, S8, S8_PUNCH, S9, S9_BADGE,
} from './scenes';
import { B, C, TOTAL_FRAMES } from './theme';

const O = 5; // setengah overlap transisi (overlapFrames = 10)

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <Audio
        src={staticFile('audio/music.wav')}
        volume={(f) =>
          interpolate(f, [0, 12, TOTAL_FRAMES - 45, TOTAL_FRAMES - 1], [0, 0.55, 0.55, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      <SeamlessSceneShell startFrame={B[0]} endFrame={B[1] + O} exitMode="portal-zoom-in" background={C.white}>
        <S1 />
      </SeamlessSceneShell>
      <SeamlessSceneShell startFrame={B[1] - O} endFrame={B[2] + O} enterMode="portal-zoom-in" exitMode="whip-glide-up" background={C.white}>
        <S2 />
      </SeamlessSceneShell>
      <SeamlessSceneShell startFrame={B[2] - O} endFrame={B[3] + O} enterMode="whip-glide-up" exitMode="whip-glide-left" background={C.white}>
        <S3 />
      </SeamlessSceneShell>
      <SeamlessSceneShell startFrame={B[3] - O} endFrame={B[4] + O} enterMode="whip-glide-left" exitMode="whip-glide-up" background={C.white}>
        <S4 />
      </SeamlessSceneShell>
      <SeamlessSceneShell startFrame={B[4] - O} endFrame={B[5] + O} enterMode="whip-glide-up" exitMode="whip-glide-left" background={C.blue}>
        <S5 />
      </SeamlessSceneShell>
      <SeamlessSceneShell startFrame={B[5] - O} endFrame={B[6] + O} enterMode="whip-glide-left" exitMode="portal-zoom-in" background={C.white}>
        <S6 />
      </SeamlessSceneShell>
      <SeamlessSceneShell startFrame={B[6] - O} endFrame={B[7] + 16} enterMode="portal-zoom-in" exitMode="none" background={C.blue}>
        <S7 />
      </SeamlessSceneShell>
      <SeamlessSceneShell startFrame={B[7] - O} endFrame={B[8]} enterMode="spring-sheet-up" exitMode="none" background={C.white}>
        <S8 />
      </SeamlessSceneShell>
      <SeamlessSceneShell startFrame={B[8]} endFrame={B[9]} background={C.white}>
        <S9 />
      </SeamlessSceneShell>

      {/* ---- SFX terikat animasi ---- */}
      {/* S1 */}
      <SfxCue frame={B[0] + 1} sfx="pop-in" volume={0.5} />
      <SfxCue frame={B[0] + 24} sfx="pop-plop" volume={0.45} />
      {wordStarts(S1_TEXT, B[0] + S1_WORD_START, S1_STAGGER).map((fr) => (
        <SfxCue key={`t${fr}`} frame={fr} sfx="tick" volume={0.35} durationInFrames={12} />
      ))}
      {/* S2 */}
      <SfxCue frame={B[1] + 20} sfx="transition-maximize" volume={0.42} />
      {S2_FAN_AT.map((a) => (
        <SfxCue key={`f${a}`} frame={B[1] + a} sfx="pop-pluck" volume={0.38} durationInFrames={18} />
      ))}
      {/* S3 */}
      <SfxCue frame={B[2] + 2} sfx="impact-soft" volume={0.5} />
      <SfxCue frame={B[2] + S3_TAP} sfx="click" volume={0.55} durationInFrames={12} />
      <SfxCue frame={B[2] + S3_SWITCH} sfx="transition-swipe" volume={0.35} />
      {/* S4 */}
      <SfxCue frame={B[3] + 2} sfx="impact-soft" volume={0.5} />
      <SfxCue frame={B[3] + 108} sfx="click-soft" volume={0.4} durationInFrames={12} />
      <SfxCue frame={B[3] + S4_TUNTAS} sfx="confirm-chime" volume={0.45} durationInFrames={40} />
      {/* S5 */}
      <SfxCue frame={B[4] + 2} sfx="impact-soft" volume={0.5} />
      {S5_DROP.map((a) => (
        <SfxCue key={`d${a}`} frame={B[4] + a + 4} sfx="pop-drop" volume={0.42} durationInFrames={18} />
      ))}
      {/* S6 */}
      <SfxCue frame={B[5] + 2} sfx="impact-soft" volume={0.5} />
      {S6_STEPS.map((a) => (
        <SfxCue key={`s${a}`} frame={B[5] + a} sfx="tick" volume={0.4} durationInFrames={12} />
      ))}
      <SfxCue frame={B[5] + S6_DIALOG} sfx="confirm-glass" volume={0.45} durationInFrames={45} />
      {/* S7 */}
      <SfxCue frame={B[6] + S7_SHEET} sfx="transition-swoosh" volume={0.4} />
      {S7_CARDS_AT.map((a) => (
        <SfxCue key={`c${a}`} frame={B[6] + a} sfx="pop-in" volume={0.36} durationInFrames={18} />
      ))}
      <SfxCue frame={B[7] - O} sfx="transition-maximize" volume={0.42} />
      {/* S8 */}
      <SfxCue frame={B[7] + S8_PUNCH} sfx="impact-punch" volume={0.5} />
      <SfxCue frame={B[8] - 1} sfx="transition-chop" volume={0.4} durationInFrames={15} />
      {/* S9 */}
      <SfxCue frame={B[8] + 4} sfx="ding-bell" volume={0.45} durationInFrames={60} />
      <SfxCue frame={B[8] + S9_BADGE} sfx="pop-in" volume={0.38} durationInFrames={18} />
    </AbsoluteFill>
  );
};
