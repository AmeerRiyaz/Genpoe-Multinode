import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionMultiFileComponent } from './transaction-multi-file.component';

describe('TransactionMultiFileComponent', () => {
  let component: TransactionMultiFileComponent;
  let fixture: ComponentFixture<TransactionMultiFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionMultiFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionMultiFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
