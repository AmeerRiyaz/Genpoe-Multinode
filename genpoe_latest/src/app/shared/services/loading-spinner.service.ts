import { Injectable } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DialogLoadingComponent } from '../components/dialog-loading/dialog-loading.component';
import { AppGlobals } from 'src/app/config/app-globals';

@Injectable({
  providedIn: 'root'
})
export class LoadingSpinnerService {

  dialogRef: MatDialogRef<DialogLoadingComponent>
  constructor(
    private dialog: MatDialog,
  ) { }
  openLoadingDialog() {
    setTimeout(() => {
      this.dialogRef = this.dialog.open(DialogLoadingComponent,
        {
          panelClass: 'loading-dialog',
          disableClose: true
        }
      )
    }, 1);

    setTimeout(() => {
      this.closeLoading()
    }, AppGlobals.HTTP_TIMEOUT);
  }
  closeLoading() {
    setTimeout(() => {
      this.dialogRef.close()
    }, 0);
  }

}
