import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrivayPolicyPage } from './privay-policy.page';

const routes: Routes = [
  {
    path: '',
    component: PrivayPolicyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivayPolicyPageRoutingModule {}
