import {Component, Input} from '@angular/core';
import {Runner} from "../services/runner-data.service";

@Component({
  selector: 'app-runner-table',
  templateUrl: './runner-table.component.html',
  styleUrls: ['./runner-table.component.css']
})
export class RunnerTableComponent {
  @Input() runners: Runner[] = [];
}
