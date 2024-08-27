import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { SortPipe } from 'src/pipes/sort.pipe';
import { GameSelectionModalComponent } from './components/game-selection-modal/game-selection-modal.component';
import { ListPageRoutingModule } from './list-routing.module';
import { ListPage } from './list.page';

@NgModule({
  declarations: [GameSelectionModalComponent, ListPage, SortPipe],
  imports: [
    CommonModule,
    IonicModule.forRoot(),
    FormsModule,
    RouterModule.forRoot([]),
    BrowserModule,
    ListPageRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot({
      driverOrder: [Drivers.LocalStorage],
    }),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    HttpClient,
  ],
  bootstrap: [ListPage],
})
export class ListPageModule {}
