import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PlacementOfficerDashboardComponent } from './placement-officer-dashboard/placement-officer-dashboard.component';
import { PlacementOfficerRoutingModule } from './placement-officer-routing.module';
import { PlacementOfficerSearchComponent } from './placement-officer-search/placement-officer-search.component';
import { SlideshowModule } from 'ng-simple-slideshow';


@NgModule({
  declarations: [PlacementOfficerSearchComponent, PlacementOfficerDashboardComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    SlideshowModule,
    PlacementOfficerRoutingModule
  ]
})
export class PlacementOfficerModule { }
