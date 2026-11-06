/**
 * scripts/lib/tts.mjs
 * Lapisan TTS bersama: Edge TTS (gratis, WordBoundary asli) dan ElevenLabs (with-timestamps),
 * plus forced alignment WhisperX untuk audio rekaman yang sudah ada.
 *
 * Urutan sumber timing (paling akurat dulu):
 *   1. elevenlabs-alignment  (ElevenLabs /with-timestamps, butuh ELEVENLABS_API_KEY)
 *   2. edge-wordboundary     (Edge TTS, butuh `pip install edge-tts`)
 *   3. whisperx              (audio sudah ada: --audio, butuh `pip install whisperx`)
 *   4. estimate-scaled       (estimasi wpm diskalakan ke durasi audio asli)
 *   5. estimate-wpm          (tanpa audio sama sekali; hanya untuk draf)
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const VOICE_PROFILES = {
  N01: { provider: 'edge', voice: 'id-ID-ArdiNeural', rate: '+5%', pitch: '-2Hz', lang: 'id', desc: 'Editorial Hangat (ID Pria)' },
  N02: { provider: 'edge', voice: 'id-ID-GadisNeural', rate: '+10%', pitch: '+2Hz', lang: 'id', desc: 'Kreatif Energik (ID Wanita)' },
  N03: { provider: 'edge', voice: 'id-ID-ArdiNeural', rate: '-5%', pitch: '-6Hz', lang: 'id', desc: 'Dokumenter Sinematik (ID Pria Dalam)' },
  N04: { provider: 'edge', voice: 'en-US-ChristopherNeural', rate: '+8%', pitch: '+0Hz', lang: 'en', desc: 'Tech Explainer Cepat (EN Male)' },
  N05: { provider: 'edge', voice: 'en-US-AriaNeural', rate: '+0%', pitch: '+0Hz', lang: 'en', desc: 'Design Essayist (EN Female)' },
  // ElevenLabs (model multilingual, bisa bahasa Indonesia). ID voice premade bisa berubah:
  // cek daftar terbaru dengan `node scripts/voice-samples.mjs --list-eleven`, atau timpa dengan --eleven-voice <id>.
  N06: { provider: 'elevenlabs', voice: 'pNInz6obpgDQGcFmaJgB', lang: 'id', desc: 'ElevenLabs Adam — pria dalam, naratif' },
  N07: { provider: 'elevenlabs', voice: '21m00Tcm4TlvDq8ikWAM', lang: 'id', desc: 'ElevenLabs Rachel — wanita tenang, jelas' },
  N08: { provider: 'elevenlabs', voice: 'ErXwobaYiR8mE1cMBnKB', lang: 'id', desc: 'ElevenLabs Antoni — pria hangat, energik' },
};

/** Pengaruh penanda naskah terhadap prosodi tiap provider. */
const MOOD = {
  edge: {
    normal: { rate: 0, pitch: 0 },
    semangat: { rate: 8, pitch: 3 },
    pelan: { rate: -10, pitch: -1 },
  },
  elevenlabs: {
    normal: { stability: 0.5, style: 0.15 },
    semangat: { stability: 0.3, style: 0.55 },
    pelan: { stability: 0.7, style: 0.05 },
  },
};

const PY = process.platform === 'win32' ? 'python' : 'python3';

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${cmd} gagal: ${(r.stderr || '').slice(-600)}`);
  return r.stdout;
}

export function hasPython(mod) {
  const r = spawnSync(PY, ['-c', `import ${mod}`], { encoding: 'utf8' });
  return r.status === 0;
}

export function probeDurationMs(file) {
  const out = run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
  return Math.round(Number(out.trim()) * 1000);
}

const addPct = (base, d) => {
  const v = Number(String(base).replace('%', '')) + d;
  return `${v >= 0 ? '+' : ''}${v}%`;
};
const addHz = (base, d) => {
  const v = Number(String(base).replace('Hz', '')) + d;
  return `${v >= 0 ? '+' : ''}${v}Hz`;
};

export const norm = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]/gu, '');

/**
 * Petakan timestamp kata dari engine (tanpa tanda baca, kadang terpecah/tergabung)
 * kembali ke token naskah asli. Token tanpa pasangan diinterpolasi dari tetangganya.
 */
export function mapBoundariesToTokens(tokens, bounds, totalMs) {
  const out = tokens.map((t) => ({ text: t, startMs: null, endMs: null }));
  let bi = 0;
  for (const o of out) {
    const n = norm(o.text);
    if (!n || bi >= bounds.length) continue;
    let acc = norm(bounds[bi].text);
    o.startMs = bounds[bi].startMs;
    o.endMs = bounds[bi].endMs;
    bi++;
    while (acc.length < n.length && bi < bounds.length && n.startsWith(acc + norm(bounds[bi].text))) {
      acc += norm(bounds[bi].text);
      o.endMs = bounds[bi].endMs;
      bi++;
    }
  }
  // interpolasi token yang tidak kebagian timestamp
  for (let i = 0; i < out.length; i++) {
    if (out[i].startMs !== null) continue;
    let j = i;
    while (j < out.length && out[j].startMs === null) j++;
    const from = i > 0 ? out[i - 1].endMs : 0;
    const to = j < out.length ? out[j].startMs : Math.max(from + 200 * (j - i), totalMs || 0);
    const step = (to - from) / (j - i);
    for (let k = i; k < j; k++) {
      out[k].startMs = Math.round(from + step * (k - i));
      out[k].endMs = Math.round(from + step * (k - i + 1));
    }
    i = j - 1;
  }
  return out;
}

/** Estimasi durasi kata dari panjang huruf (dipakai bila tidak ada timing asli). */
export function estimateWords(tokens, { wpm = 150, targetMs = 0 } = {}) {
  const avg = 60000 / wpm;
  let cur = 0;
  const raw = tokens.map((t) => {
    const n = norm(t);
    const d = avg * Math.max(0.65, Math.min(1.45, n.length / 6));
    const w = { text: t, startMs: cur, endMs: cur + d };
    cur += d + (/[.,!?;:]$/.test(t) ? 180 : 25);
    return w;
  });
  const k = targetMs && cur > 0 ? targetMs / cur : 1;
  return raw.map((w) => ({ text: w.text, startMs: Math.round(w.startMs * k), endMs: Math.round(w.endMs * k) }));
}

function synthEdge(profile, seg, base) {
  const mood = MOOD.edge[seg.mood] || MOOD.edge.normal;
  const mp3 = `${base}.mp3`;
  const json = `${base}.json`;
  run(PY, [
    path.join(__dirname, 'edge_tts_words.py'),
    '--voice', profile.voice,
    `--rate=${addPct(profile.rate || '+0%', mood.rate)}`,
    `--pitch=${addHz(profile.pitch || '+0Hz', mood.pitch)}`,
    '--text', seg.text,
    '--out', mp3,
    '--json', json,
  ]);
  return { audio: mp3, bounds: JSON.parse(fs.readFileSync(json, 'utf8')), source: 'edge-wordboundary' };
}

async function synthEleven(profile, seg, base, opts) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY tidak ada di environment');
  const mood = MOOD.elevenlabs[seg.mood] || MOOD.elevenlabs.normal;
  const voiceId = opts.elevenVoice || profile.voice;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: seg.text,
        model_id: opts.elevenModel || 'eleven_multilingual_v2',
        voice_settings: { stability: mood.stability, similarity_boost: 0.75, style: mood.style, use_speaker_boost: true },
      }),
    }
  );
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const mp3 = `${base}.mp3`;
  fs.writeFileSync(mp3, Buffer.from(data.audio_base64, 'base64'));
  const al = data.alignment || data.normalized_alignment;
  const bounds = [];
  let w = null;
  al.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (w) bounds.push(w);
      w = null;
      return;
    }
    const s = Math.round(al.character_start_times_seconds[i] * 1000);
    const e = Math.round(al.character_end_times_seconds[i] * 1000);
    if (!w) w = { text: ch, startMs: s, endMs: e };
    else {
      w.text += ch;
      w.endMs = e;
    }
  });
  if (w) bounds.push(w);
  return { audio: mp3, bounds, source: 'elevenlabs-alignment' };
}

export async function synthSegment(profile, seg, base, opts = {}) {
  if (profile.provider === 'elevenlabs') return synthEleven(profile, seg, base, opts);
  return synthEdge(profile, seg, base);
}

function toWav(src, dst) {
  run('ffmpeg', ['-y', '-v', 'error', '-i', src, '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le', dst]);
}
function silenceWav(ms, dst) {
  run('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', String(ms / 1000), '-c:a', 'pcm_s16le', dst]);
}

/**
 * Sintesis seluruh naskah per segmen, gabungkan dengan jeda, dan kembalikan timestamp kata absolut.
 * @returns {{ words, sceneSpans, totalMs, source }}
 */
export async function synthScript(script, profile, opts) {
  const tmp = path.resolve(opts.tmpDir || 'out/.tts');
  fs.mkdirSync(tmp, { recursive: true });
  const parts = [];
  const words = [];
  const sceneSpans = [];
  let cursor = opts.leadInMs ?? 120;
  let source = null;
  let n = 0;
  if (cursor > 0) {
    const f = path.join(tmp, 'lead.wav');
    silenceWav(cursor, f);
    parts.push(f);
  }
  for (const [si, sc] of script.scenes.entries()) {
    const spanStart = cursor;
    for (const seg of sc.segments) {
      const base = path.join(tmp, `seg-${String(n++).padStart(3, '0')}`);
      const r = await synthSegment(profile, seg, base, opts);
      source = source || r.source;
      const wav = `${base}.wav`;
      toWav(r.audio, wav);
      const dur = probeDurationMs(wav);
      const mapped = mapBoundariesToTokens(seg.text.split(/\s+/), r.bounds, dur);
      for (const w of mapped) words.push({ text: w.text, startMs: cursor + w.startMs, endMs: cursor + w.endMs, scene: sc.id });
      parts.push(wav);
      cursor += dur;
      if (seg.pauseAfterMs) {
        const f = `${base}-pause.wav`;
        silenceWav(seg.pauseAfterMs, f);
        parts.push(f);
        cursor += seg.pauseAfterMs;
      }
    }
    sceneSpans.push({ id: sc.id, voStartMs: spanStart, voEndMs: cursor });
    const gap = si < script.scenes.length - 1 ? opts.sceneGapMs ?? 250 : opts.tailMs ?? 300;
    if (gap > 0) {
      const f = path.join(tmp, `gap-${si}.wav`);
      silenceWav(gap, f);
      parts.push(f);
      cursor += gap;
    }
  }
  const list = path.join(tmp, 'concat.txt');
  fs.writeFileSync(list, parts.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n'), 'utf8');
  const outAudio = path.resolve(opts.outAudio);
  fs.mkdirSync(path.dirname(outAudio), { recursive: true });
  const codec = outAudio.endsWith('.mp3') ? ['-c:a', 'libmp3lame', '-b:a', '192k'] : ['-c:a', 'pcm_s16le'];
  run('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-ar', '48000', ...codec, outAudio]);
  return { words, sceneSpans, totalMs: probeDurationMs(outAudio), source };
}

/** Forced alignment naskah ke audio yang sudah ada (WhisperX). */
export function alignWithWhisperX(audio, text, lang) {
  const json = path.resolve('out/.tts/whisperx-words.json');
  fs.mkdirSync(path.dirname(json), { recursive: true });
  run(PY, [path.join(__dirname, 'whisperx_align.py'), '--audio', audio, '--text', text, '--lang', lang, '--json', json]);
  return JSON.parse(fs.readFileSync(json, 'utf8'));
}
