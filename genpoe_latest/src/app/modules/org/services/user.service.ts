import { Injectable } from '@angular/core';
// import { AuthService } from 'src/app/core/auth/services/auth.service';
// import { NGXLogger } from 'ngx-logger';
// import { UtilsService } from 'src/app/shared/services/utils.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  getUsersUrl = ""
  addUserUrl = ""
  changeUserStatusUrl = ""
  poeListUserUrl =""

  constructor(
    private http: HttpClient,
    // private utils: UtilsService,
    // private logger: NGXLogger,
    // private authService: AuthService
  ) {
    this.getUsersUrl = environment.apiEndpoint + "/generic/orgDetails"
    this.addUserUrl = environment.apiEndpoint + "/generic/orgUserRegNC"
    this.changeUserStatusUrl = environment.apiEndpoint + "/generic/userUpdate"
    this.poeListUserUrl = environment.apiEndpoint + "/generic/fetchDocs"
  }
  getUsers() {
    return this.http.post(this.getUsersUrl, {})
  }

  addUser(req){
    return this.http.post(this.addUserUrl, req)
  }

  changeUserStatus(changeStatusRequest){
    return this.http.post<any>(this.changeUserStatusUrl, changeStatusRequest)
  }

  getPoeListUser(){
    return this.http.get<any>(this.poeListUserUrl);
  }
}
