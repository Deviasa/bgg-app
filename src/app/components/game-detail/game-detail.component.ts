import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BGGThing } from '@models/app/interfaces/thing.interface';
import { BggApiService } from '@models/app/services/bgg-api.service';
import { BggGame } from '@models/app/services/models/bgg-game.model';

@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss'],
})
export class GameDetailComponent implements OnInit {
  @Input('game') game: BggGame;

  gameDetail: BGGThing;

  constructor(
    private modalCtrl: ModalController,
    private bggApi: BggApiService,
  ) {}

  ngOnInit() {
    console.log(this.game);
    this.bggApi.getThingInformation(this.game.objectId).subscribe((res) => {
      //this.gameDetail = res;
    });
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
