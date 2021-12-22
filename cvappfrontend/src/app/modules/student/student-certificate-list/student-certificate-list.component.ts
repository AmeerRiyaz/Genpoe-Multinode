import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { StudentService } from 'src/app/core/services/student.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpErrorResponse } from '@angular/common/http';
import { GetCertificatesRequest } from 'src/app/shared/models/get-certificates-request';
import { AuthService } from 'src/app/core/auth/auth.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ShareCertificatesRequest } from 'src/app/shared/models/share-certificates-request';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { UtilsService } from 'src/app/core/services/utils.service';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';

@Component({
  selector: 'app-student-certificate-list',
  templateUrl: './student-certificate-list.component.html',
  styleUrls: ['./student-certificate-list.component.css']
})
export class StudentCertificateListComponent implements OnInit, OnDestroy{

  //form variables
  email: FormControl
  shareForm: FormGroup

  //request variables
  getCertificatesRequestState: HttpRequestState = new HttpRequestState()
  shareCertificatesRequestState: HttpRequestState = new HttpRequestState()

  //table variables
  dataSource: MatTableDataSource<any>
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  selection = new SelectionModel<any>(true, []);

  constructor(
    private studentService: StudentService,
    private authService: AuthService,
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private utils: UtilsService,
    private httpRequestStateService: HttpRequestStateService
  ) { }

  ngOnInit() {
    this.initForm()
    this.getCertificates()
  }
  ngOnDestroy(): void {
    this.httpRequestStateService.destroyRequest(this.getCertificatesRequestState)
    this.httpRequestStateService.destroyRequest(this.shareCertificatesRequestState)
  }
  initForm() {
    this.email = new FormControl('', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
    this.shareForm = this._formBuilder.group({
      email: this.email
    })
    this.dataSource = new MatTableDataSource<any>()
  }

  getCertificates() {
    var getCertificatesRequest = new GetCertificatesRequest()
    getCertificatesRequest.username = this.authService.getCurrentUser()
    this.httpRequestStateService.initRequest(this.getCertificatesRequestState)
    // this.logger.log(getCertificatesRequest)
    this.getCertificatesRequestState.subscription = this.studentService.getCertificates(getCertificatesRequest).subscribe(result => {
      // this.logger.log("getCertificates() list: ", result)
      if (result) {
        this.dataSource.data = result
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
        this.httpRequestStateService.finishRequest(this.getCertificatesRequestState)
      } else {
        this.httpRequestStateService.finishRequestWithError(this.getCertificatesRequestState)
      }

    },
      (err: HttpErrorResponse) => {
        // this.logger.log(err.message);
        this.httpRequestStateService.finishRequestWithError(this.getCertificatesRequestState)
      });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.filteredData.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.filteredData.forEach(row => this.selection.select(row));
  }

  shareCertificates() {
    var shareCertificatesRequest = new ShareCertificatesRequest()
    this.httpRequestStateService.initRequest(this.shareCertificatesRequestState)
    this.selection.selected.forEach(element => {
      shareCertificatesRequest.documents.push(element.txId)
    });
    shareCertificatesRequest.email = this.shareForm.value.email
    this.shareCertificatesRequestState.subscription = this.studentService.shareCertificatesStudent(shareCertificatesRequest).subscribe(result => {
      // this.logger.log(result)
      if (result) {
        this.httpRequestStateService.finishRequest(this.shareCertificatesRequestState)
        this.utils.showDialog("Success", result)
        this.shareForm.reset()
        this.selection.clear()
      }
    })
  }



  /**
   * Validatations message
   * */
  getEmailValidationMessage() {
    return this.email.hasError('required') ? 'You must provide email address' :
      this.email.hasError('email') ? 'Not a valid email address' : 
      this.email.errors ? 'Not a valid email address' : ''
  }
}
