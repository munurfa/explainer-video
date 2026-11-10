import React, { useMemo } from 'react';
import {
  Audio,
  interpolateColors,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { clamp, easeOutExpo, ip } from '../theme/easing-and-timing';
import { MotionStylePreset } from '../theme/styles-catalog';

export type WordHierarchyRole = 'keyword' | 'support' | 'connector';

export interface WordItem {
  text: string;
  startMs: number;
  endMs: number;
  role?: WordHierarchyRole;
  effect?: string;
}

/**
 * 1. BOTTOM SUBTITLE BAR (<BottomSubtitleBar />)
 * - Diletakkan rapi di bagian bawah layar (screen-space, tidak menutupi konten utama di tengah!)
 * - ATURAN ANTI-SLOP: Tanpa background kotak/pill yang tidak perlu pada kata! Teks tampil bersih
 *   dengan text-shadow lembut agar kontras dan nyaman dibaca.
 */
export interface BottomSubtitleBarProps {
  words: WordItem[];
  stylePreset: MotionStylePreset;
  sceneStartOffsetMs?: number;
  fontSize?: number;
  bottomOffset?: number;
  maxWordsPerLine?: number;
}

export const BottomSubtitleBar: React.FC<BottomSubtitleBarProps> = ({
  words,
  stylePreset,
  sceneStartOffsetMs = 0,
  fontSize = 26,
  bottomOffset = 44,
  maxWordsPerLine = 7,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000 + sceneStartOffsetMs;

  if (!words || words.length === 0) return null;

  const chunks: WordItem[][] = [];
  for (let i = 0; i < words.length; i += maxWordsPerLine) {
    chunks.push(words.slice(i, i + maxWordsPerLine));
  }

  const activeChunk = chunks.find((c, idx) => {
    const start = c[0].startMs - 150;
    const end = chunks[idx + 1] ? chunks[idx + 1][0].startMs - 20 : c[c.length - 1].endMs + 450;
    return currentMs >= start && currentMs <= end;
  });

  if (!activeChunk || activeChunk.length === 0) return null;

  const chunkStartMs = activeChunk[0].startMs;
  const chunkEndMs = activeChunk[activeChunk.length - 1].endMs + 400;
  const enterT = clamp((currentMs - (chunkStartMs - 120)) / 160, 0, 1);
  const exitT = clamp((chunkEndMs - currentMs) / 160, 0, 1);
  const barOpacity = Math.min(enterT, exitT);
  const slideY = (1 - easeOutExpo(enterT)) * 10;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: bottomOffset,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 95,
        opacity: barOpacity,
        transform: `translate3d(0, ${slideY.toFixed(1)}px, 0)`,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px 10px',
          maxWidth: '84%',
          textShadow: '0 2px 14px rgba(0, 0, 0, 0.85), 0 1px 4px rgba(0, 0, 0, 0.95)',
        }}
      >
        {activeChunk.map((w, idx) => {
          const isSpoken = currentMs >= w.startMs - 40 && currentMs <= w.endMs + 90;
          const hasPassed = currentMs > w.endMs + 90;
          const isKeyword = w.role === 'keyword';

          return (
            <span
              key={`${w.text}-${w.startMs}-${idx}`}
              style={{
                display: 'inline-block',
                fontFamily: stylePreset.typography.body,
                fontSize,
                fontWeight: isSpoken || isKeyword ? 700 : 500,
                color: isSpoken
                  ? stylePreset.palette.accent
                  : hasPassed
                  ? '#FFFFFF'
                  : 'rgba(255, 255, 255, 0.65)',
                transform: isSpoken ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 2. HUMANIZED TYPE TEXT (<TypeText />) DENGAN AUTO-SYNCED TYPING SFX!
 * - Otomatis memutar `audio/sfx/typing-loop.wav` tepat dari frame `start` sampai karakter terakhir selesai diketik!
 * - Begitu ketikan selesai, suara ketikan otomatis berhenti (100% sinkron visual & audio).
 */
export interface TypoCorrectionConfig {
  atCharIndex: number;
  wrongText: string;
}

export const TypeText: React.FC<{
  text: string;
  start: number;
  cps?: number;
  size: number;
  color: string;
  newestColor?: string;
  weight?: number;
  family?: string;
  style?: React.CSSProperties;
  cursor?: boolean;
  humanizeCadence?: boolean;
  typoCorrection?: TypoCorrectionConfig;
  enableTypingSfx?: boolean;
  /** Pilihan karakter suara ketikan: 'mechanical' (default keyboard mekanik), 'soft' (laptop halus), atau 'digital' (terminal blip) */
  typingVariant?: 'mechanical' | 'soft' | 'digital';
  typingSfxSrc?: string;
  typingSfxVolume?: number;
}> = ({
  text,
  start,
  cps = 1.45,
  size,
  color,
  newestColor = '#9E9EA6',
  weight = 500,
  family = 'Inter, sans-serif',
  style,
  cursor = true,
  humanizeCadence = true,
  typoCorrection,
  enableTypingSfx = true,
  typingVariant = 'mechanical',
  typingSfxSrc,
  typingSfxVolume = 0.36,
}) => {
  const resolvedTypingSfx =
    typingSfxSrc ??
    (typingVariant === 'soft'
      ? 'audio/sfx/typing-soft.wav'
      : typingVariant === 'digital'
      ? 'audio/sfx/typing-digital.wav'
      : 'audio/sfx/typing-loop.wav');
  const frame = useCurrentFrame();
  const chars = useMemo(() => text.split(''), [text]);

  const charSchedule = useMemo(() => {
    const frames: number[] = [];
    let t = start;
    const baseStep = 1 / Math.max(0.2, cps);

    for (let i = 0; i < chars.length; i++) {
      if (typoCorrection && i === typoCorrection.atCharIndex) {
        const wrongLen = typoCorrection.wrongText.length;
        t += wrongLen * baseStep * 0.85 + 3.5 + wrongLen * 0.55;
      }

      frames.push(t);

      if (!humanizeCadence) {
        t += baseStep;
      } else {
        const ch = chars[i];
        const cadenceMult =
          ch === ' '
            ? 1.38
            : /[.,!?;:-]/.test(ch)
            ? 1.75
            : 0.78 + 0.32 * Math.abs(Math.sin(i * 1.9 + 0.5));
        t += baseStep * cadenceMult;
      }
    }
    return frames;
  }, [chars, start, cps, humanizeCadence, typoCorrection]);

  let displayedChars: { ch: string; startFrame: number }[] = [];
  const baseStep = 1 / Math.max(0.2, cps);

  if (
    typoCorrection &&
    typoCorrection.atCharIndex > 0 &&
    typoCorrection.atCharIndex < chars.length
  ) {
    const idx = typoCorrection.atCharIndex;
    const prefixEndFrame = charSchedule[idx - 1] + baseStep;
    const resumeFrame = charSchedule[idx];

    if (frame >= prefixEndFrame && frame < resumeFrame) {
      const prefix = chars.slice(0, idx).map((c, i) => ({ ch: c, startFrame: charSchedule[i] }));
      const wrongChars = typoCorrection.wrongText.split('');
      const typeWrongDur = wrongChars.length * baseStep * 0.85;
      const pauseEnd = prefixEndFrame + typeWrongDur + 3.5;

      let activeWrongCount = 0;
      if (frame <= pauseEnd) {
        activeWrongCount = clamp(
          Math.ceil((frame - prefixEndFrame) / (baseStep * 0.85)),
          0,
          wrongChars.length
        );
      } else {
        const backProgress = (frame - pauseEnd) / Math.max(1, resumeFrame - pauseEnd);
        activeWrongCount = clamp(
          Math.round(wrongChars.length * (1 - backProgress)),
          0,
          wrongChars.length
        );
      }

      displayedChars = [
        ...prefix,
        ...wrongChars.slice(0, activeWrongCount).map((wc, wi) => ({
          ch: wc,
          startFrame: prefixEndFrame + wi * baseStep * 0.85,
        })),
      ];
    }
  }

  if (displayedChars.length === 0) {
    displayedChars = chars
      .map((ch, i) => ({ ch, startFrame: charSchedule[i] }))
      .filter((item) => frame >= item.startFrame);
  }

  const lastScheduledFrame = Math.ceil(charSchedule[charSchedule.length - 1] ?? start);
  const typingDurationFrames = Math.max(4, lastScheduledFrame - Math.floor(start) + 2);

  return (
    <div
      style={{
        fontSize: size,
        fontWeight: weight,
        fontFamily: family,
        whiteSpace: 'pre-wrap',
        lineHeight: 1.15,
        ...style,
      }}
    >
      {/* Auto-Synced Typing SFX: Hanya berbunyi selama karakter sedang diketik! */}
      {enableTypingSfx && typingDurationFrames > 0 && (
        <Sequence from={Math.max(0, Math.floor(start))} durationInFrames={typingDurationFrames}>
          <Audio src={staticFile(resolvedTypingSfx)} volume={typingSfxVolume} />
        </Sequence>
      )}

      {displayedChars.map((item, i) => {
        const age = frame - item.startFrame;
        const appearT = clamp(age / 3.5, 0, 1);
        const e = easeOutExpo(appearT);
        const colT = clamp(age / 6.5, 0, 1);
        const col = interpolateColors(colT, [0, 1], [newestColor, color]);
        const dy = (1 - e) * 6;
        const sc = 0.88 + 0.12 * e;
        return (
          <span
            key={`${i}-${item.ch}`}
            style={{
              display: 'inline-block',
              color: col,
              opacity: clamp(age / 2.2, 0.15, 1),
              transform: `translate3d(0, ${dy.toFixed(2)}px, 0) scale(${sc.toFixed(3)})`,
              whiteSpace: 'pre',
            }}
          >
            {item.ch}
          </span>
        );
      })}
      {cursor && frame >= start - 2 && frame <= lastScheduledFrame + 18 ? (
        <span
          style={{
            color,
            fontWeight: 300,
            marginLeft: 2,
            opacity: 0.65 + 0.35 * Math.sin(frame * 0.45),
          }}
        >
          |
        </span>
      ) : null}
    </div>
  );
};

/**
 * 3. ANIMATED LOADING / RENDER PROGRESS BAR (<AnimatedProgressBar />) DENGAN AUTO-SYNCED PROGRESS SFX!
 * - Otomatis memutar `audio/sfx/progress-loop.wav` (rising counter ticks) selama bar bergerak dari 0% -> 100%
 * - Otomatis memutar `audio/sfx/d2.wav` (completion chime) tepat saat mencapai 100%!
 */
export interface AnimatedProgressBarProps {
  label: string;
  startFrame: number;
  endFrame: number;
  accentColor?: string;
  trackColor?: string;
  textColor?: string;
  monoFont?: string;
  height?: number;
  enableProgressSfx?: boolean;
  progressSfxSrc?: string;
  completeChimeSrc?: string;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  label,
  startFrame,
  endFrame,
  accentColor = '#0B84F3',
  trackColor = 'rgba(255, 255, 255, 0.1)',
  textColor = '#FFFFFF',
  monoFont = 'JetBrains Mono, monospace',
  height = 12,
  enableProgressSfx = true,
  progressSfxSrc = 'audio/sfx/progress-loop.wav',
  completeChimeSrc = 'audio/sfx/d2.wav',
}) => {
  const frame = useCurrentFrame();
  const pct = ip(frame, [startFrame, endFrame], [0, 100], easeOutExpo);
  const durFrames = Math.max(6, endFrame - startFrame);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Auto-Synced Loading Progress Ticks + Completion Chime */}
      {enableProgressSfx && (
        <>
          <Sequence from={Math.max(0, startFrame)} durationInFrames={durFrames}>
            <Audio src={staticFile(progressSfxSrc)} volume={0.38} />
          </Sequence>
          <Sequence from={Math.max(0, endFrame)} durationInFrames={20}>
            <Audio src={staticFile(completeChimeSrc)} volume={0.45} />
          </Sequence>
        </>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: monoFont,
          fontSize: 16,
          color: textColor,
        }}
      >
        <span>{label}</span>
        <span style={{ fontWeight: 700, color: accentColor }}>{Math.round(pct)}%</span>
      </div>

      <div
        style={{
          width: '100%',
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct.toFixed(1)}%`,
            height: '100%',
            borderRadius: height / 2,
            backgroundColor: accentColor,
          }}
        />
      </div>
    </div>
  );
};

/**
 * 4. FLY TEXT (<FlyText />) — Per-Character Spring Fly-In
 */
export const FlyText: React.FC<{
  text: string;
  start: number;
  stagger?: number;
  dur?: number;
  size: number;
  color: string;
  flyingColor?: string;
  weight?: number;
  family?: string;
  letterSpacing?: number;
  style?: React.CSSProperties;
  rotateSpread?: number;
  yOffset?: number;
  xOffset?: number;
}> = ({
  text,
  start,
  stagger = 2,
  dur = 12,
  size,
  color,
  flyingColor = '#8E8E93',
  weight = 700,
  family = 'Inter, sans-serif',
  letterSpacing = 0,
  style,
  rotateSpread = 7,
  yOffset = 42,
  xOffset = 16,
}) => {
  return (
    <div
      style={{
        display: 'inline-block',
        whiteSpace: 'pre-wrap',
        fontSize: size,
        fontWeight: weight,
        fontFamily: family,
        letterSpacing,
        lineHeight: 1.12,
        ...style,
      }}
    >
      {text.split('').map((ch, i) => (
        <FlyChar
          key={i}
          ch={ch}
          frameOffset={start + i * stagger}
          dur={dur}
          color={color}
          flyingColor={flyingColor}
          rotateSpread={rotateSpread}
          yOffset={yOffset}
          xOffset={xOffset}
          seed={i * 13 + 5}
        />
      ))}
    </div>
  );
};

const FlyChar: React.FC<{
  ch: string;
  frameOffset: number;
  dur: number;
  color: string;
  flyingColor: string;
  rotateSpread: number;
  yOffset: number;
  xOffset: number;
  seed: number;
}> = ({
  ch,
  frameOffset,
  dur,
  color,
  flyingColor,
  rotateSpread,
  yOffset,
  xOffset,
  seed,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const raw = frame - frameOffset;
  if (raw <= -0.5) return <span style={{ opacity: 0 }}>{ch}</span>;

  const sp = spring({
    frame: Math.max(0, raw),
    fps,
    config: { damping: 14, stiffness: 155, mass: 0.65 },
    durationInFrames: Math.max(10, dur + 4),
  });

  const fade = clamp((raw + 0.5) / 3.5, 0, 1);
  const rem = 1 - sp;
  const r = Math.sin(seed) * rotateSpread * rem;
  const dy = yOffset * rem * (0.65 + 0.35 * Math.abs(Math.cos(seed)));
  const dx = xOffset * rem * Math.sign(Math.sin(seed * 1.7));
  const sc = 0.84 + 0.16 * sp;
  const colT = clamp(raw / (dur * 0.78), 0, 1);
  const col = interpolateColors(colT, [0, 1], [flyingColor, color]);

  return (
    <span
      style={{
        display: 'inline-block',
        opacity: fade,
        transform: `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) rotate(${r.toFixed(2)}deg) scale(${sc.toFixed(3)})`,
        color: col,
        whiteSpace: 'pre',
      }}
    >
      {ch}
    </span>
  );
};

export const KineticWordStage = BottomSubtitleBar;
