import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GameSelectionModalComponent } from '../components/game-selection-modal/game-selection-modal.component';
import { BggResponse } from './models/bgg-response.model';
import { ListPage } from '@models/app/list.page';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(private modalController: ModalController) {}

  async openGameSelectionModal(totalGameList: BggResponse, listPage: ListPage) {
    const modal = await this.modalController.create({
      component: GameSelectionModalComponent,
      componentProps: { totalGameList, listPage },
    });
    await modal.present();
  }
}
