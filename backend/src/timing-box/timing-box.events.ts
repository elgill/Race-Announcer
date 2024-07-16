import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class TimingBoxEvents extends EventEmitter {
  constructor() {
    super();
  }
}
