import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonList } from '@ionic/angular';
import { Observable } from 'rxjs';
import {
  Favourite,
  FavouriteService,
} from 'src/app/services/favourite.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
})
export class FavoritesPage {
  favorites!: Observable<Favourite[]>;
  filteredFavorites: Favourite[] = [];
  editMode = false;
  @ViewChild('myList', { static: false }) myList: IonList = {} as IonList;

  constructor(
    private favouriteService: FavouriteService,
    private alertController: AlertController
  ) {}

  ionViewWillEnter() {
    this.favorites = this.favouriteService.getFavourites();
    this.favorites.subscribe((favorites) => {
      this.filteredFavorites = favorites;
    });
  }

  async deleteFavorite(favorite: Favourite) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete ${favorite.name}? This will remove all ${favorite.hymnIds.length} hymn(s) from the favorite list.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            // Dismiss the slide here
            this.myList.closeSlidingItems();
          },
        },
        {
          text: 'Delete',
          cssClass: 'danger',
          handler: async () => {
            await this.favouriteService.removeFavourite(favorite.id);
            this.favorites = await this.favouriteService.getFavourites();
            this.filterFavorites('');
          },
        },
      ],
    });
    await alert.present();
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }
  handleSearchChange(event: any) {
    const query = event.detail.value.toLowerCase();
    this.filterFavorites(query);
  }

  filterFavorites(query: string) {
    this.favorites.subscribe((favorites) => {
      this.filteredFavorites = favorites.filter((favorite) =>
        favorite.name.toLowerCase().includes(query)
      );
    });
  }
}
