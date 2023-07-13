import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HymnOptionsComponent } from '../hymn-options/hymn-options.component';
import { HymnOptionsSheetComponent } from '../hymn-options-sheet/hymn-options-sheet.component';
import { RecentlyViewedListComponent } from '../recently-viewed-list/recently-viewed-list.component';
import { SingleHymnDetailComponent } from '../single-hymn-detail/single-hymn-detail.component';

@NgModule({
  declarations: [HymnOptionsComponent, HymnOptionsSheetComponent, SingleHymnDetailComponent],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [
    HymnOptionsComponent,
    HymnOptionsSheetComponent,
    SingleHymnDetailComponent,
  ],
})
export class SharedModule {}
