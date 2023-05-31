import { Injectable } from '@angular/core';
import {RunnerDatabase} from "./runner-database";
import {Runner} from "../services/runner-data.service";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageRunnerDatabaseService implements RunnerDatabase {

  constructor() { }

  loadRunners(): Promise<Runner[]> {
    const storedRunners = localStorage.getItem('runners');
    if (storedRunners) {
      return Promise.resolve(JSON.parse(storedRunners));
    } else {
      return Promise.resolve([]);
    }
  }

  saveRunners(runners: Runner[]): Promise<void> {
    localStorage.setItem('runners', JSON.stringify(runners));
    return Promise.resolve();
  }
}
