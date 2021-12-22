import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrgAdminRoutingModule } from './org-admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserListComponent } from './user-list/user-list.component';
import { ProfileModule } from 'src/app/core/auth/profile/profile.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddUserComponent } from './user-list/add-user/add-user.component';
import { OrgProfileComponent } from './org-profile/org-profile.component';

@NgModule({
  declarations: [DashboardComponent, UserListComponent, AddUserComponent, OrgProfileComponent],
  imports: [
    CommonModule,
    SharedModule,
    OrgAdminRoutingModule
  ],
  entryComponents: [
    AddUserComponent
  ]
})
export class OrgAdminModule { }
