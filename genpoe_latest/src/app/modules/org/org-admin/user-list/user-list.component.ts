import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { AddUserComponent } from './add-user/add-user.component';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { UserService } from '../../services/user.service';
import { AppGlobals } from 'src/app/config/app-globals';
import { HttpErrorResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { UtilsService } from 'src/app/shared/services/utils.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})

export class UserListComponent implements OnInit {
  dataSource: MatTableDataSource<any>
  getUsersRequestState: HttpRequestState = new HttpRequestState()
  changeStatusRequestState: HttpRequestState = new HttpRequestState()
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  constructor(
    private dialog: MatDialog,
    private httpRequestStateService: HttpRequestStateService,
    private userService: UserService,
    private appGlobals: AppGlobals,
    private logger: NGXLogger,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource<any>()
    this.getUsers()
  }

  getUsers(){
    this.httpRequestStateService.initRequest(this.getUsersRequestState)
    this.getUsersRequestState.subscription = this.userService.getUsers().subscribe((result:any) => {
      this.logger.log("getUsers() list: ", result)
      // if (result.status == this.appGlobals.HTTP_SUCCESS) {
        if (result) {
        if(result.length === 0){
          this.httpRequestStateService.finishRequestWithEmptyResponse(this.getUsersRequestState)
          return
        }
        this.dataSource.data = result.result
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
        this.httpRequestStateService.finishRequest(this.getUsersRequestState)
      }else{
        this.getUsersRequestState.msgToUser = result.message
        this.httpRequestStateService.finishRequestWithError(this.getUsersRequestState)
      }
    },(err: HttpErrorResponse)=> {
      this.httpRequestStateService.finishRequestWithError(this.getUsersRequestState)
    })
  }

  openAddUserDialog() {

    // const dialogConfig = new MatDialogConfig();
    // dialogConfig.position = {
    //   left: '40%'
    // };
    const dialogRef = this.dialog.open(AddUserComponent, {
      disableClose: true,
      minWidth: '350px'
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getUsers()
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onChangeUserEnableState(event, user) {
    this.httpRequestStateService.initRequest(this.changeStatusRequestState)
    var changeStatusRequest = {
      userEmail: user.userOrgemail,
      enable: event.checked
    }
    
    this.logger.log("changeStatus request: ", changeStatusRequest);

    this.changeStatusRequestState.subscription = this.userService.changeUserStatus(changeStatusRequest).subscribe(
      result => {
        this.logger.log("changeStatus response: ", result);
        if (result.status == this.appGlobals.HTTP_SUCCESS) {
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
