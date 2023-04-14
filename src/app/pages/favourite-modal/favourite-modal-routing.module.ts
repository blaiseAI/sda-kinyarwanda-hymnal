import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FavouriteModalPage } from './favourite-modal.page';

const routes: Routes = [
  {
    path: '',
    component: FavouriteModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FavouriteModalPageRoutingModule {}
