import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { user_roles } from 'src/app/core/auth/auth.service';
import { AuthGuard } from 'src/app/core/auth/guards/auth.guard';
import { StudentCertificateCardsComponent } from './student-certificate-cards/student-certificate-cards.component';

// TODO Lazy loading remaining for student module as dtud signup is being used in homepage component
const routes: Routes = [
  {
    path: 'student',
    canActivate: [AuthGuard],
    data: {
      title: "Student",
      expectedRole: [user_roles.STUDENT],
    },
    children: [
      {
        path: '',
        redirectTo: 'certificates',
        pathMatch: 'prefix'
      },
      {
        path: 'certificates',
        component: StudentCertificateCardsComponent,
        canActivate: [AuthGuard],
        data: {
          title: "Certificates",
          expectedRole: [user_roles.STUDENT],
        }
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
