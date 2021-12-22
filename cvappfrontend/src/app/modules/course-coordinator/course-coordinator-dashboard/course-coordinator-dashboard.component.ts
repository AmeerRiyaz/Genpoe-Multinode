import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-course-coordinator-dashboard',
  templateUrl: './course-coordinator-dashboard.component.html',
  styleUrls: ['./course-coordinator-dashboard.component.css']
})
export class CourseCoordinatorDashboardComponent implements OnInit {
  isHovering = [false, false, false, false];
  username
  role
  centre
  imageUrlArray: (string)[] = [
    environment.uiEndpoint + 'assets/cc/cc1.png',
    environment.uiEndpoint + 'assets/cc/cc2.png',
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
