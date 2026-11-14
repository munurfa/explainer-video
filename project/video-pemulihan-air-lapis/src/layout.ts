/**
 * Tata letak diorama + keadaan air + bidikan kamera.
 * Satuan dunia ~ meter diorama. Jaringan pipa ada di bidang x = 0 sepanjang sumbu z:
 * tandon jauh dan tinggi (z negatif), rumah pelanggan dekat dan rendah (z positif). Kamera di sisi +x.
 * Tanah berlapis: badan belakang (x <= SEAM) tetap, lapis depan (x >= SEAM) dilepas untuk memperlihatkan pipa.
 */
import { CamKey3D, camKey, driftHold, Shot } from './antislop/components/Lapis3D';
import { T, TOTAL_FRAMES } from './timeline';

export type V3 = [number, number, number];

/* ---------------- tanah ---------------- */
/** Permukaan tanah [z, y]. Pipa sejajar 0,4 di bawahnya. */
export const PROFILE: [number, number][] = [
  [-7.8, 2.1],
  [-3.7, 2.1],
  [-2.3, 1.15],
  [-1.45, 1.75],
  [-0.2, 0.76],
  [6.0, 0.76],
];
export const SEAM = -0.24; // batas lapis depan dan badan belakang
export const BACK_X = -2.5;
export const FRONT_X = 0.95;
export const SKIN = 0.07;
export const LEDGE_DROP = 0.62; // dasar galian di bawah permukaan
/** Rentang z tiga lapis tanah depan: jalan, lereng, dataran tandon. */
export const SLABS: [number, number][] = [
  [-0.2, 6.0],
  [-3.7, -0.2],
  [-7.8, -3.7],
];

export function groundY(z: number) {
  for (let i = 1; i < PROFILE.length; i++) {
    const [z0, y0] = PROFILE[i - 1];
    const [z1, y1] = PROFILE[i];
    if (z <= z1) return y0 + ((y1 - y0) * Math.max(0, z - z0)) / (z1 - z0);
  }
  return PROFILE[PROFILE.length - 1][1];
}

/* ---------------- jaringan ---------------- */
export const MAIN_R: [number, number] = [0.17, 0.135];
export const DIST_R: [number, number] = [0.12, 0.094];
export const MAIN: V3[] = [
  [0, 1.7, -6.0], // A: di bawah tandon
  [0, 1.7, -3.7], // B: tepi dataran
  [0, 0.75, -2.3], // C: titik rendah
  [0, 1.35, -1.45], // D: punuk (katup udara)
  [0, 0.36, -0.2], // E
  [0, 0.36, 0.8], // J: awal pipa kecil
];
export const DIST: V3[] = [
  [0, 0.36, 0.8],
  [0, 0.36, 5.4],
];
export const TANK = { z: -6.0, y: 2.1, r: 0.95, h: 1.25 };
export const GATE_Z = -4.75;
export const HUMP: V3 = MAIN[3];
export const AIRV_Y = 2.0; // dasar badan katup udara (di atas tanah)
export const GAUGE = { z: 1.7, y: 1.32, r: 0.24 };
export const HOUSE = { x: -1.38, z: 4.3, w: 1.25, d: 1.35, h: 1.1 };
export const HOUSE_Y = 0.76;
export const NEIGHBOURS = [
  { z: 1.2, wall: 'shell', roof: '#E8B7A0' },
  { z: 2.75, wall: 'shellCool', roof: '#B9C3CF' },
] as const;
export const TAP: V3 = [HOUSE.x - HOUSE.w / 2 + 0.2, HOUSE_Y + 0.78, HOUSE.z];
export const SPOUT_TIP: V3 = [TAP[0] + 0.3, TAP[1] - 0.02, TAP[2]];
export const SINK_Y = HOUSE_Y + 0.5;

export const dist = (a: V3, b: V3) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
export const polyLen = (p: V3[]) => p.slice(1).reduce((L, q, i) => L + dist(p[i], q), 0);
export function pointAt(p: V3[], s: number): V3 {
  let acc = 0;
  for (let i = 1; i < p.length; i++) {
    const l = dist(p[i - 1], p[i]);
    if (s <= acc + l || i === p.length - 1) {
      const t = Math.max(0, Math.min(1, (s - acc) / l));
      const a = p[i - 1];
      const b = p[i];
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }
    acc += l;
  }
  return p[p.length - 1];
}
export const arcAtVertex = (p: V3[], idx: number) => polyLen(p.slice(0, idx + 1));
export const MAIN_LEN = polyLen(MAIN);
export const DIST_LEN = polyLen(DIST);
export const GATE_S = GATE_Z - MAIN[0][2];
export const HUMP_S = arcAtVertex(MAIN, 3);

/* ---------------- keadaan (fungsi frame) ---------------- */
const c01 = (v: number) => Math.max(0, Math.min(1, v));
const span = (f: number, s: readonly [number, number]) => c01((f - s[0]) / (s[1] - s[0]));
const smooth = (t: number) => t * t * (3 - 2 * t);
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

export type Seg = [number, number];
/** Lapis ke-i: 0 terpasang, 1 terlepas. Urutan: jalan, lereng, dataran + dinding tandon, kulit pipa, dinding rumah. */
export function peelAt(f: number, i: number, n = 5) {
  // hook: dinding depan rumah disembunyikan supaya keran terlihat; rumah "ditutup" di balik tirai saat kamera melompat
  if (i === n - 1 && f < T.camJump) return 1;
  const open = c01((f - (T.peel + i * T.peelGap)) / T.peelEach);
  const close = c01((f - (T.close + (n - 1 - i) * T.closeGap)) / T.closeEach);
  return open - close;
}
/** Katup induk: 1 terbuka, 0 tertutup */
export const valveOpenAt = (f: number) => (f < T.valveOpen[0] ? 1 - smooth(span(f, T.valveClose)) : smooth(span(f, T.valveOpen)));
/** Bagian pipa besar di hilir katup yang berisi air (jarak busur) */
export function mainSeg(f: number): Seg {
  const len = MAIN_LEN - GATE_S;
  if (f < T.recedeMain[0]) return [GATE_S, MAIN_LEN];
  if (f < T.fillMain[0]) return [GATE_S + smoother(span(f, T.recedeMain)) * len, MAIN_LEN];
  return [GATE_S, GATE_S + smoother(span(f, T.fillMain)) * len];
}
export function distSeg(f: number): Seg {
  if (f < T.recedeDist[0]) return [0, DIST_LEN];
  if (f < T.fillMain[0]) return [smoother(span(f, T.recedeDist)) * DIST_LEN, DIST_LEN];
  return [0, smoother(span(f, T.fillDist)) * DIST_LEN];
}
/** Persen pipa terisi (ilustrasi), untuk counter */
export const filledAt = (f: number) => ((mainSeg(f)[1] - GATE_S) + distSeg(f)[1]) / (MAIN_LEN - GATE_S + DIST_LEN);
/** Kantong angin di punuk: muncul saat pipa terisi lagi, keluar dua tahap lewat katup udara */
export function airPocketAt(f: number) {
  const born = smooth(c01((mainSeg(f)[1] - (HUMP_S - 0.5)) / 0.8)) * (f >= T.fillMain[0] ? 1 : 0);
  return born * (1 - 0.55 * smooth(span(f, T.vent1)) - 0.45 * smooth(span(f, T.vent2)));
}
export const ventingAt = (f: number) => Math.max(Math.sin(Math.PI * span(f, T.vent1)), Math.sin(Math.PI * span(f, T.vent2)));
export const pressureAt = (f: number) => 0.08 + 0.72 * smoother(span(f, T.pressureUp));
export const tapFlowAt = (f: number) => span(f, T.tapFlow);
export const sinkFillAt = (f: number) => smooth(span(f, T.sinkFill));

/* ---------------- kamera melayang ---------------- */
/** Bidikan orbit: target, azimut (derajat dari +z ke +x), elevasi, jarak, fov */
function orbit(t: V3, az: number, el: number, d: number, fov: number): Shot {
  const a = (az * Math.PI) / 180;
  const e = (el * Math.PI) / 180;
  return [t[0] + d * Math.cos(e) * Math.sin(a), t[1] + d * Math.sin(e), t[2] + d * Math.cos(e) * Math.cos(a), t[0], t[1], t[2], fov];
}

export const SHOT = {
  O: orbit([-1.28, 1.5, -0.37], 24, 31, 21.6, 44),
  TANK: orbit([0, TANK.y + 0.5, TANK.z], 52, 22, 7.2, 42),
  VALVE: orbit([0, 2.0, GATE_Z], 60, 20, 5.2, 42),
  MAINV: orbit([0, 1.5, -2.9], 56, 26, 10.5, 42),
  STREET: orbit([-0.3, 0.9, 2.7], 52, 26, 10.5, 42),
  HUMP: orbit([0, 1.75, HUMP[2]], 64, 14, 4.4, 42),
  GAUGE: orbit([0, 1.0, GAUGE.z], 58, 12, 3.8, 42),
  TAP: orbit([TAP[0] + 0.2, HOUSE_Y + 0.62, HOUSE.z], 72, 12, 3.6, 42),
};

/** Tahan tiap bidikan sambil melayang; pindah antarbidikan lewat spline C1. */
function path(list: [number, number, Shot, number?][]): CamKey3D[] {
  return list.flatMap(([a, b, shot, deg = 2.5]) => driftHold(a, b, shot, deg));
}

/** Sebelum lompatan: keran di kamar mandi (dinding depan rumah disembunyikan selama hook). Dipisah dari CAM_B supaya spline tidak "menarik" kamera ke bidikan utuh lebih awal. */
export const CAM_A: CamKey3D[] = path([[0, T.camJump, SHOT.TAP, 5]]);
/** Sesudah lompatan (terjadi di balik tirai penuh, lihat T.veil): seluruh perjalanan di diorama. */
export const CAM_B: CamKey3D[] = [
  camKey(0, SHOT.O),
  ...path([
    [T.camJump, T.toTank[0], SHOT.O, 3],
    [T.toTank[1], T.tankToO[0], SHOT.TANK, 4],
    [T.tankToO[1], T.toValve[0], SHOT.O, 2],
    [T.toValve[1], T.valveToMain[0], SHOT.VALVE, 3],
    [T.valveToMain[1], T.mainToStreet[0], SHOT.MAINV, 3],
    [T.mainToStreet[1], T.toHump[0], SHOT.STREET, 3],
    [T.toHump[1], T.toGauge[0], SHOT.HUMP, 5],
    [T.toGauge[1], T.toTap[0], SHOT.GAUGE, 3],
    [T.toTap[1], T.tapToO[0], SHOT.TAP, 3],
    [T.tapToO[1], TOTAL_FRAMES, SHOT.O, 5],
  ]),
];
export const camFor = (f: number) => (f < T.camJump ? CAM_A : CAM_B);
