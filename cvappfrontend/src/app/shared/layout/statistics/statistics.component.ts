import { Component, OnInit, OnDestroy } from '@angular/core';
import { StatisticsService } from 'src/app/core/services/statistics.service';
import { NGXLogger } from 'ngx-logger';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpRequestState } from '../../models/http-request-state';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit, OnDestroy {
  totalTransactions = '...'
  totalUsers = '...'
  totalStudents = '...'
  totalRegisteredUsers = '...'
  totalOrganizations = '3'

  getTotalTransactionsRequest: HttpRequestState = new HttpRequestState()
  getTotalUsersRequest: HttpRequestState = new HttpRequestState()
  getTotalStudentsRequest: HttpRequestState = new HttpRequestState()
  getTotalRegisteredUsersRequest: HttpRequestState = new HttpRequestState()
  getStatInterval
  constructor(
    private logger: NGXLogger,
    private statService: StatisticsService,
    private httpRequestStateService: HttpRequestStateService
  ) { }

  ngOnInit() {
    this.getStatistics()
    this.getStatInterval = setInterval(()=>{
      this.getStatistics()
    }, 240000)  //4 mins
  }
  ngOnDestroy() {
    clearInterval(this.getStatInterval)
    this.httpRequestStateService.destroyRequest(this.getTotalTransactionsRequest)
    this.httpRequestStateService.destroyRequest(this.getTotalUsersRequest)
    this.httpRequestStateService.destroyRequest(this.getTotalStudentsRequest)
    this.httpRequestStateService.destroyRequest(this.getTotalRegisteredUsersRequest)
  }
  getTotalTransactions() {
    this.httpRequestStateService.initRequest(this.getTotalTransactionsRequest)
    this.getTotalTransactionsRequest.subscription = this.statService.getTotalTransactions().subscribe((result: any) => {
      this.logger.debug("getTotalTransactions", result)
      if (result.low >= 0) {
        this.totalTransactions = result.low
      }
      this.httpRequestStateService.finishRequest(this.getTotalTransactionsRequest)
    }, (error: HttpErrorResponse) => {
      this.httpRequestStateService.finishRequestWithError(this.getTotalTransactionsRequest)
    })
  }
  getTotalUsers() {
    this.httpRequestStateService.initRequest(this.getTotalUsersRequest)
    this.getTotalUsersRequest.subscription = this.statService.getTotalUsers().subscribe((result: any) => {
      this.logger.debug("getTotalUsers", result)
      if (result.NoOfUsers >= 0) {
        this.totalUsers = result.NoOfUsers
      }
      this.httpRequestStateService.finishRequest(this.getTotalUsersRequest)
    }, (error: HttpErrorResponse) => {
      this.httpRequestStateService.finishRequestWithError(this.getTotalUsersRequest)
    })
  }
  getTotalStudents() {
    this.httpRequestStateService.initRequest(this.getTotalStudentsRequest)
    this.getTotalStudentsRequest.subscription = this.statService.getTotalStudents().subscribe((result: any) => {
      this.logger.debug("getTotalStudents", result)
      if (result.NoOfStudents >= 0) {
        this.totalStudents = result.NoOfStudents
      }
      this.httpRequestStateService.finishRequest(this.getTotalStudentsRequest)
    }, (error: HttpErrorResponse) => {
      this.httpRequestStateService.finishRequestWithError(this.getTotalStudentsRequest)
    })
  }
  getTotalRegisteredUsers() {
    this.httpRequestStateService.initRequest(this.getTotalRegisteredUsersRequest)
    this.getTotalRegisteredUsersRequest.subscription = this.statService.getTotalRegisteredUsers().subscribe((result: any) => {
      this.logger.debug("getTotalRegisteredUsers", result)
      if (result.NoOfEnabledUsers >= 0) {
        this.totalRegisteredUsers = result.NoOfEnabledUsers
      }
      this.httpRequestStateService.finishRequest(this.getTotalRegisteredUsersRequest)
    }, (error: HttpErrorResponse) => {
      this.httpRequestStateService.finishRequestWithError(this.getTotalRegisteredUsersRequest)
    })
  }
  getStatistics() {
    this.logger.log("getStatistics")
    this.getTotalTransactions()
    // this.getTotalUsers()
    // this.getTotalStudents()
    this.getTotalRegisteredUsers()
  }
}

