import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  changePwdUrl = "/user/changepwd"
  constructor(
    private http: HttpClient
  ) { }

  changePassword(request){
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json',
    //     'Authorization1': "Basic " + btoa(`${request.username}:${request.password}:${request.newpassword}:${request.confirmpassword}`)
    //   })
    // };
    return this.http.post(environment.apiEndpoint+this.changePwdUrl, request)
  }
}
