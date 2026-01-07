import { Component, OnInit, OnDestroy } from '@angular/core';
import { Share } from '@capacitor/share';
import { AppInfoService } from 'src/app/services/app-info.service';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { PrivayPolicyPage } from '../privay-policy/privay-policy.page';
import { TermsAndConditionsPage } from '../terms-and-conditions/terms-and-conditions.page';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Storage } from '@ionic/storage-angular';
import { BibleVerseService } from 'src/app/services/bible-verse.service';
import { Router } from '@angular/router';
import { LanguageService } from 'src/app/services/language.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit, OnDestroy {
  appName: string;
  appDescription: string;
  appVersion: string;
  isMobile: boolean;
  isIOS: boolean;
  isDarkMode: boolean = false;
  isHymnalReminderEnabled: boolean = true;
  isDailyVerseEnabled: boolean = true;
  hymnalReminderTime: string = '09:00';
  dailyVerseTime: string = '07:00';
  showEnglishTitles = false;
  showSupportInfo = false;
  private languageSubscription?: Subscription;
  private themeSubscription?: Subscription;

  toggleSupportInfo() {
    this.showSupportInfo = !this.showSupportInfo;
    this.playHapticFeedback();
  }

  constructor(
    private appInfoService: AppInfoService,
    public readonly ionRouterOutlet: IonRouterOutlet,
    private readonly modalController: ModalController,
    private platform: Platform,
    private storage: Storage,
    private bibleVerseService: BibleVerseService,
    private router: Router,
    private languageService: LanguageService,
    private themeService: ThemeService
  ) {
    this.appName = this.appInfoService.getAppNameSync();
    this.appDescription = this.appInfoService.getAppDescription();
    this.appVersion = this.appInfoService.getAppVersionSync();
    this.isMobile = this.appInfoService.isMobile();
    this.isIOS = Capacitor.getPlatform() === 'ios';
    this.initStorage();
  }

  async initStorage() {
    await this.storage.create();
    await this.loadStoredSettings();
  }

  async loadStoredSettings() {
    this.isHymnalReminderEnabled = (await this.storage.get('isHymnalReminderEnabled')) ?? true;
    this.isDailyVerseEnabled = (await this.storage.get('isDailyVerseEnabled')) ?? true;
    this.hymnalReminderTime = await this.storage.get('hymnalReminderTime') || '09:00';
    this.dailyVerseTime = await this.storage.get('dailyVerseTime') || '07:00';

    const isFirstLaunch = await this.storage.get('isFirstLaunch') !== false;
    if (isFirstLaunch) {
      await this.storage.set('isFirstLaunch', false);
      await this.storage.set('isHymnalReminderEnabled', true);
      await this.storage.set('isDailyVerseEnabled', true);
    }

    if (this.isHymnalReminderEnabled) {
      await this.scheduleHymnalReminder();
    }
    if (this.isDailyVerseEnabled) {
      await this.scheduleDailyVerse();
    }
  }

  async ngOnInit() {
    // Load actual version from native app (will update from fallback if native not available)
    this.appVersion = await this.appInfoService.getAppVersion();
    this.appName = await this.appInfoService.getAppName();

    // Subscribe to theme changes
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(
      (isDark) => {
        this.isDarkMode = isDark;
      }
    );

    // Subscribe to language preference changes
    this.languageSubscription = this.languageService.showEnglishTitles$.subscribe(
      (showEnglish) => {
        this.showEnglishTitles = showEnglish;
      }
    );

    // Request notification permissions
    const permResult = await LocalNotifications.requestPermissions();
    if (permResult.display !== 'granted') {
      console.log('Notification permissions not granted');
    }

    // Set up notification click listener
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      if (notification.notification.id === 2) { // Daily verse notification
        this.router.navigate(['/daily-verse']);
      }
    });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  async toggleLanguage() {
    await this.languageService.toggleLanguage();
    await this.playHapticFeedback();
  }

  async openDailyVerse() {
    await this.playHapticFeedback();
    this.router.navigate(['/daily-verse']);
  }

  async toggleHymnalReminder(event: any) {
    this.isHymnalReminderEnabled = event.detail.checked;
    await this.playHapticFeedback();
    await this.storage.set('isHymnalReminderEnabled', this.isHymnalReminderEnabled);
    
    if (this.isHymnalReminderEnabled) {
      await this.scheduleHymnalReminder();
    } else {
      await this.cancelHymnalReminder();
    }
  }

  async toggleDailyVerse(event: any) {
    this.isDailyVerseEnabled = event.detail.checked;
    await this.playHapticFeedback();
    await this.storage.set('isDailyVerseEnabled', this.isDailyVerseEnabled);
    
    if (this.isDailyVerseEnabled) {
      await this.scheduleDailyVerse();
    } else {
      await this.cancelDailyVerse();
    }
  }

  async updateHymnalReminderTime(event: any) {
    this.hymnalReminderTime = event.detail.value;
    await this.playHapticFeedback();
    await this.storage.set('hymnalReminderTime', this.hymnalReminderTime);
    
    if (this.isHymnalReminderEnabled) {
      await this.scheduleHymnalReminder();
    }
  }

  async updateDailyVerseTime(event: any) {
    this.dailyVerseTime = event.detail.value;
    await this.playHapticFeedback();
    await this.storage.set('dailyVerseTime', this.dailyVerseTime);
    
    if (this.isDailyVerseEnabled) {
      await this.scheduleDailyVerse();
    }
  }

  async scheduleHymnalReminder() {
    try {
      await this.cancelHymnalReminder();
      
      const [hours, minutes] = this.hymnalReminderTime.split(':').map(Number);
      let scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      if (scheduledTime.getTime() < Date.now()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      await LocalNotifications.schedule({
        notifications: [{
          id: 1,
          title: 'Time for Praise',
          body: 'Open your hymnal and sing to the Lord!',
          schedule: { 
            at: scheduledTime,
            allowWhileIdle: true
          }
        }]
      });
    } catch (error) {
      console.error('Error scheduling hymnal reminder:', error);
    }
  }

  async scheduleDailyVerse() {
    try {
      await this.cancelDailyVerse();
      
      const [hours, minutes] = this.dailyVerseTime.split(':').map(Number);
      let scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      if (scheduledTime.getTime() < Date.now()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const verse = await this.bibleVerseService.getNewVerse();
      const verseText = `${verse.random_verse.book} ${verse.random_verse.chapter}:${verse.random_verse.verse} - ${verse.random_verse.text}`;

      await LocalNotifications.schedule({
        notifications: [{
          id: 2,
          title: 'Daily Verse',
          body: verseText,
          schedule: { 
            at: scheduledTime,
            allowWhileIdle: true
          },
          extra: {
            verse: verse
          }
        }]
      });
    } catch (error) {
      console.error('Error scheduling daily verse:', error);
    }
  }

  async cancelHymnalReminder() {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
    } catch (error) {
      console.error('Error canceling hymnal reminder:', error);
    }
  }

  async cancelDailyVerse() {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: 2 }] });
    } catch (error) {
      console.error('Error canceling daily verse:', error);
    }
  }

  async toggleDarkMode(event: any) {
    const isDark = event.detail.checked;
    await this.playHapticFeedback();
    
    // Update theme through the service (will sync to all tabs)
    await this.themeService.setTheme(isDark);
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
          storeUrl = 'https://apps.apple.com/ca/app/sda-kinyarwanda-hymnal/id6449814873';
        } else if (platform === 'android') {
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
    }
  }

  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }

  sendFeedback() {
    const emailAddress = 'blaise@hellothe.re';
    const subject = encodeURIComponent('General Feedback');
    const mailtoLink = `mailto:${emailAddress}?subject=${subject}`;
    window.open(mailtoLink, '_system');
  }

  rateApp() {
    this.playHapticFeedback();
    window.open(
      'https://apps.apple.com/ca/app/sda-kinyarwanda-hymnal/id6449814873?action=write-review',
      '_system'
    );
  }

  supportViaPayPal() {
    this.playHapticFeedback();
    window.open('https://www.paypal.com/paypalme/blaisesebagabo', '_system');
  }

  supportViaPatreon() {
    this.playHapticFeedback();
    window.open('https://www.patreon.com/blaisesebagabo', '_system');
  }
}