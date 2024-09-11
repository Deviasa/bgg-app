import {Component, Input, OnInit} from '@angular/core';
import {BggGame} from "@models/app/services/models/bgg-game.model";
import {ModalController} from "@ionic/angular";

@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss'],
})
export class GameDetailComponent  implements OnInit {

  @Input('game') game: BggGame;

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  cancel() {
    this.modalCtrl.dismiss();

  }

}
