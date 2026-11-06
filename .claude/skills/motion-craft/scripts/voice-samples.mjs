#!/usr/bin/env node
/**
 * scripts/voice-samples.mjs
 * Stage 4a: buat 3 sampel suara dari kalimat hook (S1) agar user memilih narator sebelum VO penuh.
 *
 *   node voice-samples.mjs --script research/vo-script.md            # 3 suara default sesuai bahasa
 *   node voice-samples.mjs --text "Kok air bisa berhenti?" --voices N01,N02,N03
 *   node voice-samples.mjs --list-eleven                              # daftar voice ElevenLabs akun user
 *
 * Default suara:
 *   - ELEVENLABS_API_KEY ada  -> N06, N07, N08 (ElevenLabs multilingual)
 *   - tanpa key, bahasa id    -> N01, N02, N03 (Edge TTS)
 *   - tanpa key, bahasa en    -> N04, N05, N01
 * Voice ElevenLabs kustom: --voices eleven:<voice_id>,eleven:<voice_id2>
 * Output: research/voice-samples/<id>.mp3 + research/voice-samples.md (tabel untuk dipilih user).
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadVoScript, singleSceneScript } from './lib/vo-script.mjs';
import { VOICE_PROFILES, synthScript } from './lib/tts.mjs';

function parseArgs(argv) {
  const a = { script: null, text: null, voices: null, out: 'research/voice-samples', md: 'research/voice-samples.md', listEleven: false, scene: 'S1' };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--script' && v) a.script = v;
    if (k === '--text' && v) a.text = v;
    if (k === '--voices' && v) a.voices = v.split(',').map((x) => x.trim()).filter(Boolean);
    if (k === '--scene' && v) a.scene = v.toUpperCase();
    if (k === '--out' && v) a.out = v;
    if (k === '--md' && v) a.md = v;
    if (k === '--list-eleven') a.listEleven = true;
  }
  if (!a.script && !a.text && fs.existsSync('research/vo-script.md')) a.script = 'research/vo-script.md';
  return a;
}

const opts = parseArgs(process.argv);
const hasKey = Boolean(process.env.ELEVENLABS_API_KEY);

async function listEleven() {
  if (!hasKey) {
    console.error('[voice-samples] ELEVENLABS_API_KEY tidak ada di environment.');
    process.exit(2);
  }
  const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY } });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const { voices } = await res.json();
  console.log('| voice_id | Nama | Kategori | Label |\n|---|---|---|---|');
  for (const v of voices) {
    const labels = Object.values(v.labels || {}).join(', ');
    console.log(`| ${v.voice_id} | ${v.name} | ${v.category || '-'} | ${labels || '-'} |`);
  }
  console.log('\nPakai: --voices eleven:<voice_id>,... atau narrator-sync --profile N06 --eleven-voice <voice_id>');
}

function resolveVoice(v, lang) {
  if (v.startsWith('eleven:')) {
    return { key: v.slice(7), profile: { provider: 'elevenlabs', voice: v.slice(7), lang, desc: `ElevenLabs ${v.slice(7)}` } };
  }
  const p = VOICE_PROFILES[v.toUpperCase()];
  if (!p) throw new Error(`Profil ${v} tidak dikenal. Pilihan: ${Object.keys(VOICE_PROFILES).join(', ')} atau eleven:<voice_id>.`);
  return { key: v.toUpperCase(), profile: p };
}

async function main() {
  if (opts.listEleven) return listEleven();

  let script;
  let lang = 'id';
  if (opts.text) script = singleSceneScript(opts.text);
  else if (opts.script) {
    const full = loadVoScript(path.resolve(opts.script));
    lang = (full.meta.bahasa || 'id').toLowerCase().startsWith('en') ? 'en' : 'id';
    const sc = full.scenes.find((s) => s.id === opts.scene) || full.scenes[0];
    if (!sc) throw new Error(`Tidak ada scene di ${opts.script}.`);
    script = { meta: full.meta, scenes: [sc] };
  } else throw new Error('Pakai --script research/vo-script.md atau --text "<kalimat hook>".');

  const defaults = hasKey ? ['N06', 'N07', 'N08'] : lang === 'en' ? ['N04', 'N05', 'N01'] : ['N01', 'N02', 'N03'];
  const requested = opts.voices || defaults;
  const rows = [];
  const notes = [];
  fs.mkdirSync(path.resolve(opts.out), { recursive: true });

  for (const v of requested) {
    let { key, profile } = resolveVoice(v, lang);
    if (profile.provider === 'elevenlabs' && !hasKey) {
      notes.push(`${key}: ELEVENLABS_API_KEY tidak ada, dilewati.`);
      continue;
    }
    const outAudio = path.join(opts.out, `${key}.mp3`);
    try {
      const r = await synthScript(script, profile, { outAudio, tmpDir: `out/.tts/sample-${key}`, leadInMs: 0, sceneGapMs: 0, tailMs: 200 });
      const words = r.words.length;
      rows.push({ key, profile, file: outAudio, sec: r.totalMs / 1000, wps: words / Math.max(0.1, (r.words.at(-1)?.endMs - r.words[0]?.startMs) / 1000) });
      console.log(`[voice-samples] ${key} -> ${outAudio} (${(r.totalMs / 1000).toFixed(2)} dtk)`);
    } catch (e) {
      notes.push(`${key}: gagal (${e.message.slice(0, 160)}).`);
    }
  }
  if (!rows.length) throw new Error(`Tidak ada sampel yang berhasil. ${notes.join(' ')}`);

  const text = script.scenes[0].text;
  const md = [
    '# Sampel Suara Narator',
    '',
    `Kalimat uji (${script.scenes[0].id}): "${text}"`,
    '',
    '| Pilihan | Profil | Provider | Suara | Durasi | Kata/dtk | File |',
    '|---|---|---|---|---|---|---|',
    ...rows.map((r, i) => `| ${String.fromCharCode(65 + i)} | ${r.key} | ${r.profile.provider} | ${r.profile.desc} | ${r.sec.toFixed(2)} dtk | ${r.wps.toFixed(2)} | \`${r.file.replace(/\\/g, '/')}\` |`),
    '',
    ...(notes.length ? ['Catatan:', ...notes.map((n) => `- ${n}`), ''] : []),
    hasKey ? '' : 'ElevenLabs tidak dipakai karena ELEVENLABS_API_KEY tidak ada. Set key tersebut untuk sampel N06–N08.',
    '',
    '[STOP – TUNGGU APPROVAL] Minta user memilih A/B/C. Profil terpilih ditulis ke `- Profil:` di research/vo-script.md, lalu jalankan narrator-sync.mjs --script research/vo-script.md --tts.',
    '',
  ].join('\n');
  fs.mkdirSync(path.dirname(path.resolve(opts.md)), { recursive: true });
  fs.writeFileSync(path.resolve(opts.md), md, 'utf8');
  console.log(`[voice-samples] ${rows.length} sampel -> ${opts.md}`);
}

main().catch((e) => {
  console.error(`[voice-samples] ${e.message}`);
  process.exit(1);
});
