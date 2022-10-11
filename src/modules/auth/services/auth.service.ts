import * as bcrypt from 'bcrypt';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';

import { ValidateUserDto } from '../dto';
import { CreateUserDto } from 'modules/user/dto/create-user.dto';
import { UserService } from 'modules/user/services/user.service';
import { TTokens } from '../types/tokens.type';

@Injectable()
export class AuthService {
  public logger = new Logger('AuthService');

  constructor(private readonly userService: UserService) {}

  async validateUser(user: ValidateUserDto) {
    return this.userService.validateUser(user);
  }

  async login(userDto: ValidateUserDto): Promise<TTokens> {
    const user = await this.userService.validateUser(userDto);
    if (!user) throw new ForbiddenException('No user found');

    const tokens = await this.userService.genTokens(user.id, user.username);
    await this.userService.updateRefreshTokenHash(
      user.id,
      tokens.refresh_token,
    );
    return tokens;
  }

  async refresh(userId: number, refreshToken: string) {
    /**
     * Use old refresh token (but active) to generate
     * new access token
     * need to check if token valid, if user exist
     * if token not expired
     */
    const user = await this.userService.getUserById(userId);
    const rtMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!rtMatch) throw new ForbiddenException('Invalid refresh token');

    // Generate acces token
    const accessToken = await this.userService.generateAccessTokne(
      user.id,
      user.username,
    );
    return { access_token: accessToken };
  }

  async register(createUserDto: CreateUserDto): Promise<TTokens> {
    const user = await this.userService.createUser(createUserDto);
    const tokens = await this.userService.genTokens(
      user.id,
      createUserDto.username,
    );
    await this.userService.updateRefreshTokenHash(
      user.id,
      tokens.refresh_token,
    );
    return tokens;
  }

  async logout(userId: number) {
    return this.userService.removeRefreshToken(userId);
  }
}
