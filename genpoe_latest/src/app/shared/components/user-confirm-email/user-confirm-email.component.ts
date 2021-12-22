import { Component, OnInit } from '@angular/core';
import { HttpRequestState } from '../../models/http-request-state';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { PoeService } from 'src/app/modules/poe/services/poe.service';
import { AppGlobals } from 'src/app/config/app-globals';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-confirm-email',
  templateUrl: './user-confirm-email.component.html',
  styleUrls: ['./user-confirm-email.component.css']
})
export class UserConfirmEmailComponent implements OnInit {

  activateUserRequest: HttpRequestState = new HttpRequestState()
  token
  constructor(
    private route: ActivatedRoute,
    private httpStateService: HttpRequestStateService,
    private poeService: PoeService,
    private appGlobals: AppGlobals,
    private router: Router,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.token = params['token'];
      // this.secret = params['secret'];
        this.activateUser()
    });
  }

  activateUser() {
    this.httpStateService.initRequest(this.activateUserRequest)
    // this.activateUserRequest.msgToUser = "Verifying"
    this.activateUserRequest.subscription = this.poeService.activateUser(this.token, this.route.snapshot.data.isOrg).subscribe((result: any) => {
      if (result.status == this.appGlobals.HTTP_SUCCESS) {
        this.httpStateService.finishRequest(this.activateUserRequest)
        this.activateUserRequest.msgToUser = result.message
      } else {
        this.activateUserRequest.msgToUser = result.message
        this.httpStateService.finishRequestWithError(this.activateUserRequest) 
      }
    }, (error: HttpErrorResponse) => {
      // this.logger.log(error)
      this.httpStateService.finishRequestWithError(this.activateUserRequest)
      this.activateUserRequest.msgToUser = "Faild to verify"
    })
  }

  takeToLogin() {
    this.router.navigate([AppGlobals.ROUTE_SIGNIN]);
  }

}
