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

  private runners: Runner[] = [];
  private runners$ = new BehaviorSubject<Runner[]>([]);

  constructor() { }

  getRunners() {
    return this.runners$.asObservable();
  }

  getRunnerByBib(bib: string) {
    const runner = this.runners.find(r => r.bib === bib);
    if (runner) {
      this.runners$.next([runner]);
    }
  }

  loadRunners(runners: Runner[]) {
    this.runners = runners;
    this.runners$.next(this.runners);
  }

  // Add more methods as needed to handle importing from CSV, etc.

}
