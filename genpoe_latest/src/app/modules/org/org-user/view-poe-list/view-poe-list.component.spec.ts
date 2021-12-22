import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPoeListComponent } from './view-poe-list.component';

describe('ViewPoeListComponent', () => {
  let component: ViewPoeListComponent;
  let fixture: ComponentFixture<ViewPoeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPoeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPoeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
