# STORYBOARD — Launch Tiray (9:16)

## 1. Info Proyek

| Field | Isi |
|---|---|
| Judul | Yuh Kenalan sama Tiray |
| Pesan utama | Semua urusan air PDAM Tirta Ayu (tagihan, aduan, info gangguan, pasang baru) bisa dari satu aplikasi: Tiray. |
| Referensi | `research/reference/qita-ref.mp4` (iklan Qita by BRI, 54 dtk). Struktur & ritme diikuti, isi dan warna Tiray. |
| Durasi total | 45 dtk = 1350 frame |
| Rasio · resolusi · fps | 9:16 · 1080×1920 · 30 fps |
| Target audiens | Awam: pelanggan PDAM Kab. Tegal, pengguna HP pemula |
| Analogi utama | Tidak ada konsep abstrak. Tiap fitur ditunjukkan langsung lewat layar aplikasi asli. |
| Gaya terpilih | #12 Swiss Internasional (grid bersih, lompatan skala ekstrem, mask reveal) **diadaptasi ke brand Tiray**: putih `#ffffff` / biru `blue-800 #244da9` bergantian, ink `#16243b`, aksen hijau `#30b349` (grafis saja), font Poppins 800/600. Radius kartu 28–36 px mengikuti UI aplikasi. |
| Komponen | Mockup HP 3D (CSS perspective), kipas layar (FanSpread), bento grid reveal, stepper sambungan baru dibangun ulang dari UI asli |
| Audio | Musik saja (tanpa narator) + SFX terikat animasi. BGM usulan **B26** (Framer/Linear SaaS Groove). VO dibuat user nanti dari `research/vo-prompt.md` + `out/v1-vo-guide.srt`. |
| Platform | IG Reels, TikTok, YouTube Shorts |
| CTA | "Ayo Jakwir, monggo didownload!" + badge Google Play + **#YuhBukaTiray** |
| Brand yang muncul | Tirta Ayu (logo resmi brand-kit), Tiray (nama app diketik Poppins, ikon = lambang Tirta Ayu), QRIS (hanya di dalam screenshot asli), Google Play (badge resmi) |
| Aset user | `public/ui/01–09-*.png` (screenshot dummy data), `public/brand/*.svg`, `public/badge/google-play-id.png` |

## 2. Tabel Scene

Pemetaan ke referensi: kotak→logo→"Yuk kenalan" (S1), HP kosong→isi→kipas (S2), judul fitur besar + layar (S3–S6), "Ga cuma itu" + kolase (S7), hashtag (S8), logo (S9).

| # | Frame | Detik | Latar | Visual (hero tengah) | Teks layar | Motion & Cam | Out | SFX |
|---|---|---|---|---|---|---|---|---|
| 1 | 0–105 | 0–3,5 | Putih | Kotak rounded biru outline → mengisi → berubah jadi ikon app (lambang Tirta Ayu di kotak putih) di tengah | "Yuh" → "Yuh kenalan sama **Tiray**" (kata per kata, ikon naik ke atas memberi ruang) | Scale-in spring, teks dari bawah mask. HOLD 1.0 | portal-zoom-in | pop-in (kotak), tick (tiap kata) |
| 2 | 105–270 | 3,5–9 | Putih → biru | Garis HP tergambar → layar terisi biru → Beranda Tiray muncul, HP miring 3D lalu tegak; push-in ke grid LAYANAN; lalu 5 layar mengipas di belakang | "Aplikasi resmi **Tirta Ayu**" → "Semua urusan air di HP kamu" | Rotasi 3D Y -24°→0°, push 1.0→1.25, kipas spring | whip-glide-up | transition-maximize (HP terisi), pop-pluck ×4 (kipas) |
| 3 | 270–450 | 9–15 | Biru → putih | "Tagihan" raksasa → "Cek Tagihan"; HP Riwayat Pemakaian naik, sorot 3 baris bulan; jari ketuk tombol BAYAR DENGAN QRIS → layar ganti ke numpad QRIS | "Cek Tagihan" · "3 bulan terakhir" · "Bayar pakai QRIS" | Teks scale 1.3→1 mask, HP slide up, sorot baris, tap scale | whip-glide-left | impact-soft (judul), click (tap), transition-swipe (ganti layar) |
| 4 | 450–630 | 15–21 | Putih | "Lapor" → "Lapor Aduan"; HP form aduan, sorot Titik Lokasi + Ambil Bukti Foto; lalu daftar aduan dengan badge **Tuntas** disorot | "Lapor Aduan" · "Foto + lokasi" · "Pantau statusnya" | Teks kiri rata, HP masuk kanan, crossfade layar, push-in ke badge | whip-glide-up | impact-soft, click, confirm-chime (sorot Tuntas) |
| 5 | 630–780 | 21–26 | Biru | "Air mati?" → "Info Gangguan"; kartu info gangguan bertanggal (dipotong dari screenshot asli) jatuh bertumpuk satu per satu | "Info Gangguan" · "langsung di HP kamu" | Kartu drop stagger 8f, kamera HOLD | whip-glide-left | pop-drop ×3 |
| 6 | 780–930 | 26–31 | Putih | "Pasang Baru"; stepper Identitas → Alamat → Dokumen → Konfirmasi tercentang berurutan (direkonstruksi dari UI asli); dialog "Pengajuan berhasil dikirim" pop | "Pasang Baru" · "daftar cukup dari HP" | Stepper fill bertahap, dialog spring | portal-zoom-in | tick ×4, confirm-glass (dialog) |
| 7 | 930–1110 | 31–37 | Biru → putih | "Ga cuma itu" → "satu aplikasi" → "buat semua urusan air"; bento grid 4 kartu layar (Tagihan, Aduan, Gangguan, Pasang Baru) muncul berurutan lalu zoom-out rekap | "Satu aplikasi, semua urusan air" | Kinetic word swap, BentoGridReveal, zoom-out 1.1→1.0 | spring-sheet-up | transition-swoosh, pop-in ×4 |
| 8 | 1110–1215 | 37–40,5 | Putih | **#YuhBukaTiray** besar, huruf masuk per suku kata, garis biru di bawah menggambar | "#YuhBukaTiray" | Mask reveal kiri→kanan, HOLD | match-cut | impact-punch |
| 9 | 1215–1350 | 40,5–45 | Putih | Logo vertikal Tirta Ayu (warna), "Tiray" + "Ayo Jakwir, monggo didownload!", badge Google Play, #YuhBukaTiray kecil | CTA | Logo fade+scale 0.92→1 (tanpa distorsi), HOLD akhir 2 dtk | END | ding-bell (logo) |

## 3. Draf Narasi (untuk VO user nanti, ±2,5 kata/dtk)

| # | Teks narasi | Kata / budget |
|---|---|---|
| 1 | Hai Jakwir Air! Yuh kenalan sama Tiray. | 7 / 8 (hook) |
| 2 | Aplikasi resmi Tirta Ayu, semua urusan air ada di HP kamu. | 11 / 13 |
| 3 | Cek tagihan tiga bulan terakhir, terus bayar langsung pakai QRIS. | 10 / 15 |
| 4 | Ada keluhan? Lapor lewat aplikasi, lalu pantau statusnya sampai tuntas. | 10 / 15 |
| 5 | Air lagi mati? Info gangguan langsung muncul di HP kamu. | 10 / 12 |
| 6 | Mau pasang sambungan baru? Daftar cukup dari HP. | 8 / 12 |
| 7 | Satu aplikasi buat tagihan, aduan, info gangguan, sampai pasang baru. | 10 / 15 |
| 8 | Yuh buka Tiray! | 3 / 8 |
| 9 | Ayo Jakwir, monggo didownload di Google Play! | 7 / 11 (cta) |

Istilah teknis: **QRIS** (1), ditunjukkan dengan logo QRIS di layar asli. Tidak ada singkatan lain.

## 3b. Safe Zone (9:16)

Semua teks penting di y 300–1520 px dan x 60–940 px. HP mockup boleh melewati zona atas/bawah hanya untuk bagian layar yang tidak penting.

## 4. Catatan Kepatuhan

- Fitur hanya dari daftar resmi Play Store (brand kit). Tidak menjanjikan aduan cepat: yang ditampilkan "pantau statusnya".
- Data di layar = dummy (CONTOH, 01000000xx, RO00000001).
- Logo tidak diputar/distorsi; ikon app = lambang Tirta Ayu di kotak putih.
- Badge Google Play: file resmi Google (`id_badge_web_generic.png`), tidak diubah warnanya.
- Warna "recommended" (gold, green-700) tidak dipakai sebagai elemen kunci.

## 5. Versi 16:9 (v11-169)

- Komposisi `MainVideoV3W` (1920×1080, 30 fps, 1557 frame + outro dari frame 51 = 1800 frame / 60 dtk). Kode: `src/v3w/` (kitW, scenesW, MainVideoV3W).
- Batas scene, timing lokal, dan musik sama persis dengan v11 (`B3` di `src/v3/kit3.tsx`).
- Tata letak: kalimat tanya (Ada keluhan?, Air mati?, Mau pasang baru?, Ga cuma itu) di tengah; beat isi = teks kiri (x 150) + HP/screenshot kanan (pusat x 1390, y 580). S3: 6 tile 3×2 di kanan. S9: bento lebar diskalakan 1,34×.
- Outro: `outro_tirta_ayu_16x9_final_v1_cepat.mp4`. Tab hijau → titik gabungan di (959,539) Ø62 → 172/220/232 (frame outro 47–50), outro disambung dari frame 51, audio outro adelay 50,2 dtk.
- Contact sheet: `out/storyboard/v11-169-sheet-b.png`.
