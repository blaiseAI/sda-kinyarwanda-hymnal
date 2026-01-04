import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DailyVersePage } from './daily-verse.page';

const routes: Routes = [
  {
    path: '',
    component: DailyVersePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DailyVersePageRoutingModule {}
