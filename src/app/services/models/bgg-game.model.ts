export interface IBggGame {
  $: {
    objecttype: Objecttype;
    objectid: string;
    subtype: Subtype;
    collid: string;
  };
  name: NameClass;
  yearpublished?: string;
  image: string;
  thumbnail: string;
  stats: StatsClass;
  status: StatusClass;
  numplays: string;
  privateinfo?: privateinfo;
  ratings?: RatingClass;
}
export enum Objecttype {
  Thing = 'thing',
}

export interface privateinfo {
  $: {
    pp_currency: string;
    pricepaid: string;
    cv_currency: string;
    currvalue: string;
    quantity: number;
    acquisitiondate: string;
    acquiredfrom: string;
    inventorylocation: string;
  };
}

export enum Subtype {
  Boardgame = 'boardgame',
}

export interface NameClass {
  _: string;
  $: {
    sortindex: string;
  };
}

export interface StatsClass {
  $: Stats;
  rating: RatingClass;
}

export interface Stats {
  minplayers?: string;
  maxplayers?: string;
  minplaytime?: string;
  maxplaytime?: string;
  playingtime?: string;
  numowned: string;
}

export interface RatingClass {
  $: {
    value: string;
  };
  usersrated: {
    $: {
      value: string;
    };
  };
  average: {
    $: {
      value: string;
    };
  };
  bayesaverage: {
    $: {
      value: string;
    };
  };
  stddev: {
    $: {
      value: string;
    };
  };
  median: {
    $: {
      value: string;
    };
  };
}

export interface StatusClass {
  $: {
    own: string;
    prevowned: string;
    fortrade: string;
    want: string;
    wanttoplay: string;
    wanttobuy: string;
    wishlist: string;
    preordered: string;
    lastmodified: Date;
  };
}

/**
 * Parsed game from bgg xml data
 */
export class BggGame {
  public user?: string;
  public collectionId: number;
  public objectId: number;
  public objectType: 'boardgame' | string;
  public thumbnail: string;
  public name: string;
  public yearpublished: number;
  public minplayers: number;
  public maxplayers: number;
  public minplaytime: number;
  public maxplaytime: number;
  public ratings?: RatingClass;
  public privateInfo?: privateinfo;

  constructor(data: IBggGame) {
    this.collectionId = Number.parseInt(data.$.collid);
    this.objectId = Number.parseInt(data.$.objectid);
    this.objectType = data.$.objecttype;
    this.thumbnail = data.thumbnail.trim();
    this.name = data.name._;
    this.yearpublished = Number.parseInt(data.yearpublished ?? '0');
    this.minplayers = Number.parseInt(data.stats.$.minplayers ?? '0');
    this.maxplayers = Number.parseInt(data.stats.$.maxplayers ?? '0');
    this.minplaytime = Number.parseInt(data.stats.$.minplaytime ?? '0');
    this.maxplaytime = Number.parseInt(data.stats.$.maxplaytime ?? '0');
    this.privateInfo = data.privateinfo;
    this.ratings = data.ratings;
  }
}
