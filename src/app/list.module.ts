import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { ListPage } from './list.page';
import { ListPageRoutingModule } from './list-routing.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { GameSelectionModalComponent } from './components/game-selection-modal/game-selection-modal.component';
import { FormsModule } from '@angular/forms';
import { SortPipe } from 'src/pipes/sort.pipe';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [GameSelectionModalComponent, ListPage, SortPipe],
  imports: [
    CommonModule,
    IonicModule.forRoot(),
    FormsModule,
    BrowserModule,
    ListPageRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot({
      driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage],
    }),
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, HttpClient],
  bootstrap: [ListPage],
})
export class ListPageModule {}
