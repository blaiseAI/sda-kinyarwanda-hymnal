import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, PopoverController, Platform, ModalController, LoadingController, IonRouterOutlet, GestureController, AlertController, ToastController } from '@ionic/angular';
import { HymnService } from '../../services/hymn.service';
import { Hymn } from '../../models/hymn';
import { HymnOptionsSheetComponent } from '../../components/hymn-options-sheet/hymn-options-sheet.component';
import { FavouriteModalPage } from '../favourite-modal/favourite-modal.page';
import { FavouriteService } from '../../services/favourite.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Storage } from '@ionic/storage-angular';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LanguageService } from '../../services/language.service';


@Component({
  selector: 'app-hymn-detail',
  templateUrl: './hymn-detail.page.html',
  styleUrls: ['./hymn-detail.page.scss'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('200ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
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
  audioDuration = '0:00';
  audioCurrentTime = '0:00';
  showContent = false; // For fade-in animation
  showAudioPlayer = false; // Toggle audio player visibility
  showPreviousButton = true;
  showNextButton = true;
  showEnglishTitles = false;
  isLoading = true;
  error: string | null = null;
  totalHymns = 500;
  private headerHeight: number = 0;
  private parallaxImage: HTMLElement | null = null;
  private hymnSubscription?: Subscription;
  private languageSubscription?: Subscription;
  private lastScrollPosition: number = 0;
  fontSize = 16; // Default font size in pixels
  isHymnFavorited = false; // Track if current hymn is in any favorites
  private gesture?: any;


  get isAudioPaused(): boolean {
    return !this.audioPlayer || this.audioPlayer.paused;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hymnService: HymnService,
    private popoverController: PopoverController,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private platform: Platform,
    private storage: Storage,
    private favouriteService: FavouriteService,
    private gestureCtrl: GestureController,
    private alertController: AlertController,
    private toastController: ToastController,
    public readonly ionRouterOutlet: IonRouterOutlet,
    private languageService: LanguageService
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
    
    // Subscribe to language preference changes
    this.languageSubscription = this.languageService.showEnglishTitles$.subscribe(
      (showEnglish) => {
        this.showEnglishTitles = showEnglish;
      }
    );
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
      
      // Set up swipe gestures
      this.setupSwipeGestures();
    }, 500);
  }

  private async setupSwipeGestures() {
    const contentElement = await this.content.getScrollElement();
    
    this.gesture = this.gestureCtrl.create({
      el: contentElement,
      gestureName: 'swipe',
      direction: 'x',
      threshold: 20,
      onEnd: (detail) => {
        const deltaX = detail.deltaX;
        const velocityX = detail.velocityX;
        
        // Swipe right (previous hymn)
        if (deltaX > 50 || velocityX > 0.3) {
          this.navigateToPreviousHymn();
        }
        // Swipe left (next hymn)
        else if (deltaX < -50 || velocityX < -0.3) {
          this.navigateToNextHymn();
        }
      }
    });
    
    this.gesture.enable();
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
    this.showContent = false; // Fade out current content
    
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
              this.checkIfHymnIsFavorited(hymnNumber);
              
              // Trigger fade-in animation after a brief delay
              setTimeout(() => {
                this.showContent = true;
              }, 100);
              
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

  private async checkIfHymnIsFavorited(hymnNumber: string): Promise<void> {
    this.favouriteService.getFavourites()
      .pipe(take(1))
      .subscribe(favourites => {
        this.isHymnFavorited = favourites.some(fav => 
          fav.hymnIds.includes(hymnNumber)
        );
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
    this.languageSubscription?.unsubscribe();

    // Clean up gesture
    if (this.gesture) {
      this.gesture.destroy();
    }

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
      this.audioCurrentTime = this.formatTime(audio.currentTime);
      if (!isNaN(audio.duration)) {
        this.audioDuration = this.formatTime(audio.duration);
      }
    }
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds === 0) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  restartAudio() {
    if (this.audioPlayer) {
      this.audioPlayer.currentTime = 0;
      this.currentLoop = 0;
      if (this.audioPlayer.paused) {
        this.isLooping = true;
        this.audioPlayer.play().catch(error => {
          console.error('Audio playback error:', error);
          this.audioError = true;
        });
      }
    }
    this.playHapticFeedback();
  }

  toggleAudioPlayer() {
    this.showAudioPlayer = !this.showAudioPlayer;
    this.playHapticFeedback();
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

  async toggleFavorite() {
    if (!this.hymn) return;
    
    await this.playHapticFeedback();
    
    if (this.isHymnFavorited) {
      // Hymn is already favorited, so remove it
      await this.removeFromFavorites();
    } else {
      // Hymn is not favorited, so open modal to add it
      await this.openAddToFavoriteModal();
    }
  }

  private async openAddToFavoriteModal() {
    if (!this.hymn) return;
    
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
    
    await modal.present();
    
    // Update favorite status after modal is dismissed
    const { data } = await modal.onWillDismiss();
    if (data?.success || data) {
      this.checkIfHymnIsFavorited(this.hymn.number);
    }
  }

  private async removeFromFavorites() {
    if (!this.hymn) return;

    // First, get all favorite lists that contain this hymn
    this.favouriteService.getFavourites()
      .pipe(take(1))
      .subscribe(async (favourites) => {
        const listsWithThisHymn = favourites.filter(fav => 
          fav.hymnIds.includes(this.hymn!.number)
        );

        if (listsWithThisHymn.length === 0) {
          return; // Shouldn't happen, but just in case
        }

        if (listsWithThisHymn.length === 1) {
          // Only in one list, show simple confirmation
          await this.showSingleListRemovalConfirmation(listsWithThisHymn[0]);
        } else {
          // In multiple lists, let user choose which ones to remove from
          await this.showMultipleListsRemovalDialog(listsWithThisHymn);
        }
      });
  }

  private async showSingleListRemovalConfirmation(favouriteList: any) {
    const alert = await this.alertController.create({
      header: 'Remove from Favorites?',
      message: `Remove "${this.hymn!.title.kinyarwanda}" from "${favouriteList.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Remove',
          role: 'destructive',
          handler: async () => {
            await this.favouriteService.removeHymnFromFavourite(favouriteList.id, this.hymn!.number);
            this.isHymnFavorited = false;
            
            const toast = await this.toastController.create({
              message: `Removed from "${favouriteList.name}"`,
              duration: 2000,
              position: 'bottom',
              color: 'dark'
            });
            await toast.present();
          }
        }
      ]
    });

    await alert.present();
  }

  private async showMultipleListsRemovalDialog(listsWithThisHymn: any[]) {
    const inputs = listsWithThisHymn.map(fav => ({
      type: 'checkbox' as const,
      label: `${fav.name} (${fav.hymnIds.length} hymns)`,
      value: fav.id,
      checked: false
    }));

    const alert = await this.alertController.create({
      header: 'Remove from Favorites',
      message: `"${this.hymn!.title.kinyarwanda}" is in ${listsWithThisHymn.length} lists. Select which ones to remove it from:`,
      inputs: inputs,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Remove from All',
          role: 'destructive',
          handler: async () => {
            // Remove from all lists
            for (const fav of listsWithThisHymn) {
              await this.favouriteService.removeHymnFromFavourite(fav.id, this.hymn!.number);
            }
            
            this.isHymnFavorited = false;
            
            const toast = await this.toastController.create({
              message: `Removed from all ${listsWithThisHymn.length} lists`,
              duration: 2000,
              position: 'bottom',
              color: 'dark'
            });
            await toast.present();
          }
        },
        {
          text: 'Remove Selected',
          handler: async (selectedIds: string[]) => {
            if (!selectedIds || selectedIds.length === 0) {
              const toast = await this.toastController.create({
                message: 'Please select at least one list',
                duration: 2000,
                position: 'bottom',
                color: 'warning'
              });
              await toast.present();
              return false; // Keep dialog open
            }

            // Remove from selected lists
            for (const favId of selectedIds) {
              await this.favouriteService.removeHymnFromFavourite(favId, this.hymn!.number);
            }

            // Check if still in any other lists
            const remainingLists = listsWithThisHymn.filter(fav => !selectedIds.includes(fav.id));
            this.isHymnFavorited = remainingLists.length > 0;

            const listNames = listsWithThisHymn
              .filter(fav => selectedIds.includes(fav.id))
              .map(fav => fav.name)
              .join(', ');

            const toast = await this.toastController.create({
              message: `Removed from: ${listNames}`,
              duration: 2500,
              position: 'bottom',
              color: 'dark'
            });
            await toast.present();
            
            return true;
          }
        }
      ]
    });

    await alert.present();
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
      
      // Preserve the current URL context (favorites or regular hymns)
      const currentUrl = this.router.url;
      let url: string;
      
      if (currentUrl.includes('/favorites/')) {
        // Extract favorite ID from current URL and maintain favorites context
        const favoriteIdMatch = currentUrl.match(/\/favorites\/([^/]+)\//);
        if (favoriteIdMatch) {
          url = `/tabs/favorites/${favoriteIdMatch[1]}/hymns/${hymnNumber}`;
        } else {
          url = `/tabs/hymns/${hymnNumber}`;
        }
      } else {
        url = `/tabs/hymns/${hymnNumber}`;
      }
      
      window.history.replaceState({}, '', url);
    } catch (error) {
      console.error('Error navigating to hymn:', error);
    } finally {
      await loading.dismiss();
    }
  }
}