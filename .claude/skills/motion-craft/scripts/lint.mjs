#!/usr/bin/env node
/**
 * scripts/lint.mjs
 * Fast Static Anti-Slop Linter
 * Memeriksa aturan mutlak sebelum merender di browser:
 * 1. ZERO_EMOJI: Dilarang emoji atau simbol Unicode dekoratif
 * 2. NO_MATH_RANDOM & NO_TIMERS: Determinisme Remotion
 * 3. NO_CAMERA_SHAKE: Dilarang efek camera shake terus-menerus
 * 4. NO_DECORATIVE_FILLER_ICONS: Dilarang ikon hiasan tidak berguna (SparkleIcon, LightningIcon, LightbulbIcon, spark-four, lightning-bolt)
 * 5. NO_BULLET_DOT_LABEL: Dilarang membuat titik/icon bulat di samping teks seperti "• teks_kalimat" atau status dot bulat generik
 * 6. BEDAH_TEXT_BUDGET: gaya #44, teks on-screen maks 7 kata & tayang >= 0,3 dtk per kata
 */

import fs from 'node:fs';
import path from 'node:path';

const EMOJI_REGEX = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/u;

const STATIC_RULES = [
  {
    id: 'NO_MATH_RANDOM',
    pattern: /\bMath\.random\s*\(/,
    message: 'Dilarang Math.random() di Remotion. Gunakan createSeededRandom() atau splineAt().',
  },
  {
    id: 'NO_TIMERS',
    pattern: /\b(setTimeout|setInterval)\s*\(/,
    message: 'Dilarang setTimeout/setInterval. Semua animasi wajib diturunkan dari useCurrentFrame().',
  },
  {
    id: 'NO_EMOJI_PKG',
    pattern: /@remotion\/animated-emoji/,
    message: 'Dilarang paket emoji. Gunakan <BrandLogo /> atau komponen UI autentik.',
  },
  {
    id: 'NO_CAMERA_SHAKE',
    pattern: /\b(cameraShake|handheldShake|continuousShake|randomShake)\b/i,
    message: 'Dilarang efek camera shake terus-menerus! Gunakan splineAt() yang tenang dan mengikuti ketikan/kursor.',
  },
  {
    id: 'NO_DECORATIVE_FILLER_ICONS',
    pattern: /\b(SparkleIcon|LightningIcon|LightbulbIcon|spark-four|lightning-bolt|shield-guard)\b/,
    message: 'Dilarang memakai ikon hiasan tidak berguna (petir, sparkle, bohlam). Gunakan <BrandLogo /> asli atau elemen UI fungsional.',
  },
  {
    id: 'NO_BULLET_DOT_PREFIX',
    pattern: /["'`>]\s*•\s+[A-Za-z0-9]/,
    message: 'Dilarang membuat ikon/titik bulat di samping teks seperti "• teks_kalimat". Tampilkan tipografi bersih tanpa bullet dot.',
  },
];

function walkFiles(dir, extFilter = ['.ts', '.tsx', '.js', '.jsx', '.json']) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git', 'out', 'dist'].includes(entry.name)) {
      results.push(...walkFiles(full, extFilter));
    } else if (entry.isFile() && extFilter.includes(path.extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

const targetDir = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : path.resolve(process.cwd(), 'src');
const files = walkFiles(targetDir);
const violations = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    const isComment = trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');

    if (EMOJI_REGEX.test(line)) {
      violations.push({
        rule: 'ZERO_EMOJI',
        file: path.relative(process.cwd(), file),
        line: idx + 1,
        message: 'Ditemukan karakter emoji/simbol Unicode dekoratif. Ganti dengan SVG resmi.',
      });
    }

    if (!isComment && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      for (const r of STATIC_RULES) {
        if (r.pattern.test(line)) {
          violations.push({
            rule: r.id,
            file: path.relative(process.cwd(), file),
            line: idx + 1,
            message: r.message,
          });
        }
      }
    }
  });
}

/**
 * 6. BEDAH_TEXT_BUDGET (gaya #44): teks on-screen maks 7 kata & tayang >= 0,3 dtk per kata.
 * Hanya file yang memakai BedahOverlay. Memeriksa prop string literal (text/keyword/before/after/label/subLabel/title)
 * dan, bila tag yang sama punya start={N} end={M} literal, lama tayang M - N (CalloutPill: dikurangi 12 frame animasi masuk).
 */
const BEDAH_FPS = Number(process.env.LINT_FPS || 30);
const BEDAH_PROP = /\b(text|keyword|before|after|label|subLabel|title)="([^"]+)"/g;
const countWords = (s) => s.trim().split(/\s+/).filter((w) => /[A-Za-zÀ-ɏ]/.test(w)).length;
const lineOf = (content, i) => content.slice(0, i).split(/\n/).length;

for (const file of files) {
  if (!/\.(t|j)sx$/.test(file) || /BedahOverlay\.tsx$/.test(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  if (!/from\s+['"][^'"]*BedahOverlay['"]/.test(content)) continue;
  for (const m of content.matchAll(BEDAH_PROP)) {
    const text = m[2];
    const n = countWords(text);
    const at = { file: path.relative(process.cwd(), file), line: lineOf(content, m.index) };
    if (n > 7) {
      violations.push({ rule: 'BEDAH_TEXT_BUDGET', ...at, message: `"${text}" ${n} kata. Teks on-screen gaya #44 maks 7 kata.` });
    }
    const tagStart = content.lastIndexOf('<', m.index);
    const tagEnd = content.indexOf('/>', m.index);
    if (tagStart < 0 || tagEnd < 0) continue;
    const tag = content.slice(tagStart, tagEnd);
    const s = tag.match(/\bstart=\{\s*(\d+)\s*\}/);
    const e = tag.match(/\bend=\{\s*(\d+)\s*\}/);
    if (!s || !e || !n) continue;
    const enter = /^<CalloutPill\b/.test(tag) ? 12 : 0;
    const shown = Number(e[1]) - Number(s[1]) - enter;
    const need = Math.ceil(n * 0.3 * BEDAH_FPS);
    if (shown < need) {
      violations.push({ rule: 'BEDAH_TEXT_BUDGET', ...at, message: `"${text}" tampil ${shown} frame < ${need} frame (${n} kata x 0,3 dtk @${BEDAH_FPS}fps).` });
    }
  }
}

console.log(
  JSON.stringify(
    {
      status: violations.length === 0 ? 'PASS' : 'FAIL',
      scannedFiles: files.length,
      violations,
    },
    null,
    2
  )
);

if (violations.length > 0) {
  process.exitCode = 1;
}
