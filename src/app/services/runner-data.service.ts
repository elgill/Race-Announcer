import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Runner {
  bib: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  town: string;
  state: string;
  customField1: string;
  customField2: string;
}

@Injectable({
  providedIn: 'root'
})
export class RunnerDataService {

  private runners = new Map<string, Runner>();
  private runners$ = new BehaviorSubject<Runner[]>([]);

  constructor() {
    // Log initial runners
    console.log('Initial runners:', Array.from(this.runners.values()));
  }

  getRunners() {
    return this.runners$.asObservable();
  }

  getRunnerByBib(bib: string) {
    const runner = this.runners.get(bib);
    if (runner) {
      this.runners$.next([runner]);
    }

    // Log runner found by bib
    console.log('Runner found by bib:', runner);
  }

  loadRunners(newRunners: Runner[]) {
    newRunners.forEach(newRunner => {
      this.runners.set(newRunner.bib, newRunner);
    });

    this.runners$.next(Array.from(this.runners.values()));

    // Log runners after loading
    console.log('Runners after loading:', Array.from(this.runners.values()));
  }

  // Add more methods as needed to handle importing from CSV, etc.
}
