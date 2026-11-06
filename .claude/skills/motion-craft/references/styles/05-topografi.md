# Gaya #05: Topografi (`topografi`)

> **Panduan Art Direction & Spesifikasi Teknis Lengkap untuk Remotion**
> File ini adalah spesifikasi mendalam untuk **Gaya #5 (Topografi)**. Saat menggunakan gaya ini, patuhi seluruh aturan palet, tipografi, bahasa bentuk, kamera C1 spline, serta SFX & Backsound di bawah ini.

---

## 1. Identitas Visual & Konteks Penggunaan

- **ID & Slug Gaya:** `#5` — `topografi`
- **File Referensi:** `references/styles/05-topografi.md`
- **Cocok Untuk Topik & Industri:** geografi, perjalanan, lingkungan, pendakian, logistik, data spasial, sains bumi.
- **Kata Kunci Pemicu di Brief:** `geografi`, `perjalanan`, `lingkungan`, `pendakian`, `logistik`, `data spasial`, `sains bumi`
- **Karakter & DNA Visual Asli:**
  kertas #EFE8D6, kontur #7B4B2A, hijau #2F5D50, biru air #3E7CB1, rute merah #D1432B. EB Garamond italik (label), DM Mono (koordinat). Garis kontur dari noise (marching squares), grid koordinat, kompas, penanda elevasi, lipatan kertas peta.
- **Prinsip Utama Panggung (85% Konten vs 15% Subtitle):**
  - **85% Area Tengah Layar** wajib menampilkan visual konten utama yang dirancang dengan bahasa bentuk **Topografi** (replika antarmuka/aplikasi, ilustrasi SVG prosedural, diagram, terminal, atau kartu poster).
  - **15% Area Bawah Layar** khusus untuk `<BottomSubtitleBar />` (default `useSafeZone()`: 16:9 `bottom` 6% ukuran `26px–28px`; 9:16 `bottom` 422px ukuran 44px, judul y >= 288px; teks bersih dengan *drop-shadow* halus tanpa background kotak/pill).

---

## 2. Sistem Palet Warna & Proporsi Komposisi

Gunakan aturan proporsi **60% Dominan (Latar) – 20% Permukaan Kartu – 10% Tinta/Teks – 7% Aksen Primer – 3% Aksen Sekunder**:

| Peran Warna | Token di `stylePreset.palette` | Kode Hex | Proporsi Layar | Aturan Pemakaian & Kontras |
|---|---|---|---|---|
| **Background Kanvas Utama** | `palette.bg` | `#EFE8D6` | **60%** | Latar belakang utama kanvas dan pola `<ProceduralBackground />` (`topographic-contours`). |
| **Permukaan Kartu / Window UI** | `palette.surface` | `#E4DBC4` | **20%** | Permukaan kartu utama, jendela aplikasi/browser/terminal, atau lapisan kertas. |
| **Tinta Utama / Teks Primer** | `palette.ink` | `#2F5D50` | **10%** | Teks judul utama, garis konstruksi, border struktural, dan elemen bacaan utama. |
| **Teks Sekunder / Muted** | `palette.muted` | `#7B4B2A` | **—** | Keterangan waktu, koordinat, label sumbu grafik, dan garis grid pendukung. |
| **Aksen Tajam Primer** | `palette.accent` | `#D1432B` | **7%** | Sorotan fokus utama, tombol aksi yang diklik kursor, garis grafik aktif, dan kata yang sedang diucapkan. |
| **Aksen Pendukung Sekunder** | `palette.accentSecondary` | `#3E7CB1` | **3%** | Status selesai (100%), indikator sekunder, atau kontras komplementer. |

---

## 3. Sistem Tipografi & Hierarki Skala

Muat font menggunakan `@remotion/google-fonts` sebelum frame pertama dirender:

| Peran Tipografi | Keluarga Font (`@remotion/google-fonts`) | Bobot (`fontWeight`) | Ukuran 1080p (16:9) | Ukuran Vertikal (9:16) | Tracking & Line-Height |
|---|---|---|---|---|---|
| **Display Headline (di dalam Kartu/Visual)** | `EB Garamond` | `600` | `68px – 92px` | `56px – 78px` | `-0.02em`, `lineHeight: 1.05` |
| **Judul Window / Sub-Heading** | `EB Garamond` | `700` | `32px – 44px` | `28px – 38px` | `-0.01em`, `lineHeight: 1.15` |
| **Teks Ketikan Interaktif (`<TypeText />`)** | `DM Mono` | `500 – 600` | `22px – 28px` | `22px – 26px` | `0em`, `lineHeight: 1.25` |
| **Kode, Koordinat, & Angka Metrik** | `DM Mono` | `600 – 700` | `16px – 22px` | `16px – 20px` | `0.05em`, `lineHeight: 1.4` |
| **Subtitle Narator (`<BottomSubtitleBar />`)** | `DM Mono` | `500 / 700` | `25px` | `26px` | `0em`, 1 baris bersih di bawah layar |

---

## 4. Bahasa Bentuk, Tekstur, & Komponen Visual Autentik

- **Radius Sudut (`borderRadius`):** `2px`
- **Tebal Garis Struktural (`strokeWidth`):** `1.5px`
- **Karakter Bayangan:** `Soft Layered Elevation Shadow (0 24px 60px rgba(0,0,0,0.18))`
- **Pola Latar Prosedural (`bgPattern`):** `topographic-contours`
- **Frame Rate Efektif (`quantizedFps`):** `Full Native FPS (30/45/60 fps mulus)`
- **Aturan Visual Autentik & Anti-Slop:**
  1. **Jangan membuat background teks/pill yang tidak perlu:** Judul, sub-judul, dan keterangan tampil langsung di atas permukaan kartu atau latar tanpa dibungkus kotak/pill warna-warni.
  2. **Jangan membuat titik bulat (`• teks`) atau ikon dekoratif sampah:** Dilarang menaruh lingkaran kecil di samping teks atau memakai ikon petir/sparkle/bohlam.
  3. **Wajib Logo Brand Asli (`<BrandLogo />`):** Bila konten menyebut brand/software/framework (Claude, Remotion, Adobe After Effects, Premiere Pro, React, TypeScript, GitHub, VS Code, dll.), gunakan `<BrandLogo brand="..." />` atau jalankan `node scripts/fetch-brand-logo.mjs`.
  4. **Replika Aplikasi Asli:** Gunakan `<AuthenticTerminalWindow />`, `<AuthenticBrowserWindow />`, `<ChatAppShell />`, atau `<MacDesktopChrome />` yang disesuaikan dengan palet **Topografi**.

---

## 5. Koreografi Gerak, Kurva Easing, & 7 Editing Humanizers

- **Karakter Gerak Spesifik Gaya #5:**
  kontur tumbuh dari puncak ke luar, rute digambar draw-on, angka elevasi berdetak. Kamera: terbang di atas peta dengan kemiringan perspektif, turun ke relief 3D yang diekstrusi, rotasi pelan.
- **Preset Fisika Spring (`editorialSettle`):**
  - `damping: 14`, `stiffness: 150`, `mass: 0.72` — *Cepat, presisi, dan mengendap mulus tanpa pantulan liar*.
- **Overlapping Action (Inersia 3 Lapis):**
  - Gunakan `staggeredSpringAt(frame, startFrame, layerIndex, fps)`:
    - `layerIndex = 0`: Wadah kartu / window utama masuk terlebih dahulu.
    - `layerIndex = 1` (+3 frame): Judul, grafik, atau isi utama di dalam kartu.
    - `layerIndex = 2` (+6 frame): Elemen sekunder / komponen pendukung.
- **Humanized Typing & Fitts-Law Cursor:**
  - Ketikan memakai `<TypeText humanizeCadence enableTypingSfx typingVariant="soft" />`.
  - Kursor memakai `<AnimatedCursor humanizeFittsLaw enableClickSfx />` (otomatis *overshoot* `4.5px`, *hover delay* 5 frame + suara `hover-rollover.wav`, lalu menekan tombol + suara `click.wav`).
- **Phase-Shifted Micro-Bobbing saat Hold:**
  - Saat kamera sedang diam (`1.0x`), gunakan `microBob(frame, idx, 2.8, 0.2)` pada elemen pendukung agar layar tetap hidup tanpa perlu menggerakkan kamera terus-menerus.

---

## 6. Arsitektur Kamera C1 Spline (`splineAt`) & Transisi Seamless

**100% BEBAS CAMERA SHAKE!** Kamera tenang saat menampilkan komposisi utuh, dan bergerak menggunakan **Catmull-Rom / Cubic Hermite C1 Spline (`splineAt(frame, CAM)`)** untuk mengikuti ketikan atau kursor:

| Urutan Scene | Peran Pacing Asimetris | Perilaku Kamera C1 Spline (`CAM: [frame, scale, tx, ty, rotDeg]`) | Mode Transisi Keluar (`<SeamlessSceneShell />`) |
|---|---|---|---|
| **Scene 1 (Hook & Typing)** | *Establish (Slow-Medium)* | Mulai `1.45x` fokus di area ketikan `<TypeText />` -> bergeser mengikuti panjang kalimat -> pull-out halus ke `1.0x` memperlihatkan UI utuh. | `portal-zoom-in` (overlap 12f + `transition-whoosh-soft.wav`) |
| **Scene 2 (Cursor Click & Action)** | *Rapid Action (Fast)* | Diam tenang `1.0x` -> *3-frame anticipation pullback* (`0.982x`) -> zoom `1.38x` mengikuti `<AnimatedCursor />` mengklik tombol & `<AnimatedProgressBar />`. | `whip-glide-left` (overlap 12f + `transition-swoosh.wav`) |
| **Scene 3 (Wide Canvas / Proof)** | *Workflow Glide (Medium)* | Menyusuri kanvas lebar dari kiri ke kanan (`tx: 0 -> -880, scale: 1.0 -> 1.14`) melewati window/grafik yang pop-in berurutan. | `spring-sheet-up` (overlap 12f + `transition-maximize.wav`) |
| **Scene 4 (Climax & Takeaway)** | *Breathe Hold (Slow)* | Masuk dari `1.22x -> 1.0x` (`easeOutExpo`) lalu **diam tenang stabil di `1.0x`** agar penonton membaca kesimpulan/CTA dengan jelas. | `none` (Clean Finale Hold) |

---

## 7. Desain Suara: Pilihan Lagu Backsound & Cue SFX Event-Driven

- **Tempo Dasar:** **70 BPM** (`26 frame/beat` pada 30fps, `39 frame/beat` pada 45fps).
- **Rekomendasi Lagu Backsound Prosedural (`synth-audio.mjs --bgm <Kode>`):**
  - **Pilihan Klasik:** **`B10`** (Alternatif: `B19`)
  - **Pilihan Modern Baru (Multi-Chord):** **B27 (Vox Documentary Piano & Pulse, 104 BPM)**
- **Rekomendasi Lagu Rekaman Studio (`fetch-music.mjs --song <Kode>`):**
  - **M15 (Pilates and Yoga) / M18 (Spirit in the Woods)**
- **Pemetaan SFX Event-Driven (Hanya Berbunyi Saat Animasi Berjalan):**
  - **Transisi Scene:** `transition-whoosh-soft.wav & transition-swipe.wav` (dipicu otomatis oleh `<SeamlessSceneShell />`)
  - **Animasi Mengetik:** `audio/sfx/typing-soft.wav` (dipicu otomatis oleh `<TypeText />`)
  - **Animasi Loading / Progress Bar:** `audio/sfx/progress-loop.wav` + `audio/sfx/confirm-chime.wav` saat 100% (dipicu otomatis oleh `<AnimatedProgressBar />`)
  - **Hover & Klik Kursor:** `audio/sfx/hover-rollover.wav` + `audio/sfx/click.wav` (dipicu otomatis oleh `<AnimatedCursor />`)
  - **Pack Tematik Pendukung:** `S-KERTAS` & `S-UMUM`

---

## 8. Contoh Implementasi Kode Remotion (TSX)

```tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CameraRig } from '../antislop/components/CameraRig';
import { AnimatedCursor, useCursorTargetState } from '../antislop/components/AnimatedCursor';
import { AnimatedProgressBar, BottomSubtitleBar, FlyText, TypeText, WordItem } from '../antislop/components/KineticWords';
import { AuthenticBrowserWindow } from '../antislop/components/LivedInUIShells';
import { BrandLogo } from '../antislop/components/BrandLogos';
import { ProceduralBackground } from '../antislop/components/ProceduralBackground';
import { getStyleById } from '../antislop/theme/styles-catalog';

const STYLE = getStyleById(5); // Gaya #5: Topografi

export const SceneStyle05Example: React.FC<{ durationInFrames: number; words: WordItem[] }> = ({
  durationInFrames,
  words,
}) => {
  const frame = useCurrentFrame();
  const clickFrame = 68;
  const { isClicked, buttonScale } = useCursorTargetState(frame, clickFrame, 6);

  // Waypoint C1 Spline Kamera: Tenang -> 3f Anticipation -> Fokus Ketikan & Klik -> Kembali Tenang 1.0x
  const CAM: [number, number, number, number, number][] = [
    [0, 1.0, 0, 0, 0],
    [18, 0.985, 12, 8, 0],
    [32, 1.36, -240, -60, 0],
    [72, 1.36, -310, -60, 0],
    [96, 1.0, 0, 0, 0],
    [durationInFrames, 1.0, 0, 0, 0],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: STYLE.palette.bg, overflow: 'hidden' }}>
      <ProceduralBackground stylePreset={STYLE} driftSpeed={0.35} />

      <CameraRig waypoints={CAM} durationInFrames={durationInFrames} stylePreset={STYLE} transformOrigin="0px 0px">
        <div style={{ position: 'absolute', left: 380, top: 140 }}>
          <AuthenticBrowserWindow
            tabTitle="Topografi — Studio Workspace"
            url="localhost:3000/topografi"
            brandFavicon="remotion"
            width={1160}
            height={700}
          >
            <div style={{ padding: 48, backgroundColor: STYLE.palette.surface, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <BrandLogo brand="claude" size={36} />
                  <BrandLogo brand="remotion" size={36} />
                  <TypeText
                    text="npx remotion render MainVideo out/topografi.mp4"
                    start={20}
                    cps={1.6}
                    size={22}
                    color={STYLE.palette.ink}
                    family={STYLE.typography.mono}
                    typingVariant="soft"
                    enableTypingSfx
                  />
                </div>
                <div style={{ padding: '12px 24px', borderRadius: STYLE.shape.borderRadius, backgroundColor: STYLE.palette.accent, color: '#FFFFFF', fontFamily: STYLE.typography.heading, fontWeight: 700, transform: `scale(${buttonScale.toFixed(3)})` }}>
                  {isClicked ? 'Rendering...' : 'Render'}
                </div>
              </div>

              <FlyText
                text="TOPOGRAFI"
                start={6}
                size={72}
                weight={STYLE.typography.headingWeight}
                family={STYLE.typography.heading}
                color={STYLE.palette.ink}
              />

              {isClicked && (
                <AnimatedProgressBar
                  label="Encoding 1080p MP4"
                  startFrame={clickFrame + 2}
                  endFrame={clickFrame + 40}
                  accentColor={STYLE.palette.accent}
                  textColor={STYLE.palette.ink}
                  monoFont={STYLE.typography.mono}
                  enableProgressSfx
                />
              )}
            </div>
          </AuthenticBrowserWindow>
        </div>

        <AnimatedCursor
          waypoints={[[36, 900, 600], [clickFrame, 1420, 210], [90, 1420, 210]]}
          clicks={[{ frame: clickFrame }]}
          humanizeFittsLaw
          enableClickSfx
          accentColor={STYLE.palette.accent}
        />
      </CameraRig>

      <BottomSubtitleBar words={words} stylePreset={STYLE} />
    </AbsoluteFill>
  );
};
```

---

## 9. Larangan Keras (Anti-Slop Traps Khusus Gaya #05)

- **Yang Wajib Dihindari pada Gaya Topografi:**
  foto satelit atau stok, kontur seragam tanpa noise.
- **Jangan pernah** menaruh subtitle narasi besar-besar di tengah layar (wajib gunakan `<BottomSubtitleBar />` di bawah layar).
- **Jangan pernah** membuat kotak/pill background di belakang judul teks biasa atau menambahkan titik bulat `• teks` di samping kalimat.
- **Jangan pernah** membunyikan SFX tanpa animasi yang sesuai di layar.
