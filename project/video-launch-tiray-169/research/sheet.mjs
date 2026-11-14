// node research/sheet.mjs <dir with fNNNN.png> <out.png> [cols=4] [cellW=640] [from] [to]
// Contact sheet: each still scaled to cellW, frame number + time printed under it.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const [dir, out, colsArg, cellArg, fromArg, toArg] = process.argv.slice(2);
const cols = Number(colsArg || 4);
const cw = Number(cellArg || 640);
const ch = Math.round((cw * 9) / 16);
let files = fs.readdirSync(dir).filter((x) => /^f\d+\.png$/.test(x)).sort();
if (fromArg) files = files.filter((x) => Number(x.slice(1, 5)) >= Number(fromArg) && Number(x.slice(1, 5)) <= Number(toArg || 1e9));
const rows = Math.ceil(files.length / cols);
const args = ['-hide_banner', '-loglevel', 'error', '-y'];
for (const f of files) args.push('-i', path.join(dir, f));
const font = 'out/storyboard/_label.ttf'; // copied from C:/Windows/Fonts/arial.ttf (a drive colon cannot be escaped reliably inside a filtergraph)
const parts = files.map((f, i) => {
  const n = Number(f.slice(1, 5));
  const label = `f ${n}  -  ${(n / 30).toFixed(1)} dtk`;
  return `[${i}:v]scale=${cw}:${ch},pad=${cw}:${ch + 34}:0:0:white,drawtext=fontfile='${font}':text='${label}':x=8:y=${ch + 8}:fontsize=20:fontcolor=0x16243b[v${i}]`;
});
const layout = files.map((_, i) => `${(i % cols) * (cw + 8)}_${Math.floor(i / cols) * (ch + 42)}`).join('|');
const graph = `${parts.join(';')};${files.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${files.length}:layout=${layout}:fill=white[o]`;
args.push('-filter_complex', graph, '-map', '[o]', '-frames:v', '1', out);
execFileSync('ffmpeg', args, { stdio: ['ignore', 'inherit', 'pipe'] });
console.log(`sheet ${out}: ${files.length} stills, ${cols}x${rows}`);
