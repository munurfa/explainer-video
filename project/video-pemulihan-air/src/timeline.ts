/**
 * Jadwal beat (satu sumber kebenaran). v4 = v3 dipercepat ke tepat 60 dtk: angka di `T_V3` adalah frame v3,
 * semuanya dikali `K` (narasi v3 di-atempo dengan rasio yang sama). Frame @30fps, selaras VO Gemini Laomedeia
 * (`public/words-v4.json`, `research/vo-timing-v4.json`). Tabel yang sama ada di `research/storyboard.md`.
 *
 * Aturan gaya #44: satu elemen bergerak per beat. Kamera = satu beat (zoom 24–30 f), mekanisme jalan
 * saat kamera diam, callout tidak muncul saat kamera bergerak, bersihkan 8 f sebelum mundur ke O.
 */
import wordsJson from '../public/words-v4.json';
import timingJson from '../research/vo-timing-v4.json';

interface W {
  text: string;
  startMs: number;
  endMs: number;
  scene: string;
}
const WORDS = wordsJson as W[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, '');

/** Frame awal kata ke-`nth` bertuliskan `text` di scene `scene`. Untuk cek sinkron di storyboard. */
export function wf(scene: string, text: string, nth = 0): number {
  const hits = WORDS.filter((w) => w.scene === scene && norm(w.text) === norm(text));
  const w = hits[nth];
  if (!w) throw new Error(`kata "${text}" (${nth}) tidak ada di ${scene}`);
  return Math.round((w.startMs / 1000) * 30);
}

export const TOTAL_FRAMES = Math.ceil((timingJson as { totalMs: number }).totalMs / (1000 / 30));

/** Rasio durasi v4 / v3 (65,026 dtk -> 60 dtk) */
export const K = 60000 / 65026;
/** Frame v3 -> frame v4 */
export const sf = (f: number) => Math.round(f * K);

/** Batas scene VO (frame) */
export const SCENE = {
  S1: [0, 95],
  S2: [95, 165],
  S3: [165, 414],
  S4: [414, 592],
  S5: [592, 826],
  S6: [826, 1070],
  S7: [1070, 1242],
  S8: [1242, 1473],
  S9: [1473, 1682],
  S10: [1682, TOTAL_FRAMES],
} as const;

export type Span = [number, number];

const T_V3 = {
  /* S1 hook: keran kering, dua tetes */
  drips: [
    [18, 30, 47],
    [58, 70, 87],
  ] as [number, number, number][],

  /* S2 "Yuh Jakwir, kita bedah." */
  grayIn: [104, 116] as Span,
  title: 116,
  titleLine: [124, 138] as Span,
  titleOut: [146, 156] as Span,
  camToO1: [158, 186] as Span, // kamera mundur ke O, warna kembali
  cut: [188, 210] as Span, // cutaway rumah & pipa menyapu, air tampil
  flowLines: [210, 226] as Span,

  /* S3 01 ALIRAN */
  camToTank: [226, 254] as Span,
  calloutTank: [256, 318] as Span,
  camTankToO: [326, 352] as Span,
  arrowMain: [354, 374] as Span,
  calloutBig: [374, 404] as Span,
  arrowDist: [406, 426] as Span,
  calloutSmall: [426, 474] as Span,

  /* S4 02 PERBAIKAN */
  camToValve: [482, 508] as Span,
  valveClose: [512, 536] as Span,
  badgeClosed: 536,
  recedeMain: [548, 600] as Span,
  recedeDist: [554, 604] as Span,
  calloutEmpty: [604, 640] as Span,

  /* S5 03 ISI PIPA */
  valveOpen: [648, 672] as Span,
  camValveToO: [680, 706] as Span,
  fillMain: [708, 766] as Span,
  fillDist: [768, 826] as Span,
  calloutHose: [836, 884] as Span,

  /* S6 04 ANGIN */
  camToHump: [896, 924] as Span,
  badgeBig: 926,
  calloutAir: [930, 976] as Span,
  bubbleEscape: 1000, // gelembung ke-i keluar di 1000 + i*7
  arrowUp: [1000, 1048] as Span,
  calloutValve: [1056, 1108] as Span,
  calloutNoValve: [1114, 1162] as Span,
  camHumpToO: [1170, 1196] as Span,

  /* S7 05 KERAN */
  camToGauge: [1204, 1230] as Span,
  calloutPush: [1230, 1262] as Span,
  pressureUp: [1250, 1276] as Span,
  camGaugeToO: [1280, 1300] as Span,
  camToTap: [1302, 1326] as Span,
  tapFlow: [1326, 1336] as Span,
  sinkFill: [1336, 1396] as Span,
  calloutTap: [1338, 1388] as Span,

  /* S8 faktor */
  camTapToO: [1392, 1420] as Span,
  worldDim: [1420, 1436] as Span,
  recapCard: [1436, 1586] as Span,
  recapItems: [1452, 1489, 1526, 1563],
  worldOut: [1586, 1600] as Span,

  /* S9–S10 Tiray: ponsel tetap tampil sampai akhir; CTA "Yuh buka Tiray!" hanya di narasi (tagar & end card dihapus) */
  phoneIn: 1604,
  calloutInfo: [1676, 1951 - 14] as Span,
  waCard: [1786, 1951 - 14] as Span,
  phoneOut: [1951 - 12, 1951] as Span,
} as const;

type Scaled<V> = V extends number ? number : V extends readonly unknown[] ? { [I in keyof V]: Scaled<V[I]> } : { [P in keyof V]: Scaled<V[P]> };
const scale = <V>(v: V): Scaled<V> =>
  (typeof v === 'number' ? sf(v) : Array.isArray(v) ? v.map(scale) : Object.fromEntries(Object.entries(v as object).map(([k, x]) => [k, scale(x)]))) as Scaled<V>;

/** Jadwal beat v4 (frame final) */
export const T = scale(T_V3);
