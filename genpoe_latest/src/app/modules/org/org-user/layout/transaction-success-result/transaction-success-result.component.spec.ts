import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionSuccessResultComponent } from './transaction-success-result.component';

describe('TransactionSuccessResultComponent', () => {
  let component: TransactionSuccessResultComponent;
  let fixture: ComponentFixture<TransactionSuccessResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionSuccessResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionSuccessResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
