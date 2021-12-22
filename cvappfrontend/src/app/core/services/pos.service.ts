import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpParams, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PosService {
  getPosFileUrl = ''
  constructor(
    private http: HttpClient
  ) {
    this.getPosFileUrl = environment.apiEndpoint + "/poe/pos"
  }

  getPosFile(value) {
    let params = new HttpParams().set("hash", value)
    return this.http.get(this.getPosFileUrl, { params: params })
  }
}
