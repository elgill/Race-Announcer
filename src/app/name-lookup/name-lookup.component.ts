import { Component, inject, signal } from '@angular/core';
import {RunnerDataService} from "../services/runner-data.service";
import {Runner} from "../interfaces/runner";
import {RunnerTableComponent} from "../runner-table/runner-table.component";

@Component({
    selector: 'app-name-lookup',
    templateUrl: './name-lookup.component.html',
    styleUrls: ['./name-lookup.component.css'],
    standalone: true,
    imports: [RunnerTableComponent]
})
export class NameLookupComponent {
  private runnerDataService = inject(RunnerDataService);

  runners = signal<Runner[]>([]);

  async searchRunners(firstName?: string, lastName?: string) {
    this.runners.set(await this.runnerDataService.getRunnersByName(firstName, lastName));
  }
}

