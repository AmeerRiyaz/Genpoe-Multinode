import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseCoordinatorDashboardComponent } from './course-coordinator-dashboard.component';

describe('CourseCoordinatorDashboardComponent', () => {
  let component: CourseCoordinatorDashboardComponent;
  let fixture: ComponentFixture<CourseCoordinatorDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseCoordinatorDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseCoordinatorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
