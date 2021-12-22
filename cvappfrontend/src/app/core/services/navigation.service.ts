import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  visible: boolean;
  isLoggedIn: boolean
  constructor(
    private authService: AuthService
  ) {
    // this.visible = false; 
    this.isLoggedIn = this.authService.isLoggedIn()
    this.visible = this.isLoggedIn
    this.authService.loginStatusChange.subscribe(loginState => {
      this.isLoggedIn = loginState
      this.visible = this.isLoggedIn
    })
  }

  isVisible() {
    return this.visible
  }
  makeVisibleIfLoggedIn(){
    if(this.isLoggedIn){
      this.show()
    }
  }
  hide() { this.visible = false; }

  show() { this.visible = true; }

  toggle() { this.visible = !this.visible; }

}
