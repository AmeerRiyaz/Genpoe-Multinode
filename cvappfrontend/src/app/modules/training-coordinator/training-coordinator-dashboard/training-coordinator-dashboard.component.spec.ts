import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingCoordinatorDashboardComponent } from './training-coordinator-dashboard.component';

describe('TrainingCoordinatorDashboardComponent', () => {
  let component: TrainingCoordinatorDashboardComponent;
  let fixture: ComponentFixture<TrainingCoordinatorDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingCoordinatorDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingCoordinatorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
