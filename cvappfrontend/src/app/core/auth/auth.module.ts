import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { AuthRoutingModule } from './auth-routing.module';
import { HomepageWithCertificateListComponent } from './homepage-with-certificate-list/homepage-with-certificate-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomepageComponent } from './homepage/homepage.component';
import { StudentModule } from 'src/app/modules/student/student.module';
import { VerifierModule } from 'src/app/modules/verifier/verifier.module';
import { RecaptchaModule } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';

@NgModule({
  declarations: [LoginComponent, HomepageWithCertificateListComponent, HomepageComponent],
  imports: [
    RecaptchaModule,
    RecaptchaFormsModule,
    CommonModule,
    SharedModule,
    // StudentModule,
    // VerifierModule,
    AuthRoutingModule,
  ],
  exports:[LoginComponent, HomepageWithCertificateListComponent],
  
})
export class AuthModule { }
