import { Rarity } from './types';

export const RARITY_LABELS: Record<number, string> = {
  [Rarity.PICKUP_UR_DOLPHIN]: 'ピックアップUR',
  [Rarity.UR_DOLPHIN]: 'UR',
  [Rarity.SSR_DOLPHIN]: 'SSR',
  [Rarity.SR_DOLPHIN]: 'SR',
  [Rarity.PICKUP_UR_MEMORY]: 'ピックアップUR',
  [Rarity.UR_MEMORY]: 'UR',
  [Rarity.SSR_MEMORY]: 'SSR',
  [Rarity.SR_MEMORY]: 'SR',
};

export const RANDOM_RANGE = 0.90099;
export const RANDOM_PRECISION = 5;
