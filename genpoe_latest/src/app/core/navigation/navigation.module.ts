import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { NavigationComponent } from './navigation/navigation.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [NavigationComponent, MenuComponent, HeaderComponent, FooterComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
  ],
  exports: [
    NavigationComponent
  ]
})
export class NavigationModule { }
