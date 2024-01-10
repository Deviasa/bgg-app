import { Component, OnInit } from '@angular/core';
import { BggApiService } from '../services/bgg-api.service';
import { Observable } from 'rxjs';
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

  printToConsole() {
    this.bggApi.getUserInfo().subscribe((res: BggResponse | null) => {
      if (res !== null) {
        this.userGameList = res;
      }
    });
  }
}
