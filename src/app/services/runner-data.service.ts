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
  private xrefData = new Map<string, string>(); // Map to store XREF data: chipId -> bib

  private settings = DEFAULT_SETTINGS;
  private lastEntryTimes = new Map<string, Date>(); // Map to store last entry times

  private paused = false;
  private paused$ = new BehaviorSubject<boolean>(this.paused)
  private pausedQueue: Runner[] = [];
  private pausedQueue$ = new BehaviorSubject<Runner[]>([]);

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

    this.loadXrefDataFromDB().then(() => {
      console.log('Loaded XREF data from database.');
    }).catch(err => {
      console.error('Failed to load XREF data from database:', err);
    });
  }

  togglePause() {
    this.paused = !this.paused;
    this.paused$.next(this.paused);
    if (!this.paused) {
      this.processPausedQueue();
    }
  }

  private processPausedQueue() {
    this.enterBib('',true, true)

    while (this.pausedQueue.length > 0) {
      const runner = this.pausedQueue.shift();
      if (runner) {
        this.activeRunners.unshift(runner);
      }
    }
    this.activeRunners$.next(this.activeRunners);
    this.pausedQueue$.next(this.pausedQueue);
  }

  async loadXrefDataFromDB() {
    const xrefArray: { bib: string, chipId: string }[] = await this.db.loadXrefData();
    xrefArray.forEach(xref => {
      this.xrefData.set(xref.chipId, xref.bib);
    });
  }

  async saveXrefDataToDB() {
    const xrefArray = Array.from(this.xrefData.entries()).map(([chipId, bib]) => ({ chipId, bib }));
    await this.db.saveXrefData(xrefArray);
  }

  clearXref() {
    this.xrefData.clear();
    console.log('Cleared all XREF data in memory.');

    this.saveXrefDataToDB().then(() => {
      console.log('Cleared XREF data in database.');
    }).catch(err => {
      console.error('Failed to clear XREF data in database:', err);
    });
  }

  importXref(xrefArray: { bib: string, chipId: string }[]) {
    console.log("XREF importing: ", xrefArray);
    xrefArray.forEach(xref => {
      this.xrefData.set(xref.chipId, xref.bib);
    });
    console.log("Saved XREF data in memory.");
    this.saveXrefDataToDB().then(() => {
      console.log("Saved XREF to DB")
    }).catch(err => {
      console.error('Failed to save XREF data in database:', err);
    });

  }

  getBibByChipId(chipId: string): string | undefined {
    return this.xrefData.get(chipId);
  }

  getFullXrefMap() {
    return this.xrefData;
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

  getPausedStatus(){
    return this.paused$.asObservable();
  }

  getPausedQueue(){
    return this.pausedQueue$.asObservable();
  }

  enterBib(bib: string, overrideMinTime = false, overridePause = false) {
    const now = new Date();
    const lastEntryTime = this.lastEntryTimes.get(bib);
    const minTimeMs = this.settings.minTimeMs;

    if(!bib){
      bib = "";
    }

    bib = bib.toString();

    if (!overrideMinTime && lastEntryTime) {
      const timeSinceLastEntry = now.getTime() - lastEntryTime.getTime();
      if (timeSinceLastEntry < minTimeMs) {
        console.warn(`Ignoring entry for bib ${bib} because it was entered too recently.`);
        return;
      }
    }

    let runner = this.allRunners.get(bib);
    if (!runner) {
      runner = bib === "" ? {...runnerBlankBib} : {...runnerNotFound};
      runner.bib = bib;
    }

    runner = {...runner};

    // Set the current time only if timeEntered is not already set
    if (!runner.timeEntered) {
      runner.timeEntered = new Date();
    }

    this.lastEntryTimes.set(bib, now);

    if (this.paused && !overridePause) {
      this.pausedQueue.push(runner);
      this.pausedQueue$.next(this.pausedQueue);
    } else {
      this.activeRunners.unshift(runner); // Add runner to the start of the array
    }
    this.activeRunners$.next(this.activeRunners);
  }

  removeLastRunner() {
    if (this.activeRunners.length > 0) {
      // Now remove the runner from the array
      this.activeRunners.shift();
    }

    // Update the observable with the new list of active runners
    this.activeRunners$.next(this.activeRunners);
  }

  loadRunners(newRunners: Runner[]):string {
    let updatedCount = 0;
    let addedCount = 0;

    newRunners.forEach(newRunner => {
      const bib = newRunner.bib;
      const existingRunner = this.allRunners.get(bib);
      if (existingRunner) {
        this.allRunners.set(bib, { ...existingRunner, ...newRunner }); // Update the existing entry
        updatedCount++;
      } else {
        this.allRunners.set(bib, newRunner); // Add new entry
        addedCount++;
      }
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

      allCustomFieldKeys.forEach(key => {
        customFieldsWithDefaults[key] = runner.customFields[key] || '';
      });

      // Merge the runner's original fields with the custom fields
      return { ...runner, ...customFieldsWithDefaults };
    });

    const csv = Papa.unparse(runnersArray);
    const blob = new Blob([csv], {type: 'text/csv'});

    saveAs(blob, 'runners.csv');
  }

  clearAllRunners() {
    this.allRunners = new Map<string, Runner>();
    this.activeRunners = [];
    this.activeRunners$.next(this.activeRunners);

    this.clearXref()

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
