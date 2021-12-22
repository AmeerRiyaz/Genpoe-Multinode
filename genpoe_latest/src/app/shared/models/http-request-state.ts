import { Subscription } from 'rxjs';
import { AppGlobals } from 'src/app/config/app-globals';

export class HttpRequestState {
    timeout: number = AppGlobals.HTTP_TIMEOUT
    subscription: Subscription;
    requestInProgress: boolean = false;
    msgToUser: string = "";
    showData: boolean = false;
    emptyResponse: boolean = false;
    success:boolean = false;
    requestProcessed: boolean = false
}
