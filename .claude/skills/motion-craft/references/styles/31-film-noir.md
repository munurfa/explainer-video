# Gaya #31: Film Noir (`film-noir`)

> **Panduan Art Direction & Spesifikasi Teknis Lengkap untuk Remotion**
> File ini adalah spesifikasi mendalam untuk **Gaya #31 (Film Noir)**. Saat menggunakan gaya ini, patuhi seluruh aturan palet, tipografi, bahasa bentuk, kamera C1 spline, serta SFX & Backsound di bawah ini.

---

## 1. Identitas Visual & Konteks Penggunaan

- **ID & Slug Gaya:** `#31` — `film-noir`
- **File Referensi:** `references/styles/31-film-noir.md`
- **Cocok Untuk Topik & Industri:** misteri, kriminal, kisah nyata, investigasi, parfum, mewah gelap.
- **Kata Kunci Pemicu di Brief:** `misteri`, `kriminal`, `kisah nyata`, `investigasi`, `parfum`, `mewah gelap`
- **Karakter & DNA Visual Asli:**
  hitam putih kontras tinggi dengan satu aksen merah #B3171E. Bodoni Moda (judul), Libre Franklin (kecil). Bayangan kisi jendela, asap, hujan dari partikel terhitung, grain film, vignette, bingkai miring.
- **Prinsip Utama Panggung (85% Konten vs 15% Subtitle):**
  - **85% Area Tengah Layar** wajib menampilkan visual konten utama yang dirancang dengan bahasa bentuk **Film Noir** (replika antarmuka/aplikasi, ilustrasi SVG prosedural, diagram, terminal, atau kartu poster).
  - **15% Area Bawah Layar** khusus untuk `<BottomSubtitleBar />` (default `useSafeZone()`: 16:9 `bottom` 6% ukuran `26px–28px`; 9:16 `bottom` 422px ukuran 44px, judul y >= 288px; teks bersih dengan *drop-shadow* halus tanpa background kotak/pill).

---

## 2. Sistem Palet Warna & Proporsi Komposisi

Gunakan aturan proporsi **60% Dominan (Latar) – 20% Permukaan Kartu – 10% Tinta/Teks – 7% Aksen Primer – 3% Aksen Sekunder**:

| Peran Warna | Token di `stylePreset.palette` | Kode Hex | Proporsi Layar | Aturan Pemakaian & Kontras |
|---|---|---|---|---|
| **Background Kanvas Utama** | `palette.bg` | `#0A0A0A` | **60%** | Latar belakang utama kanvas dan pola `<ProceduralBackground />` (`diagonal-construct`). |
| **Permukaan Kartu / Window UI** | `palette.surface` | `#1C1C1C` | **20%** | Permukaan kartu utama, jendela aplikasi/browser/terminal, atau lapisan kertas. |
| **Tinta Utama / Teks Primer** | `palette.ink` | `#F2F0EB` | **10%** | Teks judul utama, garis konstruksi, border struktural, dan elemen bacaan utama. |
| **Teks Sekunder / Muted** | `palette.muted` | `#7A7873` | **—** | Keterangan waktu, koordinat, label sumbu grafik, dan garis grid pendukung. |
| **Aksen Tajam Primer** | `palette.accent` | `#B3171E` | **7%** | Sorotan fokus utama, tombol aksi yang diklik kursor, garis grafik aktif, dan kata yang sedang diucapkan. |
| **Aksen Pendukung Sekunder** | `palette.accentSecondary` | `#FFFFFF` | **3%** | Status selesai (100%), indikator sekunder, atau kontras komplementer. |

---

## 3. Sistem Tipografi & Hierarki Skala

Muat font menggunakan `@remotion/google-fonts` sebelum frame pertama dirender:

| Peran Tipografi | Keluarga Font (`@remotion/google-fonts`) | Bobot (`fontWeight`) | Ukuran 1080p (16:9) | Ukuran Vertikal (9:16) | Tracking & Line-Height |
|---|---|---|---|---|---|
| **Display Headline (di dalam Kartu/Visual)** | `Bodoni Moda` | `800` | `68px – 92px` | `56px – 78px` | `0.04em (UPPERCASE)`, `lineHeight: 1.05` |
| **Judul Window / Sub-Heading** | `Bodoni Moda` | `700` | `32px – 44px` | `28px – 38px` | `-0.01em`, `lineHeight: 1.15` |
| **Teks Ketikan Interaktif (`<TypeText />`)** | `Libre Franklin` | `500 – 600` | `22px – 28px` | `22px – 26px` | `0em`, `lineHeight: 1.25` |
| **Kode, Koordinat, & Angka Metrik** | `IBM Plex Mono` | `600 – 700` | `16px – 22px` | `16px – 20px` | `0.05em`, `lineHeight: 1.4` |
| **Subtitle Narator (`<BottomSubtitleBar />`)** | `Libre Franklin` | `500 / 700` | `25px` | `26px` | `0em`, 1 baris bersih di bawah layar |

---

## 4. Bahasa Bentuk, Tekstur, & Komponen Visual Autentik

- **Radius Sudut (`borderRadius`):** `0px`
- **Tebal Garis Struktural (`strokeWidth`):** `1.5px`
- **Karakter Bayangan:** `Hard Offset Shadow (10px 10px 0px #F2F0EB) tanpa blur`
- **Pola Latar Prosedural (`bgPattern`):** `diagonal-construct`
- **Frame Rate Efektif (`quantizedFps`):** `Full Native FPS (30/45/60 fps mulus)`
- **Aturan Visual Autentik & Anti-Slop:**
  1. **Jangan membuat background teks/pill yang tidak perlu:** Judul, sub-judul, dan keterangan tampil langsung di atas permukaan kartu atau latar tanpa dibungkus kotak/pill warna-warni.
  2. **Jangan membuat titik bulat (`• teks`) atau ikon dekoratif sampah:** Dilarang menaruh lingkaran kecil di samping teks atau memakai ikon petir/sparkle/bohlam.
  3. **Wajib Logo Brand Asli (`<BrandLogo />`):** Bila konten menyebut brand/software/framework (Claude, Remotion, Adobe After Effects, Premiere Pro, React, TypeScript, GitHub, VS Code, dll.), gunakan `<BrandLogo brand="..." />` atau jalankan `node scripts/fetch-brand-logo.mjs`.
  4. **Replika Aplikasi Asli:** Gunakan `<AuthenticTerminalWindow />`, `<AuthenticBrowserWindow />`, `<ChatAppShell />`, atau `<MacDesktopChrome />` yang disesuaikan dengan palet **Film Noir**.

---

## 5. Koreografi Gerak, Kurva Easing, & 7 Editing Humanizers

- **Karakter Gerak Spesifik Gaya #31:**
  bayangan menyapu wajah atau teks, teks muncul lewat cahaya yang bergeser, potongan cepat saat klimaks. Kamera: push-in lambat, dutch angle, tracking sepanjang lorong.
- **Preset Fisika Spring (`editorialSettle`):**
  - `damping: 14`, `stiffness: 150`, `mass: 0.72` — *Cepat, presisi, dan mengendap mulus tanpa pantulan liar*.
- **Overlapping Action (Inersia 3 Lapis):**
  - Gunakan `staggeredSpringAt(frame, startFrame, layerIndex, fps)`:
    - `layerIndex = 0`: Wadah kartu / window utama masuk terlebih dahulu.
    - `layerIndex = 1` (+3 frame): Judul, grafik, atau isi utama di dalam kartu.
    - `layerIndex = 2` (+6 frame): Elemen sekunder / komponen pendukung.
- **Humanized Typing & Fitts-Law Cursor:**
  - Ketikan memakai `<TypeText humanizeCadence enableTypingSfx typingVariant="mechanical" />`.
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

- **Tempo Dasar:** **78 BPM** (`23 frame/beat` pada 30fps, `35 frame/beat` pada 45fps).
- **Rekomendasi Lagu Backsound Prosedural (`synth-audio.mjs --bgm <Kode>`):**
  - **Pilihan Klasik:** **`B11`** (Alternatif: `B14`, `B10`)
  - **Pilihan Modern Baru (Multi-Chord):** **B37 (Cinematic Hybrid Launch, 96 BPM)**
- **Rekomendasi Lagu Rekaman Studio (`fetch-music.mjs --song <Kode>`):**
  - **M20 (Other World) / M18 (Spirit in the Woods)**
- **Pemetaan SFX Event-Driven (Hanya Berbunyi Saat Animasi Berjalan):**
  - **Transisi Scene:** `transition-cinematic.wav & impact-soft.wav` (dipicu otomatis oleh `<SeamlessSceneShell />`)
  - **Animasi Mengetik:** `audio/sfx/typing-loop.wav` (dipicu otomatis oleh `<TypeText />`)
  - **Animasi Loading / Progress Bar:** `audio/sfx/progress-loop.wav` + `audio/sfx/confirm-chime.wav` saat 100% (dipicu otomatis oleh `<AnimatedProgressBar />`)
  - **Hover & Klik Kursor:** `audio/sfx/hover-rollover.wav` + `audio/sfx/click.wav` (dipicu otomatis oleh `<AnimatedCursor />`)
  - **Pack Tematik Pendukung:** `S-SINEMA` & `S-UMUM`

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

const STYLE = getStyleById(31); // Gaya #31: Film Noir

export const SceneStyle31Example: React.FC<{ durationInFrames: number; words: WordItem[] }> = ({
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
            tabTitle="Film Noir — Studio Workspace"
            url="localhost:3000/film-noir"
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
                    text="npx remotion render MainVideo out/film-noir.mp4"
                    start={20}
                    cps={1.6}
                    size={22}
                    color={STYLE.palette.ink}
                    family={STYLE.typography.mono}
                    typingVariant="mechanical"
                    enableTypingSfx
                  />
                </div>
                <div style={{ padding: '12px 24px', borderRadius: STYLE.shape.borderRadius, backgroundColor: STYLE.palette.accent, color: '#FFFFFF', fontFamily: STYLE.typography.heading, fontWeight: 700, transform: `scale(${buttonScale.toFixed(3)})` }}>
                  {isClicked ? 'Rendering...' : 'Render'}
                </div>
              </div>

              <FlyText
                text="FILM NOIR"
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

## 9. Larangan Keras (Anti-Slop Traps Khusus Gaya #31)

- **Yang Wajib Dihindari pada Gaya Film Noir:**
  B/W datar tanpa kontras, hujan klise tanpa fungsi.
- **Jangan pernah** menaruh subtitle narasi besar-besar di tengah layar (wajib gunakan `<BottomSubtitleBar />` di bawah layar).
- **Jangan pernah** membuat kotak/pill background di belakang judul teks biasa atau menambahkan titik bulat `• teks` di samping kalimat.
- **Jangan pernah** membunyikan SFX tanpa animasi yang sesuai di layar.
