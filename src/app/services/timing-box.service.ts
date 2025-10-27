import { Injectable, inject } from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {RunnerDataService} from "./runner-data.service";
import {ConnectionStatus} from "../models/connection.enum";
import {TridentTagReadData} from "../interfaces/trident-tag-read-data";
import {TagReadConversionService} from "./tag-read-conversion.service";
import {ChipRead} from "../interfaces/chip-read";
import {DEFAULT_SETTINGS, SettingsService} from "./settings.service";
import {RaceResultTagReadData} from "../interfaces/race-result-tag-read-data";

@Injectable({
  providedIn: 'root',
})
export class TimingBoxService {
  private runnerDataService = inject(RunnerDataService);
  private settingsService = inject(SettingsService);

  private ipcRenderer: any;
  private statusSubject: BehaviorSubject<any> = new BehaviorSubject({ status: ConnectionStatus.DISCONNECTED });
  private dataSubject: Subject<any> = new Subject();

  private autoReconnectInterval: any;
  private reconnectAttempts = 0;
  private shouldReconnect = false;

  private reconnectionStatus$ = new BehaviorSubject<string>("")

  settings = DEFAULT_SETTINGS;


  constructor() {
    if (window.require) {

      try {
        this.ipcRenderer = window.require('electron').ipcRenderer;
        this.settingsService.getSettings().subscribe(settings => {
          this.settings = settings;
        });

        // Listen for status updates
        // @ts-ignore
        this.ipcRenderer.on('timing-box-status', (event, status) => {
          this.statusSubject.next(status);
          this.handleStatusChange(status.status);
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

  private handleStatusChange(status: string){
    if (status === ConnectionStatus.DISCONNECTED && this.shouldReconnect) {
      this.startAutoReconnect(this.settings.ip, this.settings.port);
    } else if (status === ConnectionStatus.CONNECTED){
      this.shouldReconnect = true;
      this.reconnectionStatus$.next("");
    }
  }

  private parseTagReadData(data: string): ChipRead | null {
    if (data.startsWith("aa")) {
      const read = this.parseTridentTagData(data);
      if (read) {
        return TagReadConversionService.convertTridentToChipRead(read);
      }
    } else if (data.startsWith("#P")){
      const read = this.parseRaceResultTagData(data);
      if (read) {
        return TagReadConversionService.convertRaceResultToChipRead(read);
      }
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

  private parseRaceResultTagData(data: string): RaceResultTagReadData | null {
    // Split the input data by semicolon
    const parts = data.trim().split(';');

    // Validate the length of the parts
    if (parts.length < 7) {
      console.warn('Invalid data format:', data);
      return null;
    }

    return {
      passingNumber: parseInt(parts[1], 10),
      tagId: parts[2],
      date: parts[3],
      time: parts[4],
      eventId: parts[5],
      numHits: parseInt(parts[6], 10),
      maxRssi: parts[7],
      internalData: parts[8] || '',
      isActive: parts[9] || '',
      channelId: parts[10] || '',
      loopId: parts[11] || '',
      loopOnly: parts[12] || '',
      wakeupCounter: parts[13] ? parseInt(parts[13], 10) : undefined,
      battery: parts[14] ? parseFloat(parts[14]) : undefined,
      temperature: parts[15] ? parseFloat(parts[15]) : undefined,
      internalActiveData: parts[16] || '',
      boxName: parts[17] || '',
      fileNumber: parts[18] || '',
      maxRssiAntenna: parts[19] || '',
      boxId: parts[20] || '',
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
      this.runnerDataService.enterBib(bibNumber, false, false);
    } else {
      console.warn('No bib number found for tag ID:', parsedData.chipCode);
    }
  }

  toggleConnection(ip: string, port: number): void {
    const currentStatus = this.getCurrentStatus().status;
    if (currentStatus === ConnectionStatus.CONNECTED || currentStatus === ConnectionStatus.CONNECTING ||
          currentStatus === ConnectionStatus.RECONNECTING) {
      this.disconnect();
    } else {
      this.connect(ip, port);
    }
  }

  connect(ip: string, port: number): void {
    const currentStatus: string = this.getCurrentStatus().status;

    if (currentStatus === ConnectionStatus.CONNECTED || currentStatus === ConnectionStatus.CONNECTING || currentStatus === ConnectionStatus.RECONNECTING) {
      console.warn("Ignoring request: Already connected or connecting..");
      return;
    }

    this.statusSubject.next({ status: ConnectionStatus.CONNECTING });
    this.ipcRenderer.send('connect-timing-box', { ip, port });

    // Start auto-reconnect
    //this.startAutoReconnect(ip, port);
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.ipcRenderer.send('disconnect-timing-box');
    this.stopAutoReconnect();
  }

  private startAutoReconnect(ip: string, port: number): void {
    console.log("Stop existing AutoReconnect");
    this.stopAutoReconnect(); // Clear any existing interval
    this.reconnectAttempts = 0;
    this.shouldReconnect = false; // This will be reset once it connects successfully

    this.reconnectionStatus$.next(`Reconnection Attempts: (0/${this.settings.numReconnectAttempts})`);

    this.autoReconnectInterval = setInterval(() => {
      if (this.getCurrentStatus().status === ConnectionStatus.DISCONNECTED) {
        if (this.reconnectAttempts < this.settings.numReconnectAttempts) {
          this.reconnectionStatus$.next(`Reconnection Attempts: (${this.reconnectAttempts + 1}/${this.settings.numReconnectAttempts})`);
          console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.settings.numReconnectAttempts})...`);
          this.statusSubject.next({ status: ConnectionStatus.RECONNECTING });
          this.ipcRenderer.send('connect-timing-box', { ip, port });
          this.reconnectAttempts++;
        } else {
          console.log('Max reconnect attempts reached. Stopping auto-reconnect.');
          this.stopAutoReconnect();
        }
      } else if (this.getCurrentStatus().status === ConnectionStatus.CONNECTED) {
        console.log("Connected.. Stopping Auto Reconnect");
        this.stopAutoReconnect();
      } else {
        console.log("Ignoring attempt at reconnect because not Connected or Disconnected");
      }
    }, this.settings.reconnectDelay);
  }

  private stopAutoReconnect(): void {
    if (this.autoReconnectInterval) {
      this.reconnectionStatus$.next("");
      console.log("Stopping Auto Reconnect");
      clearInterval(this.autoReconnectInterval);
      this.autoReconnectInterval = null;
    }
  }

  getCurrentStatus(): any {
    return this.statusSubject.value;
  }

  getStatus(): Observable<any> {
    return this.statusSubject.asObservable();
  }

  getCurrentReconnectStatus(){
    return this.reconnectionStatus$.value;
  }

  getReconnectStatus(){
    return this.reconnectionStatus$.asObservable();
  }

  getData(): Observable<any> {
    return this.dataSubject.asObservable();
  }
}
