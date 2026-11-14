// Usage:
//   node render-all.mjs                      -> render semua 88 video ke out/ lalu copy ke ../sample/<NN-slug>/
//   node render-all.mjs --stills <dir> --ids 1,26 --frames 40,150,260
//   node render-all.mjs --only 1,2           -> render subset
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (k) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : undefined;
};
const stillsDir = arg('--stills');
const only = (arg('--ids') ?? arg('--only'))?.split(',').map(Number);
const frames = (arg('--frames') ?? '40,150,260').split(',').map(Number);
const ratios = (arg('--ratios') ?? '169,916').split(',');
const concurrency = Number(arg('--concurrency') ?? 6);

const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public') });
console.log('bundled');

// daftar komposisi dari catalog (id-slug)
const catalogSrc = fs.readFileSync(path.join(root, 'src/theme/styles-catalog.ts'), 'utf8');
const styles = [...catalogSrc.matchAll(/^\s*\[(\d+),"([a-z0-9-]+)"/gm)].map((m) => ({ id: Number(m[1]), slug: m[2] }));
const list = styles.filter((s) => !only || only.includes(s.id));

const outDir = path.join(root, 'out');
const sampleDir = path.resolve(root, '..', '..', 'sample'); // sample/ ada di root repo
fs.mkdirSync(outDir, { recursive: true });

for (const s of list) {
  const nn = String(s.id).padStart(2, '0');
  for (const r of ratios) {
    const id = `S${nn}-${s.slug}-${r}`;
    const composition = await selectComposition({ serveUrl, id, inputProps: { styleId: s.id }, chromiumOptions: { gl: 'angle' } });
    if (stillsDir) {
      fs.mkdirSync(stillsDir, { recursive: true });
      for (const fr of frames) {
        await renderStill({ composition, serveUrl, output: path.join(stillsDir, `${id}-f${fr}.png`), frame: fr, inputProps: { styleId: s.id }, chromiumOptions: { gl: 'angle' } });
      }
      console.log('still', id);
      continue;
    }
    const tag = r === '169' ? '16x9' : '9x16';
    const out = path.join(outDir, `${nn}-${s.slug}-${tag}.mp4`);
    const t0 = Date.now();
    await renderMedia({ composition, serveUrl, codec: 'h264', outputLocation: out, inputProps: { styleId: s.id }, concurrency, crf: 20, audioBitrate: '192k', chromiumOptions: { gl: 'angle' } });
    const dest = path.join(sampleDir, `${nn}-${s.slug}`);
    fs.mkdirSync(dest, { recursive: true });
    fs.copyFileSync(out, path.join(dest, `${s.slug}-${tag}.mp4`));
    console.log(`done ${id} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
}
console.log('ALL DONE');
