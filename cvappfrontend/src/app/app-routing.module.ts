import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageWithCertificateListComponent } from './core/auth/homepage-with-certificate-list/homepage-with-certificate-list.component';
import { PagenotfoundComponent } from './shared/layout/pagenotfound/pagenotfound.component';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { user_roles } from './core/auth/auth.service';

const routes: Routes = [

  { path: '', component: HomepageWithCertificateListComponent, pathMatch: 'full' },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard],
    data: {
      title: "Admin",
      expectedRole: [user_roles.ADMIN],
    },
  },
  {
    path: 'centre',
    loadChildren: () => import('./modules/centre-head/centre-head.module').then(m => m.CentreHeadModule),
    canActivate: [AuthGuard],
    data: {
      title: "Centre",
      expectedRole: [user_roles.CH],
    }
  },
  {
    path: 'course',
    loadChildren: () => import('./modules/course-coordinator/course-coordinator.module').then(m => m.CourseCoordinatorModule),
    canActivate: [AuthGuard],
    data: {
      title: "Course Coordinator",
      expectedRole: [user_roles.CC],
    },
  },
  {
    path: 'placement',
    loadChildren: () => import('./modules/placement-officer/placement-officer.module').then(m => m.PlacementOfficerModule),
    canActivate: [AuthGuard],
    data: {
      title: "Placement Officer",
      expectedRole: [user_roles.PO],
    },
  },
  // {
  //   path: 'student',
  //   loadChildren: './modules/student/student.module#StudentModule',
  //   canActivate: [AuthGuard],
  //   data: {
  //     title: "Student",
  //     expectedRole: [user_roles.STUDENT],
  //   },
  // },
  {
    path: 'training',
    loadChildren: () => import('./modules/training-coordinator/training-coordinator.module').then(m => m.TrainingCoordinatorModule),
    canActivate: [AuthGuard],
    data: {
      title: "Training Coordinator",
      expectedRole: [user_roles.TC],
    },
  },
  {
    path: 'verification',
    loadChildren: () => import('./modules/verification/verification.module').then(m => m.VerificationModule),
    data: {
      title: "Verification of Student's Certificate"
    }
  },
  {
    path: 'studentcorner',
    loadChildren: () => import('./modules/verification/verification.module').then(m => m.VerificationModule),
    data: {
      title: "Extract Your Certificate"
    }
  },
  // {
  //   path: 'verifier',
  //   loadChildren: './modules/verifier/verifier.module#VerifierModule',
  //   data: {
  //     title: "Extract Your Certificate"
  //   }
  // },
  { path: '**', component: PagenotfoundComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    {
      // enableTracing: true , //debugging
      // useHash: true

    }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
