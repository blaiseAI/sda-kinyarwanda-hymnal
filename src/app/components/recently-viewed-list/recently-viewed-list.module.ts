import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RecentlyViewedListComponent } from './recently-viewed-list.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [RecentlyViewedListComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [RecentlyViewedListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RecentlyViewedListModule { } 