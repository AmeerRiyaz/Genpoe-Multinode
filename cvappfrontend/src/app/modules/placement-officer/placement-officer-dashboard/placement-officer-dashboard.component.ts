import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-placement-officer-dashboard',
  templateUrl: './placement-officer-dashboard.component.html',
  styleUrls: ['./placement-officer-dashboard.component.css']
})
export class PlacementOfficerDashboardComponent implements OnInit {
  isHovering = [false, false];
  username
  role
  centre
  imageUrlArray: (string)[] = [
    environment.uiEndpoint + 'assets/po/po1.png',
    environment.uiEndpoint + 'assets/po/po2.png',
    environment.uiEndpoint + 'assets/po/po3.png',
  ];
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.username = this.authService.getCurrentUser()
    this.role = this.authService.getCurrentRole()
    this.centre = this.authService.getCurrentCentre()
  }
  public navigate(route) {
    this.router.navigate([route]);
  }
  mouseHovering(i) {
    this.isHovering[i] = true;
  }
  mouseLeaving(i) {
    this.isHovering[i] = false;
  }

}
