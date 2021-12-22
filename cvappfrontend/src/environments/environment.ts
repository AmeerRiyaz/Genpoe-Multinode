import { AppGlobals } from 'src/app/configs/app-globals';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
export const environment = {
  production: false,
  hmr: false,
  // apiEndpoint: 'http://10.244.0.35:5000',
  apiEndpoint: 'http://10.244.1.173:5000',
  uiEndpoint: 'http://10.244.1.122:4211' + AppGlobals.HREF_BASE_STATIC,
  siteKey: '6Le4xtMUAAAAALMSrHGMlz1mGkbeorGbdNPe1Upo'
  // apiEndpoint: 'http://10.244.1.122/api',
  // apiEndpoint: 'http://server.cdacchain.in',
  // uiEndpoint: 'http://10.244.1.194' + AppGlobals.HREF_BASE_STATIC
  // apiEndpoint: 'http://10.244.1.206:5000',
  // uiEndpoint: 'http://10.244.1.206' + AppGlobals.HREF_BASE_STATIC


  /**
    Before building/serving for production/devlopment
    if sub domain is required then change HREF_BASE_STATIC to '/example/' in AppGlobals.ts
   */
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

