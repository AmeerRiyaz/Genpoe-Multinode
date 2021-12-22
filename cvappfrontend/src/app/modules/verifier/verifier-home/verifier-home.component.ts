import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { VerifierService } from 'src/app/core/services/verifier.service';

@Component({
  selector: 'app-verifier-home',
  templateUrl: './verifier-home.component.html',
  styleUrls: ['./verifier-home.component.css']
})
export class VerifierHomeComponent implements OnInit, OnDestroy {
  isEmailVerified: boolean = false
  verifierEmail
  constructor(
    private verifierService: VerifierService,
    private router: Router
  ) { 
  }

  ngOnInit() {
    this.isEmailVerified = false
    this.isEmailVerified = this.verifierService.emailVerified
    // this.isEmailVerified = true // for debugging
    if (this.isEmailVerified) {
      // window.history.pushState( {} , '', '/' );
      this.verifierEmail = this.verifierService.verfierEmail
      this.router.navigate(['verifier/certificates'])
    } else {
      this.router.navigate(['/'])
    }
  }
  ngOnDestroy(): void {
    this.isEmailVerified = false
    this.verifierService.invalidateVerifier()
  }
  onHomeClick(){
    this.router.navigate(['/'])
  }
  onLogoutClick(){
    this.router.navigate(['/'])
  }
}
