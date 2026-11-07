import * as THREE from 'three';
import {
  WeaponDef,
  WeaponId,
  WeaponState,
  AmmoType,
  ArmorState,
  HelmetLevel,
  VestLevel,
  AmmoInventory,
  HealingInventory,
} from './types';

export const WEAPON_DEFINITIONS: Record<WeaponId, WeaponDef> = {
  // Assault Rifles
  scar: {
    id: 'scar',
    name: 'SCAR-L',
    category: 'AR',
    ammoType: 'ammo_ar',
    rarity: 'rare',
    damage: 28,
    headshotMultiplier: 2.5, // 70 headshot
    fireRate: 0.11, // ~9 rounds/sec
    magazineSize: 30,
    reloadTime: 1.8,
    range: 120,
    spread: 0.022,
    recoil: 0.04,
    zoomFov: 45,
    scopeType: '2x',
  },
  ak47: {
    id: 'ak47',
    name: 'AK-47',
    category: 'AR',
    ammoType: 'ammo_ar',
    rarity: 'epic',
    damage: 38,
    headshotMultiplier: 2.6, // ~98 headshot
    fireRate: 0.13,
    magazineSize: 30,
    reloadTime: 2.1,
    range: 135,
    spread: 0.035,
    recoil: 0.065,
    zoomFov: 48,
    scopeType: 'red_dot',
  },

  // Shotguns
  m1014: {
    id: 'm1014',
    name: 'M1014',
    category: 'SG',
    ammoType: 'ammo_sg',
    rarity: 'rare',
    damage: 18, // 6 pellets * 18 = 108 total body damage
    headshotMultiplier: 1.8,
    fireRate: 0.65,
    magazineSize: 6,
    reloadTime: 2.2,
    range: 35,
    spread: 0.08,
    recoil: 0.09,
    pellets: 6,
    zoomFov: 55,
    scopeType: 'red_dot',
  },
  spas12: {
    id: 'spas12',
    name: 'SPAS-12',
    category: 'SG',
    ammoType: 'ammo_sg',
    rarity: 'epic',
    damage: 24, // 5 pellets * 24 = 120 total damage
    headshotMultiplier: 1.9,
    fireRate: 0.8,
    magazineSize: 5,
    reloadTime: 2.5,
    range: 30,
    spread: 0.09,
    recoil: 0.11,
    pellets: 5,
    zoomFov: 55,
    scopeType: 'red_dot',
  },

  // Pistols (Sidearms)
  usp: {
    id: 'usp',
    name: 'USP .45',
    category: 'HG',
    ammoType: 'ammo_hg',
    rarity: 'common',
    damage: 22,
    headshotMultiplier: 2.2,
    fireRate: 0.22,
    magazineSize: 12,
    reloadTime: 1.3,
    range: 65,
    spread: 0.028,
    recoil: 0.03,
    zoomFov: 58,
    scopeType: 'red_dot',
  },
  deagle: {
    id: 'deagle',
    name: 'Desert Eagle',
    category: 'HG',
    ammoType: 'ammo_hg',
    rarity: 'epic',
    damage: 54,
    headshotMultiplier: 2.5, // 135 damage headshot!
    fireRate: 0.45,
    magazineSize: 7,
    reloadTime: 1.7,
    range: 85,
    spread: 0.03,
    recoil: 0.08,
    zoomFov: 46,
    scopeType: '2x',
  },

  // Sniper Rifles
  awm: {
    id: 'awm',
    name: 'AWM Sniper',
    category: 'SR',
    ammoType: 'ammo_sr',
    rarity: 'legendary',
    damage: 150,
    headshotMultiplier: 2.4, // ~360 instant kill headshot
    fireRate: 1.4,
    magazineSize: 5,
    reloadTime: 2.6,
    range: 240,
    spread: 0.002,
    recoil: 0.14,
    zoomFov: 18, // 8x scope zoom
    scopeType: '8x',
  },
  kar98k: {
    id: 'kar98k',
    name: 'Kar98k',
    category: 'SR',
    ammoType: 'ammo_sr',
    rarity: 'rare',
    damage: 90,
    headshotMultiplier: 2.3, // ~207 damage headshot
    fireRate: 1.2,
    magazineSize: 5,
    reloadTime: 2.4,
    range: 190,
    spread: 0.005,
    recoil: 0.1,
    zoomFov: 28, // 4x scope zoom
    scopeType: '4x',
  },

  // Melee
  katana: {
    id: 'katana',
    name: 'Katana',
    category: 'MELEE',
    rarity: 'rare',
    damage: 65,
    headshotMultiplier: 1.5,
    fireRate: 0.45,
    magazineSize: 1,
    reloadTime: 0.1,
    range: 4.5,
    spread: 0.01,
    recoil: 0.02,
    zoomFov: 60,
    scopeType: 'none',
  },
  pan: {
    id: 'pan',
    name: 'Tactical Pan',
    category: 'MELEE',
    rarity: 'common',
    damage: 50,
    headshotMultiplier: 1.6,
    fireRate: 0.5,
    magazineSize: 1,
    reloadTime: 0.1,
    range: 3.8,
    spread: 0.01,
    recoil: 0.02,
    zoomFov: 60,
    scopeType: 'none',
  },
};

// Armor Tier Statistics
export const HELMET_DEFINITIONS: Record<
  1 | 2 | 3,
  { name: string; damageReduction: number; maxDurability: number; rarity: 'common' | 'rare' | 'epic' }
> = {
  1: {
    name: 'Military Helmet Lvl 1',
    damageReduction: 0.25,
    maxDurability: 80,
    rarity: 'common',
  },
  2: {
    name: 'Tactical Kevlar Helmet Lvl 2',
    damageReduction: 0.4,
    maxDurability: 140,
    rarity: 'rare',
  },
  3: {
    name: 'Spetsnaz Titanium Helmet Lvl 3',
    damageReduction: 0.55,
    maxDurability: 220,
    rarity: 'epic',
  },
};

export const VEST_DEFINITIONS: Record<
  1 | 2 | 3,
  { name: string; damageReduction: number; maxDurability: number; rarity: 'common' | 'rare' | 'epic' }
> = {
  1: {
    name: 'Police Vest Lvl 1',
    damageReduction: 0.3,
    maxDurability: 100,
    rarity: 'common',
  },
  2: {
    name: 'Military Assault Vest Lvl 2',
    damageReduction: 0.5,
    maxDurability: 180,
    rarity: 'rare',
  },
  3: {
    name: 'Reinforced Ceramic Vest Lvl 3',
    damageReduction: 0.65,
    maxDurability: 260,
    rarity: 'epic',
  },
};

export const HEALING_DEFINITIONS = {
  medkit: {
    name: 'Medical Kit',
    useTime: 3.5, // seconds
    hpHeal: 75,
    epHeal: 50,
    maxHpCap: 200,
    rarity: 'rare' as const,
  },
  bandage: {
    name: 'Combat Bandage',
    useTime: 1.5, // seconds
    hpHeal: 25,
    epHeal: 0,
    maxHpCap: 150, // bandages can heal up to 150 HP
    rarity: 'common' as const,
  },
};

export function createInitialWeaponStates(): Record<WeaponId, WeaponState> {
  const states = {} as Record<WeaponId, WeaponState>;
  Object.keys(WEAPON_DEFINITIONS).forEach((key) => {
    const id = key as WeaponId;
    const def = WEAPON_DEFINITIONS[id];
    states[id] = {
      id,
      ammo: def.magazineSize,
      isReloading: false,
      reloadProgress: 0,
    };
  });
  return states;
}

export function createInitialAmmoInventory(): AmmoInventory {
  return {
    ammo_ar: 90,
    ammo_sg: 24,
    ammo_hg: 36,
    ammo_sr: 15,
  };
}

export function createInitialArmorState(): ArmorState {
  return {
    helmetLevel: 1,
    helmetDurability: 80,
    maxHelmetDurability: 80,
    helmetDamageReduction: 0.25,

    vestLevel: 1,
    vestDurability: 100,
    maxVestDurability: 100,
    vestDamageReduction: 0.3,
  };
}

export function createInitialHealingInventory(): HealingInventory {
  return {
    medkits: 2,
    bandages: 5,
    activeType: 'medkit',
  };
}
