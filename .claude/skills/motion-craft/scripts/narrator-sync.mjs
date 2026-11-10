#!/usr/bin/env node
/**
 * scripts/narrator-sync.mjs
 * Narasi VO -> audio + timestamp kata ASLI (words.json) + durasi scene nyata (vo-timing.json).
 *
 * Contoh:
 *   # Naskah per scene (disarankan) + sintesis Edge TTS dengan WordBoundary asli
 *   node narrator-sync.mjs --script research/vo-script.md --profile N01 --tts
 *   # ElevenLabs (butuh ELEVENLABS_API_KEY), timestamp dari endpoint /with-timestamps
 *   node narrator-sync.mjs --script research/vo-script.md --profile N06 --tts
 *   # Gemini TTS (butuh GEMINI_API_KEY di .env). Timestamp kata dari faster-whisper / WhisperX bila terpasang.
 *   node narrator-sync.mjs --script research/vo-script.md --profile N09 --tts
 *   node narrator-sync.mjs --script research/vo-script.md --profile gemini:Achird --gemini-style "..." --tts
 *     --gemini-model <id>   (default GEMINI_TTS_MODEL atau gemini-3.8-flash-tts)
 *     --gemini-fresh        abaikan cache take lama, generate ulang
 *     --tempo <0.8-1.3>     percepat/perlambat narasi (ffmpeg atempo, nada tetap). Tanpa request TTS baru
 *     --align auto|faster-whisper|whisperx|none
 *   # Audio rekaman sudah ada -> forced alignment WhisperX (bila terpasang), atau estimasi diskalakan ke durasi audio
 *   node narrator-sync.mjs --script research/vo-script.md --audio public/audio/vo.wav
 *   # Draf cepat tanpa audio (timing hanya estimasi)
 *   node narrator-sync.mjs --text "Kalimat narasi ..." --profile N01
 *
 * Output:
 *   public/words.json          [{ text, startMs, endMs, role, effect, scene }]
 *   research/word-map.md       tabel kata + sumber timing
 *   research/vo-timing.json    durasi scene nyata (frame) untuk scenes.mjs --timing dan Root.tsx
 *   public/audio/narration.mp3 (bila --tts)
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  VOICE_PROFILES,
  alignWithWhisperX,
  estimateWords,
  geminiKey,
  hasPython,
  mapBoundariesToTokens,
  probeDurationMs,
  resolveProfile,
  synthScript,
} from './lib/tts.mjs';
import { WPS_BUDGET, loadVoScript, singleSceneScript } from './lib/vo-script.mjs';

const EFFECTS = ['mask-up', 'slide-mask', 'spring-pop', 'flip-3d', 'blur-sharp', 'tracking-lock', 'split-merge', 'draw-underline', 'wipe-highlight', 'slot-roll'];
const CONNECTORS = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'adalah', 'ini', 'itu',
  'atau', 'dalam', 'bisa', 'akan', 'the', 'and', 'to', 'of', 'in', 'for', 'with', 'on', 'is',
]);

function parseArgs(argv) {
  const a = {
    text: null,
    script: null,
    profile: 'N01',
    tts: false,
    audio: null,
    wpm: 150,
    fps: 30,
    leadInMs: 120,
    sceneGapMs: 250,
    tailMs: 1200,
    elevenVoice: null,
    geminiVoice: null,
    geminiStyle: null,
    geminiModel: null,
    geminiFresh: false,
    tempo: 1,
    align: 'auto',
    outWords: 'public/words.json',
    outMap: 'research/word-map.md',
    outTiming: 'research/vo-timing.json',
    outAudio: 'public/audio/narration.mp3',
  };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--text' && v) a.text = v;
    if (k === '--script' && v) a.script = v;
    if (k === '--profile' && v) a.profile = /^(gemini|eleven):/i.test(v) ? v : v.toUpperCase();
    if (k === '--gemini-voice' && v) a.geminiVoice = v;
    if (k === '--gemini-style' && v) a.geminiStyle = v;
    if (k === '--gemini-model' && v) a.geminiModel = v;
    if (k === '--gemini-fresh') a.geminiFresh = true;
    if (k === '--tempo' && v) a.tempo = Math.min(1.3, Math.max(0.8, Number(v) || 1));
    if (k === '--align' && v) a.align = v;
    if (k === '--tts') a.tts = true;
    if (k === '--audio' && v) a.audio = v;
    if (k === '--wpm' && v) a.wpm = Number(v);
    if (k === '--fps' && v) a.fps = Number(v);
    if (k === '--lead' && v) a.leadInMs = Number(v);
    if (k === '--scene-gap' && v) a.sceneGapMs = Number(v);
    if (k === '--tail' && v) a.tailMs = Number(v);
    if (k === '--eleven-voice' && v) a.elevenVoice = v;
    if (k === '--out-words' && v) a.outWords = v;
    if (k === '--out-map' && v) a.outMap = v;
    if (k === '--out-timing' && v) a.outTiming = v;
    if (k === '--out-audio' && v) a.outAudio = v;
  }
  return a;
}

const opts = parseArgs(process.argv);
if (!opts.script && !opts.text) {
  console.error('[narrator-sync] Wajib --script research/vo-script.md atau --text "..."');
  process.exit(2);
}
const script = opts.script ? loadVoScript(opts.script) : singleSceneScript(opts.text);
if (!script.scenes.length) {
  console.error('[narrator-sync] Naskah tidak punya heading scene "## S1 · 0–3". Lihat templates/VO-SCRIPT.template.md');
  process.exit(2);
}
// Profil: --profile, lalu `- Profil:` di naskah, lalu N01.
const profileArgGiven = process.argv.includes('--profile');
const profileId = profileArgGiven ? opts.profile : script.meta.profil?.split(/\s/)[0] || opts.profile;
let profileKey = profileId;
let profile;
try {
  ({ key: profileKey, profile } = resolveProfile(profileId, script.meta.bahasa || 'id'));
} catch {
  profileKey = 'N01';
  profile = VOICE_PROFILES.N01;
}
if (!opts.geminiStyle && script.meta.gaya) opts.geminiStyle = script.meta.gaya;
const lang = (script.meta.bahasa || profile.lang || 'id').slice(0, 2).toLowerCase();

/** Estimasi per segmen dengan jeda naskah, opsional diskalakan ke durasi audio asli. */
function estimateScript(targetMs = 0) {
  const words = [];
  const spans = [];
  let cur = opts.leadInMs;
  for (const [si, sc] of script.scenes.entries()) {
    const s0 = cur;
    for (const seg of sc.segments) {
      const est = estimateWords(seg.text.split(/\s+/), { wpm: opts.wpm });
      for (const w of est) words.push({ ...w, startMs: w.startMs + cur, endMs: w.endMs + cur, scene: sc.id });
      cur += (est.at(-1)?.endMs || 0) + seg.pauseAfterMs;
    }
    spans.push({ id: sc.id, voStartMs: s0, voEndMs: cur });
    cur += si < script.scenes.length - 1 ? opts.sceneGapMs : 300;
  }
  if (targetMs) {
    const k = targetMs / cur;
    for (const w of words) {
      w.startMs = Math.round(w.startMs * k);
      w.endMs = Math.round(w.endMs * k);
    }
    for (const s of spans) {
      s.voStartMs = Math.round(s.voStartMs * k);
      s.voEndMs = Math.round(s.voEndMs * k);
    }
    cur = targetMs;
  }
  return { words, sceneSpans: spans, totalMs: Math.round(cur) };
}

function spansFromWords(words) {
  return script.scenes.map((sc) => {
    const ws = words.filter((w) => w.scene === sc.id);
    return { id: sc.id, voStartMs: ws[0]?.startMs ?? 0, voEndMs: ws.at(-1)?.endMs ?? 0 };
  });
}

let result;
let source;
let audioFile = null;
const notes = [];

if (opts.tts) {
  if (profile.provider === 'elevenlabs' && !process.env.ELEVENLABS_API_KEY) {
    notes.push(`ELEVENLABS_API_KEY tidak ada; ${profileKey} diganti N01 (Edge TTS).`);
    profile = VOICE_PROFILES.N01;
    profileKey = 'N01';
  }
  if (profile.provider === 'gemini' && !geminiKey()) {
    notes.push(`GEMINI_API_KEY tidak ada; ${profileKey} diganti N01 (Edge TTS).`);
    profile = VOICE_PROFILES.N01;
    profileKey = 'N01';
  }
  if (profile.provider === 'edge' && !hasPython('edge_tts')) {
    notes.push('Modul Python edge_tts tidak ada (pip install edge-tts); timing jatuh ke estimasi wpm.');
  } else {
    try {
      result = await synthScript(script, profile, { ...opts, tmpDir: 'out/.tts' });
      source = result.source;
      audioFile = opts.outAudio;
      if (source === 'gemini-estimate-segment') {
        notes.push(
          'Gemini tidak memberi timestamp kata dan aligner tidak tersedia: batas kalimat asli, kata di dalamnya estimasi. ' +
            'Pasang `pip install faster-whisper` (atau set MOTION_PY ke python yang punya modul itu), lalu jalankan ulang (audio dipakai dari cache).'
        );
      }
    } catch (err) {
      notes.push(`TTS gagal (${err.message.split('\n')[0]}); timing jatuh ke estimasi wpm.`);
    }
  }
} else if (opts.audio) {
  audioFile = opts.audio;
  const durMs = probeDurationMs(opts.audio);
  const allText = script.scenes.map((s) => s.text).join(' ');
  if (hasPython('whisperx')) {
    try {
      const bounds = alignWithWhisperX(opts.audio, allText, lang);
      const tokens = [];
      for (const sc of script.scenes) for (const t of sc.text.split(' ')) tokens.push({ t, scene: sc.id });
      const mapped = mapBoundariesToTokens(tokens.map((x) => x.t), bounds, durMs);
      const words = mapped.map((w, i) => ({ ...w, scene: tokens[i].scene }));
      result = { words, sceneSpans: spansFromWords(words), totalMs: durMs };
      source = 'whisperx';
    } catch (err) {
      notes.push(`WhisperX gagal (${err.message.split('\n')[0]}); memakai estimasi diskalakan ke durasi audio.`);
    }
  } else {
    notes.push('WhisperX tidak terpasang (pip install whisperx); memakai estimasi diskalakan ke durasi audio.');
  }
  if (!result) {
    result = estimateScript(durMs);
    source = 'estimate-scaled';
  }
}
if (!result) {
  result = estimateScript(0);
  source = 'estimate-wpm';
}

// Hierarki kata + efek masuk (tidak pernah sama berurutan)
let prevEffect = '';
const words = result.words.map((w, idx) => {
  const clean = w.text.replace(/[.,!?;:"]/g, '').toLowerCase();
  let role = 'support';
  if (CONNECTORS.has(clean) || clean.length <= 2) role = 'connector';
  else if (/\d/.test(w.text) || clean.length >= 7 || idx % 4 === 0) role = 'keyword';
  let effect = /\d/.test(w.text) ? 'slot-roll' : EFFECTS[(idx * 3 + clean.length) % EFFECTS.length];
  if (effect === prevEffect) effect = EFFECTS[(EFFECTS.indexOf(effect) + 1) % EFFECTS.length];
  prevEffect = effect;
  return { text: w.text, startMs: w.startMs, endMs: w.endMs, role, effect, scene: w.scene };
});

// Jendela scene nyata: scene mulai 150 ms sebelum kata pertamanya, berakhir saat scene berikutnya mulai.
const fps = opts.fps;
const spans = result.sceneSpans;
const budget = WPS_BUDGET[lang] || 2.5;
const scenes = script.scenes.map((sc, i) => {
  const startMs = i === 0 ? 0 : Math.max(0, spans[i].voStartMs - 150);
  const endMs = i < spans.length - 1 ? Math.max(0, spans[i + 1].voStartMs - 150) : Math.max(result.totalMs, spans[i].voEndMs + opts.tailMs);
  const voMs = Math.max(1, spans[i].voEndMs - spans[i].voStartMs);
  const startFrame = Math.round((startMs / 1000) * fps);
  const endFrame = Math.round((endMs / 1000) * fps);
  return {
    id: sc.id,
    tags: sc.tags,
    plannedSec: [sc.startSec, sc.endSec],
    startMs,
    endMs,
    voStartMs: spans[i].voStartMs,
    voEndMs: spans[i].voEndMs,
    startFrame,
    durationInFrames: endFrame - startFrame,
    words: sc.words,
    wordsPerSec: Number((sc.words / (voMs / 1000)).toFixed(2)),
  };
});
const totalMs = scenes.at(-1).endMs;

const timing = {
  source,
  provider: audioFile && opts.tts ? profile.provider : null,
  profile: profileKey,
  ...(profile.provider === 'gemini' && opts.tts
    ? { gemini: { voice: opts.geminiVoice || profile.voice, style: opts.geminiStyle || profile.style, model: opts.geminiModel || process.env.GEMINI_TTS_MODEL || 'gemini-3.8-flash-tts' } }
    : {}),
  audio: audioFile,
  lang,
  fps,
  wpsBudget: budget,
  totalMs,
  totalFrames: Math.round((totalMs / 1000) * fps),
  scenes,
};

const write = (p, s) => {
  const abs = path.resolve(process.cwd(), p);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, s, 'utf8');
  return abs;
};
const wordsPath = write(opts.outWords, JSON.stringify(words, null, 2));
const timingPath = write(opts.outTiming, JSON.stringify(timing, null, 2));

const sceneRows = scenes
  .map(
    (s) =>
      `| ${s.id} | ${s.plannedSec[0]}–${s.plannedSec[1]} s | ${(s.startMs / 1000).toFixed(2)}–${(s.endMs / 1000).toFixed(2)} s | ${s.durationInFrames}f | ${s.words} | ${s.wordsPerSec}${s.wordsPerSec > budget ? ' (terlalu padat)' : ''} |`
  )
  .join('\n');
const wordRows = words
  .map(
    (w, i) =>
      `| ${i + 1} | ${w.scene} | \`${w.text}\` | ${w.startMs}–${w.endMs} ms | **${w.role}** | \`${w.effect}\` | ${
        w.role === 'keyword' ? 'U2 (Pop Kata Kunci) + Camera Accent' : 'U1 (Tick Halus)'
      } |`
  )
  .join('\n');
write(
  opts.outMap,
  `# Peta Kata Narasi (Word Map)

- **Profil Suara:** ${timing.profile} — ${profile.desc}
- **Sumber timing:** \`${source}\`${source.includes('estimate') ?' (ESTIMASI: jangan dipakai untuk render final, sintesis ulang dengan --tts atau align dengan --audio)' : ''}
- **Total:** ${words.length} kata · ${(totalMs / 1000).toFixed(2)} s · ${timing.totalFrames} frame @ ${fps} fps
${notes.map((n) => `- Catatan: ${n}`).join('\n')}

## Durasi Scene Nyata

| Scene | Rencana | Nyata | Frame | Kata | Kata/detik (batas ${budget}) |
|---|---|---|---|---|---|
${sceneRows}

## Kata

| # | Scene | Kata | Timestamp | Hierarki | Efek Masuk | Reaksi Audio & Kamera |
|---|---|---|---|---|---|---|
${wordRows}
`
);

for (const n of notes) console.log(`[narrator-sync] ${n}`);
console.log(`[narrator-sync] ${words.length} kata, sumber timing: ${source}, total ${(totalMs / 1000).toFixed(2)} s (${timing.totalFrames}f)`);
console.log(`[narrator-sync] -> ${path.relative(process.cwd(), wordsPath)}, ${path.relative(process.cwd(), timingPath)}${audioFile ? `, ${audioFile}` : ''}`);
