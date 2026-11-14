# STORYBOARD — Launch Tiray 9:16 (turunan v6 16:9)

Status: **v2 (layout jendela 16:9) disetujui user** (12 Nov 2026), render `out/v2.mp4`. Layout v1 (susun ulang vertikal, `out/v1.mp4`) di bagian 4 disimpan sebagai riwayat.

## v2 — Jendela 16:9 di tengah 9:16 (berlaku)

Arahan user: *"layout mensimulasikan ukuran 16:9 di tengah 9:16 dengan logo di atas tetap seperti sekarang, hanya komponen yang berjalan saja yang simulasi ukuran 16:9"*, lalu *"warna background biru atau putih samakan dengan 9:16 agar tidak terlihat batas, hanya komponennya saja yang tidak keluar dari batas"*.

| Bagian | Isi |
|---|---|
| Animasi | Film 16:9 v6 apa adanya (salinan di `src/wide/`), diperkecil 0,5625 ke jendela 1080 × 607,5 px, y 656–1264, `overflow: hidden`. Komponen terpotong di tepi jendela |
| Latar | Gradasi putih / biru dan banjir warna digambar di seluruh kanvas 9:16 (timing dan titik asal sama dengan 16:9), jadi batas jendela tidak terlihat |
| Logo pojok | Tetap layout 9:16 (y 148, margin 60), di luar jendela |
| Sambungan outro | Latar `bg916.png` dan titik hijau digambar di kanvas 9:16 penuh; titik bergerak dari tab ke (539,5; 959,5) dengan ukuran asli outro 9:16 (Ø62 → 172 / 222 / 232) |
| Konsekuensi | Judul ±35 px tinggi; tepi kanan jendela (x > 950) masuk zona tombol like/komentar |
| Bukti | `out/storyboard-v5/contact-sheet.png`, `out/storyboard-v5/contact-sheet-safezone.png` |

Dasar: `project/video-launch-tiray-169` v6 (disetujui). Arahan user: **"jangan ubah style pada 16:9, hanya sesuaikan saja layoutnya dengan 9:16"**.

## 0. Aturan turunan

| Ikut 16:9 persis (gaya) | Diubah untuk 9:16 (layout) |
|---|---|
| Timing semua beat (`src/timeline.ts`), lagu, outro, warna latar, banjir warna | Posisi elemen: judul di atas, detail di tengah, HP di bawah (bertumpuk vertikal, bukan kiri–kanan) |
| Font Poppins, ukuran judul 62, pertanyaan 116, "Ga cuma itu" 124, tagar 104 | Skala HP: 1 saat jadi hero, 0,6 saat detail tampil (S3–S7, pusat y 1262), 0,72 di rekap S9 |
| Kemiringan kartu ±7°, bayangan, sudut, desain kotak ikon (S3) dan kotak fitur (S9) | Kotak S3 dan S9 diperkecil utuh (`scale`), bukan didesain ulang |
| Ketukan jari, termasuk ketuk QRIS di layar HP | Lebar kartu S4 (760/700/680), grid jenis aduan 2 kolom |
| Logo pojok, kartu akhir (tagar, ajakan, lambang + badge Google Play) | Beberapa judul dipecah 2 baris agar tidak masuk zona kanan ("Ada / keluhan?", "Mau pasang / baru?") |

## 1. Info Proyek

| Field | Isi |
|---|---|
| Judul | Yuh Kenalan sama Tiray (9:16) |
| Pesan utama | Semua layanan air Tirta Ayu (tagihan, aduan, info gangguan, pasang baru) ada di satu aplikasi: Tiray. |
| Durasi total | 60,0 dtk = 1800 frame (animasi 1557 f + outro Tirta Ayu 243 f, disambung dari frame 51) |
| Rasio · resolusi · fps | 9:16 · 1080×1920 · 30 fps |
| Platform | Instagram Reels, TikTok, YouTube Shorts |
| Target audiens | Awam: pelanggan Tirta Ayu Kab. Tegal, pengguna HP pemula |
| Gaya | #45 Apple-Inspired Interactive Motion dengan palet dan font brand Tirta Ayu (sama dengan 16:9) |
| Audio | **Hanya musik** (tanpa narator, tanpa SFX), sama dengan 16:9 v6. Outro memakai suara aslinya |
| CTA | "Ayo Jakwir, monggo didownload!" + badge Google Play + **#YuhBukaTiray** |
| Aset | `public/ui/01–09-*.png` (data dummy), `public/brand/*`, `public/badge/google-play-id.png`, `public/outro/outro-916-cepat.mp4`, `public/outro/bg916.png` |

## 2. Safe zone 9:16

Atas 0–288 px dan bawah 1536–1920 px tertutup UI platform; kanan x > 950 tertutup tombol like/komentar. Semua teks (judul, pertanyaan, label, tagar, ajakan) berada di y 288–1536 dan x < 950. Yang menyentuh tepi kanan hanya gambar kartu/screenshot di S2, S3, dan S9, bukan teks. Logo pojok berada di zona atas seperti di 16:9 (identitas, bukan informasi). Bukti: `out/storyboard-v2/contact-sheet-safezone.png`.

## 3. Peta lagu (100 BPM, dipotong 0–52 dtk lalu memudar)

`public/audio/music.wav` = lagu user dipangkas 15 ms di awal (supaya ketukan jatuh tepat di frame 17 + 18k), diturunkan 4 dB menjadi **-14,3 LUFS**, puncak -2,6 dBTP. Tidak ada bagian yang disusun ulang.

| Frame | Detik | Bagian lagu | Dipakai untuk |
|---|---|---|---|
| 7–53 | 0,2–1,8 | Hentakan pembuka | Ikon aplikasi mendarat |
| 35–161 | 1,2–5,4 | Hentakan mereda, lalu ketukan kecil | Kalimat hook, satu kata per ketukan |
| 161, 305, 449, 593, 737, 881 | 5,4 · 10,2 · 15,0 · 19,8 · 24,6 · 29,4 | Hentakan besar tiap 2 birama | Awal tiap babak / jawaban |
| 377, 521, 665, 809 | 12,6 · 17,4 · 22,2 · 27,0 | Dentum bass | Ketukan tombol, pertanyaan |
| 935–1097 | 31,2–36,6 | Lagu mereda (breakdown) | Pasang baru: bagian paling tenang |
| 1097–1169 | 36,6–39,0 | Naik (build) | "Ga cuma itu" |
| 1169 | 39,0 | Drop | Semua fitur keluar dari HP |
| 1313, 1457 | 43,8 · 48,6 | Hentakan besar (yang kedua sudah di dalam pudar) | "Semua layanan air" · tagar terkunci |
| 1425–1470 | 47,5–49,0 | Lagu memudar | Tagar terbuka dan terkunci |
| 1470–1506 | 49,0–50,2 | Hening | Ajakan + badge; lalu suara outro masuk di frame 1506 |

## 4. Tabel Scene

Frame global sama dengan 16:9 (`src/timeline.ts`, `T`). Contact sheet: `out/storyboard-v2/contact-sheet-safezone.png`.

| # | Frame | Detik | Latar | Visual 9:16 | Teks layar |
|---|---|---|---|---|---|
| 1 | 0–161 | 0–5,4 | Putih | Ikon aplikasi mendarat di tengah atas (y 840), kalimat hook di bawahnya (y 1180, ukuran 84) | "Yuh kenalan sama / **Tiray**" |
| 2 | 161–305 | 5,4–10,2 | Putih | Ikon membesar jadi HP di tengah (y 1000, lebar 440); dua HP lain mengipas dari belakang | "Aplikasi resmi / **Tirta Ayu**" → "Semua layanan air, / di **HP kamu**" |
| 3 | 305–413 | 10,2–13,8 | Biru | HP tetap di tengah, turun dan mengecil (0,6, y 1262); enam kotak layanan desain 16:9 tersusun 3 × 2 di atasnya (mulai y 476) | "Layanan **lengkap**" |
| 4 | 413–593 | 13,8–19,8 | Putih | Ketuk "Info Tagihan" → HP bawah menampilkan Riwayat Pemakaian; tabel 3 bulan dan kartu Total Tagihan (miring ±7°) di atas HP. Ketuk QRIS di layar HP → numpad, kartu logo QRIS di atas | "Cek tagihan / **3 bulan terakhir**" → "Bayar pakai **QRIS,** / tanpa ribet" |
| 5 | 593–809 | 19,8–27,0 | Putih | Pertanyaan di tengah (y 930) tanpa HP. HP naik ke bawah; 6 jenis aduan dalam 2 kolom + kartu Titik Lokasi/Ambil Bukti di atasnya. Ketuk LAPOR ADUAN → 4 kartu status bertumpuk, "Tuntas" dilingkari | "Ada / **keluhan?**" → "**Lapor** dari HP" → "Pantau **statusnya**" |
| 6 | 809–935 | 27,0–31,2 | Biru | Pertanyaan di tengah, lalu HP naik; 4 pemberitahuan gangguan jatuh bertumpuk di atas HP, miring kiri-kanan bergantian | "Air **mati?**" → "Info gangguan / **langsung masuk**" |
| 7 | 935–1097 | 31,2–36,6 | Putih | Pertanyaan di tengah, lalu HP naik; stepper 4 langkah dan daftar Prosedur Pasang di atas HP; dialog "Pengajuan berhasil dikirim" di tengah | "Mau pasang / **baru?**" → "Daftar dari **HP**" |
| 8 | 1097–1169 | 36,6–39,0 | Biru | Hanya teks di tengah | "Ga cuma itu" + "masih banyak lagi / di **Tiray**" |
| 9 | 1169–1385 | 39,0–46,2 | Putih | HP (0,72) di tengah; 8 kotak fitur desain 16:9 keluar dari HP ke dua kolom kiri dan kanan (4 baris), lalu masuk kembali dan HP mengecil jadi ikon | "Semua di **Tiray**" → "**Semua layanan air**" |
| 10 | 1385–1557 | 46,2–51,9 | Putih | Tagar di tengah (y 960, 104 px), garis bawah biru + tab hijau, kalimat ajakan, lambang + badge Google Play di bawahnya; tab hijau jadi titik hijau di tengah | "**#YuhBukaTiray**" · "Ayo Jakwir, monggo didownload!" |
| — | 1557–1800 | 51,9–60,0 | Outro | `outro-916-cepat.mp4` dari frame 51 | Logo resmi Tirta Ayu |

## 5. Narasi

Tidak ada narator (sama dengan 16:9). Tidak ada SRT. Video tetap dipahami tanpa suara karena setiap fitur punya judul di layar dan ditunjukkan di layar aplikasi asli.

## 6. Catatan Kepatuhan

- Fitur hanya dari daftar resmi Play Store di brand kit. Aduan ditunjukkan sebagai pelacakan status, bukan janji cepat.
- Data di layar = dummy (… CONTOH, 01000000xx, RO00000001). Folder `_original` tidak dipakai.
- Logo tidak diputar, diwarnai ulang, atau diberi efek.
- HP selalu tampil utuh saat diam (tidak terpotong tepi layar).

## 7. Checkpoint Approval

| Checkpoint | Bukti | Status |
|---|---|---|
| Layout 9:16 | `out/storyboard-v2/contact-sheet-safezone.png` | Disetujui 12 Nov 2026 |
| Render v1 | `out/v1.mp4` | Diganti layout v2 atas permintaan user |
| Layout v2 (jendela 16:9) | `out/storyboard-v5/contact-sheet.png` | Disetujui 12 Nov 2026 |
| Render v2 | `out/v2.mp4` | Diganti v3 (logo Pemkab) |
| Render v3 | `out/v3.mp4`: sama dengan v2, label logo Pemkab mengikuti header resmi tegalkab.go.id (lihat storyboard 16:9 bagian 0f) | Menunggu review user |
| Deliverables | `research/deliverables.md` | Selesai |
