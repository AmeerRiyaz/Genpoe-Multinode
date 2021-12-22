import { AppGlobals } from 'src/app/config/app-globals';

export const environment = {
  production: false,
  hmr: true,
  apiEndpoint: 'http://10.244.1.222:5000',
  uiEndpoint: 'http://localhost' + AppGlobals.HREF_BASE_STATIC,
  recaptchSiteKey: '6Le4xtMUAAAAALMSrHGMlz1mGkbeorGbdNPe1Upo',
};


/**
 * Hot Module reload
 * ng serve --configuration hmr
 */
