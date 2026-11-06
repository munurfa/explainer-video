#!/usr/bin/env node
/**
 * scripts/deliverables.mjs
 * Paket serah-terima akhir: MP4 + SRT + caption & hashtag per platform + judul YT Shorts + jam posting.
 *
 *   # 1. Buat kerangka research/deliverables.md (diisi Claude dari naskah VO yang sudah di-approve)
 *   node deliverables.mjs --init --video out/v1.mp4 --srt out/v1.srt --script research/vo-script.md
 *   # 2. Validasi sebelum diserahkan ke user
 *   node deliverables.mjs --check research/deliverables.md
 *
 * Validasi --check:
 *   - file MP4 & SRT yang dirujuk ada; MP4 = H.264 + AAC, 30 fps (dibaca via ffprobe)
 *   - tiap platform (Instagram Reels, TikTok, YouTube Shorts) punya caption dan 5–10 hashtag
 *   - caption dalam batas karakter platform (IG 2200, TikTok 4000, YT deskripsi 5000)
 *   - 3 opsi judul YT Shorts, masing-masing <= 100 karakter (disarankan <= 60)
 *   - ada rekomendasi jam posting
 *   - tidak ada placeholder <...> tersisa dan tidak ada emoji (aturan zero-emoji skill)
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const PLATFORMS = [
  { key: 'Instagram Reels', max: 2200 },
  { key: 'TikTok', max: 4000 },
  { key: 'YouTube Shorts', max: 5000 },
];
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/u;

function parseArgs(argv) {
  const a = { init: false, check: null, out: 'research/deliverables.md', video: 'out/v1.mp4', srt: 'out/v1.srt', script: 'research/vo-script.md' };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--init') a.init = true;
    if (k === '--check') a.check = v && !v.startsWith('--') ? v : a.out;
    if (k === '--out' && v) a.out = v;
    if (k === '--video' && v) a.video = v;
    if (k === '--srt' && v) a.srt = v;
    if (k === '--script' && v) a.script = v;
  }
  return a;
}
const opts = parseArgs(process.argv);

function template() {
  let title = '<judul video>';
  if (fs.existsSync(opts.script)) {
    const m = fs.readFileSync(opts.script, 'utf8').match(/^#\s+Naskah VO\s+[—-]\s+(.+)$/m);
    if (m) title = m[1].trim();
  }
  const block = (p) => `## ${p.key}

**Caption:**
<caption ${p.key}: hook di kalimat pertama, 1–3 kalimat isi, CTA; maks ${p.max} karakter>

**Hashtag (5–10):**
<#tag1 #tag2 #tag3 #tag4 #tag5>
`;
  return `# Deliverables — ${title}

## File

| File | Path |
|---|---|
| Video | \`${opts.video}\` |
| Subtitle | \`${opts.srt}\` |

${PLATFORMS.map(block).join('\n')}
## Judul YouTube Shorts

1. <opsi judul 1, <= 60 karakter>
2. <opsi judul 2>
3. <opsi judul 3>

## Jam Posting

<rekomendasi hari & jam WIB per platform + alasan. Patokan umum audiens Indonesia: hari kerja 11.00–13.00 dan 19.00–21.00 WIB, akhir pekan 09.00–11.00 WIB. Utamakan data Insights/Analytics akun user bila ada.>
`;
}

if (opts.init) {
  const p = path.resolve(opts.out);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  if (fs.existsSync(p)) {
    console.log(`[deliverables] ${opts.out} sudah ada, tidak ditimpa.`);
  } else {
    fs.writeFileSync(p, template(), 'utf8');
    console.log(`[deliverables] Kerangka dibuat: ${opts.out}. Isi semua <placeholder>, lalu jalankan --check.`);
  }
}

if (opts.check) {
  const raw = fs.readFileSync(path.resolve(opts.check), 'utf8');
  const issues = [];
  const passes = [];
  const section = (name) => {
    const re = new RegExp(`^##\\s+${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$([\\s\\S]*?)(?=^##\\s|$(?![\\s\\S]))`, 'm');
    return (raw.match(re) || [])[1] || '';
  };

  if (/<[^>\n]{3,}>/.test(raw.replace(/<!--[\s\S]*?-->/g, ''))) issues.push('Masih ada placeholder <...> yang belum diisi.');
  if (EMOJI.test(raw)) issues.push('Ada emoji di deliverables (aturan zero-emoji).');

  for (const p of PLATFORMS) {
    const s = section(p.key);
    if (!s.trim()) {
      issues.push(`Bagian "## ${p.key}" tidak ada.`);
      continue;
    }
    const cap = (s.match(/\*\*Caption:\*\*\s*([\s\S]*?)(?=\*\*Hashtag|$)/) || [])[1]?.trim() || '';
    const tags = [...new Set((s.match(/#[\p{L}\p{N}_]+/gu) || []).map((t) => t.toLowerCase()))];
    if (!cap) issues.push(`${p.key}: caption kosong.`);
    else if (cap.length > p.max) issues.push(`${p.key}: caption ${cap.length} karakter > batas ${p.max}.`);
    if (tags.length < 5 || tags.length > 10) issues.push(`${p.key}: ${tags.length} hashtag (wajib 5–10).`);
    else passes.push(`${p.key}: caption ${cap.length} karakter, ${tags.length} hashtag.`);
  }

  const titles = section('Judul YouTube Shorts')
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*\d+\.\s+(.+)$/)?.[1]?.trim())
    .filter(Boolean);
  if (titles.length < 3) issues.push(`Judul YT Shorts: ${titles.length} opsi (wajib 3).`);
  for (const t of titles) {
    if (t.length > 100) issues.push(`Judul "${t.slice(0, 30)}..." ${t.length} karakter > 100.`);
    else if (t.length > 60) passes.push(`Catatan: judul "${t.slice(0, 30)}..." ${t.length} karakter (disarankan <= 60 agar tidak terpotong).`);
  }
  if (!section('Jam Posting').trim()) issues.push('Bagian "## Jam Posting" kosong.');

  const files = [...raw.matchAll(/`([^`]+\.(mp4|srt|vtt))`/g)].map((m) => m[1]);
  for (const f of files) {
    if (!fs.existsSync(path.resolve(f))) {
      issues.push(`File tidak ditemukan: ${f}`);
      continue;
    }
    if (f.endsWith('.mp4')) {
      const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate', '-of', 'json', f], { encoding: 'utf8' });
      try {
        const st = JSON.parse(r.stdout).streams;
        const v = st.find((x) => x.codec_type === 'video');
        const au = st.find((x) => x.codec_type === 'audio');
        const [fn, fd] = (v?.r_frame_rate || "0/1").split("/").map(Number);
        const fps = fd ? fn / fd : 0;
        const ok = v?.codec_name === 'h264' && au?.codec_name === 'aac' && Math.round(fps) === 30;
        (ok ? passes : issues).push(`${f}: ${v?.width}x${v?.height}, ${v?.codec_name}/${au?.codec_name ?? 'tanpa audio'}, ${Math.round(fps)} fps${ok ? '' : ' (wajib h264 + aac, 30 fps)'}`);
      } catch {
        issues.push(`${f}: gagal dibaca ffprobe.`);
      }
    } else passes.push(`${f}: ada.`);
  }

  console.log(JSON.stringify({ status: issues.length ? 'FAIL' : 'PASS', passes, issues }, null, 2));
  if (issues.length) process.exitCode = 1;
}

if (!opts.init && !opts.check) {
  console.log('Pakai --init atau --check [file]. Lihat header skrip.');
}
