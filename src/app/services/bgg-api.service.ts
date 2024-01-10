import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { BggResponse, IBggResponse } from './models/bgg-response.model';
import * as xml2js from 'xml2js';
@Injectable({
  providedIn: 'root',
})
export class BggApiService {
  constructor(private http: HttpClient) {}

  getUserInfo() {
    return this.http
      .get('https://boardgamegeek.com/xmlapi/collection/Leviasa', {
        responseType: 'text',
      })
      .pipe(switchMap(async (xml) => await this.parseXmlToJson(xml)));
  }

  async parseXmlToJson(xml: string) {
    const data = (await xml2js.parseStringPromise(xml, {
      explicitArray: false,
    })) as IBggResponse;
    if (!data) {
      return null; // Not found
    }
    return new BggResponse(data);
  }
}
