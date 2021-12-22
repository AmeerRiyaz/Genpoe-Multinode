import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { UserService } from '../../../services/user.service';
import { NGXLogger } from 'ngx-logger';
import { AppGlobals } from 'src/app/config/app-globals';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {

  //form variable
  
  userFullName: FormControl
  userEmail: FormControl
  userPasswd: FormControl
  userConfPasswd: FormControl
  hidePassword = true;

  addUserFormGroup: FormGroup;
  addUserRequsetState: HttpRequestState = new HttpRequestState()
  constructor(
    private httpRequestStateService: HttpRequestStateService,
    private _formBuilder: FormBuilder,
    private utils: UtilsService,
    private userService: UserService,
    private logger : NGXLogger,
    private appGlobals: AppGlobals,
    private dialogRef: MatDialogRef<AddUserComponent>,
  ) { }

  ngOnInit() {

    this.userFullName = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(64), Validators.pattern('[a-zA-Z ]*')])
    // this.username = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(18), Validators.pattern('[a-zA-Z][a-zA-Z0-9]*')])
    this.userEmail = new FormControl('', [Validators.required, Validators.email])

    this.userPasswd = new FormControl('',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(18),
        Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{6,}')
      ])
    this.userConfPasswd = new FormControl('', [
      Validators.required, this.utils.matchOtherValidator('userPasswd')
    ])

    this.addUserFormGroup = this._formBuilder.group({
      userFullName: this.userFullName,
      userEmail: this.userEmail,
      userPasswd: this.userPasswd,
      userConfPasswd: this.userConfPasswd
    })
  }


  addUser() {
    this.httpRequestStateService.initRequest(this.addUserRequsetState)
    let addUserRequest = this.addUserFormGroup.value
    this.logger.log(addUserRequest)
    this.addUserRequsetState.subscription = this.userService.addUser(addUserRequest).subscribe((response:any) => {
      this.logger.log("addUser: ", response)
      if (response.status == this.appGlobals.HTTP_SUCCESS) {
        const dialogRef = this.utils.showAlertDialog("Successful", "User Added Successfully");
        this.dialogRef.close(true)
        this.httpRequestStateService.finishRequest(this.addUserRequsetState)
      } else {
        console.log(response.message)
        this.utils.showSnackBar(response.message)
        // const dialogRef = this.utils.showDialog("Failed",response.message);
        // dialogRef.afterClosed().subscribe(result => {
        //   this.logger.log('closed')
        // });
        this.httpRequestStateService.finishRequestWithErrorAndNoErrorMessage(this.addUserRequsetState)
      }
    },
      (err: HttpErrorResponse) => {
        this.utils.showSnackBar("Something went wrong")
        this.httpRequestStateService.finishRequestWithError(this.addUserRequsetState)
      });  }


  /**
   * Validation methods
   */
  getFullnameValidationMessage() {
    return this.userFullName.hasError('required') ? 'You must provide fullname' :
      this.userFullName.hasError('minlength') ? 'Fullname length should be minimum 6' :
        this.userFullName.hasError('maxlength') ? 'Fullname length should be maximum 64' :
          this.userFullName.hasError('pattern') ? 'Fullname should contains characters only  ' : ''
  }
  // getUsernameValidationMessage() {
  //   return this.username.hasError('required') ? 'You must provide username' :
  //     this.username.hasError('minlength') ? 'Username length should be minimum 6' :
  //       this.username.hasError('maxlength') ? 'Username length should be maximum 18' :
  //         this.username.hasError ? 'Username must start with characters only No spaces and symbols are allowed' : ''
  // }
  getEmailValidationMessage() {
    return this.userEmail.hasError('required') ? 'You must provide email address' :
      this.userEmail.hasError('email') ? 'Not a valid email address' : ''
  }
  getPasswordValidationMessage() {
    return this.userPasswd.hasError('required') ? 'You must provide password' :
      this.userPasswd.hasError('minlength') ? 'Password should be minimum 6 characters long' :
        this.userPasswd.hasError('maxlength') ? 'Password should be maximum 18 characters long' :
          this.userPasswd.errors ? 'Must contain uppercase and lowercase letters, numbers and special characters' : ''
  }
  getConfirmPasswordValidationMessage() {
    return this.userConfPasswd.hasError('required') ? 'You must confirm password' :
      this.userConfPasswd.errors ? 'Password does not match' : ''
  }

}
