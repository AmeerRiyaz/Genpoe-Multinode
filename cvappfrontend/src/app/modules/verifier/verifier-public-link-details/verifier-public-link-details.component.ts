import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PoeService } from 'src/app/core/services/poe.service';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { const_HTTP_RESPONSE } from 'src/app/shared/models/app-common-constants';
import { UtilsService } from 'src/app/core/services/utils.service';
import { environment } from 'src/environments/environment';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-verifier-public-link-details',
  templateUrl: './verifier-public-link-details.component.html',
  styleUrls: ['./verifier-public-link-details.component.css']
})
export class VerifierPublicLinkDetailsComponent implements OnInit, OnDestroy {

  txId
  secret
  transactionDetails
  getTransactionDetailsRequestState: HttpRequestState = new HttpRequestState()
  posHash
  receiptB64
  constructor(
    private logger: NGXLogger,
    private route: ActivatedRoute,
    private poeService: PoeService,
    private httpStateService: HttpRequestStateService,
    private utilsService: UtilsService,
    private navService: NavigationService
  ) {
    if (navService.isVisible()) {
      this.navService.hide()
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.txId = params['txId'];
      // this.secret = params['secret'];
      this.getTransaction()
    });
  }

  ngOnDestroy(): void {
    this.navService.makeVisibleIfLoggedIn()
  }

  getTransaction() {
    this.httpStateService.initRequest(this.getTransactionDetailsRequestState)
    this.logger.log("getTransaction request", this.txId)
    this.getTransactionDetailsRequestState.subscription = this.poeService.getTransactionDetails(this.txId).subscribe((result: any) => {
      this.logger.log("getTransaction ", result)
      if (result.status == const_HTTP_RESPONSE.SUCCESS) {
        this.posHash = result.posHash
        this.transactionDetails = result.result
        this.receiptB64 = "data:application/pdf;base64," + result.receipt
        this.httpStateService.finishRequest(this.getTransactionDetailsRequestState)
      } else {
        this.httpStateService.finishRequestWithError(this.getTransactionDetailsRequestState)
        this.getTransactionDetailsRequestState.msgToUser = result.message
        // this.utilsService.showDialog("Failed", result.message)
      }
    }, (error: HttpErrorResponse) => {
      // this.logger.log(error)
      this.httpStateService.finishRequestWithError(this.getTransactionDetailsRequestState)
      this.utilsService.showDialog("Failed", "Faild to verify, please try later")
    })
  }

  downloadPdf() {
    var columns = [['Transaction ID', this.transactionDetails.txId]]
    var rows = [
      ['File Name', this.transactionDetails.fileName],
      // ['File Type', this.transactionDetails.fileType],
      ['Document Type', this.transactionDetails.documentType],
      ['SHA256 Hash', this.transactionDetails.sha256Hash],
      ['SHA1 Hash', this.transactionDetails.sha1Hash],
      ['Issued To', this.transactionDetails.issuedTo],
      ['Issued By Org', this.transactionDetails.issuedByOrg],
      // ['Issued By User', this.transactionDetails.issuedByUser],
      ['Time', new Date(this.transactionDetails.timestamp.seconds * 1000)],
    ]
    this.utilsService.generatePDF(
      "PoE Receipt",
      "Centre for Development of Advanced Computing (C-DAC), Hyderabad",
      environment.uiEndpoint + "poe/transaction/" + this.transactionDetails.txId,
      this.transactionDetails.txId,
      columns, rows,
    )
  }


  downloadPdfFromBase64() {
    const linkSource: string = this.receiptB64
    const downloadLink = document.createElement("a");
    const fileName = this.transactionDetails.txId + ".pdf"

    downloadLink.href = linkSource
    downloadLink.download = fileName;
    // downloadLink.click();
    downloadLink.dispatchEvent(new MouseEvent(`click`, { bubbles: true, cancelable: true, view: window }));
  }
}
