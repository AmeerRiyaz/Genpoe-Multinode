import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { NGXLogger } from 'ngx-logger';
import { map } from 'rxjs/operators';
import { LoginRequest } from 'src/app/shared/models/login-request';
import { LoginResponse } from 'src/app/shared/models/login-response';
import { environment } from 'src/environments/environment';



export const const_AuthService = {
  TOKEN_KEY: "currentUserCVapp",
  AUTH_URL: "/org/signin",
  LOGOUT_URL: "/org/signin",  //will request server to invalidate token
  captcha_URL: "/captcha"
}

export const router_paths = {
  HOME: '',
  LOGIN: '',
  ADMIN: '/admin',
  STUDENT: "/student",
  CC: "/course",
  CH: "/centre",
  PO: "/placement",
  TC: "/training",
  VR: "/verifier"
}

export const user_roles = {
  ADMIN: "admin",
  STUDENT: "student",
  CC: "Course Coordinator",
  CH: "Centre Head",
  PO: "Placement Officer",
  TC: "Training Coordinator",

  VR: "Verifier"
}
// export const roles_list = [
//   { value: user_roles.CC, viewValue: '' },
//   { value: user_roles.CH, viewValue: '' },
//   { value: user_roles.PO, viewValue: '' },
//   { value: user_roles.TC, viewValue: '' }
// ]


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  jwtHelper = new JwtHelperService();
  private isUserLoggedIn = false;
  public currentLoggedInUser = ''

  @Output() loginStatusChange: EventEmitter<boolean> = new EventEmitter();
  @Output() roleChanged: EventEmitter<string> = new EventEmitter();
  @Output() loggedUserChanged: EventEmitter<string> = new EventEmitter();

  constructor(
    private logger: NGXLogger,
    private httpClient: HttpClient,
    private router: Router,
  ) { }

  /**
   * Initiate login
   */
  login(request: LoginRequest) {
    this.logger.log("request:", request)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': "Basic " + btoa(`${request.username}:${request.password}`)
      })
    };
    return this.httpClient
      .post<LoginResponse>(environment.apiEndpoint + const_AuthService.AUTH_URL, { 'recaptcha': request.recaptcha }, httpOptions) //{ withCredentials: true }
      // .post<LoginResponse>(environment.apiEndpoint + const_AuthService.AUTH_URL, request) //{ withCredentials: true }
      .pipe(
        map((response: LoginResponse) => {
          /** 
           * login successful if there's a jwt token in the response
           */
          this.logger.log(response)
          if (response && response.token) {
            this.logger.log("logging in: successful")
            /** 
             * store username and jwt token in local storage to keep user logged in between page refreshes
             */
            let user = request.username
            localStorage.setItem(const_AuthService.TOKEN_KEY, JSON.stringify({ user, token: response.token }));
            this.isUserLoggedIn = true;
            this.currentLoggedInUser = user;
            this.loggedUserChanged.emit(user)
            this.loginStatusChange.emit(this.isUserLoggedIn);
            this.roleChanged.emit(this.getCurrentRole());
            // this.logger.log("token ", this.getTokenPayload())
          }
          return response;
        })
      );
  }

  /**
   * Logout function clears token from local stoarage
   */
  logout() {
    //send request to invalidate token
    // this.httpClient.post(environment.apiEndpoint + const_AuthService.LOGOUT_URL, {
    //   username: this.getCurrentUser,
    //   centre: this.getCurrentCentre
    // })

    localStorage.removeItem(const_AuthService.TOKEN_KEY);
    this.isUserLoggedIn = false;
    this.loginStatusChange.emit(this.isUserLoggedIn);
    this.roleChanged.emit('');
    this.currentLoggedInUser = '';
    this.router.navigate([router_paths.LOGIN]);
  }
  logoutWithoutNavigation() {
    localStorage.removeItem(const_AuthService.TOKEN_KEY);
    this.isUserLoggedIn = false;
    this.loginStatusChange.emit(this.isUserLoggedIn);
    this.roleChanged.emit('');
    this.currentLoggedInUser = '';
    // this.router.navigate([router_paths.LOGIN]);
  }

  /**
   * redirect after sucessful login
   */
  redirectAsPerRole() {
    let currentRole = this.getCurrentRole();
    this.logger.log("redirecting to role: ", currentRole)
    if (currentRole == user_roles.ADMIN) {
      this.router.navigate([router_paths.ADMIN]);
    }
    else if (currentRole == user_roles.STUDENT) {
      this.router.navigate([router_paths.STUDENT]);
    }
    else if (currentRole == user_roles.CC) {
      this.router.navigate([router_paths.CC]);
    }
    else if (currentRole == user_roles.CH) {
      this.router.navigate([router_paths.CH]);
    }
    else if (currentRole == user_roles.PO) {
      this.router.navigate([router_paths.PO]);
    }
    else if (currentRole == user_roles.TC) {
      this.router.navigate([router_paths.TC]);
    }
  }

  redirect(route) {
    this.router.navigate([route])
  }

  isLoggedIn() {
    const token = localStorage.getItem(const_AuthService.TOKEN_KEY)
    if (!token) return false;
    if (this.jwtHelper.isTokenExpired(token)) {
      this.logger.log("isLoggedIn : failed, logging out as session expired")
      this.logout();
      this.router.navigate([router_paths.LOGIN]);
      return false;
    }
    // this.logger.log("isLoggedIn : success, will expire at ", this.jwtHelper.getTokenExpirationDate(token))
    return true;
  }

  getCurrentRole() {
    return this.getTokenPayload().role;
  }

  getCurrentUser() {
    return this.getTokenPayload().username;
  }

  getCurrentCentre() {
    return this.getTokenPayload().centre;
  }

  /**
   * helper method to get token payload from storage
   */
  getTokenPayload() {
    return this.jwtHelper.decodeToken(localStorage.getItem(const_AuthService.TOKEN_KEY));
  }
  getToken() {
    return JSON.parse(localStorage.getItem(const_AuthService.TOKEN_KEY)).token;
  }

  // configUrl = 'http://10.244.0.125:5000';
  // checkUrl = 'http://10.244.0.144:7002/cap';
  getCaptcha() {
    return this.httpClient.get(environment.apiEndpoint + const_AuthService.captcha_URL, { responseType: 'blob', withCredentials: true, reportProgress: true });
  }
  // validateCaptcha(str: any) {
  //   return this.httpClient.post(this.checkUrl,{'captchaval':str},{withCredentials:true})
  //     .pipe(
  //       map((response)=> {
  //       this.logger.log(response)
  //   }))
  // }
}
