import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseRunnersComponent } from './browse-runners.component';
import { RunnerDataService } from '../services/runner-data.service';
import { Runner } from '../interfaces/runner';

function makeRunner(bib: string, firstName: string): Runner {
  return { id: '', bib, firstName, lastName: 'Runner', age: 30, gender: 'F', town: 'Town', state: 'ST', customFields: {} };
}

describe('BrowseRunnersComponent', () => {
  let component: BrowseRunnersComponent;
  let fixture: ComponentFixture<BrowseRunnersComponent>;
  let runnerDataService: RunnerDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowseRunnersComponent]
    });
    runnerDataService = TestBed.inject(RunnerDataService);
    // Fake database so the test doesn't touch real IndexedDB
    const db = jasmine.createSpyObj('RunnerDatabase', ['saveRunners', 'deleteRunner']);
    db.saveRunners.and.resolveTo();
    (runnerDataService as any).db = db;
    (runnerDataService as any).allRunners.clear();
    fixture = TestBed.createComponent(BrowseRunnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows runners loaded after the component is created', () => {
    runnerDataService.loadRunners([makeRunner('1', 'Alice'), makeRunner('2', 'Bob')]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.count').textContent).toContain('2 of 2 runners');
    expect(fixture.nativeElement.querySelector('app-runner-table').textContent).toContain('Alice');
  });

  it('opens the editor for a clicked runner', () => {
    runnerDataService.loadRunners([makeRunner('1', 'Alice')]);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('app-runner-table tbody tr') as HTMLElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-runner-editor h3').textContent).toContain('Edit Runner 1');
    expect(fixture.nativeElement.querySelector('app-runner-table tbody tr').classList).toContain('selected');
  });
});
