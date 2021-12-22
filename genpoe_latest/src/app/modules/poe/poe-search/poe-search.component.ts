import { Component, OnInit } from '@angular/core';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NGXLogger } from 'ngx-logger';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { PoeService } from '../services/poe.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { AppGlobals } from 'src/app/config/app-globals';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-poe-search',
  templateUrl: './poe-search.component.html',
  styleUrls: ['./poe-search.component.css']
})
export class PoeSearchComponent implements OnInit {
  searchRequestState: HttpRequestState = new HttpRequestState()
  searchForm: FormGroup
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
    private authService: AuthService,
    public appGlobals: AppGlobals
  ) {
    this.searchForm = this._formBuilder.group({
      searchBy: 'hash',
      searchKey: ['', [Validators.required, Validators.pattern('^[a-fA-F0-9]{64}')]]
    });
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn()
  }
  getHint() {
    var hint = "Enter Hash"
    const formValue = this.searchForm.value
    if (formValue.searchBy == 'hash') {
      hint = "Enter hash"
    }
    else if (formValue.searchBy == 'txnId') {
      hint = "Enter transaction id"
    }
    else {
      var hint = "Enter"
      return hint
    }
    return hint
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
    else {
      // this.logger.log('invalid')
    }
  }


  public searchByHash(hash) {
    this.httpRequestStateService.initRequest(this.searchRequestState)
    this.searchRequestState.subscription = this.poeService.searchByHash(hash).subscribe(result => {
      this.logger.log("searchByHash", result);
      if (result.status === this.appGlobals.HTTP_SUCCESS) {
        this.queryResponse = result
        this.httpRequestStateService.finishRequest(this.searchRequestState)
      } else {
        this.searchRequestState.msgToUser = "Search Failed, Please try later"
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
      if (result.status === this.appGlobals.HTTP_SUCCESS) {
        this.queryResponse = result
        this.httpRequestStateService.finishRequest(this.searchRequestState)
      } else {
        this.searchRequestState.msgToUser = "Search Failed, Please try later"
        this.httpRequestStateService.finishRequestWithError(this.searchRequestState)
        
      }
    }, (err: HttpErrorResponse) => {
      this.httpRequestStateService.finishRequestWithError(this.searchRequestState)
      this.utilsService.showSnackBar("Something went wrong, Please try later")
    });
  }
}
