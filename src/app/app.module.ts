import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms'; // Import this
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AnnounceScreenComponent } from './announce/announce-screen.component';
import { SettingsComponent } from './settings/settings.component';
import { AppRoutingModule } from './app-routing.module';
import { BibEntryComponent } from './bib-entry/bib-entry.component';
import { CsvImportComponent } from './csv-import/csv-import.component';
import { BibScrapeUtilComponent } from './bib-scrape-util/bib-scrape-util.component';
import { AnnounceGridComponent } from './announce/announce-grid/announce-grid.component';
import { ErrorComponent } from './error/error.component';
import { AnnounceFreeformComponent } from './announce/announce-freeform/announce-freeform.component';
import { CsvExportComponent } from './csv-export/csv-export.component';
import { BrowseRunnersComponent } from './browse-runners/browse-runners.component';
import { ClearRunnersComponent } from './clear-runners/clear-runners.component';
import { RaceClockComponent } from './race-clock/race-clock.component';
import { ConnectFileStreamComponent } from './connect-file-stream/connect-file-stream.component';
import { NameLookupComponent } from './name-lookup/name-lookup.component';

@NgModule({
  declarations: [
    AppComponent,
    AnnounceScreenComponent,
    SettingsComponent,
    BibEntryComponent,
    CsvImportComponent,
    BibScrapeUtilComponent,
    AnnounceGridComponent,
    ErrorComponent,
    AnnounceFreeformComponent,
    CsvExportComponent,
    BrowseRunnersComponent,
    ClearRunnersComponent,
    RaceClockComponent,
    ConnectFileStreamComponent,
    NameLookupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
