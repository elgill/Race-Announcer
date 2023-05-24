import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import this
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

@NgModule({
  declarations: [
    AppComponent,
    AnnounceScreenComponent,
    SettingsComponent,
    BibEntryComponent,
    CsvImportComponent,
    BibScrapeUtilComponent,
    AnnounceGridComponent,
    ErrorComponent
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
