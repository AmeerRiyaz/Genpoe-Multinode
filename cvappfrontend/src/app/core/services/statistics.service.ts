import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  totalTransactions = ''
  totalUsers = ''
  totalStudents = ''
  totalRegisteredUsers = ''

  constructor(
    private http: HttpClient
  ) {
    this.totalTransactions = environment.apiEndpoint + '/channel/info';
    this.totalUsers = environment.apiEndpoint + '/users/registered'
    this.totalStudents = environment.apiEndpoint + '/users/students'
    this.totalRegisteredUsers = environment.apiEndpoint + '/users/enabledusers'
  }

  getTotalTransactions() {
    return this.http.get(this.totalTransactions)
  }
  getTotalUsers() {
    return this.http.get(this.totalUsers)
  }
  getTotalStudents() {
    return this.http.get(this.totalStudents)
  }
  getTotalRegisteredUsers() {
    return this.http.get(this.totalRegisteredUsers)
  }
}
