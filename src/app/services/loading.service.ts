import { Injectable } from '@angular/core';
import {LoadingController} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  constructor(
    private loadingCtrl: LoadingController
  ) { }

  loading;

  async showLoading() {
    this.loading = await this.loadingCtrl.create({
      message: 'Loading'
    });
    this.loading.present();


  }

  hideLoading() {
    this.loading.dismiss();
  }
}
