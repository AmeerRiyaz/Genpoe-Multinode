import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserConfirmEmailComponent } from './user-confirm-email.component';

describe('UserConfirmEmailComponent', () => {
  let component: UserConfirmEmailComponent;
  let fixture: ComponentFixture<UserConfirmEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserConfirmEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserConfirmEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
