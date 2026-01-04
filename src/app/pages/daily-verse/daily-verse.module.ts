import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DailyVersePageRoutingModule } from './daily-verse-routing.module';

import { DailyVersePage } from './daily-verse.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DailyVersePageRoutingModule
  ],
  declarations: [DailyVersePage]
})
export class DailyVersePageModule {}
