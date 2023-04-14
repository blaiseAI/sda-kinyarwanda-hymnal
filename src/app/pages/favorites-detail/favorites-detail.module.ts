import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FavoritesDetailPageRoutingModule } from './favorites-detail-routing.module';

import { FavoritesDetailPage } from './favorites-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FavoritesDetailPageRoutingModule
  ],
  declarations: [FavoritesDetailPage]
})
export class FavoritesDetailPageModule {}
