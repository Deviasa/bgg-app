import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AlertService } from './services/alert.service';
import { BggApiService } from './services/bgg-api.service';
import { ModalService } from './services/modal.service';
import { BggResponse } from './services/models/bgg-response.model';
import { BggStorageService } from './services/storage.service';
import { UsernameColorService } from './services/username-color.service';
import { LoginComponent } from './components/login/login.component';
import { LoginService } from './services/login.service';
import { AlertController, ModalController } from '@ionic/angular';
import {BggGame} from "@models/app/services/models/bgg-game.model";
import {GameDetailComponent} from "@models/app/components/game-detail/game-detail.component";
import {LoadingService} from "@models/app/services/loading.service";
import { Share } from "@capacitor/share";

@Component({
  selector: 'app-root',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  // State variables for managing user data and game lists
  username: string = '';
  usernames: string[] = [];
  userGameList: BggResponse | undefined;
  totalGameList: BggResponse = { items: [], total: 0 };

  // To store user-specific colors
  usernameColors: { username: string; color: string }[] = [];

  // State variables for error handling, sorting, and UI interactions
  errorMessage: string | null = null;
  descending: boolean = false;
  order: number = 1;
  column: string = 'name';

  constructor(
    private bggApi: BggApiService,
    private bggStorage: BggStorageService,
    private alertService: AlertService,
    private modalService: ModalService,
    private usernameColorService: UsernameColorService,
    private router: Router,
    private ls: LoginService,
    private alertController: AlertController,
    private modalController: ModalController,
    private loadingService: LoadingService
  ) {}

  // Lifecycle hook to initialize the component
  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.handleNavigationEnd(event.urlAfterRedirects);
      });

    this.initializeGameList();
  }

  // Load the initial game list and usernames from local storage
  private async initializeGameList() {
    await this.bggStorage.init();
    const gameList = await this.bggStorage.get('gameList');
    if (!gameList) return;

    this.loadUsernamesFromLocalStorage();
    if (this.usernames.length > 0) {
      this.mergeAndReloadUsernames();
    }
  }

  // Handle URL changes to extract usernames from query parameters
  private handleNavigationEnd(url: string) {
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const usernamesPart = queryParams.get('username');
    if (usernamesPart) {
      this.usernames = usernamesPart.split(',');
      console.log(this.usernames)
      this.mergeAndReloadUsernames();
    }
  }

  // Merge usernames from URL and local storage, reload data
  private async mergeAndReloadUsernames() {
    const urlUsernames = this.usernames;
    const localStorageUsernames = this.getUsernamesFromLocalStorage();

    for (const u of urlUsernames) {
      if (localStorageUsernames.includes(u)) {
        this.loadStoredUsers(u);
      } else {
        await this.loadGameList(u, false);
        this.setUserToLocalStorage(u);
      }
    }
  }

  // Extract stored usernames from localStorage
  private getUsernamesFromLocalStorage(): string[] {
    const storedUsers: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('Username-')) {
        const username = key.split('-').pop() as string;
        storedUsers.push(username);
      }
    }
    return storedUsers;
  }

  // Load user data stored in local storage and merge into the total game list
  private loadStoredUsers(username: string) {
    const key = Object.keys(localStorage).find((key) => key.endsWith(username));
    if (key) {
      const collectionWithUser = JSON.parse(
        localStorage.getItem(key) as string,
      );
      const existingGameIds = new Set(
        this.totalGameList.items.map((item) => item.collectionId),
      );

      // Filter out games already in the total list
      const newItems = collectionWithUser.items.filter(
        (item: { collectionId: number }) =>
          !existingGameIds.has(item.collectionId),
      );

      // Update the total game list with new items
      this.totalGameList.items = [...this.totalGameList.items, ...newItems];
      this.bggStorage.set('gameList', {
        items: this.totalGameList,
        total: this.totalGameList.items.length,
      });
    }
  }

  // Sort the game list based on a selected column
  public sort(column: string) {
    this.descending = !this.descending;
    this.order = this.descending ? 1 : -1;
    this.column = column;
  }

  // Fetch the game list for a specific user from the BGG API
  public async loadGameList(username: string, p: boolean) {
    await this.loadingService.showLoading().then((l) => {
      l.present();
      this.bggApi.getUserCollection(username, p).subscribe({
        next: (res) => {
          console.log('Loaded: ' + username);
          if (res && res.total !== undefined) {
            this.errorMessage = null;
            if (res.total === 0) {
              this.showAlert('No games found for user.');
              return;
            }
            // Check for color limits and duplicates
            if (this.getLocalStorageStatus().length >= this.usernameColorService.colors.length) {
              this.showAlert('Maximum number of collections reached.');
              return;
            }
            if (this.getLocalStorageStatus().find((user) => user.username === username)) {
              this.showAlert(`Collection for user ${username} already exists.`);
              return;
            }
            // Add new user collection to the game list
            this.addUser(username);
            const collectionWithUser: BggResponse = {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              items: res.items.map((item: any) => ({ ...item, user: username })),
              total: res.total,
            };
            this.userGameList = collectionWithUser;
            this.totalGameList.items = [
              ...this.totalGameList.items,
              ...collectionWithUser.items,
            ];
            // Persist the updated game list
            this.bggStorage.set('gameList', {
              items: this.totalGameList,
              total: this.totalGameList.items.length,
            });
            // Save user data to local storage
            this.setUserToLocalStorage(username);
            // Clear username for the next input
            this.username = '';
          } else {
            this.errorMessage = res ? res.toString() : 'Error loading game list.';
          }
        },
        error: (err) => {
          console.error('Error loading game list:', err);
          this.errorMessage = 'Error loading game list.';
        },
        complete: () => {
          l.dismiss();
        }
      });
    })

  }

  // Save the user's game collection to local storage
  private setUserToLocalStorage(username: string) {
    const color = this.usernameColors.find(
      (userColor) => userColor.username === username,
    )?.color;
    const itemsFromUser = this.totalGameList.items.filter(
      (item) => item.user === username,
    );
    if (color) {
      localStorage.setItem(
        `Username-${color}-${username}`,
        JSON.stringify({ items: itemsFromUser, total: itemsFromUser.length }),
      );
    }
  }

  // Display a warning message via an alert modal
  private async showAlert(message: string) {
    await this.alertService.showAlert(message);
  }

  // Add a new user to the username list and update the URL
  private addUser(username: string) {
    if (!this.usernames.includes(username)) {
      this.usernames.push(username);
      this.setColorForUsername(username);
    }
  }

  // Update the URL with the current usernames as query parameters


  // Remove a user from the list and update the game collection accordingly
  public async removeUser(username: string) {
    this.usernames = this.usernames.filter((user) => user !== username);
    this.totalGameList.items = this.totalGameList.items.filter((item) => {
      const shouldKeep = item.user !== username;
      return shouldKeep;
    });

    // Persist updated game list to storage
    this.bggStorage.set('gameList', {
      items: this.totalGameList,
      total: this.totalGameList.items.length,
    });

    // Remove user's game data from local storage
    localStorage.removeItem(
      `Username-${this.getColorForUsername(username)}-${username}`,
    );
    this.usernameColors = this.usernameColors.filter(
      (user) => user.username !== username,
    );
  }

  // Retrieve color associated with a specific username
  public getColorForUsername(username: string): string {
    return this.usernameColorService.getColorForUsername(
      username,
      this.usernameColors,
    );
  }

  // Assign a color to a username, using an available color from the predefined list
  private setColorForUsername(username: string) {
    this.usernameColors =
      this.usernameColorService.setColorForUsername(username);
  }

  // Get the status of usernames and their colors from local storage
  private getLocalStorageStatus() {
    const localStorageStatus: { username: string; color: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('Username-')) {
        const parts = key.split('-');
        const color: string = parts[1];
        const username: string = parts[parts.length - 1];
        localStorageStatus.push({ username, color });
      }
    }
    return localStorageStatus;
  }

  // Load stored usernames and their colors from local storage
  private loadUsernamesFromLocalStorage() {
    const localStorageStatus = this.getLocalStorageStatus();
    this.usernames = localStorageStatus.map((user) => user.username);
    this.usernameColors = localStorageStatus;
  }

  // Open the game selection modal to display the total game list
  public async openGameSelectionModal(totalGameList: BggResponse) {
    await this.modalService.openGameSelectionModal(totalGameList, this);
  }

  async shareList() {
    await Share.share({
      url: `https://deviasa.github.io/bgg-app/?username=${this.usernames.join(',')}`,
    })
  }

  async showLoginMask(username: string) {
    const loginModal = await this.modalController.create({
      component: LoginComponent,
      componentProps: {
        username: username,
      },
    });

    loginModal.present();

    await loginModal.onWillDismiss().then((res: any) => {
      this.loadingService.showLoading().then(() => {});
      this.ls.login(res.data.username, res.data.password).subscribe({
      next: () => {
        this.loadingService.hideLoading();
        console.log()
        this.loadGameList(res.data.username, true);
      },
      error: err => {
      console.error(err);
      this.loadingService.hideLoading();
        this.loadGameList(res.data.username, false);}
      });
    });
  }

  async askForLogin(username: string) {
    const askAlert = await this.alertController.create({
      header: 'Login?',
      message:
        'Do you want to login to your BGG-Account to get the private Informations?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            this.loadGameList(username, false);
          },
        },
        {
          text: 'Yes',
          role: 'confirm',
          handler: () => {
            this.showLoginMask(username);
          },
        },
      ],
    });

    await askAlert.present();
  }

  clickGameRow(game: BggGame) {
    this.showGameDetail(game).then(() => {})
  }

  async showGameDetail(game: BggGame) {
    const gameModal = await this.modalController.create(
      {
        component: GameDetailComponent,
        componentProps: {
          game: game,
        }
      })

    await gameModal.present();
  }
}
