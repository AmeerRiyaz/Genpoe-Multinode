import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from '../shared/shared.module';
import { NavigationModule } from './navigation/navigation.module';

@NgModule({
  imports: [
    CommonModule,
    AuthModule,
    SharedModule
  ],
  exports:[NavigationModule],
  declarations: []
})
export class CoreModule { }
