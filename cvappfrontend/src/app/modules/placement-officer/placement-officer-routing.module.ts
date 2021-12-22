import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { user_roles } from 'src/app/core/auth/auth.service';
import { AuthGuard } from 'src/app/core/auth/guards/auth.guard';
import { PublicSearchComponent } from '../../shared/layout/public-search/public-search.component';
import { PlacementOfficerDashboardComponent } from './placement-officer-dashboard/placement-officer-dashboard.component';
import { PlacementOfficerSearchComponent } from './placement-officer-search/placement-officer-search.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'prefix'
  },
  {
    path: 'dashboard',
    component: PlacementOfficerDashboardComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Dashboard",
      expectedRole: [user_roles.PO],
    }
  },
  {
    path: 'certificates',
    component: PlacementOfficerSearchComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Certificates",
      expectedRole: [user_roles.PO],
    }
  },
  {
    path: 'search',
    component: PublicSearchComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Search",
      expectedRole: [user_roles.PO],
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlacementOfficerRoutingModule { }
