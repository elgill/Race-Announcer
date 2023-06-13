import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileDialogService {
  private ipcRenderer: any;

  constructor() {
    if (window.require) {
      try {
        this.ipcRenderer = window.require('electron').ipcRenderer;
      } catch (e) {
        console.log("Error constructing file dialog")
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }
  }

  async openFileDialog(): Promise<string | null> {
    return await this.ipcRenderer.invoke('open-file-dialog');
  }
}

