import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from 'auth/interfaces';
import { Response } from 'express';
import { UserResponse } from 'user/dtos';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) { }

    async login(user: UserResponse, response: Response): Promise<void> {
        const tokenPayload: TokenPayload = {
            userId: user._id,
        };

        const expires = new Date();
        expires.setSeconds(
            expires.getSeconds() + this.configService.get('JWT_EXPIRATION_TIME'),
        );

        const token = this.jwtService.sign(tokenPayload);

        response.cookie('Authentication', token, {
            httpOnly: true,
            expires,
        });
    }
}
