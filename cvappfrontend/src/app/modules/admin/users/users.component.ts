import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AdminService } from 'src/app/core/services/admin.service';
import { AddUserComponent } from './add-user/add-user.component';
import { const_HTTP_RESPONSE } from 'src/app/shared/models/app-common-constants';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeUserEnabledStatus } from 'src/app/shared/models/changeuserenabledstatusrequest';
import { UtilsService } from 'src/app/core/services/utils.service';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  dataSource: MatTableDataSource<any>
  getUsersRequestState: HttpRequestState = new HttpRequestState()
  changeStatusRequestState: HttpRequestState = new HttpRequestState()
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private logger: NGXLogger,
    public dialog: MatDialog,
    private adminService: AdminService,
    private utils: UtilsService,
    private httpRequestStateService: HttpRequestStateService
  ) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource<any>()
    this.getUsers()
  }
  ngOnDestroy(){
    this.httpRequestStateService.destroyRequest(this.getUsersRequestState)
    this.httpRequestStateService.destroyRequest(this.changeStatusRequestState)
  }

  getUsers() {
    this.httpRequestStateService.initRequest(this.getUsersRequestState)
    this.getUsersRequestState.subscription = this.adminService.getUsers().subscribe(result => {
      if (result) {
        this.logger.log("getUsers() list: ", result)
        this.dataSource.data = result
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
        this.httpRequestStateService.finishRequest(this.getUsersRequestState)
      } else {

      }

    },
      (err: HttpErrorResponse) => {
        // this.logger.log(err.message);
        this.httpRequestStateService.finishRequestWithError(this.getUsersRequestState)
      });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openAddUserDialog() {
    // const dialogConfig = new MatDialogConfig();
    // dialogConfig.position = {
    //   left: '40%'
    // };
    const dialogRef = this.dialog.open(AddUserComponent, {
      minWidth: '450px',
      maxHeight: '600px'
    });
    dialogRef.afterClosed().subscribe(result => {
      // this.logger.log('The dialog was closed, ',result);
      if (result) {
        this.getUsers()
      }
    });
  }

  onChangeUserEnableState(event, user) {
    this.httpRequestStateService.initRequest(this.changeStatusRequestState)
    var changeStatusRequest = new ChangeUserEnabledStatus();
    changeStatusRequest.enable = event.checked;
    // changeStatusRequest.token = user.token;
    changeStatusRequest.username = user.username
    
    this.logger.log("changeStatus request: ", changeStatusRequest);

    this.changeStatusRequestState.subscription = this.adminService.changeUserStatus(changeStatusRequest).subscribe(
      result => {
        this.logger.log("changeStatus response: ", result);
        if (result.status == const_HTTP_RESPONSE.SUCCESS) {
          this.httpRequestStateService.finishRequest(this.changeStatusRequestState)
          this.utils.showSnackBar(result.message)
          this.getUsers()
        } else {
          this.httpRequestStateService.finishRequestWithError(this.changeStatusRequestState)
          this.utils.showSnackBar(result.message)
        }
      },
      (err: HttpErrorResponse) => {
        // this.logger.log(err.message);
        this.httpRequestStateService.finishRequestWithError(this.changeStatusRequestState)
        this.utils.showSnackBar("Something went wrong...")
      });
  }

}
