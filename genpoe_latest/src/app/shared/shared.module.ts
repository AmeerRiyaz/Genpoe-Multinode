import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogActionComponent } from './components/dialog-action/dialog-action.component';
import { DialogAlertComponent } from './components/dialog-alert/dialog-alert.component';
import { DialogLoadingComponent } from './components/dialog-loading/dialog-loading.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { MaterialModule } from './material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HashPipe } from './pipes/hash.pipe';
import { VerifierPublicLinkDetailsComponent } from './components/verifier-public-link-details/verifier-public-link-details.component';
import { UserConfirmEmailComponent } from './components/user-confirm-email/user-confirm-email.component';
import { StatBarComponent } from './components/stat-bar/stat-bar.component';
import { DialogDetailsOrgPoeComponent } from './components/dialog-details-org-poe/dialog-details-org-poe.component';
@NgModule({
  declarations: [HashPipe, DialogActionComponent, DialogAlertComponent, DialogLoadingComponent, PageNotFoundComponent, VerifierPublicLinkDetailsComponent, UserConfirmEmailComponent,StatBarComponent, DialogDetailsOrgPoeComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    FlexLayoutModule
  ],
  exports: [
    HashPipe,
    FlexLayoutModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    StatBarComponent,
  ],
  entryComponents: [
    DialogLoadingComponent,
    DialogActionComponent,
    DialogAlertComponent,
    DialogDetailsOrgPoeComponent
  ]
})
export class SharedModule { }
