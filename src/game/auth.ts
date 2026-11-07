/**
 * Player Profile, Login & Authentication State Manager
 */

import { CharacterId } from './characters';

export type PlayerRank =
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Heroic'
  | 'Grandmaster';

export interface PlayerAccount {
  id: string;
  username: string;
  isGuest: boolean;
  pin?: string;
  avatar: string;
  level: number;
  exp: number;
  maxExp: number;
  rank: PlayerRank;
  rankPoints: number;
  gold: number;
  diamonds: number;
  selectedCharacter: CharacterId;
  selectedOutfit: string;
  unlockedCharacters: CharacterId[];
  unlockedOutfits: string[];
  stats: {
    totalMatches: number;
    booyahs: number;
    kills: number;
    headshots: number;
    damageDealt: number;
  };
  lastRewardClaimDate?: string;
}

const STORAGE_KEY = 'volox_max_india_player_account';

const DEFAULT_INDIAN_NAMES = [
  'Aarya_Pro',
  'Veer_Sniper',
  'Rudra_Max',
  'Kabir_Hunter',
  'Shiva_Striker',
  'Arjun_God',
  'Dev_Warrior',
  'Surya_King',
  'Vikram_Ace',
  'Karan_Max',
];

export function generateRandomGuestName(): string {
  const base = DEFAULT_INDIAN_NAMES[Math.floor(Math.random() * DEFAULT_INDIAN_NAMES.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${base}_${num}`;
}

export function createDefaultAccount(username?: string, isGuest: boolean = true): PlayerAccount {
  return {
    id: `player_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    username: username || generateRandomGuestName(),
    isGuest,
    avatar: '🇮🇳',
    level: 14,
    exp: 420,
    maxExp: 1000,
    rank: 'Heroic',
    rankPoints: 3120,
    gold: 6500,
    diamonds: 420,
    selectedCharacter: 'alok',
    selectedOutfit: 'default_commando',
    unlockedCharacters: ['alok', 'kelly'],
    unlockedOutfits: ['default_commando', 'alok_stage', 'kelly_track'],
    stats: {
      totalMatches: 28,
      booyahs: 9,
      kills: 84,
      headshots: 36,
      damageDealt: 19420,
    },
  };
}

export function loadSavedAccount(): PlayerAccount {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.username) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved account:', e);
  }
  const defaultAcc = createDefaultAccount();
  saveAccount(defaultAcc);
  return defaultAcc;
}

export function saveAccount(account: PlayerAccount): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  } catch (e) {
    console.error('Failed to save account:', e);
  }
}

export function registerOrLoginAccount(username: string, pin: string): PlayerAccount {
  const current = loadSavedAccount();
  const updated: PlayerAccount = {
    ...current,
    username: username.trim() || generateRandomGuestName(),
    isGuest: false,
    pin: pin.trim(),
  };
  saveAccount(updated);
  return updated;
}

export function resetToGuest(): PlayerAccount {
  const guest = createDefaultAccount(generateRandomGuestName(), true);
  saveAccount(guest);
  return guest;
}
