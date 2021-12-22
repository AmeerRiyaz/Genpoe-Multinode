import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VerifierRoutingModule } from './verifier-routing.module';
import { VerifierHomeComponent } from './verifier-home/verifier-home.component';
import { VerifierSigninComponent } from './verifier-signin/verifier-signin.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { PublicSearchComponent } from '../../shared/layout/public-search/public-search.component';
import { SharedCertificatesComponent } from './shared-certificates/shared-certificates.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { VerifyDialogComponent } from './verify-dialog/verify-dialog.component';
import { VerifierPublicLinkDetailsComponent } from './verifier-public-link-details/verifier-public-link-details.component';
import { VerifierPublicLinkPosComponent } from './verifier-public-link-pos/verifier-public-link-pos.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
@NgModule({
  declarations: [VerifierHomeComponent, VerifierSigninComponent, SharedCertificatesComponent, VerifyDialogComponent, VerifierPublicLinkDetailsComponent, VerifierPublicLinkPosComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    VerifierRoutingModule,
    PdfViewerModule
  ],
  exports: [VerifierSigninComponent],
  entryComponents: [VerifyDialogComponent]
})
export class VerifierModule { }
