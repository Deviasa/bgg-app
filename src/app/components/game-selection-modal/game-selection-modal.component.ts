import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BggGame } from 'src/app/services/models/bgg-game.model';
import { BggResponse } from 'src/app/services/models/bgg-response.model';
import { ListPage } from '@models/app/list.page';

@Component({
  selector: 'app-game-selection-modal',
  templateUrl: './game-selection-modal.component.html',
  styleUrls: ['./game-selection-modal.component.scss'],
})
export class GameSelectionModalComponent {
  @Input()
  totalGameList: BggResponse = { items: [], total: 0 };
  numberOfPlayers: number = 0;
  playTime: number = 60;
  rating: number = 5;
  selectedGame: BggGame | undefined;
  listPage: ListPage;
  constructor(private modalController: ModalController) {}

  searchGame(numberOfPlayers: number, playTime: number) {
    const suitableGames = this.totalGameList.items.filter(
      (game) =>
        numberOfPlayers >= game.minplayers &&
        numberOfPlayers <= game.maxplayers &&
        playTime <= game.maxplaytime &&
        playTime >= game.minplaytime,
    );

    this.selectedGame = suitableGames[Math.floor(Math.random() * suitableGames.length)];
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
