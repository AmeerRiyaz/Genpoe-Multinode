import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { AuthService } from '../services/auth.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { AppGlobals } from 'src/app/config/app-globals';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  isLoggedIn: boolean;
  constructor(
    private appGlobals: AppGlobals,
    private logger: NGXLogger,
    public authService: AuthService,
    private router: Router,
    private utils: UtilsService
  ) { }

  // canActivate(
  //   next: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //   return true;
  // }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    let expectedRoleArray = next.data.expectedRole;

    /**
   * Checks if user is already logged in and token is valid
   * IF not logged in redirect to login page
   */
    if (!this.authService.isLoggedIn()) {
      this.logger.log(AppGlobals.ROUTE_SIGNIN)
      this.router.navigate([AppGlobals.ROUTE_SIGNIN]);
      return false
    }

    //FOR ROLE BASED SIGNIN

    var roleMatched = false;
    var currentRole = this.authService.getCurrentRole();

    /**
    * for requested route check if current role permissioned to access
    */
    for (let i = 0; i < expectedRoleArray.length; i++) {
      if (expectedRoleArray[i] === currentRole) {
        roleMatched = true;
        return true;
      }
    }

    /**
     * IF role not mathed propmt user with access denied alert
     */
    if (!roleMatched) {
      this.utils.showSnackBar("Access permission denied")
      this.authService.redirect();
      this.logger.log("access denied");
      return false;
    }

    return false;
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }
}
