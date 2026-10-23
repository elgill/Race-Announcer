import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunnerInfoComponent } from './runner-info.component';
import { RunnerDataService } from '../services/runner-data.service';

describe('RunnerInfoComponent', () => {
  let component: RunnerInfoComponent;
  let fixture: ComponentFixture<RunnerInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunnerInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunnerInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates the XREF count when XREF data is imported elsewhere', () => {
    const runnerDataService = TestBed.inject(RunnerDataService);
    spyOn(runnerDataService, 'saveXrefDataToDB').and.resolveTo();
    runnerDataService.clearXref();
    runnerDataService.importXref([{ bib: '1', chipId: 'A' }, { bib: '2', chipId: 'B' }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('XREF Entries: 2');
  });
});
