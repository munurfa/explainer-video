#!/usr/bin/env node
/**
 * Memadatkan rekaman narator ke durasi target tanpa merekam ulang:
 *   1. jeda antarkata yang panjang dipendekkan (bagian paling senyap di tengah jeda dibuang),
 *   2. sisanya dipercepat dengan ffmpeg atempo (nada tetap).
 * Rekaman asli tidak diubah.
 *
 *   node "<skill>/scripts/tighten-vo.mjs" --in public/audio/narration.mp3 --words public/words.json \
 *        --out public/audio/narration-60.mp3 --target 59.4
 *
 * Dipakai gaya #46 (durasi dikunci 60 detik). Tempo di atas 1,15 diberi peringatan: pendekkan naskah.
 * `--words` harus timing kata dari rekaman ASLI (narrator-sync --audio). Setelah itu jalankan lagi
 * narrator-sync pada file hasil untuk mendapat words.json dan vo-timing.json yang baru.
 */
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const arg = (k, d) => {
  const i = process.argv.indexOf(k);
  return i >= 0 ? process.argv[i + 1] : d;
};
const IN = arg('--in');
const OUT = arg('--out');
const WORDS = JSON.parse(fs.readFileSync(arg('--words'), 'utf8'));
const TARGET = Number(arg('--target', '59.4')); // detik, panjang file hasil
const KEEP = Number(arg('--keep', '0.24')); // jeda yang disisakan (detik)
const MIN_GAP = Number(arg('--min-gap', '0.32')); // jeda lebih pendek dari ini tidak disentuh
const QUIET_DB = Number(arg('--quiet', '-30')); // bagian yang dibuang harus lebih senyap dari ini (dBFS RMS)
const SR = 44100;

const dec = spawnSync('ffmpeg', ['-v', 'error', '-i', IN, '-ac', '1', '-ar', String(SR), '-f', 's16le', '-'], { maxBuffer: 1 << 28 });
if (dec.status !== 0) throw new Error(dec.stderr.toString());
const pcm = new Int16Array(dec.stdout.buffer, dec.stdout.byteOffset, dec.stdout.length >> 1);
const N = pcm.length;
const sec = (s) => Math.round(s * SR);

// energi kumulatif untuk RMS jendela cepat
const cum = new Float64Array(N + 1);
for (let i = 0; i < N; i++) cum[i + 1] = cum[i] + (pcm[i] / 32768) ** 2;
const rmsDb = (a, b) => 10 * Math.log10(Math.max(1e-12, (cum[b] - cum[a]) / Math.max(1, b - a)));

const cuts = [];
const tryCut = (g0, g1, label) => {
  const gap = g1 - g0;
  if (gap < MIN_GAP) return;
  const remove = sec(gap - KEEP);
  const lo = sec(g0 + 0.07);
  const hi = sec(g1 - 0.07) - remove;
  if (remove < sec(0.05) || hi <= lo) return;
  let best = lo;
  let bestDb = Infinity;
  for (let s = lo; s <= hi; s += 64) {
    const d = rmsDb(s, s + remove);
    if (d < bestDb) {
      bestDb = d;
      best = s;
    }
  }
  if (bestDb > QUIET_DB) {
    console.log(`lewati ${label}: jeda ${gap.toFixed(2)} dtk tidak cukup senyap (${bestDb.toFixed(1)} dB)`);
    return;
  }
  cuts.push([best, best + remove]);
};
for (let i = 1; i < WORDS.length; i++) tryCut(WORDS[i - 1].endMs / 1000, WORDS[i].startMs / 1000, `"${WORDS[i - 1].text} | ${WORDS[i].text}"`);
// ekor setelah kata terakhir: sisakan 0,3 dtk
const lastEnd = sec(WORDS.at(-1).endMs / 1000 + 0.3);
if (lastEnd < N) cuts.push([lastEnd, N]);

// susun ulang dengan crossfade 8 ms di tiap sambungan
const XF = sec(0.008);
const out = [];
let pos = 0;
const push = (a, b, fadeIn) => {
  for (let i = a; i < b; i++) {
    const k = fadeIn && i - a < XF ? (i - a) / XF : 1;
    out.push(pcm[i] * k);
  }
};
let first = true;
for (const [a, b] of cuts) {
  // fade-out singkat sebelum potongan
  push(pos, a - XF, !first);
  for (let i = 0; i < XF; i++) out.push(pcm[a - XF + i] * (1 - i / XF));
  pos = b;
  first = false;
}
if (pos < N) push(pos, N, true);
const cutSec = out.length / SR;
const tempo = Math.max(1, cutSec / TARGET);
if (tempo > 1.15) console.warn(`PERINGATAN: tempo ${tempo.toFixed(3)} > 1,15. Suara mulai terdengar terburu-buru; pertimbangkan memendekkan naskah.`);

const tmp = OUT.replace(/\.\w+$/, '.tmp.raw');
fs.writeFileSync(tmp, Buffer.from(Int16Array.from(out, (v) => Math.max(-32768, Math.min(32767, Math.round(v)))).buffer));
const enc = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 's16le', '-ar', String(SR), '-ac', '1', '-i', tmp, '-af', `atempo=${tempo.toFixed(4)}`, '-c:a', 'libmp3lame', '-b:a', '160k', OUT]);
fs.unlinkSync(tmp);
if (enc.status !== 0) throw new Error(enc.stderr.toString());
console.log(JSON.stringify({ asli: +(N / SR).toFixed(2), jedaDipendekkan: cuts.length - 1, setelahPotong: +cutSec.toFixed(2), tempo: +tempo.toFixed(4), hasil: +(cutSec / tempo).toFixed(2) }));
