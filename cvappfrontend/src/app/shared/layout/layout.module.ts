import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthModule } from 'src/app/core/auth/auth.module';
import { StudentSignupComponent } from 'src/app/modules/student/student-signup/student-signup.component';
import { StudentModule } from 'src/app/modules/student/student.module';
import { VerifierModule } from 'src/app/modules/verifier/verifier.module';
import { MaterialModule } from '../material/material.module';
import { ActionDialogComponent } from './action-dialog/action-dialog.component';
import { AlertDialogComponent } from './alert-dialog/alert-dialog.component';
import { DetailsDialogComponent } from './details-dialog/details-dialog.component';
import { HomepageWithCertificateListComponent } from '../../core/auth/homepage-with-certificate-list/homepage-with-certificate-list.component';
import { HomepageComponent } from '../../core/auth/homepage/homepage.component';
import { LoadingDialogComponent } from './loading-dialog/loading-dialog.component';
import { NavigationResponsiveComponent } from '../../core/navigation/navigation-responsive/navigation-responsive.component';
import { NavigationComponent } from '../../core/navigation/navigation/navigation.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { PublicSearchComponent } from './public-search/public-search.component';
import { StatBarComponent } from './stat-bar/stat-bar.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    // AuthModule,
    // StudentModule,
    // VerifierModule,
    // RouterModule
  ],
  declarations: [PagenotfoundComponent, AlertDialogComponent, ActionDialogComponent, DetailsDialogComponent, StatisticsComponent, LoadingDialogComponent, PublicSearchComponent, StatBarComponent],
  exports: [
    PagenotfoundComponent, StatisticsComponent, PublicSearchComponent, StatBarComponent
  ],
  entryComponents: [AlertDialogComponent, ActionDialogComponent, DetailsDialogComponent, LoadingDialogComponent]
})
export class LayoutModule { }
