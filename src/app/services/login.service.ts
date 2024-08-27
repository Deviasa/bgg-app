import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  authToken: string | null = null;
  authTokenExpiry: number = 0;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}

  async login(username: string, password: string): Promise<void> {
    const body = {
      credentials: {
        username: username,
        password: password,
      },
    };

    const headers = new HttpHeaders().set('Access-Control-Allow-Origin', '*');

    const response = await this.http
      .post('https://boardgamegeek.com/login/api/v1', body, {
        headers: headers,
        observe: 'response',
        withCredentials: true,
      })
      .toPromise()
      .then((res) => {
        const setCookieHeader = res?.headers.get('Set-Cookie');

        if (setCookieHeader) {
          const cookies = setCookieHeader.split(';');
          const bggpassword = cookies.find(
            (cookie) =>
              cookie.startsWith('bggpassword') && !cookie.includes('deleted'),
          );

          if (bggpassword) {
            this.authToken = bggpassword.split('=')[1];
            this.authTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // Set expiry to 24 hours from now
          }
        }
      });

    const cookies = this.cookieService.getAll();

    const bggpassword = cookies['bggpassword'];

    if (bggpassword && bggpassword !== 'deleted') {
      this.authToken = bggpassword;
      this.authTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
    }
  }
}
