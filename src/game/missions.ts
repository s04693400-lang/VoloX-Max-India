export interface DailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCoins: number;
  rewardDiamonds: number;
  rewardXp: number;
  isCompleted: boolean;
  isClaimed: boolean;
  iconName: string;
}

export const INITIAL_DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'm_login',
    title: 'Daily Check-In',
    description: 'Log into VoloX Max India today',
    target: 1,
    current: 1,
    rewardCoins: 300,
    rewardDiamonds: 25,
    rewardXp: 50,
    isCompleted: true,
    isClaimed: false,
    iconName: 'Calendar',
  },
  {
    id: 'm_survive',
    title: 'Island Survivor',
    description: 'Survive in Bermuda Battle Royale for 120 seconds',
    target: 120,
    current: 0,
    rewardCoins: 500,
    rewardDiamonds: 30,
    rewardXp: 80,
    isCompleted: false,
    isClaimed: false,
    iconName: 'Shield',
  },
  {
    id: 'm_kills',
    title: 'Warrior Rampage',
    description: 'Eliminate 2 real human players in combat',
    target: 2,
    current: 0,
    rewardCoins: 800,
    rewardDiamonds: 50,
    rewardXp: 120,
    isCompleted: false,
    isClaimed: false,
    iconName: 'Flame',
  },
  {
    id: 'm_gloo',
    title: 'Tactical Cover',
    description: 'Deploy 2 tactical Gloo Walls during a match',
    target: 2,
    current: 0,
    rewardCoins: 400,
    rewardDiamonds: 20,
    rewardXp: 60,
    isCompleted: false,
    isClaimed: false,
    iconName: 'Square',
  },
  {
    id: 'm_headshot',
    title: 'Sharp Shooter',
    description: 'Land 1 precision Headshot kill on an enemy',
    target: 1,
    current: 0,
    rewardCoins: 650,
    rewardDiamonds: 40,
    rewardXp: 100,
    isCompleted: false,
    isClaimed: false,
    iconName: 'Crosshair',
  },
  {
    id: 'm_heal',
    title: 'Field Medic',
    description: 'Heal 75 HP using Medkits or Combat Bandages',
    target: 75,
    current: 0,
    rewardCoins: 450,
    rewardDiamonds: 25,
    rewardXp: 70,
    isCompleted: false,
    isClaimed: false,
    iconName: 'Plus',
  },
];
