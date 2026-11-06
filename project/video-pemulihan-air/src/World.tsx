import React from 'react';
import { ip, easeInOutSmooth, easeOutExpo, createSeededRandom } from './antislop/theme/easing-and-timing';
import {
  AIR_VALVE,
  COUPLING,
  DIST,
  GATE,
  GAUGE,
  HUMP_DIST,
  INTERIOR,
  MAIN,
  MAIN_LEN,
  Pt,
  SINK_Y,
  TAP,
  pathD,
  pointAtDist,
  polyLen,
} from './geometry';

export const INK = '#16243B';
const WATER = '#3E8FDB';
const WATER_DEEP = '#244DA9';
const WATER_LIGHT = '#9BD5EF';
const PIPE_EMPTY = '#E3E8EE';
const GRASS = '#A9D18E';
const GRASS_DARK = '#8CBB6F';
const SOIL = '#DCCBA6';
const SOIL_DARK = '#C4AE84';
const METAL = '#A7B2BE';
const METAL_DARK = '#7D8995';

/* ---------------- status air per frame ---------------- */
type Seg = [number, number];
const DIST_SPAN = 470;
const INTERIOR_LEN = polyLen(INTERIOR);

export function mainSeg(f: number): Seg {
  if (f < 545) return [0, MAIN_LEN];
  if (f < 640) return [ip(f, [545, 602], [0, MAIN_LEN], easeInOutSmooth), MAIN_LEN];
  return [0, ip(f, [640, 722], [0, MAIN_LEN], easeInOutSmooth)];
}
function distSeg(f: number, L: number): Seg {
  if (f < 545) return [0, L];
  if (f < 640) return [Math.min(L, ip(f, [555, 612], [0, DIST_SPAN], easeInOutSmooth)), L];
  return [0, Math.min(L, ip(f, [722, 806], [0, DIST_SPAN], easeInOutSmooth))];
}
function interiorSeg(f: number): Seg {
  if (f < 545) return [0, INTERIOR_LEN];
  if (f < 640) return [ip(f, [600, 625], [0, INTERIOR_LEN]), INTERIOR_LEN];
  return [0, ip(f, [1148, 1172], [0, INTERIOR_LEN])];
}
export function pressureAt(f: number): number {
  if (f < 190) return 0.04;
  if (f < 545) return ip(f, [190, 214], [0.04, 0.78]);
  if (f < 1090) return ip(f, [545, 605], [0.78, 0], easeInOutSmooth);
  return ip(f, [1090, 1150], [0, 0.78], easeOutExpo);
}
const flowOn = (f: number, startAfterRepair: number) =>
  f < 600 ? ip(f, [212, 232], [0, 1]) * ip(f, [528, 545], [1, 0]) : ip(f, [startAfterRepair, startAfterRepair + 20], [0, 1]);

/* ---------------- pipa ---------------- */
const Pipe: React.FC<{ pts: Pt[]; w: number; seg: Seg; flow: number; frame: number; waterOpacity: number }> = ({
  pts,
  w,
  seg,
  flow,
  frame,
  waterOpacity,
}) => {
  const d = pathD(pts);
  const L = polyLen(pts);
  const [a, b] = seg;
  const len = Math.max(0, b - a);
  return (
    <g fill="none" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w + 8} strokeLinecap="round" />
      <path d={d} stroke={PIPE_EMPTY} strokeWidth={w} strokeLinecap="round" />
      {len > 0.5 ? (
        <path
          d={d}
          stroke={WATER}
          strokeWidth={w - 5}
          strokeLinecap="round"
          strokeDasharray={`0 ${a.toFixed(2)} ${len.toFixed(2)} ${(L * 2).toFixed(2)}`}
          opacity={waterOpacity}
        />
      ) : null}
      {flow > 0.01 ? (
        <path
          d={d}
          stroke={WATER_LIGHT}
          strokeWidth={Math.max(2, w * 0.2)}
          strokeLinecap="round"
          strokeDasharray="9 27"
          strokeDashoffset={-frame * 2.4}
          opacity={flow * 0.9 * waterOpacity}
        />
      ) : null}
      {/* kilau atas pipa (nada terang) */}
      <path d={d} stroke="#FFFFFF" strokeWidth={Math.max(1.5, w * 0.12)} opacity={0.35} transform={`translate(0,${-w * 0.28})`} />
    </g>
  );
};

/* ---------------- objek ---------------- */
const Reservoir: React.FC<{ frame: number }> = ({ frame }) => {
  const wave = Math.sin(frame / 14) * 2.2;
  return (
    <g>
      <rect x={84} y={612} width={176} height={14} rx={4} fill={METAL_DARK} stroke={INK} strokeWidth={3} />
      <path d="M96,520 L248,520 L248,612 L96,612 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <rect x={210} y={520} width={38} height={92} fill="#E6E9EE" />
      <path d="M88,520 L172,486 L256,520 Z" fill={WATER_DEEP} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <defs>
        <linearGradient id="tankWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={WATER_LIGHT} />
          <stop offset="1" stopColor={WATER_DEEP} />
        </linearGradient>
      </defs>
      <rect x={110} y={536} width={124} height={62} rx={6} fill="#EAF2F8" stroke={INK} strokeWidth={3} />
      <path
        d={`M112,${552 + wave} Q142,${546 - wave} 172,${552 + wave} T232,${552 + wave} L232,596 L112,596 Z`}
        fill="url(#tankWater)"
      />
      {/* tangga */}
      <path d="M100,612 L100,526 M112,612 L112,612" stroke={INK} strokeWidth={3} />
      {[540, 560, 580, 600].map((y) => (
        <line key={y} x1={92} y1={y} x2={104} y2={y} stroke={INK} strokeWidth={3} />
      ))}
      <line x1={92} y1={526} x2={92} y2={612} stroke={INK} strokeWidth={3} />
    </g>
  );
};

const GateValve: React.FC<{ frame: number }> = ({ frame }) => {
  const [x, y] = GATE;
  const closing = ip(frame, [538, 562], [0, 1], easeInOutSmooth);
  const opening = ip(frame, [632, 664], [0, 1], easeInOutSmooth);
  const closed = frame < 600 ? closing : 1 - opening;
  const rot = closed * 540;
  const stemUp = (1 - closed) * 12; // gate valve batang naik: makin tinggi = makin terbuka
  return (
    <g>
      <path
        d={`M${x - 20},${y - 16} L${x + 20},${y - 16} L${x + 24},${y} L${x + 20},${y + 16} L${x - 20},${y + 16} L${x - 24},${y} Z`}
        fill={WATER_DEEP}
        stroke={INK}
        strokeWidth={3.5}
        strokeLinejoin="round"
      />
      <rect x={x - 9} y={y - 40} width={18} height={24} fill={WATER_DEEP} stroke={INK} strokeWidth={3} />
      <rect x={x - 3} y={y - 54 - stemUp} width={6} height={16 + stemUp} fill={METAL} stroke={INK} strokeWidth={2} />
      <g transform={`translate(${x},${y - 56 - stemUp}) scale(1,0.42) rotate(${rot})`}>
        <circle r={22} fill="none" stroke={INK} strokeWidth={9} />
        <circle r={22} fill="none" stroke="#D1432B" strokeWidth={5} />
        {[0, 90, 180, 270].map((a) => (
          <line key={a} x1={0} y1={0} x2={20 * Math.cos((a * Math.PI) / 180)} y2={20 * Math.sin((a * Math.PI) / 180)} stroke={INK} strokeWidth={4} />
        ))}
      </g>
    </g>
  );
};

const CouplingPit: React.FC = () => {
  const [x, y] = COUPLING;
  return (
    <g>
      <ellipse cx={x - 6} cy={y + 30} rx={58} ry={20} fill="#8A6440" stroke={INK} strokeWidth={3} />
      <path d={`M${x + 30},${y + 34} q16,-26 38,-4 q8,10 -4,14 z`} fill="#B98A5E" stroke={INK} strokeWidth={3} />
    </g>
  );
};

const Coupling: React.FC = () => {
  const [x, y] = COUPLING;
  return (
    <g>
      <g transform={`translate(${x},${y}) rotate(62)`}>
        <rect x={-19} y={-17} width={38} height={34} rx={4} fill={METAL} stroke={INK} strokeWidth={3} />
        <rect x={-19} y={-17} width={10} height={34} fill={METAL_DARK} />
        <rect x={-19} y={-17} width={38} height={34} rx={4} fill="none" stroke={INK} strokeWidth={3} />
        {[-11, 11].map((bx) => (
          <g key={bx}>
            <circle cx={bx} cy={-21} r={4} fill={METAL_DARK} stroke={INK} strokeWidth={2} />
            <circle cx={bx} cy={21} r={4} fill={METAL_DARK} stroke={INK} strokeWidth={2} />
          </g>
        ))}
      </g>
    </g>
  );
};

const AirValve: React.FC = () => {
  const [x, y] = AIR_VALVE;
  return (
    <g>
      <rect x={x - 4} y={y - 36} width={8} height={28} fill={METAL} stroke={INK} strokeWidth={2.5} />
      <path d={`M${x - 14},${y - 64} L${x + 14},${y - 64} L${x + 12},${y - 36} L${x - 12},${y - 36} Z`} fill={WATER_DEEP} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <rect x={x - 17} y={y - 72} width={34} height={9} rx={3} fill={METAL_DARK} stroke={INK} strokeWidth={2.5} />
      <rect x={x - 5} y={y - 79} width={10} height={8} rx={2} fill={METAL} stroke={INK} strokeWidth={2} />
    </g>
  );
};

const Gauge: React.FC<{ frame: number }> = ({ frame }) => {
  const [x, y] = GAUGE;
  const p = pressureAt(frame);
  const a = (-225 + p * 270) * (Math.PI / 180);
  const r = 30;
  const ticks = Array.from({ length: 11 }, (_, i) => -225 + i * 27);
  return (
    <g>
      <rect x={x - 4} y={1360} width={8} height={y - r - 1360 + 2} fill={METAL} stroke={INK} strokeWidth={2.5} />
      <circle cx={x} cy={y} r={r + 5} fill={METAL_DARK} stroke={INK} strokeWidth={3.5} />
      <circle cx={x} cy={y} r={r} fill="#FFFFFF" />
      {/* zona hijau (tekanan normal) */}
      <path
        d={describeArc(x, y, r - 4, -225 + 0.62 * 270, -225 + 0.92 * 270)}
        fill="none"
        stroke="#1D7A32"
        strokeWidth={4}
      />
      {ticks.map((t, i) => {
        const ta = (t * Math.PI) / 180;
        const r1 = i % 5 === 0 ? r - 9 : r - 6;
        return (
          <line
            key={t}
            x1={x + r1 * Math.cos(ta)}
            y1={y + r1 * Math.sin(ta)}
            x2={x + (r - 2) * Math.cos(ta)}
            y2={y + (r - 2) * Math.sin(ta)}
            stroke={INK}
            strokeWidth={i % 5 === 0 ? 2 : 1.2}
          />
        );
      })}
      <line x1={x} y1={y} x2={x + (r - 8) * Math.cos(a)} y2={y + (r - 8) * Math.sin(a)} stroke="#D1432B" strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={x} cy={y} r={3.2} fill={INK} />
    </g>
  );
};

function describeArc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = [cx + r * Math.cos((a0 * Math.PI) / 180), cy + r * Math.sin((a0 * Math.PI) / 180)];
  const p1 = [cx + r * Math.cos((a1 * Math.PI) / 180), cy + r * Math.sin((a1 * Math.PI) / 180)];
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${p0[0]},${p0[1]} A${r},${r} 0 ${large} 1 ${p1[0]},${p1[1]}`;
}

const House: React.FC<{ x: number; w: number; bodyTop: number; roofTop: number; roof: string }> = ({ x, w, bodyTop, roofTop, roof }) => (
  <g>
    <rect x={x} y={bodyTop} width={w} height={1330 - bodyTop} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
    <rect x={x + w - w * 0.22} y={bodyTop} width={w * 0.22} height={1330 - bodyTop} fill="#E6E9EE" />
    <rect x={x} y={bodyTop} width={w} height={1330 - bodyTop} fill="none" stroke={INK} strokeWidth={4} />
    <path d={`M${x - 12},${bodyTop} L${x + w / 2},${roofTop} L${x + w + 12},${bodyTop} Z`} fill={roof} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d={`M${x + w / 2},${roofTop} L${x + w + 12},${bodyTop} L${x + w / 2 + 8},${bodyTop}`} fill="#000000" opacity={0.12} />
  </g>
);

const SmallHouseDetails: React.FC<{ x: number; w: number; bodyTop: number }> = ({ x, w, bodyTop }) => (
  <g>
    <rect x={x + w * 0.16} y={1330 - 52} width={w * 0.26} height={52} fill={WATER_DEEP} stroke={INK} strokeWidth={3} />
    <rect x={x + w * 0.54} y={bodyTop + 22} width={w * 0.3} height={w * 0.26} fill={WATER_LIGHT} stroke={INK} strokeWidth={3} />
  </g>
);

/** Rumah pelanggan dengan potongan dinding: keran dan wastafel di dalam */
const CustomerHouse: React.FC<{ frame: number; waterOpacity: number }> = ({ frame, waterOpacity }) => {
  const [tx, ty] = TAP;
  const streamT = ip(frame, [1170, 1180], [0, 1], easeOutExpo);
  const sinkFill = ip(frame, [1180, 1240], [0, 1]);
  // dua tetes air saat hook (keran dibuka tapi air tidak keluar)
  const drops = [
    [30, 47],
    [98, 115],
  ].map(([s, e]) => {
    if (frame < s - 14 || frame > e + 10) return null;
    const hang = ip(frame, [s - 14, s], [0, 1]);
    const fall = ip(frame, [s, e], [0, 1], (t) => t * t);
    const ring = ip(frame, [e, e + 10], [0, 1]);
    return { hang, fall, ring, landed: frame >= e };
  });
  return (
    <g>
      <House x={790} w={180} bodyTop={1150} roofTop={1078} roof="#E07A3F" />
      {/* jendela potongan */}
      <rect x={812} y={1172} width={136} height={140} fill="#EAF2F8" stroke={INK} strokeWidth={3.5} />
      {[1200, 1228, 1256, 1284].map((yy) => (
        <line key={yy} x1={812} y1={yy} x2={948} y2={yy} stroke="#CFDCE8" strokeWidth={1.5} />
      ))}
      {[846, 880, 914].map((xx) => (
        <line key={xx} x1={xx} y1={1172} x2={xx} y2={1312} stroke="#CFDCE8" strokeWidth={1.5} />
      ))}
      {/* pipa dalam rumah */}
      <Pipe pts={INTERIOR} w={8} seg={interiorSeg(frame)} flow={flowOn(frame, 1176)} frame={frame} waterOpacity={waterOpacity} />
      {/* badan keran */}
      <rect x={tx - 12} y={ty - 26} width={24} height={18} rx={4} fill={METAL} stroke={INK} strokeWidth={2.5} />
      <rect x={tx - 5} y={ty - 9} width={10} height={10} rx={2} fill={METAL} stroke={INK} strokeWidth={2.5} />
      <rect x={tx - 2} y={ty - 34} width={4} height={8} fill={METAL_DARK} stroke={INK} strokeWidth={1.5} />
      <g transform={`translate(${tx},${ty - 35}) rotate(-28)`}>
        <rect x={-2} y={-2.5} width={22} height={5} rx={2.5} fill="#D1432B" stroke={INK} strokeWidth={1.5} />
      </g>
      {/* aliran dari keran */}
      {streamT > 0 ? (
        <g>
          <rect x={tx - 3.2} y={ty + 1} width={6.4} height={(SINK_Y + 18 - ty) * streamT} rx={3} fill={WATER} />
          <rect x={tx - 1} y={ty + 1} width={1.6} height={(SINK_Y + 18 - ty) * streamT} fill={WATER_LIGHT} opacity={0.8} />
        </g>
      ) : null}
      {/* wastafel */}
      <path d={`M842,${SINK_Y} L938,${SINK_Y} Q936,${SINK_Y + 30} 904,${SINK_Y + 32} L876,${SINK_Y + 32} Q844,${SINK_Y + 30} 842,${SINK_Y} Z`} fill="#FFFFFF" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d={`M848,${SINK_Y + 5} L932,${SINK_Y + 5}`} stroke="#CFDCE8" strokeWidth={3} />
      {sinkFill > 0 ? (
        <ellipse cx={890} cy={SINK_Y + 22} rx={10 + 22 * sinkFill} ry={3 + 3 * sinkFill} fill={WATER} opacity={0.85} />
      ) : null}
      {streamT > 0.9 ? (
        <ellipse cx={890} cy={SINK_Y + 20} rx={6 + ((frame % 12) / 12) * 16} ry={2 + ((frame % 12) / 12) * 3} fill="none" stroke={WATER_LIGHT} strokeWidth={1.4} opacity={1 - (frame % 12) / 12} />
      ) : null}
      <rect x={884} y={SINK_Y + 32} width={12} height={12} fill="#E6E9EE" stroke={INK} strokeWidth={2.5} />
      {/* tetes saat hook */}
      {drops.map((d, i) =>
        d ? (
          <g key={i}>
            {!d.landed ? (
              <ellipse cx={tx} cy={ty + 3 + d.fall * (SINK_Y + 18 - ty)} rx={2.6 * d.hang} ry={3.4 * d.hang} fill={WATER} />
            ) : (
              <ellipse cx={tx} cy={SINK_Y + 22} rx={3 + d.ring * 12} ry={1 + d.ring * 2.5} fill="none" stroke={WATER} strokeWidth={1.4} opacity={1 - d.ring} />
            )}
          </g>
        ) : null
      )}
    </g>
  );
};

/* ---------------- gelembung udara terjebak ---------------- */
const rand = createSeededRandom('tirta-ayu-bubbles');
const BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  d0: 70 + rand() * (HUMP_DIST - 110),
  r: 2.6 + rand() * 3.2,
  wob: rand() * Math.PI * 2,
  i,
}));

const Bubbles: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < 646 || frame > 1060) return null;
  const front = mainSeg(frame)[1];
  return (
    <g>
      {BUBBLES.map((b) => {
        if (front < b.d0) return null;
        const esc = 926 + b.i * 7;
        const target = HUMP_DIST - 4 - b.i * 4.2;
        if (frame < esc) {
          const t = ip(frame, [690 + b.i * 9, 905], [0, 1], easeInOutSmooth);
          const d = b.d0 + (target - b.d0) * t;
          const [x, y] = pointAtDist(MAIN, d);
          const wobble = Math.sin(frame / 7 + b.wob) * 1.6;
          return <circle key={b.i} cx={x + wobble} cy={y - 2} r={b.r} fill="#FFFFFF" stroke={INK} strokeWidth={1.4} />;
        }
        // bergerak naik lewat katup udara lalu jadi kepulan
        const u = ip(frame, [esc, esc + 10], [0, 1], easeInOutSmooth);
        if (u < 1) {
          const [hx, hy] = pointAtDist(MAIN, target);
          const x = hx + (AIR_VALVE[0] - hx) * u;
          const y = hy + (AIR_VALVE[1] - 74 - hy) * u;
          return <circle key={b.i} cx={x} cy={y} r={b.r * (1 - u * 0.4)} fill="#FFFFFF" stroke={INK} strokeWidth={1.4} />;
        }
        const k = ip(frame, [esc + 10, esc + 38], [0, 1], easeOutExpo);
        if (k >= 1) return null;
        const side = b.i % 2 === 0 ? -1 : 1;
        return (
          <circle
            key={b.i}
            cx={AIR_VALVE[0] + side * (6 + k * 14)}
            cy={AIR_VALVE[1] - 84 - k * 46}
            r={4 + k * 11}
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth={1.4}
            opacity={1 - k}
          />
        );
      })}
    </g>
  );
};

/* ---------------- dunia lengkap ---------------- */
export const World: React.FC<{ frame: number }> = ({ frame }) => {
  const waterOpacity = frame < 215 ? ip(frame, [188, 212], [0, 1]) : 1;
  const cloudX = frame * 0.06;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      {/* langit dan awan */}
      <rect x={-1200} y={-1200} width={3480} height={4400} fill="#F3F1EC" />
      <g opacity={0.9}>
        <path d={`M${640 + cloudX},560 a28,28 0 0 1 52,-14 a34,34 0 0 1 62,10 a22,22 0 0 1 4,42 h-112 a20,20 0 0 1 -6,-38 z`} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
        <path d={`M${860 - cloudX},700 a20,20 0 0 1 38,-10 a26,26 0 0 1 46,8 a16,16 0 0 1 2,30 h-82 a14,14 0 0 1 -4,-28 z`} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
      </g>
      {/* bukit belakang (nada muda) */}
      <path d="M-1200,820 Q-200,700 300,760 T1080,1030 L2280,1000 L2280,1500 L-1200,1500 Z" fill="#CFE5BF" />
      {/* bukit utama dan dataran */}
      <path
        d="M-1200,610 L330,610 L430,799 L520,770 L607,1004 Q610,1170 616,1330 L2280,1330 L2280,3400 L-1200,3400 Z"
        fill={GRASS}
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <path d="M-1200,700 L250,700 Q330,700 380,760 L470,880 L560,860 L610,1100 L616,1330 L-1200,1330 Z" fill={GRASS_DARK} opacity={0.35} />
      <rect x={-1200} y={1392} width={3480} height={2000} fill={SOIL} />
      <line x1={-1200} y1={1392} x2={2280} y2={1392} stroke={INK} strokeWidth={4} />
      {[1460, 1560, 1700].map((yy, i) => (
        <line key={yy} x1={-1200} y1={yy} x2={2280} y2={yy} stroke={SOIL_DARK} strokeWidth={3} strokeDasharray={`${40 + i * 10} ${60 + i * 14}`} />
      ))}

      <Reservoir frame={frame} />
      <CouplingPit />

      {/* rumah kecil */}
      <House x={652} w={116} bodyTop={1238} roofTop={1192} roof="#E07A3F" />
      <SmallHouseDetails x={652} w={116} bodyTop={1238} />
      <House x={988} w={88} bodyTop={1256} roofTop={1218} roof="#244DA9" />
      <SmallHouseDetails x={988} w={88} bodyTop={1256} />

      {/* jaringan distribusi */}
      {DIST.map((pts, i) => {
        const L = polyLen(pts);
        return <Pipe key={i} pts={pts} w={13} seg={distSeg(frame, L)} flow={flowOn(frame, 1106)} frame={frame} waterOpacity={waterOpacity} />;
      })}

      {/* pipa transmisi */}
      <Pipe pts={MAIN} w={20} seg={mainSeg(frame)} flow={flowOn(frame, 1092)} frame={frame} waterOpacity={waterOpacity} />

      <Coupling />
      <GateValve frame={frame} />
      <AirValve />
      <Bubbles frame={frame} />
      <Gauge frame={frame} />
      <CustomerHouse frame={frame} waterOpacity={waterOpacity} />
    </svg>
  );
};
