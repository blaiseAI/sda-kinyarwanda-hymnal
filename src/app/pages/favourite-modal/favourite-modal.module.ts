import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FavouriteModalPageRoutingModule } from './favourite-modal-routing.module';

import { FavouriteModalPage } from './favourite-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FavouriteModalPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [FavouriteModalPage],
})
export class FavouriteModalPageModule {}
