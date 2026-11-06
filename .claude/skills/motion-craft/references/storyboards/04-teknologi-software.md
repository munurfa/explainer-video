# Storyboard 04 — Teknologi & Software (T031–T040)

Default: 30 fps, `overlap 10`. Kode singkatan (Cam / Out / SFX) ada di `INDEX.md`. Patuhi 6 aturan anti-slop di `SKILL.md`.
Kategori ini paling dekat dengan inti skill: UI asli (`<AuthenticBrowserWindow />`, `<AuthenticTerminalWindow />`, `<ChatAppShell />`, `<MacDesktopChrome />`), ketikan bersuara, kursor bersuara, kamera mengikuti konten. Semua brand/teknologi yang disebut wajib pakai `<BrandLogo />` (jalankan `fetch-brand-logo.mjs` dulu).

---

### T031 · Demo Aplikasi Mobile
durasi 20s · 9:16 · gaya "UI nyata, bersih, palet aplikasi" · bgm B26 · komponen: `<Coverflow3D />`, `<CardStackSwipe />`, `<AnimatedCursor enableClickSfx />`

| # | Detik | Visual | Motion | Cam | Out | SFX |
|---|---|---|---|---|---|---|
| 1 | 0–3 | Frame ponsel digambar kode, layar splash dengan `<BrandLogo />` aplikasi | frame spring-in, logo reveal | HOLD | PZI | pop-in |
| 2 | 3–8 | Layar utama: daftar atau feed, elemen masuk bergantian | `staggeredSpringAt` | HOLD | MC | pop-plop |
| 3 | 8–14 | Fitur utama: kursor/tap menekan tombol, layar berpindah | tap ripple fungsional, `<AnimatedCursor />` | CURSOR | SSU | CLICK |
| 4 | 14–18 | Hasil aksi: konfirmasi dengan angka atau status | counter / progress | PUSH | WGU | confirm-glass |
| 5 | 18–20 | `<BrandLogo />` + nama toko aplikasi dan tagline | hold | HOLD | END | confirm-glass |

### T032 · Demo SaaS Dashboard
durasi 20s · 16:9 · gaya "SaaS modern, grid rapi, kontras lembut" · bgm B26 · komponen: `<AuthenticBrowserWindow />`, `<BentoGridReveal />`, `<AnimatedCursor enableClickSfx />`

| # | Detik | Visual | Motion | Cam | Out | SFX |
|---|---|---|---|---|---|---|
| 1 | 0–3 | `<AuthenticBrowserWindow />` dengan URL produk, halaman login | window pop-in | HOLD | MC | pop-plop |
| 2 | 3–8 | `<TypeText />` mengisi email, kursor klik "Masuk" | ketik bersuara lalu klik | TYPE | SSU | TYPE |
| 3 | 8–14 | Dashboard terbuka, kartu metrik dan grafik masuk bergantian | `staggeredSpringAt`, grafik draw-on | HOLD | MC | data-reveal |
| 4 | 14–18 | Kursor mengikuti tombol "Publish" dan klik | hover 5f lalu klik, micro-overshoot | CURSOR | PZI | CLICK |
| 5 | 18–20 | Status berhasil dan `<BrandLogo />` produk | hold | HOLD | END | confirm-glass |

### T033 · Changelog / Fitur Baru
durasi 15s · 16:9 · gaya "dokumentasi bersih, mono + sans" · bgm B26 · komponen: `<CardFlip3D />`, `<AuthenticTerminalWindow />`, `<TypeText enableTypingSfx />`

| # | Detik | Visual | Motion | Cam | Out | SFX |
|---|---|---|---|---|---|---|
| 1 | 0–3 | Nomor versi besar (misal v2.1) dan tanggal rilis | counter versi + mask | HOLD | MC | impact-soft |
| 2 | 3–7 | Fitur 1: cuplikan UI sebelum dan sesudah | wipe slider `easeInOutSmooth` | PUSH | WGL | pop-in |
| 3 | 7–11 | Fitur 2: UI nyata dengan satu interaksi | kursor klik | CURSOR | WGL | CLICK |
| 4 | 11–13 | Daftar perbaikan kecil dalam satu kolom mono | baris stagger | HOLD | PZI | data-reveal |
| 5 | 13–15 | Perintah update diketik di terminal | `<TypeText />` | TYPE | END | TYPE (digital) |

### T034 · Arsitektur / Cara Kerja API
durasi 25s · 16:9 · gaya "diagram teknis, gelap, aksen tunggal" · bgm B26 · komponen: `<AuthenticTerminalWindow />`, `<TypeText enableTypingSfx typingVariant="digital" />`, `<BrandLogo />`

| # | Detik | Visual | Motion | Cam | Out | SFX |
|---|---|---|---|---|---|---|
| 1 | 0–3 | Judul dan satu kalimat tujuan | mask reveal | HOLD | MC | — |
| 2 | 3–9 | Klien dan server sebagai dua blok, `<BrandLogo />` tiap teknologi | blok pop | PUSH | WGL | pop-plop |
| 3 | 9–16 | Request: panah bergerak dari klien ke server, blok kode permintaan diketik | titik bergerak + `<TypeText />` | TYPE | WGL | TYPE (digital) |
| 4 | 16–22 | Response: data JSON kembali, kolom kunci disorot | panah balik + highlight baris | CURSOR | PZI | data-reveal |
| 5 | 22–25 | Status 200 dan ringkasan alur | hold | PULL | END | confirm-glass |

### T035 · Coding Demo Live-Typing
durasi 20s · 16:9 · gaya "editor kode nyata, tema gelap tenang" · bgm B26 · komponen: `<AuthenticTerminalWindow />`, `<TypeText enableTypingSfx typoCorrection />`, `<AnimatedProgressBar enableProgressSfx />`

| # | Detik | Visual | Motion | Cam | Out | SFX |
|---|---|---|---|---|---|---|
| 1 | 0–3 | Jendela editor (titlebar, tab, nomor baris), nama file dengan `<BrandLogo />` bahasa | window pop-in | HOLD | MC | pop-plop |
| 2 | 3–10 | Kode diketik baris demi baris, sesekali typo lalu backspace | `<TypeText typoCorrection />` | TYPE | MC | TYPE (mechanical) |
| 3 | 10–14 | Kode lengkap, garis bawah error muncul lalu diperbaiki | highlight + ketik ulang | TYPE | WGL | TYPE (mechanical) |
| 4 | 14–18 | Panel terminal terbuka di bawah, perintah dijalankan, output tampil | `<AnimatedProgressBar />` dan baris log | HOLD | PZI | PROG |
| 5 | 18–20 | Hasil jadi tampil di browser | window slide in | HOLD | END | confirm-glass |

### T036 · Instalasi CLI di Terminal
durasi 15s · 16:9 · gaya "terminal macOS autentik, mono" · bgm B26 · komponen: `<AuthenticTerminalWindow />`, `<TypeText enableTypingSfx />`, `<AnimatedProgressBar enableProgressSfx />`

| # | Detik | Visual | Motion | Cam | Out | SFX |
|---|---|---|---|---|---|---|
| 1 | 0–2 | `<AuthenticTerminalWindow />` kosong dengan prompt | window pop-in | HOLD | MC | pop-plop |
| 2 | 2–7 | Perintah install diketik | `<TypeText enableTypingSfx />` | TYPE | MC | TYPE (mechanical) |
| 3 | 7–11 | Output instalasi dan progress 0→100% | `<AnimatedProgressBar enableProgressSfx />` | HOLD | WGL | PROG |
| 4 | 11–13 | Perintah pertama dijalankan, hasilnya tampil | ketik + output stagger | TYPE | PZI | TYPE (digital) |
| 5 | 13–15 | Nama tool dan `<BrandLogo />` | logo reveal | HOLD | END | confirm-glass |

### T037 · AI Prompt-to-Result
durasi 20s · 16:9 · gaya "antarmuka chat AI nyata, tenang" · bgm B27 · komponen: `<ChatAppShell />`, `<TypeText enableTypingSfx />`, `<MasonryZoomDetail />`

| # | Detik | Visual | Motion | Cam | Out | SFX |
|---|---|---|---|---|---|---|
| 1 | 0–3 | Jendela chat AI kosong, `<BrandLogo />` produk AI | window pop-in | HOLD | MC | pop-plop |
| 2 | 3–8 | Pengguna mengetik prompt panjang | `<TypeText />` dengan kamera mengikuti | TYPE | MC | TYPE (soft) |
| 3 | 8–10 | Tombol kirim diklik kursor | hover 5f lalu klik | CURSOR | WGU | CLICK |
| 4 | 10–16 | Jawaban muncul bertahap, lalu hasil (kode/gambar/dokumen) ditampilkan | streaming teks, hasil slide in | PUSH | PZI | data-reveal |
| 5 | 16–20 | Hasil akhir penuh layar dan satu kalimat ringkasan | hold | HOLD | END | confirm-glass |

### T038 · Showcase Website / Portofolio Developer
durasi 20s · 16:9 · gaya "portofolio bersih, tipografi besar" · bgm B25 · komponen: `<AuthenticBrowserWindow />`, `<MasonryZoomDetail />`, `<BrandLogo />`

| # | Detik | Visual | Motion | Cam | Out | SFX |
|---|---|---|---|---|---|---|
| 1 | 0–3 | `<AuthenticBrowserWindow />` dengan domain portofolio, hero situs | window pop-in | HOLD | MC | pop-plop |
| 2 | 3–9 | Scroll halaman: bagian proyek masuk bergantian | scroll `easeInOutSmooth` | GLIDE | WGU | — |
| 3 | 9–14 | Klik satu proyek, halaman detail terbuka | kursor klik, transisi halaman | CURSOR | SSU | CLICK |
| 4 | 14–18 | Teknologi yang dipakai: baris `<BrandLogo />` | logo stagger | HOLD | PZI | pop-in |
| 5 | 18–20 | Nama developer dan kontak | hold | HOLD | END | confirm-glass |

### T039 · Cybersecurity Awareness
durasi 20s · 16:9 · gaya "gelap, peringatan tegas, aksen merah terbatas" · bgm B28 · komponen: `<AuthenticBrowserWindow />`, `<CardFlip3D />`, `<AnimatedCursor enableClickSfx />`

| # | Detik | Visual | Motion | Cam | Out | SFX |
|---|---|---|---|---|---|---|
| 1 | 0–3 | Pesan email phishing di jendela email, nama pengirim mencurigakan | jendela pop-in, highlight domain | PUSH | MC | impact-soft |
| 2 | 3–8 | Tiga tanda bahaya disorot satu per satu pada pesan | highlight stagger | PUSH | WGL | pop-plop |
| 3 | 8–13 | Kursor mengarah ke tautan, URL asli muncul saat hover | hover 5f + tooltip URL | CURSOR | WGU | CLICK |
| 4 | 13–18 | Tindakan benar: laporkan, jangan klik, aktifkan 2FA, tiga langkah | baris stagger | HOLD | PZI | confirm-glass |
| 5 | 18–20 | Nama tim keamanan dan kontak laporan | hold | HOLD | END | — |

### T040 · Proyek Open Source / GitHub Repo
durasi 20s · 16:9 · gaya "GitHub nyata, tenang, mono" · bgm B26 · komponen: `<AuthenticBrowserWindow />`, `<AuthenticTerminalWindow />`, `<BrandLogo brand="github" />`

| # | Detik | Visual | Motion | Cam | Out | SFX |
|---|---|---|---|---|---|---|
| 1 | 0–3 | Halaman repo di `<AuthenticBrowserWindow />`, nama repo dan deskripsi, `<BrandLogo brand="github" />` | window pop-in | HOLD | MC | pop-plop |
| 2 | 3–8 | Fitur utama dalam 3 baris README | baris stagger | HOLD | WGL | data-reveal |
| 3 | 8–14 | Terminal: clone dan install diketik, progress | `<TypeText />` + `<AnimatedProgressBar />` | TYPE | WGU | TYPE |
| 4 | 14–18 | Contoh penggunaan: satu perintah dan hasilnya | ketik + output | TYPE | PZI | TYPE (digital) |
| 5 | 18–20 | Lisensi, tautan repo, ajakan kontribusi | hold | HOLD | END | confirm-glass |
