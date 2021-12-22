import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { AuthGuard } from './guards/auth.guard';
import { ROLES } from './services/auth.service';

const routes: Routes = [
  // { path: '', redirectTo: 'signin', pathMatch: 'full' },
  {
    path: 'signin',
    component: SigninComponent
  },
  {
    path: 'my-account',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard],
    data: {
      title: "Profile",
      expectedRole: [ROLES.POE_ORG_ADMIN, ROLES.POE_ORG_USER, ROLES.POE_USER],
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
