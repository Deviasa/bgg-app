import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule, isDevMode } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { GameDetailComponent } from '@models/app/components/game-detail/game-detail.component';
import { SortPipe } from 'src/pipes/sort.pipe';
import { GameSelectionModalComponent } from './components/game-selection-modal/game-selection-modal.component';
import { LoginComponent } from './components/login/login.component';
import { ListPageRoutingModule } from './list-routing.module';
import { ListPage } from './list.page';

@NgModule({
  declarations: [
    GameSelectionModalComponent,
    ListPage,
    SortPipe,
    LoginComponent,
    GameDetailComponent,
  ],
  imports: [
    ScrollingModule,
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
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, HttpClient],
  bootstrap: [ListPage],
})
export class ListPageModule {}
