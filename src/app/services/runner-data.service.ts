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

  private allRunners = new Map<string, Runner>();
  private activeRunners: Runner[] = [];
  private activeRunners$ = new BehaviorSubject<Runner[]>([]);

  constructor() {
    // Log initial runners
    console.log('Initial runners:', Array.from(this.allRunners.values()));
  }

  getActiveRunners() {
    return this.activeRunners$.asObservable();
  }

  enterBib(bib: string) {
    const runner = this.allRunners.get(bib);
    if (runner) {
      this.activeRunners.unshift(runner);  // add runner to the start of the array
      this.activeRunners$.next(this.activeRunners);
    }

    // Log runner found by bib
    console.log('Runner found by bib:', runner);
  }

  loadRunners(newRunners: Runner[]) {
    newRunners.forEach(newRunner => {
      this.allRunners.set(newRunner.bib, newRunner);
    });

    // Log runners after loading
    console.log('Runners after loading:', Array.from(this.allRunners.values()));
  }

  // Add more methods as needed to handle importing from CSV, etc.
}
