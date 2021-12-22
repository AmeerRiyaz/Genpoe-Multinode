import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  isHovering = [false];
  username
  // role
  // centre
  imageUrlArray: (string)[] = [
    environment.uiEndpoint + 'assets/ad/ad1.png',
    environment.uiEndpoint + 'assets/ad/ad2.png',
    environment.uiEndpoint + 'assets/ad/ad3.png',
    environment.uiEndpoint + 'assets/ad/ad4.png',
    environment.uiEndpoint + 'assets/ad/ad5.png',
  ];
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.username = this.authService.getCurrentUser()
    // this.role = this.authService.getCurrentRole()
    // this.centre = this.authService.getCurrentCentre()
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
