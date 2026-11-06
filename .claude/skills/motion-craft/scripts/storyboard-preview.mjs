#!/usr/bin/env node
/**
 * scripts/storyboard-preview.mjs
 * Contact sheet storyboard: 1 still per scene (frame puncak = start + 60% durasi) disusun jadi satu
 * gambar, untuk di-approve user SEBELUM render penuh (Stage 2 checkpoint).
 *
 *   node storyboard-preview.mjs --comp MainVideo --timing research/vo-timing.json
 *   node storyboard-preview.mjs --comp MainVideo --plan research/scenes-plan.json --safe-zone
 *   node storyboard-preview.mjs --comp S44-kita-bedah-916 --entry src/index.ts --frames 30,120,240 --props '{"styleId":44}'
 *
 * Opsi:
 *   --entry src/index.ts   entry point Remotion (default: src/index.ts / src/index.tsx / remotion/index.ts)
 *   --peak 0.6             posisi frame contoh di dalam scene (0..1)
 *   --cols 0               jumlah kolom (0 = otomatis: 9:16 -> 4, 16:9 -> 3)
 *   --thumb 0              lebar thumbnail px (0 = otomatis: 9:16 -> 360, 16:9 -> 640)
 *   --safe-zone            timpa pita merah zona tertutup UI platform (atas 15%, bawah 20%, kanan 12%)
 *   --gl angle             backend WebGL untuk scene 3D (@remotion/three)
 *   --out out/storyboard   folder output: scene-XX.png, contact-sheet.png, index.md
 *
 * Render memakai @remotion/bundler + @remotion/renderer milik project (bundle sekali, semua still
 * cepat). Bila paket tidak ada, jatuh ke `npx remotion still` per frame.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

function parseArgs(argv) {
  const a = { comp: 'MainVideo', entry: null, timing: null, plan: null, frames: null, props: '{}', peak: 0.6, cols: 0, thumb: 0, safeZone: false, gl: null, out: 'out/storyboard' };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--comp' && v) a.comp = v;
    if (k === '--entry' && v) a.entry = v;
    if (k === '--timing' && v) a.timing = v;
    if (k === '--plan' && v) a.plan = v;
    if (k === '--frames' && v) a.frames = v.split(',').map(Number);
    if (k === '--props' && v) a.props = v;
    if (k === '--peak' && v) a.peak = Number(v);
    if (k === '--cols' && v) a.cols = Number(v);
    if (k === '--thumb' && v) a.thumb = Number(v);
    if (k === '--safe-zone') a.safeZone = true;
    if (k === '--gl' && v) a.gl = v;
    if (k === '--out' && v) a.out = v;
  }
  return a;
}

const opts = parseArgs(process.argv);
const inputProps = JSON.parse(opts.props);
const outDir = path.resolve(opts.out);
fs.mkdirSync(outDir, { recursive: true });

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, shell: cmd === 'npx' && process.platform === 'win32' });
  if (r.status !== 0) throw new Error(`${cmd} gagal: ${(r.stderr || r.stdout || '').slice(-800)}`);
  return r.stdout;
}

/** Daftar shot: dari vo-timing.json, scenes-plan.json, atau --frames. */
function loadShots() {
  if (opts.frames) return opts.frames.map((f, i) => ({ id: `F${i + 1}`, label: `frame ${f}`, frame: f, startFrame: f, durationInFrames: 1 }));
  const src = opts.timing || opts.plan || (fs.existsSync('research/vo-timing.json') ? 'research/vo-timing.json' : 'research/scenes-plan.json');
  if (!fs.existsSync(src)) throw new Error(`Tidak ada sumber scene. Pakai --timing, --plan, atau --frames.`);
  const j = JSON.parse(fs.readFileSync(src, 'utf8'));
  return j.scenes.map((s, i) => {
    const start = s.startFrame;
    const dur = s.durationInFrames;
    const id = s.id || s.voSceneId || `S${s.sceneIndex ?? i + 1}`;
    const tags = s.tags?.length ? s.tags.join(' ') : '';
    return { id, label: tags, frame: Math.min(start + dur - 1, start + Math.round(dur * opts.peak)), startFrame: start, durationInFrames: dur };
  });
}

function findEntry() {
  if (opts.entry) return path.resolve(opts.entry);
  for (const c of ['src/index.ts', 'src/index.tsx', 'src/index.js', 'remotion/index.ts', 'src/remotion/index.ts']) {
    if (fs.existsSync(c)) return path.resolve(c);
  }
  throw new Error('Entry Remotion tidak ditemukan, pakai --entry.');
}

async function renderStills(shots) {
  const req = createRequire(path.resolve('package.json'));
  let bundler;
  let renderer;
  try {
    bundler = await import(pathToFileURL(req.resolve('@remotion/bundler')).href);
    renderer = await import(pathToFileURL(req.resolve('@remotion/renderer')).href);
  } catch {
    bundler = null;
  }
  const files = shots.map((s) => path.join(outDir, `scene-${s.id}.png`));
  if (bundler && renderer) {
    console.log('[storyboard] bundling...');
    const serveUrl = await bundler.bundle({ entryPoint: findEntry(), webpackOverride: (c) => c });
    const chromiumOptions = opts.gl ? { gl: opts.gl } : {};
    const composition = await renderer.selectComposition({ serveUrl, id: opts.comp, inputProps, chromiumOptions });
    for (const [i, s] of shots.entries()) {
      const frame = Math.max(0, Math.min(composition.durationInFrames - 1, s.frame));
      await renderer.renderStill({ composition, serveUrl, output: files[i], frame, inputProps, chromiumOptions });
      console.log(`[storyboard] ${s.id} frame ${frame} -> ${path.relative(process.cwd(), files[i])}`);
    }
    return { files, width: composition.width, height: composition.height, fps: composition.fps };
  }
  console.log('[storyboard] @remotion/renderer tidak ditemukan, pakai npx remotion still (lebih lambat).');
  for (const [i, s] of shots.entries()) {
    const args = ['remotion', 'still', opts.comp, files[i], `--frame=${s.frame}`, `--props=${JSON.stringify(inputProps)}`];
    if (opts.gl) args.push(`--gl=${opts.gl}`);
    run('npx', args);
  }
  const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', files[0]])).streams[0];
  return { files, width: probe.width, height: probe.height, fps: 30 };
}

/** drawtext di ffmpeg tanpa fontconfig (Windows) crash bila fontfile tidak diberikan. */
function findFont() {
  const c = [
    'C:/Windows/Fonts/arialbd.ttf',
    'C:/Windows/Fonts/arial.ttf',
    'C:/Windows/Fonts/segoeui.ttf',
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/Library/Fonts/Arial.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/TTF/DejaVuSans-Bold.ttf',
  ];
  return c.find((f) => fs.existsSync(f)) || null;
}
const ffFontPath = (f) => f.replace(/\\/g, '/').replace(/:/g, '\\:');
const ffText = (t) => t.replace(/[\\:'%,;[\]]/g, ' ').trim();

async function main() {
  const shots = loadShots();
  if (!shots.length) throw new Error('Daftar scene kosong.');
  const { files, width, height, fps } = await renderStills(shots);
  const isV = height > width;
  const thumbW = opts.thumb || (isV ? 360 : 640);
  const thumbH = Math.round((thumbW * height) / width / 2) * 2;
  const cols = opts.cols || Math.min(shots.length, isV ? 4 : 3);
  const rows = Math.ceil(shots.length / cols);
  const font = findFont();
  if (!font) console.log('[storyboard] Font TTF tidak ditemukan, label scene dilewati (lihat index.md).');

  const thumbs = [];
  for (const [i, s] of shots.entries()) {
    const sec = (s.frame / fps).toFixed(1);
    const label = ffText(`${s.id}  ${sec}s  ${s.label}`);
    const vf = [`scale=${thumbW}:${thumbH}:flags=lanczos`];
    if (opts.safeZone) {
      vf.push(
        'drawbox=x=0:y=0:w=iw:h=ih*0.15:color=red@0.30:t=fill',
        'drawbox=x=0:y=ih*0.8:w=iw:h=ih*0.2:color=red@0.30:t=fill',
        ...(isV ? ['drawbox=x=iw*0.88:y=ih*0.15:w=iw*0.12:h=ih*0.65:color=orange@0.22:t=fill'] : [])
      );
    }
    vf.push(`pad=iw:ih+44:0:44:color=0x111111`);
    if (font) vf.push(`drawtext=fontfile='${ffFontPath(font)}':text='${label}':fontcolor=white:fontsize=22:x=10:y=11`);
    const t = path.join(outDir, `thumb-${String(i).padStart(3, '0')}.png`);
    run('ffmpeg', ['-y', '-v', 'error', '-i', files[i], '-vf', vf.join(','), t]);
    thumbs.push(t);
  }
  // tile butuh jumlah frame = cols*rows; sisa sel diisi kosong.
  for (let i = thumbs.length; i < cols * rows; i++) {
    const t = path.join(outDir, `thumb-${String(i).padStart(3, '0')}.png`);
    run('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', `color=c=0x111111:s=${thumbW}x${thumbH + 44}`, '-frames:v', '1', t]);
  }
  const sheet = path.join(outDir, 'contact-sheet.png');
  run('ffmpeg', ['-y', '-v', 'error', '-framerate', '1', '-i', path.join(outDir, 'thumb-%03d.png'), '-vf', `tile=${cols}x${rows}:padding=16:margin=16:color=0x0a0a0a`, '-frames:v', '1', '-update', '1', sheet]);
  for (const f of fs.readdirSync(outDir)) if (/^thumb-\d{3}\.png$/.test(f)) fs.unlinkSync(path.join(outDir, f));

  const md = [
    `# Storyboard Preview — ${opts.comp}`,
    '',
    `${width}x${height} @ ${fps} fps · frame contoh = start + ${Math.round(opts.peak * 100)}% durasi scene${opts.safeZone ? ' · pita merah = zona tertutup UI platform' : ''}`,
    '',
    `![contact sheet](contact-sheet.png)`,
    '',
    '| Scene | Tag | Frame scene | Frame contoh | Detik | File |',
    '|---|---|---|---|---|---|',
    ...shots.map((s, i) => `| ${s.id} | ${s.label || '-'} | ${s.startFrame}–${s.startFrame + s.durationInFrames - 1} | ${s.frame} | ${(s.frame / fps).toFixed(2)} | ${path.basename(files[i])} |`),
    '',
    '[STOP – TUNGGU APPROVAL] Tunjukkan contact-sheet.png ke user. Lanjut render penuh hanya setelah disetujui.',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'index.md'), md, 'utf8');
  console.log(`[storyboard] ${shots.length} scene -> ${path.relative(process.cwd(), sheet)} (${cols}x${rows}) + index.md`);
}

main().catch((e) => {
  console.error(`[storyboard] ${e.message}`);
  process.exit(1);
});
