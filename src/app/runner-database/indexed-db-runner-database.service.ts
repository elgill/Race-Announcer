import { Injectable } from '@angular/core';
import {RunnerDatabase} from "./runner-database";
import {Runner} from "../services/runner-data.service";
import {IDBPDatabase, openDB} from 'idb';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbRunnerDatabaseService implements RunnerDatabase {

  private readonly dbName = 'runnersDB';
  private readonly storeName = 'runners';
  private readonly dbPromise: Promise<IDBPDatabase>;

  constructor() {
    const storeName = this.storeName;
    this.dbPromise = openDB(this.dbName, 1, {
      upgrade(db) {
        db.createObjectStore(storeName, { keyPath: 'bib' });
      },
    });
  }

  async loadRunners(): Promise<Runner[]> {
    const db = await this.dbPromise;
    return db.getAll(this.storeName);
  }

  async saveRunners(runners: Runner[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(this.storeName, 'readwrite');
    for (const runner of runners) {
      tx.store.put(runner);
    }
    await tx.done;
  }

  async getRunnersByName(firstName?: string, lastName?: string): Promise<Runner[]> {
    const db = await this.dbPromise;
    const allRunners: Runner[] = await db.getAll(this.storeName);
    return allRunners.filter(runner => {
      if (firstName && runner.firstName !== firstName) {
        return false;
      }
      if (lastName && runner.lastName !== lastName) {
        return false;
      }
      return true;
    });
  }
}
