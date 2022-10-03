import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PostService } from './services/post.service';
import { PostController } from './controllers/post.controller';
import { PostRepository } from './repositories/post.repository';
import { UserService } from 'modules/user/services/user.service';
import { UserRepository } from 'modules/user/repositories/user.repository';

@Module({
  imports: [JwtModule],
  controllers: [PostController],
  providers: [PostService, PostRepository, UserService, UserRepository],
})
export class BlogModule {}
