import { Component } from '@angular/core';
import {FileUpdateService} from "../services/file-update.service";
import {TimerMatService} from "../services/timer-mat.service";

@Component({
  selector: 'app-connect-file-stream',
  templateUrl: './connect-file-stream.component.html',
  styleUrls: ['./connect-file-stream.component.css']
})
export class ConnectFileStreamComponent {
  filePath: string = '';

  constructor(private fileUpdateService: FileUpdateService , private timerMatService: TimerMatService) {}

  connect() {
    this.fileUpdateService.setFilePath(this.filePath);
  }
}
