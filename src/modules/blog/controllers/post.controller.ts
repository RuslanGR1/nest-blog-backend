import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';

import { PostEntity } from '../entities/post.entity';
import { PostService } from '../services/post.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { AtGuard } from 'modules/auth/guards';
import { GetCurrentUserId } from 'common/decorators';
import { Roles } from 'common/decorators';
import { RolesGuard } from 'common/guards/roles.guard';

@Controller('api/v1/posts')
@UseGuards(AtGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @GetCurrentUserId() userId: number,
  ) {
    return this.postService.create(createPostDto, userId);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    const post = await this.postService.findOne(+id);
    if (!post) throw new NotFoundException('Post not exist');
    return post;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    /**
     * Partial update of post by id
     */
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @Roles('author', 'admin')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    /**
     * Delete one post by ones id
     */
    return this.postService.remove(+id);
  }
}
