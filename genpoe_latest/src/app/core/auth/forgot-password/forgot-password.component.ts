import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from '../../services/http-request-state.service';
import { AuthService } from '../services/auth.service';
import { NGXLogger } from 'ngx-logger';
import { AppGlobals } from 'src/app/config/app-globals';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  token
  hidePassword = true;
  forgotPasswordFormGroup: FormGroup
  newpassword: FormControl
  confirmpassword: FormControl
  reCaptcha: FormControl
  changePwdRequestState: HttpRequestState = new HttpRequestState()
  changePwdResponse
  displayMessage: false
  isOrgRequest = false
  constructor(
    private route: ActivatedRoute,
    private utils: UtilsService,
    private _formBuilder: FormBuilder,
    private httpRequestStateService: HttpRequestStateService,
    private authService: AuthService,
    private logger: NGXLogger,
    private appGlobals: AppGlobals,
    private router: Router,
  ) { }

  ngOnInit() {
    if(this.route.snapshot.url[0].path =='org'){
      this.isOrgRequest = true
    }else{
      this.isOrgRequest = false
    }


    this.route.params.subscribe(params => {
      this.token = params['token'];
    });
    this.newpassword = new FormControl('',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(64),
        // Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{6,}'),
        Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$])[A-Za-z\d!@#$].{6,64}'),
      ])
    this.confirmpassword = new FormControl('', [
      Validators.required, this.utils.matchOtherValidator('newpassword')
    ])
    this.reCaptcha = new FormControl(null, Validators.required)
    this.forgotPasswordFormGroup = this._formBuilder.group({
      newpassword: this.newpassword,
      confirmpassword: this.confirmpassword,
      recaptcha: this.reCaptcha
    })
    
  }

  changeForgotPassword() {

    var formValue = this.forgotPasswordFormGroup.value
    this.logger.log("formValue: ", formValue)
    formValue.token = this.token

    this.httpRequestStateService.initRequest(this.changePwdRequestState)
    this.changePwdRequestState.subscription = this.authService.forgotPasswordChange(formValue, this.isOrgRequest).subscribe((response: any) => {
      this.logger.log(response)
      this.changePwdResponse = response
      if (response.status == this.appGlobals.HTTP_SUCCESS) {
        this.httpRequestStateService.finishRequest(this.changePwdRequestState)
      }
      else {
        this.changePwdRequestState.msgToUser = response.message
        this.httpRequestStateService.finishRequestWithError(this.changePwdRequestState)
      }
    },
      (err: HttpErrorResponse) => {
        this.utils.showSnackBar("Something went wrong")
        this.httpRequestStateService.finishRequestWithError(this.changePwdRequestState)
      });

  }

  getNewPasswordValidationMessage() {
    return this.newpassword.hasError('required') ? 'You must provide password' :
      this.newpassword.hasError('minlength') ? 'Password should be minimum 6 characters long' :
        this.newpassword.hasError('maxlength') ? 'Password should be maximum 18 characters long' :
          this.newpassword.errors ? 'Must contain uppercase and lowercase letters, numbers and special characters' : ''
  }

  getConfirmPasswordValidationMessage() {
    return this.confirmpassword.hasError('required') ? 'You must confirm password' :
      this.confirmpassword.errors ? 'Password does not match' : ''
  }

  takeToLogin() {
    this.router.navigate([AppGlobals.ROUTE_SIGNIN]);
  }

}
