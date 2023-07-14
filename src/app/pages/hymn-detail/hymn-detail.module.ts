import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HymnDetailPageRoutingModule } from './hymn-detail-routing.module';

import { HymnDetailPage } from './hymn-detail.page';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { SharedDirectivesModule } from 'src/app/directives/shared-directives.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HymnDetailPageRoutingModule,
    SharedModule,
    SharedDirectivesModule
  ],
  declarations: [HymnDetailPage],
})
export class HymnDetailPageModule {}
