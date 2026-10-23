import { TestBed } from '@angular/core/testing';

import { RunnerDataService } from './runner-data.service';
import { Runner } from '../interfaces/runner';

function makeRunner(bib: string, firstName = 'Pat'): Runner {
  return { id: '', bib, firstName, lastName: 'Runner', age: 30, gender: 'F', town: 'Town', state: 'ST', customFields: {} };
}

describe('RunnerDataService', () => {
  let service: RunnerDataService;
  let db: jasmine.SpyObj<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RunnerDataService);
    // Swap in a fake database so tests don't race the real IndexedDB load
    db = jasmine.createSpyObj('RunnerDatabase', ['saveRunners', 'deleteRunner']);
    db.saveRunners.and.resolveTo();
    db.deleteRunner.and.resolveTo();
    (service as any).db = db;
    (service as any).allRunners.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('saveRunner adds a new runner flagged as a local edit', async () => {
    await service.saveRunner(makeRunner(' 101 '));

    const saved = service.getSortedRunners();
    expect(saved.length).toBe(1);
    expect(saved[0].bib).toBe('101');
    expect(saved[0].localEdit).toBeTrue();
    expect(saved[0].id).not.toBe('');
    expect(db.saveRunners).toHaveBeenCalledWith([saved[0]]);
  });

  it('saveRunner rejects a bib that belongs to another runner', async () => {
    await service.saveRunner(makeRunner('1'));
    await service.saveRunner(makeRunner('2'));

    await expectAsync(service.saveRunner(makeRunner('2', 'Other'), '1')).toBeRejectedWithError(/already assigned/);
    await expectAsync(service.saveRunner(makeRunner(''))).toBeRejectedWithError(/required/);
  });

  it('saveRunner with a changed bib replaces the old record', async () => {
    await service.saveRunner(makeRunner('1'));
    await service.saveRunner(makeRunner('5'), '1');

    expect(service.getSortedRunners().map(r => r.bib)).toEqual(['5']);
    expect(db.deleteRunner).toHaveBeenCalledWith('1');
  });

  it('deleteRunner removes the runner', async () => {
    await service.saveRunner(makeRunner('1'));
    await service.deleteRunner('1');

    expect(service.getSortedRunners()).toEqual([]);
    expect(db.deleteRunner).toHaveBeenCalledWith('1');
  });

  it('loadRunners does not overwrite locally edited runners', async () => {
    await service.saveRunner(makeRunner('1', 'Edited'));

    const result = service.loadRunners([makeRunner('1', 'Imported'), makeRunner('2', 'Imported')]);

    expect(result).toBe('0 updated, 1 added, 1 kept local edits');
    const runners = service.getSortedRunners();
    expect(runners[0].firstName).toBe('Edited');
    expect(runners[1].firstName).toBe('Imported');
  });
});
