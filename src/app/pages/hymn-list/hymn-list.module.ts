import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { HymnListPageRoutingModule } from './hymn-list-routing.module';

import { HymnListPage } from './hymn-list.page';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HymnListPageRoutingModule,
    ScrollingModule,
  ],
  declarations: [HymnListPage],
})
export class HymnListPageModule {}
