import { Component, OnInit } from '@angular/core';
import { AppUpdate, AppUpdateAvailability } from '@capawesome/capacitor-app-update';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
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
    private themeService: ThemeService  // Theme service will auto-initialize
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    // Implementation of OnInit interface
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
}
