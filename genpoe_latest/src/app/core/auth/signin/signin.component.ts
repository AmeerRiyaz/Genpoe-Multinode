import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from '../../services/http-request-state.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SigninRequest } from 'src/app/shared/models/request-response/signin-request';
import { SigninResponse } from 'src/app/shared/models/request-response/signin-response';
import { NGXLogger } from 'ngx-logger';
import { AuthService } from '../services/auth.service';
import { AppGlobals } from 'src/app/config/app-globals';
import { MatDialog } from '@angular/material';
import { SignupComponent } from '../signup/signup.component';
import { ForgotPasswordDialogComponent } from '../forgot-password-dialog/forgot-password-dialog.component';
import { SigninOrgRequest } from 'src/app/shared/models/request-response/signin-org-request';

// export enum signinType {'individual', 'organization'}

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  IND = "Individual"
  ORG = "Organization"
  signinType = [this.IND, this.ORG]

  signinUserFormGroup: FormGroup;
  signinOrgFormGroup: FormGroup;
  orgid: FormControl
  userid: FormControl
  hidePassword = true;
  signinRequestState: HttpRequestState = new HttpRequestState()
  captchaRequestState: HttpRequestState = new HttpRequestState()
  passwordIndividual: FormControl
  passwordOrg: FormControl
  email: FormControl
  recaptchaIndividual: FormControl
  reCaptchaOrg: FormControl
  signinTypeValue = this.IND
  totalTransactions = '...'
  getTotalTransactionsRequest: HttpRequestState = new HttpRequestState()
  constructor(
    public appGlobals: AppGlobals,
    private _formBuilder: FormBuilder,
    private httpRequestStateService: HttpRequestStateService,
    private utils: UtilsService,
    private logger: NGXLogger,
    public authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {

    if (this.authService.isLoggedIn()) {
      this.authService.redirect();
      return
    }
    this.initComponent()

  }
  ngOnDestroy(): void {
    this.httpRequestStateService.destroyRequest(this.signinRequestState)
  }

  /**
   * Initialize required things
   */
  initComponent() {
    this.logger.log("init start")
    //user form
    this.email = new FormControl('', [Validators.required, Validators.email])
    this.passwordIndividual = new FormControl('', Validators.required)
    this.passwordOrg = new FormControl('', Validators.required)
    this.recaptchaIndividual = new FormControl(null, Validators.required)
    this.reCaptchaOrg = new FormControl(null, Validators.required)
    // this.captcha = new FormControl('', [Validators.required, Validators.minLength(4)])

    //org form
    this.orgid = new FormControl('', [Validators.required, Validators.pattern("^[a-zA-Z0-9]{3,10}$")])
    this.userid = new FormControl('', [Validators.required, Validators.email])


    //login form
    this.signinUserFormGroup = this._formBuilder.group({
      username: this.email,
      password: this.passwordIndividual,
      // captchaval: this.captcha
      recaptcha: this.recaptchaIndividual
    })


    this.signinOrgFormGroup = this._formBuilder.group({
      orgid: this.orgid,
      userid: this.userid,
      password: this.passwordOrg,
      // captchaval: this.captcha
      recaptcha: this.reCaptchaOrg
    })
    this.getTotalTransactions()
    this.logger.log("init end")
  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    // this.getCaptcha() 
  }

  signinTypeChanged(siginType) {
    this.signinTypeValue = siginType
    this.logger.log(this.signinTypeValue)
    this.signinUserFormGroup.reset()
    this.signinOrgFormGroup.reset()
    // this.resetCaptcha()
  }


  /**
   * Start login process
   */
  initLogin() {

    // this.captchaVeriScript(this.captchaval.value)
    this.httpRequestStateService.initRequest(this.signinRequestState)
    const signinRequest: SigninRequest = this.signinUserFormGroup.value

    this.logger.log("initLogin request", signinRequest)

    this.signinRequestState.subscription = this.authService.login(signinRequest)
      .subscribe((response: SigninResponse) => {
        this.logger.log("initLogin response", response)
        if (response.status == this.appGlobals.HTTP_SUCCESS) {
          this.httpRequestStateService.finishRequest(this.signinRequestState)
          this.authService.redirect();
        } else {
          this.resetCaptcha()
          this.signinRequestState.msgToUser = response.message ? response.message : "Check username or password"

          this.httpRequestStateService.finishRequestWithError(this.signinRequestState)
          this.utils.showSnackBar(this.signinRequestState.msgToUser)
          // this.getCaptcha()
        }
      },
        (error: HttpErrorResponse) => {
          this.resetCaptcha()
          // if (error.status == 401) {
          //   this.utils.showSnackBar(error.error.message)
          // }
          // else {
          //   this.utils.showSnackBar("Something went wrong")
          // }
          this.httpRequestStateService.finishRequestWithError(this.signinRequestState)
        }
      )
  }



  /**
   * Start login process
   */
  initOrgLogin() {

    // this.captchaVeriScript(this.captchaval.value)
    this.httpRequestStateService.initRequest(this.signinRequestState)
    var signinRequest: SigninOrgRequest = new SigninOrgRequest()
    signinRequest = this.signinOrgFormGroup.value

    this.logger.log("initLogin request", signinRequest)

    this.signinRequestState.subscription = this.authService.loginOrg(signinRequest)
      .subscribe((response: SigninResponse) => {
        this.logger.log("initLogin response", response)
        if (response.status == this.appGlobals.HTTP_SUCCESS) {
          this.httpRequestStateService.finishRequest(this.signinRequestState)
          this.authService.redirect();
        } else {
          this.resetCaptcha()
          this.signinRequestState.msgToUser = response.message ? response.message : "Check username or password"

          this.httpRequestStateService.finishRequestWithError(this.signinRequestState)
          this.utils.showSnackBar(this.signinRequestState.msgToUser)
          // this.getCaptcha()
        }
      },
        (error: HttpErrorResponse) => {
          this.resetCaptcha()
          // if (error.status == 401) {
          //   this.utils.showSnackBar(error.error.message)
          // }
          // else {
          //   this.utils.showSnackBar("Something went wrong")
          // }
          this.httpRequestStateService.finishRequestWithError(this.signinRequestState)
        }
      )
  }



  /**
   * Validatations message
   * */
  // getUsernameValidationMessage() {
  //   return this.username.hasError('required') ? 'You must provide username' : ''
  // }

  getEmailValidationMessage() {
    return this.email.hasError('required') ? 'You must provide email address' :
      this.email.hasError('email') ? 'Not a valid email address' : ''
  }
  getIndividualPasswordValidationMessage() {
    return this.passwordIndividual.hasError('required') ? 'You must provide password' : ''
  }
  getOrgPasswordValidationMessage() {
    return this.passwordOrg.hasError('required') ? 'You must provide password' : ''
  }

  getOrgIdValidationMessage() {
    return this.orgid.hasError('required') ? 'You must provide org id' : ""
  }

  getUserIdValidationMessage() {
    return this.userid.hasError('required') ? 'You must provide user email id' : ""
  }
  resetCaptcha() {
    if (this.signinTypeValue == this.IND) {
      this.recaptchaIndividual.reset()
    }
    else {
      this.reCaptchaOrg.reset()
    }
  }
  // getCaptchaValidationMessage() {
  //   return this.captcha.hasError('required') ? 'provide captcha' : ''
  // }

  // getCaptcha() {
  //   this.captcha.reset()
  //   this.captchaRequestState.subscription = this.authService.getCaptcha().subscribe((result) => {
  //     var image = document.createElement('img');
  //     image = document.querySelector(" #captchaimg ");
  //     image.src = window.URL.createObjectURL(result);
  //     this.logger.log(" captcha Created.. ")
  //   }, (error: HttpErrorResponse) => {

  //   })
  // }

  openSignupDialog() {
    const dialogRef = this.dialog.open(SignupComponent, {
      disableClose: true,
      // maxWidth: "320px ",
      // minWidth: "320px",
      // width: '96vw'
      width: '400px'
      // height: "100vh",
    })
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  openForgotPasswordDialog() {
    const dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {
      // disableClose: true ,
      // maxWidth: "320px ",
      // minWidth: "320px",
      width: '350px'
      // height: "100vh",
    })
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  getTotalTransactions() {
    this.httpRequestStateService.initRequest(this.getTotalTransactionsRequest)
    this.getTotalTransactionsRequest.subscription = this.authService.getTotalTransactions().subscribe((result: any) => {
      this.logger.debug("getTotalTransactions", result)
      if (result.status == this.appGlobals.HTTP_FAILED) {
        this.httpRequestStateService.finishRequestWithErrorAndNoErrorMessage(this.getTotalTransactionsRequest)
      }
      else if (result.low >= 0) {
        var res = result.low + ""
        while (res.length < 8) res = "0" + res;
        this.totalTransactions = res
        this.httpRequestStateService.finishRequest(this.getTotalTransactionsRequest)
      } else {
        this.httpRequestStateService.finishRequestWithErrorAndNoErrorMessage(this.getTotalTransactionsRequest)
      }

    }, (error: HttpErrorResponse) => {
      this.httpRequestStateService.finishRequestWithErrorAndNoErrorMessage(this.getTotalTransactionsRequest)
    })
  }
}
