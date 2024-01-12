import { Component, OnInit } from '@angular/core';
import { BggApiService } from '../services/bgg-api.service';
import { BggResponse } from '../services/models/bgg-response.model';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  constructor(private bggApi: BggApiService) {}

  userGameList: BggResponse | undefined;

  ngOnInit() {}

  descending: boolean = false;
  order: number = 1;
  column: string = 'name';

  userName: string = '';

  sort(column: string) {
    this.descending = !this.descending;
    this.order = this.descending ? 1 : -1;
    this.column = column;
  }

  loadGameList(userName: string) {
    this.bggApi.getUserInfo(userName).subscribe((res: BggResponse | null) => {
      if (res !== null) {
        this.userGameList = res;
      }
    });
  }
}
