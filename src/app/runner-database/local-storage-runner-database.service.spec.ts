import { TestBed } from '@angular/core/testing';

import { LocalStorageRunnerDatabaseService } from './local-storage-runner-database.service';

describe('LocalStorageRunnerDatabaseService', () => {
  let service: LocalStorageRunnerDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageRunnerDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
