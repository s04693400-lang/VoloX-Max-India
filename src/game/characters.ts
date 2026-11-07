/**
 * Free Fire style Character Roster & Special Combat Skills
 */

export type CharacterId = 'alok' | 'chrono' | 'kelly' | 'hayato' | 'moco';

export interface CharacterSkill {
  id: string;
  name: string;
  type: 'active' | 'passive';
  cooldown: number; // in seconds
  duration?: number; // in seconds
  description: string;
  icon: string;
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  title: string;
  bio: string;
  skill: CharacterSkill;
  avatarColor: string;
  defaultSkinTone: string;
  defaultVestHue: number;
  defaultPantColor: string;
  defaultVisorColor: string;
  unlockedByDefault: boolean;
  costGold: number;
  costDiamonds: number;
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  alok: {
    id: 'alok',
    name: 'DJ Alok',
    title: 'Sound of Bermuda',
    bio: 'World-famous DJ using rhythmic acoustic frequencies to heal teammates and sprint into battle.',
    skill: {
      id: 'drop_the_beat',
      name: 'Drop The Beat',
      type: 'active',
      cooldown: 45,
      duration: 6,
      description: 'Creates a 5m rhythmic aura restoring +6 HP/sec for 6s and boosting sprint speed by +15%.',
      icon: 'Music',
    },
    avatarColor: '#f59e0b',
    defaultSkinTone: '#c27945',
    defaultVestHue: 40,
    defaultPantColor: '#0f172a',
    defaultVisorColor: '#06b6d4',
    unlockedByDefault: true,
    costGold: 0,
    costDiamonds: 0,
  },
  chrono: {
    id: 'chrono',
    name: 'Chrono',
    title: 'Spacetime Guardian',
    bio: 'A cybernetic warrior from a parallel dimension equipped with quantum deflection force fields.',
    skill: {
      id: 'time_turner',
      name: 'Time Turner',
      type: 'active',
      cooldown: 55,
      duration: 5,
      description: 'Deploys a stationary energy force shield absorbing up to 350 damage from all enemy gunfire.',
      icon: 'Shield',
    },
    avatarColor: '#38bdf8',
    defaultSkinTone: '#d9976b',
    defaultVestHue: 200,
    defaultPantColor: '#1e293b',
    defaultVisorColor: '#38bdf8',
    unlockedByDefault: false,
    costGold: 8000,
    costDiamonds: 300,
  },
  kelly: {
    id: 'kelly',
    name: 'Kelly (The Swift)',
    title: 'Trackside Sprinter',
    bio: 'High school track champion renowned for lightning sprint speed and rapid hit-and-run tactics.',
    skill: {
      id: 'dash',
      name: 'Deadly Velocity',
      type: 'active',
      cooldown: 35,
      duration: 5,
      description: 'Passive +12% sprint speed. Activating grants +25% burst sprint & next 3 shots inflict +25% bonus damage.',
      icon: 'Zap',
    },
    avatarColor: '#eab308',
    defaultSkinTone: '#e3a172',
    defaultVestHue: 48,
    defaultPantColor: '#facc15',
    defaultVisorColor: '#ffffff',
    unlockedByDefault: true,
    costGold: 2000,
    costDiamonds: 100,
  },
  hayato: {
    id: 'hayato',
    name: 'Hayato',
    title: 'Legendary Samurai',
    bio: 'An honorable warrior upholding ancient swordcraft and unmatched armor penetration in deadly duels.',
    skill: {
      id: 'bushido',
      name: 'Bushido Overdrive',
      type: 'active',
      cooldown: 40,
      duration: 6,
      description: 'Armor penetration increased by +40% and frontal incoming bullet damage reduced by -30% for 6s.',
      icon: 'Sword',
    },
    avatarColor: '#ef4444',
    defaultSkinTone: '#bf7b47',
    defaultVestHue: 0,
    defaultPantColor: '#18181b',
    defaultVisorColor: '#ef4444',
    unlockedByDefault: false,
    costGold: 6000,
    costDiamonds: 250,
  },
  moco: {
    id: 'moco',
    name: 'Moco',
    title: 'Cyber Hacker',
    bio: 'Master computer hacker known as the "Chat Noir" who can track and tag enemies across Bermuda.',
    skill: {
      id: 'hackers_eye',
      name: "Hacker's Eye",
      type: 'active',
      cooldown: 30,
      duration: 6,
      description: 'Tags and highlights all enemies you hit with a radar beacon displaying stance and position.',
      icon: 'Eye',
    },
    avatarColor: '#10b981',
    defaultSkinTone: '#d48d59',
    defaultVestHue: 155,
    defaultPantColor: '#064e3b',
    defaultVisorColor: '#10b981',
    unlockedByDefault: false,
    costGold: 5000,
    costDiamonds: 200,
  },
};
