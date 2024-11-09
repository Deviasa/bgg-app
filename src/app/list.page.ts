import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Share } from '@capacitor/share';
import { AlertController, IonContent, ModalController, PopoverController } from '@ionic/angular';
import { filter } from 'rxjs/operators';

import { GameDetailComponent } from '@models/app/components/game-detail/game-detail.component';
import { LoadingService } from '@models/app/services/loading.service';
import { BggGame } from '@models/app/services/models/bgg-game.model';
import { ToastService } from '@models/app/services/toast.service';
import { LoginComponent } from './components/login/login.component';
import { FilterPopoverComponent } from './components/pop-over/filter-popover.component';
import { BggApiService } from './services/bgg-api.service';
import { FilterGamesService } from './services/filter-games.service';
import { LoginService } from './services/login.service';
import { BggResponse } from './services/models/bgg-response.model';
import { BggStorageService } from './services/storage.service';
import { UsernameColorService } from './services/username-color.service';

/**
 * @class {@link ListPage} class Manages the display and interaction with a list of games retrieved
 *   from the BoardGameGeek (BGG) API. The user can add multiple usernames to the list and filter
 *   the games based on player count and play time. The component also provides functionality to
 *   view game details, share the list, and remove users. The component uses a popover for filtering
 *   and a modal for game selection.
 *
 *   Private Methods
 *
 *   - Event Listeners: Methods to add event listeners for key combinations and touch gestures
 *       ({@link _addEventListeners} {@link _checkKeyCombination} {@link _checkTouchGesture})
 *   - Game List Initialization: Methods to initialize and handle the game list
 *       ({@link _initializeGameList}, {@link _handleNavigationEnd}, {@link _mergeAndReloadUsernames},
 *       {@link _getUsernamesFromLocalStorage}, {@link _loadStoredUsers},
 *       {@link _setUserToLocalStorage}).
 *   - User Management: Methods to manage users and their game lists ({@link _addUser},
 *       {@link _setColorForUsername}, {@link _getLocalStorageStatus},
 *       {@link loadUsernamesFromLocalStorage}).
 *
 *   Public Methods
 *
 *   - Sorting and Filtering: Methods to sort and filter the game list ({@link sort}, {@link filterGames},
 *       {@link resetFilters}).
 *   - UI Interactions: Methods to handle various UI interactions and modals ({@link openFilterPopover},
 *       {@link shareList}, {@link showLoginMask}, {@link askForLogin}, {@link selectGame},
 *       {@link showGameDetail}, {@link scrollContent}).
 *   - Scroll Handling: Method to handle scroll events ({@link onScroll}).
 */
@Component({
  selector: 'app-root',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  @ViewChild(IonContent) ionContent: IonContent;

  // State variables for managing user data and game lists
  username: string = '';
  usernames: string[] = [];
  userGameList: BggResponse | undefined;
  totalGameList: BggResponse = { items: [], total: 0 };
  filteredGameList: BggResponse = { items: [], total: 0 };

  playerCount: number;
  playTime: number;

  // State variables for filtering and sorting the game list
  public showFilterDropdown = false;
  public selectedPlayerCount: number;
  public selectedPlayTime: number;

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
    private usernameColorService: UsernameColorService,
    private router: Router,
    private ls: LoginService,
    private alertController: AlertController,
    private popoverController: PopoverController,
    private modalController: ModalController,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private filterGamesService: FilterGamesService,
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this._handleNavigationEnd(event.urlAfterRedirects);
      });

    this._initializeGameList();
    this._addEventListeners();
  }

  private _addEventListeners() {
    document.addEventListener('keydown', this._checkKeyCombination.bind(this));
    document.addEventListener('touchstart', this._checkTouchGesture.bind(this));
    document.addEventListener('keydown', this._handleEnterKey.bind(this));
  }

  private _handleEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.classList.contains('highlight-box')) {
        (activeElement as HTMLElement).click();
      }
    }
  }

  private _checkKeyCombination(event: KeyboardEvent) {
    if (event.ctrlKey && event.altKey && event.key === 'l') {
      this._toggleLoginButton();
    }
  }

  private _checkTouchGesture(event: TouchEvent) {
    if (event.touches.length === 3) {
      this._toggleLoginButton();
    }
  }

  private _toggleLoginButton() {
    const hiddenLoginButton = document.getElementById('hiddenLoginButton');
    if (hiddenLoginButton) {
      hiddenLoginButton.style.display =
        hiddenLoginButton.style.display === 'none' || hiddenLoginButton.style.display === ''
          ? 'block'
          : 'none';
    }
  }

  private async _initializeGameList() {
    await this.bggStorage.init();
    const gameList = await this.bggStorage.get('gameList');
    if (!gameList) return;

    this.loadUsernamesFromLocalStorage();
    if (this.usernames.length > 0) {
      this._mergeAndReloadUsernames();
    }
    this.resetFilters();
  }

  private _handleNavigationEnd(url: string) {
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const usernamesPart = queryParams.get('username');
    if (usernamesPart) {
      this.usernames = usernamesPart.split(',');
      this._mergeAndReloadUsernames();
    }
  }

  private async _mergeAndReloadUsernames() {
    const urlUsernames = this.usernames;
    const localStorageUsernames = this._getUsernamesFromLocalStorage();

    for (const u of urlUsernames) {
      if (localStorageUsernames.includes(u)) {
        this._loadStoredUsers(u);
      } else {
        await this.loadGameList(u, false);
        this._setUserToLocalStorage(u);
      }
    }
  }

  private _getUsernamesFromLocalStorage(): string[] {
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

  private _loadStoredUsers(username: string) {
    const key = Object.keys(localStorage).find((key) => key.endsWith(username));
    if (key) {
      const collectionWithUser = JSON.parse(localStorage.getItem(key) as string);
      const existingGameIds = new Set(this.totalGameList.items.map((item) => item.collectionId));

      const newItems = collectionWithUser.items.filter(
        (item: { collectionId: number }) => !existingGameIds.has(item.collectionId),
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

  public async loadGameList(username: string, p: boolean) {
    await this.loadingService.showLoading().then((l) => {
      l.present();
      this.bggApi.getUserCollection(username, p).subscribe({
        next: (res) => {
          if (res && res.total !== undefined) {
            this._handleGameListResponse(res, username, l);
            this.username = "";
          } else {
            this.errorMessage = res ? res.toString() : 'Error loading game list.';
          }
        },
        error: (err) => {
          this.username = "";
          console.error('Error loading game list:', err);
          this.errorMessage = 'Error loading game list.';
        },
        complete: () => {
          l.dismiss();
        },
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _handleGameListResponse(res: BggResponse, username: string, l: any) {
    this.errorMessage = null;
    if (res.total === 0) {
      this.toastService.presentToast('No games found for user.', 'top');
      l.dismiss();
      return;
    }
    if (this._getLocalStorageStatus().length >= this.usernameColorService.colors.length) {
      this.toastService.presentToast('Maximum number of collections reached.', 'top');
      l.dismiss();
      return;
    }
    if (this._getLocalStorageStatus().find((user) => user.username === username)) {
      this.toastService.presentToast(`Collection for user ${username} already exists.`, 'top');
      l.dismiss();
      return;
    }
    this._addUser(username);
    const collectionWithUser: BggResponse = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: res.items.map((item: any) => ({
        ...item,
        user: username,
      })),
      total: res.total,
    };
    this.userGameList = collectionWithUser;
    this.totalGameList.items = [...this.totalGameList.items, ...collectionWithUser.items];
    this.filteredGameList.items = [...this.totalGameList.items];
    this.bggStorage.set('gameList', {
      items: this.totalGameList,
      total: this.totalGameList.items.length,
    });
    this._setUserToLocalStorage(username);
    this.username = '';
  }

  private _setUserToLocalStorage(username: string) {
    const color = this.usernameColors.find((userColor) => userColor.username === username)?.color;
    const itemsFromUser = this.totalGameList.items.filter((item) => item.user === username);
    if (color) {
      localStorage.setItem(
        `Username-${color}-${username}`,
        JSON.stringify({ items: itemsFromUser, total: itemsFromUser.length }),
      );
    }
  }

  private _addUser(username: string) {
    if (!this.usernames.includes(username)) {
      this.usernames.push(username);
      this._setColorForUsername(username);
    }
  }

  public async removeUser(username: string) {
    this.usernames = this.usernames.filter((user) => user !== username);
    console.log(this.totalGameList.items.filter((item) => item.user !== username))
    this.totalGameList.items = this.totalGameList.items.filter((item) => item.user !== username);
    this.filteredGameList.items = this.filteredGameList.items.filter((item) => item.user !== username);

    this.bggStorage.set('gameList', {
      items: this.totalGameList.items,
      total: this.totalGameList.items.length,
    });

    localStorage.removeItem(`Username-${this.getColorForUsername(username)}-${username}`);
    this.usernameColors = this.usernameColors.filter((user) => user.username !== username);
    this.usernameColorService.removeUsername(username);
  }

  public getColorForUsername(username: string): string {
    return this.usernameColorService.getColorForUsername(username, this.usernameColors);
  }

  private _setColorForUsername(username: string) {
    this.usernameColors = this.usernameColorService.setColorForUsername(username);
  }

  private _getLocalStorageStatus() {
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

  private loadUsernamesFromLocalStorage() {
    const localStorageStatus = this._getLocalStorageStatus();
    this.usernames = localStorageStatus.map((user) => user.username);
    this.usernameColors = localStorageStatus;
  }

  async openFilterPopover(ev: Event) {
    const popover = await this.popoverController.create({
      component: FilterPopoverComponent,
      event: ev,
      translucent: true,
      backdropDismiss: true,
      componentProps: {
        playerCount: this.playerCount,
        playTime: this.playTime,
        totalGameList: this.totalGameList,
        listPage: this,
      },
      keyboardClose: false,
    });

    await popover.present();

    const { data } = await popover.onWillDismiss();

    if (data) {
      this.playerCount = data.playerCount;
      this.playTime = data.playTime;
      this.filterGames();
    }
  }

  async openLoginPopover(ev: Event) {
    const loginPopover = await this.popoverController.create({
      component: LoginComponent,
      event: ev,
      translucent: true,
      backdropDismiss: true,
      componentProps: {
        listPage: this,
      },
      keyboardClose: false,
    });

    await loginPopover.present();

    const { data } = await loginPopover.onWillDismiss();
    if (data) {
      console.log(data)
      this.ls.login(data.username, data.password).subscribe(() => {
        this.username = data.username;

        this.loadGameList(this.username, true);
      })

    }
  }

  async shareList() {
    await Share.share({
      url: `https://deviasa.github.io/bgg-app/?username=${this.usernames.join(',')}`,
    });
  }

  filterGames() {
    this.filteredGameList.items = this.filterGamesService.filterGames(
      this.playTime,
      this.playerCount,
      this.filteredGameList,
    );
  }

  isFilterSet(): boolean {
    return this.playerCount > 0 || this.playTime > 0;
  }

  resetFilters() {
    this.playerCount = 0;
    this.playTime = 0;

    this.filteredGameList.items = [...this.totalGameList.items];
  }

  async showLoginMask(username: string) {
    const loginModal = await this.modalController.create({
      component: LoginComponent,
      componentProps: {
        username: username,
      },
    });

    loginModal.present();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await loginModal.onWillDismiss().then((res: any) => {
      this.loadingService.showLoading().then(() => {});
      this.ls.login(res.data.username, res.data.password).subscribe({
        next: () => {
          this.loadingService.hideLoading();
          this.loadGameList(res.data.username, true);
        },
        error: (err) => {
          console.error(err);
          this.loadingService.hideLoading();
          this.loadGameList(res.data.username, false);
        },
      });
    });
  }

  async askForLogin() {
    const askAlert = await this.alertController.create({
      header: 'Login?',
      message: 'Do you want to login to your BGG account to get the private information?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
          handler: () => {
            askAlert.dismiss();
          },
        },
        {
          text: 'Yes',
          role: 'confirm',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.showLoginMask(this.username);
          },
        },
      ],
    });

    await askAlert.present();
  }

  selectGame(game: BggGame) {
    this.showGameDetail(game).then(() => {});
  }

  async showGameDetail(game: BggGame) {
    const gameModal = await this.modalController.create({
      component: GameDetailComponent,
      componentProps: {
        game: game,
      },
    });

    await gameModal.present();
  }

  scrollContent(scroll) {
    if (scroll === 'top') {
      this.ionContent.scrollToTop(300);
    } else {
      this.ionContent.scrollToBottom(300);
    }
  }

  public lastScrollTop = 0;
  private readonly SCROLL_THRESHOLD = 100;

  onScroll(event): void {
    const scrollButton = document.getElementById('scrollBtn');
    if (event.detail.scrollTop > this.SCROLL_THRESHOLD) {
      scrollButton.style.display = 'block';
    } else {
      scrollButton.style.display = 'none';
    }

    this.lastScrollTop = event.detail.scrollTop;
  }
}
