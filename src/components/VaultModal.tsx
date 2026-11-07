import React, { useState } from 'react';
import { X, Check, Shield, Zap, Sparkles, User, Shirt, Flame, Music, Award } from 'lucide-react';
import { CHARACTERS, OUTFITS, CharacterDef, OutfitDef } from '../game/characterSkills';

interface VaultModalProps {
  selectedCharacterId: string;
  selectedOutfitId: string;
  onSelectCharacter: (charId: string) => void;
  onSelectOutfit: (outfitId: string) => void;
  onClose: () => void;
}

export const VaultModal: React.FC<VaultModalProps> = ({
  selectedCharacterId,
  selectedOutfitId,
  onSelectCharacter,
  onSelectOutfit,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'outfits'>('characters');

  const currentChar = CHARACTERS.find((c) => c.id === selectedCharacterId) || CHARACTERS[0];
  const currentOutfit = OUTFITS.find((o) => o.id === selectedOutfitId) || OUTFITS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-950 border-2 border-orange-500/60 shadow-[0_0_80px_rgba(249,115,22,0.3)] overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('characters')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-rajdhani font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'characters'
                    ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>CHARACTERS & SKILLS</span>
              </button>
              <button
                onClick={() => setActiveTab('outfits')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-rajdhani font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'outfits'
                    ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shirt className="w-4 h-4" />
                <span>VAULT (OUTFITS & SKINS)</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Columns: Grid of Cards */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {activeTab === 'characters'
              ? CHARACTERS.map((char) => {
                  const isSelected = char.id === selectedCharacterId;
                  return (
                    <button
                      key={char.id}
                      onClick={() => onSelectCharacter(char.id)}
                      className={`relative flex flex-col text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-orange-950/80 to-slate-900 border-orange-500 shadow-xl shadow-orange-500/30 scale-102 ring-2 ring-orange-500/40'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {/* Rarity & Skill Type Pill */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                            char.rarity === 'legendary'
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-purple-500 text-white'
                          }`}
                        >
                          {char.rarity}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Character Avatar Icon Frame */}
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-white/20"
                        style={{ backgroundColor: char.avatarColor }}
                      >
                        <User className="w-8 h-8 text-slate-950" />
                      </div>

                      <div className="font-rajdhani font-black text-base text-white uppercase leading-tight truncate">
                        {char.name}
                      </div>

                      <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-orange-400">
                        <Zap className="w-3 h-3 fill-orange-400" />
                        <span className="truncate">{char.skill.name}</span>
                      </div>
                    </button>
                  );
                })
              : OUTFITS.map((outfit) => {
                  const isSelected = outfit.id === selectedOutfitId;
                  return (
                    <button
                      key={outfit.id}
                      onClick={() => onSelectOutfit(outfit.id)}
                      className={`relative flex flex-col text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-orange-950/80 to-slate-900 border-orange-500 shadow-xl shadow-orange-500/30 scale-102 ring-2 ring-orange-500/40'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                            outfit.rarity === 'legendary'
                              ? 'bg-amber-400 text-slate-950'
                              : outfit.rarity === 'epic'
                              ? 'bg-purple-500 text-white'
                              : 'bg-cyan-500 text-slate-950'
                          }`}
                        >
                          {outfit.rarity}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-white/20"
                        style={{ backgroundColor: outfit.glowColor || '#f97316' }}
                      >
                        <Shirt className="w-8 h-8 text-slate-950" />
                      </div>

                      <div className="font-rajdhani font-black text-base text-white uppercase leading-tight truncate">
                        {outfit.name}
                      </div>

                      <div className="mt-1 text-[10px] text-slate-400 line-clamp-1">
                        {outfit.description}
                      </div>
                    </button>
                  );
                })}
          </div>

          {/* Right Column: Detailed Inspect & Skill Panel */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
            {activeTab === 'characters' ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs font-mono font-bold uppercase border border-orange-500/40">
                    {currentChar.title}
                  </span>
                </div>
                <h3 className="font-teko text-4xl font-black text-white uppercase leading-none">
                  {currentChar.name}
                </h3>
                <p className="text-xs text-slate-400 font-rajdhani mt-1.5 leading-relaxed">
                  {currentChar.bio}
                </p>

                {/* Skill Card */}
                <div className="mt-5 p-4 rounded-xl bg-slate-950 border-2 border-orange-500/40 shadow-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                      ABILITY: {currentChar.skill.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500 text-slate-950 font-black uppercase">
                      {currentChar.skill.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-rajdhani leading-relaxed mt-1">
                    {currentChar.skill.description}
                  </p>
                  {currentChar.skill.cooldown > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <span>COOLDOWN:</span>
                      <span className="text-orange-400 font-bold">{currentChar.skill.cooldown}s</span>
                      {currentChar.skill.duration && (
                        <>
                          <span className="text-slate-600">|</span>
                          <span>DURATION:</span>
                          <span className="text-emerald-400 font-bold">{currentChar.skill.duration}s</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold uppercase border border-cyan-500/40">
                    EXCLUSIVE BATTLE SKIN
                  </span>
                </div>
                <h3 className="font-teko text-4xl font-black text-white uppercase leading-none">
                  {currentOutfit.name}
                </h3>
                <p className="text-xs text-slate-400 font-rajdhani mt-1.5 leading-relaxed">
                  {currentOutfit.description}
                </p>

                <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    OUTFIT ATTRIBUTES
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Combat Visor:</span>
                      <span className="text-white font-mono font-bold">Enabled (Glow)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tactical Camo:</span>
                      <span className="text-white font-mono font-bold">Bermuda Spec</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Armor Compatibility:</span>
                      <span className="text-emerald-400 font-mono font-bold">Lvl 1 - 3</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-rajdhani font-black text-base uppercase tracking-wider shadow-lg active:scale-98 transition-all cursor-pointer"
            >
              EQUIP & RETURN TO LOBBY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
