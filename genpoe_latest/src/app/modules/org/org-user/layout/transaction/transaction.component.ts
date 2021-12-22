import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { PoeService } from 'src/app/modules/poe/services/poe.service';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {

  public allowStorage = true
  public sendMail = true
  docTypes = []
  @Input() file;
  public recordTransactionFormGroup: FormGroup
  fileSelection: FormControl
  issuedToEmail: FormControl
  issuedToName: FormControl
  issuedToPhone: FormControl
  uniqueID: FormControl
  docType: FormControl

  getCategoryRequest = new HttpRequestState()

  constructor(
    private _formBuilder: FormBuilder,
    private poeService: PoeService,
    private httpStateService: HttpRequestStateService,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.getCategoryList()
    console.log("TransactionComponent", this.file)
    this.uniqueID = new FormControl('', [Validators.required])
    this.issuedToName = new FormControl('', [Validators.required])
    this.issuedToEmail = new FormControl('', [Validators.required, Validators.email])
    this.issuedToPhone = new FormControl('', [Validators.required])
    this.docType = new FormControl('', [Validators.required])
    this.fileSelection = new FormControl(this.file[0])


    this.recordTransactionFormGroup = this._formBuilder.group({
      uniqueID: this.uniqueID,
      issuedToName: this.issuedToName,
      issuedToEmail: this.issuedToEmail,
      issuedToPhone: this.issuedToPhone,
      docType: this.docType,
      fileSelection: this.fileSelection,
      allowStorage: this.allowStorage,
      sendMail: this.sendMail
    })
    console.log(this.recordTransactionFormGroup.value)
  }

  public getTransactionFormValue() {
    let txn = this.recordTransactionFormGroup.value
    // txn = await this.poeService.populateTransaction(txn, this.file, this.allowStorage)
    // console.log("---",txn)
    return txn
  }

  toggleSendMail() {
    console.log(this.sendMail)
    this.recordTransactionFormGroup.get('sendMail').setValue(this.sendMail)
  }


  getCategoryList() {
    this.httpStateService.initRequest(this.getCategoryRequest)

    this.getCategoryRequest.subscription = this.adminService.getCategoryList().subscribe((result: any) => {
      console.log(result)
      if (result.status == "Success") {
        this.docTypes = result.result
        this.httpStateService.finishRequest(this.getCategoryRequest)
      } else {
        this.httpStateService.finishRequestWithError(this.getCategoryRequest)
      }

    }, (err: HttpErrorResponse) => {
      this.httpStateService.finishRequestWithError(this.getCategoryRequest)
    })
  }
}
