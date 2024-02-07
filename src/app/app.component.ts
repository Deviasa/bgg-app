import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BggApiService } from './services/bgg-api.service';
import { Drivers } from '@ionic/storage';
import { BggStorageService } from './services/storage.service';
import { ModalController } from '@ionic/angular';
import { LoginModalComponent } from './components/login-modal/login-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'List', url: '/list', icon: 'dice' },
    { title: 'Outbox', url: '/folder/outbox', icon: 'paper-plane' },
    { title: 'Favorites', url: '/folder/favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/spam', icon: 'warning' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(
    private bggApi: BggApiService,
    private storage: Storage,
    private bggStorage: BggStorageService,
    private modalController: ModalController
  ) {}

  async openLoginModal() {
    const modal = await this.modalController.create({
      component: LoginModalComponent,
    });
    return await modal.present();
  }
  ngOnInit() {
    const store = new Storage({
      driverOrder: [Drivers.IndexedDB],
    });
    this.storage.create().then(() => {
      this.bggStorage.init();
    });
  }
}
