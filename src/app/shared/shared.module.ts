import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { RelativeDatePipe } from '../pipes/relative-date.pipe';
import { RecentlyViewedListComponent } from '../components/recently-viewed-list/recently-viewed-list.component';

@NgModule({
  declarations: [RelativeDatePipe, RecentlyViewedListComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [RelativeDatePipe, RouterModule, RecentlyViewedListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }