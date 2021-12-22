import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NGXLogger } from 'ngx-logger';
import { PoeService } from 'src/app/modules/poe/services/poe.service';
import { UtilsService } from '../../services/utils.service';
import { NavigationService } from 'src/app/core/navigation/services/navigation.service';
import { AppGlobals } from 'src/app/config/app-globals';
import { LoadingSpinnerService } from '../../services/loading-spinner.service';

@Component({
  selector: 'app-verifier-public-link-details',
  templateUrl: './verifier-public-link-details.component.html',
  styleUrls: ['./verifier-public-link-details.component.css']
})
export class VerifierPublicLinkDetailsComponent implements OnInit {

  sha256
  secret
  transactionDetails
  getTransactionDetailsRequestState: HttpRequestState = new HttpRequestState()
  getPosRequestState: HttpRequestState = new HttpRequestState()
  posHash
  isTransactionFromOrg = false  //used to detect to verification request is for individual user ot org transaction based on the route
  constructor(
    private logger: NGXLogger,
    private route: ActivatedRoute,
    private poeService: PoeService,
    private httpStateService: HttpRequestStateService,
    private utilsService: UtilsService,
    private navService: NavigationService,
    public appGlobals: AppGlobals,
    private loadingSpinnerService: LoadingSpinnerService,
  ) {
    if (navService.canShown) {
      this.navService.hide()
    }
  }

  ngOnInit() {
    if(this.route.snapshot.url[0].path =='org'){
      this.isTransactionFromOrg = true
    }else{
      this.isTransactionFromOrg = false
    }
    this.route.params.subscribe(params => {
      this.sha256 = params['searchKey'];
      // this.secret = params['secret'];
      this.getTransaction()
    });
  }

  // ngOnDestroy(): void {
  //   this.navService.makeVisibleIfLoggedIn()
  // }

  getTransaction() {
    this.httpStateService.initRequest(this.getTransactionDetailsRequestState)
    this.logger.log("getTransaction request", this.sha256)

    let funToBeCalled = this.isTransactionFromOrg ? this.poeService.searchByHashOrg(this.sha256) : this.poeService.searchByTxId(this.sha256)
    this.getTransactionDetailsRequestState.subscription = funToBeCalled.subscribe((result: any) => {
      this.logger.log("getTransaction ", result)
      if (result.status == this.appGlobals.HTTP_SUCCESS) {
        this.posHash = this.isTransactionFromOrg ? result.result.posHash : result.posHash
        this.transactionDetails = result.result
        this.httpStateService.finishRequest(this.getTransactionDetailsRequestState)
      } else {
        this.getTransactionDetailsRequestState.msgToUser = result.message
        this.httpStateService.finishRequestWithError(this.getTransactionDetailsRequestState)
        // this.getTransactionDetailsRequestState.msgToUser = result.message
        // this.utilsService.showDialog("Failed", result.message)
      }
    }, (error: HttpErrorResponse) => {
      // this.logger.log(error)
      this.httpStateService.finishRequestWithError(this.getTransactionDetailsRequestState)
      this.utilsService.showAlertDialog("Failed", "Faild to verify, please try later")
    })
  }

  // downloadPdf() {
  //   var columns = [['Transaction ID', this.transactionDetails.txId]]
  //   var rows = [
  //     ['File Name', this.transactionDetails.fileName],
  //     // ['File Type', this.transactionDetails.fileType],
  //     ['Document Type', this.transactionDetails.documentType],
  //     ['SHA256 Hash', this.transactionDetails.sha256Hash],
  //     ['SHA1 Hash', this.transactionDetails.sha1Hash],
  //     ['Issued To', this.transactionDetails.issuedTo],
  //     ['Issued By Org', this.transactionDetails.issuedByOrg],
  //     ['Issued By User', this.transactionDetails.issuedByUser],
  //     ['Time', new Date(this.transactionDetails.timestamp.seconds * 1000)],
  //   ]
  //   this.utilsService.generatePDF(
  //     "PoE Receipt",
  //     "Centre for Development of Advanced Computing (C-DAC), Hyderabad",
  //     environment.uiEndpoint + "poe/transaction/" + this.transactionDetails.txId,
  //     this.transactionDetails.txId,
  //     columns, rows,
  //   )
  // }

  downloadPosFile(posHash) {
    this.loadingSpinnerService.openLoadingDialog()
    this.httpStateService.initRequest(this.getPosRequestState)
    this.logger.log("getPos Request", posHash)
    this.getPosRequestState.subscription = this.poeService.getPosFile(posHash).subscribe((result: any) => {
      // this.logger.log("getPos Result", result)
      if (result.status == this.appGlobals.HTTP_SUCCESS) {

        //REVIEW 
        // const linkSource = this.posRsponseBase64
        // this.fileSrc = linkSource
        // this.fileExtension = this.types.find(type => type.key === (linkSource.slice(linkSource.indexOf(':') + 1, linkSource.indexOf(';')))).value
        this.httpStateService.finishRequest(this.getPosRequestState)
        // this.downloadPdfFromBase64(data)
        this.utilsService. showFileInNewTabFromB64(result.base64, this.transactionDetails.fileName)
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
}
