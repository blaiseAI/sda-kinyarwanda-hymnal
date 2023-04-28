import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Hymn } from 'src/app/models/hymn';
import { HymnService } from 'src/app/services/hymn.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { FavouriteModalPage } from '../favourite-modal/favourite-modal.page';
import { FeedbackModalPage } from '../feedback-modal/feedback-modal.page';
import { Location } from '@angular/common';
import { Share } from '@capacitor/share';
import { HymnOptionsComponent } from 'src/app/components/hymn-options/hymn-options.component';

@Component({
  selector: 'app-favourite-hymn-detail',
  templateUrl: './favourite-hymn-detail.page.html',
  styleUrls: ['./favourite-hymn-detail.page.scss'],
})
export class FavouriteHymnDetailPage implements OnInit {
  hymn: Hymn = {
    hymnNumber: 0,
    hymnTitle: '',
    verses: [],
  };

  constructor(
    private route: ActivatedRoute,
    private hymnService: HymnService,
    private modalController: ModalController,
    public location: Location,
    private popoverController: PopoverController
  ) {}

  ngOnInit() {
    const hymnNumber = this.route.snapshot.paramMap.get('hymnNumber');

    const id = typeof hymnNumber === 'string' ? parseInt(hymnNumber, 10) : 0;

    this.hymnService.getHymn(id).subscribe((hymn) => {
      this.hymn = hymn;
    });
  }
  // addToFavorites() {
  //   this.presentModal();
  // }
  // async presentModal() {
  //   const modal = await this.modalController.create({
  //     component: FavouriteModalPage,
  //     cssClass: 'my-custom-modal-css', // you can add your own CSS class
  //     componentProps: {
  //       hymnNumber: this.hymn.hymnNumber,
  //       hymnTitle: this.hymn.hymnTitle,
  //     },
  //   });
  //   return await modal.present();
  // }
  // async openFeedbackModal() {
  //   const modal = await this.modalController.create({
  //     component: FeedbackModalPage,
  //     cssClass: 'my-custom-modal-css',
  //     componentProps: {
  //       hymnNumber: this.hymn.hymnNumber,
  //       hymnTitle: this.hymn.hymnTitle,
  //     },
  //   });
  //   return await modal.present();
  // }
  async openAddToFavoriteModal() {
    const modal = await this.modalController.create({
      component: FavouriteModalPage,
      cssClass: 'my-custom-modal-css', // you can add your own CSS class
      componentProps: {
        hymnNumber: this.hymn.hymnNumber,
        hymnTitle: this.hymn.hymnTitle,
      },
      swipeToClose: true, // add this option to enable swipe to dismiss
    });
    return await modal.present();
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
    return await modal.present();
  }
  // share Hymn
  async shareHymn() {
    const shareRet = await Share.share({
      title: `SDA Kinyarwanda Hymnal App: ${this.hymn.hymnNumber} - ${this.hymn.hymnTitle}`,
      text: `Check out this hymn: ${this.hymn.hymnNumber} - ${this.hymn.hymnTitle}`,
      url: 'https://sda-kinyarwanda-hymnal.surge.sh/',
      dialogTitle: 'Share Hymn',
    });
    console.log('Share Return:', shareRet);
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: HymnOptionsComponent,
      cssClass: 'hymn-options-popover',
      event: ev,
      translucent: true,
      componentProps: {
        hymn: this.hymn,
        options: {
          shareHymn: this.shareHymn.bind(this),
          addToFavorites: this.openAddToFavoriteModal.bind(this),
          openFeedbackModal: this.openFeedbackModal.bind(this),
        },
      },
    });

    return await popover.present();
  }
}
