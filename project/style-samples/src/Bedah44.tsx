import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { BEDAH_SEMANTIC, BedahHeader, BedahStepper, CalloutPill, FlowArrow, LiveCounter, sequenceBeats, StatusBadge } from './components/BedahOverlay';
import { BEDAH_MATERIALS, BedahStage, BMesh, CamKey3D, hexBoltGeometry, latheGeometry, MatSpec, pipeGeometry, projectToScreen, useCutPlane } from './components/Bedah3D';
import { Ctx, EIO, ip } from './helpers';

/**
 * Sampel gaya #44: katup gerbang (gate valve) PDAM dibedah dalam 3D.
 * Anatomi: pipa PVC, flens + baut, badan katup besi cor ber-epoxy biru, bonnet, stem naik,
 * roda katup, pintu (gate) berlapis karet, air di dalam pipa.
 */

const AXIS = 0.78; // tinggi sumbu pipa dari lantai
const R_OUT = 0.42;
const R_IN = 0.36;
const WHEEL_Y = AXIS + 1.72;
const OPEN_TRAVEL = 0.8;

const HANDWHEEL: MatSpec = { color: '#C8352A', metalness: 0.35, roughness: 0.42 };
const GATE_RUBBER: MatSpec = { color: '#23262B', metalness: 0.05, roughness: 0.7 };

function useGeoms() {
  return useMemo(() => {
    const body = latheGeometry([
      [R_IN, -1.22], [0.5, -1.22], [0.5, -1.04], [0.62, -0.82], [0.7, -0.42], [0.72, 0], [0.7, 0.42], [0.62, 0.82], [0.5, 1.04], [0.5, 1.22], [R_IN, 1.22], [R_IN, -1.22],
    ]);
    body.rotateZ(-Math.PI / 2); // sumbu Y -> X
    const bonnet = latheGeometry([
      [0.36, 0], [0.48, 0], [0.48, 0.3], [0.62, 0.3], [0.62, 0.4], [0.44, 0.4], [0.4, 1.0], [0.28, 1.22], [0.09, 1.26], [0.09, 1.16], [0.22, 1.12], [0.3, 0.96], [0.34, 0.4], [0.36, 0],
    ]);
    const torus = new THREE.TorusGeometry(0.5, 0.05, 20, 96);
    torus.rotateX(Math.PI / 2);
    const spoke = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 12);
    spoke.rotateZ(Math.PI / 2);
    spoke.translate(0.25, 0, 0);
    return {
      pipeL: pipeGeometry(R_OUT, R_IN, 8),
      flangeValve: pipeGeometry(0.8, R_IN, 0.12),
      flangePipe: pipeGeometry(0.8, R_OUT, 0.1),
      body,
      bonnet,
      bolt: (() => {
        const g = new THREE.CylinderGeometry(0.045, 0.045, 0.44, 12);
        g.rotateZ(Math.PI / 2);
        return g;
      })(),
      nut: (() => {
        const g = hexBoltGeometry(0.075, 0.07);
        g.rotateZ(Math.PI / 2);
        return g;
      })(),
      nutV: hexBoltGeometry(0.06, 0.07),
      gate: new THREE.BoxGeometry(0.13, 0.84, 0.7, 4, 8, 8),
      stem: new THREE.CylinderGeometry(0.05, 0.05, 1.7, 24),
      torus,
      spoke,
      hub: new THREE.CylinderGeometry(0.1, 0.1, 0.12, 24),
      water: (() => {
        const g = new THREE.CylinderGeometry(R_IN - 0.006, R_IN - 0.006, 1, 64);
        g.rotateZ(Math.PI / 2);
        return g;
      })(),
      streak: (() => {
        const g = new THREE.CapsuleGeometry(0.025, 0.32, 4, 10);
        g.rotateZ(Math.PI / 2);
        return g;
      })(),
      block: new THREE.BoxGeometry(0.6, AXIS - R_OUT, 1.0),
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/* Jadwal satu-gerak: selama satu beat hanya SATU elemen yang bergerak. */
/* Kamera juga dihitung satu elemen, jadi kamera diam saat objek/teks   */
/* bergerak. Kaption karaoke mengikuti VO dan tidak dihitung.           */
/* ------------------------------------------------------------------ */
export const BEDAH44_BEATS = sequenceBeats([
  { id: 'header', dur: 18 }, // judul + badge + counter masuk (kamera diam, overview)
  { id: 'cut', dur: 20 }, // bidang potong menyapu separuh depan
  { id: 'zoom1', dur: 28 }, // kamera zoom ke katup
  { id: 'call1', dur: 24 }, // callout "Roda diputar"
  { id: 'mech', dur: 44 }, // roda berputar -> stem & pintu naik (satu mekanisme) + panah putar/naik + counter
  { id: 'clear1', dur: 8 }, // callout & panah bab 1 keluar
  { id: 'back1', dur: 26 }, // kamera mundur ke overview: konteks utuh
  { id: 'step', dur: 8 }, // penanda posisi pindah 01 -> 02
  { id: 'flow', dur: 30 }, // air mengisi hilir + panah alur ke hilir
  { id: 'zoom2', dur: 24 }, // kamera zoom ke hilir
  { id: 'call2', dur: 24 }, // callout "Mengalir lagi"
  { id: 'read2', dur: 10 }, // tahan baca
  { id: 'clear2', dur: 8 },
  { id: 'back2', dur: 24 }, // kamera mundur ke overview penutup
  { id: 'end', dur: 4 },
]);
const B = BEDAH44_BEATS;

const Valve: React.FC<{ t: number; cut: THREE.Plane[]; open: number; flowK: number }> = ({ t, cut, open, flowK }) => {
  const g = useGeoms();
  const gateY = AXIS + open * OPEN_TRAVEL;
  const boltAngles = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2 + Math.PI / 8);
  const downLen = 8.6 * flowK;

  return (
    <group>
      {/* penyangga beton */}
      {[-3.6, 3.6].map((x) => (
        <BMesh key={x} geometry={g.block} mat="concrete" position={[x, (AXIS - R_OUT) / 2, 0]} />
      ))}
      {/* pipa PVC kiri & kanan */}
      <BMesh geometry={g.pipeL} mat="pvcGrey" position={[-5.4, AXIS, 0]} cut={cut} />
      <BMesh geometry={g.pipeL} mat="pvcGrey" position={[5.4, AXIS, 0]} cut={cut} />
      {/* flens pipa + flens katup + baut */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <BMesh geometry={g.flangePipe} mat="pvcGrey" position={[s * 1.4, AXIS, 0]} cut={cut} />
          <BMesh geometry={g.flangeValve} mat="castIronBlue" position={[s * 1.28, AXIS, 0]} cut={cut} />
          {boltAngles.map((a, i) => {
            const y = AXIS + Math.sin(a) * 0.64;
            const z = Math.cos(a) * 0.64;
            return (
              <group key={i}>
                <BMesh geometry={g.bolt} mat="galvanized" position={[s * 1.34, y, z]} outline={0.006} cut={cut} />
                <BMesh geometry={g.nut} mat="galvanized" position={[s * 1.12, y, z]} outline={0.006} cut={cut} />
                <BMesh geometry={g.nut} mat="galvanized" position={[s * 1.56, y, z]} outline={0.006} cut={cut} />
              </group>
            );
          })}
        </group>
      ))}
      {/* badan katup + bonnet */}
      <BMesh geometry={g.body} mat="castIronBlue" position={[0, AXIS, 0]} cut={cut} />
      <BMesh geometry={g.bonnet} mat="castIronBlue" position={[0, AXIS + 0.4, 0]} cut={cut} />
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return <BMesh key={i} geometry={g.nutV} mat="galvanized" position={[Math.cos(a) * 0.54, AXIS + 0.84, Math.sin(a) * 0.54]} outline={0.006} cut={cut} />;
      })}
      {/* pintu (gate) berlapis karet + stem naik */}
      <BMesh geometry={g.gate} mat={GATE_RUBBER} position={[0, gateY, 0]} />
      <BMesh geometry={g.stem} mat="steel" position={[0, gateY + 0.42 + 0.85, 0]} outline={0.006} />
      {/* roda katup: berputar searah jarum jam (dilihat dari atas) saat dibuka */}
      <group position={[0, WHEEL_Y, 0]} rotation={[0, -open * WHEEL_TURNS, 0]}>
        <BMesh geometry={g.torus} mat={HANDWHEEL} />
        {[0, 1, 2].map((i) => (
          <BMesh key={i} geometry={g.spoke} mat={HANDWHEEL} rotation={[0, (i / 3) * Math.PI * 2, 0]} outline={0.006} />
        ))}
        <BMesh geometry={g.hub} mat={HANDWHEEL} />
      </group>
      {/* air: hulu penuh (diam selama pintu tertutup), hilir mengisi setelah pintu terangkat */}
      <BMesh geometry={g.water} mat="water" position={[-4.6, AXIS, 0]} scale={[9.1, 1, 1]} outline={0} castShadow={false} />
      {downLen > 0.01 ? (
        <BMesh geometry={g.water} mat="water" position={[0.07 + downLen / 2, AXIS, 0]} scale={[downLen, 1, 1]} outline={0} castShadow={false} />
      ) : null}
      {/* garis arus ke hilir (+X). Setelah terisi = aliran tunak, kecepatan konstan */}
      {Array.from({ length: 14 }, (_, i) => {
        const lane = [-0.18, 0, 0.16][i % 3];
        const laneZ = [0.12, -0.05, 0.2][i % 3];
        const travel = Math.max(0, t - B.flow[0]) * 0.1;
        const x = -8 + ((((i * 1.23 + travel) % 16) + 16) % 16);
        const hidden = x > 0.07 + downLen || flowK < 0.05;
        return (
          <BMesh
            key={i}
            geometry={g.streak}
            mat={{ color: '#E6F5FF', metalness: 0, roughness: 0.2, opacity: Math.round(0.85 * flowK * 20) / 20 }}
            position={[x, AXIS + lane, laneZ]}
            outline={0}
            castShadow={false}
            visible={!hidden}
          />
        );
      })}
    </group>
  );
};

const WHEEL_TURNS = Math.PI * 5; // 2,5 putaran untuk bukaan penuh

/** Waypoint kamera: overview -> zoom katup -> overview -> zoom hilir -> overview. Tahan = dua key sama (kamera diam). */
function camKeys(isV: boolean): CamKey3D[] {
  const O: number[] = isV ? [4.6, 4.6, 7.2, 0.15, AXIS + 0.55, 0, 44] : [5.6, 4.2, 7.6, -0.9, AXIS + 0.75, 0, 30];
  const Z1: number[] = isV ? [2.6, 3.3, 4.5, 0.05, AXIS + 1.35, 0, 42] : [3.4, 3.1, 4.6, -0.55, AXIS + 1.15, 0, 30];
  const Z2: number[] = isV ? [4.6, 2.8, 4.8, 2.0, AXIS + 0.4, 0, 42] : [5.4, 2.8, 4.8, 1.5, AXIS + 0.5, 0, 30];
  const k = (f: number, v: number[]) => [f, ...v] as CamKey3D;
  return [
    k(0, O),
    k(B.zoom1[0], O),
    k(B.zoom1[1], Z1),
    k(B.back1[0], Z1),
    k(B.back1[1], O),
    k(B.zoom2[0], O),
    k(B.zoom2[1], Z2),
    k(B.back2[0], Z2),
    k(B.back2[1], O),
  ];
}

/** Titik 3D -> layar, sampel n titik sepanjang fungsi parametrik u 0..1. */
const pathOnScreen = (fn: (u: number) => [number, number, number], n: number, t: number, cam: CamKey3D[], W: number, H: number) =>
  Array.from({ length: n + 1 }, (_, i) => projectToScreen(fn(i / n), t, cam, W, H));

export const Bedah44Scene: React.FC<{ c: Ctx; t: number; globalStart: number }> = ({ c, t, globalStart }) => {
  const { st, W, H, isV } = c;
  const cam = useMemo(() => camKeys(isV), [isV]);
  const cutK = ip(t, B.cut, [0, 1], EIO);
  const plane = useCutPlane([0, 0, -1], 1.7 - cutK * 1.7);
  const cut = useMemo(() => [plane], [plane]);
  const open = ip(t, B.mech, [0, 1], EIO);
  const flowK = ip(t, B.flow, [0, 1], EIO);
  const g0 = globalStart;

  const wheelPt = projectToScreen([0.52, WHEEL_Y, 0.1], t, cam, W, H);
  const downPt = projectToScreen([2.6, AXIS + 0.12, 0.05], t, cam, W, H);

  // panah putar: busur 270 derajat di atas roda, searah putaran roda (sudut naik = arah rotasi -Y)
  const arcPts = pathOnScreen((u) => {
    const s = 0.2 + u * Math.PI * 1.5;
    return [Math.cos(s) * 0.82, WHEEL_Y + 0.3, Math.sin(s) * 0.82];
  }, 36, t, cam, W, H);
  // panah naik: di samping pintu, searah stem & pintu terangkat
  const upPts = pathOnScreen((u) => [0.34, AXIS - 0.32 + u * (OPEN_TRAVEL + 0.5), 0.22], 8, t, cam, W, H);
  // panah alur: sumbu pipa ke hilir (+X), kepala panah = muka air
  const flowX0 = 0.35;
  const flowX1 = isV ? 2.5 : 3.0;
  const front = 0.07 + 8.6 * flowK;
  const flowPts = pathOnScreen((u) => [flowX0 + u * (flowX1 - flowX0), AXIS, 0.02], 16, t, cam, W, H);
  const flowProg = ip(front, [flowX0, flowX1], [0, 1], (x) => x);

  const fade1 = ip(t, B.clear1, [1, 0], (x) => x);
  const fade2 = ip(t, B.clear2, [1, 0], (x) => x);
  const step = ip(t, B.step, [0, 1], EIO);

  return (
    <AbsoluteFill>
      <BedahStage width={W} height={H} camera={cam} frame={t} bg={st.palette.bg} wallZ={-2.4}>
        <Valve t={t} cut={cut} open={open} flowK={flowK} />
      </BedahStage>

      {/* panah arah gerak nyata: tumbuh bersama gerak bendanya */}
      <FlowArrow stylePreset={st} points={arcPts} progress={open} opacity={fade1} color={BEDAH_SEMANTIC.problem} width={isV ? 7 : 6} head={isV ? 26 : 22} />
      <FlowArrow stylePreset={st} points={upPts} progress={open} opacity={fade1} color={BEDAH_SEMANTIC.solution} width={isV ? 7 : 6} head={isV ? 26 : 22} />
      <FlowArrow stylePreset={st} points={flowPts} progress={flowProg} opacity={fade2} width={isV ? 8 : 7} head={isV ? 30 : 26} />

      <BedahHeader
        stylePreset={st}
        before="Kok air bisa"
        keyword="berhenti?"
        subLabel={<BedahStepper stylePreset={st} steps={['Katup', 'Arus']} active={step} size={isV ? 26 : 22} />}
        start={g0 + B.header[0]}
        titleSize={isV ? 76 : 64}
        top={isV ? 300 : 64}
        right={<StatusBadge stylePreset={st} text="Ilustrasi" variant="time" start={g0 + B.header[0] + 6} size={isV ? 23 : 20} />}
        data={<LiveCounter stylePreset={st} from={0} to={100} start={g0 + B.mech[0]} end={g0 + B.mech[1]} suffix="% terbuka" size={isV ? 60 : 48} />}
      />
      {/* callout dirender setelah header agar tidak tertutup gradien header */}
      <CalloutPill
        stylePreset={st}
        anchor={wheelPt}
        label={[wheelPt[0] + (isV ? -170 : 200), wheelPt[1] + (isV ? 170 : 30)]}
        text="Roda diputar"
        start={g0 + B.call1[0]}
        end={g0 + B.clear1[0]}
        size={isV ? 28 : 24}
      />
      <CalloutPill
        stylePreset={st}
        anchor={downPt}
        label={[downPt[0] - (isV ? 40 : 60), downPt[1] + (isV ? 200 : 140)]}
        text="Mengalir lagi"
        variant="solution"
        start={g0 + B.call2[0]}
        end={g0 + B.clear2[0]}
        size={isV ? 28 : 24}
      />
    </AbsoluteFill>
  );
};

/** Narasi sampel: kata ditayangkan 10 frame (0,33 dtk) per kata, dijadwalkan per beat. */
export const BEDAH44_CAPTION: [number, string][] = [
  [B.header[0] + 4, 'Kok air bisa berhenti? Kita bedah.'],
  [B.call1[0], 'Roda diputar, pintu karet terangkat.'],
  [B.flow[0] - 4, 'Jalur terbuka, air mengalir ke hilir.'],
  [B.call2[0] + 4, 'Tekanan kembali, keran di rumah menyala.'],
];

/** SFX terikat beat (bukan acak). */
export const BEDAH44_SFX: [number, string, number, number][] = [
  [B.cut[0], 'transition-whoosh-soft', 0.55, 40],
  [B.call1[0], 'pop-in', 0.5, 30],
  [B.mech[0], 'm4', 0.5, 44],
  [B.mech[1] - 2, 'data-reveal', 0.35, 50],
  [B.flow[0], 'o5', 0.5, 40],
  [B.call2[0], 'pop-in', 0.5, 30],
];

export { BEDAH_MATERIALS };
