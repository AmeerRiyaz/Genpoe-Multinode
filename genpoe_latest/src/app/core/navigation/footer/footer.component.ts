import { Component, OnInit, Input } from '@angular/core';
import { AppGlobals } from 'src/app/config/app-globals';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  @Input('useShortname') shortName = false;
  constructor(
    public appGlobals: AppGlobals
  ) { }

  ngOnInit() {
  }

}
