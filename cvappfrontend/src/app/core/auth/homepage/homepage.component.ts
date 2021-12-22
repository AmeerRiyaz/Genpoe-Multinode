import { Component, OnInit } from '@angular/core';
import { AppGlobals } from 'src/app/configs/app-globals';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {

  public showArray = {
    SIGNIN: 'sigin',
    SIGNUP: 'signup',
    VERIFIER: 'verifier'
  }

  currentShow: string = this.showArray.SIGNIN
  
  constructor(
    public appGlobals: AppGlobals
  ) { }

  ngOnInit() {
    this.currentShow = this.showArray.SIGNIN
  }

}
