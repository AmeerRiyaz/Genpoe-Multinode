import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService, router_paths } from 'src/app/core/auth/auth.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { StudentSignupRequest } from 'src/app/shared/models/student-signup-request';
import { StudentService } from 'src/app/core/services/student.service';
import { HttpErrorResponse } from '@angular/common/http';
import { const_HTTP_RESPONSE } from 'src/app/shared/models/app-common-constants';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';

@Component({
  selector: 'app-student-signup',
  templateUrl: './student-signup.component.html',
  styleUrls: ['./student-signup.component.css']
})
export class StudentSignupComponent implements OnInit, OnDestroy {

  //Form variables
  username: FormControl
  rollNo: FormControl
  password: FormControl
  //  ['', Validators.required],
  confirmpassword: FormControl
  signupFormGroup: FormGroup;
  hidePassword = true;

  //Request variables
  signupRequestState: HttpRequestState = new HttpRequestState();

  displayMessage: boolean = false

  constructor(
    private authService: AuthService,
    private studentService: StudentService,
    private _formBuilder: FormBuilder,
    private utils: UtilsService,
    private router: Router,
    private dialogRef:MatDialogRef<StudentSignupComponent>,
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
    this.username = new FormControl('', [Validators.required, Validators.minLength(6),Validators.maxLength(18)])
    this.rollNo = new FormControl('', [Validators.required, Validators.minLength(12), Validators.maxLength(12)])
    this.password = new FormControl('', 
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(18),
          Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{6,}')
        ])
    this.confirmpassword = new FormControl('', [
      Validators.required, this.utils.matchOtherValidator('password')
    ])

    //signup form
    this.signupFormGroup = this._formBuilder.group({
      username: this.username,
      rollNo: this.rollNo,
      password: this.password,
      confirmpassword: this.confirmpassword,
    })
  }

  signup() {
    this.httpRequestStateService.initRequest(this.signupRequestState)
    let studentSignupRequest = new StudentSignupRequest()
    studentSignupRequest = this.signupFormGroup.value;

    this.signupRequestState.subscription = this.studentService.signup(studentSignupRequest).subscribe(response => {
      if (response.status == const_HTTP_RESPONSE.SUCCESS) {
        this.displayMessage = true
        this.httpRequestStateService.finishRequest(this.signupRequestState)
      } else {
        this.utils.showSnackBar(response.message)
        this.httpRequestStateService.finishRequestWithError(this.signupRequestState)
      }
    },
      (err: HttpErrorResponse) => {
        this.utils.showSnackBar("Something went wrong")
        this.httpRequestStateService.finishRequestWithError(this.signupRequestState)
      });
  }

  closeDialog(){
    this.dialogRef.close()
  }

  getUsernameValidationMessage() {
    return this.username.hasError('required') ? 'You must provide username' :
      this.username.hasError('minlength') ? 'Username length should be minimum 6' : 
      this.username.hasError('maxlength') ? 'Username length should be maximum 18' : ''
  }

  getRollNoValidationMessage() {
    return this.rollNo.hasError('required') ? 'You must provide roll no' :
      this.rollNo.errors ? 'Invalid roll no' : ''
  }

  getPasswordValidationMessage() {
    return this.password.hasError('required') ? 'You must provide password' :
      this.password.hasError('minlength') ? 'Password should be minimum 6 characters long' :
      this.password.hasError('maxlength') ? 'Password should be maximum 18 characters long' : 
      this.password.errors ? 'Must contain uppercase and lowercase letters, numbers and special characters' : ''
  }
  getConfirmPasswordValidationMessage(){
    return this.confirmpassword.hasError('required') ? 'You must confirm password' :
      this.confirmpassword.errors ? 'Password does not match' : ''
  }
}
