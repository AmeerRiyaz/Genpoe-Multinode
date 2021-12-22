import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-stat-bar',
  templateUrl: './stat-bar.component.html',
  styleUrls: ['./stat-bar.component.css']
})
export class StatBarComponent implements OnInit {

  @Input() values: [];
  @Input() labels:[];
  constructor() { }

  ngOnInit() {
  }

}
