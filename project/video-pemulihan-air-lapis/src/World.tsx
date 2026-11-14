import React, { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { LMesh, MatSpec, Peel, roundedBox, sliceLathe } from './antislop/components/Lapis3D';
import {
  AIRV_Y,
  airPocketAt,
  BACK_X,
  DIST,
  DIST_R,
  distSeg,
  FRONT_X,
  GATE_S,
  GATE_Z,
  GAUGE,
  groundY,
  HOUSE,
  HOUSE_Y,
  HUMP,
  HUMP_S,
  LEDGE_DROP,
  MAIN,
  MAIN_R,
  mainSeg,
  NEIGHBOURS,
  peelAt,
  pointAt,
  pressureAt,
  PROFILE,
  SEAM,
  Seg,
  SINK_Y,
  sinkFillAt,
  SKIN,
  SLABS,
  SPOUT_TIP,
  TANK,
  TAP,
  tapFlowAt,
  V3,
  valveOpenAt,
  ventingAt,
} from './layout';
import { T } from './timeline';

/**
 * Diorama clay gaya #46: tandon di bukit -> pipa besar -> pipa kecil -> rumah, semuanya tertanam.
 * Lapis yang dilepas: 0 jalan, 1 lereng, 2 dataran + dinding depan tandon, 3 kulit depan pipa, 4 dinding depan rumah.
 * Warna jenuh hanya untuk yang dijelaskan: air (biru), katup induk (oranye), katup udara (kuning), keran + jarum (mint).
 */

/* ---------------- bahan ---------------- */
const SOIL: MatSpec = { color: '#EBD3BD', roughness: 0.95 };
const SOIL_CUT: MatSpec = { color: '#F2C4A2', roughness: 0.95 };
const GRASS: MatSpec = { color: '#CDE4BF', roughness: 0.95 };
const STREET: MatSpec = { color: '#E4E2DC', roughness: 0.95 };
const PIPE: MatSpec = { color: '#DDE2E9', roughness: 0.85 };
const PIPE_CUT: MatSpec = { color: '#F5C9A9', roughness: 0.95 };
export const WATER: MatSpec = { color: '#3E8EDD', roughness: 0.2, opacity: 0.8 };
const AIR: MatSpec = { color: '#FFFFFF', roughness: 0.3, opacity: 0.9 };
const TILE: MatSpec = { color: '#DDEAF1', roughness: 0.6 };
const TREE: MatSpec = { color: '#8FD9B6', roughness: 0.9 };
export const C_VALVE = '#EE7B3A';
export const C_AIRV = '#F4B63C';
export const C_TAP = '#3FC49A';
export const C_WATER = '#3E8EDD';
export const C_PIPE = '#AEB7C4';

/* ---------------- geometri bantu ---------------- */
function profileBetween(z0: number, z1: number, drop = 0): [number, number][] {
  const mid = PROFILE.filter(([z]) => z > z0 + 1e-6 && z < z1 - 1e-6).map(([z, y]) => [z, y - drop] as [number, number]);
  return [[z0, groundY(z0) - drop], ...mid, [z1, groundY(z1) - drop]];
}
/** Balok tanah: penampang (z,y) antara garis `top` dan `bottom`, diekstrusi dari x0 sampai x1. */
function slab(top: [number, number][], bottom: [number, number][], x0: number, x1: number) {
  const s = new THREE.Shape();
  s.moveTo(top[0][0], top[0][1]);
  top.slice(1).forEach(([z, y]) => s.lineTo(z, y));
  [...bottom].reverse().forEach(([z, y]) => s.lineTo(z, y));
  const g = new THREE.ExtrudeGeometry(s, { depth: x1 - x0, bevelEnabled: false });
  g.rotateY(-Math.PI / 2); // bentuk (z,y) -> dunia; ekstrusi ke arah -x
  g.translate(x1, 0, 0);
  return g;
}
const flat = (z0: number, z1: number, y = 0): [number, number][] => [
  [z0, y],
  [z1, y],
];

/** Setengah pipa sepanjang sumbu Y. `front` = setengah yang menghadap +x. Hasil: dinding + tepi potong. */
function halfPipe(rOut: number, rIn: number, len: number, front: boolean) {
  const start = front ? 0 : Math.PI;
  const outer = new THREE.CylinderGeometry(rOut, rOut, len, 28, 1, true, start, Math.PI);
  const inner = new THREE.CylinderGeometry(rIn, rIn, len, 28, 1, true, start, Math.PI);
  const strip = (z: number) => {
    const p = new THREE.PlaneGeometry(rOut - rIn, len);
    p.rotateY(Math.PI / 2);
    p.translate(0, 0, z);
    return p;
  };
  const m = (rOut + rIn) / 2;
  return { wall: mergeGeometries([outer, inner]) as THREE.BufferGeometry, caps: mergeGeometries([strip(m), strip(-m)]) as THREE.BufferGeometry };
}
function halfSphere(r: number, front: boolean) {
  return new THREE.SphereGeometry(r, 24, 16, front ? Math.PI / 2 : -Math.PI / 2, Math.PI);
}

interface SegInfo {
  a: V3;
  len: number;
  mid: V3;
  rot: [number, number, number];
  s0: number;
}
function segInfos(pts: V3[]): SegInfo[] {
  let acc = 0;
  return pts.slice(1).map((b, i) => {
    const a = pts[i];
    const len = Math.hypot(b[1] - a[1], b[2] - a[2]);
    const info: SegInfo = { a, len, mid: [0, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], rot: [Math.atan2(b[2] - a[2], b[1] - a[1]), 0, 0], s0: acc };
    acc += len;
    return info;
  });
}
const MAIN_SEGS = segInfos(MAIN);
const DIST_SEGS = segInfos(DIST);

function useGeoms() {
  return useMemo(() => {
    const pipe = (segs: SegInfo[], r: [number, number]) => segs.map((s) => ({ back: halfPipe(r[0], r[1], s.len, false), front: halfPipe(r[0], r[1], s.len, true) }));
    const tankP: [number, number][] = [[0, 0], [TANK.r, 0], [TANK.r, TANK.h], [TANK.r - 0.08, TANK.h], [TANK.r - 0.08, 0.08], [0, 0.08]];
    const roofP: [number, number][] = [[0, TANK.h + 0.26], [TANK.r + 0.06, TANK.h], [TANK.r + 0.06, TANK.h + 0.06], [0, TANK.h + 0.34]];
    const waterP: [number, number][] = [[0, 0.09], [TANK.r - 0.1, 0.09], [TANK.r - 0.1, TANK.h - 0.22], [0, TANK.h - 0.22]];
    const gable = (() => {
      const s = new THREE.Shape();
      const hd = HOUSE.w / 2;
      s.moveTo(-hd, 0);
      s.lineTo(hd, 0);
      s.lineTo(hd, HOUSE.h);
      s.lineTo(0, HOUSE.h + 0.5);
      s.lineTo(-hd, HOUSE.h);
      const g = new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: false });
      g.translate(0, 0, -0.035);
      return g;
    })();
    const roofLen = Math.hypot(HOUSE.w / 2 + 0.12, 0.5 + 0.1);
    const wheel = new THREE.TorusGeometry(0.2, 0.035, 14, 48);
    wheel.rotateX(Math.PI / 2);
    const spoke = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 10);
    spoke.rotateZ(Math.PI / 2);
    const disc = (r: number, h: number) => {
      const g = new THREE.CylinderGeometry(r, r, h, 40);
      g.rotateZ(Math.PI / 2); // sumbu -> x (menghadap kamera)
      return g;
    };
    const gate = new THREE.CylinderGeometry(MAIN_R[1] * 0.98, MAIN_R[1] * 0.98, 0.05, 32);
    gate.rotateX(Math.PI / 2); // sumbu -> z (melintang pipa)
    const basin = sliceLathe([[0, 0], [0.2, 0.02], [0.3, 0.12], [0.32, 0.2], [0.28, 0.2], [0.26, 0.13], [0.18, 0.06], [0, 0.05]], 0, Math.PI * 2).wall;
    return {
      back: slab(profileBetween(-7.8, 6.0, SKIN), flat(-7.8, 6.0), BACK_X, SEAM),
      backSkin: slab(profileBetween(-7.8, 6.0), profileBetween(-7.8, 6.0, SKIN), BACK_X, SEAM),
      backCut: slab(profileBetween(-7.8, 6.0, SKIN), profileBetween(-7.8, 6.0, LEDGE_DROP), SEAM - 0.012, SEAM + 0.004),
      ledge: slab(profileBetween(-7.8, 6.0, LEDGE_DROP), flat(-7.8, 6.0), SEAM, FRONT_X),
      slabs: SLABS.map(([z0, z1]) => ({
        body: slab(profileBetween(z0, z1, SKIN), profileBetween(z0, z1, LEDGE_DROP), SEAM, FRONT_X),
        skin: slab(profileBetween(z0, z1), profileBetween(z0, z1, SKIN), SEAM, FRONT_X),
      })),
      main: pipe(MAIN_SEGS, MAIN_R),
      dist: pipe(DIST_SEGS, DIST_R),
      jointMainB: halfSphere(MAIN_R[0] * 1.06, false),
      jointMainF: halfSphere(MAIN_R[0] * 1.06, true),
      waterMain: new THREE.CylinderGeometry(MAIN_R[1] * 0.95, MAIN_R[1] * 0.95, 1, 28),
      waterDist: new THREE.CylinderGeometry(DIST_R[1] * 0.95, DIST_R[1] * 0.95, 1, 28),
      waterJoint: new THREE.SphereGeometry(MAIN_R[1] * 0.95, 20, 14),
      tankB: sliceLathe(tankP, Math.PI, Math.PI),
      tankF: sliceLathe(tankP, 0, Math.PI),
      roofB: sliceLathe(roofP, Math.PI, Math.PI),
      roofF: sliceLathe(roofP, 0, Math.PI),
      tankWater: sliceLathe(waterP, Math.PI, Math.PI),
      drop: new THREE.CylinderGeometry(MAIN_R[0], MAIN_R[0], 0.42, 24),
      collarB: halfPipe(0.25, MAIN_R[1], 0.34, false),
      collarF: halfPipe(0.25, MAIN_R[1], 0.34, true),
      bonnet: new THREE.CylinderGeometry(0.075, 0.09, 0.62, 20),
      stem: new THREE.CylinderGeometry(0.025, 0.025, 0.3, 12),
      wheel,
      spoke,
      gate,
      riser: new THREE.CylinderGeometry(0.045, 0.045, 1, 14),
      airBody: new THREE.CapsuleGeometry(0.15, 0.16, 8, 24),
      airCap: new THREE.CylinderGeometry(0.1, 0.12, 0.07, 24),
      pocket: new THREE.SphereGeometry(MAIN_R[1] * 0.93, 24, 16),
      bubble: new THREE.SphereGeometry(0.035, 12, 10),
      gaugeRim: disc(GAUGE.r, 0.1),
      gaugeFace: disc(GAUGE.r - 0.035, 0.11),
      gaugeArc: (() => {
        const g = new THREE.TorusGeometry(GAUGE.r - 0.075, 0.018, 8, 32, Math.PI * 0.42);
        g.rotateY(Math.PI / 2);
        return g;
      })(),
      needle: roundedBox(0.02, GAUGE.r - 0.07, 0.03, 0.008),
      hub: disc(0.03, 0.14),
      wallBack: roundedBox(0.07, HOUSE.h, HOUSE.d, 0.02),
      wallFront: roundedBox(0.07, HOUSE.h, HOUSE.d, 0.02),
      gable,
      floor: roundedBox(HOUSE.w, 0.05, HOUSE.d, 0.02),
      roof: roundedBox(roofLen, 0.06, HOUSE.d + 0.24, 0.02),
      tile: roundedBox(0.02, 0.62, HOUSE.d - 0.16, 0.008),
      nbBody: roundedBox(1.05, 0.9, 1.0, 0.05),
      nbRoof: (() => {
        const g = new THREE.CylinderGeometry(0.78, 0.78, 1.12, 3);
        g.rotateX(Math.PI / 2);
        g.rotateZ(Math.PI / 2);
        g.scale(1, 0.55, 1);
        return g;
      })(),
      pedestal: new THREE.CylinderGeometry(0.07, 0.1, SINK_Y - HOUSE_Y - 0.05, 16),
      basin,
      basinWater: new THREE.CylinderGeometry(0.25, 0.19, 0.08, 28),
      tapPost: new THREE.CylinderGeometry(0.032, 0.032, 0.26, 14),
      tapArm: (() => {
        const g = new THREE.CylinderGeometry(0.032, 0.032, 0.3, 14);
        g.rotateZ(Math.PI / 2);
        return g;
      })(),
      tapNose: new THREE.CylinderGeometry(0.03, 0.036, 0.09, 14),
      tapKnob: roundedBox(0.06, 0.05, 0.16, 0.02),
      stream: new THREE.CylinderGeometry(0.02, 0.026, 1, 12),
      drip: new THREE.SphereGeometry(0.026, 12, 10),
      trunk: new THREE.CylinderGeometry(0.035, 0.045, 0.5, 8),
      crown: new THREE.SphereGeometry(0.3, 20, 14),
      roofLen,
    };
  }, []);
}

/* ---------------- pipa ---------------- */
const PipeRun: React.FC<{ segs: SegInfo[]; geoms: { back: ReturnType<typeof halfPipe>; front: ReturnType<typeof halfPipe> }[]; front: boolean }> = ({ segs, geoms, front }) => (
  <>
    {segs.map((s, i) => {
      const g = front ? geoms[i].front : geoms[i].back;
      return (
        <group key={i} position={s.mid} rotation={s.rot}>
          <LMesh geometry={g.wall} mat={PIPE} />
          {front ? null : <LMesh geometry={g.caps} mat={PIPE_CUT} castShadow={false} />}
        </group>
      );
    })}
  </>
);

/** Air di dalam satu jalur pipa pada rentang jarak busur [s0, s1]. */
const WaterRun: React.FC<{ segs: SegInfo[]; seg: Seg; geom: THREE.BufferGeometry; joint?: THREE.BufferGeometry; pts: V3[] }> = ({ segs, seg, geom, joint, pts }) => (
  <>
    {segs.map((s, i) => {
      const a = Math.max(seg[0], s.s0);
      const b = Math.min(seg[1], s.s0 + s.len);
      if (b - a < 0.01) return null;
      const off = (a + b) / 2 - (s.s0 + s.len / 2);
      const ang = s.rot[0];
      return (
        <group key={i} position={[0, s.mid[1] + Math.cos(ang) * off, s.mid[2] + Math.sin(ang) * off]} rotation={s.rot}>
          <LMesh geometry={geom} mat={WATER} scale={[1, b - a, 1]} />
        </group>
      );
    })}
    {joint
      ? segs.slice(1).map((s, i) => (seg[0] <= s.s0 && seg[1] >= s.s0 ? <LMesh key={`j${i}`} geometry={joint} mat={WATER} position={pts[i + 1]} /> : null))
      : null}
  </>
);

/* ---------------- rumah ---------------- */
const House: React.FC<{ frame: number; open: number }> = ({ frame, open }) => {
  const g = useGeoms();
  const { x, z, w, d, h } = HOUSE;
  const y = HOUSE_Y;
  const roofAng = Math.atan2(0.5 + 0.1, w / 2 + 0.12);
  const roofY = y + h + 0.26;
  const flow = tapFlowAt(frame);
  const fill = sinkFillAt(frame);
  const tipY = SPOUT_TIP[1] - 0.06;
  const streamLen = (tipY - (SINK_Y + 0.08)) * flow;
  return (
    <group>
      <LMesh geometry={g.floor} mat="shellCool" position={[x, y + 0.025, z]} />
      <LMesh geometry={g.wallBack} mat="shell" position={[x - w / 2 + 0.035, y + h / 2, z]} />
      {[-1, 1].map((s) => (
        <LMesh key={s} geometry={g.gable} mat="shell" position={[x, y, z + (s * d) / 2]} />
      ))}
      {/* ubin dinding belakang + wastafel + keran */}
      <LMesh geometry={g.tile} mat={TILE} position={[x - w / 2 + 0.08, y + 0.72, z]} castShadow={false} />
      <LMesh geometry={g.pedestal} mat="shell" position={[SPOUT_TIP[0], y + (SINK_Y - y) / 2 + 0.02, z]} />
      <LMesh geometry={g.basin} mat="cream" position={[SPOUT_TIP[0], SINK_Y, z]} />
      {fill > 0.02 ? <LMesh geometry={g.basinWater} mat={WATER} position={[SPOUT_TIP[0], SINK_Y + 0.07 + fill * 0.05, z]} scale={[0.6 + fill * 0.4, 1, 0.6 + fill * 0.4]} /> : null}
      <LMesh geometry={g.tapPost} mat={{ color: C_TAP, roughness: 0.6 }} position={[TAP[0], TAP[1] - 0.13, TAP[2]]} />
      <LMesh geometry={g.tapArm} mat={{ color: C_TAP, roughness: 0.6 }} position={[TAP[0] + 0.15, TAP[1], TAP[2]]} />
      <LMesh geometry={g.tapNose} mat={{ color: C_TAP, roughness: 0.6 }} position={[SPOUT_TIP[0], SPOUT_TIP[1] - 0.03, TAP[2]]} />
      <LMesh geometry={g.tapKnob} mat="dark" position={[TAP[0], TAP[1] + 0.06, TAP[2]]} rotation={[0, flow * 1.3, 0]} />
      {streamLen > 0.02 ? <LMesh geometry={g.stream} mat={WATER} position={[SPOUT_TIP[0], tipY - streamLen / 2, z]} scale={[1, streamLen, 1]} /> : null}
      {/* tetes di hook: keran belum mengalir */}
      {T.drips.map(([a, b], i) => {
        if (frame < a || frame > b) return null;
        const k = (frame - a) / (b - a);
        const hang = Math.min(1, k / 0.45);
        const fall = Math.max(0, (k - 0.45) / 0.55);
        return <LMesh key={i} geometry={g.drip} mat={WATER} position={[SPOUT_TIP[0], tipY - 0.02 - fall * fall * (tipY - SINK_Y - 0.1), z]} scale={0.4 + hang * 0.6} />;
      })}
      {/* atap belakang tetap */}
      <LMesh geometry={g.roof} mat={{ color: '#E99A78', roughness: 0.9 }} position={[x - (w / 4 + 0.03), roofY, z]} rotation={[0, 0, roofAng]} />
      {/* lapis 4: dinding depan + atap depan */}
      <Peel k={open} dir={[0.35, 1, 0]} dist={4.2} tilt={[0, 0, -0.3]} pivot={[x + w / 2, y + h, z]}>
        <LMesh geometry={g.wallFront} mat="shell" position={[x + w / 2 - 0.035, y + h / 2, z]} />
        <LMesh geometry={g.roof} mat={{ color: '#E99A78', roughness: 0.9 }} position={[x + (w / 4 + 0.03), roofY, z]} rotation={[0, 0, -roofAng]} />
      </Peel>
    </group>
  );
};

/* ---------------- dunia ---------------- */
export const World: React.FC<{ frame: number }> = ({ frame }) => {
  const g = useGeoms();
  const k = (i: number) => peelAt(frame, i);
  const mSeg = mainSeg(frame);
  const dSeg = distSeg(frame);
  const open = valveOpenAt(frame);
  const pocket = airPocketAt(frame);
  const vent = ventingAt(frame);
  const press = pressureAt(frame);
  const gateY = MAIN[0][1] + open * 0.3;
  const wheelY = groundY(GATE_Z) + 0.5;
  const airTop = AIRV_Y + 0.5;

  return (
    <group>
      {/* tanah tetap: badan belakang, dinding galian, dasar galian */}
      <LMesh geometry={g.back} mat={SOIL} />
      <LMesh geometry={g.backSkin} mat={GRASS} />
      <LMesh geometry={g.backCut} mat={SOIL_CUT} castShadow={false} />
      <LMesh geometry={g.ledge} mat={SOIL} />

      {/* lapis 0-2: tanah depan (jalan, lereng, dataran + dinding depan tandon) */}
      {g.slabs.map((s, i) => {
        const zc = (SLABS[i][0] + SLABS[i][1]) / 2;
        return (
          <Peel key={i} k={k(i)} dir={[0.3, 1, 0]} dist={5.5} tilt={[0, 0, -0.25]} pivot={[0.3, groundY(zc), zc]}>
            <LMesh geometry={s.body} mat={SOIL} />
            <LMesh geometry={s.skin} mat={i === 0 ? STREET : GRASS} />
            {i === 2 ? (
              <group position={[0, TANK.y, TANK.z]}>
                <LMesh geometry={g.tankF.wall} mat="shell" />
                <LMesh geometry={g.roofF.wall} mat="shellCool" />
              </group>
            ) : null}
          </Peel>
        );
      })}

      {/* tandon: setengah belakang tetap, airnya terlihat setelah dinding depan dilepas */}
      <group position={[0, TANK.y, TANK.z]}>
        <LMesh geometry={g.tankB.wall} mat="shell" />
        <LMesh geometry={g.tankB.caps} mat={PIPE_CUT} castShadow={false} />
        <LMesh geometry={g.roofB.wall} mat="shellCool" />
        <LMesh geometry={g.roofB.caps} mat={PIPE_CUT} castShadow={false} />
        <LMesh geometry={g.tankWater.wall} mat={WATER} />
        <LMesh geometry={g.tankWater.caps} mat={WATER} />
      </group>
      <LMesh geometry={g.drop} mat={PIPE} position={[0, MAIN[0][1] + 0.2, TANK.z]} />

      {/* pipa: setengah belakang tetap + sambungan */}
      <PipeRun segs={MAIN_SEGS} geoms={g.main} front={false} />
      <PipeRun segs={DIST_SEGS} geoms={g.dist} front={false} />
      {MAIN.map((p, i) => (
        <LMesh key={i} geometry={g.jointMainB} mat={PIPE} position={p} />
      ))}

      {/* air: hulu katup selalu penuh; hilir mengikuti surut / isi */}
      <WaterRun segs={MAIN_SEGS} seg={[0, GATE_S - 0.03]} geom={g.waterMain} pts={MAIN} />
      <WaterRun segs={MAIN_SEGS} seg={mSeg} geom={g.waterMain} joint={g.waterJoint} pts={MAIN} />
      <WaterRun segs={DIST_SEGS} seg={dSeg} geom={g.waterDist} pts={DIST} />
      <LMesh geometry={g.waterJoint} mat={WATER} position={MAIN[0]} />

      {/* kantong angin di punuk + gelembung naik lewat katup udara */}
      {pocket > 0.03 ? <LMesh geometry={g.pocket} mat={AIR} position={[0.02, HUMP[1] + 0.015, HUMP[2]]} scale={[1.0, 0.45 + pocket * 0.5, 0.8 + pocket * 1.0]} castShadow={false} /> : null}
      {vent > 0.05
        ? Array.from({ length: 7 }, (_, i) => {
            const u = (((frame * 0.035 + i / 7) % 1) + 1) % 1;
            const y = HUMP[1] + 0.1 + u * (airTop + 0.45 - HUMP[1]);
            return <LMesh key={i} geometry={g.bubble} mat={AIR} position={[0.05 + Math.sin(i * 2.4) * 0.03, y, HUMP[2] + Math.cos(i * 1.7) * 0.03]} scale={(0.6 + 0.5 * Math.sin(Math.PI * u)) * Math.min(1, vent * 2)} castShadow={false} />;
          })
        : null}

      {/* katup induk: badan, bonnet, roda (oranye), pintu turun saat ditutup */}
      <group position={[0, MAIN[0][1], GATE_Z]} rotation={[Math.PI / 2, 0, 0]}>
        <LMesh geometry={g.collarB.wall} mat="grey" />
        <LMesh geometry={g.collarB.caps} mat={PIPE_CUT} castShadow={false} />
      </group>
      <LMesh geometry={g.gate} mat="dark" position={[0, gateY, GATE_Z]} />
      <LMesh geometry={g.bonnet} mat="grey" position={[0, MAIN[0][1] + 0.5, GATE_Z]} />
      <LMesh geometry={g.stem} mat="steel" position={[0, wheelY - 0.12, GATE_Z]} />
      <group position={[0, wheelY, GATE_Z]} rotation={[0, -open * Math.PI * 3, 0]}>
        <LMesh geometry={g.wheel} mat={{ color: C_VALVE, roughness: 0.75 }} />
        <LMesh geometry={g.spoke} mat={{ color: C_VALVE, roughness: 0.75 }} />
        <LMesh geometry={g.spoke} mat={{ color: C_VALVE, roughness: 0.75 }} rotation={[0, Math.PI / 2, 0]} />
      </group>

      {/* katup udara (kuning) di titik tertinggi pipa */}
      <LMesh geometry={g.riser} mat="grey" position={[0, (HUMP[1] + AIRV_Y) / 2 + 0.06, HUMP[2]]} scale={[1, AIRV_Y - HUMP[1] - 0.1, 1]} />
      <LMesh geometry={g.airBody} mat={{ color: C_AIRV, roughness: 0.8 }} position={[0, AIRV_Y + 0.22, HUMP[2]]} />
      <LMesh geometry={g.airCap} mat="dark" position={[0, airTop, HUMP[2]]} />

      {/* pengukur dorongan air: jarum naik saat pipa penuh (ilustrasi) */}
      <LMesh geometry={g.riser} mat="grey" position={[0, (DIST[0][1] + GAUGE.y) / 2 - 0.05, GAUGE.z]} scale={[0.75, GAUGE.y - GAUGE.r - DIST[0][1], 1]} />
      <group position={[0, GAUGE.y, GAUGE.z]}>
        <LMesh geometry={g.gaugeRim} mat="dark" />
        <LMesh geometry={g.gaugeFace} mat="cream" castShadow={false} />
        <LMesh geometry={g.gaugeArc} mat={{ color: C_TAP, roughness: 0.7 }} position={[0.06, 0, 0]} rotation={[Math.PI * 0.08, 0, 0]} castShadow={false} />
        <group position={[0.075, 0, 0]} rotation={[(0.5 - press) * Math.PI * 1.3, 0, 0]}>
          <LMesh geometry={g.needle} mat="red" position={[0, (GAUGE.r - 0.07) / 2, 0]} castShadow={false} />
        </group>
        <LMesh geometry={g.hub} mat="dark" castShadow={false} />
      </group>

      {/* lapis 3: kulit depan pipa + badan depan katup */}
      <Peel k={k(3)} dir={[1, 0.7, 0]} dist={3.2} pivot={[0, 1.2, -1.5]}>
        <PipeRun segs={MAIN_SEGS} geoms={g.main} front />
        <PipeRun segs={DIST_SEGS} geoms={g.dist} front />
        {MAIN.map((p, i) => (
          <LMesh key={i} geometry={g.jointMainF} mat={PIPE} position={p} />
        ))}
        <group position={[0, MAIN[0][1], GATE_Z]} rotation={[Math.PI / 2, 0, 0]}>
          <LMesh geometry={g.collarF.wall} mat="grey" />
        </group>
      </Peel>

      {/* rumah pelanggan (lapis 4 = dinding depan) + tetangga + pohon */}
      <House frame={frame} open={k(4)} />
      {NEIGHBOURS.map((n) => (
        <group key={n.z} position={[HOUSE.x, HOUSE_Y, n.z]}>
          <LMesh geometry={g.nbBody} mat={n.wall} position={[0, 0.45, 0]} />
          <LMesh geometry={g.nbRoof} mat={{ color: n.roof, roughness: 0.9 }} position={[0, 1.1, 0]} />
        </group>
      ))}
      {[[-1.5, -7.0], [-2.0, -4.6], [-1.7, -2.9], [-2.0, -0.9]].map(([x, z]) => (
        <group key={z} position={[x, groundY(z), z]}>
          <LMesh geometry={g.trunk} mat="dark" position={[0, 0.25, 0]} />
          <LMesh geometry={g.crown} mat={TREE} position={[0, 0.72, 0]} />
        </group>
      ))}
      {/* pipa dinas: cabang dari pipa kecil menuju rumah */}
      <group position={[-0.2, DIST[0][1], HOUSE.z]} rotation={[0, 0, Math.PI / 2]}>
        <LMesh geometry={g.riser} mat={PIPE} scale={[1.4, 0.4, 1.4]} />
      </group>
    </group>
  );
};

export { pointAt };
export const HUMP_ARC = HUMP_S;
