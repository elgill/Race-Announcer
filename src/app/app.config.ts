import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { AnnounceScreenComponent } from './announce/announce-screen.component';
import { BrowseRunnersComponent } from './browse-runners/browse-runners.component';
import { NameLookupComponent } from './name-lookup/name-lookup.component';
import { XrefManagerComponent } from './xref-manager/xref-manager.component';
import { TimerRunnerTableComponent } from './timer-runner-table/timer-runner-table.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { QuickSetupComponent } from './quick-setup/quick-setup.component';

const routes: Routes = [
  { path: 'settings', component: SettingsComponent },
  { path: 'importexport', component: ImportExportComponent },
  { path: 'announce', component: AnnounceScreenComponent },
  { path: 'browse', component: BrowseRunnersComponent},
  { path: 'lookup', component: NameLookupComponent},
  { path: 'xref', component: XrefManagerComponent},
  { path: 'timer', component: TimerRunnerTableComponent},
  { path: 'quick-setup', component: QuickSetupComponent},
  { path: '', redirectTo: '/announce', pathMatch: 'full' },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi())
  ]
};
