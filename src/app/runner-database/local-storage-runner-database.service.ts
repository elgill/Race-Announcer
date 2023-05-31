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

  getRunnersByName(firstName?: string, lastName?: string): Promise<Runner[]> {
    const storedRunners = localStorage.getItem('runners');
    if (storedRunners) {
      const allRunners: Runner[] = JSON.parse(storedRunners);
      const lcFirstName = firstName?.toLowerCase();
      const lcLastName = lastName?.toLowerCase();
      return Promise.resolve(allRunners.filter(runner => {
        if (lcFirstName && runner.firstName.toLowerCase() !== lcFirstName) {
          return false;
        }
        if (lcLastName && runner.lastName.toLowerCase() !== lcLastName) {
          return false;
        }
        return true;
      }));
    } else {
      return Promise.resolve([]);
    }
  }

}
