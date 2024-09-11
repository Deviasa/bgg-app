import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BggApiService } from './bgg-api.service';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  authToken: string | null = null;
  authTokenExpiry: number = 0;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private bggApi: BggApiService,
  ) {}

  login(username: string, password: string) {
    const body = {
      credentials: {
        username: username,
        password: password,
      },
    };

    return this.http.post(`http://localhost:3000/login`, body, {
      withCredentials: true, // Include cookies in the request
    });
  }
}
