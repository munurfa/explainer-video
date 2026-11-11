# /motion-craft

**Engine Motion Graphics & Video Editing Setara After Effects untuk AI Coding Agent di Remotion (React + TypeScript).**

`motion-craft` adalah *open-source agent skill* (mengikuti standar `agentskills.io`) yang mengubah AI coding agent (Claude Code, ZCode, Cursor, Codex, Windsurf) menjadi **Senior After Effects Artist & Motion Director**. Skill ini membekali agent dengan komponen React/Remotion siap pakai, kamera C1 Spline mulus tanpa getaran, 43 panduan gaya desain mendalam, 100 template storyboard, 19 koreografi kartu 3D/Grid/Interaksi, replika UI autentik, resolver logo brand resmi, serta 65+ Studio SFX & 64 pilihan lagu backsound yang terikat langsung ke animasi.

---

## Daftar Isi

1. [Cara Instalasi](#1-cara-instalasi)
2. [Cara Pakai di Agent (`/motion-craft`)](#2-cara-pakai-di-agent-motion-craft)
3. [6 Aturan Keras Anti-Slop](#3-6-aturan-keras-anti-slop)
4. [7 Standar Editing Humanizer](#4-7-standar-editing-humanizer)
5. [19 Komponen 3D Card Layout, Grid Animation, & Card Interaction](#5-19-komponen-3d-card-layout-grid-animation--card-interaction)
6. [100 Template Storyboard Siap Pakai (`T001`–`T100`)](#6-100-template-storyboard-siap-pakai-t001t100)
7. [43 File Spesifikasi Gaya Desain (`references/styles/`)](#7-43-file-spesifikasi-gaya-desain-referencesstyles)
8. [64 Lagu Backsound & 65+ Studio SFX Terikat-Animasi](#8-64-lagu-backsound--65-studio-sfx-terikat-animasi)
9. [Alur Kerja CLI & Skrip Otomatis](#9-alur-kerja-cli--skrip-otomatis)
10. [Struktur Direktori & Benchmark Uji Skill](#10-struktur-direktori--benchmark-uji-skill)

---

## 1. Cara Instalasi

### Opsi A — Lewat `npx skills` (Rekomendasi Utama)
```bash
npx skills add https://github.com/RajaskaJanuardani/motion-craft --skill "motion-craft"
```

### Opsi B — Sebagai Plugin Claude Code
Jalankan di dalam sesi Claude Code:
```text
/plugin marketplace add RajaskaJanuardani/motion-craft
/plugin install motion-craft@motion-craft
```

### Opsi C — Clone & Installer Otomatis (Claude Code, ZCode, Cursor, Codex)
**macOS / Linux / Git Bash:**
```bash
git clone https://github.com/RajaskaJanuardani/motion-craft.git
cd motion-craft
./install.sh --all-agents
```

**Windows PowerShell:**
```powershell
git clone https://github.com/RajaskaJanuardani/motion-craft.git
cd motion-craft
.\install.ps1
```

---

## 2. Cara Pakai di Agent (`/motion-craft`)

Panggil langsung menggunakan perintah **`/motion-craft`** di chat agent pada project Remotion Anda:

### Contoh 1 — Video Demo Produk / SaaS Interaktif
```text
/motion-craft Buatkan video demo produk SaaS AI berdurasi 15 detik (1920x1080, 30fps). Tampilkan terminal macOS asli saat mengetik perintah instalasi dengan kamera yang zoom mengikuti ketikan, lanjutkan transisi seamless ke browser yang menampilkan Bento Grid fitur utama dan kursor yang mengklik tombol Publish, lalu tutup dengan Grid Recap semua fitur. Narasi subtitle taruh rapi di bawah layar.
```

### Contoh 2 — Memakai Template Storyboard Spesifik (`T001`–`T100`) & Gaya Spesifik (`01`–`43`)
```text
/motion-craft Gunakan storyboard T035 (Coding Demo Live-Typing) dan gaya 43 (Motion Reel Editorial). Buat video 20 detik yang menampilkan proses coding TypeScript + React di Remotion lengkap dengan logo resmi Claude, Remotion, TypeScript, dan React, SFX ketikan keyboard mekanik, serta backsound B26.
```

### Contoh 3 — Video Reels / TikTok Vertikal (`9:16`) dengan Koreografi Kartu 3D
```text
/motion-craft Buatkan video vertikal 9:16 (1080x1920, 30fps) berdurasi 15 detik untuk showcase 6 fitur aplikasi mobile. Gunakan komponen Coverflow3D di pembuka, CardFlip3D untuk perbandingan sebelum-sesudah, dan PolaroidDropTable di bagian testimoni.
```

---

## 3. 6 Aturan Keras Anti-Slop

Skill ini memiliki *Static Linter* (`scripts/lint.mjs`) dan *Motion Inspector* (`scripts/inspect-motion.mjs`) yang menegakkan 6 aturan desain mutlak agar hasil video tidak terlihat seperti buatan AI generik:

1. **Dilarang Membuat Background Teks / Pill Badge Sampah:**
   - Tidak boleh membungkus judul, label, atau kata dengan kotak/pill background warna-warni yang tidak punya fungsi interaktif. Background hanya dipakai pada tombol asli yang benar-benar diklik kursor atau gelembung pesan di dalam aplikasi chat.
2. **Dilarang Membuat Titik Bulat di Samping Teks (`• teks`) & Ikon Hiasan Palsu:**
   - Melarang penggunaan *bullet dot* di samping label (`• localhost:3000`, `• ACTIVE`) serta melarang ikon dekoratif generik seperti ikon petir (`LightningIcon`), bintang (`SparkleIcon`), atau bohlam (`LightbulbIcon`).
3. **Wajib Menggunakan Logo Asli untuk Setiap Brand / Teknologi / Project (`<BrandLogo />`):**
   - Setiap kali konten menyebut brand atau project (Claude, Anthropic, Remotion, Adobe After Effects, Premiere Pro, CapCut, DaVinci Resolve, React, TypeScript, Next.js, VS Code, GitHub, Figma, OpenAI, Docker, Vercel, Supabase, YouTube, TikTok, Instagram, atau brand kustom), agent wajib memakai logo vektor aslinya lewat `<BrandLogo brand="..." />` dan skrip pencari otomatis `scripts/fetch-brand-logo.mjs` (terhubung ke aset lokal project, **svgl.app API**, dan **Simple Icons CDN 3.200+ brand**).
4. **SFX Wajib Terikat Langsung ke Animasi (*Event-Driven*, Bukan Acak):**
   - Tidak boleh ada SFX liar di setiap kata subtitle. SFX terpasang langsung di dalam komponen React (`<Sequence><Audio /></Sequence>`) sehingga hanya berbunyi tepat saat animasi mengetik, *progress bar* berjalan, kursor mengklik, kartu berputar, atau transisi scene terjadi.
5. **Kemiripan Visual 1:1 untuk Aplikasi Digital (UI) & Objek Fisik Dunia Nyata (*Universal Fidelity*):**
   - **Aplikasi, Website, & Software:** Kapan pun user meminta tampilan aplikasi/website/platform apa pun (populer seperti VS Code, Figma, TikTok, YouTube, Shopee, Spotify, maupun aplikasi kustom milik user), agent wajib merekonstruksi anatomi UI aslinya semirip mungkin (1:1) lewat kode React/SVG (lengkap dengan navigasi, warna resmi, `<BrandLogo />`, dan data nyata), atau memakai 4 fondasi di `LivedInUIShells.tsx` (`<AuthenticBrowserWindow />`, `<AuthenticTerminalWindow />`, `<ChatAppShell />`, `<MacDesktopChrome />`).
   - **Objek Fisik, Alam, Sains, & Benda Dunia Nyata:** Kapan pun topik membahas objek fisik/fenomena nyata di dunia nyata, dilarang keras menggantinya dengan kotak kartu teks atau lingkaran/kotak polos! Agent wajib menggambar siluet khas, proporsi, anatomi bagian-bagian pembentuknya dengan multi-layer `<svg>` (`<path>`, bezier, gradien pencahayaan), serta menggerakkannya sesuai mekanika/hukum fisik aslinya.
6. **Hierarki Panggung 85% Konten Utama di Tengah vs 15% Subtitle Bersih di Bawah (`<BottomSubtitleBar />`):**
   - Panggung tengah didedikasikan penuh untuk aksi visual topik, sedangkan narasi subtitle berada rapi di bagian bawah (default `useSafeZone()`: 16:9 `bottom` 6%; 9:16 `bottom` 422px di atas zona tertutup UI Reels/TikTok/Shorts, teks bersih tanpa kotak background warna-warni).

---

## 4. 7 Standar Editing Humanizer

Agar gerakan animasi terasa dibuat oleh tangan editor manusia profesional (bukan *linear tween* kaku):

| # | Nama Humanizer | Implementasi di `templates/` | Efek Visual & Audio |
|---|---|---|---|
| **1** | **Humanized Typing & Fitts-Law Cursor** | `<TypeText typoCorrection />` & `<AnimatedCursor />` | Kecepatan ketik bervariasi per jenis karakter (jeda mikrosekon di spasi/tanda baca + fitur salah ketik & *backspace*) serta kursor yang melakukan *micro-overshoot* `4.5px` dan *hover delay* `5 frame` sebelum menekan tombol. |
| **2** | **Overlapping Action & Micro-Bobbing** | `staggeredSpringAt()` & `microBob()` | Wadah kartu (layer 0), isi utama (layer 1), dan elemen pendukung (layer 2) memiliki inersia pegas berlapis sehingga tidak berhenti di frame yang sama persis. |
| **3** | **Asymmetric Scene Pacing & Camera Anticipation** | `computeAsymmetricSceneDurations()` & `buildTypingCameraSpline()` | Durasi antar-scene dibuat asimetris (*Establish lambat → Aksi cepat → Climax hold*) ditambah tarikan kamera mundur tipis `0.982x` selama 3 frame sebelum melesat *zoom-in*. |
| **4** | **J-Cut Audio Lead-In** | `<SeamlessSceneShell />` | Sound effect transisi studio berbunyi mendahului perpindahan visual agar sambungan antar-scene terasa mengalir. |
| **5** | **Velocity-Driven Motion Blur & Rack-Focus** | `splineVelocityAt()` di `<CameraRig />` | Saat kamera diam, gambar 100% tajam (`blur(0px)`). Saat kamera melesat cepat di atas ambang kecepatan, muncul *directional blur* halus (`1.5px–3.8px`) yang langsung hilang saat kamera berhenti. |
| **6** | **Authentic Lived-In UI Shells** | `templates/components/LivedInUIShells.tsx` | Jendela browser, terminal, aplikasi chat, dan desktop macOS tampil utuh dengan detail periferal nyata. |
| **7** | **Safe-Zone & Bounding-Box Spline Inspector** | `scripts/inspect-motion.mjs` | Memverifikasi secara matematis bahwa seluruh *waypoint* kamera `splineAt` berada di zona aman (`20%–80%` layar) dan tidak pernah menabrak `<BottomSubtitleBar />`. |

---

## 5. 19 Komponen 3D Card Layout, Grid Animation, & Card Interaction

Tersedia langsung di `templates/components/` (dokumentasi lengkap di [`references/CARD-GRID-3D-PATTERNS.md`](references/CARD-GRID-3D-PATTERNS.md)):

### A. 3D Card Layouts (`templates/components/Card3DLayouts.tsx`)
| Komponen | Cara Kerja Animasi | SFX Otomatis | Kegunaan Utama |
|---|---|---|---|
| `<Coverflow3D />` | Kartu aktif menghadap lurus di depan (`rotateY(0deg) translateZ(90px)`), kartu kiri/kanan miring perspektif 3D (`±48deg`). | `transition-swipe.wav` | Galeri fitur & showcase pilihan produk. |
| `<FerrisWheelCards />` | Kartu beredar mengikuti roda bianglala melingkar namun orientasi tiap kartu tetap tegak lurus (`0deg`). | `tick-soft.wav` | Daftar fitur/tahapan yang tampil bergiliran. |
| `<CubeRoll3D />` | 6 kartu ditempel pada 6 sisi kubus 3D utuh (`preserve-3d`) yang berputar menggulung per sisi. | `transition-swoosh.wav` | Menampilkan 6 poin utama dalam satu objek 3D. |
| `<CylinderCards3D />` | Kartu mengelilingi tabung drum horizontal 3D (`rotateY` + `translateZ`). | `transition-scroll.wav` | Carousel melingkar 360 derajat. |
| `<HelixCards3D />` | Kartu naik melingkar seperti tangga putar (spiral vertikal 3D). | `transition-swipe.wav` | Urutan langkah / evolusi timeline bertahap. |
| `<SphereCards3D />` | Kartu menempel mengelilingi permukaan bola 3D (*Fibonacci lattice*). | `transition-whoosh-soft.wav` | Ekosistem integrasi / jaringan global. |
| `<ZDepthTunnel />` | Kartu meluncur datang dari kejauhan (`jauh` → `dekat`) menembus sumbu Z kamera lengkap dengan *rack-focus blur*. | `transition-whoosh-soft.wav` | Intro sinematik / penjelajahan arsip visual. |

### B. Grid Animations (`templates/components/GridAnimations.tsx`)
| Komponen | Tahapan Gerakan (3 Fase) | SFX Otomatis | Kegunaan Utama |
|---|---|---|---|
| `<BentoGridReveal />` | `kotak 1` (hero besar) → `kotak 2–3` → `lengkap` (6 kotak beda ukuran). | `pop-in.wav` tiap gelombang | Ringkasan spesifikasi unggulan (gaya Apple Bento). |
| `<ExplodeToGrid />` | `tumpukan` di tengah → `pecah` menyebar radial → `rapi di grid` 3×2. | `transition-swoosh.wav` + `pop-drop.wav` | Membuka koleksi atau memperkenalkan banyak modul. |
| `<LayoutMorphGridToCarousel />` | Interpolasi *FLIP* mulus dari `grid` → `kartu berpindah` → `jadi carousel` horizontal tanpa *hard cut*. | `transition-maximize.wav` + `transition-swipe.wav` | Mengubah ikhtisar grid menjadi fokus per kartu. |
| `<MasonryZoomDetail />` | `pilih kotak` di galeri → `membesar` → `jadi halaman` detail layar penuh. | `click.wav` + `transition-whoosh-soft.wav` | Transisi mulus dari galeri menuju bedah detail. |
| `<GridRecapZoomOut />` | `slide terakhir` layar penuh → `kartu kembali` mengecil → `recap semua` 6 kartu di grid. | `transition-minimize.wav` + `confirm-chime.wav` | Scene penutup untuk merangkum seluruh poin. |

### C. Card Interactions (`templates/components/CardInteractions.tsx`)
| Komponen | Cara Kerja Animasi | SFX Otomatis | Kegunaan Utama |
|---|---|---|---|
| `<CardStackSwipe />` | Kartu teratas digeser (`swipe`) ke samping dengan rotasi natural sementara kartu bawahnya naik ke depan. | `transition-swipe.wav` | Pemilihan opsi cepat / *flashcards*. |
| `<FanSpreadCards />` | Tumpukan kartu membuka melengkung seperti kipas dari satu poros bawah (`50% 115%`). | `k1.wav` (gesekan kartu) | Memamerkan beberapa varian kartu sekaligus. |
| `<PolaroidDropTable />` | Bingkai foto Polaroid jatuh satu per satu ke atas meja dengan bayangan merapat saat mendarat. | `k2.wav` (hentakan foto) | Dokumentasi momen, *behind the scenes*, testimoni. |
| `<CardFlip3D />` | Kartu berputar `180°` pada sumbu Y dari sisi `depan` ke `belakang` dengan angkatan Z di tengah putaran. | `transition-swipe.wav` | Perbandingan *Before vs After* atau *Mitos vs Fakta*. |
| `<PageCurlCard />` | Sudut kanan-bawah kartu tergulung diagonal memperlihatkan `Sisi belakang` di bawahnya. | `k1.wav` | Pengungkapan rahasia / balik kartu bergaya kertas. |
| `<PageTurnBook />` | Halaman buku terbuka yang membalik `180°` dari poros punggung tengah. | `k1.wav` | Storytelling bab demi bab / undangan / katalog. |
| `<AccordionFoldCard />` | Kartu berlipat zig-zag 3D (`dilipat & dibuka`) dengan *shading* lipatan dinamis. | `transition-maximize.wav` | Penjelasan prosedur bertahap (*step-by-step*). |

---

## 6. 100 Template Storyboard Siap Pakai (`T001`–`T100`)

Tersedia di [`references/storyboards/INDEX.md`](references/storyboards/INDEX.md) dan terbagi ke dalam **10 file kategori** (masing-masing sudah memetakan waktu asimetris, gerak kamera, transisi seamless, SFX, dan komponen 3D/Grid/Card yang direkomendasikan):

| File Kategori | Rentang ID | Contoh Template di Dalamnya |
|---|---|---|
| [`01-bisnis-promosi.md`](references/storyboards/01-bisnis-promosi.md) | `T001`–`T010` | Promo Produk Teaser, Flash Sale Countdown, Grand Opening, Product Reveal, Testimoni Chat, Before–After, Katalog Menu, Pricing Tiers |
| [`02-korporat-profesional.md`](references/storyboards/02-korporat-profesional.md) | `T011`–`T020` | Company Profile, Pitch Startup, Laporan Kinerja Kuartal, Onboarding Karyawan, Rekrutmen, Event Recap, Roadmap Produk |
| [`03-edukasi-akademik.md`](references/storyboards/03-edukasi-akademik.md) | `T021`–`T030` | Explainer Konsep, Presentasi Skripsi, Tutorial Step-by-Step, Timeline Sejarah, Cheatsheet, Demo Proyek Capstone, Diagram Alur Sistem |
| [`04-teknologi-software.md`](references/storyboards/04-teknologi-software.md) | `T031`–`T040` | Demo Aplikasi Mobile, Demo SaaS Dashboard, Changelog Rilis, Cara Kerja API, Coding Demo Live-Typing, Instalasi CLI Terminal, AI Prompt-to-Result, GitHub Repo |
| [`05-media-sosial.md`](references/storyboards/05-media-sosial.md) | `T041`–`T050` | Hook 3 Detik TikTok/Reels, Tips Cepat 3 Hal, Cerita Chat iMessage, Kinetic Typography Quote, Behind the Scenes Desktop, Mitos vs Fakta |
| [`06-event-perayaan.md`](references/storyboards/06-event-perayaan.md) | `T051`–`T060` | Undangan Pernikahan, Ulang Tahun, Save the Date, Aftermovie Event, Trailer Pembukaan, Ucapan Wisuda, Idulfitri, HUT RI 17 Agustus |
| [`07-sosial-kampanye.md`](references/storyboards/07-sosial-kampanye.md) | `T061`–`T070` | Kampanye Lingkungan, Galang Dana/Donasi, Edukasi Kesehatan, Anti-Bullying, Hemat Energi, Literasi, Keselamatan Berkendara |
| [`08-kreatif-hiburan.md`](references/storyboards/08-kreatif-hiburan.md) | `T071`–`T080` | Intro/Outro YouTube, Lyric Video Kinetic, Trailer Film Pendek, Intro Gaming, Podcast Audiogram, Music Visualizer, Opening Credits |
| [`09-kuliner-travel-lifestyle.md`](references/storyboards/09-kuliner-travel-lifestyle.md) | `T081`–`T090` | Resep Cepat, Promo Restoran, Destinasi Wisata, Hotel/Villa Promo, Rutinitas Fitness, Skincare, Fashion Lookbook, Tur Properti, Otomotif |
| [`10-infografis-data.md`](references/storyboards/10-infografis-data.md) | `T091`–`T100` | Statistik Tahunan (Big Number), Perbandingan A vs B, Timeline Proses, Funnel Bisnis, Exploded View, Top 5 Ranking, Peta Data, Line Chart, Wrapped |

---

## 7. 43 File Spesifikasi Gaya Desain (`references/styles/`)

Setiap gaya di [`references/STYLES.md`](references/STYLES.md) memiliki **file Markdown spesifikasinya sendiri** di `references/styles/01-cyberpunk.md` s/d `references/styles/43-motion-reel-editorial.md` (masing-masing memuat **palet warna hex 60-20-10-7-3**, **skala tipografi 16:9 & 9:16**, **aturan bentuk & UI**, **rumus fisika pegas**, **waypoint kamera `splineAt`**, **pasangan BGM & SFX**, **contoh kode TSX lengkap**, dan **larangan anti-slop spesifik gaya**):

- `01` Cyberpunk · `02` Doodle · `03` Zine · `04` Grafiti · `05` Blueprint · `06` Memphis · `07` Isometric · `08` Clay 3D · `09` Pixel Art · `10` Glassmorphism · `11` Neo-Brutalism · `12` Swiss International · `13` Bauhaus · `14` Risograph · `15` VHS Analog · `16` Y2K Chrome · `17` Art Nouveau · `18` Chalkboard · `19` Papercut · `20` Collage Mixed Media · `21` Mid-Century Modern · `22` Art Deco · `23` Steampunk · `24` Batik & Tenun · `25` Headline Koran · `26` Terminal CLI · `27` Wireframe 3D · `28` Glitch Datamosh · `29` Neon Signage · `30` Origami · `31` Stempel & Lino · `32` Retro-Futurism · `33` Botanical · `34` Split-Flap · `35` Komik & Manga · `36` Data Editorial · `37` Inflatable 3D · `38` Peta Transit · `39` HUD Game · `40` Bioskop Tua · `41` Cat Air · `42` Krayon · `43` Motion Reel Editorial.

---

## 8. 64 Lagu Backsound & 65+ Studio SFX Terikat-Animasi

Dokumentasi lengkap terdapat di [`references/SOUND.md`](references/SOUND.md):

1. **9 SFX Transisi Studio CC0 (`public/audio/sfx/`):**
   - `transition-swoosh.wav` (`whip-glide-left`), `transition-swipe.wav` (`whip-glide-up`), `transition-whoosh-soft.wav` (`portal-zoom-in`), `transition-maximize.wav` (`spring-sheet-up`), `transition-minimize.wav`, `transition-chop.wav` (`match-cut`), `transition-cinematic.wav`, `transition-scroll.wav`, `transition-glitch.wav`.
2. **56+ SFX Interaksi & Pack Tematik:**
   - **Ketikan Keyboard Asli:** `typing-loop.wav` (mekanik), `typing-soft.wav` (laptop), `typing-digital.wav` (terminal).
   - **Loading & Data:** `progress-loop.wav` (detak naik `0% -> 100%`), `data-reveal.wav`, `confirm-chime.wav`, `ding-bell.wav` (`d2.wav`).
   - **Kursor & Kartu:** `hover-rollover.wav`, `click.wav` (`d1.wav`), `click-soft.wav`, `toggle-on.wav`, `pop-in.wav`, `pop-plop.wav`, `pop-drop.wav`, `k1.wav`–`k5.wav` (kertas/polaroid), `m1.wav`–`m4.wav` (mekanik), `r1.wav`–`r3.wav` (arcade), `o1.wav`–`o5.wav` (organik).
3. **40 Lagu Backsound Prosedural Multi-Chord (`B00`–`B39` di `scripts/synth-audio.mjs`):**
   - Termasuk 15 lagu modern `B25` (*Apple Keynote Minimal Pluck*), `B26` (*Framer / Linear SaaS Groove*), `B27` (*Vox Documentary Piano*), `B28` (*Phonk Drift*), `B29` (*UK Garage 2-Step*), `B30` (*Bedroom Indie Synth*), `B31` (*Neo-Soul Rhodes*), `B32` (*Liquid DnB*), `B33` (*Future Bass*), `B34` (*Bossa Nova*), `B35` (*Dark Matrix Techno*), `B36` (*Sunny Acoustic*), `B37` (*Cinematic Hybrid*), `B38` (*Vaporwave*), `B39` (*Nu-Disco Funk*).
4. **24 Lagu Rekaman Studio Royalty-Free (`M01`–`M24` di `scripts/fetch-music.mjs`):**
   - Mengunduh dan mengonversi lagu studio ke WAV 48kHz stereo siap pakai.

---

## 9. Alur Kerja CLI & Skrip Otomatis

Seluruh skrip di folder `scripts/` berjalan dengan **Node.js murni (zero external npm dependencies)**:

```bash
# 1. Pilih Gaya Desain dari 43 Katalog (otomatis menyalin panduan .md gaya ke research/selected-style-guide.md)
node "<skill>/scripts/draw-style.mjs" --brief "SaaS AI developer launch" --out research

# 2. Rancang Storyboard (T001-T100) & Pembagian Frame Asimetris
node "<skill>/scripts/scenes.mjs" --template T032 --brief "SaaS AI developer launch" --duration 15 --fps 30 --overlap 10 --out research

# 3. Ambil Logo SVG Resmi untuk Semua Brand/Project yang Disebut
node "<skill>/scripts/fetch-brand-logo.mjs" --brands "claude,remotion,after-effects,react,typescript,github" --project-dir . --out public/brands

# 4. Sinkronisasi Subtitle Narator (words.json) & Sintesis Audio 48kHz (Lagu B00-B39 + 65 SFX)
node "<skill>/scripts/narrator-sync.mjs" --text "Tampilkan visual utama di tengah dan subtitle bersih di bawah." --profile N01 --out-words public/words.json --out-map research/word-map.md
node "<skill>/scripts/synth-audio.mjs" --bgm B26 --duration 15 --fps 30 --out public/audio

# Opsional: Unduh Lagu Studio Royalty-Free (M01-M24)
node "<skill>/scripts/fetch-music.mjs" --song M03 --duration 15 --out public/audio/music.wav

# 5. Jalankan Static Anti-Slop Linter & Safe-Zone Camera Inspector
node "<skill>/scripts/lint.mjs" src
node "<skill>/scripts/inspect-motion.mjs" --src src --comp MainVideo --frames 15,50,95,100,150,200

# 6. Render Video Akhir
npx remotion render MainVideo out/v1.mp4
```

---

## 10. Struktur Direktori & Benchmark Uji Skill

```text
motion-craft/
├── SKILL.md                              # Instruksi utama agent (/motion-craft)
├── README.md                             # Dokumentasi lengkap (Bahasa Indonesia)
├── install.sh / install.ps1              # Installer lintas agent (Claude, ZCode, Cursor, Codex)
├── assets/audio/
│   ├── sfx/                              # 49 file rekaman studio SFX CC0 (.wav)
│   └── songs/                            # 8 lagu BGM pre-bundled (.wav)
├── references/
│   ├── STYLES.md                         # Indeks utama 46 gaya desain visual
│   ├── styles/                           # 46 file spesifikasi rinci (01-cyberpunk.md .. 46-bedah-lapis.md)
│   ├── storyboards/                      # INDEX.md + 11 file kategori (103 template T001-T103)
│   ├── SCENE-COMPONENTS.md               # Komponen scene tambahan (DepthShots, InterfaceFrames, AppleInteractive, dst.)
│   ├── style-sfx.json                    # Peta ID gaya -> cue SFX material
│   ├── CARD-GRID-3D-PATTERNS.md          # Dokumentasi 19 komponen 3D Card, Grid, & Card Interaction
│   ├── SOUND.md                          # Katalog 64 lagu BGM & 65+ Studio SFX
│   ├── CAMERA-SCENES-NARRATOR.md         # Dokumentasi C1 Spline Camera & 5 profil narator
│   └── REPLICATION-AND-QA.md             # Tabel After Effects -> Remotion & Mode Replikasi 100%
├── scripts/
│   ├── draw-style.mjs                    # Pemilih gaya desain & penyalin style guide .md
│   ├── scenes.mjs                        # Planner storyboard (T001-T100) & pacing asimetris
│   ├── fetch-brand-logo.mjs              # Resolver SVG logo brand resmi (lokal + svgl + SimpleIcons)
│   ├── narrator-sync.mjs                 # Generator word-level subtitle timing (words.json)
│   ├── synth-audio.mjs                   # Synthesizer 48kHz WAV (40 lagu B00-B39 + 65 SFX)
│   ├── fetch-music.mjs                   # Downloader 24 lagu studio royalty-free (M01-M24)
│   ├── lint.mjs                          # Static Anti-Slop Linter (0 emoji, 0 shake, 0 filler icon)
│   ├── inspect-motion.mjs                # Safe-Zone & Bounding-Box Camera Spline Inspector (+ --geometry, --require-complete)
│   ├── qa-geometry.mjs                   # Cek kotak objek terukur (keluar layar, menimpa subtitle)
│   ├── evaluate-video.mjs                # Verifikasi metadata render + SSIM opsional terhadap acuan
│   ├── material-sfx.mjs                  # Generator 12 SFX material (paper-feed, glass-contact, water-bloom, ...)
│   └── run-evals.mjs                     # Automated Benchmark Suite (5 pengujian menyeluruh)
└── templates/
    ├── STORYBOARD.template.md            # Template kosong rencana storyboard
    ├── components/
    │   ├── BrandLogos.tsx                # Komponen <BrandLogo /> (25+ preset + auto-fallback SVG)
    │   ├── LivedInUIShells.tsx           # <AuthenticBrowserWindow />, <AuthenticTerminalWindow />, <ChatAppShell />, <MacDesktopChrome />
    │   ├── Card3DLayouts.tsx             # 7 komponen 3D Card Layout (Coverflow, FerrisWheel, CubeRoll, Cylinder, Helix, Sphere, ZDepthTunnel)
    │   ├── GridAnimations.tsx            # 5 komponen Grid Animation (Bento, ExplodeToGrid, LayoutMorph, MasonryZoom, GridRecap)
    │   ├── CardInteractions.tsx          # 7 komponen Card Interaction (StackSwipe, FanSpread, PolaroidDrop, CardFlip, PageCurl, PageTurn, Accordion)
    │   ├── KineticWords.tsx              # <BottomSubtitleBar />, <TypeText />, <AnimatedProgressBar />, <FlyText />
    │   ├── AnimatedCursor.tsx            # Kursor Fitts's Law dengan hover & click SFX otomatis
    │   ├── CameraRig.tsx                 # Kamera C1 Spline dengan velocity motion blur & spotlight
    │   ├── Transitions.tsx               # <SeamlessSceneShell />, <SharedElementMorph />, & <SfxCue />
    │   ├── AudioStage.tsx                # Mixer BGM, Ambience, & Auto-Ducking (-14 LUFS)
    │   └── ProceduralBackground.tsx      # Latar prosedural bersih sesuai gaya
    └── theme/
        ├── easing-and-timing.ts          # Fungsi splineAt, springAt, staggeredSpringAt, microBob
        └── styles-catalog.ts             # Preset data ringkas ke-46 gaya desain
```

### Menjalankan Benchmark Uji Skill
Untuk memastikan seluruh komponen, linter, generator storyboard, dan synthesizer audio berjalan sempurna:
```bash
node scripts/run-evals.mjs
```

---

## Lisensi

Dirilis di bawah lisensi [MIT License](LICENSE).
