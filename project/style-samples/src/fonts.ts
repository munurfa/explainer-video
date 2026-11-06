import { FONT_MODULES } from './fontModules';

const loaded = new Map<string, { family: string; weights: number[] }>();

/** Load satu keluarga font Google (latin, bobot yang tersedia saja) dan kembalikan family + bobot tersedia. */
export function loadFamily(name: string, wanted: number[]): { family: string; weights: number[] } {
  const key = name;
  const hit = loaded.get(key);
  if (hit) return hit;
  const mod = FONT_MODULES[name];
  if (!mod) {
    const r = { family: name, weights: [400] };
    loaded.set(key, r);
    return r;
  }
  const info = mod.getInfo();
  const avail: string[] = Object.keys(info.fonts.normal ?? info.fonts[Object.keys(info.fonts)[0]] ?? {});
  const want = Array.from(
    new Set(
      wanted.map((w) => {
        // bobot tersedia terdekat
        let best = avail[0];
        for (const a of avail) if (Math.abs(Number(a) - w) < Math.abs(Number(best) - w)) best = a;
        return best;
      })
    )
  );
  const style = info.fonts.normal ? 'normal' : Object.keys(info.fonts)[0];
  const subs: string[] = Object.keys(info.fonts[style]?.[want[0]] ?? {});
  const subsets: string[] = subs.includes('latin') ? ['latin'] : subs.slice(0, 1);
  const res = mod.loadFont(style as 'normal', { weights: want, subsets });
  const r = { family: res.fontFamily as string, weights: avail.map(Number) };
  loaded.set(key, r);
  return r;
}

export const nearestWeight = (weights: number[], w: number) =>
  weights.reduce((b, a) => (Math.abs(a - w) < Math.abs(b - w) ? a : b), weights[0] ?? 400);
