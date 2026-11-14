import React from 'react';
import { continueRender, delayRender } from 'remotion';

/**
 * <img> that holds the frame until the browser has decoded it.
 * Remotion's <Img> only waits for `load`, so large PNGs that mount mid-video
 * were sometimes captured before paint (one-frame blank screenshots).
 */
export const Img: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  const ref = React.useRef<HTMLImageElement>(null);
  const [handle] = React.useState(() => delayRender(`decode ${props.src}`));
  React.useEffect(() => {
    const el = ref.current;
    const done = () => {
      requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)));
    };
    if (el) el.decode().then(done, done);
    else done();
  }, [handle]);
  return <img ref={ref} alt="" {...props} />;
};
