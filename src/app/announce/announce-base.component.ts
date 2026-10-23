import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import {RunnerDataService} from '../services/runner-data.service';
import {DEFAULT_SETTINGS, SettingsService} from "../services/settings.service";
import {ElectronService} from "../services/electron.service";

@Component({
  template: '',
  standalone: true
})
export class AnnounceBaseComponent {
  protected runnerDataService = inject(RunnerDataService);
  protected settingsService = inject(SettingsService);
  protected electronService = inject(ElectronService);

  readonly isElectron = this.electronService.isElectron;

  // Signals so OnPush views update even when entries arrive from IPC (outside the Angular zone)
  readonly settings = toSignal(this.settingsService.getSettings(), { initialValue: DEFAULT_SETTINGS });
  readonly runnerList = toSignal(this.runnerDataService.getActiveRunners(), { initialValue: [] });
  readonly paused = toSignal(this.runnerDataService.getPausedStatus(), { initialValue: false });
  readonly pausedQueueLength = toSignal(
    this.runnerDataService.getPausedQueue().pipe(map(queue => queue.length)),
    { initialValue: 0 }
  );
  readonly isNumLockOff = signal(false);

  readonly reverseRunnerList = computed(() => [...this.runnerList()].reverse());
  readonly customFields = computed(() => this.settings().customFields.filter(field => field.showInAnnounce));
  readonly runStartTime = computed(() => {
    const raceStartTime = this.settings().raceStartTime;
    return raceStartTime ? new Date(raceStartTime) : undefined;
  });

  @HostListener('window:keydown', ['$event'])
  trackNumLock(event: KeyboardEvent): void {
    this.isNumLockOff.set(event.getModifierState && !event.getModifierState('NumLock'));
  }
}
