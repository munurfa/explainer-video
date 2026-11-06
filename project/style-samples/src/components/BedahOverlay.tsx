import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp, easeInOutSmooth, easeOutExpo, ip, springAt, SPRING_PRESETS } from '../theme/easing-and-timing';
import { MotionStylePreset } from '../theme/styles-catalog';
export interface WordItem { text: string; startMs: number; endMs: number; }

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
  /** String atau <BedahStepper /> (penanda posisi alur) */
  subLabel?: React.ReactNode;
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
  warnText(text, end !== undefined ? end - (start + 12) : undefined, fps);

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
  /** Jarak dari bawah layar. Default mengikuti safe zone: 9:16 = 22% tinggi (baris bawah y ~1498, di atas UI Reels/TikTok/Shorts), 16:9 = 6% */
  bottomOffset?: number;
  maxWordsPerLine?: number;
}

export const KaraokePillCaption: React.FC<KaraokePillCaptionProps> = ({
  words,
  stylePreset,
  sceneStartOffsetMs = 0,
  fontSize = 50,
  bottomOffset: bottomOffsetProp,
  maxWordsPerLine = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const bottomOffset = bottomOffsetProp ?? Math.round(height * (height > width ? 0.22 : 0.06));
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

/* ------------------------------------------------------------------ */
/* 8. ATURAN TEKS: maks 7 kata, tayang min 0,3 dtk per kata            */
/* ------------------------------------------------------------------ */
export const BEDAH_TEXT_RULES = { maxWords: 7, minSecPerWord: 0.3 } as const;

/** Hitung kata yang dibaca penonton (angka urut "01" dan tanda baca tidak dihitung). */
export const countWords = (s: string) =>
  s
    .trim()
    .split(/\s+/)
    .filter((w) => /[A-Za-zÀ-ɏ]/.test(w)).length;

/** Lama tayang minimal (frame) sebuah teks: jumlah kata x 0,3 dtk. Pakai untuk menghitung `end`. */
export const holdFrames = (text: string, fps = 30) => Math.ceil(countWords(text) * BEDAH_TEXT_RULES.minSecPerWord * fps);

/** Daftar pelanggaran aturan teks. `shownFrames` = frame teks terbaca penuh (setelah animasi masuk). */
export function checkText(text: string, shownFrames?: number, fps = 30): string[] {
  const n = countWords(text);
  const out: string[] = [];
  if (n > BEDAH_TEXT_RULES.maxWords) out.push(`"${text}" ${n} kata > ${BEDAH_TEXT_RULES.maxWords}`);
  if (shownFrames !== undefined && shownFrames < holdFrames(text, fps)) {
    out.push(`"${text}" tampil ${(shownFrames / fps).toFixed(2)} dtk < ${(holdFrames(text, fps) / fps).toFixed(2)} dtk (${n} kata x 0,3)`);
  }
  return out;
}

const warned = new Set<string>();
/** Peringatan sekali per teks di log render (tidak menggagalkan render). */
export function warnText(text: string, shownFrames?: number, fps = 30) {
  for (const msg of checkText(text, shownFrames, fps)) {
    if (warned.has(msg)) continue;
    warned.add(msg);
    console.warn(`[BedahText] ${msg}`);
  }
}

/* ------------------------------------------------------------------ */
/* 9. JADWAL SATU-GERAK (one mover at a time)                          */
/* ------------------------------------------------------------------ */
export interface Beat {
  id: string;
  /** Durasi beat (frame). Selama beat ini HANYA elemen ini yang bergerak. */
  dur: number;
}
export type BeatMap<K extends string = string> = Record<K, [number, number]>;

/**
 * Susun beat berurutan tanpa tumpang tindih: beat berikutnya baru mulai saat beat sebelumnya selesai.
 * Kamera juga satu beat (zoom / pull-back), jadi kamera diam selama objek atau teks bergerak.
 *   const B = sequenceBeats([{ id: 'header', dur: 18 }, { id: 'zoom1', dur: 28 }, ...]);
 *   ip(t, B.zoom1, [0, 1], EIO)
 */
export function sequenceBeats<K extends string>(beats: { id: K; dur: number }[], startAt = 0): BeatMap<K> {
  const out = {} as BeatMap<K>;
  let f = startAt;
  for (const b of beats) {
    out[b.id] = [f, f + b.dur];
    f += b.dur;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* 10. PANAH ALUR (arah = arah gerak nyata)                            */
/* ------------------------------------------------------------------ */
export interface FlowArrowProps {
  stylePreset: MotionStylePreset;
  /** Titik jalur di layar, urut SEARAH gerak nyata (ekor -> kepala). Dari projectToScreen() titik 3D. */
  points: [number, number][];
  /** Progres 0..1. Pakai nilai yang sama dengan progres gerak benda (bukaan katup, muka air) agar kepala panah ikut benda. */
  progress: number;
  color?: string;
  width?: number;
  head?: number;
  opacity?: number;
}

/**
 * Panah yang tumbuh dari ekor ke kepala mengikuti arah gerak sebenarnya: rotasi roda (busur searah putaran),
 * stem/pintu naik (garis ke atas), air ke hilir (garis sepanjang pipa). Tanpa pill, tanpa label.
 */
export const FlowArrow: React.FC<FlowArrowProps> = ({ stylePreset, points, progress, color, width = 6, head = 22, opacity = 1 }) => {
  const k = clamp(progress, 0, 1);
  if (k <= 0.001 || points.length < 2 || opacity <= 0) return null;
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const d = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    seg.push(d);
    total += d;
  }
  const want = total * k;
  const drawn: [number, number][] = [points[0]];
  let acc = 0;
  for (let i = 1; i < points.length; i++) {
    const d = seg[i - 1];
    if (acc + d >= want) {
      const u = d > 0 ? (want - acc) / d : 0;
      drawn.push([points[i - 1][0] + (points[i][0] - points[i - 1][0]) * u, points[i - 1][1] + (points[i][1] - points[i - 1][1]) * u]);
      break;
    }
    drawn.push(points[i]);
    acc += d;
  }
  const tip = drawn[drawn.length - 1];
  // arah kepala dari ~head px terakhir jalur (stabil di busur)
  let back = drawn[0];
  let rem = head;
  for (let i = drawn.length - 1; i > 0; i--) {
    const d = Math.hypot(drawn[i][0] - drawn[i - 1][0], drawn[i][1] - drawn[i - 1][1]);
    if (d >= rem) {
      const u = rem / d;
      back = [drawn[i][0] + (drawn[i - 1][0] - drawn[i][0]) * u, drawn[i][1] + (drawn[i - 1][1] - drawn[i][1]) * u];
      break;
    }
    rem -= d;
    back = drawn[i - 1];
  }
  const ang = Math.atan2(tip[1] - back[1], tip[0] - back[0]);
  const hs = head * ip(want, [0, head * 1.5], [0.4, 1]);
  const p1: [number, number] = [tip[0] - Math.cos(ang - 0.5) * hs, tip[1] - Math.sin(ang - 0.5) * hs];
  const p2: [number, number] = [tip[0] - Math.cos(ang + 0.5) * hs, tip[1] - Math.sin(ang + 0.5) * hs];
  // garis berhenti sedikit sebelum ujung agar tidak menembus kepala
  const body = drawn.slice(0, -1).concat([[tip[0] - Math.cos(ang) * hs * 0.6, tip[1] - Math.sin(ang) * hs * 0.6]]);
  const col = color ?? stylePreset.palette.accentSecondary;
  const d = body.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', opacity }} width="100%" height="100%">
      <path d={d} fill="none" stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={width + 5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={col} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`${tip[0]},${tip[1]} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`} fill={col} stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={3} strokeLinejoin="round" />
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* 11. PENANDA POSISI (penonton tahu sedang di bagian mana)            */
/* ------------------------------------------------------------------ */
export interface BedahStepperProps {
  stylePreset: MotionStylePreset;
  /** Nama bagian alur, maks 2 kata per step, contoh ['Katup', 'Arus'] */
  steps: string[];
  /** Indeks step aktif. Pecahan (0.4) = sedang pindah, garis bawah bergeser. */
  active: number;
  size?: number;
}

/** Baris "01 KATUP  02 ARUS": step aktif berwarna + garis bawah, sisanya redup. Taruh di slot subLabel header. */
export const BedahStepper: React.FC<BedahStepperProps> = ({ stylePreset, steps, active, size = 26 }) => {
  const gap = size * 1.4;
  return (
    <span style={{ display: 'inline-flex', gap, fontFamily: stylePreset.typography.mono, fontWeight: 700, fontSize: size, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
      {steps.map((s, i) => {
        const on = clamp(1 - Math.abs(active - i), 0, 1);
        return (
          <span key={s} style={{ position: 'relative', color: on > 0.5 ? stylePreset.palette.accentSecondary : stylePreset.palette.muted, opacity: 0.5 + on * 0.5, paddingBottom: 8 }}>
            {`${String(i + 1).padStart(2, '0')} ${s}`}
            <span style={{ position: 'absolute', left: 0, bottom: 0, height: 4, width: `${on * 100}%`, background: stylePreset.palette.accentSecondary, borderRadius: 2 }} />
          </span>
        );
      })}
    </span>
  );
};
