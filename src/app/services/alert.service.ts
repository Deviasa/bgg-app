import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private alertController: AlertController) {}

  async showAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Warning',
      message: message,
      cssClass: 'warning-alert',
      buttons: [{ text: 'OK', cssClass: 'button-alert-warning' }],
    });
    await alert.present();
  }
}
