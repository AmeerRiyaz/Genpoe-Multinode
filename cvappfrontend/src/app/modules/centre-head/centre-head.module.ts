import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { CentreHeadDashboardComponent } from './centre-head-dashboard/centre-head-dashboard.component';
import { CentreHeadRoutingModule } from './centre-head-routing.module';
import { CentreHeadSearchComponent } from './centre-head-search/centre-head-search.component';
import { SlideshowModule } from 'ng-simple-slideshow';


@NgModule({
  declarations: [CentreHeadSearchComponent, CentreHeadDashboardComponent],
  imports: [
    CentreHeadRoutingModule,
    CommonModule,
    MaterialModule,
    SlideshowModule,
    SharedModule,
  ]
})
export class CentreHeadModule { }
