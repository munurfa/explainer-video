#!/usr/bin/env node
/**
 * scripts/inspect-motion.mjs
 * Automated QA, Slop, & Bounding-Box Safe-Zone Inspector (Humanizer #7):
 * 1. Zero-Emoji Audit
 * 2. Remotion Determinism Audit
 * 3. Camera Spline Bounding-Box & Safe-Zone Inspector (Memastikan zoom/pan kamera tidak mendorong fokus keluar viewport atau menabrak BottomSubtitleBar)
 * 4. Keyframe Still Extractor (`remotion still`) + measured geometry (--geometry, lihat qa-geometry.mjs)
 * 5. Video & Audio QA (ffprobe stream, `freezedetect=-60dB`, `silencedetect=-50dB`; --allow-freeze / --allow-silence)
 * 6. Platform Safe Zone 9:16 (atas 15% = 0–288 px, bawah 20% = 1536–1920 px):
 *    - statis: bottomOffset/bottom subtitle & top judul yang masuk zona tertutup UI Reels/TikTok/Shorts
 *    - visual: --safe-zone menimpa still QA dengan pita merah zona tertutup (out/qa-stills/safezone-*.png)
 *
 * Status: PASS (semua cek jalan & lolos), PARTIAL (lolos tapi ada cek yang dilewati), FAIL.
 * --require-complete: exit code 2 bila ada cek yang dilewati.
 * Semua subprocess dipanggil dengan array argumen (tanpa string shell).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { inspectGeometry } from './qa-geometry.mjs';

// Pakai CLI Remotion lokal lewat node (tanpa shell). Fallback ke npx (shell hanya di Windows untuk npx.cmd).
function runRemotion(args) {
  const localCli = path.resolve(process.cwd(), 'node_modules/@remotion/cli/remotion-cli.js');
  if (fs.existsSync(localCli)) return execFileSync(process.execPath, [localCli, ...args], { stdio: 'pipe' });
  return execFileSync('npx', ['remotion', ...args], { stdio: 'pipe', shell: process.platform === 'win32' });
}

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
    geometryPath: null,
    allowFreeze: false,
    allowSilence: false,
    requireComplete: false,
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
    if (k === '--geometry' && v) args.geometryPath = v;
    if (k === '--allow-freeze') args.allowFreeze = true;
    if (k === '--allow-silence') args.allowSilence = true;
    if (k === '--require-complete') args.requireComplete = true;
  }
  return args;
}

const opts = parseArgs(process.argv);
const issues = [];
const passes = [];
const warnings = [];
const skipped = [];
let measuredObjects = 0;
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

// Regex sumber tidak bisa memastikan batas render. Pakai geometri layar terukur bila ada.
if (opts.geometryPath) {
  try {
    const result = inspectGeometry(JSON.parse(fs.readFileSync(opts.geometryPath, 'utf8')));
    measuredObjects = result.checkedObjects;
    issues.push(...result.issues);
    if (!result.issues.length) passes.push(`Measured geometry PASSED (${measuredObjects} objek pada frame sampel).`);
  } catch (err) {
    issues.push(`[GEOMETRY ERROR] ${err.message}`);
  }
} else skipped.push('Rendered geometry: berikan --geometry berisi kotak objek terukur di layar (lihat scripts/qa-geometry.mjs).');

if (opts.compId && opts.frames.length && opts.frames.every(Number.isFinite)) {
  const stillDir = path.resolve(process.cwd(), 'out/qa-stills');
  fs.mkdirSync(stillDir, { recursive: true });
  for (const f of opts.frames) {
    const outPng = path.join(stillDir, `frame-${String(f).padStart(4, '0')}.png`);
    try {
      runRemotion(['still', opts.compId, outPng, `--frame=${f}`]);
      passes.push(`Rendered keyframe still: ${path.relative(process.cwd(), outPng)}`);
      if (opts.safeZone) {
        const szPng = path.join(stillDir, `safezone-${String(f).padStart(4, '0')}.png`);
        execFileSync('ffmpeg', [
          '-y', '-v', 'error', '-i', outPng,
          '-vf', 'drawbox=x=0:y=0:w=iw:h=ih*0.15:color=red@0.35:t=fill,drawbox=x=0:y=ih*0.8:w=iw:h=ih*0.2:color=red@0.35:t=fill,drawbox=x=iw*0.88:y=ih*0.15:w=iw*0.12:h=ih*0.65:color=orange@0.25:t=fill',
          szPng,
        ], { stdio: 'pipe' });
        passes.push(`Safe-zone overlay (periksa: tidak ada teks penting di pita merah/oranye): ${path.relative(process.cwd(), szPng)}`);
      }
    } catch (err) {
      issues.push(`[STILL RENDER ERROR] Frame ${f}: ${err.message}`);
    }
  }
} else skipped.push('Still rendering: berikan --comp dan --frames yang valid.');

if (opts.videoPath) {
  if (!fs.existsSync(opts.videoPath)) issues.push(`[MEDIA QA] Video tidak ditemukan: ${opts.videoPath}`);
  else {
    try {
      const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-of', 'json', opts.videoPath], { encoding: 'utf8' }));
      if (!probe.streams?.some((st) => st.codec_type === 'video')) issues.push('[MEDIA QA] Tidak ada stream video.');
      const hasAudio = probe.streams?.some((st) => st.codec_type === 'audio');
      if (!hasAudio) {
        if (opts.allowSilence) warnings.push('[MEDIA QA] Tidak ada stream audio; video bisu diizinkan lewat --allow-silence.');
        else issues.push('[MEDIA QA] Tidak ada stream audio; pakai --allow-silence hanya bila memang sengaja bisu.');
      }
      const tests = [
        ['freeze', '-vf', 'freezedetect=n=-60dB:d=0.5', '-an', opts.allowFreeze,
          'Camera & Motion Freeze Test (-60dB, 0.5s) PASSED, layar selalu hidup.',
          'Video memiliki bagian beku > 0.5 detik pada ambang -60dB.'],
        ['silence', '-af', 'silencedetect=n=-50dB:d=0.5', '-vn', opts.allowSilence,
          'Audio Silence Test (-50dB, 0.5s) PASSED, tidak ada detik sunyi.',
          'Audio memiliki bagian sunyi > 0.5 detik pada ambang -50dB.'],
      ];
      for (const [name, flag, filter, strip, allowed, okMsg, badMsg] of tests) {
        if (name === 'silence' && !hasAudio) continue;
        // Filter diagnostik FFmpeg menulis ke stderr walau sukses.
        const res = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', opts.videoPath, flag, filter, strip, '-f', 'null', '-'], { encoding: 'utf8' });
        if (res.error || res.status !== 0) throw new Error(res.error?.message || res.stderr || 'FFmpeg gagal.');
        if (res.stderr.includes(`${name}_start`)) {
          if (allowed) warnings.push(`[${name.toUpperCase()} DIIZINKAN] ${badMsg} Periksa jeda yang disengaja.`);
          else issues.push(`[${name.toUpperCase()} DETECTED] ${badMsg} Pakai --allow-${name} hanya bila disengaja.`);
        } else passes.push(okMsg);
      }
    } catch (err) {
      issues.push(`[MEDIA QA ERROR] ${err.message}`);
    }
  }
} else skipped.push('Media QA: berikan --video setelah render.');

console.log(
  JSON.stringify(
    {
      status: issues.length ? 'FAIL' : skipped.length ? 'PARTIAL' : 'PASS',
      scope: 'Cek otomatis hanya pada frame sampel; review visual tetap wajib.',
      scannedFiles: filesToScan.length,
      measuredObjects,
      passes,
      skipped,
      warnings,
      issues,
    },
    null,
    2
  )
);

if (issues.length) process.exitCode = 1;
else if (opts.requireComplete && skipped.length) process.exitCode = 2;
