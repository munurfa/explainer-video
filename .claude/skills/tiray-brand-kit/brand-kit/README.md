# Brand Kit Perumda Air Minum Tirta Ayu Kabupaten Tegal

Paket identitas visual yang disusun dari Perbup Tegal No. 45 Tahun 2020, file SVG lambang (`logo_base.svg`, `logo.svg`, `title.svg`), cheatsheet arti logo, dan draf design system.

Buka **`panduan-brand.html`** di browser untuk melihat pedoman lengkap: makna logo, varian, area bebas, larangan, warna, tipografi, dan contoh penerapan.

## Isi folder

| Folder | Isi |
|---|---|
| `01-logo/svg` | Vektor master: lambang, logotype, logo vertikal & horizontal (warna, hijau, hitam, putih) |
| `01-logo/png` | PNG latar transparan. Lambang 512/1024/2048 px, logo 1200/2400 px |
| `01-logo/pdf` | Vektor untuk percetakan |
| `02-warna` | `warna.css` (token CSS), `warna.json`, `tirta-ayu.gpl` (palet Inkscape/GIMP) |
| `03-tipografi` | `TIPOGRAFI.md`: Poppins (utama) & Plus Jakarta Sans (alternatif) |
| `04-ikon-web` | Favicon/ikon 16–512 px (lambang beralas putih), avatar media sosial 1080 px |
| `05-dokumen-sumber` | Perbup 45/2020, cheatsheet arti logo, draf design system |

## File mana untuk keperluan apa

- **Percetakan, spanduk, papan nama** → PDF atau SVG dari `01-logo/pdf` / `01-logo/svg`.
- **Word, PowerPoint, Canva** → PNG 2400 px dari `01-logo/png`, lalu perkecil.
- **Situs & aplikasi** → SVG untuk logo, `02-warna/warna.css` untuk warna, ikon dari `04-ikon-web`.
- **Media sosial** → `04-ikon-web/avatar-sosial-1080px.png`.
- **Stempel, faks, cetak hitam-putih** → varian `-hitam`.
- **Latar gelap yang tidak bisa dihindari** → varian `-putih`, atau `lambang-warna-alas-putih`.

## Aturan singkat

1. Logo berwarna di atas **dasar putih** adalah pilihan pertama (Pasal 6 ayat 4).
2. Jangan membalik, memutar, meregangkan, mengganti warna, atau menambah efek.
3. Area bebas = lebar tetes air (±27% lebar lambang) di keempat sisi.
4. Ukuran minimum lambang 48 px / 15 mm; logo lengkap 160 px / 40 mm.

## Status aturan

- **Resmi**: ditetapkan Perbup 45/2020 atau diambil langsung dari file SVG resmi (bentuk lambang, makna, warna hijau/biru/daun, dasar putih).
- **Rekomendasi**: usulan pemakaian yang belum ditetapkan (kode warna emas, warna tombol green-700, tipografi, area bebas, susunan horizontal, contoh penerapan). Perlu persetujuan direksi sebelum dianggap baku.

## Catatan

Lampiran Perbup menampilkan nama dalam dua baris (*PERUMDA AIR MINUM TIRTA AYU / KABUPATEN TEGAL*). Kit ini memakai versi vektor tiga baris dari `title.svg` (Poppins SemiBold, gradasi emas) dengan teks yang sama. Untuk dokumen hukum yang mensyaratkan tampilan persis Lampiran, rujuk Perbup di `05-dokumen-sumber`.
