import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AlertController, IonList } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { Hymn } from 'src/app/models/hymn';
import { FavouriteService, Favourite } from 'src/app/services/favourite.service';
import { HymnService } from 'src/app/services/hymn.service'; // Add this import

@Component({
  selector: 'app-favorites-detail',
  templateUrl: './favorites-detail.page.html',
  styleUrls: ['./favorites-detail.page.scss'],
})
export class FavoritesDetailPage implements OnInit {
  favourite: Favourite = { id: '', name: '', hymnIds: [] };
  hymns$: Observable<Hymn[]> | undefined;
  editMode = false;
  @ViewChild('myList', { static: true }) myList: IonList = {} as IonList;

  constructor(
    private route: ActivatedRoute,
    private favouriteService: FavouriteService,
    private alertController: AlertController,
    private hymnService: HymnService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
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
  async removeHymnFromFavorite(hymn: Hymn) {
    this.playHapticFeedback();
    const alert = await this.alertController.create({
      header: 'Confirm Remove',
      message: `Are you sure you want to remove ${hymn.hymnNumber} - ${hymn.hymnTitle} from ${this.favourite.name} favourite list?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Remove',
          cssClass: 'danger',
          handler: async () => {
            await this.favouriteService.removeHymnFromFavourite(
              this.favourite.id,
              hymn.hymnNumber
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
