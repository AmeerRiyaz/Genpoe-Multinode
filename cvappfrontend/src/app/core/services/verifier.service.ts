import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VerifierService {
  verifyUrl =''
  data ;
  verfierEmail = 'NA'
  emailVerified: boolean = false
  constructor(
    private http: HttpClient
  ) {
    this.verifyUrl = environment.apiEndpoint + '/poe/verifier/records'
   }

  verify(request){
    // this.logger.log(request)
    this.verfierEmail = request.email
    return this.http.post<any>(this.verifyUrl,request)
  }
  setData(data){
    this.data = data
    this.emailVerified = true
  }
  getData(){
    // this.logger.log(this.data)
    return this.data
  }
  invalidateVerifier(){
    this.data = null
    this.emailVerified = false
  }
}
