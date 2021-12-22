import { Component, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { PoETransaction } from 'src/app/shared/models/poetransaction';
import { PoETransactionResponse } from 'src/app/shared/models/poetransactionresponse';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { PoeService } from '../services/poe.service';
import { LoadingSpinnerService } from 'src/app/shared/services/loading-spinner.service';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpErrorResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { AppGlobals } from 'src/app/config/app-globals';
import { MatDialogRef } from '@angular/material';
import { DeviceDetectorService } from 'ngx-device-detector';
import { transition } from '@angular/animations';

@Component({
  selector: 'app-poe-upload',
  templateUrl: './poe-upload.component.html',
  styleUrls: ['./poe-upload.component.css']
})
export class PoeUploadComponent implements OnInit {

  poeTransactionResponse: PoETransactionResponse;


  // @Input() updateListOnUpload: PoeListComponent;
  // public panelOpenState: boolean = false;

  isFileSelected = false
  selectedFileName = "No file chosen"
  buttonIcon = 'attachment';
  buttonName = "Choose file"
  @ViewChild('fileInput', { static: false }) apkFileInput
  recordTransactionFormGroup: FormGroup
  fileSelection = new FormControl('')
  recordTransactionRequest: HttpRequestState = new HttpRequestState()
  selectedFiles = []
  poeTransaction: any;
  allowStorage = true;
  isRefreshRequired = false;
  getReceiptRequestState: HttpRequestState = new HttpRequestState()


  constructor(
    private dialogRef: MatDialogRef<PoeUploadComponent>,
    private _formBuilder: FormBuilder,
    public utils: UtilsService,
    private auth: AuthService,
    private poeService: PoeService,
    private loadingSpinnerService: LoadingSpinnerService,
    private httpRequestStateService: HttpRequestStateService,
    private logger: NGXLogger,
    public appGlobals: AppGlobals,
    private deviceService: DeviceDetectorService
  ) { }


  ngOnInit() {
    this.recordTransactionFormGroup = this._formBuilder.group({
      fileSelection: this.fileSelection,
      issuedTo: this.auth.getCurrentUser(),
      // docType: ['', Validators.required],
      docType: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9]+([_ -]?[a-zA-Z0-9])*$')]),
      allowStorage: ''
    })
    this.poeTransaction = new PoETransaction();

    //this will allow to close as well send result back when outsie of dialog is clicked to close
    this.dialogRef.backdropClick().subscribe(_ => {
      // Close the dialog
      this.dialogRef.close(this.isRefreshRequired);
    })
  }


  /**
   * File selection event
   * @param event 
   */
  onFileChanged(event) {
    let fileArray: Array<any> = [].slice.call(event.target.files)
    if (fileArray.length) {
      this.setFileSelction(fileArray)
    } else {
      this.resetFileSelection()
    }
    //REVIEW not required here as these functionality will be moved to service
    // this.selectedFile = event.target.files[0];
    // this.populateTransaction();
    // this.calculateSHA256(this.selectedFile);
    // this.calculateSHA1(this.selectedFile);
  }


  /**
   * Set ui elements and display details after file selection
   * @param fileArray 
   */
  setFileSelction(fileArray) {
    const regex = new RegExp("^(?!.*(?:\\.(?:exe|sh|js|bat|zip)(?:\\.|$))).*\\.(?:png|pdf|jpg|jpeg)$", 'i')

    fileArray = fileArray.filter(({ name }) => name.match(regex));
    if (fileArray.length < 1) {
      this.utils.showSnackBar("Please check type of files, allwoed formats are pdf, png, jpg")
      this.resetFileSelection()
      return
    }
    
    this.buttonName = "Record on PoE"
    this.buttonIcon = 'cloud_upload'
    this.selectedFileName = fileArray[0].name
    this.isFileSelected = true
    this.selectedFiles = fileArray
    this.logger.log(fileArray[0])
    this.logger.log(this.allowStorage)
  }


  /**
   * Reset ui elements as file selection cleared
   */
  resetFileSelection() {
    this.logger.log(this.allowStorage)
    this.isFileSelected = false
    this.buttonIcon = "attachment"
    this.buttonName = 'Choose file'
    this.selectedFileName = 'No file chosen'
    // this.fileSelectionForm.reset()
    this.fileSelection.reset()
    this.recordTransactionRequest = new HttpRequestState()
  }


  async recordTransaction() {
    this.loadingSpinnerService.openLoadingDialog()
    this.httpRequestStateService.initRequest(this.recordTransactionRequest)
    this.poeTransaction = await this.poeService.populateTransaction([this.recordTransactionFormGroup.value], this.selectedFiles, this.allowStorage, false)
   this.recordTransactionRequest.subscription = this.poeService.recordTransactionOnPoE(this.poeTransaction[0]).subscribe(result => {
      this.logger.info(result)
      if (result.status == this.appGlobals.HTTP_SUCCESS) {
        this.isRefreshRequired = true;
        this.poeTransactionResponse = result
        this.logger.info(this.poeTransactionResponse)
        this.httpRequestStateService.finishRequest(this.recordTransactionRequest)
      } else {
        this.recordTransactionRequest.msgToUser = result.message
        this.httpRequestStateService.finishRequestWithError(this.recordTransactionRequest)
      }
      this.loadingSpinnerService.closeLoading()

    },
      (err: HttpErrorResponse) => {
        this.loadingSpinnerService.closeLoading()
        // this.logger.log(err.message);
        this.httpRequestStateService.finishRequestWithError(this.recordTransactionRequest)
      })

  }

  // public downloadReceipt(poedetail) {

  //   this.poeService.downloadReceiptFromServer(poedetail.txId).subscribe(data => {
  //     // this.downloadFile(data)
  //     this.showFileInNewTabFromBlob(data)
  //   }, (error: HttpErrorResponse) => {
  //     this.logger.log("downloadReceiptFromServer Error : ", error)
  //     this.utils.showActionDialog("Failed", "Faild to get file, please try later")
  //   })
  // }

  // showFileInNewTabFromBlob(data: any) {
  //   const blob = new Blob([data.body], { type: 'application/pdf' });
  //   const file = new File([blob], name + '.pdf', { type: 'application/pdf' });
  //   const url = window.URL.createObjectURL(blob);
  //   window.open(url);
  // }

  closeDialog() {
    this.dialogRef.close(this.isRefreshRequired);
  }



  public downloadReceipt(poedetail) {
    //server side receipt download
    this.httpRequestStateService.initRequest(this.getReceiptRequestState)
    this.getReceiptRequestState.subscription = this.poeService.downloadReceiptFromServer(poedetail.txId).subscribe((data: any) => {
      
      if (data.status == this.appGlobals.HTTP_SUCCESS) {
        this.httpRequestStateService.finishRequest(this.getReceiptRequestState)
        // this.downloadPdfFromBase64(data)
        this.showFileInNewTabFromB64(data.result, poedetail.fileName)
      } else {
        this.httpRequestStateService.finishRequestWithError(this.getReceiptRequestState)
        // this.utilsService.showSnackBar("Faild to get file, please try later")
        this.utils.showActionDialog("Failed", "Faild to get Receipt, please try later")
      }

      // this.downloadFile(data)
      // this.showFileInNewTabFromBlob(data, `Receipt_${poedetail.fileName}`)
    }, (error: HttpErrorResponse) => {
      this.httpRequestStateService.finishRequestWithError(this.getReceiptRequestState)
      this.logger.log("downloadReceiptFromServer Error : ", error)
      this.utils.showActionDialog("Failed", "Faild to get file, please try later")
    })
  }

  async showFileInNewTabFromB64(data, name) {
    const response = await fetch(data);
    const blob = await response.blob();
    const file = new File([blob], name) // file will not work in chrome
    const url = window.URL.createObjectURL(blob);


    // this.logger.log(window.navigator.userAgent)
    // this.logger.log(this.deviceService.getDeviceInfo())

    var browser = this.deviceService.getDeviceInfo().browser
    if (browser == "MS-Edge" || browser == "MSIE") {
      window.navigator.msSaveOrOpenBlob(file, name);
    } else {
      window.open(url);
    }
  }
  
}

