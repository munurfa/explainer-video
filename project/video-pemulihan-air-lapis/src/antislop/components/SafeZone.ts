/**
 * Safe zone platform (Reels / TikTok / YouTube Shorts / feed).
 *
 * 9:16 (1080×1920): atas 15% (0–288 px) tertutup status bar + nama akun + tab, bawah 20%
 * (1536–1920 px) tertutup caption, tombol, dan progress bar aplikasi. Kanan ~12% tertutup
 * tombol like/komentar/share. Teks penting (judul, angka, subtitle, CTA) wajib di luar zona ini.
 * 16:9 cukup margin 5% di setiap sisi.
 */
import { useVideoConfig } from 'remotion';

export const SAFE_RATIO = {
  vertical: { top: 0.15, bottom: 0.2, right: 0.12, left: 0.05 },
  horizontal: { top: 0.05, bottom: 0.05, right: 0.05, left: 0.05 },
} as const;

export interface SafeZone {
  isVertical: boolean;
  /** px dari tepi atas yang tidak boleh berisi teks penting */
  top: number;
  /** px dari tepi bawah yang tidak boleh berisi teks penting */
  bottom: number;
  left: number;
  right: number;
  /** `bottom` CSS yang dianjurkan untuk subtitle (baris terbawah subtitle tepat di atas zona aman) */
  captionBottom: number;
  /** ukuran font subtitle yang dianjurkan */
  captionFontSize: number;
  /** kata per baris subtitle yang dianjurkan */
  captionWordsPerLine: number;
}

export function getSafeZone(width: number, height: number): SafeZone {
  const isVertical = height > width;
  const r = isVertical ? SAFE_RATIO.vertical : SAFE_RATIO.horizontal;
  const top = Math.round(height * r.top);
  const bottom = Math.round(height * r.bottom);
  return {
    isVertical,
    top,
    bottom,
    left: Math.round(width * r.left),
    right: Math.round(width * r.right),
    // 9:16: baris bawah subtitle di y ≈ 1498 (band subtitle 1280–1500); 16:9: 6% dari bawah
    captionBottom: isVertical ? bottom + Math.round(height * 0.02) : Math.round(height * 0.06),
    captionFontSize: isVertical ? Math.round(width * 0.041) : Math.max(26, Math.round(height * 0.026)),
    captionWordsPerLine: isVertical ? 4 : 7,
  };
}

export function useSafeZone(): SafeZone {
  const { width, height } = useVideoConfig();
  return getSafeZone(width, height);
}
