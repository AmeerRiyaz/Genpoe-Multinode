import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PoeRoutingModule } from './poe-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PoeUploadComponent } from './poe-upload/poe-upload.component';
import { PoeSearchComponent } from './poe-search/poe-search.component';
import { PoeCardsComponent } from './poe-cards/poe-cards.component';
import { DetailsDialogComponent } from './details-dialog/details-dialog.component';

@NgModule({
  declarations: [PoeUploadComponent, PoeSearchComponent, PoeCardsComponent, DetailsDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    PoeRoutingModule
  ],
  entryComponents: [
    PoeUploadComponent,
    DetailsDialogComponent
  ]
})
export class PoeModule { }
