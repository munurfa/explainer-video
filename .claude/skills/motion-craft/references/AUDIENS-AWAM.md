# Panduan Penonton Awam (Non-Teknis)

Default semua video dari skill ini: **penonton awam tanpa latar belakang teknis**, misalnya pelanggan PDAM, ibu rumah tangga, pelajar, atau pengguna aplikasi pemula. Anggap penonton belum pernah mendengar istilah teknis apa pun di topik itu, menonton sambil scroll, sering tanpa suara, dan hanya memberi 3 detik pertama untuk memutuskan lanjut atau tidak.

Panduan ini hanya boleh dilonggarkan kalau user **secara eksplisit** menyebut audiens teknis (mis. "untuk teknisi", "untuk developer"). Catat pengecualian itu di `research/storyboard.md`.

---

## 1. Mulai dari Dunia Penonton

- **Buka dengan masalah yang dialami penonton**, bukan dengan teori. Benar: "Pipa udah dibenerin, kok air belum ngalir?" Salah: "Sistem distribusi gravitasi memiliki tiga komponen."
- **Pakai sudut pandang "kamu".** Jelaskan apa artinya buat penonton: air di rumahnya, tagihannya, HP-nya.
- **Satu pesan utama per video.** Kalau tidak bisa diringkas dalam satu kalimat yang dipahami anak SMP, topiknya terlalu lebar. Pecah jadi beberapa video.

## 2. Bahasa

- **Kata sehari-hari dulu, istilah teknis belakangan (kalau perlu).** Ganti istilah dengan padanan awam: "reservoir" → "tempat penampungan air di dataran tinggi", "tekanan" → "dorongan air", "air valve" → "katup buang udara".
- **Maksimal 3 istilah teknis per video.** Setiap istilah yang tetap dipakai **wajib dijelaskan saat pertama kali muncul**, dalam kalimat yang sama atau kalimat berikutnya.
- **Tanpa singkatan yang tidak dijelaskan.** Tulis lengkap atau ganti dengan kata awam (mis. "SPAM", "DMA", "NRW" jangan dipakai mentah).
- **Kalimat pendek, satu ide per kalimat**, maks 18 kata (sesuai `VO-SCRIPT.template.md`). Hindari kalimat pasif bertingkat.
- **Angka dibulatkan dan dibandingkan.** "±1.000 liter" lebih jelas kalau ditambah "kira-kira 5 drum besar". Satuan teknis (bar, m³/detik, psi) wajib diterjemahkan atau diganti perbandingan.
- **Nada ramah, tidak menggurui.** Hindari "seperti yang kita ketahui", "tentu saja", "sederhananya" (kesannya meremehkan penonton).

## 3. Analogi & Perbandingan

- Setiap konsep abstrak (tekanan, gravitasi, sinyal, enkripsi, server) **wajib punya satu analogi sehari-hari**: selang taman, sedotan, antre di loket, kurir paket, gembok.
- Analogi harus **akurat secara arah**. Kalau analoginya menyesatkan, lebih baik tidak dipakai.
- Satu analogi per konsep, dan pertahankan analogi yang sama sampai akhir video. Jangan ganti-ganti.

## 4. Tunjukkan, Jangan Hanya Sebut

- **Setiap istilah atau proses yang disebut narasi wajib terlihat di layar pada saat yang sama**: objek, panah aliran, highlight, atau callout. Penonton yang menonton tanpa suara tetap harus paham.
- **Urutan sebab → akibat harus terlihat**: tampilkan satu langkah, beri jeda, baru langkah berikutnya. Jangan munculkan semua komponen sekaligus.
- **Sorot satu hal per waktu.** Redupkan elemen lain saat menjelaskan satu bagian.
- Teks di layar = **kata kunci**, bukan salinan narasi. Maks 6 kata per header.
- Diagram teknis (skema, penampang, flowchart) disederhanakan: buang label yang tidak disebut narasi.

## 5. Struktur Penjelasan

Pola yang dianjurkan untuk video explainer awam:

1. **Hook masalah** (≤ 3 dtk): pertanyaan yang sering diucapkan penonton sendiri.
2. **Gambaran besar**: satu kalimat cara kerjanya, dengan analogi.
3. **Langkah demi langkah**: 3–4 langkah, masing-masing satu kalimat + satu visual.
4. **Kenapa ini penting buat kamu**: dampak nyata ke penonton.
5. **Rekap singkat**: 3–4 poin kata kunci (mis. `BedahRecapList`).
6. **CTA jelas**: satu tindakan konkret (buka aplikasi, hubungi WA, simpan video).

## 6. Cek Pemahaman (wajib sebelum approval naskah)

Jawab di `research/vo-script.md` bagian akhir (`## Cek Penonton Awam`):

- [ ] Pesan utama bisa diulang penonton dalam satu kalimat sehari-hari. Tulis kalimatnya.
- [ ] Daftar istilah teknis yang tersisa (maks 3), masing-masing dengan penjelasan awamnya.
- [ ] Setiap konsep abstrak punya analogi; tulis pasangannya.
- [ ] Tidak ada singkatan tanpa penjelasan dan tidak ada satuan teknis mentah.
- [ ] Video tetap bisa dipahami dalam mode tanpa suara (visual + caption cukup).
- [ ] Uji "baca ke orang awam": kalau ada kalimat yang perlu dijelaskan ulang, tulis ulang kalimatnya.

## 7. Contoh Penulisan Ulang

| Versi teknis (hindari) | Versi awam (pakai) |
|---|---|
| Setelah perbaikan, dilakukan *flushing* dan pembuangan udara melalui *air valve*. | Setelah pipa dibetulkan, udara di dalam pipa dibuang dulu lewat katup khusus, biar air bisa lewat lancar. |
| Tekanan jaringan kembali ke 1,5 bar. | Dorongan air pelan-pelan kuat lagi, sampai air keluar dari keran kamu. |
| Distribusi menggunakan sistem gravitasi dari reservoir elevasi tinggi. | Air mengalir sendiri dari tempat penampungan di dataran tinggi ke rumah kamu, seperti air turun dari bukit. |
| Data dienkripsi end-to-end. | Pesanmu dikunci, cuma kamu dan penerima yang bisa membukanya. |
