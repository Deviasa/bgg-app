import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { GameSelectionModalComponent } from './components/game-selection-modal/game-selection-modal.component';
import { BggApiService } from './services/bgg-api.service';
import { BggResponse } from './services/models/bgg-response.model';
import { BggStorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  username: string = '';
  usernames: string[] = [];
  userGameList: BggResponse | undefined;
  totalGameList: BggResponse = { items: [], total: 0 };
  colors: string[] = [
    '#AAAA00',
    '#FFAABB',
    '#44BB99',
    '#EE8866',
    '#BBCC33',
    '#99DDFF',
    '#EEDD88',
    '#77AADD',
    '#FFDD44',
    '#66CCEE',
    '#CC99CC',
    '#FFAA77',
    '#88CCAA',
    '#FFCC99',
    '#99CCFF',
    '#FF6699',
    '#66FFCC',
    '#FF9966',
    '#6699FF',
    '#CCFF99',
    '#FF99CC',
    '#66CC99',
    '#FFCC66',
    '#99FFCC',
  ];
  usernameColors: { username: string; color: string }[] = [];
  errorMessage: string | null = null;
  descending: boolean = false;
  order: number = 1;
  column: string = 'name';

  constructor(
    private bggApi: BggApiService,
    private bggStorage: BggStorageService,
    private alertController: AlertController,
    private modalController: ModalController,
    private router: Router,
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.handleNavigationEnd(event.urlAfterRedirects);
      });
    this.initializeGameList();
  }

  private async initializeGameList() {
    await this.bggStorage.init();
    const gameList = await this.bggStorage.get('gameList');
    if (!gameList) {
      return;
    }
    this.loadUsernamesFromLocalStorage();
    if (this.usernames.length > 0) {
      this.mergeAndReloadUsernames();
    }
  }

  private handleNavigationEnd(url: string) {
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const usernamesPart = queryParams.get('username');
    if (usernamesPart) {
      this.usernames = usernamesPart.split(',');
      this.mergeAndReloadUsernames();
    }
  }

  private mergeAndReloadUsernames() {
    const urlUsernames = this.usernames;
    const localStorageUsernames = this.getUsernamesFromLocalStorage();
    const allUsernames = Array.from(
      new Set([...urlUsernames, ...localStorageUsernames]),
    );
    this.usernames = allUsernames;

    allUsernames.forEach((username) => {
      if (localStorageUsernames.includes(username)) {
        this.loadStoredUsers(username);
      } else if (urlUsernames.includes(username)) {
        this.loadGameList(username).then(() => {
          this.setUserToLocalStorage(username);
        });
      } else {
        console.error('Error loading information for user: ', username);
      }
      this.setColorForUsername(username);
    });
    this.updateUrl();
  }

  private getUsernamesFromLocalStorage(): string[] {
    const storedUsers: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key: string | null = localStorage.key(i);
      if (key && key.startsWith('Username-')) {
        const username: string = key.split('-').pop() as string;
        storedUsers.push(username);
      }
    }
    return storedUsers;
  }

  private loadStoredUsers(username: string) {
    const key = Object.keys(localStorage).find((key) => key.endsWith(username));
    if (key) {
      const collectionWithUser = JSON.parse(
        localStorage.getItem(key) as string,
      );
      const existingGameIds = new Set(
        this.totalGameList.items.map((item) => item.collectionId),
      );
      const newItems = collectionWithUser.items.filter(
        (item: { collectionId: number }) =>
          !existingGameIds.has(item.collectionId),
      );

      this.totalGameList.items = [...this.totalGameList.items, ...newItems];
      this.bggStorage.set('gameList', {
        items: this.totalGameList,
        total: this.totalGameList.items.length,
      });
    }
  }

  public sort(column: string) {
    this.descending = !this.descending;
    this.order = this.descending ? 1 : -1;
    this.column = column;
  }

  public async loadGameList(username: string) {
    try {
      const res = await this.bggApi.getUserCollection(username).toPromise();
      if (res && res.total !== undefined) {
        this.errorMessage = null;
        if (res.total === 0) {
          this.showAlert('No games found for user.');
          return;
        }
        if (this.getLocalStorageStatus().length >= this.colors.length) {
          this.showAlert('Maximum number of collections reached.');
          return;
        }
        if (
          this.getLocalStorageStatus().find(
            (user) => user.username === username,
          )
        ) {
          this.showAlert(`Collection for user ${username} already exists.`);
          return;
        }
        this.addUser(username);
        const collectionWithUser: BggResponse = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items: res.items.map((item: any) => ({
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
        this.bggStorage.set('gameList', {
          items: this.totalGameList,
          total: this.totalGameList.items.length,
        });

        this.setUserToLocalStorage(username);
      } else {
        this.errorMessage = res ? res.toString() : 'Error loading game list.';
      }
    } catch (error) {
      console.error('Error loading game list:', error);
      this.showAlert(
        'BGG is currently processing your request. Please try again in a few minutes. Thank you for your patience.',
      );
    }
  }

  private setUserToLocalStorage(username: string) {
    const color = this.usernameColors.find(
      (userColor) => userColor.username === username,
    )?.color;
    const itemsFromUser = this.totalGameList.items.filter((item) => {
      return item.user === username;
    });
    if (color) {
      localStorage.setItem(
        `Username-${color}-${username}`,
        JSON.stringify({ items: itemsFromUser, total: itemsFromUser.length }),
      );
    }
  }

  private async showAlert(message: string) {
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

  private addUser(username: string) {
    if (!this.usernames.includes(username)) {
      this.usernames.push(username);
      this.setColorForUsername(username);
      this.updateUrl();
    }
  }

  private updateUrl() {
    const queryParams =
      this.usernames.length > 0 ? { username: this.usernames.join(',') } : {};
    this.router.navigate(['list'], { queryParams });
  }

  public async removeUser(username: string) {
    this.usernames = this.usernames.filter((user) => user !== username);
    this.totalGameList.items = this.totalGameList.items.filter((item) => {
      const shouldKeep = item.user !== username;
      return shouldKeep;
    });

    this.bggStorage.set('gameList', {
      items: this.totalGameList,
      total: this.totalGameList.items.length,
    });

    localStorage.removeItem(
      `Username-${this.getColorForUsername(username)}-${username}`,
    );
    this.usernameColors = this.usernameColors.filter(
      (user) => user.username !== username,
    );
    this.updateUrl();
  }

  public getColorForUsername(username: string): string {
    const userColor = this.usernameColors.find(
      (userColor) => userColor.username === username,
    );
    return userColor ? userColor.color : '#fff';
  }

  private setColorForUsername(username: string) {
    if (
      !this.usernameColors.some((userColor) => userColor.username === username)
    ) {
      const existingColor = this.getLocalStorageStatus().find(
        (user) => user.username === username,
      )?.color;
      if (existingColor) {
        this.usernameColors.push({ username, color: existingColor });
      } else {
        const usedColors = this.usernameColors.map(
          (userColor) => userColor.color,
        );
        const availableColors = this.colors.filter(
          (color) => !usedColors.includes(color),
        );
        const color =
          availableColors.length > 0 ? availableColors[0] : this.colors[0];
        this.usernameColors.push({ username, color });
      }
    }
  }

  private getLocalStorageStatus() {
    const localStorageStatus: { username: string; color: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key: string | null = localStorage.key(i);
      if (key && key.startsWith('Username-')) {
        const parts = key.split('-');
        const color: string = parts[1];
        const username: string = parts[parts.length - 1];
        localStorageStatus.push({ username, color });
      }
    }
    return localStorageStatus;
  }

  private loadUsernamesFromLocalStorage() {
    const localStorageStatus = this.getLocalStorageStatus();
    this.usernames = localStorageStatus.map((user) => user.username);
    this.usernameColors = localStorageStatus;
  }

  public async openGameSelectionModal(totalGameList: BggResponse) {
    const modal = await this.modalController.create({
      component: GameSelectionModalComponent,
      componentProps: {
        totalGameList: totalGameList,
      },
    });
    await modal.present();
  }
}
