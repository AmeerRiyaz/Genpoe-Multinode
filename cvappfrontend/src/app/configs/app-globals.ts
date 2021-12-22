import { Injectable } from '@angular/core';

/**
 * TODO Use app globals
 * THIS FILE IS BEING USED PARTIALLY as of july 2nd
 */
@Injectable()
export class AppGlobals {
 
    /* 
    *   serve or build command if using  BASE other than /
    *   ng serve --host <any> --port <any> --base-href /ACTS/
    */

    static HREF_BASE_STATIC = "/"        //Keep '/' if none else use like '/example/'
    // static HREF_BASE_STATIC = "/acts/"   //Keep '/' if none else use like '/example/'

    HREF_BASE = AppGlobals.HREF_BASE_STATIC
    APP_NAME: string = "APPNAME"
    SNACKBAR_TIMEOUT: number = 6000
    
    ROUTE_HOME:string = ''
    ROUTE_SIGNIN:string = 'signin'

    static HTTP_TIMEOUT: number = 24000
    HTTP_SUCCESS:string = "Success"
    HTTP_FAILED:string = "Failed"


    MESSAGE_TIMEOUT: string = "Taking too long, please try again"
    MESSAGE_SOMETHING_WENT_WRONG: string = "Something went wrong..."
    MESSAGE_EMPTY_RESPONSE: string = "Nothing found to display"
}
