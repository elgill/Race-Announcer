import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnounceFreeformComponent } from './announce-freeform.component';
import { RunnerDataService } from '../../services/runner-data.service';

describe('AnnounceTestComponent', () => {
  let component: AnnounceFreeformComponent;
  let fixture: ComponentFixture<AnnounceFreeformComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AnnounceFreeformComponent]
    });
    fixture = TestBed.createComponent(AnnounceFreeformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders entries that arrive from the timing mat service', () => {
    const runnerDataService = TestBed.inject(RunnerDataService);
    runnerDataService.enterBib('4242', true, true, 'automated');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('4242');
  });

  it('removes the last entry when it is deleted', () => {
    const runnerDataService = TestBed.inject(RunnerDataService);
    runnerDataService.enterBib('111', true, true, 'manual');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('111');

    runnerDataService.removeLastRunner();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('111');
  });
});
