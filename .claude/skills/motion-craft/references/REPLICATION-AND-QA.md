# After Effects to Remotion Reference, 100% Replication Mode, & QA Standards

Dokumen teknis untuk **Pemetaan Konsep After Effects ke Remotion**, **Prosedur Mode Replikasi 100% (`SSIM` / `PSNR`)**, dan **Standar Quality Assurance (QA)** sebelum video diserahkan.

---

## 1. Terjemahan Istilah After Effects ke Remotion

Berpikirlah dengan presisi artist After Effects, lalu terjemahkan ke arsitektur Remotion:

| Konsep After Effects | Implementasi di Remotion (`motion-craft`) |
|---|---|
| **Composition / Precomp** | `<Composition />` di `Root.tsx`, atau komponen scene yang dibungkus `<SeamlessSceneShell />` |
| **Layer & In/Out Timeline** | `<AbsoluteFill />` dengan `<Sequence from={...} durationInFrames={...} />` |
| **Keyframe Linear / Clamped** | `ip(frame, [f0, f1], [v0, v1], easing)` (`interpolate` dengan clamp kiri & kanan) |
| **Graph Editor / Easy Ease** | `easeOutExpo` (`Easing.bezier(0.16, 1, 0.3, 1)`), `easeInOutSmooth` (`Easing.bezier(0.45, 0, 0.15, 1)`), `springAt()` |
| **Smooth Camera Rig & Null Object** | `splineAt(frame, CAM)` (C1 Catmull-Rom / Cubic Hermite Spline) di dalam `<CameraRig />` |
| **Overlapping Action / Follow-Through** | `staggeredSpringAt(frame, baseStart, layerIndex)` |
| **Subtle Wiggle / Breathing Hold** | `microBob(frame, index, amplitude, speed)` (fase berbeda tiap elemen saat hold) |
| **Motion Blur (Shutter Angle)** | `splineVelocityAt(frame, CAM)` pada `<CameraRig enableVelocityBlur />` |
| **Camera Depth / Rack Focus** | `<CameraRig enableRackFocusSpotlight />` + `<ParallaxLayer depth="background" \| "midground" \| "foreground" />` |
| **Shape Layer & Trim Paths** | SVG inline dengan `strokeDasharray` & `strokeDashoffset` (`<CustomSVGIcon />`) |
| **Track Matte / Mask Reveal** | CSS `clip-path`, `overflow: 'hidden'`, atau SVG `<mask>` |
| **Text Animator (Per-Char)** | `<TypeText humanizeCadence />` (ketikan per karakter) & `<FlyText />` (spring fly-in per karakter) |
| **Bottom Subtitle / Caption Track** | `<BottomSubtitleBar words={...} />` di ruang layar bawah (*screen-space*) |
| **Render Queue** | `npx remotion render <CompId> out/v1.mp4` |

---

## 2. Mode Replikasi 100% (Frame-Exact Reference Cloning)

### Pemicu
Aktif ketika user memberikan video referensi dan meminta hasil yang **identik** (*"100% sama"*, *"persis"*, *"clone"*, *"replikasi"*).
*(Jika user hanya meminta "terinspirasi" atau "gaya mirip", ambil prinsip gerak dan gayanya saja, bukan pikselnya).*

### Prosedur Teknis 7 Langkah

1. **Bedah Spesifikasi Teknis (`ffprobe`):**
   Ambil resolusi, fps, durasi total frame, codec, dan stream audio dari video referensi:
   ```bash
   ffprobe -v error -show_streams -show_format ref.mp4
   ```
2. **Ekstrak Frame Referensi & Deteksi Scene Cut (`ffmpeg`):**
   ```bash
   mkdir -p frames/ref
   ffmpeg -i ref.mp4 -fps_mode passthrough frames/ref/%05d.png
   ```
3. **Inventaris Elemen & Koordinat per Frame:**
   Catat frame mulai/selesai, posisi `(x, y)`, ukuran `(w, h)`, rotasi, opacity, sampel warna hex piksel asli (bukan tebakan mata), ukuran font, radius sudut, dan bayangan.
4. **Rekonstruksi Kurva Kamera C1 Spline (`splineAt`):**
   Ukur koordinat elemen pada frame-frame kunci, lalu susun array waypoint `[frame, scale, tx, ty, rotDeg]` di `splineAt(frame, CAM)` hingga lintasan gerak menempel frame-ke-frame.
5. **Bangun di Remotion:**
   Gunakan `width`, `height`, `fps`, dan `durationInFrames` yang **sama persis** dengan video referensi.
6. **Verifikasi Kuantitatif (`SSIM` & `PSNR`) dan Visual Diff:**
   ```bash
   npx remotion render <CompId> out/video.mp4
   ffmpeg -i out/video.mp4 -i ref.mp4 -lavfi "[0:v][1:v]ssim=stats_file=ssim.log" -f null -
   ffmpeg -i out/video.mp4 -i ref.mp4 -lavfi "[0:v][1:v]psnr=stats_file=psnr.log" -f null -
   ffmpeg -i out/video.mp4 -i ref.mp4 -filter_complex "[0:v][1:v]blend=all_mode=difference" diff.mp4
   ```
   Cari frame dengan skor terendah di `ssim.log`, perbaiki koordinat/easing/warnanya, lalu render ulang sampai selisih mendekati nol (untuk elemen vektor/UI, target `SSIM` per frame mendekati `1.0`).
7. **Laporan Jujur:**
   Sertakan skor rata-rata dan minimum `SSIM` serta `PSNR`, plus catatan jujur bila ada aset eksternal (foto/font berbayar) yang diganti atas persetujuan user.

---

## 3. Daftar Periksa QA Sebelum Serah (Final Delivery Gate)

1. **Hierarki Konten vs Subtitle:**
   - Konten visual mengisi 80–85% panggung tengah dengan detail lengkap (`<ChatAppShell />`, `<MacDesktopChrome />`, diagram, atau kartu interaktif).
   - Subtitle penjelasan narator berada rapi di bawah layar (`<BottomSubtitleBar />`, `22px–28px`) dan tidak pernah menutupi elemen penting di tengah.
2. **Kamera C1 Spline & 7 Editing Humanizers:**
   - Kamera bebas getaran/shake (`0` pelanggaran di `scripts/lint.mjs`).
   - Kamera tenang (`1.0x`) saat menampilkan konteks penuh, dan melakukan zoom halus (`splineAt` dengan 3-frame anticipation) saat mengikuti ketikan `<TypeText />` atau kursor `<AnimatedCursor />`.
   - Semua waypoint kamera lolos `node scripts/inspect-motion.mjs` (tidak ada zoom `> 2.6x` atau elemen keluar safe-zone).
3. **Transisi Seamless Antar-Scene:**
   - Scrub 5 frame sebelum dan sesudah setiap pergantian scene (`out/qa-stills/`): perpindahan mengalir mulus (`whip-glide-left` overlap 10 frame, `portal-zoom-in`, `spring-sheet-up`, atau `SharedElementMorph`).
4. **Nol Emoji & Determinisme Remotion:**
   - Lulus `node scripts/lint.mjs src` dengan `status: PASS`.
5. **Kualitas Audio & Sinkronisasi J-Cut:**
   - Tidak ada keheningan mati (`ffmpeg -i out/v1.mp4 -af silencedetect=n=-50dB:d=0.5 -f null -`).
   - Tidak ada frame beku yang tidak disengaja (`ffmpeg -i out/v1.mp4 -vf "freezedetect=n=-60dB:d=0.5" -an -f null -`).
   - Level terintegrasi sekitar **-14 LUFS** dengan true peak maksimal **-1 dBTP**.
