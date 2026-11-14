# Gaya #45 · Apple-Inspired Interactive Motion

> Di upstream motion-craft gaya ini bernomor #44. Di repo ini #44 sudah dipakai **Kita Bedah**, jadi gaya ini menjadi **#45** (`getStyleById(45)`, slug `apple-inspired-product-cinema`).

Pakai aksi yang kelihatan dan respons yang bisa dijelaskan. Di film [Introducing Apple Creator Studio](https://www.apple.com/apple-creator-studio/), kata kerja, UI, dan objek saling meneruskan perhatian. Terapkan prinsip itu pada topik user. Pilih isi, logo, produk, palet, copy, dan tipografi dari brand tujuan (untuk Tirta Ayu / Tiray: ikuti skill `tiray-brand-kit`).

## Pilih template yang bisa dirender

| Brief | Storyboard | Komponen | Koreografi |
|---|---|---|---|
| Tutorial | T101 | `AppleInteractiveTutorial` | Tujuan, klik kontrol, respons membesar, hasil ditahan. |
| Intro brand | T102 | `AppleInteractiveBrandIntro` | Janji brand, objek diseret, perubahan membesar, lockup. |
| Edukasi | T103 | `AppleInteractiveEducation` | Pertanyaan, pilih variabel, lihat akibat, tahan simpulan. |

Ketiga komponen ada di `templates/components/AppleInteractive.tsx` (setelah scaffold: `src/antislop/components/AppleInteractive.tsx`). Daftarkan komposisi langsung dengan komponen yang cocok dan masukkan copy melalui `defaultProps`. Batas scene diatur lewat `cuts` (empat frame awal scene, yang pertama 0); tanpa `cuts`, komponen membagi durasi sesuai storyboard T101–T103. Isi `visual` dengan React/SVG, UI, gambar produk, atau diagram dari aset produksi. Komponen mengurus gerak kursor, kontak, respons panel, dan perpindahan ke tampilan hasil. Untuk banyak langkah, susun beberapa rangkaian aksi dan hasil sesuai brief.

```tsx
import { Composition, staticFile } from 'remotion';
import { AppleInteractiveTutorial } from './antislop/components/AppleInteractive';

<Composition
  id="TutorialBayarTagihan"
  component={AppleInteractiveTutorial}
  durationInFrames={360}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{
    headline: 'Bayar tagihan dari HP.',
    actionLabel: 'Bayar',
    subjectLabel: 'Tagihan bulan ini',
    resultTitle: 'Lunas tanpa antre.',
    closingTitle: 'Tiray',
    closingDetail: 'Unduh di Play Store.',
    logoSrc: staticFile('brand/logo.svg'),
    enableSfx: true,
  }}
/>
```

## Framing, timing, dan audio

- **16:9**: Pakai satu sumbu utama untuk kata kerja, area aksi, dan hasil. Pertahankan posisi bentuk panel saat ia mulai membesar.
- **9:16**: Susun teks di atas panel aksi. Jaga target dan kursor tetap di area tengah, di luar safe zone atas 15% dan bawah 20%. Template menyesuaikan skala terhadap lebar serta tinggi komposisi.
- Mulai dengan bidang bersih dan satu aksen yang mengikuti brand. Token awal #45 memakai arang `#0D0E10`, bidang `#1B1D21`, tinta `#F5F5F7`, dan aksen `#8DB8FF`. Setel `palette` dan `fontFamily` sesuai brief.
- Aksi punya ancang-ancang dan titik kontak. Respons mulai tepat di titik itu. Pada shot berikutnya, panel hasil berangkat dari bentuk dan posisi akhir shot aksi. Tahan hasil supaya terbaca.
- `enableSfx` bersifat opt-in. Saat aktif, template memicu cue pada kontak dan akhir pembesaran (`click-soft`, `transition-swipe`, `pop-pluck`; lihat `references/style-sfx.json` kunci `"45"`). Scaffold menyiapkan aset audio di `public/audio/sfx/`. Musik bisa dipasang terpisah, misalnya B25.

## Kalau ada referensi video

Gunakan template sebagai komponen awal dan ikuti fungsi, framing, timing, dan sambungan dari referensi yang diberikan. Ganti visual dan gerak yang diperlukan dengan komponen Remotion kustom. Pakai referensi dan frame ekstraknya untuk analisis serta QA. Semua adegan produksi dibangun ulang dari kode dan aset independen. Untuk brief yang memang meminta reveal produk dari siluet, T004 tetap tersedia dengan pilihan eksplisit.

Periksa frame satu sebelum kontak, saat kontak, setelah respons, pada sambungan ke hasil, dan saat hold akhir. Pastikan perubahan yang dijanjikan benar-benar tampak. Beri contoh dan klaim yang sesuai fakta dari brief.
