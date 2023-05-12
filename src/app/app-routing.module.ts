import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { RunnerComponent } from './runner/runner.component';

const routes: Routes = [
  { path: 'settings', component: SettingsComponent },
  { path: 'announce', component: RunnerComponent },
  { path: '', redirectTo: '/announce', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
