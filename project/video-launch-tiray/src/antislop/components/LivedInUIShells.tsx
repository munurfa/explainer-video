import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { easeOutExpo, ip, microBob, staggeredSpringAt } from '../theme/easing-and-timing';
import { MotionStylePreset } from '../theme/styles-catalog';
import { BrandLogo, BuiltinBrandSlug } from './BrandLogos';
import { AnimatedProgressBar, FlyText, TypeText } from './KineticWords';

/**
 * REPLIKA UI AUTENTIK (<LivedInUIShells />)
 * ATURAN ANTI-SLOP:
 * - Tampilan browser, terminal, code editor, aplikasi chat, dan website WAJIB menyerupai aplikasi aslinya.
 * - Dilarang membuat kartu generik dengan teks ber-background pill yang tidak perlu atau titik bulat ("• teks") di samping label.
 * - Semua brand/framework menggunakan <BrandLogo /> resmi.
 */

export interface AuthenticTerminalProps {
  windowTitle?: string;
  cwd?: string;
  command: string;
  commandStartFrame?: number;
  logs?: { text: string; startFrame: number; color?: string }[];
  progressBar?: { label: string; startFrame: number; endFrame: number };
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

/**
 * 1. AUTHENTIC TERMINAL WINDOW (<AuthenticTerminalWindow />)
 * Replika jendela Terminal macOS / Claude Code CLI asli:
 * - Traffic lights (#FF5F56, #FFBD2E, #27C93F) + judul shell `claude — zsh — 80×24`
 * - Prompt autentik `~/project >` dengan ketikan <TypeText /> (otomatis bersuara ketikan!)
 * - Progress bar kompilasi/render dengan <AnimatedProgressBar /> (otomatis bersuara loading progress!)
 */
export const AuthenticTerminalWindow: React.FC<AuthenticTerminalProps> = ({
  windowTitle = 'claude — zsh — 96×28',
  cwd = '~/motion-studio',
  command,
  commandStartFrame = 10,
  logs = [],
  progressBar,
  width = 1040,
  height = 560,
  style,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        width,
        minHeight: height,
        backgroundColor: '#0D0F14',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'JetBrains Mono', 'SF Mono', Consolas, monospace",
        ...style,
      }}
    >
      {/* Titlebar macOS Terminal Asli */}
      <div
        style={{
          height: 44,
          backgroundColor: '#181B22',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: '#FF5F56' }} />
          <span style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: '#FFBD2E' }} />
          <span style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: '#27C93F' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94A3B8' }}>
          <BrandLogo brand="claude" size={16} />
          <span>{windowTitle}</span>
        </div>
        <div style={{ width: 52 }} />
      </div>

      {/* Isi Terminal */}
      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, fontSize: 20 }}>
          <span style={{ color: '#38BDF8', fontWeight: 600 }}>{cwd}</span>
          <span style={{ color: '#D97757', fontWeight: 700 }}>&gt;</span>
          <TypeText
            text={command}
            start={commandStartFrame}
            cps={1.55}
            size={20}
            color="#F8FAFC"
            newestColor="#D97757"
            weight={500}
            family="'JetBrains Mono', monospace"
            humanizeCadence
            enableTypingSfx
          />
        </div>

        {/* Output Log Baris demi Baris */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
          {logs.map((log, idx) => {
            const op = ip(frame, [log.startFrame, log.startFrame + 8], [0, 1], easeOutExpo);
            if (op <= 0) return null;
            return (
              <div
                key={idx}
                style={{
                  fontSize: 17,
                  color: log.color ?? '#94A3B8',
                  opacity: op,
                  transform: `translateY(${((1 - op) * 6).toFixed(1)}px)`,
                }}
              >
                {log.text}
              </div>
            );
          })}
        </div>

        {/* Loading / Render Progress Bar dengan SFX Otomatis */}
        {progressBar && frame >= progressBar.startFrame - 2 && (
          <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <AnimatedProgressBar
              label={progressBar.label}
              startFrame={progressBar.startFrame}
              endFrame={progressBar.endFrame}
              accentColor="#10B981"
              enableProgressSfx
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 2. AUTHENTIC BROWSER WINDOW (<AuthenticBrowserWindow />)
 * Replika jendela Browser Chrome / Arc / Safari asli:
 * - Tab bar dengan favicon <BrandLogo />, judul tab, tombol close `×` & tambah tab `+`
 * - Toolbar navigasi dengan tombol Back, Forward, Refresh SVG & URL Address Bar asli
 */
export interface AuthenticBrowserProps {
  tabTitle?: string;
  url?: string;
  brandFavicon?: BuiltinBrandSlug | string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const AuthenticBrowserWindow: React.FC<AuthenticBrowserProps> = ({
  tabTitle = 'Remotion Studio — Preview',
  url = 'localhost:3000/MainVideo',
  brandFavicon = 'remotion',
  width = 1120,
  height = 660,
  style,
  children,
}) => {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#111318',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 32px 84px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* Browser Tab Strip */}
      <div
        style={{
          height: 42,
          backgroundColor: '#0B0C10',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 16px',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignSelf: 'center', marginRight: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: '#FF5F56' }} />
          <span style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: '#FFBD2E' }} />
          <span style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: '#27C93F' }} />
        </div>

        {/* Active Tab */}
        <div
          style={{
            height: 34,
            padding: '0 16px',
            backgroundColor: '#181B22',
            borderRadius: '10px 10px 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            color: '#F1F5F9',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 500,
          }}
        >
          <BrandLogo brand={brandFavicon} size={15} />
          <span>{tabTitle}</span>
          <span style={{ marginLeft: 10, color: '#64748B', fontSize: 14 }}>×</span>
        </div>

        <span style={{ alignSelf: 'center', color: '#64748B', fontSize: 18 }}>+</span>
      </div>

      {/* Browser Navigation & URL Address Bar */}
      <div
        style={{
          height: 46,
          backgroundColor: '#181B22',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 14,
        }}
      >
        {/* Back / Forward / Reload */}
        <div style={{ display: 'flex', gap: 12, color: '#94A3B8' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" opacity="0.45">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* URL Omni-Box */}
        <div
          style={{
            flex: 1,
            height: 30,
            backgroundColor: '#0D0F14',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            color: '#CBD5E1',
          }}
        >
          <span style={{ color: '#64748B', marginRight: 4 }}>http://</span>
          <span>{url}</span>
        </div>
      </div>

      {/* Browser Viewport Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{children}</div>
    </div>
  );
};

export interface ChatBubbleItem {
  text: string;
  isSender?: boolean;
  startFrame: number;
  hasTail?: boolean;
}

export interface ChatAppShellProps {
  contactName?: string;
  bubbles: ChatBubbleItem[];
  inputTypedText?: string;
  inputTypeStartFrame?: number;
  headerRevealFrame?: number;
  stylePreset: MotionStylePreset;
}

/**
 * 3. AUTHENTIC CHAT APP SHELL (<ChatAppShell />)
 */
export const ChatAppShell: React.FC<ChatAppShellProps> = ({
  contactName = 'studio.workspace',
  bubbles,
  inputTypedText = 'Deploy instant motion build...',
  inputTypeStartFrame = 36,
  headerRevealFrame = 62,
  stylePreset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { palette, typography } = stylePreset;

  const headerT = ip(frame, [headerRevealFrame, headerRevealFrame + 14], [0, 1], easeOutExpo);
  const avatarSp = staggeredSpringAt(frame, headerRevealFrame, 1, fps);
  const inputSp = staggeredSpringAt(frame, 12, 0, fps);

  return (
    <div
      style={{
        position: 'absolute',
        left: 340,
        top: 76,
        width: 1240,
        height: 790,
        backgroundColor: palette.surface,
        borderRadius: 32,
        border: `2px solid ${palette.ink}1F`,
        boxShadow: '0 28px 75px rgba(0,0,0,0.14)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: 92,
          padding: '0 36px',
          borderBottom: `1px solid ${palette.ink}14`,
          backgroundColor: `${palette.surface}F2`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: headerT,
          transform: `translate3d(0, ${((1 - headerT) * -22).toFixed(1)}px, 0)`,
          zIndex: 10,
        }}
      >
        <svg width="28" height="32" viewBox="0 0 24 24">
          <path
            d="M15.5 4.5 8 12l7.5 7.5"
            stroke={palette.ink}
            strokeWidth="2.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `scale(${(0.5 + 0.5 * avatarSp).toFixed(3)})`,
          }}
        >
          <BrandLogo brand="claude" size={38} />
          <div
            style={{
              marginTop: 4,
              fontFamily: typography.body,
              fontSize: 15,
              fontWeight: 600,
              color: palette.ink,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>{contactName}</span>
            <svg width="11" height="11" viewBox="0 0 24 24">
              <path d="M9 5.5 15.5 12 9 18.5" stroke={palette.muted} strokeWidth="2.8" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <svg width="38" height="28" viewBox="0 0 32 24">
          <rect x="1" y="2" width="21" height="20" rx="5" stroke={palette.ink} strokeWidth="2.2" fill="none" />
          <path d="M22 9.5 30 5v14l-8-4.5z" stroke={palette.ink} strokeWidth="2.2" fill="none" strokeLinejoin="round" />
        </svg>
      </div>

      <div style={{ padding: '38px 54px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {bubbles.map((b, idx) => {
          const sp = staggeredSpringAt(frame, b.startFrame, 0, fps);
          const appear = ip(frame, [b.startFrame - 2, b.startFrame + 3], [0, 1]);
          if (appear <= 0) return null;

          const bgCol = b.isSender ? palette.accent : '#E9E9EC';
          const txtCol = b.isSender ? '#FFFFFF' : '#101012';

          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                alignSelf: b.isSender ? 'flex-end' : 'flex-start',
                padding: '18px 30px',
                borderRadius: 999,
                backgroundColor: bgCol,
                opacity: appear,
                transform: `translate3d(0, ${((1 - sp) * 26).toFixed(1)}px, 0) scale(${(0.62 + 0.38 * sp).toFixed(3)})`,
                transformOrigin: b.isSender ? '100% 100%' : '0% 100%',
              }}
            >
              <FlyText
                text={b.text}
                start={b.startFrame}
                stagger={1.5}
                dur={10}
                size={27}
                weight={600}
                family={typography.body}
                color={txtCol}
                yOffset={26}
                xOffset={10}
                rotateSpread={4}
              />
              {b.hasTail && <BubbleTail color={bgCol} side={b.isSender ? 'br' : 'bl'} />}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 34,
          right: 34,
          bottom: 24,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          transform: `translate3d(0, ${((1 - inputSp) * 32).toFixed(1)}px, 0)`,
          opacity: inputSp,
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 999,
            backgroundColor: palette.bg,
            border: `1.5px solid ${palette.ink}1F`,
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 34,
            color: palette.ink,
            fontWeight: 300,
          }}
        >
          +
        </div>

        <div
          style={{
            flex: 1,
            height: 54,
            borderRadius: 999,
            backgroundColor: palette.bg,
            border: `1.5px solid ${palette.ink}22`,
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
        >
          <TypeText
            text={inputTypedText}
            start={inputTypeStartFrame}
            cps={1.6}
            size={21}
            color={palette.ink}
            family={typography.body}
            humanizeCadence
            enableTypingSfx
            cursor
          />
          <svg width="20" height="24" viewBox="0 0 24 24">
            <path
              d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-4 4.9V19h2v2H9v-2h2v-2.1A5 5 0 0 1 7 12h2a3 3 0 0 0 6 0h2z"
              fill={palette.muted}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

const BubbleTail: React.FC<{ color: string; side: 'bl' | 'br' }> = ({ color, side }) => (
  <svg
    width="22"
    height="26"
    viewBox="0 0 28 34"
    style={{
      position: 'absolute',
      bottom: -2,
      [side === 'bl' ? 'left' : 'right']: -6,
      transform: side === 'bl' ? 'scaleX(-1)' : undefined,
    }}
  >
    <path d="M0 0 C2 14 10 26 26 32 C12 34 2 30 0 22 Z" fill={color} />
  </svg>
);

/**
 * 4. MAC DESKTOP & WINDOW SHELL (<MacDesktopChrome />)
 * Menu Bar macOS asli (dengan ikon Apple SVG, bukan titik bulat!) + Floating Dock dengan Logo Brand Asli (<BrandLogo />)
 */
export const MacDesktopChrome: React.FC<{
  appName?: string;
  clockText?: string;
  stylePreset: MotionStylePreset;
  children: React.ReactNode;
}> = ({ appName = 'Remotion Studio', clockText = 'Sat 03:40 PM', stylePreset, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { typography } = stylePreset;

  const dockSp = staggeredSpringAt(frame, 4, 1, fps);
  const dockBrands: BuiltinBrandSlug[] = ['claude', 'remotion', 'vscode', 'react', 'typescript', 'after-effects'];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {children}

      {/* Screen-Fixed macOS Top Menu Bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 34,
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          fontFamily: typography.body,
          fontSize: 14,
          color: '#1A1A1A',
          zIndex: 85,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <BrandLogo brand="remotion" size={16} />
          <b style={{ fontWeight: 700 }}>{appName}</b>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Window</span>
          <span>Help</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: typography.mono, fontSize: 13 }}>
          <span style={{ fontWeight: 600 }}>{clockText}</span>
        </div>
      </div>

      {/* Screen-Fixed Bottom Floating Dock dengan Official Brand Logos */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 104,
          transform: `translate3d(-50%, ${((1 - dockSp) * 45).toFixed(1)}px, 0)`,
          opacity: dockSp,
          height: 62,
          padding: '0 18px',
          borderRadius: 20,
          backgroundColor: 'rgba(24,26,32,0.82)',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
          border: '1px solid rgba(255,255,255,0.16)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          zIndex: 85,
        }}
      >
        {dockBrands.map((brand, idx) => {
          const { dy } = microBob(frame, idx, 2.2, 0.2);
          return (
            <div
              key={brand}
              style={{
                width: 42,
                height: 42,
                borderRadius: 11,
                backgroundColor: 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `translateY(${dy.toFixed(1)}px)`,
              }}
            >
              <BrandLogo brand={brand} size={28} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
