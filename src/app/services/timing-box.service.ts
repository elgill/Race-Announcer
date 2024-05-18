import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimingBoxService {
  private ipcRenderer: any;
  private statusSubject: Subject<any> = new Subject();
  private dataSubject: Subject<any> = new Subject();

  constructor() {
    if (window.require) {
      try {
        this.ipcRenderer = window.require('electron').ipcRenderer;

        // Listen for status updates
        // @ts-ignore
        this.ipcRenderer.on('timing-box-status', (event, status) => {
          this.statusSubject.next(status);
          console.log('New Status: ', status)
        });

        // Listen for data updates
        // @ts-ignore
        this.ipcRenderer.on('timing-box-data', (event, data) => {
          this.dataSubject.next(data);
          console.log('New Data: ',data)
        });
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }
  }

  connect(ip: string, port: number): void {
    this.ipcRenderer.send('connect-timing-box', { ip, port });
  }

  disconnect(): void {
    this.ipcRenderer.send('disconnect-timing-box');
  }

  getStatus(): Observable<any> {
    return this.statusSubject.asObservable();
  }

  getData(): Observable<any> {
    return this.dataSubject.asObservable();
  }
}

/*export class TimingBoxService {
  private ipcRenderer: any;
  private statusSubject: Subject<any> = new Subject();
  private dataSubject: Subject<any> = new Subject();

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
}*/
