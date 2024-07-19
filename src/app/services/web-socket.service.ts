import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private messagesSubject = new Subject<any>();
  private timingBoxStatusSubject = new Subject<any>();

  public messages$ = this.messagesSubject.asObservable();
  public timingBoxStatus$ = this.timingBoxStatusSubject.asObservable();

  constructor(private socket: Socket) {
    this.socket.on('timing-box-status', (data: any) => {
      this.timingBoxStatusSubject.next(data);
    });

    this.socket.on('timing-box-data', (data: any) => {
      this.messagesSubject.next(data);
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
    });
  }

  sendMessage(event: string, message: any): void {
    this.socket.emit(event, message);
  }

  close(): void {
    this.socket.disconnect();
  }
}
