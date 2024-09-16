import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  audioPlayer!: HTMLAudioElement;
  audioUrl!: string;
  audioError: boolean = false;
  audioProgress!: number;
  hymn: Hymn = {
    hymnNumber: 0,
    hymnTitle: '',
    verses: [],
  };
  showHymnOptions = false;
  recentlyViewedHymns: Hymn[] = [];
  recentlyViewedHymnsSubscription!: Subscription;
  showNavigationButtons: boolean = true;
  showPreviousButton: boolean = true;
  showNextButton: boolean = true;
  lastScrollTop: number = 0;
  private scrollTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private hymnService: HymnService,
    private modalController: ModalController,
    private popoverController: PopoverController,
    public readonly ionRouterOutlet: IonRouterOutlet,
    private sanitizer: DomSanitizer,
    private platform: Platform,
    private router: Router
  ) {}

  ngOnInit() {
    const hymnNumber = this.route.snapshot.paramMap.get('hymnNumber');
    const id = typeof hymnNumber === 'string' ? parseInt(hymnNumber, 10) : 0;

    this.checkUrlAndSetVisibility();
    //this.setNavigationButtonVisibility();

    this.hymnService.getHymn(id).subscribe((hymn) => {
      this.hymn = hymn;
      this.setNavigationButtonVisibility(); // Update navigation button visibility based on the fetched hymn
      // console.log(this.hymn);
      // add hymn to recently viewed
      this.hymnService.addToRecentlyViewed(this.hymn);
      // Check audio availability and set audioUrl if available
      if (hymnNumber) {
        this.audioUrl = `https://bibiliya.com/bibiliya-media/hymns-audio/guhimbaza/${hymnNumber.padStart(
          3,
          '0'
        )}.mp3`;
        // Attempt to fetch the audio to check availability
        const audioElement = new Audio(this.audioUrl);
        audioElement.addEventListener('error', () => {
          this.audioError = true;
        });
      }
    });

    // Get recently viewed hymns
    this.recentlyViewedHymnsSubscription =
      this.hymnService.recentlyViewedHymns.subscribe((hymns) => {
        this.recentlyViewedHymns = hymns;
      });
    this.audioProgress = 0;
  }
  playAudio() {
    if (!this.audioPlayer) {
      this.audioPlayer = this.audioPlayerRef.nativeElement;
    }
    if (this.audioPlayer.paused) {
      if (this.audioPlayer.src !== this.audioUrl) {
        this.audioPlayer.src = this.audioUrl;
      }
      this.audioPlayer.play();
    } else {
      this.audioPlayer.pause();
    }
  }

  onAudioEnded() {
    this.audioPlayer.currentTime = 0;
    this.audioProgress = 0;
  }

  onAudioTimeUpdate() {
    if (this.audioPlayer) {
      const currentTime = this.audioPlayer.currentTime;
      const duration = this.audioPlayer.duration;
      if (duration) {
        this.audioProgress = (currentTime / duration) * 100;
      }
    }
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
      return this.sanitizer.bypassSecurityTrustStyle(
        `url(${currentHymn.image})`
      );
    } else {
      const images = [];

      for (let i = 1; i <= 21; i++) {
        const imageName = `image${i}.jpg`;
        images.push(imageName);
      }
      const randomIndex = Math.floor(Math.random() * images.length);
      return this.sanitizer.bypassSecurityTrustStyle(
        `url(assets/images/${images[randomIndex]})`
      );
    }
  }
  // Hide or show the navigation buttons based on the scroll event
  onScroll(event: any) {
    // Clear the previous timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Hide buttons immediately when scrolling
    this.showNavigationButtons = false;

    // Set a timeout to show buttons after scrolling stops
    this.scrollTimeout = setTimeout(() => {
      this.showNavigationButtons = true;
    }, 500); // Adjust this value as needed

    // Show buttons when reaching the bottom
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      this.showNavigationButtons = true;
    }
  }

  // Navigate to the previous hymn
navigateToPreviousHymn() {
  const previousHymnNumber = this.hymn.hymnNumber - 1;
  if (previousHymnNumber >= 1) {
    this.navigateToHymn(previousHymnNumber);
  }
}

// Navigate to the next hymn
navigateToNextHymn() {
  const nextHymnNumber = this.hymn.hymnNumber + 1;
  // You can add logic to limit the maximum hymn number if needed.
  this.navigateToHymn(nextHymnNumber);
}

// Helper method to navigate to a specific hymn
navigateToHymn(hymnNumber: number) {
  // Navigate to the HymnDetailPage for the specified hymn number
  this.router.navigate(['/tabs/hymns', hymnNumber]);
}

checkUrlAndSetVisibility() {
  // Get the current URL
  const currentUrl = this.router.url;
  // Check if it matches the condition
  this.showNavigationButtons = !currentUrl.startsWith('/tabs/favorites/');
}
setNavigationButtonVisibility() {
    this.showPreviousButton = this.hymn.hymnNumber > 1;
    this.showNextButton = this.hymn.hymnNumber < 350;
  }


}
