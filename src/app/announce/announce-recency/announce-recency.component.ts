import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { AnnounceBaseComponent } from "../announce-base.component";
import { CommonModule } from '@angular/common';
import { Runner } from "../../interfaces/runner";

interface RunnerWithRecency extends Runner {
  secondsSinceEntry: number;
  color: string;
  opacity: number;
}

@Component({
  selector: 'app-announce-recency',
  templateUrl: './announce-recency.component.html',
  styleUrls: ['./announce-recency.component.css'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnounceRecencyComponent extends AnnounceBaseComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);

  recencyRunners: RunnerWithRecency[] = [];
  private updateInterval: any;

  override ngOnInit(): void {
    super.ngOnInit();

    // Update display every 100ms for smooth transitions
    this.updateInterval = setInterval(() => {
      this.updateRecencyData();
      this.cdr.markForCheck();
    }, 100);
  }

  override ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private updateRecencyData(): void {
    const now = new Date().getTime();

    // Show all runners, but only apply color/opacity to time badge for first 10 seconds
    this.recencyRunners = this.runnerList.map(runner => {
      if (!runner.timeEntered) {
        return {
          ...runner,
          secondsSinceEntry: 0,
          color: 'transparent',
          opacity: 0
        };
      }

      const elapsed = (now - runner.timeEntered.getTime()) / 1000;
      const { color, opacity } = this.calculateStyle(elapsed);

      return {
        ...runner,
        secondsSinceEntry: elapsed,
        color,
        opacity
      };
    });
  }

  private calculateStyle(seconds: number): { color: string; opacity: number } {
    if (seconds < 3) {
      // 0-3s: Transition from dark green to dark orange
      const ratio = seconds / 3;
      const r = Math.round(34 + (204 * ratio)); // 34 to 238
      const g = Math.round(139 - (30 * ratio)); // 139 to 109
      const b = 34;
      return {
        color: `rgb(${r}, ${g}, ${b})`,
        opacity: 1
      };
    } else if (seconds < 7) {
      // 3-7s: Stay dark orange
      return {
        color: 'rgb(238, 109, 34)',
        opacity: 1
      };
    } else {
      // 7-10s: Fade from dark orange to transparent
      const fadeRatio = (10 - seconds) / 3;
      return {
        color: 'rgb(238, 109, 34)',
        opacity: Math.max(0, fadeRatio)
      };
    }
  }

  trackByBib(index: number, runner: RunnerWithRecency): string {
    // Use combination of bib and timeEntered to create unique key for duplicate bibs
    return `${runner.bib}-${runner.timeEntered?.getTime() || index}`;
  }
}
