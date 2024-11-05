import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UsernameColorService {
  public colors: string[] = [
    this.getCSSVariable('--ion-color-user1'),
    this.getCSSVariable('--ion-color-user2'),
    this.getCSSVariable('--ion-color-user3'),
    this.getCSSVariable('--ion-color-user4'),
    this.getCSSVariable('--ion-color-user5'),
  ];
  private usernameColors: { username: string; color: string }[] = [];

  private getCSSVariable(variableName: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  }
  // Get color associated with a specific username
  getColorForUsername(
    username: string,
    usernameColors: { username: string; color: string }[],
  ): string {
    this.usernameColors = usernameColors || this.usernameColors;
    const userColor = this.usernameColors.find((userColor) => userColor.username === username);
    return userColor ? userColor.color : '#fff';
  }

  // Assign color to a username
  setColorForUsername(username: string): { username: string; color: string }[] {
    if (!this.usernameColors.some((userColor) => userColor.username === username)) {
      const usedColors = this.usernameColors.map((userColor) => userColor.color);
      const availableColors = this.colors.filter((color) => !usedColors.includes(color));
      const color = availableColors.length > 0 ? availableColors[0] : this.colors[0];
      this.usernameColors.push({ username, color });
    }

    return this.usernameColors;
  }

  removeUsername(username: string) {
    this.usernameColors = this.usernameColors.filter(
      (userColor) => userColor.username !== username,
    );
  }
}
