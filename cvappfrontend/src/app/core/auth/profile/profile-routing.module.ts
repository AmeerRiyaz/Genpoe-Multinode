import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { RoutesProfile } from './profile-routes';
import { MyAccountComponent } from './my-account/my-account.component';

const routes: Routes = [
  // {
  //   path : '',
  //   redirectTo : 'my-account',
  //   pathMatch: 'full'
  // },
  {
    path: RoutesProfile.HOME,
    component: MyAccountComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "My Account",
      expectedRole: ['role'],
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
