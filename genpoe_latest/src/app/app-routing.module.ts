import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { VerifierPublicLinkDetailsComponent } from './shared/components/verifier-public-link-details/verifier-public-link-details.component';
import { UserConfirmEmailComponent } from './shared/components/user-confirm-email/user-confirm-email.component';
import { ForgotPasswordComponent } from './core/auth/forgot-password/forgot-password.component';
import { AppGlobals } from './config/app-globals';
import { ROLES } from './core/auth/services/auth.service';

const routes: Routes = [

  { path: AppGlobals.ROUTE_HOME, redirectTo: AppGlobals.ROUTE_SIGNIN, pathMatch: 'full' },


  //poe user route
  {
    path: AppGlobals.ROUTE_POE_HOME,
    loadChildren: () => import('./modules/poe/poe.module').then(m => m.PoeModule),
    canActivate: [AuthGuard],
    data: {
      title: "PoE",
      expectedRole: [ROLES.POE_USER],
    },
  },


  //org poe user route
  {
    path: AppGlobals.ROUTE_POE_ORG_HOME,
    loadChildren: () => import('./modules/org/org.module').then(m => m.OrgModule),
    canActivate: [AuthGuard],
    data: {
      title: "PoE Org",
      expectedRole: [ROLES.POE_ORG_ADMIN, ROLES.POE_ORG_USER],
    },
  },


  {
    path: 'transaction/:searchKey',
    component: VerifierPublicLinkDetailsComponent
  },
  {
    path: 'org/file/:searchKey',
    component: VerifierPublicLinkDetailsComponent
  },

  {
    path: 'user/verify/:token',
    component: UserConfirmEmailComponent,
    data: { 'isOrg': false }
  },
  {
    path: 'org/verify/:token',
    component: UserConfirmEmailComponent,
    data:
      { 'isOrg': true }
  },
  {
    path: 'user/forgotpwd/:token',
    component: ForgotPasswordComponent
  },
  {
    path: 'org/forgotpwd/:token',
    component: ForgotPasswordComponent
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
