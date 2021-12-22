import { Component, OnInit } from '@angular/core';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { PoeService } from 'src/app/core/services/poe.service';
import { const_HTTP_RESPONSE } from 'src/app/shared/models/app-common-constants';
import { HttpErrorResponse } from '@angular/common/http';
import { UtilsService } from 'src/app/core/services/utils.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-public-search',
  templateUrl: './public-search.component.html',
  styleUrls: ['./public-search.component.css']
})
export class PublicSearchComponent implements OnInit {
  searchRequestState: HttpRequestState = new HttpRequestState()
  searchForm: FormGroup
  searchKey: FormControl
  queryResponse
  queryResponseByRollno
  isSearchByRollNo = false
  isLoggedIn = false

  constructor(
    private logger: NGXLogger,
    private httpRequestStateService: HttpRequestStateService,
    private _formBuilder: FormBuilder,
    private poeService: PoeService,
    private utilsService: UtilsService,
    private authService: AuthService
  ) {
    this.searchKey = new FormControl('', Validators.required)
    this.searchForm = this._formBuilder.group({
      searchBy: 'hash',
      searchKey: this.searchKey
    });
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn()
  }
  getHintAndValidator() {
    this.searchKey.updateValueAndValidity()
    var hint = "Enter Hash"
    const formValue = this.searchForm.value
    if (formValue.searchBy == 'hash') {
      hint = "Enter 64 character long certificate hash"
      this.searchKey.setValidators([Validators.pattern('[0-9a-zA-Z]{64}$'), Validators.required])
    }
    else if (formValue.searchBy == 'txnId') {
      hint = "Enter 64 character long transaction id"
      this.searchKey.setValidators([Validators.pattern('[0-9a-zA-Z]{64}$'), Validators.required])
    }
    else if (formValue.searchBy == 'rollNo') {
      hint = "Enter 12 digit roll number"
      this.searchKey.setValidators([Validators.pattern('[0-9]{12}$'), Validators.required])
    }
    else {
      var hint = "Enter"
      return hint
    }
    return hint
  }


  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.httpRequestStateService.destroyRequest(this.searchRequestState)
  }

  searchInPoe() {
    const formValue = this.searchForm.value
    if (formValue.searchBy == 'hash') {
      this.isSearchByRollNo = false
      this.searchByHash(formValue.searchKey);
    }
    else if (formValue.searchBy == 'txnId') {
      this.isSearchByRollNo = false
      this.searchByTxId(formValue.searchKey);
    }
    else if (formValue.searchBy == 'rollNo') {
      this.isSearchByRollNo = true
      this.searchByRollNo(formValue.searchKey);
    }
    else {
      // this.logger.log('invalid')
    }
  }


  public searchByHash(hash) {
    this.httpRequestStateService.initRequest(this.searchRequestState)
    this.searchRequestState.subscription = this.poeService.searchByHash(hash).subscribe(result => {
      this.logger.log("searchByHash", result);
      if (result.status === const_HTTP_RESPONSE.SUCCESS) {
        if(!result.result.found){
          this.httpRequestStateService.finishRequestWithError(this.searchRequestState, "Document Not Found")
          return
        }
        this.queryResponse = result
        this.httpRequestStateService.finishRequest(this.searchRequestState)
      } else {
        this.utilsService.showSnackBar(result.message)
        this.httpRequestStateService.finishRequestWithError(this.searchRequestState)
      }
    }, (err: HttpErrorResponse) => {
      this.utilsService.showSnackBar("Something went wrong, Please try later")
      this.httpRequestStateService.finishRequestWithError(this.searchRequestState)
    });
  }

  public searchByTxId(txnId) {
    this.httpRequestStateService.initRequest(this.searchRequestState)
    this.searchRequestState.subscription = this.poeService.searchByTxId(txnId).subscribe(result => {
      this.logger.log("searchByTxId", result);
      if (result.status === const_HTTP_RESPONSE.SUCCESS) {
        if(!result.result.found){
          this.httpRequestStateService.finishRequestWithError(this.searchRequestState, "Document Not Found")
          return
        }
        this.queryResponse = result
        this.httpRequestStateService.finishRequest(this.searchRequestState)
      } else {
        this.httpRequestStateService.finishRequestWithError(this.searchRequestState)
        this.utilsService.showSnackBar(result.message)
      }
    }, (err: HttpErrorResponse) => {
      this.httpRequestStateService.finishRequestWithError(this.searchRequestState)
      this.utilsService.showSnackBar("Something went wrong, Please try later")
    });
  }

  public searchByRollNo(rollNo) {
    this.httpRequestStateService.initRequest(this.searchRequestState)
    this.searchRequestState.subscription = this.poeService.searchByRollNo(rollNo).subscribe(result => {
      this.logger.log("searchByRollNo", result);
      if (result.status === const_HTTP_RESPONSE.SUCCESS) {
      // if (result.length) {
        if(!result.result.length){
          this.httpRequestStateService.finishRequestWithEmptyResponse(this.searchRequestState)  
          return
        }
        this.queryResponseByRollno = result.result
        // this.queryResponse = result
        this.httpRequestStateService.finishRequest(this.searchRequestState)
      } else {
        this.searchRequestState.msgToUser = result.message
        this.httpRequestStateService.finishRequestWithError(this.searchRequestState, result.message)
        // this.utilsService.showSnackBar(result.message)
      }
    }, (err: HttpErrorResponse) => {
      this.httpRequestStateService.finishRequestWithError(this.searchRequestState)
      this.utilsService.showSnackBar("Something went wrong, Please try later")
    });
  }


}
