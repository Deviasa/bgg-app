import {Component, Input, OnInit} from '@angular/core';
import {BggGame} from "@models/app/services/models/bgg-game.model";
import {ModalController} from "@ionic/angular";
import {BggApiService} from "@models/app/services/bgg-api.service";
import {BGGThing} from "@models/app/interfaces/thing.interface";

@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss'],
})
export class GameDetailComponent  implements OnInit {

  @Input('game') game: BggGame;

  gameDatail: BGGThing;

  constructor(
    private modalCtrl: ModalController,
    private bggApi: BggApiService
  ) { }

  ngOnInit() {
    console.log(this.game);
    this.bggApi.getThingInformations(this.game.objectId).subscribe((res) => {
      //this.gameDatail = res;
    })
  }

  cancel() {
    this.modalCtrl.dismiss();

  }

}
