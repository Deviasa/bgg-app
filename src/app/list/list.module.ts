import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ListPageRoutingModule } from './list-routing.module';
import { ListPage } from './list.page';
import { SortPipe } from 'src/pipes/sort.pipe';
import { IonicStorageModule } from '@ionic/storage-angular';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListPageRoutingModule,
    IonicStorageModule,
  ],
  declarations: [ListPage, SortPipe, LoginModalComponent],
})
export class ListPageModule {}
