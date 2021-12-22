import { Injectable } from '@angular/core';
import { LoadingDialogComponent } from 'src/app/shared/layout/loading-dialog/loading-dialog.component';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
// import { DEFAULT_TIMEOUT } from './http-request-state.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingSpinnerService {
  isSpinnerOpened = false
  timeout
  dialogRef: MatDialogRef<LoadingDialogComponent>

  constructor(
    private dialog: MatDialog
  ) {
    // this.timeout = DEFAULT_TIMEOUT
  }

  openLoadingDialog(closeTimeout?: number) {
    this.isSpinnerOpened = true
    setTimeout(() => {
      this.dialogRef = this.dialog.open(LoadingDialogComponent,
        {
          panelClass: 'loading-dialog',
          disableClose: true
        }
      )
    }, 1);

    if (closeTimeout >= 0) {
      setTimeout(() => {
        this.closeLoading()
      }, closeTimeout);
      this.isSpinnerOpened = false
    }
    
  }

  closeLoading(timeout?) {
    // console.log("spinner status", this.isSpinnerOpened)
    if (this.isSpinnerOpened) {
      // console.log("closing spinner")
      setTimeout(() => {
        this.dialogRef.close()
        this.isSpinnerOpened = false
        // console.log("spinner closed")
        // console.log("spinner status", this.isSpinnerOpened)
      }, timeout >= 0 ? timeout : 0);

    }
    // if (this.dialogRef!= undefined || this.dialogRef!= null) {
    // console.log(this.dialogRef)
    // setTimeout(() => {
    //   this.dialogRef.close()
    // }, timeout >= 0 ? timeout : 0);
    // }
  }

  setLoaderTimeout(time) {
    this.timeout = time
  }

}
