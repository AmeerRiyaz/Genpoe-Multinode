import { Injectable } from '@angular/core';
import { StudentSignupRequest } from 'src/app/shared/models/student-signup-request';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  studentSignupUrl = ''
  getCertificatesUrl = ''
  shareCertificatesUrl = ''
  shareCertificatesStudentUrl = ''
  constructor(
    private logger: NGXLogger,
    private http: HttpClient
  ) {
    this.studentSignupUrl = environment.apiEndpoint + "/signup";
    this.getCertificatesUrl = environment.apiEndpoint + "/poe/user/certs"
    this.shareCertificatesUrl = environment.apiEndpoint + '/poe/certs/share'
    this.shareCertificatesStudentUrl = environment.apiEndpoint + '/poe/certs/student/share'
  }

  signup(signupRequest: StudentSignupRequest) {
    return this.http.post<any>(this.studentSignupUrl, signupRequest);
  }

  getCertificates(getCertificatesRequest) {
    return this.http.post<any>(this.getCertificatesUrl, getCertificatesRequest);
  }
  shareCertificates(shareCertificatesRequest){
    // this.logger.log(shareCertificatesRequest)
    return this.http.post<any>(this.shareCertificatesUrl, shareCertificatesRequest);
  }
  shareCertificatesStudent(shareCertificatesRequest){
    // this.logger.log(this.shareCertificatesStudentUrl)
    return this.http.post<any>(this.shareCertificatesStudentUrl, shareCertificatesRequest);
  }
}
