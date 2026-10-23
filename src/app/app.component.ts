import {Component, inject, NgZone, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ElectronService} from "./services/electron.service";
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {VisualLoadTestService} from "./services/visual-load-test.service";
import {ReportingService} from "./reporting.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, RouterLinkActive, RouterOutlet]
})

export class AppComponent implements OnInit {
  private electronService = inject(ElectronService);
  private router = inject(Router);
  private zone = inject(NgZone);
  private visualLoadTestService = inject(VisualLoadTestService);
  private reportingService = inject(ReportingService);

  title = 'Race Announcer';
  updateAvailable = false;
  updateDownloaded = false;
  updateDismissed = false;
  updateVersion = '';
  updatePercent = 0;

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
      this.zone.run(() => {
        this.updateAvailable = true;
        this.updateVersion = info?.version ?? '';
      });
    });
    this.electronService.on('update-progress', (event: any, progress: { percent: number }) => {
      this.zone.run(() => { this.updatePercent = Math.round(progress.percent); });
    });
    this.electronService.on('update-downloaded', (event: any, info?: { version?: string }) => {
      this.zone.run(() => {
        this.updateDownloaded = true;
        this.updateDismissed = false;
        this.updateVersion = info?.version ?? this.updateVersion;
      });
    });
  }

  installUpdate(): void {
    this.electronService.send('install-update');
  }

  dismissUpdate(): void {
    this.updateDismissed = true;
  }
}
