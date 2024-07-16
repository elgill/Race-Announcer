import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;
  private messagesSubject = new Subject<any>();
  private timingBoxStatusSubject = new Subject<any>();

  public messages$ = this.messagesSubject.asObservable();
  public timingBoxStatus$ = this.timingBoxStatusSubject.asObservable();

  constructor() {
    this.socket$ = webSocket(environment.webSocketUrl);
    this.socket$.subscribe(
      (message) => this.handleMessage(message),
      (error) => console.error('WebSocket error:', error),
      () => console.log('WebSocket connection closed')
    );
  }

  private handleMessage(message: any): void {
    if (message.type === 'timing-box-status') {
      this.timingBoxStatusSubject.next(message.data);
    } else {
      this.messagesSubject.next(message);
    }
  }

  sendMessage(message: any): void {
    this.socket$.next(message);
  }

  close(): void {
    this.socket$.complete();
  }
}
