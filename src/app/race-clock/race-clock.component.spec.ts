import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceClockComponent } from './race-clock.component';
import { DEFAULT_SETTINGS, SettingsService } from '../services/settings.service';

describe('RaceClockComponent', () => {
  let component: RaceClockComponent;
  let fixture: ComponentFixture<RaceClockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RaceClockComponent]
    });
    fixture = TestBed.createComponent(RaceClockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ticks once a race start time is set', async () => {
    spyOn(localStorage, 'setItem');
    TestBed.inject(SettingsService).updateSettings({ ...DEFAULT_SETTINGS, raceStartTime: new Date().toISOString() });
    fixture.detectChanges();
    const first = fixture.nativeElement.textContent;
    expect(first).not.toContain('00:00:00');

    await new Promise(resolve => setTimeout(resolve, 250));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toEqual(first);
  });
});
