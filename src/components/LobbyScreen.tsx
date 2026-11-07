import React, { useState } from 'react';
import {
  User,
  Shirt,
  Award,
  MessageSquare,
  Smartphone,
  Volume2,
  VolumeX,
  Play,
  Sparkles,
  Shield,
  Zap,
  Globe,
  Settings,
  Flame,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { UserProfile } from './LoginModal';
import { CHARACTERS, OUTFITS } from '../game/characterSkills';
import { DailyMission } from '../game/missions';

interface LobbyScreenProps {
  userProfile: UserProfile;
  missions: DailyMission[];
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenVault: () => void;
  onOpenMissions: () => void;
  onOpenChat: () => void;
  onOpenAPK: () => void;
  onStartMatch: () => void;
  onOpenProfile: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  userProfile,
  missions,
  isMuted,
  onToggleMute,
  onOpenVault,
  onOpenMissions,
  onOpenChat,
  onOpenAPK,
  onStartMatch,
  onOpenProfile,
}) => {
  const [selectedMode, setSelectedMode] = useState<'BERMUDA_BR' | 'CLASH_SQUAD'>('BERMUDA_BR');
  const [isMatching, setIsMatching] = useState(false);
  const [matchTimer, setMatchTimer] = useState(0);

  const currentChar = CHARACTERS.find((c) => c.id === userProfile.characterId) || CHARACTERS[0];
  const currentOutfit = OUTFITS.find((o) => o.id === userProfile.outfitId) || OUTFITS[0];

  const unclaimedMissions = missions.filter((m) => m.isCompleted && !m.isClaimed).length;

  const handleStartClick = () => {
    if (isMatching) return;
    setIsMatching(true);
    setMatchTimer(0);

    const interval = setInterval(() => {
      setMatchTimer((prev) => prev + 1);
    }, 1000);

    // Free Fire matchmaking countdown into live battleground match
    setTimeout(() => {
      clearInterval(interval);
      setIsMatching(false);
      onStartMatch();
    }, 2800);
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5 z-20 font-rajdhani">
      {/* 1. TOP BAR CLUSTER */}
      <div className="flex items-start justify-between w-full max-w-7xl mx-auto pointer-events-auto">
        {/* Left: Player Profile Banner */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-3 p-2 pr-4 rounded-2xl bg-slate-950/90 border-2 border-orange-500/50 shadow-xl backdrop-blur-md hover:border-orange-400 transition-all cursor-pointer group active:scale-98"
        >
          {/* Avatar Frame with India Flag & Level badge */}
          <div className="relative">
            <div
              className="w-13 h-13 rounded-xl border-2 border-amber-400 flex items-center justify-center shadow-lg overflow-hidden"
              style={{ backgroundColor: currentChar.avatarColor }}
            >
              <User className="w-8 h-8 text-slate-950" />
            </div>
            <span className="absolute -bottom-1 -right-1 text-xs">🇮🇳</span>
            <div className="absolute -top-1.5 -left-1.5 px-1.5 py-0.2 rounded-full bg-orange-600 border border-white text-[9px] font-mono font-black text-white">
              LV.{userProfile.level}
            </div>
          </div>

          {/* Name & Rank */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-teko text-2xl font-black text-white leading-none tracking-wide group-hover:text-orange-400 transition-colors">
                {userProfile.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold uppercase border border-amber-500/40">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{userProfile.rank}</span>
            </div>
          </div>
        </button>

        {/* Center: VoloX Max India Title Crest */}
        <div className="hidden md:flex flex-col items-center">
          <div className="px-3 py-0.5 rounded-full bg-slate-950/80 border border-orange-500/40 text-[10px] font-mono font-bold text-orange-400 tracking-widest uppercase mb-1">
            BATTLE ROYALE LOBBY
          </div>
          <h1 className="font-teko text-4xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-500 leading-none drop-shadow">
            VOLOX MAX INDIA
          </h1>
        </div>

        {/* Right: Currency Counters & Utilities */}
        <div className="flex items-center gap-2.5">
          {/* Gold Coins Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-amber-500/40 shadow-lg">
            <span className="text-base">🪙</span>
            <span className="font-mono text-sm font-bold text-amber-300 tabular-nums">
              {userProfile.coins.toLocaleString()}
            </span>
          </div>

          {/* Diamonds Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 shadow-lg">
            <span className="text-base">💎</span>
            <span className="font-mono text-sm font-bold text-cyan-300 tabular-nums">
              {userProfile.diamonds.toLocaleString()}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="w-10 h-10 rounded-xl bg-slate-950/90 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-lg"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 2. MIDDLE SECTION: LEFT TACTICAL NAVIGATION STRIP */}
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto my-auto">
        {/* Left Side Menu */}
        <div className="flex flex-col gap-2.5 pointer-events-auto">
          {/* Characters & Skills */}
          <button
            onClick={onOpenVault}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border-2 border-slate-800 hover:border-orange-500 text-slate-200 hover:text-white shadow-xl transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-sm uppercase tracking-wider">CHARACTERS</span>
              <span className="text-[10px] text-orange-400 font-bold">{currentChar.name}</span>
            </div>
          </button>

          {/* Vault (Outfits & Skins) */}
          <button
            onClick={onOpenVault}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border-2 border-slate-800 hover:border-orange-500 text-slate-200 hover:text-white shadow-xl transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shirt className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-sm uppercase tracking-wider">VAULT / SKINS</span>
              <span className="text-[10px] text-cyan-400 font-bold">{currentOutfit.name}</span>
            </div>
          </button>

          {/* Daily Missions Button with Notification Badge */}
          <button
            onClick={onOpenMissions}
            className="relative flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border-2 border-slate-800 hover:border-amber-400 text-slate-200 hover:text-white shadow-xl transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-sm uppercase tracking-wider">DAILY MISSIONS</span>
              <span className="text-[10px] text-amber-400 font-bold">Earn Gold & Gems</span>
            </div>
            {unclaimedMissions > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white font-mono font-black text-xs flex items-center justify-center animate-bounce shadow">
                {unclaimedMissions}
              </span>
            )}
          </button>

          {/* Real-time World Chat */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border-2 border-slate-800 hover:border-emerald-500 text-slate-200 hover:text-white shadow-xl transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-sm uppercase tracking-wider">WORLD CHAT</span>
              <span className="text-[10px] text-emerald-400 font-bold">All India Survivors</span>
            </div>
          </button>

          {/* APK App Install / Download */}
          <button
            onClick={onOpenAPK}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-950/90 to-teal-950/90 hover:brightness-110 border-2 border-emerald-500 text-emerald-300 shadow-xl transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/25 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-sm uppercase tracking-wider text-white">APK DOWNLOAD</span>
              <span className="text-[10px] text-emerald-400 font-bold">Build & Install</span>
            </div>
          </button>
        </div>

        {/* Right Side: Active Character Combat Card */}
        <div className="hidden lg:flex flex-col gap-3 p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 shadow-2xl backdrop-blur-md pointer-events-auto max-w-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-orange-400 uppercase">
              ACTIVE COMBAT ABILITY
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500 text-slate-950 font-black uppercase">
              {currentChar.skill.type}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow"
              style={{ backgroundColor: currentChar.avatarColor }}
            >
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="font-black text-base text-white uppercase leading-none">
                {currentChar.skill.name}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                {currentChar.skill.cooldown > 0 ? `${currentChar.skill.cooldown}s Cooldown` : 'Permanent Passive'}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            {currentChar.skill.description}
          </p>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>PRESS [T] IN COMBAT</span>
            <span className="text-emerald-400 font-bold">READY</span>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM BAR: MATCHMAKING & START CLUSTER */}
      <div className="flex items-end justify-between w-full max-w-7xl mx-auto pointer-events-auto">
        {/* Left: Server Ping & Stance Reminder */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-400">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-bold">🇮🇳 India Server #1 (18ms)</span>
          <span className="text-slate-600">|</span>
          <span className="text-orange-400 font-bold">ANTI-CHEAT VERIFIED</span>
        </div>

        {/* Right: Mode Selector & Big Free Fire START Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 ml-auto">
          {/* Game Mode Selector Card */}
          <div className="flex flex-col bg-slate-950/90 border-2 border-slate-800 p-2 rounded-2xl shadow-xl w-60">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2">
              GAME MODE
            </div>
            <div className="flex items-center gap-1 mt-1">
              <button
                onClick={() => setSelectedMode('BERMUDA_BR')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedMode === 'BERMUDA_BR'
                    ? 'bg-orange-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                BERMUDA BR
              </button>
              <button
                onClick={() => setSelectedMode('CLASH_SQUAD')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedMode === 'CLASH_SQUAD'
                    ? 'bg-orange-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                CLASH SQUAD
              </button>
            </div>
          </div>

          {/* Big Golden START Matchmaking Button */}
          {isMatching ? (
            <div className="flex flex-col items-center justify-center px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 border-3 border-amber-300 shadow-2xl shadow-orange-500/60 animate-pulse min-w-[200px]">
              <div className="font-teko text-3xl font-black text-white uppercase tracking-wider leading-none">
                MATCHING... 00:0{matchTimer}
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-200">
                Finding Human Warriors
              </span>
            </div>
          ) : (
            <button
              onClick={handleStartClick}
              className="group relative flex items-center justify-center gap-3 px-12 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 hover:brightness-110 border-3 border-amber-200 text-slate-950 font-teko text-4xl font-black tracking-wider uppercase shadow-[0_0_35px_rgba(245,158,11,0.6)] active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-8 h-8 fill-slate-950 group-hover:scale-110 transition-transform" />
              <span>START MATCH</span>
              <div className="absolute -top-2.5 px-3 py-0.5 rounded-full bg-slate-950 border border-amber-400 text-amber-300 font-mono font-black text-[10px] tracking-widest uppercase">
                CLASSIC BERMUDA
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
