@AGENTS.md

# Khusus Claude Code

Semua aturan (lokasi project, approval gate, penonton awam, daftar skill) ada di `AGENTS.md` di atas. Tambahan khusus Claude Code:

- Skill di `.claude/skills/` termuat otomatis. Panggil lewat Skill tool (`motion-craft`, `tiray-brand-kit`, `remotion-*`), tidak perlu membaca `SKILL.md` manual.
- Approval gate: akhiri giliran dan tunggu jawaban user. Pertanyaan pilihan boleh lewat AskUserQuestion.
- Preview Remotion Studio dibuka lewat browser pane (`preview_start`).
- Render penuh dijalankan dengan `run_in_background`.
