import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrivayPolicyPageRoutingModule } from './privay-policy-routing.module';

import { PrivayPolicyPage } from './privay-policy.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrivayPolicyPageRoutingModule
  ],
  declarations: [PrivayPolicyPage]
})
export class PrivayPolicyPageModule {}
