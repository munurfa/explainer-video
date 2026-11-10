# Analisa Ulang Referensi (Qita by BRI, 54,5 dtk) vs v1

Sumber: `research/reference/qita-ref.mp4` (sama persis dengan file WhatsApp 3 Nov). Frame tiap 0,5 dtk: `research/reference/ref-2fps-0..5.png`; v1 pembanding: `out/storyboard/v1-2fps-0..4.png`.

## Fakta teknis
- Hanya **4 hard cut** (26,3 · 34,0 · 40,6 · 51,8 dtk). Sisanya transisi bersambung (morph).
- Tanpa narator (faster-whisper + VAD: 0 segmen ucapan). Musik saja, **-11,8 LUFS** (v1: -21,7; v1-social: -14,2).
- Ganti "shot" tiap ±1–1,5 dtk. Hampir tidak ada frame diam.
- Logo brand menempel di pojok atas sepanjang video (Danantara kiri, Qita kanan).

## Teknik yang dipakai referensi (dan belum ada di v1)
| # | Detik | Teknik | Di v1 |
|---|---|---|---|
| 1 | 1–3 | **Morph bentuk → logo**: kotak outline → huruf Q → wordmark Qita utuh | Kotak → ikon, lalu teks terpisah |
| 2 | 4–5,5 | **Teks melahirkan objek**: kalimat "Yuk kenalan sama Qita" memudar, garis HP tumbuh dari posisinya | Teks hilang, HP baru muncul dari kosong |
| 3 | 6–11 | **Layar dibangun berlapis**: HP besar miring 3D, isi beranda muncul elemen per elemen (header, kartu saldo, ikon stagger) | Screenshot muncul sekaligus |
| 4 | 12–14 | **Kipas lebar coverflow**: 5 layar berjajar horizontal sampai keluar frame, kamera mundur | Kipas kecil di bawah |
| 5 | 14,5–17 | **Kata raksasa + motion blur + pita kaca blur** ("Instant" → "Instant Update" → mengecil jadi "Fitur baru tanpa menunggu") | Kata raksasa diam lalu potong |
| 6 | 17,5–19 | **Ikon 3D mengembang jadi dinding ikon** penuh layar, latar ikut berubah biru | Tidak ada |
| 7 | 22–26 | **Media di tengah kalimat**: "tanpa [tumpukan kartu] ribet", kata membelah memberi ruang | Tidak ada |
| 8 | 27–29 | **Ukuran kata kontras dalam satu baris** ("Pantau *semua* aset"), kotak kecil muncul di antara kata lalu membesar jadi layar | Satu ukuran per baris |
| 9 | 30–33,5 | **Crop UI raksasa**: hanya bagian atas layar, sangat besar, tab berganti & angka berubah | Selalu HP utuh 470 px |
| 10 | 34–40 | **Swap kata cepat** di latar biru, logo di tengah kalimat ("yang bisa [Qita] lakukan"), teks lebih lebar dari frame bergeser | Ada swap, tapi pelan dan ada frame kosong |
| 11 | 40,5–49,5 | **Bento raksasa + pan kamera**: kartu tengah, kartu lain terbang dari tepi, kamera menggeser ke klaster berikutnya (3 klaster) | Bento 4 kartu diam |
| 12 | 49,5–52,5 | Kata blur besar "Cara" → hashtag → wipe biru muda → logo di latar biru, selesai cepat | Hashtag lalu end card ±5 dtk |

## Kelemahan v1 (kenapa terasa sederhana)
1. **Pola berulang**: S3, S4, S6 = judul atas + HP kecil di tengah. Mata cepat bosan.
2. **Banyak frame kosong** saat transisi (9,5–10 dtk biru polos, 15–15,5 dtk putih, 31–33 dtk biru dengan 2 kata).
3. **Skala datar**: HP selalu ±470 px, tidak pernah zoom ke detail atau mundur ke lebar.
4. **Teks diam** setelah masuk: tanpa motion blur, tanpa kontras ukuran, tanpa media di dalam kalimat.
5. **Transisi generik** (whip antar-scene) bukan morph dari elemen ke elemen.
6. **Audio pelan** dan end card terlalu lama.
