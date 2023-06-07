import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HymnOptionsComponent } from '../hymn-options/hymn-options.component';
import { HymnOptionsSheetComponent } from '../hymn-options-sheet/hymn-options-sheet.component';
import { RecentlyViewedListComponent } from '../recently-viewed-list/recently-viewed-list.component';

@NgModule({
  declarations: [HymnOptionsComponent, HymnOptionsSheetComponent],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class SharedModule {}
