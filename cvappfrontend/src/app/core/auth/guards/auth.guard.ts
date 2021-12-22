import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, router_paths } from '../auth.service';
import { UtilsService } from '../../services/utils.service';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  isLoggedIn: boolean;
  constructor(
    private logger: NGXLogger,
    public auth: AuthService,
    private router: Router,
    private utils: UtilsService
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    let expectedRoleArray = next.data.expectedRole;

    /**
   * Checks if user is already logged in and token is valid
   * IF not logged in redirect to login page
   */
    if (!this.auth.isLoggedIn()) {
      this.router.navigate([router_paths.LOGIN]);
      return false
    }

    var roleMatched = false;
    var currentRole = this.auth.getCurrentRole();

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
    if(!roleMatched) {
      // this.utils.showSnackBar("You are not allowed to access this page")
      this.auth.redirectAsPerRole();
      this.logger.log("access denied");
      return false;
    }

    return false;
  }
}
