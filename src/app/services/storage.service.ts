import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class BggStorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {

  }

  public async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public set(key: string, value: any) {
    return this._storage?.set(key, value);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get(key: string): any {
    return this._storage?.get(key);
  }
}
