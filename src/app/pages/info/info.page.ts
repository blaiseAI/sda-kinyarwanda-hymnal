import { Component, OnInit } from '@angular/core';
import { AppInfoService } from 'src/app/services/app-info.service';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { PrivayPolicyPage } from '../privay-policy/privay-policy.page';
import { TermsAndConditionsPage } from '../terms-and-conditions/terms-and-conditions.page';

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
    public readonly ionRouterOutlet: IonRouterOutlet,
    private readonly modalController: ModalController
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

  async openPrivacyPolicy() {
    const modal = await this.modalController.create({
      component: PrivayPolicyPage,
      presentingElement: this.ionRouterOutlet.nativeEl,
    });
    return await modal.present();
  }

  async openTermsAndConditions() {
    const modal = await this.modalController.create({
      component: TermsAndConditionsPage,
      presentingElement: this.ionRouterOutlet.nativeEl,
    });
    return await modal.present();
  }

  sendFeedback() {
    const emailAddress = 'blaise@hellothe.re';
    const subject = encodeURIComponent('General Feedback');
    const mailtoLink = `mailto:${emailAddress}?subject=${subject}`;
    window.open(mailtoLink, '_system');
  }
}
