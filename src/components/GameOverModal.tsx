import React, { useEffect } from 'react';
import { Award, Flame, Crosshair, Clock, RotateCcw, Home } from 'lucide-react';
import { MatchStats } from '../game/types';

interface GameOverModalProps {
  stats: MatchStats;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onPlayAgain,
  onReturnToLobby,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        onPlayAgain();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayAgain]);

  const minutes = Math.floor(stats.survivalTimeSec / 60);
  const seconds = stats.survivalTimeSec % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 pointer-events-auto">
      <div className="max-w-md w-full bg-slate-950 border-2 border-amber-500/50 rounded-2xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
            stats.isBooyah ? 'bg-amber-500/30' : 'bg-red-600/20'
          }`}
        />

        {/* Title Header: BOOYAH! or ELIMINATED */}
        {stats.isBooyah ? (
          <div className="mb-6">
            <div className="inline-block px-4 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold tracking-widest uppercase mb-2 border border-amber-500/40">
              #1 CHAMPION · SURVIVOR
            </div>
            {/* BOOYAH! stylized text */}
            <h1 className="font-teko text-7xl sm:text-8xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-600 drop-shadow-[0_8px_16px_rgba(245,158,11,0.5)] leading-none">
              BOOYAH!
            </h1>
            <p className="text-amber-200/80 text-sm font-semibold tracking-wider mt-1">
              YOU SURVIVED THE BERMUDA BATTLEGROUND!
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <div className="inline-block px-4 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold tracking-widest uppercase mb-2 border border-red-500/40">
              RANK #{stats.rank} / {stats.totalPlayers}
            </div>
            <h1 className="font-teko text-6xl sm:text-7xl font-black tracking-wider text-red-500 leading-none">
              ELIMINATED
            </h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide mt-1">
              Better luck next match in Bermuda!
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold uppercase mb-0.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Kills
            </div>
            <div className="font-teko text-3xl font-bold text-amber-400 tabular-nums">
              {stats.kills}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold uppercase mb-0.5">
              <Crosshair className="w-3.5 h-3.5 text-red-400" /> Headshots
            </div>
            <div className="font-teko text-3xl font-bold text-red-400 tabular-nums">
              {stats.headshots}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold uppercase mb-0.5">
              <Award className="w-3.5 h-3.5 text-yellow-400" /> Damage
            </div>
            <div className="font-teko text-3xl font-bold text-white tabular-nums">
              {stats.damageDealt}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold uppercase mb-0.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Survived
            </div>
            <div className="font-teko text-3xl font-bold text-cyan-300 tabular-nums">
              {timeFormatted}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-teko text-2xl font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onReturnToLobby}
            className="w-full sm:w-auto py-3.5 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-rajdhani text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Lobby</span>
          </button>
        </div>
      </div>
    </div>
  );
};
