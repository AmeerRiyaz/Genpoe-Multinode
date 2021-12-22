import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoeCardsComponent } from './poe-cards.component';

describe('PoeCardsComponent', () => {
  let component: PoeCardsComponent;
  let fixture: ComponentFixture<PoeCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoeCardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoeCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
