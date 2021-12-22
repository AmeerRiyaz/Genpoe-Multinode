import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingCoordinatorSearchComponent } from './training-coordinator-search.component';

describe('TrainingCoordinatorSearchComponent', () => {
  let component: TrainingCoordinatorSearchComponent;
  let fixture: ComponentFixture<TrainingCoordinatorSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingCoordinatorSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingCoordinatorSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
