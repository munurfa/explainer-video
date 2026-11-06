import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp, easeInOutSmooth, easeOutExpo, ip, springAt, SPRING_PRESETS } from '../theme/easing-and-timing';
import { MotionStylePreset } from '../theme/styles-catalog';
import { WordItem } from './KineticWords';

/**
 * BedahOverlay.tsx — Komponen overlay khusus Gaya #44 (Kita Bedah).
 *
 * PENGECUALIAN RESMI ATURAN KERAS 1 & 2 (lihat references/styles/44-kita-bedah.md §4.1):
 * pill/background teks HANYA boleh lewat <KaraokePillCaption />, <StatusBadge />, dan <CalloutPill />.
 * Komponen lain di file ini tetap merender tipografi bersih tanpa kotak.
 */

export const BEDAH_SEMANTIC = {
  problem: '#D1432B',
  solution: '#1D7A32',
  waterLight: '#9BD5EF',
  waterDark: '#244DA9',
  captionPill: 'rgba(22, 36, 59, 0.82)',
  cardShadow: '0 12px 32px rgba(22, 36, 59, 0.14)',
} as const;

export type BedahVariant = 'neutral' | 'problem' | 'solution' | 'time';

function variantColors(style: MotionStylePreset, variant: BedahVariant): { bg: string; fg: string } {
  switch (variant) {
    case 'problem':
      return { bg: BEDAH_SEMANTIC.problem, fg: '#FFFFFF' };
    case 'solution':
      return { bg: BEDAH_SEMANTIC.solution, fg: '#FFFFFF' };
    case 'time':
      return { bg: style.palette.ink, fg: '#FFFFFF' };
    default:
      return { bg: style.palette.accent, fg: style.palette.ink };
  }
}

/** Format angka gaya Indonesia: 1.234,56 */
export function formatID(value: number, decimals = 0): string {
  const fixed = value.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decPart ? `${grouped},${decPart}` : grouped;
}

/* ------------------------------------------------------------------ */
/* 1. LIVE COUNTER                                                     */
/* ------------------------------------------------------------------ */
export interface LiveCounterProps {
  stylePreset: MotionStylePreset;
  from: number;
  to: number;
  start: number;
  end: number;
  decimals?: number;
  /** Jumlah digit minimum (padding nol di depan), mis. 5 untuk meteran 01234 */
  padInt?: number;
  prefix?: string;
  suffix?: string;
  size?: number;
  color?: string;
  /** Kalau true, angka terus naik pelan setelah `end` (meteran yang terus berdetak) */
  keepTicking?: boolean;
  tickPerSecond?: number;
}

export const LiveCounter: React.FC<LiveCounterProps> = ({
  stylePreset,
  from,
  to,
  start,
  end,
  decimals = 0,
  padInt = 0,
  prefix = '',
  suffix = '',
  size = 64,
  color,
  keepTicking = false,
  tickPerSecond = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let value = ip(frame, [start, end], [from, to], easeInOutSmooth);
  if (keepTicking && frame > end) value += ((frame - end) / fps) * tickPerSecond;

  let text = formatID(value, decimals);
  if (padInt > 0) {
    const [i, d] = text.split(',');
    text = d !== undefined ? `${i.padStart(padInt, '0')},${d}` : i.padStart(padInt, '0');
  }

  return (
    <span
      style={{
        fontFamily: stylePreset.typography.mono,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: '0.02em',
        fontVariantNumeric: 'tabular-nums',
        color: color ?? stylePreset.palette.accentSecondary,
        whiteSpace: 'nowrap',
      }}
    >
      {prefix}
      {text}
      {suffix}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* 2. STATUS BADGE (pengecualian pill)                                 */
/* ------------------------------------------------------------------ */
export interface StatusBadgeProps {
  stylePreset: MotionStylePreset;
  text: string;
  start: number;
  end?: number;
  variant?: BedahVariant;
  size?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  stylePreset,
  text,
  start,
  end,
  variant = 'neutral',
  size = 23,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start || (end !== undefined && frame > end + 8)) return null;

  const enter = springAt(frame, start, fps, SPRING_PRESETS.editorialSettle);
  const exit = end !== undefined ? ip(frame, [end, end + 8], [1, 0]) : 1;
  const { bg, fg } = variantColors(stylePreset, variant);

  return (
    <span
      style={{
        display: 'inline-block',
        padding: `${Math.round(size * 0.42)}px ${Math.round(size * 0.9)}px`,
        borderRadius: 999,
        backgroundColor: bg,
        color: fg,
        fontFamily: stylePreset.typography.mono,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        opacity: enter * exit,
        transform: `translateY(${(1 - enter) * 14}px) scale(${0.92 + enter * 0.08})`,
      }}
    >
      {text}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* 3. HEADER                                                           */
/* ------------------------------------------------------------------ */
export interface BedahHeaderProps {
  stylePreset: MotionStylePreset;
  /** Teks sebelum kata kunci */
  before?: string;
  /** Satu kata/frasa kunci yang diberi warna */
  keyword: string;
  /** Teks sesudah kata kunci */
  after?: string;
  subLabel?: string;
  start: number;
  /** Slot kanan atas (biasanya <StatusBadge />) */
  right?: React.ReactNode;
  /** Slot data di bawah sub-label (biasanya <LiveCounter />) */
  data?: React.ReactNode;
  /** Slot watermark (logo Tirta Ayu sebagai <Img />) */
  watermark?: React.ReactNode;
  keywordColor?: string;
  titleSize?: number;
  top?: number;
}

export const BedahHeader: React.FC<BedahHeaderProps> = ({
  stylePreset,
  before,
  keyword,
  after,
  subLabel,
  start,
  right,
  data,
  watermark,
  keywordColor,
  titleSize = 76,
  top = 96,
}) => {
  const frame = useCurrentFrame();
  const t = ip(frame, [start, start + 14], [0, 1], easeOutExpo);
  const t2 = ip(frame, [start + 4, start + 18], [0, 1], easeOutExpo);
  const t3 = ip(frame, [start + 8, start + 22], [0, 1], easeOutExpo);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        paddingTop: top,
        paddingLeft: 64,
        paddingRight: 64,
        paddingBottom: 72,
        background: `linear-gradient(180deg, ${stylePreset.palette.bg} 0%, ${stylePreset.palette.bg} 72%, ${stylePreset.palette.bg}00 100%)`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div
            style={{
              fontFamily: stylePreset.typography.heading,
              fontWeight: 800,
              fontSize: titleSize,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: stylePreset.palette.ink,
              transform: `translateY(${(1 - t) * 100}%)`,
              opacity: t,
            }}
          >
            {before ? `${before} ` : ''}
            <span style={{ color: keywordColor ?? stylePreset.palette.accentSecondary }}>{keyword}</span>
            {after ? ` ${after}` : ''}
          </div>
        </div>
        {watermark ? <div style={{ flexShrink: 0, opacity: t }}>{watermark}</div> : null}
      </div>

      {subLabel ? (
        <div
          style={{
            marginTop: 18,
            fontFamily: stylePreset.typography.mono,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: stylePreset.palette.muted,
            opacity: t2,
            transform: `translateY(${(1 - t2) * 12}px)`,
          }}
        >
          {subLabel}
        </div>
      ) : null}

      {data || right ? (
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
            opacity: t3,
          }}
        >
          <div>{data}</div>
          <div>{right}</div>
        </div>
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 4. CALLOUT (titik jangkar + garis penunjuk + pill label)            */
/* ------------------------------------------------------------------ */
export interface CalloutPillProps {
  stylePreset: MotionStylePreset;
  /** Titik pada objek [x, y] dalam koordinat panggung */
  anchor: [number, number];
  /** Posisi pill label [x, y] (titik tengah kiri pill) */
  label: [number, number];
  text: string;
  start: number;
  end?: number;
  variant?: BedahVariant;
  size?: number;
}

export const CalloutPill: React.FC<CalloutPillProps> = ({
  stylePreset,
  anchor,
  label,
  text,
  start,
  end,
  variant = 'neutral',
  size = 28,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start || (end !== undefined && frame > end + 8)) return null;

  const dot = ip(frame, [start, start + 6], [0, 1], easeOutExpo);
  const line = ip(frame, [start + 4, start + 14], [0, 1], easeInOutSmooth);
  const pill = springAt(frame, start + 12, fps, SPRING_PRESETS.editorialSettle);
  const exit = end !== undefined ? ip(frame, [end, end + 8], [1, 0]) : 1;
  const { bg, fg } = variantColors(stylePreset, variant);
  const lineColor = stylePreset.palette.ink;

  const [ax, ay] = anchor;
  const [lx, ly] = label;
  const len = Math.hypot(lx - ax, ly - ay);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: exit, pointerEvents: 'none' }}>
      <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }} width="100%" height="100%">
        <line
          x1={ax}
          y1={ay}
          x2={lx}
          y2={ly}
          stroke={lineColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - line)}
        />
        {/* Titik jangkar pada objek (pengecualian aturan 2: menandai bagian objek, bukan bullet teks) */}
        <circle cx={ax} cy={ay} r={7 * dot} fill={stylePreset.palette.accent} stroke={stylePreset.palette.ink} strokeWidth={2} />
      </svg>
      <span
        style={{
          position: 'absolute',
          left: lx,
          top: ly,
          transform: `translate(${lx >= ax ? '0%' : '-100%'}, -50%) scale(${0.9 + pill * 0.1})`,
          transformOrigin: lx >= ax ? 'left center' : 'right center',
          opacity: pill,
          padding: `${Math.round(size * 0.4)}px ${Math.round(size * 0.8)}px`,
          borderRadius: 999,
          backgroundColor: bg,
          color: fg,
          boxShadow: '0 6px 16px rgba(22, 36, 59, 0.18)',
          fontFamily: stylePreset.typography.heading,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 5. CAPTION KARAOKE (pengganti <BottomSubtitleBar /> di gaya #44)    */
/* ------------------------------------------------------------------ */
export interface KaraokePillCaptionProps {
  words: WordItem[];
  stylePreset: MotionStylePreset;
  sceneStartOffsetMs?: number;
  fontSize?: number;
  /** Jarak dari bawah layar. Default 200 = di atas UI Shorts/Reels */
  bottomOffset?: number;
  maxWordsPerLine?: number;
}

export const KaraokePillCaption: React.FC<KaraokePillCaptionProps> = ({
  words,
  stylePreset,
  sceneStartOffsetMs = 0,
  fontSize = 50,
  bottomOffset = 200,
  maxWordsPerLine = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = (frame / fps) * 1000 + sceneStartOffsetMs;
  if (!words || words.length === 0) return null;

  const chunks: WordItem[][] = [];
  for (let i = 0; i < words.length; i += maxWordsPerLine) chunks.push(words.slice(i, i + maxWordsPerLine));

  const idx = chunks.findIndex((c, i) => {
    const s = c[0].startMs - 120;
    const e = chunks[i + 1] ? chunks[i + 1][0].startMs - 20 : c[c.length - 1].endMs + 500;
    return nowMs >= s && nowMs <= e;
  });
  if (idx < 0) return null;
  const chunk = chunks[idx];

  const enter = clamp((nowMs - (chunk[0].startMs - 120)) / 140, 0, 1);

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
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: Math.round(fontSize * 0.22),
          padding: `${Math.round(fontSize * 0.3)}px ${Math.round(fontSize * 0.45)}px`,
          borderRadius: Math.round(fontSize * 0.28),
          backgroundColor: BEDAH_SEMANTIC.captionPill,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 16}px)`,
          maxWidth: 1000,
        }}
      >
        {chunk.map((w, i) => {
          const active = nowMs >= w.startMs && nowMs <= w.endMs + 60;
          const spoken = nowMs > w.endMs + 60;
          return (
            <span
              key={`${w.startMs}-${i}`}
              style={{
                fontFamily: stylePreset.typography.body,
                fontWeight: 700,
                fontSize,
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
                padding: `0 ${Math.round(fontSize * 0.16)}px`,
                borderRadius: Math.round(fontSize * 0.18),
                backgroundColor: active ? stylePreset.palette.accent : 'transparent',
                color: active ? stylePreset.palette.ink : spoken ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
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

/* ------------------------------------------------------------------ */
/* 6. INFO CARD (kutipan, kalkulasi, checklist, kontak)                */
/* ------------------------------------------------------------------ */
export interface InfoCardProps {
  stylePreset: MotionStylePreset;
  start: number;
  end?: number;
  /** Label mono kecil di atas kartu, mis. "HITUNGAN" atau "SUMBER" */
  eyebrow?: string;
  title?: string;
  children?: React.ReactNode;
  width?: number;
  left?: number;
  top?: number;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  stylePreset,
  start,
  end,
  eyebrow,
  title,
  children,
  width = 900,
  left = 90,
  top = 700,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start || (end !== undefined && frame > end + 10)) return null;
  const enter = springAt(frame, start, fps, SPRING_PRESETS.editorialSettle);
  const exit = end !== undefined ? ip(frame, [end, end + 10], [1, 0]) : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        padding: 48,
        borderRadius: 20,
        backgroundColor: stylePreset.palette.surface,
        boxShadow: BEDAH_SEMANTIC.cardShadow,
        opacity: enter * exit,
        transform: `translateY(${(1 - enter) * 60}px)`,
      }}
    >
      {eyebrow ? (
        <div
          style={{
            fontFamily: stylePreset.typography.mono,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: stylePreset.palette.muted,
            marginBottom: 14,
          }}
        >
          {eyebrow}
        </div>
      ) : null}
      {title ? (
        <div
          style={{
            fontFamily: stylePreset.typography.heading,
            fontWeight: 800,
            fontSize: 48,
            lineHeight: 1.1,
            color: stylePreset.palette.ink,
            marginBottom: 20,
          }}
        >
          {title}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: stylePreset.typography.body,
          fontWeight: 500,
          fontSize: 36,
          lineHeight: 1.3,
          color: stylePreset.palette.ink,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 7. REKAP BERTINGKAT                                                 */
/* ------------------------------------------------------------------ */
export interface BedahRecapItem {
  text: string;
  variant?: BedahVariant;
}

export interface BedahRecapListProps {
  stylePreset: MotionStylePreset;
  items: BedahRecapItem[];
  start: number;
  /** Jarak antar poin dalam frame */
  stagger?: number;
  /** 'number' (default, 01 02 03 mono) atau 'dot' (titik warna SVG, pengecualian aturan 2) */
  marker?: 'number' | 'dot';
  left?: number;
  top?: number;
  /** Indeks poin yang sedang disorot (poin lain diredupkan) */
  focusIndex?: number;
}

export const BedahRecapList: React.FC<BedahRecapListProps> = ({
  stylePreset,
  items,
  start,
  stagger = 18,
  marker = 'number',
  left = 90,
  top = 620,
  focusIndex,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ position: 'absolute', left, top, right: 90, display: 'flex', flexDirection: 'column', gap: 30 }}>
      {items.map((item, i) => {
        const s = start + i * stagger;
        if (frame < s) return null;
        const enter = springAt(frame, s, fps, SPRING_PRESETS.editorialSettle);
        const dim = focusIndex !== undefined && focusIndex !== i ? 0.35 : 1;
        const color =
          item.variant === 'problem'
            ? BEDAH_SEMANTIC.problem
            : item.variant === 'solution'
              ? BEDAH_SEMANTIC.solution
              : stylePreset.palette.accentSecondary;

        return (
          <div
            key={`${item.text}-${i}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              opacity: enter * dim,
              transform: `translateX(${(1 - enter) * -40}px)`,
            }}
          >
            {marker === 'number' ? (
              <span
                style={{
                  fontFamily: stylePreset.typography.mono,
                  fontWeight: 700,
                  fontSize: 34,
                  letterSpacing: '0.04em',
                  color,
                  minWidth: 56,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
            ) : (
              <svg width={28} height={28} viewBox="0 0 28 28" style={{ flexShrink: 0 }}>
                <circle cx={14} cy={14} r={11} fill={color} stroke={stylePreset.palette.ink} strokeWidth={3} />
              </svg>
            )}
            <span
              style={{
                fontFamily: stylePreset.typography.heading,
                fontWeight: 700,
                fontSize: 44,
                lineHeight: 1.15,
                color: stylePreset.palette.ink,
              }}
            >
              {item.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};
