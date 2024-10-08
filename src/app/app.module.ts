import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AnnounceScreenComponent } from './announce/announce-screen.component';
import { SettingsComponent } from './settings/settings.component';
import { AppRoutingModule } from './app-routing.module';
import { BibEntryComponent } from './bib-entry/bib-entry.component';
import { CsvImportComponent } from './csv-import/csv-import.component';
import { AnnounceGridComponent } from './announce/announce-grid/announce-grid.component';
import { ErrorComponent } from './error/error.component';
import { AnnounceFreeformComponent } from './announce/announce-freeform/announce-freeform.component';
import { CsvExportComponent } from './csv-export/csv-export.component';
import { BrowseRunnersComponent } from './browse-runners/browse-runners.component';
import { ClearRunnersComponent } from './clear-runners/clear-runners.component';
import { RaceClockComponent } from './race-clock/race-clock.component';
import { ConnectMatStreamComponent } from './connect-mat-stream/connect-mat-stream.component';
import { NameLookupComponent } from './name-lookup/name-lookup.component';
import { RunnerTableComponent } from './runner-table/runner-table.component';
import { AutoImportComponent } from './auto-import/auto-import.component';
import { AnnounceTimerComponent } from './announce/announce-timer/announce-timer.component';
import { TimeDurationPipe } from './time-duration.pipe';
import { ImportXrefComponent } from './import-xref/import-xref.component';
import { ShowXrefComponent } from './show-xref/show-xref.component';
import { TimerRunnerTableComponent } from './timer-runner-table/timer-runner-table.component';
import { XrefManagerComponent } from './xref-manager/xref-manager.component';
import { ImportExportComponent } from './import-export/import-export.component';
import {QuickSetupComponent} from "./quick-setup/quick-setup.component";
import {RunnerInfoComponent} from "./runner-info/runner-info.component";
import {QuickSettingsComponent} from "./quick-settings/quick-settings.component";

@NgModule({
  declarations: [
    AppComponent,
    AnnounceScreenComponent,
    SettingsComponent,
    BibEntryComponent,
    CsvImportComponent,
    AnnounceGridComponent,
    ErrorComponent,
    AnnounceFreeformComponent,
    CsvExportComponent,
    BrowseRunnersComponent,
    ClearRunnersComponent,
    RaceClockComponent,
    ConnectMatStreamComponent,
    NameLookupComponent,
    RunnerTableComponent,
    AutoImportComponent,
    AnnounceTimerComponent,
    TimeDurationPipe,
    ImportXrefComponent,
    ShowXrefComponent,
    TimerRunnerTableComponent,
    XrefManagerComponent,
    ImportExportComponent,
    QuickSetupComponent,
    RunnerInfoComponent,
    QuickSettingsComponent
  ],
  bootstrap: [AppComponent], imports: [BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule],
  exports: [
    AutoImportComponent
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class AppModule { }
