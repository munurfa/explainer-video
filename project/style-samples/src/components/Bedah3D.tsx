import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useCurrentFrame } from 'remotion';
import { splineAt } from '../theme/easing-and-timing';

/**
 * Bedah3D.tsx: panggung objek 3D untuk Gaya #44 (Kita Bedah).
 *
 * Objek hero di gaya #44 WAJIB tampil sebagai render 3D yang mendekati objek aslinya
 * (lihat references/styles/44-kita-bedah.md §4). Komponen ini memberi:
 *   - <BedahStage />    : ThreeCanvas + rig cahaya studio + kamera perspektif spline C1 + set (lantai/dinding)
 *   - BEDAH_MATERIALS   : preset material PBR (kuningan, besi cor ber-epoxy, PVC, baja, karet, air, kain, ...)
 *   - <BMesh />         : mesh + material preset + outline tipis (inverted hull) + dukungan cutaway
 *   - useCutPlane()     : bidang potong (clipping plane) yang dianimasikan; sisi dalam yang terpotong
 *                         otomatis diwarnai CUT_CAP (salmon), seperti penampang di referensi
 *   - projectToScreen() : titik 3D -> koordinat layar untuk <CalloutPill anchor={...} />
 *
 * Dependensi (versi harus sama dengan remotion):
 *   npm i @remotion/three@<versi-remotion> three@0.169.0 @react-three/fiber@8.17.10 @types/three@0.169.0
 * Render di Windows/headless: chromiumOptions: { gl: 'angle' } (CLI: --gl=angle).
 */

/* ------------------------------------------------------------------ */
/* Material                                                            */
/* ------------------------------------------------------------------ */
export interface MatSpec {
  color: string;
  metalness?: number;
  roughness?: number;
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
}

/** Preset PBR. Angka metalness/roughness meniru bahan asli, jangan diganti warna flat. */
export const BEDAH_MATERIALS = {
  brass: { color: '#D4A62A', metalness: 0.85, roughness: 0.3 },
  brassDark: { color: '#A87C16', metalness: 0.85, roughness: 0.38 },
  castIronBlue: { color: '#2456B4', metalness: 0.15, roughness: 0.5 }, // katup/fitting besi cor dilapis epoxy biru
  castIronBlack: { color: '#2A2D33', metalness: 0.3, roughness: 0.6 },
  steel: { color: '#C3CAD2', metalness: 0.9, roughness: 0.25 },
  galvanized: { color: '#A9B1B9', metalness: 0.75, roughness: 0.42 },
  pvcGrey: { color: '#9CA6B0', metalness: 0, roughness: 0.45 },
  pvcWhite: { color: '#EEF0F2', metalness: 0, roughness: 0.4 },
  hdpeBlack: { color: '#24272C', metalness: 0, roughness: 0.55 },
  hdpeBlue: { color: '#1E5AA8', metalness: 0, roughness: 0.5 },
  rubber: { color: '#1C1E22', metalness: 0, roughness: 0.9 },
  plasticGloss: { color: '#F4F4F2', metalness: 0, roughness: 0.22 },
  plasticRed: { color: '#D1432B', metalness: 0, roughness: 0.3 },
  glass: { color: '#DDEFF8', metalness: 0, roughness: 0.05, opacity: 0.28 },
  water: { color: '#3D8FDB', metalness: 0, roughness: 0.08, opacity: 0.62 },
  fabricNylon: { color: '#2350B8', metalness: 0, roughness: 0.75 },
  concrete: { color: '#C9C7C1', metalness: 0, roughness: 0.95 },
  plaster: { color: '#E7E2D8', metalness: 0, roughness: 0.95 },
  soil: { color: '#B79C78', metalness: 0, roughness: 1 },
} satisfies Record<string, MatSpec>;
export type MatKey = keyof typeof BEDAH_MATERIALS;

/** Warna permukaan potong (cutaway). Satu warna flat tanpa shading. */
export const CUT_CAP = '#EE9A72';
/** Warna outline objek: tipis, hampir hitam (bukan ink tebal 4px seperti versi SVG lama). */
export const OUTLINE = '#1D2129';

const matCache = new Map<string, THREE.Material>();

function makeMaterial(spec: MatSpec, cut: boolean): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({
    color: spec.color,
    metalness: spec.metalness ?? 0,
    roughness: spec.roughness ?? 0.5,
    transparent: spec.opacity !== undefined,
    opacity: spec.opacity ?? 1,
    emissive: spec.emissive ?? '#000000',
    emissiveIntensity: spec.emissiveIntensity ?? 0,
    side: cut ? THREE.DoubleSide : THREE.FrontSide,
    envMapIntensity: 1,
  });
  if (cut) {
    // nilai sRGB langsung (fragmen ini ditulis setelah tone mapping & konversi warna)
    const hex = parseInt(CUT_CAP.slice(1), 16);
    const c = { r: ((hex >> 16) & 255) / 255, g: ((hex >> 8) & 255) / 255, b: (hex & 255) / 255 };
    // Sisi belakang yang terlihat lewat bidang potong = "daging" benda -> warna potong flat
    m.onBeforeCompile = (s) => {
      s.fragmentShader = s.fragmentShader.replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
         if (!gl_FrontFacing) { gl_FragColor = vec4(${c.r.toFixed(3)}, ${c.g.toFixed(3)}, ${c.b.toFixed(3)}, 1.0); }`
      );
    };
    m.customProgramCacheKey = () => 'bedah-cut';
  }
  return m;
}

function getMaterial(spec: MatSpec, cut: boolean) {
  const key = JSON.stringify(spec) + (cut ? '|cut' : '');
  let m = matCache.get(key);
  if (!m) {
    m = makeMaterial(spec, cut);
    matCache.set(key, m);
  }
  return m as THREE.MeshStandardMaterial;
}

const OUTLINE_VS = `
uniform float uThick;
#include <clipping_planes_pars_vertex>
void main() {
  vec3 transformed = position + normal * uThick;
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <clipping_planes_vertex>
}`;
const OUTLINE_FS = `
uniform vec3 uColor;
#include <clipping_planes_pars_fragment>
void main() {
  #include <clipping_planes_fragment>
  gl_FragColor = vec4(uColor, 1.0);
}`;

function makeOutline(thick: number) {
  return new THREE.ShaderMaterial({
    uniforms: { uThick: { value: thick }, uColor: { value: new THREE.Color(OUTLINE) } },
    vertexShader: OUTLINE_VS,
    fragmentShader: OUTLINE_FS,
    side: THREE.BackSide,
    clipping: true,
  });
}

/* ------------------------------------------------------------------ */
/* Cutaway                                                             */
/* ------------------------------------------------------------------ */
/**
 * Bidang potong. `normal` menunjuk ke sisi yang DIPERTAHANKAN.
 * `constant` dianimasikan: mulai di luar objek (tidak memotong) -> 0 (terbelah di tengah).
 * Contoh: potong setengah depan (z > 0) -> normal [0,0,-1], constant dari 1.5 ke 0.
 */
export function useCutPlane(normal: [number, number, number], constant: number) {
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(...normal).normalize(), constant), [normal[0], normal[1], normal[2]]);
  plane.constant = constant;
  return plane;
}

/* ------------------------------------------------------------------ */
/* Mesh                                                                */
/* ------------------------------------------------------------------ */
export interface BMeshProps {
  geometry: THREE.BufferGeometry;
  mat: MatKey | MatSpec;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  /** Tebal outline (unit dunia). 0 = tanpa outline. Default 0.012 */
  outline?: number;
  /** Bidang potong yang berlaku untuk mesh ini */
  cut?: THREE.Plane[];
  castShadow?: boolean;
  receiveShadow?: boolean;
  visible?: boolean;
}

export const BMesh: React.FC<BMeshProps> = ({
  geometry,
  mat,
  position,
  rotation,
  scale,
  outline = 0.012,
  cut,
  castShadow = true,
  receiveShadow = true,
  visible = true,
}) => {
  const spec: MatSpec = typeof mat === 'string' ? BEDAH_MATERIALS[mat] : mat;
  const hasCut = !!cut && cut.length > 0;
  const material = getMaterial(spec, hasCut);
  material.clippingPlanes = hasCut ? cut! : null;
  const outlineMat = useMemo(() => (outline > 0 ? makeOutline(outline) : null), [outline]);
  if (outlineMat) outlineMat.clippingPlanes = hasCut ? cut! : null;
  return (
    <group position={position} rotation={rotation} scale={scale} visible={visible}>
      <mesh geometry={geometry} material={material} castShadow={castShadow} receiveShadow={receiveShadow} />
      {outlineMat && spec.opacity === undefined ? <mesh geometry={geometry} material={outlineMat} /> : null}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Geometri bantu (anatomi benda nyata)                                */
/* ------------------------------------------------------------------ */
/** Pipa berdinding tebal (solid tertutup) sepanjang sumbu X, pusat di origin. Cocok untuk cutaway. */
export function pipeGeometry(rOut: number, rIn: number, length: number, segs = 72) {
  const s = new THREE.Shape();
  s.absarc(0, 0, rOut, 0, Math.PI * 2, false);
  const h = new THREE.Path();
  h.absarc(0, 0, rIn, 0, Math.PI * 2, true);
  s.holes.push(h);
  const g = new THREE.ExtrudeGeometry(s, { depth: length, bevelEnabled: false, curveSegments: segs });
  g.translate(0, 0, -length / 2);
  g.rotateY(Math.PI / 2);
  return g;
}

/** Benda putar (lathe) dari profil [radius, tinggi], sumbu Y. */
export function latheGeometry(profile: [number, number][], segs = 72) {
  return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segs);
}

/** Baut/mur heksagonal (sumbu Y). */
export function hexBoltGeometry(r = 0.06, h = 0.08) {
  return new THREE.CylinderGeometry(r, r, h, 6);
}

/* ------------------------------------------------------------------ */
/* Kamera                                                              */
/* ------------------------------------------------------------------ */
/** Waypoint kamera 3D: [frame, posX, posY, posZ, targetX, targetY, targetZ, fov] (diinterpolasi splineAt C1). */
export type CamKey3D = [number, number, number, number, number, number, number, number];

export function cameraAt(frame: number, keys: CamKey3D[]) {
  const [px, py, pz, tx, ty, tz, fov] = splineAt<[number, number, number, number, number, number, number]>(frame, keys);
  return { pos: [px, py, pz] as [number, number, number], target: [tx, ty, tz] as [number, number, number], fov };
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

/** Titik 3D -> piksel layar (untuk CalloutPill). Pakai frame + keys yang sama dengan <BedahStage />. */
export function projectToScreen(p: [number, number, number], frame: number, keys: CamKey3D[], W: number, H: number): [number, number] {
  const { pos, target, fov } = cameraAt(frame, keys);
  const cam = new THREE.PerspectiveCamera(fov, W / H, 0.1, 200);
  cam.position.set(...pos);
  cam.lookAt(...target);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H];
}

/* ------------------------------------------------------------------ */
/* Panggung                                                            */
/* ------------------------------------------------------------------ */
export interface BedahStageProps {
  width: number;
  height: number;
  camera: CamKey3D[];
  /** Frame lokal untuk kamera (default useCurrentFrame()) */
  frame?: number;
  /** Warna latar = palette.bg; kabut memudar ke warna ini (kedalaman seperti referensi) */
  bg: string;
  /** Set lingkungan: lantai beton + dinding plester berbintik */
  set?: 'floor-wall' | 'floor' | 'none';
  floorMat?: MatKey;
  wallMat?: MatKey;
  wallZ?: number;
  children: React.ReactNode;
}

function speckleTexture(base: string, seed = 7) {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = base;
  g.fillRect(0, 0, size, size);
  let a = seed;
  const r = () => ((a = (a * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 90; i++) {
    g.fillStyle = `rgba(60,60,60,${0.1 + r() * 0.18})`;
    g.beginPath();
    g.arc(r() * size, r() * size, 1.5 + r() * 3.5, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 6);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const SetPieces: React.FC<{ set: BedahStageProps['set']; floorMat: MatKey; wallMat: MatKey; wallZ: number }> = ({ set, floorMat, wallMat, wallZ }) => {
  const floorTex = useMemo(() => speckleTexture(BEDAH_MATERIALS[floorMat].color, 11), [floorMat]);
  const wallTex = useMemo(() => speckleTexture(BEDAH_MATERIALS[wallMat].color, 29), [wallMat]);
  if (set === 'none') return null;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial map={floorTex} roughness={0.95} />
      </mesh>
      {set === 'floor-wall' ? (
        <>
          <mesh position={[0, 6, wallZ]} receiveShadow>
            <planeGeometry args={[80, 12]} />
            <meshStandardMaterial map={wallTex} roughness={0.95} />
          </mesh>
          {/* plint / kanstin di kaki dinding */}
          <mesh position={[0, 0.18, wallZ + 0.15]} receiveShadow castShadow>
            <boxGeometry args={[80, 0.36, 0.3]} />
            <meshStandardMaterial color="#B5B2AB" roughness={0.9} />
          </mesh>
        </>
      ) : null}
    </group>
  );
};

export const BedahStage: React.FC<BedahStageProps> = ({
  width,
  height,
  camera,
  frame,
  bg,
  set = 'floor-wall',
  floorMat = 'concrete',
  wallMat = 'plaster',
  wallZ = -3,
  children,
}) => {
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
      onCreated={({ gl, scene }) => {
        gl.localClippingEnabled = true;
        // pantulan studio supaya logam (kuningan, baja) tampil berkilau, bukan hitam
        const pmrem = new THREE.PMREMGenerator(gl);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 14, 34]} />
      <CameraDriver keys={camera} frame={f} />
      {/* Rig cahaya studio: langit/tanah lembut + key light berbayang + rim dingin */}
      <hemisphereLight args={['#FFFFFF', '#B9B2A4', 1.15]} />
      <directionalLight
        position={[5, 9, 7]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.55} color="#DCE8FF" />
      <SetPieces set={set} floorMat={floorMat} wallMat={wallMat} wallZ={wallZ} />
      {children}
    </ThreeCanvas>
  );
};
