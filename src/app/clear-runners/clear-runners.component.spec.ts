import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ClearRunnersComponent } from './clear-runners.component';
import { RunnerDataService } from '../services/runner-data.service';

describe('ClearRunnersComponent', () => {
  let component: ClearRunnersComponent;
  let fixture: ComponentFixture<ClearRunnersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClearRunnersComponent]
    });
    fixture = TestBed.createComponent(ClearRunnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hides the status message after three seconds', fakeAsync(() => {
    spyOn(TestBed.inject(RunnerDataService), 'clearActiveRunners');
    (fixture.nativeElement.querySelector('.btn-info') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Active Entries Cleared!');

    tick(3000);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Active Entries Cleared!');
  }));
});
