import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { AuthService, user_roles } from 'src/app/core/auth/auth.service';
import { ActivatedRoute, Router, RoutesRecognized, ChildActivationStart } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  @ViewChild('drawer', { static: false }) drawer

  isLoggedIn = false;
  currentRoute = "";
  currentRole = ''
  roleList;
  title = ''
  currentUser = ''
  constructor(
    private authService: AuthService,
    public route: ActivatedRoute,
    private router: Router,
    private titleService: Title
  ) { }

  ngOnInit() {
    this.roleList = user_roles;
    this.isLoggedIn = this.authService.isLoggedIn();
    
    
    if(this.isLoggedIn){
      this.currentRole = this.authService.getCurrentRole();
      this.currentUser = this.authService.getCurrentUser()
    }
    this.authService.loginStatusChange.subscribe((result: boolean) => {
      this.isLoggedIn = result;
    })

    this.authService.roleChanged.subscribe((result: string) => {
      this.currentRole = result;
    })

    this.authService.loggedUserChanged.subscribe((result: string) => {
      this.currentUser = result;
    })
    // this.logger.log(this.currentRole)

    this.router.events.subscribe(event => {
      // this.logger.log(event)
      if (event instanceof RoutesRecognized) {
        let route = event.state.root.firstChild;
        this.currentRoute = route.data.title
        // this.logger.log(route)
        if(route.children.length){
          this.currentRoute+=" > " + route.children[0].data.title
        }
      }
    });
  }

  onLogoutClick() {
    this.authService.logout()
  }

  toggleSidebar(){
    this.drawer.toggle()
    // this.logger.log(this.drawer.opened)

    // if(this.drawer.opened){
    //   this.title = ''
    // }
    // if(!this.drawer.opened){
    //   this.title = 'e-Certificate Verification'
    // }
  }

}
