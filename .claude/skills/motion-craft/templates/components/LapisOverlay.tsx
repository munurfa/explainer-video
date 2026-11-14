import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp, easeInOutSmooth, easeOutExpo, ip, springAt, SPRING_PRESETS } from '../theme/easing-and-timing';
import { MotionStylePreset } from '../theme/styles-catalog';
import { warnText } from './BedahOverlay';

/**
 * LapisOverlay.tsx: overlay Gaya #46 (Bedah Lapis).
 *
 * Yang dipertahankan dari #44: header 2 baris + stepper + badge + counter + caption karaoke.
 * Yang diubah (lihat references/styles/46-bedah-lapis.md §1):
 *   - header lebih ke atas dan membentang hampir selebar layar (logo di tepi kanan)
 *   - huruf stepper diperbesar: ukurannya dihitung agar semua bab mengisi lebar header
 *   - caption lebih ke bawah, selalu di bawah objek (objek dibingkai di antara header dan caption)
 *   - label bagian: pill putih kecil + titik warna bagian + garis tipis (<LapisLabel />)
 *   - kalimat hook bebas ditulis user (<LapisHook text="..." />), bukan teks tetap
 *
 *   - CTA end card: badge toko aplikasi resmi + jari yang menekannya (<StoreBadgeTap />), bukan teks "Download di ..."
 *
 * PENGECUALIAN ATURAN KERAS 1 & 2: pill hanya lewat <LapisCaption />, <StatusBadge />, <LapisLabel />, <LapisCard />.
 * Titik warna hanya boleh di dalam <LapisLabel /> (penanda warna bagian). Karakter bullet di string tetap dilarang.
 */

export { BEDAH_SEMANTIC, checkText, countWords, FlowArrow, formatID, holdFrames, LiveCounter, sequenceBeats, StatusBadge, warnText } from './BedahOverlay';

/* ------------------------------------------------------------------ */
/* 1. TATA LETAK                                                       */
/* ------------------------------------------------------------------ */
export interface LapisLayout {
  /** Jarak header/stepper dari tepi kiri-kanan */
  side: number;
  /** Jarak judul dari atas layar */
  headerTop: number;
  titleSize: number;
  stepperMin: number;
  stepperMax: number;
  /** Jarak caption dari bawah layar */
  captionBottom: number;
  captionSize: number;
  /** Batas panggung objek: objek dan label harus berada di antara dua angka ini */
  stageTop: number;
  stageBottom: number;
  hookSize: number;
  labelSize: number;
}

/**
 * Sumber tunggal posisi overlay. 9:16 (1080x1920):
 *   header y 200-530 | panggung objek y 540-1500 | caption y 1540-1620.
 * Header naik 100 px dan caption turun 120 px dibanding #44, jadi keduanya sedikit masuk zona konservatif
 * skill (atas 288 px, bawah 1536 px). Ini disengaja untuk gaya #46. Ubah di sini bila platform menutupinya.
 */
export function lapisLayout(width: number, height: number): LapisLayout {
  const v = height > width;
  return v
    ? { side: 40, headerTop: 200, titleSize: 76, stepperMin: 24, stepperMax: 36, captionBottom: 300, captionSize: 46, stageTop: 540, stageBottom: 1500, hookSize: 120, labelSize: 26 }
    : { side: 56, headerTop: 52, titleSize: 60, stepperMin: 20, stepperMax: 28, captionBottom: 56, captionSize: 36, stageTop: 300, stageBottom: 960, hookSize: 104, labelSize: 22 };
}

/* ------------------------------------------------------------------ */
/* 2. MODE BRAND + KALIMAT HOOK                                        */
/* ------------------------------------------------------------------ */
export type LapisBrandMode = 'umum' | 'tirta-ayu';

/**
 * Dua pertanyaan wajib sebelum storyboard gaya #46 (lihat file gaya §0):
 *   1. Mode brand: 'umum' (netral, tanpa logo kecuali user memberi) atau 'tirta-ayu' (warna, logo, sapaan Tirta Ayu).
 *   2. Kalimat hook: user menulis sendiri. Nilai di bawah hanya dipakai bila user menjawab "pakai default".
 */
export const LAPIS_BRAND: Record<LapisBrandMode, { hook: string; palette?: Partial<MotionStylePreset['palette']>; logo?: string }> = {
  umum: { hook: 'Yuk, kita bedah.' },
  'tirta-ayu': {
    hook: 'Yuh, kita bedah.',
    palette: { bg: '#F3F1EC', surface: '#FFFFFF', ink: '#16243B', muted: '#44536B', accent: '#FFC20E', accentSecondary: '#244DA9' },
    logo: 'brand/lambang-warna.svg',
  },
};

/** Preset gaya sesuai mode brand. Mode 'umum' = palet katalog #46 apa adanya. */
export function lapisStyle(base: MotionStylePreset, mode: LapisBrandMode = 'umum'): MotionStylePreset {
  const o = LAPIS_BRAND[mode].palette;
  return o ? { ...base, palette: { ...base.palette, ...o } } : base;
}

/** Kalimat hook yang dipakai: tulisan user bila ada, kalau kosong default mode brand. */
export const lapisHookText = (custom: string | undefined, mode: LapisBrandMode = 'umum') => (custom && custom.trim() ? custom.trim() : LAPIS_BRAND[mode].hook);

/* ------------------------------------------------------------------ */
/* 3. STEPPER (huruf besar, mengisi lebar header)                      */
/* ------------------------------------------------------------------ */
export interface LapisStepperProps {
  stylePreset: MotionStylePreset;
  /** Nama bab, maks 2 kata per bab */
  steps: string[];
  /** Indeks bab aktif. Pecahan = garis bawah sedang bergeser */
  active: number;
  /** Lebar yang tersedia (px). Ukuran huruf dihitung agar semua bab muat satu baris */
  width: number;
  minSize?: number;
  maxSize?: number;
}

const STEP_TRACK = 0.06; // letter-spacing (em)
const STEP_ADV = 0.6 + STEP_TRACK; // lebar satu huruf mono (em)
const STEP_GAP = 0.9; // jarak antar bab (em)

/** Ukuran huruf stepper terbesar yang masih muat satu baris di `width`. */
export function stepperSize(steps: string[], width: number, minSize = 24, maxSize = 36) {
  const chars = steps.reduce((n, s) => n + s.length + 3, 0);
  const em = chars * STEP_ADV + (steps.length - 1) * STEP_GAP;
  return clamp(Math.floor(width / em), minSize, maxSize);
}

/** Baris "01 PEMANAS  02 AIR HABIS  03 MAGNET": bab aktif berwarna + garis bawah, sisanya redup. */
export const LapisStepper: React.FC<LapisStepperProps> = ({ stylePreset, steps, active, width, minSize = 24, maxSize = 36 }) => {
  const size = stepperSize(steps, width, minSize, maxSize);
  const chars = steps.reduce((n, s) => n + s.length + 3, 0);
  const natural = (chars * STEP_ADV + (steps.length - 1) * STEP_GAP) * size;
  // Bab banyak: rentangkan sampai tepi kanan. Bab sedikit: rapat kiri dengan jarak tetap.
  const spread = natural > width * 0.82;
  return (
    <div
      style={{
        display: 'flex',
        width,
        justifyContent: spread ? 'space-between' : 'flex-start',
        gap: spread ? 0 : STEP_GAP * size * 1.4,
        fontFamily: stylePreset.typography.mono,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: `${STEP_TRACK}em`,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {steps.map((s, i) => {
        const on = clamp(1 - Math.abs(active - i), 0, 1);
        return (
          <span key={s} style={{ position: 'relative', paddingBottom: Math.round(size * 0.36), color: on > 0.5 ? stylePreset.palette.accentSecondary : stylePreset.palette.muted, opacity: 0.62 + on * 0.38 }}>
            {`${String(i + 1).padStart(2, '0')} ${s}`}
            <span style={{ position: 'absolute', left: 0, bottom: 0, height: Math.max(4, Math.round(size * 0.16)), width: `${on * 100}%`, background: stylePreset.palette.accentSecondary, borderRadius: 3 }} />
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 4. HEADER (lebih atas, hampir selebar layar)                        */
/* ------------------------------------------------------------------ */
export interface LapisHeaderProps {
  stylePreset: MotionStylePreset;
  before?: string;
  /** Satu kata/frasa kunci yang diberi warna */
  keyword: string;
  after?: string;
  /** Daftar bab untuk stepper. Kosongkan bila memakai `subLabel` teks biasa */
  steps?: string[];
  activeStep?: number;
  subLabel?: string;
  /** Frame judul ini masuk. Ganti per bab supaya judul naik lagi */
  start: number;
  /** Frame stepper, counter, dan badge pertama kali masuk (default = start). Isi dengan awal video agar tidak berkedip tiap ganti bab */
  subStart?: number;
  /** Logo di tepi kanan header (<Img /> atau <BrandLogo />). Mode 'umum': boleh kosong */
  logo?: React.ReactNode;
  /** Slot kiri baris data (biasanya <LiveCounter />) */
  data?: React.ReactNode;
  /** Slot kanan baris data (biasanya <StatusBadge />) */
  right?: React.ReactNode;
  keywordColor?: string;
  titleSize?: number;
  top?: number;
  side?: number;
}

export const LapisHeader: React.FC<LapisHeaderProps> = ({ stylePreset, before, keyword, after, steps, activeStep = 0, subLabel, start, subStart, logo, data, right, keywordColor, titleSize, top, side }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const L = lapisLayout(width, height);
  const pad = side ?? L.side;
  const size = titleSize ?? L.titleSize;
  const inner = width - pad * 2;
  const t = ip(frame, [start, start + 14], [0, 1], easeOutExpo);
  const s2 = subStart ?? start;
  const t2 = ip(frame, [s2 + 4, s2 + 18], [0, 1], easeOutExpo);
  const t3 = ip(frame, [s2 + 8, s2 + 22], [0, 1], easeOutExpo);
  const bg = stylePreset.palette.bg;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        paddingTop: top ?? L.headerTop,
        paddingLeft: pad,
        paddingRight: pad,
        paddingBottom: 84,
        background: `linear-gradient(180deg, ${bg} 0%, ${bg} calc(100% - 84px), ${bg}00 100%)`,
      }}
    >
      {/* Baris judul: judul mengisi sisa lebar, logo menempel di tepi kanan */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 28 }}>
        <div style={{ overflow: 'hidden', flex: 1, paddingBottom: Math.round(size * 0.1) }}>
          <div
            style={{
              fontFamily: stylePreset.typography.heading,
              fontWeight: 800,
              fontSize: size,
              lineHeight: 1.06,
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
        {logo ? <div style={{ flexShrink: 0, opacity: subStart === undefined ? t : ip(frame, [s2, s2 + 14], [0, 1], easeOutExpo) }}>{logo}</div> : null}
      </div>

      {steps && steps.length > 0 ? (
        <div style={{ marginTop: 16, opacity: t2, transform: `translateY(${(1 - t2) * 12}px)` }}>
          <LapisStepper stylePreset={stylePreset} steps={steps} active={activeStep} width={inner} minSize={L.stepperMin} maxSize={L.stepperMax} />
        </div>
      ) : subLabel ? (
        <div
          style={{
            marginTop: 16,
            fontFamily: stylePreset.typography.mono,
            fontWeight: 700,
            fontSize: L.stepperMax - 4,
            letterSpacing: '0.1em',
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
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, opacity: t3 }}>
          <div>{data}</div>
          <div>{right}</div>
        </div>
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 5. LABEL BAGIAN (pill putih + titik warna bagian)                   */
/* ------------------------------------------------------------------ */
export interface LapisLabelProps {
  stylePreset: MotionStylePreset;
  /** Titik pada objek di layar, dari projectToScreen() per frame (label ikut bergerak bersama objek) */
  anchor: [number, number];
  /** Geser pill dari titik jangkar [dx, dy] px. dx negatif = pill di kiri jangkar */
  offset: [number, number];
  text: string;
  /** Warna bagian yang ditunjuk (sama dengan warna bahan clay-nya) */
  color: string;
  start: number;
  end?: number;
  size?: number;
}

export const LapisLabel: React.FC<LapisLabelProps> = ({ stylePreset, anchor, offset, text, color, start, end, size }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  if (frame < start || (end !== undefined && frame > end + 8)) return null;
  const fs = size ?? lapisLayout(width, height).labelSize;
  warnText(text, end !== undefined ? end - (start + 12) : undefined, fps);

  const dot = ip(frame, [start, start + 6], [0, 1], easeOutExpo);
  const line = ip(frame, [start + 3, start + 12], [0, 1], easeInOutSmooth);
  const pill = springAt(frame, start + 9, fps, SPRING_PRESETS.editorialSettle);
  const exit = end !== undefined ? ip(frame, [end, end + 8], [1, 0]) : 1;

  const [ax, ay] = anchor;
  const toRight = offset[0] >= 0;
  // perkiraan lebar pill, supaya pill tidak pernah terpotong tepi layar saat kamera bergerak
  const L = lapisLayout(width, height);
  const pillW = text.length * fs * 0.72 + fs * 2.3;
  const rawX = ax + offset[0];
  const lx = toRight ? Math.min(rawX, width - L.side - pillW) : Math.max(rawX, L.side + pillW);
  const ly = clamp(ay + offset[1], L.stageTop + fs, L.stageBottom - fs);
  const len = Math.hypot(lx - ax, ly - ay);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: exit, pointerEvents: 'none' }}>
      <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }} width="100%" height="100%">
        <line x1={ax} y1={ay} x2={lx} y2={ly} stroke={stylePreset.palette.ink} strokeOpacity={0.55} strokeWidth={2} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - line)} />
        {/* jangkar: cincin kecil di objek, menandai bagian yang ditunjuk */}
        <circle cx={ax} cy={ay} r={6.5 * dot} fill="#FFFFFF" stroke={color} strokeWidth={3} />
      </svg>
      <span
        style={{
          position: 'absolute',
          left: lx,
          top: ly,
          display: 'inline-flex',
          alignItems: 'center',
          gap: Math.round(fs * 0.42),
          transform: `translate(${toRight ? '0%' : '-100%'}, -50%) scale(${0.92 + pill * 0.08})`,
          transformOrigin: toRight ? 'left center' : 'right center',
          opacity: pill,
          padding: `${Math.round(fs * 0.4)}px ${Math.round(fs * 0.72)}px`,
          borderRadius: 999,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 14px rgba(27, 34, 48, 0.13)',
          fontFamily: stylePreset.typography.heading,
          fontWeight: 700,
          fontSize: fs,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: stylePreset.palette.ink,
          whiteSpace: 'nowrap',
        }}
      >
        <svg width={Math.round(fs * 0.46)} height={Math.round(fs * 0.46)} viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
          <circle cx={5} cy={5} r={5} fill={color} />
        </svg>
        {text}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 6. CHEVRON ARAH (pengganti panah garis tipis)                       */
/* ------------------------------------------------------------------ */
export interface ChevronTrailProps {
  /** Titik awal dan akhir di layar, SEARAH gerak nyata bendanya (dari projectToScreen()) */
  from: [number, number];
  to: [number, number];
  color: string;
  /** 0..1. Pakai nilai gerak bendanya: chevron hanya tampil selama benda bergerak */
  opacity?: number;
  count?: number;
  size?: number;
  /** Putaran per detik */
  speed?: number;
}

/** Tiga chevron yang berbaris searah gerak benda (kabin naik, magnet turun, panas naik). */
export const ChevronTrail: React.FC<ChevronTrailProps> = ({ from, to, color, opacity = 1, count = 3, size = 30, speed = 1.1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (opacity <= 0.01) return null;
  const ang = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
  const s = size;
  return (
    <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }} width="100%" height="100%">
      {Array.from({ length: count }, (_, i) => {
        const u = (((frame / fps) * speed + i / count) % 1 + 1) % 1;
        const x = from[0] + (to[0] - from[0]) * u;
        const y = from[1] + (to[1] - from[1]) * u;
        return (
          <path
            key={i}
            d={`M${-s * 0.3},${-s * 0.5} L${s * 0.3},0 L${-s * 0.3},${s * 0.5}`}
            transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${ang.toFixed(1)})`}
            fill="none"
            stroke={color}
            strokeWidth={s * 0.24}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={Math.sin(Math.PI * u) * opacity}
          />
        );
      })}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* 7. KARTU MINI (perbandingan, grafik kecil)                          */
/* ------------------------------------------------------------------ */
export interface LapisCardProps {
  stylePreset: MotionStylePreset;
  start: number;
  end?: number;
  eyebrow?: string;
  left: number;
  top: number;
  width?: number;
  children?: React.ReactNode;
}

/** Kartu putih semi-transparan yang menumpang di atas objek. Isi maks 2 baris data. */
export const LapisCard: React.FC<LapisCardProps> = ({ stylePreset, start, end, eyebrow, left, top, width = 560, children }) => {
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
        padding: '30px 36px',
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        boxShadow: '0 10px 30px rgba(27, 34, 48, 0.12)',
        opacity: enter * exit,
        transform: `translateY(${(1 - enter) * 28}px)`,
        fontFamily: stylePreset.typography.body,
        fontWeight: 500,
        fontSize: 30,
        lineHeight: 1.3,
        color: stylePreset.palette.ink,
      }}
    >
      {eyebrow ? (
        <div style={{ fontFamily: stylePreset.typography.heading, fontWeight: 700, fontSize: 24, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{eyebrow}</div>
      ) : null}
      {children}
    </div>
  );
};

/** Batang perbandingan di dalam <LapisCard />. `value` 0..1, tumbuh dari `start` selama 18 frame. */
export const LapisBar: React.FC<{ label: string; value: number; color: string; start: number }> = ({ label, value, color, start }) => {
  const frame = useCurrentFrame();
  const k = ip(frame, [start, start + 18], [0, 1], easeInOutSmooth);
  return (
    <div style={{ marginBottom: 14, opacity: ip(frame, [start - 4, start + 4], [0.25, 1]) }}>
      <div style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ height: 12, borderRadius: 6, background: 'rgba(27, 34, 48, 0.08)' }}>
        <div style={{ height: 12, borderRadius: 6, width: `${clamp(value, 0, 1) * k * 100}%`, background: color }} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 8. HOOK (kalimat ditulis user)                                      */
/* ------------------------------------------------------------------ */
export interface LapisHookProps {
  stylePreset: MotionStylePreset;
  /** Kalimat hook dari user (lapisHookText()). Maks 7 kata. Baris baru di dalam teks = ganti baris manual */
  text: string;
  start: number;
  end: number;
  size?: number;
  /** Pekat tirai warna latar di belakang teks (0..1) */
  scrim?: number;
}

/** Jeda hook: tirai tipis menutup objek, kalimat besar di tengah panggung, garis aksen tumbuh di bawahnya. */
export const LapisHook: React.FC<LapisHookProps> = ({ stylePreset, text, start, end, size, scrim = 0.62 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  if (frame < start - 6 || frame > end) return null;
  const L = lapisLayout(width, height);
  warnText(text, end - 8 - (start + 10), fps);
  const veil = ip(frame, [start - 6, start + 4, end - 10, end], [0, 1, 1, 0]);
  const enter = ip(frame, [start, start + 12], [0, 1], easeOutExpo);
  const exit = ip(frame, [end - 8, end], [1, 0]);
  const bar = ip(frame, [start + 6, start + 20], [0, 1], easeInOutSmooth);
  const fs = size ?? L.hookSize;
  const cy = (L.stageTop + L.stageBottom) / 2;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: stylePreset.palette.bg, opacity: scrim * veil }} />
      <div style={{ position: 'absolute', left: L.side, right: L.side, top: cy, transform: 'translateY(-50%)', textAlign: 'center', opacity: exit }}>
        <div style={{ overflow: 'hidden', paddingBottom: Math.round(fs * 0.12) }}>
          <div
            style={{
              fontFamily: stylePreset.typography.heading,
              fontWeight: 800,
              fontSize: fs,
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
              color: stylePreset.palette.ink,
              textWrap: 'balance',
              whiteSpace: 'pre-line',
              transform: `translateY(${(1 - enter) * 60}%)`,
              opacity: enter,
            } as React.CSSProperties}
          >
            {text}
          </div>
        </div>
        <div style={{ margin: `${Math.round(fs * 0.12)}px auto 0`, height: Math.max(8, Math.round(fs * 0.08)), width: Math.round(fs * 1.6) * bar, borderRadius: 6, background: stylePreset.palette.accent }} />
      </div>
    </div>
  );
};

/** Nilai CSS `saturate()` untuk panggung selama hook: warna turun lalu kembali saat lapis pertama dilepas. */
export const hookSaturation = (frame: number, start: number, end: number, low = 0.35) => ip(frame, [start - 6, start + 4, end - 10, end], [1, low, low, 1]);

/* ------------------------------------------------------------------ */
/* 9. CAPTION (lebih bawah, selalu di bawah objek, pecah per kalimat)  */
/* ------------------------------------------------------------------ */
export interface LapisWord {
  text: string;
  startMs: number;
  endMs: number;
}

export interface LapisCaptionProps {
  words: LapisWord[];
  stylePreset: MotionStylePreset;
  sceneStartOffsetMs?: number;
  fontSize?: number;
  /** Jarak dari bawah layar. Default lapisLayout(): 9:16 = 300 px (pill y 1540-1620), 16:9 = 56 px */
  bottomOffset?: number;
  maxWordsPerLine?: number;
}

/** Pecah kata menjadi baris: maks `max` kata, dan selalu ganti baris setelah akhir kalimat (. ? !). */
export function captionLines<T extends LapisWord>(words: T[], max: number): T[][] {
  const lines: T[][] = [];
  let cur: T[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= max || /[.?!]$/.test(w.text)) {
      lines.push(cur);
      cur = [];
    }
  }
  if (cur.length) lines.push(cur);
  return lines;
}

/**
 * Caption karaoke gaya #46. Tampilan pill sama dengan #44 (satu pill gelap per baris, kata aktif diblok warna aksen),
 * tetapi posisinya lebih bawah dan satu baris tidak pernah memuat potongan dua kalimat.
 */
export const LapisCaption: React.FC<LapisCaptionProps> = ({ words, stylePreset, sceneStartOffsetMs = 0, fontSize, bottomOffset, maxWordsPerLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const L = lapisLayout(width, height);
  const fs = fontSize ?? L.captionSize;
  const nowMs = (frame / fps) * 1000 + sceneStartOffsetMs;
  if (!words || words.length === 0) return null;

  const lines = captionLines(words, maxWordsPerLine ?? (height > width ? 4 : 6));
  const idx = lines.findIndex((c, i) => {
    const s = c[0].startMs - 120;
    const e = lines[i + 1] ? Math.min(lines[i + 1][0].startMs - 20, c[c.length - 1].endMs + 600) : c[c.length - 1].endMs + 500;
    return nowMs >= s && nowMs <= e;
  });
  if (idx < 0) return null;
  const line = lines[idx];
  const enter = clamp((nowMs - (line[0].startMs - 120)) / 140, 0, 1);

  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: bottomOffset ?? L.captionBottom, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div
        style={{
          display: 'flex',
          gap: Math.round(fs * 0.22),
          padding: `${Math.round(fs * 0.3)}px ${Math.round(fs * 0.45)}px`,
          borderRadius: Math.round(fs * 0.28),
          backgroundColor: 'rgba(27, 34, 48, 0.84)',
          opacity: enter,
          transform: `translateY(${(1 - enter) * 16}px)`,
          maxWidth: width - L.side * 2,
        }}
      >
        {line.map((w, i) => {
          const active = nowMs >= w.startMs && nowMs <= w.endMs + 60;
          const spoken = nowMs > w.endMs + 60;
          return (
            <span
              key={`${w.startMs}-${i}`}
              style={{
                fontFamily: stylePreset.typography.body,
                fontWeight: 700,
                fontSize: fs,
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
                padding: `0 ${Math.round(fs * 0.16)}px`,
                borderRadius: Math.round(fs * 0.18),
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
/* 10. BADGE TOKO APLIKASI + JARI MENEKAN (CTA end card)               */
/* ------------------------------------------------------------------ */
export interface TapFingerProps {
  /** Titik yang ditekan ujung jari [x, y] di layar */
  target: [number, number];
  /** Frame jari mulai masuk */
  start: number;
  /** Frame jari menyentuh target */
  tapAt: number;
  /** Tinggi tangan (px) */
  size?: number;
  ink?: string;
}

/**
 * Tangan dengan telunjuk yang masuk dari kanan bawah, menekan `target` di frame `tapAt`, lalu mengangkat sedikit.
 * Ini kursor (fungsional), bukan ikon hiasan: hanya dipakai untuk menekan tombol atau badge yang nyata.
 * SFX klik dipasang pemanggil di frame `tapAt` (Aturan Keras 4).
 */
export const TapFinger: React.FC<TapFingerProps> = ({ target, start, tapAt, size = 190, ink = '#16243B' }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const travel = ip(frame, [start, tapAt - 2], [0, 1], easeInOutSmooth);
  const press = ip(frame, [tapAt - 2, tapAt, tapAt + 5, tapAt + 12], [0, 1, 1, 0], (x) => x);
  const lift = ip(frame, [tapAt + 5, tapAt + 16], [0, 1], easeInOutSmooth);
  const s = size / 150;
  // ujung telunjuk ada di (57, 10) pada viewBox 120x150
  const x = target[0] - 57 * s + (1 - travel) * 190 + lift * 14;
  const y = target[1] - 10 * s + (1 - travel) * 300 + lift * 30 + press * 5;
  const shapes = (
    <>
      <rect x={44} y={6} width={26} height={84} rx={13} />
      <rect x={30} y={64} width={72} height={72} rx={26} />
      <rect x={68} y={52} width={19} height={40} rx={9.5} />
      <rect x={84} y={58} width={18} height={40} rx={9} />
      <rect x={12} y={74} width={24} height={50} rx={12} transform="rotate(-28 24 99)" />
    </>
  );
  return (
    <svg
      width={120 * s}
      height={150 * s}
      viewBox="0 0 120 150"
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', pointerEvents: 'none', opacity: ip(frame, [start, start + 6], [0, 1]), transform: `rotate(-14deg) scale(${1 - press * 0.07})`, transformOrigin: '47% 7%' }}
    >
      <g fill={ink} stroke={ink} strokeWidth={11} strokeLinejoin="round">
        {shapes}
      </g>
      <g fill="#FFFFFF">{shapes}</g>
    </svg>
  );
};

export interface StoreBadgeTapProps {
  /** Badge toko RESMI sebagai <Img /> (mis. assets/badges/google-play-id.png). Jangan digambar atau diketik ulang */
  badge: React.ReactNode;
  /** Titik tengah badge di layar */
  center: [number, number];
  width: number;
  height: number;
  /** Frame badge masuk */
  start: number;
  /** Frame jari menekan badge (tambatkan ke kata ajakan di narasi, mis. "download") */
  tapAt: number;
  /** Warna riak tekan */
  ripple?: string;
  ink?: string;
}

/**
 * CTA end card gaya #46: badge toko aplikasi resmi + jari yang menekannya.
 * Badge masuk, jari datang dan menekan di `tapAt`, badge mengecil sesaat (utuh, tanpa distorsi) dan riak menyebar.
 */
export const StoreBadgeTap: React.FC<StoreBadgeTapProps> = ({ badge, center, width, height, start, tapAt, ripple = '#244DA9', ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start) return null;
  const enter = springAt(frame, start, fps, SPRING_PRESETS.editorialSettle);
  const press = ip(frame, [tapAt - 1, tapAt + 1, tapAt + 4, tapAt + 12], [0, 1, 1, 0], (x) => x);
  const ring = ip(frame, [tapAt, tapAt + 18], [0, 1], easeOutExpo);
  // titik tekan di sisi kanan bawah badge supaya tulisan badge tetap terbaca di balik jari
  const tapPt: [number, number] = [center[0] + width * 0.3, center[1] + height * 0.2];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: center[0] - width / 2,
          top: center[1] - height / 2,
          width,
          height,
          opacity: Math.min(1, enter * 1.6),
          transform: `translateY(${(1 - enter) * 34}px) scale(${1 - press * 0.045})`,
        }}
      >
        {badge}
      </div>
      {frame >= tapAt ? (
        <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }} width="100%" height="100%">
          <circle cx={tapPt[0]} cy={tapPt[1]} r={20 + ring * 150} fill="none" stroke={ripple} strokeWidth={3 + 11 * (1 - ring)} opacity={(1 - ring) * 0.85} />
          <circle cx={tapPt[0]} cy={tapPt[1]} r={12 + ring * 80} fill={ripple} opacity={(1 - ring) * 0.22} />
        </svg>
      ) : null}
      <TapFinger target={tapPt} start={Math.max(start + 6, tapAt - 16)} tapAt={tapAt} ink={ink} />
    </div>
  );
};
