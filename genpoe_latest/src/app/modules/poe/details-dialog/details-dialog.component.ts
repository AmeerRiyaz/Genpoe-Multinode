import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PoeService } from 'src/app/modules/poe/services/poe.service';
import { UtilsService } from '../../../shared/services/utils.service';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { HttpRequestState } from '../../../shared/models/http-request-state';
import { AppGlobals } from 'src/app/config/app-globals';
import { NGXLogger } from 'ngx-logger';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingSpinnerService } from '../../../shared/services/loading-spinner.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-details-dialog',
  templateUrl: './details-dialog.component.html',
  styleUrls: ['./details-dialog.component.css']
})
export class DetailsDialogComponent implements OnInit {
  types = [

    { key: "application/pdf", value: ".pdf" },
    { key: "image/png", value: ".png" },
    { key: "image/jpeg", value: ".jpeg" },
    { key: "image/bmp", value: ".bmp" },
  ]
  getPosRequestState: HttpRequestState = new HttpRequestState()
  getReceiptRequestState: HttpRequestState = new HttpRequestState()
  posRsponseBase64
  fileSrc
  fileExtension
  constructor(
    public dialogRef: MatDialogRef<DetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private poeService: PoeService,
    private utils: UtilsService,
    private httpStateService: HttpRequestStateService,
    private appGloablas: AppGlobals,
    private logger: NGXLogger,
    private utilsService: UtilsService,
    private loadingSpinnerService: LoadingSpinnerService,

    
  ) { }

  ngOnInit() {
    this.logger.log(this.data)
  }
  close() {
    this.dialogRef.close()
  }

  public downloadReceipt(poedetail) {
    //server side receipt download
    this.httpStateService.initRequest(this.getReceiptRequestState)
    this.getReceiptRequestState.subscription = this.poeService.downloadReceiptFromServer(poedetail.txId).subscribe((data: any) => {
      
      if (data.status == this.appGloablas.HTTP_SUCCESS) {
        this.httpStateService.finishRequest(this.getReceiptRequestState)
        // this.downloadPdfFromBase64(data)
        this.utils.showFileInNewTabFromB64(data.result, poedetail.fileName)
      } else {
        this.httpStateService.finishRequestWithError(this.getReceiptRequestState)
        // this.utilsService.showSnackBar("Faild to get file, please try later")
        this.utilsService.showActionDialog("Failed", "Faild to get Receipt, please try later")
      }

      // this.downloadFile(data)
      // this.showFileInNewTabFromBlob(data, `Receipt_${poedetail.fileName}`)
    }, (error: HttpErrorResponse) => {
      this.httpStateService.finishRequestWithError(this.getReceiptRequestState)
      this.logger.log("downloadReceiptFromServer Error : ", error)
      this.utilsService.showActionDialog("Failed", "Faild to get file, please try later")
    })

    /**
     * download Receipt old functionality
     * client side download only
     */
    //   var coulmns = [
    //     ['Transaction ID', poedetail.txId]
    //   ]

    //   var rows = [
    //     ['File Name', poedetail.fileName],
    //     ['File Type', poedetail.fileType],
    //     ['Document Type', poedetail.documentType],
    //     ['SHA256 Hash', poedetail.sha256Hash],
    //     ['Recorded By', poedetail.issuedByOrg],
    //     ['Issued to', poedetail.issuedTo],
    //     ['Status', poedetail.txstatus],
    //     ['Timestamp', poedetail.timestamp],
    //   ]

    //   this.poeService.generatePDF(
    //     "Receipt",
    //     "PoE Record Details",
    //     "http://10.244.1.137:5000/poe/transaction?txId=" + poedetail.txId,
    //     poedetail.txId,
    //     coulmns,
    //     rows,
    //     this.utils.logos.poeLogo
    //   )
  }



  downloadPosFile(data) {
    this.loadingSpinnerService.openLoadingDialog()
    this.httpStateService.initRequest(this.getPosRequestState)
    this.logger.log("getPos Request", data.posHash)
    this.getPosRequestState.subscription = this.poeService.getPosFile(data.posHash).subscribe((result: any) => {
      // this.logger.log("getPos Result", result)
      if (result.status == this.appGloablas.HTTP_SUCCESS) {

        this.posRsponseBase64 = result.base64
        //REVIEW 
        // const linkSource = this.posRsponseBase64
        // this.fileSrc = linkSource
        // this.fileExtension = this.types.find(type => type.key === (linkSource.slice(linkSource.indexOf(':') + 1, linkSource.indexOf(';')))).value
        this.httpStateService.finishRequest(this.getPosRequestState)
        // this.downloadPdfFromBase64(data)
        this.utils.showFileInNewTabFromB64(this.posRsponseBase64, data.fileName)
      } else {
        this.httpStateService.finishRequestWithError(this.getPosRequestState)
        // this.utilsService.showSnackBar("Faild to get file, please try later")
        this.utilsService.showActionDialog("Failed", "Faild to get file, please try later")
      }
      this.loadingSpinnerService.closeLoading()
    }, (error: HttpErrorResponse) => {
      this.logger.log("getPos Error : ", error)
      this.httpStateService.finishRequestWithError(this.getPosRequestState)
      this.utilsService.showActionDialog("Failed", "Faild to get file, please try later")
      this.loadingSpinnerService.closeLoading()
    })
  }

  // downloadPdfFromBase64(data) {
  //   const linkSource: string = this.posRsponseBase64
  //   const downloadLink = document.createElement("a");
  //   const fileName = data.fileName
  //   downloadLink.href = linkSource
  //   downloadLink.download = fileName;
  //   // downloadLink.click();
  //   downloadLink.dispatchEvent(new MouseEvent(`click`, { bubbles: true, cancelable: true, view: window }));
  // }





}
