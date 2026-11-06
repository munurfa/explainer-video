"""Sintesis satu segmen Edge TTS + timestamp kata asli (WordBoundary).

Pemakaian:
  python edge_tts_words.py --voice id-ID-ArdiNeural --rate +5% --pitch -2Hz \
      --text "..." --out seg.mp3 --json seg.json

Output JSON: [{"text": "Kok", "startMs": 99, "endMs": 302}, ...] (offset relatif awal segmen).
"""
import argparse
import asyncio
import json

import edge_tts


async def run(a):
    comm = edge_tts.Communicate(a.text, a.voice, rate=a.rate, pitch=a.pitch, boundary="WordBoundary")
    words = []
    with open(a.out, "wb") as f:
        async for ch in comm.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                start = ch["offset"] / 10000.0  # 100 ns -> ms
                words.append({
                    "text": ch["text"],
                    "startMs": round(start),
                    "endMs": round(start + ch["duration"] / 10000.0),
                })
    with open(a.json, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--voice", required=True)
    p.add_argument("--rate", default="+0%")
    p.add_argument("--pitch", default="+0Hz")
    p.add_argument("--text", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--json", required=True)
    asyncio.run(run(p.parse_args()))
