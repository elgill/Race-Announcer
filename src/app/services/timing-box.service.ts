import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {RunnerDataService} from "./runner-data.service";
import {ConnectionStatus} from "../models/connection.enum";
import {TridentTagReadData} from "../interfaces/trident-tag-read-data";
import {TagReadConversionService} from "./tag-read-conversion.service";
import {ChipRead} from "../interfaces/chip-read";

@Injectable({
  providedIn: 'root',
})
export class TimingBoxService {
  private ipcRenderer: any;
  private statusSubject: BehaviorSubject<any> = new BehaviorSubject({ status: ConnectionStatus.DISCONNECTED });
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

  private parseTagReadData(data: string): ChipRead | null {
    if (data.startsWith("aa")) {
      const read = this.parseTridentTagData(data);
      if (read) {
        return TagReadConversionService.convertTridentToChipRead(read);
      }
    } else if (data.includes(";")){

    }
    return null;
  }

  private parseTridentTagData(data: string): TridentTagReadData | null{
    if (data.length < 38) {
      console.warn('Invalid data format:', data);
      return null;
    }

    return {
      prefix: data.substring(0, 2),
      readerId: data.substring(2, 3),
      receiverId: data.substring(3, 4),
      tagId: data.substring(4, 16),
      counter: parseInt(data.substring(16, 20), 10),
      date: data.substring(20, 26),
      time: data.substring(26, 32),
      hundredths: data.substring(32, 34),
      padding: data.substring(34, 36),
      recordType: data.substring(36, 38)
    };
  }

  private handleData(data: string) {
    const parsedData = this.parseTagReadData(data);
    if (!parsedData) {
      return; // Ignore invalid data
    }
    console.log('Parsed Data: ', parsedData);

    // Example usage: Enter runner bib number from tagId
    const bibNumber = this.runnerDataService.getBibByChipId(parsedData.chipCode);
    if (bibNumber) {
      this.runnerDataService.enterBib(bibNumber, false);
    } else {
      console.warn('No bib number found for tag ID:', parsedData.chipCode);
    }
  }

  connect(ip: string, port: number): void {
    if(this.getCurrentStatus() === ConnectionStatus.CONNECTED || this.getCurrentStatus() === ConnectionStatus.CONNECTING){
      return;
    }
    this.statusSubject.next(ConnectionStatus.CONNECTING);
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
