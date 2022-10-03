import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { PostEntiry } from '../entities/post.entity';

@Injectable()
export class PostRepository extends Repository<PostEntiry> {
  constructor(private dataSource: DataSource) {
    super(PostEntiry, dataSource.createEntityManager());
  }
}
