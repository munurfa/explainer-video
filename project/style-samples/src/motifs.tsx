import React from 'react';
import { Ctx, circlePts, drawOn, EIO, EO, ip, isDark, onColor, rng, scramble, sp, wobble } from './helpers';

/**
 * 44 motif "signature" — satu hero visual per gaya, digambar 100% dari kode (viewBox 1000×1000).
 * t = frame lokal scene 2 (0..120). Aksi utama berlangsung t 8..100.
 */

type Motif = (c: Ctx) => React.ReactNode;
type Cue = [number, string, number?, number?];
export interface MotifMeta {
  title: string;
  line: string;
  cues: Cue[];
  render: Motif;
}

const V: React.FC<{ children: React.ReactNode; defs?: React.ReactNode }> = ({ children, defs }) => (
  <svg viewBox="0 0 1000 1000" width="100%" height="100%" style={{ overflow: 'visible' }}>
    {defs && <defs>{defs}</defs>}
    {children}
  </svg>
);

/* ===================================================================== */
const cyberpunk: Motif = ({ p, t, fM, fH }) => {
  const d = ip(t, [4, 36], [0, 1]);
  const g = t >= 62 && t <= 65;
  const r = rng(Math.floor(t / 6) + 3);
  const scanY = 200 + ((t * 9) % 600);
  return (
    <V>
      <g transform={g ? 'translate(14,0)' : undefined}>
        <path d="M140,180 H800 L860,240 V820 H200 L140,760 Z" fill={p.surface} stroke={p.accent} strokeWidth={3} {...drawOn(d)} />
        <path d="M140,180 H800 L860,240 V820 H200 L140,760 Z" fill={p.surface} opacity={ip(t, [28, 40], [0, 0.85])} />
        {[0, 1, 2, 3].map((i) => {
          const [x, y] = [[110, 150], [890, 150], [890, 850], [110, 850]][i];
          const sx = i === 0 || i === 3 ? 1 : -1;
          const sy = i < 2 ? 1 : -1;
          return <path key={i} d={`M${x},${y + 60 * sy} V${y} H${x + 60 * sx}`} stroke={p.ink} strokeWidth={4} fill="none" {...drawOn(ip(t, [10 + i * 3, 30 + i * 3], [0, 1]))} />;
        })}
        <text x={200} y={300} fill={p.accent} fontFamily={fH} fontSize={64} fontWeight={700} letterSpacing={4}>
          {scramble('NODE_07 // ONLINE', ip(t, [20, 56], [0, 1], (x) => x), t)}
        </text>
        <text x={200} y={350} fill={p.muted} fontFamily={fM} fontSize={26}>
          {`LAT 35.6895  LON 139.6917  SIG ${(62 + Math.round(ip(t, [20, 90], [0, 37]))).toString()}%`}
        </text>
        {Array.from({ length: 12 }, (_, i) => {
          const h = (0.25 + r() * 0.75) * 280 * ip(t, [30 + i * 2, 50 + i * 2], [0, 1]);
          return <rect key={i} x={210 + i * 52} y={760 - h} width={34} height={h} fill={i === 7 ? p.accentSecondary : p.accent} opacity={i === 7 ? 1 : 0.85} />;
        })}
        <rect x={140} y={scanY} width={720} height={3} fill={p.accent} opacity={0.35} />
      </g>
      {g && <rect x={140} y={420} width={720} height={40} fill={p.accentSecondary} opacity={0.7} />}
    </V>
  );
};

const doodle: Motif = ({ p, t, fH }) => {
  const s = Math.floor(t / 3); // line boil 10fps
  const ring = wobble(circlePts(500, 470, 170, 28, 300), s, 8, true);
  return (
    <V>
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i} x1={60} x2={940} y1={140 + i * 56} y2={140 + i * 56} stroke={p.muted} strokeOpacity={0.18} strokeWidth={2} />
      ))}
      <text x={500} y={510} textAnchor="middle" fontFamily={fH} fontSize={140} fill={p.ink} opacity={ip(t, [4, 14], [0, 1])}>
        ide besar
      </text>
      <path d={ring} fill="none" stroke={p.accentSecondary} strokeWidth={9} strokeLinecap="round" {...drawOn(ip(t, [16, 44], [0, 1]))} />
      <path d={wobble([[230, 560], [400, 575], [600, 560], [770, 572]], s + 9, 6)} fill="none" stroke={p.accent} strokeWidth={22} strokeLinecap="round" opacity={0.85} {...drawOn(ip(t, [40, 58], [0, 1]))} />
      <path d={wobble([[180, 860], [190, 760], [260, 690], [330, 660]], s + 3, 6)} fill="none" stroke={p.ink} strokeWidth={8} strokeLinecap="round" {...drawOn(ip(t, [56, 76], [0, 1]))} />
      <path d={wobble([[300, 640], [335, 660], [305, 690]], s + 4, 4)} fill="none" stroke={p.ink} strokeWidth={8} strokeLinecap="round" {...drawOn(ip(t, [74, 82], [0, 1]))} />
      <path d={wobble(Array.from({ length: 30 }, (_, i) => [800 + Math.cos(i * 0.6) * i * 3.2, 230 + Math.sin(i * 0.6) * i * 3.2] as [number, number]), s + 5, 4)} fill="none" stroke={p.ink} strokeWidth={6} {...drawOn(ip(t, [80, 104], [0, 1]))} />
      <text x={230} y={940} fontFamily={fH} fontSize={52} fill={p.ink} opacity={ip(t, [70, 80], [0, 1])}>
        coret, lalu ganti!
      </text>
    </V>
  );
};

const zine: Motif = ({ p, t, fH, fB }) => {
  const letters = 'ZINE!';
  const fonts = [fH, fB, 'Georgia, serif', fH, 'Courier New, monospace'];
  const r = rng(11);
  return (
    <V
      defs={
        <pattern id="ht3" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="5" fill={p.accent} />
        </pattern>
      }
    >
      <rect x={90} y={120} width={820} height={760} fill="url(#ht3)" opacity={ip(t, [0, 12], [0, 0.55])} transform="rotate(-3 500 500)" />
      {letters.split('').map((ch, i) => {
        const at = 8 + i * 9;
        const k = t >= at ? 1 : 0;
        const rot = (r() - 0.5) * 22;
        const inv = i % 2 === 0;
        return (
          <g key={i} transform={`translate(${130 + i * 152},${400 + (r() - 0.5) * 120}) rotate(${rot}) scale(${k ? 1 : 1.6})`} opacity={k}>
            <rect x={-10} y={-150} width={150} height={190} fill={inv ? p.surface : '#FFFFFF'} />
            <text x={65} y={20} textAnchor="middle" fontFamily={fonts[i]} fontSize={170} fill={inv ? '#FFFFFF' : p.ink} fontWeight={700}>
              {ch}
            </text>
          </g>
        );
      })}
      {[0, 1].map((i) => (
        <rect key={i} x={i ? 650 : 120} y={i ? 210 : 640} width={240} height={56} fill="#E8DCB0" opacity={t > 60 + i * 8 ? 0.85 : 0} transform={`rotate(${i ? 18 : -14} ${i ? 770 : 240} ${i ? 238 : 668})`} />
      ))}
      <text x={500} y={820} textAnchor="middle" fontFamily={fB} fontSize={44} fill={p.ink} opacity={ip(t, [72, 84], [0, 1])}>
        dicetak 200 eksemplar. bagikan.
      </text>
    </V>
  );
};

const grafiti: Motif = ({ p, t, fH }) => {
  const fill = ip(t, [10, 56], [0, 1], EIO);
  return (
    <V
      defs={
        <>
          <pattern id="brick" width="120" height="60" patternUnits="userSpaceOnUse">
            <rect width="120" height="60" fill={p.surface} />
            <path d="M0,0 H120 M0,30 H120 M60,0 V30 M0,30 V60 M120,30 V60" stroke={p.bg} strokeWidth={5} />
          </pattern>
          <clipPath id="spray">
            <rect x={0} y={0} width={1000 * fill} height={1000} />
          </clipPath>
        </>
      }
    >
      <rect x={0} y={120} width={1000} height={760} fill="url(#brick)" />
      <g clipPath="url(#spray)">
        <text x={500} y={560} textAnchor="middle" fontFamily={fH} fontSize={230} fill={p.accent} stroke={p.ink === '#F8F9FA' ? '#111' : p.ink} strokeWidth={0} transform="rotate(-6 500 500)">
          JALAN
        </text>
        <text x={500} y={560} textAnchor="middle" fontFamily={fH} fontSize={230} fill="none" stroke={p.accentSecondary} strokeWidth={7} transform="rotate(-6 492 492)">
          JALAN
        </text>
      </g>
      {[230, 380, 520, 690].map((x, i) => {
        const st = 50 + i * 6;
        const len = ip(t, [st, st + 40], [0, 140 + i * 30], (k) => k * k);
        return <rect key={i} x={x} y={600 - i * 22} width={12} height={len} rx={6} fill={p.accent} />;
      })}
      <text x={760} y={830} fontFamily={fH} fontSize={60} fill={p.ink} opacity={ip(t, [84, 92], [0, 1])} transform="rotate(-8 760 830)">
        ~ crew 22
      </text>
    </V>
  );
};

const topografi: Motif = ({ p, t, fH, fM }) => {
  const rings = 11;
  return (
    <V>
      {Array.from({ length: rings }, (_, i) => {
        const r = 40 + i * 38;
        const pts = circlePts(520, 470, r * 0.78, 48, r).map(([x, y], k) => [x + Math.sin(k * 0.7 + i) * (8 + i * 2), y + Math.cos(k * 0.5 + i * 0.6) * (6 + i * 2)] as [number, number]);
        const g = ip(t, [4 + i * 4, 30 + i * 4], [0, 1]);
        return <path key={i} d={wobble(pts, 1, 0, true)} fill="none" stroke={i % 5 === 0 ? p.ink : p.muted} strokeWidth={i % 5 === 0 ? 3.5 : 2} opacity={g} transform={`translate(520 470) scale(${0.85 + g * 0.15}) translate(-520 -470)`} />;
      })}
      <path d="M120,860 C260,760 300,640 420,600 S560,520 520,470" fill="none" stroke={p.accent} strokeWidth={7} strokeDasharray="0.02 0.012" pathLength={1} strokeDashoffset={0} opacity={1} style={{}} />
      <path d="M120,860 C260,760 300,640 420,600 S560,520 520,470" fill="none" stroke={p.bg} strokeWidth={10} {...drawOn(1 - ip(t, [40, 84], [0, 1]))} transform="" />
      <text x={545} y={455} fontFamily={fM} fontSize={30} fill={p.ink}>
        {`${Math.round(ip(t, [50, 96], [0, 2847]))} mdpl`}
      </text>
      <g transform={`translate(840 210) rotate(${ip(t, [0, 120], [-30, 0])})`}>
        <path d="M0,-70 L18,0 L0,70 L-18,0 Z" fill={p.accent} />
        <path d="M0,-70 L18,0 L-18,0 Z" fill={p.ink} />
        <text y={-86} textAnchor="middle" fontFamily={fH} fontStyle="italic" fontSize={34} fill={p.ink}>
          U
        </text>
      </g>
      <text x={120} y={930} fontFamily={fH} fontStyle="italic" fontSize={40} fill={p.accentSecondary}>
        Lembah Sungai Serayu
      </text>
    </V>
  );
};

const memphis: Motif = ({ p, t, st }) => {
  const items: [number, number, number, React.ReactNode][] = [
    [250, 300, 0, <path d="M-110,40 A110,110 0 0 1 110,40 Z" fill={p.accent} stroke={p.ink} strokeWidth={6} />],
    [700, 260, 1, <path d="M0,-100 L95,70 L-95,70 Z" fill="#FFD166" stroke={p.ink} strokeWidth={6} />],
    [520, 560, 2, <circle r={120} fill={p.accentSecondary} stroke={p.ink} strokeWidth={6} />],
    [230, 700, 3, <rect x={-90} y={-90} width={180} height={180} fill="#2E5BFF" stroke={p.ink} strokeWidth={6} />],
    [780, 690, 4, <path d="M-120,0 q30,-60 60,0 t60,0 t60,0 t60,0" fill="none" stroke={p.ink} strokeWidth={14} strokeLinecap="round" />],
  ];
  return (
    <V
      defs={
        <pattern id="dots6" width="34" height="34" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="5" fill={p.ink} />
        </pattern>
      }
    >
      <rect x={560} y={120} width={340} height={260} fill="url(#dots6)" opacity={0.5} />
      <path d="M90,880 l60,-60 l60,60 l60,-60 l60,60 l60,-60 l60,60" fill="none" stroke={p.accent} strokeWidth={12} {...drawOn(ip(t, [50, 80], [0, 1]))} />
      {items.map(([x, y, i, el]) => {
        const k = sp(t, 6 + i * 7 + (i % 2) * 3, st);
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${(1 - k) * (i % 2 ? 90 : -90) + Math.sin((t + i * 20) / 18) * 6}) scale(${k})`}>
            {el}
          </g>
        );
      })}
    </V>
  );
};

const iso = (x: number, y: number, z: number) => [500 + (x - y) * 0.866 * 70, 640 + (x + y) * 0.5 * 70 - z * 70];
const isoBox = (x: number, y: number, h: number, top: string, left: string, right: string, key: number) => {
  const P = (a: number, b: number, c: number) => iso(a, b, c).join(',');
  return (
    <g key={key}>
      <polygon points={`${P(x, y + 1, 0)} ${P(x + 1, y + 1, 0)} ${P(x + 1, y + 1, h)} ${P(x, y + 1, h)}`} fill={left} />
      <polygon points={`${P(x + 1, y, 0)} ${P(x + 1, y + 1, 0)} ${P(x + 1, y + 1, h)} ${P(x + 1, y, h)}`} fill={right} />
      <polygon points={`${P(x, y, h)} ${P(x + 1, y, h)} ${P(x + 1, y + 1, h)} ${P(x, y + 1, h)}`} fill={top} />
    </g>
  );
};
const isometric: Motif = ({ p, t, st, fM }) => {
  const blocks = [
    [-2, -1, 2.2, p.accent],
    [0, -2, 3.4, p.ink],
    [-1, 1, 1.4, p.accentSecondary],
    [1, 0, 2.6, p.accent],
    [2, 2, 1.8, p.ink],
  ] as const;
  const shade = (hex: string, k: number) => {
    const n = parseInt(hex.slice(1), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k));
    return `rgb(${c.join(',')})`;
  };
  const flow = (t * 0.03) % 1;
  return (
    <V>
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i} opacity={0.25}>
          <line x1={iso(i - 4, -4, 0)[0]} y1={iso(i - 4, -4, 0)[1]} x2={iso(i - 4, 5, 0)[0]} y2={iso(i - 4, 5, 0)[1]} stroke={p.muted} />
          <line x1={iso(-4, i - 4, 0)[0]} y1={iso(-4, i - 4, 0)[1]} x2={iso(5, i - 4, 0)[0]} y2={iso(5, i - 4, 0)[1]} stroke={p.muted} />
        </g>
      ))}
      <polyline points={[iso(-1.5, -0.5, 1.2), iso(0.5, -0.5, 1.2), iso(0.5, 1.5, 1.2)].map((q) => q.join(',')).join(' ')} fill="none" stroke={p.muted} strokeWidth={14} strokeLinecap="round" opacity={ip(t, [40, 50], [0, 1])} />
      {[0, 0.33, 0.66].map((o, i) => {
        const u = (flow + o) % 1;
        const q = u < 0.5 ? iso(-1.5 + u * 4, -0.5, 1.2) : iso(0.5, -0.5 + (u - 0.5) * 4, 1.2);
        return <circle key={i} cx={q[0]} cy={q[1]} r={9} fill={p.accentSecondary} opacity={ip(t, [50, 58], [0, 1])} />;
      })}
      {blocks.map(([x, y, h, c], i) => {
        const k = sp(t, 6 + i * 6, st);
        return isoBox(x, y, Math.max(0.05, h * k), c, shade(c, 0.72), shade(c, 0.55), i);
      })}
      <text x={120} y={180} fontFamily={fM} fontSize={30} fill={p.muted}>
        {`THROUGHPUT ${Math.round(ip(t, [40, 100], [0, 1280]))} pkt/s`}
      </text>
    </V>
  );
};

const clay: Motif = ({ p, t, fH }) => {
  const b = (i: number) => {
    const ph = ((t - i * 10) % 40) / 40;
    const y = -Math.abs(Math.sin(ph * Math.PI)) * 160;
    const squash = ph < 0.08 || ph > 0.92 ? 1.18 : 0.94;
    return { y, sx: squash, sy: 2 - squash };
  };
  const cols = [p.accent, p.accentSecondary, '#7BDFF2'];
  return (
    <V
      defs={cols.map((c, i) => (
        <radialGradient key={i} id={`cg${i}`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.75} />
          <stop offset="0.25" stopColor={c} />
          <stop offset="1" stopColor={c} stopOpacity={1} />
        </radialGradient>
      ))}
    >
      <ellipse cx={500} cy={790} rx={420} ry={70} fill={p.surface} />
      {[0, 1, 2].map((i) => {
        const { y, sx, sy } = t > i * 10 ? b(i) : { y: -600, sx: 1, sy: 1 };
        const x = 260 + i * 240;
        return (
          <g key={i}>
            <ellipse cx={x} cy={792} rx={90 * (1 + y / 600)} ry={18} fill={p.ink} opacity={0.15} />
            <g transform={`translate(${x} ${720 + y}) scale(${sx} ${sy})`}>
              <path d={i === 1 ? 'M-80,60 C-90,-60 -30,-110 0,-110 C50,-110 90,-60 80,60 Z' : 'M-95,70 C-110,-40 -50,-100 0,-100 C60,-100 110,-40 95,70 Z'} fill={`url(#cg${i})`} transform="translate(0,-70)" />
              <ellipse cx={-26} cy={-70} rx={9} ry={13} fill={p.ink} />
              <ellipse cx={26} cy={-70} rx={9} ry={13} fill={p.ink} />
              <path d="M-20,-36 Q0,-20 20,-36" stroke={p.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
            </g>
          </g>
        );
      })}
      <text x={500} y={240} textAnchor="middle" fontFamily={fH} fontSize={88} fontWeight={800} fill={p.ink} opacity={ip(t, [50, 62], [0, 1])}>
        lembut & ramah
      </text>
    </V>
  );
};

const comic: Motif = ({ p, t, st, fH, fB }) => {
  const k1 = sp(t, 4, st);
  const k2 = sp(t, 14, st);
  const boom = sp(t, 46, st);
  return (
    <V
      defs={
        <pattern id="bd9" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="9" cy="9" r="5" fill={p.accentSecondary} />
        </pattern>
      }
    >
      <g transform={`translate(${(1 - k1) * -700} 0)`}>
        <rect x={80} y={110} width={420} height={420} fill="#00A0DF" stroke={p.ink} strokeWidth={10} />
        <path d="M110,500 L470,140" stroke="#FFFFFF" strokeWidth={6} opacity={0.4} />
        <path d="M150,180 h250 a30,30 0 0 1 30,30 v70 a30,30 0 0 1 -30,30 h-170 l-40,50 l5,-50 h-45 a30,30 0 0 1 -30,-30 v-70 a30,30 0 0 1 30,-30 z" fill="#FFFFFF" stroke={p.ink} strokeWidth={6} />
        <text x={275} y={262} textAnchor="middle" fontFamily={fB} fontWeight={700} fontSize={40} fill={p.ink}>
          {['Awas,', 'Awas, di', 'Awas, di atas!'][Math.min(2, Math.floor(ip(t, [14, 40], [0, 3], (x) => x)))]}
        </text>
      </g>
      <g transform={`translate(0 ${(1 - k2) * 800})`}>
        <rect x={520} y={110} width={400} height={780} fill="url(#bd9)" stroke={p.ink} strokeWidth={10} />
        <rect x={520} y={110} width={400} height={780} fill={p.accent} opacity={0.35} />
      </g>
      <rect x={80} y={560} width={420} height={330} fill={p.surface} stroke={p.ink} strokeWidth={10} opacity={ip(t, [24, 30], [0, 1])} />
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return <line key={i} x1={720 + Math.cos(a) * 120} y1={500 + Math.sin(a) * 120} x2={720 + Math.cos(a) * 360} y2={500 + Math.sin(a) * 360} stroke={p.ink} strokeWidth={5} opacity={boom * 0.6} />;
      })}
      <g transform={`translate(720 520) rotate(-10) scale(${boom * 1.0})`}>
        <path d="M0,-170 L40,-80 L140,-120 L90,-30 L190,10 L90,50 L130,150 L30,90 L-10,180 L-50,90 L-160,130 L-100,40 L-200,-10 L-90,-50 L-140,-150 L-30,-90 Z" fill={p.accent} stroke={p.ink} strokeWidth={8} />
        <text textAnchor="middle" y={35} fontFamily={fH} fontSize={120} fill={p.accentSecondary} stroke={p.ink} strokeWidth={4}>
          BOOM!
        </text>
      </g>
      <text x={290} y={740} textAnchor="middle" fontFamily={fH} fontSize={70} fill={p.ink} opacity={ip(t, [70, 80], [0, 1])}>
        BERSAMBUNG...
      </text>
    </V>
  );
};

const FLAP_CH = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:';
const splitflap: Motif = ({ p, t, fH, fM }) => {
  const rows = ['JAKARTA   0945', 'BANDUNG   1020', 'SURABAYA  1115', 'YOGYA     1230'];
  const cell = 58;
  return (
    <V>
      <rect x={40} y={170} width={920} height={600} fill={p.bg} stroke={p.muted} strokeWidth={2} />
      <text x={80} y={240} fontFamily={fM} fontSize={30} fill={p.accent}>
        KEBERANGKATAN
      </text>
      <text x={920} y={240} textAnchor="end" fontFamily={fM} fontSize={30} fill={p.muted}>
        {`09:${String(12 + Math.floor(t / 30)).padStart(2, '0')}`}
      </text>
      {rows.map((row, r) =>
        row.split('').map((ch, i) => {
          const land = 10 + r * 9 + ((i * 7 + r * 3) % 11) * 2.2;
          const target = FLAP_CH.indexOf(ch);
          const spinning = t < land;
          const idx = spinning ? (Math.floor(t * 1.5) + i * 5 + r) % FLAP_CH.length : target;
          const flip = spinning ? (t * 1.5) % 1 : 1;
          const x = 80 + i * (cell + 3);
          const y = 290 + r * 112;
          return (
            <g key={`${r}-${i}`}>
              <rect x={x} y={y} width={cell} height={92} rx={4} fill={p.surface} />
              <text x={x + cell / 2} y={y + 72} textAnchor="middle" fontFamily={fH} fontWeight={700} fontSize={74} fill={i >= 10 ? p.accent : p.ink}>
                {FLAP_CH[idx]}
              </text>
              <rect x={x} y={y + 45} width={cell} height={2.5} fill={p.bg} />
              {spinning && <rect x={x} y={y + 46 - 46 * (1 - flip)} width={cell} height={46 * (1 - flip)} fill={p.surface} opacity={0.9} />}
            </g>
          );
        })
      )}
    </V>
  );
};

const neobrutal: Motif = ({ p, t, st, fH, fB }) => {
  const cards = [
    { x: 150, y: 210, r: -6, c: p.accentSecondary, txt: 'Deploy' },
    { x: 330, y: 330, r: 4, c: p.accent, txt: 'Ship it' },
    { x: 220, y: 470, r: -2, c: '#FFFFFF', txt: 'v2.0' },
  ];
  const press = t > 86 && t < 92 ? 6 : 0;
  return (
    <V>
      {cards.map((cd, i) => {
        const k = sp(t, 6 + i * 10, st);
        return (
          <g key={i} transform={`translate(${cd.x + (1 - k) * 900} ${cd.y}) rotate(${cd.r})`}>
            <rect x={14} y={14} width={540} height={300} fill={p.ink} />
            <rect width={540} height={300} fill={cd.c} stroke={p.ink} strokeWidth={6} />
            <text x={40} y={120} fontFamily={fH} fontSize={96} fill={p.ink}>
              {cd.txt}
            </text>
            <text x={40} y={190} fontFamily={fB} fontSize={30} fill={p.ink}>
              {['build 1.284 lulus', 'tanpa drama', 'rilis jumat'][i]}
            </text>
          </g>
        );
      })}
      <g transform={`translate(${290 + press} ${830 + press})`} opacity={ip(t, [60, 66], [0, 1])}>
        <rect x={14 - press} y={14 - press} width={420} height={110} fill={p.ink} />
        <rect width={420} height={110} fill={p.ink} stroke={p.ink} strokeWidth={6} />
        <text x={210} y={74} textAnchor="middle" fontFamily={fH} fontSize={50} fill={p.bg}>
          KLIK SAYA
        </text>
      </g>
      <path d={`M${760 - ip(t, [66, 86], [-140, 0])},${980 - ip(t, [66, 86], [-120, 0])} l0,60 l16,-14 l12,28 l10,-4 l-12,-28 l22,-2 z`} fill="#FFFFFF" stroke={p.ink} strokeWidth={4} opacity={ip(t, [64, 70], [0, 1])} transform="translate(-160 -90)" />
    </V>
  );
};

const swiss: Motif = ({ p, t, fH, fM }) => {
  const n = Math.round(ip(t, [10, 70], [0, 87], EIO));
  return (
    <V>
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={80 + i * 140} x2={80 + i * 140} y1={100} y2={900} stroke={p.ink} strokeOpacity={0.12} strokeWidth={1.5} />
      ))}
      <rect x={80} y={100} width={ip(t, [4, 30], [0, 280], EIO)} height={36} fill={p.accent} />
      <text x={70} y={690} fontFamily={fH} fontSize={560} fontWeight={800} fill={p.ink} letterSpacing={-30}>
        {n}
      </text>
      <text x={640} y={690} fontFamily={fH} fontSize={120} fontWeight={800} fill={p.accent}>
        %
      </text>
      <line x1={80} x2={ip(t, [40, 70], [80, 920], EIO)} y1={740} y2={740} stroke={p.ink} strokeWidth={3} />
      <text x={80} y={800} fontFamily={fH} fontSize={40} fontWeight={700} fill={p.ink} opacity={ip(t, [60, 72], [0, 1])}>
        Pertumbuhan pendapatan
      </text>
      <text x={80} y={850} fontFamily={fM} fontSize={26} fill={p.muted} opacity={ip(t, [66, 78], [0, 1])}>
        Laporan Tahunan 2026 — Kuartal IV
      </text>
    </V>
  );
};

const bauhaus: Motif = ({ p, t, st, fH }) => {
  const k = (i: number) => sp(t, 6 + i * 8, st);
  return (
    <V>
      <rect x={-200} y={420} width={1400} height={120} fill={p.accent} transform={`rotate(-45 500 480) translate(${(1 - k(0)) * -1400} 0)`} />
      <circle cx={360} cy={360} r={210 * k(1)} fill={p.accentSecondary} />
      <g transform={`translate(700 640) rotate(${(1 - k(2)) * 45 + 45 - 45})`}>
        <rect x={-150} y={-150} width={300 * k(2)} height={300 * k(2)} fill="#1B3A5C" />
      </g>
      <path d="M520,860 L760,860 L640,640 Z" fill={p.ink} transform={`rotate(${(1 - k(3)) * -45} 640 780)`} opacity={k(3)} />
      <text x={160} y={900} fontFamily={fH} fontSize={120} fill={p.ink} transform={`rotate(-90 160 900) translate(${(1 - k(4)) * -400} 0)`}>
        FORMA
      </text>
      <text x={840} y={250} fontFamily={fH} fontSize={88} fill={p.ink} transform="rotate(45 840 250)" opacity={k(4)}>
        1919
      </text>
    </V>
  );
};

const riso: Motif = ({ p, t, fH }) => {
  const layer = (i: number) => ip(t, [6 + i * 10, 34 + i * 10], [140 + i * 60, 3 + i * 2], EIO);
  const step = (v: number) => Math.round(v / 6) * 6;
  return (
    <V
      defs={
        <pattern id="ht14" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <circle cx="7" cy="7" r="4" fill={p.accentSecondary} />
        </pattern>
      }
    >
      <g style={{ mixBlendMode: 'multiply' }}>
        <circle cx={420 + step(layer(0))} cy={420} r={230} fill={p.ink} opacity={0.9} />
        <circle cx={600 - step(layer(1))} cy={500} r={230} fill={p.accent} opacity={0.9} />
        <circle cx={480} cy={620 + step(layer(2))} r={230} fill="url(#ht14)" />
      </g>
      <text x={500 + step(layer(2)) * 0.2} y={900} textAnchor="middle" fontFamily={fH} fontSize={120} fontWeight={800} fill={p.accent} style={{ mixBlendMode: 'multiply' }}>
        cetak!
      </text>
      <text x={503} y={903} textAnchor="middle" fontFamily={fH} fontSize={120} fontWeight={800} fill={p.ink} opacity={0.55} style={{ mixBlendMode: 'multiply' }}>
        cetak!
      </text>
    </V>
  );
};

const vhs: Motif = ({ p, t, fH, fM }) => {
  const track = t < 10 || (t > 58 && t < 64);
  const blink = Math.floor(t / 15) % 2 === 0;
  return (
    <V
      defs={
        <radialGradient id="crt" cx="50%" cy="50%" r="70%">
          <stop offset="0.6" stopColor={p.surface} />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
      }
    >
      <rect x={70} y={150} width={860} height={660} rx={60} fill="url(#crt)" stroke="#2A2A2A" strokeWidth={22} />
      <text x={130} y={250} fontFamily={fH} fontSize={64} fill={p.ink}>
        PLAY
      </text>
      {blink && (
        <text x={870} y={250} textAnchor="end" fontFamily={fH} fontSize={64} fill={p.accent}>
          REC
        </text>
      )}
      <text x={130} y={760} fontFamily={fH} fontSize={56} fill={p.ink}>
        {`SP  0:0${Math.floor(t / 30)}:${String((t * 2) % 60).padStart(2, '0')}`}
      </text>
      <text x={870} y={760} textAnchor="end" fontFamily={fH} fontSize={56} fill={p.ink}>
        AGU 17 1996
      </text>
      <g transform={track ? `translate(${(t % 3) * 10 - 10} 0)` : undefined}>
        <text x={500} y={500} textAnchor="middle" fontFamily={fM} fontSize={80} fontWeight={700} fill={p.accent} opacity={0.7} dx={-5}>
          LIBURAN KELUARGA
        </text>
        <text x={500} y={500} textAnchor="middle" fontFamily={fM} fontSize={80} fontWeight={700} fill={p.accentSecondary} opacity={0.7} dx={5}>
          LIBURAN KELUARGA
        </text>
        <text x={500} y={500} textAnchor="middle" fontFamily={fM} fontSize={80} fontWeight={700} fill={p.ink}>
          LIBURAN KELUARGA
        </text>
      </g>
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={90} y={680 + ((t * 4 + i * 23) % 100)} width={820} height={track ? 10 : 3} fill="#FFFFFF" opacity={track ? 0.45 : 0.08} />
      ))}
      {Array.from({ length: 60 }, (_, i) => (
        <rect key={i} x={90} y={170 + i * 10.6} width={820} height={3} fill="#000" opacity={0.18} />
      ))}
    </V>
  );
};

const y2k: Motif = ({ p, t, st, fH, fB }) => {
  const sheen = ((t * 1.4) % 160) / 100 - 0.3;
  return (
    <V
      defs={
        <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.45" stopColor={p.surface} />
          <stop offset="0.5" stopColor="#5D6470" />
          <stop offset="0.62" stopColor="#E9EEF5" />
          <stop offset="1" stopColor={p.accent} />
        </linearGradient>
      }
    >
      {[0, 1, 2].map((i) => {
        const k = sp(t, 30 + i * 9, st);
        return (
          <g key={i} transform={`translate(${170 + i * 70} ${560 + i * 60}) scale(${k})`} opacity={k}>
            <rect width={520} height={260} fill="#E5E7EB" stroke="#0D0D12" strokeWidth={3} />
            <rect width={520} height={44} fill={i === 2 ? p.accentSecondary : '#1E3A8A'} />
            <text x={16} y={31} fontFamily={fB} fontSize={24} fill="#FFFFFF">
              {['mixtape_final.mp3', 'away_message.txt', 'Peringatan'][i]}
            </text>
            <rect x={474} y={8} width={30} height={28} fill="#E5E7EB" stroke="#0D0D12" />
            <text x={30} y={130} fontFamily={fB} fontSize={30} fill="#0D0D12">
              {['memutar... 03:14', 'brb, lagi download', 'Memori hampir penuh'][i]}
            </text>
          </g>
        );
      })}
      <text x={500} y={340} textAnchor="middle" fontFamily={fH} fontSize={190} fontWeight={800} fill="url(#chrome)" stroke="#0D0D12" strokeWidth={3} transform={`rotate(${Math.sin(t / 20) * 4} 500 300)`}>
        Y2K
      </text>
      <rect x={(sheen) * 1000} y={150} width={60} height={240} fill="#FFFFFF" opacity={0.55} transform="skewX(-20)" style={{ mixBlendMode: 'overlay' }} />
    </V>
  );
};

const pixel: Motif = ({ p, t, fH }) => {
  const S = 25; // ukuran 1 piksel
  const px = (x: number, y: number, c: string, k: string | number) => <rect key={k} x={x * S} y={y * S} width={S} height={S} fill={c} />;
  const scroll = Math.floor(t / 2) % 40;
  const jumpPh = (t % 36) / 36;
  const jy = Math.round(-Math.sin(Math.min(1, jumpPh * 1.6) * Math.PI) * 4);
  const hero = ['..aaaa..', '.aaaaaa.', '.abbbba.', '.bcbbcb.', '.bbbbbb.', '..dddd..', '.dd..dd.', '.e....e.'];
  const cmap: Record<string, string> = { a: '#B13E53', b: '#FFCD75', c: '#1A1C2C', d: '#41A6F6', e: '#5D275D' };
  const ground: React.ReactNode[] = [];
  for (let x = -2; x < 42; x++) {
    const gx = x - (scroll % 2 === 0 ? 0 : 0) - ((scroll * 1) % 4);
    ground.push(px(gx, 32, p.accentSecondary, `g${x}`));
    ground.push(px(gx, 33, '#257179', `h${x}`));
    for (let y = 34; y < 40; y++) ground.push(px(gx, y, (x + y) % 3 ? '#5D275D' : '#333C57', `d${x}-${y}`));
  }
  return (
    <V>
      <g shapeRendering="crispEdges">
        {[[6, 8], [30, 6], [18, 12]].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${-((t * (0.5 + i * 0.2)) % 40) * S} 0)`}>
            {[0, 1, 2, 3, 4, 5].map((k) => px(cx + k, cy, '#94B0C2', `c${i}${k}`))}
            {[1, 2, 3, 4].map((k) => px(cx + k, cy - 1, '#F4F4F4', `d${i}${k}`))}
            {[0, 1, 2, 3, 4, 5].map((k) => px(cx + 40 + k, cy, '#94B0C2', `e${i}${k}`))}
          </g>
        ))}
        {ground}
        {[0, 1, 2].map((i) => {
          const cx = 26 + i * 4 - (Math.floor(t / 3) % 30);
          const got = t > 40 + i * 12;
          return got ? null : (
            <g key={i}>
              {px(cx, 22, p.accent, `co${i}a`)}
              {px(cx, 23, p.accent, `co${i}b`)}
            </g>
          );
        })}
        {hero.map((row, y) => row.split('').map((ch, x) => (ch === '.' ? null : px(10 + x, 24 + y + jy, cmap[ch], `p${x}-${y}`))))}
      </g>
      <text x={500} y={150} textAnchor="middle" fontFamily={fH} fontSize={46} fill={p.ink}>
        {`SKOR ${String(Math.min(3, Math.floor(Math.max(0, t - 28) / 12)) * 100).padStart(6, '0')}`}
      </text>
    </V>
  );
};

const blueprint: Motif = ({ p, t, fB, fM }) => {
  const d = (a: number, b: number) => drawOn(ip(t, [a, b], [0, 1], EIO));
  return (
    <V>
      <g stroke={p.ink} fill="none" strokeWidth={3}>
        <path d="M200,760 V420 L500,220 L800,420 V760 Z" {...d(4, 34)} />
        <path d="M430,760 V580 H570 V760" {...d(24, 44)} />
        <path d="M260,470 H380 V560 H260 Z M620,470 H740 V560 H620 Z" {...d(30, 50)} />
        <path d="M180,800 H820" strokeWidth={1.5} {...d(48, 64)} />
        <path d="M180,790 V810 M820,790 V810" strokeWidth={1.5} opacity={ip(t, [60, 64], [0, 1])} />
        <path d="M850,420 V760" strokeWidth={1.5} {...d(56, 70)} />
      </g>
      <path d="M195,800 l14,-7 v14 z M805,800 l-14,-7 v14 z" fill={p.ink} opacity={ip(t, [60, 64], [0, 1])} />
      <text x={500} y={840} textAnchor="middle" fontFamily={fM} fontSize={28} fill={p.ink} opacity={ip(t, [62, 70], [0, 1])}>
        {`${(ip(t, [62, 84], [0, 12.4], (x) => x)).toFixed(1)} m`}
      </text>
      <text x={880} y={600} fontFamily={fM} fontSize={28} fill={p.ink} opacity={ip(t, [66, 74], [0, 1])} transform="rotate(90 880 600)">
        6.8 m
      </text>
      <circle cx={500} cy={670} r={ip(t, [76, 90], [0, 120])} fill="none" stroke={p.accent} strokeWidth={4} />
      <text x={640} y={170} fontFamily={fB} fontSize={38} fill={p.accent} opacity={ip(t, [82, 92], [0, 1])}>
        detail pintu A-1
      </text>
      <rect x={640} y={880} width={300} height={90} fill="none" stroke={p.ink} strokeWidth={2} />
      <text x={656} y={918} fontFamily={fM} fontSize={20} fill={p.ink}>
        RUMAH TIPE 45
      </text>
      <text x={656} y={950} fontFamily={fM} fontSize={20} fill={p.muted}>
        SKALA 1:100  LBR 03/12
      </text>
    </V>
  );
};

const papercut: Motif = ({ p, t, fH }) => {
  const L = [
    { c: p.accentSecondary, d: 'M0,640 C150,520 300,560 420,600 S700,480 1000,560 V1000 H0 Z', s: 0 },
    { c: '#F4A261', d: 'M0,720 C200,620 380,700 520,690 S820,620 1000,700 V1000 H0 Z', s: 1 },
    { c: p.accent, d: 'M0,800 C180,740 360,820 560,790 S860,750 1000,800 V1000 H0 Z', s: 2 },
    { c: p.ink, d: 'M0,880 C220,840 420,900 620,870 S880,850 1000,880 V1000 H0 Z', s: 3 },
  ];
  return (
    <V
      defs={
        <filter id="pshadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="-8" stdDeviation="8" floodColor="#000" floodOpacity="0.25" />
        </filter>
      }
    >
      <circle cx={700} cy={ip(t, [10, 60], [700, 330])} r={110} fill="#E9C46A" filter="url(#pshadow)" />
      {L.map((l, i) => {
        const y = Math.round(ip(t, [4 + i * 8, 34 + i * 8], [400, 0]) / 8) * 8;
        const par = Math.sin(t / 30) * (i + 1) * 6;
        return <path key={i} d={l.d} fill={l.c} filter="url(#pshadow)" transform={`translate(${par} ${y - 60})`} />;
      })}
      <text x={500} y={230} textAnchor="middle" fontFamily={fH} fontSize={96} fontWeight={800} fill={p.ink} opacity={ip(t, [50, 60], [0, 1])}>
        lapis demi lapis
      </text>
    </V>
  );
};

const collage: Motif = ({ p, t, fH, fB }) => {
  const pieces = [
    { x: 160, y: 200, w: 380, h: 280, r: -5, c: p.surface, at: 6 },
    { x: 500, y: 300, w: 340, h: 420, r: 6, c: '#E8D7B5', at: 14 },
    { x: 200, y: 560, w: 360, h: 240, r: 3, c: '#FFFFFF', at: 22 },
  ];
  const stamp = sp(t, 60, { motion: { springPreset: 'brutalSlap' } } as never);
  return (
    <V>
      {pieces.map((pc, i) => {
        const on = t >= pc.at;
        return (
          <g key={i} transform={`translate(${pc.x} ${pc.y}) rotate(${pc.r}) scale(${on ? 1 : 1.3})`} opacity={on ? 1 : 0}>
            <rect width={pc.w} height={pc.h} fill={pc.c} style={{ filter: 'drop-shadow(4px 6px 0 rgba(0,0,0,0.25))' }} />
            {i === 1 && (
              <>
                <rect x={24} y={24} width={pc.w - 48} height={pc.h - 120} fill={p.accentSecondary} opacity={0.75} />
                <text x={24} y={pc.h - 46} fontFamily={fB} fontSize={30} fill={p.ink}>
                  Bandung, 1987
                </text>
              </>
            )}
            {i === 0 && (
              <text x={30} y={150} fontFamily={fH} fontSize={78} fontWeight={700} fill={p.ink}>
                Arsip Ibu
              </text>
            )}
            {i === 2 && (
              <text x={30} y={110} fontFamily={fB} fontSize={34} fill={p.ink}>
                {'"Simpan baik-baik ya."'}
              </text>
            )}
            <rect x={pc.w / 2 - 70} y={-20} width={140} height={44} fill="#F3E9C6" opacity={0.85} transform="rotate(-4)" />
          </g>
        );
      })}
      <g transform={`translate(700 800) rotate(-14) scale(${1.6 - stamp * 0.6})`} opacity={t > 60 ? 0.85 : 0}>
        <rect x={-170} y={-60} width={340} height={120} fill="none" stroke={p.accent} strokeWidth={8} />
        <text textAnchor="middle" y={22} fontFamily={fB} fontSize={62} fill={p.accent}>
          ARSIP
        </text>
      </g>
    </V>
  );
};

const midcentury: Motif = ({ p, t, st, fH, fB }) => {
  const rot = t * 0.25;
  return (
    <V>
      <g transform={`translate(500 520) rotate(${rot})`}>
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d="M0,0 L-60,-520 L60,-520 Z" fill={i % 2 ? p.accentSecondary : p.surface} transform={`rotate(${i * 22.5})`} opacity={ip(t, [0, 30], [0, 0.55])} />
        ))}
      </g>
      <circle cx={500} cy={520} r={260 * sp(t, 8, st)} fill={p.accent} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M0,${760 + i * 60} q125,-50 250,0 t250,0 t250,0 t250,0 V1000 H0 Z`} fill={[p.accentSecondary, p.muted, p.ink][i]} transform={`translate(${-((t * (1 + i * 0.4)) % 500)} ${ip(t, [10 + i * 8, 40 + i * 8], [300, 0])})`} />
      ))}
      <path d={`M0,760 q125,-50 250,0 t250,0 t250,0 t250,0`} fill="none" />
      <text x={500} y={545} textAnchor="middle" fontFamily={fH} fontSize={120} fill={p.surface} opacity={ip(t, [36, 50], [0, 1])}>
        Kopi Sore
      </text>
      <text x={500} y={610} textAnchor="middle" fontFamily={fB} fontSize={40} fill={p.ink} opacity={ip(t, [46, 58], [0, 1])}>
        sejak 1974
      </text>
    </V>
  );
};

const artdeco: Motif = ({ p, t, fH, fB }) => {
  const fan = ip(t, [4, 46], [0, 1], EIO);
  return (
    <V>
      <rect x={60} y={60} width={880} height={880} fill="none" stroke={p.accent} strokeWidth={3} {...drawOn(ip(t, [0, 40], [0, 1]))} />
      <rect x={80} y={80} width={840} height={840} fill="none" stroke={p.accent} strokeWidth={1.5} {...drawOn(ip(t, [6, 46], [0, 1]))} />
      <g transform="translate(500 640)">
        {Array.from({ length: 13 }, (_, i) => {
          const a = -90 + (i - 6) * 12 * fan;
          return <line key={i} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * 420} y2={Math.sin((a * Math.PI) / 180) * 420} stroke={p.accent} strokeWidth={i === 6 ? 5 : 2.5} opacity={fan} />;
        })}
        {[140, 220, 300].map((r, i) => (
          <path key={i} d={`M${-r},0 A${r},${r} 0 0 1 ${r},0`} fill="none" stroke={p.accent} strokeWidth={2} {...drawOn(ip(t, [20 + i * 6, 50 + i * 6], [0, 1]))} />
        ))}
      </g>
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M360,${770 + i * 26} L500,${730 + i * 26} L640,${770 + i * 26}`} fill="none" stroke={p.accent} strokeWidth={3} opacity={ip(t, [50 + i * 4, 60 + i * 4], [0, 1])} />
      ))}
      <text x={500} y={260} textAnchor="middle" fontFamily={fH} fontSize={110} fontWeight={700} fill={p.ink} letterSpacing={14} opacity={ip(t, [40, 60], [0, 1])}>
        GRAND
      </text>
      <text x={500} y={330} textAnchor="middle" fontFamily={fB} fontSize={40} fill={p.accent} letterSpacing={18} opacity={ip(t, [50, 66], [0, 1])}>
        HOTEL MDCCCXX
      </text>
    </V>
  );
};

const ukiyoe: Motif = ({ p, t, fH }) => {
  const wave = (yb: number, amp: number, ph: number) => {
    let d = `M-100,${yb}`;
    for (let x = -100; x <= 1100; x += 50) d += ` L${x},${yb + Math.sin(x / 90 + ph) * amp}`;
    return d + ' V1000 H-100 Z';
  };
  return (
    <V>
      <circle cx={720} cy={300} r={ip(t, [0, 40], [0, 140])} fill={p.accent} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(0 ${ip(t, [4 + i * 6, 40 + i * 6], [260, 0])})`}>
          <path d={wave(520 + i * 110, 40 - i * 6, t / 14 + i * 1.3)} fill={i % 2 ? p.accentSecondary : '#2E5E8E'} stroke={p.ink} strokeWidth={5} />
          {Array.from({ length: 10 }, (_, k) => (
            <path key={k} d={`M${k * 110 - 40 + ((t * (1 + i * 0.3)) % 110)},${540 + i * 110} q20,-30 40,0`} fill="none" stroke="#F0E6D0" strokeWidth={4} opacity={0.8} />
          ))}
        </g>
      ))}
      <g opacity={ip(t, [50, 66], [0, 1])}>
        <rect x={110} y={140} width={90} height={330} fill={p.surface} stroke={p.ink} strokeWidth={4} />
        <text x={155} y={200} textAnchor="middle" fontFamily={fH} fontSize={64} fill={p.ink} style={{ writingMode: 'vertical-rl' as never }}>
          波
        </text>
        <rect x={130} y={390} width={50} height={50} fill={p.accent} />
      </g>
    </V>
  );
};

const nusantara: Motif = ({ p, t, fH }) => {
  const N = 6;
  const cell = 150;
  return (
    <V>
      <rect x={50} y={50} width={900} height={900} fill={p.surface} />
      {Array.from({ length: N * N }, (_, i) => {
        const cx = 125 + (i % N) * cell;
        const cy = 125 + Math.floor(i / N) * cell;
        const dist = Math.hypot((i % N) - 2.5, Math.floor(i / N) - 2.5);
        const k = ip(t, [4 + dist * 9, 26 + dist * 9], [0, 1]);
        return (
          <g key={i} transform={`translate(${cx} ${cy}) scale(${k}) rotate(${(1 - k) * 90})`}>
            {[0, 90, 180, 270].map((a) => (
              <ellipse key={a} cx={0} cy={-36} rx={24} ry={38} fill={p.accent} stroke={p.ink} strokeWidth={3} transform={`rotate(${a + 45})`} />
            ))}
            <circle r={10} fill={p.accentSecondary} />
          </g>
        );
      })}
      <g transform={`translate(500 500) rotate(${t * 0.4}) scale(${ip(t, [56, 86], [0, 1])})`}>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={-150} y={-150} width={300} height={300} fill="none" stroke={p.accent} strokeWidth={6} transform={`rotate(${i * 11.25})`} />
        ))}
        <circle r={120} fill={p.bg} stroke={p.accent} strokeWidth={6} />
        <text textAnchor="middle" y={22} fontFamily={fH} fontSize={64} fontWeight={700} fill={p.ink}>
          Kawung
        </text>
      </g>
    </V>
  );
};

const koran: Motif = ({ p, t, st, fH, fB, fM }) => {
  const slam = sp(t, 8, st);
  const fill = ip(t, [30, 90], [0, 1], (x) => x);
  return (
    <V>
      <rect x={80} y={80} width={840} height={860} fill={p.surface} />
      <text x={500} y={180} textAnchor="middle" fontFamily={fH} fontSize={96} fontWeight={800} fill={p.ink}>
        Harian Nusa
      </text>
      <line x1={110} x2={890} y1={210} y2={210} stroke={p.ink} strokeWidth={4} />
      <text x={110} y={242} fontFamily={fM} fontSize={20} fill={p.ink}>
        JUMAT, 6 NOVEMBER 2026 — EDISI PAGI — Rp 5.000
      </text>
      <line x1={110} x2={890} y1={258} y2={258} stroke={p.ink} strokeWidth={1.5} />
      <g transform={`translate(500 360) scale(${2 - slam})`} opacity={Math.min(1, slam * 1.4)}>
        <text textAnchor="middle" fontFamily={fH} fontSize={78} fontWeight={800} fill={p.ink}>
          Kota Hijau Lagi
        </text>
      </g>
      <rect x={300} y={398} width={ip(t, [86, 100], [0, 360])} height={36} fill="#FFE45C" opacity={0.75} />
      <text x={500} y={428} textAnchor="middle" fontFamily={fB} fontStyle="italic" fontSize={32} fill={p.ink}>
        Taman kota bertambah 40 persen
      </text>
      {[0, 1, 2].map((c) =>
        Array.from({ length: 14 }, (_, l) => {
          const idx = c * 14 + l;
          const w = idx / 42 < fill ? 1 : 0;
          return <rect key={`${c}-${l}`} x={110 + c * 268} y={480 + l * 30} width={(236 - (l % 4 === 3 ? 80 : 0)) * w} height={10} fill={p.muted} />;
        })
      )}
      <line x1={366} x2={366} y1={470} y2={900} stroke={p.ink} strokeWidth={1} />
      <line x1={634} x2={634} y1={470} y2={900} stroke={p.ink} strokeWidth={1} />
    </V>
  );
};

const TERM_LINES = [
  { at: 6, cmd: true, s: 'npm run build' },
  { at: 34, cmd: false, s: '> vite build --mode production' },
  { at: 40, cmd: false, s: '  built 128 modules' },
  { at: 46, cmd: false, s: '  dist/index.js   42.18 kB' },
  { at: 54, cmd: true, s: 'git push origin main' },
  { at: 82, cmd: false, s: '  main -> main  (ok)' },
];
const terminal: Motif = ({ p, t, fM }) => {
  return (
    <V>
      <rect x={60} y={140} width={880} height={720} rx={14} fill={p.surface} stroke={p.muted} strokeWidth={2} />
      <rect x={60} y={140} width={880} height={56} rx={14} fill="#0E140E" />
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
        <circle key={i} cx={100 + i * 34} cy={168} r={10} fill={c} />
      ))}
      <text x={500} y={176} textAnchor="middle" fontFamily={fM} fontSize={24} fill={p.muted}>
        ~/proyek/web — zsh
      </text>
      {TERM_LINES.map((ln, i) => {
        if (t < ln.at) return null;
        const typed = ln.cmd ? Math.min(ln.s.length, Math.floor((t - ln.at) / 1.6)) : ln.s.length;
        const y = 260 + i * 62;
        const isLastTyping = ln.cmd && typed < ln.s.length;
        return (
          <g key={i}>
            {ln.cmd && (
              <text x={96} y={y} fontFamily={fM} fontSize={34} fill={p.accent}>
                $
              </text>
            )}
            <text x={ln.cmd ? 140 : 96} y={y} fontFamily={fM} fontSize={34} fill={ln.cmd ? p.ink : i === 5 ? p.accent : p.muted} fontWeight={ln.cmd ? 700 : 400}>
              {ln.s.slice(0, typed)}
            </text>
            {isLastTyping && <rect x={140 + typed * 20.4} y={y - 30} width={18} height={36} fill={p.accent} />}
          </g>
        );
      })}
      {t > 90 && Math.floor(t / 10) % 2 === 0 && <rect x={140} y={260 + 6 * 62 - 30} width={18} height={36} fill={p.accent} />}
      {t > 90 && (
        <text x={96} y={260 + 6 * 62} fontFamily={fM} fontSize={34} fill={p.accent}>
          $
        </text>
      )}
    </V>
  );
};

const ICO_V: [number, number, number][] = (() => {
  const g = (1 + Math.sqrt(5)) / 2;
  return [[-1, g, 0], [1, g, 0], [-1, -g, 0], [1, -g, 0], [0, -1, g], [0, 1, g], [0, -1, -g], [0, 1, -g], [g, 0, -1], [g, 0, 1], [-g, 0, -1], [-g, 0, 1]];
})();
const ICO_E: [number, number][] = [];
for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
  const d = Math.hypot(ICO_V[i][0] - ICO_V[j][0], ICO_V[i][1] - ICO_V[j][1], ICO_V[i][2] - ICO_V[j][2]);
  if (Math.abs(d - 2) < 0.01) ICO_E.push([i, j]);
}
const wireframe: Motif = ({ p, t, fM }) => {
  const a = t * 0.025;
  const b = 0.45;
  const P = ICO_V.map(([x, y, z]) => {
    const x1 = x * Math.cos(a) - z * Math.sin(a);
    const z1 = x * Math.sin(a) + z * Math.cos(a);
    const y1 = y * Math.cos(b) - z1 * Math.sin(b);
    const z2 = y * Math.sin(b) + z1 * Math.cos(b);
    const s = 600 / (z2 + 6);
    return [500 + x1 * s * 1.9, 430 + y1 * s * 1.9, z2];
  });
  return (
    <V>
      {Array.from({ length: 13 }, (_, i) => {
        const z = ((i + (t * 0.05) % 1) / 13);
        const y = 680 + z * z * 300;
        return <line key={`h${i}`} x1={0} x2={1000} y1={y} y2={y} stroke={p.accentSecondary} strokeOpacity={0.35} />;
      })}
      {Array.from({ length: 15 }, (_, i) => (
        <line key={`v${i}`} x1={500} y1={620} x2={-400 + i * 128} y2={1000} stroke={p.accentSecondary} strokeOpacity={0.35} />
      ))}
      {ICO_E.map(([i, j], k) => {
        const on = ip(t, [4 + k * 1.4, 14 + k * 1.4], [0, 1]);
        return <line key={k} x1={P[i][0]} y1={P[i][1]} x2={P[i][0] + (P[j][0] - P[i][0]) * on} y2={P[i][1] + (P[j][1] - P[i][1]) * on} stroke={k % 9 === 0 ? p.accent : p.ink} strokeWidth={k % 9 === 0 ? 4 : 2} />;
      })}
      {P.map(([x, y], i) => (
        <rect key={i} x={x - 6} y={y - 6} width={12} height={12} fill={p.accent} opacity={ip(t, [40, 50], [0, 1])} />
      ))}
      <text x={80} y={160} fontFamily={fM} fontSize={28} fill={p.muted}>
        {`MESH  v:12  e:30  f:20   rot ${((a * 180) / Math.PI).toFixed(1)}°`}
      </text>
    </V>
  );
};

const glitch: Motif = ({ p, t, fH, fM }) => {
  const beats = [20, 21, 22, 50, 51, 78, 79, 80];
  const on = beats.includes(t);
  const r = rng(t + 1);
  return (
    <V
      defs={
        <clipPath id="gl">
          <rect x={0} y={0} width={1000} height={1000} />
        </clipPath>
      }
    >
      <g style={{ mixBlendMode: 'screen' }}>
        <text x={500 + (on ? -18 : -3)} y={540} textAnchor="middle" fontFamily={fH} fontSize={190} fill={p.accent}>
          ERROR
        </text>
        <text x={500 + (on ? 18 : 3)} y={540} textAnchor="middle" fontFamily={fH} fontSize={190} fill={p.accentSecondary}>
          ERROR
        </text>
        <text x={500} y={540} textAnchor="middle" fontFamily={fH} fontSize={190} fill={p.ink} opacity={0.9}>
          ERROR
        </text>
      </g>
      {on &&
        Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={(r() - 0.5) * 120} y={300 + r() * 360} width={1000} height={8 + r() * 30} fill={r() > 0.5 ? p.accent : p.ink} opacity={0.75} />
        ))}
      <text x={500} y={650} textAnchor="middle" fontFamily={fM} fontSize={34} fill={p.muted}>
        {on ? scramble('0x00F3 SEGMENTATION FAULT', 0.3, t) : '0x00F3 SEGMENTATION FAULT'}
      </text>
    </V>
  );
};

const neon: Motif = ({ p, t, fH, fB }) => {
  const flick = (s: number) => (t < s ? 0 : t < s + 8 ? ([1, 0, 1, 1, 0, 0, 1, 1][t - s] ?? 1) : 1);
  const dead = t > 70 && t < 76 ? 0.15 : 1;
  return (
    <V
      defs={
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      }
    >
      {[200, 800].map((x) => (
        <rect key={x} x={x - 4} y={120} width={8} height={160} fill="#3A3540" />
      ))}
      <ellipse cx={500} cy={470} rx={420} ry={260} fill={p.accent} opacity={0.08 * flick(10)} />
      <g filter="url(#glow)">
        <text x={500} y={470} textAnchor="middle" fontFamily={fH} fontSize={170} fill="none" stroke={p.accent} strokeWidth={6} opacity={flick(10)}>
          BUKA
        </text>
        <text x={500} y={650} textAnchor="middle" fontFamily={fH} fontSize={120} fill="none" stroke={p.accentSecondary} strokeWidth={5} opacity={flick(34)}>
          <tspan>SAMPAI P</tspan>
          <tspan opacity={dead}>A</tspan>
          <tspan>GI</tspan>
        </text>
      </g>
      <text x={500} y={850} textAnchor="middle" fontFamily={fB} fontSize={34} fill={p.muted} opacity={ip(t, [60, 70], [0, 1])}>
        Jl. Braga 12 — setiap malam
      </text>
    </V>
  );
};

const chalk: Motif = ({ p, t, fH, fB }) => {
  const s = Math.floor(t / 3);
  return (
    <V
      defs={
        <filter id="chalkF">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
        </filter>
      }
    >
      <g filter="url(#chalkF)" stroke={p.ink} fill="none" strokeWidth={6} strokeLinecap="round">
        <path d={wobble([[220, 760], [700, 760], [220, 360], [220, 760]], s, 3)} {...drawOn(ip(t, [4, 34], [0, 1]))} />
        <path d="M220,710 H270 V760" strokeWidth={4} {...drawOn(ip(t, [32, 38], [0, 1]))} />
      </g>
      <g filter="url(#chalkF)">
        <text x={170} y={570} fontFamily={fB} fontSize={64} fill={p.accent} opacity={ip(t, [36, 42], [0, 1])}>
          a
        </text>
        <text x={450} y={830} fontFamily={fB} fontSize={64} fill={p.accent} opacity={ip(t, [40, 46], [0, 1])}>
          b
        </text>
        <text x={480} y={540} fontFamily={fB} fontSize={64} fill={p.accentSecondary} opacity={ip(t, [44, 50], [0, 1])}>
          c
        </text>
        <text x={560} y={250} fontFamily={fH} fontSize={74} fill={p.ink} opacity={ip(t, [54, 74], [0, 1])} style={{ clipPath: `inset(0 ${100 - ip(t, [54, 80], [0, 100])}% 0 0)` }}>
          a² + b² = c²
        </text>
        <path d={wobble([[560, 280], [940, 286]], s + 7, 4)} stroke={p.accent} strokeWidth={6} fill="none" {...drawOn(ip(t, [80, 92], [0, 1]))} />
      </g>
      {Array.from({ length: 14 }, (_, i) => {
        const r = rng(i + 5);
        const st = 56 + i * 2;
        const y = ip(t, [st, st + 40], [260, 940], (x) => x * x);
        return t > st ? <circle key={i} cx={580 + r() * 340} cy={y} r={2 + r() * 2} fill={p.ink} opacity={0.5} /> : null;
      })}
    </V>
  );
};

const noir: Motif = ({ p, t, fH, fB }) => {
  const sweep = ip(t, [0, 110], [-500, 300], (x) => x);
  return (
    <V
      defs={
        <>
          <radialGradient id="vig" cx="50%" cy="45%" r="65%">
            <stop offset="0.5" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.85} />
          </radialGradient>
          <clipPath id="blind">
            {Array.from({ length: 10 }, (_, i) => (
              <rect key={i} x={-400} y={i * 110} width={1800} height={58} transform={`rotate(-18) translate(${sweep} 0)`} />
            ))}
          </clipPath>
        </>
      }
    >
      <rect width={1000} height={1000} fill={p.surface} />
      <g clipPath="url(#blind)">
        <rect width={1000} height={1000} fill="#5A5854" />
        <text x={500} y={520} textAnchor="middle" fontFamily={fH} fontSize={150} fontWeight={800} fill={p.ink}>
          MALAM ITU
        </text>
      </g>
      <text x={500} y={520} textAnchor="middle" fontFamily={fH} fontSize={150} fontWeight={800} fill={p.ink} opacity={0.12}>
        MALAM ITU
      </text>
      <text x={500} y={620} textAnchor="middle" fontFamily={fB} fontSize={38} letterSpacing={10} fill={p.accent} opacity={ip(t, [60, 74], [0, 1])}>
        TIDAK ADA YANG PULANG
      </text>
      {Array.from({ length: 70 }, (_, i) => {
        const r = rng(i * 13 + 2);
        const x = r() * 1100;
        const y = ((r() * 1000 + t * 34) % 1100) - 50;
        return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 46} stroke="#FFFFFF" strokeOpacity={0.22} strokeWidth={2} />;
      })}
      <rect width={1000} height={1000} fill="url(#vig)" />
    </V>
  );
};

const retrofut: Motif = ({ p, t, fH, fB }) => {
  return (
    <V>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(500 470) rotate(${i * 60})`}>
          <ellipse rx={360} ry={120} fill="none" stroke={p.ink} strokeWidth={4} {...drawOn(ip(t, [4 + i * 8, 34 + i * 8], [0, 1]))} />
          <circle cx={Math.cos(t / 12 + i * 2) * 360} cy={Math.sin(t / 12 + i * 2) * 120} r={20} fill={i === 1 ? p.accentSecondary : p.accent} opacity={ip(t, [30, 40], [0, 1])} />
        </g>
      ))}
      <circle cx={500} cy={470} r={ip(t, [0, 24], [0, 80])} fill={p.accent} />
      <circle cx={500} cy={470} r={ip(t, [6, 28], [0, 46])} fill={p.accentSecondary} />
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1={ip(t, [50 + i * 3, 80 + i * 3], [1100, 120])} x2={ip(t, [50 + i * 3, 80 + i * 3], [1400, 420])} y1={790 + i * 22} y2={790 + i * 22} stroke={p.ink} strokeWidth={6} strokeLinecap="round" />
      ))}
      <text x={500} y={170} textAnchor="middle" fontFamily={fH} fontSize={84} fill={p.ink} opacity={ip(t, [40, 54], [0, 1])}>
        ERA ATOM
      </text>
      <text x={500} y={930} textAnchor="middle" fontFamily={fB} fontSize={26} letterSpacing={8} fill={p.ink} opacity={ip(t, [70, 80], [0, 1])}>
        MENUJU ORBIT 2062
      </text>
    </V>
  );
};

const woodcut: Motif = ({ p, t, fH }) => {
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < 40; i++) {
    const y = 320 + i * 12;
    const half = Math.sqrt(Math.max(0, 240 * 240 - (y - 560) ** 2));
    const cut = Math.max(0, half - (i * 3));
    const on = ip(t, [4 + i * 1.6, 12 + i * 1.6], [0, 1]);
    if (cut > 0) lines.push(<line key={`a${i}`} x1={500 - half} y1={y} x2={500 - half + cut * 2 * on} y2={y - 6} stroke={p.ink} strokeWidth={4 - (i % 3)} />);
  }
  for (let i = 0; i < 26; i++) {
    const on = ip(t, [50 + i * 1.6, 58 + i * 1.6], [0, 1]);
    lines.push(<line key={`b${i}`} x1={320 + i * 18} y1={330} x2={320 + i * 18 - 80 * on} y2={330 + 420 * on} stroke={p.ink} strokeWidth={1.5} opacity={0.55} />);
  }
  return (
    <V
      defs={
        <clipPath id="orb">
          <circle cx={500} cy={560} r={240} />
        </clipPath>
      }
    >
      <rect x={90} y={90} width={820} height={820} fill="none" stroke={p.ink} strokeWidth={8} />
      <rect x={110} y={110} width={780} height={780} fill="none" stroke={p.ink} strokeWidth={2} />
      <circle cx={500} cy={560} r={240} fill="none" stroke={p.ink} strokeWidth={6} {...drawOn(ip(t, [0, 30], [0, 1]))} />
      <g clipPath="url(#orb)">{lines}</g>
      <text x={500} y={240} textAnchor="middle" fontFamily={fH} fontSize={72} fill={p.ink} opacity={ip(t, [30, 46], [0, 1])}>
        De Natura Rerum
      </text>
      <text x={500} y={860} textAnchor="middle" fontFamily={fH} fontSize={40} fontStyle="italic" fill={p.accent} opacity={ip(t, [70, 84], [0, 1])}>
        Anno MDXLIII
      </text>
    </V>
  );
};

const rubberhose: Motif = ({ p, t, fH }) => {
  const ph = (t / 15) * Math.PI;
  const bob = Math.abs(Math.sin(ph)) * -40;
  const sq = 1 + Math.cos(ph * 2) * 0.06;
  const armA = Math.sin(ph) * 60;
  return (
    <V>
      <ellipse cx={500} cy={880} rx={180 - bob} ry={22} fill={p.ink} opacity={0.2} />
      <g transform={`translate(500 ${600 + bob}) scale(${2 - sq} ${sq})`}>
        <path d={`M-40,140 C-60,220 -90,240 -120,270`} stroke={p.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
        <path d={`M40,140 C60,220 90,240 120,270`} stroke={p.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
        <ellipse cx={-130} cy={276} rx={44} ry={22} fill={p.ink} />
        <ellipse cx={130} cy={276} rx={44} ry={22} fill={p.ink} />
        <path d={`M-120,0 C-220,${-40 - armA} -240,${-120 - armA} -230,${-200 - armA}`} stroke={p.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
        <path d={`M120,0 C220,${-40 + armA} 240,${-120 + armA} 230,${-200 + armA}`} stroke={p.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
        <circle cx={-230} cy={-212 - armA} r={38} fill="#FFFFFF" stroke={p.ink} strokeWidth={8} />
        <circle cx={230} cy={-212 + armA} r={38} fill="#FFFFFF" stroke={p.ink} strokeWidth={8} />
        <ellipse cx={0} cy={40} rx={150} ry={140} fill={p.ink} />
        <ellipse cx={0} cy={-150} rx={120} ry={110} fill={p.ink} />
        <ellipse cx={0} cy={-120} rx={84} ry={60} fill={p.bg} />
        {[-40, 40].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={-180} rx={30} ry={44} fill="#FFFFFF" stroke={p.ink} strokeWidth={4} />
            <path d={`M${x - 14},-168 a16,22 0 1 0 28,0 l-14,-10 z`} fill={p.ink} />
          </g>
        ))}
        <path d="M-50,-110 Q0,-60 50,-110" stroke={p.ink} strokeWidth={8} fill={p.accent} />
      </g>
      <text x={500} y={170} textAnchor="middle" fontFamily={fH} fontSize={92} fill={p.accent} opacity={ip(t, [10, 24], [0, 1])} transform={`rotate(${Math.sin(ph) * 3} 500 150)`}>
        HALO, KAWAN!
      </text>
    </V>
  );
};

const manga: Motif = ({ p, t, fH, fB }) => {
  const impact = t === 40 || t === 41;
  const zoom = ip(t, [36, 42], [1, 1.18], EIO);
  const ink = impact ? p.bg : p.ink;
  const bgc = impact ? p.ink : p.bg;
  return (
    <V
      defs={
        <pattern id="tone" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="2.6" fill={ink} />
        </pattern>
      }
    >
      <rect width={1000} height={1000} fill={bgc} />
      <g transform={`translate(500 500) scale(${zoom}) translate(-500 -500)`}>
        {Array.from({ length: 64 }, (_, i) => {
          const a = (i / 64) * Math.PI * 2 + (i % 3) * 0.02;
          const r0 = 230 + (i % 5) * 30;
          return <path key={i} d={`M${500 + Math.cos(a) * r0},${500 + Math.sin(a) * r0} L${500 + Math.cos(a - 0.012) * 900},${500 + Math.sin(a - 0.012) * 900} L${500 + Math.cos(a + 0.012) * 900},${500 + Math.sin(a + 0.012) * 900} Z`} fill={ink} opacity={ip(t, [4, 20], [0, 1])} />;
        })}
        <path d="M60,60 L560,60 L460,400 L60,460 Z" fill="url(#tone)" stroke={ink} strokeWidth={8} opacity={ip(t, [0, 10], [0, 1])} />
        <path d="M600,620 L940,560 L940,940 L520,940 Z" fill={bgc} stroke={ink} strokeWidth={8} opacity={ip(t, [50, 58], [0, 1])} />
        <text x={730} y={800} textAnchor="middle" fontFamily={fB} fontSize={44} fontWeight={700} fill={ink} opacity={ip(t, [56, 64], [0, 1])}>
          belum selesai!
        </text>
      </g>
      <g transform={`translate(500 560) rotate(-8) scale(${ip(t, [36, 42], [2.4, 1], EIO)})`} opacity={t >= 36 ? 1 : 0}>
        <text textAnchor="middle" fontFamily={fH} fontSize={240} fill={p.accent} stroke={ink} strokeWidth={10} paintOrder="stroke">
          DON!
        </text>
      </g>
    </V>
  );
};

const dataed: Motif = ({ p, t, fH, fB, fM }) => {
  const vals = [32, 41, 38, 47, 52, 88, 57];
  const yrs = ['2020', '21', '22', '23', '24', '25', '26'];
  const focus = ip(t, [60, 72], [0, 1]);
  return (
    <V>
      <text x={90} y={150} fontFamily={fH} fontSize={56} fontWeight={700} fill={p.ink}>
        Lonjakan 2025 belum terulang
      </text>
      <text x={90} y={200} fontFamily={fB} fontSize={28} fill={p.muted}>
        Kunjungan wisata, juta orang per tahun
      </text>
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={90} x2={920} y1={820 - v * 5.6} y2={820 - v * 5.6} stroke={p.muted} strokeOpacity={0.3} />
          <text x={84} y={826 - v * 5.6} textAnchor="end" fontFamily={fM} fontSize={20} fill={p.muted}>
            {v}
          </text>
        </g>
      ))}
      {vals.map((v, i) => {
        const h = v * 5.6 * ip(t, [6 + i * 5, 36 + i * 5], [0, 1], EIO);
        const hl = i === 5;
        return (
          <g key={i}>
            <rect x={120 + i * 115} y={820 - h} width={74} height={h} fill={hl ? p.accent : p.accentSecondary} opacity={hl ? 1 : 1 - focus * 0.6} />
            <text x={157 + i * 115} y={856} textAnchor="middle" fontFamily={fM} fontSize={22} fill={p.muted}>
              {yrs[i]}
            </text>
          </g>
        );
      })}
      <path d="M707,300 C700,250 620,240 560,250" fill="none" stroke={p.ink} strokeWidth={2.5} {...drawOn(focus)} />
      <text x={330} y={260} fontFamily={fH} fontStyle="italic" fontSize={32} fill={p.ink} opacity={focus}>
        Efek konser akbar: 88 juta
      </text>
    </V>
  );
};

const inflatable: Motif = ({ p, t, fH }) => {
  const cols = [p.accent, '#FFD60A', p.accentSecondary, '#4D96FF'];
  const word = 'POMP';
  return (
    <V
      defs={cols.map((c, i) => (
        <radialGradient key={i} id={`inf${i}`} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.9} />
          <stop offset="0.3" stopColor={c} />
          <stop offset="1" stopColor={c} />
        </radialGradient>
      ))}
    >
      {word.split('').map((ch, i) => {
        const st = 6 + i * 10;
        const k = ip(t, [st, st + 18], [0, 1], (x) => 1 - Math.pow(1 - x, 3) + Math.sin(x * Math.PI) * 0.25);
        const wob = Math.sin((t - st) / 5) * Math.exp(-(Math.max(0, t - st - 18)) / 20) * 0.06;
        return (
          <g key={i} transform={`translate(${200 + i * 200} 560) scale(${k * (1 + wob)} ${k * (1 - wob)})`}>
            <ellipse cx={0} cy={250} rx={80} ry={14} fill={p.ink} opacity={0.12} />
            <text textAnchor="middle" y={70} fontFamily={fH} fontWeight={800} fontSize={300} fill={`url(#inf${i})`} stroke={p.ink} strokeOpacity={0.15} strokeWidth={4}>
              {ch}
            </text>
          </g>
        );
      })}
      <ellipse cx={500} cy={260} rx={ip(t, [50, 70], [0, 160])} ry={ip(t, [50, 70], [0, 100])} fill="url(#inf2)" />
    </V>
  );
};

const transit: Motif = ({ p, t, fH, fM }) => {
  const lines = [
    { c: p.accent, d: 'M80,300 H420 L560,440 H920', a: 4 },
    { c: p.accentSecondary, d: 'M300,880 V560 L440,440 H560 V140', a: 14 },
    { c: '#2BA84A', d: 'M80,700 H360 L560,500 L700,640 H920', a: 24 },
  ];
  const stations: [number, number, number, string][] = [
    [80, 300, 10, 'Kota'], [420, 300, 16, 'Gambir'], [560, 440, 30, 'Sentral'], [920, 440, 40, 'Timur'],
    [300, 880, 22, 'Selatan'], [560, 140, 36, 'Utara'], [80, 700, 30, 'Barat'], [920, 700, 46, 'Pantai'],
  ];
  const tr = ip(t, [50, 100], [0, 1], EIO);
  const trainX = tr < 0.55 ? 80 + (tr / 0.55) * 340 : 420 + Math.min(140, ((tr - 0.55) / 0.45) * 140);
  const trainY = tr < 0.55 ? 300 : 300 + Math.min(140, ((tr - 0.55) / 0.45) * 140);
  return (
    <V>
      {lines.map((l, i) => (
        <path key={i} d={l.d} fill="none" stroke={l.c} strokeWidth={22} strokeLinejoin="round" strokeLinecap="round" {...drawOn(ip(t, [l.a, l.a + 30], [0, 1], EIO))} />
      ))}
      {stations.map(([x, y, at, name], i) => {
        const k = ip(t, [at, at + 6], [0, 1]);
        const inter = name === 'Sentral';
        return (
          <g key={i} opacity={k}>
            <circle cx={x} cy={y} r={inter ? 26 : 16} fill="#FFFFFF" stroke={p.ink} strokeWidth={inter ? 8 : 6} />
            <text x={x + (x > 800 ? -30 : 30)} y={y - 30} textAnchor={x > 800 ? 'end' : 'start'} fontFamily={fH} fontWeight={700} fontSize={34} fill={p.ink}>
              {name}
            </text>
          </g>
        );
      })}
      <rect x={trainX - 22} y={trainY - 12} width={44} height={24} rx={8} fill={p.ink} opacity={t > 50 ? 1 : 0} />
      <text x={80} y={960} fontFamily={fM} fontSize={24} fill={p.muted}>
        {`Gambir → Sentral  ${Math.max(0, Math.round(ip(t, [50, 100], [6, 0])))} menit`}
      </text>
    </V>
  );
};

const hud: Motif = ({ p, t, fH, fM }) => {
  const hp = ip(t, [10, 40], [0, 0.82], EIO) - (t > 70 ? ip(t, [70, 78], [0, 0.24]) : 0);
  const lock = ip(t, [40, 60], [1.8, 1], EIO);
  const combo = Math.min(48, Math.max(0, Math.floor((t - 50) / 1.2)));
  return (
    <V>
      <g transform={`translate(${ip(t, [0, 14], [-500, 0])} 0)`}>
        <text x={70} y={130} fontFamily={fH} fontWeight={700} fontSize={40} fill={p.ink}>
          HP
        </text>
        <rect x={140} y={100} width={400} height={30} fill="none" stroke={p.ink} strokeWidth={2} />
        <rect x={144} y={104} width={392 * Math.max(0, hp)} height={22} fill={hp < 0.65 ? '#FF4040' : p.accent} />
        <text x={70} y={185} fontFamily={fH} fontWeight={700} fontSize={40} fill={p.ink}>
          EN
        </text>
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={140 + i * 40} y={160} width={32} height={22} fill={i < Math.floor(ip(t, [20, 50], [0, 7])) ? p.accentSecondary : p.surface} />
        ))}
      </g>
      <g transform={`translate(${ip(t, [6, 20], [400, 0])} 0)`}>
        <circle cx={830} cy={190} r={110} fill={p.surface} stroke={p.accent} strokeWidth={2} />
        <path d={`M830,190 L${830 + Math.cos(t / 8) * 110},${190 + Math.sin(t / 8) * 110}`} stroke={p.accent} strokeWidth={3} />
        <rect x={866} y={150} width={14} height={14} fill="#FF4040" />
        <rect x={824} y={184} width={12} height={12} fill={p.ink} />
      </g>
      <g transform={`translate(500 560) scale(${lock}) rotate(${(lock - 1) * 90})`} opacity={ip(t, [36, 44], [0, 1])}>
        {[0, 90, 180, 270].map((a) => (
          <path key={a} d="M-120,-60 V-120 H-60" fill="none" stroke={t > 60 ? '#FF4040' : p.accent} strokeWidth={6} transform={`rotate(${a})`} />
        ))}
        <circle r={8} fill={t > 60 ? '#FF4040' : p.accent} />
      </g>
      <text x={500} y={740} textAnchor="middle" fontFamily={fM} fontSize={28} fill={t > 60 ? '#FF4040' : p.muted} opacity={ip(t, [44, 50], [0, 1])}>
        {t > 60 ? 'TARGET TERKUNCI — 124 m' : 'MEMINDAI...'}
      </text>
      <text x={930} y={900} textAnchor="end" fontFamily={fH} fontWeight={700} fontSize={110} fill={p.accentSecondary} opacity={combo > 0 ? 1 : 0}>
        {`${combo}x`}
      </text>
      <text x={930} y={940} textAnchor="end" fontFamily={fM} fontSize={26} fill={p.ink} opacity={combo > 0 ? 1 : 0}>
        KOMBO
      </text>
      <text x={70} y={880} fontFamily={fM} fontSize={26} fill={p.ink} opacity={ip(t, [24, 34], [0, 1])}>
        MISI: amankan menara B
      </text>
    </V>
  );
};

const sports: Motif = ({ p, t, st, fH, fB }) => {
  const k = sp(t, 6, st);
  const scoreA = t > 64 ? 3 : 2;
  const pop = t > 64 ? sp(t, 64, st) : 1;
  const stats = [['Penguasaan bola', 58, 42], ['Tembakan', 14, 9], ['Sepak pojok', 7, 3]] as const;
  return (
    <V>
      <g transform={`translate(${(1 - k) * -1000} 0) skewX(-14)`}>
        <rect x={140} y={170} width={300} height={130} fill={p.accentSecondary} />
        <rect x={440} y={170} width={220} height={130} fill={p.surface} />
        <rect x={660} y={170} width={300} height={130} fill="#1D4ED8" />
        <rect x={140} y={300} width={820} height={40} fill={p.accent} />
      </g>
      <text x={250} y={262} textAnchor="middle" fontFamily={fH} fontSize={86} fontWeight={800} fill="#FFF" opacity={k}>
        GRD
      </text>
      <text x={790} y={262} textAnchor="middle" fontFamily={fH} fontSize={86} fontWeight={800} fill="#FFF" opacity={k}>
        PSM
      </text>
      <text x={530} y={270} textAnchor="middle" fontFamily={fH} fontSize={110} fontWeight={800} fill={p.accent} opacity={k}>
        <tspan style={{ fontSize: 110 * pop }}>{scoreA}</tspan> - 1
      </text>
      <text x={530} y={332} textAnchor="middle" fontFamily={fB} fontSize={30} fontWeight={700} fill="#0A0A0A" opacity={k}>
        {`MENIT ${78 + Math.floor(t / 40)}'`}
      </text>
      {stats.map(([lbl, a, b], i) => {
        const g = ip(t, [30 + i * 8, 60 + i * 8], [0, 1], EIO);
        const y = 480 + i * 140;
        return (
          <g key={i}>
            <text x={500} y={y} textAnchor="middle" fontFamily={fB} fontSize={32} fontWeight={700} fill={p.ink}>
              {lbl.toUpperCase()}
            </text>
            <rect x={490 - (a / (a + b)) * 400 * g} y={y + 20} width={(a / (a + b)) * 400 * g} height={34} fill={p.accentSecondary} transform={`skewX(-14)`} />
            <rect x={510} y={y + 20} width={(b / (a + b)) * 400 * g} height={34} fill="#1D4ED8" transform={`skewX(-14)`} />
            <text x={60} y={y + 50} fontFamily={fH} fontSize={50} fontWeight={800} fill={p.ink}>
              {Math.round(a * g)}
            </text>
            <text x={940} y={y + 50} textAnchor="end" fontFamily={fH} fontSize={50} fontWeight={800} fill={p.ink}>
              {Math.round(b * g)}
            </text>
          </g>
        );
      })}
    </V>
  );
};

const watercolor: Motif = ({ p, t, fH, fB }) => {
  const blobs = [
    { x: 380, y: 430, r: 230, c: p.muted, at: 4 },
    { x: 620, y: 500, r: 200, c: p.accent, at: 16 },
    { x: 480, y: 640, r: 180, c: p.accentSecondary, at: 28 },
    { x: 300, y: 650, r: 120, c: '#F0D58C', at: 40 },
  ];
  return (
    <V
      defs={
        <filter id="wet" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="70" result="d" />
          <feGaussianBlur in="d" stdDeviation="2" />
        </filter>
      }
    >
      <g filter="url(#wet)" style={{ mixBlendMode: 'multiply' }}>
        {blobs.map((b, i) => {
          const k = ip(t, [b.at, b.at + 40], [0, 1], EIO);
          return (
            <g key={i}>
              <circle cx={b.x} cy={b.y} r={b.r * k} fill={b.c} opacity={0.5} />
              <circle cx={b.x} cy={b.y} r={b.r * k} fill="none" stroke={b.c} strokeWidth={10} opacity={0.6} />
            </g>
          );
        })}
      </g>
      <text x={500} y={200} textAnchor="middle" fontFamily={fH} fontStyle="italic" fontSize={92} fill={p.ink} style={{ clipPath: `inset(0 ${100 - ip(t, [50, 84], [0, 100], (x) => x)}% 0 0)` }}>
        hujan pertama
      </text>
      <text x={500} y={900} textAnchor="middle" fontFamily={fB} fontSize={36} fill={p.ink} opacity={ip(t, [76, 90], [0, 0.8])}>
        warna merembes pelan, seperti pagi
      </text>
    </V>
  );
};

const crayon: Motif = ({ p, t, fH }) => {
  const s = Math.floor(t / 3);
  const scrib = (x0: number, y0: number, w: number, h: number, seed: number) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 14; i++) pts.push([x0 + (i % 2 ? w : 0), y0 + (i / 13) * h]);
    return wobble(pts, seed, 10);
  };
  return (
    <V
      defs={
        <filter id="wax">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      }
    >
      <g filter="url(#wax)" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={scrib(300, 520, 400, 300, s)} stroke={p.accentSecondary} strokeWidth={34} {...drawOn(ip(t, [30, 62], [0, 1]))} />
        <path d={wobble([[300, 520], [700, 520], [700, 820], [300, 820], [300, 520]], s + 1, 6)} stroke={p.ink} strokeWidth={14} {...drawOn(ip(t, [4, 24], [0, 1]))} />
        <path d={wobble([[270, 530], [500, 330], [730, 530]], s + 2, 6)} stroke={p.accent} strokeWidth={16} {...drawOn(ip(t, [18, 32], [0, 1]))} />
        <path d={wobble([[450, 820], [450, 680], [550, 680], [550, 820]], s + 3, 5)} stroke={p.ink} strokeWidth={12} {...drawOn(ip(t, [60, 74], [0, 1]))} />
        <path d={wobble(circlePts(820, 230, 80, 18), s + 4, 8, true)} stroke="#F4A261" strokeWidth={18} {...drawOn(ip(t, [70, 86], [0, 1]))} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <path key={i} d={wobble([[820 + Math.cos(a) * 110, 230 + Math.sin(a) * 110], [820 + Math.cos(a) * 160, 230 + Math.sin(a) * 160]], s + i, 6)} stroke="#F4A261" strokeWidth={12} {...drawOn(ip(t, [84 + i, 92 + i], [0, 1]))} />;
        })}
        <path d={wobble([[60, 880], [300, 870], [600, 885], [940, 872]], s + 9, 8)} stroke={p.accent === '#E63946' ? '#2A9D8F' : p.accent} strokeWidth={20} {...drawOn(ip(t, [40, 60], [0, 1]))} />
      </g>
      <text x={160} y={200} fontFamily={fH} fontSize={74} fill={p.ink} opacity={ip(t, [90, 98], [0, 1])} transform={`rotate(${Math.sin(s) * 2} 160 200)`}>
        rumahku
      </text>
    </V>
  );
};

const motionreel: Motif = ({ p, t, fH, fB, fM }) => {
  const words = ['Gerak', 'yang', 'mengendap.'];
  const slot = Math.min(12, Math.floor(ip(t, [40, 70], [0, 12.99], (x) => x)));
  return (
    <V>
      {words.map((w, i) => {
        const st = 6 + i * 8;
        const k = ip(t, [st, st + 22], [0, 1], EO);
        const blur = (1 - k) * 8;
        const serif = i !== 1;
        return (
          <text key={i} x={90 + (1 - k) * 220} y={330 + i * 150} fontFamily={serif ? fH : fB} fontStyle={serif ? 'italic' : 'normal'} fontWeight={serif ? 400 : 800} fontSize={serif ? 168 : 140} fill={i === 2 ? p.accent : p.ink} opacity={k} style={{ filter: `blur(${blur}px)` }} transform={`rotate(${(1 - k) * -3 + Math.sin((t + i * 30) / 26) * 0.4} 90 ${330 + i * 150})`}>
            {w}
          </text>
        );
      })}
      <line x1={90} x2={ip(t, [36, 60], [90, 910], EIO)} y1={720} y2={720} stroke={p.ink} strokeWidth={2} />
      <text x={90} y={800} fontFamily={fM} fontSize={26} fill={p.muted}>
        PROYEK
      </text>
      <text x={90} y={900} fontFamily={fB} fontWeight={800} fontSize={96} fill={p.ink}>
        {String(slot).padStart(2, '0')}
      </text>
      <text x={560} y={800} fontFamily={fM} fontSize={26} fill={p.muted}>
        DURASI
      </text>
      <text x={560} y={900} fontFamily={fB} fontWeight={800} fontSize={96} fill={t > 70 ? p.accent : p.ink}>
        {`${String(Math.floor(ip(t, [40, 70], [0, 42]))).padStart(2, '0')}s`}
      </text>
    </V>
  );
};

/** #44 Kita Bedah — penampang pipa PDAM dengan aliran air (objek nyata, bukan kartu) */
const kitabedah: Motif = ({ p, t, fH, fM }) => {
  const open = ip(t, [10, 40], [0, 1], EIO);
  const flow = (t * 6) % 120;
  return (
    <V
      defs={
        <>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9BD5EF" />
            <stop offset="1" stopColor="#244DA9" />
          </linearGradient>
          <linearGradient id="pvc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F4F6F8" />
            <stop offset="0.5" stopColor="#C9D1DA" />
            <stop offset="1" stopColor="#8D99A8" />
          </linearGradient>
          <clipPath id="pipeIn">
            <rect x={100} y={430} width={800} height={140} />
          </clipPath>
        </>
      }
    >
      <rect x={0} y={700} width={1000} height={300} fill="#D9CDB4" />
      {Array.from({ length: 20 }, (_, i) => (
        <circle key={i} cx={(i * 97) % 1000} cy={760 + ((i * 53) % 200)} r={6 + (i % 3) * 3} fill="#BBA987" />
      ))}
      <rect x={80} y={400} width={840} height={200} rx={24} fill="url(#pvc)" stroke={p.ink} strokeWidth={4} />
      <g transform={`translate(0 ${-open * 120})`} opacity={1 - open * 0.15}>
        <path d="M80,424 a24,24 0 0 1 24,-24 h792 a24,24 0 0 1 24,24 v76 h-840 Z" fill="url(#pvc)" stroke={p.ink} strokeWidth={4} />
      </g>
      <g clipPath="url(#pipeIn)" opacity={open}>
        <rect x={100} y={430} width={800} height={140} fill="#EAF6FC" />
        <rect x={100} y={455} width={800} height={115} fill="url(#water)" />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${100 + i * 120 + flow - 120},500 h60 l-14,-10 M${100 + i * 120 + flow - 120 + 60},500 l-14,10`} stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.85} />
        ))}
      </g>
      <rect x={430} y={360} width={140} height={280} rx={10} fill="none" stroke={p.ink} strokeWidth={4} opacity={0.5} />
      <text x={90} y={110} fontFamily={fH} fontWeight={800} fontSize={60} fill={p.ink}>
        Isi pipa <tspan fill={p.accentSecondary}>PDAM</tspan>
      </text>
      <text x={90} y={155} fontFamily={fM} fontSize={26} fill={p.muted}>
        PIPA DISTRIBUSI PVC  Ø 110 mm
      </text>
      <text x={90} y={240} fontFamily={fH} fontWeight={800} fontSize={64} fill={p.accentSecondary}>
        {`${ip(t, [30, 90], [0, 2.4], (x) => x).toFixed(1).replace('.', ',')} bar`}
      </text>
    </V>
  );
};

const LIST: [Motif, string, Cue[]][] = [
  [cyberpunk, 'Panel chamfer & bracket HUD', [[6, 'typing-digital', 0.5], [62, 'transition-glitch', 0.6]]],
  [doodle, 'Garis tangan yang "boil"', [[16, 'k1', 0.6], [56, 'k3', 0.5]]],
  [zine, 'Huruf ransom ditempel', [[8, 'k2'], [17, 'k2'], [26, 'k2'], [35, 'k2'], [44, 'k2'], [60, 'k4', 0.5]]],
  [grafiti, 'Tag semprot & tetesan cat', [[10, 'transition-swipe', 0.6], [50, 'pop-plop', 0.5]]],
  [topografi, 'Kontur tumbuh dari puncak', [[4, 'data-reveal', 0.5], [40, 'k3', 0.4]]],
  [memphis, 'Bentuk pop dengan overshoot', [[6, 'pop-in'], [13, 'pop-pluck'], [23, 'pop-in'], [27, 'pop-pluck'], [37, 'pop-in']]],
  [isometric, 'Blok terekstrusi berurutan', [[6, 'pop-drop'], [18, 'pop-drop'], [30, 'pop-drop'], [50, 'data-reveal', 0.5]]],
  [clay, 'Squash & stretch tanah liat', [[18, 'pop-plop'], [28, 'pop-plop'], [38, 'pop-plop'], [58, 'pop-plop'], [68, 'pop-plop']]],
  [comic, 'Panel, balon, onomatope', [[4, 'transition-swoosh', 0.6], [14, 'transition-swipe', 0.6], [46, 'impact-punch']]],
  [splitflap, 'Bilah karakter berputar', [[8, 'm1', 0.5], [30, 'm2', 0.5], [50, 'm3', 0.5]]],
  [neobrutal, 'Kartu menampar masuk', [[6, 'impact-soft'], [16, 'impact-soft'], [26, 'impact-soft'], [64, 'hover-rollover'], [86, 'click']]],
  [swiss, 'Angka besar di grid modular', [[10, 'tick-soft', 0.5], [40, 'data-reveal', 0.5]]],
  [bauhaus, 'Geometri menyentak 45°', [[6, 'transition-chop'], [14, 'pop-drop'], [22, 'pop-drop'], [30, 'pop-drop']]],
  [riso, 'Lapisan tinta misregistrasi', [[6, 'k3', 0.5], [16, 'k3', 0.5], [26, 'k3', 0.5]]],
  [vhs, 'OSD camcorder & tracking', [[0, 'transition-glitch', 0.5], [58, 'transition-glitch', 0.5]]],
  [y2k, 'Krom berkilau & jendela lama', [[30, 'pop-in'], [39, 'pop-in'], [48, 'ding-bell', 0.5]]],
  [pixel, 'Sprite platformer 8-bit', [[40, 'u1', 0.5], [52, 'u1', 0.5], [64, 'u1', 0.5]]],
  [blueprint, 'Garis dimensi draw-on', [[4, 'transition-scroll', 0.4], [62, 'tick', 0.5], [76, 'pop-in', 0.5]]],
  [papercut, 'Lapisan kertas multiplane', [[4, 'k2', 0.5], [12, 'k2', 0.5], [20, 'k2', 0.5], [28, 'k2', 0.5]]],
  [collage, 'Potongan ditempel & stempel', [[6, 'k2'], [14, 'k2'], [22, 'k2'], [60, 'impact-punch', 0.7]]],
  [midcentury, 'Sunburst & gelombang hangat', [[8, 'pop-pluck', 0.6], [36, 'data-reveal', 0.4]]],
  [artdeco, 'Kipas emas simetris', [[4, 'transition-whoosh-soft', 0.6], [50, 'ding-bell', 0.5]]],
  [ukiyoe, 'Gelombang berlapis & matahari', [[4, 'transition-whoosh-soft', 0.6], [50, 'ding-bell', 0.4]]],
  [nusantara, 'Tessellation motif kawung', [[4, 'data-reveal', 0.5], [56, 'confirm-glass', 0.5]]],
  [koran, 'Judul menghantam cetakan', [[8, 'impact-punch', 0.7], [30, 'k3', 0.4], [86, 'k1', 0.4]]],
  [terminal, 'Ketikan prompt & log', [[6, 'typing-loop', 0.6, 20], [40, 'tick-soft', 0.4], [54, 'typing-loop', 0.6, 32], [82, 'confirm-chime', 0.5]]],
  [wireframe, 'Mesh kawat menyala berurutan', [[4, 'riser-short', 0.5], [40, 'data-reveal', 0.5]]],
  [glitch, 'Pemisahan kanal RGB di beat', [[20, 'transition-glitch'], [50, 'transition-glitch'], [78, 'transition-glitch']]],
  [neon, 'Tabung menyala dengan flicker', [[10, 'tick', 0.6], [34, 'tick', 0.6], [70, 'toggle-off', 0.4], [76, 'toggle-on', 0.4]]],
  [chalk, 'Write-on kapur & debu', [[4, 'k1', 0.6], [54, 'k1', 0.5]]],
  [noir, 'Bayangan kisi jendela & hujan', [[0, 'transition-cinematic', 0.5], [60, 'impact-cinematic', 0.4]]],
  [retrofut, 'Orbit atom & garis kecepatan', [[4, 'riser-short', 0.5], [50, 'transition-swoosh', 0.5]]],
  [woodcut, 'Arsiran goresan demi goresan', [[4, 'k3', 0.5], [50, 'k3', 0.5]]],
  [rubberhose, 'Karakter selang memantul', [[15, 'pop-plop', 0.5], [45, 'pop-plop', 0.5], [75, 'pop-plop', 0.5]]],
  [manga, 'Speed lines & impact frame', [[4, 'transition-swoosh', 0.5], [36, 'impact-punch']]],
  [dataed, 'Batang tumbuh & anotasi', [[6, 'data-reveal', 0.6], [60, 'pop-in', 0.5]]],
  [inflatable, 'Huruf menggembung', [[6, 'pop-in'], [16, 'pop-in'], [26, 'pop-in'], [36, 'pop-in'], [50, 'pop-plop']]],
  [transit, 'Jalur 45° & kereta berjalan', [[4, 'transition-swipe', 0.5], [50, 'ding-bell', 0.5]]],
  [hud, 'HUD lock-on & kombo', [[0, 'transition-swoosh', 0.5], [40, 'tick', 0.5], [60, 'confirm-chime', 0.5]]],
  [sports, 'Papan skor miring', [[6, 'transition-swoosh', 0.6], [64, 'impact-punch', 0.7]]],
  [watercolor, 'Pigmen merembes', [[4, 'o1', 0.4], [28, 'o2', 0.4]]],
  [crayon, 'Goresan krayon menggambar', [[4, 'k1', 0.6], [30, 'k1', 0.6], [70, 'k1', 0.5]]],
  [motionreel, 'Move & settle editorial', [[6, 'transition-whoosh-soft', 0.6], [40, 'tick-soft', 0.5]]],
  [kitabedah, 'Katup gerbang dibedah 3D', [[14, 'transition-whoosh-soft', 0.55], [36, 'pop-in', 0.5], [50, 'pop-in', 0.5], [92, 'data-reveal', 0.5]]],
];

export const MOTIFS: Record<number, MotifMeta> = Object.fromEntries(
  LIST.map(([render, title, cues], i) => [i + 1, { render, title, line: '', cues }])
);

export { isDark, onColor };
