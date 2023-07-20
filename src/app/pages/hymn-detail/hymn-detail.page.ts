import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Hymn } from 'src/app/models/hymn';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { HymnService } from 'src/app/services/hymn.service';
import { Platform } from '@ionic/angular';

import {
  IonRouterOutlet,
  ModalController,
  PopoverController,
} from '@ionic/angular';
import { FavouriteModalPage } from '../favourite-modal/favourite-modal.page';
import { FeedbackModalPage } from '../feedback-modal/feedback-modal.page';
import { HymnOptionsComponent } from 'src/app/components/hymn-options/hymn-options.component';
import { Subscription } from 'rxjs';

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
  recentlyViewedHymns: Hymn[] = [];
  recentlyViewedHymnsSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private hymnService: HymnService,
    private modalController: ModalController,
    private popoverController: PopoverController,
    public readonly ionRouterOutlet: IonRouterOutlet,
    private sanitizer: DomSanitizer,
    private platform: Platform
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

    // Get recently viewed hymns
    this.recentlyViewedHymnsSubscription =
      this.hymnService.recentlyViewedHymns.subscribe((hymns) => {
        this.recentlyViewedHymns = hymns;
      }
    );
    
  }
  async openAddToFavoriteModal() {
    this.playHapticFeedback();
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
    this.playHapticFeedback();
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
    this.playHapticFeedback();
    const shareRet = await Share.share({
      title: `SDA Kinyarwanda Hymnal App: ${this.hymn.hymnNumber} - ${this.hymn.hymnTitle}`,
      text: `Check out this hymn: ${this.hymn.hymnNumber} - ${this.hymn.hymnTitle}`,
      url: 'https://sda-kinyarwanda-hymnal.vercel.app/',
      dialogTitle: 'Share Hymn',
    });
    console.log('Share Return:', shareRet);
  }

  async presentPopover(ev: any) {
    this.playHapticFeedback();
    const popover = await this.popoverController.create({
      component: HymnOptionsComponent,
      cssClass: 'hymn-options-popover',
      event: ev,
      translucent: true,
      componentProps: {
        hymn: this.hymn,
        options: {
          shareHymn: this.shareHymn.bind(this),
          // addToFavorites: this.openAddToFavoriteModal.bind(this), // Removed this line because I don't want to add to favorites from the popover
          openFeedbackModal: this.openFeedbackModal.bind(this),
        },
      },
    });

    return await popover.present();
  }
  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.recentlyViewedHymnsSubscription.unsubscribe();
  }
  // Filter the recently viewed hymns to get the current hymn image 
  getBackgroundImageUrl(hymnNumber: number): SafeStyle {
  const currentHymn = this.recentlyViewedHymns.find(
    (hymn) => hymn.hymnNumber === hymnNumber
  );
  if (currentHymn && currentHymn.image) {
    return this.sanitizer.bypassSecurityTrustStyle(`url(${currentHymn.image})`);
  } else {
    const images = ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image5.jpg', 'image6.jpg', 'image7.jpg', 'image8.jpg'];
    const randomIndex = Math.floor(Math.random() * images.length);
    return this.sanitizer.bypassSecurityTrustStyle(
      `url(assets/images/${images[randomIndex]})`
    );
  }
}
}
