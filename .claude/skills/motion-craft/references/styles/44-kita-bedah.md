# Gaya #44 — Kita Bedah (Bedah Anatomi Objek)

> Gaya proyek khusus, ditambahkan untuk video explainer Perumda Tirta Ayu / Tiray.
> Diturunkan dari analisis channel YouTube Kita Bedah (`style-kitabedah.md` di root proyek) dan disesuaikan dengan brand Tirta Ayu (`tiray-brand-kit`).
> **Gaya ini punya pengecualian resmi atas Aturan Keras 1 dan 2 di `SKILL.md`** (lihat §4.1). Pengecualian hanya berlaku saat gaya #44 dipilih.

---

## 1. Identitas Visual & Konteks Penggunaan

- **ID & Slug Gaya:** `#44` — `kita-bedah`
- **File Referensi:** `references/styles/44-kita-bedah.md`
- **Komponen Khusus:** `templates/components/Bedah3D.tsx` (panggung & objek 3D) + `templates/components/BedahOverlay.tsx` (header, counter, badge, callout, caption)
- **Dependensi wajib:** `npm i @remotion/three@<versi-remotion> three@0.169.0 @react-three/fiber@8.17.10 @types/three@0.169.0`. Render: `npx remotion render ... --gl=angle` (atau `chromiumOptions: { gl: 'angle' }` di `renderMedia`/`renderStill`/`selectComposition`).
- **Cocok Untuk Topik & Industri:** cara kerja benda sehari-hari, layanan publik (PDAM, listrik, jalan), infrastruktur, mitos vs fakta teknis, "kenapa X bisa Y", edukasi pelanggan.
- **Kata Kunci Pemicu di Brief:** `kita bedah`, `bedah`, `cara kerja`, `kok bisa`, `anatomi`, `cutaway`, `penampang`, `mitos`, `kenapa`
- **Karakter & DNA Visual:**
  Shorts vertikal 9:16, 55–75 detik, **satu kamera terus bergerak tanpa hard cut**. Satu objek nyata (pipa, katup, meteran, keran, jas hujan, motor) tampil sebagai **render 3D yang mendekati objek aslinya**: material PBR (kuningan mengilap, besi cor ber-epoxy, PVC doff, karet, kain berlipat), pencahayaan studio dengan bayangan lembut, outline gelap tipis, di set lantai beton + dinding plester berbintik. Objek itu **dibedah**: dibuka penampangnya (cutaway) atau diurai (exploded view) sampai mekanismenya terlihat. Di atasnya ada lapisan overlay yang tetap: header dengan kata kunci berwarna, sub-label mono, angka yang terus berdetak, badge status, callout bergaris penunjuk, dan caption karaoke di bawah.
- **Prinsip Panggung (9:16, 1080 × 1920):**

```
┌────────────────────────────────┐ y=0
│ HEADER (y 96–420)              │  judul + kata kunci, sub-label mono,
│                                │  angka live + badge status
├────────────────────────────────┤
│                                │
│ PANGGUNG OBJEK (y 420–1500)    │  hero objek + callout, ±60% layar
│                                │
├────────────────────────────────┤
│ CAPTION KARAOKE (y 1560–1720)  │  pill gelap, 3–5 kata (maks 7), kata aktif kuning
└────────────────────────────────┘ y=1920  (safe area bawah ±200px untuk UI Shorts)
```

- **Satu diagram terintegrasi:** seluruh penjelasan terjadi di **satu objek dalam satu ruang 3D yang kontinu**. Tidak ada scene terpisah, tidak ada potongan diagram baru. Kamera memperbesar satu bagian untuk menjelaskannya, lalu **mundur ke konteks utuh** sebelum pindah ke bagian berikutnya, supaya penonton selalu tahu posisinya di alur. Penanda posisi `<BedahStepper />` (`01 KATUP  02 ARUS`) di slot sub-label header menunjukkan bab aktif.

  Header dan caption **tidak ikut bergerak** bersama kamera (screen-space). Panggung objek adalah `<BedahStage />` full-frame (kanvas 3D di belakang header); header memudar ke `palette.bg` di atas render. Kamera 3D (`CamKey3D`) yang bergerak, bukan transform CSS `<CameraRig />`.

---

## 2. Sistem Palet Warna & Proporsi Komposisi

Palet = struktur Kita Bedah (krem netral + 1–2 warna hero) dengan warna resmi dari `tiray-brand-kit/brand-kit/02-warna/warna.json`.

| Peran Warna | Token `stylePreset.palette` | Hex | Proporsi | Aturan Pemakaian |
|---|---|---|---|---|
| **Kanvas / lingkungan** | `palette.bg` | `#F3F1EC` | **55%** | Latar krem netral, tanah, dinding. Header memudar ke warna ini |
| **Permukaan kartu** | `palette.surface` | `#FFFFFF` | **15%** | Kartu info, kartu hitung, kartu kontak, end card logo |
| **Tinta utama** | `palette.ink` | `#16243B` | **10%** | Judul, pill caption (alpha 0.82). Outline objek 3D memakai `OUTLINE #1D2129` tipis dari `Bedah3D.tsx` |
| **Teks sekunder** | `palette.muted` | `#44536B` | **—** | Sub-label mono, satuan, garis bantu |
| **Highlight (kata aktif, callout netral)** | `palette.accent` | `#FFC20E` (gold-300) | **7%** | Blok kata aktif di caption, pill callout netral. Teks di atasnya selalu `ink` |
| **Kata kunci judul & hero air** | `palette.accentSecondary` | `#244DA9` (blue-800) | **8%** | Kata kunci di header, air di dalam pipa, angka live |
| **Semantik masalah** | `BEDAH_SEMANTIC.problem` | `#D1432B` | **≤3%** | Callout bocor, udara terjebak, tekanan nol. Hanya untuk masalah |
| **Semantik solusi** | `BEDAH_SEMANTIC.solution` | `#1D7A32` (green-700) | **≤3%** | Callout "sudah normal", centang checklist |
| **Air (gradien)** | `BEDAH_SEMANTIC.water` / `BEDAH_MATERIALS.water` | `#9BD5EF → #244DA9` / 3D `#3D8FDB` opacity 0.62 | dalam objek | Isi pipa, kolom air, tetesan |
| **Permukaan potong (cutaway)** | `CUT_CAP` (`Bedah3D.tsx`) | `#EE9A72` | dalam objek | Warna flat salmon untuk "daging" benda yang terbelah, sama di semua bahan |

Catatan:
- Kita Bedah asli memakai **merah** untuk kata kunci judul. Untuk Tirta Ayu kata kunci memakai **blue-800** supaya merah tetap berarti "masalah". Kalau brief meminta merah, ganti `accentSecondary` ke `#D1432B` dan semantik masalah ke oranye `#E8590C`.
- Green-500 `#30B349` hanya untuk grafik, jangan untuk teks kecil (kontras 2,74).

---

## 3. Sistem Tipografi & Hierarki Skala (9:16)

| Peran | Font (`@remotion/google-fonts`) | Bobot | Ukuran 9:16 | Tracking & Line-Height |
|---|---|---|---|---|
| **Judul header** (1 frasa, ganti per bab) | `Poppins` | `800` | `68px – 84px` | `-0.02em`, `lineHeight: 1.05`, maks 2 baris |
| **Sub-label teknis** | `JetBrains Mono` | `700` | `24px – 28px` | `0.14em`, UPPERCASE |
| **Angka live / counter** | `JetBrains Mono` | `700` | `56px – 72px` | `0.02em`, `fontVariantNumeric: tabular-nums` |
| **Badge status** | `JetBrains Mono` | `700` | `22px – 24px` | `0.12em`, UPPERCASE |
| **Label callout** | `Poppins` | `700` | `26px – 30px` | `0.06em`, UPPERCASE |
| **Isi kartu info** | `Poppins` | `500 / 700` | `32px – 40px` | `lineHeight: 1.3` |
| **Caption karaoke** | `Poppins` | `700` | `46px – 54px` | `0em`, 1 baris, 3–5 kata |

**Aturan teks di layar (wajib):** setiap teks on-screen (judul header, sub-label, callout, badge, kartu, satu baris caption) **maks 7 kata**, dan **tampil terbaca penuh minimal 0,3 dtk per kata** (`holdFrames(text) = ceil(kata × 0,3 × fps)`; 4 kata = 36 frame @30fps). Durasi dihitung setelah animasi masuk selesai. `countWords()` tidak menghitung angka/tanda baca murni. `<CalloutPill />` memanggil `warnText()` dan mencetak `[BedahText]` di log render bila melanggar; `scripts/lint.mjs` (aturan `BEDAH_TEXT_BUDGET`) menggagalkan build untuk string literal > 7 kata atau `start`/`end` literal yang terlalu singkat.

Font Poppins adalah font utama brand Tirta Ayu (rekomendasi). Alternatif untuk teks panjang: `Plus Jakarta Sans`. Jangan mengetik ulang nama perusahaan: pakai `logotype-*.svg` dari brand kit.

---

## 4. Bahasa Bentuk, Tekstur, & Komponen Visual

> **Objek hero WAJIB 3D.** Referensi Kita Bedah adalah render 3D, bukan ilustrasi flat. Versi lama spesifikasi ini (SVG cel-shading, outline 4px) **sudah tidak berlaku** untuk objek hero. SVG hanya untuk overlay 2D (header, callout, caption, kartu).

### 4.0 Pipeline 3D (`templates/components/Bedah3D.tsx`)

| Unsur | Cara di referensi | Implementasi |
|---|---|---|
| **Panggung** | Set studio: lantai beton & dinding plester krem berbintik, bayangan lembut, kabut tipis ke `bg` | `<BedahStage set="floor-wall" bg={palette.bg} camera={CAM} frame={t}>` (cahaya hemisphere + key light ber-shadow + rim, environment `RoomEnvironment` untuk pantulan logam) |
| **Material** | Kuningan mengilap, besi cor biru, PVC abu doff, baja, karet hitam, kain nilon, kaca, air bening | Preset `BEDAH_MATERIALS` (`brass`, `castIronBlue`, `pvcGrey`, `steel`, `galvanized`, `rubber`, `fabricNylon`, `glass`, `water`, `concrete`, ...). Jangan ganti ke warna flat |
| **Outline** | Garis gelap tipis di siluet (toon line) | Otomatis di `<BMesh outline={0.012} />` (inverted hull). Baut/part kecil `0.006`. Benda transparan tanpa outline |
| **Geometri** | Proporsi & anatomi benda asli: flens + baut segi enam, roda katup berjari, bonnet, stem, register meter | `pipeGeometry` (dinding tebal, solid), `latheGeometry` (profil putar: badan katup, bonnet, meteran), `hexBoltGeometry`, primitif three.js (`TorusGeometry`, `CapsuleGeometry`, ...). Minimal 5 sub-bagian yang dikenali |
| **Cutaway** | Separuh cangkang hilang, permukaan potong salmon flat, mekanisme dalam (magnet, roda gigi, pintu katup) terlihat | `const plane = useCutPlane([0,0,-1], k)` lalu `<BMesh cut={[plane]} />`. Animasikan `constant` dari luar objek ke `0` selama 18–24 frame. Bagian dalam yang bergerak **tidak** diberi `cut` |
| **Exploded view** | Part terurai sepanjang satu sumbu dengan jarak sama | Animasikan `position` tiap `<BMesh>` dengan `ip()` + spring, urutan luar ke dalam |
| **Kamera** | Perspektif 3/4 dari atas: zoom ke satu bagian, diam saat menjelaskan, lalu mundur ke overview (§5.1), tanpa cut | `CamKey3D = [frame, px,py,pz, tx,ty,tz, fov]`, FOV 30–35 (16:9) / 40–46 (9:16). Interpolasi `splineAt` C1 |
| **Callout** | Pill kuning/merah/hijau + garis hitam tipis ke titik kuning kecil di objek | `projectToScreen([x,y,z], t, CAM, W, H)` sebagai `anchor` untuk `<CalloutPill />`. Callout dirender **setelah** `<BedahHeader />` agar tidak tertutup gradien header |
| **FX** | Hujan, percikan, arus air, gelembung | Instans `<BMesh>` kecil (capsule/sphere) dengan posisi deterministik dari `t` dan `createSeededRandom()` |

- **Radius sudut overlay:** kartu `20px`, badge dan callout `999px`, caption karaoke rounded-rect `fontSize × 0.28` (bukan kapsul penuh).
- **Bayangan kartu:** `0 12px 32px rgba(22,36,59,0.14)`. Tidak ada hard offset shadow.
- **Callout:** garis `2px` warna `ink`, titik jangkar kecil (r 7) kuning, pill tanpa border tebal (bayangan lembut saja).
- **Watermark:** lambang Tirta Ayu kecil di kanan atas header (`lambang-warna.svg`, ≥ 48px, clear space 27%). **Jangan** meniru watermark atau logo channel Kita Bedah.

### 4.1 Pengecualian Aturan Keras (khusus gaya #44)

| Aturan SKILL.md | Status di #44 | Batasannya |
|---|---|---|
| 1. Dilarang pill/background teks | **Dikecualikan** untuk 3 komponen: `<KaraokePillCaption />`, `<StatusBadge />`, `<CalloutPill />` | Pill hanya boleh lewat 3 komponen itu. Judul header, sub-label, dan isi kartu tetap teks bersih tanpa kotak. Maksimal 2 badge dan 1 callout aktif per beat (callout baru muncul setelah yang lama dibersihkan) |
| 1. `<BottomSubtitleBar />` teks bersih | **Diganti** `<KaraokePillCaption />` | Satu pill gelap per baris, kata aktif diblok kuning, kata berikutnya diredupkan |
| 2. Dilarang titik di samping teks | **Dikecualikan** untuk titik jangkar callout (titik di objek, bukan di samping teks) dan penanda rekap | Rekap default memakai nomor mono `01 02 03`. Titik warna lewat `marker="dot"` hanya boleh di `<BedahRecapList />`. Karakter `•` di string tetap dilarang (linter tetap aktif) |
| 3–6 (logo asli, SFX terikat animasi, kamera tanpa shake, determinisme) | **Tetap berlaku penuh** | — |

### 4.2 Komponen Overlay (`templates/components/BedahOverlay.tsx`)

| Komponen | Fungsi |
|---|---|
| `<BedahHeader />` | Judul dengan satu kata kunci berwarna, sub-label mono, slot angka live dan badge. Judul ganti per bab dengan mask naik |
| `<LiveCounter />` | Angka yang terus berdetak (meteran `01234,4122`, `0,0 → 1,5 bar`, `0% → 100%`). Format angka Indonesia (koma desimal) |
| `<StatusBadge />` | Pill status: `ILUSTRASI`, `DIPERBESAR 20×`, `GERAK LAMBAT 8×`, `+3 JAM`, `KATUP DIBUKA`. Varian `neutral / problem / solution / time` |
| `<CalloutPill />` | Titik jangkar di objek → garis penunjuk draw-on → pill label. Varian warna mengikuti semantik |
| `<KaraokePillCaption />` | Caption per kata dari `words.json` (narrator-sync / WhisperX) |
| `<InfoCard />` | Kartu putih untuk kutipan sumber, kalkulasi, checklist, kartu kontak |
| `<BedahRecapList />` | Ringkasan bertingkat di akhir video, poin muncul satu per satu |
| `<FlowArrow />` | Panah alur yang tumbuh **searah gerak nyata** (ekor → kepala). `points` = jalur 3D yang diproyeksikan (`projectToScreen`), `progress` = nilai yang sama dengan gerak bendanya (bukaan katup, muka air). Busur searah putaran roda, garis naik untuk stem/pintu, garis sepanjang pipa ke hilir untuk air |
| `<BedahStepper />` | Penanda posisi `01 KATUP  02 ARUS` di slot `subLabel` header. `active` pecahan = garis bawah bergeser saat pindah bab |
| `sequenceBeats()` | Susun beat berurutan tanpa tumpang tindih → `Record<id, [start, end]>`. Sumber tunggal semua timing scene |
| `holdFrames()` / `checkText()` / `warnText()` | Hitung lama tayang minimal teks dan periksa aturan 7 kata / 0,3 dtk per kata |

---

## 5. Koreografi Gerak

### 5.1 Ritme per bab: konteks → zoom → jelaskan → mundur

Setiap bab mengikuti pola tetap di satu diagram yang sama:

| Langkah | Yang bergerak | Kamera |
|---|---|---|
| 1. **Konteks (O)** | Penanda `<BedahStepper />` pindah ke bab ini | Diam di overview |
| 2. **Zoom** ke bagian yang dibahas | Kamera saja | `O → Z_n` 24–30 frame, `EIO` |
| 3. **Callout** muncul (label ≤ 7 kata) | Callout saja | Diam di `Z_n` |
| 4. **Mekanisme** bekerja + panah arah | Satu mekanisme terhubung | Diam di `Z_n` |
| 5. **Bersihkan** panah & callout | Fade 8 frame | Diam |
| 6. **Mundur** ke konteks utuh | Kamera saja | `Z_n → O` 24–30 frame |

Overview `O` harus memperlihatkan seluruh objek (pipa hulu + katup + hilir), dan kamera **selalu kembali ke `O`** di antara dua zoom. Jangan zoom dari satu bagian langsung ke bagian lain.

### 5.2 Aturan satu-gerak (one mover at a time)

- **Hanya satu elemen bergerak dalam satu waktu.** Timing scene disusun dengan `sequenceBeats()`, sehingga beat berikutnya baru mulai saat beat sebelumnya selesai. `staggeredSpringAt` / overlap 3 lapis **tidak dipakai** di gaya ini.
- **Kamera adalah satu elemen.** Selama kamera zoom/mundur, tidak ada callout, counter, atau objek yang bergerak. Selama objek bekerja, kamera diam (dua keyframe identik → tangen 0 → benar-benar diam).
- **Pengecualian yang dihitung sebagai "satu elemen":**
  1. *Satu mekanisme yang terhubung secara fisik* (roda → stem → pintu, beserta panah arah dan `<LiveCounter />` yang membaca bukaannya). Semuanya satu rantai sebab-akibat, bukan gerak terpisah.
  2. *Caption karaoke* mengikuti suara narator, bukan elemen visual diagram.
  3. *Aliran tetap (steady state)*: guratan arus air setelah pipa terisi penuh boleh terus berjalan pelan sebagai latar.
- **Live counter** hanya bergerak selama mekanismenya bekerja, lalu diam di angka akhir.

### 5.3 Panah & alur searah gerak nyata

- Panah alur wajib `<FlowArrow />` dengan arah **sama dengan arah fisik** benda: busur di atas roda searah putaran roda, panah naik di samping pintu yang terangkat, panah sepanjang sumbu pipa ke hilir.
- `progress` panah = nilai gerak bendanya (`open`, muka air), sehingga kepala panah tumbuh bersama benda. Jangan buat panah yang tumbuh duluan atau melawan arah.
- Jalur panah dihitung dari titik 3D (`projectToScreen`) supaya ikut perspektif kamera. Kepala panah harus tetap di dalam layar selama ditampilkan.
- Warna: biru `accentSecondary` untuk air, merah `problem` untuk aksi pemicu / masalah, hijau `solution` untuk hasil yang benar.

### 5.4 Detail gerak lain

- **Cutaway reveal:** bidang potong 3D (`useCutPlane`) menyapu objek selama 18–24 frame (`EIO`), permukaan potong langsung salmon. Ini beat sendiri, sebelum zoom pertama.
- **Fill / grow:** silinder air `BEDAH_MATERIALS.water` memanjang di sumbu pipa, kolom air naik, jarum manometer berputar. Mekanisme mengikuti fisika asli: roda katup berputar saat stem naik, pintu katup terangkat, arus baru mengalir setelah pintu terbuka.
- **Gelembung udara:** dibuat dengan `createSeededRandom()` (bukan `Math.random`).
- **Annotation pop-in:** titik jangkar scale 0 → 1 (6f), garis draw-on (10f), pill masuk (spring `editorialSettle`), lalu tahan minimal `holdFrames(text)`. Keluar dengan fade 8f di beat "bersihkan".
- **Badge waktu dan skala:** setiap manipulasi skala atau waktu **wajib** diberi badge (`DIPERBESAR`, `GERAK LAMBAT`, `+3 JAM`).
- **Jeda dramatis "Kita bedah.":** frame didesaturasi 60–80% selama ±1 detik, judul besar di tengah, lalu warna kembali saat cutaway pertama terbuka.
- **Spring:** `editorialSettle` (`damping 14, stiffness 150, mass 0.72`).
- **Kamera:** perspektif 3D, posisi & target lewat `splineAt` C1. Tanpa shake, orbit maksimal 25° per bab.

### Struktur naratif 6 babak (55–75 detik)

| Babak | Detik | Isi | Overlay |
|---|---|---|---|
| 1. Hook / mitos | 0–5 | Pertanyaan atau keluhan populer | Judul + kata kunci, badge `ILUSTRASI` |
| 2. "Kita bedah." | 5–7 | Jeda dramatis, desaturasi | Judul besar tengah |
| 3. Mekanisme | 7–45 | 3–5 bab, satu bagian objek per bab | Judul ganti per bab, callout, counter, badge skala/waktu |
| 4. Angka konkret | 45–52 | Konversi ke satuan sehari-hari | `<InfoCard />` kalkulasi |
| 5. Tips | 52–62 | 1–3 hal yang bisa dilakukan penonton | `<InfoCard />` checklist |
| 6. Rekap + CTA | 62–72 | Ringkasan bertingkat, loop ke hook, #YuhBukaTiray, end card logo | `<BedahRecapList />`, end card `logo-vertikal-warna.svg` |

---

## 6. Waypoint Kamera Contoh (`CamKey3D: [frame, px, py, pz, tx, ty, tz, fov]`)

```ts
// 9:16, katup gerbang di sumbu pipa AXIS = 0.78. O = overview, Z1 = katup, Z2 = hilir.
const O  = [4.6, 4.6, 7.2,  0.15, AXIS + 0.55, 0, 44];
const Z1 = [2.6, 3.3, 4.5,  0.05, AXIS + 1.35, 0, 42]; // target tinggi -> roda turun, tidak menabrak header
const Z2 = [4.6, 2.8, 4.8,  2.0,  AXIS + 0.40, 0, 42]; // hilir, flens katup tetap terlihat sebagai konteks
const k = (f: number, v: number[]) => [f, ...v] as CamKey3D;
const CAM: CamKey3D[] = [
  k(0, O), k(B.zoom1[0], O),            // diam selama header + cutaway
  k(B.zoom1[1], Z1), k(B.back1[0], Z1), // zoom, lalu DIAM selama callout + mekanisme
  k(B.back1[1], O), k(B.zoom2[0], O),   // mundur ke konteks, diam selama stepper + arus
  k(B.zoom2[1], Z2), k(B.back2[0], Z2),
  k(B.back2[1], O), k(299, O),
];
// 16:9 (FOV 30, target digeser x -0.9 supaya objek tidak tertutup header):
//   O [5.6,4.2,7.6, -0.9,AXIS+0.75,0,30]  Z1 [3.4,3.1,4.6, -0.55,AXIS+1.15,0,30]  Z2 [5.4,2.8,4.8, 1.5,AXIS+0.5,0,30]
```

Pasangan keyframe identik (`k(B.zoom1[1], Z1), k(B.back1[0], Z1)`) membuat tangen spline 0, sehingga kamera benar-benar diam selama beat lain berjalan.

---

## 7. Desain Suara

- **Tempo dasar:** 100 BPM (18 frame/beat @30fps). Musik tipis di −24 dB di bawah narasi, ducking otomatis lewat `<AudioStage />`.
- **Backsound prosedural:** `B25` (Apple Keynote Pluck) — alternatif `B09`.
- **Lagu studio:** `M05` (Coffee or Tea) bila ingin lebih hangat.
- **SFX terikat animasi:**
  - Cutaway terbuka: `transition-whoosh-soft.wav`
  - Callout dan badge muncul: `<SfxCue sfx="pop-in" />` (maks 1 per 12 frame)
  - Counter/angka mengunci: `<SfxCue sfx="data-reveal" />`
  - Katup diputar / klik mekanik: pack `S-MEKANIK`
  - Air mengalir / gelembung: pack `S-ORGANIK`
  - Centang checklist: `<SfxCue sfx="confirm-glass" />`
- **Narasi:** `narrator-sync.mjs` dengan `id-ID-ArdiNeural` atau `id-ID-GadisNeural`, gaya santai ("nggak", "kok"), salam "Hai Jakwir Air!" sesuai tone Tirta Ayu.

---

## 8. Contoh Implementasi Kode Remotion (TSX)

Contoh lengkap yang sudah dirender: `style-samples/src/Bedah44.tsx` (katup gerbang PDAM, 9:16 & 16:9).

```tsx
import { BedahHeader, BedahStepper, CalloutPill, FlowArrow, LiveCounter, sequenceBeats, StatusBadge } from '../antislop/components/BedahOverlay';

// 1. Satu sumber timing: beat berurutan, tanpa overlap.
const B = sequenceBeats([
  { id: 'header', dur: 18 }, { id: 'cut', dur: 20 },
  { id: 'zoom1', dur: 28 }, { id: 'call1', dur: 24 }, { id: 'mech', dur: 44 }, { id: 'clear1', dur: 8 }, { id: 'back1', dur: 26 },
  { id: 'step', dur: 8 }, { id: 'flow', dur: 30 },
  { id: 'zoom2', dur: 24 }, { id: 'call2', dur: 24 }, { id: 'read2', dur: 10 }, { id: 'clear2', dur: 8 }, { id: 'back2', dur: 24 },
  { id: 'end', dur: 4 },
]);

export const SceneKatup: React.FC<{ t: number; W: number; H: number }> = ({ t, W, H }) => {
  const open = ip(t, B.mech, [0, 1], EIO);   // roda + stem + pintu + counter + panah = satu mekanisme
  const flowK = ip(t, B.flow, [0, 1], EIO);
  const fade1 = ip(t, B.clear1, [1, 0], (x) => x);

  // 2. Panah searah gerak nyata: busur searah putaran roda, progress = bukaan katup.
  const arc = pathOnScreen((u) => { const s = 0.2 + u * Math.PI * 1.5; return [Math.cos(s) * 0.82, WHEEL_Y + 0.3, Math.sin(s) * 0.82]; }, 36, t, CAM, W, H);
  const up = pathOnScreen((u) => [0.34, AXIS - 0.32 + u * 1.3, 0.22], 8, t, CAM, W, H);
  const wheelPt = projectToScreen([0.52, WHEEL_Y, 0.1], t, CAM, W, H);

  return (
    <AbsoluteFill>
      <BedahStage width={W} height={H} camera={CAM} frame={t} bg={STYLE.palette.bg}>
        <Valve t={t} cut={cut} open={open} flowK={flowK} />
      </BedahStage>
      <FlowArrow stylePreset={STYLE} points={arc} progress={open} opacity={fade1} color={BEDAH_SEMANTIC.problem} />
      <FlowArrow stylePreset={STYLE} points={up} progress={open} opacity={fade1} color={BEDAH_SEMANTIC.solution} />
      <BedahHeader
        stylePreset={STYLE} before="Kok air bisa" keyword="berhenti?" start={B.header[0]}
        subLabel={<BedahStepper stylePreset={STYLE} steps={['Katup', 'Arus']} active={ip(t, B.step)} />}
        right={<StatusBadge stylePreset={STYLE} text="Ilustrasi" variant="time" start={6} />}
        data={<LiveCounter stylePreset={STYLE} from={0} to={100} suffix="% terbuka" start={B.mech[0]} end={B.mech[1]} />}
      />
      {/* 3. Callout 2 kata, ditahan sampai beat clear (>= holdFrames) */}
      <CalloutPill stylePreset={STYLE} anchor={wheelPt} label={[wheelPt[0] - 170, wheelPt[1] + 170]} text="Roda diputar" start={B.call1[0]} end={B.clear1[0]} />
    </AbsoluteFill>
  );
};
```

Contoh lengkap (objek `Valve`, panah arus ke hilir, callout bab 2, caption & SFX): `style-samples/src/Bedah44.tsx`.

---

## 9. Larangan Keras (Khusus Gaya #44)

- **Jangan** memotong (hard cut) antar bab. Semua perpindahan lewat gerak kamera.
- **Jangan** menampilkan manipulasi skala atau waktu tanpa badge.
- **Jangan** menggambar objek hero sebagai SVG flat / cel-shading / kotak 2D. Objek hero wajib 3D lewat `Bedah3D.tsx` (`<BedahStage />` + `<BMesh />`), atau model asli `.glb` dari `public/` bila user menyediakannya.
- **Jangan** menggambar objek secara generik. Aturan 5B berlaku: anatomi pipa, katup, air valve, dan manometer harus benar (flens, baut, roda katup, jarum dan skala bar).
- **Jangan** mewarnai permukaan potong dengan warna bahan atau gradien. Permukaan potong selalu `CUT_CAP` flat.
- **Jangan** memakai kamera ortografik/flat atau transform CSS untuk zoom objek 3D. Gerak kamera = `CamKey3D` perspektif.
- **Jangan** lupa `--gl=angle` saat render. Tanpa itu kanvas WebGL bisa hitam di headless.
- **Jangan** memakai pill di luar `<KaraokePillCaption />`, `<StatusBadge />`, `<CalloutPill />`. Judul dan sub-label tetap teks bersih.
- **Jangan** menumpuk lebih dari 2 badge, dan jangan menampilkan callout bab berikutnya sebelum callout bab sebelumnya dibersihkan.
- **Jangan** menggerakkan dua elemen sekaligus (kamera + callout, callout + counter, dua mekanisme berbeda). Pakai `sequenceBeats()`; pengecualian hanya yang tercantum di §5.2.
- **Jangan** zoom langsung dari satu bagian ke bagian lain. Selalu mundur ke overview `O` dulu, dan geser `<BedahStepper />` saat pindah bab.
- **Jangan** memecah penjelasan ke diagram/scene terpisah. Semua bab di satu objek, satu ruang 3D.
- **Jangan** membuat panah yang arahnya melawan gerak nyata, tumbuh mendahului bendanya, atau panah statis tanpa `progress`. Pakai `<FlowArrow />`.
- **Jangan** menulis teks on-screen lebih dari 7 kata, atau menampilkannya kurang dari 0,3 dtk per kata (`holdFrames`).
- **Jangan** memakai warna merah untuk hal netral. Merah = masalah.
- **Jangan** meniru logo, watermark, nama, atau tagline channel Kita Bedah. Yang diambil hanya bahasa visualnya. Branding memakai aset Tirta Ayu.
- **Jangan** menaruh data pelanggan asli di layar (lihat aturan `tiray-brand-kit`).
- **Jangan** memakai `Math.random`, timer, emoji, atau karakter `•` di string.
