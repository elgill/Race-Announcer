import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {RunnerDataService} from '../services/runner-data.service';
import {DEFAULT_SETTINGS, Settings, SettingsService} from "../services/settings.service";
import {CustomField} from "../interfaces/custom-field";
import {Runner} from "../interfaces/runner";
import {ElectronService} from "../services/electron.service";

@Component({
  template: '',
  standalone: true
})
export class AnnounceBaseComponent implements OnInit, OnDestroy {
  protected runnerDataService = inject(RunnerDataService);
  protected settingsService = inject(SettingsService);
  protected electronService = inject(ElectronService);

  settings: Settings= DEFAULT_SETTINGS;
  runStartTime: Date | undefined;
  isElectron = this.electronService.isElectron;

  runnerList: Runner[] = [];
  reverseRunnerList: Runner[] = [];
  isNumLockOff = false;
  customFields: CustomField[] = [];

  paused = false;
  pausedQueueLength = 0;

  // PERFORMANCE FIX: Add destroy$ subject for subscription cleanup
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // PERFORMANCE FIX: Use takeUntil to automatically unsubscribe
    this.runnerDataService.getActiveRunners()
      .pipe(takeUntil(this.destroy$))
      .subscribe(runners => {
        this.runnerList = runners;
        this.reverseRunnerList = [...runners].reverse();
      });

    this.settingsService.getSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.settings = settings;
        if(settings.raceStartTime){
          this.runStartTime = new Date(settings.raceStartTime);
        } else {
          this.runStartTime = undefined
        }
      });

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      this.isNumLockOff = event.getModifierState && !event.getModifierState('NumLock');
    });

    this.customFields = this.settings.customFields.filter(field => field.showInAnnounce)

    this.runnerDataService.getPausedStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(paused => {
        this.paused = paused;
      });

    this.runnerDataService.getPausedQueue()
      .pipe(takeUntil(this.destroy$))
      .subscribe(queue => {
        this.pausedQueueLength = queue.length;
      });
  }

  // PERFORMANCE FIX: Clean up all subscriptions on component destroy
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
