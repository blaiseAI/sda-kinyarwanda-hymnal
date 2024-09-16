import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router'; // Add this import
import { RelativeDatePipe } from '../pipes/relative-date.pipe';

@NgModule({
  declarations: [RelativeDatePipe],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule // Add RouterModule to the imports array
  ],
  exports: [ RelativeDatePipe, RouterModule], // Export RouterModule as well
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Add this line
})
export class SharedModule { }