import React from 'react';
import { WeaponId } from '../game/types';

interface ScopeOverlayProps {
  weaponId: WeaponId;
  zoomFov?: number;
}

export const ScopeOverlay: React.FC<ScopeOverlayProps> = ({ weaponId, zoomFov = 50 }) => {
  const isSniper8x = weaponId === 'awm';
  const isMarksman4x = weaponId === 'kar98k';
  const isRifle2x = weaponId === 'scar' || weaponId === 'ak47';

  // 1. AWM 8X HIGH-POWER SNIPER SCOPE
  if (isSniper8x) {
    return (
      <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden animate-fade-in">
        {/* Full black periphery blackout */}
        <div className="absolute inset-0 bg-black/92 pointer-events-none" />

        {/* Circular glass lens */}
        <div className="relative w-[86vh] h-[86vh] rounded-full border-4 border-slate-900 shadow-[0_0_140px_rgba(0,0,0,0.98)_inset] bg-transparent overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-950/20 pointer-events-none" />

          {/* Thin Hairline Reticle */}
          <div className="absolute w-full h-[1.5px] bg-red-600/90 shadow-[0_0_4px_#ef4444]" />
          <div className="absolute h-full w-[1.5px] bg-red-600/90 shadow-[0_0_4px_#ef4444]" />

          {/* Glowing Center Red Pip */}
          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] z-10" />

          {/* Mil-dot ticks on Y-axis */}
          {[-160, -120, -80, -50, -25, 25, 50, 80, 120, 160, 200].map((offset) => (
            <div
              key={offset}
              className="absolute h-[1.5px] bg-red-500/80"
              style={{
                top: `calc(50% + ${offset}px)`,
                width: offset % 50 === 0 ? '28px' : '14px',
              }}
            />
          ))}

          {/* Mil-dot ticks on X-axis */}
          {[-140, -100, -70, -40, 40, 70, 100, 140].map((offset) => (
            <div
              key={offset}
              className="absolute w-[1.5px] bg-red-500/80"
              style={{
                left: `calc(50% + ${offset}px)`,
                height: offset % 50 === 0 ? '24px' : '12px',
              }}
            />
          ))}

          {/* Optical Data Overlay */}
          <div className="absolute bottom-14 right-16 text-red-400 font-mono text-xs font-black tracking-widest text-right drop-shadow-md">
            <div className="text-sm font-black">AWM 8X SNIPER</div>
            <div>RANGE: 240M</div>
            <div>CALIBER: .300 MAG</div>
            <div className="text-emerald-400">STATUS: LOCKED</div>
          </div>

          <div className="absolute top-14 left-16 text-red-400 font-mono text-xs font-black tracking-widest drop-shadow-md">
            <div className="text-amber-400 font-black">VOLOX MAX OPTICS</div>
            <div>ZOOM: 8.0X MAG</div>
            <div>FOV: {Math.round(zoomFov)}°</div>
          </div>
        </div>
      </div>
    );
  }

  // 2. KAR98K 4X TACTICAL MARKSMAN SCOPE
  if (isMarksman4x) {
    return (
      <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-black/75 pointer-events-none" />

        <div className="relative w-[78vh] h-[78vh] rounded-full border-4 border-amber-950/80 shadow-[0_0_100px_rgba(0,0,0,0.9)_inset] overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-950/15 pointer-events-none" />

          {/* Crosshairs */}
          <div className="absolute w-full h-[1.5px] bg-amber-400/90" />
          <div className="absolute h-full w-[1.5px] bg-amber-400/90" />

          {/* Chevron Reticle in Center */}
          <div className="w-4 h-4 border-t-2 border-l-2 border-amber-400 rotate-45 -translate-y-1 shadow-[0_0_8px_#f59e0b] z-10" />

          {/* Range rings */}
          <div className="w-20 h-20 rounded-full border border-amber-400/40 absolute" />
          <div className="w-44 h-44 rounded-full border border-amber-400/25 absolute" />

          {/* Scope details */}
          <div className="absolute bottom-12 text-center text-amber-400 font-mono text-xs font-extrabold tracking-widest">
            <span>KAR98K 4X TACTICAL · 190M</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. RIFLE / PISTOL 2X HOLOGRAPHIC & RED DOT SIGHT
  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden animate-fade-in">
      {/* Soft Vignette Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

      {/* Holographic Sight Housing Ring */}
      <div className="relative w-[58vh] h-[58vh] rounded-full border-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)_inset] flex items-center justify-center">
        {/* Subtle holographic cyan-amber lens coating */}
        <div className="absolute inset-0 bg-cyan-500/5 rounded-full" />

        {/* Outer illuminated targeting reticle ring */}
        <div className="w-28 h-28 rounded-full border-2 border-red-500/80 shadow-[0_0_12px_#ef4444] absolute flex items-center justify-center">
          {/* Top, Bottom, Left, Right cross notches */}
          <div className="absolute -top-3 w-1 h-3 bg-red-500 shadow-[0_0_6px_#ef4444]" />
          <div className="absolute -bottom-3 w-1 h-3 bg-red-500 shadow-[0_0_6px_#ef4444]" />
          <div className="absolute -left-3 h-1 w-3 bg-red-500 shadow-[0_0_6px_#ef4444]" />
          <div className="absolute -right-3 h-1 w-3 bg-red-500 shadow-[0_0_6px_#ef4444]" />
        </div>

        {/* Glowing Red Dot in Exact Center */}
        <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_#ff0033] z-20 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-white" />
        </div>

        {/* Tactical HUD Data Pill */}
        <div className="absolute bottom-6 px-3 py-1 rounded bg-black/80 border border-red-500/40 text-[10px] font-mono font-black text-red-400 tracking-widest uppercase">
          {isRifle2x ? '2X HOLOGRAPHIC SIGHT' : 'RED DOT REFLEX'} · {Math.round(zoomFov)}° FOV
        </div>
      </div>
    </div>
  );
};
