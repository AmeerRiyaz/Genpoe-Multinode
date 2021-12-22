import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VerificationRoutingModule } from './verification-routing.module';
import { VerificationComponent } from './verification/verification.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';
import { RecaptchaModule } from 'ng-recaptcha';

@NgModule({
  declarations: [VerificationComponent],
  imports: [
    RecaptchaModule,
    RecaptchaFormsModule,
    CommonModule,
    VerificationRoutingModule,
    SharedModule
  ]
})
export class VerificationModule { }
