/**
 * Timeline (9:16 port of the approved 16:9 v6, 60 s). Everything is snapped to the beat grid of public/audio/music.wav
 * (user track "Product Launch", constant 100 BPM): beat = 18 frames, bar = 72 frames,
 * beat 1 of bar 0 sits on frame 17. Big chord hits land on even bars (161, 305, 449, 593, 737, 881,
 * 1169, 1313, 1457), kicks on odd bars (377, 521, 665, 809, 1241, 1385). Breakdown 935-1097, build 1097-1169.
 * research/storyboard.md mirrors these numbers: change both together.
 */
export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const BEAT = 18;
export const OFF = 17;
/** Frame of bar `b` (0-based), beat `n` (1-4) */
export const bar = (b: number, n = 1) => OFF + 72 * b + BEAT * (n - 1);

export const T = {
  s1: 0, // hook
  s2: bar(2), // 161 aplikasi resmi
  s3: bar(4), // 305 layanan lengkap
  s4: bar(5, 3), // 413 tagihan + QRIS
  s5: bar(8), // 593 aduan
  s6: bar(11), // 809 info gangguan
  s7: bar(12, 4), // 935 pasang baru (music breakdown)
  s8: bar(15), // 1097 ga cuma itu (build)
  s9: bar(16), // 1169 semua di Tiray (drop)
  s10: bar(19), // 1385 #YuhBukaTiray
  end: 1557, // last frame + 1 of our own animation; the outro joins here
};

/** Outro video (outro_tirta_ayu_9x16_final_v1_cepat.mp4, 294 frames): we enter on its frame 51 */
export const OUTRO_FROM = 51;
export const OUTRO_FRAMES = 294;
export const TOTAL = T.end + (OUTRO_FRAMES - OUTRO_FROM); // 1800 = 60.0 s

/** v3 (user): the music stays at full level until 47.5 s, fades over 1.5 s and is silent at 49 s; then silence until the outro's own sound (50.2 s).
 *  v2 faded from bar 18 (1313) to 48 s (1440): the user found the tail too quiet. */
export const MUSIC_FADE = 47.5 * FPS; // 1425
export const MUSIC_END = 49 * FPS; // 1470
