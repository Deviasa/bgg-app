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

  getUserCollection(username: string) {
    //username = username || 'Leviasa';
    return this.http
      .get(
        `https://boardgamegeek.com/xmlapi2/collection?username=${username}&stats=1&excludesubtype=boardgameexpansion`,
        {
          responseType: 'text',
          withCredentials: 'true',
        },
      )
      .pipe(switchMap(async (xml) => await this.parseXmlToJson(xml)));
  }

  async parseXmlToJson(xml: string) {
    const parsedData = await xml2js.parseStringPromise(xml, {
      explicitArray: false,
    });
    if (!parsedData) {
      return null; // Not found
    }
    if (parsedData.errors) {
      return parsedData.errors.error.message;
    }
    const data = parsedData as IBggResponse;
    return new BggResponse(data);
  }
}
