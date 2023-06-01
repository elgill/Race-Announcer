import { TestBed } from '@angular/core/testing';

import { IndexedDbRunnerDatabaseService } from './indexed-db-runner-database.service';

describe('IndexedDbRunnerDatabaseService', () => {
  let service: IndexedDbRunnerDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexedDbRunnerDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
