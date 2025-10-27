import {Component, OnInit} from '@angular/core';
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
  title = 'Race Announcer';
  isElectron = window.require;
  constructor(private electronService: ElectronService, private router: Router, private visualLoadTestService: VisualLoadTestService, private reportingService: ReportingService) {
    (window as any).visualLoadTestService = visualLoadTestService;
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
  }
}
