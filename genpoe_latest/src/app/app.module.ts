import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { environment } from 'src/environments/environment';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './core/intercepters/httpinterceptor';
import { AppGlobals } from './config/app-globals';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF } from '@angular/common';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    SharedModule,
    LoggerModule.forRoot({
      level: !environment.production ? NgxLoggerLevel.TRACE : NgxLoggerLevel.OFF,
      serverLogLevel: NgxLoggerLevel.OFF
    }),
    DeviceDetectorModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    AppGlobals,
    { provide: APP_BASE_HREF, useValue: AppGlobals.HREF_BASE_STATIC },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: environment.recaptchSiteKey
      } as RecaptchaSettings,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
