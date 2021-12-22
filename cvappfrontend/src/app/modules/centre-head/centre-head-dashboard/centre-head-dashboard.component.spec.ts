import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentreHeadDashboardComponent } from './centre-head-dashboard.component';

describe('CentreHeadDashboardComponent', () => {
  let component: CentreHeadDashboardComponent;
  let fixture: ComponentFixture<CentreHeadDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CentreHeadDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentreHeadDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
