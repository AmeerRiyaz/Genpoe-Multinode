import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from 'src/app/core/auth/guards/auth.guard';
import { ROLES } from 'src/app/core/auth/services/auth.service';
import { UserListComponent } from './user-list/user-list.component';
import { OrgProfileComponent } from './org-profile/org-profile.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: {
      title: "PoE Org",
      expectedRole: [ROLES.POE_ORG_ADMIN],
    },
    children: [
      {
        path: 'users',
        // pathMatch: 'full',
        component: UserListComponent,
        canActivate: [AuthGuard],
        data: {
          title: "PoE Org",
          expectedRole: [ROLES.POE_ORG_ADMIN],
        },
      },
      {
        path: 'profile',
        // pathMatch: 'full',
        component: OrgProfileComponent,
        canActivate: [AuthGuard],
        data: {
          title: "PoE Org",
          expectedRole: [ROLES.POE_ORG_ADMIN],
        },
      }
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrgAdminRoutingModule { }
