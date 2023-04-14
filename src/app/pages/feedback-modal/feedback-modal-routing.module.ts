import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FeedbackModalPage } from './feedback-modal.page';

const routes: Routes = [
  {
    path: '',
    component: FeedbackModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeedbackModalPageRoutingModule {}
