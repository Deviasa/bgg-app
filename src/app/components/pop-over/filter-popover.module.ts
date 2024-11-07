import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FilterPopoverComponent } from './filter-popover.component';

@NgModule({
  declarations: [FilterPopoverComponent],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [FilterPopoverComponent],
})
export class FilterPopoverModule {}
