import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppInfoService {
  getAppDescription(): string {
    const description = 'Indirimbo Zo Guhimbaza Imana';
    return description;
  }
  private readonly version = '1.0.0';

  constructor() {}

  getAppName(): string {
    return 'SDA Kinyarwanda Hymnal';
  }

  getAppVersion(): string {
    return this.version;
  }

  getGithubUrl(): string {
    return 'https://github.com/myusername/my-app';
  }

  getTwitterUrl(): string {
    return 'https://twitter.com/myapp';
  }
  isMobile(): boolean {
    return window.innerWidth < 768;
  }
}
