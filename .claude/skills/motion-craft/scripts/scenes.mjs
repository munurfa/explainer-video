#!/usr/bin/env node
/**
 * scripts/scenes.mjs
 * Scene, Storyboard (T001-T100), & Seamless Continuity Planner
 * Dilengkapi Humanizer #3 (Asymmetric Pacing Contrast), Humanizer #4 (J-Cut Audio Lead-In),
 * 19 Komponen Card/Grid/3D Choreography, dan Pemilihan Otomatis dari 100 Storyboard Template.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {
    brief: 'Demo Produk & Alur Kerja Interaktif',
    templateId: '',
    durationSec: 12,
    fps: 30,
    overlapFrames: 10,
    outDir: 'research',
    timing: '',
  };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--brief' && v) args.brief = v;
    if ((k === '--template' || k === '--storyboard') && v) args.templateId = v.toUpperCase();
    if (k === '--duration' && v) args.durationSec = Number(v);
    if (k === '--fps' && v) args.fps = Number(v);
    if (k === '--overlap' && v) args.overlapFrames = Number(v);
    if (k === '--out' && v) args.outDir = v;
    if (k === '--timing' && v) args.timing = v;
  }
  return args;
}

/**
 * Memuat seluruh 100 template storyboard (T001-T100) dari references/storyboards/*.md
 */
function loadStoryboardCatalog() {
  const sbDir = path.join(SKILL_ROOT, 'references', 'storyboards');
  if (!fs.existsSync(sbDir)) return [];

  const files = fs
    .readdirSync(sbDir)
    .filter((f) => f.endsWith('.md') && f !== 'INDEX.md')
    .sort();

  const catalog = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(sbDir, file), 'utf8');
    const parts = raw.split(/\n(?=### T\d{3}\b)/);
    for (const part of parts) {
      const m = part.match(/^###\s+(T\d{3})\s+·\s+([^\r\n]+)/);
      if (!m) continue;
      const id = m[1];
      const title = m[2].trim();
      const lines = part.trim().split(/\r?\n/);
      const metaLine = lines[1] || '';
      catalog.push({
        id,
        title,
        categoryFile: file,
        metaLine,
        markdownBlock: part.trim(),
      });
    }
  }
  return catalog;
}

/**
 * Memilih template storyboard terbaik (T001-T100) berdasarkan --template atau kata kunci --brief
 */
function pickStoryboardTemplate(catalog, requestedId, brief) {
  if (catalog.length === 0) return null;
  if (requestedId) {
    const exact = catalog.find((t) => t.id.toUpperCase() === requestedId.toUpperCase());
    if (exact) return exact;
  }

  const b = brief.toLowerCase();
  const keywordRules = [
    { match: /terminal|cli|command|bash|zsh|install/, id: 'T036' },
    { match: /coding|code|typescript|editor|live-typing/, id: 'T035' },
    { match: /prompt|claude|ai|chat|assistant|gpt/, id: 'T037' },
    { match: /github|open source|repo/, id: 'T040' },
    { match: /saas|dashboard|app|launch|developer|web/, id: 'T032' },
    { match: /mobile|apk|android|ios/, id: 'T031' },
    { match: /flash sale|diskon|countdown/, id: 'T002' },
    { match: /pricing|harga|paket/, id: 'T009' },
    { match: /before|after|perbandingan/, id: 'T006' },
    { match: /kafe|kopi|restoran|menu|kuliner/, id: 'T007' },
    { match: /startup|pitch|investor/, id: 'T012' },
    { match: /company profile|perusahaan/, id: 'T011' },
    { match: /tutorial|step|langkah/, id: 'T023' },
    { match: /explainer|konsep|edukasi/, id: 'T021' },
    { match: /tiktok|reels|short|hook/, id: 'T041' },
    { match: /mitos|fakta/, id: 'T048' },
    { match: /wedding|pernikahan|undangan/, id: 'T051' },
    { match: /wisuda|kelulusan/, id: 'T056' },
    { match: /statistik|data|infografis|angka/, id: 'T091' },
    { match: /wrapped|recap|year in review/, id: 'T100' },
  ];

  for (const rule of keywordRules) {
    if (rule.match.test(b)) {
      const found = catalog.find((t) => t.id === rule.id);
      if (found) return found;
    }
  }

  // Skor kecocokan kata pada judul & isi blok
  let best = catalog.find((t) => t.id === 'T032') || catalog[0];
  let bestScore = -1;
  const words = b.split(/[^a-z0-9]+/).filter((w) => w.length >= 3);

  for (const item of catalog) {
    const hay = `${item.title} ${item.metaLine} ${item.markdownBlock}`.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (item.title.toLowerCase().includes(w)) score += 4;
      else if (hay.includes(w)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return best;
}

const opts = parseArgs(process.argv);
// --timing research/vo-timing.json (dari narrator-sync): jumlah & durasi scene mengikuti VO asli, bukan bobot tebakan.
let voTiming = null;
if (opts.timing) {
  voTiming = JSON.parse(fs.readFileSync(path.resolve(opts.timing), 'utf8'));
  if (voTiming.fps) opts.fps = voTiming.fps;
  opts.durationSec = voTiming.totalFrames / opts.fps;
  opts.overlapFrames = 0;
}
const totalFrames = voTiming ? voTiming.totalFrames : Math.round(opts.durationSec * opts.fps);
const sceneCount = voTiming ? voTiming.scenes.length : Math.max(3, Math.min(6, Math.round(opts.durationSec / 3.5)));

const catalog = loadStoryboardCatalog();
const selectedStoryboard = pickStoryboardTemplate(catalog, opts.templateId, opts.brief);

// Bobot durasi asimetris (Slow Establish -> Fast Cut -> Medium Glide -> Slow Hold)
const PACING_WEIGHTS = [
  { weight: 1.18, pacingRole: 'Establish & Humanized Typing Hook (Slow-Medium)' },
  { weight: 0.78, pacingRole: 'Fitts-Law Cursor Hover & Click Action (Fast)' },
  { weight: 0.92, pacingRole: 'Wide Desktop Multi-Window Glide (Medium-Fast)' },
  { weight: 1.22, pacingRole: 'Climax & Takeaway Hold with Micro-Bobbing (Slow-Breathe)' },
  { weight: 0.85, pacingRole: 'Data Proof Spotlight (Fast)' },
  { weight: 1.15, pacingRole: 'Final Resolution Hold (Slow)' },
];

const CAMERA_PATTERNS = [
  {
    mode: 'zoom-follow-typing',
    desc: 'Mulai zoom 1.48x mengikuti ketikan (TypeText dengan cadence alami) di AuthenticTerminalWindow / ChatAppShell, lalu pull-out halus ke 1.0x.',
    visualHero: 'AuthenticTerminalWindow / ChatAppShell atau <ExplodeToGrid /> (tumpukan -> pecah -> rapi di grid).',
    cardGridOption: '<ExplodeToGrid /> atau <BentoGridReveal /> (GridAnimations.tsx)',
  },
  {
    mode: 'follow-cursor-click',
    desc: 'Tenang di 1.0x -> 3-frame anticipation pullback (0.982x) -> Zoom 1.42x mengikuti AnimatedCursor (overshoot 4.5px + 5f hover delay) -> Klik!',
    visualHero: 'Interaksi Kartu Taktil: <CardStackSwipe />, <CardFlip3D />, <PageCurlCard />, atau <PolaroidDropTable />.',
    cardGridOption: '<CardStackSwipe />, <FanSpreadCards />, <CardFlip3D />, atau <PolaroidDropTable /> (CardInteractions.tsx)',
  },
  {
    mode: 'wide-canvas-glide',
    desc: 'Kamera C1 spline menyusuri kanvas 3000px dengan Velocity Motion Blur tipis (1.5-3.5px) atau merotasi objek 3D spasial.',
    visualHero: '3D Card Showcase: <Coverflow3D />, <CubeRoll3D />, <FerrisWheelCards />, <CylinderCards3D />, <HelixCards3D />, atau <ZDepthTunnel />.',
    cardGridOption: '<Coverflow3D />, <CubeRoll3D />, <FerrisWheelCards />, atau <ZDepthTunnel /> (Card3DLayouts.tsx)',
  },
  {
    mode: 'spotlight-data-inspect',
    desc: 'Tenang di 1.0x -> Rack-Focus Spotlight + Zoom 1.38x ke kartu utama -> Pull-back ke <GridRecapZoomOut /> untuk penutup semua poin.',
    visualHero: '<MasonryZoomDetail /> (pilih kotak -> jadi halaman detail) atau <GridRecapZoomOut /> (slide terakhir -> kembali -> recap semua di grid).',
    cardGridOption: '<MasonryZoomDetail />, <LayoutMorphGridToCarousel />, atau <GridRecapZoomOut /> (GridAnimations.tsx)',
  },
];

const SEAMLESS_TRANSITIONS = [
  'portal-zoom-in (Zoom masuk ke dalam kartu tengah menuju scene berikutnya + J-Cut SFX 4f lebih awal)',
  'whip-glide-left (Overlap 10 frame: Scene A meluncur ke kiri bersamaan Scene B masuk dari kanan dengan easeInOutSmooth)',
  'shared-element-morph (Objek utama di akhir Scene A berlanjut dan berubah ukuran/posisi secara mulus di Scene B)',
  'spring-sheet-up (Latar belakang menyambung, panel konten baru meluncur naik dengan staggeredSpringAt)',
];

const chosenWeights = Array.from({ length: sceneCount }, (_, i) => PACING_WEIGHTS[i % PACING_WEIGHTS.length]);
const weightSum = chosenWeights.reduce((acc, w) => acc + w.weight, 0);
const distributableFrames = totalFrames + (sceneCount - 1) * opts.overlapFrames;

const scenes = [];
let currentStart = 0;

for (let i = 0; i < sceneCount; i++) {
  const vt = voTiming ? voTiming.scenes[i] : null;
  if (vt) currentStart = vt.startFrame;
  const rawDur = Math.round((chosenWeights[i].weight / weightSum) * distributableFrames);
  const endFrame = vt
    ? vt.startFrame + vt.durationInFrames
    : i === sceneCount - 1 ? totalFrames : Math.min(totalFrames, currentStart + Math.max(45, rawDur));
  const cam = CAMERA_PATTERNS[i % CAMERA_PATTERNS.length];
  const enterTrans = i === 0 ? 'none (Opening Staggered Spring)' : SEAMLESS_TRANSITIONS[(i - 1) % SEAMLESS_TRANSITIONS.length];
  const exitTrans = i === sceneCount - 1 ? 'none (Clean Hold Finale)' : SEAMLESS_TRANSITIONS[i % SEAMLESS_TRANSITIONS.length];

  scenes.push({
    sceneIndex: i + 1,
    startFrame: currentStart,
    endFrame,
    durationInFrames: endFrame - currentStart,
    pacingRole: vt && vt.tags?.length ? `${vt.id} · ${vt.tags.join(', ')} — ${chosenWeights[i].pacingRole}` : chosenWeights[i].pacingRole,
    voSceneId: vt ? vt.id : null,
    voWords: vt ? vt.words : null,
    jCutAudioFrame: Math.max(0, endFrame - opts.overlapFrames - 4),
    visualHeroCenter: cam.visualHero,
    cardGridChoreography: cam.cardGridOption,
    subtitlePlacement:
      'BottomSubtitleBar default safe zone (useSafeZone): 9:16 bottom 422px / font 44px / 4 kata per baris, judul y >= 288px, kanan 12% bebas teks; 16:9 bottom 6% / margin 5%',
    cameraSplineBehavior: cam.desc,
    enterTransition: enterTrans,
    exitTransition: exitTrans,
  });

  currentStart = endFrame - opts.overlapFrames;
}

const outDir = path.resolve(process.cwd(), opts.outDir);
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'scenes-plan.json'),
  JSON.stringify(
    {
      brief: opts.brief,
      totalFrames,
      fps: opts.fps,
      timingSource: voTiming ? `${opts.timing} (${voTiming.source})` : 'pacing-weights (tebakan; jalankan ulang dengan --timing setelah narrator-sync)',
      asymmetricPacing: true,
      selectedStoryboardId: selectedStoryboard ? selectedStoryboard.id : null,
      selectedStoryboardTitle: selectedStoryboard ? selectedStoryboard.title : null,
      selectedStoryboardFile: selectedStoryboard ? `references/storyboards/${selectedStoryboard.categoryFile}` : null,
      scenes,
    },
    null,
    2
  ),
  'utf8'
);

if (selectedStoryboard) {
  const sbContent = `# STORYBOARD — ${opts.brief}

- **Template Acuan:** ${selectedStoryboard.id} · ${selectedStoryboard.title} (\`references/storyboards/${selectedStoryboard.categoryFile}\`)
- **Durasi Target:** ${opts.durationSec}s (${totalFrames} frame @ ${opts.fps} fps, overlap ${opts.overlapFrames}f)
- **Metadata Template:** ${selectedStoryboard.metaLine}

---

## Blok Referensi Template (${selectedStoryboard.id})

${selectedStoryboard.markdownBlock}

---

## Pemetaan Frame Asimetris (${totalFrames} Frame @ ${opts.fps} fps)

${scenes
  .map(
    (s) =>
      `- **Scene ${s.sceneIndex} (Frame ${s.startFrame}–${s.endFrame} | ${s.durationInFrames}f):** ${s.pacingRole} — Rekomendasi Komponen: ${s.cardGridChoreography}`
  )
  .join('\n')}
`;
  fs.writeFileSync(path.join(outDir, 'storyboard.md'), sbContent, 'utf8');
}

const mdRows = scenes
  .map(
    (s) =>
      `### Scene ${s.sceneIndex} — ${s.pacingRole} (Frame ${s.startFrame}–${s.endFrame} | ${s.durationInFrames}f)\n` +
      `- **Konten Visual Utama (85% Tengah):** ${s.visualHeroCenter}\n` +
      `- **Opsi Komponen 3D / Grid / Card Interaction:** ${s.cardGridChoreography}\n` +
      `- **Posisi Subtitle:** ${s.subtitlePlacement}\n` +
      `- **Gerak Kamera C1 Spline & Humanizer:** ${s.cameraSplineBehavior}\n` +
      `- **Transisi Masuk:** ${s.enterTransition}\n` +
      `- **Transisi Keluar (Overlap ${opts.overlapFrames}f | J-Cut Audio di f${s.jCutAudioFrame}):** ${s.exitTransition}\n`
  )
  .join('\n');

const motionPlanMd = `# Rencana Gerak, Pacing Asimetris, & Editing Humanizer (Motion Plan)

- **Brief:** ${opts.brief}
- **Template Storyboard Terpilih:** ${selectedStoryboard ? `${selectedStoryboard.id} · ${selectedStoryboard.title}` : 'Custom'}
- **Total Durasi:** ${opts.durationSec} detik (${totalFrames} frame @ ${opts.fps} fps)
- **7 Standar Editing Humanizer Aktif:**
  1. **Humanized Typing & Fitts-Law Cursor:** Cadence ketik bervariasi + typo backspace & kursor overshoot 4.5px + 5-frame hover delay.
  2. **Overlapping Action & Micro-Bobbing:** Inersia berlapis (\`staggeredSpringAt\`) & elemen mengambang beda fase (\`microBob\`).
  3. **Asymmetric Scene Pacing & 3-Frame Camera Anticipation:** Durasi antar-scene bervariasi (tidak dibagi rata seperti robot) + pullback 0.982x sebelum zoom-in.
  4. **J-Cut Audio Lead-In:** SFX transisi berbunyi 4 frame sebelum gambar berpindah.
  5. **Velocity-Driven Motion Blur & Rack-Focus Spotlight:** Blur otomatis 1.5–3.8px hanya saat kamera cepat, tajam 0px saat diam.
  6. **Authentic UI Shells & 19 Card/Grid/3D Patterns:** Bingkai aplikasi nyata (\`AuthenticBrowserWindow\`, \`AuthenticTerminalWindow\`, \`ChatAppShell\`) & koreografi kartu (\`Card3DLayouts.tsx\`, \`GridAnimations.tsx\`, \`CardInteractions.tsx\`).
  7. **Safe-Zone Viewport Clamping:** Fokus kamera terjamin berada di area aman 20%–80% layar dan bebas tabrakan dengan \`BottomSubtitleBar\`.

${mdRows}
`;

fs.writeFileSync(path.join(outDir, 'motion-plan.md'), motionPlanMd, 'utf8');
console.log(
  `[scenes] Generated ${scenes.length} asymmetric humanized scenes + storyboard (${
    selectedStoryboard ? selectedStoryboard.id : 'custom'
  }) in ${outDir}`
);
