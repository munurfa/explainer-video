import React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame } from 'remotion';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { cameraAt, CamKey3D, MatSpec } from './Bedah3D';

/**
 * Lapis3D.tsx: panggung objek 3D untuk Gaya #46 (Bedah Lapis).
 *
 * Beda dengan Bedah3D (#44):
 *   - tampilan clay: warna pastel matte, TANPA outline, bayangan lembut, lantai menyatu dengan latar
 *   - objek dibuka dengan MELEPAS LAPIS (panel/cangkang terangkat satu per satu), bukan bidang potong
 *   - kamera selalu melayang pelan (driftHold), tidak pernah diam total
 *
 * Isi:
 *   - <LapisStage />  : ThreeCanvas + cahaya lembut + lantai penangkap bayangan + kamera spline C1
 *   - LAPIS_CLAY      : preset warna clay (cangkang netral, tepi potong peach, warna bagian jenuh)
 *   - <LMesh />       : mesh clay tanpa outline (opsi glow untuk bagian yang memanas/menyala)
 *   - <Peel />        : pembungkus panel yang dilepas; peelK() untuk jadwal berurutan
 *   - sliceLathe()    : benda putar setengah (atau sebagian) + tutup tepi potong
 *   - roundedBox()    : kotak bersudut bulat
 *   - driftHold() / orbitShot() / camKey() : waypoint kamera yang melayang pelan
 *
 * Kamera, proyeksi, dan geometri bantu lain dipakai ulang dari Bedah3D.
 * Dependensi sama dengan #44: @remotion/three, three@0.169.0, @react-three/fiber@8.17.10. Render: --gl=angle.
 */

export { cameraAt, hexBoltGeometry, latheGeometry, pipeGeometry, projectToScreen } from './Bedah3D';
export type { CamKey3D, MatSpec } from './Bedah3D';

/* ------------------------------------------------------------------ */
/* Material clay                                                       */
/* ------------------------------------------------------------------ */
/**
 * Warna clay. Cangkang dan rangka netral, warna jenuh HANYA untuk bagian yang dijelaskan.
 * Satu bagian = satu warna, dan warna itu dipakai lagi di titik label bagian tersebut.
 */
export const LAPIS_CLAY = {
  shell: { color: '#F4F1EB', roughness: 0.95 },
  shellCool: { color: '#E6EAF0', roughness: 0.95 },
  edge: { color: '#F5C9A9', roughness: 0.95 }, // tepi potong setelah lapis dilepas
  dark: { color: '#272C37', roughness: 0.8 },
  grey: { color: '#BFC6D0', roughness: 0.85 },
  steel: { color: '#CBD1DA', metalness: 0.55, roughness: 0.38 },
  blue: { color: '#4E9BE6', roughness: 0.8 },
  yellow: { color: '#F4B63C', roughness: 0.8 },
  orange: { color: '#EE7B3A', roughness: 0.8 },
  mint: { color: '#6FDBB3', roughness: 0.8 },
  red: { color: '#E2604C', roughness: 0.8 },
  cream: { color: '#FBF7EC', roughness: 1 },
  glass: { color: '#A9CDEE', roughness: 0.2, opacity: 0.5 },
  water: { color: '#6DBBF0', roughness: 0.15, opacity: 0.62 },
} satisfies Record<string, MatSpec>;
export type ClayKey = keyof typeof LAPIS_CLAY;

const clayCache = new Map<string, THREE.MeshStandardMaterial>();

function clayMaterial(spec: MatSpec) {
  const key = JSON.stringify(spec);
  let m = clayCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color: spec.color,
      metalness: spec.metalness ?? 0,
      roughness: spec.roughness ?? 0.85,
      transparent: spec.opacity !== undefined,
      opacity: spec.opacity ?? 1,
      depthWrite: spec.opacity === undefined,
      emissive: spec.emissive ?? '#000000',
      emissiveIntensity: spec.emissiveIntensity ?? 0,
      side: THREE.DoubleSide,
    });
    clayCache.set(key, m);
  }
  return m;
}

export interface LMeshProps {
  geometry: THREE.BufferGeometry;
  mat: ClayKey | MatSpec;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  visible?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  /** 0..1: bagian menyala/memanas (emissive memakai warna `glowColor` atau warna bahannya) */
  glow?: number;
  glowColor?: string;
}

/** Mesh clay tanpa outline. Benda transparan tidak melempar bayangan. */
export const LMesh: React.FC<LMeshProps> = ({ geometry, mat, position, rotation, scale, visible = true, castShadow, receiveShadow = true, glow = 0, glowColor }) => {
  const base: MatSpec = typeof mat === 'string' ? LAPIS_CLAY[mat] : mat;
  const g = Math.round(Math.min(1, Math.max(0, glow)) * 20) / 20;
  const spec: MatSpec = g > 0 ? { ...base, emissive: glowColor ?? base.color, emissiveIntensity: g } : base;
  const material = clayMaterial(spec);
  const cast = castShadow ?? base.opacity === undefined;
  return <mesh geometry={geometry} material={material} position={position} rotation={rotation} scale={scale} visible={visible} castShadow={cast} receiveShadow={receiveShadow} />;
};

/* ------------------------------------------------------------------ */
/* Lepas lapis (peel)                                                  */
/* ------------------------------------------------------------------ */
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/**
 * Jadwal lepas berurutan: panel ke-i mulai `gap` frame setelah panel sebelumnya dan bergerak selama `each` frame.
 * Untuk memasang kembali di akhir video: `1 - peelK(t, startTutup, urutanTerbalik)`.
 */
export const peelK = (t: number, start: number, i = 0, each = 18, gap = 7) => clamp01((t - (start + i * gap)) / each);

export interface PeelProps {
  /** 0 = terpasang, 1 = terlepas penuh (hilang) */
  k: number;
  /** Arah lepas (vektor dunia). Panel depan: [0,0.35,1]; tutup/atap: [0,1,0.2] */
  dir: [number, number, number];
  /** Jarak tempuh (unit dunia) sampai panel keluar dari bingkai */
  dist?: number;
  /** Rotasi tambahan saat terlepas (radian), memberi kesan panel "diangkat" */
  tilt?: [number, number, number];
  /** Titik pusat panel: panel mengecil ke titik ini di akhir gerak */
  pivot?: [number, number, number];
  children: React.ReactNode;
}

/** Panel/cangkang yang dilepas: bergeser searah `dir`, sedikit miring, lalu mengecil habis di 25% terakhir. */
export const Peel: React.FC<PeelProps> = ({ k, dir, dist = 4, tilt = [0, 0, 0], pivot = [0, 0, 0], children }) => {
  const e = easeIO(clamp01(k));
  if (e >= 0.999) return null;
  const s = 1 - clamp01((e - 0.75) / 0.25);
  const sc = Math.max(0.001, s * s * (3 - 2 * s));
  return (
    <group position={[pivot[0] + dir[0] * dist * e, pivot[1] + dir[1] * dist * e, pivot[2] + dir[2] * dist * e]} rotation={[tilt[0] * e, tilt[1] * e, tilt[2] * e]} scale={sc}>
      <group position={[-pivot[0], -pivot[1], -pivot[2]]}>{children}</group>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Geometri bantu                                                      */
/* ------------------------------------------------------------------ */
/**
 * Benda putar sebagian. `profile` = garis luar TERTUTUP [radius, tinggi] (dinding punya tebal).
 * Sudut phi: x = r sin(phi), z = r cos(phi). Setengah belakang (z <= 0): phiStart = PI/2, phiLength = PI.
 * Hasil: `wall` (permukaan putar) dan `caps` (dua tepi potong, beri bahan `edge`).
 */
export function sliceLathe(profile: [number, number][], phiStart: number, phiLength: number, segs = 72) {
  const pts = profile.map(([r, y]) => new THREE.Vector2(r, y));
  const closed = [...pts, pts[0].clone()];
  const wall = new THREE.LatheGeometry(closed, Math.max(8, Math.round((segs * phiLength) / (Math.PI * 2))), phiStart, phiLength);
  const shape = new THREE.Shape(pts);
  const capA = new THREE.ShapeGeometry(shape);
  capA.rotateY(phiStart - Math.PI / 2);
  const capB = new THREE.ShapeGeometry(shape);
  capB.rotateY(phiStart + phiLength - Math.PI / 2);
  const caps = mergeGeometries([capA, capB]) as THREE.BufferGeometry;
  return { wall, caps };
}

/** Kotak bersudut bulat (sudut tajam tidak cocok dengan tampilan clay). */
export function roundedBox(w: number, h: number, d: number, r = 0.04, segs = 4) {
  return new RoundedBoxGeometry(w, h, d, segs, Math.min(r, w / 2, h / 2, d / 2));
}

/** Pegas ulir sepanjang sumbu Y, tinggi 1 (atur tinggi lewat scale Y). */
export function springGeometry(radius = 0.09, turns = 5, wire = 0.014) {
  const pts: THREE.Vector3[] = [];
  const n = turns * 24;
  for (let i = 0; i <= n; i++) {
    const a = (i / 24) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, i / n, Math.sin(a) * radius));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, wire, 8, false);
}

/* ------------------------------------------------------------------ */
/* Kamera melayang                                                     */
/* ------------------------------------------------------------------ */
/** Bidikan kamera tanpa frame: [px, py, pz, tx, ty, tz, fov]. */
export type Shot = [number, number, number, number, number, number, number];

export const camKey = (frame: number, shot: Shot) => [frame, ...shot] as CamKey3D;

/** Putar posisi kamera mengelilingi target (sumbu Y) sebesar `deg`, naik `lift` unit. */
export function orbitShot(shot: Shot, deg: number, lift = 0): Shot {
  const [px, py, pz, tx, ty, tz, fov] = shot;
  const a = (deg * Math.PI) / 180;
  const dx = px - tx;
  const dz = pz - tz;
  return [tx + dx * Math.cos(a) + dz * Math.sin(a), py + lift, tz - dx * Math.sin(a) + dz * Math.cos(a), tx, ty, tz, fov];
}

/**
 * Tahan bidikan sambil melayang pelan dari frame `from` sampai `to` (orbit `deg` derajat, default 3).
 * Dua key yang BERBEDA membuat spline tetap bergerak halus; kamera tidak pernah diam total.
 * Batas: maks 6 derajat per tahan, tanpa getar.
 */
export function driftHold(from: number, to: number, shot: Shot, deg = 3, lift = 0): CamKey3D[] {
  return [camKey(from, shot), camKey(to, orbitShot(shot, deg, lift))];
}

const CameraDriver: React.FC<{ keys: CamKey3D[]; frame: number }> = ({ keys, frame }) => {
  const { camera } = useThree();
  const { pos, target, fov } = cameraAt(frame, keys);
  camera.position.set(...pos);
  (camera as THREE.PerspectiveCamera).fov = fov;
  camera.lookAt(...target);
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
};

/* ------------------------------------------------------------------ */
/* Panggung                                                            */
/* ------------------------------------------------------------------ */
export interface LapisStageProps {
  width: number;
  height: number;
  camera: CamKey3D[];
  /** Frame lokal untuk kamera (default useCurrentFrame()) */
  frame?: number;
  /** Warna latar = palette.bg. Lantai hanya menangkap bayangan, jadi menyatu dengan latar */
  bg: string;
  /** Pekat bayangan di lantai (0..1) */
  shadowOpacity?: number;
  /** Setengah lebar area bayangan (unit dunia). Perbesar untuk objek besar */
  shadowSpan?: number;
  children: React.ReactNode;
}

export const LapisStage: React.FC<LapisStageProps> = ({ width, height, camera, frame, bg, shadowOpacity = 0.16, shadowSpan = 7, children }) => {
  const cur = useCurrentFrame();
  const f = frame ?? cur;
  const c0 = cameraAt(f, camera);
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows
      camera={{ fov: c0.fov, position: c0.pos, near: 0.1, far: 200 }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        // Tanpa tone mapping filmik: warna pastel tampil sesuai hex-nya, tidak menggelap atau pudar.
        gl.toneMapping = THREE.NoToneMapping;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <color attach="background" args={[bg]} />
      <CameraDriver keys={camera} frame={f} />
      {/* Cahaya clay: langit sangat terang (bayangan tetap cerah) + satu key lembut + fill dingin */}
      <hemisphereLight args={['#FFFFFF', '#E9E1D4', 2.05]} />
      <directionalLight
        position={[4.5, 10, 6]}
        intensity={1.05}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-shadowSpan}
        shadow-camera-right={shadowSpan}
        shadow-camera-top={shadowSpan}
        shadow-camera-bottom={-shadowSpan}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-radius={10}
      />
      <directionalLight position={[-6, 4, -3]} intensity={0.22} color="#E3ECFF" />
      {/* Lantai tak terlihat: hanya bayangan lembut yang jatuh di atas warna latar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <shadowMaterial transparent opacity={shadowOpacity} color="#6B5E4B" />
      </mesh>
      {children}
    </ThreeCanvas>
  );
};
