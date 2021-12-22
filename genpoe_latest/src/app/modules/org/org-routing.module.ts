import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AppGlobals } from 'src/app/config/app-globals';
import { AuthGuard } from 'src/app/core/auth/guards/auth.guard';
import { ROLES } from 'src/app/core/auth/services/auth.service';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: {
      title: "PoE Org",
      expectedRole: [ROLES.POE_ORG_ADMIN, ROLES.POE_ORG_USER],
    },
    children: [
      {
        path: AppGlobals.ROUTE_POE_ORG_ADMIN.split('/')[1],   //gives the route after /
        loadChildren: () => import('./org-admin/org-admin.module').then(m => m.OrgAdminModule),
        canActivate: [AuthGuard],
        data: {
          title: "PoE Org",
          expectedRole: [ROLES.POE_ORG_ADMIN],
        },
      },
      {
        path: AppGlobals.ROUTE_POE_ORG_USER.split('/')[1],    //gives the route after /
        loadChildren: () => import('./org-user/org-user.module').then(m => m.OrgUserModule),
        canActivate: [AuthGuard],
        data: {
          title: "PoE Org",
          expectedRole: [ROLES.POE_ORG_USER],
        },
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrgRoutingModule { }
