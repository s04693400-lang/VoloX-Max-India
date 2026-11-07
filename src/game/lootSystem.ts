import * as THREE from 'three';
import {
  LootItem,
  WeaponId,
  AmmoType,
  HealingType,
  ItemRarity,
  LootType,
} from './types';
import {
  WEAPON_DEFINITIONS,
  HELMET_DEFINITIONS,
  VEST_DEFINITIONS,
  HEALING_DEFINITIONS,
} from './weapons';
import {
  createWeaponModel,
  createAmmoBoxMesh,
  createMedkitMesh,
  createBandageMesh,
  createHelmetMesh,
  createVestMesh,
  createGlooWallPickupMesh,
} from './models';

// Loot Rarity Palette
export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#94a3b8',    // Silver / Slate
  rare: '#38bdf8',      // Bright Cyan / Blue
  epic: '#c084fc',      // Royal Purple
  legendary: '#f59e0b', // Radiant Gold
};

// Drop rate distribution per zone tier
export type LootZoneTier = 'HIGH' | 'MID' | 'LOW';

export interface LootSpawnPoint {
  x: number;
  z: number;
  tier: LootZoneTier;
  locationName: string;
}

// 60+ Strategic Loot Locations across Bermuda Island
export const BERMUDA_LOOT_LOCATIONS: LootSpawnPoint[] = [
  // High Tier: Military Hangars & Bunkers (West Sector)
  { x: -35, z: -25, tier: 'HIGH', locationName: 'Hangar A' },
  { x: -32, z: -22, tier: 'HIGH', locationName: 'Hangar A Arsenal' },
  { x: -38, z: -28, tier: 'HIGH', locationName: 'Hangar A Bunker' },
  { x: -35, z: -18, tier: 'HIGH', locationName: 'Hangar A Tarmac' },

  // High Tier: Peak Mountain Outpost (Central Peak)
  { x: 12, z: -8, tier: 'HIGH', locationName: 'Peak Command Post' },
  { x: 16, z: -12, tier: 'HIGH', locationName: 'Peak Radar Dish' },
  { x: 10, z: -5, tier: 'HIGH', locationName: 'Peak Helipad' },
  { x: 18, z: -6, tier: 'HIGH', locationName: 'Peak Sniper Perch' },

  // High Tier: Clocktower Depot (East Sector)
  { x: 45, z: 20, tier: 'HIGH', locationName: 'Clocktower Main Hall' },
  { x: 48, z: 24, tier: 'HIGH', locationName: 'Clocktower Vault' },
  { x: 42, z: 18, tier: 'HIGH', locationName: 'Clocktower Courtyard' },
  { x: 45, z: 28, tier: 'HIGH', locationName: 'Clocktower Armory' },

  // Mid Tier: Factory Yard (South Sector)
  { x: -20, z: 50, tier: 'MID', locationName: 'Factory Floor' },
  { x: -24, z: 52, tier: 'MID', locationName: 'Factory Catwalk' },
  { x: -16, z: 48, tier: 'MID', locationName: 'Factory Warehouse' },
  { x: -22, z: 56, tier: 'MID', locationName: 'Factory Loading Dock' },

  // Mid Tier: Mill Outpost (North-East Sector)
  { x: 30, z: -55, tier: 'MID', locationName: 'Mill Outpost Office' },
  { x: 34, z: -52, tier: 'MID', locationName: 'Mill Silo' },
  { x: 26, z: -58, tier: 'MID', locationName: 'Mill Yard' },

  // Mid Tier: Elevated Watchtowers (High Ground Snipers)
  { x: -50, z: 15, tier: 'MID', locationName: 'West Watchtower' },
  { x: 15, z: -35, tier: 'MID', locationName: 'North Watchtower' },
  { x: 60, z: -10, tier: 'MID', locationName: 'East Watchtower' },
  { x: -10, z: -60, tier: 'MID', locationName: 'South Watchtower' },

  // Low Tier: Tactical Shipping Containers & Roadside Sandbags
  { x: -15, z: -15, tier: 'LOW', locationName: 'Container Red A' },
  { x: -18, z: -11, tier: 'LOW', locationName: 'Container Blue A' },
  { x: 25, z: 35, tier: 'LOW', locationName: 'Container Yard South' },
  { x: 30, z: 38, tier: 'LOW', locationName: 'Container Red B' },
  { x: -38, z: 35, tier: 'LOW', locationName: 'Container Blue B' },
  { x: 10, z: -20, tier: 'LOW', locationName: 'Peak Footpath Depot' },
  { x: -5, z: 30, tier: 'LOW', locationName: 'Crossroad Crates' },
  { x: 40, z: -30, tier: 'LOW', locationName: 'East Trail Cache' },

  // Additional Scattered Outskirts and Coastal Shacks
  { x: -65, z: -15, tier: 'LOW', locationName: 'West Beach Shack' },
  { x: -55, z: 45, tier: 'LOW', locationName: 'Southwest Dunes' },
  { x: 55, z: 45, tier: 'LOW', locationName: 'Southeast Cape' },
  { x: 50, z: -45, tier: 'LOW', locationName: 'Northeast Ridge' },
  { x: -5, z: -40, tier: 'LOW', locationName: 'North Trench' },
  { x: 5, z: 45, tier: 'LOW', locationName: 'South Shoreline' },
  { x: -45, z: -45, tier: 'LOW', locationName: 'Northwest Outcrop' },
  { x: 35, z: -15, tier: 'MID', locationName: 'Valley Passage' },
  { x: -15, z: 15, tier: 'LOW', locationName: 'Central Glade' },
];

// Weighted Random Loot Generator
export function generateLootForPoint(
  spawn: LootSpawnPoint,
  id: string,
  getGroundHeight: (x: number, z: number) => number
): LootItem {
  const y = getGroundHeight(spawn.x, spawn.z) + 0.35;
  const roll = Math.random();

  if (spawn.tier === 'HIGH') {
    // 40% Weapon (AK-47, AWM, SPAS-12, SCAR), 25% Armor Lvl 2-3, 15% Ammo, 10% Medkit, 10% Gloo
    if (roll < 0.40) {
      const weaponPool: WeaponId[] = ['ak47', 'awm', 'spas12', 'scar', 'deagle'];
      const chosenWeapon = weaponPool[Math.floor(Math.random() * weaponPool.length)];
      const def = WEAPON_DEFINITIONS[chosenWeapon];
      return {
        id,
        type: 'weapon',
        weaponId: chosenWeapon,
        name: def.name,
        rarity: def.rarity,
        amount: 1,
        x: spawn.x,
        y,
        z: spawn.z,
      };
    } else if (roll < 0.65) {
      const isHelmet = Math.random() > 0.5;
      const lvl: 2 | 3 = Math.random() > 0.4 ? 2 : 3;
      const def = isHelmet ? HELMET_DEFINITIONS[lvl] : VEST_DEFINITIONS[lvl];
      return {
        id,
        type: isHelmet ? 'helmet' : 'vest',
        armorLevel: lvl,
        name: def.name,
        rarity: def.rarity,
        amount: 1,
        x: spawn.x,
        y,
        z: spawn.z,
      };
    } else if (roll < 0.80) {
      const ammoTypes: AmmoType[] = ['ammo_ar', 'ammo_sr', 'ammo_sg'];
      const chosen = ammoTypes[Math.floor(Math.random() * ammoTypes.length)];
      const amount = chosen === 'ammo_ar' ? 60 : chosen === 'ammo_sr' ? 10 : 18;
      return {
        id,
        type: 'ammo',
        ammoType: chosen,
        name: getAmmoName(chosen),
        rarity: 'rare',
        amount,
        x: spawn.x,
        y,
        z: spawn.z,
      };
    } else if (roll < 0.90) {
      return {
        id,
        type: 'healing',
        healingType: 'medkit',
        name: 'Medical Kit',
        rarity: 'rare',
        amount: 1,
        x: spawn.x,
        y,
        z: spawn.z,
      };
    } else {
      return {
        id,
        type: 'gloo',
        name: 'Gloo Wall Shield',
        rarity: 'epic',
        amount: 1,
        x: spawn.x,
        y,
        z: spawn.z,
      };
    }
  } else if (spawn.tier === 'MID') {
    // 35% Weapon (SCAR, M1014, Kar98k, USP), 20% Armor Lvl 1-2, 25% Ammo, 15% Healing, 5% Gloo
    if (roll < 0.35) {
      const weaponPool: WeaponId[] = ['scar', 'm1014', 'kar98k', 'usp', 'katana'];
      const chosen = weaponPool[Math.floor(Math.random() * weaponPool.length)];
      const def = WEAPON_DEFINITIONS[chosen];
      return {
        id,
        type: 'weapon',
        weaponId: chosen,
        name: def.name,
        rarity: def.rarity,
        amount: 1,
        x: spawn.x,
        y,
        z: spawn.z,
      };
    } else if (roll < 0.55) {
      const isHelmet = Math.random() > 0.5;
      const lvl: 1 | 2 = Math.random() > 0.4 ? 2 : 1;
      const def = isHelmet ? HELMET_DEFINITIONS[lvl] : VEST_DEFINITIONS[lvl];
      return {
        id,
        type: isHelmet ? 'helmet' : 'vest',
        armorLevel: lvl,
        name: def.name,
        rarity: def.rarity,
        amount: 1,
        x: spawn.x,
        y,
        z: spawn.z,
      };
    } else if (roll < 0.80) {
      const ammoTypes: AmmoType[] = ['ammo_ar', 'ammo_sg', 'ammo_hg'];
      const chosen = ammoTypes[Math.floor(Math.random() * ammoTypes.length)];
      const amount = chosen === 'ammo_ar' ? 45 : chosen === 'ammo_sg' ? 12 : 30;
      return {
        id,
        type: 'ammo',
        ammoType: chosen,
        name: getAmmoName(chosen),
        rarity: 'common',
        amount,
        x: spawn.x,
        y,
        z: spawn.z,
      };
    } else if (roll < 0.95) {
      const isMedkit = Math.random() > 0.6;
      return {
        id,
        type: 'healing',
        healingType: isMedkit ? 'medkit' : 'bandage',
        name: isMedkit ? 'Medical Kit' : 'Combat Bandage (x3)',
        rarity: isMedkit ? 'rare' : 'common',
        amount: isMedkit ? 1 : 3,
        x: spawn.x,
        y,
        z: spawn.z,
      };
    } else {
      return {
        id,
        type: 'gloo',
        name: 'Gloo Wall Shield',
        rarity: 'rare',
        amount: 1,
        x: spawn.x,
        y,
        z: spawn.z,
      };
    }
  } else {
    // LOW TIER (Containers & Outskirts)
    // 30% Pistols/Melee (USP, Deagle, Pan), 35% Ammo, 20% Bandages, 15% Level 1 Armor
    if (roll < 0.30) {
      const weaponPool: WeaponId[] = ['usp', 'deagle', 'pan', 'katana'];
      const chosen = weaponPool[Math.floor(Math.random() * weaponPool.length)];
      const def = WEAPON_DEFINITIONS[chosen];
      return {
        id,
        type: 'weapon',
        weaponId: chosen,
        name: def.name,
        rarity: def.rarity,
        amount: 1,
        x: spawn.x,
        y,
        z: spawn.z,
      };
    } else if (roll < 0.65) {
      const ammoTypes: AmmoType[] = ['ammo_ar', 'ammo_hg', 'ammo_sg'];
      const chosen = ammoTypes[Math.floor(Math.random() * ammoTypes.length)];
      const amount = chosen === 'ammo_ar' ? 30 : chosen === 'ammo_sg' ? 8 : 24;
      return {
        id,
        type: 'ammo',
        ammoType: chosen,
        name: getAmmoName(chosen),
        rarity: 'common',
        amount,
        x: spawn.x,
        y,
        z: spawn.z,
      };
    } else if (roll < 0.85) {
      return {
        id,
        type: 'healing',
        healingType: 'bandage',
        name: 'Combat Bandage (x3)',
        rarity: 'common',
        amount: 3,
        x: spawn.x,
        y,
        z: spawn.z,
      };
    } else {
      const isHelmet = Math.random() > 0.5;
      const def = isHelmet ? HELMET_DEFINITIONS[1] : VEST_DEFINITIONS[1];
      return {
        id,
        type: isHelmet ? 'helmet' : 'vest',
        armorLevel: 1,
        name: def.name,
        rarity: 'common',
        amount: 1,
        x: spawn.x,
        y,
        z: spawn.z,
      };
    }
  }
}

export function getAmmoName(type: AmmoType): string {
  switch (type) {
    case 'ammo_ar':
      return '5.56mm / 7.62mm Rifle Ammo';
    case 'ammo_sg':
      return '12 Gauge Shells';
    case 'ammo_hg':
      return '9mm / .45 ACP Pistol Ammo';
    case 'ammo_sr':
      return '.300 Heavy Sniper Ammo';
  }
}

// 3D Procedural Loot Mesh Factory with Light Beacons
export function createLootVisualMesh(item: LootItem): THREE.Group {
  const root = new THREE.Group();
  root.position.set(item.x, item.y, item.z);

  const rarityColor = RARITY_COLORS[item.rarity];

  // 1. Vertical Soft Rarity Beacon Column
  const beaconGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.0, 8);
  const beaconMat = new THREE.MeshBasicMaterial({
    color: rarityColor,
    transparent: true,
    opacity: item.rarity === 'legendary' ? 0.75 : item.rarity === 'epic' ? 0.6 : 0.4,
    depthWrite: false,
  });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = 2.0;
  root.add(beacon);

  // 2. Glowing Ground Halo Ring
  const haloGeo = new THREE.RingGeometry(0.35, 0.6, 16);
  const haloMat = new THREE.MeshBasicMaterial({
    color: rarityColor,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.03;
  root.add(halo);

  // 3. 3D Model based on Loot Type
  let itemModel: THREE.Object3D;

  if (item.type === 'weapon' && item.weaponId) {
    itemModel = createWeaponModel(item.weaponId);
    itemModel.scale.set(0.85, 0.85, 0.85);
    itemModel.position.set(0, 0.15, 0);
    itemModel.rotation.set(0, Math.random() * Math.PI * 2, 0);
  } else if (item.type === 'ammo' && item.ammoType) {
    itemModel = createAmmoBoxMesh(item.ammoType);
    itemModel.position.set(0, 0.1, 0);
  } else if (item.type === 'healing') {
    if (item.healingType === 'medkit') {
      itemModel = createMedkitMesh();
    } else {
      itemModel = createBandageMesh();
    }
    itemModel.position.set(0, 0.1, 0);
  } else if (item.type === 'helmet' && item.armorLevel) {
    itemModel = createHelmetMesh(item.armorLevel);
    itemModel.position.set(0, 0.15, 0);
  } else if (item.type === 'vest' && item.armorLevel) {
    itemModel = createVestMesh(item.armorLevel);
    itemModel.position.set(0, 0.12, 0);
  } else {
    // Gloo Wall Loot Pickup
    itemModel = createGlooWallPickupMesh();
    itemModel.position.set(0, 0.15, 0);
  }

  root.add(itemModel);
  item.mesh = root;
  item.beacon = beacon;

  return root;
}
