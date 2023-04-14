import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FavouriteHymnDetailPageRoutingModule } from './favourite-hymn-detail-routing.module';

import { FavouriteHymnDetailPage } from './favourite-hymn-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FavouriteHymnDetailPageRoutingModule
  ],
  declarations: [FavouriteHymnDetailPage]
})
export class FavouriteHymnDetailPageModule {}
