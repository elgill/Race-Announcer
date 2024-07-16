import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TimingBoxGateway } from './timing-box/timing-box.gateway';
import { TimingBoxController } from './timing-box/timing-box.controller';
import { TimingBoxService } from './timing-box/timing-box.service';
import { TimingBoxEvents } from './timing-box/timing-box.events';

@Module({
  imports: [],
  controllers: [AppController, TimingBoxController],
  providers: [AppService, TimingBoxGateway, TimingBoxService, TimingBoxEvents],
})
export class AppModule {}
