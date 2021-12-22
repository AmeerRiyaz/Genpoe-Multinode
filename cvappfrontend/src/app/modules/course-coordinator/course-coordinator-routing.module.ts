import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { user_roles } from 'src/app/core/auth/auth.service';
import { AuthGuard } from 'src/app/core/auth/guards/auth.guard';
import { PublicSearchComponent } from '../../shared/layout/public-search/public-search.component';
import { CourseCoordinatorDashboardComponent } from './course-coordinator-dashboard/course-coordinator-dashboard.component';
import { CourseCoordinatorSearchComponent } from './course-coordinator-search/course-coordinator-search.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'prefix'
  },
  {
    path: 'dashboard',
    component: CourseCoordinatorDashboardComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Dashboard",
      expectedRole: [user_roles.CC],
    },
  },
  {
    path: 'certificates',
    component: CourseCoordinatorSearchComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Certificates",
      expectedRole: [user_roles.CC],
    },
  },
  {
    path: 'search',
    component: PublicSearchComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Search",
      expectedRole: [user_roles.CC],
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CourseCoordinatorRoutingModule { }
