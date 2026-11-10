import React from 'react';
import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';
import { FPS, H, TOTAL_FRAMES, W } from './theme';
import { MainVideoV2 } from './v2/MainVideoV2';
import { TOTAL_V2 } from './v2/timing';
import { StyleFramesV3 } from './v3/StyleFramesV3';
import { MainVideoV3 } from './v3/MainVideoV3';
import { TOTAL_V3 } from './v3/kit3';
import { MainVideoV3W } from './v3w/MainVideoV3W';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MainVideo" component={MainVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="MainVideoV2" component={MainVideoV2} durationInFrames={TOTAL_V2} fps={FPS} width={W} height={H} />
    <Composition id="MainVideoV3" component={MainVideoV3} durationInFrames={TOTAL_V3} fps={FPS} width={W} height={H} />
    <Composition id="MainVideoV3W" component={MainVideoV3W} durationInFrames={TOTAL_V3} fps={FPS} width={1920} height={1080} />
    <Composition id="StyleV3" component={StyleFramesV3} durationInFrames={6} fps={FPS} width={W} height={H} />
  </>
);
