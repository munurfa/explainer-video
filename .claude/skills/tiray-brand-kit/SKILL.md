---
name: tiray-brand-kit
description: Use for any design, motion, copy, or video work for Tiray (the mobile app of Perumda Air Minum Tirta Ayu, Kabupaten Tegal) or for Tirta Ayu itself — official logo files, color tokens, fonts, logo usage rules, tone of voice, official feature list, and the existing outro assets.
---

# Tiray / Tirta Ayu Brand Kit

The official brand kit is copied into this skill at `brand-kit/` (source: `D:\WORKSPACE\DESIGN\LOGO\brand-kit`, built from Perbup Tegal No. 45/2020).
**Always take logos, colors, and fonts from `brand-kit/`. Do not sample them from videos or redraw them.**
If the source folder is updated, copy it again:
```bash
rm -rf ".claude/skills/tiray-brand-kit/brand-kit" && cp -r "D:/WORKSPACE/DESIGN/LOGO/brand-kit" ".claude/skills/tiray-brand-kit/brand-kit"
```

## Files in the kit
| Need | File |
|---|---|
| Full guideline (meaning, variants, clear space, don'ts, examples) | `brand-kit/panduan-brand.html`, `brand-kit/README.md` |
| Vector logo for motion (import into AE / code) | `brand-kit/01-logo/svg/` → `lambang-*.svg`, `logotype-{emas,hijau,hitam,putih}.svg`, `logo-{vertikal,horizontal}-{warna,hitam,putih}.svg`, `lambang-warna-alas-putih.svg` |
| Transparent PNG | `brand-kit/01-logo/png/` (emblem 512/1024/2048 px, logo 1200/2400 px) |
| Print | `brand-kit/01-logo/pdf/` |
| Color tokens | `brand-kit/02-warna/warna.css`, `warna.json`, `tirta-ayu.gpl` |
| Typography | `brand-kit/03-tipografi/TIPOGRAFI.md` |
| App/social icon | `brand-kit/04-ikon-web/` (`ikon-*px.png`, `avatar-sosial-1080px.png`, `avatar-sosial.svg`) |
| Source documents | `brand-kit/05-dokumen-sumber/` (Perbup 45/2020, Cheatsheet-Arti-Logo.pdf, Draf-Design-System.pdf) |

## Colors (from `warna.json`)
| Token | Hex | Status | Use |
|---|---|---|---|
| `green-500` | `#30b349` | Official | Emblem arrows. Graphics only (contrast 2.74) |
| `green-700` | `#1d7a32` | Recommended | Buttons, green text |
| `blue-300` | `#9bd5ef` | Official | Light end of the water drop |
| `blue-800` | `#244da9` | Official | Dark end of the drop, blue text, links |
| `leaf-300` | `#98c026` | Official | Light end of the leaf |
| `leaf-700` | `#387519` | Official | Dark end of the leaf |
| `gold-300` | `#ffc20e` | Recommended | Name, accents. Use `ink` for text on top |
| `gold-600` | `#c99700` | Recommended | Dark end of the gold |
| `ink` | `#16243b` | Recommended | Main text |
| `ink-muted` | `#44536b` | Recommended | Secondary text |
| `line` | `#dde3ec` | Recommended | Lines, borders |
| `white` | `#ffffff` | Official | Logo base color |

Gradients: water `#9bd5ef → #244da9` (180°), leaf `#98c026 → #387519`, gold `#ffc20e → #c99700`.
For motion: blue backgrounds/wipes use `blue-800` or the water gradient, white backgrounds stay `#ffffff`, and green is an accent only (never small text).

## Typography (status: recommended)
- Main: **Poppins** (the logotype uses Poppins SemiBold 600). H1 800, H2 700, body 400, labels 700 in CAPITALS with 0.08em letter spacing.
- Alternative: **Plus Jakarta Sans** for long text or small screens.
- **Never retype the company name.** Use `logotype-*.svg` (already converted to curves).

## Logo rules (summary from README)
1. The full-color logo on a **white base** comes first (Pasal 6 ayat 4).
2. Do not flip, rotate, stretch, recolor, or add effects (shadow, glow, outline) to the logo. Motion may move, scale, fade, or mask it as a whole, but must not distort it.
3. Clear space = the drop's width (±27% of the emblem width) on all four sides.
4. Minimum size: emblem 48 px / 15 mm, full logo 160 px / 40 mm.
5. Dark backgrounds → `-putih` variants or `lambang-warna-alas-putih`. Black-and-white → `-hitam`.
6. "Recommended" items (gold, green-700, typography, horizontal layout) still need board approval. Mention this to the client when they are a key element.

## Product facts (Google Play, app.tirtaayu.tirayapp, checked 4 Nov 2026)
- Name: **Tiray**. Developer: **Perumda Air Minum Tirta Ayu** (Kabupaten Tegal). Android. Rating 4.7 (76 reviews), 5k+ downloads, updated 29 Oct 2026. States that it shares no data with third parties.
- **Official features (do not add others):**
  1. Billing history and water usage for the last 3 months, plus payment via **QRIS**
  2. Service complaints, with tracking of each step to resolution
  3. Customer info, water meter info, water usage info
  4. Information on new connection installation
  5. Notifications about supply disruptions and water usage
- Re-check the rating and download count before final delivery.
- **App icon = the Tirta Ayu emblem.** There is no separate Tiray icon. Use `brand-kit/01-logo/svg/lambang-warna.svg` (or `04-ikon-web/ikon-512px.png`) on a white rounded square.

## Real app UI (screenshots in `D:\WORKSPACE\DESIGN\MOTION\OD\01_assets\ui\`)
Use these instead of inventing screens. The header reads "Tiray Mobile Apps" in navy with the logo at top right. Bottom nav: Home · Kontak · Pengaduan · Profile.
| File | Screen |
|---|---|
| `05_beranda-layanan.png` | Home: news banner, LAYANAN grid (incl. Pendaftaran Pelanggan Baru, Informasi Tagihan, Tips Hemat Air, Simulasi Tagihan), BERITA |
| `06_riwayat-pemakaian-tagihan.png` | Total Tagihan (+denda), "BAYAR DENGAN QRIS" button, monthly usage history |
| `07a_bayar-qris-input-nomor.png` | QRIS payment: enter customer number on a numpad |
| `08a_aduan-form.png` | Complaint form: category, Detail Keluhan, Titik Lokasi, photo/video proof, LAPOR ADUAN |
| `08b_aduan-daftar-status.png` | Complaint list. Status shows as a **"Tuntas"** badge (not a Diterima/Diproses/Selesai stepper) |
| `09_info-gangguan.png` | Dated supply-disruption notices (SPAM Bregas / SPAM Sute) |
| `10b_sambungan-baru-prosedur.png` | New connection: stepper Identitas → Alamat → Dokumen → Konfirmasi |
| `10c_sambungan-baru-sukses.png` | "Pengajuan berhasil dikirim" with registration number |
| `00_profil-nomor-sambungan.png` | Profile (backup only) |

Customer data in these files is already replaced with dummy text (names "… CONTOH", connection numbers 01000000xx, addresses "Jl. Contoh…", registration RO00000001). The untouched originals with **real customer data** are in `ui/_original/`: never use those in a video. Any new screenshot needs the same treatment: overwrite the data with matching dummy text, change nothing else.

## Tone of voice
- Friendly and local. Greeting **"Hai Jakwir Air!"**, closing **"Ayo Jakwir, monggo didownload!"**
- Casual Indonesian with a light Tegal touch. Keep it plain, not bureaucratic.
- Campaign hashtag: **#YuhBukaTiray** ("Yuh" is Tegal for "ayo"). Always written in exactly this CamelCase. Show it as its own beat before the end card, on every end card, and as the first hashtag in captions.

## Existing video assets (`D:\WORKSPACE\DESIGN\MOTION\OD`)
**Not used for now (user decision, 4 Nov 2026):** close videos with an end card built from `logo-vertikal-warna.svg` (9:16) or `logo-horizontal-warna.svg` (16:9) instead. Use these outro files only when the user asks for them.

`outro_tirta_ayu_{9x16|16x9}_final_v1_{cepat|slow}[_hitam].mp4`, 30 fps. "cepat" (fast) ≈9.8 s for social, "slow" ≈12.3 s for screens and events. The "_hitam" files have a black background.
Sequence: dots → arrow → drop splash + ripple → recycle arrows spin → gold logotype → collapses into a blue dot → blue screen.

## Don'ts
- No real customer names, account numbers, or addresses in UI shots. Blur them or use dummy data.
- Don't promise fast complaint handling. Show transparency (status tracking) instead.
