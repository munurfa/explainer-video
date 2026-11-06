# STORYBOARD — <judul video>

Salin file ini ke `research/storyboard.md` di project Remotion, lalu isi. Kode singkatan (Cam / Out / SFX) ada di `references/storyboards/INDEX.md`. Hapus komentar `<!-- -->` setelah diisi.

## 1. Info Proyek

| Field | Isi |
|---|---|
| Judul | |
| Tujuan / pesan utama (satu kalimat) | |
| Template acuan (ID dari INDEX, bila ada) | <!-- misal T032 --> |
| Durasi total | <!-- detik --> |
| Rasio · resolusi · fps | <!-- 16:9 1920×1080 · 9:16 1080×1920 · 1:1 1080×1080 · 30 fps --> |
| Target audiens | <!-- default: awam non-teknis (references/AUDIENS-AWAM.md); tulis alasan bila audiens teknis --> |
| Analogi utama | <!-- konsep abstrak → analogi sehari-hari, mis. tekanan air → selang taman ditekuk --> |
| Gaya (kata kunci mood untuk `draw-style.mjs`) | |
| Gaya terpilih (file di `references/styles/`) | <!-- diisi setelah draw-style.mjs --> |
| Komponen 3D / Grid / Card Interaction (`CARD-GRID-3D-PATTERNS.md`) | <!-- misal <Coverflow3D />, <BentoGridReveal />, <PolaroidDropTable /> --> |
| BGM · profil narator | <!-- ID B00–B39 / M01–M24 dari SOUND.md · N01–N08 (dipilih dari voice-samples) --> |
| Platform tujuan | <!-- IG Reels / TikTok / YouTube Shorts / YouTube / feed --> |
| CTA | <!-- satu ajakan: follow / simpan / komentar / cek link --> |
| Brand / teknologi / project yang muncul | <!-- tiap item wajib lewat fetch-brand-logo.mjs --> |
| Aset user di `public/` | <!-- foto, footage, logo, data; jangan mengarang aset --> |

## 2. Tabel Scene

Detik = jendela tayang scene. Pacing asimetris: hook pendek, isi lebih panjang, penutup ringkas.
Scene 1 = hook dan selesai <= 3 detik. Scene terakhir = CTA. Setelah VO disintesis, durasi final mengikuti `research/vo-timing.json` (`scenes.mjs --timing`).

| # | Detik | Visual (hero tengah 85%) | Motion | Cam | Out | SFX |
|---|---|---|---|---|---|---|
| 1 | 0–2 | | | HOLD | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | END | |

## 3. Narasi per Scene

Budget kata: **2.5 kata/detik** (Indonesia) atau 2.8 (Inggris). Scene 4 detik = maks 10 kata. Naskah final ditulis di `research/vo-script.md` (format di `templates/VO-SCRIPT.template.md`) lalu dicek `vo-lint.mjs`.

| # | Teks narasi (subtitle bawah) | Kata / budget | Catatan sinkronisasi |
|---|---|---|---|
| 1 | | / | hook |
| 2 | | / | |
| 3 | | / | |
| 4 | | / | |
| 5 | | / | cta |

## 3b. Safe Zone (9:16)

Atas 15% (0–288 px) dan bawah 20% (1536–1920 px) tertutup UI Reels/TikTok/Shorts; kanan 12% tertutup tombol like/komentar. Judul, angka, subtitle, dan CTA wajib di luar zona itu. Subtitle memakai default `useSafeZone()` (bottom 422 px, font 44 px, 4 kata per baris). 16:9: margin 5% di semua sisi.

## 4. Cek Sebelum Menulis Kode

- [ ] Satu scene, satu ide; hook selesai <= 3 detik; CTA jelas di scene terakhir
- [ ] Kata per scene <= 2.5 kata/detik (`vo-lint.mjs` PASS)
- [ ] Ramah penonton awam: maks 3 istilah teknis (semua dijelaskan), tiap konsep abstrak punya analogi, tiap istilah di narasi terlihat di layar, paham tanpa suara (`references/AUDIENS-AWAM.md`)
- [ ] Teks penting di luar safe zone (`inspect-motion.mjs --safe-zone` PASS, cek pita merah di still)
- [ ] Tidak ada pill/badge di belakang teks (kecuali tombol interaktif nyata atau bubble chat)
- [ ] Tidak ada titik bulat di samping teks dan tidak ada ikon hiasan
- [ ] Semua brand/teknologi/project memakai `<BrandLogo />` dari logo asli
- [ ] Browser, terminal, aplikasi, desktop memakai komponen Authentic / LivedIn
- [ ] Setiap SFX terikat ke animasi yang berjalan; tidak ada SFX liar
- [ ] Hero di tengah, subtitle di bawah lewat `<BottomSubtitleBar />` dengan default safe zone
- [ ] Kamera tenang (C1 spline, tanpa shake); transisi antar-scene seamless
- [ ] Semua angka dan data berasal dari user atau sumber yang dicantumkan di layar
- [ ] Total durasi scene (dikurangi overlap) sama dengan durasi target
- [ ] Sudah dijalankan: `lint.mjs`, `inspect-motion.mjs`

## 5. Checkpoint Approval

| Checkpoint | Bukti yang ditunjukkan ke user | Status |
|---|---|---|
| Storyboard | tabel ini + `out/storyboard/contact-sheet.png` (`storyboard-preview.mjs`) | [STOP – TUNGGU APPROVAL] |
| Naskah VO | `research/vo-script.md` + tabel `vo-lint.mjs` | [STOP – TUNGGU APPROVAL] |
| Suara narator | `research/voice-samples.md` (3 sampel kalimat hook) | [STOP – TUNGGU APPROVAL] |
| VO penuh | `public/audio/narration.mp3` + `research/word-map.md` | [STOP – TUNGGU APPROVAL] |
| Render | `out/v1.mp4` + still safe zone | [STOP – TUNGGU APPROVAL] |
