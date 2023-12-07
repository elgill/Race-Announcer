import { Injectable } from '@angular/core';
import { openDB } from 'idb';
import * as lunr from 'lunr';
import {RunnerDatabase} from "./runner-database";

import {Runner} from "../interfaces/runner";

@Injectable({
  providedIn: 'root'
})
export class IndexedDbRunnerDatabaseService implements RunnerDatabase {
  private readonly dbPromise;
  // @ts-ignore
  private idx: lunr.Index;
  private runners: Map<string, Runner> = new Map(); // Changed to map for O(1) retrieval

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
    const runners = Array.from(this.runners.values());
    this.idx = lunr(function() {
      this.pipeline.remove(lunr.stemmer);
      this.searchPipeline.remove(lunr.stemmer);

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
    const runners = await db.getAll('runners');
    this.idx = lunr(function() {
      // Use the pipeline without the stemmer
      this.pipeline.remove(lunr.stemmer);
      this.searchPipeline.remove(lunr.stemmer);

      this.ref('id');
      this.field('firstName');
      this.field('lastName');
    });
    for (const runner of runners) {
      this.runners.set(runner.id, runner);
    }
    await this.rebuildIndex();
    return Array.from(this.runners.values());
  }

  async saveRunners(runners: Runner[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('runners', 'readwrite');

    for (const runner of runners) {
      tx.store.put(runner).then().catch(err => {
        console.error('Failed to store runner:', err);
      });
      this.runners.set(runner.id, runner);
    }

    await tx.done;
    await this.rebuildIndex();
  }

  async getRunnersByName(firstName?: string, lastName?: string): Promise<Runner[]> {
    let searchString = '';
    if (firstName) {
      searchString += `+firstName:${firstName}* `;
    }
    if (lastName) {
      searchString += `+lastName:${lastName}* `;
    }

    const searchResults = this.idx.search(searchString.trim());
    const runners = [];

    for (const result of searchResults) {
      const runner = this.runners.get(result.ref);
      if(runner){
        runners.push(runner);
      }
    }
    console.log("Search:",searchString.trim()," First:",firstName," Last:",lastName," Results:", runners)

    return runners;
  }

  async deleteAllRunners(): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('runners', 'readwrite');

    await tx.store.clear();

    await tx.done;

    // Clear in-memory data as well.
    this.runners.clear();
    await this.rebuildIndex();
  }

}
