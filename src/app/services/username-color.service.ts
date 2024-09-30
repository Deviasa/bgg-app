import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UsernameColorService {
  public colors: string[] = [
    '#AAAA00',
    '#FFAABB',
    '#44BB99',
    '#EE8866',
    '#BBCC33',
    '#99DDFF',
    '#EEDD88',
    '#77AADD',
    '#FFDD44',
    '#66CCEE',
    '#CC99CC',
    '#FFAA77',
    '#88CCAA',
    '#FFCC99',
    '#99CCFF',
    '#FF6699',
    '#66FFCC',
    '#FF9966',
    '#6699FF',
    '#CCFF99',
    '#FF99CC',
    '#66CC99',
    '#FFCC66',
    '#99FFCC',
  ];
  private usernameColors: { username: string; color: string }[] = [];

  // Get color associated with a specific username
  getColorForUsername(
    username: string,
    usernameColors: { username: string; color: string }[],
  ): string {
    this.usernameColors = usernameColors || this.usernameColors;
    const userColor = this.usernameColors.find(
      (userColor) => userColor.username === username,
    );
    return userColor ? userColor.color : '#fff';
  }

  // Assign color to a username
  setColorForUsername(username: string): { username: string; color: string }[] {
    console.log(this.usernameColors)
    if (
      !this.usernameColors.some((userColor) => userColor.username === username)
    ) {
      const usedColors = this.usernameColors.map(
        (userColor) => userColor.color,
      );
      const availableColors = this.colors.filter(
        (color) => !usedColors.includes(color),
      );
      const color =
        availableColors.length > 0 ? availableColors[0] : this.colors[0];
      this.usernameColors.push({ username, color });
    }

    return this.usernameColors;
  }

  removeUsername(username: string) {
    this.usernameColors = this.usernameColors.filter(userColor => userColor.username !== username);
  }
}
