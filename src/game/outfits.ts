/**
 * Free Fire style Vault & Outfits System
 */

import { ItemRarity } from './types';

export interface OutfitDef {
  id: string;
  name: string;
  category: 'bundle' | 'top' | 'bottom';
  rarity: ItemRarity;
  description: string;
  skinTone: string;
  vestHue: number;
  pantColor: string;
  visorColor: string;
  glowColor?: string;
  costGold: number;
  costDiamonds: number;
  unlockedByDefault: boolean;
}

export const OUTFITS: Record<string, OutfitDef> = {
  default_commando: {
    id: 'default_commando',
    name: 'Indian Commando',
    category: 'bundle',
    rarity: 'common',
    description: 'Standard issue camouflage tactical vest with rugged combat trousers.',
    skinTone: '#c27945',
    vestHue: 35,
    pantColor: '#1e293b',
    visorColor: '#f97316',
    costGold: 0,
    costDiamonds: 0,
    unlockedByDefault: true,
  },
  alok_stage: {
    id: 'alok_stage',
    name: 'Midnight DJ Trench',
    category: 'bundle',
    rarity: 'rare',
    description: 'Sleek black stage coat with gold trims and acoustic rhythm feedback.',
    skinTone: '#c27945',
    vestHue: 40,
    pantColor: '#0f172a',
    visorColor: '#06b6d4',
    glowColor: '#06b6d4',
    costGold: 3000,
    costDiamonds: 120,
    unlockedByDefault: true,
  },
  cobra_venom: {
    id: 'cobra_venom',
    name: 'Cobra Venom Bundle',
    category: 'bundle',
    rarity: 'legendary',
    description: 'Legendary serpent armor infused with glowing crimson viper fury.',
    skinTone: '#a85532',
    vestHue: 350,
    pantColor: '#450a0a',
    visorColor: '#ef4444',
    glowColor: '#ef4444',
    costGold: 15000,
    costDiamonds: 500,
    unlockedByDefault: false,
  },
  arctic_blue: {
    id: 'arctic_blue',
    name: 'Arctic Blue Bundle',
    category: 'bundle',
    rarity: 'legendary',
    description: 'Frost-forged sub-zero battle suit with pulsating crystal cyan lights.',
    skinTone: '#e2b391',
    vestHue: 195,
    pantColor: '#0c4a6e',
    visorColor: '#38bdf8',
    glowColor: '#38bdf8',
    costGold: 12000,
    costDiamonds: 450,
    unlockedByDefault: false,
  },
  criminal_red: {
    id: 'criminal_red',
    name: 'Top Criminal (Red)',
    category: 'bundle',
    rarity: 'epic',
    description: 'Iconic Free Fire high-stakes bank heist jumpsuit and sinister clown visor.',
    skinTone: '#bf7b47',
    vestHue: 0,
    pantColor: '#991b1b',
    visorColor: '#f87171',
    glowColor: '#ef4444',
    costGold: 8500,
    costDiamonds: 320,
    unlockedByDefault: false,
  },
  kelly_track: {
    id: 'kelly_track',
    name: 'Lightning Athletics',
    category: 'bundle',
    rarity: 'rare',
    description: 'Bright aerodynamic yellow sprint suit built for maximum agility.',
    skinTone: '#e3a172',
    vestHue: 50,
    pantColor: '#eab308',
    visorColor: '#ffffff',
    costGold: 2500,
    costDiamonds: 80,
    unlockedByDefault: true,
  },
  shadow_ninja: {
    id: 'shadow_ninja',
    name: 'Shadow Samurai Shinobi',
    category: 'bundle',
    rarity: 'epic',
    description: 'Stealth combat shroud with reinforced ceramic shin guards and dark visor.',
    skinTone: '#c27945',
    vestHue: 270,
    pantColor: '#172554',
    visorColor: '#818cf8',
    glowColor: '#818cf8',
    costGold: 7000,
    costDiamonds: 280,
    unlockedByDefault: false,
  },
};
