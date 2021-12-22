import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { VerificationService } from 'src/app/core/services/verification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { const_HTTP_RESPONSE } from 'src/app/shared/models/app-common-constants';
import { PoeService } from 'src/app/core/services/poe.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { NGXLogger } from 'ngx-logger';
import { Route, Router, ActivatedRoute, ParamMap, RoutesRecognized } from '@angular/router';
import { switchMap, map } from 'rxjs/operators';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { LoadingSpinnerService } from 'src/app/core/services/loading-spinner.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent implements OnInit, OnDestroy {
  queryResponse
  searchForm: FormGroup
  // captchaFormGroup:FormGroup
  // captchaval: FormControl
  reCaptcha: FormControl
  rollNo: FormControl
  verificationRequest: HttpRequestState = new HttpRequestState()
  getPosRequestState:  HttpRequestState = new HttpRequestState()
  public heading = ""
  constructor(
    private logger: NGXLogger,
    private formBuilder: FormBuilder,
    private httpRequestStateService: HttpRequestStateService,
    private verificationService: VerificationService,
    private poeService: PoeService,
    private utils: UtilsService,
    private route: ActivatedRoute,
    private router: Router,
    private navService: NavigationService,
    private loadingSpinnerService: LoadingSpinnerService
  ) {
    if (navService.isVisible()) {
      this.navService.hide()
    }
  }

  ngOnInit() {
    this.initComponent();
    this.heading = this.getRouteData('title')
  }

  ngOnDestroy() {
    this.httpRequestStateService.destroyRequest(this.verificationRequest)
    this.navService.makeVisibleIfLoggedIn()
  }

  initComponent() {
    // this.captchaval = new FormControl('', [Validators.required, Validators.minLength(4),Validators.pattern("[a-zA-Z0-9]*")])
    this.rollNo = new FormControl('', [Validators.required, Validators.pattern('[0-9]{12}$')])
    this.reCaptcha = new FormControl(null, Validators.required)

    this.searchForm = this.formBuilder.group({
      // captchaval: this.captchaval,
      rollNo: this.rollNo,
      recaptcha: this.reCaptcha
    })
    // this.getCaptcha()
    //login form
    // this.captchaFormGroup = this.formBuilder.group({
    //   captchaval: this.captchaval
    // })
  }
  private getRouteData(data: string): any {
    const root = this.router.routerState.snapshot.root;
    return root.firstChild.data.title
  }


  verify() {
    this.httpRequestStateService.initRequest(this.verificationRequest)
    this.verificationRequest.subscription = this.verificationService.verify(this.searchForm.value).subscribe((result: any) => {
      this.logger.debug(result)
      // TODO response status
      // if (result.status = const_HTTP_RESPONSE.SUCCESS) {
      if (result.length) {
        // if(result.result){
        this.queryResponse = result
        this.httpRequestStateService.finishRequest(this.verificationRequest)
        // }else{
        //   this.verificationRequest.msgToUser = result.message
        //   this.utils.showSnackBar(this.verificationRequest.msgToUser)
        //   this.getCaptcha()
        //   this.httpRequestStateService.finishRequestWithError(this.verificationRequest)
        // }
      } else {
        this.resetCaptcha()
        this.verificationRequest.msgToUser = result.message
        this.utils.showSnackBar(this.verificationRequest.msgToUser)
        this.rollNo.reset()
        // this.getCaptcha()
        this.httpRequestStateService.finishRequestWithError(this.verificationRequest)
      }
    }, (err: HttpErrorResponse) => {
      this.resetCaptcha()
      this.utils.showSnackBar('something went wrong...!')
      // this.getCaptcha()
      this.httpRequestStateService.finishRequestWithError(this.verificationRequest)
    })
  }

  resetCaptcha() {
    this.reCaptcha.reset()
  }

  // getCaptchaValidationMessage() {
  //   return this.captchaval.hasError('required') ? 'You must provide valid captcha' :
  //   this.captchaval.hasError ('pattern') ? ' spaces are not allowed' : ''
  // }
  getRollNoValidationMessage() {
    return this.rollNo.hasError('required') ? 'You must provide roll no' :
      this.rollNo.errors ? 'Invalid roll no' : ''
  }

  // getCaptcha() {
  //   this.captchaval.reset()
  //   this.verificationService.getCaptcha().subscribe((result) => {
  //     var image = document.createElement('img');
  //     image = document.querySelector(" #captchaimg ");
  //     image.src = window.URL.createObjectURL(result);
  //     this.logger.log("Captcha created.. ")
  //   }, (error: HttpErrorResponse) => {
  //     this.logger.log("Failed to create captcha.. ")
  //   })
  // }

  changeRoute() {
    this.resetCaptcha()
    this.httpRequestStateService.destroyRequest(this.verificationRequest)
    // this.getCaptcha()
  }


  downloadPosFile(posHash, filename) {
    this.loadingSpinnerService.openLoadingDialog()
    this.httpRequestStateService.initRequest(this.getPosRequestState)
    this.logger.log("getPos Request", posHash)
    this.getPosRequestState.subscription = this.poeService.getPosFile(posHash).subscribe((result: any) => {
      // this.logger.log("getPos Result", result)
      if (result.status == "Success") {

        //REVIEW 
        // const linkSource = this.posRsponseBase64
        // this.fileSrc = linkSource
        // this.fileExtension = this.types.find(type => type.key === (linkSource.slice(linkSource.indexOf(':') + 1, linkSource.indexOf(';')))).value
        this.httpRequestStateService.finishRequest(this.getPosRequestState)
        // this.downloadPdfFromBase64(data)
        this.utils.showFileInNewTabFromB64(result.base64, filename)
      } else {
        this.httpRequestStateService.finishRequestWithError(this.getPosRequestState)
        // this.utilsService.showSnackBar("Faild to get file, please try later")
        this.utils.showActionDialog("Failed", "Faild to get file, please try later")
      }
      this.loadingSpinnerService.closeLoading()
    }, (error: HttpErrorResponse) => {
      this.logger.log("getPos Error : ", error)
      this.httpRequestStateService.finishRequestWithError(this.getPosRequestState)
      this.utils.showActionDialog("Failed", "Faild to get file, please try later")
      this.loadingSpinnerService.closeLoading()
    })
  }

}
