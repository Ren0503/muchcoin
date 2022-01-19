import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { TokenPayload } from 'auth/interfaces';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserResponse } from 'user/dtos';
import { UserService } from 'user/services';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private readonly usersService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.Authentication;
                },
            ]),
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: TokenPayload): Promise<UserResponse> {
        return this.usersService.getUserById(payload.userId);
      }
}