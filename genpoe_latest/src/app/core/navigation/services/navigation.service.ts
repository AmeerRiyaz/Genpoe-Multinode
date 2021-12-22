import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { MatSidenav } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  public totalTransactionCount = '-'
  public canShown = false
  sidebar: MatSidenav
  constructor(
    authService: AuthService
  ) {
    if (authService.isLoggedIn()) {
      this.show()
    } else {
      this.hide()
    }
    authService.loginStatusChange.subscribe(loginState => {
      this.canShown = loginState
    })
  }


  hide() { this.canShown = false; }

  show() { this.canShown = true; }

  // toggle() { this.canShown = !this.canShown; }

  initSidebar(sidebar) {
    this.sidebar = sidebar
  }
  toggleSidebar() {
    this.sidebar.toggle()
  }
  closeSidebar() {
    this.sidebar.close()
  }
}
