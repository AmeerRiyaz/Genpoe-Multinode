import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private getCentreListUrl = '';
  private getYearListUrl = '';
  private getBatchListUrl = '';
  private getCourseListUrl = '';
  private getRollNoListUrl = '';
  private getRecentCertificatesUrl = ''

  constructor(
    private http: HttpClient
  ) {
    this.getCentreListUrl = environment.apiEndpoint + '/centres'
    this.getYearListUrl = environment.apiEndpoint + '/user/year'
    this.getBatchListUrl = environment.apiEndpoint + '/user/batch'
    this.getCourseListUrl = environment.apiEndpoint + '/user/course'
    this.getRollNoListUrl = environment.apiEndpoint + '/user/rollno'
    this.getRecentCertificatesUrl = environment.apiEndpoint + '/poe/lastcommits'
  }

  getCentreList() {
    return this.http.get<any>(this.getCentreListUrl);
  }
  getYearList(getYearListRequest) {
    return this.http.post<any>(this.getYearListUrl, getYearListRequest);
  }
  getBatchList(getBatchListRequest) {
    return this.http.post<any>(this.getBatchListUrl,getBatchListRequest);
  }
  getCourseList(getCourseListRequest) {
    return this.http.post<any>(this.getCourseListUrl,getCourseListRequest);
  }
  getRollNoList(getRollNoListRequest) {
    return this.http.post<any>(this.getRollNoListUrl,getRollNoListRequest);
  }
  getRecentCertificates() {
    return this.http.get<any>(this.getRecentCertificatesUrl);
  }
}
