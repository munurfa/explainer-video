"""Timestamp kata dari audio dengan faster-whisper (opsional, alternatif WhisperX).

Dipakai untuk audio Gemini TTS yang tidak membawa timestamp kata.
Pasang: pip install faster-whisper   (CPU cukup; model "small" sekitar 0,5 GB, diunduh sekali)
Pemakaian:
  python faster_whisper_words.py --audio narration.mp3 --text "naskah lengkap" --lang id --json words.json
Output: [{"text": "...", "startMs": 0, "endMs": 0}, ...]
"""
import argparse
import json

from faster_whisper import WhisperModel


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--audio", required=True)
    p.add_argument("--text", default="")
    p.add_argument("--lang", default="id")
    p.add_argument("--model", default="small")
    p.add_argument("--device", default="auto")
    p.add_argument("--json", required=True)
    a = p.parse_args()

    compute = "int8"
    model = WhisperModel(a.model, device=a.device, compute_type=compute)
    # Naskah sebagai prompt agar ejaan kata (nama brand, istilah lokal) mengikuti naskah.
    segments, _ = model.transcribe(
        a.audio,
        language=a.lang,
        word_timestamps=True,
        initial_prompt=a.text[:800] or None,
        vad_filter=False,
        condition_on_previous_text=False,
    )
    words = []
    for seg in segments:
        for w in seg.words or []:
            t = w.word.strip()
            if t:
                words.append({"text": t, "startMs": round(w.start * 1000), "endMs": round(w.end * 1000)})
    with open(a.json, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False)


if __name__ == "__main__":
    main()
