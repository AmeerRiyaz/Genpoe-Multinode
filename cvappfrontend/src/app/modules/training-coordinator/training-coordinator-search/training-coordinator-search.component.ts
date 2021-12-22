import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CentreHeadService } from 'src/app/core/services/centre-head.service';
import { DataService } from 'src/app/core/services/data.service';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DetailsDialogComponent } from 'src/app/shared/layout/details-dialog/details-dialog.component';
import { GetBatchListRequest } from 'src/app/shared/models/get-batch-list-request';
import { GetCourseListRequest } from 'src/app/shared/models/get-course-list-request';
import { GetYearListRequest } from 'src/app/shared/models/get-year-list-request';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { SearchRequest } from 'src/app/shared/models/search-request';
import { SelectionModel } from '@angular/cdk/collections';
import { StudentService } from 'src/app/core/services/student.service';
import { ShareCertificatesRequest } from 'src/app/shared/models/share-certificates-request';
import { LoadingSpinnerService } from 'src/app/core/services/loading-spinner.service';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-training-coordinator-search',
  templateUrl: './training-coordinator-search.component.html',
  styleUrls: ['./training-coordinator-search.component.css']
})
export class TrainingCoordinatorSearchComponent implements OnInit {
  //form variables
  searchForm: FormGroup
  year: FormControl
  batch: FormControl
  course: FormControl

  email: FormControl
  shareForm: FormGroup

  //request variables
  searchRequestState: HttpRequestState = new HttpRequestState()
  shareCertificatesRequestState: HttpRequestState = new HttpRequestState()
  //data variables
  yearList
  batchList
  courseList
  dataSource: MatTableDataSource<any> = new MatTableDataSource()
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  selection = new SelectionModel<any>(true, []);

  constructor( 
    private logger: NGXLogger,
    private utils: UtilsService,
    private dataService: DataService,
    private _formBuilder: FormBuilder,
    private centreHeadService: CentreHeadService,
    private authService: AuthService,
    public dialog: MatDialog,
    private studentService: StudentService,
    private httpRequestStateService: HttpRequestStateService,
    private loadingSpinner: LoadingSpinnerService
  ) { }

  ngOnInit() {
    this.getYearList()
    this.year = new FormControl('', [Validators.required])
    this.batch = new FormControl('', [Validators.required])
    this.course = new FormControl('', [Validators.required])
    this.email = new FormControl('', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
    this.shareForm = this._formBuilder.group({
      email: this.email
    })
    this.searchForm = this._formBuilder.group({
      // centre: this.,
      year: this.year,
      batch: this.batch,
      course: this.course,

    })

    
   
  }

  ngOnDestroy(): void {
    this.loadingSpinner.closeLoading()
    this.httpRequestStateService.destroyRequest(this.searchRequestState)
    this.httpRequestStateService.destroyRequest(this.shareCertificatesRequestState)
  }

  public getYearList() {
    this.loadingSpinner.openLoadingDialog()
    var getYearListRequest = new GetYearListRequest()
    getYearListRequest.centre = this.authService.getCurrentCentre();
    // this.logger.log(this.authService.getCurrentCentre())
    this.logger.log(getYearListRequest)
    this.dataService.getYearList(getYearListRequest).subscribe(result => {
      this.logger.log("getYearList",result)
      this.yearList = result
      this.yearList = Array.from(new Set(this.yearList.map((itemInArray) => itemInArray.year)))
      this.loadingSpinner.closeLoading()
    }, (error: HttpErrorResponse) => {
      this.loadingSpinner.closeLoading()
    })
  }

  onSelectYear(event) {
    this.searchRequestState = new HttpRequestState()
    this.loadingSpinner.openLoadingDialog()
    var getBatchListRequest = new GetBatchListRequest()
    getBatchListRequest.centre = this.authService.getCurrentCentre();
    getBatchListRequest.year = this.searchForm.value.year
    this.dataService.getBatchList(getBatchListRequest).subscribe(result => {
      this.logger.log("getBatchList",result)
      this.batchList = result;
      this.batchList = Array.from(new Set(this.batchList.map((itemInArray) => itemInArray.month)))
      this.loadingSpinner.closeLoading()
    }, (error: HttpErrorResponse) => {
      this.loadingSpinner.closeLoading()
    })

    this.searchForm.get('batch').reset()
    this.searchForm.get('course').reset()

    this.courseList = null;
  }

  onSelectBatch(event) {
    this.searchRequestState = new HttpRequestState()
    this.loadingSpinner.openLoadingDialog()
    var getCourseListRequest = new GetCourseListRequest()
    getCourseListRequest.centre = this.authService.getCurrentCentre();
    getCourseListRequest.year = this.searchForm.value.year
    getCourseListRequest.batch = this.searchForm.value.batch
    // this.logger.log()
    this.dataService.getCourseList(getCourseListRequest).subscribe(result => {
      this.logger.log("getCourseList",result)
      this.courseList = result;
      this.courseList = Array.from(new Set(this.courseList.map((itemInArray) => itemInArray.course)))
      this.loadingSpinner.closeLoading()
    }, (error: HttpErrorResponse) => {
      this.loadingSpinner.closeLoading()
    })

    this.searchForm.get('course').reset()
  }


  search() {
    var searchRequest: SearchRequest = new SearchRequest()
    this.httpRequestStateService.initRequest(this.searchRequestState)
    searchRequest.centre = this.authService.getCurrentCentre();
    searchRequest.year = this.searchForm.value.year
    searchRequest.batch = this.searchForm.value.batch
    searchRequest.course = this.searchForm.value.course
    this.logger.log("search req : ",searchRequest)

    this.searchRequestState.subscription = this.centreHeadService.search(searchRequest).subscribe(result => {
      this.logger.log("search res : ",result)
      if (result.length) {
        this.httpRequestStateService.finishRequest(this.searchRequestState)
        this.dataSource.data = result
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
      } else {
        this.httpRequestStateService.finishRequestWithError(this.searchRequestState)
        this.searchRequestState.msgToUser = "Nothing found to display"
      }
    }, (err: HttpErrorResponse) => {
      // this.logger.log(err)
      this.httpRequestStateService.finishRequestWithError(this.searchRequestState)
    })
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  viewDetilas(txn) {
    // this.logger.log(txn)
    const dialogRef = this.dialog.open(DetailsDialogComponent, {
      width: 'auto',
      height: 'auto',
      data: txn,
      // disableClose: true
    });
    // dialogRef.afterClosed().subscribe(result => {
    // });

  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const rowsWithTxId = this.dataSource.filteredData.filter(item => item.txId);
    const numRows = rowsWithTxId.length;
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
    var shareCertificatesRequest = new ShareCertificatesRequest()
    this.httpRequestStateService.initRequest(this.shareCertificatesRequestState)
    this.selection.selected.forEach(element => {
      shareCertificatesRequest.documents.push(element.txId)
    });
    shareCertificatesRequest.email = this.shareForm.value.email
    shareCertificatesRequest.centre = this.authService.getCurrentCentre()
    this.shareCertificatesRequestState.subscription = this.studentService.shareCertificates(shareCertificatesRequest).subscribe(result => {
      this.logger.log(result)
      if (result) {
        this.httpRequestStateService.finishRequest(this.shareCertificatesRequestState)
        this.utils.showDialog("Success", "Document(s) Shared Successfully")
        this.shareForm.reset()
        this.selection.clear()
      }
    })
  }



  getSelectionValidationMessage() {
    if (this.year.hasError('required'))
      return 'You must select year first'
    else if (this.batch.hasError('required'))
      return 'You must select batch first'
    else if (this.course.hasError('required'))
      return 'You must select course'
    else
      return ''
  }
  getEmailValidationMessage() {
    return this.email.hasError('required') ? 'You must provide email address':
      this.email.hasError ('email') ? 'Not a valid email address' : 
      this.email.errors ? 'Not a valid email address' : ''
  }
}
