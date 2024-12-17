import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Hymn } from 'src/app/models/hymn';
import { HymnService } from 'src/app/services/hymn.service';
import { IonRouterOutlet, ModalController, Platform, PopoverController } from '@ionic/angular';
import { FavouriteModalPage } from '../favourite-modal/favourite-modal.page';
import { FeedbackModalPage } from '../feedback-modal/feedback-modal.page';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { HymnOptionsComponent } from 'src/app/components/hymn-options/hymn-options.component';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-favourite-hymn-detail',
  templateUrl: './favourite-hymn-detail.page.html',
  styleUrls: ['./favourite-hymn-detail.page.scss'],
})
export class FavouriteHymnDetailPage implements OnInit {
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  audioPlayer!: HTMLAudioElement;
  audioUrl!: string;
  audioError: boolean = false;
  audioProgress!: number;
  hymn: Hymn = {
    number: '0',
    title: {
      kinyarwanda: '',
      english: ''
    },
    verses: {
      count: 0,
      text: [],
      chorus: null
    }
  };
  showHymnOptions = false;
  recentlyViewedHymns: Hymn[] = [];
  recentlyViewedHymnsSubscription!: Subscription;
  showNavigationButtons: boolean = true;
  showPreviousButton: boolean = true;
  showNextButton: boolean = true;
  lastScrollTop: number = 0;
  private scrollTimeout: any;
  private backgroundImage: SafeStyle | null = null;

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
    if (hymnNumber) {
      this.checkUrlAndSetVisibility();
      this.setNavigationButtonVisibility();
      this.backgroundImage = null;

      this.hymnService.getHymn(hymnNumber).subscribe((hymn) => {
        if (hymn) {
          this.hymn = hymn;
          this.hymnService.addToRecentlyViewed(this.hymn);
          this.setupAudio(hymnNumber);
        }
      });
    }

    this.recentlyViewedHymnsSubscription = this.hymnService.recentlyViewedHymns.subscribe((hymns) => {
      this.recentlyViewedHymns = hymns;
    });
  }

  setupAudio(hymnNumber: string) {
    this.audioUrl = `https://bibiliya.com/bibiliya-media/hymns-audio/guhimbaza/${hymnNumber.padStart(3, '0')}.mp3`;
    const audioElement = new Audio(this.audioUrl);
    audioElement.addEventListener('error', () => {
      this.audioError = true;
    });
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
      cssClass: 'my-custom-modal-css',
      componentProps: {
        hymnNumber: this.hymn.number,
        hymnTitle: this.hymn.title.kinyarwanda,
      },
      swipeToClose: true,
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
        hymnNumber: this.hymn.number,
        hymnTitle: this.hymn.title.kinyarwanda,
      },
      swipeToClose: true,
    });
    return await modal.present();
  }

  async shareHymn() {
    this.playHapticFeedback();
    const shareRet = await Share.share({
      title: `SDA Kinyarwanda Hymnal App: ${this.hymn.number} - ${this.hymn.title.kinyarwanda}`,
      text: `Check out this hymn: ${this.hymn.number} - ${this.hymn.title.kinyarwanda}`,
      url: 'https://sda-kinyarwanda-hymnal.vercel.app/',
      dialogTitle: 'Share Hymn',
    });
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
          openFeedbackModal: this.openFeedbackModal.bind(this),
        },
      },
    });
    return await popover.present();
  }

  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }

  getBackgroundImageUrl(hymnNumber: string): SafeStyle {
    if (this.backgroundImage) {
      return this.backgroundImage;
    }

    const currentHymn = this.recentlyViewedHymns.find(
      (hymn) => hymn.number === hymnNumber
    );

    if (currentHymn?.image) {
      this.backgroundImage = this.sanitizer.bypassSecurityTrustStyle(`url(${currentHymn.image})`);
    } else {
      const images = [];
      for (let i = 1; i <= 21; i++) {
        const imageName = `image${i}.jpg`;
        images.push(imageName);
      }
      const randomIndex = Math.floor(Math.random() * images.length);
      this.backgroundImage = this.sanitizer.bypassSecurityTrustStyle(
        `url(assets/images/${images[randomIndex]})`
      );
    }
    return this.backgroundImage;
  }

  navigateToPreviousHymn() {
    const currentNumber = parseInt(this.hymn.number, 10);
    const previousHymnNumber = currentNumber - 1;
    if (previousHymnNumber >= 1) {
      this.navigateToHymn(previousHymnNumber.toString());
    }
  }

  navigateToNextHymn() {
    const currentNumber = parseInt(this.hymn.number, 10);
    const nextHymnNumber = currentNumber + 1;
    if (nextHymnNumber <= 350) {
      this.navigateToHymn(nextHymnNumber.toString());
    }
  }

  navigateToHymn(hymnNumber: string) {
    this.backgroundImage = null;
    this.router.navigate(['/tabs/hymns', hymnNumber]);
  }

  checkUrlAndSetVisibility() {
    const currentUrl = this.router.url;
    this.showNavigationButtons = !currentUrl.startsWith('/tabs/favorites/');
  }

  setNavigationButtonVisibility() {
    const currentNumber = parseInt(this.hymn.number, 10);
    this.showPreviousButton = currentNumber > 1;
    this.showNextButton = currentNumber < 350;
  }

  onScroll(event: any) {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.showNavigationButtons = false;

    this.scrollTimeout = setTimeout(() => {
      this.showNavigationButtons = true;
    }, 500);

    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      this.showNavigationButtons = true;
    }
  }

  ngOnDestroy() {
    this.recentlyViewedHymnsSubscription.unsubscribe();
    this.backgroundImage = null;
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }
}