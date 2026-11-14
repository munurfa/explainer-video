"""QA for a finished render: one-frame glitches and frozen stretches.

Usage (from the project folder):
    ffmpeg -v error -y -i out/v1.mp4 -vf scale=160:90,format=gray -f rawvideo out/qa-stills/gray.raw
    python research/qa-blink.py out/qa-stills/gray.raw

A screenshot that is captured blank for a single frame shows up as frame n differing strongly from
both neighbours while the neighbours match each other. Needs numpy only.
"""
import sys

import numpy as np

W, H = 160, 90
a = np.fromfile(sys.argv[1], dtype=np.uint8)
n = a.size // (W * H)
a = a[: n * W * H].reshape(n, H, W).astype(np.float32)
print("frames", n)

d1 = np.abs(a[1:] - a[:-1]).mean(axis=(1, 2))  # n vs n-1
d2 = np.abs(a[2:] - a[:-2]).mean(axis=(1, 2))  # n+1 vs n-1
blinks = []
for i in range(1, n - 1):
    step_in, step_out, around = d1[i - 1], d1[i], d2[i - 1]
    if step_in > 1.2 and step_out > 1.2 and around < 0.45 * min(step_in, step_out):
        blinks.append((i, round(float(step_in), 2), round(float(step_out), 2), round(float(around), 2)))
print("one-frame glitches:", blinks if blinks else "none")

# local blinks: a region that changes and snaps back while the rest moves on
tile = 30
local = []
for i in range(1, n - 1):
    for ty in range(0, H, tile):
        for tx in range(0, W, tile // 1):
            p, c, q = a[i - 1, ty : ty + tile, tx : tx + tile], a[i, ty : ty + tile, tx : tx + tile], a[i + 1, ty : ty + tile, tx : tx + tile]
            din, dout, dar = np.abs(c - p).mean(), np.abs(q - c).mean(), np.abs(q - p).mean()
            if din > 12 and dout > 12 and dar < 0.3 * min(din, dout):
                local.append((i, tx, ty, round(float(din), 1), round(float(dar), 1)))
print("local one-frame glitches:", local[:40] if local else "none")

still = d1 < 0.02
runs, s = [], None
for i, v in enumerate(still):
    if v and s is None:
        s = i
    if not v and s is not None:
        if i - s >= 20:
            runs.append((s + 1, i, i - s))
        s = None
if s is not None and len(still) - s >= 20:
    runs.append((s + 1, len(still), len(still) - s))
print("frozen runs >= 20 f (start, end, len):", runs if runs else "none")
