# Naskah VO — <judul video>
- Bahasa: id
- Profil: N01
<!-- Profil: N01–N05 Edge TTS (gratis), N06–N08 ElevenLabs (butuh ELEVENLABS_API_KEY). Pilih lewat voice-samples.mjs. -->

<!--
Salin ke research/vo-script.md. Format heading scene:  ## S<n> · <mulai>–<selesai> · <tag>
  - Detik di heading = rencana. Durasi final dihitung dari audio asli oleh narrator-sync (research/vo-timing.json).
  - Tag: hook (wajib di S1, selesai <= 3 dtk), cta (wajib di scene terakhir).
  - Budget kata: 2.5 kata/detik (id), 2.8 (en). Scene 4 dtk = maks 10 kata.
  - Penonton default: awam non-teknis (references/AUDIENS-AWAM.md). Bahasa sehari-hari, maks 3 istilah teknis dan
    masing-masing dijelaskan saat pertama muncul, satu analogi per konsep abstrak, tanpa singkatan/satuan teknis mentah.
  - Kalimat pendek, maks 18 kata, satu ide per kalimat. Angka ditulis seperti diucapkan bila perlu ("dua puluh persen").
Penanda (tidak ikut dibaca dan tidak muncul di subtitle):
  [jeda]                    jeda 600 ms; [jeda 0.4] = 400 ms
  [semangat] ... [/semangat] lebih cepat dan tinggi (hook, CTA, angka kejutan)
  [pelan] ... [/pelan]       lebih lambat untuk penekanan
Cek:  node "<skill>/scripts/vo-lint.mjs" --script research/vo-script.md
Hapus komentar ini setelah diisi.
-->

## S1 · 0–3 · hook
<pertanyaan atau fakta mengejutkan, maks 7 kata> [jeda 0.4]

## S2 · 3–8
<konteks masalah, maks 12 kata>

## S3 · 8–14
<inti penjelasan, maks 15 kata> [jeda] <bukti atau angka>

## S4 · 14–18
<manfaat atau kesimpulan, maks 10 kata>

## S5 · 18–21 · cta
[semangat] <satu ajakan: follow / simpan / komentar / cek link> [/semangat]

## Cek Penonton Awam
<!-- Wajib diisi sebelum approval naskah (references/AUDIENS-AWAM.md §6). Bagian ini tidak dibacakan narator. -->
- Pesan utama dalam satu kalimat sehari-hari: <...>
- Istilah teknis yang tersisa (maks 3) → penjelasan awam: <istilah> → <penjelasan>
- Konsep abstrak → analogi: <konsep> → <analogi>
- [ ] Tanpa singkatan / satuan teknis mentah
- [ ] Tiap istilah di narasi terlihat di layar pada saat yang sama
- [ ] Tetap dipahami tanpa suara (visual + caption)
