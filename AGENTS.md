# AGENTS.md

Panduan untuk AI coding agent (Claude Code, Codex, Cursor, dll.) yang bekerja di repo ini.

## Ringkasan

Workspace video explainer / motion graphics berbasis **Remotion 4.0.220 + React 18.3 + TypeScript (strict)**, dengan Three.js lewat `@remotion/three` / `@react-three/fiber`. Klien utama: **Perumda Air Minum Tirta Ayu (Kabupaten Tegal)** dan aplikasinya **Tiray**. Bahasa konten, naskah, dan dokumentasi: **Bahasa Indonesia** (sapaan khas: "Jakwir", "Yuh", "monggo").

```
explainer/
├── .claude/skills/              # motion-craft, remotion-*, tiray-brand-kit
├── project/
│   ├── style-samples/           # katalog gaya visual, 2 rasio per gaya
│   └── video-pemulihan-air/     # video explainer 9:16 untuk Tirta Ayu
└── sample/                      # hasil render sampel gaya (NN-slug/)
```

Tiap folder di `project/` adalah project npm sendiri. Jalankan perintah dari dalam folder project itu, bukan dari root.

## ATURAN WAJIB: Lokasi Project Video Baru

**Setiap project video baru WAJIB dibuat sebagai folder sendiri di dalam `project/`**: `project/<nama-video-kebab-case>/`. Contoh: `project/video-tagihan-online/`.

- **DILARANG** membuat project video di root repo, di `sample/`, di dalam `.claude/`, atau di dalam folder project lain.
- **DILARANG** menambahkan video baru ke `video-pemulihan-air` atau `style-samples` kecuali user secara eksplisit meminta mengedit project itu.
- Nama folder: huruf kecil, kebab-case, diawali `video-` dan menggambarkan topik (mis. `video-cara-bayar-tagihan`).
- Struktur minimal setiap project baru (ikuti pola `video-pemulihan-air`):
  ```
  project/video-<topik>/
  ├── package.json        # Remotion 4.0.220, script "studio" & "render"
  ├── tsconfig.json
  ├── research/           # storyboard.md, vo-script.md, vo-timing.json, deliverables.md
  ├── public/             # audio/, brand/, ui/, words.json
  ├── src/                # index.ts, Root.tsx, MainVideo.tsx
  └── out/                # hasil render (v1.mp4, v1.srt, ...)
  ```
- Bahan sumber dari user (banner, infografis, brief) disalin ke folder project itu, bukan ditinggal di root.
- Kalau user tidak menyebut nama folder, usulkan nama dan konfirmasi di Stage 0 sebelum membuat file.

## ATURAN WAJIB: Penonton Awam

Semua video dirancang untuk **penonton awam tanpa latar belakang teknis** (pelanggan PDAM, warga umum, pengguna aplikasi pemula), kecuali user secara eksplisit menyebut audiens teknis. Panduan lengkap: `.claude/skills/motion-craft/references/AUDIENS-AWAM.md`.

- Mulai dari masalah yang dialami penonton, pakai sudut pandang "kamu", satu pesan utama per video.
- Bahasa sehari-hari: maks 3 istilah teknis per video, masing-masing dijelaskan saat pertama muncul. Tanpa singkatan atau satuan teknis mentah. Angka dibulatkan dan diberi perbandingan.
- Satu analogi sehari-hari untuk setiap konsep abstrak.
- Tunjukkan, jangan hanya sebut: setiap istilah di narasi terlihat di layar pada saat yang sama, dan video tetap dipahami tanpa suara.
- Bagian `## Cek Penonton Awam` di `research/vo-script.md` wajib diisi sebelum naskah disetujui.

## Urutan Membuat Video Baru

Ikuti alur skill motion-craft. Setiap gate **tunggu persetujuan user** sebelum lanjut:

1. **Klarifikasi** (maks 5 pertanyaan: topik, audiens, durasi/platform, gaya, CTA) dan konfirmasi nama folder `project/video-<topik>/`.
2. **Scaffold** project di `project/video-<topik>/`, lalu `npm install`.
3. **Gaya & storyboard** di `research/storyboard.md` + contact sheet still per scene. → gate
4. **Naskah VO** di `research/vo-script.md` (±2,5 kata/detik, hook ≤ 3 dtk, CTA di akhir, bahasa awam + `## Cek Penonton Awam` terisi), harus lolos `vo-lint`. → gate
5. **Suara**: 3 sampel narator → pilih → VO penuh + timing kata asli (`public/words.json`) + backsound. → gate
6. **Animasi & render**: tulis scene di `src/`, cek still di frame kunci + safe zone, lalu render `out/v1.mp4`. → gate
7. **Deliverables**: `out/v1.srt`, `research/deliverables.md` (caption, hashtag, judul, jam posting).

Revisi berikutnya disimpan sebagai `v2.mp4`, `v3.mp4`, dst. Versi lama jangan ditimpa.

## Perintah

```bash
# style-samples
cd project/style-samples
npm install
npm run studio                                   # Remotion Studio
node render-all.mjs --only 1,26 --ratios 916     # render subset
node render-all.mjs --stills <dir> --ids 1 --frames 40,150,260   # cek still

# video-pemulihan-air
cd project/video-pemulihan-air
npm install
npm run studio
npm run render                                   # MainVideo -> out/v1.mp4
npx tsc                                          # type-check (noEmit)
```

Tidak ada test suite. Verifikasi dilakukan dengan `npx tsc`, render still di frame kunci, lalu cek visual.

## Arsitektur

### `project/style-samples`
- `src/theme/styles-catalog.ts`: sumber kebenaran untuk semua gaya (ID, slug, palet, font, preset motion, kode backsound/SFX). `render-all.mjs` mem-parse file ini dengan regex `[id,"slug"`, jadi format barisnya jangan diubah.
- `src/Root.tsx`: membuat dua komposisi per gaya: `S<NN>-<slug>-169` (1920×1080) dan `S<NN>-<slug>-916` (1080×1920), 30 fps, `DURATION = 300` frame.
- `src/StyleSample.tsx`: template 3 scene (transisi di frame 102 & 210). Entrance & SFX transisi dipilih dari preset gaya.
- `src/motifs.tsx`: motif visual per gaya. `src/Bedah44.tsx`: scene khusus gaya #44 "Kita Bedah".
- `taglines.json`: tagline per ID gaya.

### `project/video-pemulihan-air`
- 1080×1920, 30 fps, `TOTAL_FRAMES = 1885` (±62,8 dtk), gaya #44 "Kita Bedah".
- `src/MainVideo.tsx`: overlay, header per babak (`CHAPTERS`), caption karaoke, audio. `src/World3D.tsx` + `src/layout3d.ts`: dunia 3D (reservoir → pipa transmisi → distribusi → rumah) beserta posisi kamera. `src/World.tsx` versi 2D lama dan tidak dipakai lagi.
- `src/antislop/`: salinan komponen & theme dari skill motion-craft (CameraRig, Bedah3D, BedahOverlay, KineticWords, Transitions, easing-and-timing, styles-catalog). Gunakan ulang komponen ini, jangan bikin ulang.
- `research/storyboard.md`: tabel frame → narasi → kamera → visual → SFX. **Batas frame di kode harus cocok dengan storyboard.** Kalau timing berubah, perbarui keduanya.
- `research/narasi.txt`: naskah VO. `public/words.json`: timing per kata (edge-tts, suara `id-ID-ArdiNeural`) untuk caption & sinkron animasi.
- `public/audio/`: `narration.mp3`, `music.wav`, `bed.wav`, `sfx-track.wav`. `public/brand/`: logo resmi Tirta Ayu (SVG). `public/ui/`: screenshot layar Tiray.
- `out/`: hasil render berversi (`v1`, `v2`, `*-final.mp4`). File lama jangan ditimpa, buat versi baru.

## Konvensi

- Animasi wajib deterministik dan dihitung dari `useCurrentFrame()` (`ip`/`interpolate`, `springAt`, easing dari `easing-and-timing.ts`). Jangan pakai `Math.random()`, `Date`, CSS transition, atau state dari timer.
- Aset dimuat via `staticFile()` dari `public/`. Font dimuat via `@remotion/google-fonts`.
- SFX terikat ke event animasi (klik, ketik, pop-in, transisi) lewat `<Sequence>`/`<Audio>` di frame yang sama dengan animasinya.
- Aturan anti-slop dari motion-craft: tanpa pill/background teks sampah, tanpa titik bulat atau ikon dekoratif, kamera spline mulus tanpa shake, safe zone 9:16 untuk konten vertikal.
- Angka yang tidak bersumber dari data resmi (persen, counter) wajib diberi badge **ILUSTRASI**.
- Brand Tirta Ayu / Tiray: pakai logo, warna, font, dan tone dari skill `tiray-brand-kit`. Jangan mengarang logo atau fitur aplikasi. Kontak resmi yang dipakai: WA 0877 3055 0300, tirtaayu.co.id.
- Render 3D di Chromium memakai `chromiumOptions: { gl: 'angle' }`.
- Versi paket Remotion dikunci di `4.0.220`. Semua paket `@remotion/*` harus satu versi.

## Git

- Semua aturan ignore ada di `.gitignore` root. Jangan buat `.gitignore` per project yang menyembunyikan kode sumber.
- Yang di-commit: `src/`, `research/`, `package*.json`, `tsconfig.json`, aset sumber di `public/` (brand, ui, sfx, `narration.mp3`, `words.json`).
- Yang tidak di-commit: `node_modules/`, `project/*/out/`, `sample/`, audio hasil generate (`bed.wav`, `music.wav`, `sfx-track.wav`), `.env`.
