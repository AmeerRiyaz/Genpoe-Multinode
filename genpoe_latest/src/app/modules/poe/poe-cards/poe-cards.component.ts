import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { NGXLogger } from 'ngx-logger';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { GetPoeListRequest } from 'src/app/shared/models/request-response/get-poe-list-request';
import { PoeService } from '../services/poe.service';
import { DetailsDialogComponent } from 'src/app/modules/poe/details-dialog/details-dialog.component';
import { PoeUploadComponent } from '../poe-upload/poe-upload.component';
import { AppGlobals } from 'src/app/config/app-globals';
import { NavigationService } from 'src/app/core/navigation/services/navigation.service';

@Component({
  selector: 'app-poe-cards',
  templateUrl: './poe-cards.component.html',
  styleUrls: ['./poe-cards.component.css']
})
export class PoeCardsComponent implements OnInit {

  //form variables
  email: FormControl
  shareForm: FormGroup

  //request variables
  getPoeListRequestState: HttpRequestState = new HttpRequestState()
  sharePoeRequestState: HttpRequestState = new HttpRequestState()

  //table variables
  dataSource: MatTableDataSource<any>
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  selection = new SelectionModel<any>(true, []);
  filteredData
  rowsWithTxId
  constructor(
    public appGlobals: AppGlobals,
    private logger: NGXLogger,
    private poeService: PoeService,
    private authService: AuthService,
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private utils: UtilsService,
    private httpRequestStateService: HttpRequestStateService,
    private navService: NavigationService
  ) { }

  ngOnInit() {
    this.initForm()
    this.getPoeList()
  }
  ngOnDestroy(): void {
    this.httpRequestStateService.destroyRequest(this.getPoeListRequestState)
    this.httpRequestStateService.destroyRequest(this.sharePoeRequestState)
  }

  initForm() {
    this.email = new FormControl('', [Validators.required, Validators.email])
    this.shareForm = this._formBuilder.group({
      email: this.email
    })
    this.dataSource = new MatTableDataSource<any>()
  }

  getPoeList() {
    var getPoeListRequest = new GetPoeListRequest()
    getPoeListRequest.username = this.authService.getCurrentUser()
    this.httpRequestStateService.initRequest(this.getPoeListRequestState)
    // this.logger.log(getPoeListRequest)
    this.getPoeListRequestState.subscription = this.poeService.getPoeListSpecificUser(getPoeListRequest).subscribe(result => {
      // this.getPoeListRequestState.subscription = this.poeService.getPoeList().subscribe((result:any) => {
      this.logger.log("getPoeList() list: ", result)
      if (result.status == this.appGlobals.HTTP_SUCCESS) {
        if (result.result.length) {
          this.navService.totalTransactionCount = result.result.length
          this.dataSource.data = result.result
          this.dataSource.paginator = this.paginator
          this.dataSource.sort = this.sort
          this.filteredData = this.dataSource.data
          this.httpRequestStateService.finishRequest(this.getPoeListRequestState)
        } else {
          this.httpRequestStateService.finishRequestWithEmptyResponse(this.getPoeListRequestState)
        }
      } else {
        this.httpRequestStateService.finishRequestWithError(this.getPoeListRequestState)
      }

    },
      (err: HttpErrorResponse) => {
        // this.logger.log(err.message);
        this.httpRequestStateService.finishRequestWithError(this.getPoeListRequestState)
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
  // isAllSelected() {
  //   const numSelected = this.selection.selected.length;
  //   this.rowsWithTxId = this.dataSource.filteredData.filter(item => item.txId);
  //   const numRows = this.rowsWithTxId.length;
  //   return numSelected === numRows;
  // }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  // masterToggle() {
  //   this.isAllSelected() ?
  //     this.selection.clear() :
  //     this.dataSource.filteredData.forEach(row => {
  //       if (!row.txId)
  //         return
  //       this.selection.select(row)
  //     });
  // }

  // sharePoe() {
  //   var sharePoeRequest = new SharePoeRequest()
  //   this.httpRequestStateService.initRequest(this.sharePoeRequestState)
  //   this.selection.selected.forEach(element => {
  //     sharePoeRequest.documents.push(element.txId)
  //   });
  //   sharePoeRequest.username = this.authService.getCurrentUser()
  //   sharePoeRequest.email = this.shareForm.value.email
  //   this.sharePoeRequestState.subscription = this.poeService.sharePoe(sharePoeRequest).subscribe(result => {
  //     // this.logger.log(result)
  //     if (result) {
  //       this.httpRequestStateService.finishRequest(this.sharePoeRequestState)
  //       this.utils.showAlertDialog("Share Documents Successful", result)
  //       this.shareForm.reset()
  //       this.selection.clear()
  //     }
  //   }, (error: HttpErrorResponse) => {
  //     this.utils.showSnackBar("Failed to share documents, please try again")
  //     this.httpRequestStateService.finishRequestWithError(this.sharePoeRequestState)
  //   })
  // }



  /**
   * Validatations message
   * */
  // getEmailValidationMessage() {
  //   return this.email.hasError('required') ? 'You must provide email address' :
  //     this.email.hasError('email') ? 'Not a valid email address' : ''
  // }


  openDetailsDialog(txn) {
    this.dialog.open(DetailsDialogComponent, {
      height: 'auto',
      maxWidth: "720px",
      width: "96vw",
      // height: "80vh",
      minWidth: "320px",
      data: txn
    })
  }
  openPoeUploadDialog() {

    const dialogRef = this.dialog.open(PoeUploadComponent, {
      disableClose: true,
      maxWidth: "720px",
      width: "96vw",
      // height: "80vh",
      minWidth: "320px",
    })

    dialogRef.afterClosed().subscribe(result => {
      this.logger.log('after upload:', result);
      var refreshRequired = result
      if (refreshRequired) {
        this.getPoeList()
      }
    });
  }

  public downloadReceipt(poedetail) {

    this.poeService.downloadReceipt(poedetail)

    // var coulmns = [
    //   ['Transaction ID', poedetail.txId]
    // ]

    // var rows = [
    //   ['File Name', poedetail.fileName],
    //   ['File Type', poedetail.fileType],
    //   ['Document Type', poedetail.documentType],
    //   ['SHA256 Hash', poedetail.sha256Hash],
    //   ['Recorded By', poedetail.issuedByOrg],
    //   ['Issued to', poedetail.issuedTo],
    //   ['Status', poedetail.txstatus],
    //   ['Timestamp', poedetail.timestamp],
    // ]

    // this.poeService.generatePDF(
    //   "Receipt",
    //   "PoE Record Details",
    //   "http://10.244.1.137:5000/poe/transaction?txId=" + poedetail.txId,
    //   poedetail.txId,
    //   coulmns,
    //   rows,
    //   this.utils.logos.poeLogo
    // )
  }
}
