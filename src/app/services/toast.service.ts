import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  async presentToast(message: string, position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: message,
      duration: 20000,
      position: position,
    });

    await toast.present();
  }
}
