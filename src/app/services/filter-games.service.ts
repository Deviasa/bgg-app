import { Injectable } from '@angular/core';
import { BggGame } from './models/bgg-game.model';
import { BggResponse } from './models/bgg-response.model';

@Injectable({
  providedIn: 'root',
})
export class FilterGamesService {
  filteredGameList: BggResponse | undefined;

  filterGames(playTime: number, playerCount: number, filteredGameList: BggResponse): BggGame[] {
    return filteredGameList.items.filter((game) => {
      const playerCountMatches =
        playerCount > 0 ? game.minplayers <= playerCount && playerCount <= game.maxplayers : true;
      const playTimeMatches =
        playTime > 0 ? game.minplaytime <= playTime && playTime <= game.maxplaytime : true;
      return playerCountMatches && playTimeMatches;
    });
  }
}
