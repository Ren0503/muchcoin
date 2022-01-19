import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'auth/decorators';
import { LocalAuthGuard } from 'auth/guards';
import { AuthService } from 'auth/services';
import { Response } from 'express';
import { UserResponse } from 'user/dtos';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(
        @CurrentUser() user: UserResponse,
        @Res({ passthrough: true }) response: Response
    ): Promise<void> {
        await this.authService.login(user, response);
        response.send(user);
    }
}
