import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParallaxDirective } from './parallax.directive';



@NgModule({
  declarations: [
    ParallaxDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ParallaxDirective
  ]
})
export class SharedDirectivesModule { }
