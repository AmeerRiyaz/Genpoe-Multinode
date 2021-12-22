import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { UserService } from '../../services/user.service';
import { NGXLogger } from 'ngx-logger';
import { AppGlobals } from 'src/app/config/app-globals';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { DialogDetailsOrgPoeComponent } from 'src/app/shared/components/dialog-details-org-poe/dialog-details-org-poe.component';
@Component({
  selector: 'app-view-poe-list',
  templateUrl: './view-poe-list.component.html',
  styleUrls: ['./view-poe-list.component.css']
})
export class ViewPoeListComponent implements OnInit {
  getPoeListRequestState: HttpRequestState = new HttpRequestState()
  dataSource: MatTableDataSource<any>
  filteredData = []
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    private httpRequestStateService: HttpRequestStateService,
    private userService: UserService,
    private logger: NGXLogger,
    private appGlobals: AppGlobals,
    private matDialog : MatDialog
  ) { }

  ngOnInit() {
    this.getPoeList()
    this.dataSource = new MatTableDataSource<any>()

  }


  getPoeList() {
    this.httpRequestStateService.initRequest(this.getPoeListRequestState)
    // this.logger.log(getPoeListRequest)
    this.getPoeListRequestState.subscription = this.userService.getPoeListUser().subscribe(result => {
      // this.getPoeListRequestState.subscription = this.poeService.getPoeList().subscribe((result:any) => {
      this.logger.log("getPoeList() list: ", result)
      if (result.status == this.appGlobals.HTTP_SUCCESS) {
        if (result.result.length) {

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

  //TODO review filter
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDetailsDialog(data){
    this.matDialog.open(DialogDetailsOrgPoeComponent, {
      data:data
    })
  }
}
