import React from 'react';
import {
  Shield,
  Flame,
  Users,
  Heart,
  Zap,
  Plus,
  Radio,
  Sparkles,
  Wifi,
  Download,
  RotateCcw,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import {
  SurvivorStats,
  WeaponState,
  WeaponId,
  WEAPON_DEFINITIONS,
  KillFeedEntry,
  LootItem,
  HELMET_DEFINITIONS,
  VEST_DEFINITIONS,
  HEALING_DEFINITIONS,
} from '../game/types';
import { RARITY_COLORS } from '../game/lootSystem';
import { StanceType } from '../game/models';
import { CHARACTERS } from '../game/characterSkills';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface GameHUDProps {
  stats: SurvivorStats;
  currentWeaponState: WeaponState;
  currentWeaponId: WeaponId;
  slots: Record<1 | 2 | 3 | 4, WeaponId>;
  activeSlot: 1 | 2 | 3 | 4;
  nearbyLoot: LootItem | null;
  currentStance: StanceType;
  aliveCount: number;
  killFeed: KillFeedEntry[];
  zoneTime: number;
  isZoneShrinking: boolean;
  zonePhase: number;
  hitmarker: { isHeadshot: boolean; timestamp: number } | null;
  airdropAlert: boolean;
  characterId?: string;
  skillCooldown?: number;
  maxSkillCooldown?: number;
  isSkillActive?: boolean;
  unreadChatCount?: number;
  onDeployGlooWall: () => void;
  onUseHealing: () => void;
  onToggleHealingType: () => void;
  onSelectSlot: (slot: 1 | 2 | 3 | 4) => void;
  onPickupLoot: () => void;
  onReload: () => void;
  onToggleCrouch: () => void;
  onToggleProne: () => void;
  onActivateSkill?: () => void;
  onOpenChat?: () => void;
  onOpenApkModal?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  currentWeaponState,
  currentWeaponId,
  slots,
  activeSlot,
  nearbyLoot,
  currentStance,
  aliveCount,
  killFeed,
  zoneTime,
  isZoneShrinking,
  zonePhase,
  hitmarker,
  airdropAlert,
  characterId = 'alok',
  skillCooldown = 0,
  maxSkillCooldown = 45,
  isSkillActive = false,
  unreadChatCount = 0,
  onDeployGlooWall,
  onUseHealing,
  onToggleHealingType,
  onSelectSlot,
  onPickupLoot,
  onReload,
  onToggleCrouch,
  onToggleProne,
  onActivateSkill,
  onOpenChat,
  onOpenApkModal,
}) => {
  const charDef = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];
  const currentDef = WEAPON_DEFINITIONS[currentWeaponId];
  const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
  const epPercent = Math.max(0, Math.min(100, (stats.ep / stats.maxEp) * 100));

  // Armor percentages & labels
  const helmetDurabilityPercent =
    stats.armor.maxHelmetDurability > 0
      ? Math.max(0, Math.min(100, (stats.armor.helmetDurability / stats.armor.maxHelmetDurability) * 100))
      : 0;
  const vestDurabilityPercent =
    stats.armor.maxVestDurability > 0
      ? Math.max(0, Math.min(100, (stats.armor.vestDurability / stats.armor.maxVestDurability) * 100))
      : 0;

  // Caliber display name
  const ammoCaliberLabel =
    currentDef.ammoType === 'ammo_ar'
      ? '5.56mm'
      : currentDef.ammoType === 'ammo_sg'
      ? '12 Gauge'
      : currentDef.ammoType === 'ammo_hg'
      ? '9mm / .45'
      : currentDef.ammoType === 'ammo_sr'
      ? '.300 Magnum'
      : 'Melee';

  const reserveAmmo = currentDef.ammoType ? stats.ammo[currentDef.ammoType] || 0 : 0;
  const activeHealing = stats.healing.activeType;
  const activeHealingDef = HEALING_DEFINITIONS[activeHealing];
  const activeHealingCount =
    activeHealing === 'medkit' ? stats.healing.medkits : stats.healing.bandages;

  const showHitmarker = hitmarker && Date.now() - hitmarker.timestamp < 180;
  const { isInstallable, install } = usePWAInstall();

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex flex-col justify-between p-3 sm:p-5">
      {/* 1. TOP BAR CLUSTER */}
      <div className="flex items-start justify-between w-full max-w-7xl mx-auto">
        {/* Top-Left: Mini-Map in Left Corner (User Requirement: "Mini map in left corner") */}
        <div className="flex flex-col gap-2">
          {/* Tactical Circular Radar Mini-Map */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-orange-500/60 bg-slate-950/90 relative flex items-center justify-center shadow-2xl overflow-hidden pointer-events-auto">
            {/* Radar Sweep & Crosshairs */}
            <div className="absolute inset-0 border-t border-b border-orange-500/20 top-1/2 -translate-y-1/2" />
            <div className="absolute inset-0 border-l border-r border-orange-500/20 left-1/2 -translate-x-1/2" />
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-orange-500/25 absolute" />

            {/* Center Player Pointer (Local human player) */}
            <div className="w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 z-10 shadow-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>

            {/* Next Safe Zone Ring Indicator */}
            <div className="w-12 h-12 rounded-full border-2 border-white/80 absolute pointer-events-none" />

            {/* Compass labels */}
            <span className="absolute top-1 text-[9px] font-bold text-orange-400 font-mono">N</span>
            <span className="absolute bottom-1 text-[9px] font-bold text-orange-400 font-mono">S</span>
            <span className="absolute left-1.5 text-[9px] font-bold text-orange-400 font-mono">W</span>
            <span className="absolute right-1.5 text-[9px] font-bold text-orange-400 font-mono">E</span>

            {/* Location Tag */}
            <span className="absolute bottom-1.5 text-[8px] font-extrabold text-orange-300 tracking-wider">
              BERMUDA
            </span>
          </div>

          {/* India Server Status Badge & Stance */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 text-[10px] font-mono font-bold text-slate-300">
            <span className="text-sm">🇮🇳</span>
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400">18ms</span>
            <span className="text-slate-500">|</span>
            <span className="text-orange-400 uppercase tracking-wider">{currentStance}</span>
          </div>
        </div>

        {/* Top-Center: Alive & Kills Counter & Safe Zone Alert */}
        <div className="flex flex-col items-center">
          {/* VoloX Max India Banner & Alive Counter */}
          <div className="flex items-center gap-3 bg-slate-950/90 px-4 py-1.5 rounded-b-xl border-x border-b border-orange-500/40 shadow-xl">
            <div className="flex items-center gap-1.5 pr-3 border-r border-slate-800">
              <Users className="w-4 h-4 text-orange-400" />
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Humans Alive
              </div>
              <div className="font-teko text-2xl font-bold text-white tabular-nums leading-none">
                {aliveCount}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kills</div>
              <div className="font-teko text-2xl font-bold text-orange-400 tabular-nums leading-none">
                {stats.kills}
              </div>
            </div>
          </div>

          {/* Safe Zone Timer Banner */}
          <div
            className={`mt-2 px-3 py-1 rounded text-xs font-rajdhani font-bold tracking-wider flex items-center gap-1.5 border ${
              isZoneShrinking
                ? 'bg-red-600/80 border-red-400 text-white animate-pulse'
                : 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>
              {isZoneShrinking
                ? `ZONE SHRINKING! (${zoneTime}s)`
                : `SAFE ZONE SHRINK IN ${zoneTime}s (Phase ${zonePhase})`}
            </span>
          </div>

          {/* Airdrop Incoming Banner */}
          {airdropAlert && (
            <div className="mt-1.5 px-4 py-1 rounded bg-orange-500 text-slate-950 font-rajdhani font-extrabold text-xs tracking-widest uppercase flex items-center gap-2 shadow-lg animate-bounce">
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>AIRDROP INCOMING AT BERMUDA!</span>
            </div>
          )}
        </div>

        {/* Top-Right: Killfeed, Live Chat & APK CTA */}
        <div className="flex flex-col items-end gap-2 w-64 sm:w-80">
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Live Chat System Trigger */}
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/95 hover:bg-slate-900 border-2 border-sky-400 text-sky-200 text-xs font-bold uppercase tracking-wider shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              <span>Chat</span>
              {unreadChatCount > 0 && (
                <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* APK Build / Download Trigger */}
            <button
              onClick={onOpenApkModal || install}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-emerald-500/20 border-2 border-emerald-300 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get APK</span>
            </button>
          </div>

          {/* Live Multiplayer Kill Feed */}
          <div className="flex flex-col gap-1 w-full overflow-hidden">
            {killFeed.slice(-4).map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-end gap-1.5 px-2.5 py-1 rounded text-xs font-rajdhani font-bold tracking-wider ${
                  entry.isPlayerKiller
                    ? 'bg-orange-500/25 border-r-4 border-orange-400 text-orange-200'
                    : 'bg-slate-900/75 border-r-2 border-slate-700 text-slate-300'
                }`}
              >
                <span className={entry.isPlayerKiller ? 'text-orange-300' : 'text-slate-200'}>
                  {entry.killer}
                </span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-slate-950/60 text-slate-400 font-mono">
                  {entry.weapon}
                </span>
                {entry.isHeadshot && (
                  <span className="text-[10px] px-1 rounded bg-red-600 text-white font-bold">
                    HEADSHOT
                  </span>
                )}
                <span className="text-slate-400">➔</span>
                <span className="text-slate-300">{entry.victim}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. FLOATING NEARBY LOOT BANNER (Free Fire Style Ground Loot Pickup) */}
      {nearbyLoot && (
        <div className="absolute bottom-32 sm:bottom-36 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center z-40">
          <button
            onClick={onPickupLoot}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 shadow-2xl backdrop-blur-md active:scale-95 transition-all cursor-pointer hover:brightness-110"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.94)',
              borderColor: RARITY_COLORS[nearbyLoot.rarity],
              boxShadow: `0 0 25px ${RARITY_COLORS[nearbyLoot.rarity]}50`,
            }}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 font-mono font-black text-sm text-white shadow-inner group-hover:scale-105 transition-transform">
              E
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-white font-rajdhani font-black text-base tracking-wider uppercase drop-shadow">
                  {nearbyLoot.name}
                </span>
                <span
                  className="text-[9px] font-black uppercase px-2 py-0.5 rounded text-slate-950 tracking-wider shadow"
                  style={{ backgroundColor: RARITY_COLORS[nearbyLoot.rarity] }}
                >
                  {nearbyLoot.rarity}
                </span>
              </div>
              <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1">
                {nearbyLoot.type === 'weapon'
                  ? 'Tap or [E] to Equip to Arsenal'
                  : nearbyLoot.type === 'helmet'
                  ? `Tap or [E] to Wear (-${Math.round((HELMET_DEFINITIONS[nearbyLoot.armorLevel || 1].damageReduction) * 100)}% Headshot Dmg)`
                  : nearbyLoot.type === 'vest'
                  ? `Tap or [E] to Wear (-${Math.round((VEST_DEFINITIONS[nearbyLoot.armorLevel || 1].damageReduction) * 100)}% Body Dmg)`
                  : nearbyLoot.type === 'healing'
                  ? `Tap or [E] to Collect (+${nearbyLoot.amount} ${nearbyLoot.healingType === 'medkit' ? 'Medkit' : 'Bandage'})`
                  : nearbyLoot.type === 'ammo'
                  ? `Tap or [E] to Collect (+${nearbyLoot.amount} rounds)`
                  : `Tap or [E] to Collect (+${nearbyLoot.amount} Gloo)`}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* 3. BOTTOM CLUSTER (Low-Occlusion Professional HUD) */}
      <div className="flex items-end justify-between w-full max-w-7xl mx-auto gap-4">
        {/* Bottom-Left: Helmet, Vest, HP, EP & Dual Healing */}
        <div className="flex flex-col gap-2 w-72 sm:w-80">
          {/* Dual Armor Panel: Helmet & Vest */}
          <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 shadow-xl flex flex-col gap-2">
            {/* Helmet Durability & Tier */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>HELMET LVL {stats.armor.helmetLevel}</span>
                  {stats.armor.helmetLevel > 0 && (
                    <span className="text-[9px] px-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                      -{Math.round(stats.armor.helmetDamageReduction * 100)}% HS
                    </span>
                  )}
                </span>
                <span className="tabular-nums font-mono text-cyan-300 text-xs">
                  {Math.round(stats.armor.helmetDurability)} / {stats.armor.maxHelmetDurability}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-150 rounded-full"
                  style={{ width: `${helmetDurabilityPercent}%` }}
                />
              </div>
            </div>

            {/* Vest Durability & Tier */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>VEST LVL {stats.armor.vestLevel}</span>
                  {stats.armor.vestLevel > 0 && (
                    <span className="text-[9px] px-1 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                      -{Math.round(stats.armor.vestDamageReduction * 100)}% Body
                    </span>
                  )}
                </span>
                <span className="tabular-nums font-mono text-blue-300 text-xs">
                  {Math.round(stats.armor.vestDurability)} / {stats.armor.maxVestDurability}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 transition-all duration-150 rounded-full"
                  style={{ width: `${vestDurabilityPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Health Points (HP) & Energy Points (EP) */}
          <div className="bg-slate-950/90 p-3 rounded-xl border border-orange-500/30 shadow-2xl">
            {/* EP Bar */}
            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
              <span className="flex items-center gap-1 text-amber-400">
                <Zap className="w-3 h-3 fill-amber-400" /> EP (Energy Points)
              </span>
              <span className="tabular-nums font-mono text-amber-300 text-xs">
                {Math.round(stats.ep)} / {stats.maxEp}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-2.5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-150 rounded-full"
                style={{ width: `${epPercent}%` }}
              />
            </div>

            {/* HP Bar */}
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1 text-emerald-400">
                <Heart className="w-3.5 h-3.5 fill-emerald-400" /> HP (Health)
              </span>
              <span className="tabular-nums font-mono text-white text-sm font-black">
                {Math.round(stats.hp)} / {stats.maxHp}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-150 rounded-full ${
                  stats.hp < 60
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-gradient-to-r from-emerald-500 to-green-400'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Dual Healing Controls & Stance Toggles */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Apply Healing Button */}
            <button
              onClick={onUseHealing}
              className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl border shadow-lg transition-all ${
                activeHealingCount <= 0
                  ? 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500/50 text-emerald-200 active:scale-95'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-400" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight uppercase">
                    {activeHealingDef.name} [V]
                  </span>
                  <span className="text-[9px] text-emerald-400/80">
                    {activeHealing === 'medkit' ? '+75 HP & +50 EP' : '+25 HP (Cap 150)'}
                  </span>
                </div>
              </div>
              <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-white font-mono font-bold text-xs ml-1">
                x{activeHealingCount}
              </span>
            </button>

            {/* Switch Healing Item [X] */}
            <button
              onClick={onToggleHealingType}
              title="Switch Medkit / Bandage [X]"
              className="flex items-center gap-1 px-2.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-mono text-[10px]">[X]</span>
            </button>

            {/* PC Stance Buttons */}
            <button
              onClick={onToggleCrouch}
              className={`hidden sm:flex px-2.5 py-2.5 rounded-xl border text-xs font-bold uppercase transition-all ${
                currentStance === 'crouching'
                  ? 'bg-orange-500 text-slate-950 border-white shadow'
                  : 'bg-slate-950/90 text-slate-300 border-slate-700 hover:bg-slate-900'
              }`}
            >
              [C] Sit
            </button>
            <button
              onClick={onToggleProne}
              className={`hidden sm:flex px-2.5 py-2.5 rounded-xl border text-xs font-bold uppercase transition-all ${
                currentStance === 'prone'
                  ? 'bg-orange-500 text-slate-950 border-white shadow'
                  : 'bg-slate-950/90 text-slate-300 border-slate-700 hover:bg-slate-900'
              }`}
            >
              [Z] Lie
            </button>
          </div>
        </div>

        {/* Bottom-Right: Active Weapon Card, Gloo Wall, Character Skill & 4 Slots */}
        <div className="flex flex-col items-end gap-2.5">
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Free Fire Character Active Skill Button [T] */}
            <button
              onClick={onActivateSkill}
              disabled={skillCooldown > 0}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 font-rajdhani font-black tracking-wider text-xs shadow-xl transition-all ${
                isSkillActive
                  ? 'bg-amber-500 text-slate-950 border-white shadow-[0_0_20px_#f59e0b] animate-pulse scale-105'
                  : skillCooldown > 0
                  ? 'bg-slate-900/90 border-slate-700 text-slate-500 cursor-not-allowed opacity-75'
                  : 'bg-gradient-to-r from-amber-600 to-orange-500 text-white border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95'
              }`}
            >
              <Zap className={`w-4 h-4 ${isSkillActive ? 'text-slate-950 animate-bounce' : 'text-amber-300'}`} />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono leading-none text-amber-200">
                  [T] {isSkillActive ? 'ACTIVE' : 'SKILL'}
                </span>
                <span className="text-xs font-black uppercase leading-tight truncate max-w-[110px]">
                  {charDef?.skill.name || 'SKILL'}
                </span>
              </div>
              {skillCooldown > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-950 border border-amber-500/40 text-amber-300 font-mono font-black text-[11px]">
                  {Math.ceil(skillCooldown)}s
                </span>
              )}
            </button>

            {/* Gloo Wall Tactical Deploy Button */}
            <button
              onClick={onDeployGlooWall}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/95 hover:bg-cyan-900 border-2 border-cyan-400 text-cyan-200 text-xs font-black tracking-wider shadow-lg shadow-cyan-500/25 transition-all ${
                stats.glooWalls <= 0 ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'
              }`}
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>GLOO [F/G]</span>
              <span className="bg-cyan-500/25 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-black">
                x{stats.glooWalls}
              </span>
            </button>
          </div>

          {/* 4-Slot Weapon System (1: Primary, 2: Secondary, 3: Sidearm, 4: Melee) */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-950/90 p-1.5 rounded-xl border border-slate-800 shadow-2xl">
            {([1, 2, 3, 4] as const).map((slotNum) => {
              const wId = slots[slotNum];
              const def = WEAPON_DEFINITIONS[wId];
              const isSelected = activeSlot === slotNum;
              const slotLabel =
                slotNum === 1
                  ? 'PRI'
                  : slotNum === 2
                  ? 'SEC'
                  : slotNum === 3
                  ? 'SIDE'
                  : 'MELEE';

              return (
                <button
                  key={slotNum}
                  onClick={() => onSelectSlot(slotNum)}
                  className={`flex flex-col items-start px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-orange-500 text-slate-950 border-white shadow-lg font-black scale-105 z-10'
                      : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1 w-full justify-between">
                    <span className="text-[10px] font-mono font-bold opacity-80">
                      [{slotNum}] {slotLabel}
                    </span>
                    <span
                      className="text-[8px] font-black uppercase px-1 rounded"
                      style={{
                        backgroundColor: isSelected ? '#0f172a' : RARITY_COLORS[def.rarity],
                        color: isSelected ? '#ffffff' : '#0f172a',
                      }}
                    >
                      {def.rarity.slice(0, 3)}
                    </span>
                  </div>
                  <span className="text-xs font-rajdhani font-bold tracking-wide truncate max-w-[85px] sm:max-w-[105px]">
                    {def.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Ammo & Reload Card */}
          <div className="bg-slate-950/95 border border-orange-500/40 rounded-xl p-3 w-60 sm:w-64 flex flex-col items-end shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                {ammoCaliberLabel}
              </span>
              <span className="text-xs font-extrabold text-orange-400 tracking-widest uppercase">
                {currentDef.name}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-teko text-5xl font-bold text-white tabular-nums leading-none">
                {currentWeaponState.ammo}
              </span>
              <span className="font-teko text-2xl text-slate-400 tabular-nums leading-none">
                / {currentDef.ammoType ? reserveAmmo : '∞'}
              </span>
            </div>

            {currentWeaponState.isReloading ? (
              <div className="w-full mt-2">
                <div className="text-[10px] font-bold text-orange-400 uppercase text-center mb-1 animate-pulse">
                  RELOADING...
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-full animate-pulse" />
                </div>
              </div>
            ) : (
              <button
                onClick={onReload}
                disabled={!currentDef.ammoType || reserveAmmo <= 0}
                className={`pointer-events-auto text-[11px] font-bold mt-1 uppercase tracking-wider transition-colors flex items-center gap-1 ${
                  !currentDef.ammoType || reserveAmmo <= 0
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-400 hover:text-orange-400 cursor-pointer'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>[R] Reload</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

