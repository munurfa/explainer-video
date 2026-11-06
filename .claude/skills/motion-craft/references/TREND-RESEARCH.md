# Stage 1 (Opsional) — Riset Tren

**Hanya dijalankan bila user secara eksplisit meminta riset tren** ("riset tren dulu", "cari topik yang lagi viral", "apa yang trending di niche X"). Jika user sudah memberi topik, lewati stage ini dan jangan menawarkan riset tanpa diminta.

## 1. Input (dari Stage 0)

- Niche / kategori, bahasa & negara target (default Indonesia), platform (IG Reels, TikTok, YouTube Shorts), jendela waktu (default 7 hari terakhir).

## 2. Sumber Data (urutan prioritas)

1. **Connector / MCP data sosial yang aktif di sesi** (misalnya Scrape Creators, atau connector sejenis untuk TikTok / Instagram / YouTube). Cek tool yang tersedia dulu; jika belum ada, cari dengan `mcp__mcp-registry__search_mcp_registry` kata kunci `scrape creators`, `tiktok`, `instagram`, `youtube trends` dan **tawarkan** ke user untuk dihubungkan. Jangan memasukkan API key atas nama user.
2. **Web search** (mode standard, lalu extended bila hasil tipis): halaman Creative Center / trending resmi platform, Google Trends (geo=ID), artikel tren terbaru. Sebutkan bahwa metrik dari web search bersifat perkiraan.
3. **Data user** (Insights / Analytics akun mereka) bila user membagikannya. Ini sumber paling relevan untuk akun tersebut.

Aturan data:
- Setiap angka wajib punya link sumber dan tanggal diambil. Jangan mengarang view/like/engagement; tulis `n/a` bila tidak tersedia.
- Hanya konten publik. Jangan mengumpulkan data pribadi pembuat konten di luar metrik publik video.
- Catat audio / sound yang sedang naik bila tersedia, tetapi musik video tetap dari katalog lisensi skill (`SOUND.md`) kecuali user punya lisensinya.

## 3. Output: `research/trend-research.md`

```markdown
# Riset Tren — <niche> · <platform> · <tanggal>

| # | Topik / format | Platform | Contoh (link) | Metrik (views · likes · tgl) | Relevansi ke niche (1–5) | Ide hook (<= 3 dtk) |
|---|---|---|---|---|---|---|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |

**Rekomendasi:** #<n> — <alasan 2–3 kalimat: momentum, kecocokan audiens, bisa divisualkan dengan gaya skill, risiko>.
**Gaya visual yang cocok:** <ID gaya dari STYLES.md> · **Template storyboard:** <T0xx>

Sumber diambil: <tanggal & jam WIB>. Metrik web search adalah perkiraan.
```

Kriteria memilih 5 kandidat: momentum (naik dalam jendela waktu), relevansi ke niche & audiens user, bisa dijelaskan dalam 15–60 dtk, bisa divisualkan (objek / UI / data nyata), tidak sensitif atau melanggar hak cipta.

## 4. Checkpoint

**[STOP – TUNGGU APPROVAL]** Tampilkan tabel dan rekomendasi, minta user memilih satu topik (atau menolak semua). Topik terpilih menjadi brief Stage 2 (storyboard). Jangan lanjut ke storyboard sebelum user memilih.
