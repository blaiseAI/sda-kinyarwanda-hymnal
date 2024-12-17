import { Component, Input } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { Hymn } from 'src/app/models/hymn';
import { FeedbackModalPage } from 'src/app/pages/feedback-modal/feedback-modal.page';

export interface HymnOptions {
  shareHymn: () => Promise<void>;
}

@Component({
  selector: 'app-hymn-options-sheet',
  templateUrl: './hymn-options-sheet.component.html',
  styleUrls: ['./hymn-options-sheet.component.scss'],
})
export class HymnOptionsSheetComponent {
  @Input() hymn!: Hymn;
  @Input() options?: HymnOptions;

  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController
  ) {}

  async shareHymn() {
    try {
      if (this.options?.shareHymn) {
        await this.options.shareHymn();
      }
      await this.close();
    } catch (error) {
      console.error('Error sharing hymn:', error);
    }
  }

  async openFeedbackModal() {
    try {
      const modal = await this.modalController.create({
        component: FeedbackModalPage,
        cssClass: 'my-custom-modal-css',
        componentProps: {
          hymnNumber: this.hymn.number,
          hymnTitle: this.hymn.title.kinyarwanda,
        },
        swipeToClose: true,
      });
      await modal.present();
      await modal.onDidDismiss();
      await this.close();
    } catch (error) {
      console.error('Error opening feedback modal:', error);
    }
  }

  async close() {
    // Try both dismiss methods since we don't know if this is a modal or popover
    try {
      await this.popoverController.dismiss();
    } catch (error) {
      try {
        await this.modalController.dismiss();
      } catch (error) {
        console.error('Error closing component:', error);
      }
    }
  }
}