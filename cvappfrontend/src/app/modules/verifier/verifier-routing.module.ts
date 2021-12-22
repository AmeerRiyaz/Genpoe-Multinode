import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VerifierHomeComponent } from './verifier-home/verifier-home.component';
import { user_roles } from 'src/app/core/auth/auth.service';
import { AuthGuard } from 'src/app/core/auth/guards/auth.guard';
import { PublicSearchComponent } from '../../shared/layout/public-search/public-search.component';
import { SharedCertificatesComponent } from './shared-certificates/shared-certificates.component';
import { VerifierPublicLinkDetailsComponent } from './verifier-public-link-details/verifier-public-link-details.component';
import { VerifierPublicLinkPosComponent } from './verifier-public-link-pos/verifier-public-link-pos.component';

//REVIEW  Lazy loading required [not implemented]?
const routes: Routes = [
  // Verifier is not in use
  // {
  //   path: 'verifier',
  //   component: VerifierHomeComponent,
  //   children: [

  //     {
  //       path: 'certificates',
  //       component: SharedCertificatesComponent,
  //       // canActivate: [AuthGuard],
  //       // data: {
  //       //   title: "Verifier",
  //       //   expectedRole: [user_roles.VR], 
  //       // }
  //     },
  //     {
  //       path: 'search',
  //       component: PublicSearchComponent,
  //       // canActivate: [AuthGuard],
  //       // data: {
  //       //   title: "Verifier",
  //       //   expectedRole: [user_roles.VR], 
  //       // }
  //     },
  //   ]
  // },
  {
    path: 'poe/transaction/:txId', 
    component: VerifierPublicLinkDetailsComponent
  },
  {
    path: 'pos/transaction/:hash', 
    component: VerifierPublicLinkPosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VerifierRoutingModule { }
