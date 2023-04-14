import { Component, OnInit } from '@angular/core';
import { AppInfoService } from 'src/app/services/app-info.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {
  appName: string;
  appDescription: string;
  appVersion: string;
  isMobile: boolean;

  constructor(private appInfoService: AppInfoService) {
    this.appName = this.appInfoService.getAppName();
    this.appDescription = this.appInfoService.getAppDescription();
    this.appVersion = this.appInfoService.getAppVersion();
    this.isMobile = this.appInfoService.isMobile();
  }

  ngOnInit() {}

  shareApp(app?: 'twitter' | 'facebook' | 'whatsapp') {
    // Share app logic here
  }
}
