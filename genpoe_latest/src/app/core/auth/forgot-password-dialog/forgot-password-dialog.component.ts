import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from '../../services/http-request-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { AppGlobals } from 'src/app/config/app-globals';
import { MatDialogRef } from '@angular/material';
import { AuthService } from '../services/auth.service';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-forgot-password-dialog',
  templateUrl: './forgot-password-dialog.component.html',
  styleUrls: ['./forgot-password-dialog.component.css']
})
export class ForgotPasswordDialogComponent implements OnInit {

  IND = "Individual"
  ORG = "Organization"
  forgotRequestType = [this.IND, this.ORG]
  forgotTypeValue = this.IND
  displayMessage = false;
  forgotFormGroup: FormGroup;
  forgotOrgFormGroup: FormGroup;
  email: FormControl;
  emailOrg: FormControl
  orgid: FormControl
  reCaptcha: FormControl
  reCaptchaOrg: FormControl
  forgotPwdResponse;
  forgotRequestState: HttpRequestState = new HttpRequestState()

  constructor(
    private logger: NGXLogger,
    private _formBuilder: FormBuilder,
    private httpRequestStateService: HttpRequestStateService,
    private authService: AuthService,
    private utils: UtilsService,
    private appGlobals: AppGlobals,
    private dialogRef: MatDialogRef<ForgotPasswordDialogComponent>,
  ) { }

  ngOnDestroy(): void {
    this.httpRequestStateService.destroyRequest(this.forgotRequestState)
  }

  ngOnInit() {
    this.orgid = new FormControl('', [Validators.required, Validators.pattern("^[a-zA-Z0-9]{3,10}$")])
    this.email = new FormControl('', [Validators.required, Validators.email])
    this.emailOrg = new FormControl('', [Validators.required, Validators.email])
    this.reCaptcha = new FormControl(null, Validators.required)
    this.reCaptchaOrg = new FormControl(null, Validators.required)
    //forgot form
    this.forgotFormGroup = this._formBuilder.group({
      email: this.email,
      recaptcha: this.reCaptcha
    })

    this.forgotOrgFormGroup = this._formBuilder.group({
      email: this.emailOrg,
      orgid : this.orgid,
      recaptcha: this.reCaptchaOrg
    })
  }

  forgot() {
    let isOrgRequest = this.forgotTypeValue == this.ORG
    let forgotPwdFormValue = this.forgotTypeValue == this.IND ? this.forgotFormGroup.value : this.forgotOrgFormGroup.value
    console.log(this.forgotTypeValue, forgotPwdFormValue)
    
    this.httpRequestStateService.initRequest(this.forgotRequestState)
    this.disableDialogClose()
    this.forgotRequestState.subscription = this.authService.forgotPassword(forgotPwdFormValue, isOrgRequest).subscribe((response: any) => {
      this.logger.log(response)
      this.displayMessage = true
      this.forgotPwdResponse = response
      if (response.status == this.appGlobals.HTTP_SUCCESS) {
        this.enableDialogClose()
        this.httpRequestStateService.finishRequest(this.forgotRequestState)
      }
      else {
        this.forgotRequestState.msgToUser = response.message
        this.httpRequestStateService.finishRequestWithError(this.forgotRequestState)
        this.enableDialogClose()
      }
    },
      (err: HttpErrorResponse) => {
        this.utils.showSnackBar("Something went wrong")
        this.httpRequestStateService.finishRequestWithError(this.forgotRequestState)
        this.enableDialogClose()
      });

  }


  getEmailValidationMessage() {
    let emailControl = this.forgotTypeValue == this.IND ? this.email : this.emailOrg
    return emailControl.hasError('required') ? 'You must provide email address' :
      emailControl.hasError('email') ? 'Not a valid email address' : ''
  }


  closeDialog() {
    this.dialogRef.close()
  }
  disableDialogClose() {
    this.dialogRef.disableClose = true
    setTimeout(() => {
      this.enableDialogClose()
    }, AppGlobals.HTTP_TIMEOUT);
  }

  enableDialogClose() {
    this.dialogRef.disableClose = false
  }

  forgotPwdTypeChanged(forgotType) {
    this.forgotTypeValue = forgotType
    this.logger.log(this.forgotTypeValue)
    // this.forgotFormGroup.reset()
    // this.forgotOrgFormGroup.reset()
    // this.resetCaptcha()
  }

  getOrgIdValidationMessage() {
    return this.orgid.hasError('required') ? 'You must provide org id' : ""
  }

}
