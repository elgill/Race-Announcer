import { Test, TestingModule } from '@nestjs/testing';
import { TimingBoxGateway } from './timing-box.gateway';

describe('TimingBoxGateway', () => {
  let gateway: TimingBoxGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimingBoxGateway],
    }).compile();

    gateway = module.get<TimingBoxGateway>(TimingBoxGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
