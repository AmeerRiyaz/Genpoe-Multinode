import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/auth/guards/auth.guard';
import { PoeSearchComponent } from './poe-search/poe-search.component';
import { PoeCardsComponent } from './poe-cards/poe-cards.component';
import { ROLES } from 'src/app/core/auth/services/auth.service';

const routes: Routes = [
  {
    path: '',
    component: PoeCardsComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "List",
      expectedRole: [ROLES.POE_USER],
    }
  },
  {
    path: 'search',
    component: PoeSearchComponent,
    canActivateChild: [AuthGuard],
    data: {
      title: "Search",
      expectedRole: [ROLES.POE_USER],
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PoeRoutingModule {
  constructor(){
  }
 }
