import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { PostEntity } from '../entities/post.entity';

@Injectable()
export class PostRepository extends Repository<PostEntity> {
  constructor(private dataSource: DataSource) {
    super(PostEntity, dataSource.createEntityManager());
  }
}
