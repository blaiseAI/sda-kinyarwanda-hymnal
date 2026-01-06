import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Hymn } from 'src/app/models/hymn';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { FavouriteModalPage } from 'src/app/pages/favourite-modal/favourite-modal.page';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LanguageService } from 'src/app/services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-single-hymn-detail',
  templateUrl: './single-hymn-detail.component.html',
  styleUrls: ['./single-hymn-detail.component.scss'],
})
export class SingleHymnDetailComponent implements OnInit, OnDestroy {
  @Input() hymn: Hymn = {
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

  showEnglishTitles = false;
  private languageSubscription?: Subscription;

  constructor(
    private modalController: ModalController,
    public readonly ionRouterOutlet: IonRouterOutlet,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    // Subscribe to language preference changes
    this.languageSubscription = this.languageService.showEnglishTitles$.subscribe(
      (showEnglish) => {
        this.showEnglishTitles = showEnglish;
      }
    );
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  async toggleLanguage() {
    await this.languageService.toggleLanguage();
    await this.playHapticFeedback();
  }

  async openAddToFavoriteModal() {
    await this.playHapticFeedback();
    const modal = await this.modalController.create({
      component: FavouriteModalPage,
      presentingElement: this.ionRouterOutlet.nativeEl,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        hymnNumber: this.hymn.number,
        hymnTitle: this.showEnglishTitles && this.hymn.title.english 
          ? this.hymn.title.english 
          : this.hymn.title.kinyarwanda,
      },
      swipeToClose: true,
    });
    return await modal.present();
  }

  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Light });
  }

  getDisplayTitle(): string {
    if (this.showEnglishTitles && this.hymn.title.english) {
      return this.hymn.title.english;
    }
    return this.hymn.title.kinyarwanda;
  }

  getSecondaryTitle(): string | null {
    if (this.showEnglishTitles && this.hymn.title.english) {
      return this.hymn.title.kinyarwanda;
    }
    return this.hymn.title.english || null;
  }
}
