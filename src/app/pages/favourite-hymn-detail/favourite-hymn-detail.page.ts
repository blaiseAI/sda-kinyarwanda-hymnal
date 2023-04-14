import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Hymn } from 'src/app/models/hymn';
import { HymnService } from 'src/app/services/hymn.service';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FavouriteModalPage } from '../favourite-modal/favourite-modal.page';
import { FeedbackModalPage } from '../feedback-modal/feedback-modal.page';
import { Location } from '@angular/common';

@Component({
  selector: 'app-favourite-hymn-detail',
  templateUrl: './favourite-hymn-detail.page.html',
  styleUrls: ['./favourite-hymn-detail.page.scss'],
})
export class FavouriteHymnDetailPage implements OnInit {
  hymn: Hymn = {
    hymnNumber: 0,
    hymnTitle: '',
    verses: [],
  };

  constructor(
    private route: ActivatedRoute,
    private hymnService: HymnService,
    private modalController: ModalController,
    public location: Location
  ) {}

  ngOnInit() {
    const hymnNumber = this.route.snapshot.paramMap.get('hymnNumber');

    const id = typeof hymnNumber === 'string' ? parseInt(hymnNumber, 10) : 0;

    this.hymnService.getHymn(id).subscribe((hymn) => {
      this.hymn = hymn;
    });
  }
  addToFavorites() {
    this.presentModal();
  }
  async presentModal() {
    const modal = await this.modalController.create({
      component: FavouriteModalPage,
      cssClass: 'my-custom-modal-css', // you can add your own CSS class
      componentProps: {
        hymnNumber: this.hymn.hymnNumber,
        hymnTitle: this.hymn.hymnTitle,
      },
    });
    return await modal.present();
  }
  async openFeedbackModal() {
    const modal = await this.modalController.create({
      component: FeedbackModalPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        hymnNumber: this.hymn.hymnNumber,
        hymnTitle: this.hymn.hymnTitle,
      },
    });
    return await modal.present();
  }
}
