
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { CoberturaService } from './cobertura';

describe('CoberturaService', () => {
  let service: CoberturaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });

    service = TestBed.inject(CoberturaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
