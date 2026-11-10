import React, { createContext, useContext } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  buildCursorFollowCameraSpline,
  buildTypingCameraSpline,
  clamp,
  easeOutExpo,
  ip,
  quantizeFrame,
  splineAt,
  splineVelocityAt,
} from '../theme/easing-and-timing';
import { CameraModePreset, MotionStylePreset } from '../theme/styles-catalog';

interface CameraContextValue {
  tx: number;
  ty: number;
  scale: number;
  rotDeg: number;
  blurPx: number;
}

const CameraContext = createContext<CameraContextValue>({
  tx: 0,
  ty: 0,
  scale: 1,
  rotDeg: 0,
  blurPx: 0,
});

export interface TypingFocusConfig {
  startFrame: number;
  endFrame: number;
  targetX: number;
  targetY: number;
  typingSpanWidth?: number;
  zoomScale?: number;
  anticipation?: boolean;
}

export interface CameraRigProps {
  /**
   * Waypoint C1 Spline Eksplisit: [frame, scale, tx, ty, rotDeg?][]
   */
  waypoints?: [number, number, number, number, number?][];
  /**
   * Otomatis zoom halus mengikuti ketikan (TypeText) dengan 3-frame anticipation pullback
   */
  followTyping?: TypingFocusConfig;
  /**
   * Otomatis bergeser/zoom halus mengikuti lintasan kursor ([frame, x, y][])
   */
  followCursorWaypoints?: [number, number, number][];
  mode?: CameraModePreset | 'calm-steady' | 'follow-typing' | 'follow-cursor' | 'wide-canvas-glide';
  durationInFrames: number;
  stylePreset?: MotionStylePreset;
  transformOrigin?: string;
  /**
   * Humanizer #5A: Velocity-Driven Motion Blur (default: true)
   * Saat kamera diam, blur = 0px (100% tajam). Hanya saat kamera melesat cepat muncul blur 1.5-3.8px.
   */
  enableVelocityBlur?: boolean;
  /**
   * Humanizer #5B: Rack Focus / Selective Spotlight (default: true)
   * Saat kamera sedang zoom-in dalam (scale > 1.32), area pinggir layar diberi soft radial spotlight
   * agar fokus mata terkunci ke elemen utama.
   */
  enableRackFocusSpotlight?: boolean;
  children: React.ReactNode;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  waypoints,
  followTyping,
  followCursorWaypoints,
  mode = 'calm-steady',
  durationInFrames,
  stylePreset,
  transformOrigin,
  enableVelocityBlur = true,
  enableRackFocusSpotlight = true,
  children,
}) => {
  const rawFrame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const targetFps = stylePreset?.shape.quantizedFps ?? fps;
  const frame = quantizeFrame(rawFrame, targetFps, fps);

  let activeSpline: [number, number, number, number, number][] | null = null;
  let origin = transformOrigin ?? '50% 50%';

  if (waypoints && waypoints.length > 0) {
    origin = transformOrigin ?? '0px 0px';
    activeSpline = waypoints.map((w) => [w[0], w[1], w[2], w[3], w[4] ?? 0]);
  } else if (followTyping) {
    origin = transformOrigin ?? '0px 0px';
    activeSpline = buildTypingCameraSpline({
      typeStartFrame: followTyping.startFrame,
      typeEndFrame: followTyping.endFrame,
      targetX: followTyping.targetX,
      targetY: followTyping.targetY,
      typingSpanWidth: followTyping.typingSpanWidth ?? Math.round(width * 0.22),
      zoomScale: followTyping.zoomScale ?? 1.62,
      viewportWidth: width,
      viewportHeight: height,
      anticipation: followTyping.anticipation ?? true,
    });
  } else if (followCursorWaypoints && followCursorWaypoints.length > 0) {
    origin = transformOrigin ?? '0px 0px';
    activeSpline = buildCursorFollowCameraSpline(followCursorWaypoints, {
      zoomScale: 1.26,
      followStrength: 0.55,
      viewportWidth: width,
      viewportHeight: height,
    });
  } else {
    const mid1 = Math.round(durationInFrames * 0.25);
    const mid2 = Math.round(durationInFrames * 0.72);
    const end = Math.max(1, durationInFrames - 1);

    switch (mode) {
      case 'calm-steady':
        activeSpline = [
          [0, 1.04, 0, 0, 0],
          [14, 1.0, 0, 0, 0],
          [end, 1.0, 0, 0, 0],
        ];
        break;
      case 'push-in-settle':
        activeSpline = [
          [0, 1.08, 0, 12, 0],
          [14, 1.0, 0, 0, 0],
          [mid2, 1.0, 0, 0, 0],
          [end, 1.04, 0, -6, 0],
        ];
        break;
      case 'dolly-lateral-parallax':
      case 'wide-canvas-glide':
        activeSpline = [
          [0, 1.0, 0, 0, 0],
          [mid1, 1.0, 0, 0, 0],
          [mid2, 1.06, -48, -8, 0],
          [end, 1.06, -48, -8, 0],
        ];
        break;
      case 'orbit-3d-inspect':
      case 'follow-target-rack':
        activeSpline = [
          [0, 1.0, 0, 0, 0],
          [mid1 - 3, 0.985, 8, -4, 0], // 3-frame anticipation pullback
          [mid1 + 8, 1.24, -60, 20, 0],
          [mid2, 1.24, 50, -18, 0],
          [end, 1.0, 0, 0, 0],
        ];
        break;
      case 'crane-up-focus':
        activeSpline = [
          [0, 1.05, 0, 42, 0],
          [18, 1.0, 0, 0, 0],
          [mid2, 1.0, 0, 0, 0],
          [end, 1.08, 0, -24, 0],
        ];
        break;
      case 'pull-out-monumental':
        activeSpline = [
          [0, 1.28, 0, -18, 0],
          [20, 1.0, 0, 0, 0],
          [end, 1.0, 0, 0, 0],
        ];
        break;
      default:
        activeSpline = [
          [0, 1.0, 0, 0, 0],
          [end, 1.0, 0, 0, 0],
        ];
    }
  }

  const [scale, tx, ty, rotDeg] = splineAt(frame, activeSpline);
  const { blurPx } = enableVelocityBlur
    ? splineVelocityAt(frame, activeSpline)
    : { blurPx: 0 };

  // Rack Focus Spotlight: aktif halus ketika kamera zoom >= 1.32x
  const spotlightOpacity = enableRackFocusSpotlight
    ? clamp((scale - 1.32) / 0.45, 0, 0.42)
    : 0;

  return (
    <CameraContext.Provider value={{ tx, ty, scale, rotDeg, blurPx }}>
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <AbsoluteFill
          style={{
            transform: `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0px) scale(${scale.toFixed(4)}) rotate(${rotDeg.toFixed(2)}deg)`,
            transformOrigin: origin,
            filter: blurPx > 0.25 ? `blur(${blurPx.toFixed(2)}px)` : undefined,
          }}
        >
          {children}
        </AbsoluteFill>

        {spotlightOpacity > 0.01 && (
          <AbsoluteFill
            style={{
              pointerEvents: 'none',
              background:
                'radial-gradient(ellipse 68% 62% at 50% 45%, rgba(0,0,0,0) 45%, rgba(10,12,16,0.55) 100%)',
              opacity: spotlightOpacity,
              zIndex: 70,
            }}
          />
        )}
      </AbsoluteFill>
    </CameraContext.Provider>
  );
};

export interface ParallaxLayerProps {
  depth: 'background' | 'midground' | 'foreground' | number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  depth,
  style,
  children,
}) => {
  const cam = useContext(CameraContext);
  const multiplier =
    depth === 'background'
      ? -0.25
      : depth === 'midground'
      ? 0
      : depth === 'foreground'
      ? 0.2
      : depth;

  const px = cam.tx * multiplier;
  const py = cam.ty * multiplier;

  return (
    <AbsoluteFill
      style={{
        transform: `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0px)`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
