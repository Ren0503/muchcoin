import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserResponse } from 'user/dtos';
import { UserService } from 'user/services';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UserService) {
        super({ usernameField: 'email' });
    }

    async validate(email: string, password: string): Promise<UserResponse> {
        return this.userService.validateUser(email, password);
    }
}