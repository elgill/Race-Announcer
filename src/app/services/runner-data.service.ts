import {Injectable} from '@angular/core';
import {saveAs} from 'file-saver-es';
import * as Papa from 'papaparse';
import {BehaviorSubject} from 'rxjs';
import {RunnerDatabase} from "../runner-database/runner-database";
import {IndexedDbRunnerDatabaseService} from "../runner-database/indexed-db-runner-database.service";
import {Runner} from "../interfaces/runner";
import {DEFAULT_SETTINGS, SettingsService} from "./settings.service";

@Injectable({
  providedIn: 'root'
})
export class RunnerDataService {

  private allRunners = new Map<string, Runner>();
  private activeRunners: Runner[] = [];
  private activeRunners$ = new BehaviorSubject<Runner[]>([]);
  private db: RunnerDatabase;

  private settings = DEFAULT_SETTINGS;

  constructor(private settingsService: SettingsService) {
    // IDB
    this.db = new IndexedDbRunnerDatabaseService();

    this.loadRunnersFromRunnerDB().then(() => {
      console.log('Loaded runners from database.');
    }).catch(err => {
      console.error('Failed to load runners from database:', err);
    });

    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    });
  }

  async loadRunnersFromRunnerDB() {
    const runnersArray: Runner[] = await this.db.loadRunners();
    runnersArray.forEach(runner => {
      this.allRunners.set(runner.bib, runner);
    });
  }

  async saveRunnersToDB() {
    const runnersArray = Array.from(this.allRunners.values());
    console.log("Saving to database: ",runnersArray);
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
    let runner = this.allRunners.get(bib);
    if (!runner) {
      runner = bib === "" ? {...runnerBlankBib} : {...runnerNotFound};
      runner.bib = bib;
    }

    // Set the current time only if timeEntered is not already set
    if (!runner.timeEntered) {
      runner.timeEntered = new Date();
    }

    this.activeRunners.unshift(runner); // Add runner to the start of the array
    this.activeRunners$.next(this.activeRunners);
    console.log('Runner entered:', runner);
  }

  removeLastRunner() {
    if (this.activeRunners.length > 0) {
      // Capture the runner being removed
      let runnerBeingRemoved = this.activeRunners[0];

      // Clear the timeEntered attribute
      runnerBeingRemoved.timeEntered = undefined;

      // Now remove the runner from the array
      this.activeRunners.shift();
    }

    // Update the observable with the new list of active runners
    this.activeRunners$.next(this.activeRunners);

    // Log runners after removing
    console.log('Runners after removing:', this.activeRunners);
  }



  loadRunners(newRunners: Runner[]):string {
    let updatedCount = 0;
    let addedCount = 0;

    newRunners.forEach(newRunner => {
      const bib = newRunner.bib;
      if(this.allRunners.has(bib)){
        updatedCount++;
      } else {
        addedCount++;
      }
      this.allRunners.set(newRunner.bib, newRunner);
    });

    // Log runners after loading
    console.log('Runners after loading:', Array.from(this.allRunners.values()));

    this.saveRunnersToDB().then(() => {
      console.log('Saved runners to database.');
    }).catch(err => {
      console.error('Failed to save runners to database:', err);
    });
    return `${updatedCount} updated, ${addedCount} added`;
  }

  getSortedRunners() {
    // Convert the map values to an array, sort it, and return it
    return Array.from(this.allRunners.values()).sort((a, b) => Number(a.bib) - Number(b.bib));
  }

  exportRunners() {
    // First, identify all unique custom field keys across all runners
    const allCustomFieldKeys = new Set<string>();
    this.allRunners.forEach(runner => {
      Object.keys(runner.customFields).forEach(key => allCustomFieldKeys.add(key));
    });

    // Next, create a new representation of each runner that includes all custom fields
    const runnersArray = Array.from(this.allRunners.values()).map(runner => {
      const customFieldsWithDefaults: { [key: string]: string } = {};

      // For each custom field key, set the value to the runner's value if it exists; otherwise, use an empty string
      allCustomFieldKeys.forEach(key => {
        customFieldsWithDefaults[key] = runner.customFields[key] || '';
      });

      // Merge the runner's original fields with the custom fields
      return { ...runner, ...customFieldsWithDefaults };
    });

    // Generate CSV data from the processed runners
    const csv = Papa.unparse(runnersArray);
    const blob = new Blob([csv], {type: 'text/csv'});

    saveAs(blob, 'runners.csv');
  }

  clearAllRunners() {
    this.allRunners = new Map<string, Runner>();
    this.activeRunners = [];
    this.activeRunners$.next(this.activeRunners);

    this.db.deleteAllRunners().then(() => {
      console.log('Deleted all runners from database.');
    }).catch(err => {
      console.error('Failed to delete all runners from database:', err);
    });
  }
}

const runnerNotFound: Runner = {
  age: 0,
  bib: "",
  customFields: {},
  firstName: "Not Found",
  gender: "",
  id: "",
  lastName: "",
  state: "",
  town: ""
}

const runnerBlankBib: Runner = {
  age: 0,
  bib: "",
  customFields: {},
  firstName: "-",
  gender: "",
  id: "",
  lastName: "",
  state: "",
  town: ""
}
