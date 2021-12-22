import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  uploadOrgLogoUrl = ""
  getOrgLogoUrl = ""
  getCategoryListUrl = ""
  addCategoryUrl = ""
  removeCategoryUrl = ""

  constructor(
    private http: HttpClient
  ) {
    this.uploadOrgLogoUrl = environment.apiEndpoint + "/generic/org/uploadLogo"
    this.getOrgLogoUrl = environment.apiEndpoint + "/generic/org/getLogo"

    this.addCategoryUrl = environment.apiEndpoint + "/generic/addCategories"
    this.removeCategoryUrl = environment.apiEndpoint + "/generic/remCategories"
    this.getCategoryListUrl = environment.apiEndpoint + "/generic/listCategories"

    this.getCategoryList()
  }

  uploadLogo(b64) {
    return this.http.post(this.uploadOrgLogoUrl, { data: b64 })
  }

  getLogo() {
    return this.http.get(this.getOrgLogoUrl)
  }

  addCategory(category) {
    return this.http.post(this.addCategoryUrl, { categories: category })
  }

  removeCategory(category) {
    return this.http.post(this.removeCategoryUrl, { categories: category })
  }

  getCategoryList() {
    return this.http.get(this.getCategoryListUrl)
  }

}
