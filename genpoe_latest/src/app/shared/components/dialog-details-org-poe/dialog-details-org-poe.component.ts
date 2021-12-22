import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PoeService } from 'src/app/modules/poe/services/poe.service';
import { UtilsService } from '../../services/utils.service';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { AppGlobals } from 'src/app/config/app-globals';
import { NGXLogger } from 'ngx-logger';
import { LoadingSpinnerService } from '../../services/loading-spinner.service';
import { HttpRequestState } from '../../models/http-request-state';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dialog-details-org-poe',
  templateUrl: './dialog-details-org-poe.component.html',
  styleUrls: ['./dialog-details-org-poe.component.css']
})
export class DialogDetailsOrgPoeComponent implements OnInit {
  getPosRequestState: HttpRequestState = new HttpRequestState()
  posRsponseBase64
  constructor(
    public dialogRef: MatDialogRef<DialogDetailsOrgPoeComponent>,
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
    console.log(this.data)
  }

  close() {
    this.dialogRef.close()
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
}
