import { AppGlobals } from 'src/app/config/app-globals';

export const environment = {
  production: true,
  hmr: false,
  // apiEndpoint: 'https://10.244.1.122/api',
  apiEndpoint: 'https://localhost',
  uiEndpoint: 'https://localhost' + AppGlobals.HREF_BASE_STATIC,
  // apiEndpoint: 'https://mycdacchain.in/api',
  // uiEndpoint: 'https://mycdacchain.in' + AppGlobals.HREF_BASE_STATIC,
  recaptchSiteKey: '6Le4xtMUAAAAALMSrHGMlz1mGkbeorGbdNPe1Upo'
};
