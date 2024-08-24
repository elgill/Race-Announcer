import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { AnnounceScreenComponent } from './announce/announce-screen.component';
import {BrowseRunnersComponent} from "./browse-runners/browse-runners.component";
import {NameLookupComponent} from "./name-lookup/name-lookup.component";
import {TimerRunnerTableComponent} from "./timer-runner-table/timer-runner-table.component";
import {XrefManagerComponent} from "./xref-manager/xref-manager.component";
import {ImportExportComponent} from "./import-export/import-export.component";
import {QuickSetupComponent} from "./quick-setup/quick-setup.component";

const routes: Routes = [
  { path: 'settings', component: SettingsComponent },
  { path: 'importexport', component: ImportExportComponent },
  { path: 'announce', component: AnnounceScreenComponent },
  { path: 'browse', component: BrowseRunnersComponent},
  { path: 'lookup', component: NameLookupComponent},
  { path: 'xref', component: XrefManagerComponent},
  { path: 'timer', component: TimerRunnerTableComponent},
  { path: 'quick-setup', component:QuickSetupComponent},
  { path: '', redirectTo: '/announce', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
