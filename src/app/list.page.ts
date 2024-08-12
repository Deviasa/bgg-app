import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { BggApiService } from './services/bgg-api.service';
import { BggResponse } from './services/models/bgg-response.model';
import { BggStorageService } from './services/storage.service';
import { ModalController } from '@ionic/angular';
import { GameSelectionModalComponent } from './components/game-selection-modal/game-selection-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  constructor(
    private bggApi: BggApiService,
    private bggStorage: BggStorageService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  username: string = '';
  usernames: string[] = [];
  userGameList: BggResponse | undefined;
  totalGameList: BggResponse = { items: [], total: 0 };
  //Light qualitative colour scheme that is reasonably distinct in both normal and colour-blind vision.(Paul Tol)
  colors: string[] = [
    '#AAAA00',
    '#FFAABB',
    '#44BB99',
    '#99DDFF',
    '#EE8866',
    '#EEDD88',
    '#77AADD',
    '#BBCC33',
  ];
  usernameColors: { username: string; color: string }[] = [];
  errorMessage: string | null = null;

  ngOnInit() {
    this.bggStorage.get('gameList').then((res: BggResponse | undefined) => {
      if (localStorage.length > 0) {
        this.loadStoredUsers();
      } else if (res !== null && res !== undefined) {
        this.userGameList = res;
      } else if (this.bggStorage.get('username')) {
        this.loadGameList(this.bggStorage.get('username'));
      }
    });
  }
  loadStoredUsers() {
    const storedUsers: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key: string | null = localStorage.key(i);
      if (key && key.startsWith('Username-')) {
        const parts = key.split('-');
        const color: string = parts[1];
        const username: string = parts[parts.length - 1];
        storedUsers.push(username);

        const collectionWithUser = JSON.parse(
          localStorage.getItem(key) as string
        );
        this.totalGameList.items = [
          ...this.totalGameList.items,
          ...collectionWithUser.items,
        ];
        this.usernameColors.push({ username, color });
        this.totalGameList.total += collectionWithUser.total;
        this.bggStorage.set('gameList', this.totalGameList);
      }
    }
    this.usernames = storedUsers;
  }

  descending: boolean = false;
  order: number = 1;
  column: string = 'name';

  sort(column: string) {
    this.descending = !this.descending;
    this.order = this.descending ? 1 : -1;
    this.column = column;
  }

  loadGameList(username: string) {
    this.bggApi
      .getUserCollection(username)
      .subscribe((res: BggResponse | null) => {
        if (res) console.log('res: ', res);
        if (res !== null) {
          if (res.total === undefined) {
            this.errorMessage = res.toString();
            return;
          } else this.errorMessage = null;

          if (res.total === 0) {
            this.showAlert('No games found for user.');
            return;
          }

          if (this.usernames.length >= 8) {
            this.showAlert('Maximum number of collections reached.');
            return;
          }

          if (this.usernames.includes(username)) {
            this.showAlert(`Collection for user ${username} already exists.`);
            return;
          }

          this.addUser(username);
          const collectionWithUser: BggResponse = {
            items: res.items.map((item) => ({
              ...item,
              user: username,
            })),
            total: res.total,
          };

          this.userGameList = collectionWithUser;
          this.totalGameList.items = [
            ...this.totalGameList.items,
            ...collectionWithUser.items,
          ];
          this.totalGameList.total += collectionWithUser.total;
          this.bggStorage.set('gameList', this.totalGameList);
          localStorage.setItem(
            'Username-' +
              this.usernameColors.find(
                (userColor) => userColor.username === username
              )?.color +
              '-' +
              username,
            JSON.stringify(this.totalGameList)
          );
        }
      });
  }

  async showAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Warning',
      message: message,
      cssClass: 'warning-alert',
      buttons: [
        {
          text: 'OK',
          cssClass: 'button-alert-warning',
        },
      ],
    });

    await alert.present();
  }

  addUser(username: string) {
    this.usernames.push(username);
    this.setColorForUsername(username);
  }

  removeUser(username: string) {
    this.usernames = this.usernames.filter((user) => user !== username);
    this.filterItems(username);
    localStorage.removeItem(
      'Username-' +
        this.usernameColors.find((userColor) => userColor.username === username)
          ?.color +
        '-' +
        username
    );
  }

  filterItems(username: string) {
    this.totalGameList.items = this.totalGameList.items.filter(
      (item) => item.user !== username
    );
  }

  getColorForUsername(username: string): string {
    let userColor = this.usernameColors.find(
      (userColor) => userColor.username === username
    );
    if (userColor) {
      return userColor.color;
    }
    return '#fff';
  }

  setColorForUsername(username: string) {
    const userIndex = this.usernames.indexOf(username);
    const color = this.colors[userIndex % this.colors.length];
    this.usernameColors.push({ username, color });
  }

  async openGameSelectionModal(totalGameList: BggResponse) {
    const modal = await this.modalController.create({
      component: GameSelectionModalComponent,
      componentProps: {
        totalGameList: totalGameList,
      },
    });
    await modal.present();
  }
}
