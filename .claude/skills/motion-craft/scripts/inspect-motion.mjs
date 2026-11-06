#!/usr/bin/env node
/**
 * scripts/inspect-motion.mjs
 * Automated QA, Slop, & Bounding-Box Safe-Zone Inspector (Humanizer #7):
 * 1. Zero-Emoji Audit
 * 2. Remotion Determinism Audit
 * 3. Camera Spline Bounding-Box & Safe-Zone Inspector (Memastikan zoom/pan kamera tidak mendorong fokus keluar viewport atau menabrak BottomSubtitleBar)
 * 4. Keyframe Still Extractor (`npx remotion still`)
 * 5. Video & Audio QA (`freezedetect=-60dB`, `silencedetect=-50dB`)
 * 6. Platform Safe Zone 9:16 (atas 15% = 0–288 px, bawah 20% = 1536–1920 px):
 *    - statis: bottomOffset/bottom subtitle & top judul yang masuk zona tertutup UI Reels/TikTok/Shorts
 *    - visual: --safe-zone menimpa still QA dengan pita merah zona tertutup (out/qa-stills/safezone-*.png)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const EMOJI_REGEX = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/u;
const FORBIDDEN_APIS = [
  { pattern: /\bMath\.random\s*\(/, reason: 'Dilarang Math.random() di Remotion; gunakan random("seed") atau createSeededRandom()' },
  { pattern: /\bsetTimeout\s*\(|\bsetInterval\s*\(/, reason: 'Dilarang setTimeout/setInterval; semua waktu harus dari useCurrentFrame()' },
  { pattern: /@remotion\/animated-emoji/, reason: 'Dilarang paket emoji sesuai Aturan Mutlak' },
];

function walkFiles(dir, extFilter = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md']) {
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

function parseArgs(argv) {
  const args = {
    srcDir: 'src',
    publicDir: 'public',
    compId: null,
    frames: [15, 60, 120, 210, 300],
    videoPath: null,
    safeZone: false,
    vertical: false,
    height: 1920,
  };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--src' && v) args.srcDir = v;
    if (k === '--public' && v) args.publicDir = v;
    if (k === '--comp' && v) args.compId = v;
    if (k === '--frames' && v) args.frames = v.split(',').map(Number);
    if (k === '--video' && v) args.videoPath = v;
    if (k === '--safe-zone') args.safeZone = true;
    if (k === '--vertical') args.vertical = true;
    if (k === '--height' && v) args.height = Number(v);
  }
  return args;
}

const opts = parseArgs(process.argv);
const issues = [];
const passes = [];
const warnings = [];
const SZ_TOP = Math.round(opts.height * 0.15); // 288 pada 1920
const SZ_BOTTOM = Math.round(opts.height * 0.2); // 384 pada 1920
let checkedSafeZone = 0;

const filesToScan = [
  ...walkFiles(path.resolve(process.cwd(), opts.srcDir)),
  ...walkFiles(path.resolve(process.cwd(), opts.publicDir), ['.json', '.txt']),
];

let checkedSplines = 0;

for (const file of filesToScan) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, idx) => {
    if (EMOJI_REGEX.test(line)) {
      issues.push(`[EMOJI VIOLATION] ${path.relative(process.cwd(), file)}:${idx + 1} -> Mengandung karakter emoji/simbol dekoratif.`);
    }
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const trimmed = line.trim();
      const isComment = trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
      if (!isComment) {
        for (const rule of FORBIDDEN_APIS) {
          if (rule.pattern.test(line)) {
            issues.push(`[DETERMINISM VIOLATION] ${path.relative(process.cwd(), file)}:${idx + 1} -> ${rule.reason}`);
          }
        }
      }
    }
  });

  // Safe zone 9:16: nilai pertama ternary `isV ? a : b` (atau literal bila --vertical) adalah nilai vertikal.
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    const rel = path.relative(process.cwd(), file);
    const vertVal = (expr) => {
      const t = expr.match(/^\s*(?:isV|isVertical|vertical|isPortrait)\s*\?\s*(\d+)\s*:/);
      if (t) return Number(t[1]);
      const lit = expr.match(/^\s*(\d+)\s*$/);
      return lit && opts.vertical ? Number(lit[1]) : null;
    };
    lines.forEach((line, idx) => {
      for (const m of line.matchAll(/bottomOffset\s*=\s*\{([^}]+)\}/g)) {
        const v = vertVal(m[1]);
        if (v === null) continue;
        checkedSafeZone++;
        if (v < SZ_BOTTOM) {
          issues.push(`[SAFE-ZONE VIOLATION] ${rel}:${idx + 1} -> subtitle bottomOffset ${v}px masuk 20% bawah 9:16 (< ${SZ_BOTTOM}px, tertutup caption & tombol aplikasi). Pakai default safe zone atau >= ${SZ_BOTTOM + 38}.`);
        }
      }
      if (/Subtitle|Caption|Cta|CTA|Title|Header|Headline/.test(line) || /<(BedahHeader|KaraokePillCaption|BottomSubtitleBar)/.test(lines.slice(Math.max(0, idx - 12), idx + 1).join(' '))) {
        for (const m of line.matchAll(/\btop\s*[=:]\s*\{?\s*((?:isV|isVertical|vertical|isPortrait)\s*\?\s*\d+\s*:\s*\d+|\d+)/g)) {
          const v = vertVal(m[1]);
          if (v === null) continue;
          checkedSafeZone++;
          if (v < SZ_TOP) {
            warnings.push(`[SAFE-ZONE WARNING] ${rel}:${idx + 1} -> top ${v}px pada 9:16 masuk 15% atas (< ${SZ_TOP}px, tertutup status bar & nama akun). Pindahkan judul/teks penting ke y >= ${SZ_TOP}.`);
          }
        }
      }
    });
  }

  // Humanizer #7: Audit Waypoint Spline Kamera [frame, scale, tx, ty]
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    const waypointMatches = [...content.matchAll(/\[\s*(\d+)\s*,\s*([0-9.]+)\s*,\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)(?:\s*,\s*-?[0-9.]+)?\s*\]/g)]; // maks 5 angka; CamKey3D (8 angka) tidak ikut
    for (const m of waypointMatches) {
      const frameNum = Number(m[1]);
      const scale = Number(m[2]);
      const tx = Number(m[3]);
      const ty = Number(m[4]);
      if (scale >= 0.5 && scale <= 3.5) {
        checkedSplines++;
        if (scale > 2.6) {
          issues.push(
            `[SAFE-ZONE WARNING] ${path.relative(process.cwd(), file)} (frame ${frameNum}): Zoom kamera terlalu ekstrem (${scale}x > 2.6x), berisiko memotong konten.`
          );
        }
        if (Math.abs(ty) > 1200) {
          issues.push(
            `[SAFE-ZONE WARNING] ${path.relative(process.cwd(), file)} (frame ${frameNum}): Offset vertikal kamera ty=${ty}px terlalu jauh, berisiko keluar viewport.`
          );
        }
      }
    }
  }
}

if (issues.length === 0) {
  passes.push(`Zero-Emoji & Remotion Determinism Check PASSED (${filesToScan.length} files scanned).`);
  passes.push(`Bounding-Box & Camera Safe-Zone Check PASSED (${checkedSplines} spline waypoints verified).`);
  passes.push(`Platform Safe Zone 9:16 PASSED (${checkedSafeZone} posisi teks diperiksa; atas ${SZ_TOP}px, bawah ${SZ_BOTTOM}px).`);
}

if (opts.compId) {
  const stillDir = path.resolve(process.cwd(), 'out/qa-stills');
  fs.mkdirSync(stillDir, { recursive: true });
  for (const f of opts.frames) {
    const outPng = path.join(stillDir, `frame-${String(f).padStart(4, '0')}.png`);
    try {
      execSync(`npx remotion still "${opts.compId}" "${outPng}" --frame=${f}`, { stdio: 'pipe' });
      passes.push(`Rendered keyframe still: ${path.relative(process.cwd(), outPng)}`);
      if (opts.safeZone) {
        const szPng = path.join(stillDir, `safezone-${String(f).padStart(4, '0')}.png`);
        execSync(
          `ffmpeg -y -v error -i "${outPng}" -vf "drawbox=x=0:y=0:w=iw:h=ih*0.15:color=red@0.35:t=fill,drawbox=x=0:y=ih*0.8:w=iw:h=ih*0.2:color=red@0.35:t=fill,drawbox=x=iw*0.88:y=ih*0.15:w=iw*0.12:h=ih*0.65:color=orange@0.25:t=fill" "${szPng}"`
        );
        passes.push(`Safe-zone overlay (periksa: tidak ada teks penting di pita merah/oranye): ${path.relative(process.cwd(), szPng)}`);
      }
    } catch (err) {
      issues.push(`[STILL RENDER ERROR] Frame ${f}: ${err.message}`);
    }
  }
}

if (opts.videoPath && fs.existsSync(opts.videoPath)) {
  try {
    const freezeOut = execSync(
      `ffmpeg -i "${opts.videoPath}" -vf "freezedetect=n=-60dB:d=0.5" -an -f null - 2>&1`,
      { encoding: 'utf8' }
    );
    if (freezeOut.includes('freeze_start')) {
      issues.push(`[FREEZE DETECTED] Video memiliki bagian beku > 0.5 detik pada ambang -60dB.`);
    } else {
      passes.push(`Camera & Motion Freeze Test (-60dB, 0.5s) PASSED — layar selalu hidup.`);
    }
  } catch {}

  try {
    const silenceOut = execSync(
      `ffmpeg -i "${opts.videoPath}" -af "silencedetect=n=-50dB:d=0.5" -vn -f null - 2>&1`,
      { encoding: 'utf8' }
    );
    if (silenceOut.includes('silence_start')) {
      issues.push(`[SILENCE DETECTED] Audio memiliki bagian sunyi > 0.5 detik pada ambang -50dB.`);
    } else {
      passes.push(`Audio Silence Test (-50dB, 0.5s) PASSED — tidak ada detik sunyi.`);
    }
  } catch {}
}

console.log(
  JSON.stringify(
    {
      status: issues.length === 0 ? 'PASS' : 'FAIL',
      passes,
      warnings,
      issues,
    },
    null,
    2
  )
);

if (issues.length > 0) {
  process.exitCode = 1;
}
