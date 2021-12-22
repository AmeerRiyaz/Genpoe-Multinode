import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SigninComponent } from './signin/signin.component';
import { ProfileModule } from './profile/profile.module';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ForgotPasswordDialogComponent } from './forgot-password-dialog/forgot-password-dialog.component';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
@NgModule({
  declarations: [SigninComponent, SignupComponent, ForgotPasswordComponent, ForgotPasswordDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    AuthRoutingModule
  ],
  exports: [
    SigninComponent,
    SignupComponent
  ],
  entryComponents: [
    SignupComponent,
    ForgotPasswordDialogComponent
  ]
})
export class AuthModule { }
