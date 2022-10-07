import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { ROLE } from 'common/const/roles';
import { PostEntity } from 'modules/blog/entities';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public username: string;

  @Column({
    default: ROLE.MEMBER,
  })
  public role: string;

  @OneToMany(() => PostEntity, (post) => post.author)
  public posts: PostEntity[];

  @Column()
  public passwordHash: string;

  @Column({ select: false })
  public passwordSalt: string;

  @Column({ nullable: true })
  public refreshTokenHash?: string;

  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn()
  public updated: Date;
}
