import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import this

import { AppComponent } from './app.component';
import { RunnerComponent } from './runner/runner.component';
import { SettingsComponent } from './settings/settings.component';
import { AppRoutingModule } from './app-routing.module';
import { BibEntryComponent } from './bib-entry/bib-entry.component';
import { CsvImportComponent } from './csv-import/csv-import.component';

@NgModule({
  declarations: [
    AppComponent,
    RunnerComponent,
    SettingsComponent,
    BibEntryComponent,
    CsvImportComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
