import { Component } from '@angular/core';
import { AppUpdate, AppUpdateAvailability } from '@capawesome/capacitor-app-update';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private alertController: AlertController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.getCurrentAppVersion();
      this.checkForUpdate();
    });
  }
  
  getCurrentAppVersion = async () => {
    const result = await AppUpdate.getAppUpdateInfo();
    console.log('Current app version:', result.currentVersion);
  };
  async simulateCheckForUpdate() {
    return {
      updateAvailability: AppUpdateAvailability.UPDATE_AVAILABLE,
      immediateUpdateAllowed: true,
      flexibleUpdateAllowed: true,
      currentVersion: '1.0.0',
      availableVersion: '2.0.0'
    };
  }
  

  async checkForUpdate() {
    const result = await AppUpdate.getAppUpdateInfo();
    //const result = await this.simulateCheckForUpdate(); // for testing
    console.log('Update available:', result.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE);

    if (result.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE) {
      if (this.platform.is('android')) {
        if (result.immediateUpdateAllowed) {
          await AppUpdate.performImmediateUpdate();
        } else if (result.flexibleUpdateAllowed) {
          await AppUpdate.startFlexibleUpdate();
          AppUpdate.addListener('onFlexibleUpdateStateChange', async () => {
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
          });
        } else {
          // Handle the case where an update is not allowed
        }
      } else if (this.platform.is('ios')) {
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
      }
    }
  }
}
