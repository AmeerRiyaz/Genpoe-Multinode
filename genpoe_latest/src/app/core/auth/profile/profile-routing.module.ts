import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyAccountComponent } from './my-account/my-account.component';
import { AuthGuard } from '../guards/auth.guard';
import { ROLES } from '../services/auth.service';

const routes: Routes = [
  // {
  //   path : '',
  //   redirectTo : 'my-account',
  //   pathMatch: 'full'
  // },
  {
    path: '',
    component: MyAccountComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "My Account",
      expectedRole: [ROLES.POE_ORG_ADMIN, ROLES.POE_ORG_USER, ROLES.POE_USER],
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
