import { IpcRenderer } from 'electron';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  private readonly ipc: IpcRenderer | undefined;
  isElectron = !!(window.require);

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

  public send(channel: string, ...args: any[]): void {
    if (!this.ipc) {
      return;
    }
    this.ipc.send(channel, ...args);
  }

  public invoke<T>(channel: string, ...args: any[]): Promise<T> {
    if (!this.ipc) {
      return Promise.reject(new Error('App not running inside Electron'));
    }
    return this.ipc.invoke(channel, ...args);
  }

  // Fetches via the Electron main process to avoid CORS; falls back to a direct fetch outside Electron.
  public async fetchText(url: string): Promise<string> {
    if (this.ipc) {
      return this.invoke<string>('http-get-text', url);
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${url}`);
    }
    return response.text();
  }
}
