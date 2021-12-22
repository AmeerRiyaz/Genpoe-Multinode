import { Injectable } from '@angular/core';


@Injectable()
export class AppGlobals {
    static HREF_BASE_STATIC = "/" 
    // static HREF_BASE_STATIC = "/poe/"   //Keep '/' if none else use like '/example/'
    HREF_BASE = AppGlobals.HREF_BASE_STATIC

    APP_NAME: string = "Blockchain Based Proof Of Existence"
    APP_NAME_MULTI_LINE_1: string = "Blockchain Based"
    APP_NAME_MULTI_LINE_2: string = "Proof Of Existence"
    APP_FULLNAME: string = ""
    SNACKBAR_TIMEOUT: number = 4000
    
    static ROUTE_SIGNIN:string = 'signin'
    
    static ROUTE_HOME:string = ''
    static ROUTE_POE_HOME:string = 'poe'
    
    static ROUTE_POE_ORG_HOME:string = 'org'
    static ROUTE_POE_ORG_ADMIN:string = 'org/admin'
    static ROUTE_POE_ORG_USER:string = 'org/user'
    
    ROUTE_POE_ORG_ADMIN_USER_LIST:string = 'org/admin/users'
    ROUTE_POE_ORG_ADMIN_PROFILE:string = 'org/admin/profile'

    ROUTE_POE_ORG_USER_LIST:string = 'org/user/list'
    ROUTE_POE_ORG_USER_UPLOAD:string = 'org/user/upload'

    ROUTE_POE_LIST:string = 'poe/list'
    ROUTE_POE_SEARCH:string = 'poe/search'
    

    static HTTP_TIMEOUT: number = 24000
    HTTP_SUCCESS:string = "Success"
    HTTP_FAILED:string = "Failed"


    MESSAGE_TIMEOUT: string = "Taking too long, please try again"
    MESSAGE_SOMETHING_WENT_WRONG: string = "Something went wrong..."
    MESSAGE_EMPTY_RESPONSE: string = "Nothing found to display"

}
