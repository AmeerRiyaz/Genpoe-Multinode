import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoeSearchComponent } from './poe-search.component';

describe('PoeSearchComponent', () => {
  let component: PoeSearchComponent;
  let fixture: ComponentFixture<PoeSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoeSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
