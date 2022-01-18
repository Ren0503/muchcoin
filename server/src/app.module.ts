import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CoinbaseModule } from './coinbase/coinbase.module';

@Module({
  imports: [AuthModule, UserModule, CoinbaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
