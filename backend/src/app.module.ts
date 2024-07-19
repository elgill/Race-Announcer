import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TimingBoxModule } from './timing-box/timing-box.module';

@Module({
  imports: [TimingBoxModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
