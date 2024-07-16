import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'ws';
import { TimingBoxService } from './timing-box.service';
import { TimingBoxEvents } from './timing-box.events';

@WebSocketGateway()
export class TimingBoxGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private timingBoxService: TimingBoxService,
    private events: TimingBoxEvents
  ) {}

  afterInit() {
    this.events.on('status', (status: string, message?: string) => {
      this.broadcastStatus(status, message);
    });

    this.events.on('data', (data: string) => {
      this.broadcastData(data);
    });
  }

  @SubscribeMessage('connect-timing-box')
  handleConnectTimingBox(client: any, payload: { ip: string; port: number }): void {
    this.timingBoxService.connectToTimingBox(payload.ip, payload.port);
  }

  @SubscribeMessage('disconnect-timing-box')
  handleDisconnectTimingBox(): void {
    this.timingBoxService.disconnectTimingBox();
  }

  private broadcastStatus(status: string, message?: string): void {
    this.server.clients.forEach(client => {
      client.send(JSON.stringify({
        type: 'timing-box-status',
        data: { status, message }
      }));
    });
  }

  private broadcastData(data: string): void {
    this.server.clients.forEach(client => {
      client.send(JSON.stringify({
        type: 'timing-box-data',
        data
      }));
    });
  }
}

