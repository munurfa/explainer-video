@AGENTS.md

# Khusus Claude Code

- **WAJIB: setiap project video baru dibuat di `project/video-<topik>/`.** Tidak boleh di root, `sample/`, `.claude/`, atau di dalam project lain. Konfirmasi nama folder ke user sebelum membuat file. Semua path di perintah skill motion-craft (`research/`, `public/`, `src/`, `out/`) relatif terhadap folder project itu, jadi `cd` ke sana dulu.

- Untuk video atau motion graphics baru, pakai skill `/motion-craft` dan ikuti approval gate-nya (klarifikasi → storyboard → naskah VO → sampel suara → render). Jangan langsung lompat ke render.
- Untuk pekerjaan Tirta Ayu / Tiray, muat skill `tiray-brand-kit` sebelum menyentuh logo, warna, copy, atau outro.
- Untuk API Remotion (captions, render, studio, three, maps), muat skill `remotion-best-practices` atau skill `remotion-*` yang relevan, jangan menebak dari ingatan.
- Preview pakai Remotion Studio (`npm run studio`) lewat browser pane. Cek hasil dengan render still di frame kunci dari storyboard sebelum render penuh.
- Render penuh memakan waktu lama, jadi jalankan di background.
