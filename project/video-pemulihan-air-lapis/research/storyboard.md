# Storyboard: Kenapa Air Belum Ngalir Setelah Pipa Diperbaiki? (versi Bedah Lapis)

- Mode brand: tirta-ayu
- Kalimat hook: Yuh, Takon-Takon Air (ditulis user; di layar dua baris "Yuh," / "Takon-Takon Air", di narasi "Yuh, takon-takon air.")

## 1. Info Proyek

| Field | Isi |
|---|---|
| Judul | Kenapa Air Belum Ngalir Setelah Pipa Diperbaiki? |
| Pesan utama | Setelah pipa dibenerin, air butuh waktu mengisi pipa yang kosong dan membuang angin dulu, jadi tunggu sebentar dan cek info di Tiray. |
| Sumber materi | `research/banner.md` + `research/banner.jpg` (infografis Perumda Tirta Ayu), sama dengan `project/video-pemulihan-air` |
| Durasi total | **60,0 dtk (1800 frame)** sejak v2. Rekaman asli 68,0 dtk dipadatkan jadi 59,4 dtk: 21 jeda dipendekkan + tempo 1,091 (nada tetap) dengan `scripts/tighten-vo.mjs`. v1 = 70,0 dtk |
| Rasio · resolusi · fps | 9:16 · 1080×1920 · 30 fps |
| Target audiens | awam (pelanggan PDAM) |
| Analogi utama | pipa kosong yang terisi pelan dan angin yang bikin air nyendat → selang taman yang baru dinyalakan |
| Gaya terpilih | #46 Bedah Lapis (`references/styles/46-bedah-lapis.md`) |
| Komponen | `Lapis3D.tsx` (`LapisStage`, `LMesh`, `Peel`, `driftHold`), `LapisOverlay.tsx` (`LapisHeader`, `LapisLabel`, `ChevronTrail`, `LapisCard`, `LapisHook`, `LapisCaption`) |
| BGM · narator | B27 (Vox Documentary Piano) dengan ducking otomatis · narator direkam user di ElevenLabs (`public/audio/narration.mp3` = asli, `public/audio/narration-60.mp3` = versi padat yang dipakai v2) |
| Platform | IG Reels / TikTok / YouTube Shorts |
| CTA | Buka dan download aplikasi Tiray (#YuhBukaTiray) |
| Brand yang muncul | Tirta Ayu (lambang di header, logo vertikal di end card), Tiray (layar Info Gangguan asli, data dummy) |
| Aset di `public/` | `brand/lambang-warna.svg`, `brand/logo-vertikal-warna.svg`, `ui/09_info-gangguan.png`, `badge/google-play-id.png` (badge resmi "Dapatkan di Google Play") |

## 2. Dunia dan lapis yang dilepas

Satu diorama clay kontinu: tandon di bukit → pipa besar → pipa kecil → rumah. Semua pipa tertanam di tanah.

| Lapis | Isi | Yang terlihat setelah dilepas |
|---|---|---|
| 0 | Tanah jalan | Pipa kecil di bawah jalan |
| 1 | Tanah lereng | Pipa besar menuruni bukit, titik tertinggi tempat katup udara |
| 2 | Tanah dataran + dinding depan tandon | Air di dalam tandon, katup induk |
| 3 | Kulit depan pipa | Air (biru) di dalam pipa |
| 4 | Dinding depan rumah | Wastafel dan keran |

Warna jenuh hanya untuk yang dijelaskan: air (biru), katup induk (oranye), katup udara (kuning), keran dan jarum dorongan air (hijau mint). Di akhir video semua lapis dipasang kembali.

## 3. Tabel Scene

Frame v2 diambil dari narasi versi padat: `research/vo-timing.json` + `public/words.json` (sumber `faster-whisper`). Timing v1 disimpan di `research/vo-timing-v1.json` dan `research/words-v1.json`. Tiap beat di `src/timeline.ts` ditambatkan ke kata yang diucapkan. Still acuan: `out/check-v2/contact-sheet.png`.

| # | Frame | Bab / judul header | Narasi | Kamera | Visual dan overlay | SFX |
|---|---|---|---|---|---|---|
| S1 | 0–81 | Hook: "Pipa udah beres, **air belum ngalir?**" | Pipa udah dibenerin, kok air belum ngalir? | Keran, melayang pelan | Keran kering di kamar mandi, dua tetes jatuh (F1) | tetes |
| S2 | 81–132 | (sama) | Yuh, takon-takon air. | Tirai menutup, kamera pindah ke bidikan utuh | Kalimat hook besar di tengah, warna diorama turun (F2) | whoosh lembut |
| S3 | 132–254 | "Di bawah tanah ada **pipa panjang**" | Di bawah tanah ada pipa panjang, dari tandon sampai rumah kamu. | Utuh, melayang | 5 lapis dilepas berurutan; label "Tandon" dan "Rumah kamu" (F3) | swipe sekali, pop-in |
| S4 | 254–505 | 01 ALIRAN: "Air turun **sendiri** dari tempat tinggi" | Air Tirta Ayu turun sendiri dari reservoir, tandon raksasa di tempat tinggi. Lewat pipa besar, lalu pipa kecil, sampai ke keran kamu. | Utuh → tandon → utuh | Label "Reservoir (tandon)" (F4); chevron searah aliran; label "Pipa besar" lalu "Pipa kecil" (F5) | pop-in, air mengalir |
| S5 | 505–653 | 02 PERBAIKAN: "Pipa diperbaiki, aliran **ditutup**" | Waktu pipa diperbaiki, alirannya ditutup dulu. Airnya habis, pipanya kosong. | Utuh → katup induk → lereng | Roda katup diputar, pintu turun, badge ALIRAN DITUTUP (F6); air surut, badge DIPERCEPAT, label "Pipa kosong" (F7) | katup, air surut |
| S6 | 653–882 | 03 ISI PIPA: "Dibuka lagi, **pipa terisi** pelan-pelan" | Begitu dibuka lagi, air harus mengisi pipa besar dulu. Baru pipa kecil, sedikit demi sedikit. Mirip selang taman yang baru dinyalakan. | Lereng → jalan | Katup dibuka; air mengisi pipa besar lalu pipa kecil dengan chevron di muka air; counter "Pipa terisi %" + ILUSTRASI (F8); kartu "Mirip selang taman" (F9) | air mengisi, data-reveal |
| S7 | 882–1137 | 04 ANGIN: "Angin **terjebak** harus dibuang" | Di dalam pipa juga ada angin yang terjebak. Angin ini dibuang lewat katup udara, lubang kecil di titik tertinggi. Kalau nggak, airnya nyendat. | Jalan → punuk pipa | Badge DIPERBESAR; kantong angin putih + label "Angin terjebak" (F10); gelembung naik lewat katup udara, chevron ke atas, label "Katup udara" (F11); label "Air nyendat", lalu angin habis | gelembung, desis pendek |
| S8 | 1137–1297 | 05 KERAN: "Dorongan air **pulih**" | Setelah pipa penuh, dorongan air pelan-pelan pulih. Baru deh, air keluar dari keran. | Punuk → pengukur → keran | Jarum pengukur naik, label "Dorongan air", ILUSTRASI (F12); air keluar dari keran, wastafel terisi, label "Air sampai ke keran" (F13) | air keran, confirm |
| S9 | 1297–1482 | "Kenapa waktunya **beda-beda?**" | Makanya tiap daerah beda waktunya. Tergantung tinggi rendahnya, jauh dekatnya, dan besar pipanya. | Keran → utuh | Tiga label di dunia muncul satu per satu lalu tampil bersama: "Tinggi rendahnya", "Jauh dekatnya", "Besar pipanya" (F14) | pop-in ×3 |
| S10 | 1482–1682 | "Jadi **sabar sebentar,** ya" → "Cek info gangguan di **Tiray**" | Jadi sabar sebentar, ya. Info gangguan bisa kamu cek di aplikasi Tiray, atau tanya lewat WhatsApp Tirta Ayu. | Utuh, melayang | Lapis dipasang kembali (F15); dunia meredup; ponsel layar Info Gangguan + label; kartu WhatsApp 0877 3055 0300 dan tirtaayu.co.id muncul sejak "atau tanya lewat WhatsApp" (F16) | whoosh lembut, pop-in |
| S11 | 1682–1800 | (header keluar) | Yuh buka Tiray! Monggo, download aplikasinya! | diam | Beat tagar #YuhBukaTiray, lalu end card di atas putih: logo vertikal Tirta Ayu, tagar, dan badge Google Play resmi. Jari masuk dan menekan badge tepat di kata "download" (frame 1747), riak menyebar | confirm, click |

## 4. Safe Zone (9:16)

- Posisi mengikuti gaya #46 (`lapisLayout()`): header mulai y 200, caption y 1540–1620. Baris pertama judul dan caption sengaja masuk zona konservatif (pita merah di contact sheet). Ini pilihan gaya, bisa diubah di satu tempat.
- Kanan 12% (pita kuning): terisi lambang di header, badge, dan beberapa label. Label yang terlalu ke kanan digeser saat tahap animasi.
- Objek dan label berada di panggung y 540–1500; caption selalu di bawah objek.

## 5. Yang berbeda dari versi #44 (`project/video-pemulihan-air`)

- Tampilan clay pastel tanpa outline; pipa tertanam di tanah dan diperlihatkan dengan melepas lapis, bukan bidang potong.
- Hook dari pengalaman penonton (keran kering), lalu kalimat hook tulisan user.
- Kamera selalu melayang; pindah langsung antarbagian yang bersebelahan (punuk → pengukur → keran).
- Faktor "beda-beda" ditunjukkan dengan label di dunia, bukan kartu daftar.
- Header naik dan melebar, stepper lebih besar (28 px untuk 5 bab), caption turun di bawah objek.
- Narasi ditulis ulang: satu kalimat untuk satu gerakan, direkam user di ElevenLabs.

## 6. Cek Sebelum Animasi Final

- [x] Dua pertanyaan wajib gaya #46 sudah dijawab user (mode brand, kalimat hook)
- [x] Hook selesai dalam 3 detik; CTA di scene terakhir
- [x] Tiap istilah di narasi punya visual di scene yang sama
- [x] Teks di layar maks 7 kata
- [x] Naskah disetujui user
- [x] Rekaman ElevenLabs diterima, timing kata asli dibuat (faster-whisper)
- [x] Musik dan SFX dipasang, still frame kunci dicek ulang dengan timing asli (`out/check-v1/`)
- [x] v2: durasi dikunci 60 dtk, hook selesai di 2,60 dtk, vo-lint dengan timing asli PASS (peringatan: S3 2,86 kata/dtk)
- [x] v2: ajakan unduh memakai badge Google Play resmi + jari menekan, bukan teks
