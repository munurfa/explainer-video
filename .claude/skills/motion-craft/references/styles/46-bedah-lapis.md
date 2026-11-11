# Gaya #46 — Bedah Lapis (Buka Lapis demi Lapis)

> Turunan gaya #44 Kita Bedah untuk topik **umum** (tidak terikat Tirta Ayu / PDAM).
> Yang dipertahankan dari #44: header 2 baris + stepper bab + badge + counter + caption karaoke.
> Yang baru: tampilan 3D clay pastel tanpa outline, objek dibuka dengan **melepas lapis** (bukan bidang potong), kamera yang selalu melayang pelan, label pill putih bertitik warna, dan kalimat hook yang ditulis user.
> **Gaya ini punya pengecualian atas Aturan Keras 1 dan 2 di `SKILL.md`** (lihat §4.1), hanya saat gaya #46 dipilih.

---

## 0. Dua Pertanyaan Wajib Sebelum Storyboard

Begitu gaya #46 dipilih (Stage 0 atau awal Stage 2), **tanyakan dua hal ini ke user dan tunggu jawabannya**. Jangan mengisi sendiri.

| # | Pertanyaan | Pilihan | Dipakai di kode |
|---|---|---|---|
| 1 | **Mode brand:** video ini umum atau untuk Tirta Ayu? | `umum` (default): palet netral #46, tanpa logo kecuali user memberi logonya, sapaan netral. `tirta-ayu`: warna, logo, dan sapaan Tirta Ayu ("Jakwir", "Yuh"); **wajib muat skill `tiray-brand-kit` dulu**. | `lapisStyle(STYLE, mode)` dan slot `logo` di `<LapisHeader />` |
| 2 | **Kalimat hook:** kalimat apa yang muncul besar di tengah saat objek mulai dibuka? Default-nya "Yuk, kita bedah." (mode Tirta Ayu: "Yuh, kita bedah."). Silakan tulis sendiri. | Teks bebas dari user, maks 7 kata. Kalau user menjawab "pakai default", pakai default mode brand-nya. | `lapisHookText(jawabanUser, mode)` → `<LapisHook text={...} />`, dan kalimat yang sama masuk ke naskah VO |

Di Claude Code, pertanyaan 1 boleh lewat AskUserQuestion; pertanyaan 2 teks bebas. Catat kedua jawaban di bagian atas `research/storyboard.md` (`- Mode brand:` dan `- Kalimat hook:`). Agent non-interaktif: pakai `umum` + default, lalu laporkan asumsi itu di gate storyboard.

---

## 1. Identitas Visual & Tata Letak

- **ID & Slug Gaya:** `#46` — `bedah-lapis`
- **Komponen Khusus:** `templates/components/Lapis3D.tsx` (panggung clay, lepas lapis, kamera melayang) + `templates/components/LapisOverlay.tsx` (header, stepper, label, chevron, hook, caption). Keduanya memakai ulang `Bedah3D.tsx` dan `BedahOverlay.tsx`, jadi keempat file harus ikut tersalin.
- **Dependensi wajib:** sama dengan #44 (`@remotion/three@<versi-remotion> three@0.169.0 @react-three/fiber@8.17.10 @types/three@0.169.0`). Render: `--gl=angle`.
- **Cocok Untuk:** cara kerja benda sehari-hari (alat rumah, mesin, kendaraan, gedung), "kok bisa", "apa isi di dalam X", edukasi umum, sains populer.
- **Kata Kunci Pemicu di Brief:** `bedah lapis`, `isi di dalam`, `di balik`, `buka`, `lepas panel`, `cara kerja`, `kok bisa`, `clay`, `pastel`
- **Karakter & DNA Visual:** Shorts vertikal 9:16, 55–80 detik, satu kamera yang terus melayang tanpa hard cut. Satu benda nyata tampil sebagai model 3D **clay pastel**: permukaan matte, tanpa outline, bayangan sangat lembut, lantai menyatu dengan latar krem. Cangkang benda netral (putih gading), dan **warna jenuh hanya untuk bagian yang dijelaskan** (satu bagian = satu warna). Benda itu dibuka dengan melepas lapis luarnya satu per satu sampai mekanismenya terlihat, lalu **dipasang kembali di akhir video**.

**Panggung 9:16 (1080 × 1920).** Sumber angka: `lapisLayout()` di `LapisOverlay.tsx`.

```
┌────────────────────────────────┐ y=0
│ HEADER (y 200–530)             │  judul 2 baris + logo di tepi kanan,
│  lebar x 40–1040               │  stepper selebar header, counter + badge
├────────────────────────────────┤
│                                │
│ PANGGUNG OBJEK (y 540–1500)    │  objek + label + chevron
│                                │
├────────────────────────────────┤
│ CAPTION KARAOKE (y 1540–1620)  │  selalu di bawah objek
└────────────────────────────────┘ y=1920
```

Perbedaan tata letak dari #44, semuanya permintaan pemilik gaya:

| Unsur | #44 | #46 |
|---|---|---|
| Posisi header | judul mulai y ±300 | judul mulai **y 200** |
| Lebar header | padding 64, logo di samping judul | **padding 40** (x 40–1040), logo menempel tepi kanan |
| Huruf stepper | 19–26 px tetap | **24–36 px, dihitung otomatis** supaya semua bab mengisi lebar header (5 bab ±28 px, 3 bab 36 px) |
| Caption | 422 px dari bawah (y ±1420–1500), bisa menimpa objek | **300 px dari bawah (y 1540–1620)**, objek dibingkai supaya selalu di atasnya |
| Baris caption | dipotong tiap 4 kata | 4 kata **dan** selalu ganti baris di akhir kalimat |

**Catatan safe zone.** Header (y 200) dan caption (y 1540–1620) sengaja sedikit melewati zona konservatif skill (atas 288 px, bawah 1536 px). Ikon platform umumnya berada di y < 190 dan y > 1620, tetapi tiap aplikasi berbeda. Saat gate render, **tunjukkan still dengan pita safe zone** dan sebutkan hal ini ke user. Kalau tertutup, ubah `headerTop` / `captionBottom` di `lapisLayout()`, jangan per komponen.

16:9: header y 52–320 selebar layar, caption 56 px dari bawah, objek dibingkai di y 300–950.

---

## 2. Palet Warna

Mode `umum` (palet katalog). Mode `tirta-ayu` mengganti 6 token pertama lewat `lapisStyle()` dengan warna resmi brand kit.

| Peran | Token | Umum | Tirta Ayu | Aturan |
|---|---|---|---|---|
| Kanvas | `palette.bg` | `#F4F1EA` | `#F3F1EC` | Latar, lantai (lantai hanya menangkap bayangan) |
| Kartu / pill label | `palette.surface` | `#FFFFFF` | `#FFFFFF` | Pill label, kartu mini |
| Tinta | `palette.ink` | `#1B2230` | `#16243B` | Judul, teks label, pill caption (alpha 0,84) |
| Teks sekunder | `palette.muted` | `#5B6577` | `#44536B` | Bab stepper tidak aktif |
| Highlight | `palette.accent` | `#FFC53D` | `#FFC20E` | Kata aktif caption, garis hook |
| Kata kunci | `palette.accentSecondary` | `#2B59C3` | `#244DA9` | Kata kunci judul, bab aktif, angka counter |

Warna clay objek (`LAPIS_CLAY`, sama di kedua mode):

| Kunci | Hex | Untuk |
|---|---|---|
| `shell` / `shellCool` | `#F4F1EB` / `#E6EAF0` | Cangkang, panel, tutup. Bagian terbesar objek |
| `edge` | `#F5C9A9` | **Tepi potong** setelah lapis dilepas. Selalu peach, sama di semua bahan |
| `dark` / `grey` / `steel` | `#272C37` / `#BFC6D0` / `#CBD1DA` | Rangka, tuas, logam netral |
| `blue` `yellow` `orange` `mint` `red` | `#4E9BE6` `#F4B63C` `#EE7B3A` `#6FDBB3` `#E2604C` | **Bagian yang dijelaskan.** Maks 4 warna jenuh per video |
| `water` / `glass` | `#6DBBF0` α0,62 / `#A9CDEE` α0,5 | Cairan, kaca |

Aturan warna:
- Satu bagian = satu warna, dan **titik di label bagian itu memakai warna yang sama** (`color={LAPIS_CLAY.orange.color}`).
- Merah `#D1432B` (`BEDAH_SEMANTIC.problem`) dan hijau `#1D7A32` (`BEDAH_SEMANTIC.solution`) tetap bermakna masalah / solusi di badge. Jangan dipakai sebagai warna bagian netral.

---

## 3. Tipografi (9:16)

| Peran | Font | Bobot | Ukuran | Catatan |
|---|---|---|---|---|
| Judul header | `Poppins` | 800 | 76 px | maks 2 baris, satu kata kunci berwarna |
| Stepper | `JetBrains Mono` | 700 | 24–36 px otomatis | UPPERCASE, tracking 0,06em |
| Counter | `JetBrains Mono` | 700 | 56–64 px | `tabular-nums` |
| Badge | `JetBrains Mono` | 700 | 23 px | UPPERCASE |
| Label bagian | `Poppins` | 700 | 26 px | UPPERCASE, tracking 0,08em |
| Hook | `Poppins` | 800 | 120 px | tengah panggung, maks 2 baris |
| Caption | `Poppins` | 700 | 46 px | 1 baris, maks 4 kata |

Aturan teks #44 tetap berlaku: setiap teks di layar **maks 7 kata** dan terbaca penuh **minimal 0,3 dtk per kata** (`holdFrames()`, `warnText()`, lint `BEDAH_TEXT_BUDGET`).

---

## 4. Bahasa Bentuk & Komponen

### 4.0 Pipeline 3D (`Lapis3D.tsx`)

| Unsur | Implementasi |
|---|---|
| **Panggung** | `<LapisStage bg={palette.bg} camera={CAM} frame={t}>`: cahaya langit sangat terang + satu key lembut, tanpa tone mapping filmik (warna tampil sesuai hex), lantai `shadowMaterial` yang hanya menangkap bayangan |
| **Bahan** | `<LMesh mat="shell" />` dengan preset `LAPIS_CLAY`. Tanpa outline. Jangan pakai `<BMesh />` (#44) di gaya ini |
| **Bentuk** | Sudut membulat: `roundedBox()`, benda putar `sliceLathe()` / `latheGeometry()`, `springGeometry()`. Tetap minimal 5 sub-bagian yang dikenali (Aturan 5B) |
| **Lepas lapis** | Bangun objek sebagai **bagian tetap + lapis luar**. Lapis luar dibungkus `<Peel k dir dist tilt pivot>`; jadwal `peelK(t, start, i, each, gap)` untuk urutan luar → dalam. Arah lepas sebaiknya ke atas supaya panel keluar lewat belakang header |
| **Tepi potong** | Sisi yang terbuka setelah lapis dilepas diberi bahan `edge`. `sliceLathe()` mengembalikan `wall` dan `caps`; `caps` bagian tetap = `edge` |
| **Pasang kembali** | Di akhir video semua lapis kembali dengan urutan terbalik: `1 - peelK(t, tutup, n - 1 - i)` |
| **Bagian menyala/panas** | `<LMesh glow={0..1} glowColor="#FF3D12" />` |
| **Kamera** | `Shot = [px,py,pz, tx,ty,tz, fov]`, `driftHold(from, to, shot, deg)` untuk menahan sambil melayang, lalu digabung jadi `CamKey3D[]`. FOV 36–40 (9:16) / 30 (16:9) |
| **Label & chevron** | `projectToScreen([x,y,z], t, CAM, W, H)` tiap frame, sehingga label ikut objek saat kamera bergerak |

### 4.1 Pengecualian Aturan Keras (khusus gaya #46)

| Aturan SKILL.md | Status di #46 | Batasannya |
|---|---|---|
| 1. Dilarang pill/background teks | **Dikecualikan** untuk `<LapisCaption />`, `<StatusBadge />`, `<LapisLabel />`, `<LapisCard />` | Judul, stepper, dan hook tetap teks bersih. Maks 2 badge. Label: 1 per beat saat menjelaskan, maks 5 sekaligus hanya di rekap |
| 2. Dilarang titik di samping teks | **Dikecualikan** untuk titik warna di dalam `<LapisLabel />` dan cincin jangkarnya | Titik itu penanda warna bagian (legenda), bukan bullet. Di luar `<LapisLabel />` tetap dilarang. Karakter `•` di string tetap dilarang |
| 3–6 | **Tetap berlaku penuh** | Logo asli, SFX terikat animasi, tanpa shake, deterministik |

### 4.2 Komponen Overlay (`LapisOverlay.tsx`)

| Komponen | Fungsi |
|---|---|
| `lapisLayout(W, H)` | Sumber tunggal posisi: `headerTop`, `side`, `captionBottom`, `stageTop`, `stageBottom`, ukuran huruf |
| `lapisStyle(STYLE, mode)` / `lapisHookText(teks, mode)` | Menerapkan jawaban dua pertanyaan di §0 |
| `<LapisHeader />` | Judul + kata kunci, `logo` di tepi kanan, `steps` + `activeStep` (stepper selebar header), `data` (counter), `right` (badge) |
| `<LapisStepper />` | Dipakai otomatis oleh header. Ukuran huruf dari `stepperSize()` |
| `<LapisLabel />` | Cincin jangkar di objek → garis tipis → pill putih dengan titik warna bagian. `offset` relatif terhadap jangkar; pill dijaga tetap di dalam layar dan di dalam panggung |
| `<ChevronTrail />` | Tiga chevron berbaris searah gerak nyata (pengganti panah garis tipis). `opacity` = nilai gerak bendanya |
| `<LapisCard />` + `<LapisBar />` | Kartu mini semi-transparan untuk perbandingan dua batang atau satu grafik kecil |
| `<LapisHook />` + `hookSaturation()` | Jeda hook: tirai tipis, kalimat user besar di tengah panggung, warna objek turun lalu kembali |
| `<LapisCaption />` | Caption karaoke di posisi #46, pecah baris per kalimat |
| Dipakai ulang dari #44 | `LiveCounter`, `StatusBadge`, `FlowArrow`, `sequenceBeats`, `holdFrames`, `warnText`, `BEDAH_SEMANTIC` (diekspor ulang dari `LapisOverlay.tsx`) |

---

## 5. Koreografi Gerak

### 5.1 Struktur video

| Babak | Isi | Overlay |
|---|---|---|
| 1. Hook | Benda utuh, pertanyaan dari pengalaman penonton | Header masuk, counter di angka awal, badge `ILUSTRASI` bila ada angka tak bersumber |
| 2. Kalimat hook | Jeda ±1,5 dtk, warna objek turun | `<LapisHook />` dengan kalimat user |
| 3. Buka | Lapis dilepas satu per satu (16–20 frame per lapis, selang 6–8 frame) | SFX satu kali di awal lepas |
| 4. Mekanisme | 2–5 bab, satu bagian per bab | Stepper bergeser, satu label per bab, chevron, counter |
| 5. Rekap | Kamera mundur ke objek utuh, semua label tampil bersama | Label rekap muncul berurutan selang 3 frame |
| 6. Tutup + CTA | Lapis dipasang kembali, CTA di caption / end card | Mode `tirta-ayu`: end card logo dari brand kit |

### 5.2 Kamera melayang

- Kamera **tidak pernah diam total**. Saat menjelaskan, bidikan ditahan dengan `driftHold()` (orbit 2–5 derajat). Tanpa shake, tanpa handheld.
- Kamera **boleh pindah langsung** dari satu bagian ke bagian berikutnya bila keduanya bersebelahan atau terhubung (mengikuti tali, pipa, tuas). Mundur ke bidikan utuh wajib hanya di rekap.
- Kamera **boleh bergerak bersama mekanisme** yang sedang bekerja. Yang tetap dilarang: dua mekanisme tak terhubung bergerak bersamaan, dan label baru muncul saat label lama belum dibersihkan (kecuali di rekap).
- Orbit maksimal 25 derajat per bab, 6 derajat per tahan.
- Setiap bidikan harus membingkai bagian yang dibahas di dalam panggung (9:16: y 540–1500). Cek dengan still.

### 5.3 Gerak lain

- **Chevron** searah gerak nyata dan hanya tampil selama bendanya bergerak. Untuk jalur melengkung atau aliran panjang tetap pakai `<FlowArrow />`.
- **Label** muncul: cincin jangkar (6f) → garis (9f) → pill (spring `editorialSettle`), tahan minimal `holdFrames(text)`, keluar fade 8f.
- **Counter** hanya bergerak selama mekanismenya bekerja.
- **Badge skala/waktu** tetap wajib untuk setiap manipulasi skala atau waktu (`DIPERBESAR`, `GERAK LAMBAT`).
- **Spring:** `editorialSettle`.

---

## 6. Contoh Kamera

```ts
import { driftHold, Shot } from '../antislop/components/Lapis3D';

const O: Shot  = [3.3, 3.0, 6.6,  0.1, 1.1, 0, 40];   // utuh
const Z1: Shot = [2.0, 1.75, 3.9, 0,   0.72, 0, 40];  // bagian bawah
const Z2: Shot = [1.55, 1.0, 3.45, 0.3, 0.34, 0.05, 36]; // mekanisme kecil
const CAM = [
  ...driftHold(0, T.zoom1[0], O, 5),            // melayang selama header, hook, dan buka lapis
  ...driftHold(T.zoom1[1], T.move2[0], Z1, 3),  // tahan sambil melayang
  ...driftHold(T.move2[1], T.back[0], Z2, 3),   // pindah langsung Z1 -> Z2
  ...driftHold(T.back[1], TOTAL, O, 2),         // rekap + tutup
];
```

---

## 7. Desain Suara

- **Backsound:** `B25`, alternatif `B27` (piano dokumenter) untuk nuansa tenang. Musik −24 dB di bawah narasi.
- **Narasi:** tenang, ±2,2–2,5 kata/detik, **satu kalimat = satu gerakan di layar**.
- **SFX terikat animasi:** lapis dilepas `transition-swipe` (sekali per rangkaian), label `pop-in`, counter mengunci `data-reveal`, klik mekanik `toggle-off` / pack `S-MEKANIK`, lapis dipasang kembali `transition-whoosh-soft`.

---

## 8. Contoh Kode

Contoh lengkap yang sudah dirender: `project/style-samples/src/Bedah46.tsx` (rice cooker, 9:16 & 16:9).

```tsx
const STYLE = lapisStyle(getStyleById(46), MODE);          // MODE dari pertanyaan 1
const HOOK = lapisHookText(HOOK_USER, MODE);               // HOOK_USER dari pertanyaan 2

<AbsoluteFill style={{ filter: `saturate(${hookSaturation(t, T.hook[0], T.hook[1])})` }}>
  <LapisStage width={W} height={H} camera={CAM} frame={t} bg={STYLE.palette.bg}>
    <LMesh geometry={g.shellBack.wall} mat="shell" />
    <LMesh geometry={g.shellBack.caps} mat="edge" />
    <Peel k={peelK(t, T.peel, 0)} dir={[0, 1, 0.25]} dist={3.6} pivot={[0, 1.7, 0.6]}>
      <LMesh geometry={g.lidFront.wall} mat="shellCool" />
    </Peel>
    <LMesh geometry={g.plate.wall} mat="orange" glow={heat} glowColor="#FF3D12" />
  </LapisStage>
</AbsoluteFill>
<ChevronTrail from={P([-0.5, 0.52, 0])} to={P([-0.5, 0.95, 0])} color={LAPIS_CLAY.orange.color} opacity={heatOn} />
<LapisHook stylePreset={STYLE} text={HOOK} start={T.hook[0]} end={T.hook[1]} />
<LapisHeader
  stylePreset={STYLE} before="Kok rice cooker" keyword="tahu" after="nasinya matang?"
  steps={['Pemanas', 'Air habis', 'Magnet lepas']} activeStep={step} start={0}
  logo={LOGO /* mode tirta-ayu: <Img src={staticFile('brand/lambang-warna.svg')} height={96} /> */}
  data={<LiveCounter stylePreset={STYLE} from={28} to={100} start={T.heat[0]} end={T.heat[1]} suffix="°C" />}
  right={<StatusBadge stylePreset={STYLE} text="Ilustrasi" variant="time" start={6} />}
/>
<LapisLabel stylePreset={STYLE} anchor={P([-0.52, 0.37, 0])} offset={[30, 200]} text="Pelat pemanas" color={LAPIS_CLAY.orange.color} start={T.label1[0]} end={T.label1[1]} />
<LapisCaption words={words} stylePreset={STYLE} />
```

---

## 9. Larangan Keras (Khusus Gaya #46)

- **Jangan** mulai storyboard sebelum dua pertanyaan di §0 dijawab user.
- **Jangan** menulis kalimat hook tetap di kode. Selalu `lapisHookText()` dari jawaban user.
- **Jangan** memakai logo, warna, atau sapaan Tirta Ayu di mode `umum`, dan jangan mengarang logo: mode `umum` tanpa logo kecuali user memberi asetnya.
- **Jangan** memberi outline, tone mapping filmik, atau tekstur berbintik. Itu tampilan #44.
- **Jangan** membuka objek dengan bidang potong (`useCutPlane`). Di gaya ini objek dibuka dengan `<Peel />`.
- **Jangan** memberi warna jenuh pada cangkang. Warna jenuh hanya untuk bagian yang dijelaskan, maks 4 warna.
- **Jangan** memakai warna titik label yang berbeda dari warna bagiannya.
- **Jangan** meletakkan objek atau label di bawah y 1500 (9:16). Caption harus selalu di bawah objek.
- **Jangan** mengubah posisi header/caption per komponen. Ubah di `lapisLayout()`.
- **Jangan** hard cut, kamera shake, atau kamera diam total.
- **Jangan** lupa memasang kembali lapis di akhir video.
- **Jangan** menulis teks di layar lebih dari 7 kata atau tayang kurang dari 0,3 dtk per kata.
- **Jangan** meniru nama, logo, watermark, atau tagline channel referensi mana pun. Yang diambil hanya bahasa visualnya.
- **Jangan** memakai `Math.random`, timer, emoji, atau karakter `•` di string. Jangan lupa `--gl=angle`.
