#!/usr/bin/env node
/**
 * scripts/vo-lint.mjs
 * Lint naskah VO sebelum diminta approval (Stage 3) dan setelah VO disintesis (Stage 4).
 *
 *   node vo-lint.mjs --script research/vo-script.md [--timing research/vo-timing.json] [--lang id] [--hook-max 3]
 *
 * Aturan:
 *   1. Budget kata: kata/detik per scene <= 2.5 (id) / 2.8 (en). Tanpa --timing dihitung dari durasi
 *      rencana di heading (## S1 · 0–3); dengan --timing dihitung dari durasi VO asli.
 *   2. Hook: scene pertama bertag `hook` dan selesai <= 3 dtk (rencana dan, bila ada, VO asli).
 *   3. CTA: scene terakhir bertag `cta` atau mengandung kata ajakan (follow, ikuti, klik, cek, ...).
 *   4. Hygiene: tidak ada emoji, tidak ada scene kosong, heading berurutan tanpa celah waktu, penanda
 *      [semangat]/[pelan] berpasangan, panjang kalimat <= 18 kata (mudah diucapkan dalam satu napas).
 * Exit code 1 bila ada issue; warning tidak menggagalkan.
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadVoScript, WPS_BUDGET } from './lib/vo-script.mjs';

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/u;
const CTA_WORDS = /\b(follow|ikuti|klik|cek|kunjungi|simpan|save|bagikan|share|komentar|komen|link|daftar|coba|unduh|download|subscribe|langganan|tonton)\b/i;

function parseArgs(argv) {
  const a = { script: 'research/vo-script.md', timing: null, lang: null, hookMax: 3, maxSentence: 18 };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--script' && v) a.script = v;
    if (k === '--timing' && v) a.timing = v;
    if (k === '--lang' && v) a.lang = v;
    if (k === '--hook-max' && v) a.hookMax = Number(v);
    if (k === '--max-sentence' && v) a.maxSentence = Number(v);
  }
  if (!a.timing && fs.existsSync('research/vo-timing.json')) a.timing = 'research/vo-timing.json';
  return a;
}

const opts = parseArgs(process.argv);
const raw = fs.readFileSync(path.resolve(opts.script), 'utf8');
const script = loadVoScript(path.resolve(opts.script));
const lang = (opts.lang || script.meta.bahasa || 'id').toLowerCase().startsWith('en') ? 'en' : 'id';
const budget = WPS_BUDGET[lang];
const timing = opts.timing && fs.existsSync(opts.timing) ? JSON.parse(fs.readFileSync(opts.timing, 'utf8')) : null;
const issues = [];
const warnings = [];
const rows = [];

if (!script.scenes.length) issues.push('Tidak ada scene. Format heading: "## S1 · 0–3 · hook".');
if (EMOJI.test(raw)) issues.push('Ada emoji di naskah (aturan zero-emoji).');
if (/<[^>\n]{3,}>/.test(raw.replace(/<!--[\s\S]*?-->/g, ''))) issues.push('Masih ada placeholder <...> dari template yang belum diganti.');
for (const tag of ['semangat', 'pelan']) {
  const open = raw.split(`[${tag}]`).length - 1;
  const close = raw.split(`[/${tag}]`).length - 1;
  if (open !== close) warnings.push(`[${tag}] dibuka ${open}x, ditutup ${close}x. Penanda tanpa penutup berlaku sampai [jeda] atau akhir scene.`);
}

script.scenes.forEach((s, i) => {
  const t = timing?.scenes?.find((x) => x.id === s.id);
  const planSec = s.endSec - s.startSec;
  const realSec = t ? (t.voEndMs - t.voStartMs) / 1000 : null;
  const planWps = planSec > 0 ? s.words / planSec : Infinity;
  const realWps = realSec ? s.words / realSec : null;
  rows.push({ id: s.id, tags: s.tags.join(',') || '-', words: s.words, planSec, planWps, realSec, realWps });

  if (!s.words) issues.push(`${s.id}: scene kosong.`);
  if (planSec <= 0) issues.push(`${s.id}: durasi heading ${s.startSec}–${s.endSec} tidak valid.`);
  const prev = script.scenes[i - 1];
  if (prev && Math.abs(prev.endSec - s.startSec) > 0.01) warnings.push(`${s.id}: mulai ${s.startSec} dtk, scene sebelumnya selesai ${prev.endSec} dtk (ada celah/tumpang tindih).`);
  if (planWps > budget) {
    const maxWords = Math.floor(planSec * budget);
    issues.push(`${s.id}: ${s.words} kata dalam ${planSec} dtk = ${planWps.toFixed(2)} kata/dtk > ${budget}. Pangkas ke <= ${maxWords} kata atau perpanjang scene ke >= ${Math.ceil((s.words / budget) * 10) / 10} dtk.`);
  }
  if (realWps && realWps > budget + 0.3) warnings.push(`${s.id}: VO asli ${realWps.toFixed(2)} kata/dtk (narator terlalu cepat untuk dibaca subtitle). Turunkan rate atau tambah [jeda].`);
  for (const sent of s.text.split(/(?<=[.!?])\s+/)) {
    const n = sent.split(/\s+/).filter(Boolean).length;
    if (n > opts.maxSentence) warnings.push(`${s.id}: kalimat ${n} kata ("${sent.slice(0, 40)}..."). Pecah jadi 2 kalimat (maks ${opts.maxSentence}).`);
  }
});

const first = script.scenes[0];
const last = script.scenes.at(-1);
if (first) {
  if (!first.tags.includes('hook')) issues.push(`${first.id}: scene pertama wajib bertag hook (## ${first.id} · ${first.startSec}–${first.endSec} · hook).`);
  if (first.endSec > opts.hookMax) issues.push(`${first.id}: hook selesai di ${first.endSec} dtk > ${opts.hookMax} dtk. Penonton memutuskan scroll dalam 3 detik pertama.`);
  const t = timing?.scenes?.find((x) => x.id === first.id);
  if (t && t.voEndMs / 1000 > opts.hookMax) issues.push(`${first.id}: kalimat hook di VO asli selesai ${(t.voEndMs / 1000).toFixed(2)} dtk > ${opts.hookMax} dtk. Pendekkan hook.`);
}
if (last && script.scenes.length > 1) {
  if (!last.tags.includes('cta') && !CTA_WORDS.test(last.text)) issues.push(`${last.id}: scene terakhir wajib CTA (tag cta atau kata ajakan seperti follow/simpan/komentar/cek link).`);
  else if (!CTA_WORDS.test(last.text)) warnings.push(`${last.id}: bertag cta tapi tidak ada kata ajakan yang jelas.`);
}
const ctaElsewhere = script.scenes.slice(0, -1).find((s) => s.tags.includes('cta'));
if (ctaElsewhere) warnings.push(`${ctaElsewhere.id}: tag cta di tengah video. CTA utama sebaiknya di scene terakhir.`);

const f2 = (n) => (n == null ? '-' : Number.isFinite(n) ? n.toFixed(2) : 'inf');
const table = [
  `| Scene | Tag | Kata | Rencana (dtk) | Kata/dtk | VO asli (dtk) | Kata/dtk asli |`,
  `|---|---|---|---|---|---|---|`,
  ...rows.map((r) => `| ${r.id} | ${r.tags} | ${r.words} | ${r.planSec} | ${f2(r.planWps)}${r.planWps > budget ? ' (lewat)' : ''} | ${f2(r.realSec)} | ${f2(r.realWps)} |`),
].join('\n');

console.log(`Budget ${lang}: ${budget} kata/dtk${timing ? ` · timing: ${opts.timing} (${timing.source})` : ' · timing: rencana heading'}\n\n${table}\n`);
console.log(JSON.stringify({ status: issues.length ? 'FAIL' : 'PASS', warnings, issues }, null, 2));
if (issues.length) process.exitCode = 1;
