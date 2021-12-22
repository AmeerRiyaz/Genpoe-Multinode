import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { TransactionComponent } from '../layout/transaction/transaction.component';
import { LoadingSpinnerService } from 'src/app/shared/services/loading-spinner.service';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { NGXLogger } from 'ngx-logger';
import { AppGlobals } from 'src/app/config/app-globals';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { PoeService } from 'src/app/modules/poe/services/poe.service';
import { PoETransactionResponse } from 'src/app/shared/models/poetransactionresponse';
import { HttpErrorResponse } from '@angular/common/http';
import { TransactionMultiFileComponent } from '../layout/transaction-multi-file/transaction-multi-file.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-org-poe-upload',
  templateUrl: './org-poe-upload.component.html',
  styleUrls: ['./org-poe-upload.component.css']
})
export class OrgPoeUploadComponent implements OnInit {
  hideForDev = true
  isHovering = [false, false, false];
  splitMode = false
  folderUpload = false
  selectedFiles = []
  isFileSelected = false
  isFileSelectionInProgress = false

  @ViewChild('fileInput', { static: true }) fileInput
  @ViewChild('folderInput', { static: true }) folderInput

  // @ViewChild('transaction', {static:true}) transaction : ElementRef<TransactionComponent>

  @ViewChild(TransactionComponent, { static: false }) transaction: TransactionComponent
  @ViewChild(TransactionMultiFileComponent, { static: false }) transactionFolder: TransactionMultiFileComponent
  
  allowStorage = true
  sendMail = true
  fileSelection = new FormControl('')
  folderSelection = new FormControl('')
  uploadForm: FormGroup
  recordTransactionRequest: HttpRequestState = new HttpRequestState()
  poeTransaction: any
  poeTransactionResponse;

  parsedDataFromExcel = []
  execlFile

  constructor(
    private utils: UtilsService,
    private _formBuilder: FormBuilder,
    private loadingSpinnerService: LoadingSpinnerService,
    private httpRequestStateService: HttpRequestStateService,
    private logger: NGXLogger,
    public appGlobals: AppGlobals,
    private poeService: PoeService,
  ) {

    this.uploadForm = this._formBuilder.group({
      fileSelection: this.fileSelection,
      folderSelection: this.folderSelection,
    })
  }

  ngOnInit() {
  }

  mouseHovering(i) {
    this.isHovering[i] = true;
  }
  mouseLeaving(i) {
    this.isHovering[i] = false;
  }

  openFileSelection(val) {
    console.log(val)
  }

  /**
 * triggered on file selection change
 * @param $event 
 */
  fileChange($event) {

    //converts selected files object to array (required for sorting selection)
    let fileArray: Array<any> = [].slice.call($event.target.files)
    console.log(this.splitMode, this.folderUpload, fileArray)
    this.setFileSelection(fileArray)
  }

  excelFileSelected($event) {
    let xlsFile: Array<any> = [].slice.call($event.target.files)
    this.execlFile = xlsFile[0]

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      // this.logger.log(bstr);
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      var result
      wb.SheetNames.forEach(sheetName => {
        var wsheet = wb.Sheets[sheetName];

        result = XLSX.utils.sheet_to_json(wsheet, { header: 1 });

        // if(!this.parsedDataHeader){
        this.logger.log("setFileSelction() Headers: ", result[0])
        result[0].push('status')
        // this.parsedDataHeader.push(result[0])
        // }

        result.splice(0, 1)
        this.parsedDataFromExcel.push(...result) //spread operation ES6 -> this creates single array all entries

        // this.parsedData.push(result) // array of array
        this.logger.log('setFileSelction() XLS parsed: ', this.parsedDataFromExcel);
        // console.log(this.parsedDataHeader)

      });
      // this.parsingDataInProcess = false

      // /* grab first sheet */
      // const wsname: string = wb.SheetNames[0];
      // const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      // /* save data */
      // var result = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // this.logger.log("setFileSelction() Headers: ", result[0])
      // this.parsedDataHeader = result[0]
      // result.splice(0, 1)
      // this.parsedData = result
      // this.logger.log('setFileSelction() XLS parsed: ', this.parsedData);
      // this.parsingDataInProcess = false

      this.transactionFolder.setTransactionFormValue(this.parsedDataFromExcel)
    }
    reader.readAsBinaryString(xlsFile[0]);



  }

  /**
   * Auto fill data from excel file 
   * UniqueId, Name, email, phone, docType
   */
  fillDataFromExcel() {

  }

  removeExcelFile() {
    this.parsedDataFromExcel = []
    this.transactionFolder.resetTransactionFormValue()
  }

  setFileSelection(fileArray) {

    if (this.folderUpload) {
      // const regex = new RegExp("([a-zA-Z0-9\s_\\.\-:])$", 'i')
      const regex = new RegExp("^(?!.*(?:\\.(?:exe|sh|js|bat|zip)(?:\\.|$))).*\\.(?:png|pdf|jpg|jpeg)$", 'i')
      fileArray = fileArray.filter(({ name }) => name.match(regex));
      if (fileArray.length < 1) {
        this.utils.showSnackBar("Please check type of files, allwoed formats are pdf, png, jpg, jpeg, bmp")
        this.resetFileSelection()
        return
      }
      this.selectedFiles = fileArray
      this.isFileSelected = true
      setTimeout(() => {
        this.transactionFolder.fileListEmpty.subscribe(isFileListEmpty => {
          if (isFileListEmpty) {
            this.resetFileSelection()
          }
        })
      }, 500);

    }
    else if(this.splitMode) {
      // allow only pdf in split mode 
      // const regex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(.pdf)$", 'i')
      const regex = new RegExp("^(?!.*(?:\\.(?:exe|sh|js|bat|zip)(?:\\.|$))).*\\.(?:pdf)$", 'i')

      fileArray = fileArray.filter(({ name }) => name.match(regex));
      if (fileArray.length < 1) {
        this.utils.showSnackBar("Please check type of file, only pdf can be uploaded in split mode")
        this.resetFileSelection()
        return
      }
      this.selectedFiles = fileArray
      this.isFileSelected = true
    }else{
      const regex = new RegExp("^(?!.*(?:\\.(?:exe|sh|js|bat|zip)(?:\\.|$))).*\\.(?:png|pdf|jpg|jpeg)$", 'i')
      fileArray = fileArray.filter(({ name }) => name.match(regex));
      if (fileArray.length < 1) {
        this.utils.showSnackBar("Please check type of files, allwoed formats are pdf, png, jpg, jpeg, bmp")
        this.resetFileSelection()
        return
      }
      this.selectedFiles = fileArray
      this.isFileSelected = true
    }
  }

  resetFileSelection() {
    console.log("resetFileSelection")
    this.parsedDataFromExcel = []
    this.uploadForm.reset()
    this.isFileSelected = false
    this.selectedFiles = []
    this.recordTransactionRequest = new HttpRequestState()
    this.splitMode = false
    this.folderUpload = false
    this.allowStorage = true
    this.sendMail = true
  }

  async recordTransaction() {

    // this.loadingSpinnerService.openLoadingDialog()
    this.httpRequestStateService.initRequest(this.recordTransactionRequest)

    let formValuesArray
    

    //if single file
    if (this.splitMode == false && this.folderUpload == false) {
      formValuesArray = [this.transaction.getTransactionFormValue()]
      this.allowStorage = this.transaction.allowStorage
      this.sendMail = this.transaction.sendMail
    }
    //if Foleder
    else if (this.splitMode == false && this.folderUpload == true) {
      formValuesArray = this.transactionFolder.getTransactionFormValue()
      
    } else {
      //if split mode
    }

    this.poeTransaction = await this.poeService.populateTransaction(formValuesArray, this.selectedFiles, this.allowStorage, this.sendMail)

    this.logger.info("recordTransaction org request", this.poeTransaction)
    this.recordTransactionRequest.subscription = this.poeService.recordTransactionOnPoEOrg(this.poeTransaction).subscribe(result => {
      this.logger.info(result)
      if (result) {
        // if (result.status == this.appGlobals.HTTP_SUCCESS) {
        // this.isRefreshRequired = true;
        if (!this.folderUpload && !this.splitMode) {
          this.poeTransactionResponse = result[0]
          console.log(this.poeTransactionResponse)
          if (this.poeTransactionResponse.status == this.appGlobals.HTTP_SUCCESS) {
            this.httpRequestStateService.finishRequest(this.recordTransactionRequest)
          } else {
            this.recordTransactionRequest.msgToUser = this.poeTransactionResponse.message
            this.httpRequestStateService.finishRequestWithError(this.recordTransactionRequest)
          }
        } else {

          this.poeTransactionResponse = result
          if (this.poeTransactionResponse) {
            this.httpRequestStateService.finishRequest(this.recordTransactionRequest)
            this.transactionFolder.setTransactionResult(result)

          } else {
            this.recordTransactionRequest.msgToUser = result.message
            this.httpRequestStateService.finishRequestWithError(this.recordTransactionRequest)
          }
        }
        this.logger.info("recorTransaction org response", this.poeTransactionResponse)
      } else {

      }
      // this.loadingSpinnerService.closeLoading()

    },
      (err: HttpErrorResponse) => {
        // this.loadingSpinnerService.closeLoading()
        // this.logger.log(err.message);
        this.httpRequestStateService.finishRequestWithError(this.recordTransactionRequest)
      })
  }

  getSuccessRequestCount() {
    let count = 0
    this.poeTransactionResponse.forEach(element => {
      if (element.status == this.appGlobals.HTTP_SUCCESS) count++
    });
    return count
  }
  getFailedRequestCount() {
    let count = 0
    this.poeTransactionResponse.forEach(element => {
      if (element.status == this.appGlobals.HTTP_FAILED) count++
    });
    return count
  }
}

