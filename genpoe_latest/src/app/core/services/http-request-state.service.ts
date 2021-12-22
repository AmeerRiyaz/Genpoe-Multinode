import { Injectable } from '@angular/core';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { AppGlobals } from 'src/app/config/app-globals';

@Injectable({
  providedIn: 'root'
})
export class HttpRequestStateService {

  constructor(
    public appGlobals: AppGlobals,
    private utilsService: UtilsService
  ) { }

  initRequest(reqRef, msg?: string) {

    reqRef.requestInProgress = true;
    reqRef.msgToUser = ""
    reqRef.showData = false;
    reqRef.emptyResponse = false;
    reqRef.success = false;
    setTimeout(() => {
      this.finishRequestWithTimeout(reqRef)
    }, AppGlobals.HTTP_TIMEOUT);
    reqRef.success = false;
    reqRef.requestProcessed = false
  }

  public finishRequest(reqRef) {

    if (reqRef.requestInProgress) {
      reqRef.subscription.unsubscribe();
      reqRef.requestInProgress = false;
      reqRef.showData = true;
      reqRef.emptyResponse = false;
      reqRef.msgToUser = ""
      reqRef.success = true;
      reqRef.requestProcessed = true
    }
  }


  public destroyRequest(reqRef, msg?) {
    if (reqRef.subscription) {
      reqRef.subscription.unsubscribe()
    }
    reqRef.requestInProgress = false;
    reqRef.msgToUser = ""
    reqRef.showData = false;
    reqRef.success = false;
    reqRef.requestProcessed = true
  }

  public finishRequestWithTimeout(reqRef) {
    if (reqRef.requestInProgress) {
      reqRef.subscription.unsubscribe();
      reqRef.requestInProgress = false;
      reqRef.showData = false
      reqRef.emptyResponse = false;
      reqRef.msgToUser = this.appGlobals.MESSAGE_TIMEOUT
      this.utilsService.showSnackBar(reqRef.msgToUser)
      reqRef.success = false;
      reqRef.requestProcessed = true
    }
  }

  public finishRequestWithError(reqRef) {
    if (reqRef.requestInProgress) {
      reqRef.subscription.unsubscribe();
      reqRef.requestInProgress = false;
      reqRef.showData = false
      reqRef.emptyResponse = false;
      if(reqRef.msgToUser == ""){
        reqRef.msgToUser = this.appGlobals.MESSAGE_SOMETHING_WENT_WRONG
      } 
      this.utilsService.showSnackBar(reqRef.msgToUser)
      reqRef.success = false;
      reqRef.requestProcessed = true
    }
  }


  public finishRequestWithErrorAndNoErrorMessage(reqRef) {
    if (reqRef.requestInProgress) {
      reqRef.subscription.unsubscribe();
      reqRef.requestInProgress = false;
      reqRef.showData = false
      reqRef.emptyResponse = false;
      // if(reqRef.msgToUser == ""){
      //   reqRef.msgToUser = this.appGlobals.MESSAGE_SOMETHING_WENT_WRONG
      // } 
      // this.utilsService.showSnackBar(reqRef.msgToUser)
      reqRef.success = false;
      reqRef.requestProcessed = true
    }
  }


  public finishRequestWithEmptyResponse(reqRef) {
    if (reqRef.requestInProgress) {
      reqRef.subscription.unsubscribe();
      reqRef.requestInProgress = false;
      reqRef.showData = false
      reqRef.emptyResponse = true;
      reqRef.msgToUser = this.appGlobals.MESSAGE_EMPTY_RESPONSE
      // this.utilsService.showSnackBar(reqRef.msgToUser)
      reqRef.success = false;
      reqRef.requestProcessed = true
    }
  }
}
