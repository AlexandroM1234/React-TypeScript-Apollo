import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

// Schema for Post
@ObjectType()
@Entity()
export class Post extends BaseEntity {
  // Has an id
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;
  // created at which is made automatically
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
  // updated at which is created automatically
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
  // title which is inputed by the user
  @Field()
  @Column()
  title!: string;
}
