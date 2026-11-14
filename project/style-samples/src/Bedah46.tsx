import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { ChevronTrail, hookSaturation, LapisBrandMode, LapisHeader, LapisHook, lapisHookText, LapisLabel, lapisStyle, LiveCounter, StatusBadge } from './components/LapisOverlay';
import { CamKey3D, driftHold, LAPIS_CLAY, LapisStage, LMesh, Peel, peelK, projectToScreen, roundedBox, Shot, sliceLathe, springGeometry } from './components/Lapis3D';
import { Ctx, EIO, EO, ip } from './helpers';

/**
 * Sampel gaya #46 (Bedah Lapis): rice cooker dibuka lapis demi lapis.
 * Mode brand 'umum'. Mekanisme asli: pelat pemanas mendidihkan air (suhu tertahan 100 derajat selama masih ada air),
 * air habis -> suhu naik -> magnet di bawah panci kehilangan daya tarik -> pegas menariknya turun -> tuas pindah ke "hangat".
 */

/** Jawaban dua pertanyaan wajib gaya #46 untuk sampel ini. */
export const BEDAH46_BRAND: LapisBrandMode = 'umum';
export const BEDAH46_HOOK = lapisHookText(undefined, BEDAH46_BRAND);

/* Jadwal (frame). Kamera boleh bergerak bersama mekanisme, jadi beat boleh tumpang tindih. */
export const T46 = {
  hook: [45, 92],
  peel: 90, // 3 lapis, masing-masing 16 frame, selang 6 frame
  zoom1: [110, 130],
  heat: [126, 156],
  label1: [130, 172],
  dry: [156, 178],
  move2: [172, 194],
  rise: [184, 204],
  label2: [192, 232],
  click: [210, 220],
  back: [226, 246],
  recap: 242,
  close: 272, // dipasang lagi: masing-masing 14 frame, selang 5 frame
} as const;
const T = T46;

const BACK = Math.PI / 2; // setengah belakang (z <= 0): tetap di tempat
const FRONT = -Math.PI / 2; // setengah depan (z >= 0): dilepas

const SHELL_P: [number, number][] = [[0, 0], [1.04, 0], [1.17, 0.1], [1.2, 0.5], [1.2, 1.42], [1.15, 1.52], [1.08, 1.52], [1.12, 1.4], [1.12, 0.5], [1.1, 0.16], [1.0, 0.09], [0, 0.09]];
const POT_P: [number, number][] = [[0, 0.46], [0.9, 0.46], [0.97, 0.53], [0.98, 1.46], [1.06, 1.46], [1.06, 1.5], [0.94, 1.5], [0.93, 0.56], [0.88, 0.5], [0, 0.5]];
const LID_P: [number, number][] = [[0, 1.87], [0.5, 1.84], [0.95, 1.71], [1.17, 1.54], [1.1, 1.54], [0.9, 1.65], [0.48, 1.77], [0, 1.8]];
const PLATE_P: [number, number][] = [[0.22, 0.3], [0.8, 0.3], [0.86, 0.37], [0.8, 0.44], [0.22, 0.44]];
const RICE_P: [number, number][] = [[0, 0], [0.9, 0], [0.93, 0.05], [0.93, 0.4], [0, 0.4]];
const WATER_P: [number, number][] = [[0, 0], [0.925, 0], [0.925, 1], [0, 1]];
const KNOB_P: [number, number][] = [[0, 1.86], [0.2, 1.86], [0.25, 1.93], [0.2, 2.0], [0, 2.0]];

const MAG_DROP = 0.12;
const PIVOT_X = 0.68;

function useGeoms() {
  return useMemo(
    () => ({
      shellB: sliceLathe(SHELL_P, BACK, Math.PI),
      shellF: sliceLathe(SHELL_P, FRONT, Math.PI),
      potB: sliceLathe(POT_P, BACK, Math.PI),
      potF: sliceLathe(POT_P, FRONT, Math.PI),
      lidB: sliceLathe(LID_P, BACK, Math.PI),
      lidF: sliceLathe(LID_P, FRONT, Math.PI),
      plate: sliceLathe(PLATE_P, BACK, Math.PI),
      rice: sliceLathe(RICE_P, BACK, Math.PI),
      water: sliceLathe(WATER_P, BACK, Math.PI),
      knob: sliceLathe(KNOB_P, 0, Math.PI * 2).wall,
      support: new THREE.CylinderGeometry(0.05, 0.05, 0.21, 16),
      sensor: new THREE.CylinderGeometry(0.16, 0.16, 0.08, 32),
      magnet: new THREE.CylinderGeometry(0.15, 0.15, 0.14, 32),
      spring: springGeometry(0.09, 5, 0.014),
      lever: roundedBox(1.36, 0.05, 0.09, 0.02),
      leverKnob: roundedBox(0.18, 0.13, 0.18, 0.04),
      post: roundedBox(0.09, 0.11, 0.09, 0.02),
      panel: roundedBox(0.56, 0.44, 0.12, 0.05),
      lamp: new THREE.SphereGeometry(0.055, 20, 14),
    }),
    []
  );
}

const Cooker: React.FC<{ t: number }> = ({ t }) => {
  const g = useGeoms();
  // lapis depan: 0 tutup, 1 badan, 2 panci. Dilepas berurutan, dipasang lagi dengan urutan terbalik.
  const k = (i: number) => (t < T.close ? peelK(t, T.peel, i, 16, 6) : 1 - peelK(t, T.close, 2 - i, 14, 5));
  const heat = ip(t, [...T.heat], [0, 1], EIO);
  const dry = ip(t, [...T.dry], [0, 1], EIO);
  const click = ip(t, [...T.click], [0, 1], EO);
  const glow = heat * 0.85 - click * 0.55;

  const riceH = 0.4 * (1 + dry * 0.2);
  const riceTop = 0.5 + riceH;
  const waterTop = 1.28 - dry * (1.28 - 0.98);
  const waterH = Math.max(0, waterTop - riceTop);

  const magY = 0.31 - click * MAG_DROP;
  const springH = Math.max(0.02, magY - 0.07 - 0.09);
  const leverTilt = Math.asin((0.2 - magY) / PIVOT_X);

  return (
    <group>
      {/* setengah belakang: tetap, tepi potongnya berwarna peach */}
      <LMesh geometry={g.shellB.wall} mat="shell" />
      <LMesh geometry={g.shellB.caps} mat="edge" />
      <LMesh geometry={g.potB.wall} mat="grey" />
      <LMesh geometry={g.potB.caps} mat="edge" />
      <LMesh geometry={g.lidB.wall} mat="shellCool" />
      <LMesh geometry={g.lidB.caps} mat="edge" />
      <LMesh geometry={g.knob} mat="dark" />

      {/* isi panci */}
      <group position={[0, 0.5, 0]} scale={[1, riceH / 0.4, 1]}>
        <LMesh geometry={g.rice.wall} mat="cream" glow={0.3} glowColor="#FFFFFF" />
        <LMesh geometry={g.rice.caps} mat="cream" glow={0.3} glowColor="#FFFFFF" />
      </group>
      {waterH > 0.01 ? (
        <group position={[0, riceTop + 0.002, 0]} scale={[1, waterH, 1]}>
          <LMesh geometry={g.water.wall} mat="water" />
          <LMesh geometry={g.water.caps} mat="water" />
        </group>
      ) : null}

      {/* pelat pemanas (oranye) di atas dua penyangga */}
      <LMesh geometry={g.plate.wall} mat="orange" glow={glow} glowColor="#FF3D12" />
      <LMesh geometry={g.plate.caps} mat="orange" glow={glow} glowColor="#FF3D12" />
      {[-0.52, 0.52].map((x) => (
        <LMesh key={x} geometry={g.support} mat="dark" position={[x, 0.195, -0.28]} />
      ))}

      {/* sensor menempel di dasar panci, magnet (kuning) di bawahnya, pegas menarik magnet turun */}
      <LMesh geometry={g.sensor} mat="steel" position={[0, 0.42, 0]} />
      <LMesh geometry={g.magnet} mat="yellow" position={[0, magY, 0]} />
      <LMesh geometry={g.spring} mat="dark" position={[0, 0.09, 0]} scale={[1, springH, 1]} />

      {/* tuas: ujung dalam ikut magnet, ujung luar (tombol merah) naik saat magnet lepas */}
      <LMesh geometry={g.post} mat="dark" position={[PIVOT_X, 0.135, 0.07]} />
      <group position={[PIVOT_X, 0.2, 0.07]} rotation={[0, 0, leverTilt]}>
        <LMesh geometry={g.lever} mat="dark" />
        <LMesh geometry={g.leverKnob} mat="red" position={[0.7, 0.02, 0]} />
      </group>

      {/* lapis depan yang dilepas */}
      <Peel k={k(0)} dir={[0, 1, 0.25]} dist={3.6} tilt={[-0.45, 0, 0]} pivot={[0, 1.7, 0.6]}>
        <LMesh geometry={g.lidF.wall} mat="shellCool" />
        <LMesh geometry={g.lidF.caps} mat="shellCool" />
      </Peel>
      <Peel k={k(1)} dir={[0.1, 1, 0.5]} dist={3.8} tilt={[0.2, 0, 0]} pivot={[0, 0.8, 0.8]}>
        <LMesh geometry={g.shellF.wall} mat="shell" />
        <LMesh geometry={g.shellF.caps} mat="shell" />
        {/* panel depan: lampu masak (oranye) dan hangat (kuning) */}
        <LMesh geometry={g.panel} mat="dark" position={[0, 0.62, 1.19]} />
        <LMesh geometry={g.lamp} mat="orange" position={[-0.13, 0.66, 1.26]} glow={1 - click} castShadow={false} />
        <LMesh geometry={g.lamp} mat="yellow" position={[0.13, 0.66, 1.26]} glow={click} castShadow={false} />
      </Peel>
      <Peel k={k(2)} dir={[-0.1, 1, 0.45]} dist={3.8} pivot={[0, 1, 0.6]}>
        <LMesh geometry={g.potF.wall} mat="grey" />
        <LMesh geometry={g.potF.caps} mat="grey" />
      </Peel>
    </group>
  );
};

/** Kamera melayang: overview -> bagian bawah panci -> magnet -> overview. Tidak pernah diam total. */
function camKeys(isV: boolean): CamKey3D[] {
  const O: Shot = isV ? [3.3, 3.0, 6.6, 0.1, 1.1, 0, 40] : [4.3, 3.2, 8.2, 0, 1.5, 0, 30];
  const Z1: Shot = isV ? [2.0, 1.75, 3.9, 0, 0.72, 0, 40] : [3.0, 2.0, 5.6, 0, 1.05, 0, 30];
  const Z2: Shot = isV ? [1.55, 1.0, 3.45, 0.3, 0.34, 0.05, 36] : [2.1, 1.25, 4.3, 0.3, 0.6, 0, 30];
  return [...driftHold(0, T.zoom1[0], O, 5), ...driftHold(T.zoom1[1], T.move2[0], Z1, 3), ...driftHold(T.move2[1], T.back[0], Z2, 3), ...driftHold(T.back[1], 300, O, 2)];
}

export const Bedah46Scene: React.FC<{ c: Ctx; t: number }> = ({ c, t }) => {
  const { W, H, isV } = c;
  const st = lapisStyle(c.st, BEDAH46_BRAND);
  const cam = useMemo(() => camKeys(isV), [isV]);
  const P = (p: [number, number, number]) => projectToScreen(p, t, cam, W, H);

  const click = ip(t, [...T.click], [0, 1], EO);
  const magY = 0.31 - click * MAG_DROP;
  const heatOn = ip(t, [T.heat[0], T.heat[0] + 6, T.dry[1] - 6, T.dry[1]], [0, 1, 1, 0], (x) => x);
  const clickOn = ip(t, [T.click[0], T.click[0] + 3, T.click[1] + 8, T.click[1] + 16], [0, 1, 1, 0], (x) => x);
  const step = ip(t, [T.dry[0], T.dry[0] + 8], [0, 1], EIO) + ip(t, [T.rise[1] - 8, T.rise[1]], [0, 1], EIO);
  const hot = t < T.rise[0];
  const chev = isV ? 34 : 28;

  const platePt = P([-0.52, 0.37, 0]);
  const magPt = P([0.12, magY, 0.13]);
  const potPt = P([-0.975, 1.15, 0]);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `saturate(${hookSaturation(t, T.hook[0], T.hook[1]).toFixed(3)})` }}>
        <LapisStage width={W} height={H} camera={cam} frame={t} bg={st.palette.bg}>
          <Cooker t={t} />
        </LapisStage>
      </AbsoluteFill>

      {/* chevron searah gerak nyata: panas naik dari pelat, magnet turun */}
      <ChevronTrail from={P([-0.5, 0.52, 0.02])} to={P([-0.5, 0.95, 0.02])} color={LAPIS_CLAY.orange.color} opacity={heatOn} size={chev} />
      <ChevronTrail from={P([0.5, 0.52, 0.02])} to={P([0.5, 0.95, 0.02])} color={LAPIS_CLAY.orange.color} opacity={heatOn} size={chev} />
      <ChevronTrail from={P([0.3, 0.44, 0.16])} to={P([0.3, 0.12, 0.16])} color="#C98A0C" opacity={clickOn} size={chev} speed={1.6} />

      <LapisHook stylePreset={st} text={BEDAH46_HOOK} start={T.hook[0]} end={T.hook[1]} />

      <LapisHeader
        stylePreset={st}
        before="Kok rice cooker"
        keyword="tahu"
        after="nasinya matang?"
        steps={['Pemanas', 'Air habis', 'Magnet lepas']}
        activeStep={step}
        start={0}
        data={<LiveCounter stylePreset={st} from={hot ? 28 : 100} to={hot ? 100 : 103} start={hot ? T.heat[0] : T.rise[0]} end={hot ? T.heat[1] : T.rise[1]} suffix="°C" size={isV ? 60 : 46} />}
        right={
          <span style={{ display: 'inline-flex', gap: 12 }}>
            <StatusBadge stylePreset={st} text="Hangat" variant="solution" start={T.click[1]} size={isV ? 23 : 20} />
            <StatusBadge stylePreset={st} text="Ilustrasi" variant="time" start={6} size={isV ? 23 : 20} />
          </span>
        }
      />

      {/* label dirender setelah header agar tidak tertutup gradien header */}
      <LapisLabel stylePreset={st} anchor={platePt} offset={isV ? [30, 200] : [40, 140]} text="Pelat pemanas" color={LAPIS_CLAY.orange.color} start={T.label1[0]} end={T.label1[1]} />
      <LapisLabel stylePreset={st} anchor={magPt} offset={isV ? [-110, 190] : [-140, 120]} text="Magnet" color={LAPIS_CLAY.yellow.color} start={T.label2[0]} end={T.label2[1]} />

      {/* rekap: semua label tampil bersama di overview */}
      <LapisLabel stylePreset={st} anchor={potPt} offset={isV ? [40, -130] : [-90, -70]} text="Panci" color={LAPIS_CLAY.grey.color} start={T.recap} end={T.close + 4} />
      <LapisLabel stylePreset={st} anchor={platePt} offset={isV ? [-10, 200] : [-140, 110]} text="Pelat pemanas" color={LAPIS_CLAY.orange.color} start={T.recap + 3} end={T.close + 4} />
      <LapisLabel stylePreset={st} anchor={magPt} offset={isV ? [150, 110] : [220, 60]} text="Magnet" color={LAPIS_CLAY.yellow.color} start={T.recap + 6} end={T.close + 4} />
    </AbsoluteFill>
  );
};

/** Narasi sampel: [frame mulai, kalimat, frame per kata (default 10 = 0,33 dtk)]. Baris kedua = kalimat hook pilihan user. */
export const BEDAH46_CAPTION: [number, string, number?][] = [
  [2, 'Kok rice cooker tahu nasinya matang?', 9],
  [56, BEDAH46_HOOK],
  [118, 'Pelat ini memanaskan air.'],
  [158, 'Air habis, suhu naik.'],
  [200, 'Magnet lepas, klik!'],
  [236, 'Otomatis pindah ke hangat.'],
];

/** SFX terikat beat (bukan acak): [frame, nama, volume, durasi]. */
export const BEDAH46_SFX: [number, string, number, number][] = [
  [T.peel, 'transition-swipe', 0.5, 40],
  [T.label1[0], 'pop-in', 0.45, 30],
  [T.heat[1] - 2, 'data-reveal', 0.35, 50],
  [T.label2[0], 'pop-in', 0.45, 30],
  [T.click[0], 'toggle-off', 0.7, 30],
  [T.close, 'transition-whoosh-soft', 0.5, 30],
];
