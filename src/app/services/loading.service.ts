import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  constructor(private loadingCtrl: LoadingController) {}

  loading;

  async showLoading() {
    console.log('showLoading');
    this.loading = await this.loadingCtrl.create({
      message: 'Loading',
    });
    return this.loading;
  }

  hideLoading() {
    console.log('hideLoading');
    this.loading.dismiss();
  }
}
