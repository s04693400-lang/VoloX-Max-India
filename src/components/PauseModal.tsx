import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Shield, Crosshair } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onReturnToLobby: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onReturnToLobby,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 pointer-events-auto">
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
        <h2 className="font-teko text-5xl font-bold tracking-wider text-amber-400 mb-2">
          GAME PAUSED
        </h2>
        <p className="text-slate-400 text-xs font-medium tracking-wide mb-6">
          Take a breath, Survivor. The safe zone is waiting.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-teko text-2xl font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>RESUME MATCH</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            <span>{isMuted ? 'Unmute Sound' : 'Mute Sound'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onRestart}
              className="w-1/2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>

            <button
              onClick={onReturnToLobby}
              className="w-1/2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Lobby</span>
            </button>
          </div>
        </div>

        {/* Quick Controls Cheat Sheet */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-left">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Controls Reference
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
            <div><span className="text-amber-400">WASD</span> : Move</div>
            <div><span className="text-amber-400">Shift</span> : Sprint</div>
            <div><span className="text-amber-400">Space</span> : Jump</div>
            <div><span className="text-amber-400">C</span> : Crouch</div>
            <div><span className="text-amber-400">L-Click</span> : Shoot</div>
            <div><span className="text-amber-400">R-Click</span> : Scope / ADS</div>
            <div><span className="text-cyan-400">F / G</span> : Gloo Wall</div>
            <div><span className="text-emerald-400">V</span> : Medkit Heal</div>
            <div><span className="text-amber-400">1 - 4</span> : Weapons</div>
            <div><span className="text-amber-400">R</span> : Reload</div>
          </div>
        </div>
      </div>
    </div>
  );
};
