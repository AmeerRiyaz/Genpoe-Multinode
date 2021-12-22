import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { MenuTypes } from '../menu/menu.component';
import { AuthService } from '../../auth/services/auth.service';
import { AppGlobals } from 'src/app/config/app-globals';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  menuTypes = MenuTypes
  constructor(
    public appGlobals: AppGlobals,
    public navService : NavigationService,
    public authService: AuthService
  ) { }

  ngOnInit() {
  }

  onLogoutClick(){
    this.authService.logout()
  }
}
