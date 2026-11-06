#!/usr/bin/env node
/**
 * scripts/export-srt.mjs
 * words.json (timestamp kata asli dari narrator-sync) -> subtitle .srt (dan .vtt opsional)
 * untuk diunggah terpisah ke YouTube / TikTok / Reels sebagai caption tertutup.
 *
 *   node export-srt.mjs --words public/words.json --out out/v1.srt [--vtt] [--max-words 7] [--max-chars 42]
 *
 * Aturan pemotongan baris: berhenti di akhir kalimat (. ! ?), di koma bila baris sudah >= 3 kata,
 * saat pindah scene, atau saat batas kata/karakter tercapai. Durasi cue minimal 700 ms.
 */

import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const a = { words: 'public/words.json', out: 'out/subtitles.srt', vtt: false, maxWords: 7, maxChars: 42, minMs: 700, tailMs: 250 };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--words' && v) a.words = v;
    if (k === '--out' && v) a.out = v;
    if (k === '--vtt') a.vtt = true;
    if (k === '--max-words' && v) a.maxWords = Number(v);
    if (k === '--max-chars' && v) a.maxChars = Number(v);
  }
  return a;
}

const opts = parseArgs(process.argv);
const words = JSON.parse(fs.readFileSync(path.resolve(opts.words), 'utf8'));
if (!Array.isArray(words) || !words.length) {
  console.error(`[export-srt] ${opts.words} kosong`);
  process.exit(2);
}

const cues = [];
let cur = [];
const flush = () => {
  if (cur.length) cues.push(cur);
  cur = [];
};
words.forEach((w, i) => {
  const next = words[i + 1];
  const text = [...cur.map((x) => x.text), w.text].join(' ');
  if (cur.length && (text.length > opts.maxChars || cur.length >= opts.maxWords)) flush();
  cur.push(w);
  const endSentence = /[.!?…]["')\]]*$/.test(w.text);
  const comma = /[,;:]$/.test(w.text) && cur.length >= 3;
  const sceneChange = next && next.scene && w.scene && next.scene !== w.scene;
  const longGap = next && next.startMs - w.endMs > 450;
  if (endSentence || comma || sceneChange || longGap) flush();
});
flush();

const ts = (ms, sep) => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const r = Math.round(ms % 1000);
  const p = (n, l = 2) => String(n).padStart(l, '0');
  return `${p(h)}:${p(m)}:${p(s)}${sep}${p(r, 3)}`;
};

const timed = cues.map((c, i) => {
  const start = c[0].startMs;
  const nextStart = cues[i + 1] ? cues[i + 1][0].startMs : Infinity;
  let end = Math.max(c.at(-1).endMs + opts.tailMs, start + opts.minMs);
  end = Math.min(end, nextStart - 20);
  return { start, end: Math.max(end, start + 200), text: c.map((w) => w.text).join(' ') };
});

const srt = timed.map((c, i) => `${i + 1}\n${ts(c.start, ',')} --> ${ts(c.end, ',')}\n${c.text}\n`).join('\n');
const outPath = path.resolve(opts.out);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, srt, 'utf8');
console.log(`[export-srt] ${timed.length} cue -> ${path.relative(process.cwd(), outPath)}`);

if (opts.vtt) {
  const vtt = 'WEBVTT\n\n' + timed.map((c) => `${ts(c.start, '.')} --> ${ts(c.end, '.')}\n${c.text}\n`).join('\n');
  const vttPath = outPath.replace(/\.srt$/i, '') + '.vtt';
  fs.writeFileSync(vttPath, vtt, 'utf8');
  console.log(`[export-srt] -> ${path.relative(process.cwd(), vttPath)}`);
}
