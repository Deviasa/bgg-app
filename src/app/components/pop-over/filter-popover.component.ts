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
    const suitableGames = this.totalGameList.items.filter(
      (game) =>
        playerCount >= game.minplayers &&
        playerCount <= game.maxplayers &&
        playTime <= game.maxplaytime &&
        playTime >= game.minplaytime,
    );

    this.selectedGame = suitableGames[Math.floor(Math.random() * suitableGames.length)];
  }
}
