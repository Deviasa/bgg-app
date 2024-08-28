import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  // Set an item in localStorage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Get an item from localStorage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getItem(key: string): any {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  // Remove an item from localStorage
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Clear all items from localStorage
  clear(): void {
    localStorage.clear();
  }

  // Get all keys from localStorage
  getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i) as string);
    }
    return keys;
  }
}
