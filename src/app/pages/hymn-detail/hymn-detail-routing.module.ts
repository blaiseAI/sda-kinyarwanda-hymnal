import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HymnDetailPage } from './hymn-detail.page';

const routes: Routes = [
  {
    path: '',
    component: HymnDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HymnDetailPageRoutingModule {}
