import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CentreHeadService {
  searchUrl = ''
  constructor(
    private http: HttpClient
  ) {
    this.searchUrl = environment.apiEndpoint + '/poe/users/certs'
  }

  search(searchRequest) {
    return this.http.post<any>(this.searchUrl, searchRequest)
  }
}
