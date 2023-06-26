import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Share } from '@capacitor/share';
import { TextZoom, SetOptions, GetResult } from '@capacitor/text-zoom';
import { Hymn } from 'src/app/models/hymn';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { HymnService } from 'src/app/services/hymn.service';
import {
  IonRouterOutlet,
  ModalController,
  PopoverController,
} from '@ionic/angular';
import { FavouriteModalPage } from '../favourite-modal/favourite-modal.page';
import { FeedbackModalPage } from '../feedback-modal/feedback-modal.page';
import { HymnOptionsComponent } from 'src/app/components/hymn-options/hymn-options.component';

@Component({
  selector: 'app-hymn-detail',
  templateUrl: './hymn-detail.page.html',
  styleUrls: ['./hymn-detail.page.scss'],
})
export class HymnDetailPage implements OnInit {
  hymn: Hymn = {
    hymnNumber: 0,
    hymnTitle: '',
    verses: [],
  };
  showHymnOptions = false;

  constructor(
    private route: ActivatedRoute,
    private hymnService: HymnService,
    private modalController: ModalController,
    private popoverController: PopoverController,
    public readonly ionRouterOutlet: IonRouterOutlet,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const hymnNumber = this.route.snapshot.paramMap.get('hymnNumber');
    const id = typeof hymnNumber === 'string' ? parseInt(hymnNumber, 10) : 0;

    this.hymnService.getHymn(id).subscribe((hymn) => {
      this.hymn = hymn;
      // console.log(this.hymn);
      // add hymn to recently viewed
      this.hymnService.addToRecentlyViewed(this.hymn);
    });
  }
  async openAddToFavoriteModal() {
    const modal = await this.modalController.create({
      component: FavouriteModalPage,
      presentingElement: this.ionRouterOutlet.nativeEl,
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
      presentingElement: this.ionRouterOutlet.nativeEl,
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
  getBackgroundImageUrl(hymnNumber: number): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(
      `url('https://source.unsplash.com/random/900x700/?nature,${hymnNumber}')`
    );
  }
}
