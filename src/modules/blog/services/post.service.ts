import { Injectable } from '@nestjs/common';

import { UserService } from 'modules/user/services/user.service';
import { CreatePostDto, UpdatePostDto } from '../dto';
import { PostEntity } from '../entities';
import { PostRepository } from '../repositories';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userService: UserService,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number) {
    const user = await this.userService.getUserById(userId);
    const post = this.postRepository.create({
      ...createPostDto,
      author: user,
    });
    const savedPost = await this.postRepository.save(post);
    return savedPost;
  }

  findAll(): Promise<PostEntity[]> {
    return this.postRepository.find();
  }

  findOne(id: number): Promise<PostEntity> {
    return this.postRepository.findOneBy({ id });
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
