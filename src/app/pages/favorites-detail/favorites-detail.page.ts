import { Hymn } from 'src/app/models/hymn';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FavouriteService,
  Favourite,
} from 'src/app/services/favourite.service';
import { Observable, of, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AlertController, IonList } from '@ionic/angular';

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
    private alertController: AlertController
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
}
