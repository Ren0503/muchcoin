import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'user/user.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService, EncryptionService } from './services';
import { JwtStrategy, LocalStrategy } from './strategies';

@Module({
    imports: [
        UserModule,
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, EncryptionService, JwtStrategy],
    exports: [EncryptionService],
})
export class AuthModule { }
