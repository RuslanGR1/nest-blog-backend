import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { UserService } from 'modules/user/services/user.service';
import { AuthController } from './controllers/auth.controller';
import { UserRepository } from 'modules/user/repositories/user.repository';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthService } from './services/auth.service';
import { AtStrategy, RtStrategy } from './strategies';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    UserService,
    UserRepository,
    LocalStrategy,
    AuthService,
    AtStrategy,
    RtStrategy,
  ],
})
export class AuthModule {}
