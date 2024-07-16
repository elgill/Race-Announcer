import { Test, TestingModule } from '@nestjs/testing';
import { TimingBoxService } from './timing-box.service';

describe('TimingBoxService', () => {
  let service: TimingBoxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimingBoxService],
    }).compile();

    service = module.get<TimingBoxService>(TimingBoxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
