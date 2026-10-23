import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {FormsModule} from "@angular/forms";
import {RunnerDataService} from "../services/runner-data.service";
import {Runner} from "../interfaces/runner";
import {RunnerTableComponent} from "../runner-table/runner-table.component";
import {RunnerEditorComponent} from "../runner-editor/runner-editor.component";

@Component({
    selector: 'app-browse-runners',
    templateUrl: './browse-runners.component.html',
    styleUrls: ['./browse-runners.component.css'],
    standalone: true,
    imports: [FormsModule, RunnerTableComponent, RunnerEditorComponent]
})
export class BrowseRunnersComponent implements OnInit {
  private runnerDataService = inject(RunnerDataService);
  private destroyRef = inject(DestroyRef);

  runners: Runner[] = [];
  filteredRunners: Runner[] = [];
  filterText = '';

  // undefined = editor closed, null = adding a new runner
  editingRunner: Runner | null | undefined = undefined;
  statusMessage = '';

  ngOnInit() {
    // Refresh whenever the runner count changes (initial DB load, imports, adds, deletes)
    this.runnerDataService.getRunnerCount()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refresh());
  }

  applyFilter() {
    const terms = this.filterText.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) {
      this.filteredRunners = this.runners;
      return;
    }
    this.filteredRunners = this.runners.filter(runner => {
      const haystack = [runner.bib, runner.firstName, runner.lastName, runner.town, runner.state]
        .join(' ').toLowerCase();
      return terms.every(term => haystack.includes(term));
    });
  }

  addRunner() {
    this.editingRunner = null;
    this.statusMessage = '';
  }

  editRunner(runner: Runner) {
    this.editingRunner = runner;
    this.statusMessage = '';
  }

  onSaved(runner: Runner) {
    this.statusMessage = `Saved runner ${runner.bib}.`;
    this.closeEditor();
    this.refresh();
  }

  onDeleted(bib: string) {
    this.statusMessage = `Deleted runner ${bib}.`;
    this.closeEditor();
    this.refresh();
  }

  closeEditor() {
    this.editingRunner = undefined;
  }

  private refresh() {
    this.runners = this.runnerDataService.getSortedRunners();
    this.applyFilter();
  }
}
