import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { UtilsService } from 'src/app/core/services/utils.service';
import { AuthService, router_paths } from 'src/app/core/auth/auth.service';
import { const_HTTP_RESPONSE } from 'src/app/shared/models/app-common-constants';
import { HttpErrorResponse } from '@angular/common/http';
import { VerifierService } from 'src/app/core/services/verifier.service';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { Subscription } from 'rxjs';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-verifier-signin',
  templateUrl: './verifier-signin.component.html',
  styleUrls: ['./verifier-signin.component.css']
})
export class VerifierSigninComponent implements OnInit, OnDestroy {

  //form variables
  loginFormGroup: FormGroup;
  email: FormControl
  captchaval:FormControl
  //request variables
  verifierLoginRequestState: HttpRequestState = new HttpRequestState();

  constructor(
    private logger: NGXLogger,
    private verifierService: VerifierService,
    private authService: AuthService,
    private _formBuilder: FormBuilder,
    private utils: UtilsService,
    private httpRequestStateService: HttpRequestStateService

  ) { }
  ngOnInit() {
    this.initForm()
  }
  ngOnDestroy(): void {
    this.httpRequestStateService.destroyRequest(this.verifierLoginRequestState)
  }
  initForm() {
    this.email = new FormControl('', [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]);
    this.captchaval = new  FormControl('', [Validators.required, Validators.minLength(4)])
    this.loginFormGroup = this._formBuilder.group({
      email: this.email,
      captchaval: this.captchaval
    })
    this.getCaptcha()
  }
  /**
   * Start login process
   */
  initLoginVerifier() {
    // this.authService.redirect(router_paths.VR)
    // this.captchaVeriScript(this.captchaval.value)
    this.httpRequestStateService.initRequest(this.verifierLoginRequestState)

    this.verifierLoginRequestState.subscription = this.verifierLoginRequestState.subscription = 
    this.verifierService.verify(
      {
        email: this.loginFormGroup.value.email,
        captchaval: this.loginFormGroup.value.captchaval
      }
    ).subscribe((response) => {
        // this.logger.log("initLogin response", response)
        if (response) {
          this.verifierService.setData(response);
          this.authService.redirect(router_paths.VR)
          this.httpRequestStateService.finishRequest(this.verifierLoginRequestState)
        } else {
          this.verifierLoginRequestState.msgToUser = response.message
          this.utils.showSnackBar(this.verifierLoginRequestState.msgToUser)
          this.httpRequestStateService.finishRequestWithError(this.verifierLoginRequestState)
        }
      },
        (error: HttpErrorResponse) => {
          // this.logger.log("error");
          this.utils.showSnackBar("Something went wrong")
          this.httpRequestStateService.finishRequestWithError(this.verifierLoginRequestState)
        }
      )
  }
  /**
   * Validatations message
   * */
  getEmailValidationMessage() {
    return this.email.hasError('required') ? 'You must provide email address' :
      this.email.hasError('email') ? 'Not a valid email address' : 
      this.email.errors ? 'Not a valid email address' : ''
  }
  getCaptchaValidationMessage() {
    return this.captchaval.hasError('required') ? 'You must provide captcha' : ''
  }
  getCaptcha() {
     this.authService.getCaptcha().subscribe(result => {
      var image = document.createElement('img');
      image = document.querySelector("#captchaimg");
      image.src = window.URL.createObjectURL(result);
      //document.body.insertAdjacentElement("afterbegin", image);
      // this.image=image
      this.logger.log("captcha Created..")
      // this.logger.log(image.src)
    }
      , (error: HttpErrorResponse) => {
        this.logger.log("error handling...", error)
      })
  }
  // captchaVeriScript(captchaval) {
    
  //    this.authService.getCaptcha().subscribe(result => {
  //     // this.logger.log(result)

  //   }, (error: HttpErrorResponse) => {
  //     // this.errorcode = error.status + '...' + error.error
  //     // this.isChecked=false/
  //     // this.isCaptchaValid=false
  //     this.getCaptcha()

  //   });
  //   // this.logger.log(subscription)
  // }

}
