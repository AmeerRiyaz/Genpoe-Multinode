import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from './layout/layout.module';
import { MaterialModule } from './material/material.module';
import { SlideshowModule } from 'ng-simple-slideshow';
@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    MaterialModule,
    SlideshowModule
  ],
  exports: [
    LayoutModule,
    MaterialModule,
  ],
  declarations: []
})
export class SharedModule { }
