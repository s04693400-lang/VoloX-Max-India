export interface CharacterSkill {
  id: string;
  name: string;
  type: 'active' | 'passive';
  description: string;
  cooldown: number; // in seconds
  duration?: number; // for active skills
  soundName?: string;
  iconName: string;
}

export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  bio: string;
  rarity: 'rare' | 'epic' | 'legendary';
  skill: CharacterSkill;
  avatarColor: string;
  vestHue: number;
  pantColor: string;
  visorColor: string;
  accentColor: string;
}

export interface OutfitDef {
  id: string;
  name: string;
  rarity: 'rare' | 'epic' | 'legendary';
  description: string;
  vestHue: number;
  pantColor: string;
  visorColor: string;
  coatColor?: string;
  glowColor?: string;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'alok',
    name: 'DJ Alok',
    title: 'World Famous DJ & Producer',
    bio: 'Using the power of music, Alok drops a pulsating soundwave aura that revitalizes teammates and boosts movement velocity.',
    rarity: 'legendary',
    skill: {
      id: 'drop_the_beat',
      name: 'Drop the Beat',
      type: 'active',
      description: 'Creates a 5m sonic aura that restores 12 HP/s and increases sprinting speed by +25% for 6s.',
      cooldown: 45,
      duration: 6,
      iconName: 'Music',
    },
    avatarColor: '#f59e0b',
    vestHue: 40,
    pantColor: '#0f172a',
    visorColor: '#f59e0b',
    accentColor: '#fbbf24',
  },
  {
    id: 'chrono',
    name: 'Chrono',
    title: 'Dimensional Bounty Hunter',
    bio: 'Chrono bends space-time to project a protective kinetic forcefield dome that shields against enemy bullets.',
    rarity: 'legendary',
    skill: {
      id: 'time_turner',
      name: 'Time Turner',
      type: 'active',
      description: 'Deploys a protective forcefield dome that absorbs up to 500 damage for 5s.',
      cooldown: 55,
      duration: 5,
      iconName: 'Shield',
    },
    avatarColor: '#38bdf8',
    vestHue: 200,
    pantColor: '#0284c7',
    visorColor: '#38bdf8',
    accentColor: '#0ea5e9',
  },
  {
    id: 'kelly',
    name: 'Kelly (The Swift)',
    title: 'High School Sprint Prodigy',
    bio: 'Kelly runs like the wind. Her unmatched sprint agility lets her flank enemies and escape dangerous storm zones.',
    rarity: 'epic',
    skill: {
      id: 'dash',
      name: 'Deadly Velocity',
      type: 'passive',
      description: 'Passive: Sprinting speed increased by +15%. First shot after sprinting deals +20% bonus damage.',
      cooldown: 0,
      iconName: 'Zap',
    },
    avatarColor: '#eab308',
    vestHue: 50,
    pantColor: '#ca8a04',
    visorColor: '#facc15',
    accentColor: '#eab308',
  },
  {
    id: 'hayato',
    name: 'Hayato',
    title: 'Legendary Samurai Warrior',
    bio: 'A master of the blade and tactical rifle. When wounded, his warrior spirit ignores enemy armor.',
    rarity: 'epic',
    skill: {
      id: 'bushido',
      name: 'Bushido',
      type: 'passive',
      description: 'Passive: For every 10% decrease in HP, armor penetration against enemy helmets & vests increases by +3.5%.',
      cooldown: 0,
      iconName: 'Sword',
    },
    avatarColor: '#ef4444',
    vestHue: 0,
    pantColor: '#991b1b',
    visorColor: '#ef4444',
    accentColor: '#dc2626',
  },
  {
    id: 'wukong',
    name: 'Wukong',
    title: 'The Monkey King',
    bio: 'A mischievous cyber-enhanced warrior who transforms into a tropical shrub to ambush unsuspecting enemies.',
    rarity: 'legendary',
    skill: {
      id: 'camouflage',
      name: 'Camouflage',
      type: 'active',
      description: 'Transforms into a tropical bush for 10s, reducing detection and breaking enemy crosshair lock.',
      cooldown: 60,
      duration: 10,
      iconName: 'Sparkles',
    },
    avatarColor: '#22c55e',
    vestHue: 140,
    pantColor: '#15803d',
    visorColor: '#4ade80',
    accentColor: '#16a34a',
  },
  {
    id: 'k',
    name: 'Captain K',
    title: 'Master of All & Jiu-Jitsu Sensei',
    bio: 'An expert in physiology and internal energy. Channels unlimited EP energy to heal without stopping.',
    rarity: 'legendary',
    skill: {
      id: 'master_of_all',
      name: 'Master of All',
      type: 'passive',
      description: 'Passive: Max EP is raised to 250. Converts EP to HP 3x faster continuously during combat.',
      cooldown: 0,
      iconName: 'Flame',
    },
    avatarColor: '#a855f7',
    vestHue: 280,
    pantColor: '#6b21a8',
    visorColor: '#c084fc',
    accentColor: '#9333ea',
  },
];

export const OUTFITS: OutfitDef[] = [
  {
    id: 'tactical_commando',
    name: 'Tactical Commando',
    rarity: 'rare',
    description: 'Bermuda military camouflage vest, reinforced carbon armor and tactical gloves.',
    vestHue: 35,
    pantColor: '#0f172a',
    visorColor: '#f97316',
    glowColor: '#f97316',
  },
  {
    id: 'cyber_neon',
    name: 'Cyber Neon Assassin',
    rarity: 'legendary',
    description: 'High-tech illuminated nanofiber jacket with radiant cyan & electric violet LEDs.',
    vestHue: 190,
    pantColor: '#090d16',
    visorColor: '#00f0ff',
    glowColor: '#00f0ff',
  },
  {
    id: 'street_tiger',
    name: 'Street Tiger India',
    rarity: 'epic',
    description: 'Fierce saffron & black tiger-stripe combat jacket with golden claws insignia.',
    vestHue: 25,
    pantColor: '#1c1917',
    visorColor: '#f59e0b',
    glowColor: '#f59e0b',
  },
  {
    id: 'golden_phoenix',
    name: 'Golden Phoenix Royal',
    rarity: 'legendary',
    description: 'Grandmaster championship armor forged in pure radiant gold with crimson flame pauldrons.',
    vestHue: 48,
    pantColor: '#451a03',
    visorColor: '#fbbf24',
    glowColor: '#f59e0b',
  },
  {
    id: 'desert_cobra',
    name: 'Desert Cobra Spec-Ops',
    rarity: 'epic',
    description: 'Desert sand viper hooded combat suit designed for silent long-range marksmen.',
    vestHue: 42,
    pantColor: '#292524',
    visorColor: '#10b981',
    glowColor: '#10b981',
  },
];
