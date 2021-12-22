import { Component, OnInit } from '@angular/core';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { AdminService } from '../../services/admin.service';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-org-profile',
  templateUrl: './org-profile.component.html',
  styleUrls: ['./org-profile.component.css']
})
export class OrgProfileComponent implements OnInit {
  //logo related
  currentLogo
  logoFile
  // getLogoRequest = new HttpRequestState()
  uploadLogoRequest = new HttpRequestState()
  isFileSelected = false
  logoChangeButtonLabel = ""


  // category related
  docCategories = []
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  addCategoryRequest = new HttpRequestState()
  removeCategoryRequest = new HttpRequestState()
  getCategoryRequest = new HttpRequestState()

  constructor(
    private httpStateService: HttpRequestStateService,
    private adminService: AdminService,
    public authService: AuthService,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.currentLogo = this.authService.orgLogo
    this.getCategoryList()
    this.logoChangeButtonLabel = this.currentLogo ? "Change Logo" : "Select Logo"
  }

  fileChange($event) {
    let fileArray: Array<any> = [].slice.call($event.target.files)

    const reader: FileReader = new FileReader()

    reader.onload = ((e: any) => {
      this.logoFile = e.target.result
      this.setFile()
    })

    reader.readAsDataURL(fileArray[0])
  }

  setFile() {
    this.isFileSelected = true
    this.logoChangeButtonLabel = "Save"
  }

  resetFile() {
    this.isFileSelected = false
    this.logoChangeButtonLabel = "Change Logo"
    this.logoFile = null
  }

  public uploadLogo() {
    this.httpStateService.initRequest(this.uploadLogoRequest)
    this.uploadLogoRequest.subscription = this.adminService.uploadLogo(this.logoFile).subscribe((result: any) => {
      console.log("uploadLogo", result)
      if (result.status = "Success") {
        this.authService.orgLogo = this.logoFile
        this.httpStateService.finishRequest(this.uploadLogoRequest)
        this.utils.showSnackBar(result.message)
        this.resetFile()
      } else {
        this.httpStateService.finishRequestWithError(this.uploadLogoRequest)
        this.utils.showSnackBar(result.message)
      }
    }, (err: HttpErrorResponse) => {
      this.httpStateService.finishRequestWithError(this.uploadLogoRequest)
      this.utils.showSnackBar("Something went wrong")
    })
  }


  // getLogo() {
  //   this.getLogoRequest.subscription = this.adminService.getLogo().subscribe(result => {
  //     // this.currentLogo = result.orgLogo
  //     console.log("getLogo", result)
  //   })
  // }


  addCategoryChip(event) {
    const input = event.input;
    const value = event.value;
    // if ((value || '').trim()) {
    //   this.docCategories.push(value.trim());
    // }

    // // Reset the input value
    // if (input) {
    //   input.value = '';
    // }

    if ((value || '').trim()) {

      this.httpStateService.initRequest(this.addCategoryRequest)

      this.addCategoryRequest.subscription = this.adminService.addCategory(value.trim()).subscribe((result: any) => {
        console.log(result)
        if (result.status == "Success") {
          this.docCategories = result.result
          this.httpStateService.finishRequest(this.addCategoryRequest)
          // Reset the input value
          if (input) {
            input.value = '';
          }
        } else {
          this.httpStateService.finishRequestWithError(this.addCategoryRequest)
        }

      }, (err: HttpErrorResponse) => {
        this.httpStateService.finishRequestWithError(this.addCategoryRequest)
      })
    }
  }


  removeCategoryChip(category) {

    this.httpStateService.initRequest(this.removeCategoryRequest)
    this.removeCategoryRequest.subscription = this.adminService.removeCategory(category).subscribe((result: any) => {
      if (result.status == "Success") {
        this.docCategories = result.result
        this.httpStateService.finishRequest(this.removeCategoryRequest)
      } else {
        this.httpStateService.finishRequestWithError(this.removeCategoryRequest)
      }

    }, (err: HttpErrorResponse) => {
      this.httpStateService.finishRequestWithError(this.removeCategoryRequest)
    })
  }


  getCategoryList() {
    this.httpStateService.initRequest(this.getCategoryRequest)

    this.getCategoryRequest.subscription = this.adminService.getCategoryList().subscribe((result: any) => {
      console.log(result)
      if (result.status == "Success") {
        this.docCategories = result.result
        this.httpStateService.finishRequest(this.getCategoryRequest)
      } else {
        this.httpStateService.finishRequestWithError(this.getCategoryRequest)
      }

    }, (err: HttpErrorResponse) => {
      this.httpStateService.finishRequestWithError(this.getCategoryRequest)
    })
  }

}
