import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import {DEFAULT_SETTINGS, Settings, SettingsService} from "../services/settings.service";

@Component({
    selector: 'app-race-clock',
    templateUrl: './race-clock.component.html',
    styleUrls: ['./race-clock.component.css'],
    standalone: false
})
export class RaceClockComponent implements OnInit, OnDestroy {
  settings: Settings= DEFAULT_SETTINGS;
  private subscription: Subscription = new Subscription();
  currentTime: Date = new Date();
  startTime: Date = new Date();

  constructor(private settingsService: SettingsService) {
  }

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
      this.startTime = new Date(this.settings.raceStartTime);
    });

    this.subscription = interval(10).pipe(
      startWith(0)
    ).subscribe(() => this.currentTime = new Date());
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
