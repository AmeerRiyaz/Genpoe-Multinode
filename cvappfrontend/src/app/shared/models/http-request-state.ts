import { Subscription } from 'rxjs';
import { DEFAULT_TIMEOUT } from 'src/app/core/services/http-request-state.service';

export class HttpRequestState {

    timeout: number = DEFAULT_TIMEOUT;
    subscription: Subscription;
    requestInProgress: boolean = false;
    msgToUser: string = "";
    showData: boolean = false;
    // responseReceived: boolean = false;
    // emptyResponse: boolean = false;

    emptyResponse: boolean = false;
    success:boolean = false;
    requestProcessed: boolean = false

    setHttpRequestStateTimeout(time){
        this.timeout = time
    }
}