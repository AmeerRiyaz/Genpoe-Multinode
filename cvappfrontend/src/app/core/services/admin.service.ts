import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AddUserRequest } from 'src/app/shared/models/add-user-request';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private getUserListUrl = '';
  private addUserUrl = '';
  private changeUserStatusUrl = '';
  private getRoleListUrl = '';
  constructor(
    private http: HttpClient
  ) {
    this.getUserListUrl = environment.apiEndpoint + '/usersbct';
    this.addUserUrl = environment.apiEndpoint + '/org/signup'
    this.changeUserStatusUrl = environment.apiEndpoint + '/users/update'
    this.getRoleListUrl = environment.apiEndpoint + '/roles'
  }
  getUsers() {
    return this.http.get<any>(this.getUserListUrl);
  }
  
  addUser(addUserRequest: AddUserRequest) {
    return this.http.post<any>(this.addUserUrl, addUserRequest);
  }

  changeUserStatus(changeStatusRequest){
    return this.http.post<any>(this.changeUserStatusUrl, changeStatusRequest)
  }

  getRoles() {
    return this.http.get<any>(this.getRoleListUrl);
  }
}
