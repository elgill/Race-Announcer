import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';
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
    } else {
      // If no runner found, add a placeholder runner with the entered bib
      this.activeRunners.unshift({
        bib: bib,
        firstName: 'Not Found',
        lastName: '',
        age: 0,
        gender: '',
        town: '',
        state: '',
        customField1: '',
        customField2: ''
      });
    }

    this.activeRunners$.next(this.activeRunners);

    // Log runner found by bib
    console.log('Runner found by bib:', runner);
  }

  removeLastRunner() {
    this.activeRunners.shift();  // remove the first runner from the array
    this.activeRunners$.next(this.activeRunners);

    // Log runners after removing
    console.log('Runners after removing:', this.activeRunners);
  }


  loadRunners(newRunners: Runner[]) {
    newRunners.forEach(newRunner => {
      this.allRunners.set(newRunner.bib, newRunner);
    });

    // Log runners after loading
    console.log('Runners after loading:', Array.from(this.allRunners.values()));
  }

  exportRunners() {
    const runnersArray = Array.from(this.allRunners.values());
    const csv = Papa.unparse(runnersArray);
    const blob = new Blob([csv], {type: 'text/csv'});

    saveAs(blob, 'runners.csv');
  }
}
