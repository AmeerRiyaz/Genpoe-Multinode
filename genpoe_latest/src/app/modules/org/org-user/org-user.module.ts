import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrgUserRoutingModule } from './org-user-routing.module';
import { HomeComponent } from './home/home.component';
import { ViewPoeListComponent } from './view-poe-list/view-poe-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionComponent } from './layout/transaction/transaction.component';
import { OrgPoeUploadComponent } from './org-poe-upload/org-poe-upload.component';
import { TransactionSuccessResultComponent } from './layout/transaction-success-result/transaction-success-result.component';
import { TransactionMultiFileComponent } from './layout/transaction-multi-file/transaction-multi-file.component';

@NgModule({
  declarations: [HomeComponent, ViewPoeListComponent, TransactionComponent, OrgPoeUploadComponent, TransactionSuccessResultComponent, TransactionMultiFileComponent],
  imports: [
    CommonModule,
    SharedModule,
    OrgUserRoutingModule
  ]
})
export class OrgUserModule { }
