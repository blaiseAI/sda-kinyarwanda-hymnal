import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FavouriteHymnDetailPage } from './favourite-hymn-detail.page';

const routes: Routes = [
  {
    path: '',
    component: FavouriteHymnDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FavouriteHymnDetailPageRoutingModule {}
