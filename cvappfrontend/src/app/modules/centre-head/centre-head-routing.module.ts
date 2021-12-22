import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/auth/guards/auth.guard';
import { user_roles } from 'src/app/core/auth/auth.service';
import { CentreHeadSearchComponent } from './centre-head-search/centre-head-search.component';
import { PublicSearchComponent } from '../../shared/layout/public-search/public-search.component';
import { CentreHeadDashboardComponent } from './centre-head-dashboard/centre-head-dashboard.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'prefix'
  },
  {
    path: 'dashboard',
    component: CentreHeadDashboardComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Dashboard",
      expectedRole: [user_roles.CH],
    }
  },
  {
    path: 'certificates',
    component: CentreHeadSearchComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Certificates",
      expectedRole: [user_roles.CH],
    }
  },
  {
    path: 'search',
    component: PublicSearchComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Search",
      expectedRole: [user_roles.CH],
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CentreHeadRoutingModule { }
