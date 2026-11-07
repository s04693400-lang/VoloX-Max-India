import React, { useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Shield,
  Crosshair,
  Flame,
  Smartphone,
  Monitor,
  Download,
  Copy,
  Check,
  Globe,
  User,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface TitleScreenProps {
  onStartGame: (playerName: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  isMuted,
  onToggleMute,
}) => {
  const [playerName, setPlayerName] = useState('Warrior_IN');
  const [copied, setCopied] = useState(false);
  const { isInstallable, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        // Prevent trigger if typing in input
        if (document.activeElement?.tagName === 'INPUT') return;
        onStartGame(playerName || 'Warrior_IN');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame, playerName]);

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between p-4 sm:p-10 pointer-events-auto bg-gradient-to-t from-black/90 via-black/50 to-black/30 overflow-y-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 via-white to-emerald-600 flex items-center justify-center shadow-lg shadow-orange-500/30 border border-orange-400/50 p-0.5">
            <div className="w-full h-full bg-slate-950 rounded flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
            </div>
          </div>
          <div>
            <div className="text-[11px] tracking-widest uppercase font-extrabold text-orange-400 flex items-center gap-1.5">
              <span>🇮🇳 INDIA SERVER</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-sm font-extrabold text-white tracking-wider">
              VOLOX MAX INDIA · MULTIPLAYER
            </div>
          </div>
        </div>

        {/* Top-Right: Sound toggle & APK Install */}
        <div className="flex items-center gap-2">
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download APK</span>
            </button>
          )}

          {isIOS && (
            <button
              onClick={() => setShowIOSModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install PWA</span>
            </button>
          )}

          <button
            onClick={onToggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold tracking-wider uppercase border border-slate-700/60 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-orange-400" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound'}</span>
          </button>
        </div>
      </div>

      {/* Hero Title Lockup: VoloX Max India */}
      <div className="max-w-4xl mx-auto text-center my-auto flex flex-col items-center py-4">
        {/* Regional Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500/20 via-white/10 to-emerald-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold tracking-widest uppercase mb-3 shadow-sm">
          <span>🇮🇳</span> 100% REAL HUMAN MULTIPLAYER · ZERO BOTS
        </div>

        {/* Title Lockup SVG */}
        <div className="w-full max-w-2xl py-1">
          <svg viewBox="0 0 700 130" className="w-full drop-shadow-[0_10px_25px_rgba(249,115,22,0.4)]">
            <defs>
              <linearGradient id="voloxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="25%" stopColor="#fdba74" />
                <stop offset="60%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#c2410c" />
              </linearGradient>
            </defs>

            <text
              x="50%"
              y="75"
              textAnchor="middle"
              className="font-teko text-[86px] font-black tracking-wider"
              fill="url(#voloxGrad)"
              stroke="#431407"
              strokeWidth="3"
            >
              VOLOX MAX
            </text>

            <text
              x="50%"
              y="115"
              textAnchor="middle"
              className="font-rajdhani text-[24px] font-black tracking-[0.45em]"
              fill="#34d399"
            >
              INDIA BATTLEGROUND
            </text>
          </svg>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto mb-6 font-medium tracking-wide">
          Real-time human multiplayer battle royale for phone and computer. Master real human movement—running, shooting, sitting, standing, and lieing prone.
        </p>

        {/* Player Name Input Card */}
        <div className="w-full max-w-sm bg-slate-950/85 border border-orange-500/40 rounded-xl p-3.5 shadow-2xl mb-5 flex flex-col gap-2">
          <label className="text-[11px] font-bold text-orange-400 uppercase tracking-widest text-left flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Enter Warrior Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={16}
            placeholder="e.g. Veer_Max"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white font-rajdhani font-bold text-base focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Enter Battle CTA Button */}
        <button
          onClick={() => onStartGame(playerName || 'Warrior_IN')}
          className="group relative px-10 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 hover:from-orange-400 hover:to-emerald-500 text-slate-950 font-teko text-3xl font-black tracking-widest uppercase rounded-xl shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/80 transition-all transform hover:-translate-y-0.5 active:translate-y-0 border-t border-amber-200"
        >
          <div className="flex items-center gap-3">
            <Crosshair className="w-6 h-6 text-slate-950" />
            <span>ENTER BATTLEGROUND</span>
            <span className="hidden sm:inline text-xs font-rajdhani bg-slate-950/20 px-2 py-0.5 rounded text-slate-950/90 font-bold ml-1">
              SPACE / ENTER
            </span>
          </div>
        </button>

        {/* Share Room / Invite Real Human Friends */}
        <button
          onClick={copyRoomLink}
          className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-orange-400" />}
          <span>{copied ? 'Link Copied! Open on Phone or 2nd Tab' : 'Copy Room Link (Play with Friends / Test on Phone)'}</span>
        </button>

        {/* Cross-Platform Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-2xl w-full text-center">
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <Smartphone className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white uppercase">Mobile APK</div>
            <div className="text-[11px] text-slate-400">Touch Analog Joystick</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <Monitor className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white uppercase">Computer PC</div>
            <div className="text-[11px] text-slate-400">WASD & Mouse Aim</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <Globe className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white uppercase">Real Human</div>
            <div className="text-[11px] text-slate-400">WebSocket Multiplayer</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <Shield className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white uppercase">Gloo Wall</div>
            <div className="text-[11px] text-slate-400">Deploy Ice Barricades</div>
          </div>
        </div>
      </div>

      {/* Flat Single Control-Hint Line (Phone & PC) */}
      <div className="w-full max-w-4xl mx-auto text-center mt-2">
        <div className="inline-block py-2 px-5 rounded-full bg-slate-950/85 border border-slate-800 text-[11px] text-slate-300 font-medium tracking-wider">
          <span className="text-orange-400 font-bold">PC</span>: WASD Move · Shift Sprint · Space Jump · <span className="text-amber-300 font-bold">C</span> Sit/Crouch · <span className="text-emerald-400 font-bold">Z</span> Lie/Prone · L-Click Shoot · R-Click Scope · <span className="text-cyan-400 font-bold">F</span> Gloo
          <span className="mx-2 text-slate-600">|</span>
          <span className="text-orange-400 font-bold">Phone</span>: Virtual Joystick · Dedicated Shoot, Scope, Jump, Sit & Lie Buttons
        </div>
      </div>

      {/* iOS PWA Install Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-white uppercase">Install VoloX Max on iPhone / iPad</h3>
            <p className="mt-3 text-xs text-slate-300 text-left leading-relaxed">
              1. Tap the <strong>Share</strong> button in the Safari browser toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
              3. Launch VoloX Max India directly like an APK app!
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full rounded-lg bg-orange-500 py-2.5 text-xs font-bold text-slate-950 uppercase"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
