import { Module } from '@nestjs/common';
import {TimingBoxController} from "./timing-box.controller";
import {TimingBoxGateway} from "./timing-box.gateway";
import {TimingBoxService} from "./timing-box.service";
import {TimingBoxEvents} from "./timing-box.events";

@Module({
  imports: [TimingBoxModule],
  controllers: [TimingBoxController],
  providers: [TimingBoxGateway, TimingBoxService, TimingBoxEvents],
})
export class TimingBoxModule {}
