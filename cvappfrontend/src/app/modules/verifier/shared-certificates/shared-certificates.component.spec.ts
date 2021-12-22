import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedCertificatesComponent } from './shared-certificates.component';

describe('SharedCertificatesComponent', () => {
  let component: SharedCertificatesComponent;
  let fixture: ComponentFixture<SharedCertificatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedCertificatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
