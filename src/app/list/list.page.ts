import { Component, OnInit } from '@angular/core';
import { BggApiService } from '../services/bgg-api.service';
import { BggResponse } from '../services/models/bgg-response.model';
import { BggStorageService } from '../services/storage.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  constructor(
    private bggApi: BggApiService,
    private bggStorage: BggStorageService
  ) {}

  username: string = '';
  usernames: string[] = [];
  userGameList: BggResponse | undefined;
  totalGameList: BggResponse = { items: [], total: 0 };
  //Light qualitative colour scheme that is reasonably distinct in both normal and colour-blind vision.(Paul Tol)
  colors: string[] = [
    '#77AADD',
    '#FFAABB',
    '#BBCC33',
    '#EE8866',
    '#99DDFF',
    '#EEDD88',
    '#44BB99',
    '#AAAA00',
  ];
  errorMessage: string | null = null;

  ngOnInit() {
    console.log('ngOnInit: ', this.bggStorage.get('username'));
    this.bggStorage.get('gameList').then((res: BggResponse | undefined) => {
      if (res !== null && res !== undefined) {
        this.userGameList = res;
      } else if (this.bggStorage.get('username')) {
        this.loadGameList(this.bggStorage.get('username'));
      }
    });
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
          } else this.errorMessage = null;
          if (res.total === 0) {
            console.log('No games found for user.');
            return;
          }

          if (this.usernames.length >= 8) {
            console.log('Maximum number of collections reached.');
            return;
          }

          if (this.usernames.includes(username)) {
            console.log(`Collection for user ${username} already exists.`);
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
        }
      });
  }

  addUser(username: string) {
    this.usernames.push(username);
  }

  removeUser(username: string) {
    const index = this.usernames.indexOf(username);
    if (index > -1) {
      this.usernames.splice(index, 1);
    }
  }

  getColorForUsername(username: string) {
    const userIndex = this.usernames.indexOf(username);
    return this.colors[userIndex % this.colors.length];
  }
}
