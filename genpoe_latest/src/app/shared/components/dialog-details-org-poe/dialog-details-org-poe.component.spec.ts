import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDetailsOrgPoeComponent } from './dialog-details-org-poe.component';

describe('DialogDetailsOrgPoeComponent', () => {
  let component: DialogDetailsOrgPoeComponent;
  let fixture: ComponentFixture<DialogDetailsOrgPoeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogDetailsOrgPoeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDetailsOrgPoeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
