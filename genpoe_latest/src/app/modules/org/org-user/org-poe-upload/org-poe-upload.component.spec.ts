import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgPoeUploadComponent } from './org-poe-upload.component';

describe('OrgPoeUploadComponent', () => {
  let component: OrgPoeUploadComponent;
  let fixture: ComponentFixture<OrgPoeUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgPoeUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgPoeUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
