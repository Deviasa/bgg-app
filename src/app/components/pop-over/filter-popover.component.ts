import { Component, Input } from '@angular/core';

import { PopoverController } from '@ionic/angular';
import { ListPage } from '@models/app/list.page';
import { BggGame } from '@models/app/services/models/bgg-game.model';
import { BggResponse } from '@models/app/services/models/bgg-response.model';

@Component({
  selector: 'filter-popover-modal',
  templateUrl: './filter-popover.component.html',
})
export class FilterPopoverComponent {
  @Input() playerCount: number;
  @Input() playTime: number;
  game: BggGame;
  selectedGame: BggGame | undefined;
  totalGameList: BggResponse;
  listPage: ListPage;

  constructor(private popoverController: PopoverController) {}

  applyFilters() {
    this.popoverController.dismiss({
      playerCount: this.playerCount,
      playTime: this.playTime,
    });
  }

  searchGame(playerCount: number, playTime: number) {
    let suitableGames = [];
    if (playerCount > 0 || playTime > 0) {
      suitableGames = this.totalGameList.items.filter(
        (game) =>
          playerCount >= game.minplayers &&
          playerCount <= game.maxplayers &&
          playTime <= game.maxplaytime &&
          playTime >= game.minplaytime,
      );
    } else {
      suitableGames = this.totalGameList.items;
    }

    this.selectedGame = suitableGames[Math.floor(Math.random() * suitableGames.length)];
  }

  resetFilters() {
    this.playerCount = 0;
    this.playTime = 0;
    this.listPage.resetFilters();
  }
}
