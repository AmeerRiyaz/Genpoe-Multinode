import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-transaction-success-result',
  templateUrl: './transaction-success-result.component.html',
  styleUrls: ['./transaction-success-result.component.css']
})
export class TransactionSuccessResultComponent implements OnInit {
  
  @Input() result;

  constructor() { }

  ngOnInit() {
  }

}
