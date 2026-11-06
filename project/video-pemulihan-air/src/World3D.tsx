import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BEDAH_MATERIALS, BMesh, hexBoltGeometry, latheGeometry, MatSpec, pipeGeometry, useCutPlane } from './antislop/components/Bedah3D';
import { createSeededRandom } from './antislop/theme/easing-and-timing';
import {
  AIR_VALVE_TOP,
  COUPLING,
  cutAt,
  DIST,
  DIST_R_IN,
  DIST_R_OUT,
  distSeg,
  flowOn,
  GATE_S,
  GATE_SCALE,
  GATE_Z,
  GAUGE_POS,
  HOUSE,
  HOUSE_CUT_X,
  HUMP,
  MAIN,
  MAIN_LEN,
  mainSeg,
  NEIGHBOURS,
  PIPE_R_IN,
  PIPE_R_OUT,
  pointAt,
  pressureAt,
  Seg,
  sinkFillAt,
  SINK_Y,
  SPOUT_TIP,
  TANK,
  tapFlowAt,
  V3,
  valveOpenAt,
  waterOpacityAt,
  arcAtVertex,
} from './layout3d';

/* ---------------- material khusus ---------------- */
const GRASS: MatSpec = { color: '#A9C68B', metalness: 0, roughness: 0.95 };
const HANDWHEEL: MatSpec = { color: '#C8352A', metalness: 0.35, roughness: 0.42 };
const GATE_RUBBER: MatSpec = { color: '#23262B', metalness: 0.05, roughness: 0.7 };
const HOUSE_WALL: MatSpec = { color: '#F4E9D6', metalness: 0, roughness: 0.9 };
const HOUSE_ROOF: MatSpec = { color: '#C0583E', metalness: 0, roughness: 0.75 };
const HOUSE_FLOOR: MatSpec = { color: '#D9D4CB', metalness: 0, roughness: 0.6 };
const TILE: MatSpec = { color: '#DCEBF2', metalness: 0, roughness: 0.35 };
const GAUGE_FACE: MatSpec = { color: '#FAFAF7', metalness: 0, roughness: 0.5 };
const NEEDLE: MatSpec = { color: '#D1432B', metalness: 0.1, roughness: 0.4 };
const SAFE_ARC: MatSpec = { color: '#2E9E5B', metalness: 0, roughness: 0.5 };
const TICK: MatSpec = { color: '#1D2129', metalness: 0, roughness: 0.6 };
const BUBBLE: MatSpec = { color: '#FFFFFF', metalness: 0, roughness: 0.12, opacity: 0.85 };
const STREAM_BASE = { color: '#5AA8E8', metalness: 0, roughness: 0.08 };

const step = (v: number, n = 20) => Math.round(v * n) / n;
const waterMat = (k: number): MatSpec => ({ ...BEDAH_MATERIALS.water, opacity: step(BEDAH_MATERIALS.water.opacity * k) });

/* ---------------- geometri bantu ---------------- */
const X_AXIS = new THREE.Vector3(1, 0, 0);
interface SegInfo {
  a: V3;
  b: V3;
  len: number;
  s0: number;
  dir: THREE.Vector3;
  rot: [number, number, number];
}
function segInfos(pts: V3[]): SegInfo[] {
  const out: SegInfo[] = [];
  let s0 = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const dir = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const len = dir.length();
    dir.normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(X_AXIS, dir);
    const e = new THREE.Euler().setFromQuaternion(q);
    out.push({ a, b, len, s0, dir, rot: [e.x, e.y, e.z] });
    s0 += len;
  }
  return out;
}
const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function eulerFromDir(d: THREE.Vector3): [number, number, number] {
  const q = new THREE.Quaternion().setFromUnitVectors(X_AXIS, d.clone().normalize());
  const e = new THREE.Euler().setFromQuaternion(q);
  return [e.x, e.y, e.z];
}

function useGeoms() {
  return useMemo(() => {
    const waterUnit = (r: number) => {
      const g = new THREE.CylinderGeometry(r, r, 1, 40);
      g.rotateZ(Math.PI / 2);
      return g;
    };
    const streak = (r: number, l: number) => {
      const g = new THREE.CapsuleGeometry(r, l, 4, 10);
      g.rotateZ(Math.PI / 2);
      return g;
    };
    return {
      mainWater: waterUnit(PIPE_R_IN - 0.006),
      distWater: waterUnit(DIST_R_IN - 0.005),
      mainSocket: pipeGeometry(PIPE_R_OUT + 0.035, PIPE_R_IN, 0.3, 56),
      distSocket: pipeGeometry(DIST_R_OUT + 0.03, DIST_R_IN, 0.24, 56),
      mainStreak: streak(0.016, 0.16),
      distStreak: streak(0.012, 0.12),
      block: new THREE.BoxGeometry(0.32, 0.22, 0.24),
      bubble: new THREE.SphereGeometry(1, 20, 14),
    };
  }, []);
}

/* ---------------- pipa + air di dalamnya ---------------- */
const PipeRun: React.FC<{
  pts: V3[];
  rOut: number;
  rIn: number;
  mat?: 'pvcGrey' | 'hdpeBlue';
  seg: Seg[];
  flow: number;
  frame: number;
  wop: number;
  cut: THREE.Plane[];
  /** rentang jarak busur yang tidak digambar pipanya (diganti katup) */
  gaps?: Seg[];
  kind: 'main' | 'dist';
}> = ({ pts, rOut, rIn, mat = 'pvcGrey', seg, flow, frame, wop, cut, gaps = [], kind }) => {
  const g = useGeoms();
  const infos = useMemo(() => segInfos(pts), [pts]);
  const L = infos.reduce((a, s) => a + s.len, 0);
  const pieces = useMemo(() => {
    // potongan pipa per segmen, dikurangi gap katup; sedikit overlap di sambungan
    const out: { mid: V3; len: number; rot: [number, number, number]; geom: THREE.BufferGeometry }[] = [];
    infos.forEach((si, idx) => {
      let ranges: Seg[] = [[si.s0 - (idx > 0 ? 0.06 : 0), si.s0 + si.len + (idx < infos.length - 1 ? 0.06 : 0)]];
      for (const [g0, g1] of gaps) {
        ranges = ranges.flatMap(([r0, r1]) => {
          if (g1 <= r0 || g0 >= r1) return [[r0, r1] as Seg];
          const parts: Seg[] = [];
          if (g0 > r0) parts.push([r0, g0]);
          if (g1 < r1) parts.push([g1, r1]);
          return parts;
        });
      }
      for (const [r0, r1] of ranges) {
        const len = r1 - r0;
        if (len < 0.02) continue;
        const t = (r0 + len / 2 - si.s0) / si.len;
        out.push({ mid: lerp3(si.a, si.b, t), len, rot: si.rot, geom: pipeGeometry(rOut, rIn, len, 64) });
      }
    });
    return out;
  }, [infos, gaps, rOut, rIn]);

  const sockets = useMemo(
    () =>
      infos.slice(1).map((si, i) => {
        const prev = infos[i];
        const d = prev.dir.clone().add(si.dir).normalize();
        return { pos: si.a, rot: eulerFromDir(d) };
      }),
    [infos]
  );

  const waterGeom = kind === 'main' ? g.mainWater : g.distWater;
  const wm = waterMat(wop);
  const waters: { mid: V3; len: number; rot: [number, number, number] }[] = [];
  if (wop > 0.02) {
    for (const [a, b] of seg) {
      for (const si of infos) {
        const lo = Math.max(a, si.s0);
        const hi = Math.min(b, si.s0 + si.len);
        if (hi - lo < 0.005) continue;
        const ext0 = lo > si.s0 + 0.001 ? 0 : 0.02;
        const ext1 = hi < si.s0 + si.len - 0.001 ? 0 : 0.02;
        const t0 = (lo - si.s0 - ext0) / si.len;
        const t1 = (hi - si.s0 + ext1) / si.len;
        waters.push({ mid: lerp3(si.a, si.b, (t0 + t1) / 2), len: (t1 - t0) * si.len, rot: si.rot });
      }
    }
  }

  // garis arus: bergerak searah aliran, hanya di bagian yang berisi air
  const N = kind === 'main' ? 22 : 14;
  const speed = 0.012 + flow * 0.05;
  const streakGeom = kind === 'main' ? g.mainStreak : g.distStreak;
  const streakOp = step(0.85 * flow * wop);
  const streaks =
    streakOp > 0.04
      ? Array.from({ length: N }, (_, i) => {
          const s = (((i / N) * L + frame * speed) % L + L) % L;
          const inside = seg.some(([a, b]) => s >= a + 0.05 && s <= b - 0.05);
          if (!inside) return null;
          const si = infos.find((x) => s >= x.s0 && s <= x.s0 + x.len) ?? infos[infos.length - 1];
          const p = pointAt(pts, s);
          const lane = [-0.45, 0.1, 0.5][i % 3] * rIn;
          const laneX = [0.35, -0.2, 0.1][i % 3] * rIn;
          return (
            <BMesh
              key={i}
              geometry={streakGeom}
              mat={{ color: '#E6F5FF', metalness: 0, roughness: 0.2, opacity: streakOp }}
              position={[p[0] + laneX, p[1] + lane, p[2]]}
              rotation={si.rot}
              outline={0}
              castShadow={false}
            />
          );
        })
      : null;

  return (
    <group>
      {pieces.map((p, i) => (
        <BMesh key={i} geometry={p.geom} mat={mat} position={p.mid} rotation={p.rot} cut={cut} />
      ))}
      {sockets.map((s, i) => (
        <BMesh key={`s${i}`} geometry={kind === 'main' ? g.mainSocket : g.distSocket} mat={mat} position={s.pos} rotation={s.rot} cut={cut} />
      ))}
      {waters.map((w, i) => (
        <BMesh key={`w${i}`} geometry={waterGeom} mat={wm} position={w.mid} rotation={w.rot} scale={[w.len, 1, 1]} outline={0} castShadow={false} />
      ))}
      {streaks}
    </group>
  );
};

/* ---------------- bukit ---------------- */
const Hill: React.FC = () => {
  const geom = useMemo(() => {
    const prof: [number, number][] = [
      [-8.2, 0],
      [-8.2, 2.4],
      [-3.5, 2.4],
      [-2.2, 0.98],
      [-1.45, 1.33],
      [-0.35, 0.14],
      [0.3, 0],
    ];
    const s = new THREE.Shape();
    s.moveTo(prof[0][0], prof[0][1]);
    prof.slice(1).forEach(([z, y]) => s.lineTo(z, y));
    s.closePath();
    const depth = 3.8;
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    g.rotateY(-Math.PI / 2); // shape x -> dunia z, ekstrusi -> dunia x
    return g;
  }, []);
  return <BMesh geometry={geom} mat={GRASS} position={[-0.8, 0, 0]} outline={0.02} />;
};

/* ---------------- penyangga beton di bagian datar ---------------- */
const Supports: React.FC = () => {
  const g = useGeoms();
  const zs = [0.0, 1.0, 2.0, 3.0, 4.0, 5.0];
  return (
    <group>
      {zs.map((z) => (
        <BMesh key={z} geometry={g.block} mat="concrete" position={[0, 0.11, z]} />
      ))}
    </group>
  );
};

/* ---------------- reservoir ---------------- */
const Reservoir: React.FC<{ cut: THREE.Plane[]; wop: number }> = ({ cut, wop }) => {
  const geo = useMemo(() => {
    const { r, h } = TANK;
    const shell = latheGeometry([
      [0, 0],
      [r, 0],
      [r, h],
      [r - 0.1, h],
      [r - 0.1, 0.1],
      [0, 0.1],
    ]);
    const roof = latheGeometry([
      [0, h + 0.22],
      [r - 0.1, h - 0.04],
      [r + 0.08, h - 0.04],
      [r + 0.08, h + 0.04],
      [0, h + 0.32],
    ]);
    const water = new THREE.CylinderGeometry(r - 0.11, r - 0.11, 0.98, 64);
    const ring = new THREE.TorusGeometry(r + 0.005, 0.025, 10, 72);
    ring.rotateX(Math.PI / 2);
    const vent = new THREE.CylinderGeometry(0.06, 0.06, 0.32, 20);
    const ventCap = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 20);
    const outlet = pipeGeometry(PIPE_R_OUT + 0.05, PIPE_R_IN, 0.12, 56);
    return { shell, roof, water, ring, vent, ventCap, outlet };
  }, []);
  const { y, z, h } = TANK;
  return (
    <group>
      <BMesh geometry={geo.shell} mat="concrete" position={[0, y, z]} cut={cut} />
      <BMesh geometry={geo.roof} mat="concrete" position={[0, y, z]} cut={cut} />
      {[0.42, 0.86].map((ry) => (
        <BMesh key={ry} geometry={geo.ring} mat="galvanized" position={[0, y + ry, z]} outline={0.006} cut={cut} />
      ))}
      <BMesh geometry={geo.vent} mat="galvanized" position={[-0.4, y + h + 0.3, z - 0.1]} outline={0.006} />
      <BMesh geometry={geo.ventCap} mat="galvanized" position={[-0.4, y + h + 0.47, z - 0.1]} outline={0.006} />
      {wop > 0.02 ? (
        <BMesh geometry={geo.water} mat={waterMat(wop)} position={[0, y + 0.1 + 0.49, z]} outline={0} castShadow={false} />
      ) : null}
      <BMesh geometry={geo.outlet} mat="concrete" position={[0, MAIN[0][1], MAIN[0][2] + 0.02]} rotation={[0, -Math.PI / 2, 0]} cut={cut} />
    </group>
  );
};

/* ---------------- katup gerbang (gate valve), skala 0.4 ---------------- */
const GateValve: React.FC<{ frame: number; cut: THREE.Plane[] }> = ({ frame, cut }) => {
  const k = 1 / GATE_SCALE; // outline dalam satuan lokal
  const g = useMemo(() => {
    const R_IN = PIPE_R_OUT / GATE_SCALE; // lubang badan = diameter luar pipa
    const body = latheGeometry([
      [R_IN, -1.22], [0.5, -1.22], [0.5, -1.04], [0.62, -0.82], [0.7, -0.42], [0.72, 0], [0.7, 0.42], [0.62, 0.82], [0.5, 1.04], [0.5, 1.22], [R_IN, 1.22], [R_IN, -1.22],
    ]);
    body.rotateZ(-Math.PI / 2);
    const bonnet = latheGeometry([
      [0.36, 0], [0.48, 0], [0.48, 0.3], [0.62, 0.3], [0.62, 0.4], [0.44, 0.4], [0.4, 1.0], [0.28, 1.22], [0.09, 1.26], [0.09, 1.16], [0.22, 1.12], [0.3, 0.96], [0.34, 0.4], [0.36, 0],
    ]);
    const torus = new THREE.TorusGeometry(0.5, 0.05, 20, 96);
    torus.rotateX(Math.PI / 2);
    const spoke = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 12);
    spoke.rotateZ(Math.PI / 2);
    spoke.translate(0.25, 0, 0);
    const bolt = new THREE.CylinderGeometry(0.045, 0.045, 0.44, 12);
    bolt.rotateZ(Math.PI / 2);
    const nut = hexBoltGeometry(0.075, 0.07);
    nut.rotateZ(Math.PI / 2);
    return {
      body,
      bonnet,
      torus,
      spoke,
      bolt,
      nut,
      nutV: hexBoltGeometry(0.06, 0.07),
      flange: pipeGeometry(0.8, R_IN, 0.12),
      gate: new THREE.BoxGeometry(0.13, 0.84, 0.7, 4, 8, 8),
      stem: new THREE.CylinderGeometry(0.05, 0.05, 1.7, 24),
      hub: new THREE.CylinderGeometry(0.1, 0.1, 0.12, 24),
    };
  }, []);
  const open = valveOpenAt(frame);
  const gateY = open * 0.8;
  const boltAngles = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2 + Math.PI / 8);
  return (
    <group position={[0, MAIN[0][1], GATE_Z]} rotation={[0, -Math.PI / 2, 0]} scale={GATE_SCALE}>
      {[-1, 1].map((s) => (
        <group key={s}>
          <BMesh geometry={g.flange} mat="castIronBlue" position={[s * 1.28, 0, 0]} cut={cut} outline={0.012 * k} />
          {boltAngles.map((a, i) => {
            const y = Math.sin(a) * 0.64;
            const z = Math.cos(a) * 0.64;
            return (
              <group key={i}>
                <BMesh geometry={g.bolt} mat="galvanized" position={[s * 1.28, y, z]} outline={0.006 * k} cut={cut} />
                <BMesh geometry={g.nut} mat="galvanized" position={[s * 1.06, y, z]} outline={0.006 * k} cut={cut} />
                <BMesh geometry={g.nut} mat="galvanized" position={[s * 1.5, y, z]} outline={0.006 * k} cut={cut} />
              </group>
            );
          })}
        </group>
      ))}
      <BMesh geometry={g.body} mat="castIronBlue" cut={cut} outline={0.012 * k} />
      <BMesh geometry={g.bonnet} mat="castIronBlue" position={[0, 0.4, 0]} cut={cut} outline={0.012 * k} />
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return <BMesh key={i} geometry={g.nutV} mat="galvanized" position={[Math.cos(a) * 0.54, 0.84, Math.sin(a) * 0.54]} outline={0.006 * k} cut={cut} />;
      })}
      {/* bagian bergerak: tidak dipotong */}
      <BMesh geometry={g.gate} mat={GATE_RUBBER} position={[0, gateY, 0]} outline={0.012 * k} />
      <BMesh geometry={g.stem} mat="steel" position={[0, gateY + 0.42 + 0.85, 0]} outline={0.006 * k} />
      <group position={[0, 1.72, 0]} rotation={[0, -open * Math.PI * 5, 0]}>
        <BMesh geometry={g.torus} mat={HANDWHEEL} outline={0.012 * k} />
        {[0, 1, 2].map((i) => (
          <BMesh key={i} geometry={g.spoke} mat={HANDWHEEL} rotation={[0, (i / 3) * Math.PI * 2, 0]} outline={0.006 * k} />
        ))}
        <BMesh geometry={g.hub} mat={HANDWHEEL} outline={0.006 * k} />
      </group>
    </group>
  );
};
/** Rentang jarak busur yang ditempati katup (pipa tidak digambar di sini) */
export const GATE_GAP: Seg = [GATE_S - 1.4 * GATE_SCALE, GATE_S + 1.4 * GATE_SCALE];

/* ---------------- sambungan perbaikan (repair coupling) ---------------- */
const Coupling: React.FC<{ cut: THREE.Plane[] }> = ({ cut }) => {
  const g = useMemo(() => {
    const sleeve = pipeGeometry(PIPE_R_OUT + 0.06, PIPE_R_OUT, 0.46, 64);
    const collar = pipeGeometry(PIPE_R_OUT + 0.085, PIPE_R_OUT, 0.07, 64);
    const bolt = hexBoltGeometry(0.03, 0.05);
    return { sleeve, collar, bolt };
  }, []);
  const d = new THREE.Vector3(MAIN[2][0] - MAIN[1][0], MAIN[2][1] - MAIN[1][1], MAIN[2][2] - MAIN[1][2]).normalize();
  const rot = eulerFromDir(d);
  const along = (t: number): V3 => [COUPLING[0] + d.x * t, COUPLING[1] + d.y * t, COUPLING[2] + d.z * t];
  // baut di punggung sambungan (arah tegak lurus pipa, ke atas)
  const up = new THREE.Vector3(0, 1, 0).sub(d.clone().multiplyScalar(d.y)).normalize();
  return (
    <group>
      <BMesh geometry={g.sleeve} mat="castIronBlack" position={COUPLING} rotation={rot} cut={cut} />
      {[-0.2, 0.2].map((t) => (
        <BMesh key={t} geometry={g.collar} mat="galvanized" position={along(t)} rotation={rot} cut={cut} outline={0.008} />
      ))}
      {[-0.2, 0.2].map((t) => {
        const p = along(t);
        const r = PIPE_R_OUT + 0.1;
        return <BMesh key={`b${t}`} geometry={g.bolt} mat="galvanized" position={[p[0] - 0.08, p[1] + up.y * r, p[2] + up.z * r]} outline={0.005} />;
      })}
    </group>
  );
};

/* ---------------- katup udara di punuk ---------------- */
const AirValve: React.FC<{ cut: THREE.Plane[] }> = ({ cut }) => {
  const g = useMemo(() => {
    const riser = new THREE.CylinderGeometry(0.075, 0.075, 0.36, 40, 1, true);
    const riserIn = new THREE.CylinderGeometry(0.05, 0.05, 0.36, 40, 1, true);
    const flange = latheGeometry([
      [0.05, 0],
      [0.13, 0],
      [0.13, 0.04],
      [0.05, 0.04],
    ]);
    const body = latheGeometry([
      [0.05, 0],
      [0.15, 0],
      [0.17, 0.06],
      [0.17, 0.2],
      [0.12, 0.26],
      [0.04, 0.27],
      [0.04, 0.24],
      [0.1, 0.23],
      [0.14, 0.19],
      [0.14, 0.07],
      [0.12, 0.03],
      [0.05, 0.03],
    ]);
    const cap = latheGeometry([
      [0.0, 0.0],
      [0.07, 0.0],
      [0.07, 0.02],
      [0.03, 0.06],
      [0.0, 0.06],
    ]);
    const ball = new THREE.SphereGeometry(0.065, 24, 16);
    return { riser, riserIn, flange, body, cap, ball };
  }, []);
  const [x, y, z] = HUMP;
  const base = y + PIPE_R_OUT - 0.02;
  return (
    <group>
      <BMesh geometry={g.riser} mat="castIronBlue" position={[x, base + 0.18, z]} cut={cut} outline={0.008} />
      <BMesh geometry={g.riserIn} mat="castIronBlue" position={[x, base + 0.18, z]} cut={cut} outline={0} />
      <BMesh geometry={g.flange} mat="castIronBlue" position={[x, base + 0.34, z]} cut={cut} outline={0.006} />
      <BMesh geometry={g.body} mat="castIronBlue" position={[x, base + 0.38, z]} cut={cut} outline={0.008} />
      {/* pelampung di dalam: tidak dipotong */}
      <BMesh geometry={g.ball} mat="plasticGloss" position={[x - 0.02, base + 0.5, z]} outline={0.005} />
      <BMesh geometry={g.cap} mat="galvanized" position={[x, base + 0.65, z]} outline={0.005} />
    </group>
  );
};

/* ---------------- manometer ---------------- */
const Gauge: React.FC<{ frame: number }> = ({ frame }) => {
  const g = useMemo(() => {
    const riser = new THREE.CylinderGeometry(0.028, 0.028, 1, 20);
    const caseG = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 64);
    caseG.rotateX(Math.PI / 2);
    const bezel = new THREE.TorusGeometry(0.195, 0.018, 12, 64);
    const face = new THREE.CircleGeometry(0.178, 64);
    const glass = new THREE.CircleGeometry(0.18, 64);
    const tick = new THREE.BoxGeometry(0.008, 0.03, 0.004);
    tick.translate(0, 0.145, 0);
    const major = new THREE.BoxGeometry(0.012, 0.045, 0.004);
    major.translate(0, 0.138, 0);
    const lo = 0.6;
    const hi = 0.9;
    const a0 = ((225 - 270 * hi) * Math.PI) / 180;
    const arc = new THREE.RingGeometry(0.152, 0.168, 48, 1, a0, ((270 * (hi - lo)) * Math.PI) / 180);
    const needle = new THREE.BoxGeometry(0.012, 0.15, 0.006);
    needle.translate(0, 0.055, 0);
    const pin = new THREE.CylinderGeometry(0.018, 0.018, 0.015, 20);
    pin.rotateX(Math.PI / 2);
    const hex = hexBoltGeometry(0.05, 0.06);
    return { riser, caseG, bezel, face, glass, tick, major, arc, needle, pin, hex };
  }, []);
  const p = pressureAt(frame);
  const a = ((225 - 270 * p) * Math.PI) / 180; // sudut jarum dari sumbu +x
  const [x, y, z] = GAUGE_POS;
  const pipeTop = DIST[0][1] + DIST_R_OUT;
  const riserLen = y - 0.2 - pipeTop;
  return (
    <group>
      <BMesh geometry={g.riser} mat="brass" position={[x, pipeTop + riserLen / 2, z]} scale={[1, riserLen, 1]} outline={0.005} />
      <BMesh geometry={g.hex} mat="brass" position={[x, pipeTop + riserLen - 0.03, z]} outline={0.005} />
      <group position={[x, y, z]} rotation={[0, (60 * Math.PI) / 180, 0]}>
        <BMesh geometry={g.caseG} mat="steel" outline={0.008} />
        <BMesh geometry={g.bezel} mat="steel" position={[0, 0, 0.04]} outline={0.005} />
        <BMesh geometry={g.face} mat={GAUGE_FACE} position={[0, 0, 0.041]} outline={0} castShadow={false} />
        <BMesh geometry={g.arc} mat={SAFE_ARC} position={[0, 0, 0.043]} outline={0} castShadow={false} />
        {Array.from({ length: 11 }, (_, i) => {
          const ta = ((225 - 27 * i) * Math.PI) / 180 - Math.PI / 2;
          return <BMesh key={i} geometry={i % 5 === 0 ? g.major : g.tick} mat={TICK} position={[0, 0, 0.044]} rotation={[0, 0, ta]} outline={0} castShadow={false} />;
        })}
        <BMesh geometry={g.needle} mat={NEEDLE} position={[0, 0, 0.05]} rotation={[0, 0, a - Math.PI / 2]} outline={0} />
        <BMesh geometry={g.pin} mat="steel" position={[0, 0, 0.052]} outline={0} />
        <BMesh geometry={g.glass} mat="glass" position={[0, 0, 0.06]} outline={0} castShadow={false} />
      </group>
    </group>
  );
};

/* ---------------- rumah ---------------- */
const HouseShell: React.FC<{
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  wall: MatSpec;
  roof: MatSpec;
  cut?: THREE.Plane[];
  windows?: boolean;
}> = ({ x, z, w, d, h, wall, roof, cut, windows }) => {
  const g = useMemo(() => {
    const t = 0.07;
    const roofShape = new THREE.Shape();
    const ow = w / 2 + 0.14;
    roofShape.moveTo(-ow, 0);
    roofShape.lineTo(ow, 0);
    roofShape.lineTo(0, 0.5);
    roofShape.closePath();
    const rd = d + 0.24;
    const roofG = new THREE.ExtrudeGeometry(roofShape, { depth: rd, bevelEnabled: false });
    roofG.translate(0, 0, -rd / 2);
    return {
      t,
      wallX: new THREE.BoxGeometry(t, h, d),
      wallZ: new THREE.BoxGeometry(w, h, t),
      floor: new THREE.BoxGeometry(w, 0.06, d),
      roofG,
      win: new THREE.BoxGeometry(0.02, 0.28, 0.3),
      door: new THREE.BoxGeometry(0.3, 0.55, 0.02),
    };
  }, [w, d, h]);
  return (
    <group position={[x, 0, z]}>
      <BMesh geometry={g.floor} mat={HOUSE_FLOOR} position={[0, 0.03, 0]} cut={cut} />
      <BMesh geometry={g.wallX} mat={wall} position={[-w / 2 + g.t / 2, h / 2, 0]} cut={cut} />
      <BMesh geometry={g.wallX} mat={wall} position={[w / 2 - g.t / 2, h / 2, 0]} cut={cut} />
      <BMesh geometry={g.wallZ} mat={wall} position={[0, h / 2, -d / 2 + g.t / 2]} cut={cut} />
      <BMesh geometry={g.wallZ} mat={wall} position={[0, h / 2, d / 2 - g.t / 2]} cut={cut} />
      <BMesh geometry={g.roofG} mat={roof} position={[0, h, 0]} cut={cut} />
      {windows ? (
        <>
          <BMesh geometry={g.win} mat={{ color: '#2D4E73', metalness: 0.1, roughness: 0.2 }} position={[w / 2 + 0.005, h * 0.58, -d * 0.2]} outline={0.006} />
          <BMesh geometry={g.door} mat={{ color: '#7A5236', metalness: 0, roughness: 0.7 }} position={[0.05, 0.3, d / 2 + 0.005]} outline={0.006} />
        </>
      ) : null}
    </group>
  );
};

const CustomerInterior: React.FC<{ frame: number }> = ({ frame }) => {
  const g = useMemo(() => {
    const sink = latheGeometry(
      (
        [
          [0.0, 0.0],
          [0.14, 0.01],
          [0.22, 0.06],
          [0.26, 0.14],
          [0.28, 0.15],
          [0.28, 0.13],
          [0.25, 0.06],
          [0.17, 0.0],
          [0.13, -0.025],
          [0.0, -0.03],
        ] as [number, number][]
      ).reverse()
    );
    const pedestal = latheGeometry([
      [0.0, 0.0],
      [0.14, 0.0],
      [0.14, 0.03],
      [0.08, 0.06],
      [0.065, 0.3],
      [0.1, 0.4],
      [0.0, 0.4],
    ]);
    const riser = new THREE.CylinderGeometry(0.03, 0.03, 1, 20);
    const svc = new THREE.CylinderGeometry(0.035, 0.035, 1, 20);
    svc.rotateZ(Math.PI / 2);
    const elbow = new THREE.SphereGeometry(0.04, 16, 12);
    const body = new THREE.CylinderGeometry(0.035, 0.035, 0.12, 24);
    body.rotateZ(Math.PI / 2);
    const spout = new THREE.TorusGeometry(0.1, 0.022, 14, 40, Math.PI / 2);
    const lever = new THREE.BoxGeometry(0.16, 0.022, 0.04);
    lever.translate(0.07, 0, 0);
    const tile = new THREE.BoxGeometry(0.01, 0.42, 0.9);
    const disc = new THREE.CylinderGeometry(1, 1, 1, 48);
    const stream = new THREE.CylinderGeometry(0.016, 0.02, 1, 20);
    const drop = new THREE.SphereGeometry(0.018, 16, 12);
    return { sink, pedestal, riser, svc, elbow, body, spout, lever, tile, disc, stream, drop };
  }, []);
  const backX = HOUSE.x - HOUSE.w / 2 + 0.07;
  const z = HOUSE.z;
  const sinkX = SPOUT_TIP[0];
  const basinBottom = SINK_Y - 0.15;
  const riserX = backX + 0.04;
  const tapY = SPOUT_TIP[1] + 0.12;

  // tetes air di adegan pembuka (keran dibuka, hanya menetes)
  const drips = [
    [18, 30, 47],
    [86, 98, 115],
  ].map(([grow, fall, land], i) => {
    if (frame < grow || frame > land) return null;
    const tt = frame < fall ? 0 : (frame - fall) / (land - fall);
    const yy = SPOUT_TIP[1] - 0.02 - tt * tt * (SPOUT_TIP[1] - 0.02 - basinBottom - 0.02);
    const s = frame < fall ? Math.min(1, (frame - grow) / (fall - grow)) : 1;
    return <BMesh key={i} geometry={g.drop} mat={{ ...STREAM_BASE, opacity: 0.85 }} position={[SPOUT_TIP[0], yy, z]} scale={[s, s * (1 + tt * 0.4), s]} outline={0} castShadow={false} />;
  });

  const flowK = tapFlowAt(frame);
  const fill = sinkFillAt(frame);
  const level = basinBottom + 0.01 + fill * 0.09;
  const streamTop = SPOUT_TIP[1] - 0.01;
  const streamBot = streamTop - flowK * (streamTop - level);
  const discR = 0.13 + fill * 0.1;
  return (
    <group>
      {/* dinding keramik di belakang wastafel */}
      <BMesh geometry={g.tile} mat={TILE} position={[backX + 0.006, 0.82, z]} outline={0.004} />
      {/* pipa dinas dari jaringan distribusi masuk ke rumah */}
      <BMesh geometry={g.svc} mat="pvcGrey" position={[(-0.1 + riserX) / 2, 0.2, z + 0.32]} scale={[-0.1 - riserX, 1, 1]} outline={0.006} />
      <BMesh geometry={g.elbow} mat="pvcGrey" position={[riserX, 0.2, z + 0.32]} outline={0.006} />
      <BMesh geometry={g.riser} mat="pvcWhite" position={[riserX, (0.2 + tapY) / 2, z + 0.32]} scale={[1, tapY - 0.2, 1]} outline={0.006} />
      <BMesh geometry={g.svc} mat="pvcWhite" position={[riserX, tapY, z + 0.16]} rotation={[0, Math.PI / 2, 0]} scale={[0.32, 0.86, 0.86]} outline={0.006} />
      {/* keran tembok */}
      <BMesh geometry={g.body} mat="steel" position={[backX + 0.06, tapY, z]} outline={0.006} />
      <BMesh geometry={g.spout} mat="steel" position={[SPOUT_TIP[0] - 0.1, tapY - 0.1 + 0.0, z]} rotation={[0, 0, 0]} outline={0.006} />
      <BMesh geometry={g.lever} mat="steel" position={[backX + 0.08, tapY + 0.05, z]} rotation={[0, 0, 0.5]} outline={0.006} />
      {/* wastafel */}
      <BMesh geometry={g.sink} mat="plasticGloss" position={[sinkX, basinBottom, z]} outline={0.008} />
      <BMesh geometry={g.pedestal} mat="plasticGloss" position={[sinkX, 0.06, z]} scale={[1, (basinBottom - 0.06) / 0.4, 1]} outline={0.008} />
      {drips}
      {flowK > 0.01 ? (
        <BMesh geometry={g.stream} mat={{ ...STREAM_BASE, opacity: 0.8 }} position={[SPOUT_TIP[0], (streamTop + streamBot) / 2, z]} scale={[1, Math.max(0.01, streamTop - streamBot), 1]} outline={0} castShadow={false} />
      ) : null}
      {fill > 0.01 ? (
        <BMesh geometry={g.disc} mat={{ ...STREAM_BASE, opacity: 0.7 }} position={[sinkX, level, z]} scale={[discR, 0.012, discR]} outline={0} castShadow={false} />
      ) : null}
    </group>
  );
};

/* ---------------- sambungan dinas ke rumah tetangga ---------------- */
const ServiceStub: React.FC<{ z: number; toX: number }> = ({ z, toX }) => {
  const geom = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.035, 0.035, 1, 20);
    g.rotateZ(Math.PI / 2);
    return g;
  }, []);
  const x0 = -0.1;
  return <BMesh geometry={geom} mat="pvcGrey" position={[(x0 + toX) / 2, 0.2, z]} scale={[x0 - toX, 1, 1]} outline={0.006} />;
};

/* ---------------- gelembung udara terjebak ---------------- */
const S_C = arcAtVertex(MAIN, 2);
const S_D = arcAtVertex(MAIN, 3);
const S_E = arcAtVertex(MAIN, 4);
const BUBBLES = (() => {
  const rnd = createSeededRandom('tirta-ayu-bubbles-3d');
  return Array.from({ length: 12 }, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const s = side < 0 ? S_C + 0.08 + rnd() * (S_D - S_C - 0.2) : S_D + 0.12 + rnd() * (S_E - S_D - 0.45);
    return { s, r: 0.035 + rnd() * 0.03, dx: (rnd() - 0.3) * 0.05, i };
  });
})();
const Bubbles: React.FC<{ frame: number }> = ({ frame }) => {
  const g = useGeoms();
  if (frame < 646) return null;
  const front = mainSeg(frame)[1];
  return (
    <group>
      {BUBBLES.map((b) => {
        if (front < b.s) return null;
        const t0 = 690 + b.i * 9;
        const tt = Math.max(0, Math.min(1, (frame - t0) / (905 - t0)));
        const e = tt * tt * (3 - 2 * tt);
        const s = b.s + (S_D - b.s) * e;
        const p = pointAt(MAIN, s);
        const topY = p[1] + PIPE_R_IN - b.r - 0.005;
        const esc = 926 + b.i * 7;
        let y = topY;
        let x = p[0] + b.dx;
        let z = p[2];
        let sc = b.r;
        let op = BUBBLE.opacity!;
        if (frame >= esc) {
          const k = Math.min(1, (frame - esc) / 10);
          const base = topY;
          y = base + k * (AIR_VALVE_TOP[1] - base);
          x = HUMP[0] + 0.01;
          z = HUMP[2];
          sc = Math.min(b.r, 0.045);
          if (frame > esc + 10) {
            const pk = Math.min(1, (frame - esc - 10) / 38);
            y = AIR_VALVE_TOP[1] + pk * 0.45;
            sc = 0.045 + pk * 0.06;
            op = (1 - pk) * 0.8;
          }
        }
        if (op < 0.04) return null;
        return <BMesh key={b.i} geometry={g.bubble} mat={{ ...BUBBLE, opacity: step(op) }} position={[x, y, z]} scale={sc} outline={0} castShadow={false} />;
      })}
    </group>
  );
};

/* ---------------- dunia ---------------- */
export const World3D: React.FC<{ frame: number }> = ({ frame }) => {
  const k = cutAt(frame);
  const netPlane = useCutPlane([-1, 0, 0], 1.25 - k * 1.25);
  const housePlane = useCutPlane([-1, 0, 0], HOUSE_CUT_X);
  const netCut = useMemo(() => [netPlane], [netPlane]);
  const houseCut = useMemo(() => [housePlane], [housePlane]);
  const wop = waterOpacityAt(frame);
  const main = mainSeg(frame);
  const dist = distSeg(frame);
  const gaps = useMemo(() => [GATE_GAP], []);
  return (
    <group>
      <Hill />
      <Supports />
      <Reservoir cut={netCut} wop={wop} />
      <PipeRun
        pts={MAIN}
        rOut={PIPE_R_OUT}
        rIn={PIPE_R_IN}
        seg={[[0, GATE_S], main]}
        flow={flowOn(frame, 1092)}
        frame={frame}
        wop={wop}
        cut={netCut}
        gaps={gaps}
        kind="main"
      />
      <GateValve frame={frame} cut={netCut} />
      <Coupling cut={netCut} />
      <AirValve cut={netCut} />
      <PipeRun pts={DIST} rOut={DIST_R_OUT} rIn={DIST_R_IN} seg={[dist]} flow={flowOn(frame, 1106)} frame={frame} wop={wop} cut={netCut} kind="dist" />
      <Gauge frame={frame} />
      {NEIGHBOURS.map((n, i) => (
        <group key={i}>
          <HouseShell x={n.x} z={n.z} w={n.w} d={n.d} h={n.h} wall={{ color: n.wall, metalness: 0, roughness: 0.9 }} roof={{ color: n.roof, metalness: 0, roughness: 0.75 }} windows />
          <ServiceStub z={n.z} toX={n.x + n.w / 2} />
        </group>
      ))}
      <HouseShell x={HOUSE.x} z={HOUSE.z} w={HOUSE.w} d={HOUSE.d} h={HOUSE.h} wall={HOUSE_WALL} roof={HOUSE_ROOF} cut={houseCut} />
      <CustomerInterior frame={frame} />
      <Bubbles frame={frame} />
    </group>
  );
};

export { MAIN_LEN };
