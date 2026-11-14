import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { quantizeFrame } from '../theme/easing-and-timing';
import { MotionStylePreset } from '../theme/styles-catalog';

export interface ProceduralBackgroundProps {
  stylePreset: MotionStylePreset;
  /** Kecepatan drift latar (default 1.0) — memastikan tes freezedetect (-60dB) selalu lolos */
  driftSpeed?: number;
}

/**
 * Latar Prosedural Hidup (Latar tidak pernah rata dan diam)
 * Dibangun 100% dari kode (SVG & CSS terhitung per frame).
 */
export const ProceduralBackground: React.FC<ProceduralBackgroundProps> = ({
  stylePreset,
  driftSpeed = 1.0,
}) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const targetFps = stylePreset.shape.quantizedFps ?? fps;
  const frame = quantizeFrame(rawFrame, targetFps, fps);

  const { bg, ink, muted, accent, accentSecondary } = stylePreset.palette;
  const pattern = stylePreset.shape.bgPattern;

  const dx = (frame * 0.65 * driftSpeed) % 120;
  const dy = (frame * 0.42 * driftSpeed) % 120;
  const angle = (frame * 0.08 * driftSpeed) % 360;

  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: 'hidden' }}>
      {pattern === 'editorial-grid' && (
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.14 }}>
          <defs>
            <pattern
              id="editorial-grid-pat"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(${dx.toFixed(1)}, ${dy.toFixed(1)})`}
            >
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke={ink} strokeWidth="1" />
              <circle cx="0" cy="0" r="2" fill={accent} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#editorial-grid-pat)" />
        </svg>
      )}

      {pattern === 'topographic-contours' && (
        <svg
          viewBox="0 0 1920 1080"
          style={{
            position: 'absolute',
            inset: '-10%',
            width: '120%',
            height: '120%',
            opacity: 0.22,
            transform: `translate(${(dx * 0.5).toFixed(1)}px, ${(dy * 0.4).toFixed(1)}px) rotate(${(angle * 0.15).toFixed(2)}deg)`,
          }}
        >
          {[140, 230, 320, 420, 530, 650, 780].map((r, idx) => (
            <ellipse
              key={idx}
              cx={960 + Math.sin(frame * 0.02 + idx) * 35}
              cy={540 + Math.cos(frame * 0.015 + idx) * 25}
              rx={r * 1.45}
              ry={r * 0.82}
              fill="none"
              stroke={idx % 3 === 0 ? accent : muted}
              strokeWidth={idx % 3 === 0 ? 2 : 1.2}
              strokeDasharray={idx % 2 === 0 ? 'none' : '12 8'}
            />
          ))}
        </svg>
      )}

      {pattern === 'halftone-dots' && (
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.16 }}>
          <defs>
            <pattern
              id="halftone-pat"
              width="36"
              height="36"
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(${dx.toFixed(1)}, ${dy.toFixed(1)}) rotate(15)`}
            >
              <circle cx="18" cy="18" r={4 + Math.sin(frame * 0.05) * 1.2} fill={ink} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#halftone-pat)" />
        </svg>
      )}

      {pattern === 'isometric-axon' && (
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
          <defs>
            <pattern
              id="iso-axon-pat"
              width="104"
              height="60"
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(${dx.toFixed(1)}, ${dy.toFixed(1)})`}
            >
              <path
                d="M 52 0 L 104 30 L 52 60 L 0 30 Z"
                fill="none"
                stroke={muted}
                strokeWidth="1.2"
              />
              <circle cx="52" cy="30" r="2.2" fill={accent} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#iso-axon-pat)" />
        </svg>
      )}

      {pattern === 'blueprint-draft' && (
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.25 }}>
          <defs>
            <pattern
              id="blueprint-sub"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(${dx.toFixed(1)}, ${dy.toFixed(1)})`}
            >
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke={ink} strokeWidth="0.5" opacity="0.4" />
            </pattern>
            <pattern
              id="blueprint-main"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(${dx.toFixed(1)}, ${dy.toFixed(1)})`}
            >
              <rect width="120" height="120" fill="url(#blueprint-sub)" />
              <path d="M 120 0 L 0 0 0 120" fill="none" stroke={ink} strokeWidth="1.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-main)" />
        </svg>
      )}

      {pattern === 'crt-scanlines' && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ink}14 3px, ${ink}14 6px)`,
              transform: `translateY(${((frame * 0.8) % 6).toFixed(1)}px)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${((frame * 1.4) % 110) - 10}%`,
              height: 90,
              background: `linear-gradient(180deg, transparent, ${accent}18, transparent)`,
            }}
          />
        </>
      )}

      {pattern === 'diagonal-construct' && (
        <svg
          viewBox="0 0 1920 1080"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.14 }}
        >
          <g transform={`translate(${(dx - 60).toFixed(1)}, ${(dy - 60).toFixed(1)}) rotate(-25 960 540)`}>
            {Array.from({ length: 16 }).map((_, idx) => (
              <line
                key={idx}
                x1={idx * 160 - 200}
                y1={-400}
                x2={idx * 160 - 200}
                y2={1500}
                stroke={idx % 4 === 0 ? accent : ink}
                strokeWidth={idx % 4 === 0 ? 4 : 1.5}
              />
            ))}
          </g>
        </svg>
      )}

      {pattern === 'paper-grain' && (
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.16 }}>
          <defs>
            <pattern
              id="paper-fibers"
              width="90"
              height="90"
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(${(dx * 0.4).toFixed(1)}, ${(dy * 0.4).toFixed(1)})`}
            >
              <path d="M 12 18 Q 28 12 42 22" fill="none" stroke={muted} strokeWidth="1.2" />
              <path d="M 55 64 Q 72 58 81 71" fill="none" stroke={ink} strokeWidth="1" />
              <circle cx="70" cy="24" r="1.5" fill={accent} />
              <circle cx="24" cy="72" r="1.2" fill={accentSecondary} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#paper-fibers)" />
        </svg>
      )}

      {/* Ornamen Geometris Mengambang Lambat (Menjaga kedalaman lapisan latar) */}
      <div
        style={{
          position: 'absolute',
          right: '8%',
          top: '14%',
          width: 220,
          height: 220,
          border: `${stylePreset.shape.strokeWidth || 1.5}px solid ${accent}33`,
          borderRadius: stylePreset.shape.borderRadius > 0 ? '50%' : 0,
          transform: `translate(${(Math.sin(frame * 0.03) * 18).toFixed(1)}px, ${(Math.cos(frame * 0.025) * 14).toFixed(1)}px) rotate(${angle.toFixed(1)}deg)`,
        }}
      />
    </AbsoluteFill>
  );
};
