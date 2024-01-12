import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListPageRoutingModule } from './list-routing.module';

import { ListPage } from './list.page';
import { SearchPipe } from 'src/pipes/search.pipe';
import { SortPipe } from 'src/pipes/sort.pipe';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ListPageRoutingModule],
  declarations: [ListPage, SortPipe],
})
export class ListPageModule {}
