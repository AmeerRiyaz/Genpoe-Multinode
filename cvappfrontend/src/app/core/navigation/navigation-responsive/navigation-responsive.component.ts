import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { AuthService, user_roles } from 'src/app/core/auth/auth.service';
import { ActivatedRoute, Router, RoutesRecognized, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event, } from '@angular/router';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { AppGlobals } from 'src/app/configs/app-globals';

@Component({
  selector: 'app-navigation-responsive',
  templateUrl: './navigation-responsive.component.html',
  styleUrls: ['./navigation-responsive.component.css']
})
export class NavigationResponsiveComponent implements OnDestroy, OnInit {
  @ViewChild('sidenavdrawer', { static: false }) sidenavdrawer

  isLoggedIn = false;
  currentRoute = "";
  currentRole = ''
  currentCentre = ''
  roleList;
  title = ''
  currentUser = ''
  isRouteLoading = false

  //responsive design variables
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    public authService: AuthService,
    public route: ActivatedRoute,
    private router: Router,
    public navService: NavigationService,
    public appGlobals: AppGlobals
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.router.events.subscribe((event: Event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.isRouteLoading = true;
          break;
        }

        case event instanceof NavigationEnd:
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

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.roleList = user_roles;
    this.isLoggedIn = this.authService.isLoggedIn();


    if (this.isLoggedIn) {
      this.currentRole = this.authService.getCurrentRole();
      this.currentUser = this.authService.getCurrentUser()
      this.currentCentre = this.authService.getCurrentCentre()
    }
    this.authService.loginStatusChange.subscribe((result: boolean) => {
      this.isLoggedIn = result;
    })

    this.authService.roleChanged.subscribe((result: string) => {
      this.currentRole = result;
    })

    this.authService.loggedUserChanged.subscribe((result: string) => {
      this.currentUser = result;
    })
    // this.logger.log(this.currentRole)

    this.router.events.subscribe(event => {
      // this.logger.log(event)
      if (event instanceof RoutesRecognized) {
        let route = event.state.root.firstChild;
        this.currentRoute = route.data.title
        // this.logger.log(route)
        if (route.children.length) {
          this.currentRoute += " > " + route.children[0].data.title
        }
      }
    });
  }

  onLogoutClick() {
    this.authService.logout()
  }

  toggleSidebar() {
    this.sidenavdrawer.toggle()
  }
}
