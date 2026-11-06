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
| Target audiens | |
| Gaya (kata kunci mood untuk `draw-style.mjs`) | |
| Gaya terpilih (file di `references/styles/`) | <!-- diisi setelah draw-style.mjs --> |
| Komponen 3D / Grid / Card Interaction (`CARD-GRID-3D-PATTERNS.md`) | <!-- misal <Coverflow3D />, <BentoGridReveal />, <PolaroidDropTable /> --> |
| BGM · profil narator | <!-- ID B00–B39 / M01–M24 dari SOUND.md · N01–N05 --> |
| Brand / teknologi / project yang muncul | <!-- tiap item wajib lewat fetch-brand-logo.mjs --> |
| Aset user di `public/` | <!-- foto, footage, logo, data; jangan mengarang aset --> |

## 2. Tabel Scene

Detik = jendela tayang scene. Pacing asimetris: hook pendek, isi lebih panjang, penutup ringkas.

| # | Detik | Visual (hero tengah 85%) | Motion | Cam | Out | SFX |
|---|---|---|---|---|---|---|
| 1 | 0–2 | | | HOLD | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | END | |

## 3. Narasi per Scene

| # | Teks narasi (subtitle bawah) | Catatan sinkronisasi |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |

## 4. Cek Sebelum Menulis Kode

- [ ] Satu scene, satu ide; hook dalam 2–3 detik pertama; CTA jelas di scene terakhir
- [ ] Tidak ada pill/badge di belakang teks (kecuali tombol interaktif nyata atau bubble chat)
- [ ] Tidak ada titik bulat di samping teks dan tidak ada ikon hiasan
- [ ] Semua brand/teknologi/project memakai `<BrandLogo />` dari logo asli
- [ ] Browser, terminal, aplikasi, desktop memakai komponen Authentic / LivedIn
- [ ] Setiap SFX terikat ke animasi yang berjalan; tidak ada SFX liar
- [ ] Hero di tengah, subtitle di bawah lewat `<BottomSubtitleBar />`
- [ ] Kamera tenang (C1 spline, tanpa shake); transisi antar-scene seamless
- [ ] Semua angka dan data berasal dari user atau sumber yang dicantumkan di layar
- [ ] Total durasi scene (dikurangi overlap) sama dengan durasi target
- [ ] Sudah dijalankan: `lint.mjs`, `inspect-motion.mjs`
