# Explainer — Motion Graphics dengan Remotion

Workspace untuk membuat video explainer & motion graphics berbasis [Remotion](https://www.remotion.dev/) (React + TypeScript). Berisi katalog sampel gaya visual dan project video explainer untuk Perumda Air Minum Tirta Ayu (Kabupaten Tegal) / aplikasi Tiray.

## Struktur

```
explainer/
├── .claude/skills/          # Skill agent: motion-craft, remotion-*, tiray-brand-kit
├── project/
│   ├── style-samples/       # Katalog sampel gaya visual (16:9 & 9:16)
│   └── video-pemulihan-air/ # Video explainer "Kenapa air belum ngalir setelah pipa diperbaiki?"
└── sample/                  # Hasil render sampel gaya, satu folder per gaya (NN-slug/)
```

## Project

### `project/style-samples`

Satu komposisi per gaya desain (cyberpunk, doodle, zine, isometric, clay 3D, ukiyo-e, nusantara, terminal CLI, dll.), masing-masing dalam dua rasio: **1920×1080 (16:9)** dan **1080×1920 (9:16)**, 30 fps. Daftar gaya ada di `src/theme/styles-catalog.ts`; ID komposisi berformat `S<NN>-<slug>-169` / `S<NN>-<slug>-916`.

```bash
cd project/style-samples
npm install
npm run studio        # preview di Remotion Studio
npm run render-all    # render semua gaya ke out/
```

Opsi `render-all.mjs`:

| Perintah | Fungsi |
|---|---|
| `node render-all.mjs --only 1,2` | Render subset gaya berdasarkan ID |
| `node render-all.mjs --ratios 916` | Render rasio tertentu saja (`169`, `916`) |
| `node render-all.mjs --stills <dir> --ids 1,26 --frames 40,150,260` | Ekspor still frame untuk cek visual |
| `node render-all.mjs --concurrency 4` | Atur jumlah render paralel (default 6) |

### `project/video-pemulihan-air`

Video vertikal **1080×1920, 30 fps, ±63 detik** dengan gaya #44 "Kita Bedah": satu dunia SVG/3D (reservoir → pipa transmisi → distribusi → rumah) dengan kamera bergerak tanpa cut keras, narasi Edge TTS (`id-ID-ArdiNeural`) dengan timing kata asli, SFX terikat animasi, dan penutup ajakan unduh aplikasi Tiray.

- `banner.jpg` / `banner.md` — infografis sumber dari Tirta Ayu
- `research/storyboard.md` — storyboard per frame (babak, narasi, kamera, visual, SFX)
- `research/narasi.txt` — naskah voice-over
- `public/` — audio, aset brand, dan UI
- `out/` — hasil render (`v1`, `v2`, versi `-final`, `words.json`)

```bash
cd project/video-pemulihan-air
npm install
npm run studio   # preview
npm run render   # render komposisi MainVideo ke out/v1.mp4
```

## Cara Membuat Video Baru

Setiap video baru dibuat sebagai folder sendiri di `project/video-<topik>/`, misalnya `project/video-cara-bayar-tagihan/`. Agent (Claude Code, dll.) sudah diarahkan lewat `CLAUDE.md` / `AGENTS.md` untuk mengikuti aturan ini.

### Urutan Kerja

| # | Tahap | Hasil | Persetujuan |
|---|---|---|---|
| 1 | Brief & klarifikasi: topik, audiens, durasi, platform, gaya, CTA, nama folder | Asumsi tertulis | ✔ |
| 2 | Scaffold project di `project/video-<topik>/` + `npm install` | `package.json`, `src/`, `public/`, `research/` | |
| 3 | Pilih gaya & susun storyboard | `research/storyboard.md` + contact sheet | ✔ |
| 4 | Tulis naskah voice-over (±2,5 kata/detik, hook ≤ 3 detik, CTA di akhir) | `research/vo-script.md` | ✔ |
| 5 | Pilih suara narator dari 3 sampel, lalu buat VO penuh + timing kata + backsound | `public/audio/narration.mp3`, `public/words.json` | ✔ |
| 6 | Animasi, cek still & safe zone, render | `out/v1.mp4` | ✔ |
| 7 | Deliverables: subtitle, caption, hashtag, judul, jam posting | `out/v1.srt`, `research/deliverables.md` | |

Cara memulai: buka Claude Code di root repo, ketik `/motion-craft`, lalu tempel brief. Agent akan berhenti di setiap tahap bertanda ✔ dan menunggu persetujuan Anda. Revisi disimpan sebagai `v2.mp4`, `v3.mp4`, dan seterusnya.

### Contoh Prompt

**1. Explainer layanan dari banner/infografis**

```text
/motion-craft
Buat video explainer 9:16 durasi 45 detik untuk Tirta Ayu dari banner di D:\Downloads\banner-tagihan.jpg.
Topik: cara bayar tagihan air lewat aplikasi Tiray. Audiens warga Kabupaten Tegal, bahasa santai dengan sapaan "Jakwir".
Gaya #44 Kita Bedah, CTA download Tiray. Simpan di project/video-cara-bayar-tagihan.
```

**2. Demo fitur aplikasi (replika UI)**

```text
/motion-craft
Buat video demo fitur "Info Gangguan" di aplikasi Tiray, 30 detik, untuk Instagram Reels dan TikTok.
Tampilkan replika layar HP yang autentik: buka aplikasi, tap menu Info Gangguan, scroll daftar wilayah, lalu tap detail.
SFX klik dan scroll harus sinkron dengan kursor. Pakai brand kit Tiray. Folder: project/video-demo-info-gangguan.
```

**3. Edukasi/kampanye dengan pilihan gaya**

```text
/motion-craft
Saya mau video edukasi 60 detik: "5 tips hemat air di rumah" untuk YouTube Shorts.
Belum tahu gaya visualnya, tolong usulkan 3 gaya dari style-samples yang cocok beserta alasannya.
Narasi suara pria, nada hangat, ada angka/infografis (tandai ILUSTRASI kalau bukan data resmi). Akhiri dengan ajakan follow Tirta Ayu.
```

## Skill Agent

Folder `.claude/skills/` berisi skill agent. OpenCode dan Claude Code sama-sama memuatnya otomatis (di OpenCode lewat tool `skill` atau `@motion-craft`). Aturan agent ada di `AGENTS.md`, yang dibaca langsung oleh OpenCode; `CLAUDE.md` hanya meng-import `AGENTS.md` untuk Claude Code.

- **motion-craft** — alur kerja motion graphics bertahap: storyboard, naskah VO, sampel suara, render 9:16, SRT & caption, plus pustaka SFX/lagu dan panduan gaya.
- **remotion-\*** — referensi & praktik terbaik Remotion (captions, render, studio, maps, dll.).
- **tiray-brand-kit** — logo resmi, token warna, font, aturan logo, dan tone of voice Tiray / Tirta Ayu.

## Kebutuhan

- Node.js 18+
- Remotion 4.0.220, React 18.3, Three.js (via `@remotion/three` / `@react-three/fiber`)
- Render 3D memakai Chromium dengan `gl: 'angle'`

## Catatan

- Hasil render (`project/*/out/`, `sample/`), `node_modules/`, dan audio hasil generate tidak di-commit (lihat `.gitignore`). Render ulang untuk mendapatkannya kembali.
- Angka persen pada counter di video pemulihan air bersifat ilustrasi dan selalu diberi badge **ILUSTRASI**.

## REF
- [Google Ai Studio](https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts)
-
