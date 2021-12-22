import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { LoginRequest } from 'src/app/shared/models/login-request';
import { LoginResponse } from 'src/app/shared/models/login-response';
import { _httpResponse } from 'src/app/shared/models/http-common-Response';
import { NGXLogger } from 'ngx-logger';
@Injectable({
  providedIn: 'root'
})
export class VerificationService {

  verificationUrl = '/poe/verifier/rollNo'
  captcha_URL = '/captcha'
  // captchaVeri_URL='/poe/verifier/records/'
  constructor(
    private logger: NGXLogger,
    private httpClient: HttpClient
  ) {
    this.verificationUrl = environment.apiEndpoint + this.verificationUrl
  }

  verify(request) {
    return this.httpClient.post(this.verificationUrl, request,{withCredentials: true })
    .pipe(
      map((response:_httpResponse) => {
        /** 
         * login successful if there's a jwt token in the response
         */
        return response
      })
    )
  }
  getCaptcha() {
    return this.httpClient.get(environment.apiEndpoint + this.captcha_URL,
      { responseType: 'blob', withCredentials: true, reportProgress: true });
  }
  // captchaValidate(request) {
  //   this.logger.log(request)
  //   var res= this.httpClient
  //     .post<_httpResponse>(environment.apiEndpoint + this.captchaVeri_URL, request, { withCredentials: true })
  //     this.logger.log('test ..')
  //     this.logger.log(res)
  //     return res
  // }
}
