import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from 'auth/services';
import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { UserResponse } from 'user/dtos';
import { CoinbaseAuth } from 'user/models';
import { UserService } from 'user/services';

@Injectable()
export class CoinbaseAuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly userService: UserService,
        private readonly encryptionService: EncryptionService,
    ) { }

    public authorize(res: Response): void {
        res.redirect(this.buildAuthorizeUrl().href);
        return;
    }

    private buildAuthorizeUrl() {
        const authorizeUrl = new URL('https://coinbase.com/oauth/authorize');
        authorizeUrl.searchParams.append('response_type', 'code');
        authorizeUrl.searchParams.append(
            'client_id',
            this.configService.get('COINBASE_CLIENT_ID'),
        );
        authorizeUrl.searchParams.append(
            'redirect_uri',
            this.configService.get('COINBASE_REDIRECT_URI'),
        );
        authorizeUrl.searchParams.append(
            'scope',
            'wallet:transactions:read,wallet:accounts:read',
        );
        return authorizeUrl;
    }

    public handleCallback(req: Request, res: Response): void {
        const { code } = req.query;
        const { user } = req;
        this.getTokensFromCode(code as string).subscribe(async tokensResponse => {
            await this.updateUserCoinbaseAuth(
                tokensResponse.data,
                ((user as unknown) as UserResponse)._id,
            );
            res.redirect(this.configService.get('AUTH_REDIRECT_URI'));
        });
    }

    private getTokensFromCode(code: string) {
        return this.httpService.post('https://api.coinbase.com/oauth/token', {
            grant_type: 'authorization_code',
            code,
            client_id: this.configService.get('COINBASE_CLIENT_ID'),
            client_secret: this.configService.get('COINBASE_CLIENT_SECRET'),
            redirect_uri: this.configService.get('COINBASE_REDIRECT_URI'),
        });
    }

    private async updateUserCoinbaseAuth(tokenPayload: any, userId: string) {
        const {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: expiresIn,
        } = tokenPayload;
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + expiresIn);
        await this.userService.updateUser(userId, {
            coinbaseAuth: {
                accessToken: this.encryptionService.encrypt(accessToken),
                refreshToken: this.encryptionService.encrypt(refreshToken),
                expires,
            },
        });
    }

    async getAccessToken(userId: string): Promise<string> {
        const coinbaseAuth = await this.userService.getCoinbaseAuth(userId);
        if (new Date().getTime() >= coinbaseAuth.expires.getTime()) {
            const response$ = this.refreshAccessToken(coinbaseAuth);
            const response = await lastValueFrom(response$);
            await this.updateUserCoinbaseAuth(response.data, userId);
            return response.data.access_token;
        }
        return this.encryptionService.decrypt(coinbaseAuth.accessToken);
    }

    private refreshAccessToken(coinbaseAuth: CoinbaseAuth) {
        return this.httpService.post('https://www.coinbase.com/oauth/token', {
            grant_type: 'refresh_token',
            refresh_token: this.encryptionService.decrypt(coinbaseAuth.refreshToken),
            client_id: this.configService.get('COINBASE_CLIENT_ID'),
            client_secret: this.configService.get('COINBASE_CLIENT_SECRET'),
        });
    }
}