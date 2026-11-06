#!/usr/bin/env node
/**
 * scripts/draw-style.mjs
 * Pemilih Gaya Otomatis & Generator Style Bible (43 Gaya dari STYLES.md)
 * - Membaca brief/topik dan kata kunci literal
 * - Mengecek research/style-log.md agar tidak mengulang 2 proyek terakhir
 * - Mengundi 3 kandidat teratas, memilih pemenang, dan menulis research/style-bible.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_ROOT = path.resolve(__dirname, '..');

const STYLE_INDEX = [
  { id: 1, name: 'Cyberpunk', bgm: 'B03', sfx: 'S-DIGITAL + S-SINEMA', bpm: 102, keywords: ['cyber', 'hack', 'keamanan', 'siber', 'game', 'malam', 'ai', ' gelap'], colors: '#0B0B10, #F2E900, #FF2A3D, #0E3B43', fonts: 'Chakra Petch + Share Tech Mono', camera: 'push-in-settle -> orbit-3d-inspect -> dolly-lateral-parallax' },
  { id: 2, name: 'Doodle', bgm: 'B01', sfx: 'S-KERTAS + S-ORGANIK', bpm: 112, keywords: ['edukasi', 'ramah', 'brainstorm', 'konsep', 'santai', 'belajar', 'anak'], colors: '#F6F0E1, #1F3A93, #FFD23F, #E4572E', fonts: 'Gochi Hand + Patrick Hand', camera: 'dolly-lateral-parallax -> push-in-settle -> crane-up-focus' },
  { id: 3, name: 'Zine Fotokopi', bgm: 'B05', sfx: 'S-KERTAS + S-JALANAN', bpm: 92, keywords: ['indie', 'aktivisme', 'komunitas', 'kampus', 'zine', 'kritik', 'punk'], colors: '#111111, #EFECE6, #FF4F9A, #C6F500', fonts: 'Anton + Special Elite', camera: 'push-in-settle -> dolly-lateral-parallax -> follow-target-rack' },
  { id: 4, name: 'Grafiti', bgm: 'B05', sfx: 'S-JALANAN', bpm: 90, keywords: ['jalanan', 'hip-hop', 'streetwear', 'ekstrem', 'grafiti', 'muda'], colors: '#8A8D8F, #7A3B2E, #FF3B1F, #FFE400', fonts: 'Sedgwick Ave Display + Permanent Marker', camera: 'dolly-lateral-parallax -> push-in-settle -> whip-pan' },
  { id: 5, name: 'Topografi', bgm: 'B10', sfx: 'S-KERTAS + S-UMUM', bpm: 70, keywords: ['peta', 'geografi', 'alam', 'gunung', 'perjalanan', 'spasial', 'bumi', 'lingkungan'], colors: '#EFE8D6, #7B4B2A, #2F5D50, #D1432B', fonts: 'EB Garamond + DM Mono', camera: 'orbit-3d-inspect -> dolly-lateral-parallax -> crane-up-focus' },
  { id: 6, name: 'Memphis', bgm: 'B07', sfx: 'S-ORGANIK + S-UMUM', bpm: 110, keywords: ['kreatif', 'fashion', 'event', '80-an', 'ceria', 'pop'], colors: '#F8F4E3, #FF5CA8, #00B8A9, #FFD166', fonts: 'Bowlby One + Fredoka', camera: 'push-in-settle -> orbit-3d-inspect -> pull-out-monumental' },
  { id: 7, name: 'Isometric', bgm: 'B09', sfx: 'S-DIGITAL + S-MEKANIK', bpm: 120, keywords: ['sistem', 'arsitektur', 'logistik', 'saas', 'alur', 'cloud', 'infrastruktur', 'pipeline'], colors: '#F4EFE6, #FF6B35, #2EC4B6, #3D348B', fonts: 'IBM Plex Sans Condensed + IBM Plex Mono', camera: 'orbit-3d-inspect -> dolly-lateral-parallax -> crane-up-focus' },
  { id: 8, name: 'Clay 3D', bgm: 'B08', sfx: 'S-ORGANIK', bpm: 114, keywords: ['ramah', 'anak', 'kesehatan', 'kuliner', 'aplikasi', 'konsumer', 'lucu'], colors: '#F7EDE2, #FF8FA3, #FFC857, #7BDFF2', fonts: 'Baloo 2 + Fredoka', camera: 'orbit-3d-inspect -> push-in-settle -> pull-out-monumental' },
  { id: 9, name: 'Comic Book', bgm: 'B22', sfx: 'S-KOMIK', bpm: 156, keywords: ['aksi', 'humor', 'komik', 'motivasi', 'meme', 'hero'], colors: '#FFF8E7, #FFDE00, #E4002B, #00A0DF', fonts: 'Bangers + Comic Neue', camera: 'push-in-settle -> dolly-lateral-parallax -> crane-up-focus' },
  { id: 10, name: 'Split Flap', bgm: 'B24', sfx: 'S-MEKANIK', bpm: 108, keywords: ['jadwal', 'stasiun', 'bandara', 'hitung mundur', 'harga', 'status', 'keberangkatan'], colors: '#111111, #1B1B1B, #F5F1E6, #F2A900', fonts: 'Barlow Condensed + DM Mono', camera: 'dolly-lateral-parallax -> follow-target-rack -> pull-out-monumental' },
  { id: 11, name: 'Neo-Brutalism', bgm: 'B09', sfx: 'S-DIGITAL + S-KERTAS', bpm: 122, keywords: ['startup', 'developer', 'produk', 'berani', 'saas', 'launch', 'web', 'tools'], colors: '#FFDE59, #FF6B6B, #7DF9AA, #111111', fonts: 'Archivo Black + Space Mono', camera: 'push-in-settle -> dolly-lateral-parallax -> orbit-3d-inspect' },
  { id: 12, name: 'Swiss Internasional', bgm: 'B21', sfx: 'S-DIGITAL', bpm: 106, keywords: ['korporat', 'keuangan', 'laporan', 'arsitektur', 'riset', 'minimalis', 'tegas'], colors: '#F4F4F0, #111111, #E10600, #BDBDB5', fonts: 'Hanken Grotesk + IBM Plex Mono', camera: 'dolly-lateral-parallax -> push-in-settle -> crane-up-focus' },
  { id: 13, name: 'Bauhaus dan Konstruktivis', bgm: 'B23', sfx: 'S-MEKANIK + S-SINEMA', bpm: 104, keywords: ['manifesto', 'kampanye', 'politik', 'pameran', 'desain'], colors: '#EFE6D2, #D7261E, #141414, #F2B705', fonts: 'Bebas Neue + Jost', camera: 'push-in-settle -> dolly-lateral-parallax -> pull-out-monumental' },
  { id: 14, name: 'Risograph', bgm: 'B01', sfx: 'S-KERTAS', bpm: 86, keywords: ['budaya', 'buku', 'indie', 'poster', 'kreatif', 'seni'], colors: '#F5F0E4, #FF48B0, #0078BF, #FFE800', fonts: 'Fraunces + Space Mono', camera: 'push-in-settle -> dolly-lateral-parallax -> crane-up-focus' },
  { id: 15, name: 'VHS Analog', bgm: 'B02', sfx: 'S-ANALOG', bpm: 108, keywords: ['vhs', 'nostalgia', '90-an', '80-an', 'arsip', 'horor', 'kenangan'], colors: '#0A0A0A, #E8E1D0, #2B4A8B, #E01E2D', fonts: 'VT323 + IBM Plex Mono', camera: 'push-in-settle -> follow-target-rack -> pull-out-monumental' },
  { id: 16, name: 'Y2K Kromium', bgm: 'B04', sfx: 'S-DIGITAL', bpm: 124, keywords: ['y2k', 'fashion', 'pop', 'krom', 'futuristik'], colors: '#0D0D12, #C9CED6, #A8D8FF, #E8143C', fonts: 'Unbounded + Space Grotesk', camera: 'orbit-3d-inspect -> push-in-settle -> pull-out-monumental' },
  { id: 17, name: 'Pixel Art 8-Bit', bgm: 'B13', sfx: 'S-ARCADE', bpm: 140, keywords: ['pixel', '8-bit', 'retro', 'game', 'arcade', 'gamifikasi'], colors: '#1A1C2C, #5D275D, #EF7D57, #FFCD75', fonts: 'Press Start 2P + Pixelify Sans', camera: 'dolly-lateral-parallax -> follow-target-rack -> pull-out-monumental' },
  { id: 18, name: 'Blueprint', bgm: 'B10', sfx: 'S-MEKANIK + S-KERTAS', bpm: 96, keywords: ['teknik', 'konstruksi', 'mesin', 'paten', 'blueprint', 'engineering'], colors: '#1A4E8A, #EAF2FF, #FFD60A', fonts: 'IBM Plex Mono + Architects Daughter', camera: 'orbit-3d-inspect -> dolly-lateral-parallax -> push-in-settle' },
  { id: 19, name: 'Papercut Berlapis', bgm: 'B08', sfx: 'S-KERTAS', bpm: 108, keywords: ['cerita', 'hangat', 'alam', 'anak', 'kertas', 'edukasi'], colors: '#F6EBD9, #E76F51, #2A9D8F, #264653', fonts: 'Bricolage Grotesque + Fredoka', camera: 'dolly-lateral-parallax -> push-in-settle -> crane-up-focus' },
  { id: 20, name: 'Collage Scrapbook', bgm: 'B19', sfx: 'S-KERTAS', bpm: 88, keywords: ['scrapbook', 'kolase', 'memori', 'perjalanan', 'sejarah'], colors: '#C8A27A, #151515, #C1272D, #F1E8D6', fonts: 'Playfair Display + Special Elite', camera: 'dolly-lateral-parallax -> orbit-3d-inspect -> pull-out-monumental' },
  { id: 21, name: 'Mid-Century 70-an', bgm: 'B16', sfx: 'S-KERTAS + S-MEKANIK', bpm: 96, keywords: ['kuliner', 'kafe', 'kopi', 'lifestyle', '70-an', 'hangat', 'umkm'], colors: '#F2E8D5, #E1A730, #D4572A, #6B7A3A', fonts: 'Shrikhand + DM Serif Display', camera: 'dolly-lateral-parallax -> push-in-settle -> pull-out-monumental' },
  { id: 22, name: 'Art Deco', bgm: 'B14', sfx: 'S-MEKANIK + S-SINEMA', bpm: 112, keywords: ['mewah', 'emas', 'hotel', 'perhiasan', 'gala', 'properti', 'parfum'], colors: '#0E0E0E, #C9A227, #0F5C4D, #EFE3C8', fonts: 'Poiret One + Cinzel', camera: 'push-in-settle -> crane-up-focus -> pull-out-monumental' },
  { id: 23, name: 'Ukiyo-e', bgm: 'B23', sfx: 'S-KERTAS', bpm: 84, keywords: ['jepang', 'ukiyo', 'ombak', 'tradisional', 'seni'], colors: '#F0E6D0, #1D3F6B, #D9381E, #1A1A1A', fonts: 'Zen Antique + Shippori Mincho', camera: 'dolly-lateral-parallax -> push-in-settle -> pull-out-monumental' },
  { id: 24, name: 'Nusantara (Batik, Wayang, Arabesque)', bgm: 'B17', sfx: 'S-KERTAS + S-ORGANIK', bpm: 76, keywords: ['indonesia', 'nusantara', 'batik', 'wayang', 'islami', 'pesantren', 'ramadan', 'budaya'], colors: '#EADBB8, #6B3F1D, #1E2A4A, #C79A3B', fonts: 'Lora + Amiri', camera: 'dolly-lateral-parallax -> orbit-3d-inspect -> pull-out-monumental' },
  { id: 25, name: 'Koran Editorial', bgm: 'B14', sfx: 'S-MEKANIK + S-KERTAS', bpm: 104, keywords: ['berita', 'koran', 'sejarah', 'investigasi', 'kronologi', 'jurnal'], colors: '#E9E4D4, #1A1A1A, #B3261E', fonts: 'Playfair Display + Old Standard TT', camera: 'dolly-lateral-parallax -> follow-target-rack -> pull-out-monumental' },
  { id: 26, name: 'Terminal CLI', bgm: 'B09', sfx: 'S-DIGITAL + S-MEKANIK', bpm: 120, keywords: ['repo', 'cli', 'terminal', 'kode', 'devops', 'api', 'git', 'backend', 'coding'], colors: '#0A0F0A, #33FF66, #FFB000, #E8F0E0', fonts: 'JetBrains Mono + IBM Plex Mono', camera: 'follow-target-rack -> push-in-settle -> orbit-3d-inspect' },
  { id: 27, name: 'Wireframe dan Low-Poly 3D', bgm: 'B09', sfx: 'S-DIGITAL', bpm: 120, keywords: ['3d', 'wireframe', 'mesh', 'ai', 'sains', 'data'], colors: '#0C1015, #E8EEF2, #FF7A1A', fonts: 'Space Mono + IBM Plex Mono', camera: 'orbit-3d-inspect -> push-in-settle -> pull-out-monumental' },
  { id: 28, name: 'Glitch', bgm: 'B04', sfx: 'S-DIGITAL + S-ANALOG', bpm: 126, keywords: ['glitch', 'error', 'bug', 'disrupsi', 'bocor'], colors: '#000000, #FFFFFF, #FF0033, #1E5BFF', fonts: 'Rubik Mono One + Share Tech Mono', camera: 'push-in-settle -> follow-target-rack -> pull-out-monumental' },
  { id: 29, name: 'Neon Signage', bgm: 'B02', sfx: 'S-ANALOG', bpm: 108, keywords: ['neon', 'bar', 'kafe malam', 'konser', 'live'], colors: '#121014, #FF3D6E, #6EE7FF, #FFE9C7', fonts: 'Tilt Neon + Monoton', camera: 'dolly-lateral-parallax -> push-in-settle -> pull-out-monumental' },
  { id: 30, name: 'Papan Tulis Kapur', bgm: 'B19', sfx: 'S-ORGANIK', bpm: 92, keywords: ['menu', 'kelas', 'matematika', 'rumus', 'guru', 'kapur', 'tutorial'], colors: '#2B3A37, #F1F1E8, #F6D365, #F28DA6', fonts: 'Schoolbell + Kalam', camera: 'dolly-lateral-parallax -> follow-target-rack -> pull-out-monumental' },
  { id: 31, name: 'Film Noir', bgm: 'B11', sfx: 'S-SINEMA', bpm: 78, keywords: ['misteri', 'kriminal', 'noir', 'investigasi', 'detektif', 'true crime'], colors: '#0A0A0A, #F2F0EB, #B3171E', fonts: 'Bodoni Moda + Libre Franklin', camera: 'push-in-settle -> crane-up-focus -> pull-out-monumental' },
  { id: 32, name: 'Retro-Futurism', bgm: 'B16', sfx: 'S-DIGITAL + S-MEKANIK', bpm: 102, keywords: ['antariksa', 'atom', 'inovasi', 'roket', '60-an', 'masa depan'], colors: '#F4E3C1, #E85D2A, #1F4E5F, #F2B134', fonts: 'Righteous + Michroma', camera: 'orbit-3d-inspect -> pull-out-monumental -> push-in-settle' },
  { id: 33, name: 'Woodcut dan Engraving', bgm: 'B19', sfx: 'S-KERTAS', bpm: 84, keywords: ['filsafat', 'hukum', 'klasik', 'folklor', 'ukiran', 'sejarah'], colors: '#EFE3C6, #2A1E14, #9E2A2B', fonts: 'IM Fell English + Cormorant', camera: 'dolly-lateral-parallax -> push-in-settle -> pull-out-monumental' },
  { id: 34, name: 'Rubber Hose 1930-an', bgm: 'B15', sfx: 'S-KOMIK', bpm: 106, keywords: ['kartun', '1930', 'vintage', 'humor', 'animasi lama'], colors: '#F2E8D0, #3A2A1A, #C8382C', fonts: 'Rye + Bowlby One SC', camera: 'push-in-settle -> dolly-lateral-parallax -> pull-out-monumental' },
  { id: 35, name: 'Manga', bgm: 'B22', sfx: 'S-KOMIK + S-SINEMA', bpm: 160, keywords: ['manga', 'anime', 'kompetisi', 'turnamen', 'dramatis'], colors: '#FFFFFF, #111111, #E4002B', fonts: 'Dela Gothic One + Zen Kaku Gothic New', camera: 'push-in-settle -> follow-target-rack -> pull-out-monumental' },
  { id: 36, name: 'Data Editorial', bgm: 'B21', sfx: 'S-DIGITAL', bpm: 104, keywords: ['data', 'statistik', 'riset', 'grafik', 'metrik', 'analitik', 'survei', 'ekonomi'], colors: '#FAF8F3, #1F1F1F, #D1432B, #2F6F8F', fonts: 'Source Serif 4 + Source Sans 3', camera: 'dolly-lateral-parallax -> crane-up-focus -> pull-out-monumental' },
  { id: 37, name: 'Inflatable 3D', bgm: 'B07', sfx: 'S-ORGANIK', bpm: 112, keywords: ['balon', 'inflatable', 'ceria', 'konsumer', 'aplikasi'], colors: '#FFF4E6, #FF4D6D, #FFD60A, #00C2A8', fonts: 'Fredoka + Baloo 2', camera: 'orbit-3d-inspect -> push-in-settle -> pull-out-monumental' },
  { id: 38, name: 'Peta Transit', bgm: 'B24', sfx: 'S-MEKANIK + S-DIGITAL', bpm: 116, keywords: ['roadmap', 'linimasa', 'timeline', 'rute', 'onboarding', 'tahapan'], colors: '#F6F4EE, #E63946, #1D8FE1, #2BA84A', fonts: 'Barlow Condensed + Barlow', camera: 'follow-target-rack -> dolly-lateral-parallax -> pull-out-monumental' },
  { id: 39, name: 'HUD Game', bgm: 'B03', sfx: 'S-DIGITAL + S-ARCADE', bpm: 132, keywords: ['hud', 'esport', 'simulasi', 'gaming', 'misi'], colors: '#0B1118, #F2F6F8, #00D1B2, #FFB800', fonts: 'Rajdhani + Teko', camera: 'orbit-3d-inspect -> follow-target-rack -> pull-out-monumental' },
  { id: 40, name: 'Siaran Olahraga', bgm: 'B22', sfx: 'S-SINEMA', bpm: 150, keywords: ['olahraga', 'bola', 'skor', 'klasemen', 'pertandingan', 'atlet'], colors: '#0A0A0A, #FFFFFF, #FFD400, #E4002B', fonts: 'Teko + Barlow Condensed', camera: 'push-in-settle -> crane-up-focus -> pull-out-monumental' },
  { id: 41, name: 'Cat Air', bgm: 'B10', sfx: 'S-ORGANIK', bpm: 68, keywords: ['puisi', 'wellness', 'meditasi', 'lembut', 'organik', 'cat air'], colors: '#FBF7F0, #6A8CAF, #E7A5A5, #A8C69F', fonts: 'Cormorant + Patrick Hand', camera: 'dolly-lateral-parallax -> push-in-settle -> pull-out-monumental' },
  { id: 42, name: 'Krayon dan Pastel Minyak', bgm: 'B08', sfx: 'S-KERTAS + S-ORGANIK', bpm: 114, keywords: ['anak', 'paud', 'keluarga', 'krayon', 'menggambar'], colors: '#FFF9EC, #E63946, #F4A261, #2A9D8F', fonts: 'Gochi Hand + Patrick Hand', camera: 'dolly-lateral-parallax -> push-in-settle -> pull-out-monumental' },
  { id: 43, name: 'Motion Reel Editorial', bgm: 'B09', sfx: 'S-DIGITAL + S-MEKANIK', bpm: 122, keywords: ['promo', 'reel', 'portofolio', 'pitch', 'agency', 'jasa', 'produk digital', 'landing'], colors: '#F4EEE7, #0F110F, #FD5837, #C9DE4B', fonts: 'Instrument Serif + Hanken Grotesk + JetBrains Mono', camera: 'push-in-settle -> orbit-3d-inspect -> dolly-lateral-parallax -> crane-up-focus -> pull-out-monumental' },
];

function parseArgs(argv) {
  const args = { brief: '', styleId: null, outDir: 'research' };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--brief' && argv[i + 1]) args.brief = argv[i + 1];
    if (argv[i] === '--style' && argv[i + 1]) args.styleId = Number(argv[i + 1]);
    if (argv[i] === '--out' && argv[i + 1]) args.outDir = argv[i + 1];
  }
  return args;
}

const opts = parseArgs(process.argv);
const outDir = path.resolve(process.cwd(), opts.outDir);
fs.mkdirSync(outDir, { recursive: true });

const logFile = path.join(outDir, 'style-log.md');
let recentIds = [];
if (fs.existsSync(logFile)) {
  const content = fs.readFileSync(logFile, 'utf8');
  const matches = [...content.matchAll(/Gaya #(\d+)/g)];
  recentIds = matches.slice(-2).map((m) => Number(m[1]));
}

const briefLower = (opts.brief || 'promo produk digital saas').toLowerCase();

const scored = STYLE_INDEX.map((s) => {
  let score = 1;
  for (const kw of s.keywords) {
    if (briefLower.includes(kw)) score += 3;
  }
  if (recentIds.includes(s.id)) score -= 2; // Penalti -2 poin sesuai STYLES.md jika dipakai di 2 proyek terakhir
  return { ...s, score };
}).sort((a, b) => b.score - a.score || b.id - a.id);

const chosen = opts.styleId
  ? STYLE_INDEX.find((s) => s.id === opts.styleId) || scored[0]
  : scored[0];
const rejected1 = scored.find((s) => s.id !== chosen.id) || STYLE_INDEX[10];
const rejected2 = scored.find((s) => s.id !== chosen.id && s.id !== rejected1.id) || STYLE_INDEX[11];

const paddedId = String(chosen.id).padStart(2, '0');
const stylesDir = path.join(SKILL_ROOT, 'references', 'styles');
let styleDetailFile = `references/styles/${paddedId}-style.md`;
if (fs.existsSync(stylesDir)) {
  const matchFile = fs.readdirSync(stylesDir).find((f) => f.startsWith(`${paddedId}-`) && f.endsWith('.md'));
  if (matchFile) {
    styleDetailFile = `references/styles/${matchFile}`;
    fs.copyFileSync(path.join(stylesDir, matchFile), path.join(outDir, 'selected-style-guide.md'));
  }
}

const styleBibleContent = `# Style Bible

- **Gaya terpilih dari STYLES.md:** Gaya #${chosen.id} — **${chosen.name}** (Cocok dengan brief "${opts.brief || 'default'}"; dua kandidat lain yang ditolak: Gaya #${rejected1.id} ${rejected1.name} dan Gaya #${rejected2.id} ${rejected2.name}).
- **File Panduan Spesifikasi Rinci:** \`${styleDetailFile}\` (Disalin juga ke \`research/selected-style-guide.md\` — wajib dibaca penuh sebelum coding scene!).
- **Konsep (satu kalimat):** Menerjemahkan "${opts.brief || 'subjek utama'}" ke dalam bahasa bentuk ${chosen.name} dengan konten visual autentik di tengah (85%), kamera C1 spline tenang, dan subtitle bersih di bawah.
- **Kata kunci mood (tiga):** Presisi, Berkarakter, Anti-Slop.
- **Palet (hex, peran, proporsi):** ${chosen.colors} (60% dominan latar, 25% permukaan & teks utama, 15% aksen tajam).
- **Tipografi (family, peran, skala):** ${chosen.fonts} (Judul kontras ekstrem 68-92px, teks pendukung 28-44px, metadata mono 16-22px, BottomSubtitleBar 25px).
- **Bahasa bentuk:** Konsisten dengan ${chosen.name}; replika aplikasi/UI autentik, wajib \`<BrandLogo />\` asli untuk brand, tanpa background teks/pill sampah, dan tanpa titik bulat \`• teks\`.
- **Bahasa gerak:** C1 Spline (\`splineAt\`), \`easeOutExpo\`, \`staggeredSpringAt\` 3-lapis, dan \`microBob\` saat hold.
- **Jalur Kamera per Scene:** \`${chosen.camera}\` (tenang bebas shake, fokus mengikuti ketikan & kursor).
- **Ritme dan audio:** ${chosen.bpm} BPM | Backsound: **${chosen.bgm}** | Pack SFX: **${chosen.sfx}** + Studio CC0 SFX | Target loudness: **-14 LUFS**.
- **Yang sengaja dihindari:** Gradien ungu-biru generik AI, emoji, kamera shake, background pill pada judul teks, atau SFX acak tanpa animasi.
`;

fs.writeFileSync(path.join(outDir, 'style-bible.md'), styleBibleContent, 'utf8');
const dateStr = new Date().toISOString().slice(0, 10);
fs.appendFileSync(
  logFile,
  `- [${dateStr}] Brief: "${opts.brief || 'Default'}" -> Gaya #${chosen.id} (${chosen.name}) | Guide: ${styleDetailFile} | Audio: ${chosen.bgm} + ${chosen.sfx}\n`,
  'utf8'
);

console.log(JSON.stringify({
  chosen: { id: chosen.id, name: chosen.name, bgm: chosen.bgm, sfx: chosen.sfx, bpm: chosen.bpm, styleGuide: styleDetailFile },
  alternatives: [
    { id: rejected1.id, name: rejected1.name },
    { id: rejected2.id, name: rejected2.name },
  ],
  styleBiblePath: path.join(outDir, 'style-bible.md'),
  selectedStyleGuidePath: path.join(outDir, 'selected-style-guide.md'),
}, null, 2));
