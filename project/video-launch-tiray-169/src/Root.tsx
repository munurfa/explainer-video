import React from 'react';
import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';
import { FPS, H, TOTAL, W } from './timeline';

export const RemotionRoot: React.FC = () => <Composition id="MainVideo" component={MainVideo} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />;
