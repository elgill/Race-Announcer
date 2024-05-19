import {Runner} from "../interfaces/runner";

export interface RunnerDatabase {
  loadRunners(): Promise<Runner[]>;
  saveRunners(runners: Runner[]): Promise<void>;
  getRunnersByName(firstName?: string, lastName?: string): Promise<Runner[]>;
  deleteAllRunners(): Promise<void>;
  loadXrefData(): Promise<{ bib: string, chipId: string }[]>;
  saveXrefData(xrefArray: { bib: string, chipId: string }[]): Promise<void>
}
