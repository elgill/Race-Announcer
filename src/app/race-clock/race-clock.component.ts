import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {DEFAULT_SETTINGS, SettingsService} from "../services/settings.service";
import {TimeDurationPipe} from "../time-duration.pipe";

@Component({
    selector: 'app-race-clock',
    templateUrl: './race-clock.component.html',
    styleUrls: ['./race-clock.component.css'],
    standalone: true,
    imports: [TimeDurationPipe]
})
export class RaceClockComponent {
  private settingsService = inject(SettingsService);

  settings = toSignal(this.settingsService.getSettings(), { initialValue: DEFAULT_SETTINGS });
  startTime = computed(() => new Date(this.settings().raceStartTime));
  // Only this view re-renders on each tick; OnPush skips the rest of the app
  currentTime = signal(new Date());

  constructor() {
    const tick = setInterval(() => this.currentTime.set(new Date()), 10);
    inject(DestroyRef).onDestroy(() => clearInterval(tick));
  }
}
