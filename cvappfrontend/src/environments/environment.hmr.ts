import { AppGlobals } from 'src/app/configs/app-globals';

export const environment = {
  production: false,
  hmr: true,
  // apiEndpoint: 'http://10.244.1.88:8000',
  // apiEndpoint: 'http://10.244.1.122/api',
  apiEndpoint: 'http://10.244.1.222:5000',
  uiEndpoint: 'http://10.244.1.222' + AppGlobals.HREF_BASE_STATIC,
  siteKey: '6Le4xtMUAAAAALMSrHGMlz1mGkbeorGbdNPe1Upo'

  /**
  Before building/serving for production/devlopment
  if sub domain is required then change HREF_BASE_STATIC to '/example/' in AppGlobals.ts
 */
};

/**
 * Hot Module reload
 * ng serve --configuration hmr
 */