import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {}

  confirm() {
    if (this.username.length > 0 && this.password.length > 0) {
      return this.popoverController.dismiss(
        { username: this.username, password: this.password },
        'confirm',
      );
    }
  }
}
