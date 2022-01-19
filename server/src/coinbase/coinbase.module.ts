import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthModule } from 'auth/auth.module';
import { UserModule } from 'user/user.module';
import { CoinbaseController } from './controllers/coinbase.controller';
import { CoinbaseAuthService, CoinbaseService } from './services';

@Module({
  imports: [HttpModule, AuthModule, UserModule],
  controllers: [CoinbaseController],
  providers: [CoinbaseAuthService, CoinbaseService],
})
export class CoinbaseModule { }
