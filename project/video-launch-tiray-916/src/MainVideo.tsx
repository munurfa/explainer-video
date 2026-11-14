import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, getStaticFiles, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Corner, Img, easeInOutSmooth, lerp, t01 } from './kit';
import { BLUE_BG, C, WHITE_BG } from './theme';
import { H, MUSIC_END, MUSIC_FADE, OUTRO_FROM, T, W } from './timeline';
import { S1, S10, S2, S3, S4, S5, S6, S7, S8, S9, endFx } from './wide/scenes';
import { FLOODS, FLOOD_LEN, Phone, blueAmount, floodIdx } from './wide/stage';
import { H as WH, W as WW } from './wide/timeline';

const OUTRO = 'outro/outro-916-cepat.mp4';
const IMG_RE = /^(ui|brand|badge|outro)\/[^/]+\.(png|jpe?g|svg|webp)$/i;
/** Decode every still asset before frame 0 so nothing pops in late */
const usePreloadImages = () => {
  const [handle] = React.useState(() => delayRender('decode images'));
  React.useEffect(() => {
    const files = getStaticFiles().filter((x) => IMG_RE.test(x.name));
    Promise.all(
      files.map((x) => {
        const img = new Image();
        img.src = x.src;
        return img.decode().catch(() => undefined);
      }),
    ).then(() => continueRender(handle));
  }, [handle]);
};

/*
 * v2 layout (user request): the approved 16:9 film plays unchanged inside a 16:9 window centred in the
 * 9:16 frame (1080 × 607.5, scale 0.5625). Only the 9:16 corner logos, the page background and the
 * end-card hand-off (background image + green dot) live outside the window.
 */
const BOX_S = W / WW; // 0.5625
const BOX_H = WH * BOX_S; // 607.5
const BOX_TOP = (H - BOX_H) / 2; // 656.25
const toY = (y: number) => BOX_TOP + y * BOX_S;
/** Measured from outro-916-cepat: merged dot Ø62 at (539.5, 959.5), Ø172 / 222 / 232 on outro frames 48–50 */
const MERGE = { x: 539.5, y: 959.5, d: 62 };
const GROW = [172, 222, 232];
const GLOW = [0.12, 0.24, 0.32];

const EndFx: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.s10 + 78) return null;
  const { tab, bg, mv, k, tabX, ul } = endFx(f);
  const big = k >= 0 ? GROW[Math.min(2, k)] : 0;
  const gx = big ? MERGE.x : lerp(tabX * BOX_S, MERGE.x, mv);
  const gy = big ? MERGE.y : lerp(toY(ul), MERGE.y, mv);
  const gw = big || lerp(66 * tab * BOX_S, MERGE.d, mv);
  const gh = big || lerp(14 * BOX_S, MERGE.d, mv);
  const glow = k >= 0 ? GLOW[Math.min(2, k)] : 0;
  return (
    <AbsoluteFill>
      {bg > 0 && <Img src={staticFile('outro/bg916.png')} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: bg }} />}
      <div
        style={{
          position: 'absolute',
          left: gx - gw / 2,
          top: gy - gh / 2,
          width: gw,
          height: gh,
          borderRadius: Math.min(gw, gh) / 2,
          background: C.green,
          boxShadow: glow > 0 ? `0 0 ${(gw * 0.3).toFixed(2)}px ${(gw * 0.04).toFixed(2)}px rgba(48,179,73,${glow.toFixed(3)})` : undefined,
        }}
      />
    </AbsoluteFill>
  );
};

/** The 16:9 floods, redrawn on the whole 9:16 canvas (same timing and origin, mapped out of the window)
 *  so the background has no visible edge; only the moving parts are clipped by the window. */
const PageBackground: React.FC<{ f: number }> = ({ f }) => {
  const i = floodIdx(f);
  const cur = i >= 0 ? FLOODS[i] : null;
  const p = cur ? t01(f, cur.at, cur.at + FLOOD_LEN, easeInOutSmooth) : 1;
  const blue = cur ? cur.blue : false;
  const base = p < 1 ? (blue ? WHITE_BG : BLUE_BG) : blue ? BLUE_BG : WHITE_BG;
  return (
    <AbsoluteFill style={{ background: base }}>
      {cur && p < 1 && (
        <AbsoluteFill style={{ background: blue ? BLUE_BG : WHITE_BG, clipPath: `circle(${(p * 2300).toFixed(2)}px at ${(cur.x * BOX_S).toFixed(2)}px ${toY(cur.y).toFixed(2)}px)` }} />
      )}
    </AbsoluteFill>
  );
};

const Film: React.FC = () => {
  const f = useCurrentFrame();
  const cb = blueAmount(f);
  const corner = 1 - t01(f, T.s10 + 132, T.s10 + 150);
  return (
    <AbsoluteFill>
      <PageBackground f={f} />
      {/* the 16:9 window */}
      <div style={{ position: 'absolute', left: 0, top: BOX_TOP, width: W, height: BOX_H, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: WW, height: WH, transform: `scale(${BOX_S})`, transformOrigin: '0 0' }}>
          <Phone f={f} />
          <S1 f={f} />
          <S2 f={f} />
          <S3 f={f} />
          <S4 f={f} />
          <S5 f={f} />
          <S6 f={f} />
          <S7 f={f} />
          <S8 f={f} />
          <S9 f={f} />
          <S10 f={f} bare />
        </div>
      </div>
      <EndFx f={f} />
      {corner > 0 && (
        <AbsoluteFill style={{ opacity: corner }}>
          {cb < 1 && (
            <AbsoluteFill style={{ opacity: 1 - cb }}>
              <Corner />
            </AbsoluteFill>
          )}
          {cb > 0 && (
            <AbsoluteFill style={{ opacity: cb }}>
              <Corner onBlue />
            </AbsoluteFill>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/**
 * 0 … T.end        our animation, cut to the beat of the user's track
 * T.end … TOTAL    official Tirta Ayu outro from its frame 51, with its own sound
 * The music fades out at the end of our part (MUSIC_FADE..MUSIC_END, user request); the outro's audio starts
 * OUTRO_FROM frames before the cut (its first 51 frames play under our hand-off) after about 1 s of silence.
 */
export const MainVideo: React.FC = () => {
  usePreloadImages();
  return (
    <AbsoluteFill style={{ background: '#ffffff' }}>
      <Sequence durationInFrames={T.end} layout="none">
        <Film />
      </Sequence>
      <Sequence from={T.end} layout="none">
        <OffthreadVideo src={staticFile(OUTRO)} startFrom={OUTRO_FROM} muted style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }} />
      </Sequence>
      <Sequence from={T.end - OUTRO_FROM} layout="none">
        <Audio src={staticFile(OUTRO)} />
      </Sequence>
      <Audio
        src={staticFile('audio/music.wav')}
        endAt={MUSIC_END}
        volume={(fr) => interpolate(fr, [0, 6, MUSIC_FADE, MUSIC_END], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    </AbsoluteFill>
  );
};
