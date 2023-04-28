import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams, ToastController } from '@ionic/angular';
import {
  Favourite,
  FavouriteService,
} from 'src/app/services/favourite.service';

@Component({
  selector: 'app-favourite-modal',
  templateUrl: './favourite-modal.page.html',
  styleUrls: ['./favourite-modal.page.scss'],
})
export class FavouriteModalPage implements OnInit {
  favourites: Favourite[] = [];
  selectedFavoriteId: string | undefined;
  newFavoriteName: string = '';
  favoriteActionSuccess: boolean = false;
  @Input() hymnNumber: string = '';
  @Input() hymnTitle: string = '';

  favoriteForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private favouriteService: FavouriteService,
    private toastController: ToastController
  ) {
    this.favoriteForm = this.formBuilder.group({
      favoriteName: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.getFavorites();
  }

  async getFavorites() {
    this.favouriteService.getFavourites().subscribe((favourites) => {
      this.favourites = favourites;
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async addHymnToFavourite() {
    if (this.selectedFavoriteId) {
      const favorite = this.favourites.find(
        (c) => c.id === this.selectedFavoriteId
      );
      if (favorite && favorite.hymnIds.includes(parseInt(this.hymnNumber))) {
        this.favoriteActionSuccess = false;
        this.presentToast('Hymn already exists in the selected favorite');
        return;
      }

      await this.favouriteService.addHymnToFavourite(
        this.selectedFavoriteId,
        this.hymnNumber
      );
      await this.getFavorites(); // <--- recall getFavorites to update the list
      this.favoriteActionSuccess = true;
      this.presentToast('Hymn added to favorite successfully');
      this.modalController.dismiss({ success: true });
    } else if (this.newFavoriteName) {
      const favoriteExists = this.favourites.some(
        (c) => c.name.toLowerCase() === this.newFavoriteName.toLowerCase()
      );
      if (favoriteExists) {
        this.presentToast('Favorite with the same name already exists');
        this.favoriteActionSuccess = false;
        return;
      }

      const newFavorite: Favourite = {
        id: Date.now().toString(),
        name: this.newFavoriteName,
        hymnIds: [parseInt(this.hymnNumber)],
      };
      await this.favouriteService.addFavourite(newFavorite);
      await this.getFavorites(); // <--- recall getFavorites to update the list
      this.favoriteActionSuccess = true;
      this.presentToast('Favorite created and hymn added successfully');
      this.modalController.dismiss({ success: true });
    } else {
      this.favoriteActionSuccess = false;
      this.presentToast(
        'Please select an existing favorite or enter a new favorite name'
      );
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: this.favoriteActionSuccess ? 'primary' : 'warning',
      icon: this.favoriteActionSuccess ? 'checkmark-circle-outline' : 'alert',
    });
    toast.present();
  }
}
