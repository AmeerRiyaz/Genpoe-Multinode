import { TestBed } from '@angular/core/testing';

import { PoeService } from './poe.service';

describe('PoeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PoeService = TestBed.get(PoeService);
    expect(service).toBeTruthy();
  });
});
