import { BggGame, IBggGame } from './bgg-game.model';

export interface IBggResponse {
  items: {
    $: {
      totalitems: string;
      termsofuse: string;
      pubdate: string;
    };
    item: IBggGame[];
  };
}

export class BggResponse {
  public items: BggGame[];
  public total: number;

  constructor(data: IBggResponse) {
    this.total = Number.parseInt(data.items.$.totalitems);
    const items = data.items.item
      ? Array.isArray(data.items.item)
        ? data.items.item
        : [data.items.item]
      : [];

    this.items = items.map((item) => new BggGame(item));
  }
}
