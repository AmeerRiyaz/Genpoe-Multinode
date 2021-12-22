import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AuthService } from 'src/app/core/auth/auth.service';
import { DataService } from 'src/app/core/services/data.service';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { StudentSignupComponent } from 'src/app/modules/student/student-signup/student-signup.component';
import { AppGlobals } from 'src/app/configs/app-globals';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-homepage-with-certificate-list',
  templateUrl: './homepage-with-certificate-list.component.html',
  styleUrls: ['./homepage-with-certificate-list.component.css']
})
export class HomepageWithCertificateListComponent implements OnInit {
  // responsive variables
  // mobileQueryWidth: MediaQueryList;
  // mobileQueryHeight: MediaQueryList;
  // private _mobileQueryListener: () => void;

  browser
  public showArray = {
    SIGNIN: 'sigin',
    // SIGNUP: 'signup',
    VERIFIER: 'verifier',
    MENU: 'menu'
  }
  isHovering = [false, false, false];
  currentShow: string = this.showArray.SIGNIN
  isLoggedIn = false
  // getCertificatesRequestState: HttpRequestState = new HttpRequestState()
  // recentCertificates;
  constructor(

    // changeDetectorRef: ChangeDetectorRef,
    // media: MediaMatcher,
    public appGlobals: AppGlobals,
    private dialog: MatDialog,
    private dataService: DataService,
    private deviceService: DeviceDetectorService,
    private httpRequestStateService: HttpRequestStateService,
    private router: Router,
    private authService: AuthService
  ) {
    // this.browser = this.deviceService.getDeviceInfo().browser

    // this.mobileQueryWidth = media.matchMedia('(max-width: 600px)')
    // this.mobileQueryHeight = media.matchMedia('(max-height: 479px)')
    // this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    // this.mobileQueryWidth.addListener(this._mobileQueryListener)
    // this.mobileQueryHeight.addListener(this._mobileQueryListener)
  }

  ngOnInit() {
    this.currentShow = this.showArray.MENU
    // this.getCertificates();
    // this.isLoggedIn = this.authService.isLoggedIn()
    if (this.authService.isLoggedIn()) {
      this.authService.redirectAsPerRole();
      return
    }
  }

  ngOnDestroy(): void {
    // this.mobileQueryHeight.removeListener(this._mobileQueryListener);
    // this.mobileQueryWidth.removeListener(this._mobileQueryListener);
  }

  // getCertificates() {
  //   this.httpRequestStateService.initRequestWithoutTimeoutMessage(this.getCertificatesRequestState)
  //   this.getCertificatesRequestState.subscription = this.dataService.getRecentCertificates().subscribe(result => {
  //     // this.logger.log("getCertificates() list: ", result)
  //     if (result) {
  //       this.recentCertificates = result
  //       this.httpRequestStateService.finishRequest(this.getCertificatesRequestState)
  //     } else {
  //       this.httpRequestStateService.finishRequestWithError(this.getCertificatesRequestState)
  //     }
  //   },
  //     (err: HttpErrorResponse) => {
  //       // this.logger.log(err.message);
  //       this.httpRequestStateService.finishRequestWithError(this.getCertificatesRequestState)
  //     });
  // }

  openSignupDialog() {
    const dialogRef = this.dialog.open(StudentSignupComponent, {
      minWidth: '450px',
      maxHeight: '550px'
    });
    dialogRef.afterClosed().subscribe(result => {
      // this.logger.log('The dialog was closed, ', result);
    });
  }

  mouseHovering(i) {
    this.isHovering[i] = true;
  }

  mouseLeaving(i) {
    this.isHovering[i] = false;
  }

  public navigate(route) {
    this.router.navigate([route]);
  }
}
