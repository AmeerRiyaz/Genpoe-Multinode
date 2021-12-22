import { Injectable, EventEmitter, Output } from '@angular/core';
import { SigninRequest } from 'src/app/shared/models/request-response/signin-request';
import { NGXLogger } from 'ngx-logger';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { SigninResponse } from 'src/app/shared/models/request-response/signin-response';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AppGlobals } from 'src/app/config/app-globals';
import { SignupRequest } from 'src/app/shared/models/signup-request';
import { SignupRequestOrg } from 'src/app/shared/models/signup-request-org';
import { SigninOrgRequest } from 'src/app/shared/models/request-response/signin-org-request';

export const ROLES = {
  POE_ORG_ADMIN: "admin",
  POE_ORG_USER: "user",
  POE_USER: 'writer'
}

export const const_AuthService = {
  TOKEN_KEY: "currentUser",
  AUTH_URL: "/users/genpoeauth",
  captcha_URL: "/captcha",
  signupUrl: "/genpoe/userreg",
  forgotPassword: "/user/forgotpwd",
  forgotPasswordChange: "/user/forgotpwdchange",
  changePwdUrl: "/genpoe/user/changepwd",

  orgProfileInfo: "/generic/userDetails",
  individualProfileInfo: '/genpoe/getUserInfo',


  signupUrlOrg: "/generic/orgReg",
  ORG_AUTH_URL: "/generic/orgUserAuthenticate",
  changePwdUrlOrg: "/generic/changepwd",
  forgotPasswordOrg: "/generic/forgotpwd",
  forgotPasswordChangeOrg: "/generic/forgotpwdchange",
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  orgLogo = null
  jwtHelper = new JwtHelperService();
  private isUserLoggedIn = false;
  public currentLoggedInUser = ''
  @Output() loginStatusChange: EventEmitter<boolean> = new EventEmitter();
  @Output() roleChanged: EventEmitter<string> = new EventEmitter();
  @Output() loggedUserChanged: EventEmitter<string> = new EventEmitter();
  constructor(
    private appGlobals: AppGlobals,
    private logger: NGXLogger,
    private httpClient: HttpClient,
    private router: Router,
  ) { }

  /**
   * Initiate login
   */
  login(request: SigninRequest) {
    this.logger.log(request)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': "Basic " + btoa(`${request.username}:${request.password}`)
      })
    };
    return this.httpClient
      .post<SigninResponse>(environment.apiEndpoint + const_AuthService.AUTH_URL, { 'recaptcha': request.recaptcha }, httpOptions)
      // .post<SigninResponse>(environment.apiEndpoint + const_AuthService.AUTH_URL, request)
      .pipe(
        map((response: SigninResponse) => {
          /** 
           * login successful if there's a jwt token in the response
           */
          this.logger.log(response)
          if (response && response.token) {
            this.logger.log("logging in: successful")
            /** 
             * store username and jwt token in local storage to keep user logged in between page refreshes
             */
            localStorage.setItem(const_AuthService.TOKEN_KEY, response.token);
            this.isUserLoggedIn = true;
            this.currentLoggedInUser = this.getCurrentUser();
            this.loggedUserChanged.emit(this.getCurrentUser())
            this.loginStatusChange.emit(this.isUserLoggedIn);
            // this.roleChanged.emit(this.getCurrentRole());
            this.logger.log("token ", this.getTokenPayload())
          }
          return response;
        })
      );
  }


  /**
   * Initiate login
   */
  loginOrg(request: SigninOrgRequest) {
    this.logger.log(request)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': "Basic " + btoa(`${request.orgid}:${request.userid}:${request.password}`)
      })
    };
    return this.httpClient
      .post<SigninResponse>(environment.apiEndpoint + const_AuthService.ORG_AUTH_URL, { 'recaptcha': request.recaptcha }, httpOptions)
      // .post<SigninResponse>(environment.apiEndpoint + const_AuthService.AUTH_URL, request)
      .pipe(
        map((response: SigninResponse) => {
          /** 
           * login successful if there's a jwt token in the response
           */
          this.logger.log(response)
          if (response && response.token) {
            this.logger.log("logging in: successful")
            /** 
             * store username and jwt token in local storage to keep user logged in between page refreshes
             */
            localStorage.setItem(const_AuthService.TOKEN_KEY, response.token);
            this.isUserLoggedIn = true;
            this.currentLoggedInUser = this.getCurrentUser();
            this.loggedUserChanged.emit(this.getCurrentUser())
            this.loginStatusChange.emit(this.isUserLoggedIn);
            // this.roleChanged.emit(this.getCurrentRole());
            this.logger.log("token ", this.getTokenPayload())
          }
          return response;
        })
      );
  }




  isLoggedIn() {
    const token = localStorage.getItem(const_AuthService.TOKEN_KEY)
    if (!token) return false;
    if (this.jwtHelper.isTokenExpired(token)) {
      this.logger.log("isLoggedIn : failed, logging out as session expired")
      this.logout();
      this.router.navigate([AppGlobals.ROUTE_SIGNIN]);
      return false;
    }
    // this.logger.log("isLoggedIn : success, will expire at ", this.jwtHelper.getTokenExpirationDate(token))
    return true;
  }

  /**
   * Logout function clears token from local stoarage
   */
  logout() {
    this.orgLogo = null
    localStorage.removeItem(const_AuthService.TOKEN_KEY);
    this.isUserLoggedIn = false;
    this.loginStatusChange.emit(this.isUserLoggedIn);
    // this.roleChanged.emit('');
    this.currentLoggedInUser = '';
    this.router.navigate([AppGlobals.ROUTE_SIGNIN]);
    this.logger.info('logout done')
  }

  forgotPassword(request, isOrg?) {
    let url = isOrg ? const_AuthService.forgotPasswordOrg : const_AuthService.forgotPassword
    return this.httpClient.post(environment.apiEndpoint + url, request)
  }

  forgotPasswordChange(formValue, isOrg) {
    let url = isOrg ? const_AuthService.forgotPasswordChangeOrg : const_AuthService.forgotPasswordChange
    return this.httpClient.post(environment.apiEndpoint + url, formValue)
  }

  changePassword(request) {
    let url = this.isRolePoeUser() ? const_AuthService.changePwdUrl : const_AuthService.changePwdUrlOrg
    return this.httpClient.post(environment.apiEndpoint + url, request)
  }

  getCurrentUser() {
    return this.getTokenPayload().username;
  }

  getFullname() {
    return this.getTokenPayload().fullname;
  }

  getOrgname() {
    return this.getTokenPayload().userOrgName;
  }

  getCurrentRole() {
    return this.getTokenPayload().role;
  }

  isRoleOrgAdmin() {
    if (this.getCurrentRole() == ROLES.POE_ORG_ADMIN)
      return true
    return false
  }

  isRoleOrgUser() {
    if (this.getCurrentRole() == ROLES.POE_ORG_USER)
      return true
    return false
  }

  isRolePoeUser() {
    if (this.isLoggedIn())
      if (this.getCurrentRole() == ROLES.POE_USER)
        return true
    return false
  }

  // getCurrentOrg() {
  //   return this.getTokenPayload().orgName;
  //   // return this.currentLoggedInUser
  // }

  /**
   * helper method to get token payload from storage
   */
  getTokenPayload() {
    if (this.isLoggedIn())
      return this.jwtHelper.decodeToken(localStorage.getItem(const_AuthService.TOKEN_KEY));
  }

  getToken() {
    if (this.isLoggedIn())
      return localStorage.getItem(const_AuthService.TOKEN_KEY);
  }

  redirect() {
    if (this.isLoggedIn()) {
      if (this.getCurrentRole() == ROLES.POE_ORG_ADMIN) {
        this.router.navigate([this.appGlobals.ROUTE_POE_ORG_ADMIN_USER_LIST]);
      }
      else if (this.getCurrentRole() == ROLES.POE_ORG_USER) {
        this.router.navigate([this.appGlobals.ROUTE_POE_ORG_USER_LIST]);
      }
      // else if (this.getCurrentRole() == ROLES.POE_USER) {
      else {
        this.router.navigate([AppGlobals.ROUTE_POE_HOME]);
      }
    } else {
      this.router.navigate([AppGlobals.ROUTE_SIGNIN]);
    }

  }

  getCaptcha() {
    return this.httpClient.get(environment.apiEndpoint + const_AuthService.captcha_URL, { responseType: 'blob', withCredentials: true, reportProgress: true });
  }

  signup(signupRequest: SignupRequest) {
    return this.httpClient.post<any>(environment.apiEndpoint + const_AuthService.signupUrl, signupRequest);
  }

  signupOrg(signupRequest: SignupRequestOrg) {
    return this.httpClient.post<any>(environment.apiEndpoint + const_AuthService.signupUrlOrg, signupRequest);
  }

  getTotalTransactions() {
    return this.httpClient.get(environment.apiEndpoint + '/genpoechannel/info')
  }

  getProfile() {
    let url = this.isRolePoeUser() ? const_AuthService.individualProfileInfo : const_AuthService.orgProfileInfo
    return this.httpClient.get(environment.apiEndpoint + url)
  }

  getLogo() {
    return this.httpClient.get(environment.apiEndpoint + "/generic/org/getLogo")
  }
}
