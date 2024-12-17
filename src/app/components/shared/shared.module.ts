import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { HymnOptionsComponent } from '../hymn-options/hymn-options.component';
import { HymnOptionsSheetComponent } from '../hymn-options-sheet/hymn-options-sheet.component';
import { SingleHymnDetailComponent } from '../single-hymn-detail/single-hymn-detail.component';
import { NumberTabComponent } from '../number-tab/number-tab.component';
import { RecentlyViewedListComponent } from '../recently-viewed-list/recently-viewed-list.component';

@NgModule({
  declarations: [
    HymnOptionsComponent,
    HymnOptionsSheetComponent,
    SingleHymnDetailComponent,
    NumberTabComponent,
    RecentlyViewedListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule
  ],
  exports: [
    HymnOptionsComponent,
    HymnOptionsSheetComponent,
    SingleHymnDetailComponent,
    NumberTabComponent,
    RecentlyViewedListComponent
  ],
})
export class SharedModule {}
