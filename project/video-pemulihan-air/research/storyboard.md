# Storyboard v3: Kenapa Air Belum Ngalir Setelah Pipa Diperbaiki?
Gaya #44 Kita Bedah (spesifikasi terbaru) · 1080×1920 · 30 fps · ±66 dtk · narator Gemini perempuan muda (`research/vo-script.md`)
Penonton: awam (pelanggan PDAM). Frame di tabel diambil dari `src/timeline.ts` (objek `T`, selaras `public/words.json`). Kalau timing berubah, ubah keduanya. Total 1800 f (tepat 60 dtk). v4: narasi v3 dipercepat ±8% (atempo 1,084, nada tetap) dan semua frame v3 dikali K = 60000/65026 lewat `sf()` di `src/timeline.ts`; frame di tabel = frame v4.

## Perubahan dari v2
- Satu diagram 3D kontinu (tandon → pipa besar → pipa kecil → rumah) dengan overview **O** = seluruh jaringan. Tiap bab: stepper pindah → zoom ke bagian (24–30 f) → callout → mekanisme + `<FlowArrow />` → bersihkan (8 f) → mundur ke **O**. Tidak ada zoom langsung antarbagian.
- Satu elemen bergerak per beat (`sequenceBeats()`): kamera diam saat mekanisme jalan, callout tidak muncul saat kamera bergerak. Kamera follow-shot muka air v2 dihapus.
- `<BedahStepper />` di sub-label header: `01 ALIRAN  02 PERBAIKAN  03 ISI PIPA  04 ANGIN  05 KERAN`.
- Safe zone 9:16: header mulai di bawah 288 px, caption karaoke 44 px · 4 kata/baris · `bottomOffset` 422 (dari `useSafeZone()`), tidak ada teks di kanan 12%. Maks 1 callout aktif per beat, 2 badge.
- Istilah layar ikut naskah awam: "Reservoir (tandon)", "Pipa besar", "Pipa kecil", "Katup udara" (makna buang angin di header), "Dorongan air".| Frame | Bab / beat | Narasi | Kamera | Visual & overlay | SFX |
|---|---|---|---|---|---|
| 0–95 | Hook | Pipa udah dibenerin, kok air belum ngalir? | TAP diam | keran kering, tetes 17–43 dan 54–80; header "Air **belum ngalir**?" (kata kunci biru), badge ILUSTRASI | tetes |
| 95–209 | Kita bedah. | Yuh Jakwir, kita bedah. | TAP → O 146–172 | abu-abu 96–107, judul "Kita bedah." 107 (garis 114–127, keluar 135–144); cutaway menyapu 173–194, guratan arus 194–209 | whoosh-soft, cutaway |
| 165–413 | 01 ALIRAN | turun sendiri dari reservoir ... sampai ke rumah kamu | O → TANK 209–234, TANK → O 301–325 | callout "Reservoir (tandon)" 236–293; FlowArrow pipa besar 327–345 + callout "Pipa besar" 345–373; FlowArrow pipa kecil 375–393 + callout "Pipa kecil ke rumah" 393–437 | pop-in per callout |
| 413–592 | 02 PERBAIKAN | aliran ditutup ... pipa jadi kosong | O → VALVE 445–469, diam | roda menutup 472–495 (busur merah), badge ALIRAN DITUTUP 495; air surut pipa besar 506–554, pipa kecil 511–557; callout "Pipa kosong" 557–591 | katup, impact-soft |
| 592–827 | 03 ISI PIPA | mengisi pipa besar dulu, baru pipa kecil ... selang taman | roda membuka 598–620 (busur hijau), VALVE → O 627–651 | isi pipa besar 653–707, pipa kecil 709–762, FlowArrow ikut muka air; counter "Pipa terisi %" + ILUSTRASI, badge DIPERCEPAT; callout "Mirip selang taman" 771–816 | m3, progress-loop 708–826 |
| 827–1069 | 04 ANGIN | angin terjebak ... katup udara ... nyendat | O → HUMP 827–853, HUMP → O 1080–1104 | badge DIPERBESAR 854; callout "Angin terjebak" 858–901; gelembung keluar + FlowArrow naik 923–967; callout "Katup udara" 974–1022; callout "Tanpa ini: air nyendat" 1028–1072 | gelembung, whoosh |
| 1069–1242 | 05 KERAN | dorongan air pulih ... air keluar dari keran | O → GAUGE 1111–1135, GAUGE → O 1181–1200, O → TAP 1201–1224 | callout "Dorongan air" 1135–1164, jarum naik 1153–1177 (ILUSTRASI); air keluar 1224–1233, wastafel terisi 1233–1288; callout hijau "Air sampai ke keran" 1235–1281 | tick-soft, confirm-chime |
| 1242–1473 | Faktor | tinggi rendahnya, jauh dekatnya, besar pipanya, angin | TAP → O 1284–1310 | dunia redup 1310–1325; kartu rekap 1325–1463, poin 1340 / 1374 / 1408 / 1442 (angin = merah); dunia keluar 1463–1476 | pop-in |
| 1473–1800 | Tiray + CTA | sabar sebentar ... aplikasi Tiray ... WhatsApp Tirta Ayu. Yuh buka Tiray! Monggo, download aplikasinya! | layar | ponsel layar Info Gangguan (data dummy) masuk 1480; callout "Info gangguan" 1546–1787; kartu WA 0877 3055 0300 + tirtaayu.co.id 1648–1787; ponsel memudar 1789–1800. Tagar dan end card logo dihapus atas permintaan user; CTA hanya di narasi + caption | maximize, pop-in |

Angka persen pada counter dan jarum adalah ilustrasi (banner tidak memberi angka), selalu diberi badge ILUSTRASI. Gerak dipercepat diberi badge DIPERCEPAT, perbesaran diberi DIPERBESAR.
