import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { MenuTypes } from '../menu/menu.component';
import { Router, Event, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { MatSidenav } from '@angular/material';
import { AuthService } from '../../auth/services/auth.service';
import { AppGlobals } from 'src/app/config/app-globals';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from '../../services/http-request-state.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  menuTypes = MenuTypes
  isRouteLoading = false
  @ViewChild("sidebar", { static: false }) sidebar: MatSidenav
  componentInitDone = false
  getLogoRequest: HttpRequestState = new HttpRequestState()
  currentRoute = ""
  profileRoute = "/org/admin/profile"
  
  constructor(
    public navService: NavigationService,
    private router: Router,
    public authService: AuthService,
    public appGlobals: AppGlobals,
    private httpStateService: HttpRequestStateService
  ) { 
    this.router.events.subscribe((event: Event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.isRouteLoading = true;
          break;
        }

        case event instanceof NavigationEnd: {
          var e = event as NavigationEnd
          this.currentRoute =  e.url
        }
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.isRouteLoading = false;
          break;
        }
        default: {
          break;
        }
      }
    });
  }

  ngOnInit() {
    this.navService.initSidebar(this.sidebar) 
    this.getLogoRequest = new HttpRequestState();
    if(this.authService.isLoggedIn()){
      this.setLogo()  
    }
    this.authService.loginStatusChange.subscribe(loginState => {
      this.setLogo()  
    })
    
  }

  onLogoutClick(){
    this.authService.logout()
  }

  setSidebar(){
    /**
     *  setSidebar method called to set the sidebar varibale in service
        it is required because sidebar is only init after certain checks and misses the oninit
        so need to manully set it
     */
    this.navService.initSidebar(this.sidebar)
    
    return true
  }
  setLogo() {
    this.getLogoRequest = new HttpRequestState();

    this.httpStateService.initRequest(this.getLogoRequest)
    this.getLogoRequest.subscription = this.authService.getLogo().subscribe((result: any) => {
      console.log("set logo",result)
      // if (this.authService.orgLogo != result.result) {
      //   this.authService.orgLogo = result.result
      // }
      if(result.status == this.appGlobals.HTTP_SUCCESS){
        this.authService.orgLogo = result.result
        this.httpStateService.finishRequest(this.getLogoRequest)
      }else{
        
        this.httpStateService.finishRequestWithErrorAndNoErrorMessage(this.getLogoRequest)
        this.getLogoRequest.msgToUser = "Upload Logo"
        // console.log("Else",this.getLogoRequest)
      }
    },(err: HttpErrorResponse)=>{
      this.httpStateService.finishRequestWithError(this.getLogoRequest)
    })
  }


  
  
}
