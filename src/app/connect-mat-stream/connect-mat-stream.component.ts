import { Component } from '@angular/core';
import {FileUpdateService} from "../services/file-update.service";
import {FileDialogService} from "../services/file-dialog.service";

@Component({
  selector: 'app-connect-mat-stream',
  templateUrl: './connect-mat-stream.component.html',
  styleUrls: ['./connect-mat-stream.component.css']
})
export class ConnectMatStreamComponent {
  filePath: string = '';

  constructor(private fileDialogService: FileDialogService, private fileUpdateService: FileUpdateService) {}

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
