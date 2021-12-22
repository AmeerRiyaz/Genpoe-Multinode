import { Component, OnInit, Input } from '@angular/core';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { ActivatedRoute } from '@angular/router';
import { PosService } from 'src/app/core/services/pos.service';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { const_HTTP_RESPONSE } from 'src/app/shared/models/app-common-constants';
import { HttpErrorResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-verifier-public-link-pos',
  templateUrl: './verifier-public-link-pos.component.html',
  styleUrls: ['./verifier-public-link-pos.component.css']
})
export class VerifierPublicLinkPosComponent implements OnInit {
  hashFromUrl
  @Input() hashFromInput

  posRsponseBase64
  fileSrc
  fileExtension
  getPosRequestState: HttpRequestState = new HttpRequestState()
  showHeader = false
  
  imageRegex = new RegExp("(.png|.jpg|.jpeg|.bmp)$", 'i')
  pdfRegex = new RegExp("(.pdf)$", 'i')
  // docRegex = new RegExp("(.doc|.docx)$", 'i')
  // pptRegex = new RegExp("(.ppt|.pptx)$", 'i')

  types = [

    { key: "application/pdf", value: ".pdf" },
    { key: "image/png", value: ".png" },
    { key: "image/jpeg", value: ".jpeg" },
    { key: "image/bmp", value: ".bmp" },
    { key: "application/octet-stream", value: ".pdf" }  //REVIEW verify this and try to replace octate stream in pdf split iteslf

    // { key: "application/msword", value: ".doc" },
    // { key: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", value: ".docx" },
    // { key: "application/vnd.ms-powerpoint", value: ".ppt" },
    // { key: "application/vnd.openxmlformats-officedocument.presentationml.presentation", value: 'pptx' }
  ]



  constructor(
    private logger: NGXLogger,
    private route: ActivatedRoute,
    private posService: PosService,
    private httpStateService: HttpRequestStateService,
    private utilsService: UtilsService,
    private navService: NavigationService
  ) {
    if (this.navService.isVisible()) {
      this.navService.hide()
    }
  }

  ngOnInit() {
    // Read from url parameter
    this.route.params.subscribe(params => {
      this.hashFromUrl = params['hash'];
      if (this.hashFromUrl) {
        this.getPos(this.hashFromUrl)
        this.showHeader = true
      }
    });
    //read from input variable
    if(this.hashFromInput){
      this.getPos(this.hashFromInput)
    }
  }

  getPos(hashReq) {
    this.httpStateService.initRequest(this.getPosRequestState)
    this.logger.log("getPos Request", hashReq)
    this.getPosRequestState.subscription = this.posService.getPosFile(hashReq).subscribe((result: any) => {
      this.logger.log("getPos Result", result)
      if (result.status == const_HTTP_RESPONSE.SUCCESS) {

        this.posRsponseBase64 = result.base64
        const linkSource = this.posRsponseBase64
        this.fileSrc = linkSource
        this.fileExtension = this.types.find(type => type.key === (linkSource.slice(linkSource.indexOf(':') + 1, linkSource.indexOf(';')))).value
        this.httpStateService.finishRequest(this.getPosRequestState)
      } else {
        this.httpStateService.finishRequestWithError(this.getPosRequestState)
        this.utilsService.showDialog("Failed", "Failed to get file, please try later")
      }
    }, (error: HttpErrorResponse) => {
      this.logger.log("getPos Error : ", error)
      this.httpStateService.finishRequestWithError(this.getPosRequestState)
      this.utilsService.showDialog("Failed", "Failed to get file, please try later")
    })
  }

  downloadPdfFromBase64() {
    const linkSource: string = this.posRsponseBase64
    const downloadLink = document.createElement("a");
    const fileName = (this.hashFromUrl || this.hashFromInput) + this.fileExtension

    downloadLink.href = linkSource
    downloadLink.download = fileName;
    // downloadLink.click();
    downloadLink.dispatchEvent(new MouseEvent(`click`, { bubbles: true, cancelable: true, view: window }));
  }
}
