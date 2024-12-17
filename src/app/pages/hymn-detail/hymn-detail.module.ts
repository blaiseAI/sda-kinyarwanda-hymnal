import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HymnDetailPageRoutingModule } from './hymn-detail-routing.module';
import { HymnDetailPage } from './hymn-detail.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HymnDetailPageRoutingModule,
    SharedModule
  ],
  declarations: [HymnDetailPage]
})
export class HymnDetailPageModule {}
