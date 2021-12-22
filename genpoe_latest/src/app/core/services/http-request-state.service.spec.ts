import { TestBed } from '@angular/core/testing';

import { HttpRequestStateService } from './http-request-state.service';

describe('HttpRequestStateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HttpRequestStateService = TestBed.get(HttpRequestStateService);
    expect(service).toBeTruthy();
  });
});
