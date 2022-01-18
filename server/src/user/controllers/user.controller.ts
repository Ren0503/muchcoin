import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserRequest, UserResponse } from 'user/dtos';
import { UserService } from 'user/services';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    async createUser(
        @Body() createUserRequest: CreateUserRequest,
    ): Promise<UserResponse> {
        return this.userService.createUser(createUserRequest);
    }

    @Get()
    async getUser(user: UserResponse): Promise<UserResponse> {
        return user;
    }
}
