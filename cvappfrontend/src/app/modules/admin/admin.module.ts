import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminRoutingModule } from './admin-routing.module';
import { AddUserComponent } from './users/add-user/add-user.component';
import { UsersComponent } from './users/users.component';
import { SlideshowModule } from 'ng-simple-slideshow';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SlideshowModule,
    AdminRoutingModule,
  ],
  declarations: [UsersComponent, AddUserComponent, AdminDashboardComponent],
  // exports: [
  //   AdminRoutingModule
  // ]
  entryComponents: [
    AddUserComponent
  ]
})
export class AdminModule { }
