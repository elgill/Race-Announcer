import {Component, HostListener, inject, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {ElectronService} from "./services/electron.service";
import {NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {VisualLoadTestService} from "./services/visual-load-test.service";
import {ReportingService} from "./reporting.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [RouterLink, RouterLinkActive, RouterOutlet, NgIf, NgForOf]
})

export class AppComponent implements OnInit {
  private electronService = inject(ElectronService);
  private router = inject(Router);
  private visualLoadTestService = inject(VisualLoadTestService);
  private reportingService = inject(ReportingService);

  readonly navLinks = [
    {label: 'Quick Setup', route: '/quick-setup'},
    {label: 'Announce', route: '/announce'},
    {label: 'Browse', route: '/browse'},
    {label: 'Name Lookup', route: '/lookup'},
    {label: 'Timer View', route: '/timer'},
    {label: 'Bib History', route: '/bib-history'},
    {label: 'Settings', route: '/settings'},
    {label: 'Import/Export', route: '/importexport'},
    {label: 'XREF Manager', route: '/xref'},
  ] as const;

  isCompactMenuOpen = false;
  title = 'Race Announcer';
  constructor() {
    (window as any).visualLoadTestService = this.visualLoadTestService;
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isCompactMenuOpen = false;
      }
    });
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

  toggleCompactMenu(): void {
    this.isCompactMenuOpen = !this.isCompactMenuOpen;
  }

  closeCompactMenu(): void {
    this.isCompactMenuOpen = false;
  }

  @HostListener('window:resize')
  handleResize(): void {
    if (window.innerWidth >= 1100 && this.isCompactMenuOpen) {
      this.isCompactMenuOpen = false;
    }
  }
}
