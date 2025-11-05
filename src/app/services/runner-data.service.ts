import { Injectable, inject } from '@angular/core';
import {saveAs} from 'file-saver-es';
import * as Papa from 'papaparse';
import {BehaviorSubject, Observable} from 'rxjs';
import {RunnerDatabase} from "../runner-database/runner-database";
import {IndexedDbRunnerDatabaseService} from "../runner-database/indexed-db-runner-database.service";
import {Runner} from "../interfaces/runner";
import {EntryAttempt} from "../interfaces/entry-attempt";
import {DEFAULT_SETTINGS, SettingsService} from "./settings.service";

// CONFIGURATION: Set to true to also clear bib history when clearing active entries
const CLEAR_HISTORY_WITH_ACTIVE_ENTRIES = true;

@Injectable({
  providedIn: 'root'
})
export class RunnerDataService {
  private settingsService = inject(SettingsService);


  private allRunners = new Map<string, Runner>();
  private activeRunners: Runner[] = [];
  private activeRunners$ = new BehaviorSubject<Runner[]>([]);
  private db: RunnerDatabase;
  private xrefData = new Map<string, string>(); // Map to store XREF data: chipId -> bib
  private xrefCount$ = new BehaviorSubject<number>(0); // Observable for XREF count

  private settings = DEFAULT_SETTINGS;
  private lastEntryTimes = new Map<string, Date>(); // Map to store last entry times

  private paused = false;
  private paused$ = new BehaviorSubject<boolean>(this.paused);
  private pausedQueue: Runner[] = [];
  private pausedQueue$ = new BehaviorSubject<Runner[]>([]);
  private runnerCount$ = new BehaviorSubject<number>(0); // Observable for runner count

  // PERFORMANCE FIX: Limit entry attempts to prevent unbounded memory growth
  private readonly MAX_ENTRY_ATTEMPTS = 10000; // Keep last 10,000 attempts
  private entryAttempts: EntryAttempt[] = []; // Track entry attempts with size limit

  constructor() {
    // IDB
    this.db = new IndexedDbRunnerDatabaseService();

    this.loadRunnersFromRunnerDB().then(() => {
      console.log('Loaded runners from database.');
      this.updateRunnerCount(); // Update runner count after loading
    }).catch(err => {
      console.error('Failed to load runners from database:', err);
    });

    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    });

    this.loadXrefDataFromDB().then(() => {
      console.log('Loaded XREF data from database.');
      this.updateXrefCount(); // Update XREF count after loading
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
    this.updateXrefCount(); // Update XREF count
  }

  async saveXrefDataToDB() {
    const xrefArray = Array.from(this.xrefData.entries()).map(([chipId, bib]) => ({ chipId, bib }));
    await this.db.saveXrefData(xrefArray);
  }

  clearXref() {
    this.xrefData.clear();
    this.updateXrefCount(); // Update XREF count
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
    this.updateXrefCount(); // Update XREF count
    console.log('Saved XREF data in memory.');
    this.saveXrefDataToDB().then(() => {
      console.log("Saved XREF to DB");
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
    this.updateRunnerCount(); // Update runner count
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

  getActiveRunners(): Observable<Runner[]> {
    return this.activeRunners$.asObservable();
  }

  getPausedStatus(): Observable<boolean> {
    return this.paused$.asObservable();
  }

  getPausedQueue(): Observable<Runner[]> {
    return this.pausedQueue$.asObservable();
  }

  getRunnerCount(): Observable<number> {
    return this.runnerCount$.asObservable();
  }

  getXrefCount(): Observable<number> {
    return this.xrefCount$.asObservable();
  }

  getEntryAttempts(bib?: string): EntryAttempt[] {
    if (bib) {
      return this.entryAttempts.filter(attempt => attempt.bib === bib);
    }
    return [...this.entryAttempts];
  }

  private updateRunnerCount() {
    this.runnerCount$.next(this.allRunners.size);
  }

  private updateXrefCount() {
    this.xrefCount$.next(this.xrefData.size);
  }

  enterBib(bib: string, overrideMinTime = false, overridePause = false, entrySource?: 'manual' | 'automated', matId?: string) {
    const now = new Date();
    const lastEntryTime = this.lastEntryTimes.get(bib);
    const minTimeMs = this.settings.minTimeMs;

    if(!bib){
      bib = "";
    }

    bib = bib.toString();

    // Track this entry attempt
    if (entrySource) {
      this.entryAttempts.push({
        bib,
        timestamp: now,
        entrySource,
        wasShown: false, // Will be updated if entry is actually shown
        matId
      });

      // PERFORMANCE FIX: Limit array size to prevent unbounded growth
      // Remove oldest entries if we exceed the limit (FIFO)
      if (this.entryAttempts.length > this.MAX_ENTRY_ATTEMPTS) {
        this.entryAttempts.shift(); // Remove oldest entry
      }
    }

    // Check if entry is within minTimeMs window
    if (!overrideMinTime && lastEntryTime) {
      const timeSinceLastEntry = now.getTime() - lastEntryTime.getTime();
      if (timeSinceLastEntry < minTimeMs) {
        console.warn(`Ignoring entry for bib ${bib} because it was entered too recently.`);

        // Update the existing entry in activeRunners to show it was confirmed by alternate method
        if (entrySource) {
          const existingEntry = this.activeRunners.find(r => r.bib === bib);
          if (existingEntry && existingEntry.entrySource && existingEntry.entrySource !== entrySource) {
            existingEntry.entrySource = 'both';
            this.activeRunners$.next(this.activeRunners);
            console.debug(`Updated bib ${bib} entry to 'both' (confirmed by ${entrySource})`);
          }
        }

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

    // Set entry source if provided
    if (entrySource) {
      runner.entrySource = entrySource;
    }

    this.lastEntryTimes.set(bib, now);

    // Mark the most recent entry attempt as shown
    if (entrySource && this.entryAttempts.length > 0) {
      const lastAttempt = this.entryAttempts[this.entryAttempts.length - 1];
      lastAttempt.wasShown = true;
      // Also store matId on the attempt if provided
      if (matId) {
        lastAttempt.matId = matId;
      }
    }

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
      this.activeRunners.shift();
    }

    this.activeRunners$.next(this.activeRunners);
  }

  loadRunners(newRunners: Runner[]): string {
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

    console.log('Runners after loading:', Array.from(this.allRunners.values()));

    this.saveRunnersToDB().then(() => {
      console.log('Saved runners to database.');
    }).catch(err => {
      console.error('Failed to save runners to database:', err);
    });

    this.updateRunnerCount(); // Update runner count
    return `${updatedCount} updated, ${addedCount} added`;
  }

  getSortedRunners() {
    return Array.from(this.allRunners.values()).sort((a, b) => Number(a.bib) - Number(b.bib));
  }

  exportRunners() {
    const allCustomFieldKeys = new Set<string>();
    this.allRunners.forEach(runner => {
      Object.keys(runner.customFields).forEach(key => allCustomFieldKeys.add(key));
    });

    const runnersArray = Array.from(this.allRunners.values()).map(runner => {
      const customFieldsWithDefaults: { [key: string]: string } = {};

      allCustomFieldKeys.forEach(key => {
        customFieldsWithDefaults[key] = runner.customFields[key] || '';
      });

      return { ...runner, ...customFieldsWithDefaults };
    });

    const csv = Papa.unparse(runnersArray);
    const blob = new Blob([csv], { type: 'text/csv' });

    saveAs(blob, 'runners.csv');
  }

  clearActiveRunners() {
    this.activeRunners = [];
    this.activeRunners$.next(this.activeRunners);
    this.lastEntryTimes.clear();

    // Optionally clear bib history based on configuration toggle
    if (CLEAR_HISTORY_WITH_ACTIVE_ENTRIES) {
      this.entryAttempts = [];
      console.log('Cleared active runner entries and bib history.');
    } else {
      console.log('Cleared active runner entries (bib history preserved).');
    }
  }

  clearAllRunners() {
    this.allRunners.clear();
    this.activeRunners = [];
    this.activeRunners$.next(this.activeRunners);
    this.lastEntryTimes.clear();

    this.db.deleteAllRunners().then(() => {
      console.log('Deleted all runners from database.');
    }).catch(err => {
      console.error('Failed to delete all runners from database:', err);
    });

    this.updateRunnerCount(); // Update runner count
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
