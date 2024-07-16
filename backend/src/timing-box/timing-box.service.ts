import { Injectable } from '@nestjs/common';
import * as net from 'net';
import { TimingBoxEvents } from './timing-box.events';

@Injectable()
export class TimingBoxService {
  private timingBoxClient: net.Socket;
  private status: string = 'Disconnected';

  constructor(private events: TimingBoxEvents) {}

  connectToTimingBox(ip: string, port: number): void {
    this.timingBoxClient = new net.Socket();

    this.timingBoxClient.connect(port, ip, () => {
      console.log('Connected to timing box');
      this.status = 'Connected';
      this.events.emit('status', this.status);

      if (port === 3601) {
        this.timingBoxClient.write('SETPROTOCOL;2.6\r\n');
        this.timingBoxClient.write('SETPUSHPASSINGS;1;0\r\n');
      }
    });

    this.timingBoxClient.on('data', (data) => {
      const records = data.toString('utf-8').split('\r\n');
      records.forEach(record => {
        if (record.trim() !== '') {
          console.log('Data: ', record);
          this.events.emit('data', record);
        }
      });
    });

    this.timingBoxClient.on('close', () => {
      console.log('Connection to timing box closed');
      this.status = 'Disconnected';
      this.events.emit('status', this.status);
    });

    this.timingBoxClient.on('error', (err) => {
      console.error('Error connecting to timing box:', err);
      this.status = 'Error';
      this.events.emit('status', this.status, err.message);
    });
  }

  disconnectTimingBox(): void {
    if (this.timingBoxClient) {
      this.timingBoxClient.destroy();
      this.timingBoxClient = null;
      this.status = 'Disconnected';
      this.events.emit('status', this.status);
    }
  }

  getStatus(): string {
    return this.status;
  }
}
