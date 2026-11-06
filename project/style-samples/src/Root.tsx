import React from 'react';
import { Composition } from 'remotion';
import { STYLES_CATALOG } from './theme/styles-catalog';
import { StyleSample, DURATION } from './StyleSample';

export const RemotionRoot: React.FC = () => (
  <>
    {Object.values(STYLES_CATALOG).flatMap((st) => {
      const id = `S${String(st.id).padStart(2, '0')}-${st.slug}`;
      return [
        <Composition key={`${id}-169`} id={`${id}-169`} component={StyleSample} durationInFrames={DURATION} fps={30} width={1920} height={1080} defaultProps={{ styleId: st.id }} />,
        <Composition key={`${id}-916`} id={`${id}-916`} component={StyleSample} durationInFrames={DURATION} fps={30} width={1080} height={1920} defaultProps={{ styleId: st.id }} />,
      ];
    })}
  </>
);
