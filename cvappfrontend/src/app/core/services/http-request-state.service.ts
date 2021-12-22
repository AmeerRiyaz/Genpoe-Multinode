import { Injectable } from '@angular/core';
import { UtilsService } from './utils.service';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { NGXLogger } from 'ngx-logger';
import { LoadingSpinnerService } from './loading-spinner.service';
export var DEFAULT_TIMEOUT = 60000 * 5 // 5min
@Injectable({
  providedIn: 'root'
})
export class HttpRequestStateService {

  constructor(
    private logger: NGXLogger,
    private utilsService: UtilsService,
    private loadingDialogService: LoadingSpinnerService
  ) { }

  initRequest(reqRef: HttpRequestState, msg?: string) {
    
    reqRef.requestInProgress = true;
    reqRef.msgToUser = ""
    reqRef.showData = false;
    reqRef.success = false;
    reqRef.requestProcessed = true;
    reqRef.emptyResponse = true;
    setTimeout(() => {
      this.finishRequestWithTimeout(reqRef)
    }, reqRef.timeout);
    // this.logger.info(msg, " : initRequest")
  }

  initRequestWithoutTimeoutMessage(reqRef) {
    
    setTimeout(() => {
      this.finishRequestWithoutTimeoutMessage(reqRef)
    }, reqRef.timeout);
    reqRef.requestInProgress = true;
    reqRef.msgToUser = ""
    reqRef.showData = false;
    reqRef.success = false;
    reqRef.requestProcessed = true;
    reqRef.emptyResponse = false;
    // this.logger.info("initRequestWithoutTimeoutMessage")
  }

  destroyRequest(reqRef, msg?) {

    if (reqRef.subscription) {
      reqRef.subscription.unsubscribe()
    }
    reqRef.requestInProgress = false;
    reqRef.msgToUser = ""
    reqRef.showData = false;
    reqRef.success = false;
    reqRef.requestProcessed = true;
    reqRef.emptyResponse = false;
    // this.logger.info(msg, " : destroyRequest success")
  }

  public finishRequest(reqRef) {

    if (reqRef.requestInProgress) {
      reqRef.subscription.unsubscribe();
      reqRef.requestInProgress = false;
      reqRef.showData = true;
      reqRef.msgToUser = "Request successful"
      reqRef.success = true;
      reqRef.requestProcessed = true;
      reqRef.emptyResponse = false;
      // this.logger.info("finishRequest success")
      this.loadingDialogService.closeLoading()
    }
  }

  public finishRequestWithError(reqRef, msg?) {

    if (reqRef.requestInProgress) {
      reqRef.subscription.unsubscribe();
      reqRef.requestInProgress = false;
      reqRef.showData = false
      reqRef.msgToUser = msg ? msg : "Unable to connect, please try after some time."
      reqRef.success = false;
      reqRef.requestProcessed = true;
      reqRef.emptyResponse = false;
      // this.logger.info("finishRequestWithError")
      this.loadingDialogService.closeLoading()
    }
  }

  public finishRequestWithTimeout(reqRef) {

    if (reqRef.requestInProgress) {
      reqRef.subscription.unsubscribe();
      reqRef.requestInProgress = false;
      reqRef.showData = false
      reqRef.msgToUser = "Timeout - Taking too long to proceed"
      reqRef.success = false;
      reqRef.requestProcessed = true;
      reqRef.emptyResponse = true;
      this.utilsService.showSnackBar("Taking too long to proceed.")
      // this.logger.info("finishRequestWithTimeout")
      this.loadingDialogService.closeLoading()
    }
  }
  
  public finishRequestWithoutTimeoutMessage(reqRef) {

    if (reqRef.requestInProgress) {
      reqRef.subscription.unsubscribe();
      reqRef.requestInProgress = false;
      reqRef.showData = false
      reqRef.msgToUser = "Timeout - Taking too long to proceed"
      reqRef.success = false;
      reqRef.requestProcessed = true;
      reqRef.emptyResponse = false;
      this.loadingDialogService.closeLoading()
    }
  }

  public finishRequestWithEmptyResponse(reqRef) {
    if (reqRef.requestInProgress) {
      reqRef.subscription.unsubscribe();
      reqRef.requestInProgress = false;
      reqRef.showData = false
      reqRef.msgToUser = "Empty Response"
      reqRef.success = false;
      reqRef.requestProcessed = true;
      reqRef.emptyResponse = true;
      this.loadingDialogService.closeLoading()
    }
  }
}