import React from 'react';
import { X, Check, Award, Gift, Flame, Shield, Crosshair, Calendar, Sparkles } from 'lucide-react';
import { DailyMission } from '../game/missions';

interface MissionsModalProps {
  missions: DailyMission[];
  onClaimReward: (missionId: string) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  missions,
  onClaimReward,
  onClose,
}) => {
  const completedCount = missions.filter((m) => m.isCompleted).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-950 border-2 border-orange-500/60 shadow-[0_0_80px_rgba(249,115,22,0.3)] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-teko text-3xl font-black text-white uppercase leading-none tracking-wide">
                DAILY SURVIVOR MISSIONS
              </h2>
              <p className="text-xs text-slate-400 font-rajdhani">
                Complete combat challenges across Bermuda to earn Gold & Diamonds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-orange-400">
              {completedCount}/{missions.length} COMPLETED
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Missions List */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3.5">
          {missions.map((mission) => {
            const percent = Math.min(100, Math.round((mission.current / mission.target) * 100));
            const canClaim = mission.isCompleted && !mission.isClaimed;

            return (
              <div
                key={mission.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border-2 transition-all ${
                  mission.isClaimed
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-60'
                    : canClaim
                    ? 'bg-gradient-to-r from-orange-950/60 to-slate-900 border-orange-500/80 shadow-lg shadow-orange-500/20'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                {/* Left Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-rajdhani font-black text-base text-white uppercase tracking-wide">
                      {mission.title}
                    </span>
                    {mission.isClaimed && (
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        CLAIMED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-rajdhani font-medium">
                    {mission.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          mission.isCompleted ? 'bg-emerald-400' : 'bg-orange-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-300 min-w-[50px] text-right">
                      {mission.current} / {mission.target}
                    </span>
                  </div>
                </div>

                {/* Right Rewards & Claim Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                  {/* Rewards Pill */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                      <span>🪙</span>
                      <span>+{mission.rewardCoins}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                      <span>💎</span>
                      <span>+{mission.rewardDiamonds}</span>
                    </div>
                  </div>

                  {/* Claim Button */}
                  {mission.isClaimed ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider cursor-not-allowed"
                    >
                      Done
                    </button>
                  ) : canClaim ? (
                    <button
                      onClick={() => onClaimReward(mission.id)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-slate-950 font-rajdhani font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/30 active:scale-95 transition-all cursor-pointer animate-pulse"
                    >
                      CLAIM REWARD
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider cursor-not-allowed"
                    >
                      In Progress
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
