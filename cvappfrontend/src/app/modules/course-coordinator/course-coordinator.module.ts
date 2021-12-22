import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { CourseCoordinatorDashboardComponent } from './course-coordinator-dashboard/course-coordinator-dashboard.component';
import { CourseCoordinatorRoutingModule } from './course-coordinator-routing.module';
import { CourseCoordinatorSearchComponent } from './course-coordinator-search/course-coordinator-search.component';
import { SlideshowModule } from 'ng-simple-slideshow';


@NgModule({
  declarations: [CourseCoordinatorSearchComponent, CourseCoordinatorDashboardComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    SlideshowModule,
    CourseCoordinatorRoutingModule
  ]
})
export class CourseCoordinatorModule { }
