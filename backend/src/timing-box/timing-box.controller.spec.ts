import { Test, TestingModule } from '@nestjs/testing';
import { TimingBoxController } from './timing-box.controller';

describe('TimingBoxController', () => {
  let controller: TimingBoxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimingBoxController],
    }).compile();

    controller = module.get<TimingBoxController>(TimingBoxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
