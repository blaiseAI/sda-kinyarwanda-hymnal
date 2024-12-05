import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonList, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
  Favourite,
  FavouriteService,
} from 'src/app/services/favourite.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
})
export class FavoritesPage implements OnInit {
  favorites!: Observable<Favourite[]>;
  filteredFavorites: Favourite[] = [];
  editMode = false;
  @ViewChild('myList', { static: false }) myList: IonList = {} as IonList;

  constructor(
    private favouriteService: FavouriteService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadFavorites();
  }

  ionViewWillEnter() {
    this.loadFavorites();
  }

  private loadFavorites() {
    this.favorites = this.favouriteService.getFavourites();
    this.favorites.subscribe((favorites) => {
      this.filteredFavorites = favorites;
    });
  }

  async deleteFavorite(favorite: Favourite) {
    this.playHapticFeedback();
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete ${favorite.name}? This will remove all ${favorite.hymnIds.length} hymn(s) from the favorite list.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.myList.closeSlidingItems();
          },
        },
        {
          text: 'Delete',
          cssClass: 'danger',
          handler: async () => {
            try {
              await this.favouriteService.removeFavourite(favorite.id);
              this.loadFavorites();
              this.presentToast('Favorite deleted successfully');
            } catch (error) {
              console.error('Error deleting favorite:', error);
              this.presentToast('Error deleting favorite', 'danger');
            }
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

  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }

  async addNewFavorite() {
    const alert = await this.alertController.create({
      header: 'New Favorite List',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Enter favorite list name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Create',
          handler: async (data) => {
            if (data.name && data.name.trim() !== '') {
              try {
                const newFavorite: Favourite = {
                  id: Date.now().toString(),
                  name: data.name.trim(),
                  hymnIds: []
                };
                await this.favouriteService.addFavourite(newFavorite);
                this.loadFavorites();
                this.presentToast('New favorite list created successfully');
              } catch (error) {
                console.error('Error creating new favorite:', error);
                this.presentToast('Error creating new favorite list', 'danger');
              }
            } else {
              this.presentToast('Please enter a valid name for the favorite list', 'warning');
              return false;
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
