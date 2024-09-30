export interface BGGThing {
  termsofuse: string;
  item: BoardgameItem;
}

export interface BoardgameItem {
  type: string;
  id: number;
  thumbnail: string;
  image: string;
  names: Name[];
  description: string;
  yearpublished: number;
  minplayers: number;
  maxplayers: number;
  polls: Poll[];
  playingtime: number;
  minplaytime: number;
  maxplaytime: number;
  minage: number;
  links: Link[];
  statistics: Statistics;
}

export interface Name {
  type: string;
  sortindex: number;
  value: string;
}

export interface Poll {
  name: string;
  title: string;
  totalvotes: number;
  results: PollResult[];
}

export interface PollResult {
  numplayers: string;
  results: Result[];
}

export interface Result {
  value: string;
  numvotes: number;
}

export interface Link {
  type: string;
  id: number;
  value: string;
}

export interface Statistics {
  page: number;
  ratings: Ratings;
}

export interface Ratings {
  usersrated: number;
  average: number;
  bayesaverage: number;
  ranks: Rank[];
  stddev: number;
  median: number;
  owned: number;
  trading: number;
  wanting: number;
  wishing: number;
  numcomments: number;
  numweights: number;
  averageweight: number;
}

export interface Rank {
  type: string;
  id: number;
  name: string;
  friendlyname: string;
  value: number;
  bayesaverage: number;
}
