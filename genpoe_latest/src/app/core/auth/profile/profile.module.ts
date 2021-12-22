import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { MyAccountComponent } from './my-account/my-account.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [MyAccountComponent],
  imports: [
    CommonModule,
    SharedModule,
    ProfileRoutingModule
  ]
})
export class ProfileModule { }
