import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, getStaticFiles, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Corner, t01 } from './kit';
import { S1, S10, S2, S3, S4, S5, S6, S7, S8, S9 } from './scenes';
import { Background, Phone, blueAmount } from './stage';
import { MUSIC_END, MUSIC_FADE, OUTRO_FROM, T } from './timeline';

const OUTRO = 'outro/outro-169-cepat.mp4';
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

const Film: React.FC = () => {
  const f = useCurrentFrame();
  const cb = blueAmount(f);
  const corner = 1 - t01(f, T.s10 + 132, T.s10 + 150);
  return (
    <AbsoluteFill>
      <Background f={f} />
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
      <S10 f={f} />
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
