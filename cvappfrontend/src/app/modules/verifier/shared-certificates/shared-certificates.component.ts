import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DataSource } from '@angular/cdk/table';
import { SelectionModel } from '@angular/cdk/collections';
import { VerifierService } from 'src/app/core/services/verifier.service';
import { Router } from '@angular/router';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { const_HTTP_RESPONSE } from 'src/app/shared/models/app-common-constants';
import { HttpErrorResponse } from '@angular/common/http';
import { PoeService } from 'src/app/core/services/poe.service';
import { VerifyDialogComponent } from '../verify-dialog/verify-dialog.component';
@Component({
  selector: 'app-shared-certificates',
  templateUrl: './shared-certificates.component.html',
  styleUrls: ['./shared-certificates.component.css']
})
export class SharedCertificatesComponent implements OnInit {
  dataSource: MatTableDataSource<any>
  filteredData
  selection = new SelectionModel<any>(true, []);
  verifyRequestState = new HttpRequestState()
  verifyResultArray = []
  isEmailVerified: boolean = false

  constructor(
    private verifierService: VerifierService,
    private router: Router,
    private httpRequestStateService: HttpRequestStateService,
    private poeService: PoeService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.isEmailVerified = false
    this.dataSource = new MatTableDataSource<any>()
    this.isEmailVerified = this.verifierService.emailVerified
    // this.isEmailVerified = true // for debugging
    if (this.isEmailVerified) {
      this.getCertificates()
    } else {
      this.router.navigate(['/'])
    }

  }
  ngOnDestroy(): void {
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

  getCertificates() {
    this.dataSource.data = this.verifierService.getData()
    this.filteredData = this.dataSource.data
  }

  verify(hash) {
    const dialogRef = this.dialog.open(VerifyDialogComponent, {
      // width: 'auto',
      minWidth: '480px',
      height: 'auto',
      data: hash,
      // disableClose: true
    });
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
}
