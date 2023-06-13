import { Injectable } from '@angular/core';
import { openDB } from 'idb';
import * as lunr from 'lunr';
import {RunnerDatabase} from "./runner-database";

import {Runner} from "../interfaces/runner";

@Injectable({
  providedIn: 'root'
})
export class IndexedDbRunnerDatabaseService implements RunnerDatabase {
  private dbPromise;
  // @ts-ignore
  private idx: lunr.Index;
  private runners: Runner[] = [];

  constructor() {
    this.dbPromise = openDB('runners', 1, {
      upgrade(db) {
        db.createObjectStore('runners', { keyPath: 'id' });
      },
    });

    this.rebuildIndex().then(() => {
      console.log('Index Rebuilt');
    }).catch(err => {
      console.error('Failed to rebuild index:', err);
    });
  }

  async rebuildIndex() {
    const runners = this.runners;
    this.idx = lunr(function() {
      this.ref('id');
      this.field('firstName');
      this.field('lastName');

      for (const doc of runners) {
        this.add(doc);
      }
    });
  }

  async loadRunners(): Promise<Runner[]> {
    const db = await this.dbPromise;
    this.runners = await db.getAll('runners');
    await this.rebuildIndex();
    return this.runners;
  }

  async saveRunners(runners: Runner[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('runners', 'readwrite');

    for (const runner of runners) {
      tx.store.put(runner).then().catch(err => {
        console.error('Failed to store runner:', err);
      });
      this.runners.push(runner);
    }

    await tx.done;
    await this.rebuildIndex();
  }

  async getRunnersByName(firstName?: string, lastName?: string): Promise<Runner[]> {
    let searchString = '';
    if (firstName) {
      searchString += `firstName:${firstName}* `;
    }
    if (lastName) {
      searchString += `lastName:${lastName}* `;
    }

    const searchResults = this.idx.search(searchString.trim());
    const db = await this.dbPromise;
    const runners = [];

    for (const result of searchResults) {
      const runner = await db.get('runners', result.ref);
      runners.push(runner);
    }
    console.log("Search results for First:",firstName," Last:",lastName," Results:", runners)

    return runners;
  }

  async deleteAllRunners(): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('runners', 'readwrite');

    await tx.store.clear();

    await tx.done;

    // Clear in-memory data as well.
    this.runners = [];
    await this.rebuildIndex();
  }

}
