import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {RunnerDataService} from "./services/runner-data.service";
import {Runner} from "./interfaces/runner";
import {DEFAULT_SETTINGS, SettingsService} from "./services/settings.service";
import {CustomField} from "./interfaces/custom-field";
import {formatTimeDuration} from "./time-utils";

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  reverseRunnerList: Runner[] = [];
  private settings = DEFAULT_SETTINGS;
  private runStartTime: Date | undefined;
  private customFields: CustomField[] = [];


  constructor(private runnerDataService: RunnerDataService, private settingsService: SettingsService) {

    this.runnerDataService.getActiveRunners().subscribe(runners => {
      this.reverseRunnerList = [...runners].reverse();
    });

    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
      if(settings.raceStartTime){
        this.runStartTime = new Date(settings.raceStartTime);
      } else {
        this.runStartTime = undefined
      }
      this.customFields = settings.customFields.filter(field => field.showInAnnounce)
    });
  }

  public runReport(reportName: string) {
    switch (reportName) {
      case "timer": {
        this.generateTimerReport();
        break;
      }
    }
  }

  private generateTimerReport() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Timer Report', 14, 22);

    const tableColumn = ['Time', 'Bib', 'First Name', 'Last Name', 'Age', 'Gender', ...this.settings.customFields.filter(field => field.showInAnnounce).map(field => field.name)];
    const tableRows = this.reverseRunnerList.map(runner => {
        const rowData = [
          formatTimeDuration(this.runStartTime, runner.timeEntered),
          runner.bib,
          runner.firstName,
          runner.lastName,
          runner.age,
          runner.gender
        ];

      this.customFields.forEach(field => {
        if (field.showInAnnounce) {
          rowData.push(runner.customFields[field.name] || '');
        }
      });

      return rowData;
    });

    (doc as any).autoTable({
      head: tableColumn,
      body: tableRows,
      startY: 30,
    });

    doc.save('timer-report.pdf');
  }
}
