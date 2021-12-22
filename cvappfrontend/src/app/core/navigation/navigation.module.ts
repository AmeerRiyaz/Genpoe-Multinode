import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { NavigationResponsiveComponent } from './navigation-responsive/navigation-responsive.component';
import { HomepageWithCertificateListComponent } from '../auth/homepage-with-certificate-list/homepage-with-certificate-list.component';
import { AuthModule } from '../auth/auth.module';
import { NavigationComponent } from './navigation/navigation.component';

@NgModule({
  declarations: [NavigationResponsiveComponent, NavigationComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
  ],
  exports: [
    NavigationResponsiveComponent
  ]
})
export class NavigationModule { }
