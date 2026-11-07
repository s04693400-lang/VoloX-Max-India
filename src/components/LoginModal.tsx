import React, { useState } from 'react';
import { Shield, Sparkles, User, Globe, ChevronRight, Check } from 'lucide-react';

export interface UserProfile {
  name: string;
  loginType: 'guest' | 'google' | 'volox';
  level: number;
  rank: string;
  coins: number;
  diamonds: number;
  characterId: string;
  outfitId: string;
  region: string;
}

interface LoginModalProps {
  initialProfile: UserProfile;
  onLoginSuccess: (profile: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ initialProfile, onLoginSuccess }) => {
  const [playerName, setPlayerName] = useState(initialProfile.name || 'Warrior_IN');
  const [selectedRegion, setSelectedRegion] = useState(initialProfile.region || 'India (Mumbai/Delhi)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGuestLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onLoginSuccess({
        ...initialProfile,
        name: playerName.trim() || 'Guest_Warrior',
        loginType: 'guest',
        region: selectedRegion,
      });
    }, 400);
  };

  const handleGoogleLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onLoginSuccess({
        ...initialProfile,
        name: playerName.trim() || 'Google_Pro',
        loginType: 'google',
        region: selectedRegion,
      });
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      {/* Outer Card with Free Fire Neon Borders */}
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-orange-500/60 shadow-[0_0_60px_rgba(249,115,22,0.35)] p-6 sm:p-8 overflow-hidden">
        {/* Background Decorative Crests */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Game Title & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-mono font-bold tracking-widest uppercase mb-2">
            <span>🇮🇳</span>
            <span>INDIA BATTLEGROUND EDITION</span>
          </div>
          <h1 className="font-teko text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-500 tracking-wider uppercase leading-none drop-shadow">
            VOLOX MAX
          </h1>
          <p className="text-xs text-slate-400 font-rajdhani font-semibold tracking-wide">
            Sign in to join real human survivors across Bermuda
          </p>
        </div>

        {/* Player Name Input */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-orange-400" />
            <span>PLAYER IN-GAME NAME</span>
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={16}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g. RASTAR_99, VIPER_IN"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-700 focus:border-orange-500 text-white font-rajdhani font-black text-base placeholder-slate-500 outline-none transition-all shadow-inner"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500">
              {playerName.length}/16
            </span>
          </div>
        </div>

        {/* Server Region Selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>SELECTED SERVER REGION</span>
          </label>
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-base">🇮🇳</span>
              <span className="text-emerald-400 font-mono font-bold">India Server #1</span>
              <span className="text-[10px] text-slate-400 font-mono">(18ms Latency)</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>

        {/* Login Method Buttons */}
        <div className="flex flex-col gap-3">
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-rajdhani font-black text-base uppercase tracking-wider shadow-lg active:scale-98 transition-all cursor-pointer"
          >
            {/* Google G Icon */}
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>SIGN IN WITH GOOGLE</span>
          </button>

          {/* Quick Play as Guest Button */}
          <button
            onClick={handleGuestLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-rajdhani font-black text-lg uppercase tracking-wider shadow-xl shadow-orange-500/30 active:scale-98 transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5 fill-slate-950" />
            <span>PLAY AS GUEST (QUICK START)</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Free Fire Anti-Bot & Fair Play Badge */}
        <div className="mt-5 text-center flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Real Human Multiplayer · Anti-Cheat Shield Active</span>
        </div>
      </div>
    </div>
  );
};
