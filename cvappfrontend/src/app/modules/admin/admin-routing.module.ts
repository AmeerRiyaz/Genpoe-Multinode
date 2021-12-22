import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { user_roles } from 'src/app/core/auth/auth.service';
import { AuthGuard } from 'src/app/core/auth/guards/auth.guard';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UsersComponent } from './users/users.component';

//ROUTES WITHOUT LAZY LOADING
// const routes: Routes = [
//   {
//     path: 'admin',
//     canActivate: [AuthGuard],
//     data: {
//       title: "Admin",
//       expectedRole: [user_roles.ADMIN],
//     },
//     children: [
//       {
//         path: '',
//         redirectTo: 'dashboard',
//         pathMatch: 'prefix'
//       },
//       {
//         path: 'dashboard',
//         component: AdminDashboardComponent,
//         canActivate: [AuthGuard],
//         data: {
//           title: "Dashboard",
//           expectedRole: [user_roles.ADMIN],
//         }
//       },
//       {
//         path: 'users',
//         component: UsersComponent,
//         canActivate: [AuthGuard],
//         data: {
//           title: "Users",
//           expectedRole: [user_roles.ADMIN],
//         }
//       }
//     ],
//   },
// ];
const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'prefix'
  },
  {
    path: 'dashboard',
    component: AdminDashboardComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Dashboard",
      expectedRole: [user_roles.ADMIN],
    }
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Users",
      expectedRole: [user_roles.ADMIN],
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
