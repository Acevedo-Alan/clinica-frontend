import { TestBed } from '@angular/core/testing';

import { Cobertura } from './cobertura';

describe('Cobertura', () => {
  let service: Cobertura;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cobertura);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
