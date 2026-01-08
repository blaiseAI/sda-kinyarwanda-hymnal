import { Component, OnInit } from '@angular/core';
import { AppUpdate, AppUpdateAvailability } from '@capawesome/capacitor-app-update';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private alertController: AlertController,
    private themeService: ThemeService,  // Theme service will auto-initialize
    private router: Router
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.setupDeepLinks();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      // Theme is now initialized automatically by ThemeService
      // Delay initialization of other features to ensure app is fully loaded
      setTimeout(() => {
        this.initializeFeatures();
      }, 1000);
    });
  }

  private async initializeFeatures() {
    try {
      await this.getCurrentAppVersion();
      await this.checkForUpdate();
    } catch (error) {
      console.error('Error initializing features:', error);
    }
  }
  
  getCurrentAppVersion = async () => {
    try {
      const result = await AppUpdate.getAppUpdateInfo();
      console.log('Current app version:', result.currentVersionName);
    } catch (error) {
      console.error('Error getting app version:', error);
    }
  };

  async checkForUpdate() {
    try {
      const result = await AppUpdate.getAppUpdateInfo();
      console.log('Update check result:', result);

      if (result.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE) {
        if (this.platform.is('android')) {
          if (result.immediateUpdateAllowed) {
            await AppUpdate.performImmediateUpdate();
          } else if (result.flexibleUpdateAllowed) {
            await AppUpdate.startFlexibleUpdate();
            this.setupFlexibleUpdateListener();
          }
        } else if (this.platform.is('ios')) {
          await this.showUpdateAlert();
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  private async setupFlexibleUpdateListener() {
    AppUpdate.addListener('onFlexibleUpdateStateChange', async () => {
      try {
        const alert = await this.alertController.create({
          header: 'Update Downloaded',
          message: 'The update has been downloaded. Would you like to restart the app to complete the update now?',
          buttons: [
            {
              text: 'Later',
              role: 'cancel',
            },
            {
              text: 'Restart Now',
              handler: () => {
                AppUpdate.completeFlexibleUpdate();
              }
            }
          ]
        });
        await alert.present();
      } catch (error) {
        console.error('Error showing update alert:', error);
      }
    });
  }

  private async showUpdateAlert() {
    try {
      const alert = await this.alertController.create({
        header: 'Update Available',
        message: 'A new version of the app is available. Would you like to update now?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
          },
          {
            text: 'Update Now',
            handler: () => {
              AppUpdate.openAppStore();
            }
          }
        ]
      });
      await alert.present();
    } catch (error) {
      console.error('Error showing update alert:', error);
    }
  }

  private setupDeepLinks() {
    // Handle app opened via deep link
    App.addListener('appUrlOpen', (data: { url: string }) => {
      console.log('Deep link received:', data.url);
      this.handleDeepLink(data.url);
    });

    // Handle app state change (when app is already open and receives a deep link)
    App.addListener('appStateChange', (state: { isActive: boolean }) => {
      if (state.isActive) {
        // App became active - could check for pending deep links here if needed
        console.log('App state changed, isActive:', state.isActive);
      }
    });
  }

  private handleDeepLink(url: string) {
    try {
      // Parse the URL
      const urlObj = new URL(url);
      
      // Handle different URL patterns
      if (urlObj.hostname === 'sda-kinyarwanda-hymnal.vercel.app' || 
          urlObj.hostname.includes('vercel.app')) {
        // Website deep link: https://sda-kinyarwanda-hymnal.vercel.app/hymns/5
        this.handleWebsiteDeepLink(urlObj);
      } else if (urlObj.protocol === 'sdahymnal:') {
        // Custom URL scheme: sdahymnal://hymns/5
        this.handleCustomSchemeDeepLink(urlObj);
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
      // If URL parsing fails, try to extract path manually
      this.handleManualUrlParsing(url);
    }
  }

  private handleWebsiteDeepLink(urlObj: URL) {
    const pathParts = urlObj.pathname.split('/').filter(p => p);
    
    if (pathParts[0] === 'hymns' && pathParts[1]) {
      const hymnNumber = pathParts[1];
      // Navigate to hymn detail
      this.router.navigate(['/tabs/hymns', hymnNumber], {
        replaceUrl: true
      });
    }
  }

  private handleCustomSchemeDeepLink(urlObj: URL) {
    const pathParts = urlObj.pathname.split('/').filter(p => p);
    
    if (pathParts[0] === 'hymns' && pathParts[1]) {
      const hymnNumber = pathParts[1];
      this.router.navigate(['/tabs/hymns', hymnNumber], {
        replaceUrl: true
      });
    }
  }

  private handleManualUrlParsing(url: string) {
    // Fallback: try to extract hymn number from URL string
    const hymnMatch = url.match(/\/hymns\/(\d+)/);
    if (hymnMatch && hymnMatch[1]) {
      const hymnNumber = hymnMatch[1];
      this.router.navigate(['/tabs/hymns', hymnNumber], {
        replaceUrl: true
      });
    }
  }
}
