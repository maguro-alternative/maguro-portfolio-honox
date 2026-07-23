import type {
  Character,
  GachaConfig,
  GachaTableEntry,
  RarityWeight,
} from './types';
import { RARITY_LABELS, RANDOM_PRECISION, RANDOM_RANGE } from './constants';
import { type ConfigItem } from './config';

export function normalizeWeights(weights: RarityWeight[]): RarityWeight[] {
  const total = weights.reduce((sum, { probability }) => sum + probability, 0);
  return weights.map(({ rarity, probability }) => ({
    rarity,
    probability: probability / total,
  }));
}

export function createGachaTable(
  characters: Character[],
  config: GachaConfig
): GachaTableEntry[] {
  const table: GachaTableEntry[] = [];

  for (const { rarity, probability } of config.weights) {
    const charactersOfRarity = characters.filter((c) => c.rarity === rarity);
    const pickupsForRarity = config.pickups.filter((p) =>
      charactersOfRarity.some((c) => c.name === p.name)
    );

    const totalPickupWeight = pickupsForRarity.reduce(
      (sum, p) => sum + p.weight,
      0
    );
    const nonPickupProbability =
      (probability * (1 - totalPickupWeight)) /
      (charactersOfRarity.length - pickupsForRarity.length);

    for (const character of charactersOfRarity) {
      const pickup = pickupsForRarity.find((p) => p.name === character.name);
      const charProbability = pickup
        ? probability * pickup.weight
        : nonPickupProbability;

      table.push({
        character,
        probability: charProbability,
        rarityLabel: RARITY_LABELS[rarity] || 'Unknown',
      });
    }
  }

  return table;
}

export function createRescueTable(
  characters: Character[],
  config: GachaConfig
): GachaTableEntry[] {
  const filteredWeights = normalizeWeights(
    config.weights.filter(
      ({ rarity }) => rarity !== 720 && rarity !== 820
    )
  );

  const rescueConfig: GachaConfig = {
    ...config,
    weights: filteredWeights,
  };

  return createGachaTable(characters, rescueConfig);
}

export function drawFromTable(
  table: GachaTableEntry[],
  randomValue: number
): { name: string; iconType: number; rarity: string } {
  let accumulated = 0;

  for (const entry of table) {
    accumulated += entry.probability;
    if (randomValue < accumulated) {
      return {
        name: entry.character.name,
        iconType: entry.character.iconType,
        rarity: entry.rarityLabel,
      };
    }
  }

  throw new Error(
    `Gacha draw failed: randomValue=${randomValue}, accumulated=${accumulated}`
  );
}

// Legacy API compatibility functions
function createTableFromConfig(config: ConfigItem[]) {
  const table: [{ name: string; iconType: number }, number, string][] = [];
  for (const entry of config) {
    const rarity =
      entry.rarity === 741 || entry.rarity === 841
        ? 'ピックアップUR'
        : entry.rarity === 740 || entry.rarity === 840
        ? 'UR'
        : entry.rarity === 730 || entry.rarity === 830
        ? 'SSR'
        : 'SR';

    const nonPickProb =
      (entry.prob *
        entry.pickups.reduce((acc, x) => acc - (x[1] as number), 1)) /
      (entry.names.length - entry.pickups.length);
    for (const cid of entry.names) {
      const searched = entry.pickups.find((x) => x[0] === cid.name);
      const prob = searched
        ? entry.prob * (searched[1] as number)
        : nonPickProb;
      table.push([cid, prob, rarity]);
    }
  }
  return table;
}

function normalizeConfig(configLike: ConfigItem[]) {
  const ret: ConfigItem[] = [];
  const summed = configLike.reduce((acc, x) => acc + x.prob, 0);
  configLike.forEach((entry) =>
    ret.push({
      ...entry,
      prob: entry.prob / summed,
    })
  );
  return ret;
}

function createTableRescue(conf: ConfigItem[]) {
  const filtered = normalizeConfig(
    conf.filter((x) => x.rarity !== 720 && x.rarity !== 820)
  );
  return createTableFromConfig(filtered);
}

export function GetRandomNumber() {
  return Number((Math.random() * RANDOM_RANGE).toFixed(RANDOM_PRECISION));
}

export function Gacha(config: ConfigItem[], rescue: boolean, rval: number) {
  const table = rescue
    ? createTableRescue(config)
    : createTableFromConfig(config);

  let accum = 0;
  for (const [cid, prob, rarity] of table) {
    accum += prob;
    if (rval < accum) return { ...cid, rarity };
  }
  console.log('rval', rval);
  console.log('accum', accum);
  throw new Error('should not reach here');
}
