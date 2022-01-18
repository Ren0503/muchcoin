import { 
    BadRequestException, 
    Injectable, 
    NotFoundException, 
    UnauthorizedException 
} from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { CreateUserRequest, UserResponse } from 'user/dtos';
import { CoinbaseAuth, User } from 'user/models';
import { UserRepository } from 'user/repositories';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    private async validateCreateUserRequest(
        createUserRequest: CreateUserRequest,
    ): Promise<void> {
        const user = await this.userRepository.findOneByEmail(
            createUserRequest.email,
        );
        if (user) {
            throw new BadRequestException('This email already exists.');
        }
    }

    private buildResponse(user: User): UserResponse {
        return {
            _id: user._id.toHexString(),
            email: user.email,
            isCoinbaseAuthorized: !!user.coinbaseAuth,
        };
    }

    async createUser(
        createUserRequest: CreateUserRequest
    ): Promise<UserResponse> {
        await this.validateCreateUserRequest(createUserRequest)

        const user = await this.userRepository.insertOne({
            ...createUserRequest,
            password: await hash(createUserRequest.password, 10),
        });

        return this.buildResponse(user);
    }

    async updateUser(userId: string, data: Partial<User>): Promise<UserResponse> {
        const user = await this.userRepository.updateOne(userId, data);
        if (!user) {
            throw new NotFoundException(`User not found by _id: '${userId}'.`);
        }
        return this.buildResponse(user);
    }

    async validateUser(email: string, password: string): Promise<UserResponse> {
        const user = await this.userRepository.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException(`User does not exist by email: '${email}'.`);
        }
        const passwordIsValid = await compare(password, user.password);
        if (!passwordIsValid) {
            throw new UnauthorizedException('Credentials are invalid');
        }
        return this.buildResponse(user);
    }

    async getUserById(userId: string): Promise<UserResponse> {
        const user = await this.userRepository.findOneById(userId);
        if (!user) {
            throw new NotFoundException(`User not found by _id: '${userId}'.`);
        }
        return this.buildResponse(user);
    }

    async getCoinbaseAuth(userId: string): Promise<CoinbaseAuth> {
        const user = await this.userRepository.findOneById(userId);
        if (!user) {
            throw new NotFoundException(`User not found by _id: '${userId}'.`);
        }
        if (!user.coinbaseAuth) {
            throw new UnauthorizedException(
                `User with _id: '${userId}' has not authorized Coinbase.`,
            );
        }
        return user.coinbaseAuth;
    }
}
