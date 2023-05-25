import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import {DEFAULT_SETTINGS, Settings, SettingsService} from "../services/settings.service";

@Component({
  selector: 'app-race-clock',
  templateUrl: './race-clock.component.html',
  styleUrls: ['./race-clock.component.css']
})
export class RaceClockComponent implements OnInit, OnDestroy {
  settings: Settings= DEFAULT_SETTINGS;
  //startTime: string = ''; // The start time in ISO 8601 format
  elapsedTime: string = '';
  private subscription: Subscription = new Subscription();

  constructor(private settingsService: SettingsService) {
  }

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    });

    this.subscription = interval(10).pipe(
      startWith(0),
      map(() => this.calculateElapsedTime())
    ).subscribe(elapsedTime => this.elapsedTime = elapsedTime);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private calculateElapsedTime(): string {
    const startTime = new Date(this.settings.raceStartTime);
    const now = new Date();
    const diffMilliseconds = now.getTime() - startTime.getTime();
    const hours = Math.floor(diffMilliseconds / 3600000);
    const minutes = Math.floor((diffMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((diffMilliseconds % 60000) / 1000);
    const tenthsOfSecond = Math.floor((diffMilliseconds % 1000) / 100);
    let elapsedTime = '';
    if (hours > 0) {
      elapsedTime += `${hours.toString().padStart(2, '0')}:`;
    }
    elapsedTime += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenthsOfSecond}`;
    return elapsedTime;
  }


}
