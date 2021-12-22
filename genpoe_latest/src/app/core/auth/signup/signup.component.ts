import { Component, OnInit, HostListener } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { AuthService } from '../services/auth.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material';
import { HttpRequestStateService } from '../../services/http-request-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppGlobals } from 'src/app/config/app-globals';
import { SignupRequest } from 'src/app/shared/models/signup-request';
import { NGXLogger } from 'ngx-logger';
import { SignupRequestOrg } from 'src/app/shared/models/signup-request-org';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  //Form variables
  signupFormGroup: FormGroup;
  fullname: FormControl
  username: FormControl
  password: FormControl
  confpass: FormControl
  email: FormControl
  reCaptcha: FormControl


  //Form variables org 
  orgFormArray: FormArray
  signupOrgFormGroup: FormGroup
  userOrgName: FormControl
  userOrgAdminemail: FormControl
  userOrgID: FormControl
  userOrgAdminpassword: FormControl
  userOrgAdminconfpass: FormControl
  orgPhone: FormControl
  orgreCaptcha: FormControl

  hidePassword = true;

  //Request variables
  signupRequestState: HttpRequestState = new HttpRequestState();

  displayMessage: boolean = false
  signupResponse
  IND = "Individual"
  ORG = "Organization"
  signinType = [this.IND, this.ORG]

  signupTypeValue = this.IND

  constructor(
    private logger: NGXLogger,
    public appGlobals: AppGlobals,
    private authService: AuthService,
    private _formBuilder: FormBuilder,
    private utils: UtilsService,
    private router: Router,
    private dialogRef: MatDialogRef<SignupComponent>,
    private httpRequestStateService: HttpRequestStateService
  ) { }

  ngOnInit() {
    this.initComponent();
  }
  ngOnDestroy(): void {
    this.httpRequestStateService.destroyRequest(this.signupRequestState)
  }
  /**
   * Initialize required things
   */
  initComponent() {
    this.fullname = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(64), Validators.pattern('[a-zA-Z ]*')])
    this.username = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(18), Validators.pattern('[a-zA-Z][a-zA-Z0-9]*')])
    this.password = new FormControl('',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(64),
        // Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{6,}')
        Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$])[A-Za-z\d!@#$].{6,64}'),
      ])
    this.confpass = new FormControl('', [
      Validators.required, this.utils.matchOtherValidator('password')
    ])
    this.email = new FormControl('', [Validators.required, Validators.email])
    this.reCaptcha = new FormControl(null, Validators.required)



    this.userOrgName = new FormControl('', [Validators.required])
    this.userOrgAdminemail = new FormControl('', [Validators.required, Validators.email])
    this.userOrgID = new FormControl('', [Validators.required, Validators.pattern("^[a-zA-Z0-9]{3,10}$")])
    this.userOrgAdminpassword = new FormControl('',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(64),
        // Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{6,}')
        Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$])[A-Za-z\d!@#$].{6,64}'),
      ])
    this.userOrgAdminconfpass = new FormControl('', [
      Validators.required, this.utils.matchOtherValidator('userOrgAdminpassword')
    ])
    this.orgPhone = new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)])
    this.orgreCaptcha = new FormControl(null, Validators.required)


    //signup form
    this.signupFormGroup = this._formBuilder.group({
      fullname: this.fullname,
      // username: this.username,
      password: this.password,
      confpass: this.confpass,
      email: this.email,
      recaptcha: this.reCaptcha
      // orgName: this.orgName,
    })

    //Signup org form 
    // this.signupOrgFormGroup = this._formBuilder.group({
    //   orgname: this.orgname,
    //   orgemail: this.orgemail,
    //   orgid: this.orgid,
    //   orgpassword: this.orgpassword,
    //   orgconfpass: this.orgconfpass,
    //   orgphone: this.orgphone,
    //   recaptcha: this.orgreCaptcha
    // })

    this.orgFormArray = this._formBuilder.array([
      this._formBuilder.group({
        userOrgName: this.userOrgName,
        userOrgAdminemail: this.userOrgAdminemail,
        fullName: new FormControl("Admin"),
        userOrgID: this.userOrgID,
        orgPhone: this.orgPhone,
      }),
      this._formBuilder.group({
        userOrgAdminpassword: this.userOrgAdminpassword,
        userOrgAdminconfpass: this.userOrgAdminconfpass,
        recaptcha: this.orgreCaptcha
      })
    ], Validators.required)
    this.signupOrgFormGroup = this._formBuilder.group({
      "orgFormArray": this.orgFormArray,
    })
  }

  signupTypeChanged(sigupType) {
    this.signupTypeValue = sigupType
    this.logger.log(this.signupTypeValue)
    // this.signinUserFormGroup.reset()
    // this.signinOrgFormGroup.reset()
    this.resetCaptcha()
  }


  signup() {
    this.httpRequestStateService.initRequest(this.signupRequestState)
    let signupRequest = new SignupRequest()
    signupRequest = this.signupFormGroup.value;
    signupRequest.attr = "genpoeuser"
    this.disableDialogClose()
    this.logger.log(signupRequest)
    this.signupRequestState.subscription = this.authService.signup(signupRequest).subscribe(response => {
      this.signupResponse = response
      this.logger.log(response)
      if (response.status == this.appGlobals.HTTP_SUCCESS) {
        this.displayMessage = true
        this.httpRequestStateService.finishRequest(this.signupRequestState)
        this.enableDialogClose()
      } else {

        // this.utils.showSnackBar(response.message)
        this.signupRequestState.msgToUser = response.message
        this.httpRequestStateService.finishRequestWithError(this.signupRequestState)
        this.enableDialogClose()
        this.resetCaptcha()
      }
    },
      (err: HttpErrorResponse) => {
        this.utils.showSnackBar("Something went wrong")
        this.httpRequestStateService.finishRequestWithError(this.signupRequestState)
        this.enableDialogClose()
        this.resetCaptcha()
      });
    // @HostListener('window:keyup.esc') onKeyUp() {
    //   this.dialogRef.close();
    // }
  }



  signupOrg() {
    this.httpRequestStateService.initRequest(this.signupRequestState)
    let signupRequest = new SignupRequestOrg()
    signupRequest = this.signupOrgFormGroup.value.orgFormArray[0];
    signupRequest.recaptcha = this.signupOrgFormGroup.value.orgFormArray[1].recaptcha;
    signupRequest.userOrgAdminconfpass = this.signupOrgFormGroup.value.orgFormArray[1].userOrgAdminconfpass;
    signupRequest.userOrgAdminpassword = this.signupOrgFormGroup.value.orgFormArray[1].userOrgAdminpassword;
    this.disableDialogClose()
    this.logger.log(signupRequest)
    this.signupRequestState.subscription = this.authService.signupOrg(signupRequest).subscribe(response => {
      this.signupResponse = response
      this.logger.log(response)
      if (response.status == this.appGlobals.HTTP_SUCCESS) {
        this.displayMessage = true
        this.httpRequestStateService.finishRequest(this.signupRequestState)
        this.enableDialogClose()
      } else {

        // this.utils.showSnackBar(response.message)
        this.signupRequestState.msgToUser = response.message
        this.httpRequestStateService.finishRequestWithError(this.signupRequestState)
        this.enableDialogClose()
        this.resetOrgCaptcha()
      }
    },
      (err: HttpErrorResponse) => {
        this.utils.showSnackBar("Something went wrong")
        this.httpRequestStateService.finishRequestWithError(this.signupRequestState)
        this.enableDialogClose()
        this.resetOrgCaptcha()
      });
    // @HostListener('window:keyup.esc') onKeyUp() {
    //   this.dialogRef.close();
    // }
  }




  /**
   * allow close on escape 
   */
  @HostListener('window:keyup.esc') onKeyUp() {
    this.dialogRef.close()
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

  getUsernameValidationMessage() {
    return this.username.hasError('required') ? 'You must provide username' :
      this.username.hasError('minlength') ? 'Username length should be minimum 6' :
        this.username.hasError('maxlength') ? 'Username length should be maximum 18' :
          this.username.hasError ? 'Username must start with characters only No spaces and symbols are allowed' : ''
  }


  getPasswordValidationMessage() {
    return this.password.hasError('required') ? 'You must provide password' :
      this.password.hasError('minlength') ? 'Password should be minimum 6 characters long' :
        this.password.hasError('maxlength') ? 'Password should be maximum 64 characters long' :
          this.password.errors ? 'Must contain uppercase and lowercase letters, numbers and special characters' : ''
  }

  getConfirmPasswordValidationMessage() {
    return this.confpass.hasError('required') ? 'You must confirm password' :
      this.confpass.errors ? 'Password does not match' : ''
  }
  /**
   * Validatations message
   * */
  getEmailValidationMessage() {
    return this.email.hasError('required') ? 'You must provide email address' :
      this.email.hasError('email') ? 'Not a valid email address' : ''
  }

  getFullnameValidationMessage() {
    return this.fullname.hasError('required') ? 'You must provide full name' : this.fullname.hasError('minlength') ? 'Fullname length should be minimum 6' : this.fullname.hasError('maxlength') ? 'Fullname length should be maximum 64' : this.fullname.hasError('pattern') ? 'Fullname should contains characters only' : '';
  }

  getOrgnameValidationMessage() {
    return this.userOrgName.hasError('required') ? 'You must provide org name' : ''
  }

  getPhoneNumberValidationMessage() {
    return this.orgPhone.hasError('required') ? 'You must provide org phone number' : ''
  }
  getOrgIdValidationMessage() {
    return this.userOrgID.hasError('required') ? 'You must provide org id' : ""
  }

  resetCaptcha() {
    this.reCaptcha.reset()
  }

  resetOrgCaptcha() {
    this.orgreCaptcha.reset()
  }
  
}
