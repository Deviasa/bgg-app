import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { BggResponse, IBggResponse } from './models/bgg-response.model';
import * as xml2js from 'xml2js';
import {environment} from "@models/environments/environment";
@Injectable({
  providedIn: 'root',
})
export class BggApiService {
  constructor(private http: HttpClient) {}

  headers = new HttpHeaders().set('Access-Control-Allow-Origin', 'https://deviasa.github.io/bgg-app');


  getUserCollection(username: string, p: boolean) {
    if(p) {
      return this.http
        .get(
          `https://bgg-connector-production.up.railway.app/collection?username=${username}&showprivate=1&stats=1`,
          {
            headers: this.headers,
            responseType: 'text' as 'text',
            withCredentials: true,
          },
        )
        .pipe(switchMap(async (xml) => await this.parseXmlToJson(xml)));
    } else {
      return this.http
        .get(
          `${environment.bggLink}?username=${username}&stats=1`,
          {
            responseType: 'text' as 'text',
          },
        )
        .pipe(switchMap(async (xml) => await this.parseXmlToJson(xml)));
    }

  }

  async parseXmlToJson(xml: string) {
    if (
      xml ===
      `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<message>
\tYour request for this collection has been accepted and will be processed.  Please try again later for access.
</message>`
    ) {
      alert('Request not ready');
    }
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
