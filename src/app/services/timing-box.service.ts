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

  // Maps for tracking multiple mat connections
  private statusSubjects = new Map<string, BehaviorSubject<any>>();
  private dataSubjects = new Map<string, Subject<any>>();
  private autoReconnectIntervals = new Map<string, any>();
  private reconnectAttempts = new Map<string, number>();
  private shouldReconnect = new Map<string, boolean>();
  private reconnectionStatuses = new Map<string, BehaviorSubject<string>>();

  settings = DEFAULT_SETTINGS;


  constructor() {
    if (window.require) {

      try {
        this.ipcRenderer = window.require('electron').ipcRenderer;
        this.settingsService.getSettings().subscribe(settings => {
          this.settings = settings;
        });

        // Listen for status updates from all mats
        // @ts-ignore
        this.ipcRenderer.on('timing-box-status', (event, { matId, status, message }) => {
          const statusSubject = this.getOrCreateStatusSubject(matId);
          statusSubject.next({ status, message });
          this.handleStatusChange(matId, status);
          console.log(`Status for mat ${matId}:`, status);
        });

        // Listen for data updates from all mats
        // @ts-ignore
        this.ipcRenderer.on('timing-box-data', (event, { matId, data }) => {
          const dataSubject = this.getOrCreateDataSubject(matId);
          dataSubject.next(data);
          console.log(`Data from mat ${matId}:`, data);
          this.handleData(matId, data);
        });
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }
  }

  private getOrCreateStatusSubject(matId: string): BehaviorSubject<any> {
    if (!this.statusSubjects.has(matId)) {
      this.statusSubjects.set(matId, new BehaviorSubject({ status: ConnectionStatus.DISCONNECTED }));
    }
    return this.statusSubjects.get(matId)!;
  }

  private getOrCreateDataSubject(matId: string): Subject<any> {
    if (!this.dataSubjects.has(matId)) {
      this.dataSubjects.set(matId, new Subject());
    }
    return this.dataSubjects.get(matId)!;
  }

  private getOrCreateReconnectionStatus(matId: string): BehaviorSubject<string> {
    if (!this.reconnectionStatuses.has(matId)) {
      this.reconnectionStatuses.set(matId, new BehaviorSubject<string>(""));
    }
    return this.reconnectionStatuses.get(matId)!;
  }

  private handleStatusChange(matId: string, status: string){
    const isMatEnabled = this.settings.matConnections.some(mat => mat.id === matId && mat.enabled);
    const shouldReconnectFlag = this.shouldReconnect.has(matId) ? this.shouldReconnect.get(matId)! : true;
    const hasActiveInterval = this.autoReconnectIntervals.has(matId);
    const statusSubject = this.getOrCreateStatusSubject(matId);
    const reconnectionStatus = this.getOrCreateReconnectionStatus(matId);

    if (status === ConnectionStatus.DISCONNECTED || status === ConnectionStatus.ERROR) {
      if (isMatEnabled && shouldReconnectFlag) {
        if (!hasActiveInterval) {
          const matConnection = this.settings.matConnections.find(m => m.id === matId && m.enabled);
          if (matConnection) {
            this.startAutoReconnect(matId, matConnection.ip, matConnection.port, matConnection.label);
          }
        } else {
          const attempts = this.reconnectAttempts.get(matId) || 0;
          const message = reconnectionStatus.value || this.formatReconnectMessage(attempts, this.settings.numReconnectAttempts);
          statusSubject.next({ status: ConnectionStatus.RECONNECTING, message });
        }
      } else {
        this.stopAutoReconnect(matId);
      }
    } else if (status === ConnectionStatus.CONNECTED){
      if (isMatEnabled) {
        this.shouldReconnect.set(matId, true);
      } else {
        this.shouldReconnect.set(matId, false);
        this.stopAutoReconnect(matId);
      }
      const reconnectionStatus = this.getOrCreateReconnectionStatus(matId);
      reconnectionStatus.next("");
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


  private handleData(matId: string, data: string) {
    const parsedData = this.parseTagReadData(data);
    if (!parsedData) {
      return; // Ignore invalid data
    }

    // Add matId to the parsed data
    parsedData.matId = matId;
    console.log('Parsed Data: ', parsedData);

    // Example usage: Enter runner bib number from tagId
    const bibNumber = this.runnerDataService.getBibByChipId(parsedData.chipCode);
    if (bibNumber) {
      this.runnerDataService.enterBib(bibNumber, false, false, 'automated', matId);
    } else {
      console.warn('No bib number found for tag ID:', parsedData.chipCode);
    }
  }

  toggleConnection(matId: string, ip: string, port: number, label: string): void {
    const currentStatus = this.getCurrentStatus(matId).status;
    if (currentStatus === ConnectionStatus.CONNECTED || currentStatus === ConnectionStatus.CONNECTING ||
          currentStatus === ConnectionStatus.RECONNECTING) {
      this.disconnect(matId);
    } else {
      this.connect(matId, ip, port, label);
    }
  }

  connect(matId: string, ip: string, port: number, label: string): void {
    const currentStatus: string = this.getCurrentStatus(matId).status;

    if (currentStatus === ConnectionStatus.CONNECTED || currentStatus === ConnectionStatus.CONNECTING || currentStatus === ConnectionStatus.RECONNECTING) {
      console.warn(`Mat ${matId}: Ignoring request - already connected or connecting`);
      return;
    }

    const statusSubject = this.getOrCreateStatusSubject(matId);
    statusSubject.next({ status: ConnectionStatus.CONNECTING });
    this.ipcRenderer.send('connect-timing-box', { matId, ip, port, label });
  }

  disconnect(matId: string): void {
    this.shouldReconnect.set(matId, false);
    this.ipcRenderer.send('disconnect-timing-box', { matId });
    this.stopAutoReconnect(matId);
  }

  disconnectAll(): void {
    this.statusSubjects.forEach((_, matId) => {
      this.shouldReconnect.set(matId, false);
      this.stopAutoReconnect(matId);
    });
    this.ipcRenderer.send('disconnect-all-timing-boxes');
  }

  private startAutoReconnect(matId: string, ip: string, port: number, label: string): void {
    console.log(`Mat ${matId}: Starting auto-reconnect`);
    this.stopAutoReconnect(matId); // Clear any existing interval
    this.reconnectAttempts.set(matId, 0);
    this.shouldReconnect.set(matId, true);

    const totalAttempts = this.settings.numReconnectAttempts;
    const reconnectionStatus = this.getOrCreateReconnectionStatus(matId);
    const statusSubject = this.getOrCreateStatusSubject(matId);
    const initialMessage = this.formatReconnectMessage(0, totalAttempts);
    reconnectionStatus.next(initialMessage);
    statusSubject.next({ status: ConnectionStatus.RECONNECTING, message: initialMessage });

    const interval = setInterval(() => {
      const currentStatus = this.getCurrentStatus(matId).status;
      const attempts = this.reconnectAttempts.get(matId) || 0;

      if (currentStatus === ConnectionStatus.DISCONNECTED || currentStatus === ConnectionStatus.RECONNECTING || currentStatus === ConnectionStatus.ERROR) {
        if (attempts < this.settings.numReconnectAttempts) {
          const nextAttempt = attempts + 1;
          const attemptMessage = this.formatReconnectMessage(nextAttempt, totalAttempts);
          reconnectionStatus.next(attemptMessage);
          console.log(`Mat ${matId}: Attempting to reconnect (${nextAttempt}/${totalAttempts})...`);
          statusSubject.next({ status: ConnectionStatus.RECONNECTING, message: attemptMessage });
          this.ipcRenderer.send('connect-timing-box', { matId, ip, port, label });
          this.reconnectAttempts.set(matId, nextAttempt);
        } else {
          console.log(`Mat ${matId}: Max reconnect attempts reached. Stopping auto-reconnect.`);
          this.shouldReconnect.set(matId, false);
          statusSubject.next({ status: ConnectionStatus.DISCONNECTED });
          this.stopAutoReconnect(matId);
        }
      } else if (currentStatus === ConnectionStatus.CONNECTED) {
        console.log(`Mat ${matId}: Connected - stopping auto reconnect`);
        this.stopAutoReconnect(matId);
      }
    }, this.settings.reconnectDelay);

    this.autoReconnectIntervals.set(matId, interval);
  }

  private stopAutoReconnect(matId: string): void {
    const interval = this.autoReconnectIntervals.get(matId);
    if (interval) {
      const reconnectionStatus = this.getOrCreateReconnectionStatus(matId);
      reconnectionStatus.next("");
      console.log(`Mat ${matId}: Stopping auto reconnect`);
      clearInterval(interval);
      this.autoReconnectIntervals.delete(matId);
    }
  }

  getCurrentStatus(matId: string): any {
    const statusSubject = this.statusSubjects.get(matId);
    return statusSubject ? statusSubject.value : { status: ConnectionStatus.DISCONNECTED };
  }

  getStatus(matId: string): Observable<any> {
    return this.getOrCreateStatusSubject(matId).asObservable();
  }

  getCurrentReconnectStatus(matId: string): string {
    const reconnectionStatus = this.reconnectionStatuses.get(matId);
    return reconnectionStatus ? reconnectionStatus.value : "";
  }

  getReconnectStatus(matId: string): Observable<string> {
    return this.getOrCreateReconnectionStatus(matId).asObservable();
  }

  getData(matId: string): Observable<any> {
    return this.getOrCreateDataSubject(matId).asObservable();
  }

  // Helper method to get all mat IDs that have been initialized
  getAllMatIds(): string[] {
    return Array.from(this.statusSubjects.keys());
  }

  // Helper method to get status of all mats
  getAllStatuses(): Map<string, any> {
    const statuses = new Map<string, any>();
    this.statusSubjects.forEach((subject, matId) => {
      statuses.set(matId, subject.value);
    });
    return statuses;
  }

  private formatReconnectMessage(attempt: number, totalAttempts: number): string {
    if (!totalAttempts || totalAttempts <= 0) {
      return 'Reconnecting';
    }
    const safeAttempt = Math.min(Math.max(attempt, 0), totalAttempts);
    return `Reconnecting (${safeAttempt}/${totalAttempts})`;
  }
}
