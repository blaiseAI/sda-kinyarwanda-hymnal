import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Hymn } from 'src/app/models/hymn';
import { FeedbackModalPage } from 'src/app/pages/feedback-modal/feedback-modal.page';

@Component({
  selector: 'app-hymn-options-sheet',
  templateUrl: './hymn-options-sheet.component.html',
  styleUrls: ['./hymn-options-sheet.component.scss'],
})
export class HymnOptionsSheetComponent implements OnInit {
  @Input() hymn!: Hymn;

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  closeModal() {
    this.modalController.dismiss();
  }

  shareHymn() {
    // Implement the share functionality
    this.modalController.dismiss();
  }

  addToFavorites() {
    // Implement the add to favorites functionality
    this.modalController.dismiss();
  }

  async openFeedbackModal() {
    const modal = await this.modalController.create({
      component: FeedbackModalPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        hymnNumber: this.hymn.hymnNumber,
        hymnTitle: this.hymn.hymnTitle,
      },
      swipeToClose: true, // add this option to enable swipe to dismiss
    });
    await modal.present();
    await modal.onDidDismiss();
    this.modalController.dismiss();
  }
}
