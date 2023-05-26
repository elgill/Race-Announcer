import { Component } from '@angular/core';
import {FileUpdateService} from "../services/file-update.service";

@Component({
  selector: 'app-connect-file-stream',
  templateUrl: './connect-file-stream.component.html',
  styleUrls: ['./connect-file-stream.component.css']
})
export class ConnectFileStreamComponent {
  filePath: string = '';

  constructor(private fileUpdateService: FileUpdateService) {}

  connect() {
    this.fileUpdateService.setFilePath(this.filePath);
  }
}
