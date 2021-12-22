import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { const_HTTP_RESPONSE } from 'src/app/shared/models/app-common-constants';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { LoginRequest } from 'src/app/shared/models/login-request';
import { LoginResponse } from 'src/app/shared/models/login-response';
import { HttpRequestStateService } from '../../services/http-request-state.service';
import { UtilsService } from '../../services/utils.service';
import { AuthService } from '../auth.service';
import { NGXLogger } from 'ngx-logger';
import { AppGlobals } from 'src/app/configs/app-globals';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  //Form variables
  password: FormControl
  username: FormControl
  // captchaval: FormControl
  reCaptcha: FormControl
  loginFormGroup: FormGroup;

  hidePassword = true;
  // image: any
  // iscaptchaChecked: boolean = false;
  // isCheckbox: boolean = false
  // isCaptchaValid: boolean = false
  loginRequestState: HttpRequestState = new HttpRequestState()
  // CaptchaRequestState: HttpRequestState = new HttpRequestState()
  constructor(
    public appGlobals: AppGlobals,
    private logger: NGXLogger,
    private authService: AuthService,
    private _formBuilder: FormBuilder,
    private utils: UtilsService,
    private httpRequestStateService: HttpRequestStateService
  ) { }


  ngOnInit() {
    this.initComponent();
    if (this.authService.isLoggedIn()) {
      this.authService.redirectAsPerRole();
      return
    }
  }
  ngOnDestroy() {
    this.httpRequestStateService.destroyRequest(this.loginRequestState)
  }


  /**
   * Initialize required things
   */
  initComponent() {
    this.username = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(18), Validators.pattern('[a-zA-Z][a-zA-Z0-9]*')])
    this.password = new FormControl('', [Validators.required, Validators.minLength(6)])
    // this.captchaval = new FormControl('', [Validators.required, Validators.minLength(4), Validators.pattern("[a-zA-Z0-9]*")])
    this.reCaptcha = new FormControl(null, Validators.required)
    //login form
    this.loginFormGroup = this._formBuilder.group({
      username: this.username,
      password: this.password,
      // captchaval: this.captchaval,
      recaptcha: this.reCaptcha
    })
    // this.getCaptcha()
  }

  /**
   * Start login process
   */
  initLogin() {


    // this.captchaVeriScript(this.captchaval.value)
    this.httpRequestStateService.initRequest(this.loginRequestState)
    const loginRequest: LoginRequest = this.loginFormGroup.value
    this.logger.log("login request:", loginRequest)
    this.loginRequestState.subscription = this.authService.login(loginRequest)
      .subscribe((response: LoginResponse) => {
        this.logger.log("initLogin response", response)
        if (response.status == const_HTTP_RESPONSE.SUCCESS) {
          this.httpRequestStateService.finishRequest(this.loginRequestState)
          this.authService.redirectAsPerRole();
        } else {
          this.resetCaptcha()
          this.loginRequestState.msgToUser = response.message
          this.utils.showSnackBar(this.loginRequestState.msgToUser)
          this.httpRequestStateService.finishRequestWithError(this.loginRequestState)
          // this.getCaptcha()
        }
      },
        (error: HttpErrorResponse) => {
          this.resetCaptcha()
          // this.logger.log(error);
          if (error.status == 401) {
            this.utils.showSnackBar(error.error.message)
            // this.getCaptcha()
          }
          else {
            this.utils.showSnackBar("Something went wrong")
          }
          this.httpRequestStateService.finishRequestWithError(this.loginRequestState)
        }
      )
  }

  getUsernameValidationMessage() {
    return this.username.hasError('required') ? 'You must provide username' : ''
      // this.username.hasError('minlength') ? 'Username length should be minimum 5' :
      //   this.username.hasError('maxlength') ? 'Username length should be maximum 64' :
      //     this.username.hasError('pattern') ? ' Enter valid username ' : ''

  }

  getPasswordValidationMessage() {
    return this.password.hasError('required') ? 'You must provide password' : ''
      // this.password.hasError('minlength') ? 'Password should be minimum 6 characters long' : ''
  }

  // getCaptchaValidationMessage() {
  //   return this.captchaval.hasError('required') ? 'You must provide captcha' :
  //     this.captchaval.hasError('pattern') ? ' spaces are not allowed' : ''
  // }

  resetCaptcha(){
    this.reCaptcha.reset()
  }
  // getCaptcha() {
  //   // this.captchaval.reset()
  //   this.CaptchaRequestState.subscription = this.authService.getCaptcha().subscribe((result) => {
  //     var image = document.createElement('img');
  //     image = document.querySelector(" #captchaimg ");
  //     image.src = window.URL.createObjectURL(result);
  //     this.logger.log(" captcha Created.. ")
  //   }, (error: HttpErrorResponse) => {
  //     // this.logger.log("error handling...", error)
  //   })
  // }
}



/* getcapcha()
  // this.logger.log(result)
     // this.logger.log(JSON.parse(JSON.stringify(result)))
     // var data=new Blob([JSON.parse(JSON.stringify(result.data))], {type :'image/svg+xml'})
    //  this.logger.log(data);
  // var  results=([JSON.parse(JSON.stringify(result))
    //   var res1=fetch('http://10.244.0.144:7002/captcha',{method:'GET',headers: {"Content-Type": "blob"},})
  //   .then((response: any) => {
  //     this.response = response;
  //     this.logger.log(response.status)
  //     this.logger.log(Promise.resolve(this.response));
  //  })
  //   .catch((error) => {
  //     this.logger.log(error.message);

  //     return error.message;
  //  });
  //   this.logger.log(res1)
   // this.logger.log(result)

      // var data=new Blob([JSON.parse(JSON.stringify(result.data))], {type :'image/svg+xml'})
      // this.logger.log(data);
      // var image = document.createElement('img');
      // image = document.querySelector("#captchaimg");
      // image.src = window.URL.createObjectURL(data);
      //document.body.insertAdjacentElement("afterbegin", image);
      // this.image=image

*/