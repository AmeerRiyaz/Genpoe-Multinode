import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-training-coordinator-dashboard',
  templateUrl: './training-coordinator-dashboard.component.html',
  styleUrls: ['./training-coordinator-dashboard.component.css']
})
export class TrainingCoordinatorDashboardComponent implements OnInit {
  isHovering = [false, false, false, false];
  username
  role
  centre
  imageUrlArray: (string)[] = [
    environment.uiEndpoint + 'assets/tc/tc1.png',
    environment.uiEndpoint + 'assets/tc/tc2.png',
    environment.uiEndpoint + 'assets/tc/tc3.png',
    environment.uiEndpoint + 'assets/tc/tc4.png',
    environment.uiEndpoint + 'assets/tc/tc5.png',
    environment.uiEndpoint + 'assets/tc/tc6.png',
    environment.uiEndpoint + 'assets/tc/tc7.png',
    environment.uiEndpoint + 'assets/tc/tc8.png',
    environment.uiEndpoint + 'assets/tc/tc9.png',
    environment.uiEndpoint + 'assets/tc/tc10.png',
    environment.uiEndpoint + 'assets/tc/tc11.png',
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
