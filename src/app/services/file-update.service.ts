import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUpdateService {
  private ipcRenderer: any;

  constructor() {
    if (window.require) {
      try {
        this.ipcRenderer = window.require('electron').ipcRenderer;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }
  }

  setFilePath(filePath: string): void {
    this.ipcRenderer.send('set-file-path', filePath);
    console.log('Listening on file path: ',filePath)
  }

  getUpdates(): Observable<any> {
    if (!window.require) {
      console.warn('Returning Fake FS observable since not running in electron')
      return new Observable<any>();
    }
    console.log('returning observable')
    return new Observable((observer) => {
      this.ipcRenderer.on('file-updated', (event: any, data: any) => {
        console.log("Updated File message recieved")
        observer.next(data);
        console.log("Updated File message")
      });
    });
  }
}
