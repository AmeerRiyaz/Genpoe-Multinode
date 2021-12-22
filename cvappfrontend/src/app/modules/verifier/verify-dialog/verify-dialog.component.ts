import { Component, OnInit, Inject } from '@angular/core';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { PoeService } from 'src/app/core/services/poe.service';
import { const_HTTP_RESPONSE } from 'src/app/shared/models/app-common-constants';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DetailsDialogComponent } from 'src/app/shared/layout/details-dialog/details-dialog.component';
import { UtilsService } from 'src/app/core/services/utils.service';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-verify-dialog',
  templateUrl: './verify-dialog.component.html',
  styleUrls: ['./verify-dialog.component.css']
})
export class VerifyDialogComponent implements OnInit {

  verifyRequestState: HttpRequestState = new HttpRequestState()
  verifyResult

  constructor(
    private logger: NGXLogger,
    public dialogRef: MatDialogRef<DetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private httpRequestStateService: HttpRequestStateService,
    private poeService: PoeService,
    private utilsService: UtilsService
  ) { }

  ngOnInit() {
    this.verify(this.data)
  }

  verify(hash) {
    this.httpRequestStateService.initRequest(this.verifyRequestState)
    this.verifyRequestState.subscription = this.poeService.searchByHash(hash).subscribe(result => {
      this.logger.log("verify", result)
      if (result.status === const_HTTP_RESPONSE.SUCCESS) {
        this.verifyResult = result
        this.httpRequestStateService.finishRequest(this.verifyRequestState)
      } else {
        this.utilsService.showSnackBar("Unable to verify, Please try later")
        this.httpRequestStateService.finishRequestWithError(this.verifyRequestState)
        this.dialogRef.close()
      }
    }, (err: HttpErrorResponse) => {
      this.utilsService.showSnackBar("Something went wrong, Please try later")
      this.httpRequestStateService.finishRequestWithError(this.verifyRequestState)
      this.dialogRef.close()
    });
  }
  
  close(){
    this.dialogRef.close()
  }
}
