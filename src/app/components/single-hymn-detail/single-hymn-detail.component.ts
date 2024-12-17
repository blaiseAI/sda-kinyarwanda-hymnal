import { Component, Input, OnInit } from '@angular/core';
import { Hymn } from 'src/app/models/hymn';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { FavouriteModalPage } from 'src/app/pages/favourite-modal/favourite-modal.page';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-single-hymn-detail',
  templateUrl: './single-hymn-detail.component.html',
  styleUrls: ['./single-hymn-detail.component.scss'],
})
export class SingleHymnDetailComponent implements OnInit {
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
  private readonly LANGUAGE_PREF_KEY = 'show_english_titles';

  constructor(
    private modalController: ModalController,
    public readonly ionRouterOutlet: IonRouterOutlet
  ) {
    this.loadLanguagePreference();
  }

  async loadLanguagePreference() {
    const { value } = await Preferences.get({ key: this.LANGUAGE_PREF_KEY });
    this.showEnglishTitles = value === 'true';
  }

  async toggleLanguage() {
    this.showEnglishTitles = !this.showEnglishTitles;
    await Preferences.set({
      key: this.LANGUAGE_PREF_KEY,
      value: this.showEnglishTitles.toString(),
    });
    await this.playHapticFeedback();
  }

  ngOnInit() {}

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
