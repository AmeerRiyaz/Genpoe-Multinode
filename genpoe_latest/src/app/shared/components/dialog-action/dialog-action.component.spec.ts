import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogActionComponent } from './dialog-action.component';

describe('DialogActionComponent', () => {
  let component: DialogActionComponent;
  let fixture: ComponentFixture<DialogActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
