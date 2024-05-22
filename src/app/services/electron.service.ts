import { IpcRenderer } from 'electron';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  private readonly ipc: IpcRenderer | undefined;
  isElectron = window.require;

  constructor() {
    if ((window as any).require) {
      try {
        this.ipc = (window as any).require('electron').ipcRenderer;
      } catch (e) {
        console.error('Could not require Electron\'s ipcRenderer: ', e);
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }
  }

  public on(channel: string, listener: any): void {
    if (!this.ipc) {
      return;
    }
    this.ipc.on(channel, listener);
  }
}
