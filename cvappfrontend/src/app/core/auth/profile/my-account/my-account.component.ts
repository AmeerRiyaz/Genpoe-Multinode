import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../auth.service';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { UtilsService } from 'src/app/core/services/utils.service';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { ProfileService } from '../services/profile.service';
import { NGXLogger } from 'ngx-logger';
import { const_HTTP_RESPONSE } from 'src/app/shared/models/app-common-constants';
import { HttpErrorResponse } from '@angular/common/http';
import { MatExpansionPanel } from '@angular/material/expansion';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {

  // username: FormControl
  newpassword: FormControl
  password: FormControl
  confirmpassword: FormControl
  hidePassword = true;
  changePasswordFormGroup: FormGroup;
  changePasswordRequsetState: HttpRequestState = new HttpRequestState()

  @ViewChild('pwdpanel', { static: false }) pwdpanel: MatExpansionPanel

  constructor(
    public authService: AuthService,
    private utils: UtilsService,
    private _formBuilder: FormBuilder,
    private httpRequestStateService: HttpRequestStateService,
    private profileService: ProfileService,
    private logger: NGXLogger
  ) { }

  ngOnInit() {

    // this.username = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(18), Validators.pattern('[a-zA-Z][a-zA-Z0-9]*')])
    this.password = new FormControl('',
      [
        Validators.required,
        // Validators.minLength(6),
        // Validators.maxLength(18),
        // Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{6,}')
      ])
    this.newpassword = new FormControl('',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(18),
        Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{6,}'),
        this.utils.nonequalPasswordValidator('password')
      ])
    this.confirmpassword = new FormControl('', [
      Validators.required, this.utils.matchOtherValidator('newpassword')
    ])

    this.changePasswordFormGroup = this._formBuilder.group({
      username: this.authService.getCurrentUser(),
      password: this.password,
      newpassword: this.newpassword,
      confirmpassword: this.confirmpassword,
    })
  }

  changePassword() {
    const changePasswordRequest: any = this.changePasswordFormGroup.value
    this.logger.log("changePassword request:", changePasswordRequest)
    this.httpRequestStateService.initRequest(this.changePasswordRequsetState)
    this.changePasswordRequsetState.subscription = this.profileService.changePassword(changePasswordRequest).subscribe(
      (changeresult: any) => {
        this.logger.log("changePassword res:", changeresult)
        if (changeresult.status === const_HTTP_RESPONSE.SUCCESS) {
          var dialog = this.utils.showDialog(changeresult.status, changeresult.message)
          this.httpRequestStateService.finishRequest(this.changePasswordRequsetState)
          this.pwdpanel.close()
          this.changePasswordFormGroup.reset()
          this.utils.showSnackBar('Your will be logged out autmoatically, please login again')
          setTimeout(() => {
            dialog.close()
            this.authService.logout()
          }, 2000);
        } else {
          this.utils.showDialog(changeresult.status, changeresult.message)
          this.httpRequestStateService.finishRequestWithError(this.changePasswordRequsetState)
        }
      }, (err: HttpErrorResponse) => {
        this.httpRequestStateService.finishRequestWithError(this.changePasswordRequsetState)
        this.utils.showSnackBar("Something went wrong")
      }
    )
  }

  getPasswordValidationMessage() {
    return this.password.hasError('required') ? 'You must provide password' : ""
      // this.password.hasError('minlength') ? 'Invalid password' :
      //   this.password.hasError('maxlength') ? 'Invalid password' :
          // this.password.errors ? 'Invalid password' : ''
  }

  getNewPasswordValidationMessage() {
    return this.newpassword.hasError('required') ? 'You must provide password' :
      this.newpassword.hasError('minlength') ? 'Password should be minimum 6 characters long' :
        this.newpassword.hasError('maxlength') ? 'Password should be maximum 18 characters long' :
          this.password.value == this.newpassword.value ? 'New & curent password can not be same' :
            this.newpassword.errors ? 'Must contain uppercase and lowercase letters, numbers and special characters' : ''
  }

  getConfirmPasswordValidationMessage() {
    return this.confirmpassword.hasError('required') ? 'You must confirm password' :
      this.confirmpassword.errors ? 'Password does not match' : ''
  }

}
