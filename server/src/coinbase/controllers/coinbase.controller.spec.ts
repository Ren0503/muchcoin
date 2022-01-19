import { Test, TestingModule } from '@nestjs/testing';
import { CoinbaseController } from './coinbase.controller';

describe('CoinbaseController', () => {
  let controller: CoinbaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoinbaseController],
    }).compile();

    controller = module.get<CoinbaseController>(CoinbaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
