import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifierPublicLinkPosComponent } from './verifier-public-link-pos.component';

describe('VerifierPublicLinkPosComponent', () => {
  let component: VerifierPublicLinkPosComponent;
  let fixture: ComponentFixture<VerifierPublicLinkPosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifierPublicLinkPosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifierPublicLinkPosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
