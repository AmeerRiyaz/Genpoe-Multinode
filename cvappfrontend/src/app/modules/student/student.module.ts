import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentRoutingModule } from './student-routing.module';
import { StudentSignupComponent } from './student-signup/student-signup.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { StudentCertificateListComponent } from './student-certificate-list/student-certificate-list.component';
import { StudentCertificateCardsComponent } from './student-certificate-cards/student-certificate-cards.component';

@NgModule({
  declarations: [StudentSignupComponent, StudentCertificateListComponent, StudentCertificateCardsComponent],
  imports: [
    CommonModule,
    StudentRoutingModule,
    MaterialModule
  ],
  exports : [StudentSignupComponent],
})
export class StudentModule { }
