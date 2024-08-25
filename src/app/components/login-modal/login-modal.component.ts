import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoginService } from '../../services/login.service';
import { setCookie } from 'typescript-cookie';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent implements OnInit {
  showPassword = false;
  username: string = '';
  password: string = '';

  constructor(
    private modalController: ModalController,
    private loginService: LoginService
  ) {}

  ngOnInit() {}

  login() {
    this.loginService.login('Leviasa', '****');
  }

  setCookie() {
    setCookie('bgg_username ', this.username, { expires: 1 });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
