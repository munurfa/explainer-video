#!/usr/bin/env node
/**
 * scripts/scaffold-remotion.mjs
 * Menyalin seluruh template siap pakai (theme, components, scenes) ke proyek Remotion
 * dan menyiapkan Style Bible, Scenes Plan, words.json, serta audio WAV deterministik dalam 1 langkah.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_ROOT = path.resolve(__dirname, '..');

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function parseArgs(argv) {
  const args = {
    targetDir: process.cwd(),
    brief: 'Video demo produk digital interaktif dengan kamera mengikuti ketikan dan kursor',
    styleId: null,
    text: 'Fokus utama adalah visual konten yang hidup. Kamera tenang mengikuti ketikan dan klik kursor, lalu berpindah scene secara halus.',
    duration: 12,
  };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--target' && v) args.targetDir = path.resolve(v);
    if (k === '--brief' && v) args.brief = v;
    if (k === '--style' && v) args.styleId = Number(v);
    if (k === '--text' && v) args.text = v;
    if (k === '--duration' && v) args.duration = Number(v);
  }
  return args;
}

const opts = parseArgs(process.argv);
const targetSrc = path.join(opts.targetDir, 'src', 'antislop');

console.log(`[scaffold-remotion] Copying ready-to-use templates to ${targetSrc}...`);
copyDirRecursive(path.join(SKILL_ROOT, 'templates'), targetSrc);

// 1. Jalankan draw-style.mjs
const styleFlag = opts.styleId ? `--style ${opts.styleId}` : '';
const drawOut = execSync(
  `node "${path.join(__dirname, 'draw-style.mjs')}" --brief "${opts.brief.replace(/"/g, '\\"')}" ${styleFlag} --out "${path.join(opts.targetDir, 'research')}"`,
  { encoding: 'utf8' }
);
const chosenMeta = JSON.parse(drawOut).chosen;

// 2. Jalankan scenes.mjs
execSync(
  `node "${path.join(__dirname, 'scenes.mjs')}" --brief "${opts.brief.replace(/"/g, '\\"')}" --duration ${opts.duration} --out "${path.join(opts.targetDir, 'research')}"`,
  { stdio: 'inherit' }
);

// 3. Jalankan narrator-sync.mjs
execSync(
  `node "${path.join(__dirname, 'narrator-sync.mjs')}" --text "${opts.text.replace(/"/g, '\\"')}" --out-words "${path.join(opts.targetDir, 'public/words.json')}" --out-map "${path.join(opts.targetDir, 'research/word-map.md')}"`,
  { stdio: 'inherit' }
);

// 4. Jalankan synth-audio.mjs
execSync(
  `node "${path.join(__dirname, 'synth-audio.mjs')}" --bgm "${chosenMeta.bgm}" --duration ${opts.duration} --words "${path.join(opts.targetDir, 'public/words.json')}" --out "${path.join(opts.targetDir, 'public/audio')}"`,
  { stdio: 'inherit' }
);

console.log(`[scaffold-remotion] Ready! Style #${chosenMeta.id} (${chosenMeta.name}) + Seamless Scenes Plan + Audio (${chosenMeta.bgm}) installed in ${opts.targetDir}`);
