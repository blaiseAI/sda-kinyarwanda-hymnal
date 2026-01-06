import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AlertController, IonList, ToastController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
  Favourite,
  FavouriteService,
} from 'src/app/services/favourite.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
})
export class FavoritesPage implements OnInit, OnDestroy {
  favorites!: Observable<Favourite[]>;
  filteredFavorites: Favourite[] = [];
  editMode = false;
  showEnglishTitles = false;
  currentSearchQuery = '';
  private languageSubscription?: Subscription;
  @ViewChild('myList', { static: false }) myList: IonList = {} as IonList;

  constructor(
    private favouriteService: FavouriteService,
    private alertController: AlertController,
    private toastController: ToastController,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    // Subscribe to language preference changes
    this.languageSubscription = this.languageService.showEnglishTitles$.subscribe(
      (showEnglish) => {
        this.showEnglishTitles = showEnglish;
      }
    );
    this.loadFavorites();
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
      header: this.showEnglishTitles ? 'Confirm Delete' : 'Emeza Gusiba',
      message: this.showEnglishTitles 
        ? `Are you sure you want to delete ${favorite.name}? This will remove all ${favorite.hymnIds.length} hymn(s) from the favorite list.`
        : `Uzi neza ko ushaka gusiba ${favorite.name}? Ibi bizasiba indirimbo ${favorite.hymnIds.length} zose mu rutonde.`,
      buttons: [
        {
          text: this.showEnglishTitles ? 'Cancel' : 'Kureka',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.myList.closeSlidingItems();
          },
        },
        {
          text: this.showEnglishTitles ? 'Delete' : 'Siba',
          cssClass: 'danger',
          handler: async () => {
            try {
              await this.favouriteService.removeFavourite(favorite.id);
              this.loadFavorites();
              this.presentToast(
                this.showEnglishTitles ? 'Favorite deleted successfully' : 'Urutonde rwasibiwe neza'
              );
            } catch (error) {
              console.error('Error deleting favorite:', error);
              this.presentToast(
                this.showEnglishTitles ? 'Error deleting favorite' : 'Ikosa mu gusiba urutonde',
                'danger'
              );
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
    this.currentSearchQuery = query;
    this.filterFavorites(query);
  }

  filterFavorites(query: string) {
    this.favorites.subscribe((favorites) => {
      this.filteredFavorites = favorites.filter((favorite) =>
        favorite.name.toLowerCase().includes(query)
      );
    });
  }

  get totalFavorites(): number {
    return this.filteredFavorites.length;
  }

  getTotalHymns(): number {
    return this.filteredFavorites.reduce((total, fav) => total + fav.hymnIds.length, 0);
  }

  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }

  async addNewFavorite() {
    await this.playHapticFeedback();
    const alert = await this.alertController.create({
      header: this.showEnglishTitles ? 'New Favorite List' : 'Urutonde Rushya',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: this.showEnglishTitles ? 'Enter favorite list name' : 'Andika izina ry\'urutonde'
        }
      ],
      buttons: [
        {
          text: this.showEnglishTitles ? 'Cancel' : 'Kureka',
          role: 'cancel'
        },
        {
          text: this.showEnglishTitles ? 'Create' : 'Kurema',
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
                this.presentToast(
                  this.showEnglishTitles ? 'New favorite list created successfully' : 'Urutonde rushya rwaremwe neza'
                );
              } catch (error) {
                console.error('Error creating new favorite:', error);
                this.presentToast(
                  this.showEnglishTitles ? 'Error creating new favorite list' : 'Ikosa mu kurema urutonde',
                  'danger'
                );
              }
            } else {
              this.presentToast(
                this.showEnglishTitles ? 'Please enter a valid name for the favorite list' : 'Andika izina ryemewe',
                'warning'
              );
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
