import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { RunnerComponent } from './runner/runner.component';
import {CsvImportComponent} from "./csv-import/csv-import.component";
import {BibScrapeUtilComponent} from "./bib-scrape-util/bib-scrape-util.component";

const routes: Routes = [
  { path: 'settings', component: SettingsComponent },
  { path: 'import', component: CsvImportComponent },
  { path: 'announce', component: RunnerComponent },
  { path: 'bibscrape', component: BibScrapeUtilComponent },
  { path: '', redirectTo: '/announce', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
