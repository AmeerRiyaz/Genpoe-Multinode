import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


export interface DialogData {
  title
  message
  actionChoosen
}

@Component({
  selector: 'app-dialog-action',
  templateUrl: './dialog-action.component.html',
  styleUrls: ['./dialog-action.component.css']
})
export class DialogActionComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogActionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit() {
  }

  onCancelClick(): void {
    // this.data.actionChoosen = false
    this.dialogRef.close(false);
  }

  onConfirmClick(): void {
    // this.data.actionChoosen = true
    this.dialogRef.close(true);
  }

}

