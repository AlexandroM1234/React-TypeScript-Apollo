import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";

// Schema for Post
@ObjectType()
@Entity()
export class User extends BaseEntity {
  // Has an id
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;
  // username which is inputed by the user
  @Field()
  @Column({ unique: true })
  username!: string;
  // Email
  @Field()
  @Column({ unique: true })
  email!: string;

  // password which is inputed by user but cannot be retrieved
  @Column()
  password!: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];

  // created at which is made automatically
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
  // updated at which is created automatically
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
