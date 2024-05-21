import { TestBed } from '@angular/core/testing';

import { TagReadConversionService } from './tag-read-conversion.service';

describe('TagReadConversionService', () => {
  let service: TagReadConversionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagReadConversionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
