// node research/stills.mjs <Comp> <outDir> f1,f2,...  — bundle once, render many stills
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const [comp, outDir, list] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const chromiumOptions = { gl: 'angle' };
const composition = await selectComposition({ serveUrl, id: comp, chromiumOptions });
for (const fr of list.split(',').map(Number)) {
  const output = path.join(outDir, `f${String(fr).padStart(4, '0')}.png`);
  await renderStill({ serveUrl, composition, frame: fr, output, chromiumOptions, logLevel: 'error' });
  console.log('ok', fr);
}
