import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams, ToastController } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
  Favourite,
  FavouriteService,
} from 'src/app/services/favourite.service';
import { Router } from '@angular/router';

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
    private toastController: ToastController,
    private router: Router
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
      if (favorite && favorite.hymnIds.includes(this.hymnNumber)) {
        this.favoriteActionSuccess = false;
        this.playHapticFeedback();
        this.presentToast('Hymn already exists in the selected favorite');
        return;
      }

      await this.favouriteService.addHymnToFavourite(
        this.selectedFavoriteId,
        this.hymnNumber
      );
      await this.getFavorites();
      this.favoriteActionSuccess = true;
      this.playHapticFeedback();
      this.presentToast('Hymn added to favorite successfully');
      this.dismiss();
    } else if (this.newFavoriteName) {
      const favoriteExists = this.favourites.some(
        (c) => c.name.toLowerCase() === this.newFavoriteName.toLowerCase()
      );
      if (favoriteExists) {
        this.playHapticFeedback();
        this.presentToast('Favorite with the same name already exists');
        this.favoriteActionSuccess = false;
        return;
      }

      const newFavorite: Favourite = {
        id: Date.now().toString(),
        name: this.newFavoriteName,
        hymnIds: [this.hymnNumber],
      };
      await this.favouriteService.addFavourite(newFavorite);
      await this.getFavorites();
      this.favoriteActionSuccess = true;
      this.playHapticFeedback();
      this.presentToast('Favorite created and hymn added successfully');
      this.modalController.dismiss({ success: true });
    } else {
      this.favoriteActionSuccess = false;
      this.playHapticFeedback();
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

  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }

  navigateToAllFavorites() {
    this.modalController.dismiss().then(() => {
      this.router.navigate(['/tabs/favorites']);
    });
  }

  ionViewWillLeave() {
    this.dismiss();
  }
}
