"""Forced alignment naskah ke audio rekaman dengan WhisperX (opsional).

Pasang: pip install whisperx   (butuh torch; CPU cukup untuk klip pendek)
Pemakaian:
  python whisperx_align.py --audio vo.wav --text "naskah lengkap" --lang id --json words.json
Output: [{"text": "...", "startMs": 0, "endMs": 0}, ...]
"""
import argparse
import json

import whisperx


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--audio", required=True)
    p.add_argument("--text", required=True)
    p.add_argument("--lang", default="id")
    p.add_argument("--json", required=True)
    p.add_argument("--device", default="cpu")
    a = p.parse_args()

    audio = whisperx.load_audio(a.audio)
    duration = len(audio) / 16000.0
    model, meta = whisperx.load_align_model(language_code=a.lang, device=a.device)
    result = whisperx.align(
        [{"text": a.text, "start": 0.0, "end": duration}], model, meta, audio, a.device, return_char_alignments=False
    )
    words = []
    for seg in result["segments"]:
        for w in seg.get("words", []):
            if "start" in w and "end" in w:
                words.append({"text": w["word"], "startMs": round(w["start"] * 1000), "endMs": round(w["end"] * 1000)})
    with open(a.json, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False)


if __name__ == "__main__":
    main()
