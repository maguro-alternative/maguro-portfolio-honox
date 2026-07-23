import { defaultInfo, defaultTable } from "./table";

interface MasterItem {
  name: string;
  rarity: number;
  iconType: number;
}

function rarityOf(master: MasterItem[], name?: string | number): number {
  const me = master.find(x => x.name === name);
  if (me) return me.rarity;
  throw new Error(`no such Name is found: ${name}`);
}

export interface ConfigItem {
  rarity: number;
  prob: number;
  pickups: (string | number)[][];
  names: { name: string, iconType: number }[];
}

export function GetConfig() {
  const config: ConfigItem[] = [];
  const info = defaultInfo;
  const master = defaultTable;
  info.weights.forEach(([rarity, prob]) => {
    const names = master
      .filter(x => x.rarity === rarity)
      .map(x => ({ name: x.name, iconType: x.iconType }));
    const pickups = info.pickup
      .filter(x => rarityOf(master, x[0]) === rarity);
    config.push({ rarity, prob, pickups, names });
  });
  return config;
}
