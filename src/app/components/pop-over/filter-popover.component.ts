import { Component, Input } from '@angular/core';

import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'filter-popover-modal',
  templateUrl: './filter-popover.component.html',
})
export class FilterPopoverComponent {
  @Input() playerCount: number = 4;
  @Input() playTime: number = 60;

  constructor(private popoverController: PopoverController) {}

  applyFilters() {
    this.popoverController.dismiss({
      playerCount: this.playerCount,
      playTime: this.playTime,
    });
  }

  resetFilters() {
    this.playerCount = 0;
    this.playTime = 0;
    this.applyFilters();
  }
}
