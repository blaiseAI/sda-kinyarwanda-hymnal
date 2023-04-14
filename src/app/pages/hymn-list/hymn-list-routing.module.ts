import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HymnListPage } from './hymn-list.page';

const routes: Routes = [
  {
    path: '',
    component: HymnListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HymnListPageRoutingModule {}
