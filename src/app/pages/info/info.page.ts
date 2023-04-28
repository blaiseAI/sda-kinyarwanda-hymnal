import { Component, OnInit } from '@angular/core';
import { AppInfoService } from 'src/app/services/app-info.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {
  shareApp() {
    throw new Error('Method not implemented.');
  }
  appName: string;
  appDescription: string;
  appVersion: string;
  isMobile: boolean;

  constructor(
    private appInfoService: AppInfoService,
    private themeService: ThemeService
  ) {
    this.appName = this.appInfoService.getAppName();
    this.appDescription = this.appInfoService.getAppDescription();
    this.appVersion = this.appInfoService.getAppVersion();
    this.isMobile = this.appInfoService.isMobile();
  }

  ngOnInit() {}

  toggleDarkMode(event: any) {
    let systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    systemDark.addListener(this.colorTest);
    if (event.detail.checked) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
    }
  }
  colorTest(systemInitiatedDark: { matches: any }) {
    if (systemInitiatedDark.matches) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
    }
  }
}
