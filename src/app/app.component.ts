import {Component, inject, OnInit} from '@angular/core';
import {ElectronService} from "./services/electron.service";
import {NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {VisualLoadTestService} from "./services/visual-load-test.service";
import {ReportingService} from "./reporting.service";
import {filter} from "rxjs";

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
  menuOpen = false;
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

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.closeMenu());
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
