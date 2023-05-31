import {Runner} from "../services/runner-data.service";

export interface RunnerDatabase {
  loadRunners(): Promise<Runner[]>;
  saveRunners(runners: Runner[]): Promise<void>;
  getRunnersByName(firstName?: string, lastName?: string): Promise<Runner[]>;
  // ...other operations...
}
