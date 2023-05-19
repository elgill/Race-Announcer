import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import this
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { RunnerComponent } from './runner/runner.component';
import { SettingsComponent } from './settings/settings.component';
import { AppRoutingModule } from './app-routing.module';
import { BibEntryComponent } from './bib-entry/bib-entry.component';
import { CsvImportComponent } from './csv-import/csv-import.component';
import { BibScrapeUtilComponent } from './bib-scrape-util/bib-scrape-util.component';

@NgModule({
  declarations: [
    AppComponent,
    RunnerComponent,
    SettingsComponent,
    BibEntryComponent,
    CsvImportComponent,
    BibScrapeUtilComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
