# Kamera Mengikuti Konten, Transisi Seamless, & Tata Letak Konten vs Subtitle

Dokumen ini menjadi acuan teknis utama untuk **tata letak konten utama vs subtitle**, **kamera C1 spline yang mengikuti ketikan & kursor (tanpa shake)**, serta **transisi antar-scene yang halus seakan tidak berpindah scene**.

---

## 1. Aturan Tata Letak: Konten Visual Utama (85%) vs Subtitle di Bawah (15%)

**MASALAH YANG DILARANG KERAS:**
Menaruh subtitle penjelasan narator berukuran besar di tengah layar sehingga menutupi atau mengalahkan topik visual utamanya.

**STANDAR LAYOUT WAJIB:**
```
+-------------------------------------------------------------------+
|                                                                   |
|                  PANGGUNG VISUAL KONTEN UTAMA                     |
|                   (80% - 85% Area Tengah/Atas)                    |
|                                                                   |
|   - UI Aplikasi / Browser / Chat Bubbles / Terminal / Code        |
|   - Ketikan Langsung (TypeText) + Kursor Aktif (AnimatedCursor)   |
|   - Diagram Sistem / Grafik Data / Kartu Produk / Poster Visual   |
|   - Kamera Spline (splineAt) bekerja di dalam area dunia ini      |
|                                                                   |
|-------------------------------------------------------------------|
|        [ Subtitle Narasi Rapi di Bawah - BottomSubtitleBar ]      |
|        Font 22px-28px | Pill Transparan Halus | 1 Baris           |
+-------------------------------------------------------------------+
```

1. **Panggung Konten Utama (`CameraRig`):**
   - Berisi visual nyata dari topik yang sedang dibahas.
   - Teks yang boleh besar di area tengah hanyalah **elemen desain dari objek visual itu sendiri** (misalnya headline di dalam kartu poster, angka metrik di dalam dashboard, atau teks yang sedang diketik di dalam input UI).
2. **Subtitle Penjelasan (`BottomSubtitleBar`):**
   - Selalu berada di bagian bawah layar, posisinya dari `useSafeZone()` / `getSafeZone(w, h)` di `templates/components/SafeZone.ts` (default `<BottomSubtitleBar />` sudah memakainya):
     - **16:9:** `bottom` 6% tinggi (65px pada 1080p), margin 5% di semua sisi.
     - **9:16 (1080×1920):** atas 15% (0–288px) tertutup status bar + nama akun, bawah 20% (1536–1920px) tertutup caption + tombol + progress bar aplikasi, kanan 12% tertutup tombol like/komentar/share. Subtitle `bottom` 422px, font 44px, 4 kata per baris; judul/header mulai y >= 288px.
     - Cek otomatis: `inspect-motion.mjs --safe-zone` (statis + still dengan pita merah zona tertutup).
   - Tetap diam di ruang layar (*screen-space*, tidak ikut ter-zoom saat kamera menge-zoom konten).
   - Ukuran font proporsional (`22px–28px`), maksimal 6–8 kata per baris, dengan highlight halus pada kata yang sedang diucapkan.

---

## 2. Filosofi Kamera: Tenang (Calm Base) + Mengikuti Ketikan & Kursor (`splineAt`)

### A. Mengapa `splineAt` (Catmull-Rom / Cubic Hermite C1 Spline)?
- Menggunakan array waypoint `[frame, scale, tx, ty, rotDeg]`.
- Menjaga **kontinuitas kecepatan C1** di titik tengah sehingga gerakan kamera dari satu fokus ke fokus lain mengalir mulus seperti air, tanpa berhenti mendadak yang kaku.
- Jika dua waypoint berurutan bernilai sama (misal `[40, 1.0, 0, 0, 0]` lalu `[90, 1.0, 0, 0, 0]`), tangen otomatis bernilai `0` sehingga **kamera diam sempurna (100% tenang, nol getaran/shake)**.

### B. 4 Pola Gerak Kamera yang Mengikuti Konten

| Pola Kamera | Cara Kerja (`splineAt` Waypoints) | Skenario Penggunaan | Kapan Dipakai |
|---|---|---|---|
| **1. Calm Full View (Diam Tenang)** | `[f0, 1.0, 0, 0, 0] -> [f1, 1.0, 0, 0, 0]` | Tampilan utuh kartu atau pemutar media | Saat penonton perlu melihat keseluruhan antarmuka/komposisi dengan jelas dan tenang. |
| **2. Zoom-Follow Typing (Zoom Mengikuti Ketikan)** | Kamera mulai dari `1.0x`, lalu saat `TypeText` mulai mengetik di koordinat `(wx, wy)`, kamera zoom ke `1.6x–1.88x` dan menggeser `tx` mengikuti laju kursor ketikan dari kiri ke kanan, lalu kembali ke `1.0x`. | Gelembung percakapan chat & pengetikan caption di atas kartu | Saat menampilkan pengetikan prompt, kode, chat, search bar, atau form input. |
| **3. Follow-Cursor & Click Zoom** | Kursor `<AnimatedCursor />` bergerak melintasi layar menuju tombol/tab; kamera bergeser halus mengikuti kursor (`scale: 1.0 -> 1.35`), kursor menekan tombol (ripple + button scale `0.92`), lalu kamera membuka hasil klik. | Interaksi klik tombol aksi utama (`Publish` / `Post`) | Saat mendemonstrasikan interaksi produk, klik tombol CTA, atau berpindah tab. |
| **4. Continuous Wide-Canvas Glide** | Kanvas dibuat lebar (misal `width: 3000px`), lalu kamera bergeser mulus dari kiri ke kanan (`tx: 0 -> -1100, scale: 1.0 -> 1.18`) melewati beberapa window yang muncul berurutan dengan `springAt`. | Eksplorasi multi-window di atas kanvas desktop | Saat menampilkan tahapan workflow, multi-window showcase, atau perbandingan fitur. |

---

## 3. Empat Teknik Transisi Seamless Antar-Scene (Seakan Tidak Berpindah Scene)

### 1. Shared-Element Match-Cut Morph
- **Cara Kerja:** Satu objek kunci di akhir Scene A (misalnya kata judul, avatar lingkaran, atau kartu utama) ditempatkan pada posisi layar `(x, y, size)` yang **identik** pada frame pertama Scene B.
- Di awal Scene B, objek tersebut langsung mengecil/bergeser mulus menggunakan `splineAt` atau `easeOutExpo` ke posisi barunya (misalnya dari tengah layar pindah menjadi header di pojok kiri atas atau avatar di atas panel sheet), sementara elemen baru Scene B tumbuh di sekitarnya.
- **Efek ke Penonton:** Terasa seperti objek yang sama sedang bertransformasi di dalam satu scene tanpa ada potongan video.

### 2. Synchronized Whip-Glide Overlap (Overlap 10 Frame)
- **Cara Kerja:** Scene A dan Scene B dibuat **overlap selama 10–14 frame**.
- Pada frame overlap tersebut, Scene A bergeser keluar dengan `exitX = -ip(frame, [t0, t1], [0, 1], easeInOutSmooth) * width`, dan pada saat yang sama persis Scene B masuk dari sisi kanan dengan `enterX = (1 - ip(frame, [t0, t1], [0, 1], easeInOutSmooth)) * width`.
- **Efek ke Penonton:** Kamera terasa sekadar bergeser ke sebelah kanan di atas satu meja kerja yang sama.

### 3. Camera Zoom-Portal
- **Cara Kerja:** Di 12 frame terakhir Scene A, kamera melakukan zoom-in dipercepat (`scale: 1.0 -> 1.85` dengan `Easing.inOut(Easing.cubic)`) tepat ke arah objek/ikon di tengah disertai *soft radial glow*, lalu Scene B dimulai dengan `enterScale = ip(f, [0, 10], [1.16, 1.0], easeOutExpo)`.
- **Efek ke Penonton:** Penonton merasa masuk menembus objek tersebut langsung ke ruang berikutnya.

### 4. Shared Backdrop & Spring Sheet Handoff
- **Cara Kerja:** Latar belakang tetap sama di kedua scene (hanya tingkat blur atau kecerahan yang berubah halus dengan `easeOutExpo`), sementara konten lama meredup dan kartu konten baru meluncur naik dari bawah menggunakan `springAt`.
