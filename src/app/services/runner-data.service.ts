import {Injectable} from '@angular/core';
import {saveAs} from 'file-saver-es';
import * as Papa from 'papaparse';
import {BehaviorSubject} from 'rxjs';
import {RunnerDatabase} from "../runner-database/runner-database";
import {IndexedDbRunnerDatabaseService} from "../runner-database/indexed-db-runner-database.service";

export interface Runner {
  id: string;
  bib: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  town: string;
  state: string;
  customFields: Map<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class RunnerDataService {

  private allRunners = new Map<string, Runner>();
  private activeRunners: Runner[] = [];
  private activeRunners$ = new BehaviorSubject<Runner[]>([]);
  private db: RunnerDatabase;

  constructor() {
    // IDB
    this.db = new IndexedDbRunnerDatabaseService();

    console.log('Initial runners:', Array.from(this.allRunners.values()));

    // Load runners from localStorage
    this.loadRunnersFromRunnerDB();
  }

  async loadRunnersFromRunnerDB() {
    const runnersArray: Runner[] = await this.db.loadRunners();
    runnersArray.forEach(runner => {
      this.allRunners.set(runner.bib, runner);
    });
  }

  async saveRunnersToDB() {
    const runnersArray = Array.from(this.allRunners.values());
    await this.db.saveRunners(runnersArray);
  }

  async getRunnersByName(firstName?: string, lastName?: string): Promise<Runner[]> {
    return this.db.getRunnersByName(firstName, lastName);
  }

  generateUniqueId(): string {
    const prefix = Date.now().toString();
    const randomNum = Math.floor(Math.random() * 1000000);
    return `${prefix}-${randomNum}`;
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
        id:'',
        bib: bib,
        firstName: 'Not Found',
        lastName: '',
        age: 0,
        gender: '',
        town: '',
        state: '',
        customFields: new Map<string,string>
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

    // Save runners to localStorage
    this.saveRunnersToDB();
  }

  getSortedRunners() {
    // Convert the map values to an array, sort it, and return it
    return Array.from(this.allRunners.values()).sort((a, b) => Number(a.bib) - Number(b.bib));
  }

  exportRunners() {
    const runnersArray = Array.from(this.allRunners.values());
    const csv = Papa.unparse(runnersArray);
    const blob = new Blob([csv], {type: 'text/csv'});

    saveAs(blob, 'runners.csv');
  }

  clearAllRunners() {
    this.allRunners = new Map<string, Runner>();
    this.activeRunners = [];
    this.activeRunners$.next(this.activeRunners);

    this.db.deleteAllRunners();
  }
}
