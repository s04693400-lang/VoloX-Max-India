export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

export type WeaponCategory = 'AR' | 'SG' | 'HG' | 'SR' | 'MELEE';

export type WeaponId =
  | 'scar'
  | 'ak47'
  | 'm1014'
  | 'spas12'
  | 'usp'
  | 'deagle'
  | 'awm'
  | 'kar98k'
  | 'katana'
  | 'pan';

export type AmmoType = 'ammo_ar' | 'ammo_sg' | 'ammo_hg' | 'ammo_sr';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  category: WeaponCategory;
  ammoType?: AmmoType;
  rarity: ItemRarity;
  damage: number;
  headshotMultiplier: number;
  fireRate: number; // seconds between shots
  magazineSize: number;
  reloadTime: number; // seconds
  range: number;
  spread: number;
  recoil: number;
  pellets?: number;
  zoomFov?: number;
}

export interface WeaponState {
  id: WeaponId;
  ammo: number;
  isReloading: boolean;
  reloadProgress: number;
}

export type HelmetLevel = 0 | 1 | 2 | 3;
export type VestLevel = 0 | 1 | 2 | 3;

export interface ArmorState {
  helmetLevel: HelmetLevel;
  helmetDurability: number;
  maxHelmetDurability: number;
  helmetDamageReduction: number; // 0, 0.25, 0.40, 0.55

  vestLevel: VestLevel;
  vestDurability: number;
  maxVestDurability: number;
  vestDamageReduction: number; // 0, 0.30, 0.50, 0.65
}

export type HealingType = 'medkit' | 'bandage';

export type LootType =
  | 'weapon'
  | 'ammo'
  | 'healing'
  | 'helmet'
  | 'vest'
  | 'gloo';

export interface LootItem {
  id: string;
  type: LootType;
  weaponId?: WeaponId;
  ammoType?: AmmoType;
  healingType?: HealingType;
  armorLevel?: 1 | 2 | 3;
  amount: number;
  name: string;
  rarity: ItemRarity;
  x: number;
  y: number;
  z: number;
  mesh?: any;
  beacon?: any;
}

export interface AmmoInventory {
  ammo_ar: number;   // 5.56 / 7.62mm
  ammo_sg: number;   // 12 Gauge
  ammo_hg: number;   // 9mm / .45 ACP
  ammo_sr: number;   // Heavy Sniper
}

export interface HealingInventory {
  medkits: number;
  bandages: number;
  activeType: HealingType;
}

export interface SurvivorStats {
  hp: number;
  maxHp: number;
  ep: number;
  maxEp: number;
  armor: ArmorState;
  ammo: AmmoInventory;
  healing: HealingInventory;
  glooWalls: number;
  kills: number;
  damageDealt: number;
  headshots: number;
}

export interface DamageNumber {
  id: number;
  text: string;
  x: number;
  y: number;
  z: number;
  isHeadshot: boolean;
  isArmorHit?: boolean;
  opacity: number;
  scale: number;
}

export interface KillFeedEntry {
  id: string;
  killer: string;
  victim: string;
  weapon: string;
  isHeadshot: boolean;
  isPlayerKiller: boolean;
  isPlayerVictim: boolean;
  timestamp: number;
}

export interface MatchStats {
  rank: number;
  totalPlayers: number;
  kills: number;
  headshots: number;
  damageDealt: number;
  survivalTimeSec: number;
  isBooyah: boolean;
}

export interface ZoneState {
  currentRadius: number;
  targetRadius: number;
  centerX: number;
  centerZ: number;
  nextCenterX: number;
  nextCenterZ: number;
  shrinkTimer: number;
  phaseDuration: number;
  isShrinking: boolean;
  phase: number;
  damagePerSec: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  isTactical: boolean;
  timestamp: number;
}

export type KillBadgeType = 'FIRST_BLOOD' | 'HEADSHOT' | 'DOUBLE_KILL' | 'TRIPLE_KILL' | 'ELIMINATED';

export interface KillBadgeData {
  id: string;
  type: KillBadgeType;
  victimName: string;
  weapon: string;
  isHeadshot: boolean;
  timestamp: number;
}

export * from './weapons';

