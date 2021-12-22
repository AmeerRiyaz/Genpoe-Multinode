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
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { UtilsService } from 'src/app/core/services/utils.service';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { ShareCertificatesStudentRequest } from 'src/app/shared/models/share-certificates-student-request';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-student-certificate-cards',
  templateUrl: './student-certificate-cards.component.html',
  styleUrls: ['./student-certificate-cards.component.css']
})
export class StudentCertificateCardsComponent implements OnInit, OnDestroy {

  //form variables
  email: FormControl
  shareForm: FormGroup

  //request variables
  getCertificatesRequestState: HttpRequestState = new HttpRequestState()
  shareCertificatesRequestState: HttpRequestState = new HttpRequestState()

  //table variables
  dataSource: MatTableDataSource<any>
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  selection = new SelectionModel<any>(true, []);
  filteredData
  rowsWithTxId
  constructor(
    private logger: NGXLogger,
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
      this.logger.log("getCertificates() list: ", result)
      if (result) {
        this.dataSource.data = result
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
        this.filteredData = this.dataSource.data
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
    // this.logger.log(this.selection)
    if (filterValue) {
      filterValue = filterValue.trim().toLowerCase();
      this.filteredData = this.dataSource.data.filter(
        data => {
          // var key: string = data.documentType.toString()
          return data.documentType.toString().toLocaleLowerCase().includes(filterValue) ?
            data.documentType.toString().toLocaleLowerCase().includes(filterValue) :
            data.sha256Hash.toString().toLocaleLowerCase().includes(filterValue) ?
              data.sha256Hash.toString().toLocaleLowerCase().includes(filterValue) :
              data.timestamp.toString().toLocaleLowerCase().includes(filterValue) ?
                data.timestamp.toString().toLocaleLowerCase().includes(filterValue) : ''

        });
    }
    else {
      this.filteredData = this.dataSource.data
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    this.rowsWithTxId = this.dataSource.filteredData.filter(item => item.txId);
    const numRows = this.rowsWithTxId.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.filteredData.forEach(row => {
        if (!row.txId)
          return
        this.selection.select(row)
      });
  }

  shareCertificates() {
    var shareCertificatesRequest = new ShareCertificatesStudentRequest()
    this.httpRequestStateService.initRequest(this.shareCertificatesRequestState)
    this.selection.selected.forEach(element => {
      shareCertificatesRequest.documents.push(element.txId)
    });
    shareCertificatesRequest.username =  this.authService.getCurrentUser()
    shareCertificatesRequest.email = this.shareForm.value.email
    this.shareCertificatesRequestState.subscription = this.studentService.shareCertificatesStudent(shareCertificatesRequest).subscribe(result => {
      // this.logger.log(result)
      if (result) {
        this.httpRequestStateService.finishRequest(this.shareCertificatesRequestState)
        this.utils.showDialog("Share Documents Successful", result)
        this.shareForm.reset()
        this.selection.clear()
      }
    }, (error : HttpErrorResponse)=>{
      this.utils.showSnackBar("Failed to share documents, please try again")
      this.httpRequestStateService.finishRequestWithError(this.shareCertificatesRequestState)
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
