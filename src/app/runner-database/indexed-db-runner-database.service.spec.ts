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

  it('saveXrefData replaces previously stored entries', async () => {
    await service.saveXrefData([
      { chipId: '000000001000', bib: '2' },
      { chipId: '000000001001', bib: '3' },
    ]);
    await service.saveXrefData([{ chipId: '000000001001', bib: '1' }]);

    expect(await service.loadXrefData()).toEqual([{ chipId: '000000001001', bib: '1' }]);
  });

  it('saveXrefData with an empty array clears stored entries', async () => {
    await service.saveXrefData([{ chipId: '000000001000', bib: '1' }]);
    await service.saveXrefData([]);

    expect(await service.loadXrefData()).toEqual([]);
  });
});
