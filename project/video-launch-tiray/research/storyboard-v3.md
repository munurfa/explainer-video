# STORYBOARD v3: Launch Tiray (9:16), "Glass Blue" style (revision 1)

Fixed: **57 s = 1710 frames** (maximum 1 minute), 1080×1920, 30 fps, **background music only (no SFX, no narrator)**, CTA "Ayo Jakwir, monggo didownload!", Google Play badge, and #YuhBukaTiray. The VO prompt + SRT guide is delivered separately so a VO can be added later.
v1 and v2 stay as they are. This version is a new build, in `src/v3/`, rendered to `out/v3.mp4`.

## 0. Revision 1 (user feedback on the first v3 style frames)

| # | Request | Change |
|---|---|---|
| 1 | Background music, not sound effects | All SFX cues removed. Audio = one music track only, fade in 10 f, fade out over the last 50 f |
| 2 | "Semua urusan air" → "Semua layanan air" | Changed in S2c and S9a |
| 3 | Left logo (the Danantara position) → Pemda Kabupaten Tegal logo with a label | Official Pemkab Tegal coat of arms (`public/brand/pemkab-tegal.png`, from the Tirta Ayu portal assets) + label "Pemerintah / Kabupaten Tegal" |
| 4 | Right logo stays, but use `lambang-warna-alas-putih` without the white box, plus a label | Emblem `public/brand/lambang-warna-alas-putih.svg` with no rounded square, label "Tiray" to its left. Label is **black (ink) on white backgrounds, white on blue** |
| 5 | QRIS beats: full app screenshot, not crops | S4c shows the **full 07 screen** inside the blue phone, with a soft ring around the QRIS button. S4d shows the **full 08 screen** (numpad) |
| 6 | Bento: include full screenshots as well as feature crops | Bento now holds 2 full screens (07 Tagihan, 09 Aduan) in mini blue phones next to the crops and text tiles |

## 0b. Revision 2 (user feedback on the revision 1 style frames)

| # | Request | Change |
|---|---|---|
| 1 | Pemda label like `tegalkab.go.id/assets/images/logo_header.png`, text color follows the background | Label rebuilt as text in that layout: spaced **PEMERINTAH** over heavy **KABUPATEN TEGAL**, both the same width. Ink on white, white on blue |
| 2 | Merge frames 4 and 6, with both screenshots | One QRIS frame: full 07 (ring on the QRIS button) and full 08 (numpad) side by side in two blue phones |
| 3 | Frame 0 still used the boxed icon | The hook sentence now uses `lambang-warna-alas-putih` with no box |
| 4 | Make frame 3 clearer | The real 07 screen is visible behind the glass (light blur), "Tagihan" sits on a solid glass band with the line "Cek dan bayar dari HP" |
| 5 | Right label to the right of the emblem, using the logotype | Emblem first, then `logotype-hitam.svg` (white scenes) / `logotype-putih.svg` (blue scenes) to its right, ending at x 1020 |
| 6 | Bento sized like the marked Qita block, ready for 16:9 | New **wide bento** component `WideBento`, 1000×520 (≈ 1.9:1), 4 columns. The same block will be reused unchanged in the 16:9 version |

## 1. Why v3 (user feedback on v2)

- **Transitions were too fast.** v2 changed shot every ±1.25 s and morphs took only 8–12 frames. The eye couldn't keep up.
- **The style didn't feel like Qita.** v2 relied on huge ExtraBold text stacked 2–3 lines high, dark ink, a dark phone bezel, and punchy SFX. Qita is the opposite: **calm, airy, glassy, and soft blue**.

## 2. Style differences: v2 vs v3 (based on the Qita frames, 0–54 s)

| Aspect | v2 | v3 "Glass Blue" (following Qita) |
|---|---|---|
| Text | Poppins ExtraBold 160–220 px, 2–3 line stacks | **Plus Jakarta Sans SemiBold 64–96 px, one line**, plenty of white space (brand-approved alternative font) |
| Big words | Often, with motion blur | Only 3 times ("Tagihan", "Semua layanan air", "Yuh"), always inside a **frosted-glass squircle** |
| Phone | Dark bezel #0f1a2c | **Blue phone (blue-800)** with a thin frame and a soft shadow, like the blue phone in Qita |
| Blue background | Flat #244da9 | blue-800 with a **soft sky radial glow** in the center (water gradient) |
| Layout | Content fills the frame | Content sits in the **middle band (y 460–1520)**; the top and bottom stay calm |
| Pace | Shot ±1.25 s, morph 8–12 f | **Each state held ≥ 1.5 s, morph 18–24 f**, ease in-out (no snap) |
| Corners | Tirta Ayu logo top left | **Pemkab Tegal logo + label top left**, **Tirta Ayu emblem + "Tiray" label top right** (like Danantara + Qita) |
| Recap | Fast bento | Bento of **blue tiles + full screens + crops**, slow pan, final hold 1.5 s |
| Audio | Music + 70 SFX cues | **Music only** |

## 3. Audio

- **Background music only.** No SFX anywhere, so the visual rhythm comes from the music.
- Music: **Q2, an original track in the Qita feel** (electronic pop in E, heavy 808 sub, syncopated kick, claps on 2 & 4, risers and short stops before drops). The tempo rises smoothly from 98 to about 131 BPM (curve ^1.6), so the edit gets faster toward the CTA. Generator: `research/music-qstyle-accel.py`; output `public/audio/music-v3.wav` at -14 LUFS. It does not copy the Qita music: only its character, measured from `reference/qita-ref.mp4` (103 BPM, E, spectral centroid about 2.5 kHz). Scene cuts snap to the beat grid of this tempo map.
- Mix: **-14 LUFS**, true peak ≤ -1.5 dB. Volume 0.8, fade in over 10 f, fade out over the last 50 f.

## 4. Scene boundaries

`B3 = [0, 147, 327, 434, 625, 810, 957, 1115, 1252, 1472, 1584, 1710]` (snapped to the beats of music-v3.wav; frame ranges in the tables below shift by at most ±7 f, src/v3/kit3.tsx is the source of truth)

**v5 (revisi):** `B3 = [0, 147, 327, 434, 625, 810, 957, 1115, 1252, 1472, 1620]`, total 1620 f (54 dtk). End card S11 dilepas sementara; badge Google Play pindah ke S10 di bawah #YuhBukaTiray. #Yuh mulai di tengah lalu geser ke kiri, BukaTiray terbuka dengan posisi B tetap.

**v7 (revisi):** S5 "Lapor dari HP" hanya HP di tengah (lebar 300), kiri-kanan muncul 6 jenis aduan bergantian (Air Tidak Mengalir, Kebocoran, Air Keruh, Meter Rusak, Tekanan Lemah, Stop Kran). Judul Lapor keluar di f 104, Pantau statusnya masuk f 124.

**v8 (revisi):** Akhir S10 (TOTAL 1678): hashtag & badge memudar f 150–168, garis bawah biru dan tab hijau berubah jadi titik biru & hijau, titik kuning muncul, berputar mengikuti orbit outro (pusat 539,959, r≈130, 1,7°/frame). Frame 1677 = frame 29 outro `outro_tirta_ayu_9x16_final_v1_cepat.mp4`; outro disambung mulai frame 30 (detik 1). Audio outro utuh tanpa diubah, mulai 1 dtk sebelum potongan (54,93 dtk) dan dicampur di atas musik kita yang memudar.
**v9 (revisi):** S3 zoom SS Home dibatasi (Z3 = 1,95) supaya atas HP tetap di bawah logo Pemda & Tirta Ayu. S9 bento dipendekkan: transisi keluar f 1374–1400 (45,8–46,7 dtk), S10 mulai 1400. Akhir S10 (TOTAL 1592): garis biru menyusut masuk ke tab hijau (lokal 148–168), tab hijau meluncur & membulat jadi titik hijau outro (lokal 164–190 = outro frame 7, Ø38 di 566,832), frame terakhir = outro frame 8 (Ø54 di 570,833). Outro disambung mulai frame 9; audio outro utuh mulai 9 frame sebelum potongan (52,77 dtk).

**v10 (revisi):** Bagian outro tiga titik (outro frame 0–50) dilewati. Akhir S10 (TOTAL 1590): garis biru menyusut masuk ke tab hijau (lokal 148–168), tab hijau meluncur ke tengah & membulat jadi titik hijau gabungan Ø62 di (539,959) (lokal 164–186 = outro frame 47), lalu membesar Ø170 → Ø220 → Ø230 dengan glow (lokal 187–189 = outro frame 48–50). Outro disambung mulai frame 51; audio outro utuh mulai 51 frame sebelum potongan (51,3 dtk). Total 1833 frame (61,1 dtk). Render: `--gl=swangle` (v3 tanpa three.js) + `Img` dari `src/v3/DImg.tsx` (tunggu decode); render dua kali lalu bandingkan per frame, karena screenshot UI kadang tertangkap kosong 1 frame secara acak (v9 juga kena di f 887/889).
**v11 (revisi, pas 60,0 dtk = 1800 frame):** Dipangkas 33 frame di akhir. S9 bento 1252–1385 (dorong 92–133, fade 108–133, transisi selesai 46,2 dtk). S10 1385–1557: #Yuh muncul lokal 10–28 (tepat bar musik 1400), geser 30–50, BukaTiray 54–76, garis 74–88, tab 86–96, badge 92–110, tahan sampai 130, keluar/hand-off 130–171 (relatif sama dengan v10). Pojok logo fade B3[9]+132..150. Outro disambung dari frame 51, audio outro mulai 50,2 dtk. SRT: entri 9 s/d 45,9, entri 10 46,4–48,4, entri 11 48,5–50,8.

**v6 (revisi):** timing sama dengan v5. Badge Google Play naik (jarak garis bawah → badge = jarak teks → garis bawah, 21 px). S2 hanya 3 HP. S3→S4: ikon Info Tagihan tidak lagi membesar jadi kartu; kartu Tagihan naik dari bawah di tengah. S5: HP di tengah, callout Titik Lokasi (kiri) dan Ambil Bukti (kanan) dengan garis penunjuk ke tombolnya. Gambar di-decode sebelum render (anti kedip), dialog sukses S7 muncul lebih halus.

Hard cuts: f 810, 1245, 1590 (3 cuts, like Qita). Everything else morphs or continues.

### Corner logos (all scenes except S11)
- Left: Pemkab Tegal coat of arms, height 84 px at (60, 148). Label to its right in the tegalkab.go.id header layout: "P E M E R I N T A H" (21 px, letters spread to the full width) over "KABUPATEN TEGAL" (31.5 px, ExtraBold), both 262 px wide.
- Right: Tirta Ayu emblem `lambang-warna-alas-putih` (76 px, no box), then the official logotype (58 px high) to its right, ending at x 1020.
- Labels: ink #16243b on white scenes, white on blue scenes (cross-fade 12 f when the background changes). The logos themselves are never recolored.
- Hidden on the end card (S11), where the full vertical logo takes over.

## 5. Beat table

### S1 · Hook · 0–5 s (f 0–150) · white
| Beat | Frame | Visual | Text | Motion |
|---|---|---|---|---|
| 1a | 0–30 | A blue squircle outline draws itself in the center (180 px) | – | Stroke draw 30 f |
| 1b | 30–60 | The squircle fills white, the Tirta Ayu emblem grows inside → Tiray app icon | – | Scale 0.8→1 ease |
| 1c | 60–95 | The icon slides left, "Tiray" (96 px, blue) is revealed letter by letter beside it | Tiray | Mask 24 f |
| 1d | 95–150 | The lockup shrinks into the sentence "Yuh kenalan sama [icon] Tiray" (one line, 64 px), **hold 1.3 s** | Yuh kenalan sama Tiray | Words part to make room for the icon |

### S2 · Official app · 5–11 s (f 150–330) · white
| Beat | Frame | Visual | Text | Motion |
|---|---|---|---|---|
| 2a | 150–180 | The other words fade, and the icon grows into a **blue phone outline** (500 px) | – | Morph 24 f |
| 2b | 180–260 | The blue phone fills, the Beranda screen (06) builds layer by layer: header → banner → LAYANAN grid (stagger 5 f) → BERITA. Tilt rotateY -10° → 0° | "Aplikasi resmi **Tirta Ayu**" (y 400) | Layered rise |
| 2c | 260–330 | Camera pulls back: 5 screens in a wide coverflow (09, 03, 06, 07, 02), gliding left slowly | "Semua layanan air, di HP kamu" | Coverflow 60 f |

### S3 · Service wall · 11–14.5 s (f 330–435) · white → blue
| Beat | Frame | Visual | Text | Motion |
|---|---|---|---|---|
| 3a | 330–370 | The middle screen zooms in on the LAYANAN grid; the icons separate into white tiles | – | Zoom 30 f |
| 3b | 370–435 | The 6 real LAYANAN icons (from 06) become **6 large white glass tiles (3×2)** with their labels, the background changes to blue + radial glow | Layanan lengkap | Stagger diagonal |

### S4 · Tagihan & QRIS · 14.5–21 s (f 435–630) · blue → white
| Beat | Frame | Visual | Text | Motion |
|---|---|---|---|---|
| 4a | 435–480 | The wall blurs into a frosted squircle with the real 07 screen visible behind the glass; **"Tagihan"** (128 px, white) on a solid glass band, with "Cek dan bayar dari HP" below | Tagihan | Blur in 20 f, hold |
| 4b | 480–540 | The squircle shrinks into a white card: a large crop of the 07 table (3 months), rows slide in one by one | "Cek tagihan 3 bulan terakhir" (y 420) | Morph 24 f |
| 4c | 540–585 | The card grows into the left blue phone showing the **full 07 screen** (Riwayat Tagihan). A soft sky ring pulses once around the "BAYAR DENGAN QRIS" button | "Bayar pakai QRIS tanpa ribet" (y 400) | Morph 20 f, ring 18 f |
| 4d | 585–630 | A second blue phone with the **full 08 screen** (QRIS numpad) slides in on the right, both phones stay together. 0100000013 is typed into its field (one digit every 4 f) | (same line) | Slide 18 f |

### S5 · Aduan · 21–27 s (f 630–810) · white
| Beat | Frame | Visual | Text | Motion |
|---|---|---|---|---|
| 5a | 630–670 | The numpad phone slides up and out; "Ada keluhan?" appears in its place (one line, 80 px) | Ada keluhan? | Slide 24 f |
| 5b | 670–740 | The text moves up and becomes "**Lapor** dari HP" (contrasting sizes: Lapor 110 px, dari HP 64 px). Blue phone 09, Lokasi & Foto crops float out to the left with connector lines | Lapor dari HP | Float 20 f |
| 5c | 740–810 | The phone becomes a card stack (crops of 01) and a **Tuntas** badge appears on the top card | "Pantau **statusnya**" | Stack 24 f |

### S6 · Info Gangguan · 27–32 s (f 810–960) · blue (hard cut)
| Beat | Frame | Visual | Text | Motion |
|---|---|---|---|---|
| 6a | 810–860 | "Air mati?" (white, 96 px), hold | Air mati? | Mask rise |
| 6b | 860–960 | 5 disruption cards (02) **fan out from the middle** like Qita's "Bayar ini itu", the newest stays on top | "Info gangguan langsung masuk" | Fan stack 30 f |

### S7 · Pasang Baru · 32–37 s (f 960–1110) · white
| Beat | Frame | Visual | Text | Motion |
|---|---|---|---|---|
| 7a | 960–1000 | A white sheet rises over the blue; "Mau pasang baru?" | Mau pasang baru? | Sheet up 24 f |
| 7b | 1000–1070 | The stepper card (03): Identitas → Alamat → Dokumen → Konfirmasi, checked one at a time every 12 f | "Daftar dari HP" | Check |
| 7c | 1070–1110 | The success dialog (04) appears in the middle, hold | – | Spring soft |

### S8 · Word swap · 37–41.5 s (f 1110–1245) · blue
| Beat | Frame | Visual | Text | Motion |
|---|---|---|---|---|
| 8a | 1110–1150 | The dialog shrinks and the background turns blue; "Ga cuma itu" | Ga cuma itu | Morph 20 f |
| 8b | 1150–1200 | "masih banyak yang bisa [icon] Tiray bantu" (one line, glides from right to left) | … | Glide |
| 8c | 1200–1245 | "Info pelanggan & pemakaian" + crops of 05 and 07 inside a frosted squircle | … | Blur in |

### S9 · Bento recap · 41.5–49 s (f 1245–1470) · white (hard cut)
| Beat | Frame | Visual | Text | Motion |
|---|---|---|---|---|
| 9a | 1245–1290 | Center wide tile "Semua layanan air" (white text), hold. Title "Semua di Tiray" above (y 640) | Semua di Tiray | Scale in |
| 9b | 1290–1420 | The **wide bento** (1000×520 at y 760, 4 columns like Qita's "Financial Value" block) fills in around it: Tagihan (full 07), Bayar QRIS (full 08), Pasang baru (full 03), Lapor aduan (full 09) as mini blue phones peeking from the tile bottom; Info pemakaian air (07 table crop), Info pelanggan (05 crop), Info gangguan (02 crop), Pantau status aduan (Tuntas badge) | – | Tiles rise in a column stagger |
| 9c | 1420–1470 | Slow push in 1.0 → 1.04, **hold 1.5 s** | – | Push 30 f |

### S10 · Hashtag · 49–53 s (f 1470–1590) · white → sky
| Beat | Frame | Visual | Text | Motion |
|---|---|---|---|---|
| 10a | 1470–1500 | The bento blurs into a frosted squircle; "Yuh" big inside it | Yuh | Blur in |
| 10b | 1500–1565 | Becomes **#YuhBukaTiray** in one line (110 px), blue, with an underline drawn | #YuhBukaTiray | Grow |
| 10c | 1565–1590 | Sky (#9bd5ef) wipe from bottom to top | – | Wipe 25 f |

### S11 · End card · 53–57 s (f 1590–1710) · white (hard cut)
| Beat | Frame | Visual | Text | Motion |
|---|---|---|---|---|
| 11a | 1590–1620 | Full-color vertical Tirta Ayu logo, scale 0.94→1, no distortion | – | Fade + scale |
| 11b | 1620–1650 | "Tiray" + "Ayo Jakwir, monggo didownload!" | CTA | Mask rise |
| 11c | 1650–1670 | Google Play badge + #YuhBukaTiray | – | Fade up |
| 11d | 1670–1710 | Hold for reading, music fades out | – | Still |

## 6. Compliance (unchanged)

- Only official features (5 items). The data on screen is dummy (CONTOH, 01000000xx, RO00000001). Never `ui/_original/`.
- The service wall uses icons cropped from the real 06 screenshot. No invented 3D icons.
- Logos are not rotated, stretched, or recolored. The Pemkab Tegal coat of arms is used as-is (PNG with transparency); only the text labels change color.
- Complaints: show status tracking only, no promise of speed.
- Safe zone: titles, CTA, and badge stay inside x 60–940, y 300–1520. The corner logos, coverflow, and bento may run past the edges.
