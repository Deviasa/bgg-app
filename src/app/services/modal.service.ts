import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GameSelectionModalComponent } from '../components/game-selection-modal/game-selection-modal.component';
import { BggResponse } from './models/bgg-response.model';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(private modalController: ModalController) {}

  async openGameSelectionModal(totalGameList: BggResponse) {
    const modal = await this.modalController.create({
      component: GameSelectionModalComponent,
      componentProps: { totalGameList },
    });
    await modal.present();
  }
}
