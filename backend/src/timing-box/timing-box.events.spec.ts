import { Test, TestingModule } from '@nestjs/testing';
import { TimingBoxEvents } from './timing-box.events';

describe('TimingBoxEvents', () => {
  let provider: TimingBoxEvents;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimingBoxEvents],
    }).compile();

    provider = module.get<TimingBoxEvents>(TimingBoxEvents);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
