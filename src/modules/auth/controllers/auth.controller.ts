import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { GetCurrentUser, GetCurrentUserId } from 'common/decorators';

import { LocalAuthGuard } from '../guards/local-auth.guard';
import { CreateUserDto } from 'modules/user/dto/create-user.dto';
import { UserService } from 'modules/user/services/user.service';
import { AuthService } from '../services/auth.service';
import { AtGuard, RtGuard } from '../guards';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() createUserDto: CreateUserDto) {
    /**
     * Create new user usin username and password
     *
     * Suppose to create user with hashed password, save  into database
     * then generate jwt access and refresh tokens
     * write rt to user and then return key pair
     */
    return this.authService.register(createUserDto);
  }

  @Post('refresh')
  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  refresh(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    /**
     * When user try to use refresh token, here we check if provided data correct
     * compare rt with one user store in his instande (field: refreshTokenHash)
     * if rt is correct as well generate new access token
     */
    return this.authService.refresh(userId, refreshToken);
  }

  @Post('profile')
  @UseGuards(AtGuard)
  async profile(@GetCurrentUserId() sub: number) {
    /**
     * Protected route whick return user information
     * used access token protection
     */
    const { username, id: userId } = await this.userService.getUserById(sub);
    return {
      username,
      userId,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  logout(@GetCurrentUserId() userId: number) {
    /**
     * Removes refreshTokenHash from user
     */
    return this.authService.logout(userId);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() createUserDto: CreateUserDto) {
    /**
     * User provides credentials
     * if username and password is correct - return jwt key pair
     */
    return this.authService.login(createUserDto);
  }
}
