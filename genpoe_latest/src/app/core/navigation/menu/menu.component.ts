import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { AuthService } from '../../auth/services/auth.service';
import { AppGlobals } from 'src/app/config/app-globals';
export enum MenuTypes {
  sidemenu = 'sidemenu',
  topmenu = 'topmenu',
}
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  @ViewChild("sidebar", { static: false }) sidebar
  @Input('mode') mode: MenuTypes
  constructor(
    public navService: NavigationService,
    public authService: AuthService,
    public appGlobals: AppGlobals
  ) { }
  ngOnInit() { }

  onLogoutClick() {
    this.navService.closeSidebar()
    this.authService.logout()
  }
}
