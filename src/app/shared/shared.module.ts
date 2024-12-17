import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { RelativeDatePipe } from '../pipes/relative-date.pipe';
import { NewlinePipe } from '../pipes/newline.pipe';

@NgModule({
  declarations: [RelativeDatePipe, NewlinePipe],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [RelativeDatePipe, RouterModule, NewlinePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }