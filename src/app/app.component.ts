import {Component, inject, OnInit, signal} from '@angular/core';
import {ElectronService} from "./services/electron.service";
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {VisualLoadTestService} from "./services/visual-load-test.service";
import {ReportingService} from "./reporting.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [RouterLink, RouterLinkActive, RouterOutlet]
})

export class AppComponent implements OnInit {
  private electronService = inject(ElectronService);
  private router = inject(Router);
  private visualLoadTestService = inject(VisualLoadTestService);
  private reportingService = inject(ReportingService);

  title = 'Race Announcer';
  // Signals because these are set from IPC callbacks, which run outside the Angular zone
  updateAvailable = signal(false);
  updateDownloaded = signal(false);
  updateDismissed = signal(false);
  updateVersion = signal('');
  updatePercent = signal(0);

  constructor() {
    (window as any).visualLoadTestService = this.visualLoadTestService;
  }

  ngOnInit(): void {
    this.electronService.on('menu-clicked', (event: any, route: string) => {
      this.router.navigateByUrl(route)
        .then(() => {
          console.log('Navigation has finished successfully!');
        })
        .catch(err => {
          console.error('Navigation failed!', err);
        });
    });
    this.electronService.on('report-menu-clicked', (event: any, report: string) => {
      this.reportingService.runReport(report);
    });
    this.electronService.on('update-available', (event: any, info?: { version?: string }) => {
      this.updateAvailable.set(true);
      this.updateVersion.set(info?.version ?? '');
    });
    this.electronService.on('update-progress', (event: any, progress: { percent: number }) => {
      this.updatePercent.set(Math.round(progress.percent));
    });
    this.electronService.on('update-downloaded', (event: any, info?: { version?: string }) => {
      this.updateDownloaded.set(true);
      this.updateDismissed.set(false);
      this.updateVersion.update(version => info?.version ?? version);
    });
  }

  installUpdate(): void {
    this.electronService.send('install-update');
  }

  dismissUpdate(): void {
    this.updateDismissed.set(true);
  }
}
