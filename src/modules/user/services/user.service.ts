import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { ValidateUserDto, CreateUserDto } from '../dto';
import { UserEntity } from '../entities';
import { UserRepository } from '../repositories';
import { TTokens, TJWTPayload } from 'modules/auth/types';

@Injectable()
export class UserService {
  public logger = new Logger('UserService');

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const passwordSalt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(
      createUserDto.password,
      passwordSalt,
    );
    const user: UserEntity = this.userRepository.create({
      ...createUserDto,
      passwordHash,
      passwordSalt,
    });
    const createdUser = await this.userRepository.save(user);
    return createdUser;
  }

  async removeRefreshToken(userId: number, refreshToken: string | null = null) {
    return this.userRepository.update(userId, {
      refreshTokenHash: refreshToken,
    });
  }

  async validateUser(
    validateUserDto: ValidateUserDto,
  ): Promise<UserEntity> | null {
    const user = await this.userRepository.findOneBy({
      username: validateUserDto.username,
    });

    if (!user) return null;

    this.logger.log(`User logged in with username ` + user.username);
    try {
      const isPasswordMatch: boolean = await this.compareHash(
        validateUserDto.password,
        user.passwordSalt,
        user.passwordHash,
      );
      this.logger.debug('isPasswordMatch ' + isPasswordMatch);
      if (isPasswordMatch) {
        user.passwordHash = undefined;
        user.passwordSalt = undefined;
        user.refreshTokenHash = undefined;
        return user;
      } else {
        return null;
      }
    } catch (err) {
      this.logger.error(err, err.stack);
    }
  }

  getUserById(userId: number): Promise<UserEntity> {
    return this.userRepository.findOneBy({ id: userId });
  }

  async getUserByRefreshToken(refreshToken: string): Promise<UserEntity> {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const user = await this.userRepository.findOneBy({
      refreshTokenHash: hashedToken,
    });

    if (!user) return null;
    return user;
  }

  async refreshTokens(userId: number, rt: string): Promise<TTokens> {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user || !user.refreshTokenHash)
      throw new ForbiddenException('Access denied');

    const rtMatch: boolean = await bcrypt.compare(rt, user.refreshTokenHash);
    if (!rtMatch) throw new ForbiddenException('Access denied');

    const tokens = await this.genTokens(userId, user.username);
    this.updateRefreshTokenHash(userId, tokens.refresh_token);

    return tokens;
  }

  async updateRefreshTokenHash(
    userId: number,
    refresh_token: string,
  ): Promise<void> {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    if (!user) throw new ForbiddenException('Access denied');

    // change hardcode rounds
    const refreshTokenHash = await bcrypt.hash(refresh_token, 10);
    await this.userRepository.update(userId, { refreshTokenHash });
  }

  async generateAccessTokne(userId: number, username: string): Promise<string> {
    const jwtPayload: TJWTPayload = {
      sub: userId,
      username,
    };
    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret: this.config.get<string>('AT_SECRET'),
      expiresIn: '15m',
    });

    return accessToken;
  }

  async compareHash(
    rawString: string,
    salt: string,
    hashedString: string,
  ): Promise<boolean> {
    this.logger.debug(rawString, salt, hashedString);
    const hash = await bcrypt.hash(rawString, salt);
    return hash === hashedString;
  }

  async genTokens(userId: number, username: string): Promise<TTokens> {
    const jwtPayload: TJWTPayload = {
      sub: userId,
      username,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
