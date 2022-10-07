import {
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  Entity,
  BeforeUpdate,
  BeforeInsert,
  BaseEntity,
} from 'typeorm';

import { UserEntity } from 'modules/user/entities/user.entity';

@Entity('post')
export class PostEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public title: string;

  @Column()
  public text: string;

  @Column({ nullable: true })
  public slug?: string;

  @ManyToOne(() => UserEntity, (author) => author.posts)
  public author: UserEntity;

  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn()
  public updated: Date;

  @BeforeInsert()
  @BeforeUpdate()
  private validate(): void {
    this.slug = 'dsdsdsd';
    console.log('before insert', this.title);
  }
}
