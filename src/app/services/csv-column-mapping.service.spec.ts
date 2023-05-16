import { TestBed } from '@angular/core/testing';

import { CsvColumnMappingService } from './csv-column-mapping.service';

describe('CsvColumnMappingService', () => {
  let service: CsvColumnMappingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsvColumnMappingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
