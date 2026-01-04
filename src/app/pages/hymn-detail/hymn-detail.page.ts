import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, PopoverController, Platform, ModalController, LoadingController, IonRouterOutlet } from '@ionic/angular';
import { HymnService } from '../../services/hymn.service';
import { Hymn } from '../../models/hymn';
import { HymnOptionsSheetComponent } from '../../components/hymn-options-sheet/hymn-options-sheet.component';
import { FavouriteModalPage } from '../favourite-modal/favourite-modal.page';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Storage } from '@ionic/storage-angular';


@Component({
  selector: 'app-hymn-detail',
  templateUrl: './hymn-detail.page.html',
  styleUrls: ['./hymn-detail.page.scss'],
})
export class HymnDetailPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  
  hymn: Hymn | null = null;
  audioUrl: string = '';
  audioError = false;
  audioProgress = 0;
  audioPlayer: HTMLAudioElement | null = null;
  currentLoop = 0;
  maxLoops = 0;
  isLooping = false;
  showPreviousButton = true;
  showNextButton = true;
  showEnglishTitles = false;
  isLoading = true;
  error: string | null = null;
  totalHymns = 500;
  private headerHeight: number = 0;
  private parallaxImage: HTMLElement | null = null;
  private hymnSubscription?: Subscription;
  private lastScrollPosition: number = 0;
  fontSize = 16; // Default font size in pixels


  get isAudioPaused(): boolean {
    return !this.audioPlayer || this.audioPlayer.paused;
  }

  constructor(
    private route: ActivatedRoute,
    private hymnService: HymnService,
    private popoverController: PopoverController,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private platform: Platform,
    private storage: Storage,
    public readonly ionRouterOutlet: IonRouterOutlet
  ) {
    this.initStorage();
  }

  private async initStorage() {
    await this.storage.create();
    await this.loadStoredSettings();
  }

  private async loadStoredSettings() {
    const savedFontSize = await this.storage.get('fontSize');
    if (savedFontSize) {
      this.fontSize = savedFontSize;
      this.updateFontSize();
    }
    
    const showEnglishTitles = await this.storage.get('showEnglishTitles');
    this.showEnglishTitles = showEnglishTitles === 'true';
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const element = document.querySelector('.parallax-image');
      if (element instanceof HTMLElement) {
        this.parallaxImage = element;
        this.headerHeight = element.clientHeight;
        
        this.content.scrollEvents = true;
        this.content.ionScroll.subscribe(event => this.handleScroll(event));
      }
    }, 500);
  }

  private handleScroll(event: any) {
    if (!this.parallaxImage) return;
    
    const scrollTop = event.detail.scrollTop;
    this.lastScrollPosition = scrollTop;
    
    const newPosition = scrollTop * 0.5;
    const opacity = 1 - (scrollTop / this.headerHeight);
    
    this.parallaxImage.style.transform = `translate3d(0, ${newPosition}px, 0)`;
    this.parallaxImage.style.opacity = opacity.toString();
  }

  private saveScrollPosition() {
    this.content.getScrollElement().then(element => {
      this.lastScrollPosition = element.scrollTop;
    });
  }

  private restoreScrollPosition() {
    setTimeout(() => {
      this.content.scrollToPoint(0, this.lastScrollPosition, 0);
    }, 100);
  }

  ionViewDidEnter() {
    this.restoreScrollPosition();
  }

  ionViewWillLeave() {
    this.saveScrollPosition();
  }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Loading hymn...',
      spinner: 'crescent'
    });
    await loading.present();
  
    try {
      const hymnNumber = this.route.snapshot.paramMap.get('hymnNumber');
      if (!hymnNumber) {
        throw new Error('No hymn number provided');
      }
  
      await this.loadHymn(hymnNumber);
    } catch (err) {
      console.error('Error loading hymn:', err);
      this.error = 'Failed to load hymn';
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  private async loadHymn(hymnNumber: string): Promise<void> {
    this.hymnSubscription?.unsubscribe();
    
    return new Promise((resolve, reject) => {
      this.hymnSubscription = this.hymnService.getHymn(hymnNumber)
        .pipe(take(1))
        .subscribe({
          next: (hymn) => {
            if (hymn) {
              this.hymn = hymn;
              if (!hymn.image) {
                this.hymnService.addToRecentlyViewed(hymn);
              }
              this.setupAudio(hymnNumber);
              this.updateNavigationButtons(hymnNumber);
              resolve();
            } else {
              reject(new Error('Hymn not found'));
            }
          },
          error: (error) => {
            console.error('Error loading hymn:', error);
            reject(error);
          }
        });
    });
  }

  setupAudio(hymnNumber: string | null) {
    if (hymnNumber && this.hymn) {
      this.audioUrl = `${this.hymnService.baseUrl}${hymnNumber.padStart(3, '0')}.mp3`;
      const audioElement = new Audio(this.audioUrl);
      audioElement.addEventListener('error', () => {
        this.audioError = true;
      });
      
      this.currentLoop = 0;
      this.maxLoops = this.hymn.verses ? this.hymn.verses.count : 0;
      this.isLooping = false;
    }
  }

  ngOnDestroy() {
    // Clean up audio
    if (this.audioPlayer) {
      this.isLooping = false;
      this.audioPlayer.pause();
      this.audioPlayer.src = '';
    }

    // Clean up subscriptions
    this.hymnSubscription?.unsubscribe();

    // Save final settings to storage
    this.saveSettings();
  }

  private async saveSettings() {
    try {
      await this.storage.set('fontSize', this.fontSize);
      await this.storage.set('showEnglishTitles', this.showEnglishTitles.toString());
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  getBackgroundImageUrl(hymnNumber: string): string {
    if (this.hymn?.image) {
      return `url('${this.hymn.image}')`;
    }
    return `url('/assets/images/default-hymn-bg.jpg')`;
  }

  private updateNavigationButtons(currentNumber: string) {
    const num = parseInt(currentNumber, 10);
    this.showPreviousButton = num > 1;
    this.showNextButton = num < this.totalHymns;
  }

  playAudio() {
    if (!this.audioPlayer) {
      this.audioPlayer = this.audioPlayerRef.nativeElement;
      this.audioPlayer.addEventListener('ended', () => this.handleAudioEnded());
    }

    if (this.audioPlayer.paused) {
      if (this.audioPlayer.src !== this.audioUrl) {
        this.audioPlayer.src = this.audioUrl;
        this.currentLoop = 0;
      }
      this.isLooping = true;
      this.audioPlayer.play().catch(error => {
        console.error('Audio playback error:', error);
        this.audioError = true;
      });
    } else {
      this.isLooping = false;
      this.audioPlayer.pause();
    }
  }

  handleAudioEnded() {
    if (!this.audioPlayer || !this.isLooping) return;

    this.currentLoop++;
    if (this.currentLoop < this.maxLoops) {
      this.audioPlayer.currentTime = 0;
      this.audioPlayer.play().catch(error => {
        console.error('Audio loop playback error:', error);
        this.audioError = true;
        this.isLooping = false;
      });
    } else {
      this.currentLoop = 0;
      this.isLooping = false;
      this.audioPlayer.currentTime = 0;
    }
  }

  onAudioEnded() {
    if (!this.isLooping) {
      this.audioProgress = 0;
      this.currentLoop = 0;
    }
  }

  onAudioTimeUpdate() {
    const audio = this.audioPlayer;
    if (audio) {
      this.audioProgress = (audio.currentTime / audio.duration) * 100;
    }
  }

  async shareHymn() {
    if (!this.hymn) return;

    await this.playHapticFeedback();
    await Share.share({
      title: `SDA Kinyarwanda Hymnal App: ${this.hymn.number} - ${this.hymn.title.kinyarwanda}`,
      text: `Check out this hymn: ${this.hymn.number} - ${this.hymn.title.kinyarwanda}`,
      url: 'https://sda-kinyarwanda-hymnal.vercel.app/',
      dialogTitle: 'Share Hymn',
    });
  }

  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }

  async presentPopover(event: MouseEvent) {
    if (!this.hymn) return;
    
    await this.playHapticFeedback();
    const popover = await this.popoverController.create({
      component: HymnOptionsSheetComponent,
      event: event,
      componentProps: {
        hymn: this.hymn,
        options: {
          shareHymn: () => this.shareHymn()
        }
      },
      translucent: true
    });
    return await popover.present();
  }

  async openAddToFavoriteModal() {
    if (!this.hymn) return;
    
    await this.playHapticFeedback();
    const modal = await this.modalController.create({
      component: FavouriteModalPage,
      componentProps: {
        hymnNumber: this.hymn.number,
        hymnTitle: this.hymn.title.kinyarwanda
      },
      breakpoints: [0, 0.5, 0.75, 1],
      initialBreakpoint: 0.75,
      backdropDismiss: true,
      showBackdrop: true,
      cssClass: 'auto-height'
    });
    return await modal.present();
  }

  navigateToPreviousHymn() {
    if (this.showPreviousButton && this.hymn) {
      const prevNumber = (parseInt(this.hymn.number, 10) - 1).toString().padStart(1, '0');
      this.navigateToHymn(prevNumber);
    }
  }

  navigateToNextHymn() {
    if (this.showNextButton && this.hymn) {
      const nextNumber = (parseInt(this.hymn.number, 10) + 1).toString().padStart(1, '0');
      this.navigateToHymn(nextNumber);
    }
  }

  async increaseFontSize() {
    this.fontSize = Math.min(24, this.fontSize + 2); // Limit max font size
    await this.updateFontSize();
  }

  async decreaseFontSize() {
    this.fontSize = Math.max(12, this.fontSize - 2); // Limit min font size
    await this.updateFontSize();
  }

  async resetFontSize() {
    this.fontSize = 16; // Default font size
    await this.updateFontSize();
  }

  async updateFontSize() {
    try {
      // Save the font size to Ionic Storage
      await this.storage.set('fontSize', this.fontSize);
      
      // Update font size for verses
      const verses = document.querySelectorAll('.verse-text');
      verses.forEach((verse: Element) => {
        const htmlVerse = verse as HTMLElement;
        htmlVerse.style.fontSize = `${this.fontSize}px`;
      });
    
      // Update font size for chorus
      const chorusTexts = document.querySelectorAll('.chorus-text');
      chorusTexts.forEach((chorus: Element) => {
        const htmlChorus = chorus as HTMLElement;
        htmlChorus.style.fontSize = `${this.fontSize}px`;
      });
    } catch (error) {
      console.error('Error updating font size:', error);
    }
  }

  private async navigateToHymn(hymnNumber: string) {
    const loading = await this.loadingController.create({
      message: 'Loading hymn...',
      spinner: 'crescent',
      duration: 2000
    });
    await loading.present();

    try {
      if (this.audioPlayer) {
        this.isLooping = false;
        this.currentLoop = 0;
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
        this.audioPlayer.src = '';
      }
      this.content.scrollToTop(300);
      
      await this.loadHymn(hymnNumber);
      this.audioProgress = 0;
      this.audioError = false;
      
      const url = `/tabs/hymns/${hymnNumber}`;
      window.history.replaceState({}, '', url);
    } catch (error) {
      console.error('Error navigating to hymn:', error);
    } finally {
      await loading.dismiss();
    }
  }
}