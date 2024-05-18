import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {RunnerDataService} from "./runner-data.service";

@Injectable({
  providedIn: 'root',
})
export class TimingBoxService {
  private ipcRenderer: any;
  private statusSubject: BehaviorSubject<any> = new BehaviorSubject({ status: 'disconnected' });
  private dataSubject: Subject<any> = new Subject();

  private runnerDataService: RunnerDataService;

  constructor(runnerDataService: RunnerDataService) {
    this.runnerDataService = runnerDataService;
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
          console.log('New Data: ',data);
          this.handleData(data);
        });
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }
  }

  handleData(data: string){

    this.runnerDataService.enterBib("105");
  }

  connect(ip: string, port: number): void {
    this.ipcRenderer.send('connect-timing-box', { ip, port });
  }

  disconnect(): void {
    this.ipcRenderer.send('disconnect-timing-box');
  }

  getCurrentStatus(): any {
    return this.statusSubject.value;
  }

  getStatus(): Observable<any> {
    return this.statusSubject.asObservable();
  }

  getData(): Observable<any> {
    return this.dataSubject.asObservable();
  }
}
