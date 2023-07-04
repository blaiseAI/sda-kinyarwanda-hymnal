import { Component, OnInit } from '@angular/core';
import { Share } from '@capacitor/share';
import { AppInfoService } from 'src/app/services/app-info.service';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { PrivayPolicyPage } from '../privay-policy/privay-policy.page';
import { TermsAndConditionsPage } from '../terms-and-conditions/terms-and-conditions.page';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';



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
  isIOS: boolean;

  constructor(
    private appInfoService: AppInfoService,
    public readonly ionRouterOutlet: IonRouterOutlet,
    private readonly modalController: ModalController,
    private platform: Platform
  ) {
    this.appName = this.appInfoService.getAppName();
    this.appDescription = this.appInfoService.getAppDescription();
    this.appVersion = this.appInfoService.getAppVersion();
    this.isMobile = this.appInfoService.isMobile();
    this.isIOS = Capacitor.getPlatform() === 'ios';

  }

  ngOnInit() {}

  toggleDarkMode(event: any) {
    let systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    systemDark.addListener(this.colorTest);
    if (event.detail.checked) {
      this.playHapticFeedback();
      document.body.setAttribute('data-theme', 'dark');
    } else {
      this.playHapticFeedback();
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
    this.playHapticFeedback();
    const modal = await this.modalController.create({
      component: PrivayPolicyPage,
      presentingElement: this.ionRouterOutlet.nativeEl,
    });
    return await modal.present();
  }

  async openTermsAndConditions() {
    this.playHapticFeedback();
    const modal = await this.modalController.create({
      component: TermsAndConditionsPage,
      presentingElement: this.ionRouterOutlet.nativeEl,
    });
    return await modal.present();
  }
  async shareApp() {
    if (Capacitor.isNativePlatform()) {
      try {
        this.playHapticFeedback();
  
        const platform = Capacitor.getPlatform();
        let storeUrl = '';
  
        if (platform === 'ios') {
          // iOS platform, link to App Store
          storeUrl = 'https://apps.apple.com/ca/app/sda-kinyarwanda-hymnal/id6449814873';
        } else if (platform === 'android') {
          // Android platform, link to Google Play Store
          storeUrl = 'https://play.google.com/store/apps/details?id=com.devseb.sdaKinyarwandaHymnal';
        }
  
        await Share.share({
          title: 'SDA Kinyarwanda Hymnal App',
          text: 'Check out this app I am using, "SDA Kinyarwanda Hymnal"!',
          url: storeUrl,
          dialogTitle: 'Share App',
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Handle the case when the Share plugin is not available or when not running on a mobile device
      console.log('Share functionality is not available');
    }
  }

  rateApp() {
    this.playHapticFeedback();
    window.open(
      'https://apps.apple.com/ca/app/sda-kinyarwanda-hymnal/id6449814873?action=write-review',
      '_system'
    );
  }

  sendFeedback() {
    const emailAddress = 'blaise@hellothe.re';
    const subject = encodeURIComponent('General Feedback');
    const mailtoLink = `mailto:${emailAddress}?subject=${subject}`;
    window.open(mailtoLink, '_system');
  }
  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }
}
