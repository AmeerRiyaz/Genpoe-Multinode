import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PapaParseModule } from 'ngx-papaparse';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { CertificateUploadComponent } from './certificate-upload/certificate-upload.component';
import { StudentListUploadComponent } from './student-list-upload/student-list-upload.component';
import { TrainingCoordinatorDashboardComponent } from './training-coordinator-dashboard/training-coordinator-dashboard.component';
import { TrainingCoordinatorRoutingModule } from './training-coordinator-routing.module';
import { TrainingCoordinatorSearchComponent } from './training-coordinator-search/training-coordinator-search.component';
import { SlideshowModule } from 'ng-simple-slideshow';

@NgModule({
  declarations: [CertificateUploadComponent, StudentListUploadComponent, TrainingCoordinatorSearchComponent, TrainingCoordinatorDashboardComponent],
  imports: [
    TrainingCoordinatorRoutingModule,
    CommonModule,
    MaterialModule,
    PapaParseModule,
    SlideshowModule,
    SharedModule,
  ]
})
export class TrainingCoordinatorModule { }
