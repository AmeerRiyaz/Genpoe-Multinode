import { AppGlobals } from 'src/app/configs/app-globals';

export const environment = {
  production: true,
  hmr: false,
  // apiEndpoint: 'http://10.244.0.41:5000',
  // apiEndpoint: 'http://10.244.1.206:5000',
  // apiEndpoint: 'http://10.244.0.248:5000',
  // uiEndpoint: 'http://10.244.1.122' + AppGlobals.HREF_BASE_STATIC,
  // uiEndpoint: 'http://10.244.1.206' + AppGlobals.HREF_BASE_STATIC
  apiEndpoint: 'https://www.cdacchain.in/actsapi',
  uiEndpoint: 'https://www.cdacchain.in' + AppGlobals.HREF_BASE_STATIC,
  siteKey: '6Le4xtMUAAAAALMSrHGMlz1mGkbeorGbdNPe1Upo'


  // apiEndpoint: 'http://10.244.1.122/api',
  // uiEndpoint: 'http://acts.cdacchain.in' + AppGlobals.HREF_BASE_STATIC

  /**
  Before building/serving for production/devlopment
  if sub domain is required then change HREF_BASE_STATIC to '/example/' in AppGlobals.ts
 */
};
