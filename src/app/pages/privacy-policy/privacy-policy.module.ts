import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PrivacyPolicyPage } from './privacy-policy.page';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    /* @vite-ignore */
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: PrivacyPolicyPage
      }
    ])
  ],
  declarations: [PrivacyPolicyPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [PrivacyPolicyPage]
})
export class PrivacyPolicyPageModule { } 