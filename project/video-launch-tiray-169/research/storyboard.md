# STORYBOARD — Launch Tiray 16:9 (desain ulang, v6)

Status: storyboard **disetujui user** (12 Nov 2026). `out/v1.mp4`–`out/v5.mp4` direvisi user, **`out/v6.mp4` disetujui** (12 Nov 2026).

## 0. Revisi v2 (masukan user atas v1, 12 Nov 2026)

| # | Permintaan | Perubahan |
|---|---|---|
| 1 | Musik berhenti pelan sampai detik 48, lalu kosong sampai musik outro | Musik memudar dari f 1313 (hentakan terakhir, 43,8 dtk) dan sunyi penuh di f 1440 (48,0 dtk). Hening sampai suara outro mulai di f 1506 (50,2 dtk). Konstanta `MUSIC_FADE` / `MUSIC_END` di `src/timeline.ts` |
| 2 | Tidak suka HP yang terpotong di bawah (scene 3). Kalau tidak bisa utuh, hilangkan atau taruh di samping dan grid menu 2 baris | Scene 3: HP **utuh** bergeser ke kiri (pusat x 470), enam layanan tersusun **3 × 2** di kanannya, sama seperti grid LAYANAN di aplikasi. Scene 5, 6, 7: saat pertanyaan tampil HP keluar layar sepenuhnya (tidak lagi mengintip), pertanyaan pindah ke tengah layar (y 520) |

## 0b. Revisi v3 (masukan user atas v2, 12 Nov 2026)

| # | Permintaan | Perubahan |
|---|---|---|
| 1 | Musik jangan terlalu pelan di akhir, dan tambah sampai detik 49 | Musik tetap penuh sampai f 1425 (47,5 dtk), memudar 1,5 dtk, sunyi di f 1470 (49,0 dtk). Hening 1,2 dtk sampai suara outro di f 1506. Gambar tidak berubah dari v2 |

## 0c. Revisi v4 (masukan user atas v3, 12 Nov 2026)

| # | Permintaan | Perubahan |
|---|---|---|
| 1 | Ikon aplikasi di kartu akhir pindah ke kiri "#", tingginya mengikuti tinggi huruf | Setelah HP mengecil jadi ikon (f 1385), ikon turun ke kiri "#" (f 1387–1411) dan ikut bergeser bersama "#Yuh". Ukuran 78 px = tinggi huruf kapital (72–82 px), pusat y 496. Ikon + tagar dipusatkan sebagai satu kelompok (`DOCK`, `L0` di `src/stage.tsx`) |
| 2 | Logo kanan atas disamakan ukurannya dengan logo + label kiri atas | Lambang Tirta Ayu kini tampil 81 px (sama dengan lambang Pemkab), logotype 64 px setara label "PEMERINTAH KABUPATEN TEGAL" (`Corner` di `src/kit.tsx`). Berlaku di seluruh video |

## 0d. Revisi v5 (masukan user atas v4, 12 Nov 2026)

| # | Permintaan | Perubahan |
|---|---|---|
| 1 | Logo di samping "#" diperbesar, sama dengan logo di awal video | Ikon di kartu akhir kini kotak 300 px, sama dengan ikon pembuka (`DOCK.s = ICON.s`), dengan bezel, lambang, dan bayangan yang sama. HP mengecil langsung ke ukuran itu. Supaya kotak tidak menabrak, kalimat ajakan dan badge Google Play dipusatkan di bawah tagar (`COL_X`), bukan di tengah layar |

## 0e. Revisi v6 (masukan user atas v5, 12 Nov 2026)

| # | Permintaan | Perubahan |
|---|---|---|
| 1 | Kurangi jarak antara garis bawah, "Ayo Jakwir", dan badge Google Play | Kalimat ajakan dari UL + 74 ke UL + 58; badge dari UL + 122 ke y 673 (bagian hitamnya mulai y 690). Celah garis–kalimat ±37 px, kalimat–badge ±25 px (sebelumnya ±50 px) |
| 2 | Hilangkan kotak pada logo, pindah ke kiri badge Google Play, tinggi disamakan | Setelah HP mengecil jadi ikon, kotak putih memudar (f 1385–1399) dan tinggal lambang polos. Lambang memudar di atas tagar (f 1439–1453), lalu muncul kembali di kiri badge bersamaan dengan badge (f 1465–1485), setinggi bagian hitam badge (113 px). Lambang + badge dipusatkan sebagai satu baris (`BADGE`, `BADGE_X` di `src/stage.tsx`); tagar kembali di tengah layar. Lambang tidak terbang melintas karena akan menimpa tagar |

v1–v5 tidak ditimpa. Tabel scene di bawah sudah mengikuti v6.

## 0f. Revisi v7 (logo Pemkab, 14 Nov 2026)

| # | Permintaan | Perubahan |
|---|---|---|
| 1 | Label "PEMERINTAH" sama panjang dengan "KABUPATEN TEGAL", sedikit lebih tebal | Huruf PEMERINTAH direnggangkan rata selebar baris kedua, tebal 700 |
| 2 | Posisi lambang dan label disamakan dengan header resmi tegalkab.go.id (`logo_header.png`) | Proporsi diukur dari header resmi lalu diskalakan ke lambang 84 px: jarak lambang–teks 15 px, PEMERINTAH ukuran 24 (tinggi huruf 18 px), KABUPATEN TEGAL ukuran 29 tebal 800 (tinggi huruf 22 px), blok teks di dalam tinggi lambang. Berlaku juga di 9:16 |

Semua adegan lain sama dengan v6.

## 1. Info Proyek

| Field | Isi |
|---|---|
| Judul | Yuh Kenalan sama Tiray (16:9) |
| Pesan utama | Semua layanan air Tirta Ayu (tagihan, aduan, info gangguan, pasang baru) ada di satu aplikasi: Tiray. |
| Referensi | `project/video-launch-tiray/out/v11-169.mp4`. Isi, fitur, logo pojok, dan penutup mengikuti v11-169. Tata letak, gerakan, dan transisi dirancang baru. |
| Durasi total | 60,0 dtk = 1800 frame (animasi 1557 f + outro Tirta Ayu 243 f) |
| Rasio · resolusi · fps | 16:9 · 1920×1080 · 30 fps |
| Target audiens | Awam: pelanggan Tirta Ayu Kab. Tegal, pengguna HP pemula |
| Analogi utama | Tidak ada konsep abstrak. Tiap fitur ditunjukkan lewat layar aplikasi asli: ketuk di HP → layar berubah → detailnya membesar ke samping. |
| Gaya terpilih | #45 Apple-Inspired Interactive Motion (aksi yang terlihat → respons yang bisa dijelaskan), memakai palet dan font brand Tirta Ayu. Ditolak: #43 Motion Reel Editorial (font serif + rangka layar bukan milik brand), #12 Swiss (sudah dipakai di v1, terlalu kaku untuk lagu ini). |
| Palet · font | Putih `#ffffff` / biru `blue-800 #244da9` bergantian, ink `#16243b`, sky `#9bd5ef`, hijau `#30b349` hanya grafis. **Poppins** 600/700 (font utama brand). Label Pemkab tetap Plus Jakarta Sans seperti v11. |
| Audio | **Hanya musik** (tanpa narator, tanpa SFX): lagu dari user `research/source/lnplusmusic-product-product-launch-611921.mp3`. Outro memakai suara aslinya. |
| Platform | YouTube, layar TV/videotron, presentasi (16:9) |
| CTA | "Ayo Jakwir, monggo didownload!" + badge Google Play + **#YuhBukaTiray** |
| Brand yang muncul | Pemkab Tegal (lambang resmi), Tirta Ayu (lambang + logotype dari brand kit), Tiray (ikon = lambang Tirta Ayu di kotak putih), QRIS (hanya dari screenshot asli), Google Play (badge resmi) |
| Aset | `public/ui/01–09-*.png` (screenshot, data dummy), `public/brand/*`, `public/badge/google-play-id.png`, `public/outro/outro-169-cepat.mp4` |

## 2. Yang berubah dari v11-169

| Aspek | v11-169 | v1 (video ini) |
|---|---|---|
| Tata letak | Teks di kiri, HP/screenshot di kanan (adaptasi dari 9:16) | **Judul di atas-tengah, satu HP di tengah, detail membesar di kiri dan kanan** (dirancang untuk layar lebar) |
| HP | Muncul dan hilang tiap scene | **Satu HP yang sama dari awal sampai akhir**: lahir dari ikon aplikasi, keluar ke bawah saat ada pertanyaan, naik saat menjawab, lalu kembali jadi ikon. Selalu tampil utuh |
| Cara fitur muncul | Screenshot/teks masuk dari samping | **Ketuk di layar → layar berganti → potongan layar membesar keluar dari HP** |
| Pergantian warna | Wipe biru dari bawah | Warna latar "membanjir" dari HP atau dari tepi bawah layar, tepat di hentakan lagu |
| Ritme | Mengikuti musik lama (tempo naik 98→131 BPM) | Dikunci ke lagu baru: 100 BPM tetap, 1 ketukan = 18 frame, 1 birama = 72 frame |
| Font | Plus Jakarta Sans | Poppins (font utama brand) |
| Rekap | Bento lebar 8 kotak tanpa HP | 8 kotak fitur keluar dari HP satu per ketukan, lalu masuk kembali ke HP |
| Penutup | #YuhBukaTiray + badge → titik hijau → outro | Sama, ditambah kalimat "Ayo Jakwir, monggo didownload!" dan lambang di kiri badge (v6) |

Yang **tetap**: logo pojok (Pemkab Tegal kiri, Tirta Ayu kanan), semua screenshot dan data dummy, daftar fitur resmi, sambungan titik hijau ke outro (frame outro 47–50, disambung dari frame 51).

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

Frame global, sumber kebenaran: `src/timeline.ts` (`T`). Contact sheet: `out/storyboard/contact-sheet-a.png` (scene 1–5) dan `contact-sheet-b.png` (scene 6–10 + outro).

| # | Frame | Detik | Latar | Visual (hero tengah) | Teks layar | Gerak | Lagu |
|---|---|---|---|---|---|---|---|
| 1 | 0–161 | 0–5,4 | Putih | Ikon aplikasi Tiray (lambang Tirta Ayu di kotak putih) mendarat di tengah | "Yuh kenalan sama **Tiray**" | Ikon scale-in f 3–25; kata naik dari mask di f 35, 53, 71, 89 (kalimat lengkap di detik 3,5); tahan sampai f 147 | Hentakan pembuka, lalu ketukan kecil |
| 2 | 161–305 | 5,4–10,2 | Putih | Ikon membesar jadi HP (Beranda Tiray). Lalu dua HP lain (Tagihan, Info Gangguan) mengipas dari belakang | "Aplikasi resmi **Tirta Ayu**" → "Semua layanan air, di **HP kamu**" | Morph ikon→HP f 149–173; kipas f 233–259, masuk lagi f 285–303 | Hentakan 161; birama 3 di 233 |
| 3 | 305–413 | 10,2–13,8 | Biru (banjir dari HP) | HP bergeser ke kiri (tetap utuh); enam ikon layanan terangkat dari layar Beranda dan tersusun 3 × 2 di kanannya | "Layanan **lengkap**" | Satu ikon per ketukan: f 305, 323, 341, 359, 377, 395 | Hentakan 305 |
| 4 | 413–593 | 13,8–19,8 | Putih (banjir dari HP) | Jari mengetuk "Info Tagihan" → ikon itu masuk ke HP → HP kembali ke tengah dengan layar Riwayat Pemakaian. Kiri: tabel 3 bulan, baris muncul per ketukan. Kanan: Total Tagihan + tombol QRIS. Ketuk tombol QRIS → layar numpad, nomor sambungan terketik; kanan: logo QRIS dari layar asli | "Cek tagihan **3 bulan terakhir**" → "Bayar pakai **QRIS,** tanpa ribet" | Ketuk f 413; ikon masuk HP f 421–435; baris f 453, 471, 489; ketuk QRIS f 521; ketik f 545–575 | Hentakan 449; dentum 521 |
| 5 | 593–809 | 19,8–27,0 | Putih | Pertanyaan besar di tengah layar, tanpa HP. HP naik (form aduan): kiri 6 jenis aduan, kanan tombol Titik Lokasi + Ambil Bukti Foto/Video. Ketuk LAPOR ADUAN → daftar aduan; 4 kartu status keluar, "Tuntas" dilingkari hijau | "Ada **keluhan?**" → "**Lapor** dari HP" → "Pantau **statusnya**" | Tanya f 593–625; HP naik f 635–659; jenis aduan f 651–681; ketuk f 737; kartu f 749–770; lingkar f 777 | Hentakan 593; dentum 665; hentakan 737 |
| 6 | 809–935 | 27,0–31,2 | Biru (banjir dari bawah) | Pertanyaan, lalu HP naik (layar Info Gangguan); 4 pemberitahuan gangguan jatuh dari atas seperti notifikasi, kiri-kanan bergantian | "Air **mati?**" → "Info gangguan **langsung masuk**" | Tanya f 809–835; HP naik f 845–869; kartu f 855, 865, 875, 885 | Dentum 809; hentakan 881 |
| 7 | 935–1097 | 31,2–36,6 | Putih (banjir dari bawah) | Pertanyaan, lalu HP naik (form sambungan baru). Kiri: 4 langkah (Identitas → Alamat → Dokumen → Konfirmasi) tercentang berurutan. Kanan: daftar Prosedur Pasang tercentang bersamaan. Dialog "Pengajuan berhasil dikirim" muncul di tengah | "Mau pasang **baru?**" → "Daftar dari **HP**" | Tanya f 935–973; HP naik f 983–1007; centang f 1007, 1019, 1031, 1043; dialog f 1055 | Lagu mereda |
| 8 | 1097–1169 | 36,6–39,0 | Biru (banjir dari bawah) | Hanya teks, kamera mendorong pelan 5% | "Ga cuma itu" + "masih banyak lagi di **Tiray**" | Baris 1 f 1099, baris 2 f 1115, keluar f 1157 | Build |
| 9 | 1169–1385 | 39,0–46,2 | Putih (banjir dari bawah) | HP naik ke tengah; 8 kotak fitur terbang keluar dari HP (Tagihan, Info gangguan, Bayar QRIS, Pasang baru, Lapor aduan, Info pelanggan, Pantau status aduan, Info pemakaian air). Lalu semua masuk kembali ke HP dan HP mengecil jadi ikon | "Semua di **Tiray**" → "**Semua layanan air**" | HP naik f 1165–1189; satu kotak per ketukan f 1169–1295; denyut f 1313; masuk f 1345–1368; HP→ikon f 1355–1385 | Drop 1169; hentakan 1313 |
| 10 | 1385–1557 | 46,2–51,9 | Putih | Kotak ikon memudar, lambang polos tetap di atas lalu memudar (f 1439–1453). Tagar di tengah layar terbuka dari "#Yuh"; garis bawah biru + tab hijau; kalimat ajakan dan badge Google Play rapat di bawah garis; lambang muncul lagi di kiri badge, setinggi badge (113 px). Tab hijau meluncur ke tengah jadi titik hijau outro | "**#YuhBukaTiray**" · "Ayo Jakwir, monggo didownload!" | #Yuh f 1389; BukaTiray f 1419–1445; garis f 1451; badge f 1465; keluar f 1517; titik f 1531–1556 | Dentum 1385; memudar f 1425–1470; hening; suara outro dari f 1506 |
| — | 1557–1800 | 51,9–60,0 | Outro | `outro-169-cepat.mp4` dari frame 51 (cipratan tetes air → panah daur → logotype emas → layar biru) | Logo resmi Tirta Ayu | Video asli, tidak diubah | Suara asli outro (mulai f 1506) |

### Perubahan teks dari v11-169 (mohon dicek)

| v11-169 | v1 | Alasan |
|---|---|---|
| "masih banyak yang bisa Tiray bantu" | "masih banyak lagi di Tiray" | Bagian build lagu hanya 2,4 dtk; 6 kata tidak sempat terbaca |
| "Info pelanggan & pemakaian" (beat sendiri) | Menjadi dua kotak di rekap | Sama alasannya; isinya tetap tampil |
| "Tagihan · Cek dan bayar dari HP" (kartu kaca) | Dihapus | Digantikan aksi ketuk ikon "Info Tagihan" |
| "Bayar pakai QRIS tanpa ribet" | "Bayar pakai QRIS, tanpa ribet" | Satu baris, butuh koma |
| (tidak ada) | "Ayo Jakwir, monggo didownload!" di bawah tagar | Kalimat penutup resmi brand, layar lebar punya ruangnya |

## 5. Narasi

Tidak ada narator (sama seperti v11-169, sesuai jawaban Stage 0). Stage 3 (naskah VO) dan Stage 4 (suara) dilewati. Video harus dipahami tanpa suara: setiap fitur punya judul di layar dan ditunjukkan di layar aplikasi asli. Kalau nanti mau ditambah VO, panduan SRT bisa dibuat dari tabel di atas.

Istilah teknis: **QRIS** (1 dari maks 3), ditunjukkan dengan tombol dan logo QRIS dari layar asli.

## 6. Catatan Kepatuhan

- Fitur hanya dari daftar resmi Play Store di brand kit. Aduan: yang ditunjukkan pelacakan status ("Pantau statusnya"), bukan janji cepat.
- Data di layar = dummy (… CONTOH, 01000000xx, RO00000001). Folder `_original` tidak dipakai.
- Logo tidak diputar, diwarnai ulang, atau diberi efek. Ikon aplikasi = lambang Tirta Ayu di kotak putih.
- Stepper 4 langkah di kartu kiri scene 7 dibangun ulang dari UI asli (label dan urutan sama) karena screenshot-nya tertutup lapisan gelap. Tidak ada layar atau fitur karangan.
- Tanpa pill di belakang teks, tanpa titik/ikon hiasan (`lint.mjs` PASS). Lingkaran ketuk = penunjuk sentuhan (pengganti kursor), hanya muncul saat ada aksi.
- Safe zone 16:9: semua teks dan kartu berada di x 90–1830, y 52–1040.
- Rating dan jumlah unduhan tidak ditampilkan, jadi tidak perlu dicek ulang.

## 7. Checkpoint Approval

| Checkpoint | Bukti | Status |
|---|---|---|
| Storyboard | Tabel ini + `out/storyboard/contact-sheet-a.png`, `contact-sheet-b.png` | Disetujui 12 Nov 2026 |
| Naskah VO · suara | Dilewati (tanpa narator) | — |
| Render | `out/v6.mp4` (still kartu akhir: `out/qa-stills/v6-dock.png`) | Disetujui 12 Nov 2026 |
| Render v7 (logo Pemkab) | `out/v7.mp4` | Menunggu review user |
| Deliverables | `research/deliverables.md` (judul, deskripsi, hashtag) | Selesai 12 Nov 2026 |
