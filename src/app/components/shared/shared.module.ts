import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HymnOptionsComponent } from '../hymn-options/hymn-options.component';
import { HymnOptionsSheetComponent } from '../hymn-options-sheet/hymn-options-sheet.component';
import { SingleHymnDetailComponent } from '../single-hymn-detail/single-hymn-detail.component';
import { NumberTabComponent } from '../number-tab/number-tab.component';

@NgModule({
  declarations: [HymnOptionsComponent, HymnOptionsSheetComponent, SingleHymnDetailComponent,NumberTabComponent],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [
    HymnOptionsComponent,
    HymnOptionsSheetComponent,
    SingleHymnDetailComponent,
    NumberTabComponent
  ],
})
export class SharedModule {}
