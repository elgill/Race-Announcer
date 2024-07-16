import { Controller, Get, Post, Body } from '@nestjs/common';
import { TimingBoxService } from './timing-box.service';

@Controller('api/timing-box')
export class TimingBoxController {
  constructor(private timingBoxService: TimingBoxService) {}

  @Post('connect')
  connectTimingBox(@Body() body: { ip: string; port: number }) {
    return this.timingBoxService.connectToTimingBox(body.ip, body.port);
  }

  @Get('status')
  getTimingBoxStatus() {
    return this.timingBoxService.getStatus();
  }

  @Post('disconnect')
  disconnectTimingBox() {
    return this.timingBoxService.disconnectTimingBox();
  }
}
