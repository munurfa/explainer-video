# Prompt VO — Launch Tiray (v1)

Video `out/v1.mp4` (45 dtk, 9:16) dibuat tanpa narator. Dokumen ini untuk membuat VO sendiri, lalu VO dipasang di atas video (musik diturunkan ±6 dB saat narator bicara).

File timing: `out/v1-vo-guide.srt` (satu baris per scene, sudah pas dengan potongan gambar). Total 76 kata, ±2,5 kata/detik.

## Prompt gaya suara (untuk Gemini TTS / ElevenLabs / pengisi suara)

> Narator pria atau wanita usia 25–35, suara hangat dan ramah seperti kakak yang memberi tahu tetangga, bukan penyiar formal. Bahasa Indonesia santai dengan sedikit rasa Tegal (kata "Jakwir", "Yuh", "monggo" diucapkan natural, tidak dibuat-buat). Tempo sedang, ±2,5 kata per detik, senyum terdengar di suara. Semangat di pembuka dan penutup, lebih tenang dan jelas saat menyebut fitur. Jeda singkat setelah tanda tanya. Ucapkan "QRIS" sebagai "kyu-ris", "Tiray" sebagai "ti-rai".

## Naskah per scene

| # | Waktu | Naskah | Arahan | Patokan gambar |
|---|---|---|---|---|
| 1 | 0,3–3,3 | Hai Jakwir Air! Yuh kenalan sama Tiray. | semangat, menyapa | ikon app muncul, teks "Yuh kenalan sama Tiray" |
| 2 | 3,7–8,7 | Aplikasi resmi Tirta Ayu, semua urusan air ada di HP kamu. | yakin, hangat | HP Beranda, lalu kipas layar (±7,7 dtk) |
| 3 | 9,3–14,7 | Cek tagihan tiga bulan terakhir, terus bayar langsung pakai QRIS. | jelas | "3 bulan" disorot ±11,4 dtk; tombol QRIS diketuk ±12,7 dtk |
| 4 | 15,3–20,7 | Ada keluhan? Lapor lewat aplikasi, lalu pantau statusnya sampai tuntas. | empati, lalu tenang | foto+lokasi ±17,1 dtk; badge Tuntas ±19,5 dtk |
| 5 | 21,2–25,7 | Air lagi mati? Info gangguan langsung muncul di HP kamu. | peduli | kartu gangguan jatuh ±22,5 dtk |
| 6 | 26,2–30,7 | Mau pasang sambungan baru? Daftar cukup dari HP. | ringan | stepper ±27,6 dtk; dialog berhasil ±29,3 dtk |
| 7 | 31,3–36,7 | Satu aplikasi buat tagihan, aduan, info gangguan, sampai pasang baru. | merangkum, naik | grid 4 fitur muncul ±34,3 dtk |
| 8 | 37,4–40,2 | Yuh buka Tiray! | semangat, tegas | #YuhBukaTiray |
| 9 | 40,8–44,5 | Ayo Jakwir, monggo didownload di Google Play! | ajakan, senyum | logo + badge Google Play |

## Cara pasang

1. Rekam/generate per baris, potong hening di awal-akhir.
2. Taruh tiap klip di waktu mulai SRT (boleh geser ±0,3 dtk).
3. Kalau dikirim balik ke saya sebagai `public/audio/narration.mp3`, saya bisa render v2 dengan VO + ducking musik otomatis + caption.

---

## Update v2 (`out/v2.mp4`, timing: `out/v2-vo-guide.srt`)

Prompt gaya suara sama dengan di atas. Naskah dan patokan gambar v2:

| # | Waktu | Naskah | Patokan gambar v2 |
|---|---|---|---|
| 1 | 0,3–3,7 | Hai Jakwir Air! Yuh kenalan sama Tiray. | kotak jadi ikon ±0,8 dtk; "Yuh kenalan sama Tiray" ±2,0 dtk |
| 2 | 4,1–8,7 | Aplikasi resmi Tirta Ayu, semua urusan air ada di HP kamu. | layar Beranda tersusun ±4,7 dtk; kipas layar ±7,2 dtk |
| 3 | 9,2–14,7 | Cek tagihan tiga bulan terakhir, terus bayar langsung pakai QRIS. | "Tagihan" ±9,0 dtk; 3 baris bulan ±11,1 dtk; tombol diketuk ±12,8 dtk |
| 4 | 15,2–20,7 | Ada keluhan? Lapor aduan, kirim lokasi dan foto, lalu pantau statusnya. | lokasi & foto ±17,1 dtk; badge Tuntas ±18,4 dtk |
| 5 | 21,2–25,7 | Air lagi mati? Info gangguan langsung muncul di HP kamu. | "mati?" mendarat ±21,7 dtk; kartu jatuh ±22,1 dtk |
| 6 | 26,2–30,7 | Mau pasang baru? Daftar cukup dari HP. | stepper ±28 dtk; dialog berhasil ±29,6 dtk |
| 7 | 31,2–37,2 | Ga cuma itu, info pelanggan dan pemakaian juga ada. Satu aplikasi, semua urusan air. | info pelanggan ±32,9 dtk; rangkuman fitur ±34,5 dtk |
| 8 | 37,6–40,3 | Yuh buka Tiray! | #YuhBukaTiray ±38,6 dtk |
| 9 | 40,8–44,5 | Ayo Jakwir, monggo didownload di Google Play! | logo + badge Google Play |

## Update v3 (`out/v3.mp4`, timing: `out/v3-vo-guide.srt`)

The voice style prompt is the same as above. Video is 57 s with Q2 background music (the tempo gets faster toward the end), so the narrator may get a little more upbeat from cue 8 onward. Script and v3 visual cues:

| # | Time (s) | Script | v3 visual cue |
|---|---|---|---|
| 1 | 0.3–4.5 | Hai Jakwir Air! Yuh kenalan sama Tiray. | squircle becomes the emblem; "Tiray" grows |
| 2 | 5.1–10.5 | Aplikasi resmi Tirta Ayu, semua layanan air ada di HP kamu. | blue phone is built; coverflow of 5 screens ±8.6 s |
| 3 | 11.0–14.2 | Semua layanannya tinggal pilih. | LAYANAN icons pop out as tiles |
| 4 | 14.7–20.5 | Cek tagihan tiga bulan terakhir, terus bayar langsung pakai QRIS. | "Tagihan" card ±15 s; QRIS ring ±18.7 s; customer number typed ±20 s |
| 5 | 21.0–26.6 | Ada keluhan? Lapor dari HP, kirim lokasi dan foto, lalu pantau statusnya. | location & photo ±23 s; Tuntas badge ±26 s |
| 6 | 27.2–31.6 | Air mati? Info gangguan langsung masuk ke HP kamu. | notification stack falls in ±28.9 s |
| 7 | 32.1–36.9 | Mau pasang baru? Daftar cukup dari HP. | stepper checks ±34.4 s; success dialog ±36.1 s |
| 8 | 37.4–41.4 | Ga cuma itu, info pelanggan dan pemakaian juga ada. | blue wipe; customer info ±39.5 s |
| 9 | 42.0–48.7 | Tagihan, aduan, info gangguan, sampai pasang baru, semua di Tiray. | feature bento ±43.3 s |
| 10 | 49.3–52.4 | Yuh buka Tiray! | #YuhBukaTiray ±50 s |
| 11 | 53.0–56.6 | Ayo Jakwir, monggo didownload di Google Play! | logo, CTA, Google Play badge |

Total 89 words, ±1.9 words/second on average (below the 2.5 limit, so the narrator is not rushed).
