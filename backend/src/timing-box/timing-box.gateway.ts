import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TimingBoxService } from './timing-box.service';
import { TimingBoxEvents } from './timing-box.events';

@WebSocketGateway({ cors: true })
export class TimingBoxGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

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

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('connect-timing-box')
  handleConnectTimingBox(client: Socket, payload: { ip: string; port: number }): void {
    this.timingBoxService.connectToTimingBox(payload.ip, payload.port);
  }

  @SubscribeMessage('disconnect-timing-box')
  handleDisconnectTimingBox(): void {
    this.timingBoxService.disconnectTimingBox();
  }

  private broadcastStatus(status: string, message?: string): void {
    this.server.emit('timing-box-status', { status, message });
  }

  private broadcastData(data: string): void {
    this.server.emit('timing-box-data', { data });
  }
}
