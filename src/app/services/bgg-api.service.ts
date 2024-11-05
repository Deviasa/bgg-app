import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BGGThing } from '@models/app/interfaces/thing.interface';
import { ToastService } from '@models/app/services/toast.service';
import { environment } from '@models/environments/environment';
import { switchMap } from 'rxjs/operators';
import * as xml2js from 'xml2js';
import { parseString } from 'xml2js';
import { BggResponse, IBggResponse } from './models/bgg-response.model';
@Injectable({
  providedIn: 'root',
})
export class BggApiService {
  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  headers = new HttpHeaders().set(
    'Access-Control-Allow-Origin',
    'https://deviasa.github.io/bgg-app',
  );

  getUserCollection(username: string, p: boolean) {
    if (p) {
      return this.http
        .get(
          `https://bgg-connector-production.up.railway.app/collection?username=${username}&showprivate=1&stats=1`,
          {
            headers: this.headers,
            responseType: 'text' as const,
            withCredentials: true,
          },
        )
        .pipe(switchMap(async (xml) => await this.parseXmlToJson(xml)));
    } else {
      return this.http
        .get(`${environment.bggLink}?username=${username}&stats=1`, {
          responseType: 'text' as const,
        })
        .pipe(switchMap(async (xml) => await this.parseXmlToJson(xml)));
    }
  }

  getThingInformation(thingId: number) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.http
      .get(`https://bgg-connector-production.up.railway.app/thing?id=${thingId}&stats=1`, {
        responseType: 'text',
      })
      .pipe(
        // eslint-disable-next-line
        // @ts-ignore
        switchMap((response) => {
          let result: BGGThing;
          parseString(response, { explicitArray: false }, (err, jsonResult) => {
            if (err) {
              throw new Error('Error parsing XML');
            } else {
              result.item = jsonResult.items.item;
              return result;
            }
          });
        }),
      );
  }

  async parseXmlToJson(xml: string) {
    if (xml.includes('Your request for this collection has been accepted and will be processed')) {
      this.toastService.presentToast(
        'Your request for this collection has been accepted and will be processed',
        'top',
      );
      return null;
    } else {
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
}
