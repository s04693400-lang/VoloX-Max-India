import React, { useEffect, useState } from 'react';
import { Skull, Flame, Zap, Award } from 'lucide-react';
import { KillBadgeData } from '../game/types';

interface KillEffectBannerProps {
  killData: KillBadgeData | null;
  onDismiss: () => void;
}

export const KillEffectBanner: React.FC<KillEffectBannerProps> = ({ killData, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (killData) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [killData, onDismiss]);

  if (!killData || !visible) return null;

  const isHeadshot = killData.isHeadshot || killData.type === 'HEADSHOT';
  const isMultiKill = killData.type === 'DOUBLE_KILL' || killData.type === 'TRIPLE_KILL';

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none z-40 flex flex-col items-center animate-bounce-subtle">
      {/* Outer Glow Halo */}
      <div
        className={`relative flex flex-col items-center px-8 py-3.5 rounded-2xl border-3 shadow-2xl backdrop-blur-md ${
          isHeadshot
            ? 'bg-gradient-to-b from-red-950/95 to-slate-950/95 border-red-500 shadow-red-600/70'
            : isMultiKill
            ? 'bg-gradient-to-b from-amber-950/95 to-slate-950/95 border-amber-400 shadow-amber-500/70'
            : 'bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-orange-500 shadow-orange-500/50'
        }`}
      >
        {/* Animated Skull Badge Icon */}
        <div className="relative mb-1 flex items-center justify-center">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-xl ${
              isHeadshot
                ? 'bg-red-600 border-white text-white shadow-red-500/80 animate-pulse'
                : 'bg-gradient-to-tr from-amber-500 to-orange-600 border-white text-slate-950 shadow-orange-500/80'
            }`}
          >
            {isHeadshot ? (
              <Skull className="w-8 h-8 fill-white stroke-[2.5]" />
            ) : isMultiKill ? (
              <Flame className="w-8 h-8 fill-slate-950 stroke-[2.5]" />
            ) : (
              <Skull className="w-8 h-8 stroke-[2.5]" />
            )}
          </div>

          {/* Golden Wings / Laurel Accents */}
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-amber-400 text-lg font-black">
            ✦
          </div>
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-amber-400 text-lg font-black">
            ✦
          </div>
        </div>

        {/* Elimination Banner Title */}
        <div
          className={`font-teko text-4xl sm:text-5xl font-black uppercase tracking-wider leading-none ${
            isHeadshot
              ? 'text-red-400 drop-shadow-[0_2px_12px_rgba(239,68,68,0.9)]'
              : isMultiKill
              ? 'text-amber-300 drop-shadow-[0_2px_12px_rgba(245,158,11,0.9)]'
              : 'text-orange-400 drop-shadow-[0_2px_10px_rgba(249,115,22,0.8)]'
          }`}
        >
          {killData.type === 'HEADSHOT'
            ? '⚡ HEADSHOT ELIMINATION ⚡'
            : killData.type === 'FIRST_BLOOD'
            ? '🔥 FIRST BLOOD 🔥'
            : killData.type === 'DOUBLE_KILL'
            ? '💀 DOUBLE KILL 💀'
            : killData.type === 'TRIPLE_KILL'
            ? '🏆 TRIPLE KILL RAMPAGE 🏆'
            : 'ELIMINATED'}
        </div>

        {/* Victim & Weapon Subtitle */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-white font-rajdhani font-black text-sm tracking-wider uppercase">
            {killData.victimName}
          </span>
          <span className="text-slate-400 font-mono text-xs">•</span>
          <span className="px-2 py-0.5 rounded bg-black/60 border border-slate-700 text-slate-200 font-mono text-xs font-bold uppercase">
            {killData.weapon}
          </span>
          {isHeadshot && (
            <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-black text-[10px] uppercase font-mono tracking-wider">
              HEADSHOT
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
