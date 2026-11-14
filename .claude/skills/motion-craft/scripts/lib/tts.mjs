/**
 * scripts/lib/tts.mjs
 * Lapisan TTS bersama: Edge TTS (gratis, WordBoundary asli), ElevenLabs (with-timestamps),
 * Gemini TTS (Google AI Studio, gaya bicara lewat prompt), plus forced alignment untuk audio yang sudah ada.
 *
 * Urutan sumber timing (paling akurat dulu):
 *   1. elevenlabs-alignment     (ElevenLabs /with-timestamps, butuh ELEVENLABS_API_KEY)
 *   2. edge-wordboundary        (Edge TTS, butuh `pip install edge-tts`)
 *   3. gemini+whisperx / gemini+faster-whisper
 *                               (Gemini tidak memberi timestamp kata: audio penuh di-align ulang)
 *   4. whisperx                 (audio sudah ada: --audio, butuh `pip install whisperx`)
 *   5. gemini-estimate-segment  (Gemini tanpa aligner: batas segmen asli, kata di dalamnya estimasi)
 *   6. estimate-scaled          (estimasi wpm diskalakan ke durasi audio asli)
 *   7. estimate-wpm             (tanpa audio sama sekali; hanya untuk draf)
 *
 * API key dibaca dari environment atau file .env di folder project (cwd).
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env di folder project (GEMINI_API_KEY, ELEVENLABS_API_KEY). Variabel yang sudah ada tidak ditimpa.
try {
  if (fs.existsSync('.env')) process.loadEnvFile('.env');
} catch {
  /* .env tidak terbaca: key tetap bisa diset lewat environment */
}

export const geminiKey = () => process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
export const GEMINI_TTS_MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.8-flash-tts';

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
  // Gemini TTS (Google AI Studio, butuh GEMINI_API_KEY). 30 suara preset, bahasa Indonesia didukung.
  // `style` = arahan gaya bicara (prompt). Timpa per video dengan `- Gaya:` di vo-script.md atau --gemini-style.
  // Suara lain: --voices gemini:<Nama> (mis. gemini:Achird) atau narrator-sync --gemini-voice <Nama>.
  N09: {
    provider: 'gemini', voice: 'Charon', lang: 'id', desc: 'Gemini Charon — pria informatif, naratif',
    style: 'warm, clear and trustworthy explainer narrator, relaxed conversational pace, like a friendly neighbour explaining something useful',
  },
  N10: {
    provider: 'gemini', voice: 'Sulafat', lang: 'id', desc: 'Gemini Sulafat — wanita hangat, ramah',
    style: 'warm and friendly female narrator, calm and reassuring, conversational, smiling voice',
  },
  N11: {
    provider: 'gemini', voice: 'Puck', lang: 'id', desc: 'Gemini Puck — pria ceria, energik',
    style: 'upbeat and energetic social-media narrator, lively but not shouting, casual and fun',
  },
};

/** Profil dari id (N09) atau `gemini:<Voice>` / `eleven:<voice_id>`. */
export function resolveProfile(v, lang = 'id') {
  if (v.startsWith('eleven:')) {
    return { key: v.slice(7), profile: { provider: 'elevenlabs', voice: v.slice(7), lang, desc: `ElevenLabs ${v.slice(7)}` } };
  }
  if (v.startsWith('gemini:')) {
    const voice = v.slice(7);
    return { key: `G-${voice}`, profile: { provider: 'gemini', voice, lang, desc: `Gemini ${voice}`, style: VOICE_PROFILES.N09.style } };
  }
  const p = VOICE_PROFILES[v.toUpperCase()];
  if (!p) throw new Error(`Profil ${v} tidak dikenal. Pilihan: ${Object.keys(VOICE_PROFILES).join(', ')}, gemini:<Nama> atau eleven:<voice_id>.`);
  return { key: v.toUpperCase(), profile: p };
}

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
  gemini: {
    normal: '',
    semangat: 'more excited and energetic, slightly faster',
    pelan: 'slower and more deliberate, emphasising each word',
  },
};

// MOTION_PY: path python.exe lain untuk edge-tts / whisperx / faster-whisper (mis. venv Python 3.12).
const PY = process.env.MOTION_PY || (process.platform === 'win32' ? 'python' : 'python3');

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

/** Kemiripan 0..1 dari jarak Levenshtein (ejaan engine sering beda: "Jakuir" vs "Jakwir"). */
export function similarity(a, b) {
  if (a === b) return 1;
  if (!a || !b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, k) => k);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let k = 1; k <= b.length; k++) {
      cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + (a[i - 1] === b[k - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return 1 - prev[b.length] / Math.max(a.length, b.length);
}

/**
 * Petakan timestamp kata dari engine (tanpa tanda baca, kadang terpecah/tergabung)
 * kembali ke token naskah asli. Token tanpa pasangan diinterpolasi dari tetangganya.
 */
export function mapBoundariesToTokens(tokens, bounds, totalMs) {
  const out = tokens.map((t) => ({ text: t, startMs: null, endMs: null }));
  // Alignment urutan (DP): token boleh dilewati (kata tidak tertangkap engine), kata engine boleh
  // dilewati (sisipan), dan 1 token boleh menelan 1–3 kata engine ("pelan-pelan" -> "pelan" "-pelan").
  // Greedy posisi lama bergeser permanen begitu satu kata hilang.
  const T = tokens.map(norm);
  const B = bounds.map((b) => norm(b.text));
  const n = T.length, m = B.length, SKIP = 0.7, MAXJ = 3;
  const cost = Array.from({ length: n + 1 }, () => new Float64Array(m + 1).fill(Infinity));
  const from = Array.from({ length: n + 1 }, () => new Int8Array(m + 1));
  cost[0][0] = 0;
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= m; j++) {
      const c = cost[i][j];
      if (c === Infinity) continue;
      const relax = (ii, jj, v, op) => { if (v < cost[ii][jj]) { cost[ii][jj] = v; from[ii][jj] = op; } };
      if (i < n) relax(i + 1, j, c + (T[i] ? SKIP : 0), -1); // token tanpa pasangan
      if (j < m) relax(i, j + 1, c + SKIP, -2); // kata engine tanpa pasangan
      if (i < n && T[i]) {
        let acc = '';
        for (let k = 1; k <= MAXJ && j + k <= m; k++) {
          acc += B[j + k - 1];
          relax(i + 1, j + k, c + (1 - similarity(T[i], acc)) + (k - 1) * 0.05, k);
        }
      }
    }
  }
  for (let i = n, j = m; i > 0 || j > 0; ) {
    const op = from[i][j];
    if (op === -1) i--;
    else if (op === -2) j--;
    else {
      // pasangan terlalu beda dianggap tidak cocok -> diinterpolasi
      if (similarity(T[i - 1], B.slice(j - op, j).join('')) >= 0.5) {
        out[i - 1].startMs = bounds[j - op].startMs;
        out[i - 1].endMs = bounds[j - 1].endMs;
      }
      i--;
      j -= op;
    }
  }
  // interpolasi token yang tidak kebagian timestamp
  for (let i = 0; i < out.length; i++) {
    if (out[i].startMs !== null) continue;
    let j = i;
    while (j < out.length && out[j].startMs === null) j++;
    let from = i > 0 ? out[i - 1].endMs : 0;
    const to = j < out.length ? out[j].startMs : Math.max(from + 200 * (j - i), totalMs || 0);
    // Celah terlalu sempit (kata terucap tapi tidak tertangkap engine): bagi rata dengan kata sebelumnya.
    if (i > 0 && (to - from) / (j - i) < 120) {
      i--;
      from = out[i].startMs;
    }
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Cari blok audio base64 terakhir di respons Gemini (Interactions API atau generateContent). */
function findAudioB64(node) {
  let found = null;
  const walk = (n) => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(walk);
    const mime = n.mime_type || n.mimeType || '';
    if (typeof n.data === 'string' && n.data.length > 100 && (/audio/.test(mime) || n.type === 'audio')) found = { data: n.data, mime };
    for (const v of Object.values(n)) walk(v);
  };
  walk(node);
  return found;
}

async function geminiFetch(url, body, key) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true, json: await res.json() };
    const text = (await res.text()).slice(0, 400);
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      const ra = Number(res.headers.get('retry-after'));
      const wait = ra > 0 ? ra * 1000 : 3000 * 2 ** attempt;
      console.warn(`[tts] Gemini ${res.status}, coba lagi dalam ${Math.round(wait / 1000)} dtk...`);
      await sleep(wait);
      continue;
    }
    return { ok: false, status: res.status, text };
  }
}

/**
 * Gemini TTS -> WAV. Hasil di-cache per (model, suara, gaya, teks) di out/.tts/gemini-cache:
 * Gemini tidak deterministik, jadi take yang sudah disetujui tidak berubah saat skrip dijalankan ulang.
 * Pakai --gemini-fresh (atau hapus cache) untuk generate ulang.
 */
async function synthGemini(profile, seg, base, opts) {
  const key = geminiKey();
  if (!key) throw new Error('GEMINI_API_KEY tidak ada (environment atau .env project)');
  const model = opts.geminiModel || GEMINI_TTS_MODEL;
  const voice = opts.geminiVoice || profile.voice;
  const style = [opts.geminiStyle || profile.style, MOOD.gemini[seg.mood], 'Speak natural, everyday Bahasa Indonesia with correct Indonesian pronunciation']
    .filter(Boolean)
    .join('. ');

  const cacheDir = path.resolve('out/.tts/gemini-cache');
  fs.mkdirSync(cacheDir, { recursive: true });
  const hash = createHash('sha1').update(JSON.stringify([model, voice, style, seg.text])).digest('hex').slice(0, 16);
  const cached = path.join(cacheDir, `${hash}.wav`);
  const wav = `${base}.gemini.wav`;
  if (fs.existsSync(cached) && !opts.geminiFresh) {
    fs.copyFileSync(cached, wav);
    return { audio: wav, bounds: null, source: 'gemini' };
  }

  const root = 'https://generativelanguage.googleapis.com/v1beta';
  // Skema resmi model 3.8: Interactions API.
  let r = await geminiFetch(
    `${root}/interactions`,
    {
      model,
      input: [{ type: 'user_input', content: [{ type: 'text', text: seg.text, annotations: [{ type: 'speech_metadata', style }] }] }],
      response_format: { type: 'audio' },
      generation_config: { speech_config: [{ voice }] },
    },
    key
  );
  // Model lama (2.5 / preview) yang tidak ada di Interactions API: coba generateContent.
  if (!r.ok && (r.status === 404 || r.status === 400)) {
    const first = r;
    r = await geminiFetch(
      `${root}/models/${model}:generateContent`,
      {
        contents: [{ parts: [{ text: `Say in this style (${style}): ${seg.text}` }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        },
      },
      key
    );
    if (!r.ok) throw new Error(`Gemini ${first.status}: ${first.text} | generateContent ${r.status}: ${r.text}`);
  } else if (!r.ok) {
    throw new Error(`Gemini ${r.status}: ${r.text}`);
  }

  const audio = findAudioB64(r.json);
  if (!audio) throw new Error(`Respons Gemini tanpa audio: ${JSON.stringify(r.json).slice(0, 300)}`);
  const buf = Buffer.from(audio.data, 'base64');
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF') fs.writeFileSync(wav, buf);
  else {
    // PCM mentah (audio/L16): 16-bit LE mono, rate dari mime bila ada (default 24 kHz)
    const rate = Number((audio.mime.match(/rate=(\d+)/) || [])[1]) || 24000;
    const pcm = `${base}.gemini.pcm`;
    fs.writeFileSync(pcm, buf);
    run('ffmpeg', ['-y', '-v', 'error', '-f', 's16le', '-ar', String(rate), '-ac', '1', '-i', pcm, wav]);
  }
  fs.copyFileSync(wav, cached);
  return { audio: wav, bounds: null, source: 'gemini' };
}

export async function synthSegment(profile, seg, base, opts = {}) {
  if (profile.provider === 'elevenlabs') return synthEleven(profile, seg, base, opts);
  if (profile.provider === 'gemini') return synthGemini(profile, seg, base, opts);
  return synthEdge(profile, seg, base);
}

function toWav(src, dst, tempo = 1, trim = false) {
  // trim: buang hening awal/akhir segmen (Gemini menambah ±0,5 dtk hening di ujung take).
  // Hanya untuk audio tanpa timestamp engine, karena memotong awal menggeser timestamp itu.
  const cut = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04';
  const filters = [...(trim ? [cut, 'areverse', cut, 'areverse'] : []), ...(tempo !== 1 ? [`atempo=${tempo}`] : [])];
  const af = filters.length ? ['-af', filters.join(',')] : [];
  run('ffmpeg', ['-y', '-v', 'error', '-i', src, ...af, '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le', dst]);
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
    let speechEnd = cursor;
    for (const seg of sc.segments) {
      const base = path.join(tmp, `seg-${String(n++).padStart(3, '0')}`);
      const r = await synthSegment(profile, seg, base, opts);
      source = source || r.source;
      const wav = `${base}.wav`;
      const tempo = opts.tempo || 1;
      toWav(r.audio, wav, tempo, !r.bounds);
      const dur = probeDurationMs(wav);
      // Timestamp engine (Edge/ElevenLabs) ikut dipadatkan oleh atempo.
      if (r.bounds && tempo !== 1) r.bounds = r.bounds.map((b) => ({ ...b, startMs: b.startMs / tempo, endMs: b.endMs / tempo }));
      // Tanpa timestamp dari engine (Gemini): estimasi di dalam segmen, batas segmen tetap asli.
      const mapped = r.bounds
        ? mapBoundariesToTokens(seg.text.split(/\s+/), r.bounds, dur)
        : estimateWords(seg.text.split(/\s+/), { targetMs: Math.max(1, dur - 60) });
      for (const w of mapped) words.push({ text: w.text, startMs: cursor + w.startMs, endMs: cursor + w.endMs, scene: sc.id });
      parts.push(wav);
      cursor += dur;
      speechEnd = cursor;
      if (seg.pauseAfterMs) {
        const f = `${base}-pause.wav`;
        const pause = Math.round(seg.pauseAfterMs / (opts.tempo || 1));
        silenceWav(pause, f);
        parts.push(f);
        cursor += pause;
      }
    }
    // voEndMs = akhir ucapan terakhir; jeda penutup scene tidak dihitung sebagai bicara.
    sceneSpans.push({ id: sc.id, voStartMs: spanStart, voEndMs: speechEnd, endMs: cursor });
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
  const totalMs = probeDurationMs(outAudio);

  if (source === 'gemini') {
    source = 'gemini-estimate-segment';
    const lang = (profile.lang || 'id').slice(0, 2);
    const aligned = opts.align === 'none' ? null : alignAny(outAudio, words.map((w) => w.text).join(' '), lang, opts.align);
    if (aligned) {
      const mapped = mapBoundariesToTokens(words.map((w) => w.text), aligned.bounds, totalMs);
      // Batas scene pasti (dari sambungan segmen). Whisper sering menaruh awal kata pertama scene di jeda
      // hening sebelumnya, jadi kata yang meleset sedikit dijepit ke span scene-nya. Hasil ditolak hanya
      // bila ada kata yang meleset jauh (> 1,5 dtk) atau urutannya mundur.
      const ok = mapped.every((w, i) => {
        const sp = sceneSpans.find((s) => s.id === words[i].scene);
        const inScene = !sp || (w.startMs >= sp.voStartMs - 1500 && w.startMs <= sp.voEndMs + 1500);
        return inScene && (i === 0 || w.startMs >= mapped[i - 1].startMs - 50);
      });
      if (ok) {
        mapped.forEach((w, i) => {
          const sp = sceneSpans.find((s) => s.id === words[i].scene);
          if (!sp) return;
          w.startMs = Math.min(Math.max(w.startMs, sp.voStartMs), sp.voEndMs - 40);
          w.endMs = Math.min(Math.max(w.endMs, w.startMs + 40), sp.voEndMs);
        });
      }
      if (ok) {
        mapped.forEach((w, i) => Object.assign(words[i], { startMs: w.startMs, endMs: w.endMs }));
        source = `gemini+${aligned.engine}`;
      } else {
        console.warn(`[tts] hasil ${aligned.engine} tidak cocok dengan batas scene; tetap pakai estimasi per segmen.`);
      }
    }
  }
  return { words, sceneSpans, totalMs, source };
}

/**
 * Align naskah ke audio dengan aligner Python yang tersedia.
 * prefer: 'whisperx' | 'faster-whisper' | 'auto'/undefined. Mengembalikan null bila tidak ada atau gagal.
 */
export function alignAny(audio, text, lang, prefer) {
  const order = prefer && prefer !== 'auto' ? [prefer] : ['whisperx', 'faster-whisper'];
  for (const engine of order) {
    try {
      if (engine === 'whisperx' && hasPython('whisperx')) return { engine, bounds: alignWithWhisperX(audio, text, lang) };
      if (engine === 'faster-whisper' && hasPython('faster_whisper')) return { engine, bounds: alignWithFasterWhisper(audio, text, lang) };
    } catch (err) {
      console.warn(`[tts] ${engine} gagal: ${err.message.split('\n')[0]}`);
    }
  }
  return null;
}

/** Timestamp kata dari faster-whisper (transkripsi + word_timestamps, naskah sebagai initial prompt). */
export function alignWithFasterWhisper(audio, text, lang) {
  const json = path.resolve('out/.tts/faster-whisper-words.json');
  fs.mkdirSync(path.dirname(json), { recursive: true });
  const model = process.env.WHISPER_MODEL || 'small';
  run(PY, [path.join(__dirname, 'faster_whisper_words.py'), '--audio', audio, '--text', text, '--lang', lang, '--model', model, '--json', json]);
  return JSON.parse(fs.readFileSync(json, 'utf8'));
}

/** Forced alignment naskah ke audio yang sudah ada (WhisperX). */
export function alignWithWhisperX(audio, text, lang) {
  const json = path.resolve('out/.tts/whisperx-words.json');
  fs.mkdirSync(path.dirname(json), { recursive: true });
  run(PY, [path.join(__dirname, 'whisperx_align.py'), '--audio', audio, '--text', text, '--lang', lang, '--json', json]);
  return JSON.parse(fs.readFileSync(json, 'utf8'));
}
