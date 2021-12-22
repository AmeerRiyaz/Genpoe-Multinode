import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { const_HTTP_RESPONSE } from 'src/app/shared/models/app-common-constants';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DataService } from 'src/app/core/services/data.service';
import { GetYearListRequest } from 'src/app/shared/models/get-year-list-request';
import { GetBatchListRequest } from 'src/app/shared/models/get-batch-list-request';
import { GetCourseListRequest } from 'src/app/shared/models/get-course-list-request';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CentreHeadService } from 'src/app/core/services/centre-head.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SearchRequest } from 'src/app/shared/models/search-request';
import { AuthService } from 'src/app/core/auth/auth.service';
import { GetRollNoListRequest } from 'src/app/shared/models/get-roll-no-list-request';
import { DetailsDialogComponent } from 'src/app/shared/layout/details-dialog/details-dialog.component';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { LoadingSpinnerService } from 'src/app/core/services/loading-spinner.service';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-course-coordinator-search',
  templateUrl: './course-coordinator-search.component.html',
  styleUrls: ['./course-coordinator-search.component.css']
})
export class CourseCoordinatorSearchComponent implements OnInit, OnDestroy {
  //form variables
  searchForm: FormGroup
  year: FormControl
  batch: FormControl
  course: FormControl

  //request variables
  searchRequestState: HttpRequestState = new HttpRequestState()

  //data variables
  yearList
  batchList
  courseList
  dataSource: MatTableDataSource<any> = new MatTableDataSource()
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private logger: NGXLogger,
    private utils: UtilsService,
    private dataService: DataService,
    private _formBuilder: FormBuilder,
    private centreHeadService: CentreHeadService,
    private authService: AuthService,
    public dialog: MatDialog,
    private httpRequestStateService: HttpRequestStateService,
    private loadingSpinner: LoadingSpinnerService
  ) { }

  ngOnInit() {
    this.getYearList()
    this.year = new FormControl('', [Validators.required])
    this.batch = new FormControl('', [Validators.required])
    this.course = new FormControl('', [Validators.required])

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

  }

  public getYearList() {
    this.loadingSpinner.openLoadingDialog()
    var getYearListRequest = new GetYearListRequest()
    getYearListRequest.centre = this.authService.getCurrentCentre();
    // this.logger.log(this.authService.getCurrentCentre())
    // this.logger.log(getYearListRequest)
    this.dataService.getYearList(getYearListRequest).subscribe(result => {
      // this.logger.log(result)
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
    this.logger.log("search req",searchRequest)

    this.searchRequestState.subscription = this.centreHeadService.search(searchRequest).subscribe(result => {
      this.logger.log("search res",result)
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

}
