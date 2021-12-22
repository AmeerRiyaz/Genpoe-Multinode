import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray, AbstractControl } from '@angular/forms';
import { PoeService } from 'src/app/modules/poe/services/poe.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { OrgPoeUploadComponent } from '../../org-poe-upload/org-poe-upload.component';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { AdminService } from '../../../services/admin.service';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';

@Component({
  selector: 'app-transaction-multi-file',
  templateUrl: './transaction-multi-file.component.html',
  styleUrls: ['./transaction-multi-file.component.css']
})
export class TransactionMultiFileComponent implements OnInit {

  allowStorage = true
  docTypes = []
  getCategoryRequest = new HttpRequestState()
  @Input() files;
  @Output() public fileListEmpty = new EventEmitter()
  displayResult = false
  resultArray = []

  public recordTransactionFormArray: FormArray
  public recordTransactionFormGroup: FormGroup


  fileSelection: FormControl
  issuedToEmail: FormControl
  issuedToName: FormControl
  issuedToPhone: FormControl
  uniqueID: FormControl
  docType: FormControl


  constructor(
    private _formBuilder: FormBuilder,
    private utilsService: UtilsService,
    private httpStateService: HttpRequestStateService,
    private adminService: AdminService,
  ) { 
    this.getCategoryList()
  }

  ngOnInit() {
    console.log(`TransactionComponent ${this.files.length}`, this.files)

    this.recordTransactionFormArray = this._formBuilder.array([])

    this.files.forEach((file) => {
      this.recordTransactionFormArray.push(this.getRecordTransactionFormGroup(file))
    })
    console.log(this.recordTransactionFormArray.value)

  }


  getRecordTransactionFormGroup(file) {

    return this._formBuilder.group({
      uniqueID: new FormControl('', [Validators.required]),
      issuedToName: new FormControl('', [Validators.required]),
      issuedToEmail: new FormControl('', [Validators.required, Validators.email]),
      issuedToPhone: new FormControl('', [Validators.required]),
      docType: new FormControl('', [Validators.required]),
      fileSelection: new FormControl(file)
    })
  }



  public getTransactionFormValue() {
    let txn = this.recordTransactionFormArray.value
    // txn = await this.poeService.populateTransaction(txn, this.file, this.allowStorage)
    // console.log("---",txn)
    return txn
  }

  public setTransactionFormValue(excelDataArray) {
    // excelDataArray.forEach(row => {

    // });

    var minimum = excelDataArray.length < this.files.length ? excelDataArray.length : this.files.length

    for (let index = 0; index < minimum; index++) {
      const row = excelDataArray[index];
      this.getFormGroupFromArray(index).get('uniqueID').setValue(row[0])
      this.getFormGroupFromArray(index).get('issuedToName').setValue(row[1])
      this.getFormGroupFromArray(index).get('issuedToEmail').setValue(row[2])
      this.getFormGroupFromArray(index).get('issuedToPhone').setValue(row[3])
      this.getFormGroupFromArray(index).get('docType').setValue(row[4])
    }
  }

  setTransactionResult(result) {
    this.displayResult = true
    this.resultArray = result

  }

  public resetTransactionFormValue() {
    this.recordTransactionFormArray.reset()

  }

  deleteFile(index) {
    console.log(this.files)
    let dialogRef = this.utilsService.showActionDialog(`Remove`,`${this.files[index].name} and its associated data will be removed`)
    dialogRef.afterClosed().subscribe(userChoice => {
      if (userChoice) {
        this.files.splice(index, 1)
        this.recordTransactionFormArray.removeAt(index)
        console.log(this.files, this.recordTransactionFormArray.value)
        if (this.recordTransactionFormArray.value.length <= 0) {
          this.resetTransactionFormValue()
          this.fileListEmpty.emit(true)
        }
      }
    })
  }

  dropFile(event: CdkDragDrop<[]>) {
    console.log("dropFile", event)
    moveItemInArray(this.files, event.previousIndex, event.currentIndex);

    // swapping files 
    this.getFormGroupFromArray(event.previousIndex).get('fileSelection').setValue(this.files[event.previousIndex])

    this.getFormGroupFromArray(event.currentIndex).get('fileSelection').setValue(this.files[event.currentIndex])

  }


  dropForm(event: CdkDragDrop<[]>) {
    console.log("dropForm", event)
    //swping forms in form array
    let array = this.recordTransactionFormArray.value
    moveItemInArray(array, event.previousIndex, event.currentIndex);
    this.recordTransactionFormArray.setValue(array)

    // swapping files 
    this.getFormGroupFromArray(event.previousIndex).get('fileSelection').setValue(this.files[event.previousIndex])

    this.getFormGroupFromArray(event.currentIndex).get('fileSelection').setValue(this.files[event.currentIndex])

  }


  /**
   * 
   * @param previousIndex position before moveing file
   * @param currentIndex  position AFTER moveing file
   */
  swapFile(previousIndex, currentIndex) {
    let temp = this.recordTransactionFormArray[previousIndex].value.fileSelection
    this.recordTransactionFormArray[previousIndex].value.fileSelection = this.recordTransactionFormArray[currentIndex].value.fileSelection
    this.recordTransactionFormArray[currentIndex].value.fileSelection = temp
  }


  getFormGroupFromArray(index): AbstractControl {
    return this.recordTransactionFormArray.get(index.toString())
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
