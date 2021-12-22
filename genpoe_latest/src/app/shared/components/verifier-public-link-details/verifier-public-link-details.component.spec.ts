import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifierPublicLinkDetailsComponent } from './verifier-public-link-details.component';

describe('VerifierPublicLinkDetailsComponent', () => {
  let component: VerifierPublicLinkDetailsComponent;
  let fixture: ComponentFixture<VerifierPublicLinkDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifierPublicLinkDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifierPublicLinkDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
