import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { AnnounceScreenComponent } from './announce/announce-screen.component';
import {CsvImportComponent} from "./csv-import/csv-import.component";
import {BibScrapeUtilComponent} from "./bib-scrape-util/bib-scrape-util.component";
import {BrowseRunnersComponent} from "./browse-runners/browse-runners.component";
import {ConnectFileStreamComponent} from "./connect-file-stream/connect-file-stream.component";
import {NameLookupComponent} from "./name-lookup/name-lookup.component";

const routes: Routes = [
  { path: 'settings', component: SettingsComponent },
  { path: 'import', component: CsvImportComponent },
  { path: 'announce', component: AnnounceScreenComponent },
  { path: 'bibscrape', component: BibScrapeUtilComponent },
  { path: 'browse', component: BrowseRunnersComponent},
  { path: 'lookup', component: NameLookupComponent},
  { path: 'connectfs', component: ConnectFileStreamComponent},
  { path: '', redirectTo: '/announce', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
