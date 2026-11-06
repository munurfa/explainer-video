/**
 * scripts/lib/vo-script.mjs
 * Parser naskah VO (research/vo-script.md) yang dipakai narrator-sync, vo-lint, dan voice-samples.
 *
 * Format naskah:
 *   ## S1 · 0–3 · hook
 *   Kok air bisa berhenti? [jeda] Ternyata rahasianya ada di sini.
 *   ## S5 · 17–20 · cta
 *   [semangat] Follow untuk bedah berikutnya! [/semangat]
 *
 * Penanda:
 *   [jeda]        jeda 600 ms (atau [jeda 0.4] = 400 ms)
 *   [semangat]    nada lebih cepat dan tinggi sampai [/semangat], [jeda], atau akhir scene
 *   [pelan]       nada lebih lambat untuk penekanan, sampai [/pelan], [jeda], atau akhir scene
 * Tag heading opsional: hook, cta (dicek oleh vo-lint.mjs).
 */

import fs from 'node:fs';

export const WPS_BUDGET = { id: 2.5, en: 2.8 };
export const DEFAULT_PAUSE_MS = 600;

const HEADING = /^##\s+S(\d+)\s*(?:·|\||-)\s*([\d.]+)\s*[–-]\s*([\d.]+)\s*(?:(?:·|\|)\s*(.+))?$/;

export function cleanText(s) {
  return s
    .replace(/\[\/?(semangat|pelan)\]/gi, ' ')
    .replace(/\[jeda(?:\s+[\d.]+)?\]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function countWords(s) {
  const t = cleanText(s);
  return t ? t.split(' ').length : 0;
}

/** Pecah teks scene menjadi segmen bersuasana sama + jeda setelahnya. */
export function toSegments(text) {
  const segs = [];
  let mood = 'normal';
  let buf = '';
  const flush = (pauseAfterMs = 0) => {
    const t = buf.replace(/\s+/g, ' ').trim();
    if (t) segs.push({ text: t, mood, pauseAfterMs });
    else if (pauseAfterMs && segs.length) segs[segs.length - 1].pauseAfterMs += pauseAfterMs;
    buf = '';
  };
  const re = /\[(\/?)(semangat|pelan|jeda)(?:\s+([\d.]+))?\]/gi;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    buf += text.slice(last, m.index);
    last = re.lastIndex;
    const [, close, tag, num] = m;
    const t = tag.toLowerCase();
    if (t === 'jeda') {
      flush(num ? Math.round(Number(num) * 1000) : DEFAULT_PAUSE_MS);
      mood = 'normal';
    } else if (close) {
      flush(0);
      mood = 'normal';
    } else {
      flush(0);
      mood = t;
    }
  }
  buf += text.slice(last);
  flush(0);
  return segs;
}

export function parseVoScript(raw) {
  const lines = raw.split(/\r?\n/);
  const meta = {};
  const scenes = [];
  let cur = null;
  for (const line of lines) {
    const h = line.match(HEADING);
    if (h) {
      cur = {
        id: `S${h[1]}`,
        index: Number(h[1]),
        startSec: Number(h[2]),
        endSec: Number(h[3]),
        tags: (h[4] || '')
          .split(/[·,|]/)
          .map((x) => x.trim().toLowerCase())
          .filter(Boolean),
        rawText: '',
      };
      scenes.push(cur);
      continue;
    }
    // Heading level-2 lain (mis. "## Cek Penonton Awam") menutup scene: isinya bukan narasi.
    if (/^##\s/.test(line)) {
      cur = null;
      continue;
    }
    const mm = line.match(/^-\s*(Bahasa|Profil|Judul|Provider)\s*:\s*(.+)$/i);
    if (!cur && mm) {
      meta[mm[1].toLowerCase()] = mm[2].trim();
      continue;
    }
    if (cur && line.trim() && !line.trim().startsWith('<!--') && !line.startsWith('#')) {
      cur.rawText += (cur.rawText ? ' ' : '') + line.trim();
    }
  }
  for (const s of scenes) {
    s.text = cleanText(s.rawText);
    s.words = countWords(s.rawText);
    s.segments = toSegments(s.rawText);
  }
  return { meta, scenes };
}

export function loadVoScript(file) {
  return parseVoScript(fs.readFileSync(file, 'utf8'));
}

/** Naskah satu baris (--text) diperlakukan sebagai satu scene. */
export function singleSceneScript(text, durationSec = 0) {
  const words = countWords(text);
  return {
    meta: {},
    scenes: [
      {
        id: 'S1',
        index: 1,
        startSec: 0,
        endSec: durationSec || Math.max(1, words / 2.5),
        tags: [],
        rawText: text,
        text: cleanText(text),
        words,
        segments: toSegments(text),
      },
    ],
  };
}
