/**
 * Jadwal beat (satu sumber kebenaran). Tabel yang sama ada di `research/storyboard.md`.
 *
 * Batas scene dan kata diambil dari rekaman narator (ElevenLabs, dibuat user):
 * `research/vo-timing.json` + `public/words.json`, hasil `narrator-sync.mjs --audio` (faster-whisper).
 * Tiap beat ditambatkan ke kata yang diucapkan (`w()`), jadi kalau rekaman diganti dan narrator-sync
 * dijalankan ulang, semua beat ikut bergeser. Frame @30 fps.
 */
import timing from '../research/vo-timing.json';
import wordsJson from '../public/words.json';

export const FPS = 30;
export type Span = [number, number];
type SceneId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9' | 'S10' | 'S11';

interface W {
  text: string;
  startMs: number;
  endMs: number;
  scene: string;
}
const WORDS = wordsJson as W[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, '');
const fr = (ms: number) => Math.round((ms / 1000) * FPS);

/** Frame awal kata ke-`nth` bertuliskan `text` di scene `scene`. */
export function w(scene: SceneId, text: string, nth = 0): number {
  const hit = WORDS.filter((x) => x.scene === scene && norm(x.text) === norm(text))[nth];
  if (!hit) throw new Error(`kata "${text}" (${nth}) tidak ada di ${scene}`);
  return fr(hit.startMs);
}
/** Frame akhir kata terakhir di scene (narasi scene itu selesai). */
const said = (scene: SceneId) => fr(Math.max(...WORDS.filter((x) => x.scene === scene).map((x) => x.endMs)));

const scenes = (timing as { scenes: { id: string; startFrame: number; durationInFrames: number }[] }).scenes;
export const SCENE = Object.fromEntries(scenes.map((s) => [s.id, [s.startFrame, s.startFrame + s.durationInFrames]])) as Record<SceneId, Span>;
/** Durasi dikunci 60 detik (aturan gaya #46). Narasi dipadatkan dengan `scripts/tighten-vo.mjs` milik skill motion-craft supaya muat. */
export const TOTAL_FRAMES = 1800;
export const TIMING_SOURCE = (timing as { source: string }).source;

const S = SCENE;
const hookIn = w('S2', 'Yuh,') - 4;
const veilMid = w('S2', 'takon-takon') + 4;
const peel = w('S3', 'bawah') + 4;
const close = said('S9') + 12;
if (said('S11') + 12 > TOTAL_FRAMES) throw new Error(`narasi selesai di frame ${said('S11')}, tidak muat di ${TOTAL_FRAMES} frame`);

export const T = {
  /* S1 hook: keran kering, dua tetes */
  drips: [
    [S.S1[0] + 14, S.S1[0] + 42],
    [S.S1[0] + 50, S.S1[0] + 80],
  ] as Span[],

  /* S2 kalimat hook user. Di tengahnya tirai menutup penuh dan kamera pindah dari keran ke bidikan utuh */
  hook: [hookIn, w('S3', 'Di') + 4] as Span,
  veil: [veilMid - 10, veilMid - 3, veilMid + 3, veilMid + 12] as [number, number, number, number],
  camJump: veilMid,

  /* S3 buka tanah: 5 lapis dilepas berurutan saat "di bawah tanah ada pipa panjang" */
  peel,
  peelEach: 22,
  peelGap: 12,
  lblTank: [w('S3', 'tandon') - 6, S.S3[1] - 6] as Span,
  lblHome: [w('S3', 'rumah') - 6, S.S3[1] - 6] as Span,

  /* S4 bab 01 ALIRAN */
  toTank: [S.S3[1] - 6, S.S3[1] + 22] as Span,
  lblReservoir: [w('S4', 'reservoir,') - 8, w('S4', 'Lewat') - 8] as Span,
  tankToO: [w('S4', 'Lewat') - 10, w('S4', 'Lewat') + 18] as Span,
  lblMain: [w('S4', 'besar,') + 1, w('S4', 'kecil,') - 2] as Span,
  lblDist: [w('S4', 'kecil,'), S.S4[1] - 4] as Span,
  flowChev: [w('S4', 'turun'), S.S4[1] - 2] as Span,

  /* S5 bab 02 PERBAIKAN */
  toValve: [S.S5[0] - 2, S.S5[0] + 26] as Span,
  valveClose: [w('S5', 'alirannya'), w('S5', 'alirannya') + 30] as Span,
  badgeClosed: [w('S5', 'ditutup') + 12, S.S5[1] - 2] as Span,
  valveToMain: [w('S5', 'dulu.') + 4, w('S5', 'dulu.') + 30] as Span,
  recedeMain: [w('S5', 'Airnya') + 8, w('S5', 'pipanya') + 12] as Span,
  recedeDist: [w('S5', 'Airnya') + 12, w('S5', 'pipanya') + 16] as Span,
  lblEmpty: [w('S5', 'pipanya') - 4, S.S5[1] - 2] as Span,

  /* S6 bab 03 ISI PIPA */
  valveOpen: [w('S6', 'dibuka') - 6, w('S6', 'dibuka') + 20] as Span,
  fillMain: [w('S6', 'air') - 4, w('S6', 'Baru') + 16] as Span,
  mainToStreet: [w('S6', 'Baru') + 2, w('S6', 'Baru') + 30] as Span,
  fillDist: [w('S6', 'kecil,') - 6, w('S6', 'Mirip') - 6] as Span,
  counter: [w('S6', 'air') - 4, w('S6', 'Mirip') - 6] as Span,
  hose: [w('S6', 'Mirip') - 4, S.S6[1] - 4] as Span,

  /* S7 bab 04 ANGIN */
  toHump: [S.S7[0] - 2, S.S7[0] + 26] as Span,
  lblAir: [w('S7', 'angin') - 8, w('S7', 'Angin') - 4] as Span,
  vent1: [w('S7', 'dibuang'), w('S7', 'Kalau') - 6] as Span,
  lblAirValve: [w('S7', 'katup') - 6, w('S7', 'Kalau') - 6] as Span,
  lblStutter: [w('S7', 'Kalau') + 2, S.S7[1] - 4] as Span,
  vent2: [S.S7[1] - 18, S.S7[1] + 4] as Span,

  /* S8 bab 05 KERAN */
  toGauge: [S.S8[0], S.S8[0] + 26] as Span,
  lblPush: [w('S8', 'dorongan') - 8, w('S8', 'Baru') - 10] as Span,
  pressureUp: [w('S8', 'dorongan') + 6, w('S8', 'pulih.') + 14] as Span,
  toTap: [w('S8', 'Baru') - 8, w('S8', 'Baru') + 20] as Span,
  tapFlow: [w('S8', 'keluar') - 6, w('S8', 'keluar') + 10] as Span,
  sinkFill: [w('S8', 'keluar') + 4, w('S8', 'keluar') + 46] as Span,
  lblTap: [w('S8', 'keluar') - 2, w('S8', 'keluar') + 48] as Span,

  /* S9 faktor: label di dunia, satu per faktor, lalu tampil bersama */
  tapToO: [w('S8', 'keluar') + 50, w('S8', 'keluar') + 84] as Span,
  lblHigh: [w('S9', 'tinggi') - 6, close] as Span,
  lblFar: [w('S9', 'jauh') - 6, close] as Span,
  lblBig: [w('S9', 'besar') - 6, close] as Span,

  /* S10 tutup: lapis dipasang kembali, lalu layar Tiray + kartu WhatsApp */
  close: close + 2,
  closeEach: 18,
  closeGap: 7, // lebih rapat dari saat dibuka: dunia harus sudah utuh sebelum layar Tiray masuk
  dim: [w('S10', 'Info') - 6, w('S10', 'Info') + 12] as Span,
  phone: w('S10', 'Info') - 2,
  lblInfo: [w('S10', 'gangguan') + 4, w('S10', 'atau') - 8] as Span,
  waCard: w('S10', 'atau') - 4, // muncul sejak "atau tanya lewat WhatsApp" supaya nomornya sempat terbaca
  phoneOut: [w('S11', 'Yuh') - 8, w('S11', 'Yuh') + 2] as Span,

  /* S11 CTA: tagar kampanye sebagai beat sendiri, lalu end card logo */
  hashtag: [w('S11', 'Yuh') - 4, w('S11', 'Monggo,') + 4] as Span,
  endCard: w('S11', 'Monggo,') - 2,
  /* badge Google Play masuk setelah logo, jari menekannya tepat di kata "download" */
  badge: w('S11', 'Monggo,') + 8,
  tap: w('S11', 'download') + 4,
} as const;

/** Bab stepper aktif: -1 sebelum bab 01, 0..4 selama S4..S8, 5 sesudahnya (tidak ada yang disorot). */
export function activeStep(f: number): number {
  const starts = [S.S4[0], S.S5[0], S.S6[0], S.S7[0], S.S8[0], S.S9[0]];
  let v = -1;
  for (let i = 0; i < starts.length; i++) {
    if (f < starts[i]) break;
    v = i - 1 + Math.min(1, (f - starts[i]) / 8);
  }
  return v;
}
