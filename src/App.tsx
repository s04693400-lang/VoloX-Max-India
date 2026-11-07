import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import {
  GameState,
  SurvivorStats,
  WeaponState,
  WeaponId,
  DamageNumber,
  KillFeedEntry,
  MatchStats,
  LootItem,
  ChatMessage,
  KillBadgeData,
  createInitialWeaponStates,
  createInitialArmorState,
  createInitialAmmoInventory,
  createInitialHealingInventory,
} from './game/types';
import { StanceType } from './game/models';
import { soundEngine } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { ScopeOverlay } from './components/ScopeOverlay';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { LoginModal, UserProfile } from './components/LoginModal';
import { LobbyScreen } from './components/LobbyScreen';
import { VaultModal } from './components/VaultModal';
import { MissionsModal } from './components/MissionsModal';
import { ChatModal } from './components/ChatModal';
import { APKModal } from './components/APKModal';
import { KillEffectBanner } from './components/KillEffectBanner';
import { INITIAL_DAILY_MISSIONS, DailyMission } from './game/missions';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Persistent User Profile (Guest or Google/VoloX ID)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('volox_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: 'Warrior_IN',
      loginType: 'guest',
      level: 28,
      rank: 'HEROIC III',
      coins: 8450,
      diamonds: 320,
      characterId: 'alok',
      outfitId: 'tactical_commando',
      region: 'India (Mumbai/Delhi)',
    };
  });

  // Persistent Daily Missions
  const [missions, setMissions] = useState<DailyMission[]>(() => {
    try {
      const saved = localStorage.getItem('volox_daily_missions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DAILY_MISSIONS;
  });

  // High-level App Screen State
  // Initial screen is LOBBY (or TITLE if user wants cinematic intro)
  const [gameState, setGameState] = useState<GameState | 'LOBBY' | 'LOGIN'>('LOBBY');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // Modal Open Toggles
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isAPKOpen, setIsAPKOpen] = useState<boolean>(false);

  // Real-Time Chat & Kill Effects
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      senderId: 'system',
      senderName: 'SYSTEM',
      text: '🇮🇳 Welcome to VoloX Max India! Pure real human multiplayer in Bermuda.',
      timestamp: Date.now(),
      isTactical: false,
    },
  ]);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [currentKillBadge, setCurrentKillBadge] = useState<KillBadgeData | null>(null);

  // In-Game UI state
  const [stats, setStats] = useState<SurvivorStats>({
    hp: 200,
    maxHp: 200,
    ep: 150,
    maxEp: 200,
    armor: createInitialArmorState(),
    ammo: createInitialAmmoInventory(),
    healing: createInitialHealingInventory(),
    glooWalls: 3,
    kills: 0,
    damageDealt: 0,
    headshots: 0,
  });

  // Free Fire 4-slot inventory state
  const [slots, setSlots] = useState<Record<1 | 2 | 3 | 4, WeaponId>>({
    1: 'scar',
    2: 'm1014',
    3: 'usp',
    4: 'katana',
  });
  const [activeSlot, setActiveSlot] = useState<1 | 2 | 3 | 4>(1);
  const [nearbyLoot, setNearbyLoot] = useState<LootItem | null>(null);

  const [currentWeaponId, setCurrentWeaponId] = useState<WeaponId>('scar');
  const [currentWeaponState, setCurrentWeaponState] = useState<WeaponState>(
    createInitialWeaponStates()['scar']
  );
  const [currentStance, setCurrentStance] = useState<StanceType>('standing');
  const [aliveCount, setAliveCount] = useState<number>(1);
  const [killFeed, setKillFeed] = useState<KillFeedEntry[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [hitmarker, setHitmarker] = useState<{ isHeadshot: boolean; timestamp: number } | null>(null);

  // Scope ADS
  const [isScoped, setIsScoped] = useState<boolean>(false);
  const [scopeFov, setScopeFov] = useState<number>(50);

  // Character Skill
  const [skillCooldown, setSkillCooldown] = useState<number>(0);
  const [maxSkillCooldown, setMaxSkillCooldown] = useState<number>(45);
  const [isSkillActive, setIsSkillActive] = useState<boolean>(false);

  // Safe Zone
  const [zoneTime, setZoneTime] = useState<number>(45);
  const [isZoneShrinking, setIsZoneShrinking] = useState<boolean>(false);
  const [zonePhase, setZonePhase] = useState<number>(1);
  const [airdropAlert, setAirdropAlert] = useState<boolean>(false);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [playerHurtEffect, setPlayerHurtEffect] = useState<boolean>(false);

  // Save profile & missions to localStorage
  const updateProfile = (updater: Partial<UserProfile> | ((prev: UserProfile) => UserProfile)) => {
    setUserProfile((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      try {
        localStorage.setItem('volox_user_profile', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const updateMissions = (updater: DailyMission[] | ((prev: DailyMission[]) => DailyMission[])) => {
    setMissions((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('volox_daily_missions', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Detect touch device or small screen for mobile touch controls
  useEffect(() => {
    const checkTouch = () => {
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth <= 1024;
      setIsTouchDevice(hasTouch);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Initialize GameEngine inside isolated canvas container
  const initEngine = useCallback(
    (name: string = userProfile.name, charId: string = userProfile.characterId, outfitId: string = userProfile.outfitId) => {
      if (!canvasMountRef.current) return;
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }

      const engine = new GameEngine(
        canvasMountRef.current,
        name,
        {
          onStatsUpdate: (newStats) => {
            setStats({ ...newStats });

            // Check mission progress
            updateMissions((prev) =>
              prev.map((m) => {
                if (m.id === 'm_kills' && newStats.kills > m.current) {
                  const current = Math.min(m.target, newStats.kills);
                  return { ...m, current, isCompleted: current >= m.target };
                }
                if (m.id === 'm_headshots' && newStats.headshots > m.current) {
                  const current = Math.min(m.target, newStats.headshots);
                  return { ...m, current, isCompleted: current >= m.target };
                }
                return m;
              })
            );
          },
          onWeaponUpdate: (weaponState, slot) => {
            setCurrentWeaponState({ ...weaponState });
            setCurrentWeaponId(slot);
          },
          onSlotsUpdate: (newSlots, newActiveSlot) => {
            setSlots({ ...newSlots });
            setActiveSlot(newActiveSlot);
          },
          onNearbyLoot: (loot) => {
            setNearbyLoot(loot);
          },
          onAliveCountUpdate: (count) => {
            setAliveCount(count);
          },
          onKillFeedEntry: (entry) => {
            setKillFeed((prev) => [...prev.slice(-6), entry]);
          },
          onDamageNumber: (dmg) => {
            setDamageNumbers((prev) => [...prev.slice(-8), dmg]);
            setTimeout(() => {
              setDamageNumbers((prev) => prev.filter((d) => d.id !== dmg.id));
            }, 1200);
          },
          onHitmarker: (isHeadshot) => {
            setHitmarker({ isHeadshot, timestamp: Date.now() });
          },
          onScopeToggle: (scoped, fov, weaponId) => {
            setIsScoped(scoped);
            setScopeFov(fov);
          },
          onZoneTimer: (seconds, isShrinking, phase) => {
            setZoneTime(seconds);
            setIsZoneShrinking(isShrinking);
            setZonePhase(phase);
          },
          onStanceChange: (newStance) => {
            setCurrentStance(newStance);
          },
          onAirdropIncoming: () => {
            setAirdropAlert(true);
            setTimeout(() => setAirdropAlert(false), 5000);
          },
          onKillBadge: (badge) => {
            setCurrentKillBadge(badge);
          },
          onChatMessage: (chat) => {
            setChatMessages((prev) => [...prev.slice(-30), chat]);
            if (!isChatOpen) {
              setUnreadChatCount((prev) => prev + 1);
            }
          },
          onSkillUpdate: (cd, maxCd, active) => {
            setSkillCooldown(cd);
            setMaxSkillCooldown(maxCd);
            setIsSkillActive(active);
          },
          onMatchEnd: (finalStats) => {
            setMatchStats(finalStats);
            setGameState(finalStats.isBooyah ? 'VICTORY' : 'GAMEOVER');

            // Reward Gold and Diamonds on match end
            const rewardCoins = finalStats.isBooyah ? 1000 : finalStats.kills * 150 + 200;
            const rewardDiamonds = finalStats.isBooyah ? 50 : finalStats.kills * 10;
            updateProfile((p) => ({
              ...p,
              coins: p.coins + rewardCoins,
              diamonds: p.diamonds + rewardDiamonds,
              level: p.level + (finalStats.isBooyah ? 1 : 0),
            }));

            // Progress survival mission
            updateMissions((prev) =>
              prev.map((m) => {
                if (m.id === 'm_survive') {
                  const current = Math.min(m.target, m.current + finalStats.survivalTimeSec);
                  return { ...m, current, isCompleted: current >= m.target };
                }
                return m;
              })
            );

            if (document.pointerLockElement) {
              document.exitPointerLock();
            }
          },
        },
        charId,
        outfitId
      );

      engineRef.current = engine;
    },
    [userProfile.name, userProfile.characterId, userProfile.outfitId, isChatOpen]
  );

  // Mount engine on app load for Bermuda background view
  useEffect(() => {
    initEngine(userProfile.name, userProfile.characterId, userProfile.outfitId);
    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, [initEngine, userProfile.name, userProfile.characterId, userProfile.outfitId]);

  // Handle Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Pause Key (Esc or P)
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameState === 'PLAYING') {
          setGameState('PAUSED');
          if (document.pointerLockElement) document.exitPointerLock();
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
          if (!isTouchDevice) canvasMountRef.current?.requestPointerLock();
        }
      }

      // Chat Hotkey (KeyY or Enter)
      if (e.code === 'KeyY' && gameState === 'PLAYING') {
        setIsChatOpen(true);
        setUnreadChatCount(0);
        if (document.pointerLockElement) document.exitPointerLock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isTouchDevice]);

  // Red flash on player damage
  useEffect(() => {
    if (stats.hp < 200 && gameState === 'PLAYING') {
      setPlayerHurtEffect(true);
      const timer = setTimeout(() => setPlayerHurtEffect(false), 220);
      return () => clearTimeout(timer);
    }
  }, [stats.hp, gameState]);

  // Start Matchmaking from Lobby
  const handleStartMatch = () => {
    initEngine(userProfile.name, userProfile.characterId, userProfile.outfitId);
    setGameState('PLAYING');
    soundEngine.playBooyahFanfare();
    if (!isTouchDevice && window.innerWidth > 768) {
      canvasMountRef.current?.requestPointerLock();
    }
  };

  const handleResume = () => {
    setGameState('PLAYING');
    if (!isTouchDevice && window.innerWidth > 768) {
      canvasMountRef.current?.requestPointerLock();
    }
  };

  const handleRestart = () => {
    setKillFeed([]);
    setDamageNumbers([]);
    setMatchStats(null);
    setCurrentKillBadge(null);
    initEngine(userProfile.name, userProfile.characterId, userProfile.outfitId);
    setGameState('PLAYING');
    if (!isTouchDevice && window.innerWidth > 768) {
      canvasMountRef.current?.requestPointerLock();
    }
  };

  const handleReturnToLobby = () => {
    setGameState('LOBBY');
    initEngine(userProfile.name, userProfile.characterId, userProfile.outfitId);
    if (document.pointerLockElement) document.exitPointerLock();
  };

  const handleToggleMute = () => {
    const nowMuted = soundEngine.toggleMute();
    setIsMuted(nowMuted);
  };

  // Missions claim handler
  const handleClaimReward = (missionId: string) => {
    updateMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId && m.isCompleted && !m.isClaimed) {
          updateProfile((p) => ({
            ...p,
            coins: p.coins + m.rewardCoins,
            diamonds: p.diamonds + m.rewardDiamonds,
          }));
          soundEngine.playLootPickup();
          return { ...m, isClaimed: true };
        }
        return m;
      })
    );
  };

  // Chat message sending
  const handleSendMessage = (text: string, isTactical?: boolean) => {
    if (engineRef.current) {
      engineRef.current.sendChat(text, isTactical);
    } else {
      // Local broadcast if in lobby
      const localMsg: ChatMessage = {
        id: `chat_${Date.now()}_${Math.random()}`,
        senderId: 'self',
        senderName: userProfile.name,
        text,
        timestamp: Date.now(),
        isTactical: !!isTactical,
      };
      setChatMessages((prev) => [...prev.slice(-30), localMsg]);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-rajdhani select-none touch-none">
      {/* 1. Isolated WebGL 3D Bermuda Island Canvas */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 z-0 cursor-crosshair overflow-hidden touch-none"
      />

      {/* 2. Red Hit Damage Screen Flash Overlay */}
      {playerHurtEffect && (
        <div className="absolute inset-0 pointer-events-none z-20 hit-flash bg-red-600/30" />
      )}

      {/* 3. Scope ADS Overlay (AWM 8x, Kar98k 4x, SCAR/AK 2x, Red Dot) */}
      {isScoped && gameState === 'PLAYING' && (
        <ScopeOverlay weaponId={currentWeaponId} zoomFov={scopeFov} />
      )}

      {/* 4. Free Fire Kill Effect Banner (Headshot Flare & Streak Badges) */}
      <KillEffectBanner
        killData={currentKillBadge}
        onDismiss={() => setCurrentKillBadge(null)}
      />

      {/* 5. Active In-Game HUD (Mini-Map in Left Corner, Character Skill & Clear Buttons) */}
      {gameState === 'PLAYING' && (
        <GameHUD
          stats={stats}
          currentWeaponState={currentWeaponState}
          currentWeaponId={currentWeaponId}
          slots={slots}
          activeSlot={activeSlot}
          nearbyLoot={nearbyLoot}
          currentStance={currentStance}
          aliveCount={aliveCount}
          killFeed={killFeed}
          zoneTime={zoneTime}
          isZoneShrinking={isZoneShrinking}
          zonePhase={zonePhase}
          hitmarker={hitmarker}
          airdropAlert={airdropAlert}
          characterId={userProfile.characterId}
          skillCooldown={skillCooldown}
          maxSkillCooldown={maxSkillCooldown}
          isSkillActive={isSkillActive}
          unreadChatCount={unreadChatCount}
          onDeployGlooWall={() => {
            engineRef.current?.deployGlooWall();
            // Progress gloo wall mission
            updateMissions((prev) =>
              prev.map((m) =>
                m.id === 'm_gloo'
                  ? {
                      ...m,
                      current: Math.min(m.target, m.current + 1),
                      isCompleted: m.current + 1 >= m.target,
                    }
                  : m
              )
            );
          }}
          onUseHealing={() => engineRef.current?.useHealingItem()}
          onToggleHealingType={() => engineRef.current?.toggleHealingType()}
          onSelectSlot={(slot) => engineRef.current?.selectSlot(slot)}
          onPickupLoot={() => engineRef.current?.pickupNearbyLoot()}
          onReload={() => engineRef.current?.reloadWeapon()}
          onToggleCrouch={() => engineRef.current?.toggleCrouch()}
          onToggleProne={() => engineRef.current?.toggleProne()}
          onActivateSkill={() => engineRef.current?.activateCharacterSkill()}
          onOpenChat={() => {
            setIsChatOpen(true);
            setUnreadChatCount(0);
            if (document.pointerLockElement) document.exitPointerLock();
          }}
          onOpenApkModal={() => {
            setIsAPKOpen(true);
            if (document.pointerLockElement) document.exitPointerLock();
          }}
        />
      )}

      {/* 6. Mobile Touch Controls for Phone (High-contrast, Skill & Chat buttons) */}
      {gameState === 'PLAYING' && isTouchDevice && (
        <TouchControls
          currentStance={currentStance}
          onMoveVector={(vx, vy) => {
            if (engineRef.current) {
              engineRef.current.touchMoveVector = { x: vx, y: vy };
            }
          }}
          onLookDelta={(dx, dy) => {
            engineRef.current?.addTouchLookDelta(dx, dy);
          }}
          onShootStart={() => {
            if (engineRef.current) engineRef.current.isMouseDown = true;
          }}
          onShootEnd={() => {
            if (engineRef.current) engineRef.current.isMouseDown = false;
          }}
          onToggleAim={() => {
            engineRef.current?.toggleAim();
          }}
          onJump={() => {
            engineRef.current?.triggerJump();
          }}
          onToggleCrouch={() => {
            engineRef.current?.toggleCrouch();
          }}
          onToggleProne={() => {
            engineRef.current?.toggleProne();
          }}
          onDeployGloo={() => {
            engineRef.current?.deployGlooWall();
          }}
          onReload={() => {
            engineRef.current?.reloadWeapon();
          }}
          onMedkit={() => {
            engineRef.current?.useHealingItem();
          }}
          onPickupLoot={() => {
            engineRef.current?.pickupNearbyLoot();
          }}
          onToggleHealingType={() => {
            engineRef.current?.toggleHealingType();
          }}
          nearbyLoot={nearbyLoot}
          glooCount={stats.glooWalls}
          medkitCount={
            stats.healing.activeType === 'medkit'
              ? stats.healing.medkits
              : stats.healing.bandages
          }
          isScoped={isScoped}
          characterSkillCooldown={skillCooldown}
          isSkillActive={isSkillActive}
          onActivateSkill={() => engineRef.current?.activateCharacterSkill()}
          onOpenChat={() => {
            setIsChatOpen(true);
            setUnreadChatCount(0);
          }}
        />
      )}

      {/* 7. Free Fire Lobby Screen */}
      {gameState === 'LOBBY' && (
        <LobbyScreen
          userProfile={userProfile}
          missions={missions}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenVault={() => setIsVaultOpen(true)}
          onOpenMissions={() => setIsMissionsOpen(true)}
          onOpenChat={() => {
            setIsChatOpen(true);
            setUnreadChatCount(0);
          }}
          onOpenAPK={() => setIsAPKOpen(true)}
          onStartMatch={handleStartMatch}
          onOpenProfile={() => setIsLoginModalOpen(true)}
        />
      )}

      {/* 8. Title Screen Modal (Alternative entry) */}
      {gameState === 'TITLE' && (
        <TitleScreen
          onStartGame={(chosenName) => {
            updateProfile({ name: chosenName });
            handleStartMatch();
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 9. Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onReturnToLobby={handleReturnToLobby}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 10. Game Over / Victory (Booyah!) Modal */}
      {(gameState === 'GAMEOVER' || gameState === 'VICTORY') && matchStats && (
        <GameOverModal
          stats={matchStats}
          onPlayAgain={handleRestart}
          onReturnToLobby={handleReturnToLobby}
        />
      )}

      {/* 11. Login / Account Switch Modal */}
      {isLoginModalOpen && (
        <LoginModal
          initialProfile={userProfile}
          onLoginSuccess={(newProfile) => {
            updateProfile(newProfile);
            setIsLoginModalOpen(false);
            initEngine(newProfile.name, newProfile.characterId, newProfile.outfitId);
          }}
        />
      )}

      {/* 12. Vault & Character Skills Modal */}
      {isVaultOpen && (
        <VaultModal
          selectedCharacterId={userProfile.characterId}
          selectedOutfitId={userProfile.outfitId}
          onSelectCharacter={(charId) => {
            updateProfile({ characterId: charId });
            initEngine(userProfile.name, charId, userProfile.outfitId);
          }}
          onSelectOutfit={(outfitId) => {
            updateProfile({ outfitId });
            initEngine(userProfile.name, userProfile.characterId, outfitId);
          }}
          onClose={() => setIsVaultOpen(false)}
        />
      )}

      {/* 13. Daily Missions Modal */}
      {isMissionsOpen && (
        <MissionsModal
          missions={missions}
          onClaimReward={handleClaimReward}
          onClose={() => setIsMissionsOpen(false)}
        />
      )}

      {/* 14. Live World Chat & Tactical Radio Callouts Modal */}
      {isChatOpen && (
        <ChatModal
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onClose={() => setIsChatOpen(false)}
          playerName={userProfile.name}
        />
      )}

      {/* 15. APK Build & Download Modal */}
      {isAPKOpen && <APKModal onClose={() => setIsAPKOpen(false)} />}
    </div>
  );
}
