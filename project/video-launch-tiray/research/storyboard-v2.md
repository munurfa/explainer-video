# STORYBOARD v2 — Launch Tiray (9:16)

Revision of v1 based on `research/reference-analysis.md`. v1 stays as it is (`storyboard.md`, `out/v1.mp4`). Once v2 is approved, this file becomes the reference for the code.

## 1. What changes from v1

| Aspect | v1 | v2 |
|---|---|---|
| Pace | 9 scenes, one shot each (±5 s) | 9 chapters, **36 beats** (±1.25 s per beat) |
| Transitions | Generic whips, with empty frames | **Morph from element to element**. Only 4 hard cuts (like the reference) |
| Screen scale | Whole phone, always ±470 px | Mixed: big tilted 3D phone, coverflow running past the frame, **giant crops** of a UI detail (900–1000 px wide) |
| Text | Enters, then stays still | Giant words with **motion blur + frosted-glass band**, words of very different sizes in one line, **pictures inside the sentence** |
| Recap | 4-card bento, static | **3-group bento canvas, camera pans** across them |
| Branding | Logo only at the end | **Small logo stays in the top corner** for the whole video (color on white, white on blue) |
| Features | 4 features | 5 official features (adds **info pelanggan & pemakaian** from screenshots 05 and 07) |
| Audio | -21.7 LUFS | Mixed to **-14 LUFS**, SFX more frequent, following the beats |

Fixed: 45 s = 1350 frames, 1080×1920, 30 fps, music only (VO later), CTA "Ayo Jakwir, monggo didownload!" + Google Play badge + #YuhBukaTiray.

## 2. Beat table

Notation: `[x]` = picture/logo placed **inside** the sentence (the words part to make room). "Crop NN" = a cut-out of the screenshot `public/ui/NN-*.png`, enlarged.

### S1 · Hook · 0–4 s (f 0–120) · white
| Beat | Frame | Visual | Text on screen | Motion | SFX |
|---|---|---|---|---|---|
| 1a | 0–18 | Rounded-square outline in blue, drawn as a line (stroke draw) | – | Stroke 0→100% | tick-soft |
| 1b | 18–38 | The square fills white + soft shadow, the Tirta Ayu emblem grows out of the middle → app icon | – | Spring scale 0.6→1 | pop-in |
| 1c | 38–56 | The icon slides left, **"Tiray"** appears to its right letter by letter (icon + name lockup, like Q→Qita) | Tiray | Mask reveal left→right | whoosh-soft |
| 1d | 56–96 | The lockup shrinks to sit **inside the sentence**: "Yuh kenalan sama `[icon]` Tiray" | Yuh kenalan sama [ikon] Tiray | Words rise one by one around the icon (stagger 5) | tick ×3 |
| 1e | 96–120 | The words drop away, **the icon's square stretches into the phone outline** | – | Morph width/height/radius | transition-maximize |

### S2 · Official app · 4–9 s (f 120–270) · white → light blue
| Beat | Frame | Visual | Text on screen | Motion | SFX |
|---|---|---|---|---|---|
| 2a | 120–140 | Large phone outline (640 px), tilted 3D -18°, screen fills blue | – | rotateY -18° | – |
| 2b | 140–190 | **Home screen built in layers** from crop 06: header "Tiray Mobile Apps" → news banner slides → 6 LAYANAN icons pop one by one → 2 BERITA cards rise | "Aplikasi **resmi**" (above) | Stagger 4 f per element | pop-pluck ×6 |
| 2c | 190–215 | The phone turns to face the front, slight push-in | "Aplikasi resmi **Tirta Ayu**" | rotateY → 0, scale 1→1.08 | – |
| 2d | 215–270 | **Wide coverflow**: camera pulls back, 5 screens (07 · 09 · **06** · 02 · 03) side by side, the outer ones past the frame edge | "Semua urusan air di HP kamu" | Spring spread, rotateY ±30° on the sides | swoosh ×2 |

Out: the side screens fly out, the middle screen (06) zooms in until white fills the frame → S3.

### S3 · Tagihan · 9–15 s (f 270–450) · white
| Beat | Frame | Visual | Text on screen | Motion | SFX |
|---|---|---|---|---|---|
| 3a | 270–300 | Giant word **"Tagihan"** slides in with horizontal motion blur, over a **frosted-glass band** (blurred crop of the water card from 07) | Tagihan | Blur 30→0, x 600→0 | transition-swoosh |
| 3b | 300–320 | The word stretches to "**Cek** Tagihan", then shrinks to the title at y 400 | Cek Tagihan | Scale 1→0.45 | – |
| 3c | 320–360 | **Giant crop 07**: customer card + "Total Tagihan Rp 120.000" fills the frame width (960 px), then the camera pans down to the 3 rows Jul · Jun · Mei, which slide in one by one | "3 bulan terakhir" | Pan Y, stagger 6 f | tick ×3 |
| 3d | 360–400 | "Bayar `[tombol BAYAR DENGAN QRIS]` langsung", the words part, the QRIS button crop sits between them, finger tap | Bayar [QRIS] langsung | Split words ±, button pop | click |
| 3e | 400–450 | The QRIS button **expands into a phone with the numpad screen** (08); keys light up in turn, display fills with 0100000013 (dummy) | – | Morph button → phone, key flash 3 f | click-soft ×5, confirm-chime |

### S4 · Aduan · 15–21 s (f 450–630) · white
| Beat | Frame | Visual | Text on screen | Motion | SFX |
|---|---|---|---|---|---|
| 4a | 450–475 | Giant words "Ada keluhan?" with motion blur, on the glass band | Ada keluhan? | Blur slide from right | transition-swipe |
| 4b | 475–495 | Shrinks to the title "Lapor **Aduan**" | Lapor Aduan | Scale | – |
| 4c | 495–545 | Phone with the complaint form (09) tilted on the right; crops of **"Titik Lokasi"** and **"Ambil Bukti Foto"** pop out of the screen to the left, large, each with a short label | "lokasi" · "foto" | Pop out with a connector line from their original spot | pop-in ×2 |
| 4d | 545–585 | "Pantau `[badge Tuntas]` statusnya", the Tuntas badge is large between the words | Pantau [Tuntas] statusnya | Split words, badge pop | confirm-glass |
| 4e | 585–630 | **Card stack**: 4 complaint cards from 01 stack up from below, each with a Tuntas badge | – | Stagger 6 f, spring | pop-drop ×4 |

Compliance: show status tracking only, no promise of speed.

### S5 · Info Gangguan · 21–26 s (f 630–780) · blue
| Beat | Frame | Visual | Text on screen | Motion | SFX |
|---|---|---|---|---|---|
| 5a | 630–655 | "Air" giant, then "**mati?**" drops with an impact | Air mati? | Drop + squash | impact-soft |
| 5b | 655–700 | The words shrink up; **disruption cards from crop 02 drop down like notifications** (5 cards, dated) | Info **Gangguan** | Slide from top, stagger 7 f | pop-drop ×5 |
| 5c | 700–750 | The cards fan out vertically, then the newest card (11 Feb 2026) is enlarged in the middle | "langsung di HP kamu" | Spring zoom 1→1.4 | data-reveal |
| 5d | 750–780 | The cards gather into a single white rounded square → next | – | Collapse morph | transition-whoosh-soft |

### S6 · Pasang Baru · 26–31 s (f 780–930) · white
| Beat | Frame | Visual | Text on screen | Motion | SFX |
|---|---|---|---|---|---|
| 6a | 780–805 | "Mau pasang **baru**?" with contrasting sizes ("baru" 2.5× bigger) | Mau pasang baru? | Mask rise | tick ×3 |
| 6b | 805–835 | "Daftar `[□]` dari HP", a small square between the words **grows into a giant crop of the stepper** (03 top) | Daftar [□] dari HP | Box scale 0→1, words pushed apart | transition-maximize |
| 6c | 835–885 | The 4 stepper steps tick one by one; below it, the 4-step "Prosedur Pasang" list (crop 03) appears line by line | – | Stagger 12 f | tick ×4 |
| 6d | 885–930 | The "Pengajuan berhasil dikirim" dialog (crop 04) springs in, the green check pulses once | – | Spring | confirm-glass |

**Hard cut #1** at f 930.

### S7 · Ga cuma itu · 31–37.5 s (f 930–1125) · blue → white
| Beat | Frame | Visual | Text on screen | Motion | SFX |
|---|---|---|---|---|---|
| 7a | 930–955 | Quick word swap | "Ga cuma itu" | Words rise | tick |
| 7b | 955–985 | "masih banyak yang bisa `[ikon]` Tiray bantu" (icon inside the sentence) | … | Swap, icon pop | pop-in |
| 7c | 985–1015 | Info pelanggan: crop 05 (nomor sambungan list) slides in at an angle + crop of the usage column from 07 (30 m³ · 36 m³ · 33 m³) | "Info pelanggan & pemakaian" | Slide, stagger | swoosh |
| 7d | 1015–1035 | Text wider than the frame slides from right to left | "Satu aplikasi, semua urusan air" | Translate X | – |

**Hard cut #2** at f 1035 → white.

| 7e | 1035–1065 | **Bento cluster 1**: blue center card "Tagihan", the riwayat crop, QRIS button and numpad crop fly in from the edges | Tagihan | Fly-in stagger 4 f | pop-pluck ×3 |
|---|---|---|---|---|---|
| 7f | 1065–1095 | Camera **pans right** to cluster 2 "Aduan & Gangguan" (form, Tuntas card, disruption cards) | Aduan · Gangguan | Spline pan, cards fly in | swoosh, pop ×3 |
| 7g | 1095–1125 | Camera pans down to cluster 3 "Pasang Baru" (stepper, success dialog, nomor sambungan) | Pasang Baru | Spline pan | swoosh, pop ×3 |

### S8 · Hashtag · 37.5–40.5 s (f 1125–1215) · white
| Beat | Frame | Visual | Text on screen | Motion | SFX |
|---|---|---|---|---|---|
| 8a | 1125–1145 | The bento zooms out and fades; giant word "**Yuh**" slides in with heavy motion blur | Yuh | Blur slide | impact-punch |
| 8b | 1145–1200 | Settles into **#YuhBukaTiray** in 3 big lines, blue underline + green tab drawn | #YuhBukaTiray | Mask + stroke draw | tick ×2 |
| 8c | 1200–1215 | Light-blue wipe (sky #9bd5ef) from bottom to top | – | Wipe | transition-swipe |

**Hard cut #3** at f 1215.

### S9 · End card · 40.5–45 s (f 1215–1350) · white
| Beat | Frame | Visual | Text on screen | Motion | SFX |
|---|---|---|---|---|---|
| 9a | 1215–1240 | Full-color vertical Tirta Ayu logo, scale 0.92→1 (no distortion) | – | Fade + scale | ding-bell |
| 9b | 1240–1265 | "Tiray" + "Ayo Jakwir, monggo didownload!" | CTA | Mask rise | tick ×2 |
| 9c | 1265–1280 | Google Play badge + #YuhBukaTiray | – | Pop | pop-in |
| 9d | 1280–1350 | Hold for reading (2.3 s), music fades out | – | Still | – |

The end card stays on white (brand rule: full-color logo on a white base comes first). The reference ends on blue; that isn't followed here, on purpose.

Hard cut #4: none (the video ends). Like the reference, there are only 3–4 hard cuts in total.

## 3. Shared elements

- **Corner logo**: small horizontal Tirta Ayu logo (180 px wide) at top left, y 220. Full-color version on white backgrounds, white version on blue (copied from `brand-kit/01-logo/svg/logo-horizontal-putih.svg`). This is branding, not critical information, so it may sit inside the top band like the reference. It is hidden in S9 so it doesn't double up with the large logo.
- **New components** (in `src/kit.tsx`):
  - `BlurWord`: horizontal motion blur from the speed of movement (SVG `feGaussianBlur` X only, deterministic per frame).
  - `GlassBand`: frosted-glass band = enlarged UI crop + blur 40 + white wash.
  - `InlineMedia`: a sentence whose words part to make room for a picture/logo.
  - `MorphBox`: a rounded square that morphs size, radius, and color (icon → phone, button → phone, cards → box).
  - `Coverflow`: 5 phones in a row with rotateY.
  - `BentoCanvas`: a 2160×2400 canvas with a spline camera pan between 3 points.
- **Kept from v1**: `Words`, `Phone`, `Crop`, `Highlight`, `TapRing`, `pop()`, theme, SFX cues.
- **Safe zone**: titles, CTA, and badge stay in y 300–1520, x 60–940. Coverflow and bento may run past the frame edges (decoration).

## 4. Audio

- B26 music stays, mixed so the final video reaches **-14 LUFS** (true peak ≤ -1.5 dB), then checked with `ebur128`.
- SFX follow the beats (about 55 cues). Volumes are lower than v1 so they don't pile up.
- The VO guide (`out/v2-vo-guide.srt`) and `vo-prompt.md` are updated to v2 timing after the render. Scene 7 gains "info pelanggan dan pemakaian".

## 5. Compliance

- Only official features (5 items from the brand kit). Data on screen = dummy (CONTOH, 01000000xx, RO00000001). The 0100000013 number typed into the numpad is the same dummy number as in screenshot 07.
- No invented icons: LAYANAN icons and others are cropped from real screenshots. The reference's 3D icon wall is **not** copied because Tiray has no 3D icons.
- The logo is not rotated or distorted; motion is limited to move, scale, fade, and mask.

## 6. Implemented frames (in sync with `src/v2/`)

The scene boundaries match the table above (`src/v2/timing.ts`: `B2 = [0,120,270,450,630,780,930,1125,1215,1350]`). The key frames inside each scene shifted a little during implementation. The code is the source of truth:

| Scene | Event | Frame | Constant |
|---|---|---|---|
| S2 | 4 coverflow phones open as a fan | 217, 220, 223, 226 | `S2_FAN` |
| S3 | Tap the QRIS button | 385 | `S3_TAP` |
| S3 | Type 0100000013 on the numpad (one digit every 3 f) | 410–437 | `S3_KEYS` |
| S3 | Press CARI + chime | 441 | `S3_CARI` |
| S3 | Slide out left (blur) | 443 | – |
| S4 | Lokasi and Foto crops pop out | 512, 522 | `S4_POPS` |
| S4 | "Tuntas" badge | 553 | `S4_BADGE` |
| S4 | 4 complaint status cards | 590, 596, 602, 608 | `S4_CARDS` |
| S4→S5 | Blue sheet rises | 619–630 | – |
| S5 | "mati?" falls and squashes | 650 | – |
| S5 | 5 disruption cards drop (newest on top) | 662 + 7j | `S5_DROPS` |
| S6 | 4 stepper steps checked | 840, 852, 864, 876 | `S6_STEPS` |
| S6 | "Pengajuan berhasil dikirim" dialog | 888 | `S6_DIALOG` |
| S7 | Bento clusters (Tagihan, Aduan/Gangguan, Pasang Baru/Pelanggan) | 1037, 1068, 1098 | `S7_CARD_FRAMES` |
| S7 | Camera pan between clusters | 1063–1080, 1093–1110 | – |
| S8 | "Yuh" slides in | 1127 | `S8_YUH` |
| S8 | "Tiray" punch | 1158 | `S8_PUNCH` |
| S9 | Google Play badge | 1255 | `S9_BADGE` |

The corner logo is 240 px wide at left 60, top 150 (it switches to the white version on blue backgrounds: 619–778 and 930–1035).
