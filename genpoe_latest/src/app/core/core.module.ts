import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationModule } from './navigation/navigation.module';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './auth/profile/profile.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AuthModule,
    SharedModule
  ],
  exports: [
    NavigationModule
  ]
})
export class CoreModule { }
