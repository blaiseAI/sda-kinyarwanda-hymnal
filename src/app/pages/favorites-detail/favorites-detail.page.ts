import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, combineLatest, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AlertController, IonList } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { Hymn } from 'src/app/models/hymn';
import { FavouriteService, Favourite } from 'src/app/services/favourite.service';
import { HymnService } from 'src/app/services/hymn.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-favorites-detail',
  templateUrl: './favorites-detail.page.html',
  styleUrls: ['./favorites-detail.page.scss'],
})
export class FavoritesDetailPage implements OnInit, OnDestroy {
  favourite: Favourite = { id: '', name: '', hymnIds: [] };
  hymns$: Observable<Hymn[]> | undefined;
  editMode = false;
  showEnglishTitles = false;
  backgroundImageUrl: SafeStyle = '';
  private languageSubscription?: Subscription;
  @ViewChild('myList', { static: true }) myList: IonList = {} as IonList;

  constructor(
    private route: ActivatedRoute,
    private favouriteService: FavouriteService,
    private alertController: AlertController,
    private hymnService: HymnService,
    private sanitizer: DomSanitizer,
    private languageService: LanguageService
  ) {
    // Generate background image once during construction
    this.backgroundImageUrl = this.generateRandomBackgroundImage();
  }

  ngOnInit() {
    // Subscribe to language preference changes
    this.languageSubscription = this.languageService.showEnglishTitles$.subscribe(
      (showEnglish) => {
        this.showEnglishTitles = showEnglish;
      }
    );
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const favourite$ = this.favouriteService.getFavouriteById(id);
      const hymns$ = favourite$.pipe(
        switchMap((fav) => {
          if (!fav) {
            return of([]);
          }
          this.favourite = fav;
          return this.favouriteService.getHymnsForFavourite(fav);
        })
      );
      this.hymns$ = combineLatest([favourite$, hymns$]).pipe(
        switchMap(([favourite, hymns]) => {
          if (!favourite || !hymns) {
            return of([]);
          }
          return of(hymns);
        })
      );
    }
    this.getHymnIdsCount();
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

  async removeHymnFromFavorite(hymn: Hymn) {
    this.playHapticFeedback();
    const alert = await this.alertController.create({
      header: this.showEnglishTitles ? 'Confirm Remove' : 'Emeza Gukuraho',
      message: this.showEnglishTitles
        ? `Are you sure you want to remove ${hymn.number} - ${hymn.title.kinyarwanda} from ${this.favourite.name}?`
        : `Uzi neza ko ushaka gukuraho ${hymn.number} - ${hymn.title.kinyarwanda} muri ${this.favourite.name}?`,
      buttons: [
        {
          text: this.showEnglishTitles ? 'Cancel' : 'Kureka',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.showEnglishTitles ? 'Remove' : 'Kuraho',
          cssClass: 'danger',
          handler: async () => {
            await this.favouriteService.removeHymnFromFavourite(
              this.favourite.id,
              hymn.number
            );
            this.hymns$ = this.favouriteService.getHymnsForFavourite(
              this.favourite
            );
          },
        },
      ],
    });
    await alert.present();
  }

  getVerseCount(hymn: Hymn): number {
    return hymn.verses?.count || hymn.verses?.text?.length || 0;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  getHymnIdsCount(): number[] {
    if (this.favourite && this.favourite.hymnIds) {
      return Array.from({ length: this.favourite.hymnIds.length });
    } else {
      return [];
    }
  }

  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }

  getBackgroundImageUrl(): SafeStyle {
    return this.backgroundImageUrl;
  }

  private generateRandomBackgroundImage(): SafeStyle {
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
