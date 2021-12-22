import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AdminService } from 'src/app/core/services/admin.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { MatDialogRef } from '@angular/material/dialog';
import { AddUserRequest } from 'src/app/shared/models/add-user-request';
import { const_HTTP_RESPONSE } from 'src/app/shared/models/app-common-constants';
import { HttpErrorResponse } from '@angular/common/http';
import { DataService } from 'src/app/core/services/data.service';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit, OnDestroy {

  //form variable
  password: FormControl
  username: FormControl
  email: FormControl
  fullname: FormControl
  confirmpassword: FormControl
  centre: FormControl
  role: FormControl
  hidePassword = true;
  addUserFormGroup: FormGroup;

  //request variables
  addUserRequsetState: HttpRequestState = new HttpRequestState()
  getCentreListRequsetState: HttpRequestState = new HttpRequestState()
  getRoleListRequsetState: HttpRequestState = new HttpRequestState()

  //data variables
  centreList = [];
  roleList;
  permissionList;

  constructor(
    private logger: NGXLogger,
    private _formBuilder: FormBuilder,
    private adminService: AdminService,
    private utils: UtilsService,
    private dialogRef: MatDialogRef<AddUserComponent>,
    private dataService: DataService,
    private httpRequestStateService: HttpRequestStateService
  ) { }

  ngOnInit() {
    this.getCentreList()
    this.getRoleList()
    this.fullname = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(64), Validators.pattern('[a-zA-Z ]*')])
    this.username = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(18), Validators.pattern('[a-zA-Z][a-zA-Z0-9]*')])
    this.email = new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
    ])
    
    this.password = new FormControl('',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(18),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$])[A-Za-z\\d!@#$].{6,18}')
      ])
    this.confirmpassword = new FormControl('', [
      Validators.required, this.utils.matchOtherValidator('password')
    ])
    this.centre = new FormControl('', [Validators.required])
    this.role = new FormControl('', [Validators.required])

    this.addUserFormGroup = this._formBuilder.group({
      fullname: this.fullname,
      username: this.username,
      email: this.email,
      password: this.password,
      confirmpassword: this.confirmpassword,
      centre: this.centre,
      role: this.role,
    })
  }
  ngOnDestroy(): void {
    this.httpRequestStateService.destroyRequest(this.addUserRequsetState)
    this.httpRequestStateService.destroyRequest(this.getCentreListRequsetState)
    this.httpRequestStateService.destroyRequest(this.getRoleListRequsetState)

  }

  addUser() {
    this.httpRequestStateService.initRequest(this.addUserRequsetState)
    let addUserRequest: AddUserRequest = new AddUserRequest()
    addUserRequest = this.addUserFormGroup.value
    // this.logger.log(addUserRequest)
    this.addUserRequsetState.subscription = this.adminService.addUser(addUserRequest).subscribe(response => {
      this.logger.log("addUser: ", response)
      if (response.status == const_HTTP_RESPONSE.SUCCESS) {
        const dialogRef = this.utils.showDialog("Successful", "User Added Successfully");
        this.dialogRef.close(true)
        this.httpRequestStateService.finishRequest(this.addUserRequsetState)
      } else {
        this.utils.showSnackBar(response.message)
        // const dialogRef = this.utils.showDialog("Failed",response.message);
        // dialogRef.afterClosed().subscribe(result => {
        //   this.logger.log('closed')
        // });
        this.httpRequestStateService.finishRequestWithError(this.addUserRequsetState)
      }
    },
      (err: HttpErrorResponse) => {
        // this.logger.log(err.message);
        this.utils.showSnackBar("Something went wrong")
        this.httpRequestStateService.finishRequestWithError(this.addUserRequsetState)
      });
  }

  public getCentreList() {
    this.getCentreListRequsetState.subscription = this.dataService.getCentreList()
      .subscribe(response => {
        this.logger.debug(response)
        this.centreList = response
        this.centreList.sort((a, b) => {
          if (a.name < b.name) return -1;
          else if (a.name > b.name) return 1;
          else return 0;
        })

      });
  }

  public getRoleList() {
    this.getRoleListRequsetState.subscription = this.adminService.getRoles()
      .subscribe(response => {
        this.roleList = Object.keys(response);
        this.permissionList = Object.values(response)
        this.logger.log(this.roleList)
        this.logger.log(this.permissionList)
        // this.roleList = response;
      });
  }



  /**
   * Validation methods
   */
  getFullnameValidationMessage() {
    return this.fullname.hasError('required') ? 'You must provide fullname' :
      this.fullname.hasError('minlength') ? 'Fullname length should be minimum 6' :
        this.fullname.hasError('maxlength') ? 'Fullname length should be maximum 64' :
          this.fullname.hasError('pattern') ? 'Fullname should contains characters only  ' : ''
  }
  getUsernameValidationMessage() {
    return this.username.hasError('required') ? 'You must provide username' :
      this.username.hasError('minlength') ? 'Username length should be minimum 6' :
        this.username.hasError('maxlength') ? 'Username length should be maximum 18' :
          this.username.hasError ? 'Username must start with characters only No spaces and symbols are allowed' : ''
  }
  getEmailValidationMessage() {
    return this.email.hasError('required') ? 'You must provide email address' :
      this.email.hasError('email') ? 'Not a valid email address' :
      this.email.errors ? 'Not a valid email address' : ''
  }
  getPasswordValidationMessage() {
    return this.password.hasError('required') ? 'You must provide password' :
      this.password.hasError('minlength') ? 'Password should be minimum 6 characters long' :
        this.password.hasError('maxlength') ? 'Password should be maximum 18 characters long' :
          this.password.errors ? 'Must contain uppercase and lowercase letters, numbers and special characters' : ''
  }
  getConfirmPasswordValidationMessage() {
    return this.confirmpassword.hasError('required') ? 'You must confirm password' :
      this.confirmpassword.errors ? 'Password does not match' : ''
  }
  getCentreValidationMessage() {
    return this.role.hasError('required') ? 'You must select centre' : ''
  }
  getRoleValidationMessage() {
    return this.role.hasError('required') ? 'You must select role' : ''
  }
}
