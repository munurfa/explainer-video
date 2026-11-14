import React from 'react';
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, getStaticFiles, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { B3, TOTAL_V3, ip } from '../v3/kit3';
import { BLUE_BG, WHITE_BG } from '../v3/theme3';
import { CornerW } from './kitW';
import { S10W, S1W, S2W, S3W, S4W, S5W, S6W, S7W, S8W, S9W } from './scenesW';

/** 16:9 version of MainVideoV3 (v11 timing, same music): same boundaries, re-laid-out scenes */
const SCENES = [S1W, S2W, S3W, S4W, S5W, S6W, S7W, S8W, S9W, S10W];
const TAIL = [28, 22, 28, 22, 30, 24, 20, 24, 0, 0];

const bgBlue = (f: number) => {
  if (f < 810) return ip(f, [360, 390], [0, 1]) * (1 - ip(f, [474, 504], [0, 1]));
  if (f < 840) return 0;
  if (f < 990) return 1;
  if (f < 1145) return 0;
  return 1 - ip(f, [1248, 1272], [0, 1]);
};
/** Corner labels sit near the top edge: the bottom-up wipes reach them near the end of each wipe */
const cornerBlue = (f: number) => {
  if (f < 810) return bgBlue(f);
  if (f < 826) return 0;
  if (f < 838) return ip(f, [826, 838], [0, 1]);
  if (f < 957) return 1;
  if (f < 1115) return 1 - ip(f, [976, 988], [0, 1]);
  if (f < 1248) return ip(f, [1132, 1144], [0, 1]);
  return bgBlue(f);
};

const IMG_RE = /^(ui|brand|badge|outro)\/[^/]+\.(png|jpe?g|svg|webp)$/i;
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

export const MainVideoV3W: React.FC = () => {
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
              <CornerW />
            </AbsoluteFill>
          )}
          {cb > 0 && (
            <AbsoluteFill style={{ opacity: cb }}>
              <CornerW onBlue />
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
