import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FavoritesDetailPage } from './favorites-detail.page';

const routes: Routes = [
  {
    path: '',
    component: FavoritesDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FavoritesDetailPageRoutingModule {}
