import React from 'react';
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, getStaticFiles, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { B3, TOTAL_V3, ip } from './kit3';
import { S1, S2, S3, S4, S5 } from './scenes3a';
import { S6, S7, S8, S9, S10 } from './scenes3b';
import { Corner } from './StyleFramesV3';
import { BLUE_BG, WHITE_BG } from './theme3';

const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10];
/** Frames each scene keeps rendering past its end (exit continues under the next scene) */
const TAIL = [28, 22, 28, 22, 30, 24, 20, 24, 0, 0];

/** Background blue amount (global frames) */
const bgBlue = (f: number) => {
  if (f < 810) return ip(f, [360, 390], [0, 1]) * (1 - ip(f, [474, 504], [0, 1]));
  if (f < 840) return 0; // S6 draws its own blue wipe (810–840)
  if (f < 990) return 1; // S6, until S7's white sheet covers it
  if (f < 1145) return 0; // S7, S8 draws its own wipe (1115–1145)
  return 1 - ip(f, [1248, 1272], [0, 1]); // S8 → S9 eases back to white
};
/** Corner label blue amount: 12-frame cross-fades timed to when the edge passes the corners */
const cornerBlue = (f: number) => {
  if (f < 810) return bgBlue(f);
  if (f < 822) return 0;
  if (f < 834) return ip(f, [822, 834], [0, 1]);
  if (f < 957) return 1;
  if (f < 1115) return 1 - ip(f, [970, 984], [0, 1]);
  if (f < 1248) return ip(f, [1128, 1142], [0, 1]);
  return bgBlue(f);
};

/** Decode every image before the first frame is captured, so no screenshot shows up blank for a frame */
const IMG_RE = /^(ui|brand|badge)\/[^/]+\.(png|jpe?g|svg|webp)$/i;
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

export const MainVideoV3: React.FC = () => {
  usePreloadImages();
  const f = useCurrentFrame();
  const blue = bgBlue(f);
  const cb = cornerBlue(f);
  return (
    <AbsoluteFill style={{ background: WHITE_BG }}>
      {blue > 0 && <AbsoluteFill style={{ background: BLUE_BG, opacity: blue }} />}
      {SCENES.map((S, i) => (
        <Sequence key={i} from={B3[i]} durationInFrames={B3[i + 1] - B3[i] + TAIL[i]} layout="none">
          <AbsoluteFill>
            <S />
          </AbsoluteFill>
        </Sequence>
      ))}
      {f < B3[9] + 150 && (
        <AbsoluteFill style={{ opacity: 1 - ip(f, [B3[9] + 132, B3[9] + 150], [0, 1]) }}>
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
      <Audio
        src={staticFile('audio/music-v3.wav')}
        volume={(fr) => interpolate(fr, [0, 10, TOTAL_V3 - 50, TOTAL_V3], [0, 0.8, 0.8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    </AbsoluteFill>
  );
};
