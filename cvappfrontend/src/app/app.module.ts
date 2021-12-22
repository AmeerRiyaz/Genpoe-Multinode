import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RecaptchaSettings, RECAPTCHA_SETTINGS } from 'ng-recaptcha';
import { SlideshowModule } from 'ng-simple-slideshow';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppGlobals } from './configs/app-globals';
import { AppConfig, APP_CONFIG } from './configs/config';
import { CoreModule } from './core/core.module';
import { JwtInterceptor } from './core/intercepters/httpinterceptor';
import { VerifierModule } from './modules/verifier/verifier.module';
import { SharedModule } from './shared/shared.module';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SlideshowModule,
    DeviceDetectorModule.forRoot(), //used to detect the device on which app is running
    // ReactiveFormsModule,
    // FormsModule,

    VerifierModule,
    // take care of lazy loading if uncommenting
    // StudentModule,
    CoreModule,
    SharedModule,

    LoggerModule.forRoot({
      level: !environment.production ? NgxLoggerLevel.TRACE : NgxLoggerLevel.OFF,
      serverLogLevel: NgxLoggerLevel.OFF
    }),

    AppRoutingModule, // Keep AppRoutingModule at last position in imports array as it contains wildcard route
  ],
  providers: [
    AppGlobals,
    { provide: APP_BASE_HREF, useValue: AppGlobals.HREF_BASE_STATIC },
    { provide: APP_CONFIG, useValue: AppConfig },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: environment.siteKey
      } as RecaptchaSettings,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
