import { Component, Input, OnInit } from '@angular/core';
import { Hymn } from 'src/app/models/hymn';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { FavouriteModalPage } from 'src/app/pages/favourite-modal/favourite-modal.page';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-single-hymn-detail',
  templateUrl: './single-hymn-detail.component.html',
  styleUrls: ['./single-hymn-detail.component.scss'],
})
export class SingleHymnDetailComponent implements OnInit {
  @Input() hymn: Hymn = { hymnTitle: '', hymnNumber: 0, verses: [] };

  constructor(
    private modalController: ModalController,
    public readonly ionRouterOutlet: IonRouterOutlet
  ) {}

  ngOnInit() {}

  async openAddToFavoriteModal() {
    await this.playHapticFeedback();
    const modal = await this.modalController.create({
      component: FavouriteModalPage,
      presentingElement: this.ionRouterOutlet.nativeEl,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        hymnNumber: this.hymn.hymnNumber,
        hymnTitle: this.hymn.hymnTitle,
      },
      swipeToClose: true,
    });
    return await modal.present();
  }

  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }
}
