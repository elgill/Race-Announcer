import { Component } from '@angular/core';
import {FileUpdateService} from "../services/file-update.service";
import {TimerMatService} from "../services/timer-mat.service";
import {FileDialogService} from "../services/file-dialog.service";

@Component({
  selector: 'app-connect-file-stream',
  templateUrl: './connect-file-stream.component.html',
  styleUrls: ['./connect-file-stream.component.css']
})
export class ConnectFileStreamComponent {
  filePath: string = '';

  constructor(private fileDialogService: FileDialogService, private fileUpdateService: FileUpdateService , private timerMatService: TimerMatService) {}

  async selectFile() {
    const filePath = await this.fileDialogService.openFileDialog();
    if (filePath) {
      this.filePath = filePath;
    }
  }

  connect() {
    this.fileUpdateService.setFilePath(this.filePath);
  }
}
