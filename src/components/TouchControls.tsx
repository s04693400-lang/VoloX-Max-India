import React, { useRef, useState, useEffect } from 'react';
import {
  Crosshair,
  Shield,
  Plus,
  RotateCcw,
  Eye,
  ArrowUp,
  UserCheck,
  Zap,
  MessageSquare,
} from 'lucide-react';
import { StanceType } from '../game/models';

interface TouchControlsProps {
  currentStance: StanceType;
  onMoveVector: (vx: number, vy: number) => void;
  onLookDelta: (dx: number, dy: number) => void;
  onShootStart: () => void;
  onShootEnd: () => void;
  onToggleAim: () => void;
  onJump: () => void;
  onToggleCrouch: () => void;
  onToggleProne: () => void;
  onDeployGloo: () => void;
  onReload: () => void;
  onMedkit: () => void;
  onPickupLoot?: () => void;
  onToggleHealingType?: () => void;
  nearbyLoot?: any;
  glooCount: number;
  medkitCount: number;
  isScoped: boolean;
  characterSkillCooldown?: number;
  isSkillActive?: boolean;
  onActivateSkill?: () => void;
  onOpenChat?: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  currentStance,
  onMoveVector,
  onLookDelta,
  onShootStart,
  onShootEnd,
  onToggleAim,
  onJump,
  onToggleCrouch,
  onToggleProne,
  onDeployGloo,
  onReload,
  onMedkit,
  onPickupLoot,
  onToggleHealingType,
  nearbyLoot,
  glooCount,
  medkitCount,
  isScoped,
  characterSkillCooldown = 0,
  isSkillActive = false,
  onActivateSkill,
  onOpenChat,
}) => {
  // Virtual Joystick State
  const joystickRef = useRef<HTMLDivElement>(null);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  // Look Touch State
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPosRef = useRef({ x: 0, y: 0 });

  const handleJoystickStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsJoystickActive(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsJoystickActive(false);
        setJoystickPos({ x: 0, y: 0 });
        onMoveVector(0, 0);
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = rect.width / 2;

    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxRadius);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setJoystickPos({ x: knobX, y: knobY });
    onMoveVector(knobX / maxRadius, knobY / maxRadius);
  };

  // Right-half Touch Look Handler
  const handleLookStart = (e: React.TouchEvent) => {
    if (lookTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    // Check if on right half of screen
    if (touch.clientX > window.innerWidth * 0.38) {
      lookTouchIdRef.current = touch.identifier;
      lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleLookMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        const dx = touch.clientX - lastLookPosRef.current.x;
        const dy = touch.clientY - lastLookPosRef.current.y;
        lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
        onLookDelta(dx, dy);
        break;
      }
    }
  };

  const handleLookEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        break;
      }
    }
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-30"
      onTouchStart={handleLookStart}
      onTouchMove={handleLookMove}
      onTouchEnd={handleLookEnd}
      onTouchCancel={handleLookEnd}
    >
      {/* 1. Virtual Analog Joystick (Bottom-Left) */}
      <div
        ref={joystickRef}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
        className="absolute bottom-6 left-6 w-36 h-36 rounded-full border-2 border-amber-500/40 bg-slate-950/60 pointer-events-auto flex items-center justify-center shadow-2xl backdrop-blur-none"
      >
        {/* Outer concentric guide */}
        <div className="w-20 h-20 rounded-full border border-amber-500/20 absolute" />

        {/* Floating Joystick Thumb Knob */}
        <div
          className={`w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 border-2 border-white shadow-lg transition-transform ${
            isJoystickActive ? 'scale-105' : ''
          }`}
          style={{
            transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
          }}
        >
          <div className="w-full h-full rounded-full flex items-center justify-center opacity-75">
            <div className="w-4 h-4 rounded-full bg-white/70" />
          </div>
        </div>
      </div>

      {/* 2. Right-Hand Action Buttons Cluster - Highly Visible & Tactile */}
      <div className="absolute bottom-6 right-6 flex items-end gap-3 pointer-events-auto">
        {/* Stance Buttons: Crouch / Sit & Prone / Lie down */}
        <div className="flex flex-col gap-2.5 mb-1">
          {/* Prone / Lie Button */}
          <button
            onClick={onToggleProne}
            className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center font-black text-xs tracking-wider uppercase transition-all shadow-xl ${
              currentStance === 'prone'
                ? 'bg-amber-500 text-slate-950 border-white scale-110 shadow-amber-500/50'
                : 'bg-slate-950/90 text-amber-200 border-amber-500/50 active:scale-95'
            }`}
          >
            <div className="font-mono text-xs">LIE</div>
            <div className="text-[9px] opacity-80">PRONE</div>
          </button>

          {/* Crouch / Sit Button */}
          <button
            onClick={onToggleCrouch}
            className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center font-black text-xs tracking-wider uppercase transition-all shadow-xl ${
              currentStance === 'crouching'
                ? 'bg-amber-500 text-slate-950 border-white scale-110 shadow-amber-500/50'
                : 'bg-slate-950/90 text-amber-200 border-amber-500/50 active:scale-95'
            }`}
          >
            <div className="font-mono text-xs">SIT</div>
            <div className="text-[9px] opacity-80">CROUCH</div>
          </button>

          {/* Jump Button */}
          <button
            onClick={onJump}
            className="w-14 h-14 rounded-full bg-slate-950/90 hover:bg-slate-800 border-2 border-emerald-400 text-emerald-200 flex flex-col items-center justify-center shadow-xl active:scale-95"
          >
            <ArrowUp className="w-5 h-5 text-emerald-400 stroke-[3]" />
            <span className="text-[10px] font-black">JUMP</span>
          </button>
        </div>

        {/* Center Combat Trigger: Skill, Aim & Shoot */}
        <div className="flex flex-col items-center gap-2.5">
          {/* Free Fire Character Active Skill Button */}
          {onActivateSkill && (
            <button
              onClick={onActivateSkill}
              disabled={characterSkillCooldown > 0}
              className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center shadow-xl transition-all ${
                isSkillActive
                  ? 'bg-amber-400 text-slate-950 border-white scale-110 animate-pulse shadow-[0_0_18px_#f59e0b]'
                  : characterSkillCooldown > 0
                  ? 'bg-slate-950/80 text-slate-500 border-slate-700 opacity-60'
                  : 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] active:scale-95'
              }`}
            >
              <Zap className="w-5 h-5 fill-current" />
              <span className="text-[9px] font-black leading-none">
                {characterSkillCooldown > 0 ? `${Math.ceil(characterSkillCooldown)}s` : 'SKILL'}
              </span>
            </button>
          )}

          {/* Aim / Scope Button */}
          <button
            onClick={onToggleAim}
            className={`w-15 h-15 rounded-full border-2 flex items-center justify-center shadow-xl transition-all ${
              isScoped
                ? 'bg-red-600 text-white border-white scale-110 shadow-[0_0_18px_#ef4444]'
                : 'bg-slate-950/90 text-amber-300 border-amber-400 active:scale-95'
            }`}
          >
            <Eye className="w-7 h-7 stroke-[2.5]" />
          </button>

          {/* Big Free Fire Fire / Shoot Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onShootStart();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onShootEnd();
            }}
            onMouseDown={onShootStart}
            onMouseUp={onShootEnd}
            className="w-22 h-22 rounded-full bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 border-4 border-amber-200 text-slate-950 flex flex-col items-center justify-center shadow-2xl shadow-orange-500/70 active:scale-90 transition-transform"
          >
            <Crosshair className="w-9 h-9 text-slate-950 stroke-[3]" />
            <span className="text-[11px] font-black tracking-widest uppercase">FIRE</span>
          </button>
        </div>
      </div>

      {/* 3. Quick Gloo Wall, Medkit & Loot Touch Buttons (Mid-Right Edge) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 pointer-events-auto">
        {/* Live Chat Button on Mobile */}
        {onOpenChat && (
          <button
            onClick={onOpenChat}
            className="w-14 h-14 rounded-2xl bg-sky-950/90 border-2 border-sky-400 text-sky-200 flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <MessageSquare className="w-5 h-5 text-sky-400" />
            <span className="text-[9px] font-black">CHAT</span>
          </button>
        )}

        {/* Loot Pickup Quick Button on mobile screen */}
        {nearbyLoot && onPickupLoot && (
          <button
            onClick={onPickupLoot}
            className="w-14 h-14 rounded-2xl bg-orange-500 border-2 border-white text-slate-950 flex flex-col items-center justify-center shadow-xl shadow-orange-500/50 active:scale-90 transition-transform animate-bounce"
          >
            <span className="text-sm font-black font-mono">LOOT</span>
            <span className="text-[8px] font-black uppercase truncate max-w-[50px]">{nearbyLoot.name}</span>
          </button>
        )}

        {/* Gloo Wall Shield Button */}
        <button
          onClick={onDeployGloo}
          className="w-14 h-14 rounded-2xl bg-cyan-950/90 border-2 border-cyan-400 text-cyan-200 flex flex-col items-center justify-center shadow-lg shadow-cyan-500/25 active:scale-90 transition-transform"
        >
          <Shield className="w-5 h-5 text-cyan-300" />
          <span className="text-[9px] font-black">GLOO ({glooCount})</span>
        </button>

        {/* Healing Button */}
        <button
          onClick={onMedkit}
          className="w-14 h-14 rounded-2xl bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/25 active:scale-90 transition-transform"
        >
          <Plus className="w-5 h-5 text-emerald-300 stroke-[3]" />
          <span className="text-[9px] font-black">HEAL ({medkitCount})</span>
        </button>

        {/* Reload Button */}
        <button
          onClick={onReload}
          className="w-14 h-14 rounded-2xl bg-slate-950/90 border-2 border-slate-600 text-slate-200 flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <RotateCcw className="w-5 h-5 text-amber-400" />
          <span className="text-[9px] font-black">RELOAD</span>
        </button>
      </div>
    </div>
  );
};
