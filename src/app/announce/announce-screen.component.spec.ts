import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnounceScreenComponent } from './announce-screen.component';
import { RunnerDataService } from '../services/runner-data.service';
import { DEFAULT_SETTINGS, SettingsService } from '../services/settings.service';

describe('RunnerComponent', () => {
  let component: AnnounceScreenComponent;
  let fixture: ComponentFixture<AnnounceScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AnnounceScreenComponent]
    });
    fixture = TestBed.createComponent(AnnounceScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the paused status and queue length', () => {
    const runnerDataService = TestBed.inject(RunnerDataService);
    runnerDataService.togglePause();
    runnerDataService.enterBib('7', false, false, 'automated');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.pause-status').textContent).toContain('Paused: 1 entries in queue');

    runnerDataService.togglePause();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pause-status').textContent.trim()).toBe('');
  });

  it('switches announce templates when settings change', () => {
    const settingsService = TestBed.inject(SettingsService);
    spyOn(localStorage, 'setItem');
    settingsService.updateSettings({ ...DEFAULT_SETTINGS, announceTemplate: 'grid' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-announce-grid')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-announce-freeform')).toBeNull();
  });
});
