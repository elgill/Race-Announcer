import { Component } from '@angular/core';
import { QuickSettingsComponent } from '../quick-settings/quick-settings.component';
import { RunnerInfoComponent } from '../runner-info/runner-info.component';
import { AutoImportComponent } from '../auto-import/auto-import.component';
import { ClearRunnersComponent } from '../clear-runners/clear-runners.component';

@Component({
    selector: 'app-quick-setup',
    templateUrl: './quick-setup.component.html',
    styleUrls: ['./quick-setup.component.css'],
    standalone: true,
    imports: [QuickSettingsComponent, RunnerInfoComponent, AutoImportComponent, ClearRunnersComponent]
})
export class QuickSetupComponent {}
