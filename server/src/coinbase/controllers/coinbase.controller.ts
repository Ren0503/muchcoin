import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'auth/decorators';
import { JwtAuthGuard } from 'auth/guards';
import { CoinbaseAuthService, CoinbaseService } from 'coinbase/services';
import { Request, Response } from 'express';
import { UserResponse } from 'user/dtos';

@Controller('coinbase')
export class CoinbaseController {
    constructor(
        private readonly coinbaseAuthService: CoinbaseAuthService,
        private readonly coinbaseService: CoinbaseService,
    ) { }

    @Get('auth')
    @UseGuards(JwtAuthGuard)
    authorize(@Res() response: Response): void {
        this.coinbaseAuthService.authorize(response);
    }

    @Get('auth/callback')
    @UseGuards(JwtAuthGuard)
    handleCallback(@Req() request: Request, @Res() response: Response): void {
        this.coinbaseAuthService.handleCallback(request, response);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getCoinbaseData(@CurrentUser() user: UserResponse): Promise<any> {
        return this.coinbaseService.getPrimaryAccountTransactions(user._id);
    }
}
