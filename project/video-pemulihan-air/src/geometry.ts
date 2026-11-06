// Geometri dunia (koordinat dunia = koordinat layar 1080x1920 saat kamera 1x)
export type Pt = [number, number];

export const MAIN: Pt[] = [
  [250, 600], // keluaran reservoir
  [330, 600], // gate valve di (300,600)
  [430, 790], // turunan, sambungan perbaikan di tengah ruas
  [520, 760], // titik tertinggi lokal: katup udara
  [600, 1000],
  [600, 1360], // simpul J ke jaringan distribusi
];
export const J: Pt = [600, 1360];
export const DIST: Pt[][] = [
  [J, [710, 1360], [710, 1332]],
  [J, [930, 1360], [930, 1332]],
  [J, [1030, 1360], [1030, 1332]],
];
export const INTERIOR: Pt[] = [
  [930, 1332],
  [930, 1205],
  [899, 1205],
];

export const GATE: Pt = [300, 600];
export const COUPLING: Pt = [380, 695];
export const AIR_VALVE: Pt = [520, 760];
export const GAUGE: Pt = [650, 1428];
export const TAP: Pt = [890, 1222];
export const SINK_Y = 1268;

export function polyLen(pts: Pt[]): number {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}

export function lenTo(pts: Pt[], index: number): number {
  return polyLen(pts.slice(0, index + 1));
}

/** Titik pada polyline di jarak d (px) dari awal */
export function pointAtDist(pts: Pt[], d: number): Pt {
  let rem = Math.max(0, d);
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    if (rem <= seg || i === pts.length - 1) {
      const u = seg > 0 ? Math.min(1, rem / seg) : 0;
      return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u];
    }
    rem -= seg;
  }
  return pts[pts.length - 1];
}

export const pathD = (pts: Pt[]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');

export const MAIN_LEN = polyLen(MAIN);
export const HUMP_DIST = lenTo(MAIN, 3);
export const GATE_DIST = 50;

/** Kamera: [frame, scale, tx, ty] — fokus titik dunia (wx,wy) ke tengah layar */
export const F = (s: number, wx: number, wy: number, cx = 540, cy = 960): [number, number, number] => [
  s,
  cx - wx * s,
  cy - wy * s,
];
const W: [number, number, number] = [1, 0, 0];

export const CAM: [number, number, number, number][] = [
  [0, ...F(4.4, 885, 1238)],
  [148, ...F(4.2, 885, 1240)],
  [205, ...W],
  [496, ...W],
  [532, ...F(1.9, 400, 720)],
  [646, ...F(1.9, 400, 720)],
  [705, ...F(1.75, 500, 900)],
  [758, ...F(1.5, 760, 1200)],
  [816, ...F(1.5, 760, 1200)],
  [852, ...F(2.6, 515, 780)],
  [1062, ...F(2.6, 515, 780)],
  [1096, ...F(3.0, 650, 1395)],
  [1140, ...F(3.0, 650, 1395)],
  [1170, ...F(4.2, 885, 1240)],
  [1216, ...F(4.2, 885, 1240)],
  [1256, ...W],
  [1885, ...W],
];
