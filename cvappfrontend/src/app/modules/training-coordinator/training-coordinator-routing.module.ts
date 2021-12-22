import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/auth/guards/auth.guard';
import { user_roles } from 'src/app/core/auth/auth.service';
import { CertificateUploadComponent } from './certificate-upload/certificate-upload.component';
import { StudentListUploadComponent } from './student-list-upload/student-list-upload.component';
import { PublicSearchComponent } from '../../shared/layout/public-search/public-search.component';
import { TrainingCoordinatorSearchComponent } from './training-coordinator-search/training-coordinator-search.component';
import { TrainingCoordinatorDashboardComponent } from './training-coordinator-dashboard/training-coordinator-dashboard.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'prefix'
  },
  {
    path: 'dashboard',
    component: TrainingCoordinatorDashboardComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Dashboard",
      expectedRole: [user_roles.TC],
    },
  },
  {
    path: 'certificates',
    component: TrainingCoordinatorSearchComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Certificates",
      expectedRole: [user_roles.TC],
    }
  },
  {
    path: 'upload/certificates',
    component: CertificateUploadComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Upload Certificates",
      expectedRole: [user_roles.TC],
    }
  },
  {
    path: 'upload/students',
    component: StudentListUploadComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Upload Student List",
      expectedRole: [user_roles.TC],
    }
  },
  {
    path: 'search',
    component: PublicSearchComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Search",
      expectedRole: [user_roles.TC],
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrainingCoordinatorRoutingModule { }
