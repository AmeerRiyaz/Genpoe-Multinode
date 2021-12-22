import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoeUploadComponent } from './poe-upload.component';

describe('PoeUploadComponent', () => {
  let component: PoeUploadComponent;
  let fixture: ComponentFixture<PoeUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoeUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoeUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
