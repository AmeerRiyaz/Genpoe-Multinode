import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from 'src/app/core/auth/guards/auth.guard';
import { ROLES } from 'src/app/core/auth/services/auth.service';
import { ViewPoeListComponent } from './view-poe-list/view-poe-list.component';
import { OrgPoeUploadComponent } from './org-poe-upload/org-poe-upload.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: {
      title: "PoE Org",
      expectedRole: [ROLES.POE_ORG_USER],
    },
    children: [
      {
        path: 'list',
        // pathMatch: 'full',
        component: ViewPoeListComponent,
        canActivate: [AuthGuard],
        data: {
          title: "PoE Org",
          expectedRole: [ROLES.POE_ORG_USER],
        },
      },
      {
        path: 'upload',
        // pathMatch: 'full',
        component: OrgPoeUploadComponent,
        canActivate: [AuthGuard],
        data: {
          title: "PoE Org",
          expectedRole: [ROLES.POE_ORG_USER],
        },
      }
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrgUserRoutingModule { }
