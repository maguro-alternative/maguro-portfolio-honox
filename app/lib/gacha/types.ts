export enum Rarity {
  PICKUP_UR_DOLPHIN = 741,
  UR_DOLPHIN = 740,
  SSR_DOLPHIN = 730,
  SR_DOLPHIN = 720,
  PICKUP_UR_MEMORY = 841,
  UR_MEMORY = 840,
  SSR_MEMORY = 830,
  SR_MEMORY = 820,
}

export enum IconType {
  WAVE = 1,
  SUN = 2,
  GEAR = 3,
  MOON = 4,
  WIND = 5,
}

export interface Character {
  name: string;
  rarity: Rarity;
  iconType: IconType;
}

export interface PickupConfig {
  name: string;
  weight: number;
}

export interface RarityWeight {
  rarity: Rarity;
  probability: number;
}

export interface GachaResult {
  name: string;
  iconType: IconType;
  rarity: string;
}

export interface GachaConfig {
  weights: RarityWeight[];
  pickups: PickupConfig[];
}

export interface GachaTableEntry {
  character: Character;
  probability: number;
  rarityLabel: string;
}
